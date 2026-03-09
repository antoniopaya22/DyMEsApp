import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Line,
  Text as SvgText,
} from "react-native-svg";

interface ScrollBannerProps {
  /** Text to display on the banner */
  text: string;
  /** Banner color */
  color?: string;
  /** Text color */
  textColor?: string;
  /** Font size */
  fontSize?: number;
  /** Height of the banner */
  height?: number;
  style?: ViewStyle;
}

export function ScrollBanner({
  text,
  color = "#00E5FF",
  textColor = "#ffffff",
  fontSize = 14,
  height = 40,
  style,
}: ScrollBannerProps) {
  const svgW = 300;
  const svgH = height;
  const cy = svgH / 2;
  const ribbonH = svgH * 0.65;
  const ribbonTop = cy - ribbonH / 2;
  const ribbonBot = cy + ribbonH / 2;
  const foldW = 20;
  const foldDepth = 6;

  return (
    <View style={[styles.container, { height }, style]}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <SvgLinearGradient id="ribbonMain" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.85" />
          </SvgLinearGradient>
          <SvgLinearGradient id="ribbonFold" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.15" />
          </SvgLinearGradient>
        </Defs>

        {/* Left fold (behind main banner) */}
        <Path
          d={`
            M ${foldW + 2},${ribbonTop + 2}
            L 2,${ribbonTop + foldDepth}
            L 2,${ribbonBot - foldDepth}
            L ${foldW + 2},${ribbonBot - 2}
            Z
          `}
          fill="url(#ribbonFold)"
        />

        {/* Right fold (behind main banner) */}
        <Path
          d={`
            M ${svgW - foldW - 2},${ribbonTop + 2}
            L ${svgW - 2},${ribbonTop + foldDepth}
            L ${svgW - 2},${ribbonBot - foldDepth}
            L ${svgW - foldW - 2},${ribbonBot - 2}
            Z
          `}
          fill="url(#ribbonFold)"
        />

        {/* Main ribbon body */}
        <Path
          d={`
            M ${foldW},${ribbonTop}
            L ${svgW - foldW},${ribbonTop}
            L ${svgW - foldW + 8},${cy}
            L ${svgW - foldW},${ribbonBot}
            L ${foldW},${ribbonBot}
            L ${foldW - 8},${cy}
            Z
          `}
          fill="url(#ribbonMain)"
        />

        {/* Highlight line at top */}
        <Line
          x1={foldW + 4}
          y1={ribbonTop + 2}
          x2={svgW - foldW - 4}
          y2={ribbonTop + 2}
          stroke="#ffffff"
          strokeWidth={0.5}
          strokeOpacity={0.25}
        />

        {/* Banner text */}
        <SvgText
          x={svgW / 2}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="800"
          fill={textColor}
          letterSpacing={1.5}
        >
          {text.toUpperCase()}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
});
