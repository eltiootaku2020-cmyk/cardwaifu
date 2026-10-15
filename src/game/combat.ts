import { randomInt, randomUUID } from "node:crypto";
import type { BattleState, FormStage } from "./types.js";

export type BattleAction = "attack" | "skill" | "defend" | "evade" | "charge" | "evolve";

export function createBattle(heroName = "Heroína vinculada", alma = 100, stage: FormStage = "Lily"): BattleState {
  return {
    id: randomUUID(), turn: 0, alma: Math.max(0, Math.min(100, Math.floor(alma))), stage,
    player: { name: heroName, hp: 100, maxHp: 100, attack: 24, anima: 0 },
    enemy: { name: "Sabuesa contaminada", hp: 82, maxHp: 82, attack: 12, anima: 0 },
    status: "active", evolved: false,
    log: ["Una sabuesa contaminada bloquea el camino."]
  };
}

export function act(battle: BattleState, action: BattleAction): BattleState {
  if (battle.status !== "active") return battle;
  const b: BattleState = structuredClone(battle);
  b.turn += 1;
  let guard = 0;
  let evading = false;

  switch (action) {
    case "attack": {
      const damage = b.player.attack + randomInt(0, 9);
      b.enemy.hp = Math.max(0, b.enemy.hp - damage);
      b.player.anima = Math.min(100, b.player.anima + 12);
      b.log.push("Ataque: " + damage + " de daño; +12 Ánima.");
      break;
    }
    case "skill": {
      const damage = b.player.attack + 16 + randomInt(0, 8);
      b.enemy.hp = Math.max(0, b.enemy.hp - damage);
      b.player.hp = Math.min(b.player.maxHp, b.player.hp + 8);
      b.player.anima = Math.min(100, b.player.anima + 18);
      b.log.push("Habilidad: " + damage + " de daño, +8 HP y +18 Ánima.");
      break;
    }
    case "defend":
      guard = 8;
      b.player.anima = Math.min(100, b.player.anima + 8);
      b.log.push("Defensa preparada.");
      break;
    case "evade":
      evading = true;
      b.player.anima = Math.min(100, b.player.anima + 6);
      b.log.push("Evasión preparada.");
      break;
    case "charge":
      b.player.anima = Math.min(100, b.player.anima + 25);
      b.log.push("Carga: +25 Ánima.");
      break;
    case "evolve":
      if (b.evolved) {
        b.log.push("Ya evolucionaste en esta batalla.");
      } else if (b.stage === "Epic") {
        b.log.push("Esta heroína ya alcanzó la forma Epic.");
      } else if (b.player.anima < 60) {
        b.log.push("Necesitas 60 Ánima para activar la evolución.");
      } else if (b.alma < 25) {
        b.log.push("Necesitas 25 Alma del protagonista para evolucionar.");
      } else {
        b.evolved = true;
        b.stage = b.stage === "Lily" ? "Hero" : "Epic";
        b.player.name = b.player.name.replace(/ · (Lily|Hero|Epic)$/, "") + " · " + b.stage;
        b.player.anima -= 60;
        b.alma -= 25;
        b.player.attack += 10;
        b.player.maxHp += 15;
        b.player.hp = Math.min(b.player.maxHp, b.player.hp + 15);
        b.log.push("¡Evolución a " + b.stage + "! -60 Ánima, -25 Alma, +10 ATQ y +15 vida máxima.");
      }
      break;
  }

  if (b.enemy.hp <= 0) {
    b.status = "won";
    b.log.push("Victoria: la criatura fue derrotada.");
    return b;
  }

  const incoming = evading ? 0 : Math.max(1, b.enemy.attack + randomInt(0, 5) - guard);
  b.player.hp = Math.max(0, b.player.hp - incoming);
  b.log.push(incoming === 0 ? "Evasión perfecta." : "La criatura contraataca: " + incoming + " de daño.");
  if (b.player.hp <= 0) {
    b.status = "lost";
    b.log.push("Derrota: reagrúpate y vuelve a intentarlo.");
  }
  return b;
}
