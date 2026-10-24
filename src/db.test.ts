import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBattle, act } from "./game/combat.js";

const testDir = mkdtempSync(join(tmpdir(), "umbra-db-test-"));
process.env.DATABASE_PATH = join(testDir, "test.sqlite");
const { db, getOrCreatePlayer, saveBattleProgress, getBattle, getLatestActiveBattle, saveProtagonistGender, saveWorldProgress, getWorldProgress, resolveExplorationEvent, getPlayerRewards } = await import("./db.js");
const { travelTo } = await import("./game/world.js");

test.after(() => {
  db.close();
  rmSync(testDir, { recursive: true, force: true });
});

test("player resources and form stage persist in SQLite with battle state", () => {
  const player = getOrCreatePlayer("player-test-1", "Prueba");
  const battle = createBattle("Vínculo · Lily", player.alma, player.formStage, player.anima);
  battle.player.anima = 60;
  const evolved = act(battle, "evolve-light");

  saveBattleProgress(player.telegramId, evolved);

  const restoredPlayer = getOrCreatePlayer("player-test-1", "Prueba");
  const restoredBattle = getBattle(evolved.id);
  assert.equal(restoredPlayer.alma, 75);
  assert.equal(restoredPlayer.anima, 0);
  assert.equal(restoredPlayer.formStage, "Hero");
  assert.deepEqual(restoredBattle?.battle, evolved);
  assert.equal(restoredBattle?.ownerId, "player-test-1");
  assert.equal(getLatestActiveBattle("player-test-1")?.id, evolved.id);
});

test("protagonist gender persists in SQLite", () => {
  const player = getOrCreatePlayer("player-gender-persist", "Prueba de perfil");
  assert.equal(player.gender, "Mujer");
  saveProtagonistGender(player.telegramId, "Hombre");
  const restored = getOrCreatePlayer(player.telegramId, player.displayName);
  assert.equal(restored.gender, "Hombre");
});

test("active battle lookup excludes completed battles", () => {
  const player = getOrCreatePlayer("player-test-2", "Otra prueba");
  const battle = createBattle("Vínculo", player.alma, player.formStage, player.anima);
  battle.status = "won";
  saveBattleProgress(player.telegramId, battle);
  assert.equal(getLatestActiveBattle(player.telegramId), undefined);
});

test("battle lookup does not return a missing identifier", () => {
  assert.equal(getBattle("missing-battle-id"), undefined);
});

test("simultaneous battles accumulate anima instead of overwriting shared resources", () => {
  const player = getOrCreatePlayer("player-concurrent-anima", "Combate simultáneo");
  const first = createBattle("Vínculo A", player.alma, player.formStage, player.anima);
  const second = createBattle("Vínculo B", player.alma, player.formStage, player.anima);
  saveBattleProgress(player.telegramId, first);
  saveBattleProgress(player.telegramId, second);

  const baseA = {
    ...first,
    alma: player.alma,
    stage: player.formStage,
    player: { ...first.player, anima: player.anima }
  };
  const nextA = act(baseA, "charge");
  saveBattleProgress(player.telegramId, nextA, baseA);

  const afterA = getOrCreatePlayer(player.telegramId, player.displayName);
  const baseB = {
    ...second,
    alma: afterA.alma,
    stage: afterA.formStage,
    player: { ...second.player, anima: afterA.anima }
  };
  const nextB = act(baseB, "charge");
  saveBattleProgress(player.telegramId, nextB, baseB);

  assert.equal(getOrCreatePlayer(player.telegramId, player.displayName).anima, 50);
});

test("evolution in one battle synchronizes alma and form for another battle", () => {
  const player = getOrCreatePlayer("player-concurrent-evolution", "Evolución compartida");
  const first = createBattle("Vínculo A", player.alma, player.formStage, 60);
  const second = createBattle("Vínculo B", player.alma, player.formStage, 60);
  saveBattleProgress(player.telegramId, first);
  saveBattleProgress(player.telegramId, second);

  const baseA = {
    ...first,
    alma: player.alma,
    stage: player.formStage,
    player: { ...first.player, anima: 60 }
  };
  const evolved = act(baseA, "evolve-light");
  const savedEvolution = saveBattleProgress(player.telegramId, evolved, baseA);
  assert.equal(savedEvolution.alma, 75);
  assert.equal(savedEvolution.stage, "Hero");
  assert.equal(savedEvolution.player.anima, 0);

  const current = getOrCreatePlayer(player.telegramId, player.displayName);
  const baseB = {
    ...second,
    alma: current.alma,
    stage: current.formStage,
    player: {
      ...second.player,
      anima: current.anima,
      name: second.player.name.replace(/ · (Lily|Hero|Epic)$/, "") + " · " + current.formStage
    }
  };
  const nextB = act(baseB, "attack");
  const savedB = saveBattleProgress(player.telegramId, nextB, baseB);

  assert.equal(savedB.alma, 75);
  assert.equal(savedB.stage, "Hero");
  assert.equal(savedB.player.anima, 12);
  const synchronizedPlayer = getOrCreatePlayer(player.telegramId, player.displayName);
  assert.equal(synchronizedPlayer.alma, 75);
  assert.equal(synchronizedPlayer.anima, 12);
  assert.equal(synchronizedPlayer.formStage, "Hero");
});


test("exploration event rewards and completion persist exactly once", () => {
  const player = getOrCreatePlayer("player-exploration-once", "Exploradora");
  const start = getWorldProgress(player.telegramId);
  const atVigil = travelTo(start, "puesto-vigilia").progress;
  saveWorldProgress(player.telegramId, atVigil);

  const result = resolveExplorationEvent(player.telegramId);
  assert.equal(result.event, "discovery");
  assert.deepEqual(result.reward, { xp: 10, coins: 3, materials: 0, alma: 0 });
  assert.ok(result.progress.completedEventIds.includes("puesto-vigilia"));
  assert.equal(result.rewards.xp, 10);
  assert.equal(result.rewards.coins, 3);
  assert.throws(() => resolveExplorationEvent(player.telegramId), /ya fue resuelto/);
  assert.equal(getPlayerRewards(player.telegramId).xp, 10);
  assert.equal(getPlayerRewards(player.telegramId).coins, 3);
});

test("rest events restore Alma with its cap and save completion", () => {
  const player = getOrCreatePlayer("player-exploration-rest", "Descanso");
  const progress = travelTo(getWorldProgress(player.telegramId), "sendero-musgo").progress;
  const atSpring = travelTo(progress, "manantial-luna").progress;
  saveWorldProgress(player.telegramId, atSpring);
  const result = resolveExplorationEvent(player.telegramId);
  assert.equal(result.alma, 100);
  assert.ok(result.progress.completedEventIds.includes("manantial-luna"));
});

test("stale simultaneous battle actions cannot overwrite a newer turn", () => {
  const player = getOrCreatePlayer("player-stale-action", "Turno simultáneo");
  const battle = createBattle("Vínculo", player.alma, player.formStage, player.anima);
  saveBattleProgress(player.telegramId, battle);

  const base = {
    ...battle,
    alma: player.alma,
    stage: player.formStage,
    branch: player.formBranch,
    player: { ...battle.player, anima: player.anima }
  };
  const firstAction = act(base, "attack");
  saveBattleProgress(player.telegramId, firstAction, base);

  const staleAction = act(base, "defend");
  assert.throws(
    () => saveBattleProgress(player.telegramId, staleAction, base),
    /cambió con otra acción/
  );
  assert.equal(getBattle(battle.id)?.battle.turn, 1);
});
