import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { BattleState, FormBranch, FormStage } from "./game/types.js";
import { createWorldProgress, type WorldProgress } from "./game/world.js";
import { DEFAULT_LOADOUT, type EquipmentLoadout } from "./game/equipment.js";

const filename = resolve(process.env.DATABASE_PATH ?? "./data/umbra.sqlite");
mkdirSync(dirname(filename), { recursive: true });
export const db = new Database(filename);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS player_progress(
    telegram_id TEXT PRIMARY KEY,
    form_stage TEXT NOT NULL DEFAULT 'Lily' CHECK(form_stage IN ('Lily','Hero','Epic')),
    form_branch TEXT DEFAULT NULL CHECK(form_branch IS NULL OR form_branch IN ('Light','Dark'))
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
  CREATE TABLE IF NOT EXISTS player_loadout(
    telegram_id TEXT PRIMARY KEY REFERENCES players(telegram_id) ON DELETE CASCADE,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS player_rewards(
    telegram_id TEXT PRIMARY KEY REFERENCES players(telegram_id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0 CHECK(xp >= 0),
    coins INTEGER NOT NULL DEFAULT 0 CHECK(coins >= 0),
    materials INTEGER NOT NULL DEFAULT 0 CHECK(materials >= 0)
  );
  CREATE TABLE IF NOT EXISTS world_progress(
    telegram_id TEXT PRIMARY KEY REFERENCES players(telegram_id) ON DELETE CASCADE,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
try { db.exec("ALTER TABLE player_progress ADD COLUMN form_branch TEXT CHECK(form_branch IS NULL OR form_branch IN ('Light','Dark'))"); } catch { /* La columna ya existe en bases creadas con el esquema actual. */ }

export interface PlayerRecord {
  telegramId: string;
  displayName: string;
  alma: number;
  anima: number;
  createdAt: string;
  formStage: FormStage;
  formBranch: FormBranch;
}

export function getOrCreatePlayer(id: string, name: string): PlayerRecord {
  db.prepare("INSERT OR IGNORE INTO players(telegram_id,display_name) VALUES(?,?)").run(id, name);
  db.prepare("INSERT OR IGNORE INTO player_progress(telegram_id) VALUES(?)").run(id);
  db.prepare("INSERT OR IGNORE INTO player_rewards(telegram_id) VALUES(?)").run(id);
  db.prepare("INSERT OR IGNORE INTO player_loadout(telegram_id,state_json) VALUES(?,?)").run(id, JSON.stringify(DEFAULT_LOADOUT));
  return db.prepare(`
    SELECT p.telegram_id AS telegramId, p.display_name AS displayName, p.alma, p.anima,
           p.created_at AS createdAt, g.form_stage AS formStage, g.form_branch AS formBranch
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

export function savePlayerFormBranch(id: string, branch: FormBranch): void {
  db.prepare("UPDATE player_progress SET form_branch=? WHERE telegram_id=?").run(branch, id);
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

export const saveBattleProgress = db.transaction((
  ownerId: string,
  battle: BattleState,
  resourceBase?: BattleState,
  victoryRewards?: { xp: number; coins: number; materials: number }
): BattleState => {
  let savedBattle = battle;

  if (resourceBase) {
    const resources = db.prepare(`
      SELECT p.alma, p.anima, g.form_stage AS formStage, g.form_branch AS formBranch
      FROM players p JOIN player_progress g ON g.telegram_id=p.telegram_id
      WHERE p.telegram_id=?
    `).get(ownerId) as { alma: number; anima: number; formStage: FormStage; formBranch: FormBranch } | undefined;
    if (!resources) throw new Error("Jugador no encontrado.");

    const alma = Math.max(0, Math.min(100, resources.alma + battle.alma - resourceBase.alma));
    const anima = Math.max(0, Math.min(100, resources.anima + battle.player.anima - resourceBase.player.anima));
    const stage = battle.stage !== resourceBase.stage ? battle.stage : resources.formStage;
    const branch = battle.branch !== resourceBase.branch ? battle.branch : resources.formBranch;

    savedBattle = {
      ...battle,
      alma,
      stage,
      branch,
      player: { ...battle.player, anima }
    };
  }

  saveBattle(ownerId, savedBattle);
  if (resourceBase?.status === "active" && savedBattle.status === "won" && victoryRewards) {
    db.prepare("UPDATE player_rewards SET xp=xp+?, coins=coins+?, materials=materials+? WHERE telegram_id=?")
      .run(Math.max(0, victoryRewards.xp), Math.max(0, victoryRewards.coins), Math.max(0, victoryRewards.materials), ownerId);
  }
  savePlayerResources(ownerId, savedBattle.alma, savedBattle.player.anima);
  savePlayerFormStage(ownerId, savedBattle.stage);
  savePlayerFormBranch(ownerId, savedBattle.branch);
  return savedBattle;
});


export function getWorldProgress(ownerId: string): WorldProgress {
  const row = db.prepare("SELECT state_json AS stateJson FROM world_progress WHERE telegram_id=?")
    .get(ownerId) as { stateJson: string } | undefined;
  if (row) return JSON.parse(row.stateJson) as WorldProgress;
  const initial = createWorldProgress();
  db.prepare("INSERT OR IGNORE INTO world_progress(telegram_id,state_json) VALUES(?,?)")
    .run(ownerId, JSON.stringify(initial));
  const stored = db.prepare("SELECT state_json AS stateJson FROM world_progress WHERE telegram_id=?")
    .get(ownerId) as { stateJson: string };
  return JSON.parse(stored.stateJson) as WorldProgress;
}

export function saveWorldProgress(ownerId: string, progress: WorldProgress): void {
  db.prepare(`
    INSERT INTO world_progress(telegram_id,state_json,updated_at)
    VALUES(?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_id) DO UPDATE SET
      state_json=excluded.state_json,
      updated_at=CURRENT_TIMESTAMP
  `).run(ownerId, JSON.stringify(progress));
}


export interface InventoryEntry {
  heroineId: string;
  copies: number;
}

export function getInventory(ownerId: string): InventoryEntry[] {
  return db.prepare(`
    SELECT heroine_id AS heroineId, copies
    FROM inventory WHERE telegram_id=? ORDER BY rowid ASC
  `).all(ownerId) as InventoryEntry[];
}

export const grantFirstHeroine = db.transaction((
  ownerId: string,
  candidateIds: string[],
  choose: () => string
): { heroineId: string; created: boolean } => {
  const existing = db.prepare(`
    SELECT heroine_id AS heroineId FROM inventory
    WHERE telegram_id=? ORDER BY rowid ASC LIMIT 1
  `).get(ownerId) as { heroineId: string } | undefined;
  if (existing) return { heroineId: existing.heroineId, created: false };
  if (candidateIds.length === 0) throw new Error("El grupo inicial de heroínas está vacío.");
  const selected = choose();
  if (!candidateIds.includes(selected)) throw new Error("La invocación seleccionó una heroína inválida.");
  db.prepare("INSERT INTO inventory(telegram_id,heroine_id,copies) VALUES(?,?,1)").run(ownerId, selected);
  return { heroineId: selected, created: true };
});


export interface PlayerRewards {
  xp: number;
  coins: number;
  materials: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function getPlayerRewards(ownerId: string): PlayerRewards {
  const row = db.prepare("SELECT xp, coins, materials FROM player_rewards WHERE telegram_id=?")
    .get(ownerId) as { xp: number; coins: number; materials: number } | undefined;
  const xp = row?.xp ?? 0;
  const level = Math.floor(xp / 100) + 1;
  return {
    xp,
    coins: row?.coins ?? 0,
    materials: row?.materials ?? 0,
    level,
    xpIntoLevel: xp % 100,
    xpForNextLevel: 100
  };
}


export function getPlayerLoadout(ownerId: string): EquipmentLoadout {
  const row = db.prepare("SELECT state_json AS stateJson FROM player_loadout WHERE telegram_id=?")
    .get(ownerId) as { stateJson: string } | undefined;
  if (row) return JSON.parse(row.stateJson) as EquipmentLoadout;
  db.prepare("INSERT OR IGNORE INTO player_loadout(telegram_id,state_json) VALUES(?,?)")
    .run(ownerId, JSON.stringify(DEFAULT_LOADOUT));
  return { ...DEFAULT_LOADOUT };
}

export function savePlayerLoadout(ownerId: string, loadout: EquipmentLoadout): void {
  db.prepare(`
    INSERT INTO player_loadout(telegram_id,state_json,updated_at)
    VALUES(?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_id) DO UPDATE SET
      state_json=excluded.state_json,
      updated_at=CURRENT_TIMESTAMP
  `).run(ownerId, JSON.stringify(loadout));
}
