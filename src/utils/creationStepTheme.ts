/**
 * creationStepTheme — Themed style overrides for character creation step screens.
 *
 * All creation steps (abilities, appearance, background, equipment, personality,
 * skills, spells, summary) share a common set of StyleSheet styles that were
 * originally hardcoded for the dark theme.  Instead of modifying every JSX
 * element in every file, each screen can call `getCreationThemeOverrides(colors)`
 * once and spread the result over the static styles where needed.
 *
 * Usage inside a creation step component:
 *
 *   const { colors, isDark } = useTheme();
 *   const themed = getCreationThemeOverrides(colors);
 *
 *   <View style={[styles.container, themed.container]}>
 *   <TouchableOpacity style={[styles.backButton, themed.backButton]}>
 *   <View style={[styles.progressBar, themed.progressBar]}>
 *   <Text style={[styles.title, themed.title]}>
 *   ...etc
 */

import type { ThemeColors } from "./theme";
import type { ViewStyle, TextStyle } from "react-native";

export interface CreationThemeOverrides {
  // ── Layout ──
  container: ViewStyle;

  // ── Header ──
  backButton: ViewStyle;
  stepText: TextStyle;
  progressBar: ViewStyle;

  // ── Title section ──
  title: TextStyle;
  subtitle: TextStyle;

  // ── Section titles ──
  sectionTitle: TextStyle;

  // ── Cards / surfaces ──
  card: ViewStyle;
  cardAlt: ViewStyle;
  cardElevated: ViewStyle;
  input: TextStyle;

  // ── Text ──
  textPrimary: TextStyle;
  textSecondary: TextStyle;
  textMuted: TextStyle;
  textAccent: TextStyle;

  // ── Footer ──
  footer: ViewStyle;
  nextButtonDisabled: ViewStyle;
  /** Text/icon color for elements on primary accent background (buttons, chips) */
  textOnPrimary: TextStyle;

  // ── Misc ──
  spinnerBtn: ViewStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  chipSelected: ViewStyle;

  // ── TextArea / TextInput (personality, appearance) ──
  textArea: TextStyle;
  charCount: TextStyle;

  // ── Field hints & labels ──
  fieldHint: TextStyle;
  fieldLabel: TextStyle;
  required: TextStyle;
  optional: TextStyle;

  // ── Random / action buttons ──
  randomButton: ViewStyle;
  randomButtonText: TextStyle;

  // ── Alignment grid (personality) ──
  alignmentHeaderText: TextStyle;
  alignmentRowText: TextStyle;
  alignmentCell: ViewStyle;
  alignmentDescBox: ViewStyle;
  alignmentDescName: TextStyle;
  alignmentDescText: TextStyle;

  // ── Radio / checkbox (equipment, skills, spells) ──
  radio: ViewStyle;
  checkbox: ViewStyle;

  // ── Level / counter badges (spells, skills) ──
  levelBadge: ViewStyle;
  levelBadgeText: TextStyle;
  counterText: TextStyle;
  counterTextValid: TextStyle;

  // ── Abilities specific ──
  pointsValue: TextStyle;
  allAssigned: TextStyle;

  // ── Granted / reference skills ──
  grantedRow: ViewStyle;
  grantedName: TextStyle;
  grantedBadge: ViewStyle;
  grantedBadgeText: TextStyle;
  emptyState: ViewStyle;
  emptyText: TextStyle;
  refBadge: ViewStyle;
  refBadgeText: TextStyle;
  refBadgeTextActive: TextStyle;
  refTitle: TextStyle;

  // ── Spell specific ──
  spellNameSelected: TextStyle;
  skipText: TextStyle;
  skipSubtext: TextStyle;
  aptitudBadge: ViewStyle;
  aptitudText: TextStyle;
  infoBox: ViewStyle;
  infoBoxText: TextStyle;

  // ── Equipment specific ──
  optionLabelSelected: TextStyle;
  choiceLabel: TextStyle;
  hintBox: ViewStyle;
  hintText: TextStyle;

  // ── Appearance chips ──
  quickChip: ViewStyle;
  quickChipText: TextStyle;
  quickChipTextSelected: TextStyle;

  // ── Summary specific ──
  checklistRow: ViewStyle;
  checklistText: TextStyle;
  checklistTextDone: TextStyle;
  summaryCard: ViewStyle;
  summaryRow: ViewStyle;
  summaryLabel: TextStyle;
  summaryValue: TextStyle;
  scoreCard: ViewStyle;
  scoreAbbr: TextStyle;
  scoreTotal: TextStyle;
  scoreMod: TextStyle;
  hpPreview: ViewStyle;
  hpLabel: TextStyle;
  hitDieBadge: ViewStyle;
  hitDieText: TextStyle;
  skillBadge: ViewStyle;
  skillBadgeText: TextStyle;
  personalityRow: ViewStyle;
  personalityLabel: TextStyle;
  personalityValue: TextStyle;
  emptyNote: TextStyle;
  warningBox: ViewStyle;
  warningTitle: TextStyle;
  warningText: TextStyle;
  loadingText: TextStyle;

