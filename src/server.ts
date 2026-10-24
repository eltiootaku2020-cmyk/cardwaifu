import "dotenv/config";
import { randomInt } from "node:crypto";
import express from "express";
import { resolve } from "node:path";
import { createBattle, act, type BattleAction } from "./game/combat.js";
import { getOrCreatePlayer, getBattle, getLatestActiveBattle, saveBattleProgress, getWorldProgress, saveWorldProgress, getInventory, grantFirstHeroine, savePlayerFormStage, getPlayerRewards, getPlayerLoadout, savePlayerLoadout, saveProtagonistGender } from "./db.js";
import { getAvailableDestinations, getWorldNode, travelTo } from "./game/world.js";
import { getFirstSummonPool, getHeroine } from "./game/catalog.js";
import { EQUIPMENT, getEquipmentBonuses, isValidLoadout } from "./game/equipment.js";
import { validateTelegramInitData } from "./telegram/auth.js";

const app = express();
app.use(express.json({ limit: "32kb" }));
const port = Number(process.env.PORT ?? 3000);

function player(req: express.Request) {
  const data = req.header("x-telegram-init-data") ?? "";
  if (process.env.ALLOW_DEV_AUTH === "true" && process.env.NODE_ENV !== "production" && !data) {
    return getOrCreatePlayer("dev-local", "Jugador local");
  }
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN no configurado.");
  const user = validateTelegramInitData(data, token, Number(process.env.TELEGRAM_AUTH_MAX_AGE_SECONDS ?? 86400));
  return getOrCreatePlayer(String(user.id), user.first_name ?? user.username ?? "Jugador");
}

app.get("/api/health", (_req, res) => res.json({ ok: true, game: "UMBRA: Card Frontier", mode: "prototype" }));

app.get("/api/me", (req, res) => {
  try { const currentPlayer = player(req); res.json({ player: currentPlayer, rewards: getPlayerRewards(currentPlayer.telegramId) }); }
  catch (error) { res.status(401).json({ error: error instanceof Error ? error.message : "No autorizado" }); }
});

app.post("/api/profile/gender", (req, res) => {
  try {
    const currentPlayer = player(req);
    const gender = req.body?.gender;
    if (gender !== "Mujer" && gender !== "Hombre") {
      return res.status(400).json({ error: "Elige protagonista mujer u hombre." });
    }
    saveProtagonistGender(currentPlayer.telegramId, gender);
    res.json({ gender });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "No se pudo guardar el perfil." });
  }
});

app.get("/api/loadout", (req, res) => {
  try {
    const currentPlayer = player(req);
    const loadout = getPlayerLoadout(currentPlayer.telegramId);
    res.json({ loadout, equipment: EQUIPMENT, bonuses: getEquipmentBonuses(loadout) });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "No se pudo cargar el equipamiento." });
  }
});

app.post("/api/loadout", (req, res) => {
  try {
    const currentPlayer = player(req);
    const loadout = req.body?.loadout;
    if (!isValidLoadout(loadout)) return res.status(400).json({ error: "El equipamiento no coincide con los cuatro espacios permitidos." });
    savePlayerLoadout(currentPlayer.telegramId, loadout);
    res.json({ loadout, equipment: EQUIPMENT, bonuses: getEquipmentBonuses(loadout) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo guardar el equipamiento." });
  }
});

app.get("/api/collection", (req, res) => {
  try {
    const currentPlayer = player(req);
    const collection = getInventory(currentPlayer.telegramId).map(entry => ({
      ...entry,
      heroine: getHeroine(entry.heroineId) ?? null
    }));
    res.json({ collection });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "No se pudo cargar la colección." });
  }
});

app.post("/api/summon/first", (req, res) => {
  try {
    const currentPlayer = player(req);
    const pool = getFirstSummonPool();
    const result = grantFirstHeroine(
      currentPlayer.telegramId,
      pool.map(heroine => heroine.id),
      () => pool[randomInt(0, pool.length)]!.id
    );
    const heroine = getHeroine(result.heroineId);
    if (!heroine) throw new Error("La heroína vinculada no existe en el catálogo.");
    if (result.created) savePlayerFormStage(currentPlayer.telegramId, heroine.stage);
    res.json({ heroine, created: result.created, collection: getInventory(currentPlayer.telegramId) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "No se pudo completar la primera invocación." });
  }
});

app.get("/api/world", (req, res) => {
  try {
    const currentPlayer = player(req);
    const progress = getWorldProgress(currentPlayer.telegramId);
    const current = getWorldNode(progress.currentNodeId);
    if (!current) throw new Error("La ruta guardada no es válida.");
    res.json({ progress, current, destinations: getAvailableDestinations(progress) });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "No se pudo cargar la expedición." });
  }
});

