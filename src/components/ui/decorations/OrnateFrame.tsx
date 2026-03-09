import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { CornerOrnament } from "./CornerOrnament";

interface OrnateFrameProps {
  children?: React.ReactNode;
  /** Corner ornament color */
  color?: string;
  /** Border color */
  borderColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Corner ornament size */
  cornerSize?: number;
  /** Inner padding */
  padding?: number;
  /** Border radius */
  borderRadius?: number;
  style?: ViewStyle;
}

export function OrnateFrame({
  children,
  color = "#00E5FF",
  borderColor: frameBorder,
  backgroundColor = "transparent",
  cornerSize = 20,
  padding = 16,
  borderRadius = 2,
  style,
}: OrnateFrameProps) {
  const bc = frameBorder || `${color}30`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor: bc,
          borderRadius,
        },
        style,
      ]}
    >
      {/* Corner ornaments */}
      <CornerOrnament
        corner="top-left" size={cornerSize} color={color}
        style={{ top: -1, left: -1 }}
      />
      <CornerOrnament
        corner="top-right" size={cornerSize} color={color}
        style={{ top: -1, right: -1 }}
      />
      <CornerOrnament
        corner="bottom-left" size={cornerSize} color={color}
        style={{ bottom: -1, left: -1 }}
      />
      <CornerOrnament
        corner="bottom-right" size={cornerSize} color={color}
        style={{ bottom: -1, right: -1 }}
      />

      {/* Content */}
      <View style={{ padding }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderWidth: 1,
    overflow: "visible",
  },
});
