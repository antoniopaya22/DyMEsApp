/**
 * InfoBadge
 *
 * Small pill-shaped badge with an icon and text label.
 * Used to show character meta-info like class, alignment, XP, proficiency, etc.
 *
 * Uses neutral chip theme tokens (chipBg / chipBorder / chipText) by default
 * for consistent contrast in both light and dark modes.
 *
 * @example
 * <InfoBadge icon="book-outline" label="Acolito" />
 */

import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";

export interface InfoBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

export default function InfoBadge({ icon, label }: InfoBadgeProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center rounded-full px-3 py-1.5 mr-2 mb-2 border"
      style={{
        backgroundColor: colors.chipBg,
        borderColor: colors.chipBorder,
      }}
    >
      <Ionicons name={icon} size={12} color={colors.chipText} />
      <Text className="text-xs ml-1.5 font-medium" style={{ color: colors.chipText }}>
        {label}
      </Text>
    </View>
  );
}
