export type EquipmentSlot = "weapon" | "armor" | "accessory" | "support";
export type EquipmentRarity = "R" | "S" | "SR" | "SSR" | "UR";
export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  attackBonus: number;
  hpBonus: number;
  description: string;
}
export interface EquipmentLoadout {
  weapon: string;
  armor: string;
  accessory: string;
  support: string;
}
export interface EquipmentBonuses {
  attackBonus: number;
  hpBonus: number;
}
export const EQUIPMENT: EquipmentItem[] = [
  { id: "wooden-bow", name: "Arco de fresno", slot: "weapon", rarity: "R", attackBonus: 3, hpBonus: 0, description: "Arma ligera para exploradoras y arqueras." },
  { id: "bronze-sword", name: "Espada de bronce", slot: "weapon", rarity: "S", attackBonus: 5, hpBonus: 0, description: "Hoja sencilla, fiable y fácil de reparar." },
  { id: "moon-staff", name: "Bastón de manantial", slot: "weapon", rarity: "S", attackBonus: 4, hpBonus: 4, description: "Canaliza energía y mejora ligeramente la resistencia." },
  { id: "forest-cloak", name: "Capa de exploración", slot: "armor", rarity: "R", attackBonus: 0, hpBonus: 12, description: "Cuero blando y tela tratada para viajar por el bosque." },
  { id: "goblin-guard", name: "Guardabrazos recuperados", slot: "armor", rarity: "S", attackBonus: 1, hpBonus: 18, description: "Piezas artesanales resistentes, adaptadas para moverse." },
  { id: "amber-charm", name: "Amuleto de ámbar", slot: "accessory", rarity: "R", attackBonus: 1, hpBonus: 6, description: "Aporta un pequeño refuerzo sin cambiar la vestidura." },
  { id: "rabbit-bell", name: "Campanilla de conejita", slot: "accessory", rarity: "S", attackBonus: 2, hpBonus: 8, description: "Un accesorio simpático que puede fusionarse con una vestidura temática." },
  { id: "healing-herbs", name: "Hierbas de primeros auxilios", slot: "support", rarity: "R", attackBonus: 0, hpBonus: 10, description: "Suministros que preparan a la heroína para resistir el primer golpe." },
  { id: "anti-miasma-vial", name: "Frasco contra el miasma", slot: "support", rarity: "S", attackBonus: 1, hpBonus: 14, description: "Un apoyo de expedición pensado para zonas contaminadas." }
];
export const DEFAULT_LOADOUT: EquipmentLoadout = {
  weapon: "wooden-bow",
  armor: "forest-cloak",
  accessory: "amber-charm",
  support: "healing-herbs"
};
export function getEquipment(id: string): EquipmentItem | undefined {
  return EQUIPMENT.find(item => item.id === id);
}
export function getEquipmentBonuses(loadout: EquipmentLoadout): EquipmentBonuses {
  return Object.values(loadout).reduce((total, id) => {
    const item = getEquipment(id);
    if (!item) return total;
    total.attackBonus += item.attackBonus;
    total.hpBonus += item.hpBonus;
    return total;
  }, { attackBonus: 0, hpBonus: 0 });
}
export function isValidLoadout(value: unknown): value is EquipmentLoadout {
  if (!value || typeof value !== "object") return false;
  const loadout = value as Record<string, unknown>;
  const slots: EquipmentSlot[] = ["weapon", "armor", "accessory", "support"];
  return slots.every(slot => typeof loadout[slot] === "string" && getEquipment(loadout[slot] as string)?.slot === slot);
}
