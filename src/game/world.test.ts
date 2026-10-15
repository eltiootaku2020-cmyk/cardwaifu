import assert from "node:assert/strict";
import test from "node:test";
import { createWorldProgress, getAvailableDestinations, travelTo } from "./world.js";

test("the expedition starts at a safe village", () => {
  const state = createWorldProgress();
  assert.equal(state.currentNodeId, "aldea-bruma");
  assert.deepEqual(getAvailableDestinations(state).map(node => node.id), ["sendero-musgo", "puesto-vigilia"]);
});

test("travel only allows connected destinations and records first visits", () => {
  const state = createWorldProgress();
  const result = travelTo(state, "sendero-musgo");
  assert.equal(result.firstVisit, true);
  assert.equal(result.event, "encounter");
  assert.ok(result.progress.visitedNodeIds.includes("sendero-musgo"));
  assert.throws(() => travelTo(result.progress, "entrada-abismo"), /no está conectado/);
});

test("returning to a known location does not duplicate visit history", () => {
  const start = createWorldProgress();
  const trail = travelTo(start, "sendero-musgo").progress;
  const returned = travelTo(trail, "aldea-bruma");
  assert.equal(returned.firstVisit, false);
  assert.equal(returned.progress.visitedNodeIds.filter(id => id === "aldea-bruma").length, 1);
});
