type ArtEntry = { portrait?: string | null; card?: string | null };
type ArtManifest = {
  version?: number;
  characters?: Record<string, ArtEntry>;
  enemies?: Record<string, ArtEntry>;
  scenes?: Record<string, string | null>;
  protagonists?: Record<string, string | null>;
};
type StoredArt = { target: string; blob: Blob; updatedAt: number };

const ART_DB_NAME = "umbra-art-assets-v1";
const ART_STORE = "artworks";
const MAX_ART_BYTES = 8 * 1024 * 1024;
const validTarget = /^((character|enemy|scene):[a-z0-9-]+:(portrait|card|background)|protagonist:(mujer|hombre):portrait)$/;
let manifest: ArtManifest = { version: 1, characters: {}, enemies: {}, scenes: {}, protagonists: {} };
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

export interface LocalArtBackup {
  format: "umbra-linked-art";
  version: 1;
  exportedAt: string;
  items: Array<{ target: string; type: string; data: string; updatedAt: number }>;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("No se pudo preparar la copia del arte enlazado."));
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el arte local."));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(data: string): Blob {
  const match = data.match(/^data:(image\/(?:png|webp|jpeg));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new Error("La copia contiene una imagen con un formato no permitido.");
  let binary: string;
  try {
    binary = atob(match[2]!);
  } catch {
    throw new Error("La copia contiene datos de imagen dañados.");
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const blob = new Blob([bytes], { type: match[1]!.toLowerCase() });
  if (blob.size > MAX_ART_BYTES) throw new Error("Una imagen de la copia supera el límite local de 8 MB.");
  return blob;
}

export async function exportLocalArtBackup(): Promise<LocalArtBackup> {
  const database = await openArtDatabase();
  try {
    const transaction = database.transaction(ART_STORE, "readonly");
    const request = transaction.objectStore(ART_STORE).getAll() as IDBRequest<StoredArt[]>;
    const records = await new Promise<StoredArt[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(request.error ?? new Error("No se pudo leer el arte enlazado."));
    });
    const items: LocalArtBackup["items"] = [];
    for (const record of records) {
      if (!record || typeof record.target !== "string" || !validTarget.test(record.target)) continue;
      if (!(record.blob instanceof Blob) || record.blob.size > MAX_ART_BYTES) continue;
      if (!/^image\/(png|webp|jpeg)$/i.test(record.blob.type)) continue;
      items.push({
        target: record.target,
        type: record.blob.type.toLowerCase(),
        data: await blobToDataUrl(record.blob),
        updatedAt: Number.isFinite(record.updatedAt) ? record.updatedAt : 0
      });
    }
    return { format: "umbra-linked-art", version: 1, exportedAt: new Date().toISOString(), items };
  } finally {
    database.close();
  }
}

/** Restores a full backup of locally linked portraits/backgrounds, replacing the current local art set. */
export async function importLocalArtBackup(value: unknown): Promise<number> {
  if (!value || typeof value !== "object" || !("format" in value) || !("version" in value) || !("items" in value)) {
    throw new Error("El archivo no es una copia válida del arte enlazado de UMBRA.");
  }
  const backup = value as { format: unknown; version: unknown; items: unknown };
  if (backup.format !== "umbra-linked-art" || backup.version !== 1 || !Array.isArray(backup.items)) {
    throw new Error("La copia del arte enlazado no es compatible con esta versión.");
  }
  if (backup.items.length === 0 || backup.items.length > 100) {
    throw new Error("La copia debe contener entre 1 y 100 imágenes enlazadas.");
  }

  const records: StoredArt[] = [];
  const targets = new Set<string>();
  let encodedSize = 0;
  for (const item of backup.items) {
    if (!item || typeof item !== "object" || !("target" in item) || !("type" in item) || !("data" in item)) continue;
    const candidate = item as { target: unknown; type: unknown; data: unknown; updatedAt?: unknown };
    if (typeof candidate.target !== "string" || !validTarget.test(candidate.target)) {
      throw new Error("La copia contiene un destino de arte inválido.");
    }
    if (targets.has(candidate.target)) throw new Error("La copia contiene dos imágenes para el mismo destino.");
    if (typeof candidate.data !== "string") throw new Error("La copia contiene una imagen inválida.");
    encodedSize += candidate.data.length;
    if (encodedSize > 24 * 1024 * 1024) throw new Error("La copia de arte enlazado supera el límite de 24 MB.");
    const blob = dataUrlToBlob(candidate.data);
    if (typeof candidate.type !== "string" || candidate.type.toLowerCase() !== blob.type) {
      throw new Error("El tipo declarado no coincide con la imagen de la copia.");
    }
    targets.add(candidate.target);
    records.push({
      target: candidate.target,
      blob,
      updatedAt: typeof candidate.updatedAt === "number" && Number.isFinite(candidate.updatedAt) ? candidate.updatedAt : Date.now()
    });
  }
  if (records.length !== backup.items.length) throw new Error("La copia contiene elementos incompletos o inválidos.");

  const database = await openArtDatabase();
  try {
    const transaction = database.transaction(ART_STORE, "readwrite");
    const store = transaction.objectStore(ART_STORE);
    store.clear();
    records.forEach(record => store.put(record));
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("No se pudo restaurar el arte enlazado."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Se canceló la restauración del arte enlazado."));
    });
  } finally {
    database.close();
  }

  for (const url of uploadedArtUrls.values()) URL.revokeObjectURL(url);
  uploadedArtUrls.clear();
  records.forEach(record => setUploadedArt(record.target, record.blob));
  window.dispatchEvent(new Event("umbra-art-updated"));
  return records.length;
}


export function getProtagonistPortrait(gender: string | undefined): string | undefined {
  const key = gender?.trim().toLowerCase();
  if (key !== "mujer" && key !== "hombre") return undefined;
  return uploadedArtUrls.get(`protagonist:${key}:portrait`)
    ?? safeAssetPath(manifest.protagonists?.[key]);
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
            protagonists: parsed.protagonists && typeof parsed.protagonists === "object" ? parsed.protagonists : {},
          };
        }
      }
    }
  } catch {
    // El juego conserva su aspecto de reserva si el manifiesto no está disponible.
  }
  await loadLocalArt();
}
