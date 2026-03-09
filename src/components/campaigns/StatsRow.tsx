/**
 * StatsRow - Character statistics summary bar
 *
 * Shows total characters and average level with a polished,
 * slightly elevated appearance.
 */

import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useEntranceAnimation } from "@/hooks";

interface StatsRowProps {
  total: number;
  averageLevel: number;
}

export function StatsRow({ total, averageLevel }: StatsRowProps) {
  const { colors, isDark } = useTheme();
  const { opacity: fadeAnim } = useEntranceAnimation({ delay: 300 });

  return (
    <Animated.View
      style={[
        styles.statsRow,
        {
          opacity: fadeAnim,
          backgroundColor: colors.statsBg,
          borderColor: colors.statsBorder,
        },
      ]}
    >
      {/* Subtle inner gradient for depth */}
      <LinearGradient
        colors={
          isDark
            ? ["rgba(255,255,255,0.03)", "rgba(0,0,0,0.02)"]
            : ["rgba(255,255,255,0.5)", "rgba(0,0,0,0.01)"]
        }
        style={[StyleSheet.absoluteFill, { borderRadius: 13 }]}
      />

      <View style={styles.statItem}>
        <View style={styles.statValueRow}>
          <Ionicons
            name="people"
            size={14}
            color={colors.statsValue}
            style={styles.statIcon}
          />
          <Text style={[styles.statValue, { color: colors.statsValue }]}>
            {total}
          </Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.statsLabel }]}>
          {total === 1 ? "Personaje" : "Personajes"}
        </Text>
      </View>
      <View
        style={[styles.statDivider, { backgroundColor: colors.statsDivider }]}
      />
      <View style={styles.statItem}>
        <View style={styles.statValueRow}>
          <Ionicons
            name="trending-up"
            size={14}
            color={colors.accentGold}
            style={styles.statIcon}
          />
          <Text style={[styles.statValue, { color: colors.accentGold }]}>
            {averageLevel.toFixed(1)}
          </Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.statsLabel }]}>
          Nivel medio
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    marginRight: 5,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 30,
    borderRadius: 1,
  },
});
