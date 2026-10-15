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
  assert.ok(next.player.hp > 80);
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

  const evolved = act(battle, "evolve");
  assert.equal(evolved.evolved, true);
  assert.equal(evolved.alma, 0);
  assert.equal(evolved.player.attack, battle.player.attack + 10);
  assert.equal(evolved.player.maxHp, battle.player.maxHp + 15);

  const attackAfterEvolution = evolved.player.attack;
  const secondAttempt = act(evolved, "evolve");
  assert.equal(secondAttempt.player.attack, attackAfterEvolution);
  assert.ok(secondAttempt.log.some((line) => line.includes("Ya evolucionaste")));
});

test("a finished battle cannot be played again", () => {
  const battle = createBattle();
  battle.status = "won";
  assert.equal(act(battle, "attack"), battle);
});
