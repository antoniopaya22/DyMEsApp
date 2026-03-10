/**
 * Tipos para el sistema de hechizos de D&D 5e en español (HU-06)
 */

import type { ClassId, AbilityKey } from "./character";

// Re-export constants (moved to @/constants/spells)
export {
  MAGIC_SCHOOL_NAMES,
  MAGIC_SCHOOL_ICONS,
  SPELL_LEVEL_NAMES,
  FULL_CASTER_SLOTS,
  HALF_CASTER_SLOTS,
  WARLOCK_PACT_SLOTS,
  CANTRIPS_KNOWN,
  SPELLS_KNOWN,
  SPELLCASTING_ABILITY,
  CLASS_CASTER_TYPE,
  CLASS_SPELL_PREPARATION,
  METAMAGIC_NAMES,
  METAMAGIC_COSTS,
  METAMAGIC_DESCRIPTIONS,
  ALL_METAMAGIC_OPTIONS,
} from "@/constants/spells";

// Re-export utility functions (moved to @/utils/spells)
export {
  calcPreparedSpells,
  calcSpellSaveDC,
  calcSpellAttackBonus,
  getSpellSlots,
  getPactMagicSlots,
  formatSpellComponents,
  formatSpellDuration,
  formatCastingTime,
  formatSpellRange,
  parseAlcance,
  formatAlcanceRaw,
} from "@/utils/spells";

// ─── Escuelas de magia ───────────────────────────────────────────────

export type MagicSchool =
  | "abjuracion"
  | "conjuracion"
  | "adivinacion"
  | "encantamiento"
  | "evocacion"
  | "ilusion"
  | "nigromancia"
  | "transmutacion";

// ─── Niveles de hechizo ──────────────────────────────────────────────

/**
 * Nivel de hechizo: 0 = truco, 1-9 = niveles de hechizo
 */
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// ─── Componentes de hechizo ──────────────────────────────────────────

export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  /** Descripción del componente material, si aplica */
  materialDescription?: string;
  /** Si el componente material tiene coste en oro */
  materialCost?: number;
  /** Si el componente material se consume al lanzar */
  materialConsumed?: boolean;
}

// ─── Tiempos de lanzamiento ──────────────────────────────────────────

export type CastingTimeUnit =
  | "accion"
  | "accion_adicional"
  | "reaccion"
  | "minuto"
  | "minutos"
  | "hora"
  | "horas";

export interface CastingTime {
  amount: number;
  unit: CastingTimeUnit;
  /** Condición para la reacción (si aplica) */
  reactionTrigger?: string;
}

// ─── Duración ────────────────────────────────────────────────────────

export type DurationUnit =
  | "instantaneo"
  | "ronda"
  | "rondas"
  | "minuto"
  | "minutos"
  | "hora"
  | "horas"
  | "dia"
  | "dias"
  | "especial"
  | "hasta_disipar"
  | "permanente";

export interface SpellDuration {
  amount: number | null;
  unit: DurationUnit;
  concentration: boolean;
}

// ─── Alcance ─────────────────────────────────────────────────────────

export type RangeType =
  | "personal"
  | "toque"
  | "distancia"
  | "vision"
  | "ilimitado"
  | "especial";

export interface SpellRange {
  type: RangeType;
  /** Distancia en pies (solo si type === 'distancia') */
  distance?: number;
  /** Área de efecto, si aplica */
  area?: SpellArea;
}

export type AreaShape =
  | "esfera"
  | "cubo"
  | "cono"
  | "cilindro"
  | "linea"
  | "hemisferio";

export interface SpellArea {
  shape: AreaShape;
  /** Tamaño en pies (radio para esfera, lado para cubo, etc.) */
  size: number;
}

// ─── Hechizo completo ────────────────────────────────────────────────

