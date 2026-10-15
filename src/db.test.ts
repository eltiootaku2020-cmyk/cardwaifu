import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBattle, act } from "./game/combat.js";

const testDir = mkdtempSync(join(tmpdir(), "umbra-db-test-"));
process.env.DATABASE_PATH = join(testDir, "test.sqlite");
const { db, getOrCreatePlayer, saveBattleProgress, getBattle, getLatestActiveBattle } = await import("./db.js");

test.after(() => {
  db.close();
  rmSync(testDir, { recursive: true, force: true });
});

test("player resources and form stage persist in SQLite with battle state", () => {
  const player = getOrCreatePlayer("player-test-1", "Prueba");
  const battle = createBattle("Vínculo · Lily", player.alma, player.formStage, player.anima);
  battle.player.anima = 60;
  const evolved = act(battle, "evolve");

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
