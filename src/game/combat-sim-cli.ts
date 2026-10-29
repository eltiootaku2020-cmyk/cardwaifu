import { simulateCombat, type CombatSimulationStrategy } from "./combat-sim.js";

function readOption(name: string, fallback: number): number {
  const item = process.argv.slice(2).find(value => value.startsWith("--" + name + "="));
  if (!item) return fallback;
  const value = Number(item.slice(name.length + 3));
  if (!Number.isFinite(value)) throw new Error("El parámetro --" + name + " debe ser numérico.");
  return value;
}

const strategyValue = process.argv.slice(2).find(value => value.startsWith("--strategy="))?.slice("--strategy=".length);
const strategy: CombatSimulationStrategy = strategyValue === "attack-only" ? "attack-only" : "balanced";

try {
  const result = simulateCombat({
    seed: readOption("seed", 20261029),
    iterations: readOption("iterations", 1000),
    maxTurns: readOption("max-turns", 30),
    enemyHp: readOption("enemy-hp", 120),
    enemyAttack: readOption("enemy-attack", 14),
    heroAttack: readOption("hero-attack", 24),
    heroMaxHp: readOption("hero-hp", 100),
    strategy
  });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "No se pudo ejecutar la simulación.");
  process.exitCode = 1;
}
