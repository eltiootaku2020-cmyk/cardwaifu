export type WorldNodeKind = "village" | "path" | "landmark" | "camp" | "ruin" | "dungeon";
export type WorldEventKind = "safe" | "encounter" | "discovery" | "rest" | "boss";
export interface WorldNode {
  id: string;
  name: string;
  kind: WorldNodeKind;
  danger: 0 | 1 | 2 | 3;
  levelRange: string;
  description: string;
  event: WorldEventKind;
  connections: string[];
}
export interface WorldProgress {
  currentNodeId: string;
  visitedNodeIds: string[];
  completedEventIds: string[];
}
export interface TravelResult {
  progress: WorldProgress;
  destination: WorldNode;
  event: WorldEventKind;
  firstVisit: boolean;
}
export const START_NODE_ID = "aldea-bruma";
export const WORLD_NODES: WorldNode[] = [
  { id: "aldea-bruma", name: "Aldea Bruma", kind: "village", danger: 0, levelRange: "Zona segura", description: "Una aldea aislada al borde del bosque. Aquí puedes recuperarte y preparar la expedición.", event: "safe", connections: ["sendero-musgo", "puesto-vigilia"] },
  { id: "sendero-musgo", name: "Sendero del Musgo", kind: "path", danger: 1, levelRange: "Nv. 3–6", description: "Huellas pequeñas se cruzan con rastros de una criatura corrompida. Algo observa desde los árboles.", event: "encounter", connections: ["aldea-bruma", "manantial-luna", "ruinas-viejas"] },
  { id: "puesto-vigilia", name: "Puesto de Vigilia", kind: "landmark", danger: 1, levelRange: "Nv. 3–6", description: "Una torre de vigilancia abandonada, con mapas incompletos y señales de antiguas patrullas.", event: "discovery", connections: ["aldea-bruma", "ruinas-viejas"] },
  { id: "manantial-luna", name: "Manantial de Luna", kind: "camp", danger: 1, levelRange: "Nv. 4–7", description: "El agua calma parte del cansancio. Unas marcas extrañas indican que el miasma llega desde el subsuelo.", event: "rest", connections: ["sendero-musgo", "nido-goblin"] },
  { id: "ruinas-viejas", name: "Ruinas del Camino Viejo", kind: "ruin", danger: 2, levelRange: "Nv. 5–8", description: "Piedra antigua, trampas y restos de una ruta comercial que ya no figura en los mapas.", event: "discovery", connections: ["sendero-musgo", "puesto-vigilia", "entrada-abismo"] },
  { id: "nido-goblin", name: "Refugio del Barranco", kind: "landmark", danger: 2, levelRange: "Nv. 5–9", description: "Un refugio goblin oculto. No todas sus habitantes son hostiles; entrar sin cuidado puede parecer una invasión.", event: "encounter", connections: ["manantial-luna", "entrada-abismo"] },
  { id: "entrada-abismo", name: "Umbral del Abismo Menor", kind: "dungeon", danger: 3, levelRange: "Nv. 7–10", description: "Una grieta respira miasma. La presión de su interior cambia con cada pulso y algo protege el acceso.", event: "boss", connections: ["ruinas-viejas", "nido-goblin"] }
];
export function getWorldNode(id: string): WorldNode | undefined {
  return WORLD_NODES.find(node => node.id === id);
}
export function createWorldProgress(): WorldProgress {
  return { currentNodeId: START_NODE_ID, visitedNodeIds: [START_NODE_ID], completedEventIds: [] };
}
export function travelTo(progress: WorldProgress, destinationId: string): TravelResult {
  const current = getWorldNode(progress.currentNodeId);
  const destination = getWorldNode(destinationId);
  if (!current || !destination) throw new Error("Lugar de expedición desconocido.");
  if (!current.connections.includes(destinationId)) throw new Error("Ese lugar no está conectado con tu ruta actual.");
  const firstVisit = !progress.visitedNodeIds.includes(destinationId);
  const next: WorldProgress = {
    currentNodeId: destinationId,
    visitedNodeIds: firstVisit ? [...progress.visitedNodeIds, destinationId] : [...progress.visitedNodeIds],
    completedEventIds: [...progress.completedEventIds]
  };
  return { progress: next, destination, event: destination.event, firstVisit };
}
export function getAvailableDestinations(progress: WorldProgress): WorldNode[] {
  return (getWorldNode(progress.currentNodeId)?.connections ?? [])
    .map(getWorldNode)
    .filter((node): node is WorldNode => Boolean(node));
}
