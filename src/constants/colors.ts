/**
 * Shared color constants for domain-specific visuals.
 *
 * These are theme-independent colors that represent real-world objects
 * (metals, alignment categories) and don't change with light/dark mode.
 * For theme-aware colors, always use `useTheme()`.
 */

import type { CoinType } from "@/types/item";
import type { ThemeColors } from "@/utils/theme";

// ─── Coin metallic colors (theme-independent) ───────────────────────

/** Visual metallic colors for coin icons — represent real metals */
export const COIN_ICON_COLORS: Record<CoinType, string> = {
  mc: "#B87333", // copper
  mp: "#C0C0C0", // silver
  me: "#5B8DBE", // electrum (blue-silver)
  mo: "#FFD700", // gold
  mpl: "#E5E4E2", // platinum
};

/** Canonical ordering for coin display (highest value first) */
export const COIN_ORDER: CoinType[] = ["mpl", "mo", "me", "mp", "mc"];

// ─── HP color helpers ────────────────────────────────────────────────

/**
 * Returns a themed color for an HP ratio.
 * Uses accent tokens from the theme so it adapts to light/dark mode.
 */
export function getHpColor(
  current: number,
  max: number,
  colors: ThemeColors,
): string {
  if (max === 0) return colors.chevronColor; // neutral gray
  const ratio = current / max;
  if (ratio > 0.5) return colors.accentGreen;
  if (ratio > 0.25) return colors.accentAmber;
  if (ratio > 0) return colors.accentDanger;
  return colors.accentDeepPurple; // unconscious
}

/**
 * Returns a human-readable HP status label in Spanish.
 */
export function getHpLabel(current: number, max: number): string {
  if (max === 0) return "\u2014";
  if (current <= 0) return "Inconsciente";
  const ratio = current / max;
  if (ratio <= 0.25) return "Cr\u00edtico";
  if (ratio <= 0.5) return "Herido";
  return "Sano";
}
