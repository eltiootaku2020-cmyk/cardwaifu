import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { BattleState, FormStage } from "./game/types.js";

const filename = resolve(process.env.DATABASE_PATH ?? "./data/umbra.sqlite");
mkdirSync(dirname(filename), { recursive: true });
export const db = new Database(filename);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS player_progress(
    telegram_id TEXT PRIMARY KEY,
    form_stage TEXT NOT NULL DEFAULT 'Lily' CHECK(form_stage IN ('Lily','Hero','Epic'))
  );
  CREATE TABLE IF NOT EXISTS players(
    telegram_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    alma INTEGER NOT NULL DEFAULT 100 CHECK(alma BETWEEN 0 AND 100),
    anima INTEGER NOT NULL DEFAULT 0 CHECK(anima BETWEEN 0 AND 100),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS inventory(
    telegram_id TEXT NOT NULL,
    heroine_id TEXT NOT NULL,
    copies INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY(telegram_id,heroine_id)
  );
  CREATE TABLE IF NOT EXISTS battles(
    battle_id TEXT PRIMARY KEY,
    telegram_id TEXT NOT NULL REFERENCES players(telegram_id) ON DELETE CASCADE,
    state_json TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active','won','lost')),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS battles_player_updated ON battles(telegram_id, updated_at DESC);
`);

export interface PlayerRecord {
  telegramId: string;
  displayName: string;
  alma: number;
  anima: number;
  createdAt: string;
  formStage: FormStage;
}

export function getOrCreatePlayer(id: string, name: string): PlayerRecord {
  db.prepare("INSERT OR IGNORE INTO players(telegram_id,display_name) VALUES(?,?)").run(id, name);
  db.prepare("INSERT OR IGNORE INTO player_progress(telegram_id) VALUES(?)").run(id);
  return db.prepare(`
    SELECT p.telegram_id AS telegramId, p.display_name AS displayName, p.alma, p.anima,
           p.created_at AS createdAt, g.form_stage AS formStage
    FROM players p JOIN player_progress g ON g.telegram_id=p.telegram_id
    WHERE p.telegram_id=?
  `).get(id) as PlayerRecord;
}

export function savePlayerResources(id: string, alma: number, anima: number): void {
  db.prepare("UPDATE players SET alma=?, anima=? WHERE telegram_id=?").run(
    Math.max(0, Math.min(100, Math.floor(alma))),
    Math.max(0, Math.min(100, Math.floor(anima))),
    id
  );
}

export function savePlayerFormStage(id: string, stage: FormStage): void {
  db.prepare(`
    INSERT INTO player_progress(telegram_id,form_stage) VALUES(?,?)
    ON CONFLICT(telegram_id) DO UPDATE SET form_stage=excluded.form_stage
  `).run(id, stage);
}

export function saveBattle(ownerId: string, battle: BattleState): void {
  db.prepare(`
    INSERT INTO battles(battle_id,telegram_id,state_json,status,updated_at)
    VALUES(?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(battle_id) DO UPDATE SET
      state_json=excluded.state_json,
      status=excluded.status,
      updated_at=CURRENT_TIMESTAMP
    WHERE battles.telegram_id=excluded.telegram_id
  `).run(battle.id, ownerId, JSON.stringify(battle), battle.status);
}

export function getBattle(battleId: string): { ownerId: string; battle: BattleState } | undefined {
  const row = db.prepare("SELECT telegram_id AS ownerId,state_json AS stateJson FROM battles WHERE battle_id=?")
    .get(battleId) as { ownerId: string; stateJson: string } | undefined;
  if (!row) return undefined;
  return { ownerId: row.ownerId, battle: JSON.parse(row.stateJson) as BattleState };
}

export function getLatestActiveBattle(ownerId: string): BattleState | undefined {
  const row = db.prepare(`
    SELECT state_json AS stateJson FROM battles
    WHERE telegram_id=? AND status='active'
    ORDER BY updated_at DESC LIMIT 1
  `).get(ownerId) as { stateJson: string } | undefined;
  return row ? JSON.parse(row.stateJson) as BattleState : undefined;
}

export const saveBattleProgress = db.transaction((ownerId: string, battle: BattleState): void => {
  saveBattle(ownerId, battle);
  savePlayerResources(ownerId, battle.alma, battle.player.anima);
  savePlayerFormStage(ownerId, battle.stage);
});
