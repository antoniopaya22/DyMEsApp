import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Circle,
  G,
  Polygon,
} from "react-native-svg";

interface RunicBorderProps {
  children?: React.ReactNode;
  /** Border color */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Corner size for the cut-corner effect */
  cornerSize?: number;
  /** Whether to show corner ornaments */
  showCornerRunes?: boolean;
  /** Padding inside the border */
  padding?: number;
  /** Border width */
  borderWidth?: number;
  style?: ViewStyle;
}

export function RunicBorder({
  children,
  color = "#00E5FF",
  backgroundColor = "transparent",
  cornerSize = 12,
  showCornerRunes = true,
  padding = 16,
  borderWidth = 1,
  style,
}: RunicBorderProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgLinearGradient id="runicBorderG" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.8" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.4" />
            <Stop offset="1" stopColor={color} stopOpacity="0.8" />
          </SvgLinearGradient>
        </Defs>

        <Path
          d={`
            M ${cornerSize},0
            L 100%,0
            L 100%,100%
            L 0,100%
            L 0,${cornerSize}
            Z
          `}
          fill={backgroundColor}
          stroke="url(#runicBorderG)"
          strokeWidth={borderWidth}
        />

        <Path
          d={`M 0,0 L ${cornerSize},0 L 0,${cornerSize} Z`}
          fill="none"
          stroke={color}
          strokeWidth={borderWidth * 0.7}
          strokeOpacity={0.5}
        />

        {showCornerRunes && (
          <G>
            <Circle cx={cornerSize + 4} cy={4} r={1.5} fill={color} opacity={0.6} />
            <Circle cx={4} cy={cornerSize + 4} r={1.5} fill={color} opacity={0.6} />
            <Polygon
              points={`${cornerSize / 2},${cornerSize / 2 - 3} ${cornerSize / 2 + 3},${cornerSize / 2} ${cornerSize / 2},${cornerSize / 2 + 3} ${cornerSize / 2 - 3},${cornerSize / 2}`}
              fill={color}
              opacity={0.45}
            />
          </G>
        )}
      </Svg>

      <View style={{ padding }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
});
