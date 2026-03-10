/**
 * Pure helper functions extracted from the levelUp() method in progressionSlice.
 * Each function is side-effect free and independently testable.
 */

import type {
  Character,
  AbilityKey,
  AbilityScores,
  AbilityScoresDetailed,
  LevelUpRecord,
  Trait,
  Proficiencies,
} from "@/types/character";
import {
  calcModifier,
  calcProficiencyBonus,
  ABILITY_ABBR,
} from "@/types/character";
import { ABILITY_KEYS } from "@/constants/abilities";
import { now } from "@/utils/providers";
import type { LevelUpSummary } from "@/data/srd/leveling";
import { getSubclassOptions } from "@/data/srd/subclasses";
import { getSubclassFeaturesForLevel } from "@/data/srd/subclassFeatures";
import { getRacialSpellsUnlockedAtLevel } from "@/data/srd/races";
import { getFeatById, type Feat } from "@/data/srd/feats";
import { hitDieValue, resolveLimitedUse } from "@/utils/character";
import { rollDie, createDefaultMagicState } from "./helpers";
import type { InternalMagicState } from "./helpers";
import type { LevelUpOptions } from "./types";
import type { TraitEffectMutations } from "@/utils/traitEffects";

// ─── Return types ────────────────────────────────────────────────────

export interface HPGainResult {
  /** The base die roll (or fixed value) before CON modifier */
  hpRoll: number;
  /** Total HP gained this level (max(1, hpRoll + conMod)) */
  hpGained: number;
  /** Constitution modifier used for the calculation */
  conMod: number;
}

export interface ASIResult {
  /** Ability scores after applying the improvements */
  updatedScores: AbilityScoresDetailed;
  /** Difference in CON modifier caused by the improvements */
  conModDiff: number;
  /** Retroactive HP gained from increased CON (conModDiff * currentLevel) */
  retroactiveHP: number;
}

// ─── 1. applyHPGain ─────────────────────────────────────────────────

/**
 * Calculates HP gained from a level up.
 *
 * @param character - The character before leveling up.
 * @param options   - Level-up options (hpMethod, hpRolled).
 * @param dieSides  - Number of sides on the character's hit die.
 * @returns The HP roll, total HP gained, and CON modifier used.
 */
export function applyHPGain(
  character: Character,
  options: Pick<LevelUpOptions, "hpMethod" | "hpRolled">,
  dieSides: number,
  hpBonusPerLevel: number = 0,
): HPGainResult {
  let hpRoll: number;
  if (options.hpMethod === "fixed") {
    hpRoll = Math.ceil(dieSides / 2) + 1;
  } else {
    hpRoll = options.hpRolled ?? rollDie(dieSides);
  }
  const conMod = calcModifier(character.abilityScores.con.total);
  const hpGained = Math.max(1, hpRoll + conMod) + hpBonusPerLevel;

  return { hpRoll, hpGained, conMod };
}

// ─── 2. applyASI ────────────────────────────────────────────────────

/**
 * Applies Ability Score Improvements (ASI) to the character's ability scores.
 *
 * @param abilityScores       - Current detailed ability scores.
 * @param summary             - Level-up summary (used to check hasASI).
 * @param options             - Level-up options containing the improvements map.
 * @param currentConMod       - CON modifier before improvements.
 * @param currentLevel        - Character's level before leveling up (for retroactive HP).
 * @returns Updated scores, CON modifier difference, and retroactive HP.
 */
