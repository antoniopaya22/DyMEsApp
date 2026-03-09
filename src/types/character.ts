/**
 * Tipos para personajes de D&D 5e en español
 * Cubre: HU-02 (Creación), HU-03 (Hoja), HU-04 (Estadísticas), HU-08 (Vida/Combate)
 */

// Re-export constants (moved to @/constants/character)
export {
  ABILITY_NAMES,
  ABILITY_ABBR,
  SKILLS,
  ALIGNMENT_NAMES,
  CONDITION_NAMES,
} from "@/constants/character";

// Re-export utility functions (moved to @/utils/character)
export {
  calcModifier,
  calcProficiencyBonus,
  hitDieValue,
  hitDieFixedValue,
  formatModifier,
} from "@/utils/character";

// ─── Enums y tipos base ──────────────────────────────────────────────

export type AbilityKey = "fue" | "des" | "con" | "int" | "sab" | "car";

export type SkillKey =
  | "acrobacias"
  | "atletismo"
  | "engano"
  | "historia"
  | "interpretacion"
  | "intimidacion"
  | "investigacion"
  | "juego_de_manos"
  | "medicina"
  | "naturaleza"
  | "percepcion"
  | "perspicacia"
  | "persuasion"
  | "religion"
  | "sigilo"
  | "supervivencia"
  | "trato_con_animales"
  | "arcanos";

export interface SkillDefinition {
  nombre: string;
  habilidad: AbilityKey;
}

export type Alignment =
  | "legal_bueno"
  | "neutral_bueno"
  | "caotico_bueno"
  | "legal_neutral"
  | "neutral"
  | "caotico_neutral"
  | "legal_malvado"
  | "neutral_malvado"
  | "caotico_malvado";

export type Size = "diminuto" | "pequeno" | "mediano" | "grande";

export type Sexo = "masculino" | "femenino" | "otro";

export const SEXO_NAMES: Record<Sexo, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
};

export type HitDie = "d6" | "d8" | "d10" | "d12";

export type ProficiencyLevel = "none" | "proficient" | "expertise";

export type AbilityScoreMethod =
  | "standard_array"
  | "point_buy"
  | "dice_roll"
  | "manual";

export type DamageType =
  | "acido"
  | "contundente"
  | "cortante"
  | "frio"
  | "fuego"
  | "fuerza"
  | "necrotico"
  | "perforante"
  | "psiquico"
  | "radiante"
  | "relampago"
  | "trueno"
  | "veneno";

export type Condition =
  | "agarrado"
  | "asustado"
  | "aturdido"
  | "cegado"
  | "derribado"
  | "encantado"
  | "ensordecido"
  | "envenenado"
  | "hechizado"
  | "incapacitado"
  | "inconsciente"
  | "invisible"
  | "paralizado"
  | "petrificado"
  | "restringido";

// ─── Razas ───────────────────────────────────────────────────────────

export type RaceId =
  | "enano"
  | "elfo"
  | "mediano"
  | "humano"
  | "draconido"
  | "gnomo"
  | "semielfo"
  | "semiorco"
  | "tiefling"
  | "hada"
  | "liebren"
  | "personalizada";

export type SubraceId =
  | "enano_colinas"
  | "enano_montanas"
  | "alto_elfo"
  | "elfo_bosque"
  | "elfo_oscuro"
  | "mediano_piesligeros"
  | "mediano_fornido"
  | "gnomo_bosque"
  | "gnomo_rocas"
  | null;

// ─── Clases ──────────────────────────────────────────────────────────

export type ClassId =
  | "barbaro"
  | "bardo"
  | "brujo"
  | "clerigo"
  | "druida"
  | "explorador"
  | "guerrero"
  | "hechicero"
  | "mago"
  | "monje"
  | "paladin"
  | "picaro";

export type SubclassId = string;

// ─── Trasfondos ──────────────────────────────────────────────────────

export type BackgroundId =
  | "acolito"
  | "charlatan"
  | "criminal"
  | "artista"
  | "heroe_del_pueblo"
  | "artesano_gremial"
  | "ermitano"
  | "noble"
  | "forastero"
  | "sabio"
  | "marinero"
  | "soldado"
  | "huerfano"
  | "peon_brujaluz"
  | "extraviado_feerico"
  | "personalizada";

// ─── Puntuaciones de característica ──────────────────────────────────

export interface AbilityScores {
  fue: number;
  des: number;
  con: number;
  int: number;
  sab: number;
  car: number;
}

export interface AbilityScoreDetail {
  base: number;
  racial: number;
  improvement: number;
  misc: number;
  override: number | null;
  total: number;
  modifier: number;
}

export type AbilityScoresDetailed = Record<AbilityKey, AbilityScoreDetail>;

// ─── Habilidades (Skills) ────────────────────────────────────────────

export interface SkillProficiency {
  level: ProficiencyLevel;
  /** Origen de la competencia: 'clase', 'raza', 'trasfondo', 'dote', 'manual' */
  source?: string;
}

export type SkillProficiencies = Record<SkillKey, SkillProficiency>;

// ─── Tiradas de salvación ────────────────────────────────────────────

export interface SavingThrowProficiency {
  proficient: boolean;
  /** Origen de la competencia */
  source?: string;
}

export type SavingThrowProficiencies = Record<AbilityKey, SavingThrowProficiency>;

// ─── Puntos de golpe / Vida ──────────────────────────────────────────

export interface HitPoints {
  /** PG máximos */
  max: number;
  /** PG actuales */
  current: number;
  /** PG temporales */
  temp: number;
}

