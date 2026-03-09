/**
 * Shared ability-related constants, extracted from AbilitiesTab.
 *
 * Color maps are now theme-aware: use the `getXxxColors(colors)` functions
 * passing the `ThemeColors` object from `useTheme()`.
 */

import type { AbilityKey } from "@/types/character";
import type { ThemeColors } from "@/utils/theme";

/** Canonical order of ability scores */
export const ABILITY_KEYS: AbilityKey[] = [
  "fue",
  "des",
  "con",
  "int",
  "sab",
  "car",
];

/**
 * Theme-aware color per ability score.
 * Each ability maps to a semantic accent token that works in both themes.
 */
export function getAbilityColors(
  colors: ThemeColors,
): Record<AbilityKey, string> {
  return {
    fue: colors.accentDanger,
    des: colors.accentGreen,
    con: colors.accentAmber,
    int: colors.accentBlue,
    sab: colors.accentPurple,
    car: colors.accentPink,
  };
}

/**
 * Theme-aware color per spell level (0 = cantrips, 1–9 = spell levels).
 */
export function getSpellLevelColors(
  colors: ThemeColors,
): Record<number, string> {
  return {
    0: colors.textMuted,
    1: colors.accentBlue,
    2: colors.accentGreen,
    3: colors.accentAmber,
    4: colors.accentDanger,
    5: colors.accentPurple,
    6: colors.accentPink,
    7: colors.accentGold,
    8: colors.accentOrange,
    9: colors.accentDeepPurple,
  };
}

/**
 * Theme-aware theme for each non-caster class ability section.
 */
export function getClassAbilityTheme(
  colors: ThemeColors,
): Record<string, { icon: string; color: string; label: string }> {
  return {
    barbaro: { icon: "flash", color: colors.accentDanger, label: "Furia" },
    guerrero: { icon: "shield", color: colors.accentOrange, label: "Combate" },
    monje: { icon: "hand-left", color: colors.accentGold, label: "Ki" },
    picaro: { icon: "eye-off", color: colors.textSecondary, label: "Astucia" },
  };
}
