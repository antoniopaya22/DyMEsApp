/**
 * GradientBorder — Reusable horizontal gradient line
 *
 * Renders a symmetrical fade-in/fade-out gradient border.
 * Used as a decorative separator in headers and section dividers.
 *
 * The default 5-stop gradient:
 *   transparent → baseColor+66 → baseColor → baseColor+66 → transparent
 */

import { View, StyleSheet, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";

export interface GradientBorderProps {
  /** Base color for the gradient. Defaults to theme borderDefault */
  color?: string;
  /** Height of the line (default: 1) */
  height?: number;
  /** Whether to position absolutely at bottom (default: false) */
  absolute?: boolean;
  /** Custom container style */
  style?: ViewStyle;
}

export default function GradientBorder({
  color,
  height = 1,
  absolute = false,
  style,
}: GradientBorderProps) {
  const { colors } = useTheme();
  const baseColor = color ?? colors.borderDefault;

  return (
    <View
      style={[absolute ? styles.absolute : styles.relative, { height }, style]}
    >
      <LinearGradient
        colors={[
          "transparent",
          `${baseColor}66`,
          baseColor,
          `${baseColor}66`,
          "transparent",
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height, width: "100%" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  relative: {
    width: "100%",
  },
});