export function applyASI(
  abilityScores: AbilityScoresDetailed,
  summary: Pick<LevelUpSummary, "hasASI">,
  options: Pick<
    LevelUpOptions,
    "abilityImprovements" | "featChosen" | "featAsiChoices"
  >,
  currentConMod: number,
  currentLevel: number,
): ASIResult {
  const updatedScores = { ...abilityScores };

  if (summary.hasASI) {
    // Determine which ability improvements to apply:
    // - Standard ASI: abilityImprovements (when no feat chosen)
    // - Feat ASI: featAsiChoices (when a feat is chosen that grants ASI)
    const improvements = options.featChosen
      ? options.featAsiChoices
      : options.abilityImprovements;

    if (improvements) {
      for (const [key, value] of Object.entries(improvements)) {
        const abilityKey = key as AbilityKey;
        if (updatedScores[abilityKey] && value) {
          const currentDetail = { ...updatedScores[abilityKey] };
          currentDetail.improvement += value;
          currentDetail.total =
            currentDetail.base +
            currentDetail.racial +
            currentDetail.improvement +
            currentDetail.misc;
          if (currentDetail.override !== null) {
            currentDetail.total = currentDetail.override;
          }
          currentDetail.total = Math.min(20, currentDetail.total);
          currentDetail.modifier = calcModifier(currentDetail.total);
          updatedScores[abilityKey] = currentDetail;
        }
      }
    }
  }

  const newConMod = calcModifier(updatedScores.con.total);
  const conModDiff = newConMod - currentConMod;
  const retroactiveHP = conModDiff > 0 ? conModDiff * currentLevel : 0;

  return { updatedScores, conModDiff, retroactiveHP };
}

// ─── 3. buildNewTraits ──────────────────────────────────────────────

/**
 * Builds Trait[] from class features gained at this level (NOT subclass features).
 * Generic subclass placeholders (esSubclase === true) are excluded when detailed
 * subclass data exists, because buildSubclassTraits produces the specific traits.
 *
 * @param character - The character leveling up.
 * @param summary   - Level-up summary containing the features list.
 * @param newLevel  - The new level being reached.
 * @param options   - Level-up options (used to check subclassChosen).
 * @returns Array of Trait objects for the class features.
 */
export function buildNewTraits(
  character: Character,
  summary: Pick<LevelUpSummary, "features">,
  newLevel: number,
  options: Pick<LevelUpOptions, "subclassChosen">,
): Trait[] {
  return summary.features
    .filter((f) => {
      if (!f.esSubclase) return true;

      // Subclass placeholder — check if detailed subclass data will handle it
      const subclassName = options.subclassChosen ?? character.subclase;
      if (!subclassName) return false; // no subclass at all → skip placeholder

      // Resolve the subclass ID and check for detailed feature data
      const opts = getSubclassOptions(character.clase);
      const match = opts.find((o) => o.nombre === subclassName);
      if (match) {
        const block = getSubclassFeaturesForLevel(
          character.clase,
          match.id,
          newLevel,
        );
        // Detailed data exists → buildSubclassTraits handles it → exclude placeholder
        if (block) return false;
      }

      // Custom subclass or no detailed data → keep generic placeholder as fallback
      return true;
    })
    .map((f) => {
      const { maxUses, currentUses, recharge } = resolveLimitedUse(
        f.efectos,
        newLevel,
      );
      return {
        id: `${character.clase}_${f.nombre.toLowerCase().replace(/\s+/g, "_")}_nv${newLevel}`,
        nombre: f.nombre,
        descripcion: f.descripcion,
        origen: (f.esSubclase ? "subclase" : "clase") as Trait["origen"],
        maxUses,
        currentUses,
        recharge,
        efectos: f.efectos?.length ? f.efectos : undefined,
      };
    });
}

// ─── 4. buildSubclassTraits ─────────────────────────────────────────

/**
 * Builds Trait[] from subclass features gained at this level.
 * Resolves the active subclass ID from options or existing character data,
 * then fetches detailed subclass features for the level.
 *
 * @param character - The character leveling up.
 * @param newLevel  - The new level being reached.
 * @param options   - Level-up options (subclassChosen, subclassFeatureChoices).
 * @returns Array of Trait objects for the subclass features.
 */
