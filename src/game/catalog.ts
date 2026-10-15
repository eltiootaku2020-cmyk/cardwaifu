import type { Heroine } from "./types.js";

export const HEROINES: Heroine[] = [
  { id: "tiny", name: "Tiny, la exploradora", rarity: "S", heroClass: "Arquera", stage: "Lily", darkAvailable: false, attack: 22, maxHp: 120, description: "Goblin exploradora elegida por la epopeya de Arturo. Ágil, observadora y protectora de su pueblo." },
  { id: "elizabeth", name: "Elizabeth, heredera de Arturo", rarity: "SR", heroClass: "Espadachina", stage: "Hero", darkAvailable: true, attack: 31, maxHp: 130, description: "Noble gobernante que manifiesta la epopeya de Arturo con un poder de rango SR." },
  { id: "artoria", name: "Artoria, manifestación de Arturo", rarity: "SSR", heroClass: "Espadachina", stage: "Epic", darkAvailable: true, attack: 35, maxHp: 115, description: "Manifestación femenina de la epopeya del rey caballero. La leyenda no pertenece a una sola portadora." },
  { id: "juana", name: "Juana de Arco", rarity: "SR", heroClass: "Lancera", stage: "Hero", darkAvailable: true, attack: 23, maxHp: 135, description: "Doncella guerrera que protege a sus aliadas y resiste bajo presión." },
  { id: "cleopatra", name: "Cleopatra, reina del Nilo", rarity: "SR", heroClass: "Hechicera", stage: "Lily", darkAvailable: false, attack: 20, maxHp: 145, description: "Estratega que combina engaño, control y magia antigua." },
  { id: "musashi", name: "Musashi, duelista errante", rarity: "S", heroClass: "Espadachina", stage: "Hero", darkAvailable: true, attack: 29, maxHp: 105, description: "Espadachina viajera que busca perfeccionar cada movimiento." },
  { id: "heracles", name: "Heracles, doncella de los doce trabajos", rarity: "SSR", heroClass: "Lancera", stage: "Epic", darkAvailable: true, attack: 25, maxHp: 180, description: "Heroína de fuerza excepcional que convierte el esfuerzo en poder." },
  { id: "robin-hood", name: "Robin Hood, arquera del bosque", rarity: "R", heroClass: "Arquera", stage: "Lily", darkAvailable: false, attack: 25, maxHp: 110, description: "Arquera astuta que encuentra puntos débiles y rutas ocultas." }
];

export const FIRST_SUMMON_POOL = ["juana", "cleopatra", "musashi", "robin-hood"] as const;

export function getHeroine(id: string): Heroine | undefined {
  return HEROINES.find(hero => hero.id === id);
}

export function getFirstSummonPool(): Heroine[] {
  return FIRST_SUMMON_POOL.map(id => getHeroine(id)).filter((hero): hero is Heroine => Boolean(hero));
}
