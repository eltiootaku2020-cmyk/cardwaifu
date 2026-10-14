import "dotenv/config";
import express from "express";
import { resolve } from "node:path";
import { createBattle, act, type BattleAction } from "./game/combat.js";
import { getOrCreatePlayer } from "./db.js";
import { validateTelegramInitData } from "./telegram/auth.js";
const app=express(); app.use(express.json({limit:"32kb"})); const port=Number(process.env.PORT??3000);
const battles=new Map<string,ReturnType<typeof createBattle>>();
function player(req:express.Request){const data=req.header("x-telegram-init-data")??"";if(process.env.ALLOW_DEV_AUTH==="true"&&process.env.NODE_ENV!=="production"&&!data)return getOrCreatePlayer("dev-local","Jugador local");const token=process.env.BOT_TOKEN;if(!token)throw new Error("BOT_TOKEN no configurado.");const u=validateTelegramInitData(data,token,Number(process.env.TELEGRAM_AUTH_MAX_AGE_SECONDS??86400));return getOrCreatePlayer(String(u.id),u.first_name??u.username??"Jugador");}
app.get("/api/health",(_req,res)=>res.json({ok:true,game:"UMBRA: Card Frontier",mode:"prototype"}));
app.get("/api/me",(req,res)=>{try{res.json({player:player(req)});}catch(e){res.status(401).json({error:e instanceof Error?e.message:"No autorizado"});}});
app.post("/api/battle/start",(req,res)=>{try{player(req);const b=createBattle(String(req.body?.heroineName??"Heroína vinculada"));battles.set(b.id,b);res.json({battle:b});}catch(e){res.status(401).json({error:e instanceof Error?e.message:"No autorizado"});}});
app.post("/api/battle/action",(req,res)=>{try{player(req);const id=String(req.body?.battleId??"");const action=String(req.body?.action??"") as BattleAction;const allowed:BattleAction[]=["attack","skill","defend","evade","charge","evolve"];const b=battles.get(id);if(!b)return res.status(404).json({error:"Combate no encontrado."});if(!allowed.includes(action))return res.status(400).json({error:"Acción inválida."});const next=act(b,action);battles.set(id,next);res.json({battle:next});}catch(e){res.status(401).json({error:e instanceof Error?e.message:"No autorizado"});}});
if(process.env.NODE_ENV==="production"){const dist=resolve("web/dist");app.use(express.static(dist));app.get("*",(_req,res)=>res.sendFile(resolve(dist,"index.html")));}
app.listen(port,()=>console.log("UMBRA API en http://localhost:"+port));
