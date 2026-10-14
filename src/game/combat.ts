import { randomInt, randomUUID } from "node:crypto";
import type { BattleState } from "./types.js";
export type BattleAction = "attack" | "skill" | "defend" | "evade" | "charge" | "evolve";
export function createBattle(heroName = "Heroína vinculada"): BattleState {
 return {id:randomUUID(),turn:0,alma:100,player:{name:heroName,hp:100,maxHp:100,attack:24,anima:0},enemy:{name:"Perro contaminado",hp:82,maxHp:82,attack:12,anima:0},status:"active",evolved:false,log:["Una criatura contaminada bloquea el camino."]};
}
export function act(battle: BattleState, action: BattleAction): BattleState {
 if(battle.status!=="active") return battle;
 const b: BattleState=structuredClone(battle); b.turn++;
 let guard=0, evade=false;
 if(action==="attack"){const d=b.player.attack+randomInt(0,9);b.enemy.hp=Math.max(0,b.enemy.hp-d);b.player.anima=Math.min(100,b.player.anima+12);b.log.push("Ataque: "+d+" de daño; +12 Ánima.");}
 if(action==="skill"){const d=b.player.attack+16+randomInt(0,8);b.enemy.hp=Math.max(0,b.enemy.hp-d);b.player.hp=Math.min(b.player.maxHp,b.player.hp+8);b.player.anima=Math.min(100,b.player.anima+18);b.log.push("Habilidad: "+d+" de daño, +8 HP y +18 Ánima.");}
 if(action==="defend"){guard=8;b.player.anima=Math.min(100,b.player.anima+8);b.log.push("Defensa preparada.");}
 if(action==="evade"){evade=true;b.player.anima=Math.min(100,b.player.anima+6);b.log.push("Evasión preparada.");}
 if(action==="charge"){b.player.anima=Math.min(100,b.player.anima+25);b.log.push("Carga: +25 Ánima.");}
 if(action==="evolve"){if(b.evolved){b.log.push("Ya evolucionaste en esta batalla.");return b;}if(b.player.anima<60){b.log.push("Necesitas 60 Ánima para activar la evolución.");return b;}if(b.alma<25){b.log.push("Necesitas 25 Alma del protagonista para evolucionar.");return b;}b.evolved=true;b.alma-=25;b.player.attack+=10;b.player.maxHp+=15;b.player.hp=Math.min(b.player.maxHp,b.player.hp+15);b.log.push("¡Evolución! +10 ATQ y +15 vida máxima.");}
 if(b.enemy.hp<=0){b.status="won";b.log.push("Victoria: la criatura fue derrotada.");return b;}
 if(["attack","skill","defend","evade","charge","evolve"].includes(action)){const d=evade?0:Math.max(1,b.enemy.attack+randomInt(0,5)-guard);b.player.hp=Math.max(0,b.player.hp-d);b.log.push(d===0?"Evasión perfecta.":"La criatura contraataca: "+d+" de daño.");}
 if(b.player.hp<=0){b.status="lost";b.log.push("Derrota: reagrúpate y vuelve a intentarlo.");}
 return b;
}
