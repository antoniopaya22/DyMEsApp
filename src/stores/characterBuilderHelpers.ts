/**
 * characterBuilderHelpers.ts
 *
 * Pure helper functions extracted from the `buildCharacter()` method in
 * `creationStore.ts`.  Each function is independently testable, takes only
 * plain data as input, and produces a deterministic result (with the sole
 * exception of `randomUUID()` calls for trait IDs).
 */

import { randomUUID } from "expo-crypto";

import type {
  AbilityScores,
  AbilityKey,
  AbilityScoresDetailed,
  AbilityScoreDetail,
  SkillKey,
  SkillProficiencies,
  SavingThrowProficiencies,
  Proficiencies,
  DamageModifier,
  Trait,
  ClassId,
  Character,
} from "@/types/character";
import { calcModifier, calcProficiencyBonus, SKILLS } from "@/types/character";
import { resolveLimitedUse } from "@/utils/character";
import { CLASS_SPELL_PREPARATION, SPELLS_KNOWN } from "@/constants/spells";
import type { TraitEffect } from "@/types/traitEffects";
import type { TraitEffectMutations } from "@/utils/traitEffects";
import type { CustomRaceConfig } from "@/types/creation";
import type { RaceId, SubraceId } from "@/types/character";
import { getRacialSpellsForLevel } from "@/data/srd/races";

// ─── Parameter interfaces ────────────────────────────────────────────

/** Sources used by {@link buildSkillProficiencies}. */
export interface SkillDataSources {
  backgroundSkills: SkillKey[];
  raceSkills?: SkillKey[];
  playerChoices?: SkillKey[];
}

/** A single trait coming from a data source (race, subrace, class, etc.). */
export interface TraitSource {
  nombre: string;
  descripcion: string;
  efectos?: TraitEffect[];
}

/** Sources used by {@link buildCharacterTraits}. */
export interface TraitDataSources {
  raceTraits: TraitSource[];
  subraceTraits?: TraitSource[];
  classLevel1Features: TraitSource[];
  backgroundFeatureName: string;
  backgroundFeatureDescription: string;
}

/** Sources used by {@link buildProficiencies}. */
export interface ProficiencyDataSources {
  classArmors: string[];
  classWeapons: string[];
  classTools: string[];
  raceWeapons?: string[];
  raceArmors?: string[];
  raceTools?: string[];
  raceLanguages: string[];
  subraceWeapons?: string[];
  subraceArmors?: string[];
  subraceTools?: string[];
  backgroundTools?: string[];
  /** Herramienta elegida por el jugador (ej: enano elige una herramienta de artesano) */
  raceToolChoice?: string;
}

/** Spell choices coming from the character-creation draft. */
export interface SpellChoices {
  cantrips?: string[];
  spells?: string[];
  spellbook?: string[];
}

/** Return type of {@link buildInitialSpells}. */
export interface InitialSpellState {
  knownSpellIds: string[];
  preparedSpellIds: string[];
  spellbookIds: string[];
}

// ─── Helper functions ────────────────────────────────────────────────

/**
 * Build the detailed ability-score record for a new character.
 *
 * Merges the base point-buy / rolled scores with racial bonuses and any
 * free-choice racial bonuses (e.g. half-elf's two +1s).
 *
 * @param baseScores      Raw ability scores before any bonuses.
 * @param racialBonuses   Fixed racial bonuses (result of `getTotalRacialBonuses`).
 * @param freeAbilityBonuses Optional array of ability keys chosen freely by the
 *                           player (each occurrence adds +1).
 * @returns A full {@link AbilityScoresDetailed} record with modifiers calculated.
 */
export function buildAbilityScoresDetailed(
  baseScores: AbilityScores,
  racialBonuses: Partial<Record<AbilityKey, number>>,
  freeAbilityBonuses?: AbilityKey[],
): AbilityScoresDetailed {
  // Calcular bonificadores libres (ej: semielfo elige 2 × +1)
  const freeBonuses: Partial<Record<AbilityKey, number>> = {};
  if (freeAbilityBonuses && freeAbilityBonuses.length > 0) {
    for (const key of freeAbilityBonuses) {
      freeBonuses[key] = (freeBonuses[key] ?? 0) + 1;
    }
  }

  // Construir puntuaciones de característica detalladas
  const abilityKeys: AbilityKey[] = ["fue", "des", "con", "int", "sab", "car"];
  const abilityScores = {} as AbilityScoresDetailed;

  for (const key of abilityKeys) {
    const base = baseScores[key];
    const racial = (racialBonuses[key] ?? 0) + (freeBonuses[key] ?? 0);
    const total = base + racial;
    const detail: AbilityScoreDetail = {
      base,
      racial,
      improvement: 0,
      misc: 0,
      override: null,
      total,
      modifier: calcModifier(total),
    };
    abilityScores[key] = detail;
  }

  return abilityScores;
}

