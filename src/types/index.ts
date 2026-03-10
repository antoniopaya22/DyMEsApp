/**
 * Barrel export de todos los tipos de la aplicación DyMEs
 */

// ─── Campaign types (HU-01) ─────────────────────────────────────────
export type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "./campaign";

// ─── Master Mode types (HU-10) ──────────────────────────────────────
export type {
  AppMode,
  Profile,
  MasterCampaign,
  CampaignPlayer,
  SyncedCharacter,
  CreateMasterCampaignInput,
  UpdateMasterCampaignInput,
  LobbyPlayer,
  MasterCampaignWithPlayers,
  CharacterSummary,
} from "./master";

// ─── Supabase DB types ──────────────────────────────────────────────
export type {
  Database,
  ProfileRow,
  CampanaMasterRow,
  CampanaJugadorRow,
  PersonajeRow,
} from "./supabase";

// ─── Character types (HU-02, HU-03, HU-04, HU-08) ──────────────────
export type {
  AbilityKey,
  SkillKey,
  SkillDefinition,
  Alignment,
  Size,
  HitDie,
  ProficiencyLevel,
  AbilityScoreMethod,
  DamageType,
  Condition,
  RaceId,
  SubraceId,
  ClassId,
  SubclassId,
  BackgroundId,
  AbilityScores,
  AbilityScoreDetail,
  AbilityScoresDetailed,
  SkillProficiency,
  SkillProficiencies,
  SavingThrowProficiency,
  SavingThrowProficiencies,
  HitPoints,
  HitDicePool,
  DeathSaves,
  ArmorClassDetail,
  SpeedInfo,
  DamageModifier,
  ActiveCondition,
  Proficiencies,
  Trait,
  Personality,
  Appearance,
  LevelUpRecord,
  ConcentrationState,
  Character,
  CharacterCreationDraft,
} from "./character";

export type { WeaponProperty } from "./item";

export {
  ABILITY_NAMES,
  ABILITY_ABBR,
  SKILLS,
  ALIGNMENT_NAMES,
  CONDITION_NAMES,
  calcModifier,
  calcProficiencyBonus,
  hitDieValue,
  hitDieFixedValue,
  formatModifier,
} from "./character";

// ─── Spell types (HU-06) ────────────────────────────────────────────
export type {
  MagicSchool,
  SpellLevel,
  SpellComponents,
  CastingTimeUnit,
  CastingTime,
  DurationUnit,
  SpellDuration,
  RangeType,
  SpellRange,
  AreaShape,
  SpellArea,
  Spell,
  CharacterSpell,
  SpellSlots,
  PactMagicSlots,
  CasterType,
  SpellPreparationType,
  SorceryPoints,
  MetamagicOption,
  EldritchInvocation,
  CharacterMagicState,
} from "./spell";

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
  calcPreparedSpells,
  calcSpellSaveDC,
  calcSpellAttackBonus,
  getSpellSlots,
  getPactMagicSlots,
  formatSpellComponents,
  formatSpellDuration,
  formatCastingTime,
  formatSpellRange,
} from "./spell";

// ─── Item / Inventory types (HU-07) ─────────────────────────────────
export type {
  ItemCategory,
  WeaponType,
  WeaponRange,
  WeaponDamage,
  WeaponDetails,
  ArmorType,
  ArmorDetails,
  ItemRarity,
  MagicItemDetails,
  InventoryItem,
  CoinType,
  Coins,
  CoinTransaction,
  Inventory,
  EquipmentPack,
  EquipmentPackId,
  EncumbranceTier,
  DetailedEncumbrance,
} from "./item";

export {
  ITEM_CATEGORY_NAMES,
  ITEM_CATEGORY_ICONS,
  WEAPON_TYPE_NAMES,
  WEAPON_PROPERTY_NAMES,
  ARMOR_TYPE_NAMES,
  ITEM_RARITY_NAMES,
  ITEM_RARITY_COLORS,
  COIN_NAMES,
  COIN_ABBR,
  COIN_ICONS,
  COIN_TO_GOLD_RATE,
  DEFAULT_COINS,
  EQUIPMENT_PACK_IDS,
  calcTotalWeight,
  calcCoinWeight,
  calcInventoryWeight,
  calcCarryingCapacity,
  isEncumbered,
  calcEncumbrancePercentage,
  calcDetailedEncumbrance,
  calcTotalGoldValue,
  countActiveAttunements,
  canAttune,
  getEquippedItems,
  getEquippedWeapons,
  getEquippedArmor,
  getEquippedShield,
  calcArmorClass,
  calcWeaponAttackBonus,
  calcWeaponDamageModifier,
  formatWeaponDamage,
  createDefaultInventory,
  createEmptyItem,
} from "./item";

// ─── Trait effect types ──────────────────────────────────────────────
export type {
  ACFormula,
  ACFormulaEffect,
  ACBonusEffect,
  SpeedBonusEffect,
  DamageModifierEffect,
  ProficiencyEffect,
  SkillProficiencyEffect,
  SavingThrowProficiencyEffect,
  InitiativeBonusEffect,
  HPBonusEffect,
  DarkvisionEffect,
  LimitedUseEffect,
  TraitEffect,
} from "./traitEffects";

// ─── Notes types (HU-09) ────────────────────────────────────────────
export type {
  NoteType,
  PredefinedTag,
  NoteTag,
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  QuickNoteInput,
  NoteFilters,
  NoteSortField,
  NoteSortOrder,
  NoteSortOptions,
  NotesState,
} from "./notes";

export {
  NOTE_TYPE_NAMES,
  PREDEFINED_TAG_NAMES,
  PREDEFINED_TAG_ICONS,
  PREDEFINED_TAG_COLORS,
  createDefaultNote,
  createQuickNote,
  getPredefinedTags,
  filterNotes,
  sortNotes,
  getNotePreview,
  getNextSessionNumber,
} from "./notes";