export interface HitDicePool {
  /** Tipo de dado de golpe */
  die: HitDie;
  /** Dados totales (= nivel) */
  total: number;
  /** Dados disponibles (no gastados) */
  remaining: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

// ─── Combate ─────────────────────────────────────────────────────────

export interface ArmorClassDetail {
  /** CA total */
  total: number;
  /** CA base (armadura o 10) */
  base: number;
  /** Bonus de destreza aplicado */
  dexBonus: number;
  /** Bonus de escudo */
  shieldBonus: number;
  /** Otros bonificadores */
  miscBonus: number;
  /** Descripción del cálculo */
  breakdown: string;
}

export interface SpeedInfo {
  /** Velocidad base en pies */
  walk: number;
  /** Velocidad de nado */
  swim?: number;
  /** Velocidad de trepar */
  climb?: number;
  /** Velocidad de vuelo */
  fly?: number;
}

export interface DamageModifier {
  type: DamageType;
  modifier: "resistance" | "immunity" | "vulnerability";
  source: string;
}

export interface ActiveCondition {
  condition: Condition;
  note?: string;
}

// ─── Competencias generales ──────────────────────────────────────────

export interface Proficiencies {
  armors: string[];
  weapons: string[];
  tools: string[];
  languages: string[];
}

// ─── Rasgos y capacidades ────────────────────────────────────────────

export interface Trait {
  id: string;
  nombre: string;
  descripcion: string;
  origen: "raza" | "clase" | "subclase" | "trasfondo" | "dote" | "manual";
  /** Usos máximos por descanso (null = ilimitado / pasivo) */
  maxUses: number | null;
  /** Usos restantes */
  currentUses: number | null;
  /** Tipo de recarga */
  recharge: "short_rest" | "long_rest" | "dawn" | null;
}

// ─── Personalidad ────────────────────────────────────────────────────

export interface Personality {
  traits: string[];
  ideals: string;
  bonds: string;
  flaws: string;
  backstory?: string;
}

// ─── Apariencia ──────────────────────────────────────────────────────

export interface Appearance {
  age?: string;
  height?: string;
  weight?: string;
  eyeColor?: string;
  hairColor?: string;
  skinColor?: string;
  description?: string;
  avatarUri?: string;
}

// ─── Historial de nivel ──────────────────────────────────────────────

export interface LevelUpRecord {
  level: number;
  /** Fecha de la subida de nivel */
  date: string;
  /** PG ganados en este nivel */
  hpGained: number;
  /** Método usado para PG: 'roll' o 'fixed' */
  hpMethod: "roll" | "fixed";
  /** Mejoras de característica aplicadas */
  abilityImprovements?: Partial<AbilityScores>;
  /** Subclase elegida (si fue en este nivel) */
  subclassChosen?: SubclassId;
  /** Elecciones de rasgos de subclase realizadas */
  subclassFeatureChoices?: { choiceId: string; selectedOptionIds: string[] }[];
  /** Hechizos aprendidos */
  spellsLearned?: string[];
  /** Hechizos intercambiados: [viejo, nuevo] */
  spellsSwapped?: [string, string][];
  /** Rasgos de clase obtenidos */
  traitsGained?: string[];
}

// ─── Concentración en hechizo ────────────────────────────────────────

export interface ConcentrationState {
  spellId: string;
  spellName: string;
  startedAt: string;
}

// ─── Personaje completo ──────────────────────────────────────────────

export interface Character {
  /** UUID del personaje */
  id: string;
  /** UUID de la partida asociada (solo en modo master) */
  campaignId?: string;

  // ── Información básica ──
  nombre: string;
  sexo?: Sexo;
  raza: RaceId;
  subraza: SubraceId;
  /** Nombre de la raza personalizada (solo cuando raza === "personalizada") */
  customRaceName?: string;
  /** Configuración completa de la raza personalizada (para consultas post-creación) */
  customRaceData?: import("@/types/creation").CustomRaceConfig;
  clase: ClassId;
  /** Nombre del trasfondo personalizado (solo cuando trasfondo === "personalizada") */
  customBackgroundName?: string;
  /** Configuración completa del trasfondo personalizado (para consultas post-creación) */
  customBackgroundData?: import("@/types/creation").CustomBackgroundConfig;
  subclase: SubclassId | null;
  nivel: number;
  experiencia: number;
  trasfondo: BackgroundId;
  alineamiento?: Alignment;

  // ── Estadísticas (HU-04) ──
  abilityScores: AbilityScoresDetailed;
  skillProficiencies: SkillProficiencies;
  savingThrows: SavingThrowProficiencies;

  // ── Vida y combate (HU-08) ──
  hp: HitPoints;
  hitDice: HitDicePool;
  deathSaves: DeathSaves;
  speed: SpeedInfo;
  /** Visión en la oscuridad (rango en pies, 0 = sin darkvision) */
  darkvision: number;
  /** Linaje dracónico elegido (solo para dracónido) */
  dragonLineage?: string;
  damageModifiers: DamageModifier[];
  conditions: ActiveCondition[];
  concentration: ConcentrationState | null;

  // ── Competencias ──
  proficiencies: Proficiencies;
  proficiencyBonus: number;

  // ── Rasgos ──
  traits: Trait[];

  // ── Personalidad y apariencia ──
  personality: Personality;
  appearance: Appearance;

  // ── Progresión ──
  levelHistory: LevelUpRecord[];

  // ── Hechizos (IDs, detalle en spell.ts) ──
  knownSpellIds: string[];
  preparedSpellIds: string[];
  /** Libro de hechizos del Mago */
  spellbookIds: string[];

  // ── Inventario (IDs, detalle en item.ts) ──
  /** Referencia al inventario, gestionado aparte */
  inventoryId: string;

  // ── Meta ──
  creadoEn: string;
  actualizadoEn: string;
}

// ─── Estado parcial para el wizard de creación (HU-02) ───────────────

// Re-export from dedicated creation types module
export type { CharacterCreationDraft } from "./creation";