/**
 * Build the skill-proficiency map for a new character.
 *
 * Layers proficiency sources in order: background → race → player choices.
 * Later sources do **not** overwrite earlier ones if the skill is already
 * proficient (matching the original build logic).
 *
 * @param sources Object containing the three possible skill-proficiency sources.
 * @returns A complete {@link SkillProficiencies} record.
 */
export function buildSkillProficiencies(
  sources: SkillDataSources,
): SkillProficiencies {
  const skillProficiencies = {} as SkillProficiencies;
  const allSkillKeys = Object.keys(SKILLS) as SkillKey[];

  // Inicializar todas como "none"
  for (const sk of allSkillKeys) {
    skillProficiencies[sk] = { level: "none" };
  }

  // Habilidades del trasfondo
  for (const sk of sources.backgroundSkills) {
    skillProficiencies[sk] = { level: "proficient", source: "trasfondo" };
  }

  // Habilidades de la raza
  if (sources.raceSkills) {
    for (const sk of sources.raceSkills) {
      skillProficiencies[sk] = { level: "proficient", source: "raza" };
    }
  }

  // Habilidades elegidas por el jugador (clase + raza si aplica)
  if (sources.playerChoices) {
    for (const sk of sources.playerChoices) {
      if (skillProficiencies[sk].level === "none") {
        skillProficiencies[sk] = { level: "proficient", source: "clase" };
      }
    }
  }

  return skillProficiencies;
}

/**
 * Build the full list of character traits from all creation-time sources.
 *
 * Each trait is assigned a fresh `randomUUID()` identifier.
 *
 * @param sources Object containing trait arrays from race, subrace, class, and
 *                background.
 * @returns An array of {@link Trait} objects ready to be stored on the character.
 */
export function buildCharacterTraits(sources: TraitDataSources): Trait[] {
  const traits: Trait[] = [];

  // Rasgos de raza
  for (const trait of sources.raceTraits) {
    const { maxUses, currentUses, recharge } = resolveLimitedUse(
      trait.efectos,
      1,
    );
    traits.push({
      id: randomUUID(),
      nombre: trait.nombre,
      descripcion: trait.descripcion,
      origen: "raza",
      maxUses,
      currentUses,
      recharge,
      efectos: trait.efectos?.length ? trait.efectos : undefined,
    });
  }

  // Rasgos de subraza
  if (sources.subraceTraits) {
    for (const trait of sources.subraceTraits) {
      const { maxUses, currentUses, recharge } = resolveLimitedUse(
        trait.efectos,
        1,
      );
      traits.push({
        id: randomUUID(),
        nombre: trait.nombre,
        descripcion: trait.descripcion,
        origen: "raza",
        maxUses,
        currentUses,
        recharge,
        efectos: trait.efectos?.length ? trait.efectos : undefined,
      });
    }
  }

  // Rasgos de clase (nivel 1)
  for (const feature of sources.classLevel1Features) {
    const { maxUses, currentUses, recharge } = resolveLimitedUse(
      feature.efectos,
      1,
    );
    traits.push({
      id: randomUUID(),
      nombre: feature.nombre,
      descripcion: feature.descripcion,
      origen: "clase",
      maxUses,
      currentUses,
      recharge,
      efectos: feature.efectos?.length ? feature.efectos : undefined,
    });
  }

  // Rasgo de trasfondo
  traits.push({
    id: randomUUID(),
    nombre: sources.backgroundFeatureName,
    descripcion: sources.backgroundFeatureDescription,
    origen: "trasfondo",
    maxUses: null,
    currentUses: null,
    recharge: null,
  });

  return traits;
}

/**
 * Merge all proficiency sources (class, race, subrace, background) into a
 * single {@link Proficiencies} object.
 *
 * @param sources Object containing arrays of proficiency strings from each
 *                source.
 * @returns A consolidated {@link Proficiencies} record.
 */
export function buildProficiencies(
  sources: ProficiencyDataSources,
): Proficiencies {
  return {
    armors: [
      ...sources.classArmors,
      ...(sources.raceArmors ?? []),
      ...(sources.subraceArmors ?? []),
    ],
    weapons: [
      ...sources.classWeapons,
      ...(sources.raceWeapons ?? []),
      ...(sources.subraceWeapons ?? []),
    ],
    tools: [
      ...sources.classTools,
      ...(sources.backgroundTools ?? []),
      ...(sources.subraceTools ?? []),
      ...(sources.raceTools ?? []),
      ...(sources.raceToolChoice ? [sources.raceToolChoice] : []),
    ],
    languages: [...sources.raceLanguages],
  };
}

