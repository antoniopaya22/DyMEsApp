import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  G,
  Line,
  ClipPath,
} from "react-native-svg";

interface ShieldFrameProps {
  /** Content to render inside the shield */
  children?: React.ReactNode;
  /** Size of the shield (width) */
  size?: number;
  /** Primary border/frame color */
  color?: string;
  /** Inner background color */
  backgroundColor?: string;
  /** Whether to show the SVG decorative border */
  showBorder?: boolean;
  /** Whether to show the inner gradient */
  showGradient?: boolean;
  style?: ViewStyle;
}

export function ShieldFrame({
  children,
  size = 80,
  color = "#00E5FF",
  backgroundColor = "#101B2E",
  showBorder = true,
  showGradient = true,
  style,
}: ShieldFrameProps) {
  const h = size * 1.15;

  const shieldPath = `
    M50,2
    C25,2 4,8 4,24
    L4,55
    C4,80 25,100 50,113
    C75,100 96,80 96,55
    L96,24
    C96,8 75,2 50,2
    Z
  `;

  const innerShieldPath = `
    M50,8
    C28,8 10,13 10,27
    L10,54
    C10,76 28,94 50,106
    C72,94 90,76 90,54
    L90,27
    C90,13 72,8 50,8
    Z
  `;

  return (
    <View style={[styles.container, { width: size, height: h }, style]}>
      <Svg
        width={size}
        height={h}
        viewBox="0 0 100 115"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <SvgLinearGradient id="shieldBorder" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.7" />
            <Stop offset="1" stopColor={color} stopOpacity="0.4" />
          </SvgLinearGradient>
          <SvgLinearGradient id="shieldInner" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={backgroundColor} stopOpacity="1" />
            <Stop offset="1" stopColor="#060A14" stopOpacity="1" />
          </SvgLinearGradient>
          <RadialGradient id="shieldShine" cx="0.35" cy="0.25" rx="0.4" ry="0.4">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
          <ClipPath id="shieldClip">
            <Path d={innerShieldPath} />
          </ClipPath>
        </Defs>

        {showBorder && (
          <Path d={shieldPath} fill="url(#shieldBorder)" opacity={0.9} />
        )}
        <Path d={innerShieldPath} fill="url(#shieldInner)" />
        {showGradient && <Path d={innerShieldPath} fill="url(#shieldShine)" />}

        {showBorder && (
          <G opacity={0.25}>
            <Line x1={50} y1={8} x2={50} y2={106} stroke={color} strokeWidth={0.8} />
            <Line x1={10} y1={50} x2={90} y2={50} stroke={color} strokeWidth={0.8} />
          </G>
        )}

        {showBorder && (
          <G>
            <Circle cx={50} cy={2} r={3} fill={color} opacity={0.8} />
            <Circle cx={50} cy={2} r={1.5} fill="#ffffff" opacity={0.3} />
          </G>
        )}
      </Svg>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
});
