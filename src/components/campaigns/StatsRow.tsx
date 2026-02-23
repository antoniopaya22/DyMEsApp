/**
 * StatsRow - Character statistics summary bar
 *
 * Shows total characters and average level.
 * Extracted from app/index.tsx
 */

import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme, useEntranceAnimation } from "@/hooks";

interface StatsRowProps {
  total: number;
  averageLevel: number;
}

export function StatsRow({ total, averageLevel }: StatsRowProps) {
  const { colors } = useTheme();
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
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.statsValue }]}>
          {total}
        </Text>
        <Text style={[styles.statLabel, { color: colors.statsLabel }]}>
          {total === 1 ? "Personaje" : "Personajes"}
        </Text>
      </View>
      <View
        style={[styles.statDivider, { backgroundColor: colors.statsDivider }]}
      />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.accentGold }]}>
          {averageLevel.toFixed(1)}
        </Text>
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
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
});
