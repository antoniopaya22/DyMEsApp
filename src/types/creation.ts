/**
 * Types for the character creation wizard (HU-02).
 * Extracted from character.ts for separation of concerns.
 */

import type {
  RaceId,
  SubraceId,
  ClassId,
  AbilityScoreMethod,
  AbilityScores,
  BackgroundId,
  SkillKey,
  Personality,
  Alignment,
  Appearance,
  AbilityKey,
  Size,
  DamageType,
  Sexo,
} from "./character";

// ─── Datos de raza personalizada ─────────────────────────────────────

/** Rasgo personalizado para una raza custom */
export interface CustomRaceTrait {
  nombre: string;
  descripcion: string;
}

/** Conjuro innato personalizado para una raza custom */
export interface CustomRacialSpell {
  /** Nombre del conjuro (libre, no necesita coincidir con la base de datos) */
  nombre: string;
  /** Nivel mínimo del personaje para desbloquearlo */
  minLevel: number;
  /** Si es un truco (cantrip) */
  isCantrip: boolean;
}

/** Datos completos de una raza personalizada */
export interface CustomRaceConfig {
  /** Nombre de la raza custom */
  nombre: string;
  /** Descripción libre */
  descripcion: string;
  /** Bonificadores de característica (+1, +2, etc.) */
  abilityBonuses: Partial<Record<AbilityKey, number>>;
  /** Tamaño de la criatura */
  size: Size;
  /** Velocidad base en pies */
  speed: number;
  /** Velocidad de vuelo en pies (0 = sin vuelo) */
  flySpeed?: number;
  /** Velocidad de nado en pies (0 = sin nado) */
  swimSpeed?: number;
  /** Velocidad de trepar en pies (0 = sin trepar) */
  climbSpeed?: number;
  /** Si tiene visión en la oscuridad */
  darkvision: boolean;
  /** Alcance de visión en la oscuridad (si aplica) */
  darkvisionRange?: number;
  /** Rasgos raciales */
  traits: CustomRaceTrait[];
  /** Idiomas conocidos */
  languages: string[];
  /** Resistencias a tipos de daño */
  damageResistances?: DamageType[];
  /** Competencias con armas */
  weaponProficiencies?: string[];
  /** Competencias con armaduras */
  armorProficiencies?: string[];
  /** Competencias con herramientas */
  toolProficiencies?: string[];
  /** Competencias en habilidades (fijas) */
  skillProficiencies?: SkillKey[];
  /** Conjuros innatos */
  racialSpells?: CustomRacialSpell[];
}

// ─── Datos de trasfondo personalizado ─────────────────────────────────

/** Datos completos de un trasfondo personalizado */
export interface CustomBackgroundConfig {
  /** Nombre del trasfondo custom */
  nombre: string;
  /** Descripción libre */
  descripcion: string;
  /** Competencias en habilidades que otorga (exactamente 2) */
  skillProficiencies: SkillKey[];
  /** Competencias con herramientas que otorga */
  toolProficiencies: string[];
  /** Número de idiomas adicionales que otorga */
  extraLanguages: number;
  /** Equipo inicial */
  equipment: string[];
  /** Monedas de oro iniciales */
  startingGold: number;
  /** Nombre del rasgo especial del trasfondo */
  featureName: string;
  /** Descripción del rasgo especial */
  featureDescription: string;
}

// ─── Estado parcial para el wizard de creación (HU-02) ───────────────

export interface CharacterCreationDraft {
  /** Paso actual del wizard (1-11) */
  currentStep: number;
  /** UUID de la partida (modo master) o "current" (modo jugador) */
  campaignId: string;

  // Pasos completados
  nombre?: string;
  sexo?: Sexo;
  raza?: RaceId;
  subraza?: SubraceId;
  /** Datos de la raza personalizada (solo cuando raza === "personalizada") */
  customRaceData?: CustomRaceConfig;
  clase?: ClassId;
  abilityScoreMethod?: AbilityScoreMethod;
  abilityScoresBase?: AbilityScores;
  trasfondo?: BackgroundId;
  /** Datos del trasfondo personalizado (solo cuando trasfondo === "personalizada") */
  customBackgroundData?: CustomBackgroundConfig;
  skillChoices?: SkillKey[];
  spellChoices?: {
    cantrips: string[];
    spells: string[];
    spellbook?: string[];
  };
  equipmentChoices?: Record<string, string>;
  personality?: Personality;
  alineamiento?: Alignment;
  appearance?: Appearance;
  /** Bonificadores de característica libres elegidos (ej: semielfo elige 2 × +1) */
  freeAbilityBonuses?: AbilityKey[];
  /** ID del linaje dracónico elegido (solo para dracónido) */
  dragonLineage?: string;
  /** Herramienta elegida por la raza (ej: enano elige 1 de 3) */
  raceToolChoice?: string;
  /** Truco racial elegido (ej: alto elfo elige 1 truco de mago) */
  racialCantripChoice?: string;

  /** Timestamp para recuperar borradores */
  lastSaved: string;

  // ── Re-creación (reset a nivel 1) ──
  /** Si está presente, indica que estamos re-creando un personaje existente */
  recreatingCharacterId?: string;
  /** Inventory ID del personaje que se está re-creando */
  recreatingInventoryId?: string;
}
