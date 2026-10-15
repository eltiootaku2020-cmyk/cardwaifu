import assert from "node:assert/strict";
import test from "node:test";
import { FIRST_SUMMON_POOL, HEROINES, getFirstSummonPool, getHeroine } from "./catalog.js";

test("catalogue IDs are unique and every starter summon resolves", () => {
  const ids = HEROINES.map(heroine => heroine.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(getFirstSummonPool().length, FIRST_SUMMON_POOL.length);
  for (const id of FIRST_SUMMON_POOL) assert.ok(getHeroine(id));
});

test("Tiny and Elizabeth share the Arturo legend without being the same heroine", () => {
  const tiny = getHeroine("tiny");
  const elizabeth = getHeroine("elizabeth");
  assert.ok(tiny);
  assert.ok(elizabeth);
  assert.notEqual(tiny.id, elizabeth.id);
  assert.equal(tiny.rarity, "S");
  assert.equal(elizabeth.rarity, "SR");
  assert.equal(tiny.darkAvailable, false);
  assert.equal(elizabeth.darkAvailable, true);
});

test("the first summon pool excludes story-reveal Tiny", () => {
  assert.ok(!FIRST_SUMMON_POOL.includes("tiny" as never));
});
