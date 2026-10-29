import { randomInt, randomUUID } from "node:crypto";
import type { BattleState, EnemyIntent, FormBranch, FormStage } from "./types.js";

export type BattleAction = "attack" | "skill" | "defend" | "evade" | "charge" | "evolve-light" | "evolve-dark";
export type CombatRandom = (min: number, max: number) => number;

function nextIntent(turn: number): EnemyIntent {
  return turn > 0 && turn % 3 === 0 ? "heavy-attack" : "quick-attack";
}

function intentLabel(intent: EnemyIntent | undefined): string {
  if (intent === "heavy-attack") return "prepara un golpe cargado";
  if (intent === "guard") return "se protege";
  return "prepara un ataque rápido";
}

export function createBattle(heroName = "Heroína vinculada", alma = 100, stage: FormStage = "Lily", anima = 0, enemyName = "Sabuesa contaminada", enemyHp = 82, enemyAttack = 12, heroAttack = 24, heroMaxHp = 100, darkAvailable = true, branch: FormBranch = null): BattleState {
  return {
    id: randomUUID(), turn: 0, alma: Math.max(0, Math.min(100, Math.floor(alma))), stage, branch, darkAvailable,
    player: { name: heroName, hp: Math.max(1, heroMaxHp), maxHp: Math.max(1, heroMaxHp), attack: Math.max(1, heroAttack), anima: Math.max(0, Math.min(100, Math.floor(anima))) },
    enemy: { name: enemyName, hp: Math.max(1, enemyHp), maxHp: Math.max(1, enemyHp), attack: Math.max(1, enemyAttack), anima: 0, intent: "quick-attack" },
    status: "active", evolved: false,
    log: [enemyName + " bloquea el camino.", enemyName + " " + intentLabel("quick-attack") + "."]
  };
}

export function act(battle: BattleState, action: BattleAction, random: CombatRandom = randomInt): BattleState {
  if (battle.status !== "active") return battle;
  const b: BattleState = structuredClone(battle);
  b.turn += 1;
  let guard = 0;
  let evading = false;
  let interrupted = false;

  switch (action) {
    case "attack": {
      const damage = b.player.attack + random(0, 9);
      b.enemy.hp = Math.max(0, b.enemy.hp - damage);
      b.player.anima = Math.min(100, b.player.anima + 12);
      b.log.push("Ataque: " + damage + " de daño; +12 Ánima.");
      break;
    }
    case "skill": {
      if (b.player.anima < 20) {
        b.log.push("Necesitas 20 Ánima para usar la habilidad. Ataca o carga para reunir energía.");
        break;
      }
      b.player.anima -= 20;
      const damage = b.player.attack + 12 + random(0, 7);
      b.enemy.hp = Math.max(0, b.enemy.hp - damage);
      const healed = Math.min(5, b.player.maxHp - b.player.hp);
      b.player.hp += healed;
      b.player.anima = Math.min(100, b.player.anima + 4);
      b.log.push("Habilidad: " + damage + " de daño, +" + healed + " HP; coste neto 16 Ánima.");
      if (b.enemy.intent === "heavy-attack" && damage >= 30) {
        interrupted = true;
        b.log.push("¡Interrupción! La técnica rompe el golpe cargado.");
      }
      break;
    }
    case "defend":
      guard = b.enemy.intent === "heavy-attack" ? 18 : 8;
      b.player.anima = Math.min(100, b.player.anima + 8);
      b.log.push(b.enemy.intent === "heavy-attack" ? "Guardia firme: preparada para el golpe cargado." : "Defensa preparada.");
      break;
    case "evade":
      evading = b.enemy.intent !== "guard";
      b.player.anima = Math.min(100, b.player.anima + 6);
      b.log.push(evading ? "Evasión preparada contra el ataque anunciado." : "La enemiga se protege; la evasión no obtiene ventaja.");
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

  if (interrupted) {
    b.log.push("La enemiga queda expuesta; no puede atacar este turno.");
  } else if (b.enemy.intent === "guard") {
    b.log.push("La enemiga mantiene su guardia y reduce el daño recibido en su próximo turno.");
  } else {
    const heavy = b.enemy.intent === "heavy-attack";
    const incoming = evading ? 0 : Math.max(1, b.enemy.attack + (heavy ? 12 : random(0, 5)) - guard);
    b.player.hp = Math.max(0, b.player.hp - incoming);
    b.log.push(incoming === 0 ? "Evasión perfecta: evitaste el ataque anunciado." : (heavy ? "Golpe cargado" : "La criatura contraataca") + ": " + incoming + " de daño.");
  }

  if (b.player.hp <= 0) {
    b.status = "lost";
    b.log.push("Derrota: reagrúpate y vuelve a intentarlo.");
    return b;
  }

  b.enemy.intent = nextIntent(b.turn);
  b.log.push(b.enemy.name + " " + intentLabel(b.enemy.intent) + ".");
  return b;
}
