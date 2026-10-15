import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
const filename=resolve(process.env.DATABASE_PATH??"./data/umbra.sqlite"); mkdirSync(dirname(filename),{recursive:true});
export const db=new Database(filename); db.pragma("journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS player_progress(telegram_id TEXT PRIMARY KEY, form_stage TEXT NOT NULL DEFAULT 'Lily' CHECK(form_stage IN ('Lily','Hero','Epic')))");
db.exec(`CREATE TABLE IF NOT EXISTS players(telegram_id TEXT PRIMARY KEY,display_name TEXT NOT NULL,alma INTEGER NOT NULL DEFAULT 100,anima INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS inventory(telegram_id TEXT NOT NULL,heroine_id TEXT NOT NULL,copies INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(telegram_id,heroine_id));`);
export function getOrCreatePlayer(id:string,name:string){db.prepare("INSERT OR IGNORE INTO players(telegram_id,display_name) VALUES(?,?)").run(id,name);db.prepare("INSERT OR IGNORE INTO player_progress(telegram_id) VALUES(?)").run(id);return db.prepare("SELECT p.telegram_id AS telegramId,p.display_name AS displayName,p.alma,p.anima,p.created_at AS createdAt,g.form_stage AS formStage FROM players p JOIN player_progress g ON g.telegram_id=p.telegram_id WHERE p.telegram_id=?").get(id) as {telegramId:string;displayName:string;alma:number;anima:number;createdAt:string;formStage:"Lily"|"Hero"|"Epic"};}

export function savePlayerResources(id:string,alma:number,anima:number):void {
  db.prepare("UPDATE players SET alma=?, anima=? WHERE telegram_id=?").run(Math.max(0,Math.min(100,Math.floor(alma))),Math.max(0,Math.min(100,Math.floor(anima))),id);
}

export function savePlayerFormStage(id:string,stage:"Lily"|"Hero"|"Epic"):void {
  db.prepare("INSERT INTO player_progress(telegram_id,form_stage) VALUES(?,?) ON CONFLICT(telegram_id) DO UPDATE SET form_stage=excluded.form_stage").run(id,stage);
}
