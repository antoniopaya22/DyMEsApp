/**
 * Theme System — Color palettes for light and dark modes
 *
 * Provides a complete set of semantic color tokens for the entire app.
 * Each token has a light and dark variant. The `useTheme()` hook resolves
 * which palette to use based on the user's settings (claro / oscuro / auto).
 */

// ─── Color Palette Type ──────────────────────────────────────────────

export interface ThemeColors {
  // ── Backgrounds ──
  /** Main app background */
  bgPrimary: string;
  /** Secondary / slightly elevated background */
  bgSecondary: string;
  /** Card / surface background */
  bgCard: string;
  /** Elevated surface (modals, popovers) */
  bgElevated: string;
  /** Subtle tint used for pressed/hover states */
  bgSubtle: string;
  /** Input field background */
  bgInput: string;

  // ── Gradient backgrounds ──
  /** Main background gradient (top → bottom) */
  gradientMain: [string, string, string, string];
  /** Header gradient overlay */
  gradientHeader: [string, string];
  /** Header gradient locations */
  gradientLocations: [number, number, number, number];

  // ── Text ──
  /** Primary text (headings, body) */
  textPrimary: string;
  /** Secondary text (subtitles, descriptions) */
  textSecondary: string;
  /** Muted / hint text */
  textMuted: string;
  /** Inverted text (for colored backgrounds) */
  textInverted: string;

  // ── Borders ──
  /** Default border color */
  borderDefault: string;
  /** Subtle / lighter border */
  borderSubtle: string;
  /** Separator lines */
  borderSeparator: string;

  // ── Accents (stay consistent across themes) ──
  /** Gold / brand accent */
  accentGold: string;
  /** Gold glow (shadow, text-shadow) */
  accentGoldGlow: string;
  /** Red / primary action accent */
  accentRed: string;
  /** Green accent */
  accentGreen: string;
  /** Blue accent */
  accentBlue: string;
  /** Purple accent (hit dice, concentration, caster badges) */
  accentPurple: string;
  /** Pink accent (subclass, d20) */
  accentPink: string;
  /** Amber / warning accent (conditions, initiative, warnings) */
  accentAmber: string;
  /** Orange accent (HP critical-low, fire) */
  accentOrange: string;
  /** Lime accent (HP wounded state) */
  accentLime: string;
  /** Light-blue accent (rest, secondary-blue) */
  accentLightBlue: string;
  /** Danger / error red (death saves, critical errors) */
  accentDanger: string;
  /** Deep purple accent (pact casters) */
  accentDeepPurple: string;
  /** Indigo accent (d100, secondary-purple) */
  accentIndigo: string;
  /** Yellow accent (clues, secondary-gold) */
  accentYellow: string;

  // ── Interactive elements ──
  /** Button / option unselected background */
  optionBg: string;
  /** Button / option unselected border */
  optionBorder: string;
  /** Selected theme option background */
  optionSelectedBg: string;
  /** Selected theme option border */
  optionSelectedBorder: string;

  // ── Switch / toggle ──
  /** Switch track color when OFF */
  switchTrackOff: string;
  /** Switch track color when ON */
  switchTrackOn: string;
  /** Switch thumb color when OFF */
  switchThumbOff: string;
  /** Switch thumb color when ON */
  switchThumbOn: string;

  // ── Section header icon backgrounds (keep alpha-based) ──
  /** Multiplier applied to icon bg — just use iconColor + this suffix */
  iconBgAlpha: string;

  // ── Shadows ──
  /** Shadow color */
  shadowColor: string;
  /** Shadow opacity */
  shadowOpacity: number;

  // ── Status bar ──
  /** StatusBar style for expo-status-bar */
  statusBarStyle: "light" | "dark";

  // ── Specific UI elements ──
  /** Back button / header button background */
  headerButtonBg: string;
  /** Back button / header button border */
  headerButtonBorder: string;
  /** Header label color (brand name) */
  headerLabelColor: string;
  /** Header title color */
  headerTitleColor: string;
  /** Section title color */
  sectionTitleColor: string;
  /** Section description color */
  sectionDescColor: string;
  /** Chevron / secondary icon color */
  chevronColor: string;

