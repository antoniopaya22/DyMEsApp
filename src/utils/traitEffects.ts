/**
 * Computes character mutations from trait effects.
 *
 * This function takes a character and newly-gained traits, reads their
 * `efectos` arrays, and returns the set of changes that should be applied
 * to the character's stored fields (speed, damageModifiers, proficiencies,
 * savingThrows, darkvision, HP).
 *
 * Effects that are read at display-time by getters (acFormula, acBonus,
 * initiativeBonus) are intentionally NOT processed here — they don't
 * mutate stored fields.
 */

import type {
  Character,
  DamageModifier,
  SpeedInfo,
  Proficiencies,
  AbilityKey,
  Trait,
} from "@/types/character";
import type {
  TraitEffect,
  InitiativeBonusEffect,
  SpeedBonusEffect,
} from "@/types/traitEffects";
import { MONK_SPEED_BONUS } from "@/data/srd/leveling";

// ── Mutation result ──────────────────────────────────────────────────

export interface TraitEffectMutations {
  /** Incremental speed changes to merge into character.speed */
  speedUpdates?: Partial<SpeedInfo>;
  /** New damage modifiers to append to character.damageModifiers */
  newDamageModifiers?: DamageModifier[];
  /** New proficiencies to merge into character.proficiencies */
  newProficiencies?: Partial<Proficiencies>;
  /** Saving throw proficiency changes */
  savingThrowChanges?: { ability: AbilityKey; proficient: boolean }[];
  /** New darkvision range (use max of current and this value) */
  darkvisionUpdate?: number;
  /** Extra HP to add (e.g. Draconic Resilience perLevel * level) */
  hpBonusFromTraits?: number;
}

// ── Main function ────────────────────────────────────────────────────

/**
 * Compute the character mutations implied by newly-gained traits.
 *
 * @param character - Current character state.
 * @param newTraits - Traits just gained (at creation or level-up).
 * @returns Mutations to apply to the character.
 */
