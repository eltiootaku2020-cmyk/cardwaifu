import "dotenv/config";
import express from "express";
import { resolve } from "node:path";
import { createBattle, act, type BattleAction } from "./game/combat.js";
import { getOrCreatePlayer, savePlayerResources, savePlayerFormStage } from "./db.js";
import { validateTelegramInitData } from "./telegram/auth.js";
import type { BattleState } from "./game/types.js";

const app = express();
app.use(express.json({ limit: "32kb" }));
const port = Number(process.env.PORT ?? 3000);
const battles = new Map<string, { ownerId: string; battle: BattleState }>();

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

app.post("/api/battle/start", (req, res) => {
  try {
    const currentPlayer = player(req);
    const heroineName = typeof req.body?.heroineName === "string" ? req.body.heroineName.slice(0, 80) : "Heroína vinculada";
    const battle = createBattle(heroineName, currentPlayer.alma, currentPlayer.formStage, currentPlayer.anima);
    battles.set(battle.id, { ownerId: currentPlayer.telegramId, battle });
    res.json({ battle });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "No autorizado" });
  }
});

app.post("/api/battle/action", (req, res) => {
  try {
    const currentPlayer = player(req);
    const id = typeof req.body?.battleId === "string" ? req.body.battleId : "";
    const action: string = typeof req.body?.action === "string" ? req.body.action : "";
    const allowed: string[] = ["attack", "skill", "defend", "evade", "charge", "evolve"];
    const entry = battles.get(id);
    if (!entry) return res.status(404).json({ error: "Combate no encontrado." });
    if (entry.ownerId !== currentPlayer.telegramId) return res.status(403).json({ error: "Este combate pertenece a otro jugador." });
    if (!allowed.includes(action)) return res.status(400).json({ error: "Acción inválida." });
    const next = act(entry.battle, action as BattleAction);
    battles.set(id, { ownerId: entry.ownerId, battle: next });
    savePlayerResources(currentPlayer.telegramId, next.alma, next.player.anima);
    res.json({ battle: next });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "No autorizado" });
  }
});

if (process.env.NODE_ENV === "production") {
  const dist = resolve("web/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(resolve(dist, "index.html")));
}
app.listen(port, () => console.log("UMBRA API en http://localhost:" + port));