app.post("/api/world/travel", (req, res) => {
  try {
    const currentPlayer = player(req);
    const destinationId = typeof req.body?.destinationId === "string" ? req.body.destinationId : "";
    const progress = getWorldProgress(currentPlayer.telegramId);
    const result = travelTo(progress, destinationId);
    saveWorldProgress(currentPlayer.telegramId, result.progress);
    res.json({ ...result, destinations: getAvailableDestinations(result.progress) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo recorrer esa ruta." });
  }
});

app.get("/api/battle/active", (req, res) => {
  try {
    const currentPlayer = player(req);
    res.json({ battle: getLatestActiveBattle(currentPlayer.telegramId) ?? null });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "No autorizado" });
  }
});

app.post("/api/battle/start", (req, res) => {
  try {
    const currentPlayer = player(req);
    const owned = getInventory(currentPlayer.telegramId);
    const heroine = owned.length ? getHeroine(owned[0]!.heroineId) : undefined;
    if (!heroine) return res.status(400).json({ error: "Primero debes vincular una heroína mediante la primera invocación." });
    const progress = getWorldProgress(currentPlayer.telegramId);
    const node = getWorldNode(progress.currentNodeId);
    if (!node || (node.event !== "encounter" && node.event !== "boss")) {
      return res.status(400).json({ error: "No hay una amenaza activa aquí. Explora una ruta marcada como posible encuentro o amenaza mayor." });
    }
    const encounters: Record<string, { name: string; hp: number; attack: number }> = {
      "sendero-musgo": { name: "Sabuesa contaminada", hp: 82, attack: 12 },
      "nido-goblin": { name: "Goblin cazadora", hp: 96, attack: 14 },
      "entrada-abismo": { name: "Guardiana del Miasma", hp: 150, attack: 18 }
    };
    const encounter = encounters[node.id] ?? { name: "Exploradora hostil del bosque", hp: 90, attack: 13 };
    const loadout = getPlayerLoadout(currentPlayer.telegramId);
    const gearBonuses = getEquipmentBonuses(loadout);
    const battle = createBattle(heroine.name, currentPlayer.alma, currentPlayer.formStage, currentPlayer.anima, encounter.name, encounter.hp, encounter.attack, heroine.attack + gearBonuses.attackBonus, heroine.maxHp + gearBonuses.hpBonus);
    saveBattleProgress(currentPlayer.telegramId, battle);
    res.json({ battle });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "No se pudo iniciar el combate." });
  }
});

app.post("/api/battle/action", (req, res) => {
  try {
    const currentPlayer = player(req);
    const id = typeof req.body?.battleId === "string" ? req.body.battleId : "";
    const action: string = typeof req.body?.action === "string" ? req.body.action : "";
    const allowed: BattleAction[] = ["attack", "skill", "defend", "evade", "charge", "evolve-light", "evolve-dark"];
    const entry = getBattle(id);
    if (!entry) return res.status(404).json({ error: "Combate no encontrado." });
    if (entry.ownerId !== currentPlayer.telegramId) return res.status(403).json({ error: "Este combate pertenece a otro jugador." });
    if (!allowed.includes(action as BattleAction)) return res.status(400).json({ error: "Acción inválida." });
    const resourceBase = {
      ...entry.battle,
      alma: currentPlayer.alma,
      stage: currentPlayer.formStage,
      branch: currentPlayer.formBranch,
      player: {
        ...entry.battle.player,
        anima: currentPlayer.anima,
        name: entry.battle.player.name.replace(/ · (Lily|Hero|Epic)(?: (Light|Dark))?$/, "") + " · " + currentPlayer.formStage + (currentPlayer.formBranch ? " " + currentPlayer.formBranch : "")
      }
    };
    const next = act(resourceBase, action as BattleAction);
    const node = getWorldNode(getWorldProgress(currentPlayer.telegramId).currentNodeId);
    const victoryRewards = node?.kind === "dungeon"
      ? { xp: 60, coins: 20, materials: 3 }
      : { xp: 25, coins: 8, materials: 1 };
    const rewardGranted = resourceBase.status === "active" && next.status === "won";
    const savedBattle = saveBattleProgress(currentPlayer.telegramId, next, resourceBase, victoryRewards);
    res.json({ battle: savedBattle, rewards: getPlayerRewards(currentPlayer.telegramId), rewardGranted });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "No se pudo guardar el combate." });
  }
});

if (process.env.NODE_ENV === "production") {
  const dist = resolve("web/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(resolve(dist, "index.html")));
}
app.listen(port, () => console.log("UMBRA API en http://localhost:" + port));
