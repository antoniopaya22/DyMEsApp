import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
  Line,
  Circle,
  Rect,
  Polygon,
  Text as SvgText,
} from "react-native-svg";

interface SwordDividerProps {
  /** "single" for a horizontal sword, "crossed" for crossed swords */
  variant?: "single" | "crossed";
  /** Primary color */
  color?: string;
  /** Blade color */
  bladeColor?: string;
  /** Height of the SVG */
  height?: number;
  /** Spacing */
  spacing?: number;
  /** Label text between the swords */
  label?: string;
  /** Label color */
  labelColor?: string;
  style?: ViewStyle;
}

export function SwordDivider({
  variant = "crossed",
  color = "#00E5FF",
  bladeColor = "#b0b0cc",
  height = 36,
  spacing = 14,
  label,
  labelColor,
  style,
}: SwordDividerProps) {
  const svgW = 300;
  const svgH = 36;
  const cy = svgH / 2;

  return (
    <View style={[styles.container, { marginVertical: spacing }, style]}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <SvgLinearGradient id="bladeFill" x1="0" y1="0.5" x2="1" y2="0.5">
            <Stop offset="0" stopColor={bladeColor} stopOpacity="0.3" />
            <Stop offset="0.3" stopColor={bladeColor} stopOpacity="0.8" />
            <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.9" />
            <Stop offset="0.7" stopColor={bladeColor} stopOpacity="0.8" />
            <Stop offset="1" stopColor={bladeColor} stopOpacity="0.3" />
          </SvgLinearGradient>
          <SvgLinearGradient id="guardFill" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.6" />
          </SvgLinearGradient>
        </Defs>

        {variant === "crossed" ? (
          <G>
            {/* Sword 1 — angled left-to-right */}
            <G opacity={0.85}>
              <Line x1={110} y1={cy + 8} x2={190} y2={cy - 8} stroke={bladeColor} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
              <Line x1={142} y1={cy - 4} x2={142} y2={cy + 8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
              <Circle cx={110} cy={cy + 8} r={2.5} fill={color} opacity={0.8} />
              <Circle cx={190} cy={cy - 8} r={1} fill="#ffffff" opacity={0.6} />
            </G>

            {/* Sword 2 — angled right-to-left */}
            <G opacity={0.85}>
              <Line x1={190} y1={cy + 8} x2={110} y2={cy - 8} stroke={bladeColor} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
              <Line x1={158} y1={cy - 4} x2={158} y2={cy + 8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
              <Circle cx={190} cy={cy + 8} r={2.5} fill={color} opacity={0.8} />
              <Circle cx={110} cy={cy - 8} r={1} fill="#ffffff" opacity={0.6} />
            </G>

            {/* Center intersection gem */}
            <Circle cx={150} cy={cy} r={4} fill={color} opacity={0.9} />
            <Circle cx={150} cy={cy} r={2.5} fill="#ffffff" opacity={0.3} />

            {/* Left decorative line */}
            <Line x1={10} y1={cy} x2={104} y2={cy} stroke={color} strokeWidth={0.5} strokeOpacity={0.3} />
            <Polygon points={`104,${cy} 108,${cy - 2} 108,${cy + 2}`} fill={color} opacity={0.5} />

            {/* Right decorative line */}
            <Line x1={196} y1={cy} x2={290} y2={cy} stroke={color} strokeWidth={0.5} strokeOpacity={0.3} />
            <Polygon points={`196,${cy} 192,${cy - 2} 192,${cy + 2}`} fill={color} opacity={0.5} />
          </G>
        ) : (
          <G>
            {/* Single horizontal sword */}
            <Rect x={40} y={cy - 1} width={220} height={2} fill="url(#bladeFill)" rx={1} />
            <Line x1={40} y1={cy - 1} x2={260} y2={cy - 1} stroke="#ffffff" strokeWidth={0.3} strokeOpacity={0.4} />
            <Rect x={145} y={cy - 7} width={10} height={14} fill="url(#guardFill)" rx={2} />
            <Circle cx={147} cy={cy - 6} r={1.5} fill={color} opacity={0.6} />
            <Circle cx={153} cy={cy - 6} r={1.5} fill={color} opacity={0.6} />
            <Circle cx={147} cy={cy + 6} r={1.5} fill={color} opacity={0.6} />
            <Circle cx={153} cy={cy + 6} r={1.5} fill={color} opacity={0.6} />
            <Rect x={130} y={cy - 2.5} width={15} height={5} fill={color} opacity={0.4} rx={1} />
            <Circle cx={40} cy={cy} r={4} fill={color} opacity={0.7} />
            <Circle cx={40} cy={cy} r={2} fill="#ffffff" opacity={0.15} />
            <Polygon points={`260,${cy} 268,${cy - 1.5} 268,${cy + 1.5}`} fill={bladeColor} opacity={0.8} />
          </G>
        )}

        {/* Label */}
        {label && (
          <SvgText
            x={150}
            y={cy + 15}
            textAnchor="middle"
            fontSize={8}
            fontWeight="700"
            fill={labelColor || color}
            opacity={0.7}
            letterSpacing={2}
          >
            {label.toUpperCase()}
          </SvgText>
        )}
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