  // ── Background details ──
  detailsCard: ViewStyle;
  detailsDescription: TextStyle;
  detailLabel: TextStyle;
  detailValue: TextStyle;
  featureBox: ViewStyle;
  featureName: TextStyle;
  featureDesc: TextStyle;
  bgSkills: TextStyle;
  bgNameSelected: TextStyle;
}

/**
 * Returns a set of style overrides that adapt the hardcoded dark-theme
 * creation-step styles to the current theme.
 *
 * Spread these over the corresponding static styles:
 *   style={[styles.someStyle, themed.someOverride]}
 */
export function getCreationThemeOverrides(
  colors: ThemeColors,
): CreationThemeOverrides {
  return {
    // ── Layout ──
    container: {
      backgroundColor: colors.bgPrimary,
    },

    // ── Header ──
    backButton: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.borderDefault,
    },
    stepText: {
      color: colors.textSecondary,
    },
    progressBar: {
      backgroundColor: colors.bgInput,
    },

    // ── Title section ──
    title: {
      color: colors.textPrimary,
    },
    subtitle: {
      color: colors.textSecondary,
    },

    // ── Section titles ──
    sectionTitle: {
      color: colors.textSecondary,
    },

    // ── Cards / surfaces (methodCard, abilityRow, changeMethodBtn,
    //    pointsHeader, previewSection, bgCard, optionCard, etc.) ──
    card: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderDefault,
    },
    // Slightly recessed surface (previewCard, valueOption, input bg, etc.)
    cardAlt: {
      backgroundColor: colors.bgSecondary,
      borderColor: colors.borderDefault,
    },
    // Elevated surface for better contrast against bgPrimary
    cardElevated: {
      backgroundColor: colors.bgElevated,
      borderColor: `${colors.textMuted}33`,
    },
    // Text input fields
    input: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderDefault,
      color: colors.textPrimary,
    } as TextStyle,

    // ── Text shortcuts ──
    textPrimary: {
      color: colors.textPrimary,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textMuted: {
      color: colors.textMuted,
    },
    textAccent: {
      color: colors.accentGold,
    },

    // ── Footer ──
    footer: {
      borderTopColor: colors.borderDefault,
    },
    nextButtonDisabled: {
      backgroundColor: colors.bgSecondary,
      opacity: 0.5,
    },
    textOnPrimary: {
      color: colors.textInverted,
    },

    // ── Misc ──
    spinnerBtn: {
      backgroundColor: colors.bgElevated,
    },
    badge: {
      backgroundColor: colors.bgElevated,
    },
    badgeText: {
      color: colors.accentGold,
    },
    chipSelected: {
      backgroundColor: colors.optionSelectedBg,
      borderColor: colors.optionSelectedBorder,
    },

    // ═══════════════════════════════════════════════════════════════
    // NEW overrides below — these fix light-theme issues in the
    // creation steps from background onwards.
    // ═══════════════════════════════════════════════════════════════

    // ── TextArea / TextInput (personality, appearance, etc.) ──
    textArea: {
      backgroundColor: colors.bgInput,
      borderColor: colors.borderDefault,
      color: colors.textPrimary,
    } as TextStyle,
    charCount: {
      color: colors.textMuted,
    },

    // ── Field hints & labels ──
    fieldHint: {
      color: colors.textPrimary,
    },
    fieldLabel: {
      color: colors.textPrimary,
    },
    required: {
      color: colors.accentRed,
    },
    optional: {
      color: colors.textMuted,
    },

    // ── Random / action buttons ──
    randomButton: {
      backgroundColor: `${colors.accentGold}18`,
      borderColor: `${colors.accentGold}40`,
    },
    randomButtonText: {
      color: colors.accentGold,
    },

    // ── Alignment grid (personality) ──
    alignmentHeaderText: {
      color: colors.textSecondary,
    },
    alignmentRowText: {
      color: colors.textSecondary,
    },
    alignmentCell: {
      backgroundColor: colors.bgElevated,
      borderColor: `${colors.textMuted}55`,
    },
    alignmentDescBox: {
      backgroundColor: colors.bgElevated,
      borderColor: `${colors.textMuted}55`,
    },
    alignmentDescName: {
      color: colors.textPrimary,
    },
    alignmentDescText: {
      color: colors.textSecondary,
    },

    // ── Radio / checkbox ──
    radio: {
      borderColor: colors.textMuted,
    },
    checkbox: {
      borderColor: colors.textMuted,
    },

    // ── Level / counter badges (spells, skills) ──
    levelBadge: {
      backgroundColor: colors.bgElevated,
    },
    levelBadgeText: {
      color: colors.textSecondary,
    },
    counterText: {
      color: colors.accentGold,
    },
    counterTextValid: {
      color: colors.accentGreen,
    },

    // ── Abilities specific ──
    pointsValue: {
      color: colors.accentGold,
    },
    allAssigned: {
      color: colors.accentGreen,
    },

    // ── Granted / reference skills ──
    grantedRow: {
      backgroundColor: `${colors.accentGold}12`,
      borderColor: `${colors.accentGold}30`,
    },
    grantedName: {
      color: colors.accentGold,
    },
    grantedBadge: {
      backgroundColor: `${colors.accentGold}15`,
    },
    grantedBadgeText: {
      color: colors.accentGold,
    },
    emptyState: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderDefault,
    },
    emptyText: {
      color: colors.textSecondary,
    },
    refBadge: {
      backgroundColor: colors.bgSecondary,
      borderColor: colors.borderDefault,
    },
    refBadgeText: {
      color: colors.textMuted,
    },
    refBadgeTextActive: {
      color: colors.textPrimary,
    },
    refTitle: {
      color: colors.textMuted,
    },

    // ── Spell specific ──
    spellNameSelected: {
      color: colors.textPrimary,
    },
    skipText: {
      color: colors.textPrimary,
    },
    skipSubtext: {
      color: colors.textSecondary,
    },
    aptitudBadge: {
      backgroundColor: `${colors.accentGold}18`,
    },
    aptitudText: {
      color: colors.accentGold,
    },
    infoBox: {
      backgroundColor: `${colors.accentGold}18`,
      borderColor: `${colors.accentGold}33`,
    },
    infoBoxText: {
      color: colors.textPrimary,
    },

    // ── Equipment specific ──
    optionLabelSelected: {
      color: colors.textPrimary,
    },
    choiceLabel: {
      color: colors.accentGold,
    },
    hintBox: {
      backgroundColor: `${colors.accentGold}18`,
      borderColor: `${colors.accentGold}33`,
    },
    hintText: {
      color: colors.textPrimary,
    },

    // ── Appearance chips ──
    quickChip: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderDefault,
    },
    quickChipText: {
      color: colors.textSecondary,
    },
    quickChipTextSelected: {
      color: colors.textPrimary,
    },

    // ── Summary specific ──
    checklistRow: {
      borderBottomColor: colors.borderSubtle,
    },
    checklistText: {
      color: colors.textMuted,
    },
    checklistTextDone: {
      color: colors.textPrimary,
    },
    summaryCard: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderDefault,
    },
    summaryRow: {
      borderBottomColor: colors.borderSubtle,
    },
    summaryLabel: {
      color: colors.textSecondary,
    },
    summaryValue: {
      color: colors.textPrimary,
    },
    scoreCard: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderDefault,
    },
    scoreAbbr: {
      color: colors.accentGold,
    },
    scoreTotal: {
      color: colors.textPrimary,
    },
    scoreMod: {
      color: colors.textSecondary,
    },
    hpPreview: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderDefault,
    },
    hpLabel: {
      color: colors.textSecondary,
    },
    hitDieBadge: {
      backgroundColor: colors.bgElevated,
    },
    hitDieText: {
      color: colors.textSecondary,
    },
    skillBadge: {
      backgroundColor: colors.bgCard,
      borderColor: `${colors.accentGreen}30`,
    },
    skillBadgeText: {
      color: colors.textPrimary,
    },
    personalityRow: {
      borderBottomColor: colors.borderSubtle,
    },
    personalityLabel: {
      color: colors.accentGold,
    },
    personalityValue: {
      color: colors.textPrimary,
    },
    emptyNote: {
      color: colors.textMuted,
    },
    warningBox: {
      backgroundColor: `${colors.accentGold}18`,
      borderColor: `${colors.accentGold}4D`,
    },
    warningTitle: {
      color: colors.accentGold,
    },
    warningText: {
      color: colors.textPrimary,
    },
    loadingText: {
      color: colors.textSecondary,
    },

    // ── Background details ──
    detailsCard: {
      backgroundColor: colors.bgSecondary,
      borderColor: colors.borderDefault,
    },
    detailsDescription: {
      color: colors.textSecondary,
    },
    detailLabel: {
      color: colors.accentGold,
    },
    detailValue: {
      color: colors.textPrimary,
    },
    featureBox: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderDefault,
    },
    featureName: {
      color: colors.accentGold,
    },
    featureDesc: {
      color: colors.textSecondary,
    },
    bgSkills: {
      color: colors.textSecondary,
    },
    bgNameSelected: {
      color: colors.textPrimary,
    },
  };
}
