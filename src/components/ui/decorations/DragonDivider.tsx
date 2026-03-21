import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Line,
  Polygon,
} from "react-native-svg";

interface DragonDividerProps {
  /** Width of the divider (default: "100%") */
  width?: number | string;
  /** Height of the SVG area (default: 40) */
  height?: number;
  /** Primary color of the dragon and ornaments */
  color?: string;
  /** Secondary color for the lines */
  lineColor?: string;
  /** Facing direction of the dragon */
  facing?: "left" | "right";
  /** Overall spacing above and below */
  spacing?: number;
  /** Custom style */
  style?: ViewStyle;
}

export function DragonDivider({
  width = "100%",
  height = 40,
  color = "#00E5FF",
  lineColor,
  facing = "right",
  spacing = 12,
  style,
}: DragonDividerProps) {
  const lc = lineColor || `${color}55`;
  const flip = facing === "left" ? -1 : 1;
  const svgWidth = 300;
  const svgHeight = 40;
  const cy = svgHeight / 2;

  // Serpentine dragon body — wider sinuous S-curve stroke
  const serpentBody = `
    M ${150 - 24 * flip},${cy}
    C ${150 - 16 * flip},${cy - 11} ${150 - 6 * flip},${cy + 11} ${150 + 2 * flip},${cy}
    C ${150 + 10 * flip},${cy - 11} ${150 + 18 * flip},${cy + 4} ${150 + 24 * flip},${cy}
  `;

  // Dragon head — pointed snout
  const headPath = `
    M ${150 + 24 * flip},${cy - 4}
    L ${150 + 30 * flip},${cy}
    L ${150 + 24 * flip},${cy + 4}
  `;

  // Horn on top of head
  const hornPath = `
    M ${150 + 24 * flip},${cy - 4}
    L ${150 + 21 * flip},${cy - 9}
  `;

  // Tail tip — small fork
  const tailPath = `
    M ${150 - 24 * flip},${cy}
    L ${150 - 28 * flip},${cy - 4}
    M ${150 - 24 * flip},${cy}
    L ${150 - 28 * flip},${cy + 3}
  `;

  return (
    <View style={[styles.container, { marginVertical: spacing }, style]}>
      <Svg
        width={width as any}
        height={height}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <SvgLinearGradient id="dragonLineL" x1="0" y1="0.5" x2="1" y2="0.5">
            <Stop offset="0" stopColor={lc} stopOpacity="0" />
            <Stop offset="0.6" stopColor={lc} stopOpacity="0.6" />
            <Stop offset="1" stopColor={color} stopOpacity="0.9" />
          </SvgLinearGradient>
          <SvgLinearGradient id="dragonLineR" x1="0" y1="0.5" x2="1" y2="0.5">
            <Stop offset="0" stopColor={color} stopOpacity="0.9" />
            <Stop offset="0.4" stopColor={lc} stopOpacity="0.6" />
            <Stop offset="1" stopColor={lc} stopOpacity="0" />
          </SvgLinearGradient>
          <RadialGradient id="dragonGlow" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Left ornamental line */}
        <Line
          x1={30}
          y1={cy}
          x2={116}
          y2={cy}
          stroke="url(#dragonLineL)"
          strokeWidth={1}
        />
        {/* Left decorative dot */}
        <Circle cx={40} cy={cy} r={1.5} fill={color} opacity={0.3} />

        {/* Left end ornament — small diamond */}
        <Polygon
          points={`32,${cy} 36,${cy - 3} 40,${cy} 36,${cy + 3}`}
          fill={color}
          opacity={0.4}
        />

        {/* Center glow behind serpent */}
        <Circle cx={150} cy={cy} r={22} fill="url(#dragonGlow)" />

        {/* Serpentine dragon body */}
        <Path
          d={serpentBody}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.85}
        />
        {/* Dragon head */}
        <Path
          d={headPath}
          fill={color}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          opacity={0.85}
        />
        {/* Horn */}
        <Path
          d={hornPath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* Tail fork */}
        <Path
          d={tailPath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* Dragon eye */}
        <Circle
          cx={150 + 27 * flip}
          cy={cy - 0.5}
          r={1.2}
          fill="#ffffff"
          opacity={0.9}
        />

        {/* Right ornamental line */}
        <Line
          x1={184}
          y1={cy}
          x2={270}
          y2={cy}
          stroke="url(#dragonLineR)"
          strokeWidth={1}
        />
        {/* Right decorative dot */}
        <Circle cx={260} cy={cy} r={1.5} fill={color} opacity={0.3} />

        {/* Right end ornament — small diamond */}
        <Polygon
          points={`268,${cy} 264,${cy - 3} 260,${cy} 264,${cy + 3}`}
          fill={color}
          opacity={0.4}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
