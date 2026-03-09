import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, { Path, Circle, Polygon } from "react-native-svg";

interface CornerOrnamentProps {
  /** Which corner */
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Size of the ornament */
  size?: number;
  /** Color */
  color?: string;
  style?: ViewStyle;
}

export function CornerOrnament({
  corner = "top-left",
  size = 24,
  color = "#00E5FF",
  style,
}: CornerOrnamentProps) {
  let rotation = "0deg";
  switch (corner) {
    case "top-right":
      rotation = "90deg";
      break;
    case "bottom-right":
      rotation = "180deg";
      break;
    case "bottom-left":
      rotation = "270deg";
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ rotate: rotation }],
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 30 30">
        {/* Main corner curve */}
        <Path d="M0,0 L12,0 C8,4 4,8 0,12 Z" fill={color} opacity={0.3} />
        {/* Inner curve line */}
        <Path
          d="M0,0 Q 0,16 16,16"
          fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.5}
        />
        {/* Outer curve line */}
        <Path
          d="M0,0 Q 0,22 22,22"
          fill="none" stroke={color} strokeWidth={0.5} strokeOpacity={0.25}
        />
        {/* Dot at curve end */}
        <Circle cx={16} cy={16} r={1.5} fill={color} opacity={0.5} />
        {/* Small diamond at the corner */}
        <Polygon
          points="0,4 2,0 4,4 2,8"
          fill={color} opacity={0.5}
          transform="translate(0, -1)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});
