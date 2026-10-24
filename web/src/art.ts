type ArtEntry = { portrait?: string | null; card?: string | null };
type ArtManifest = {
  version?: number;
  characters?: Record<string, ArtEntry>;
  enemies?: Record<string, ArtEntry>;
  scenes?: Record<string, string | null>;
};
type StoredArt = { target: string; blob: Blob; updatedAt: number };

const ART_DB_NAME = "umbra-art-assets-v1";
const ART_STORE = "artworks";
const MAX_ART_BYTES = 8 * 1024 * 1024;
const validTarget = /^(character|enemy|scene):[a-z0-9-]+:(portrait|card|background)$/;
let manifest: ArtManifest = { version: 1, characters: {}, enemies: {}, scenes: {} };
const uploadedArtUrls = new Map<string, string>();

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

function openArtDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Este navegador no permite guardar arte local. Exporta la carta como PNG."));
      return;
    }
    const request = indexedDB.open(ART_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(ART_STORE)) database.createObjectStore(ART_STORE, { keyPath: "target" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("No se pudo abrir el almacén de arte local."));
  });
}

function setUploadedArt(target: string, blob: Blob): void {
  const previous = uploadedArtUrls.get(target);
  if (previous) URL.revokeObjectURL(previous);
  uploadedArtUrls.set(target, URL.createObjectURL(blob));
}

async function loadLocalArt(): Promise<void> {
  try {
    const database = await openArtDatabase();
    const transaction = database.transaction(ART_STORE, "readonly");
    const request = transaction.objectStore(ART_STORE).getAll() as IDBRequest<StoredArt[]>;
    const records = await new Promise<StoredArt[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(request.error ?? new Error("No se pudo leer el arte local."));
    });
    database.close();
    for (const record of records) {
      if (!validTarget.test(record.target) || !(record.blob instanceof Blob) || record.blob.size > MAX_ART_BYTES) continue;
      if (!/^image\/(png|webp|jpeg)$/i.test(record.blob.type)) continue;
      setUploadedArt(record.target, record.blob);
    }
  } catch {
    // El juego conserva los assets públicos y las siluetas de reserva si IndexedDB no está disponible.
  }
}

export async function saveLocalArt(target: string, blob: Blob): Promise<void> {
  if (!validTarget.test(target)) throw new Error("Selecciona un destino de arte válido.");
  if (!(blob instanceof Blob) || !/^image\/(png|webp|jpeg)$/i.test(blob.type)) {
    throw new Error("El arte debe ser una imagen PNG, WEBP o JPG.");
  }
  if (blob.size > MAX_ART_BYTES) throw new Error("La imagen optimizada supera el límite local de 8 MB.");
  const database = await openArtDatabase();
  try {
    const transaction = database.transaction(ART_STORE, "readwrite");
    transaction.objectStore(ART_STORE).put({ target, blob, updatedAt: Date.now() } satisfies StoredArt);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("No se pudo guardar el arte."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Se canceló el guardado del arte."));
    });
    setUploadedArt(target, blob);
  } finally {
    database.close();
  }
  window.dispatchEvent(new Event("umbra-art-updated"));
}

export function getCharacterPortrait(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return uploadedArtUrls.get(`character:${id.trim().toLowerCase()}:portrait`)
    ?? safeAssetPath(entryFor("characters", id)?.portrait);
}

export function getCharacterCardArt(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return uploadedArtUrls.get(`character:${id.trim().toLowerCase()}:card`)
    ?? safeAssetPath(entryFor("characters", id)?.card);
}

export function getEnemyPortrait(archetype: string | undefined): string | undefined {
  if (!archetype) return undefined;
  return uploadedArtUrls.get(`enemy:${archetype.trim().toLowerCase()}:portrait`)
    ?? safeAssetPath(entryFor("enemies", archetype)?.portrait);
}

export function getSceneBackground(biome: string | undefined): string | undefined {
  if (!biome) return undefined;
  const key = biome.trim().toLowerCase();
  return uploadedArtUrls.get(`scene:${key}:background`)
    ?? safeAssetPath(manifest.scenes?.[key]);
}

export async function loadArtManifest(): Promise<void> {
  try {
    const response = await fetch("/assets/umbra/manifest.json", { cache: "no-cache" });
    if (response.ok) {
      const candidate: unknown = await response.json();
      if (candidate && typeof candidate === "object") {
        const parsed = candidate as ArtManifest;
        if (parsed.version === 1) {
          manifest = {
            version: 1,
            characters: parsed.characters && typeof parsed.characters === "object" ? parsed.characters : {},
            enemies: parsed.enemies && typeof parsed.enemies === "object" ? parsed.enemies : {},
            scenes: parsed.scenes && typeof parsed.scenes === "object" ? parsed.scenes : {},
          };
        }
      }
    }
  } catch {
    // El juego conserva su aspecto de reserva si el manifiesto no está disponible.
  }
  await loadLocalArt();
}
