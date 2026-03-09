/**
 * SelectionCard — Reusable card for wizard selection steps (race, class, background, etc.)
 *
 * Renders an icon → info → trailing indicator layout consistent across all creation steps.
 * Uses NativeWind + dynamic theme tokens (NO hardcoded colors).
 */

import type { ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";

// ─── Types ───────────────────────────────────────────────────────────

export interface SelectionCardProps {
  /** Ionicons name for the card icon */
  iconName: string;
  /** Card title (e.g. race/class/background name) */
  title: string;
  /** Card subtitle/description */
  subtitle?: string;
  /** Whether this card is currently selected */
  isSelected: boolean;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Accent color for selected state (defaults to theme accentRed) */
  accentColor?: string;
  /** Trailing icon override: "checkmark" (default), "chevron", or custom Ionicons name */
  trailingIcon?: "checkmark" | "chevron" | string;
  /** Optional pill badges rendered below the subtitle */
  pills?: ReactNode;
  /** Max lines for subtitle (default: 1) */
  subtitleLines?: number;
  /** Additional left margin (e.g. for expansion items) */
  indented?: boolean;
  /** Icon size (default: 28) */
  iconSize?: number;
  /** Whether the card is disabled */
  disabled?: boolean;
}

/**
 * A consistent selection card for wizard steps.
 *
 * Matches the visual pattern of race/class steps:
 * - 56×56 icon container with rounded-xl
 * - Title + subtitle + optional pills
 * - Trailing checkmark-circle / chevron-forward
 * - Theme-aware colors with appropriate contrast
 */
export default function SelectionCard({
  iconName,
  title,
  subtitle,
  isSelected,
  onPress,
  accentColor,
  trailingIcon = "checkmark",
  pills,
  subtitleLines = 1,
  indented = false,
  iconSize = 28,
  disabled = false,
}: SelectionCardProps) {
  const { colors } = useTheme();
  const accent = accentColor ?? colors.accentRed;

  // Resolve trailing icon
  const resolvedTrailingName = isSelected
    ? "checkmark-circle"
    : trailingIcon === "checkmark"
      ? "ellipse-outline"
      : trailingIcon === "chevron"
        ? "chevron-forward"
        : (trailingIcon as any);

  const resolvedTrailingColor = isSelected ? accent : colors.textMuted;

  return (
    <TouchableOpacity
      className="mb-3 rounded-card border p-4 active:opacity-80"
      style={{
        backgroundColor: isSelected
          ? withAlpha(accent, 0.12)
          : colors.bgElevated,
        borderColor: isSelected
          ? withAlpha(accent, 0.4)
          : withAlpha(colors.textMuted, 0.2),
        ...(indented ? { marginLeft: 16 } : {}),
        ...(disabled ? { opacity: 0.5 } : {}),
      }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className="h-14 w-14 rounded-xl items-center justify-center mr-4"
          style={{
            backgroundColor: isSelected
              ? withAlpha(accent, 0.2)
              : colors.bgSecondary,
          }}
        >
          <Ionicons
            name={iconName as any}
            size={iconSize}
            color={isSelected ? accent : colors.textSecondary}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text
            className="text-lg font-bold"
            style={{ color: colors.textPrimary }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="text-sm mt-0.5"
              style={{ color: colors.textSecondary }}
              numberOfLines={subtitleLines}
            >
              {subtitle}
            </Text>
          ) : null}
          {pills ? (
            <View className="flex-row flex-wrap mt-2">{pills}</View>
          ) : null}
        </View>

        {/* Trailing indicator */}
        <Ionicons
          name={resolvedTrailingName}
          size={20}
          color={resolvedTrailingColor}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Expansion Toggle Card ───────────────────────────────────────────

export interface ExpansionToggleCardProps {
  /** Whether the expansion section is expanded */
  isExpanded: boolean;
  /** Callback to toggle expansion */
  onToggle: () => void;
  /** Label for the expansion (e.g. "Expansiones") */
  label?: string;
  /** Subtitle describing the expansion contents */
  subtitle: string;
  /** Accent color (defaults to theme accentRed) */
  accentColor?: string;
}

/**
 * A toggle card for collapsible expansion sections.
 * Matches the pattern used in race/class steps.
 */
export function ExpansionToggleCard({
  isExpanded,
  onToggle,
  label = "Expansiones",
  subtitle,
  accentColor,
}: ExpansionToggleCardProps) {
  const { colors } = useTheme();
  const accent = accentColor ?? colors.accentRed;

  return (
    <TouchableOpacity
      className="mb-3 rounded-card border p-4 active:opacity-80"
      style={{
        backgroundColor: colors.bgElevated,
        borderColor: isExpanded
          ? withAlpha(accent, 0.4)
          : withAlpha(colors.textMuted, 0.2),
      }}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        <View
          className="h-14 w-14 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: withAlpha(accent, 0.15) }}
        >
          <Ionicons name="cube-outline" size={28} color={accent} />
        </View>
        <View className="flex-1">
          <Text
            className="text-lg font-bold"
            style={{ color: colors.textPrimary }}
          >
            {label}
          </Text>
          <Text
            className="text-sm mt-0.5"
            style={{ color: colors.textSecondary }}
          >
            {subtitle}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={accent}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Pill Badge ──────────────────────────────────────────────────────

export interface PillBadgeProps {
  /** Text to show in the pill */
  text: string;
  /** Optional Ionicons icon before text */
  icon?: string;
  /** Text color (defaults to textSecondary) */
  color?: string;
  /** Icon color (defaults to same as text color) */
  iconColor?: string;
  /** Background color override (defaults to bgSecondary) */
  bgColor?: string;
}

/**
 * Small rounded pill badge for quick info inside a SelectionCard.
 */
export function PillBadge({ text, icon, color, iconColor, bgColor }: PillBadgeProps) {
  const { colors } = useTheme();
  const textColor = color ?? colors.textSecondary;

  return (
    <View
      className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1 flex-row items-center"
      style={{ backgroundColor: bgColor ?? colors.bgSecondary }}
    >
      {icon ? (
        <Ionicons
          name={icon as any}
          size={12}
          color={iconColor ?? textColor}
        />
      ) : null}
      <Text
        className={`text-xs font-semibold ${icon ? "ml-1" : ""}`}
        style={{ color: textColor }}
      >
        {text}
      </Text>
    </View>
  );
}
