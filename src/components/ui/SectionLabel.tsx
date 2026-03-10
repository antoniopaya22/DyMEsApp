/**
 * SectionLabel
 *
 * Animated section header with an optional icon and a trailing gradient line.
 * Provides visual separation between content blocks.
 *
 * Extracted from the local `SectionLabel` sub-component in campaigns/[id]/index.tsx.
 *
 * @example
 * <SectionLabel label="Acceso rápido" icon="flash" color={colors.accentGold} />
 */

import React from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, useEntranceAnimation } from "@/hooks";

export interface SectionLabelProps {
  /** Section title text */
  label: string;
  /** Optional tint color (defaults to accentGold) */
  color?: string;
  /** Optional leading icon */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Entrance animation delay in ms (default 0) */
  delay?: number;
}

export default function SectionLabel({
  label,
  color,
  icon,
  delay = 0,
}: SectionLabelProps) {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.accentGold;
  const { opacity } = useEntranceAnimation({ delay, duration: 350 });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.row}>
        {icon && (
          <Ionicons
            name={icon}
            size={14}
            color={`${resolvedColor}99`}
            style={{ marginRight: 6 }}
          />
        )}
        <Text style={[styles.text, { color: `${resolvedColor}CC` }]}>
          {label}
        </Text>
      </View>
      <View style={styles.line}>
        <LinearGradient
          colors={[`${resolvedColor}40`, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1, height: 1 }}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  line: {
    flex: 1,
    height: 1,
  },
});
