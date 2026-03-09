import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
} from "react-native-svg";

interface CastleHeaderProps {
  /** Color of the battlements */
  color?: string;
  /** Height of the crenellations */
  height?: number;
  /** Width of each merlon (raised part) */
  merlonWidth?: number;
  /** Width of each crenel (gap) */
  crenelWidth?: number;
  style?: ViewStyle;
}

export function CastleHeader({
  color = "#0B1221",
  height = 10,
  merlonWidth = 14,
  crenelWidth = 10,
  style,
}: CastleHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg width="100%" height={height} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="castleGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.8" />
          </SvgLinearGradient>
        </Defs>

        <Path
          d={generateCrenellationPath(merlonWidth, crenelWidth, height)}
          fill="url(#castleGrad)"
        />
      </Svg>
    </View>
  );
}

function generateCrenellationPath(mw: number, cw: number, h: number): string {
  const totalWidth = 400;
  const unitWidth = mw + cw;
  const count = Math.ceil(totalWidth / unitWidth);
  const crenelHeight = h * 0.45;

  let d = `M 0,${h} L 0,0 `;

  for (let i = 0; i < count; i++) {
    const x = i * unitWidth;
    d += `L ${x},0 `;
    d += `L ${x + mw},0 `;
    d += `L ${x + mw},${crenelHeight} `;
    d += `L ${x + mw + cw},${crenelHeight} `;
    d += `L ${x + mw + cw},0 `;
  }

  d += `L ${totalWidth},0 L ${totalWidth},${h} Z`;
  return d;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
});