  // ── Danger zone ──
  dangerBg: string;
  dangerBorder: string;
  dangerText: string;
  dangerTextMuted: string;

  // ── Tech badge / chip ──
  chipBg: string;
  chipBorder: string;
  chipText: string;

  // ── Search bar ──
  searchBg: string;
  searchBorder: string;
  searchBorderFocused: string;
  searchText: string;
  searchPlaceholder: string;

  // ── Stats row ──
  statsBg: string;
  statsBorder: string;
  statsValue: string;
  statsLabel: string;
  statsDivider: string;

  // ── Campaign card ──
  cardBg: string;
  cardBorder: string;
  cardTitle: string;
  cardDescription: string;
  cardChevronBg: string;

  // ── Empty state ──
  emptyIconRingBorder: string;
  emptyIconBg: string;
  emptyIconBorder: string;
  emptyTitle: string;
  emptySubtitle: string;
  emptyDividerLine: string;
  emptyDividerDiamond: string;
  emptyHintText: string;

  // ── Compendium ──
  tabBg: string;
  tabBorder: string;
  tabActiveBg: string;
  tabActiveBorder: string;
  tabText: string;
  tabActiveText: string;
  detailBg: string;
  detailBorder: string;

  // ── Overlays ──
  /** Semi-transparent backdrop for modals, pickers, etc. */
  backdrop: string;
}

// ─── Dark Palette ────────────────────────────────────────────────────

export const DARK_THEME: ThemeColors = {
  // Backgrounds — deep navy blue
  bgPrimary: "#0B1221",
  bgSecondary: "#080E1A",
  bgCard: "#101B2E",
  bgElevated: "#182338",
  bgSubtle: "rgba(255,255,255,0.03)",
  bgInput: "rgba(255,255,255,0.05)",

  // Gradients — navy blue gradient
  gradientMain: ["#060A14", "#080E1A", "#0B1221", "#0B1221"],
  gradientHeader: ["#060A14", "#080E1A00"],
  gradientLocations: [0, 0.12, 0.3, 1],

  // Text
  textPrimary: "#ffffff",
  textSecondary: "#8899AA",
  textMuted: "#7590A5",
  textInverted: "#0B1221",

  // Borders — navy blue tones
  borderDefault: "#1E2D42",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderSeparator: "rgba(30,45,66,0.6)",

  // Accents — neon turquoise primary
  accentGold: "#00E5FF",
  accentGoldGlow: "rgba(0,229,255,0.2)",
  accentRed: "#00E5FF",
  accentGreen: "#22c55e",
  accentBlue: "#3b82f6",
  accentPurple: "#c084fc",
  accentAmber: "#f59e0b",
  accentOrange: "#f97316",
  accentLime: "#84cc16",
  accentLightBlue: "#60a5fa",
  accentDanger: "#ef4444",
  accentDeepPurple: "#7c3aed",
  accentIndigo: "#6366f1",
  accentPink: "#ec4899",
  accentYellow: "#eab308",

  // Interactive
  optionBg: "rgba(255,255,255,0.03)",
  optionBorder: "rgba(255,255,255,0.06)",
  optionSelectedBg: "rgba(0,229,255,0.08)",
  optionSelectedBorder: "rgba(0,229,255,0.4)",

  // Switch — turquoise accent
  switchTrackOff: "#1E2D42",
  switchTrackOn: "rgba(0,229,255,0.35)",
  switchThumbOff: "#8899AA",
  switchThumbOn: "#00E5FF",

  // Icon bg alpha suffix
  iconBgAlpha: "20",

  // Shadows
  shadowColor: "#000000",
  shadowOpacity: 0.12,

  // Status bar
  statusBarStyle: "light",

  // Header
  headerButtonBg: "rgba(255,255,255,0.07)",
  headerButtonBorder: "rgba(255,255,255,0.09)",
  headerLabelColor: "#00E5FF",
  headerTitleColor: "#ffffff",
  sectionTitleColor: "#ffffff",
  sectionDescColor: "#8899AA",
  chevronColor: "#7590A5",

  // Danger
  dangerBg: "rgba(239,68,68,0.06)",
  dangerBorder: "rgba(239,68,68,0.18)",
  dangerText: "#ef4444",
  dangerTextMuted: "#ef444480",

  // Chips
  chipBg: "#1E2D42",
  chipBorder: "#2A3A52",
  chipText: "#AAB8C8",

  // Search
  searchBg: "rgba(255,255,255,0.05)",
  searchBorder: "rgba(255,255,255,0.08)",
  searchBorderFocused: "rgba(0,229,255,0.35)",
  searchText: "#ffffff",
  searchPlaceholder: "#7590A5",

  // Stats
  statsBg: "rgba(255,255,255,0.04)",
  statsBorder: "rgba(255,255,255,0.06)",
  statsValue: "#ffffff",
  statsLabel: "#7590A5",
  statsDivider: "rgba(255,255,255,0.06)",

  // Campaign card
  cardBg: "#101B2E",
  cardBorder: "#1E2D42",
  cardTitle: "#ffffff",
  cardDescription: "#8899AA",
  cardChevronBg: "rgba(255,255,255,0.06)",

  // Empty — turquoise accent
  emptyIconRingBorder: "rgba(0,229,255,0.15)",
  emptyIconBg: "rgba(0,229,255,0.08)",
  emptyIconBorder: "rgba(0,229,255,0.12)",
  emptyTitle: "#ffffff",
  emptySubtitle: "#8899AA",
  emptyDividerLine: "rgba(255,255,255,0.06)",
  emptyDividerDiamond: "rgba(0,229,255,0.25)",
  emptyHintText: "#7590A5",

  // Compendium — turquoise active states
  tabBg: "rgba(255,255,255,0.04)",
  tabBorder: "rgba(255,255,255,0.06)",
  tabActiveBg: "rgba(0,229,255,0.12)",
  tabActiveBorder: "rgba(0,229,255,0.3)",
  tabText: "#8899AA",
  tabActiveText: "#ffffff",
  detailBg: "rgba(255,255,255,0.03)",
  detailBorder: "rgba(255,255,255,0.05)",

  // Overlays
  backdrop: "rgba(0,0,0,0.5)",
};

