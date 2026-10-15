import "dotenv/config";
import express from "express";
import { resolve } from "node:path";
import { createBattle, act, type BattleAction } from "./game/combat.js";
import { getOrCreatePlayer, getBattle, getLatestActiveBattle, saveBattleProgress, getWorldProgress, saveWorldProgress } from "./db.js";
import { getAvailableDestinations, getWorldNode, travelTo } from "./game/world.js";
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
  try { res.json({ player: player(req) }); }
  catch (error) { res.status(401).json({ error: error instanceof Error ? error.message : "No autorizado" }); }
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
    const heroineName = typeof req.body?.heroineName === "string" ? req.body.heroineName.slice(0, 80) : "Heroína vinculada";
    const battle = createBattle(heroineName, currentPlayer.alma, currentPlayer.formStage, currentPlayer.anima);
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
    const allowed: BattleAction[] = ["attack", "skill", "defend", "evade", "charge", "evolve"];
    const entry = getBattle(id);
    if (!entry) return res.status(404).json({ error: "Combate no encontrado." });
    if (entry.ownerId !== currentPlayer.telegramId) return res.status(403).json({ error: "Este combate pertenece a otro jugador." });
    if (!allowed.includes(action as BattleAction)) return res.status(400).json({ error: "Acción inválida." });
    const resourceBase = {
      ...entry.battle,
      alma: currentPlayer.alma,
      stage: currentPlayer.formStage,
      player: {
        ...entry.battle.player,
        anima: currentPlayer.anima,
        name: entry.battle.player.name.replace(/ · (Lily|Hero|Epic)$/, "") + " · " + currentPlayer.formStage
      }
    };
    const next = act(resourceBase, action as BattleAction);
    const savedBattle = saveBattleProgress(currentPlayer.telegramId, next, resourceBase);
    res.json({ battle: savedBattle });
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
