import { act, createBattle, type BattleAction, type CombatRandom } from "./combat.js";
import type { BattleState } from "./types.js";

export type CombatSimulationStrategy = "balanced" | "attack-only";

export interface CombatSimulationOptions {
  /** Seed for repeatable pseudo-random sequences. */
  seed: number;
  /** Number of encounters, clamped to 1..10000. */
  iterations?: number;
  /** Active encounters beyond this turn limit are counted as timeouts, clamped to 1..100. */
  maxTurns?: number;
  strategy?: CombatSimulationStrategy;
  heroAttack?: number;
  heroMaxHp?: number;
  enemyHp?: number;
  enemyAttack?: number;
  startingAlma?: number;
  startingAnima?: number;
}

export interface CombatSimulationResult {
  seed: number;
  iterations: number;
  strategy: CombatSimulationStrategy;
  wins: number;
  losses: number;
  timeouts: number;
  winRate: number;
  averageTurns: number;
  averageDamageTaken: number;
  averageRemainingHp: number;
  actionCounts: Record<BattleAction, number>;
}

function clampInteger(value: number | undefined, fallback: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(value as number)));
}

/** Deterministic RNG for balance checks only; production combat keeps crypto.randomInt. */
function seededRandom(seed: number): CombatRandom {
  let state = seed >>> 0;
  return (min, max) => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max <= min) {
      throw new RangeError("El rango aleatorio del combate no es válido.");
    }
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return min + (state % (max - min));
  };
}

function chooseAction(battle: BattleState, strategy: CombatSimulationStrategy): BattleAction {
  if (strategy === "attack-only") return "attack";

  if (battle.enemy.intent === "heavy-attack") {
    if (battle.player.anima >= 20 && battle.player.attack + 12 >= 30) return "skill";
    return "defend";
  }

  if (!battle.evolved && battle.stage !== "Epic" && battle.player.anima >= 60 && battle.alma >= 25) {
    return "evolve-light";
  }

  if (battle.player.anima >= 20 && battle.player.hp <= battle.player.maxHp - 10) {
    return "skill";
  }

  if (battle.turn === 0 && battle.player.anima < 12 && battle.enemy.hp > battle.player.attack * 2) {
    return "charge";
  }

  if (battle.player.hp <= Math.max(12, Math.floor(battle.player.maxHp * 0.25))) {
    return "evade";
  }

  return "attack";
}

function average(value: number, count: number): number {
  return count === 0 ? 0 : Number((value / count).toFixed(2));
}

/**
 * Runs repeatable experiments without changing player-facing combat rules.
 * The balanced policy is a reference strategy for comparison, not final game AI.
 */
export function simulateCombat(options: CombatSimulationOptions): CombatSimulationResult {
  const iterations = clampInteger(options.iterations, 1000, 1, 10000);
  const maxTurns = clampInteger(options.maxTurns, 30, 1, 100);
  const strategy = options.strategy ?? "balanced";
  if (strategy !== "balanced" && strategy !== "attack-only") throw new Error("Estrategia de simulación desconocida.");

  const heroAttack = clampInteger(options.heroAttack, 24, 1, 9999);
  const heroMaxHp = clampInteger(options.heroMaxHp, 100, 1, 99999);
  const enemyHp = clampInteger(options.enemyHp, 120, 1, 99999);
  const enemyAttack = clampInteger(options.enemyAttack, 14, 1, 9999);
  const startingAlma = clampInteger(options.startingAlma, 100, 0, 100);
  const startingAnima = clampInteger(options.startingAnima, 0, 0, 100);
  const actionCounts: Record<BattleAction, number> = {
    attack: 0, skill: 0, defend: 0, evade: 0, charge: 0, "evolve-light": 0, "evolve-dark": 0
  };

  let wins = 0;
  let losses = 0;
  let timeouts = 0;
  let totalTurns = 0;
  let totalDamageTaken = 0;
  let totalRemainingHp = 0;

  for (let i = 0; i < iterations; i += 1) {
    const encounterSeed = ((options.seed >>> 0) + Math.imul(i + 1, 0x9e3779b1)) >>> 0;
    const random = seededRandom(encounterSeed);
    let battle = createBattle(
      "Portadora de prueba", startingAlma, "Lily", startingAnima,
      "Enemiga simulada", enemyHp, enemyAttack, heroAttack, heroMaxHp
    );

    while (battle.status === "active" && battle.turn < maxTurns) {
      const action = chooseAction(battle, strategy);
      actionCounts[action] += 1;
      const previousLogLength = battle.log.length;
      battle = act(battle, action, random);
      for (const line of battle.log.slice(previousLogLength)) {
        const damage = line.match(/(?:La criatura contraataca|Golpe cargado):\s*(\d+)\s+de daño/);
        if (damage) totalDamageTaken += Number(damage[1]);
      }
    }

    totalTurns += battle.turn;
    totalRemainingHp += battle.player.hp;
    if (battle.status === "won") wins += 1;
    else if (battle.status === "lost") losses += 1;
    else timeouts += 1;
  }

  return {
    seed: options.seed >>> 0, iterations, strategy, wins, losses, timeouts,
    winRate: average(wins, iterations),
    averageTurns: average(totalTurns, iterations),
    averageDamageTaken: average(totalDamageTaken, iterations),
    averageRemainingHp: average(totalRemainingHp, iterations),
    actionCounts
  };
}