export function buildSubclassTraits(
  character: Character,
  newLevel: number,
  options: Pick<LevelUpOptions, "subclassChosen" | "subclassFeatureChoices">,
): Trait[] {
  const traits: Trait[] = [];

  // Resolve active subclass ID
  const activeSubclassId = (() => {
    const searchName = options.subclassChosen ?? character.subclase;
    if (!searchName) return null;
    const opts = getSubclassOptions(character.clase);
    const match = opts.find((o) => o.nombre === searchName);
    return match?.id ?? null;
  })();

  if (!activeSubclassId) return traits;

  const subLevelBlock = getSubclassFeaturesForLevel(
    character.clase,
    activeSubclassId,
    newLevel,
  );

  if (!subLevelBlock) return traits;

  const featureChoicesMap = new Map(
    (options.subclassFeatureChoices ?? []).map((c) => [
      c.choiceId,
      c.selectedOptionIds,
    ]),
  );

  for (const rasgo of subLevelBlock.rasgos) {
    let descripcionFinal = rasgo.descripcion;
    if (rasgo.elecciones && rasgo.elecciones.length > 0) {
      for (const eleccion of rasgo.elecciones) {
        const selectedIds = featureChoicesMap.get(eleccion.id);
        if (selectedIds && selectedIds.length > 0) {
          const selectedNames = selectedIds
            .map((sid) => {
              const opt = eleccion.opciones.find((o) => o.id === sid);
              return opt ? `${opt.nombre}: ${opt.descripcion}` : sid;
            })
            .join("\n");
          descripcionFinal += `\n\n🎯 Elegido — ${eleccion.nombre}:\n${selectedNames}`;
        }
      }
    }

    const { maxUses, currentUses, recharge } = resolveLimitedUse(
      rasgo.efectos,
      newLevel,
    );
    traits.push({
      id: `${character.clase}_sub_${rasgo.nombre.toLowerCase().replace(/\s+/g, "_")}_nv${newLevel}`,
      nombre: rasgo.nombre,
      descripcion: descripcionFinal,
      origen: "subclase" as Trait["origen"],
      maxUses,
      currentUses,
      recharge,
      efectos: rasgo.efectos?.length ? rasgo.efectos : undefined,
    });
  }

  // Competencias de subclase
  if (subLevelBlock.competenciasGanadas) {
    const comp = subLevelBlock.competenciasGanadas;
    const compParts: string[] = [];
    if (comp.armaduras)
      compParts.push(`Armaduras: ${comp.armaduras.join(", ")}`);
    if (comp.armas) compParts.push(`Armas: ${comp.armas.join(", ")}`);
    if (comp.herramientas)
      compParts.push(`Herramientas: ${comp.herramientas.join(", ")}`);
    if (compParts.length > 0) {
      traits.push({
        id: `${character.clase}_sub_competencias_nv${newLevel}`,
        nombre: "Competencias de Subclase",
        descripcion: compParts.join(". ") + ".",
        origen: "subclase" as Trait["origen"],
        maxUses: null,
        currentUses: null,
        recharge: null,
        efectos: [
          {
            kind: "proficiency" as const,
            armors: comp.armaduras,
            weapons: comp.armas,
            tools: comp.herramientas,
          },
        ],
      });
    }
  }

  return traits;
}

// ─── 5. buildFeatTrait ──────────────────────────────────────────────

/**
 * Builds a Trait from a chosen Feat, to be added to the character's trait list.
 *
 * @param featId         - The ID of the chosen feat.
 * @param newLevel       - The level at which the feat was chosen.
 * @param featAsiChoices - The actual ASI distribution the player chose (optional).
 * @returns A Trait object representing the feat, or null if the feat was not found.
 */
