type ArtEntry = { portrait?: string | null; card?: string | null };
type ArtManifest = {
  version?: number;
  characters?: Record<string, ArtEntry>;
  enemies?: Record<string, ArtEntry>;
  scenes?: Record<string, string | null>;
};

let manifest: ArtManifest = { version: 1, characters: {}, enemies: {}, scenes: {} };

function safeAssetPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/assets/umbra/")) return undefined;
  if (value.includes("..") || /[?#"'\\]/.test(value)) return undefined;
  if (!/\.(png|webp|jpe?g)$/i.test(value)) return undefined;
  return value;
}

function entryFor(group: "characters" | "enemies", key: string | undefined): ArtEntry | undefined {
  if (!key) return undefined;
  return manifest[group]?.[key.trim().toLowerCase()];
}

export function getCharacterPortrait(id: string | undefined): string | undefined {
  return safeAssetPath(entryFor("characters", id)?.portrait);
}

export function getCharacterCardArt(id: string | undefined): string | undefined {
  return safeAssetPath(entryFor("characters", id)?.card);
}

export function getEnemyPortrait(archetype: string | undefined): string | undefined {
  return safeAssetPath(entryFor("enemies", archetype)?.portrait);
}

export function getSceneBackground(biome: string | undefined): string | undefined {
  if (!biome) return undefined;
  return safeAssetPath(manifest.scenes?.[biome.trim().toLowerCase()]);
}

export async function loadArtManifest(): Promise<void> {
  try {
    const response = await fetch("/assets/umbra/manifest.json", { cache: "no-cache" });
    if (!response.ok) return;
    const candidate: unknown = await response.json();
    if (!candidate || typeof candidate !== "object") return;
    const parsed = candidate as ArtManifest;
    if (parsed.version !== 1) return;
    manifest = {
      version: 1,
      characters: parsed.characters && typeof parsed.characters === "object" ? parsed.characters : {},
      enemies: parsed.enemies && typeof parsed.enemies === "object" ? parsed.enemies : {},
      scenes: parsed.scenes && typeof parsed.scenes === "object" ? parsed.scenes : {},
    };
  } catch {
    // El juego conserva su aspecto de reserva si el manifiesto no está disponible.
  }
}
