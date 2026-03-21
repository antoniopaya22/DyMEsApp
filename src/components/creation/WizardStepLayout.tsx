/**
 * WizardStepLayout — Shared layout wrapper for all character creation wizard steps.
 *
 * Encapsulates the header (back button, step counter, progress bar),
 * title section (icon circle, title, subtitle), scrollable content area,
 * and footer (next/action button).
 *
 * Eliminates ~60 lines of duplicated JSX + ~15 StyleSheet entries per step.
 *
 * Uses theme tokens directly (NO hardcoded colors).
 */

import type { ReactNode, RefObject } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TOTAL_STEPS } from "@/stores/creationStore";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";

// ─── Types ───────────────────────────────────────────────────────────

export interface WizardStepLayoutProps {
  /** Current step number (1-based) */
  currentStep: number;
  /** Step title displayed below the icon */
  title: string;
  /** Step subtitle/description */
  subtitle: string;
  /** Ionicons name for the title icon circle */
  iconName: string;
  /** Label for the next/action button */
  nextLabel: string;
  /** Whether the user can proceed to the next step */
  canProceed: boolean;
  /** Callback when the next button is pressed */
  onNext: () => void;
  /** Callback when the back button is pressed */
  onBack: () => void;
  /** Step content rendered inside the ScrollView */
  children: ReactNode;
  /** Icon for next button (default: "arrow-forward") */
  nextIconName?: string;
  /** When true, shows a loading spinner in the footer button */
  isLoading?: boolean;
  /** Label to show while loading (replaces nextLabel) */
  loadingLabel?: string;
  /** Ref for the scroll view (from useScrollToTop) */
  scrollRef?: RefObject<ScrollView | null>;
  /** Extra bottom padding for scroll content (default: 40) */
  scrollPaddingBottom?: number;
  /** Extra content rendered after the subtitle inside the title section */
  titleExtra?: ReactNode;
  /** Whether keyboard should persist taps (for steps with TextInput fields) */
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  /** Position of the footer button icon (default: "right") */
  nextIconPosition?: "left" | "right";
}

/**
 * Reusable wizard step layout that provides:
 * - Themed container with correct bgPrimary
 * - Header: back button, "Paso X de Y", progress bar
 * - Title section: icon circle, title, subtitle
 * - ScrollView wrapping children
 * - Footer: themed next/action button with disabled + loading states
 */
export default function WizardStepLayout({
  currentStep,
  title,
  subtitle,
  iconName,
  nextLabel,
  canProceed,
  onNext,
  onBack,
  children,
  nextIconName = "arrow-forward",
  isLoading = false,
  loadingLabel,
  scrollRef,
  scrollPaddingBottom = 40,
  titleExtra,
  keyboardShouldPersistTaps,
  nextIconPosition = "right",
}: WizardStepLayoutProps) {
  const { colors } = useTheme();
  const progressPercent = (currentStep / TOTAL_STEPS) * 100;
  const disabled = !canProceed || isLoading;

  return (
    <View style={[s.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity
              style={[
                s.backButton,
                {
                  backgroundColor: colors.bgCard,
                  borderWidth: 1,
                  borderColor: colors.borderDefault,
                },
              ]}
              onPress={onBack}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[s.stepText, { color: colors.textSecondary }]}>
              Paso {currentStep} de {TOTAL_STEPS}
            </Text>
            {/* Spacer to balance the back button */}
            <View style={s.spacer} />
          </View>
          <View style={[s.progressBar, { backgroundColor: colors.bgInput }]}>
            <View
              style={[
                s.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: colors.accentRed,
                },
              ]}
            />
          </View>
        </View>

        {/* ── Title section ── */}
        <View style={s.titleSection}>
          <View
            style={[
              s.iconCircle,
              { backgroundColor: withAlpha(colors.accentRed, 0.15) },
            ]}
          >
            <Ionicons
              name={iconName as any}
              size={40}
              color={colors.accentRed}
            />
          </View>
          <Text style={[s.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[s.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
          {titleExtra}
        </View>

        {/* ── Content ── */}
        {children}
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[s.footer, { borderTopColor: colors.borderDefault }]}>
        <TouchableOpacity
          style={[
            s.nextButton,
            { backgroundColor: colors.accentRed },
            disabled && !isLoading && {
              backgroundColor: colors.bgSecondary,
              opacity: 0.5,
            },
          ]}
          onPress={onNext}
          disabled={disabled}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color={colors.textInverted} />
              <Text style={[s.nextButtonText, { color: colors.textInverted }]}>
                {loadingLabel ?? nextLabel}
              </Text>
            </>
          ) : nextIconPosition === "left" ? (
            <>
              <Ionicons
                name={nextIconName as any}
                size={20}
                color={colors.textInverted}
              />
              <Text style={[s.nextButtonText, { color: colors.textInverted }]}>
                {nextLabel}
              </Text>
            </>
          ) : (
            <>
              <Text style={[s.nextButtonText, { color: colors.textInverted }]}>
                {nextLabel}
              </Text>
              <Ionicons
                name={nextIconName as any}
                size={20}
                color={colors.textInverted}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles (theme-neutral structural values only) ───────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
  },
  spacer: {
    height: 40,
    width: 40,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  titleSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  iconCircle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