export function buildFeatTrait(
  featId: string,
  newLevel: number,
  featAsiChoices?: Partial<AbilityScores>,
): Trait | null {
  const feat = getFeatById(featId);
  if (!feat) return null;

  // Collect all trait descriptions from the feat's effects
  const traitDescriptions = feat.efectos
    .filter((e) => e.type === "trait" && e.traitDescription)
    .map((e) => e.traitDescription!);

  // Build a summary of mechanical effects for the description
  const mechanicalParts: string[] = [];
  for (const e of feat.efectos) {
    switch (e.type) {
      case "asi":
        // Show actual choices if available, otherwise show options
        if (featAsiChoices && Object.keys(featAsiChoices).length > 0) {
          const chosenStr = Object.entries(featAsiChoices)
            .filter(([_, v]) => (v ?? 0) > 0)
            .map(([k, v]) => `${ABILITY_ABBR[k as AbilityKey]} +${v}`)
            .join(", ");
          mechanicalParts.push(chosenStr);
        } else {
          mechanicalParts.push(
            `+${e.asiAmount ?? 1} a ${e.asiChoices?.map((k) => ABILITY_ABBR[k]).join("/") ?? "una característica a elegir"}`,
          );
        }
        break;
      case "proficiency":
        mechanicalParts.push(
          `Competencia: ${e.proficiencyValues?.join(", ") ?? e.proficiencyType}`,
        );
        break;
      case "spell":
        mechanicalParts.push(
          `Conjuro${e.spellIds && e.spellIds.length > 1 ? "s" : ""}: ${e.spellIds?.join(", ") ?? "a elegir"}`,
        );
        break;
      case "hp_max":
        if (e.hpBonusPerLevel)
          mechanicalParts.push(`+${e.hpBonusPerLevel} PV por nivel`);
        else if (e.hpBonus) mechanicalParts.push(`+${e.hpBonus} PV máximos`);
        break;
      case "speed":
        mechanicalParts.push(`+${e.speedBonus} pies de velocidad`);
        break;
      case "sense":
        mechanicalParts.push(`${e.senseType} ${e.senseRange} pies`);
        break;
    }
  }

  const fullDescription = [
    feat.descripcion,
    ...(mechanicalParts.length > 0
      ? [`\nEfectos: ${mechanicalParts.join(". ")}.`]
      : []),
    ...(traitDescriptions.length > 0
      ? [`\n${traitDescriptions.join("\n")}`]
      : []),
  ].join("");

  return {
    id: `dote_${featId}_nv${newLevel}`,
    nombre: feat.nombre,
    descripcion: fullDescription,
    origen: "dote",
    maxUses: null,
    currentUses: null,
    recharge: null,
  };
}

/**
 * Extracts HP bonus per level from a feat's effects (e.g., Tough feat).
 */
export function getFeatHpBonusPerLevel(featId: string): number {
  const feat = getFeatById(featId);
  if (!feat) return 0;
  let bonus = 0;
  for (const e of feat.efectos) {
    if (e.type === "hp_max" && e.hpBonusPerLevel) {
      bonus += e.hpBonusPerLevel;
    }
  }
  return bonus;
}

// ─── 6. buildLevelRecord ────────────────────────────────────────────

/**
 * Creates the LevelUpRecord for this level-up.
 *
 * @param newLevel  - The new level reached.
 * @param hpGained  - Total HP gained this level.
 * @param options   - Full level-up options.
 * @param summary   - Level-up summary (for feature names).
 * @returns A LevelUpRecord to be appended to the character's levelHistory.
 */
export function buildLevelRecord(
  newLevel: number,
  hpGained: number,
  options: LevelUpOptions,
  summary: Pick<LevelUpSummary, "features">,
): LevelUpRecord {
  return {
    level: newLevel,
    date: now(),
    hpGained,
    hpMethod: options.hpMethod,
    abilityImprovements: options.abilityImprovements,
    featChosen: options.featChosen,
    featAsiChoices: options.featAsiChoices,
    subclassChosen: options.subclassChosen,
    subclassFeatureChoices: options.subclassFeatureChoices,
    spellsLearned: [
      ...(options.cantripsLearned ?? []),
      ...(options.spellsLearned ?? []),
      ...(options.spellbookAdded ?? []),
    ].filter(Boolean),
    spellsSwapped: options.spellSwapped ? [options.spellSwapped] : undefined,
    traitsGained: summary.features.map((f) => f.nombre),
  };
}

