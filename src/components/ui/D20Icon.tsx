/**
 * D20Icon — SVG-based D20 (icosahedron) die icon with proper geometry,
 * gradients, highlights, and optional glow/animation effects.
 *
 * Renders a stylized twenty-sided die using react-native-svg with:
 * - Proper icosahedron face geometry (visible front faces)
 * - Metallic gradient fills with highlight/shadow
 * - "20" number on the center face
 * - Optional outer glow ring
 * - Optional pulse animation
 *
 * Usage:
 *   <D20Icon size={64} color="#00BCD4" />
 *   <D20Icon size={48} variant="gold" animated />
 */

import { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Polygon,
  Circle,
  Text as SvgText,
  G,
  Path,
  Rect,
} from "react-native-svg";
import { getD20Geometry, pointsToString } from "@/utils/d20Geometry";

// ─── Types ───────────────────────────────────────────────────────────

type D20Variant = "red" | "gold" | "silver" | "blue" | "purple" | "green" | "dark";

interface D20IconProps {
  /** Pixel size of the icon (width & height) */
  size?: number;
  /** Color variant preset */
  variant?: D20Variant;
  /** Custom primary color (overrides variant) */
  color?: string;
  /** Custom secondary/highlight color */
  highlightColor?: string;
  /** Whether to show the outer glow ring */
  showGlow?: boolean;
  /** Whether to show the "20" number */
  showNumber?: boolean;
  /** Custom number to display (default: "20") */
  number?: string;
  /** Whether to animate with a subtle pulse */
  animated?: boolean;
  /** Whether to show decorative edge runes/dots */
  showRunes?: boolean;
  /** Opacity of the icon (0-1) */
  opacity?: number;
  /** Custom container style */
  style?: ViewStyle;
}

// ─── Color Presets ───────────────────────────────────────────────────

const VARIANT_COLORS: Record<D20Variant, { primary: string; highlight: string; shadow: string; glow: string; numberColor: string }> = {
  red: {
    primary: "#00BCD4",
    highlight: "#33EBFF",
    shadow: "#00838F",
    glow: "rgba(0, 229, 255, 0.4)",
    numberColor: "#0B1221",
  },
  gold: {
    primary: "#0E7490",
    highlight: "#22D3EE",
    shadow: "#164E63",
    glow: "rgba(14, 116, 144, 0.4)",
    numberColor: "#ffffff",
  },
  silver: {
    primary: "#78909c",
    highlight: "#cfd8dc",
    shadow: "#37474f",
    glow: "rgba(120, 144, 156, 0.35)",
    numberColor: "#ffffff",
  },
  blue: {
    primary: "#1565c0",
    highlight: "#42a5f5",
    shadow: "#0d47a1",
    glow: "rgba(21, 101, 192, 0.4)",
    numberColor: "#ffffff",
  },
  purple: {
    primary: "#7b1fa2",
    highlight: "#ba68c8",
    shadow: "#4a148c",
    glow: "rgba(123, 31, 162, 0.4)",
    numberColor: "#ffffff",
  },
  green: {
    primary: "#2e7d32",
    highlight: "#66bb6a",
    shadow: "#1b5e20",
    glow: "rgba(46, 125, 50, 0.4)",
    numberColor: "#ffffff",
  },
  dark: {
    primary: "#182338",
    highlight: "#2D4054",
    shadow: "#080E1A",
    glow: "rgba(24, 35, 56, 0.5)",
    numberColor: "#00E5FF",
  },
};

// ─── Component ───────────────────────────────────────────────────────

