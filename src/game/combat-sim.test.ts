import assert from "node:assert/strict";
import test from "node:test";
import { simulateCombat } from "./combat-sim.js";

test("combat simulation is reproducible for a fixed seed and configuration", () => {
  const options = { seed: 20261029, iterations: 120, maxTurns: 30, enemyHp: 150, enemyAttack: 16 };
  assert.deepEqual(simulateCombat(options), simulateCombat(options));
});

test("simulation accounts for every encounter and reports bounded rates", () => {
  const result = simulateCombat({ seed: 42, iterations: 75, enemyHp: 100 });
  assert.equal(result.iterations, 75);
  assert.equal(result.wins + result.losses + result.timeouts, result.iterations);
  assert.ok(result.winRate >= 0 && result.winRate <= 1);
  assert.ok(Number.isFinite(result.averageTurns));
  assert.ok(Number.isFinite(result.averageDamageTaken));
  assert.ok(Number.isFinite(result.averageRemainingHp));
  assert.ok(Object.values(result.actionCounts).every(count => Number.isInteger(count) && count >= 0));
});

test("attack-only strategy never silently uses another action", () => {
  const result = simulateCombat({ seed: 9, iterations: 8, strategy: "attack-only" });
  assert.ok(result.actionCounts.attack > 0);
  assert.equal(result.actionCounts.skill, 0);
  assert.equal(result.actionCounts.defend, 0);
  assert.equal(result.actionCounts.evade, 0);
  assert.equal(result.actionCounts.charge, 0);
  assert.equal(result.actionCounts["evolve-light"], 0);
  assert.equal(result.actionCounts["evolve-dark"], 0);
});

test("iteration and turn bounds prevent an accidental unbounded simulation", () => {
  const result = simulateCombat({ seed: -3, iterations: 100000000, maxTurns: 100000 });
  assert.equal(result.iterations, 10000);
  assert.equal(result.seed, 0xffff_fffd);
});