/**
 * Build the initial known / prepared / spellbook spell-ID arrays from the
 * player's spell choices during character creation.
 *
 * For wizards (`clase === "mago"`), the spellbook is also populated.
 * Known spells of level ≥ 1 are automatically marked as prepared.
 * Racial cantrips/spells available at level 1 are also injected.
 *
 * @param spellChoices     The spell selections made during creation (may be
 *                         `undefined` for non-caster classes).
 * @param clase            The class identifier string.
 * @param racialSpellIds   Racial spell IDs available at level 1 (cantrips and
 *                         any level-1 racial spells). Optional.
 * @returns An {@link InitialSpellState} with the three spell-ID arrays.
 */
export function buildInitialSpells(
  spellChoices: SpellChoices | undefined,
  clase: string,
  racialSpellIds?: string[],
): InitialSpellState {
  const knownSpellIds: string[] = [];
  const preparedSpellIds: string[] = [];
  const spellbookIds: string[] = [];

  // Añadir conjuros innatos raciales (trucos y hechizos de nivel 1)
  if (racialSpellIds) {
    for (const spellId of racialSpellIds) {
      if (!knownSpellIds.includes(spellId)) {
        knownSpellIds.push(spellId);
      }
    }
  }

  if (spellChoices) {
    // Determinar si es lanzador preparado puro (Clérigo, Druida, Paladín)
    // Estos lanzadores tienen acceso a toda su lista de clase y no almacenan
    // conjuros de nivel 1+ en knownSpellIds — solo en preparedSpellIds.
    const isPreparedCaster =
      CLASS_SPELL_PREPARATION[clase as ClassId] === "prepared" &&
      !SPELLS_KNOWN[clase as ClassId];

    // Trucos: siempre a knownSpellIds (evitando duplicados con raciales)
    for (const spellId of spellChoices.cantrips ?? []) {
      if (!knownSpellIds.includes(spellId)) {
        knownSpellIds.push(spellId);
      }
    }

    if (isPreparedCaster) {
      // Lanzadores preparados: conjuros nivel 1+ solo a preparedSpellIds
      preparedSpellIds.push(...(spellChoices.spells ?? []));
    } else {
      // Otros lanzadores: conjuros a knownSpellIds + preparedSpellIds
      for (const spellId of spellChoices.spells ?? []) {
        if (!knownSpellIds.includes(spellId)) {
          knownSpellIds.push(spellId);
        }
      }
      // Los conjuros conocidos se preparan automáticamente a nivel 1
      preparedSpellIds.push(...(spellChoices.spells ?? []));
    }

    // Para magos, también llenar el libro de hechizos
    if (clase === "mago" && spellChoices.spellbook) {
      spellbookIds.push(...spellChoices.spellbook);
    }
  }

  return { knownSpellIds, preparedSpellIds, spellbookIds };
}

// ─── Phase 6a: Additional helpers extracted from buildCharacter() ────

/**
 * Build the initial saving-throw proficiency map from class data.
 *
 * @param classSavingThrows Array of ability keys the class is proficient in.
 * @returns A complete {@link SavingThrowProficiencies} record.
 */
export function buildSavingThrows(
  classSavingThrows: AbilityKey[],
): SavingThrowProficiencies {
  const abilityKeys: AbilityKey[] = ["fue", "des", "con", "int", "sab", "car"];
  const savingThrows = {} as SavingThrowProficiencies;
  for (const key of abilityKeys) {
    savingThrows[key] = {
      proficient: classSavingThrows.includes(key),
      source: classSavingThrows.includes(key) ? "clase" : undefined,
    };
  }
  return savingThrows;
}

/**
 * Apply trait-effect mutations to an existing saving-throw map.
 *
 * Traits can grant saving-throw proficiency (e.g. gnome Cunning).
 * Only applies if the character isn't already proficient in that save.
 *
 * @param savingThrows The saving-throw map to mutate in place.
 * @param mutations    Trait-effect mutations (may contain `savingThrowChanges`).
 */
export function applySavingThrowMutations(
  savingThrows: SavingThrowProficiencies,
  mutations: TraitEffectMutations,
): void {
  if (!mutations.savingThrowChanges) return;
  for (const change of mutations.savingThrowChanges) {
    if (!savingThrows[change.ability].proficient) {
      savingThrows[change.ability] = {
        proficient: change.proficient,
        source: "rasgo",
      };
    }
  }
}

