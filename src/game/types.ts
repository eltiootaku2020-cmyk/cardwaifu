export type Rarity = "R" | "S" | "SR" | "SSR" | "UR";
export type FormStage = "Lily" | "Hero" | "Epic";
export type FormBranch = "Light" | "Dark" | null;
export type HeroClass = "Espadachina" | "Lancera" | "Arquera" | "Jinete" | "Hechicera";
export interface Heroine { id: string; name: string; rarity: Rarity; heroClass: HeroClass; stage: FormStage; darkAvailable: boolean; attack: number; maxHp: number; description: string; }
export type EnemyIntent = "quick-attack" | "heavy-attack" | "guard";
export interface Fighter { name: string; hp: number; maxHp: number; attack: number; anima: number; intent?: EnemyIntent; }
export interface BattleState { id: string; turn: number; alma: number; stage: FormStage; branch: FormBranch; darkAvailable: boolean; player: Fighter; enemy: Fighter; status: "active" | "won" | "lost"; evolved: boolean; log: string[]; worldNodeId?: string; }
