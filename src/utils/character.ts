/**
 * Character utility functions — modifiers, proficiency, hit dice.
 * Extracted from types/character.ts for separation of concerns.
 */
import type { HitDie, Trait } from "@/types/character";
import type { LimitedUseEffect } from "@/types/traitEffects";

// ─── Modifier calculations ───────────────────────────────────────────

/** Calcula el modificador a partir de una puntuación de característica */
export function calcModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Calcula el bonificador de competencia según el nivel */
export function calcProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

// ─── Hit Dice ────────────────────────────────────────────────────────

/** Valor numérico del dado de golpe */
export function hitDieValue(die: HitDie): number {
  const values: Record<HitDie, number> = {
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
  };
  return values[die];
}

/** Valor fijo (promedio redondeado arriba) del dado de golpe para subir de nivel */
export function hitDieFixedValue(die: HitDie): number {
  return hitDieValue(die) / 2 + 1;
}

// ─── Formatting ──────────────────────────────────────────────────────

/** Formatea un modificador con signo (+/-) */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// ─── Trait Helpers ───────────────────────────────────────────────────

/** Resolve limitedUse effects into maxUses/currentUses/recharge for a given level. */
export function resolveLimitedUse(
  efectos: Trait["efectos"],
  level: number,
): Pick<Trait, "maxUses" | "currentUses" | "recharge"> {
  const limitedUse = efectos?.find((e) => e.kind === "limitedUse") as
    | LimitedUseEffect
    | undefined;
  if (!limitedUse) return { maxUses: null, currentUses: null, recharge: null };
  const resolved =
    limitedUse.maxUses === "proficiencyBonus"
      ? calcProficiencyBonus(level)
      : limitedUse.maxUses;
  return {
    maxUses: resolved,
    currentUses: resolved,
    recharge: limitedUse.recharge,
  };
}
