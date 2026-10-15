import "./style.css";
import { openCardStudio } from "./card-studio.js";

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData: string; ready(): void; expand(): void } };
  }
}
type Stage = "Lily" | "Hero" | "Epic";
type Battle = {
  id: string; turn: number; alma: number; stage: Stage;
  player: { name: string; hp: number; maxHp: number; anima: number };
  enemy: { name: string; hp: number; maxHp: number };
  status: string; evolved?: boolean; log: string[];
};
type PlayerRewards = { xp: number; coins: number; materials: number; level: number; xpIntoLevel: number; xpForNextLevel: number };
type WorldNode = {
  id: string; name: string; kind: string; danger: number; levelRange: string;
  description: string; event: string; connections: string[];
};
type HeroineCard = { id: string; name: string; rarity: string; stage: Stage; heroClass: string; description: string; };
type WorldView = {
  progress: { currentNodeId: string; visitedNodeIds: string[]; completedEventIds: string[] };
  current: WorldNode; destinations: WorldNode[];
};
const root = document.querySelector<HTMLDivElement>("#app")!;
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
let battle: Battle | null = null;
let world: WorldView | null = null;
let linkedHeroine: HeroineCard | null = null;
let summonNote = "Tu primera carta elegirá una heroína consciente.";
let resources = { alma: 100, anima: 0 };
let rewards: PlayerRewards = { xp: 0, coins: 0, materials: 0, level: 1, xpIntoLevel: 0, xpForNextLevel: 100 };
let gender = "Mujer";
let note = "Elige tu vínculo y entra en el primer encuentro.";
let worldNote = "Cargando rutas de la expedición…";
const heroes = [
  { name: "Tiny, la exploradora", rarity: "S", stage: "Lily", icon: "⌁", role: "Exploradora · Arturo", desc: "Una goblin que protege a su pueblo y conoce cada sendero.", color: "teal" },
  { name: "Elizabeth", rarity: "SR", stage: "Hero", icon: "♛", role: "Portadora de Arturo", desc: "Una noble que carga con el peso de mantener unida su ciudad.", color: "blue" },
  { name: "Guardiana de Bretaña", rarity: "SR", stage: "Hero", icon: "✧", role: "Protectora", desc: "Canaliza la epopeya mediante defensa y contraataques.", color: "gold" },
  { name: "Cazadora del Musgo", rarity: "R", stage: "Lily", icon: "➶", role: "Arquera", desc: "Rastrea amenazas y encuentra rutas ocultas.", color: "red" }
];
const headers = () => ({ "Content-Type": "application/json", "x-telegram-init-data": tg?.initData ?? "" });
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}
function nodeIcon(kind: string): string {
  return ({ village: "⌂", path: "⌁", landmark: "♜", camp: "✧", ruin: "▧", dungeon: "◈" } as Record<string, string>)[kind] ?? "◇";
}
function eventLabel(event: string): string {
  return ({ safe: "Zona segura", encounter: "Posible encuentro", discovery: "Descubrimiento", rest: "Descanso", boss: "Amenaza mayor" } as Record<string, string>)[event] ?? "Exploración";
}
function renderWorld(): string {
  if (!world) return `<section class="panel expedition"><p class="eyebrow">MAPA DE EXPEDICIÓN</p><h2>El Bosque Oscuro</h2><p class="muted">${escapeHtml(worldNote)}</p></section>`;
  const current = world.current;
  const visited = new Set(world.progress.visitedNodeIds);
  return `<section class="panel expedition">
    <div class="section-title expedition-title"><div><p class="eyebrow">MAPA DE EXPEDICIÓN · REGIÓN 01</p><h2>El Bosque Oscuro</h2></div><span>${world.progress.visitedNodeIds.length} lugares descubiertos</span></div>
    <div class="current-location"><span class="node-icon">${nodeIcon(current.kind)}</span><div><small>UBICACIÓN ACTUAL · ${escapeHtml(current.levelRange)}</small><h3>${escapeHtml(current.name)}</h3><p>${escapeHtml(current.description)}</p><span class="event-tag">${eventLabel(current.event)}</span></div></div>
    <p class="route-heading">Rutas conectadas</p>
    <div class="route-grid">${world.destinations.map(node => `<article class="route-card ${visited.has(node.id) ? "visited" : ""}">
      <div class="route-card-top"><span class="node-icon">${nodeIcon(node.kind)}</span><span class="danger danger-${node.danger}">${node.danger === 0 ? "Seguro" : "Peligro " + "◆".repeat(node.danger)}</span></div>
      <h3>${escapeHtml(node.name)}</h3><small>${escapeHtml(node.levelRange)}</small><p>${escapeHtml(node.description)}</p><button class="route-button" data-travel="${escapeHtml(node.id)}">${visited.has(node.id) ? "Volver a visitar" : "Explorar ruta"} →</button>
    </article>`).join("")}</div>
    <p class="muted expedition-note">${escapeHtml(worldNote)} El viaje se guarda en el servidor para que puedas retomarlo después.</p>
  </section>`;
}
function render() {
  root.innerHTML = `<header class="top"><div class="brand"><span class="logo">✦</span><div><b>UMBRA</b><small>CARD FRONTIER</small></div></div><span class="resource">◈ Alma <b>${battle?.alma ?? resources.alma}</b> · Ánima <b>${battle?.player.anima ?? resources.anima}</b> · Nv. <b>${rewards.level}</b> · XP <b>${rewards.xp}</b></span></header>
  <main>
    <section class="welcome panel"><p class="eyebrow">CRÓNICAS · CAPÍTULO 01</p><h1>Las leyendas<br>despiertan.</h1><p class="muted">Explora ruinas, crea vínculos y rescata epopeyas de eras olvidadas.</p>
      <div class="gender"><button data-gender="Mujer" class="${gender === "Mujer" ? "selected" : ""}">Protagonista mujer</button><button data-gender="Hombre" class="${gender === "Hombre" ? "selected" : ""}">Protagonista hombre</button></div>
      <div class="backview"><div class="halo"></div><div class="figure"><div class="head"></div><div class="body"></div><div class="cape"></div></div><span>VISTA DESDE ATRÁS · ROSTRO OCULTO</span></div>
      <button class="primary full" id="summon" ${linkedHeroine ? "disabled" : ""}>${linkedHeroine ? "✦ Primera invocación completada" : "✦ Realizar primera invocación"}</button>
      <p class="muted summon-note">${escapeHtml(linkedHeroine ? "Vínculo establecido: " + linkedHeroine.name + " · " + linkedHeroine.rarity : summonNote)}</p>
      ${linkedHeroine ? `<div class="linked-heroine"><span class="rarity-pill">${escapeHtml(linkedHeroine.rarity)}</span><div><b>${escapeHtml(linkedHeroine.name)}</b><small>${escapeHtml(linkedHeroine.heroClass)} · Forma inicial ${escapeHtml(linkedHeroine.stage)}</small><p>${escapeHtml(linkedHeroine.description)}</p></div></div>` : ""}
      <button class="primary full" id="start" ${linkedHeroine && world && (world.current.event === "encounter" || world.current.event === "boss") ? "" : "disabled"}>⚔ ${world && world.current.event === "boss" ? "Enfrentar amenaza mayor" : "Combatir en esta zona"}</button>
    </section>
    ${renderWorld()}
    <div class="section-title"><div><p class="eyebrow">ARCHIVO DE LEYENDAS</p><h2>Heroínas conocidas</h2></div><span>R · S · SR</span></div>
    <section class="hero-grid">${heroes.map(h => `<article class="hero-card ${h.color}"><div class="art"><span class="rarity">${h.rarity}</span><span class="symbol">${h.icon}</span><span class="stage">${h.stage}</span></div><h3>${h.name}</h3><p class="muted">${h.role}</p><p>${h.desc}</p></article>`).join("")}</section>
    <section class="panel battle"><p class="eyebrow">ENCUENTRO</p><h2>El camino aguarda</h2><p id="status" class="muted">${escapeHtml(note)}</p><div id="battle-view"></div></section>
    <footer>UMBRA · prototipo jugable en desarrollo · el guardado de expedición y combate depende del servidor.</footer>
  </main>`;
  const studioButton = document.createElement("button");
  studioButton.type = "button";
  studioButton.className = "primary studio-launch";
  studioButton.textContent = "✦ Abrir taller de cartas";
  studioButton.onclick = () => openCardStudio();
  root.querySelector("main")?.insertBefore(studioButton, root.querySelector(".expedition"));
  root.querySelectorAll<HTMLButtonElement>("[data-gender]").forEach(button => button.onclick = () => { gender = button.dataset.gender ?? "Mujer"; render(); });
  root.querySelector<HTMLButtonElement>("#summon")!.onclick = () => void summonFirst();
  root.querySelector<HTMLButtonElement>("#start")!.onclick = () => void startBattle();
  root.querySelectorAll<HTMLButtonElement>("[data-travel]").forEach(button => button.onclick = () => void travel(button.dataset.travel ?? ""));
  drawBattle();
}
function drawBattle() {
  const el = root.querySelector<HTMLDivElement>("#battle-view");
  const current = battle;
  if (!el) return;
  if (!current) { el.innerHTML = ""; return; }
  const bar = (value: number, max: number) => Math.max(0, value / max * 100);
  const actions = ["attack", "skill", "defend", "evade", "charge", "evolve"] as const;
  const labels: Record<typeof actions[number], string> = { attack: "⚔ Atacar", skill: "✧ Habilidad", defend: "🛡 Defender", evade: "💨 Evadir", charge: "⚡ Cargar", evolve: "✦ Evolucionar" };
  el.innerHTML = `<div class="fight-grid"><div><b>✦ ${escapeHtml(current.player.name)}</b><div class="hp"><i style="width:${bar(current.player.hp, current.player.maxHp)}%"></i></div><small>${current.player.hp}/${current.player.maxHp} HP · ${current.player.anima} Ánima · Forma ${current.stage}</small></div><div><b>☠ ${escapeHtml(current.enemy.name)}</b><div class="hp enemy"><i style="width:${bar(current.enemy.hp, current.enemy.maxHp)}%"></i></div><small>${current.enemy.hp}/${current.enemy.maxHp} HP</small></div></div><div class="actions">${actions.map(action => `<button data-action="${action}" ${current.status !== "active" || (action === "evolve" && (current.stage === "Epic" || current.evolved)) ? "disabled" : ""}>${labels[action]}</button>`).join("")}</div><div class="log">${current.log.slice(-4).map(line => "<p>" + escapeHtml(line) + "</p>").join("")}</div>`;
  el.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(button => button.onclick = () => void act(button.dataset.action ?? ""));
}
async function startBattle() {
  note = "Preparando encuentro…";
  render();
  try {
    const response = await fetch("/api/battle/start", { method: "POST", headers: headers(), body: JSON.stringify({ heroineName: linkedHeroine ? linkedHeroine.name + " · " + linkedHeroine.stage : "Vínculo de " + gender }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo iniciar el combate.");
    battle = data.battle as Battle;
    resources = { alma: battle!.alma, anima: battle!.player.anima };
    note = "Combate validado por el servidor.";
  } catch (error) {
    note = error instanceof Error ? error.message : "No se pudo conectar con el servidor.";
  }
  render();
}
async function act(action: string) {
  if (!battle) return;
  try {
    const response = await fetch("/api/battle/action", { method: "POST", headers: headers(), body: JSON.stringify({ battleId: battle.id, action }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo resolver la acción.");
    battle = data.battle as Battle;
    resources = { alma: battle!.alma, anima: battle!.player.anima };
    if (data.rewards) rewards = data.rewards as PlayerRewards;
    note = data.rewardGranted ? "¡Victoria! Recompensas: +" + (data.rewards?.xp ?? 0) + " XP, +" + (data.rewards?.coins ?? 0) + " monedas y +" + (data.rewards?.materials ?? 0) + " materiales." : "Acción validada por el servidor.";
  } catch (error) {
    note = error instanceof Error ? error.message : "Error de combate";
  }
  render();
}
async function summonFirst() {
  summonNote = "La carta está buscando a su portadora…";
  render();
  try {
    const response = await fetch("/api/summon/first", { method: "POST", headers: headers(), body: JSON.stringify({}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo realizar la invocación.");
    linkedHeroine = data.heroine as HeroineCard;
    summonNote = data.created ? "La carta te ha elegido. El vínculo queda guardado." : "Tu vínculo anterior ha sido restaurado; no se ha gastado otra invocación.";
  } catch (error) {
    summonNote = error instanceof Error ? error.message : "No se pudo completar la invocación.";
  }
  render();
}
async function loadCollection() {
  try {
    const response = await fetch("/api/collection", { headers: headers() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo cargar la colección.");
    const first = (data.collection as Array<{ heroine: HeroineCard | null }>).find(entry => entry.heroine)?.heroine;
    if (first) linkedHeroine = first;
    if (linkedHeroine) summonNote = "Vínculo restaurado desde tu colección.";
  } catch (error) {
    summonNote = error instanceof Error ? error.message : "La colección necesita conexión con el servidor.";
  }
  render();
}
async function loadWorld() {
  try {
    const response = await fetch("/api/world", { headers: headers() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo cargar el mapa.");
    world = data as WorldView;
    worldNote = "Elige la próxima ruta.";
  } catch (error) {
    worldNote = error instanceof Error ? error.message : "No se pudo cargar el mapa.";
  }
  render();
}
async function travel(destinationId: string) {
  worldNote = "Recorriendo la ruta…";
  render();
  try {
    const response = await fetch("/api/world/travel", { method: "POST", headers: headers(), body: JSON.stringify({ destinationId }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo recorrer esa ruta.");
    world = { progress: data.progress, current: data.destination, destinations: data.destinations };
    worldNote = data.firstVisit ? "Lugar descubierto. " + eventLabel(data.event) + ": " + data.destination.description : "Has regresado a un lugar conocido.";
    if (data.event === "encounter" || data.event === "boss") note = "La expedición ha detectado peligro. Inicia un encuentro cuando estés listo.";
  } catch (error) {
    worldNote = error instanceof Error ? error.message : "No se pudo recorrer esa ruta.";
  }
  render();
}
async function restoreActiveBattle() {
  try {
    const response = await fetch("/api/battle/active", { headers: headers() });
    const data = await response.json();
    if (response.ok && data.battle) {
      battle = data.battle as Battle;
      resources = { alma: battle!.alma, anima: battle!.player.anima };
      note = "Combate activo recuperado desde SQLite.";
      render();
    }
  } catch { /* El servidor puede no estar disponible durante la carga inicial. */ }
}
render();
void loadWorld();
void restoreActiveBattle();
void fetch("/api/me", { headers: headers() }).then(async response => {
  const data = await response.json();
  if (response.ok && data.player) { resources = { alma: data.player.alma, anima: data.player.anima }; if (data.rewards) rewards = data.rewards as PlayerRewards; render(); }
}).catch(() => {});
