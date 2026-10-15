type CombatantSide = "player" | "enemy";

type HitSnapshot = {
  hp: number;
  maxHp: number;
};

function lastNumber(lines: string[], pattern: RegExp): number | null {
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const match = lines[i]?.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

export function installBattleVfx(root: HTMLElement): void {
  let battleId = "";
  let previousTurn = -1;
  let previous: Partial<Record<CombatantSide, HitSnapshot>> = {};

  const animateNumber = (panel: HTMLElement, side: CombatantSide, delta: number, offset = 0) => {
    const number = document.createElement("span");
    number.className = "combat-float " + (delta > 0 ? "heal-number" : side === "enemy" ? "enemy-damage" : "player-damage");
    number.textContent = delta > 0 ? "+" + delta : "−" + Math.abs(delta);
    number.style.setProperty("--number-shift", String(offset) + "px");
    number.setAttribute("aria-label", delta > 0 ? "Recupera " + delta + " puntos de vida" : "Recibe " + Math.abs(delta) + " de daño");
    panel.appendChild(number);
    number.addEventListener("animationend", () => number.remove(), { once: true });
  };

  const spawnImpact = (panel: HTMLElement, scene: HTMLElement, side: CombatantSide, delta: number, offset = 0) => {
    panel.classList.remove("taking-hit", "recovering");
    void panel.offsetWidth;
    panel.classList.add(delta < 0 ? "taking-hit" : "recovering");
    animateNumber(panel, side, delta, offset);

    if (delta < 0) {
      scene.classList.remove("camera-impact");
      void scene.offsetWidth;
      scene.classList.add("camera-impact");
      window.setTimeout(() => scene.classList.remove("camera-impact"), 460);

      const burst = document.createElement("span");
      burst.className = "impact-burst " + (side === "enemy" ? "burst-heroic" : "burst-enemy");
      burst.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 7; i += 1) {
        const particle = document.createElement("i");
        particle.style.setProperty("--particle-angle", String(i * (360 / 7)) + "deg");
        particle.style.setProperty("--particle-delay", String(i * 14) + "ms");
        burst.appendChild(particle);
      }
      panel.appendChild(burst);
      burst.addEventListener("animationend", () => burst.remove(), { once: true });
    }
  };

  const observer = new MutationObserver(() => {
    const scene = root.querySelector<HTMLElement>(".battle-scene");
    if (!scene) {
      battleId = "";
      previousTurn = -1;
      previous = {};
      return;
    }

    const nextBattleId = scene.dataset.battleId ?? "";
    const currentTurn = Number(scene.dataset.turn ?? 0);
    const panels = Array.from(scene.querySelectorAll<HTMLElement>("[data-combatant]"));
    const current: Partial<Record<CombatantSide, HitSnapshot>> = {};
    for (const panel of panels) {
      const side = panel.dataset.combatant as CombatantSide;
      if (side !== "player" && side !== "enemy") continue;
      const hp = Number(panel.dataset.hp);
      const maxHp = Number(panel.dataset.maxHp);
      if (Number.isFinite(hp) && Number.isFinite(maxHp)) current[side] = { hp, maxHp };
    }

    if (nextBattleId !== battleId) {
      battleId = nextBattleId;
      previousTurn = currentTurn;
      previous = current;
      return;
    }

    if (currentTurn === previousTurn) return;

    const recentLines = Array.from(scene.querySelectorAll<HTMLElement>(".log p"))
      .map(line => line.textContent ?? "")
      .slice(-2);
    const action = scene.dataset.action ?? "";
    const outgoingDamage = lastNumber(recentLines, /(?:Ataque|Habilidad):\s*(\d+)\s+de daño/);
    const incomingDamage = lastNumber(recentLines, /La criatura contraataca:\s*(\d+)\s+de daño/);
    const skillHeal = action === "skill" ? lastNumber(recentLines, /Habilidad:.*\+(\d+)\s+HP/) : null;

    for (const panel of panels) {
      const side = panel.dataset.combatant as CombatantSide;
      if (side !== "player" && side !== "enemy") continue;
      const before = previous[side];
      const after = current[side];
      if (!before || !after) continue;
      const hpDelta = after.hp - before.hp;

      if (side === "enemy" && hpDelta < 0) {
        spawnImpact(panel, scene, side, -(outgoingDamage ?? Math.abs(hpDelta)));
      } else if (side === "player") {
        const actualHeal = skillHeal === null
          ? 0
          : Math.max(0, Math.min(skillHeal, hpDelta + (incomingDamage ?? 0)));

        if (incomingDamage !== null) {
          spawnImpact(panel, scene, side, -incomingDamage, actualHeal > 0 ? -22 : 0);
          if (actualHeal > 0) animateNumber(panel, side, actualHeal, 24);
        } else if (hpDelta < 0) {
          spawnImpact(panel, scene, side, hpDelta);
        } else if (actualHeal > 0) {
          spawnImpact(panel, scene, side, actualHeal);
        } else if (hpDelta > 0) {
          spawnImpact(panel, scene, side, hpDelta);
        }
      }
    }

    previous = current;
    previousTurn = currentTurn;
  });

  observer.observe(root, { childList: true, subtree: true });
}
