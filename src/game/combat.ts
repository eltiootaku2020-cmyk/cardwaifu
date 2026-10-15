import { randomInt, randomUUID } from "node:crypto";
import type { BattleState, FormBranch, FormStage } from "./types.js";

export type BattleAction = "attack" | "skill" | "defend" | "evade" | "charge" | "evolve-light" | "evolve-dark";

export function createBattle(heroName = "Heroína vinculada", alma = 100, stage: FormStage = "Lily", anima = 0, enemyName = "Sabuesa contaminada", enemyHp = 82, enemyAttack = 12, heroAttack = 24, heroMaxHp = 100, darkAvailable = true, branch: FormBranch = null): BattleState {
  return {
    id: randomUUID(), turn: 0, alma: Math.max(0, Math.min(100, Math.floor(alma))), stage, branch, darkAvailable,
    player: { name: heroName, hp: Math.max(1, heroMaxHp), maxHp: Math.max(1, heroMaxHp), attack: Math.max(1, heroAttack), anima: Math.max(0, Math.min(100, Math.floor(anima))) },
    enemy: { name: enemyName, hp: Math.max(1, enemyHp), maxHp: Math.max(1, enemyHp), attack: Math.max(1, enemyAttack), anima: 0 },
    status: "active", evolved: false,
    log: [enemyName + " bloquea el camino."]
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
    case "evolve-light":
    case "evolve-dark": {
      const selectedBranch = action === "evolve-dark" ? "Dark" : "Light";
      if (b.evolved) {
        b.log.push("Ya evolucionaste en esta batalla.");
      } else if (b.stage === "Epic") {
        b.log.push("Esta heroína ya alcanzó la forma Epic.");
      } else if (selectedBranch === "Dark" && !b.darkAvailable) {
        b.log.push("Esta heroína no puede manifestar la rama Dark.");
      } else if (b.branch && b.branch !== selectedBranch) {
        b.log.push("La epopeya ya está vinculada a la rama " + b.branch + ".");
      } else if (b.player.anima < 60) {
        b.log.push("Necesitas 60 Ánima para activar la evolución.");
      } else if (b.alma < 25) {
        b.log.push("Necesitas 25 Alma del protagonista para evolucionar.");
      } else {
        b.evolved = true;
        b.branch = selectedBranch;
        b.stage = b.stage === "Lily" ? "Hero" : "Epic";
        const baseName = b.player.name.replace(/ · (Lily|Hero|Epic)(?: (Light|Dark))?$/, "");
        b.player.name = baseName + " · " + b.stage + " " + selectedBranch;
        b.player.anima -= 60;
        b.alma -= 25;
        const attackBonus = selectedBranch === "Dark" ? 13 : 8;
        const hpBonus = selectedBranch === "Light" ? 20 : 10;
        b.player.attack += attackBonus;
        b.player.maxHp += hpBonus;
        b.player.hp = Math.min(b.player.maxHp, b.player.hp + hpBonus);
        b.log.push("¡Evolución a " + b.stage + " " + selectedBranch + "! -60 Ánima, -25 Alma, +" + attackBonus + " ATQ y +" + hpBonus + " vida máxima.");
      }
      break;
    }
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
