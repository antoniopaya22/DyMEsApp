/**
 * Barrel export de todos los datos SRD de D&D 5e en español.
 */

// ─── Razas ───────────────────────────────────────────────────────────
export {
  RACES,
  DRAGON_LINEAGES,
  RACE_ICONS,
  EXPANSION_RACE_IDS,
  AVAILABLE_LANGUAGES,
  getRaceData,
  getSubraceData,
  getTotalRacialBonuses,
  getAllRaceTraits,
  getRaceList,
  hasSubraces,
  getRacialSpellsForLevel,
  getRacialSpellsUnlockedAtLevel,
} from "./races";

export type { RaceData, SubraceData, RaceTrait, DragonLineage, RacialSpellcasting, RacialSpellEntry } from "./races";

// ─── Clases ──────────────────────────────────────────────────────────
export {
  CLASSES,
  CLASS_ICONS,
  SPELLCASTING_DESCRIPTIONS,
  CLASS_CASTER_TYPE_FROM_CLASSES,
  SPELLCASTING_ABILITY_FROM_CLASSES,
  CLASS_SPELL_PREPARATION_FROM_CLASSES,
  getClassData,
  getClassList,
  isSpellcaster,
  hasSpellsAtLevel1,
  calcLevel1HP,
} from "./classes";

export type { ClassData, ClassFeature, EquipmentChoice } from "./classes";

// ─── Trasfondos ──────────────────────────────────────────────────────
export {
  BACKGROUNDS,
  BACKGROUND_ICONS,
  EXPANSION_BACKGROUND_IDS,
  getBackgroundData,
  getBackgroundList,
  getBackgroundSkills,
  getRandomPersonalityTrait,
  getRandomIdeal,
  getRandomBond,
  getRandomFlaw,
  generateRandomPersonality,
  buildBackgroundDataFromCustom,
} from "./backgrounds";

export type { BackgroundData, BackgroundPersonality } from "./backgrounds";

// ─── Progresión de nivel ─────────────────────────────────────────────
export {
  XP_THRESHOLDS,
  MAX_LEVEL,
  MAX_XP,
  ASI_LEVELS,
  MAX_ABILITY_SCORE,
  ASI_POINTS,
  CLASS_LEVEL_FEATURES,
  SNEAK_ATTACK_DICE,
  RAGE_USES,
  RAGE_DAMAGE,
  MARTIAL_ARTS_DIE,
  WARLOCK_INVOCATIONS,
  getLevelForXP,
  getXPForNextLevel,
  getXPProgress,
  canLevelUp,
  getFeaturesForLevel,
  isASILevel,
  isSubclassLevel,
  getLevelUpSummary,
  formatXP,
  proficiencyBonusChanges,
  getRemainingASILevels,
  getSpellLearningInfo,
  getMaxSpellLevelForClass,
} from "./leveling";

export type { LevelFeature, LevelUpSummary, SpellLearningInfo } from "./leveling";

// ─── Subclases ───────────────────────────────────────────────────────
export {
  SUBCLASS_OPTIONS,
  getSubclassOptions,
  getSubclassById,
} from "./subclasses";

export type { SubclassOption } from "./subclasses";

// ─── Hechizos (base de datos SRD) ───────────────────────────────────
export {
  SRD_SPELLS,
  getSpellById,
  getSpellsForClass,
  getSpellsForClassUpToLevel,
  getCantripsForClass,
} from "./spells";

export type { SrdSpell, SrdMagicSchool } from "./spells";

// ─── Descripciones de hechizos (auto-generado) ──────────────────────
export { getSpellDescription } from "./spellDescriptions";
export type { SpellDescription } from "./spellDescriptions";

// ─── Catálogo de objetos SRD ─────────────────────────────────────────
export { findSrdItem, getAllSrdItems } from "./items";
export type { SrdItemTemplate } from "./items";

// ─── Rasgos de subclase ─────────────────────────────────────────────
export {
  SUBCLASS_FEATURES,
  getSubclassFeatures,
  getSubclassFeaturesForLevel,
  getSubclassFeaturesUpToLevel,
  getSubclassChoicesForLevel,
} from "./subclassFeatures";

export type {
  SubclassChoiceOption,
  SubclassFeatureChoice,
  SubclassFeatureDetail,
  SubclassLevelBlock,
  SubclassFeatureData,
} from "./subclassFeatures";