/**
 * Resolve the base darkvision distance before trait-effect mutations.
 *
 * Custom races get 60 ft if darkvision is enabled, 0 otherwise.
 * SRD races use their racial/subracial data.
 *
 * @param isCustomRace  Whether the race is "personalizada".
 * @param customRaceData Custom race configuration (if custom).
 * @param raceData       SRD race data (needs `.darkvision`, `.darkvisionRange`).
 * @param subraceData    SRD subrace data (optional, for `.darkvisionOverride`).
 * @returns Darkvision distance in feet.
 */
export function buildBaseDarkvision(
  isCustomRace: boolean,
  customRaceData: CustomRaceConfig | undefined,
  raceData: { darkvision?: boolean; darkvisionRange?: number },
  subraceData: { darkvisionOverride?: number } | null,
): number {
  if (isCustomRace) {
    return customRaceData?.darkvision ? 60 : 0;
  }
  return raceData.darkvision
    ? (subraceData?.darkvisionOverride ?? raceData.darkvisionRange ?? 60)
    : 0;
}

/**
 * Resolve the final darkvision after applying trait mutations.
 *
 * Takes the max of base darkvision and any trait-granted darkvision.
 *
 * @param baseDarkvision Base darkvision from race/subrace.
 * @param mutations      Trait-effect mutations.
 * @returns Final darkvision distance in feet.
 */
export function resolveFinalDarkvision(
  baseDarkvision: number,
  mutations: TraitEffectMutations,
): number {
  return mutations.darkvisionUpdate !== undefined
    ? Math.max(baseDarkvision, mutations.darkvisionUpdate)
    : baseDarkvision;
}

/**
 * Build the damage modifiers (resistances/immunities/vulnerabilities) array.
 *
 * Custom races use player-configured resistances.
 * SRD races derive them from trait-effect mutations.
 *
 * @param isCustomRace    Whether the race is "personalizada".
 * @param customRaceData  Custom race configuration (if custom).
 * @param traitMutations  Trait-effect mutations.
 * @returns Array of {@link DamageModifier}.
 */
export function buildDamageModifiers(
  isCustomRace: boolean,
  customRaceData: CustomRaceConfig | undefined,
  traitMutations: TraitEffectMutations,
): DamageModifier[] {
  if (isCustomRace && customRaceData?.damageResistances) {
    return customRaceData.damageResistances.map((type) => ({
      type,
      modifier: "resistance" as const,
      source: customRaceData.nombre || "Raza personalizada",
    }));
  }
  return traitMutations.newDamageModifiers ?? [];
}

/**
 * Resolve racial spell IDs available at level 1.
 *
 * Custom races pull from their configured `racialSpells` array.
 * SRD races use `getRacialSpellsForLevel()`.
 *
 * @param isCustomRace    Whether the race is "personalizada".
 * @param customRaceData  Custom race configuration (if custom).
 * @param raza            Race ID.
 * @param subraza         Subrace ID (or null/undefined).
 * @returns Array of spell ID strings.
 */
export function resolveRacialSpellIdsForLevel1(
  isCustomRace: boolean,
  customRaceData: CustomRaceConfig | undefined,
  raza: RaceId,
  subraza: SubraceId | null | undefined,
): string[] {
  if (isCustomRace && customRaceData?.racialSpells) {
    return customRaceData.racialSpells
      .filter((s) => s.minLevel <= 1)
      .map((s) => s.nombre.toLowerCase().replace(/\s+/g, "_"));
  }
  if (!isCustomRace) {
    return getRacialSpellsForLevel(raza, subraza ?? null, 1).map(
      (s) => s.spellId,
    );
  }
  return [];
}

/**
 * Build the initial level-history entry for a freshly created character.
 *
 * @param timestamp     Creation timestamp (ISO-8601 string from `now()`).
 * @param maxHP         Max HP at level 1.
 * @param knownSpellIds Known spell IDs at level 1 (empty if non-caster).
 * @returns A single-element level-history array.
 */
export function buildInitialLevelHistory(
  timestamp: string,
  maxHP: number,
  knownSpellIds: string[],
): Character["levelHistory"] {
  return [
    {
      level: 1,
      date: timestamp,
      hpGained: maxHP,
      hpMethod: "fixed",
      spellsLearned: knownSpellIds.length > 0 ? [...knownSpellIds] : undefined,
    },
  ];
}
