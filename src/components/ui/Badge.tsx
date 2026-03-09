/**
 * Badge / Chip
 *
 * Generic pill/tag component used for tags, labels, skill badges, tech chips, etc.
 * Consolidates the duplicated badge patterns across settings.tsx (techBadge),
 * compendium.tsx (skillTag), and other screens.
 *
 * @example
 * // Simple tag
 * <Badge label="React Native" />
 *
 * // Colored tag
 * <Badge label="Atletismo" color={colors.accentBlue} />
 *
 * // With icon
 * <Badge label="Acolito" icon="book-outline" color={colors.accentGold} />
 */

import React from "react";
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";

export interface BadgeProps {
  label: string;
  /** Optional tint color for text and border; background is derived at 15% opacity */
  color?: string;
  /** Optional leading Ionicon */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Font size override (default 12) */
  fontSize?: number;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
}

export default function Badge({
  label,
  color,
  icon,
  fontSize = 12,
  style,
}: BadgeProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.textSecondary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color ? `${tint}15` : colors.chipBg ?? "rgba(255,255,255,0.04)",
          borderColor: color ? `${tint}30` : colors.chipBorder ?? "rgba(255,255,255,0.06)",
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={fontSize}
          color={tint}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: color ? tint : colors.chipText ?? colors.textSecondary,
            fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});
