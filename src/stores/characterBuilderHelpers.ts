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
  Proficiencies,
  Trait,
} from "@/types/character";
import { calcModifier, SKILLS } from "@/types/character";

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
export function buildCharacterTraits(
  sources: TraitDataSources,
): Trait[] {
  const traits: Trait[] = [];

  // Rasgos de raza
  for (const trait of sources.raceTraits) {
    traits.push({
      id: randomUUID(),
      nombre: trait.nombre,
      descripcion: trait.descripcion,
      origen: "raza",
      maxUses: null,
      currentUses: null,
      recharge: null,
    });
  }

  // Rasgos de subraza
  if (sources.subraceTraits) {
    for (const trait of sources.subraceTraits) {
      traits.push({
        id: randomUUID(),
        nombre: trait.nombre,
        descripcion: trait.descripcion,
        origen: "raza",
        maxUses: null,
        currentUses: null,
        recharge: null,
      });
    }
  }

  // Rasgos de clase (nivel 1)
  for (const feature of sources.classLevel1Features) {
    traits.push({
      id: randomUUID(),
      nombre: feature.nombre,
      descripcion: feature.descripcion,
      origen: "clase",
      maxUses: null,
      currentUses: null,
      recharge: null,
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
    languages: [
      ...sources.raceLanguages,
    ],
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
    // Añadir conjuros de clase (evitando duplicados con raciales)
    for (const spellId of [
      ...(spellChoices.cantrips ?? []),
      ...(spellChoices.spells ?? []),
    ]) {
      if (!knownSpellIds.includes(spellId)) {
        knownSpellIds.push(spellId);
      }
    }

    // Para magos, también llenar el libro de hechizos
    if (clase === "mago" && spellChoices.spellbook) {
      spellbookIds.push(...spellChoices.spellbook);
    }

    // Los conjuros conocidos se preparan automáticamente a nivel 1
    preparedSpellIds.push(...(spellChoices.spells ?? []));
  }

  return { knownSpellIds, preparedSpellIds, spellbookIds };
}
