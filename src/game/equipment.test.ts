import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_LOADOUT, EQUIPMENT, getEquipmentBonuses, isValidLoadout } from "./equipment.js";

test("starter loadout fills four distinct equipment slots", () => {
  assert.equal(new Set(Object.values(DEFAULT_LOADOUT)).size, 4);
  assert.equal(isValidLoadout(DEFAULT_LOADOUT), true);
  for (const [slot, id] of Object.entries(DEFAULT_LOADOUT)) {
    assert.equal(EQUIPMENT.find(item => item.id === id)?.slot, slot);
  }
});

test("equipment bonuses add up and invalid slot combinations are rejected", () => {
  const bonuses = getEquipmentBonuses(DEFAULT_LOADOUT);
  assert.ok(bonuses.attackBonus > 0);
  assert.ok(bonuses.hpBonus > 0);
  assert.equal(isValidLoadout({ ...DEFAULT_LOADOUT, accessory: "bronze-sword" }), false);
});
