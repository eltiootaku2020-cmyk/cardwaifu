import { saveLocalArt, exportLocalArtBackup, importLocalArtBackup } from "./art.js";

export function openCardStudio(): void {
  if (document.querySelector("#umbra-card-studio")) return;
  const overlay = document.createElement("div");
  overlay.id = "umbra-card-studio";
  overlay.className = "studio-overlay";
  overlay.innerHTML = `
    <section class="studio-window" role="dialog" aria-modal="true" aria-label="Taller de cartas">
      <header class="studio-header">
        <div><p class="eyebrow">UMBRA · FORJA VISUAL</p><h2>Taller de cartas</h2><p class="muted">Carga arte original, ajusta la composición y exporta cartas PNG.</p></div>
        <button type="button" class="studio-close" aria-label="Cerrar">✕</button>
      </header>
      <div class="studio-layout">
        <div class="studio-fields">
          <label>Arte (PNG transparente recomendado)<input id="studio-art-file" type="file" accept="image/png,image/webp,image/jpeg"></label>
          <p class="muted studio-note">La composición ocurre en este navegador. Las imágenes no se envían al servidor.</p>
          <label>Nombre<input id="studio-art-name" maxlength="28" value="MOB · Guardián abisal"></label>
          <label>Tipo<select id="studio-art-kind"><option>Monstruo</option><option>Personaje</option><option>Arma</option><option>Equipamiento</option><option>Corazón heroico</option></select></label>
          <label>Rareza<select id="studio-art-rarity"><option>R</option><option>S</option><option selected>SR</option><option>SSR</option><option>UR</option></select></label>
          <label>Elemento<select id="studio-art-element"><option>Vacío</option><option>Fuego</option><option>Hielo</option><option>Rayo</option><option>Oscuridad</option><option>Naturaleza</option><option>Luz</option><option>Arcano</option></select></label>
          <div class="studio-stat-row"><label>Ataque<input id="studio-art-atk" type="number" min="0" max="9999" value="28"></label><label>Vida / poder<input id="studio-art-hp" type="number" min="0" max="9999" value="120"></label></div>
          <label>Escala del arte<input id="studio-art-scale" type="range" min="55" max="135" value="100"></label>
          <label>Marco original<select id="studio-art-frame"><option value="arcane">Arcana · violeta</option><option value="flame">Llama · carmesí</option><option value="frost">Escarcha · azul</option><option value="nature">Raíz · verde</option><option value="gold">Reliquia · dorada</option></select></label>
          <label>Vincular al juego (opcional)
            <select id="studio-art-target">
              <option value="">Solo guardar la carta</option>
              <optgroup label="Retratos de portadoras">
                <option value="character:tiny:portrait">Pivy · exploradora goblin</option>
                <option value="character:elizabeth:portrait">Elizabeth</option>
                <option value="character:artoria:portrait">Artoria</option>
                <option value="character:juana:portrait">Juana de Arco</option>
                <option value="character:cleopatra:portrait">Cleopatra</option>
                <option value="character:musashi:portrait">Musashi</option>
                <option value="character:heracles:portrait">Heracles</option>
                <option value="character:robin-hood:portrait">Robin Hood</option>
                <option value="character:guardiana-bretana:portrait">Guardiana de Bretaña</option>
                <option value="character:cazadora-musgo:portrait">Cazadora del Musgo</option>
              </optgroup>
              <optgroup label="Retratos de enemigas">
                <option value="enemy:goblin:portrait">Enemiga goblin</option>
                <option value="enemy:miasma:portrait">Enemiga de miasma</option>
                <option value="enemy:beast:portrait">Enemiga bestial</option>
                <option value="enemy:boss:portrait">Jefa</option>
                <option value="enemy:forest:portrait">Enemiga del bosque</option>
              </optgroup>
              <optgroup label="Fondos de bioma">
                <option value="scene:village:background">Aldea</option>
                <option value="scene:path:background">Sendero</option>
                <option value="scene:landmark:background">Puesto o lugar emblemático</option>
                <option value="scene:camp:background">Manantial o campamento</option>
                <option value="scene:ruin:background">Ruinas</option>
                <option value="scene:dungeon:background">Mazmorra</option>
              </optgroup>
            </select>
          </label>
          <button type="button" class="secondary" id="studio-art-link">↗ Vincular PNG al juego</button>
          <p class="muted studio-note">La vinculación se guarda solo en este navegador. El arte no se sube a internet. Para incluirlo en una versión desplegada en otros dispositivos, usa los assets públicos y el manifiesto.</p>
          <label>Prompt para generar la imagen<textarea id="studio-art-prompt" rows="5" placeholder="1 girl, tall girl, brown hair, bronze clothes, Hercules"></textarea></label>
          <div class="studio-buttons"><button type="button" class="secondary" id="studio-art-prompt-refresh">↻ Generar prompt</button><button type="button" class="secondary" id="studio-art-prompt-copy">Copiar prompt</button></div>
          <p class="muted studio-note">Prompt corto en inglés, separado por comas. Todo lo que represente un ser será una waifu; las armas son la única excepción. Sin etiquetas de calidad ni relleno.</p>
          <div class="studio-buttons"><button type="button" class="primary" id="studio-art-save">＋ Guardar carta</button><button type="button" class="secondary" id="studio-art-export">↓ Exportar PNG</button></div>
          <div class="studio-buttons"><button type="button" class="secondary" id="studio-art-backup">↓ Exportar copia de galería</button><button type="button" class="secondary" id="studio-art-import-trigger">↑ Restaurar galería</button></div>
          <input id="studio-art-import-file" type="file" accept=".json,application/json" hidden>
          <div class="studio-buttons"><button type="button" class="secondary" id="studio-linked-art-backup">↓ Copia de PNG enlazados</button><button type="button" class="secondary" id="studio-linked-art-import-trigger">↑ Restaurar PNG enlazados</button></div>
          <input id="studio-linked-art-import-file" type="file" accept=".json,application/json" hidden>
          <p class="muted studio-note">La galería y el arte enlazado al juego usan copias independientes. La galería incluye las cartas compuestas y sus prompts; la copia de arte enlazado incluye los retratos y fondos guardados en este navegador. Ninguna copia sustituye tus PNG originales y nada se sube a internet.</p>
          <p class="muted studio-note">El editor crea marcos propios por código. Para que el personaje quede bien integrado, usa PNG con canal alfa y ajusta la escala.</p>
        </div>
        <div class="studio-result"><canvas id="studio-art-canvas" width="600" height="900" aria-label="Vista previa de carta"></canvas><div class="studio-gallery-head"><strong>Galería local</strong><span id="studio-art-count">0 cartas</span></div><div id="studio-art-gallery" class="studio-gallery"></div></div>
      </div>
    </section>`;
  document.body.append(overlay);

  const get = <T extends HTMLElement>(id: string): T => {
    const element = overlay.querySelector<T>("#" + id);
    if (!element) throw new Error("Falta el control " + id);
    return element;
  };
  const canvas = get<HTMLCanvasElement>("studio-art-canvas");
  const context = canvas.getContext("2d");
  if (!context) { overlay.remove(); return; }
  const ctx = context as CanvasRenderingContext2D;
  let art: HTMLImageElement | null = null;
  let objectUrl = "";
  type GalleryCard = { name: string; data: string; prompt: string };
  type StoredGalleryCard = { id: number; name: string; blob: Blob; prompt: string; order: number };
  const gallery: GalleryCard[] = [];
  const galleryStorageKey = "umbra-card-studio-gallery-v1";
  const galleryDbName = "umbra-card-gallery-v1";
  const galleryStoreName = "cards";
  const galleryLimit = 12;
  const maxBackupBytes = 24 * 1024 * 1024;

  function openGalleryDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("Este navegador no permite almacenamiento local de la galería."));
        return;
      }
      const request = indexedDB.open(galleryDbName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(galleryStoreName)) {
          request.result.createObjectStore(galleryStoreName, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("No se pudo abrir la galería local."));
    });
  }

  function dataUrlToBlob(value: string): Blob {
    const match = value.match(/^data:(image\/png);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw new Error("Una carta de la galería no contiene un PNG válido.");
    const binary = atob(match[2]!);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: match[1] });
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("No se pudo leer el PNG guardado."));
      reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el PNG guardado."));
      reader.readAsDataURL(blob);
    });
  }

  async function loadGallery(): Promise<void> {
    try {
      const database = await openGalleryDatabase();
      let records: StoredGalleryCard[] = [];
      try {
        const transaction = database.transaction(galleryStoreName, "readonly");
        const request = transaction.objectStore(galleryStoreName).getAll() as IDBRequest<StoredGalleryCard[]>;
        records = await new Promise<StoredGalleryCard[]>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result ?? []);
          request.onerror = () => reject(request.error ?? new Error("No se pudo leer la galería local."));
        });
      } finally {
        database.close();
      }
      if (records.length > 0) {
        const sorted = records
          .filter(record => record && typeof record.name === "string" && record.blob instanceof Blob &&
            record.blob.type === "image/png" && typeof record.prompt === "string" && Number.isFinite(record.order))
          .sort((left, right) => left.order - right.order)
          .slice(0, galleryLimit);
        for (const record of sorted) {
          gallery.push({ name: record.name.slice(0, 100), data: await blobToDataUrl(record.blob), prompt: record.prompt.slice(0, 4000) });
        }
        return;
      }
    } catch {
      // La migración desde localStorage y la exportación manual siguen disponibles como alternativa.
    }

    // Migrate cards made by older versions from localStorage to IndexedDB.
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(galleryStorageKey) ?? "[]");
      if (Array.isArray(stored)) {
        stored.slice(0, galleryLimit).forEach((item: unknown) => {
          if (item && typeof item === "object" && "name" in item && "data" in item && "prompt" in item &&
            typeof item.name === "string" && typeof item.data === "string" &&
            /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(item.data) && typeof item.prompt === "string") {
            gallery.push({ name: item.name.slice(0, 100), data: item.data, prompt: item.prompt.slice(0, 4000) });
          }
        });
      }
    } catch { /* The workshop remains usable even if old browser storage is damaged. */ }
    if (gallery.length > 0) await persistGallery();
  }

  async function persistGallery(): Promise<boolean> {
    try {
      const database = await openGalleryDatabase();
      try {
        const transaction = database.transaction(galleryStoreName, "readwrite");
        const store = transaction.objectStore(galleryStoreName);
        store.clear();
        gallery.forEach((card, order) => {
          store.put({
            id: order,
            name: card.name.slice(0, 100),
            blob: dataUrlToBlob(card.data),
            prompt: card.prompt.slice(0, 4000),
            order
          } satisfies StoredGalleryCard);
        });
        await new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error ?? new Error("No se pudo guardar la galería local."));
          transaction.onabort = () => reject(transaction.error ?? new Error("Se canceló el guardado de la galería."));
        });
      } finally {
        database.close();
      }
      try { localStorage.removeItem(galleryStorageKey); } catch { /* Old browser storage may be read-only. */ }
      return true;
    } catch {
      try {
        localStorage.setItem(galleryStorageKey, JSON.stringify(gallery));
        return true;
      } catch {
        window.alert("No se pudo guardar automáticamente la galería. Exporta una copia JSON desde el taller antes de cerrar.");
        return false;
      }
    }
  }
  const themes: Record<string, [string, string, string]> = {
    arcane: ["#161c45", "#7f4ed0", "#b58cff"],
    flame: ["#35152c", "#c63d52", "#ffad71"],
    frost: ["#102d4a", "#238da9", "#9cecff"],
    nature: ["#112f2b", "#3d966b", "#c7f58a"],
    gold: ["#3c2b17", "#bb8b38", "#ffe3a0"],
  };

  function draw(): void {
    const [dark, mid, accent] = themes[get<HTMLSelectElement>("studio-art-frame").value] ?? themes.arcane;
    ctx.clearRect(0, 0, 600, 900);
    const bg = ctx.createLinearGradient(0, 0, 600, 900);
    bg.addColorStop(0, mid); bg.addColorStop(0.55, dark); bg.addColorStop(1, "#090d18");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 900);
    ctx.strokeStyle = accent + "66"; ctx.lineWidth = 2;
    for (let radius = 95; radius < 420; radius += 55) {
      ctx.beginPath(); ctx.arc(300, 385, radius, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = "#080b18aa"; ctx.fillRect(22, 22, 556, 856);
    ctx.strokeStyle = accent; ctx.lineWidth = 7; ctx.strokeRect(16, 16, 568, 868);
    ctx.strokeStyle = accent + "aa"; ctx.lineWidth = 2; ctx.strokeRect(31, 31, 538, 838);
    if (art) {
      const maxW = 500, maxH = 610, scale = Number(get<HTMLInputElement>("studio-art-scale").value) / 100;
      const factor = Math.min(maxW / art.naturalWidth, maxH / art.naturalHeight) * scale;
      const width = art.naturalWidth * factor, height = art.naturalHeight * factor;
      ctx.save(); ctx.shadowColor = accent + "99"; ctx.shadowBlur = 24;
      ctx.drawImage(art, (600 - width) / 2, 385 - height / 2, width, height); ctx.restore();
    } else {
      ctx.fillStyle = "#ffffff18"; ctx.beginPath(); ctx.arc(300, 370, 130, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = accent; ctx.font = "bold 100px system-ui"; ctx.textAlign = "center"; ctx.fillText("✦", 300, 405);
      ctx.fillStyle = "#d8def3"; ctx.font = "20px system-ui"; ctx.fillText("SUBE TU ARTE PNG", 300, 535);
    }
    ctx.fillStyle = accent; ctx.fillRect(36, 42, 110, 42);
    ctx.fillStyle = "#0b1020"; ctx.font = "bold 24px system-ui"; ctx.textAlign = "center";
    ctx.fillText(get<HTMLSelectElement>("studio-art-rarity").value, 91, 71);
    ctx.fillStyle = "#eaf0ff"; ctx.font = "bold 36px system-ui"; ctx.textAlign = "left";
    ctx.fillText((get<HTMLInputElement>("studio-art-name").value || "Carta sin nombre").slice(0, 25), 42, 710, 510);
    ctx.fillStyle = accent; ctx.font = "bold 18px system-ui";
    ctx.fillText((get<HTMLSelectElement>("studio-art-kind").value + " · " + get<HTMLSelectElement>("studio-art-element").value).toUpperCase(), 44, 749, 500);
    ctx.strokeStyle = accent + "99"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(42, 775); ctx.lineTo(558, 775); ctx.stroke();
    ctx.fillStyle = "#dce5ff"; ctx.font = "bold 22px system-ui"; ctx.fillText("ATQ  " + Math.max(0, Number(get<HTMLInputElement>("studio-art-atk").value) || 0), 44, 819);
    ctx.textAlign = "right"; ctx.fillText("HP  " + Math.max(0, Number(get<HTMLInputElement>("studio-art-hp").value) || 0), 556, 819);
    ctx.fillStyle = accent; ctx.font = "bold 14px system-ui"; ctx.textAlign = "center"; ctx.fillText("UMBRA  //  CARD FRONTIER", 300, 855);
  }
  function safeFilename(value: string): string {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "umbra-carta";
  }
  function exportPng(data = canvas.toDataURL("image/png"), name = get<HTMLInputElement>("studio-art-name").value): void {
    const link = document.createElement("a"); link.download = safeFilename(name) + ".png"; link.href = data; link.click();
  }
  function renderGallery(): void {
    const galleryRoot = get<HTMLDivElement>("studio-art-gallery"); galleryRoot.replaceChildren();
    gallery.forEach((item, index) => {
      const card = document.createElement("article"); card.className = "studio-thumb";
      const image = document.createElement("img"); image.src = item.data; image.alt = item.name;
      const title = document.createElement("p"); title.textContent = item.name;
      const prompt = document.createElement("p"); prompt.className = "muted studio-note"; prompt.textContent = item.prompt; prompt.style.overflowWrap = "anywhere";
      const copyPrompt = document.createElement("button"); copyPrompt.className = "secondary"; copyPrompt.textContent = "Copiar prompt";
      copyPrompt.onclick = () => copyText(gallery[index].prompt);
      const actions = document.createElement("div"); actions.className = "studio-buttons";
      const button = document.createElement("button"); button.className = "secondary"; button.textContent = "Exportar PNG";
      button.onclick = () => exportPng(gallery[index].data, gallery[index].name);
      const remove = document.createElement("button"); remove.className = "secondary"; remove.textContent = "Eliminar";
      remove.onclick = () => { gallery.splice(index, 1); persistGallery(); renderGallery(); };
      actions.append(button, remove);
      card.append(image, title, prompt, copyPrompt, actions); galleryRoot.append(card);
    });
    get<HTMLSpanElement>("studio-art-count").textContent = gallery.length + (gallery.length === 1 ? " carta" : " cartas");
  }

  let promptEdited = false;
  function makePrompt(): string {
    const name = get<HTMLInputElement>("studio-art-name").value.trim();
    const kind = get<HTMLSelectElement>("studio-art-kind").value;
    const element = get<HTMLSelectElement>("studio-art-element").value;
    const frame = get<HTMLSelectElement>("studio-art-frame").value;
    const elementTags: Record<string, string[]> = {
      Fuego: ["red clothes", "orange eyes"], Hielo: ["blue clothes", "blue eyes"],
      Rayo: ["purple clothes", "yellow eyes"], Oscuridad: ["black clothes", "red eyes"],
      Naturaleza: ["green clothes", "green eyes"], Luz: ["white clothes", "golden eyes"],
      Arcano: ["purple clothes", "violet eyes"],
    };
    const knownCharacters: Record<string, string[]> = {
      "hercules": ["1 girl", "tall girl", "sixpack", "big smile", "brown hair", "brown eyes", "Olympus clothes", "bronze clothes"],
      "hércules": ["1 girl", "tall girl", "sixpack", "big smile", "brown hair", "brown eyes", "Olympus clothes", "bronze clothes"],
      "arturo": ["1 girl", "tall girl", "long blonde hair", "blue eyes", "calm smile", "blue and silver armor", "red cape"],
      "rey arturo": ["1 girl", "tall girl", "long blonde hair", "blue eyes", "calm smile", "blue and silver armor", "red cape"],
      "juana de arco": ["1 girl", "medium height", "short blonde hair", "brown eyes", "gentle smile", "white armor", "blue and gold clothes", "banner"],
      "cleopatra": ["1 girl", "tall girl", "long black hair", "gold eyes", "confident smile", "Egyptian royal clothes", "gold jewelry", "blue and gold dress"],
      "miyamoto musashi": ["1 girl", "athletic girl", "long dark blue hair", "blue eyes", "confident smile", "red and navy kimono", "two katanas"],
      "musashi": ["1 girl", "athletic girl", "long dark blue hair", "blue eyes", "confident smile", "red and navy kimono", "two katanas"],
      "robin hood": ["1 girl", "slim girl", "long green hair", "green eyes", "playful smile", "green hood", "brown leather clothes", "bow and quiver"],
    };
    const known = kind === "Personaje" ? knownCharacters[name.toLowerCase()] : undefined;
    let tags: string[];
    if (known) tags = [...known];
    else if (kind === "Arma") tags = ["1 weapon", "full object", "distinctive shape", "fantasy design"];
    else if (kind === "Monstruo") tags = ["1 monster girl", "full body", "feminine face", "distinctive monster features", "fantasy outfit"];
    else if (kind === "Personaje") tags = ["1 girl", "full body", "feminine face", "distinctive hairstyle", "fantasy clothes"];
    else if (kind === "Equipamiento") tags = ["1 girl", "full body", "wearing fantasy armor", "distinctive outfit", "fantasy setting"];
    else tags = ["1 girl", "full body", "heroic fantasy outfit", "expressive pose", "mythology-inspired scene"];
    if (kind !== "Arma" && elementTags[element] && !known) tags.push(...elementTags[element]);
    if (kind === "Monstruo") {
      const lower = name.toLowerCase();
      if (lower.includes("goblin")) tags.splice(3, 1, "goblin ears", "sharp teeth", "green skin");
      else if (lower.includes("perro") || lower.includes("hound")) tags.splice(3, 1, "wolf ears", "tail", "sharp claws");
      else if (lower.includes("drag")) tags.splice(3, 1, "dragon horns", "scales", "long tail");
      else if (lower.includes("araña") || lower.includes("spider")) tags.splice(3, 1, "spider legs", "silk details", "red eyes");
      else if (lower.includes("espectro") || lower.includes("ghost")) tags.splice(3, 1, "ghostly hair", "floating body", "glowing eyes");
      else if (lower.includes("slime") || lower.includes("gelatina")) tags.splice(3, 1, "translucent slime hair", "glossy skin", "liquid ribbons");
      else if (lower.includes("arpía") || lower.includes("harpy")) tags.splice(3, 1, "feathered wings", "bird talons", "feathered ears");
      else if (lower.includes("vampira") || lower.includes("vampire")) tags.splice(3, 1, "long fangs", "pale skin", "bat wings");
      else if (lower.includes("súcubo") || lower.includes("succubus")) tags.splice(3, 1, "curved horns", "demon tail", "bat wings");
      else if (lower.includes("gólem") || lower.includes("golem")) tags.splice(3, 1, "stone skin", "crystal joints", "glowing cracks");
      else if (lower.includes("lobo") || lower.includes("wolf")) tags.splice(3, 1, "wolf ears", "fluffy tail", "sharp claws");
      else if (lower.includes("serpiente") || lower.includes("snake")) tags.splice(3, 1, "snake tail", "scale patterns", "forked tongue");
      else if (lower.includes("sirena") || lower.includes("mermaid")) tags.splice(3, 1, "fish tail", "fin ears", "pearl ornaments");
      else if (lower.includes("esqueleto") || lower.includes("skeleton")) tags.splice(3, 1, "bone horns", "glowing eye sockets", "rib armor");
      else if (lower.includes("murciélago") || lower.includes("bat girl")) tags.splice(3, 1, "bat ears", "leathery wings", "small fangs");
      else if (lower.includes("mimic")) tags.splice(3, 1, "living treasure chest shell", "sharp teeth", "long tongue");
    }
    if (frame === "gold" && (kind === "Arma" || kind === "Equipamiento")) tags.push("gold details");
    if (name) tags.push(name);
    return [...new Set(tags)].join(", ");
  }
  function refreshPrompt(force = false): void {
    if (promptEdited && !force) return;
    get<HTMLTextAreaElement>("studio-art-prompt").value = makePrompt();
    promptEdited = false;
  }
  async function copyText(value: string): Promise<void> {
    const field = get<HTMLTextAreaElement>("studio-art-prompt");
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else { field.value = value; field.focus(); field.select(); if (!document.execCommand("copy")) throw new Error("copy failed"); }
    } catch { field.value = value; field.focus(); field.select(); window.alert("No se pudo copiar automáticamente. El prompt quedó seleccionado para copiarlo manualmente."); }
  }
  get<HTMLTextAreaElement>("studio-art-prompt").addEventListener("input", () => { promptEdited = true; });
  get<HTMLButtonElement>("studio-art-prompt-refresh").onclick = () => refreshPrompt(true);
  get<HTMLButtonElement>("studio-art-prompt-copy").onclick = () => { void copyText(get<HTMLTextAreaElement>("studio-art-prompt").value); };
  ["studio-art-name", "studio-art-kind", "studio-art-element", "studio-art-frame"].forEach(id => {
    get<HTMLElement>(id).addEventListener("input", () => refreshPrompt());
  });
  ["studio-art-name", "studio-art-kind", "studio-art-rarity", "studio-art-element", "studio-art-atk", "studio-art-hp", "studio-art-scale", "studio-art-frame"].forEach(id => {
    get<HTMLElement>(id).addEventListener("input", draw);
  });
  refreshPrompt(true);
  get<HTMLInputElement>("studio-art-file").onchange = event => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { art = image; draw(); };
    image.onerror = () => window.alert("No se pudo leer la imagen. Prueba con PNG, WEBP o JPG.");
    image.src = objectUrl;
  };
  get<HTMLButtonElement>("studio-art-link").onclick = async () => {
    const target = get<HTMLSelectElement>("studio-art-target").value;
    if (!target) {
      window.alert("Elige una portadora, una enemiga o un fondo en «Vincular al juego».");
      return;
    }
    if (!art) {
      window.alert("Primero carga un PNG, WEBP o JPG.");
      return;
    }
    const maxSide = 1024;
    const scale = Math.min(1, maxSide / Math.max(art.naturalWidth, art.naturalHeight));
    const width = Math.max(1, Math.round(art.naturalWidth * scale));
    const height = Math.max(1, Math.round(art.naturalHeight * scale));
    const optimized = document.createElement("canvas");
    optimized.width = width;
    optimized.height = height;
    const optimizedContext = optimized.getContext("2d", { alpha: true });
    if (!optimizedContext) {
      window.alert("No se pudo preparar la imagen en este navegador.");
      return;
    }
    optimizedContext.clearRect(0, 0, width, height);
    optimizedContext.drawImage(art, 0, 0, width, height);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        optimized.toBlob(result => result ? resolve(result) : reject(new Error("No se pudo optimizar la imagen.")), "image/png");
      });
      await saveLocalArt(target, blob);
      window.alert("Arte vinculado. Se usará en la interfaz cuando corresponda. El PNG optimizado se guarda en este navegador.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo guardar el arte local.");
    }
  };
  get<HTMLButtonElement>("studio-art-export").onclick = () => { draw(); exportPng(); };
  get<HTMLButtonElement>("studio-art-save").onclick = async () => {
    await galleryLoadPromise;
    draw();
    gallery.unshift({
      name: get<HTMLInputElement>("studio-art-name").value || "Carta sin nombre",
      data: canvas.toDataURL("image/png"),
      prompt: get<HTMLTextAreaElement>("studio-art-prompt").value
    });
    if (gallery.length > galleryLimit) gallery.length = galleryLimit;
    await persistGallery();
    renderGallery();
  };

  const galleryLoadPromise = loadGallery().then(() => renderGallery());

  get<HTMLButtonElement>("studio-art-backup").onclick = async () => {
    try {
      await galleryLoadPromise;
      const backup = {
        format: "umbra-card-studio-gallery",
        version: 1,
        exportedAt: new Date().toISOString(),
        cards: gallery
      };
      const json = JSON.stringify(backup);
      if (json.length > maxBackupBytes) {
        throw new Error("La copia supera los 24 MB. Exporta algunas cartas PNG por separado para reducir el tamaño.");
      }
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "umbra-galeria-" + new Date().toISOString().slice(0, 10) + ".json";
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo exportar la copia.");
    }
  };

  get<HTMLButtonElement>("studio-linked-art-backup").onclick = async () => {
    try {
      const backup = await exportLocalArtBackup();
      if (backup.items.length === 0) throw new Error("Todavía no hay PNG enlazados al juego para respaldar.");
      const json = JSON.stringify(backup);
      if (json.length > maxBackupBytes) {
        throw new Error("La copia de arte enlazado supera los 24 MB. Vincula/exporta menos imágenes por copia para no sobrecargar el navegador.");
      }
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "umbra-arte-enlazado-" + new Date().toISOString().slice(0, 10) + ".json";
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo exportar el arte enlazado.");
    }
  };

  get<HTMLButtonElement>("studio-linked-art-import-trigger").onclick = () => get<HTMLInputElement>("studio-linked-art-import-file").click();
  get<HTMLInputElement>("studio-linked-art-import-file").onchange = async event => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      if (file.size > maxBackupBytes) throw new Error("La copia de arte enlazado supera el límite de 24 MB.");
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !("items" in parsed) || !Array.isArray(parsed.items)) {
        throw new Error("El archivo no contiene una copia de arte enlazado de UMBRA.");
      }
      if (parsed.items.length === 0) throw new Error("La copia no contiene imágenes enlazadas.");
      if (!window.confirm("Se restaurarán " + parsed.items.length + " imágenes y se reemplazará todo el arte enlazado local actual. Exporta una copia antes de continuar si deseas conservarlo.")) return;
      const count = await importLocalArtBackup(parsed);
      window.alert("Arte enlazado restaurado: " + count + " imágenes.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo restaurar el arte enlazado.");
    } finally {
      get<HTMLInputElement>("studio-linked-art-import-file").value = "";
    }
  };

  get<HTMLButtonElement>("studio-art-import-trigger").onclick = () => get<HTMLInputElement>("studio-art-import-file").click();
  get<HTMLInputElement>("studio-art-import-file").onchange = async event => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await galleryLoadPromise;
      if (file.size > maxBackupBytes) throw new Error("La copia supera el límite de 24 MB.");
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !("format" in parsed) || !("version" in parsed) || !("cards" in parsed)) {
        throw new Error("El archivo no tiene el formato de copia de UMBRA.");
      }
      const candidate = parsed as { format: unknown; version: unknown; cards: unknown };
      if (candidate.format !== "umbra-card-studio-gallery" || candidate.version !== 1 || !Array.isArray(candidate.cards)) {
        throw new Error("La copia no es compatible con esta versión del taller.");
      }
      const restored: GalleryCard[] = [];
      let contentBytes = 0;
      for (const item of candidate.cards) {
        if (restored.length >= galleryLimit) break;
        if (!item || typeof item !== "object" || !("name" in item) || !("data" in item) || !("prompt" in item)) continue;
        if (typeof item.name !== "string" || typeof item.data !== "string" || typeof item.prompt !== "string") continue;
        if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(item.data)) continue;
        contentBytes += item.data.length;
        if (contentBytes > maxBackupBytes) throw new Error("Los datos de la copia superan el límite permitido.");
        restored.push({ name: item.name.slice(0, 100), data: item.data, prompt: item.prompt.slice(0, 4000) });
      }
      if (restored.length === 0) throw new Error("La copia no contiene cartas PNG válidas.");
      if (!window.confirm("Se restaurarán " + restored.length + " cartas y se reemplazará la galería actual. Exporta una copia de la galería actual antes de continuar si deseas conservarla.")) {
        get<HTMLInputElement>("studio-art-import-file").value = "";
        return;
      }
      gallery.splice(0, gallery.length, ...restored);
      const persisted = await persistGallery();
      renderGallery();
      if (persisted) window.alert("Copia restaurada: " + restored.length + " cartas.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo importar la copia.");
    } finally {
      get<HTMLInputElement>("studio-art-import-file").value = "";
    }
  };

  const close = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    overlay.remove();
  };
  get<HTMLButtonElement>("studio-close").onclick = close;
  overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
  draw();
}
