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

  // Simplified wing dragon shape (more recognizable)
  const dragonWingPath = `
    M${150 - 18 * flip},${cy}
    C${150 - 15 * flip},${cy - 5} ${150 - 10 * flip},${cy - 10} ${150 - 4 * flip},${cy - 12}
    C${150 + 2 * flip},${cy - 14} ${150 + 8 * flip},${cy - 13} ${150 + 12 * flip},${cy - 10}
    L${150 + 14 * flip},${cy - 8}
    L${150 + 12 * flip},${cy - 5}
    L${150 + 16 * flip},${cy - 6}
    C${150 + 20 * flip},${cy - 7} ${150 + 22 * flip},${cy - 4} ${150 + 18 * flip},${cy}
    C${150 + 22 * flip},${cy + 2} ${150 + 20 * flip},${cy + 6} ${150 + 16 * flip},${cy + 5}
    L${150 + 12 * flip},${cy + 4}
    L${150 + 14 * flip},${cy + 7}
    L${150 + 12 * flip},${cy + 9}
    C${150 + 8 * flip},${cy + 12} ${150 + 2 * flip},${cy + 13} ${150 - 4 * flip},${cy + 11}
    C${150 - 10 * flip},${cy + 9} ${150 - 15 * flip},${cy + 4} ${150 - 18 * flip},${cy}
    Z
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
          x1={10}
          y1={cy}
          x2={128}
          y2={cy}
          stroke="url(#dragonLineL)"
          strokeWidth={1}
        />
        {/* Left decorative dots */}
        <Circle cx={20} cy={cy} r={1.5} fill={color} opacity={0.3} />
        <Circle cx={35} cy={cy} r={1} fill={color} opacity={0.2} />

        {/* Left end ornament — small diamond */}
        <Polygon
          points={`12,${cy} 16,${cy - 3} 20,${cy} 16,${cy + 3}`}
          fill={color}
          opacity={0.4}
        />

        {/* Center glow behind dragon */}
        <Circle cx={150} cy={cy} r={22} fill="url(#dragonGlow)" />

        {/* Dragon silhouette */}
        <Path d={dragonWingPath} fill={color} opacity={0.85} />
        {/* Dragon eye */}
        <Circle
          cx={150 + 8 * flip}
          cy={cy - 4}
          r={1.2}
          fill="#ffffff"
          opacity={0.9}
        />

        {/* Right ornamental line */}
        <Line
          x1={172}
          y1={cy}
          x2={290}
          y2={cy}
          stroke="url(#dragonLineR)"
          strokeWidth={1}
        />
        {/* Right decorative dots */}
        <Circle cx={280} cy={cy} r={1.5} fill={color} opacity={0.3} />
        <Circle cx={265} cy={cy} r={1} fill={color} opacity={0.2} />

        {/* Right end ornament — small diamond */}
        <Polygon
          points={`288,${cy} 284,${cy - 3} 280,${cy} 284,${cy + 3}`}
          fill={color}
          opacity={0.4}
        />

        {/* Small decorative triangles near dragon */}
        <Polygon
          points={`130,${cy} 133,${cy - 2} 133,${cy + 2}`}
          fill={color}
          opacity={0.5}
        />
        <Polygon
          points={`170,${cy} 167,${cy - 2} 167,${cy + 2}`}
          fill={color}
          opacity={0.5}
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
