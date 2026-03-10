/**
 * Shared types for the character store slices.
 * This file defines the state shape and action interfaces for each slice,
 * plus the combined CharacterStore type.
 */

import type {
  Character,
  AbilityKey,
  AbilityScores,
  SkillKey,
  Condition,
  LevelUpRecord,
  Personality,
  Appearance,
  SpeedInfo,
} from "@/types/character";
import type {
  Inventory,
  InventoryItem,
  Coins,
  CoinType,
  CoinTransaction,
} from "@/types/item";
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  NoteTag,
} from "@/types/notes";
import type { InternalMagicState, ClassResourcesState } from "./helpers";
import type { LevelUpSummary } from "@/data/srd/leveling";

// ─── Level Up Options ────────────────────────────────────────────────

/** Elección realizada para un rasgo de subclase */
export interface SubclassFeatureChoiceResult {
  /** ID de la elección (ej. "estilo_combate") */
  choiceId: string;
  /** IDs de las opciones seleccionadas */
  selectedOptionIds: string[];
}

/** Opciones que el jugador elige al subir de nivel */
export interface LevelUpOptions {
  /** Método de PG: tirar dado o usar valor fijo */
  hpMethod: "roll" | "fixed";
  /** Si el método es "roll", el valor tirado (si no se pasa, se genera) */
  hpRolled?: number;
  /** Mejoras de característica elegidas (solo si el nivel otorga ASI) */
  abilityImprovements?: Partial<AbilityScores>;
  /** Subclase elegida (solo si el nivel lo requiere y no tiene una) */
  subclassChosen?: string;
  /** Elecciones de rasgos de subclase (ej. estilo de combate, tótem, etc.) */
  subclassFeatureChoices?: SubclassFeatureChoiceResult[];
  /** Hechizos aprendidos al subir de nivel (IDs o nombres) */
  spellsLearned?: string[];
  /** Trucos aprendidos al subir de nivel */
  cantripsLearned?: string[];
  /** Hechizo intercambiado: [viejo, nuevo] */
  spellSwapped?: [string, string];
  /** Hechizos añadidos al libro de conjuros (solo mago) */
  spellbookAdded?: string[];
  /** Opciones de Metamagia elegidas (solo hechicero) */
  metamagicChosen?: string[];
  /** ID de la dote elegida en lugar del ASI (solo si dotesActivas está activa) */
  featChosen?: string;
  /** Distribución de ASI elegida para la dote (ej. { fue: 1 } o { fue: 1, des: 1 }) */
  featAsiChoices?: Partial<AbilityScores>;
}

// ─── Character CRUD State ────────────────────────────────────────────

export interface CharacterCrudState {
  character: Character | null;
  loading: boolean;
  error: string | null;
}

export interface CharacterCrudActions {
  loadCharacter: (characterId: string) => Promise<void>;
  saveCharacter: () => Promise<void>;
  deleteAllCharacterData: (characterId: string) => Promise<void>;
  clearCharacter: () => void;
  clearError: () => void;
  getAbilityModifier: (ability: AbilityKey) => number;
  getSkillBonus: (skill: SkillKey) => number;
  getSavingThrowBonus: (ability: AbilityKey) => number;
  getProficiencyBonus: () => number;
  getArmorClass: () => number;
  getInitiativeBonus: () => number;
  getEffectiveSpeed: () => SpeedInfo;
  updatePersonality: (personality: Personality) => Promise<void>;
  updateAppearance: (appearance: Appearance) => Promise<void>;
  updateAlignment: (alignment: Character["alineamiento"]) => Promise<void>;
  updateName: (nombre: string) => Promise<void>;
}

// ─── Combat State ────────────────────────────────────────────────────