// ─── 7. applyMagicProgression ───────────────────────────────────────

/**
 * Updates magic state with new spells, metamagic, and swaps from level-up.
 * Returns null if no magic state exists.
 *
 * @param character  - The updated character (after level/class change applied).
 * @param magicState - The existing magic state (or null).
 * @param options    - Level-up options with spell choices.
 * @returns Updated InternalMagicState, or null if magicState was null.
 */
export function applyMagicProgression(
  character: Character,
  magicState: InternalMagicState | null,
  options: Pick<
    LevelUpOptions,
    | "cantripsLearned"
    | "spellsLearned"
    | "spellbookAdded"
    | "spellSwapped"
    | "metamagicChosen"
  >,
): InternalMagicState | null {
  if (!magicState) return null;

  const newMagicState = createDefaultMagicState(character);
  newMagicState.knownSpellIds = [...magicState.knownSpellIds];
  newMagicState.preparedSpellIds = [...magicState.preparedSpellIds];
  newMagicState.spellbookIds = [...magicState.spellbookIds];
  newMagicState.favoriteSpellIds = [...magicState.favoriteSpellIds];

  const existingMetamagic = magicState.metamagicChosen ?? [];
  const newMetamagic = options.metamagicChosen ?? [];
  newMagicState.metamagicChosen = [...existingMetamagic, ...newMetamagic];

  // Trucos y hechizos
  const newKnown = [
    ...(options.cantripsLearned ?? []),
    ...(options.spellsLearned ?? []),
  ].filter(Boolean);
  for (const spellId of newKnown) {
    if (!newMagicState.knownSpellIds.includes(spellId)) {
      newMagicState.knownSpellIds.push(spellId);
    }
  }

  // Libro de conjuros (mago)
  const newBookSpells = (options.spellbookAdded ?? []).filter(Boolean);
  for (const spellId of newBookSpells) {
    if (!newMagicState.spellbookIds.includes(spellId)) {
      newMagicState.spellbookIds.push(spellId);
    }
  }

  // Intercambio de hechizo
  if (options.spellSwapped) {
    const [oldSpell, newSpell] = options.spellSwapped;
    const idx = newMagicState.knownSpellIds.indexOf(oldSpell);
    if (idx !== -1) {
      newMagicState.knownSpellIds[idx] = newSpell;
    }
    const prepIdx = newMagicState.preparedSpellIds.indexOf(oldSpell);
    if (prepIdx !== -1) {
      newMagicState.preparedSpellIds.splice(prepIdx, 1);
    }
  }

  // Hechizos raciales desbloqueados en este nivel
  if (
    character.raza === "personalizada" &&
    character.customRaceData?.racialSpells
  ) {
    // Custom race: check racialSpells from the persisted config
    for (const rs of character.customRaceData.racialSpells) {
      if (rs.minLevel === character.nivel) {
        const spellId = rs.nombre.toLowerCase().replace(/\s+/g, "_");
        if (!newMagicState.knownSpellIds.includes(spellId)) {
          newMagicState.knownSpellIds.push(spellId);
        }
      }
    }
  } else {
    const racialSpells = getRacialSpellsUnlockedAtLevel(
      character.raza,
      character.subraza ?? null,
      character.nivel,
    );
    for (const entry of racialSpells) {
      if (!newMagicState.knownSpellIds.includes(entry.spellId)) {
        newMagicState.knownSpellIds.push(entry.spellId);
      }
    }
  }

  return newMagicState;
}

// ─── Phase 6b: Trait-effect & feat mutation helpers ──────────────────

/**
 * Merge proficiency arrays without duplicates.
 */
