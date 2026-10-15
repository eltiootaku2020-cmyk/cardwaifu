import assert from "node:assert/strict";
import test from "node:test";
import { act, createBattle } from "./combat.js";

test("battle starts with valid resources and a waifu enemy name", () => {
  const battle = createBattle();
  assert.equal(battle.status, "active");
  assert.equal(battle.alma, 100);
  assert.equal(battle.player.hp, battle.player.maxHp);
  assert.equal(battle.enemy.name, "Sabuesa contaminada");
});

test("attack deals damage and generates anima", () => {
  const battle = createBattle();
  const next = act(battle, "attack");
  assert.equal(next.turn, 1);
  assert.ok(next.enemy.hp < battle.enemy.hp);
  assert.equal(next.player.anima, 12);
  assert.ok(next.player.hp < battle.player.hp);
});

test("skill deals damage, heals, and generates anima", () => {
  const battle = createBattle();
  battle.player.hp = 80;
  const next = act(battle, "skill");
  assert.ok(next.enemy.hp < battle.enemy.hp);
  assert.equal(next.player.anima, 18);
  assert.ok(next.log.some((line) => line.includes("+8 HP")));
  assert.ok(next.player.hp <= next.player.maxHp);
});

test("evade avoids the next counterattack", () => {
  const next = act(createBattle(), "evade");
  assert.equal(next.player.hp, 100);
  assert.equal(next.player.anima, 6);
  assert.ok(next.log.some((line) => line.includes("Evasión perfecta")));
});

test("evolution spends alma and can happen only once per battle", () => {
  const battle = createBattle();
  battle.player.anima = 60;
  battle.alma = 25;

  const evolved = act(battle, "evolve-light");
  assert.equal(evolved.evolved, true);
  assert.equal(evolved.alma, 0);
  assert.equal(evolved.player.attack, battle.player.attack + 10);
  assert.equal(evolved.player.maxHp, battle.player.maxHp + 15);

  const attackAfterEvolution = evolved.player.attack;
  const secondAttempt = act(evolved, "evolve-light");
  assert.equal(secondAttempt.player.attack, attackAfterEvolution);
  assert.ok(secondAttempt.log.some((line) => line.includes("Ya evolucionaste")));
});

test("a finished battle cannot be played again", () => {
  const battle = createBattle();
  battle.status = "won";
  assert.equal(act(battle, "attack"), battle);
});

test("Lily evolves to Hero and a Hero can reach Epic in a later battle", () => {
  const lily = createBattle("Vínculo · Lily", 100, "Lily");
  lily.player.anima = 60;
  const hero = act(lily, "evolve-light");
  assert.equal(hero.stage, "Hero");
  assert.equal(hero.alma, 75);
  assert.equal(hero.player.anima, 0);

  const nextBattle = createBattle("Vínculo · Hero", hero.alma, hero.stage, 60);
  const epic = act(nextBattle, "evolve-light");
  assert.equal(epic.stage, "Epic");
  assert.equal(epic.alma, 50);
});

test("Epic cannot evolve beyond the final form", () => {
  const epic = createBattle("Vínculo · Epic", 100, "Epic", 80);
  const next = act(epic, "evolve-light");
  assert.equal(next.stage, "Epic");
  assert.ok(next.log.some((line) => line.includes("ya alcanzó la forma Epic")));
});


test("encounter archetype controls enemy and linked heroine base stats", () => {
  const battle = createBattle("Tiny, la exploradora", 100, "Lily", 0, "Goblin cazadora", 96, 14, 22, 120);
  assert.equal(battle.player.name, "Tiny, la exploradora");
  assert.equal(battle.player.attack, 22);
  assert.equal(battle.player.maxHp, 120);
  assert.equal(battle.enemy.name, "Goblin cazadora");
  assert.equal(battle.enemy.maxHp, 96);
  assert.equal(battle.enemy.attack, 14);
  assert.ok(battle.log[0]?.includes("Goblin cazadora"));
});


test("Light and Dark are persistent branches with distinct combat bonuses", () => {
  const lily = createBattle("Portadora", 100, "Lily", 60, "Enemiga", 100, 10, 24, 100, true);
  const darkHero = act(lily, "evolve-dark");
  assert.equal(darkHero.stage, "Hero");
  assert.equal(darkHero.branch, "Dark");
  assert.equal(darkHero.player.attack, lily.player.attack + 13);
  assert.equal(darkHero.player.maxHp, lily.player.maxHp + 10);

  const nextBattle = createBattle("Portadora", darkHero.alma, "Hero", 60, "Enemiga", 100, 10, 24, 100, true, "Dark");
  const forcedLight = act(nextBattle, "evolve-light");
  assert.equal(forcedLight.stage, "Hero");
  assert.equal(forcedLight.branch, "Dark");
  assert.ok(forcedLight.log.some(line => line.includes("vinculada a la rama Dark")));
});

test("a heroine without Dark access cannot choose the Dark branch", () => {
  const lily = createBattle("Portadora", 100, "Lily", 60, "Enemiga", 100, 10, 24, 100, false);
  const result = act(lily, "evolve-dark");
  assert.equal(result.stage, "Lily");
  assert.equal(result.branch, null);
  assert.ok(result.log.some(line => line.includes("no puede manifestar la rama Dark")));
});