export interface CombatActions {
  takeDamage: (amount: number, description?: string) => Promise<void>;
  heal: (amount: number, description?: string) => Promise<void>;
  setTempHP: (amount: number) => Promise<void>;
  setMaxHP: (amount: number) => Promise<void>;
  setCurrentHP: (amount: number) => Promise<void>;
  useHitDie: () => Promise<{ rolled: number; healed: number } | null>;
  restoreHitDice: (count: number) => Promise<void>;
  addDeathSuccess: () => Promise<"stable" | "success" | null>;
  addDeathFailure: () => Promise<"dead" | "failure" | null>;
  resetDeathSaves: () => Promise<void>;
  addCondition: (condition: Condition, note?: string) => Promise<void>;
  removeCondition: (condition: Condition) => Promise<void>;
  clearConditions: () => Promise<void>;
  setConcentration: (spellId: string, spellName: string) => Promise<void>;
  clearConcentration: () => Promise<void>;
  useTraitCharge: (traitId: string) => Promise<void>;
  restoreTraitCharges: (traitId: string) => Promise<void>;
}

// ─── Progression State ───────────────────────────────────────────────

export interface ProgressionActions {
  addExperience: (amount: number) => Promise<void>;
  removeExperience: (amount: number) => Promise<void>;
  setExperience: (amount: number) => Promise<void>;
  levelUp: (options: LevelUpOptions) => Promise<LevelUpSummary | null>;
  getLevelUpPreview: () => LevelUpSummary | null;
  canLevelUp: () => boolean;
  resetToLevel1: () => Promise<void>;
}

// ─── Magic State ─────────────────────────────────────────────────────

export interface MagicSliceState {
  magicState: InternalMagicState | null;
}

export interface MagicActions {
  useSpellSlot: (level: number) => Promise<boolean>;
  restoreSpellSlot: (level: number) => Promise<void>;
  restoreAllSpellSlots: () => Promise<void>;
  usePactSlot: () => Promise<boolean>;
  restoreAllPactSlots: () => Promise<void>;
  getMagicState: () => InternalMagicState | null;
  togglePreparedSpell: (spellId: string) => Promise<boolean>;
}

// ─── Class Resources State ───────────────────────────────────────────

export interface ClassResourceSliceState {
  classResources: ClassResourcesState | null;
}

export interface ClassResourceActions {
  useClassResource: (resourceId: string) => Promise<boolean>;
  useClassResourceAmount: (
    resourceId: string,
    amount: number,
  ) => Promise<boolean>;
  restoreClassResource: (resourceId: string) => Promise<void>;
  restoreAllClassResources: () => Promise<void>;
  getClassResources: () => ClassResourcesState | null;
}

// ─── Inventory State ─────────────────────────────────────────────────

export interface InventorySliceState {
  inventory: Inventory | null;
}

export interface InventoryActions {
  loadInventory: (characterId: string) => Promise<void>;
  addItem: (item: Omit<InventoryItem, "id">) => Promise<void>;
  updateItem: (
    itemId: string,
    updates: Partial<InventoryItem>,
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleEquipItem: (itemId: string) => Promise<void>;
  updateCoins: (coins: Partial<Coins>) => Promise<void>;
  addCoinTransaction: (
    transaction: Omit<CoinTransaction, "id" | "timestamp">,
  ) => Promise<void>;
}

// ─── Notes State ─────────────────────────────────────────────────────

export interface NotesSliceState {
  notes: Note[];
  customTags: NoteTag[];
}

export interface NotesActions {
  loadNotes: (characterId: string) => Promise<void>;
  addNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (noteId: string, updates: UpdateNoteInput) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  togglePinNote: (noteId: string) => Promise<void>;
  addQuickNote: (content: string) => Promise<Note>;
}

// ─── Rest State ──────────────────────────────────────────────────────

export interface RestActions {
  shortRest: (
    hitDiceToUse: number,
  ) => Promise<{ hpRestored: number; diceUsed: number }>;
  longRest: () => Promise<void>;
}

// ─── Combined Store Type ─────────────────────────────────────────────

export type CharacterStore = CharacterCrudState &
  CharacterCrudActions &
  CombatActions &
  ProgressionActions &
  MagicSliceState &
  MagicActions &
  ClassResourceSliceState &
  ClassResourceActions &
  InventorySliceState &
  InventoryActions &
  NotesSliceState &
  NotesActions &
  RestActions;
