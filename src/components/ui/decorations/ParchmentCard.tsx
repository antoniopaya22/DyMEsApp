import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Line, Path } from "react-native-svg";

const PARCHMENT_TINTS = {
  warm: {
    bg1: "#EDF2F7",
    bg2: "#E2E8F0",
    bg3: "#CBD5E1",
    border: "#94A3B8",
    text: "#0F172A",
    edgeLine: "#94A3B8",
  },
  cold: {
    bg1: "#E2E8F0",
    bg2: "#CBD5E1",
    bg3: "#94A3B8",
    border: "#7590A5",
    text: "#0F172A",
    edgeLine: "#7590A5",
  },
  dark: {
    bg1: "#182338",
    bg2: "#182338",
    bg3: "#101B2E",
    border: "#1E2D42",
    text: "#CBD5E1",
    edgeLine: "#2D4054",
  },
};

interface ParchmentCardProps {
  children?: React.ReactNode;
  /** Parchment tint color */
  tint?: "warm" | "cold" | "dark";
  /** Whether to show torn/rough edges (top/bottom decorative borders) */
  showEdges?: boolean;
  /** Padding */
  padding?: number;
  /** Whether to show the corner fold effect */
  showFold?: boolean;
  /** Card border radius */
  borderRadius?: number;
  style?: ViewStyle;
}

export function ParchmentCard({
  children,
  tint = "dark",
  showEdges = true,
  padding = 16,
  showFold = false,
  borderRadius = 4,
  style,
}: ParchmentCardProps) {
  const t = PARCHMENT_TINTS[tint];

  return (
    <View
      style={[
        styles.container,
        { borderRadius, borderColor: t.border },
        style,
      ]}
    >
      <LinearGradient
        colors={[t.bg1, t.bg2, t.bg3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      <LinearGradient
        colors={["rgba(255,255,255,0.04)", "transparent", "rgba(0,0,0,0.06)"]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {showEdges && (
        <View style={[styles.edgeTop, { borderColor: t.edgeLine }]}>
          <Svg width="100%" height={4} preserveAspectRatio="none">
            <Line
              x1="0" y1="2" x2="100%" y2="2"
              stroke={t.edgeLine} strokeWidth={0.5}
              strokeDasharray="6,4,2,4" strokeOpacity={0.5}
            />
          </Svg>
        </View>
      )}

      {showEdges && (
        <View style={[styles.edgeBottom, { borderColor: t.edgeLine }]}>
          <Svg width="100%" height={4} preserveAspectRatio="none">
            <Line
              x1="0" y1="2" x2="100%" y2="2"
              stroke={t.edgeLine} strokeWidth={0.5}
              strokeDasharray="6,4,2,4" strokeOpacity={0.5}
            />
          </Svg>
        </View>
      )}

      {showFold && (
        <View style={styles.foldCorner}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path d="M0,0 L20,0 L20,20 Z" fill={t.bg3} opacity={0.8} />
            <Path
              d="M20,0 L20,20 L0,0 Z"
              fill="none" stroke={t.border} strokeWidth={0.5} strokeOpacity={0.4}
            />
          </Svg>
        </View>
      )}

      <View style={{ padding }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
  },
  edgeTop: {
    position: "absolute",
    top: 4,
    left: 8,
    right: 8,
    height: 4,
  },
  edgeBottom: {
    position: "absolute",
    bottom: 4,
    left: 8,
    right: 8,
    height: 4,
  },
  foldCorner: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});