export function computeTraitEffectMutations(
  character: Character,
  newTraits: Trait[],
): TraitEffectMutations {
  const mutations: TraitEffectMutations = {};
  const speedUpdates: Partial<SpeedInfo> = {};
  const newDamageModifiers: DamageModifier[] = [];
  const newProficiencies: Partial<Proficiencies> = {
    armors: [],
    weapons: [],
    tools: [],
    languages: [],
  };
  const savingThrowChanges: { ability: AbilityKey; proficient: boolean }[] = [];
  let darkvisionUpdate: number | undefined;
  let hpBonusFromTraits = 0;

  for (const trait of newTraits) {
    if (!trait.efectos) continue;
    for (const effect of trait.efectos) {
      switch (effect.kind) {
        case "speedBonus":
          if (effect.walkBonus) {
            speedUpdates.walk = (speedUpdates.walk ?? 0) + effect.walkBonus;
          }
          if (effect.swim !== undefined) {
            speedUpdates.swim = resolveMovementSpeed(
              effect.swim,
              character.speed.walk,
              speedUpdates.swim,
            );
          }
          if (effect.climb !== undefined) {
            speedUpdates.climb = resolveMovementSpeed(
              effect.climb,
              character.speed.walk,
              speedUpdates.climb,
            );
          }
          if (effect.fly !== undefined) {
            speedUpdates.fly = resolveMovementSpeed(
              effect.fly,
              character.speed.walk,
              speedUpdates.fly,
            );
          }
          break;

        case "damageModifier":
          newDamageModifiers.push({
            type: effect.damageType,
            modifier: effect.modifier,
            source: trait.nombre,
          });
          break;

        case "proficiency":
          if (effect.armors) newProficiencies.armors!.push(...effect.armors);
          if (effect.weapons) newProficiencies.weapons!.push(...effect.weapons);
          if (effect.tools) newProficiencies.tools!.push(...effect.tools);
          if (effect.languages)
            newProficiencies.languages!.push(...effect.languages);
          break;

        case "savingThrowProficiency": {
          const abilities: AbilityKey[] =
            effect.abilities === "all"
              ? ["fue", "des", "con", "int", "sab", "car"]
              : effect.abilities;
          for (const a of abilities) {
            savingThrowChanges.push({ ability: a, proficient: true });
          }
          break;
        }

        case "darkvision":
          if (effect.additive) {
            darkvisionUpdate =
              (darkvisionUpdate ?? character.darkvision ?? 0) + effect.range;
          } else {
            darkvisionUpdate = Math.max(darkvisionUpdate ?? 0, effect.range);
          }
          break;

        case "hpBonus":
          hpBonusFromTraits +=
            effect.perLevel * character.nivel + (effect.flat ?? 0);
          break;

        // acFormula, acBonus, initiativeBonus, skillProficiency, limitedUse:
        // Handled by getters or already resolved by the builder — not mutations.
      }
    }
  }

  // Only include non-empty mutations
  if (Object.keys(speedUpdates).length > 0) {
    mutations.speedUpdates = speedUpdates;
  }
  if (newDamageModifiers.length > 0) {
    mutations.newDamageModifiers = newDamageModifiers;
  }
  if (Object.values(newProficiencies).some((arr) => arr && arr.length > 0)) {
    mutations.newProficiencies = newProficiencies;
  }
  if (savingThrowChanges.length > 0) {
    mutations.savingThrowChanges = savingThrowChanges;
  }
  if (darkvisionUpdate !== undefined) {
    mutations.darkvisionUpdate = darkvisionUpdate;
  }
  if (hpBonusFromTraits > 0) {
    mutations.hpBonusFromTraits = hpBonusFromTraits;
  }

  return mutations;
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Resolve a movement speed value: "walk" means equal to walk speed,
 * a number is used as-is. Takes the larger of existing and new.
 */
function resolveMovementSpeed(
  value: number | "walk",
  walkSpeed: number,
  existingUpdate: number | undefined,
): number {
  const resolved = value === "walk" ? walkSpeed : value;
  return existingUpdate !== undefined
    ? Math.max(existingUpdate, resolved)
    : resolved;
}

// ── Pure getters (usable without store) ──────────────────────────────

/**
 * Compute the initiative bonus from a character's traits.
 * Pure function — does not require store access.
 */
export function computeInitiativeBonus(character: Character): number {
  let bonus = character.abilityScores.des.modifier;

  for (const trait of character.traits) {
    if (!trait.efectos) continue;
    for (const ef of trait.efectos) {
      if (ef.kind !== "initiativeBonus") continue;
      const init = ef as InitiativeBonusEffect;
      if (init.abilityBonus) {
        bonus += character.abilityScores[init.abilityBonus].modifier;
      }
      if (init.flatBonus) {
        bonus += init.flatBonus;
      }
      if (init.addProficiencyBonus) {
        bonus += character.proficiencyBonus;
      }
    }
  }

  return bonus;
}

/**
 * Compute effective speeds from a character's traits (walk, swim, climb, fly).
 * Pure function — does not require store access.
 *
 * @param character - The character.
 * @param isUnarmored - Whether the character is not wearing armor.
 * @param hasNoShield - Whether the character is not using a shield.
 * @param heavyArmor - Whether the character is wearing heavy armor.
 */
export function computeEffectiveSpeed(
  character: Character,
  isUnarmored = true,
  hasNoShield = true,
  heavyArmor = false,
): SpeedInfo {
  const result: SpeedInfo = { ...character.speed };

  for (const trait of character.traits) {
    if (!trait.efectos) continue;
    for (const ef of trait.efectos) {
      if (ef.kind !== "speedBonus") continue;
      const speed = ef as SpeedBonusEffect;

      // Evaluate conditions
      if (speed.condition) {
        if (
          speed.condition === "sin armadura ni escudo" &&
          !(isUnarmored && hasNoShield)
        )
          continue;
        if (speed.condition === "sin armadura pesada" && heavyArmor) continue;
        if (speed.condition === "sin armadura" && !isUnarmored) continue;
      }

      // Walk bonus — special case for Monk scaling
      if (speed.walkBonus !== undefined) {
        let walkAdd = speed.walkBonus;

        if (
          character.clase === "monje" &&
          speed.condition === "sin armadura ni escudo"
        ) {
          walkAdd = MONK_SPEED_BONUS[character.nivel] ?? speed.walkBonus;
        }

        result.walk += walkAdd;
      }

      // Swim speed
      if (speed.swim !== undefined) {
        const swimVal = speed.swim === "walk" ? result.walk : speed.swim;
        result.swim = Math.max(result.swim ?? 0, swimVal);
      }

      // Climb speed
      if (speed.climb !== undefined) {
        const climbVal = speed.climb === "walk" ? result.walk : speed.climb;
        result.climb = Math.max(result.climb ?? 0, climbVal);
      }

      // Fly speed
      if (speed.fly !== undefined) {
        const flyVal = speed.fly === "walk" ? result.walk : speed.fly;
        result.fly = Math.max(result.fly ?? 0, flyVal);
      }
    }
  }

  return result;
}
