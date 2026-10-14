import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
const filename=resolve(process.env.DATABASE_PATH??"./data/umbra.sqlite"); mkdirSync(dirname(filename),{recursive:true});
export const db=new Database(filename); db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS players(telegram_id TEXT PRIMARY KEY,display_name TEXT NOT NULL,alma INTEGER NOT NULL DEFAULT 100,anima INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS inventory(telegram_id TEXT NOT NULL,heroine_id TEXT NOT NULL,copies INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(telegram_id,heroine_id));`);
export function getOrCreatePlayer(id:string,name:string){db.prepare("INSERT OR IGNORE INTO players(telegram_id,display_name) VALUES(?,?)").run(id,name);return db.prepare("SELECT telegram_id AS telegramId,display_name AS displayName,alma,anima,created_at AS createdAt FROM players WHERE telegram_id=?").get(id) as {telegramId:string;displayName:string;alma:number;anima:number;createdAt:string};}
