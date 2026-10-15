type CombatantSide = "player" | "enemy";

type HitSnapshot = {
  hp: number;
  maxHp: number;
};

export function installBattleVfx(root: HTMLElement): void {
  let battleId = "";
  let previous: Partial<Record<CombatantSide, HitSnapshot>> = {};

  const animateNumber = (panel: HTMLElement, side: CombatantSide, delta: number) => {
    const number = document.createElement("span");
    number.className = "combat-float " + (delta > 0 ? "heal-number" : side === "enemy" ? "enemy-damage" : "player-damage");
    number.textContent = delta > 0 ? "+" + delta : "−" + Math.abs(delta);
    number.setAttribute("aria-label", delta > 0 ? "Recupera " + delta + " puntos de vida" : "Recibe " + Math.abs(delta) + " de daño");
    panel.appendChild(number);
    number.addEventListener("animationend", () => number.remove(), { once: true });
  };

  const spawnImpact = (panel: HTMLElement, scene: HTMLElement, side: CombatantSide, damage: number) => {
    panel.classList.remove("taking-hit", "recovering");
    void panel.offsetWidth;
    panel.classList.add(damage < 0 ? "taking-hit" : "recovering");
    animateNumber(panel, side, damage);

    if (damage < 0) {
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
      previous = {};
      return;
    }

    const nextBattleId = scene.dataset.battleId ?? "";
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
      previous = current;
      return;
    }

    for (const panel of panels) {
      const side = panel.dataset.combatant as CombatantSide;
      const before = previous[side];
      const after = current[side];
      if (!before || !after || before.hp === after.hp) continue;
      spawnImpact(panel, scene, side, after.hp - before.hp);
    }
    previous = current;
  });

  observer.observe(root, { childList: true, subtree: true });
}