export interface Spell {
  /** Identificador único del hechizo */
  id: string;
  /** Nombre del hechizo en español */
  nombre: string;
  /** Nombre original en inglés (referencia) */
  nombreOriginal?: string;
  /** Nivel del hechizo (0 = truco) */
  nivel: SpellLevel;
  /** Escuela de magia */
  escuela: MagicSchool;
  /** Tiempo de lanzamiento */
  tiempoLanzamiento: CastingTime;
  /** Alcance */
  alcance: SpellRange;
  /** Componentes */
  componentes: SpellComponents;
  /** Duración */
  duracion: SpellDuration;
  /** Si requiere concentración (derivado de duracion.concentration) */
  concentracion: boolean;
  /** Si se puede lanzar como ritual */
  ritual: boolean;
  /** Descripción completa del efecto */
  descripcion: string;
  /** Efecto al lanzar a niveles superiores */
  aNivelesSuperiors?: string;
  /** Clases que pueden usar este hechizo */
  clases: ClassId[];
  /** Fuente del hechizo (SRD, manual, homebrew) */
  fuente: string;
  /** Si es un hechizo personalizado/homebrew */
  homebrew: boolean;
}

// ─── Gestión de hechizos del personaje ───────────────────────────────

/**
 * Hechizo en el contexto de un personaje (conocido, preparado, etc.)
 */
export interface CharacterSpell {
  spellId: string;
  /** Si el hechizo está preparado (para clases que preparan) */
  prepared: boolean;
  /** Si está siempre preparado (hechizos de dominio/subclase) */
  alwaysPrepared: boolean;
  /** Si es un hechizo aprendido de forma gratuita (por nivel) */
  freeLearn: boolean;
  /** Fuente: clase, subclase, raza, objeto, etc. */
  source: string;
}

// ─── Espacios de hechizo ─────────────────────────────────────────────

/**
 * Espacios de hechizo por nivel (1-9, no incluye trucos)
 */
export interface SpellSlots {
  /** Espacios totales por nivel */
  total: Record<number, number>;
  /** Espacios usados por nivel */
  used: Record<number, number>;
}

/**
 * Espacios de hechizo de pacto del Brujo (sistema separado)
 */
export interface PactMagicSlots {
  /** Nivel de los espacios de pacto */
  slotLevel: number;
  /** Número total de espacios */
  total: number;
  /** Número de espacios usados */
  used: number;
}

// ─── Tipos de lanzador y preparación ─────────────────────────────────

export type CasterType = "full" | "half" | "pact" | "none";

export type SpellPreparationType = "known" | "prepared" | "spellbook" | "none";

// ─── Recursos mágicos especiales ─────────────────────────────────────

/**
 * Puntos de hechicería del Hechicero
 */
export interface SorceryPoints {
  /** Puntos totales (= nivel de Hechicero) */
  total: number;
  /** Puntos restantes */
  remaining: number;
}

export type MetamagicOption =
  | "hechizo_cuidadoso"
  | "hechizo_distante"
  | "hechizo_potenciado"
  | "hechizo_extendido"
  | "hechizo_intensificado"
  | "hechizo_rapido"
  | "hechizo_buscador"
  | "hechizo_sutil"
  | "hechizo_transmutado"
  | "hechizo_duplicado";

/**
 * Invocaciones sobrenaturales del Brujo
 */
export interface EldritchInvocation {
  id: string;
  nombre: string;
  descripcion: string;
  /** Nivel mínimo de Brujo requerido */
  nivelMinimo?: number;
  /** Requisitos previos (otra invocación, pacto, etc.) */
  requisitos?: string;
}

// ─── Estado mágico completo del personaje ────────────────────────────

export interface CharacterMagicState {
  /** Espacios de hechizo estándar */
  spellSlots: SpellSlots;
  /** Espacios de pacto del Brujo (null si no es Brujo) */
  pactSlots: PactMagicSlots | null;
  /** Hechizos conocidos/aprendidos por el personaje */
  characterSpells: CharacterSpell[];
  /** Libro de hechizos del Mago (null si no es Mago) */
  spellbook: string[] | null;
  /** Estado de concentración actual */
  concentration: {
    active: boolean;
    spellId: string | null;
    spellName: string | null;
  };
  /** Puntos de hechicería del Hechicero (null si no es Hechicero) */
  sorceryPoints: SorceryPoints | null;
  /** Opciones de metamagia elegidas (solo Hechicero) */
  metamagicOptions: MetamagicOption[];
  /** Invocaciones del Brujo (null si no es Brujo) */
  invocations: EldritchInvocation[] | null;
  /** Usos de Canalizar Divinidad (Clérigo/Paladín) */
  channelDivinity: { total: number; remaining: number } | null;
  /** Usos de Forma Salvaje (Druida) */
  wildShape: { total: number; remaining: number } | null;
}
