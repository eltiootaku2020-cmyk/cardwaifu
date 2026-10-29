import "./style.css";
import "./battle-vfx.css";
import { installBattleVfx } from "./battle-vfx.js";
import { openCardStudio } from "./card-studio.js";
import { getCharacterPortrait, getEnemyPortrait, getSceneBackground, loadArtManifest } from "./art.js";

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData: string; ready(): void; expand(): void } };
  }
}
type Stage = "Lily" | "Hero" | "Epic";
type Battle = {
  id: string; turn: number; alma: number; stage: Stage; branch: "Light" | "Dark" | null; darkAvailable: boolean;
  player: { name: string; hp: number; maxHp: number; attack: number; anima: number };
  enemy: { name: string; hp: number; maxHp: number; intent?: "quick-attack" | "heavy-attack" | "guard" };
  status: string; evolved?: boolean; log: string[];
};
type EquipmentSlot = "weapon" | "armor" | "accessory" | "support";
type EquipmentItem = { id: string; name: string; slot: EquipmentSlot; rarity: string; attackBonus: number; hpBonus: number; description: string };
type EquipmentLoadout = { weapon: string; armor: string; accessory: string; support: string };
type PlayerRewards = { xp: number; coins: number; materials: number; level: number; xpIntoLevel: number; xpForNextLevel: number };
type WorldNode = {
  id: string; name: string; kind: string; danger: number; levelRange: string;
  description: string; event: string; connections: string[];
  unlocked?: boolean; lockedReason?: string;
};
type ChapterObjective = { id: string; label: string; completed: boolean };
type ChapterOneState = { objectives: ChapterObjective[]; bossUnlocked: boolean; completed: boolean; returnedToVillage: boolean };
type HeroineCard = { id: string; name: string; rarity: string; stage: Stage; heroClass: string; description: string; attack?: number; maxHp?: number; darkAvailable?: boolean; };
type OwnedCard = { heroineId: string; copies: number; heroine: HeroineCard | null };
type WorldView = {
  progress: { currentNodeId: string; visitedNodeIds: string[]; completedEventIds: string[] };
  current: WorldNode; destinations: WorldNode[]; chapter: ChapterOneState;
};
const root = document.querySelector<HTMLDivElement>("#app")!;
installBattleVfx(root);
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
let battle: Battle | null = null;
let world: WorldView | null = null;
let linkedHeroine: HeroineCard | null = null;
let collection: OwnedCard[] = [];
const flippedCards = new Set<string>();
let lastBattleAction: string | null = null;
let summonReveal = false;
let summonNote = "Tu primera carta elegirá una heroína consciente.";
let resources = { alma: 100, anima: 0 };
let rewards: PlayerRewards = { xp: 0, coins: 0, materials: 0, level: 1, xpIntoLevel: 0, xpForNextLevel: 100 };
let equipment: EquipmentItem[] = [];
let loadout: EquipmentLoadout = { weapon: "wooden-bow", armor: "forest-cloak", accessory: "amber-charm", support: "healing-herbs" };
let loadoutNote = "Preparando el equipo inicial…";
let gender: "Mujer" | "Hombre" = "Mujer";
let profileNote = "La elección de protagonista se guarda en tu partida.";
type VisualMode = "full" | "reduced";
const visualPreferenceKey = "umbra-visual-mode-v1";
function getInitialVisualMode(): VisualMode {
  try {
    const stored = localStorage.getItem(visualPreferenceKey);
    if (stored === "full" || stored === "reduced") return stored;
  } catch { /* El juego sigue siendo usable si el almacenamiento no está disponible. */ }
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "reduced"
    : "full";
}
let visualMode: VisualMode = getInitialVisualMode();
function applyVisualMode(): void {
  document.documentElement.dataset.umbraEffects = visualMode;
}
function bindArtworkFallbacks(container: ParentNode): void {
  container.querySelectorAll<HTMLImageElement>("img[data-art-image]").forEach(image => {
    const fallback = () => {
      image.closest<HTMLElement>(".has-art")?.classList.remove("has-art");
      image.remove();
    };
    image.addEventListener("error", fallback, { once: true });
    if (image.complete && image.naturalWidth === 0) fallback();
  });
}
applyVisualMode();
let note = "Elige tu vínculo y entra en el primer encuentro.";
let worldNote = "Cargando rutas de la expedición…";
const heroes = [
  { id: "tiny", name: "Pivy, la exploradora", rarity: "S", stage: "Lily", icon: "⌁", role: "Exploradora · Arturo", desc: "Pivy, una goblin que protege a su pueblo y conoce cada sendero.", color: "teal" },
  { id: "elizabeth", name: "Elizabeth", rarity: "SR", stage: "Hero", icon: "♛", role: "Portadora de Arturo", desc: "Una noble que carga con el peso de mantener unida su ciudad.", color: "blue" },
  { id: "guardiana-bretana", name: "Guardiana de Bretaña", rarity: "SR", stage: "Hero", icon: "✧", role: "Protectora", desc: "Canaliza la epopeya mediante defensa y contraataques.", color: "gold" },
  { id: "cazadora-musgo", name: "Cazadora del Musgo", rarity: "R", stage: "Lily", icon: "➶", role: "Arquera", desc: "Rastrea amenazas y encuentra rutas ocultas.", color: "red" }
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
  const completed = new Set(world.progress.completedEventIds);
  const currentResolved = completed.has(current.id);
  const canResolve = !currentResolved && ["safe", "discovery", "rest"].includes(current.event);
  const objectiveDone = world.chapter.objectives.filter(objective => objective.completed).length;
  const currentEventLabel = currentResolved
    ? (current.event === "boss" ? "Capítulo completado" : current.event === "encounter" ? "Encuentro despejado" : "Evento resuelto")
    : eventLabel(current.event);
  return `<section class="panel expedition">
    <div class="section-title expedition-title"><div><p class="eyebrow">MAPA DE EXPEDICIÓN · REGIÓN 01</p><h2>El Bosque Oscuro</h2></div><span>${world.progress.visitedNodeIds.length} lugares descubiertos</span></div>
    <div class="current-location"><span class="node-icon">${nodeIcon(current.kind)}</span><div><small>UBICACIÓN ACTUAL · ${escapeHtml(current.levelRange)}</small><h3>${escapeHtml(current.name)}</h3><p>${escapeHtml(current.description)}</p><span class="event-tag">${escapeHtml(currentEventLabel)}</span></div></div>
    <div class="chapter-objectives">
      <div class="chapter-objectives-head"><strong>Objetivos del capítulo</strong><span>${objectiveDone}/${world.chapter.objectives.length}</span></div>
      <div class="objective-list">${world.chapter.objectives.map(objective => `<div class="objective-row ${objective.completed ? "objective-complete" : ""}"><span aria-hidden="true">${objective.completed ? "✓" : "○"}</span><span>${escapeHtml(objective.label)}</span></div>`).join("")}</div>
      <p class="muted chapter-note">${world.chapter.returnedToVillage
        ? "Regreso registrado. El capítulo 1 está cerrado y tu progreso quedó guardado."
        : world.chapter.completed
          ? current.id === "aldea-bruma"
            ? "La amenaza ha sido derrotada. Registra el regreso para cerrar el capítulo."
            : "La amenaza ha sido derrotada. Vuelve por las rutas conectadas hasta la Aldea Bruma para registrar el regreso."
          : world.chapter.bossUnlocked
            ? "La entrada al Abismo está abierta."
            : "Resuelve los eventos y despeja los encuentros para abrir el acceso a la amenaza final."}</p>
    </div>
    ${canResolve ? `<button type="button" class="primary full resolve-event" id="resolve-event">${current.event === "discovery" ? "✧ Investigar lugar" : current.event === "rest" ? "☾ Descansar y recuperar Alma" : "⌂ Registrar visita"}</button>` : ""}
    ${world.chapter.completed && current.id === "aldea-bruma" && !world.chapter.returnedToVillage
      ? `<button type="button" class="primary full chapter-return" id="close-chapter">Registrar regreso y cerrar capítulo</button>`
      : ""}
    ${currentResolved ? `<p class="muted event-complete-note">Este lugar ya está resuelto. Tu progreso se conserva aunque cierres el juego.</p>` : ""}
    <p class="route-heading">Rutas conectadas</p>
    <div class="route-grid">${world.destinations.map(node => {
      const unlocked = node.unlocked !== false;
      const resolved = completed.has(node.id);
      return `<article class="route-card ${visited.has(node.id) ? "visited" : ""} ${!unlocked ? "route-locked" : ""}">
        <div class="route-card-top"><span class="node-icon">${nodeIcon(node.kind)}</span><span class="danger danger-${node.danger}">${node.danger === 0 ? "Seguro" : "Peligro " + "◆".repeat(node.danger)}</span></div>
        <h3>${escapeHtml(node.name)}</h3><small>${escapeHtml(node.levelRange)}</small><p>${escapeHtml(node.description)}</p>
        ${resolved ? `<p class="route-resolved">✓ Evento resuelto</p>` : ""}
        ${!unlocked ? `<p class="route-lock-note">${escapeHtml(node.lockedReason ?? "Ruta bloqueada")}</p>` : ""}
        <button class="route-button" data-travel="${escapeHtml(node.id)}" ${unlocked ? "" : "disabled"}>${!unlocked ? "Bloqueado" : visited.has(node.id) ? "Volver a visitar" : "Explorar ruta"} ${unlocked ? "→" : "·"}</button>
      </article>`;
    }).join("")}</div>
    <p class="muted expedition-note">${escapeHtml(worldNote)} El viaje se guarda en el servidor para que puedas retomarlo después.</p>
  </section>`;
}function renderCollection(): string {
  return `<section class="panel collection-panel">
    <div class="section-title collection-title"><div><p class="eyebrow">ARCHIVO PERSONAL</p><h2>Mi colección</h2></div><span>${collection.length} cartas</span></div>
    ${collection.length === 0
      ? `<p class="muted collection-empty">Todavía no tienes cartas vinculadas. Realiza la primera invocación para recibir una heroína y guardarla en tu colección.</p>`
      : `<div class="owned-card-grid">${collection.map(entry => {
        const hero = entry.heroine;
        const id = hero?.id ?? entry.heroineId;
        const name = hero?.name ?? entry.heroineId;
        const rarity = hero?.rarity ?? "—";
        const stage = hero?.stage ?? "Lily";
        const portrait = getCharacterPortrait(id);
        const flipped = flippedCards.has(id);
        if (flipped) {
          return `<article class="owned-card owned-card-back" data-rarity="${escapeHtml(rarity)}">
            <div class="owned-card-top"><span class="rarity-pill">${escapeHtml(rarity)}</span><span class="copy-count">Copias ×${entry.copies}</span></div>
            <h3>${escapeHtml(name)}</h3>
            <p class="muted">REVERSE · DATOS DE COMBATE</p>
            <div class="owned-stat-grid"><div><small>ATAQUE</small><strong>${hero?.attack ?? "—"}</strong></div><div><small>VIDA MÁX.</small><strong>${hero?.maxHp ?? "—"}</strong></div></div>
            <div class="owned-detail"><span>Clase</span><strong>${escapeHtml(hero?.heroClass ?? "Pendiente")}</strong></div>
            <div class="owned-detail"><span>Forma actual del catálogo</span><strong>${escapeHtml(stage)}</strong></div>
            <div class="owned-detail"><span>Rama Dark</span><strong>${hero?.darkAvailable === undefined ? "Sin datos" : hero.darkAvailable ? "Disponible" : "No disponible"}</strong></div>
            <p class="muted owned-description">${escapeHtml(hero?.description ?? "No hay una ficha de datos para esta carta.")}</p>
            <button type="button" class="route-button card-flip-button" data-card-flip="${escapeHtml(id)}">↶ Ver frente</button>
          </article>`;
        }
        return `<article class="owned-card" data-rarity="${escapeHtml(rarity)}">
          <div class="owned-card-art ${portrait ? "has-art" : ""}">${portrait ? `<img data-art-image src="${escapeHtml(portrait)}" alt="${escapeHtml("Ilustración de " + name)}" loading="lazy" decoding="async">` : `<span aria-hidden="true">✦</span>`}
            <span class="rarity-pill">${escapeHtml(rarity)}</span><span class="copy-count">×${entry.copies}</span>
          </div>
          <div class="owned-card-body"><h3>${escapeHtml(name)}</h3><p class="owned-class">${escapeHtml(hero?.heroClass ?? "Clase pendiente")} · ${escapeHtml(stage)}</p><p class="owned-description">${escapeHtml(hero?.description ?? "No hay una ficha disponible para esta carta.")}</p>
          <button type="button" class="route-button card-flip-button" data-card-flip="${escapeHtml(id)}">Ver reverso ↻</button></div>
        </article>`;
      }).join("")}</div>`}
  </section>`;
}
function renderLoadout(): string {
  if (equipment.length === 0) return `<section class="panel loadout"><p class="eyebrow">EQUIPAMIENTO</p><h2>Preparación de expedición</h2><p class="muted">${escapeHtml(loadoutNote)}</p></section>`;
  const labels: Record<EquipmentSlot, string> = { weapon: "Arma", armor: "Equipamiento", accessory: "Accesorio", support: "Apoyo" };
  const options = (slot: EquipmentSlot) => equipment.filter(item => item.slot === slot).map(item => `<option value="${item.id}" ${loadout[slot] === item.id ? "selected" : ""}>${escapeHtml(item.name)} · ${item.rarity}</option>`).join("");
  const attack = Object.values(loadout).map(id => equipment.find(item => item.id === id)?.attackBonus ?? 0).reduce((a, b) => a + b, 0);
  const hp = Object.values(loadout).map(id => equipment.find(item => item.id === id)?.hpBonus ?? 0).reduce((a, b) => a + b, 0);
  return `<section class="panel loadout"><div class="section-title"><div><p class="eyebrow">PREPARACIÓN DE EXPEDICIÓN</p><h2>Equipo y accesorios</h2></div><span>4 espacios</span></div>
    <div class="loadout-grid">${(["weapon", "armor", "accessory", "support"] as EquipmentSlot[]).map(slot => {
      const item = equipment.find(entry => entry.id === loadout[slot]);
      return `<label class="gear-slot"><span>${labels[slot]}</span><select data-equipment-slot="${slot}">${options(slot)}</select><small>${escapeHtml(item?.description ?? "")}</small></label>`;
    }).join("")}</div>
    <div class="gear-bonuses"><span>Bonificación de ataque <b>+${attack}</b></span><span>Vida máxima <b>+${hp}</b></span></div>
    <p class="muted loadout-note">${escapeHtml(loadoutNote)} El equipo se aplica a los atributos de combate.</p>
  </section>`;
}
function render() {
  root.innerHTML = `<header class="top"><div class="brand"><span class="logo">✦</span><div><b>UMBRA</b><small>CARD FRONTIER</small></div></div><span class="resource">◈ Alma <b>${battle?.alma ?? resources.alma}</b> · Ánima <b>${battle?.player.anima ?? resources.anima}</b> · Nv. <b>${rewards.level}</b> · XP <b>${rewards.xp}</b></span><button type="button" class="visual-toggle" id="visual-toggle" aria-pressed="${visualMode === "reduced"}" title="Cambiar nivel de animaciones">${visualMode === "reduced" ? "⚡ Efectos ligeros" : "✦ Efectos completos"}</button></header>
  <main>
    <section class="welcome panel ${summonReveal ? "gacha-reveal" : ""}">${summonReveal ? `<div class="summon-ceremony" aria-live="polite"><span class="summon-sigil">✦</span><strong>LA CARTA HA ELEGIDO</strong><small>VÍNCULO ESTABLECIDO</small></div>` : ""}<p class="eyebrow">CRÓNICAS · CAPÍTULO 01</p><h1>Las leyendas<br>despiertan.</h1><p class="muted">Explora ruinas, crea vínculos y rescata epopeyas de eras olvidadas.</p>
      <div class="gender"><button data-gender="Mujer" class="${gender === "Mujer" ? "selected" : ""}" aria-pressed="${gender === "Mujer"}">Protagonista mujer</button><button data-gender="Hombre" class="${gender === "Hombre" ? "selected" : ""}" aria-pressed="${gender === "Hombre"}">Protagonista hombre</button></div>
      <p class="muted profile-note" aria-live="polite">${escapeHtml(profileNote)}</p>
      <div class="backview" data-gender="${gender.toLowerCase()}"><div class="halo"></div><div class="figure"><div class="head"></div><div class="body"></div><div class="cape"></div></div><span>VISTA DESDE ATRÁS · ROSTRO OCULTO</span></div>
      <button class="primary full" id="summon" ${linkedHeroine ? "disabled" : ""}>${linkedHeroine ? "✦ Primera invocación completada" : "✦ Realizar primera invocación"}</button>
      <p class="muted summon-note">${escapeHtml(linkedHeroine ? "Vínculo establecido: " + linkedHeroine.name + " · " + linkedHeroine.rarity : summonNote)}</p>
      ${linkedHeroine ? `<div class="linked-heroine ${summonReveal ? "reveal-card" : ""}" data-rarity="${escapeHtml(linkedHeroine.rarity)}"><span class="rarity-pill">${escapeHtml(linkedHeroine.rarity)}</span><div><b>${escapeHtml(linkedHeroine.name)}</b><small>${escapeHtml(linkedHeroine.heroClass)} · Forma inicial ${escapeHtml(linkedHeroine.stage)}</small><p>${escapeHtml(linkedHeroine.description)}</p></div></div>` : ""}
      <button class="primary full" id="start" ${linkedHeroine && world && (world.current.event === "encounter" || world.current.event === "boss") && !world.progress.completedEventIds.includes(world.current.id) && (world.current.event !== "boss" || world.chapter.bossUnlocked) ? "" : "disabled"}>⚔ ${world && world.current.event === "boss" ? "Enfrentar amenaza mayor" : "Combatir en esta zona"}</button>
    </section>
    ${renderCollection()}
    ${renderWorld()}
    <div class="section-title"><div><p class="eyebrow">CATÁLOGO DE REFERENCIA</p><h2>Heroínas conocidas</h2></div><span>R · S · SR</span></div>
    <section class="hero-grid">${heroes.map(h => {
      const portrait = getCharacterPortrait(h.id);
      return `<article class="hero-card ${h.color}"><div class="art ${portrait ? "has-art" : ""}">${portrait ? `<img class="hero-card-art" data-art-image src="${escapeHtml(portrait)}" alt="" loading="lazy" decoding="async">` : ""}<span class="rarity">${h.rarity}</span><span class="symbol">${h.icon}</span><span class="stage">${h.stage}</span></div><h3>${h.name}</h3><p class="muted">${h.role}</p><p>${h.desc}</p></article>`;
    }).join("")}</section>
    <section class="panel battle"><p class="eyebrow">ENCUENTRO</p><h2>El camino aguarda</h2><p id="status" class="muted">${escapeHtml(note)}</p><div id="battle-view"></div></section>
    <footer>UMBRA · prototipo jugable en desarrollo · el guardado de expedición y combate depende del servidor.</footer>
  </main>`;
  bindArtworkFallbacks(root);
  root.querySelector<HTMLButtonElement>("#visual-toggle")!.onclick = () => {
    visualMode = visualMode === "full" ? "reduced" : "full";
    try { localStorage.setItem(visualPreferenceKey, visualMode); } catch { /* Preferencia temporal si el navegador no permite guardar. */ }
    applyVisualMode();
    note = visualMode === "reduced" ? "Efectos visuales reducidos para priorizar la fluidez." : "Efectos visuales completos activados.";
    render();
  };
  const studioButton = document.createElement("button");
  studioButton.type = "button";
  studioButton.className = "primary studio-launch";
  studioButton.textContent = "✦ Abrir taller de cartas";
  studioButton.onclick = () => openCardStudio();
  root.querySelector("main")?.insertBefore(studioButton, root.querySelector(".expedition"));
  root.querySelectorAll<HTMLButtonElement>("[data-gender]").forEach(button => button.onclick = () => void chooseGender(button.dataset.gender ?? "Mujer"));
  root.querySelector<HTMLButtonElement>("#summon")!.onclick = () => void summonFirst();
  root.querySelectorAll<HTMLButtonElement>("[data-card-flip]").forEach(button => button.onclick = () => {
    const id = button.dataset.cardFlip;
    if (!id) return;
    if (flippedCards.has(id)) flippedCards.delete(id);
    else flippedCards.add(id);
    render();
  });
  root.querySelector<HTMLButtonElement>("#start")!.onclick = () => void startBattle();
  root.querySelectorAll<HTMLButtonElement>("[data-travel]").forEach(button => button.onclick = () => void travel(button.dataset.travel ?? ""));
  root.querySelector<HTMLButtonElement>("#resolve-event")?.addEventListener("click", () => void resolveCurrentEvent());
  root.querySelector<HTMLButtonElement>("#close-chapter")?.addEventListener("click", () => void returnFromChapter());
  root.querySelectorAll<HTMLSelectElement>("[data-equipment-slot]").forEach(select => select.onchange = () => void saveLoadout(select.dataset.equipmentSlot as EquipmentSlot, select.value));
  drawBattle();
}
function drawBattle() {
  const el = root.querySelector<HTMLDivElement>("#battle-view");
  const current = battle;
  if (!el) return;
  if (!current) { el.innerHTML = ""; return; }
  const enemyName = current.enemy.name.toLowerCase();
  const enemyArchetype = enemyName.includes("goblin") ? "goblin" : enemyName.includes("miasma") ? "miasma" : enemyName.includes("sabuesa") || enemyName.includes("lobo") ? "beast" : current.enemy.maxHp >= 140 ? "boss" : "forest";
  const biome = world?.current.kind ?? "path";
  const locationName = world?.current.name ?? "Bosque Oscuro";
  const playerPortraitUrl = getCharacterPortrait(linkedHeroine?.id);
  const enemyPortraitUrl = getEnemyPortrait(enemyArchetype);
  const sceneBackgroundUrl = getSceneBackground(biome);
  const action = lastBattleAction ?? "";
  const actionLabels: Record<string, string> = { attack: "CORTE COORDINADO", skill: "TÉCNICA HEROICA", defend: "GUARDIA", evade: "EVASIÓN", charge: "ACUMULANDO ÁNIMA", "evolve-light": "MANIFESTACIÓN · LIGHT", "evolve-dark": "MANIFESTACIÓN · DARK" };
  const bar = (value: number, max: number) => Math.max(0, value / max * 100);
  const actions = ["attack", "skill", "defend", "evade", "charge", "evolve-light", "evolve-dark"] as const;
  const labels: Record<typeof actions[number], string> = { attack: "⚔ Atacar", skill: "✧ Habilidad", defend: "🛡 Defender", evade: "💨 Evadir", charge: "⚡ Cargar", "evolve-light": "✦ Evolucionar Light", "evolve-dark": "☾ Evolucionar Dark" };
  el.innerHTML = `<div class="battle-scene biome-${escapeHtml(biome)}" data-biome="${escapeHtml(biome)}" data-battle-id="${escapeHtml(current.id)}" data-turn="${current.turn}" data-action="${escapeHtml(action)}" data-battle-status="${current.status}">
    <div class="scene-backdrop" ${sceneBackgroundUrl ? `style="--scene-art-image: url('${escapeHtml(sceneBackgroundUrl)}')"` : ""} aria-hidden="true"><span class="scene-tree tree-a"></span><span class="scene-tree tree-b"></span><span class="scene-fog fog-one"></span><span class="scene-fog fog-two"></span><span class="scene-location">${escapeHtml(locationName)}</span></div>
    <div class="battle-hud"><span>PROTOCOLO DE COMBATE · TURNO <b>${current.turn}</b></span><span>ÁNIMA <b>${current.player.anima}</b> · ALMA <b>${current.alma}</b></span></div>
    <div class="fight-grid">
      <div class="combatant-panel player-panel" data-combatant="player" data-hp="${current.player.hp}" data-max-hp="${current.player.maxHp}">
        <div class="unit-portrait player-portrait heroine-portrait ${playerPortraitUrl ? "has-art" : ""}" aria-hidden="true">${playerPortraitUrl ? `<img class="portrait-art" data-art-image src="${escapeHtml(playerPortraitUrl)}" alt="" loading="lazy" decoding="async">` : ""}<span class="portrait-silhouette"><i></i></span><span class="portrait-mark">${current.branch === "Dark" ? "☾" : current.stage === "Lily" ? "⌁" : "✦"}</span></div>
        <div class="unit-info"><b>✦ ${escapeHtml(current.player.name)}</b><div class="hp"><i style="width:${bar(current.player.hp, current.player.maxHp)}%"></i></div><small>${current.player.hp}/${current.player.maxHp} HP · ATQ ${current.player.attack}</small><div class="combat-status">PORTADORA · ${current.stage.toUpperCase()}${current.branch ? " · " + current.branch.toUpperCase() : ""}</div></div>
      </div>
      <div class="combatant-panel enemy-panel" data-enemy="${enemyArchetype}" data-threat="${current.enemy.maxHp >= 140 ? "boss" : "standard"}" data-combatant="enemy" data-hp="${current.enemy.hp}" data-max-hp="${current.enemy.maxHp}">
        <div class="unit-portrait enemy-portrait ${enemyPortraitUrl ? "has-art" : ""}" aria-hidden="true">${enemyPortraitUrl ? `<img class="portrait-art" data-art-image src="${escapeHtml(enemyPortraitUrl)}" alt="" loading="lazy" decoding="async">` : ""}<span class="portrait-silhouette"><i></i></span><span class="portrait-mark">${enemyArchetype === "goblin" ? "⌁" : enemyArchetype === "miasma" ? "☾" : enemyArchetype === "beast" ? "♧" : "◈"}</span></div>
        <div class="unit-info"><b>☠ ${escapeHtml(current.enemy.name)}</b><div class="hp enemy"><i style="width:${bar(current.enemy.hp, current.enemy.maxHp)}%"></i></div><small>${current.enemy.hp}/${current.enemy.maxHp} HP</small><div class="combat-status">${current.enemy.maxHp >= 140 ? "AMENAZA MAYOR" : "OBJETIVO HOSTIL"}</div><div class="enemy-intent" role="status">${current.enemy.intent === "heavy-attack" ? "⚠ PREPARA GOLPE CARGADO · Defender o evadir" : current.enemy.intent === "guard" ? "🛡 EN GUARDIA · Busca una apertura" : "⚔ PREPARA ATAQUE RÁPIDO · Puedes responder"}</div></div>
      </div>
    </div>
    ${action && actionLabels[action] ? `<div class="power-banner active" data-power="${escapeHtml(action)}">${escapeHtml(actionLabels[action])}</div>` : ""}
    <div class="actions">${actions.map(actionName => `<button data-action="${actionName}" ${current.status !== "active" || (actionName === "skill" && current.player.anima < 20) || ((actionName === "evolve-light" || actionName === "evolve-dark") && (current.stage === "Epic" || current.evolved || (actionName === "evolve-dark" && !current.darkAvailable) || (current.branch !== null && current.branch !== (actionName === "evolve-dark" ? "Dark" : "Light")))) ? "disabled" : ""}>${labels[actionName]}</button>`).join("")}</div>
    <div class="log">${current.log.slice(-4).map(line => "<p>" + escapeHtml(line) + "</p>").join("")}</div>
  </div>`;
  bindArtworkFallbacks(el);
  el.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(button => button.onclick = () => void act(button.dataset.action ?? ""));
}
async function chooseGender(nextGender: string): Promise<void> {
  if (nextGender !== "Mujer" && nextGender !== "Hombre") return;
  const previous = gender;
  gender = nextGender;
  profileNote = "Guardando elección...";
  render();
  try {
    const response = await fetch("/api/profile/gender", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ gender: nextGender })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo guardar la elección.");
    gender = data.gender === "Hombre" ? "Hombre" : "Mujer";
    profileNote = "Elección guardada en tu partida.";
  } catch (error) {
    gender = previous;
    profileNote = error instanceof Error ? error.message : "No se pudo guardar la elección.";
  }
  render();
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
    lastBattleAction = action;
    window.setTimeout(() => { if (lastBattleAction === action) lastBattleAction = null; }, 1100);
    resources = { alma: battle!.alma, anima: battle!.player.anima };
    if (data.rewards) rewards = data.rewards as PlayerRewards;
    if (data.world) world = data.world as WorldView;
    note = data.rewardGranted ? "¡Victoria! Recompensas: +" + (data.rewards?.xp ?? 0) + " XP, +" + (data.rewards?.coins ?? 0) + " monedas y +" + (data.rewards?.materials ?? 0) + " materiales." : "Acción validada por el servidor.";
  } catch (error) {
    note = error instanceof Error ? error.message : "Error de combate";
  }
  render();
}
async function summonFirst() {
  summonReveal = false;
  summonNote = "La carta está buscando a su portadora…";
  render();
  try {
    const response = await fetch("/api/summon/first", { method: "POST", headers: headers(), body: JSON.stringify({}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo realizar la invocación.");
    linkedHeroine = data.heroine as HeroineCard;
    collection = (data.collection as Array<{ heroineId: string; copies: number }>).map(entry => ({
      heroineId: entry.heroineId,
      copies: entry.copies,
      heroine: entry.heroineId === linkedHeroine?.id ? linkedHeroine : null
    }));
    summonReveal = Boolean(data.created);
    summonNote = data.created ? "La carta te ha elegido. El vínculo queda guardado." : "Tu vínculo anterior ha sido restaurado; no se ha gastado otra invocación.";
    void loadCollection();
  } catch (error) {
    summonNote = error instanceof Error ? error.message : "No se pudo completar la invocación.";
  }
  render();
  if (summonReveal) window.setTimeout(() => { summonReveal = false; }, 2700);
}
async function loadCollection() {
  try {
    const response = await fetch("/api/collection", { headers: headers() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo cargar la colección.");
    collection = (data.collection as OwnedCard[]) ?? [];
    const first = collection.find(entry => entry.heroine)?.heroine ?? null;
    if (first) linkedHeroine = first;
    if (linkedHeroine && !summonReveal) summonNote = "Vínculo restaurado desde tu colección.";
  } catch (error) {
    summonNote = error instanceof Error ? error.message : "La colección necesita conexión con el servidor.";
  }
  render();
}
async function loadLoadout() {
  try {
    const response = await fetch("/api/loadout", { headers: headers() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo cargar el equipamiento.");
    equipment = data.equipment as EquipmentItem[];
    loadout = data.loadout as EquipmentLoadout;
    loadoutNote = "Equipo guardado y listo.";
  } catch (error) {
    loadoutNote = error instanceof Error ? error.message : "El equipamiento necesita conexión con el servidor.";
  }
  render();
}
async function saveLoadout(slot: EquipmentSlot, itemId: string) {
  const previous = { ...loadout };
  loadout = { ...loadout, [slot]: itemId };
  loadoutNote = "Guardando equipo…";
  render();
  try {
    const response = await fetch("/api/loadout", { method: "POST", headers: headers(), body: JSON.stringify({ loadout }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo guardar el equipo.");
    equipment = data.equipment as EquipmentItem[];
    loadout = data.loadout as EquipmentLoadout;
    loadoutNote = "Equipo guardado. Las bonificaciones se aplicarán en el próximo combate.";
  } catch (error) {
    loadout = previous;
    loadoutNote = error instanceof Error ? error.message : "No se pudo guardar el equipo.";
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
    world = { progress: data.progress, current: data.destination, destinations: data.destinations, chapter: data.chapter as ChapterOneState };
    worldNote = data.firstVisit ? "Has llegado a " + data.destination.name + ". " + (data.progress.completedEventIds.includes(data.destination.id) ? "Este lugar ya está resuelto." : eventLabel(data.event) + ": " + data.destination.description) : "Has regresado a un lugar conocido.";
    if (data.event === "encounter" || data.event === "boss") note = "La expedición ha detectado peligro. Inicia un encuentro cuando estés listo.";
  } catch (error) {
    worldNote = error instanceof Error ? error.message : "No se pudo recorrer esa ruta.";
  }
  render();
}
async function resolveCurrentEvent() {
  if (!world) return;
  worldNote = "Resolviendo evento…";
  render();
  try {
    const response = await fetch("/api/world/resolve", { method: "POST", headers: headers(), body: JSON.stringify({}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo resolver el evento.");
    world = { progress: data.progress, current: data.current, destinations: data.destinations, chapter: data.chapter as ChapterOneState };
    resources = { ...resources, alma: Number(data.alma ?? resources.alma) };
    if (battle) battle.alma = resources.alma;
    if (data.rewards) rewards = data.rewards as PlayerRewards;
    const reward = data.reward as { xp: number; coins: number; materials: number; alma: number };
    const gained = [
      reward.xp ? "+" + reward.xp + " XP" : "",
      reward.coins ? "+" + reward.coins + " monedas" : "",
      reward.materials ? "+" + reward.materials + " materiales" : "",
      reward.alma ? "+" + reward.alma + " Alma" : ""
    ].filter(Boolean).join(", ");
    worldNote = data.event === "discovery"
      ? "Lugar investigado. " + (gained ? "Recompensa: " + gained + "." : "")
      : data.event === "rest"
        ? "Has descansado. " + (gained ? "Recuperaste " + gained + "." : "Ya tienes el Alma al máximo.")
        : "Visita registrada.";
    note = worldNote;
  } catch (error) {
    worldNote = error instanceof Error ? error.message : "No se pudo resolver el evento.";
  }
  render();
}
async function returnFromChapter() {
  if (!world || world.current.id !== "aldea-bruma" || !world.chapter.completed || world.chapter.returnedToVillage) return;
  worldNote = "Registrando el regreso del capítulo…";
  render();
  try {
    const response = await fetch("/api/chapter/return", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo registrar el regreso.");
    world = {
      progress: data.progress,
      current: data.current,
      destinations: data.destinations,
      chapter: data.chapter as ChapterOneState
    };
    worldNote = data.alreadyReturned
      ? "El regreso del capítulo ya estaba registrado."
      : "Regreso registrado. El capítulo 1 queda cerrado y guardado.";
    note = worldNote;
  } catch (error) {
    worldNote = error instanceof Error ? error.message : "No se pudo registrar el regreso.";
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
window.addEventListener("umbra-art-updated", () => render());
void loadArtManifest().then(() => render());
void loadCollection();
void loadLoadout();
void loadWorld();
void restoreActiveBattle();
void fetch("/api/me", { headers: headers() }).then(async response => {
  const data = await response.json();
  if (response.ok && data.player) {
    resources = { alma: data.player.alma, anima: data.player.anima };
    if (data.player.gender === "Hombre" || data.player.gender === "Mujer") gender = data.player.gender;
    if (data.rewards) rewards = data.rewards as PlayerRewards;
    profileNote = "Elección y recursos recuperados de tu partida.";
    render();
  }
}).catch(() => {});