// ─── Light Palette ───────────────────────────────────────────────────

export const LIGHT_THEME: ThemeColors = {
  // Backgrounds — cool blue-gray
  bgPrimary: "#EDF2F7",
  bgSecondary: "#E2E8F0",
  bgCard: "#F7FAFC",
  bgElevated: "#FFFFFF",
  bgSubtle: "rgba(14,116,144,0.06)",
  bgInput: "rgba(14,116,144,0.08)",

  // Gradients — cool blue-gray gradient
  gradientMain: ["#DAE2EC", "#E5EBF2", "#EDF2F7", "#EDF2F7"],
  gradientHeader: ["#DAE2EC", "#E5EBF200"],
  gradientLocations: [0, 0.12, 0.3, 1],

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#334155",
  textMuted: "#475569",
  textInverted: "#ffffff",

  // Borders — cool slate
  borderDefault: "#CBD5E1",
  borderSubtle: "rgba(0,0,0,0.08)",
  borderSeparator: "rgba(0,0,0,0.08)",

  // Accents — teal primary (darker for light-bg contrast)
  accentGold: "#0E7490",
  accentGoldGlow: "rgba(14,116,144,0.15)",
  accentRed: "#0E7490",
  accentGreen: "#15803d",
  accentBlue: "#2563eb",
  accentPurple: "#7e22ce",
  accentAmber: "#b45309",
  accentOrange: "#c2410c",
  accentLime: "#4d7c0f",
  accentLightBlue: "#3b82f6",
  accentDanger: "#dc2626",
  accentDeepPurple: "#6d28d9",
  accentIndigo: "#4f46e5",
  accentPink: "#db2777",
  accentYellow: "#ca8a04",

  // Interactive
  optionBg: "rgba(0,0,0,0.03)",
  optionBorder: "rgba(0,0,0,0.08)",
  optionSelectedBg: "rgba(14,116,144,0.10)",
  optionSelectedBorder: "rgba(14,116,144,0.45)",

  // Switch — teal accent
  switchTrackOff: "#CBD5E1",
  switchTrackOn: "rgba(14,116,144,0.35)",
  switchThumbOff: "#ffffff",
  switchThumbOn: "#0E7490",

  // Icon bg alpha suffix
  iconBgAlpha: "18",

  // Shadows
  shadowColor: "#000000",
  shadowOpacity: 0.08,

  // Status bar
  statusBarStyle: "dark",

  // Header
  headerButtonBg: "rgba(0,0,0,0.05)",
  headerButtonBorder: "rgba(0,0,0,0.08)",
  headerLabelColor: "#0E7490",
  headerTitleColor: "#0F172A",
  sectionTitleColor: "#0F172A",
  sectionDescColor: "#334155",
  chevronColor: "#475569",

  // Danger
  dangerBg: "rgba(239,68,68,0.06)",
  dangerBorder: "rgba(239,68,68,0.20)",
  dangerText: "#dc2626",
  dangerTextMuted: "rgba(220,38,38,0.55)",

  // Chips
  chipBg: "rgba(0,0,0,0.04)",
  chipBorder: "rgba(0,0,0,0.08)",
  chipText: "#334155",

  // Search
  searchBg: "rgba(0,0,0,0.04)",
  searchBorder: "rgba(0,0,0,0.10)",
  searchBorderFocused: "rgba(14,116,144,0.40)",
  searchText: "#0F172A",
  searchPlaceholder: "#475569",

  // Stats
  statsBg: "rgba(0,0,0,0.03)",
  statsBorder: "rgba(0,0,0,0.08)",
  statsValue: "#0F172A",
  statsLabel: "#334155",
  statsDivider: "rgba(0,0,0,0.08)",

  // Campaign card
  cardBg: "#F7FAFC",
  cardBorder: "#CBD5E1",
  cardTitle: "#0F172A",
  cardDescription: "#334155",
  cardChevronBg: "rgba(0,0,0,0.05)",

  // Empty — teal accent
  emptyIconRingBorder: "rgba(14,116,144,0.18)",
  emptyIconBg: "rgba(14,116,144,0.08)",
  emptyIconBorder: "rgba(14,116,144,0.15)",
  emptyTitle: "#0F172A",
  emptySubtitle: "#334155",
  emptyDividerLine: "rgba(0,0,0,0.08)",
  emptyDividerDiamond: "rgba(14,116,144,0.25)",
  emptyHintText: "#475569",

  // Compendium — teal active states
  tabBg: "rgba(0,0,0,0.04)",
  tabBorder: "rgba(0,0,0,0.08)",
  tabActiveBg: "rgba(14,116,144,0.10)",
  tabActiveBorder: "rgba(14,116,144,0.30)",
  tabText: "#334155",
  tabActiveText: "#0F172A",
  detailBg: "rgba(0,0,0,0.02)",
  detailBorder: "rgba(0,0,0,0.06)",

  // Overlays
  backdrop: "rgba(0,0,0,0.35)",
};

// ─── Helper ──────────────────────────────────────────────────────────

/**
 * Parses a hex color (#RGB, #RRGGBB, or #RRGGBBAA) or an rgb()/rgba()
 * string and returns a new `rgba(r,g,b,opacity)` string.
 *
 * Usage:
 *   withAlpha('#00E5FF', 0.15)   → 'rgba(0,229,255,0.15)'
 *   withAlpha('#fff', 0.5)       → 'rgba(255,255,255,0.5)'
 *   withAlpha(colors.accentRed, 0.12)
 */
export function withAlpha(color: string, opacity: number): string {
  // Already rgba — replace the alpha component
  const rgbaMatch = color.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]},${rgbaMatch[2]},${rgbaMatch[3]},${opacity})`;
  }

  // Hex → rgb components
  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  // Strip alpha hex if present (#RRGGBBAA)
  hex = hex.substring(0, 6);

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Returns the correct theme palette for a given resolved mode.
 * The `resolvedMode` should already account for "auto" → system preference.
 */
export function getThemeColors(resolvedMode: "claro" | "oscuro"): ThemeColors {
  return resolvedMode === "claro" ? LIGHT_THEME : DARK_THEME;
}