function mergeProficiencies(
  existing: Proficiencies,
  additions: Partial<Proficiencies>,
): Proficiencies {
  return {
    armors: [...new Set([...existing.armors, ...(additions.armors ?? [])])],
    weapons: [...new Set([...existing.weapons, ...(additions.weapons ?? [])])],
    tools: [...new Set([...existing.tools, ...(additions.tools ?? [])])],
    languages: [
      ...new Set([...existing.languages, ...(additions.languages ?? [])]),
    ],
  };
}

/**
 * Apply trait-effect mutations to a character (immutably).
 *
 * Handles speed updates, damage modifiers, proficiencies, saving throws,
 * darkvision, and HP bonuses from traits gained at level-up.
 *
 * @param character The character before mutations.
 * @param mutations The mutations computed by `computeTraitEffectMutations()`.
 * @returns A new Character with all mutations applied.
 */
export function applyTraitEffectMutations(
  character: Character,
  mutations: TraitEffectMutations,
): Character {
  let result = character;

  // Speed
  if (mutations.speedUpdates) {
    const s = result.speed;
    result = {
      ...result,
      speed: {
        walk: s.walk + (mutations.speedUpdates.walk ?? 0),
        ...(mutations.speedUpdates.swim !== undefined || s.swim !== undefined
          ? { swim: mutations.speedUpdates.swim ?? s.swim }
          : {}),
        ...(mutations.speedUpdates.climb !== undefined || s.climb !== undefined
          ? { climb: mutations.speedUpdates.climb ?? s.climb }
          : {}),
        ...(mutations.speedUpdates.fly !== undefined || s.fly !== undefined
          ? { fly: mutations.speedUpdates.fly ?? s.fly }
          : {}),
      },
    };
  }

  // Damage modifiers
  if (mutations.newDamageModifiers?.length) {
    result = {
      ...result,
      damageModifiers: [
        ...result.damageModifiers,
        ...mutations.newDamageModifiers,
      ],
    };
  }

  // Proficiencies (merge without duplicates)
  if (mutations.newProficiencies) {
    result = {
      ...result,
      proficiencies: mergeProficiencies(
        result.proficiencies,
        mutations.newProficiencies,
      ),
    };
  }

  // Saving throws
  if (mutations.savingThrowChanges?.length) {
    const st = { ...result.savingThrows };
    for (const change of mutations.savingThrowChanges) {
      st[change.ability] = {
        ...st[change.ability],
        proficient: change.proficient,
        source: "clase",
      };
    }
    result = { ...result, savingThrows: st };
  }

  // Darkvision
  if (mutations.darkvisionUpdate !== undefined) {
    result = {
      ...result,
      darkvision: Math.max(result.darkvision, mutations.darkvisionUpdate),
    };
  }

  // HP bonus from traits (e.g. Draconic Resilience +1/level retroactive)
  if (mutations.hpBonusFromTraits) {
    result = {
      ...result,
      hp: {
        ...result.hp,
        max: result.hp.max + mutations.hpBonusFromTraits,
        current: result.hp.current + mutations.hpBonusFromTraits,
      },
    };
  }

  return result;
}

/**
 * Apply feat effects to a character (immutably).
 *
 * Handles speed bonuses, HP bonuses, sense upgrades, and proficiency
 * grants from a chosen feat.
 *
 * @param character  The character before feat effects.
 * @param featId     ID of the chosen feat.
 * @param newLevel   The character's new level (for per-level HP bonuses).
 * @returns A new Character with feat effects applied, or the same character
 *          if the feat was not found.
 */
