import { createHmac, timingSafeEqual } from "node:crypto";
export interface TelegramUser { id:number; first_name?:string; username?:string; }
export function validateTelegramInitData(initData:string, botToken:string, maxAgeSeconds=86400):TelegramUser {
 if(!initData||!botToken) throw new Error("Falta initData o token del bot.");
 const params=new URLSearchParams(initData); const hash=params.get("hash"); if(!hash) throw new Error("initData sin hash."); params.delete("hash");
 const check=[...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+"="+v).join("\n");
 const secret=createHmac("sha256","WebAppData").update(botToken).digest();
 const expected=createHmac("sha256",secret).update(check).digest("hex");
 const got=Buffer.from(hash,"hex"), want=Buffer.from(expected,"hex");
 if(got.length!==want.length||!timingSafeEqual(got,want)) throw new Error("Firma de Telegram inválida.");
 const date=Number(params.get("auth_date")); if(!Number.isFinite(date)||Math.floor(Date.now()/1000)-date>maxAgeSeconds) throw new Error("initData expirado.");
 const raw=params.get("user"); if(!raw) throw new Error("initData sin usuario.");
 const user=JSON.parse(raw) as TelegramUser; if(!Number.isSafeInteger(user.id)) throw new Error("Usuario inválido."); return user;
}