export default function D20Icon({
  size = 64,
  variant = "red",
  color,
  highlightColor,
  showGlow = true,
  showNumber = true,
  number = "20",
  animated = false,
  showRunes = false,
  opacity = 1,
  style,
}: D20IconProps) {
  const colors = VARIANT_COLORS[variant];
  const primaryColor = color || colors.primary;
  const highlight = highlightColor || colors.highlight;
  const shadow = colors.shadow;
  const glowColor = colors.glow;
  const numberColor = colors.numberColor;

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!animated) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [animated, pulseAnim, glowAnim]);

  // Geometry
  const viewBox = "0 0 100 100";
  const cx = 50;
  const cy = 50;
  const dieRadius = 40;
  const geo = getD20Geometry(cx, cy, dieRadius);

  // Font size scales with die size in viewBox
  const fontSize = number.length <= 2 ? 22 : 16;

  const svgContent = (
    <Svg width={size} height={size} viewBox={viewBox}>
      <Defs>
        {/* Main face gradient */}
        <SvgLinearGradient id="faceGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={highlight} stopOpacity="1" />
          <Stop offset="0.5" stopColor={primaryColor} stopOpacity="1" />
          <Stop offset="1" stopColor={shadow} stopOpacity="1" />
        </SvgLinearGradient>

        {/* Highlight gradient for top faces */}
        <SvgLinearGradient id="highlightGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor={highlight} stopOpacity="0.9" />
          <Stop offset="0.6" stopColor={primaryColor} stopOpacity="0.95" />
          <Stop offset="1" stopColor={shadow} stopOpacity="1" />
        </SvgLinearGradient>

        {/* Shadow gradient for bottom faces */}
        <SvgLinearGradient id="shadowGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor={primaryColor} stopOpacity="0.85" />
          <Stop offset="1" stopColor={shadow} stopOpacity="1" />
        </SvgLinearGradient>

        {/* Center face gradient */}
        <RadialGradient id="centerGrad" cx="0.5" cy="0.45" rx="0.55" ry="0.55">
          <Stop offset="0" stopColor={highlight} stopOpacity="0.35" />
          <Stop offset="0.5" stopColor={primaryColor} stopOpacity="1" />
          <Stop offset="1" stopColor={shadow} stopOpacity="0.9" />
        </RadialGradient>

        {/* Outer glow */}
        <RadialGradient id="outerGlow" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor={primaryColor} stopOpacity="0.15" />
          <Stop offset="0.65" stopColor={primaryColor} stopOpacity="0.08" />
          <Stop offset="1" stopColor={primaryColor} stopOpacity="0" />
        </RadialGradient>

        {/* Edge shine */}
        <SvgLinearGradient id="edgeShine" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.25" />
          <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.05" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.15" />
        </SvgLinearGradient>
      </Defs>

      {/* Background glow */}
      {showGlow && (
        <Circle cx={cx} cy={cx} r={48} fill="url(#outerGlow)" />
      )}

      {/* Outer ring / border glow */}
      {showGlow && (
        <Circle
          cx={cx}
          cy={cy}
          r={dieRadius + 3}
          fill="none"
          stroke={primaryColor}
          strokeWidth={0.5}
          strokeOpacity={0.25}
        />
      )}

      {/* Draw outer faces (the 5 triangles touching the outer rim) */}
      {geo.outerFaces.map((face, i) => (
        <Polygon
          key={`outer-${i}`}
          points={pointsToString(face.points)}
          fill={face.shade > 0.7 ? "url(#highlightGrad)" : face.shade > 0.5 ? "url(#faceGrad)" : "url(#shadowGrad)"}
          stroke={shadow}
          strokeWidth={0.6}
          strokeOpacity={0.5}
          opacity={0.85 + face.shade * 0.15}
        />
      ))}

      {/* Draw inner faces (the 5 triangles connecting inner to outer ring) */}
      {geo.innerFaces.map((face, i) => (
        <Polygon
          key={`inner-${i}`}
          points={pointsToString(face.points)}
          fill={face.shade > 0.5 ? "url(#faceGrad)" : "url(#shadowGrad)"}
          stroke={shadow}
          strokeWidth={0.6}
          strokeOpacity={0.4}
          opacity={0.8 + face.shade * 0.2}
        />
      ))}

      {/* Center pentagon face — where the "20" goes */}
      <Polygon
        points={pointsToString(geo.centerFace)}
        fill="url(#centerGrad)"
        stroke={highlight}
        strokeWidth={0.8}
        strokeOpacity={0.3}
      />

      {/* Specular highlight on top-left faces */}
      <Polygon
        points={pointsToString(geo.outerFaces[0].points)}
        fill="url(#edgeShine)"
        opacity={0.4}
      />
      <Polygon
        points={pointsToString(geo.outerFaces[4].points)}
        fill="url(#edgeShine)"
        opacity={0.25}
      />

      {/* Edge highlight lines for 3D depth */}
      {geo.outerPoints.map((point, i) => {
        const inner = geo.innerPoints[i];
        return (
          <Path
            key={`edge-${i}`}
            d={`M${point.x.toFixed(2)},${point.y.toFixed(2)} L${inner.x.toFixed(2)},${inner.y.toFixed(2)}`}
            stroke={highlight}
            strokeWidth={0.4}
            strokeOpacity={i === 0 || i === 4 ? 0.35 : 0.15}
          />
        );
      })}

      {/* "20" number in center */}
      {showNumber && (
        <G>
          {/* Text shadow */}
          <SvgText
            x={cx + 0.5}
            y={cy + fontSize * 0.35 + 0.8}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="900"
            fill="#000000"
            opacity={0.4}
          >
            {number}
          </SvgText>
          {/* Main text */}
          <SvgText
            x={cx}
            y={cy + fontSize * 0.35}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="900"
            fill={numberColor}
            opacity={0.95}
          >
            {number}
          </SvgText>
        </G>
      )}

      {/* Decorative rune dots on vertices */}
      {showRunes &&
        geo.outerPoints.map((point, i) => (
          <G key={`rune-${i}`}>
            <Circle
              cx={point.x}
              cy={point.y}
              r={2}
              fill={highlight}
              opacity={0.5}
            />
            <Circle
              cx={point.x}
              cy={point.y}
              r={1}
              fill="#ffffff"
              opacity={0.7}
            />
          </G>
        ))}

      {/* Top vertex highlight (light source indicator) */}
      <Circle
        cx={geo.outerPoints[0].x}
        cy={geo.outerPoints[0].y}
        r={1.5}
        fill="#ffffff"
        opacity={0.4}
      />
    </Svg>
  );

  if (animated) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            opacity,
            transform: [{ scale: pulseAnim }],
          },
          showGlow && {
            shadowColor: primaryColor,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: size * 0.2,
            elevation: 8,
          },
          style,
        ]}
      >
        {showGlow && (
          <Animated.View
            style={[
              styles.nativeGlow,
              {
                backgroundColor: glowColor,
                width: size * 1.4,
                height: size * 1.4,
                borderRadius: size * 0.7,
                opacity: glowAnim,
              },
            ]}
          />
        )}
        {svgContent}
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity,
        },
        showGlow && {
          shadowColor: primaryColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: size * 0.15,
          elevation: 6,
        },
        style,
      ]}
    >
      {showGlow && (
        <View
          style={[
            styles.nativeGlow,
            {
              backgroundColor: glowColor,
              width: size * 1.3,
              height: size * 1.3,
              borderRadius: size * 0.65,
              opacity: 0.5,
            },
          ]}
        />
      )}
      {svgContent}
    </View>
  );
}

// ─── Compact D20 Badge ───────────────────────────────────────────────
// A smaller, simpler D20 meant for inline use (badges, list icons, etc.)

interface D20BadgeProps {
  size?: number;
  variant?: D20Variant;
  number?: string;
  style?: ViewStyle;
}

export function D20Badge({
  size = 28,
  variant = "red",
  number = "20",
  style,
}: D20BadgeProps) {
  return (
    <D20Icon
      size={size}
      variant={variant}
      number={number}
      showGlow={false}
      showRunes={false}
      showNumber={true}
      animated={false}
      style={style}
    />
  );
}

// ─── Decorative D20 (for backgrounds, watermarks) ────────────────────

interface D20WatermarkProps {
  size?: number;
  variant?: D20Variant;
  opacity?: number;
  style?: ViewStyle;
}

export function D20Watermark({
  size = 200,
  variant = "dark",
  opacity = 0.06,
  style,
}: D20WatermarkProps) {
  return (
    <D20Icon
      size={size}
      variant={variant}
      showGlow={false}
      showNumber={false}
      showRunes={false}
      animated={false}
      opacity={opacity}
      style={style}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  nativeGlow: {
    position: "absolute",
  },
});