export function applyFeatEffects(
  character: Character,
  featId: string,
  newLevel: number,
): Character {
  const chosenFeat = getFeatById(featId);
  if (!chosenFeat) return character;

  let result = character;

  for (const effect of chosenFeat.efectos) {
    switch (effect.type) {
      case "speed":
        if (effect.speedBonus) {
          result = {
            ...result,
            speed: {
              ...result.speed,
              walk: result.speed.walk + effect.speedBonus,
            },
          };
        }
        break;

      case "hp_max":
        if (effect.hpBonusPerLevel) {
          const hpBonus = effect.hpBonusPerLevel * newLevel;
          result = {
            ...result,
            hp: {
              ...result.hp,
              max: result.hp.max + hpBonus,
              current: result.hp.current + hpBonus,
            },
          };
        } else if (effect.hpBonus) {
          result = {
            ...result,
            hp: {
              ...result.hp,
              max: result.hp.max + effect.hpBonus,
              current: result.hp.current + effect.hpBonus,
            },
          };
        }
        break;

      case "sense":
        if (effect.senseType === "darkvision" && effect.senseRange) {
          result = {
            ...result,
            darkvision: Math.max(result.darkvision, effect.senseRange),
          };
        }
        break;

      case "proficiency":
        if (effect.proficiencyValues) {
          const p = result.proficiencies;
          switch (effect.proficiencyType) {
            case "armor":
              result = {
                ...result,
                proficiencies: {
                  ...p,
                  armors: [
                    ...new Set([...p.armors, ...effect.proficiencyValues]),
                  ],
                },
              };
              break;
            case "weapon":
              result = {
                ...result,
                proficiencies: {
                  ...p,
                  weapons: [
                    ...new Set([...p.weapons, ...effect.proficiencyValues]),
                  ],
                },
              };
              break;
            case "tool":
              result = {
                ...result,
                proficiencies: {
                  ...p,
                  tools: [
                    ...new Set([...p.tools, ...effect.proficiencyValues]),
                  ],
                },
              };
              break;
          }
        }
        break;
      // "asi" effects are handled by applyASI() via featAsiChoices
      // "spell", "trait" effects are player-choice or descriptive
    }
  }

  return result;
}

// ─── Phase 6d: resetToLevel1 helpers ─────────────────────────────────

/** Trait sources to keep when resetting to level 1. */
const LEVEL1_KEEP_ORIGINS = new Set<string>([
  "raza",
  "trasfondo",
  "dote",
  "manual",
]);

/**
 * Reset ability scores to level 1 by removing all improvements.
 *
 * Recalculates totals and modifiers with improvement = 0.
 *
 * @param abilityScores Current detailed ability scores.
 * @returns New ability scores with improvements zeroed out.
 */
export function resetAbilityScoresToLevel1(
  abilityScores: AbilityScoresDetailed,
): AbilityScoresDetailed {
  const result = { ...abilityScores };
  for (const key of ABILITY_KEYS) {
    const detail = { ...result[key] };
    detail.improvement = 0;
    detail.total =
      detail.override !== null
        ? detail.override
        : Math.min(20, detail.base + detail.racial + detail.misc);
    detail.modifier = calcModifier(detail.total);
    result[key] = detail;
  }
  return result;
}

/**
 * Filter character traits to only those appropriate for level 1.
 *
 * Keeps race, background, feat, and manual traits.
 * For class traits, only keeps those from level 1 (determined by the
 * level-history record or fallback to the class's level-1 features).
 *
 * @param traits         All current traits.
 * @param level1Features Class's level-1 feature names (fallback source).
 * @param levelHistory   Character's level history (to find level-1 traits).
 * @returns Filtered trait array for a level-1 character.
 */
export function filterTraitsForLevel1(
  traits: Trait[],
  level1Features: { nombre: string }[],
  levelHistory: Character["levelHistory"],
): Trait[] {
  const level1Record = levelHistory.find((r) => r.level === 1);

  const traitsToKeep = traits.filter((t) => LEVEL1_KEEP_ORIGINS.has(t.origen));

  const level1TraitNames = new Set(
    level1Record?.traitsGained ?? level1Features.map((f) => f.nombre),
  );
  const level1ClassTraits = traits.filter(
    (t) => t.origen === "clase" && level1TraitNames.has(t.nombre),
  );

  return [...traitsToKeep, ...level1ClassTraits];
}
