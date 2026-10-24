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

import { getChapterOneState, markBattleEventComplete, resolveWorldEvent } from "./world.js";

test("discovery and rest events resolve once and grant provisional rewards", () => {
  let state = createWorldProgress();
  state = travelTo(state, "puesto-vigilia").progress;
  const discovery = resolveWorldEvent(state);
  assert.equal(discovery.event, "discovery");
  assert.deepEqual(discovery.reward, { xp: 10, coins: 3, materials: 0, alma: 0 });
  assert.ok(discovery.progress.completedEventIds.includes("puesto-vigilia"));
  assert.throws(() => resolveWorldEvent(discovery.progress), /ya fue resuelto/);

  const trail = travelTo(discovery.progress, "aldea-bruma").progress;
  const toTrail = travelTo(trail, "sendero-musgo").progress;
  const toSpring = travelTo(toTrail, "manantial-luna").progress;
  const rest = resolveWorldEvent(toSpring);
  assert.deepEqual(rest.reward, { xp: 0, coins: 0, materials: 0, alma: 10 });
});

test("the chapter boss stays locked until its four prerequisite events are complete", () => {
  let state = createWorldProgress();
  const toTrail = travelTo(state, "sendero-musgo");
  assert.throws(() => travelTo(toTrail.progress, "ruinas-viejas").progress && travelTo(toTrail.progress, "ruinas-viejas"), /no está conectado/);

  state = { ...toTrail.progress, completedEventIds: ["sendero-musgo"] };
  state = travelTo(state, "ruinas-viejas").progress;
  assert.equal(getChapterOneState(state).bossUnlocked, false);
  assert.throws(() => travelTo(state, "entrada-abismo"), /Antes de entrar/);

  state = { ...state, completedEventIds: ["sendero-musgo", "puesto-vigilia", "ruinas-viejas", "nido-goblin"] };
  assert.equal(getChapterOneState(state).bossUnlocked, true);
  assert.equal(travelTo(state, "entrada-abismo").destination.id, "entrada-abismo");
});

test("winning an encounter completes its exploration objective and chapter boss completion is remembered", () => {
  let state = createWorldProgress();
  state = travelTo(state, "sendero-musgo").progress;
  state = markBattleEventComplete(state, "sendero-musgo");
  assert.ok(state.completedEventIds.includes("sendero-musgo"));
  assert.equal(markBattleEventComplete(state, "sendero-musgo"), state);

  state = {
    ...state,
    currentNodeId: "entrada-abismo",
    visitedNodeIds: [...state.visitedNodeIds, "entrada-abismo"],
    completedEventIds: ["sendero-musgo", "puesto-vigilia", "ruinas-viejas", "nido-goblin"]
  };
  state = markBattleEventComplete(state, "entrada-abismo");
  assert.equal(getChapterOneState(state).completed, true);
});
