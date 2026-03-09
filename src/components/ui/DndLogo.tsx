/**
 * DndLogo Ã¢â‚¬â€ Revamped D&D themed logo with SVG D20 die,
 * dragon accents, runic decorations, and distinctive branding.
 *
 * Features:
 * - SVG-based D20 icosahedron icon (not just "20" text in a box)
 * - Animated glow, pulse, and subtle rotation
 * - Runic ring border around the die
 * - Dragon wing accents flanking the brand text
 * - Multiple size variants (sm, md, lg, xl)
 * - Inline compact variant for headers
 *
 * Usage:
 *   <DndLogo size="lg" animated />
 *   <InlineDndLogo />
 */

import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/hooks";
import { LinearGradient } from "expo-linear-gradient";
import {
  getD20Geometry,
  pointsToString,
  type D20GeometryOptions,
} from "@/utils/d20Geometry";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Circle,
  G,
  Path,
  Polygon,
  Text as SvgText,
  Line,
} from "react-native-svg";

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Props Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

interface DndLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether to show the text label below */
  showLabel?: boolean;
  /** Whether to animate (pulse/glow) */
  animated?: boolean;
  /** Whether to show the runic ring */
  showRunicRing?: boolean;
  /** Whether to show the dragon wing accents on label */
  showDragonAccents?: boolean;
  /** Custom container style */
  style?: ViewStyle;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Size Presets Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const SIZE_PRESETS = {
  sm: {
    container: 48,
    svgSize: 48,
    outerRing: 58,
    labelFontSize: 11,
    subtitleSize: 7,
    glowRadius: 12,
    runicRingSize: 62,
    labelGap: 6,
  },
  md: {
    container: 68,
    svgSize: 68,
    outerRing: 80,
    labelFontSize: 14,
    subtitleSize: 9,
    glowRadius: 18,
    runicRingSize: 86,
    labelGap: 8,
  },
  lg: {
    container: 88,
    svgSize: 88,
    outerRing: 102,
    labelFontSize: 16,
    subtitleSize: 10,
    glowRadius: 24,
    runicRingSize: 110,
    labelGap: 10,
  },
  xl: {
    container: 120,
    svgSize: 120,
    outerRing: 140,
    labelFontSize: 20,
    subtitleSize: 12,
    glowRadius: 32,
    runicRingSize: 150,
    labelGap: 14,
  },
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Rune characters (Elder Futhark) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const RUNES = "Ã¡Å¡Â Ã¡Å¡Â¢Ã¡Å¡Â¦Ã¡Å¡Â¨Ã¡Å¡Â±Ã¡Å¡Â²Ã¡Å¡Â·Ã¡Å¡Â¹Ã¡Å¡ÂºÃ¡Å¡Â¾Ã¡â€ºÂÃ¡â€ºÆ’";

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ D20 Geometry Ã¢â‚¬â€ DndLogo shade configuration Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const LOGO_D20_OPTIONS: D20GeometryOptions = {
  innerRadiusRatio: 0.56,
  outerShades: [0.9, 0.72, 0.48, 0.52, 0.78],
  innerShades: [0.62, 0.42, 0.32, 0.38, 0.56],
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ D20 SVG Sub-Component Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function D20Svg({
  svgSize,
  showRunicRing,
}: {
  svgSize: number;
  showRunicRing: boolean;
}) {
  const vb = 100;
  const cx = 50;
  const cy = 50;
  const dieRadius = showRunicRing ? 32 : 38;
  const geo = getD20Geometry(cx, cy, dieRadius, LOGO_D20_OPTIONS);
  const fontSize = 17;

  // Runic ring properties
  const runicR = 44;

  return (
    <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${vb} ${vb}`}>
      <Defs>
        <SvgLinearGradient id="logoFaceHL" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#33EBFF" stopOpacity="0.95" />
          <Stop offset="0.55" stopColor="#00BCD4" stopOpacity="1" />
          <Stop offset="1" stopColor="#04404D" stopOpacity="1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="logoFaceMain" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#00BCD4" stopOpacity="1" />
          <Stop offset="0.5" stopColor="#00BCD4" stopOpacity="1" />
          <Stop offset="1" stopColor="#05525F" stopOpacity="1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="logoFaceSH" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#0A6C7A" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#032D35" stopOpacity="1" />
        </SvgLinearGradient>
        <RadialGradient
          id="logoCenterGrad"
          cx="0.5"
          cy="0.42"
          rx="0.6"
          ry="0.6"
        >
          <Stop offset="0" stopColor="#33EBFF" stopOpacity="0.35" />
          <Stop offset="0.45" stopColor="#00BCD4" stopOpacity="1" />
          <Stop offset="1" stopColor="#04404D" stopOpacity="0.95" />
        </RadialGradient>
        <SvgLinearGradient id="logoEdgeShine" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.06" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.18" />
        </SvgLinearGradient>
        <RadialGradient id="logoOuterGlow" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#00BCD4" stopOpacity="0.2" />
          <Stop offset="0.6" stopColor="#00BCD4" stopOpacity="0.08" />
          <Stop offset="1" stopColor="#00BCD4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="logoRuneGlow" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#00E5FF" stopOpacity="0.12" />
          <Stop offset="1" stopColor="#00E5FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background glow */}
      <Circle cx={cx} cy={cy} r={49} fill="url(#logoOuterGlow)" />

      {/* Runic ring */}
      {showRunicRing && (
        <G>
          {/* Runic glow */}
          <Circle cx={cx} cy={cy} r={runicR + 2} fill="url(#logoRuneGlow)" />

          {/* Outer ring circle */}
          <Circle
            cx={cx}
            cy={cy}
            r={runicR}
            fill="none"
            stroke="#00E5FF"
            strokeWidth={0.6}
            strokeOpacity={0.4}
          />
          {/* Inner ring circle */}
          <Circle
            cx={cx}
            cy={cy}
            r={runicR - 4}
            fill="none"
            stroke="#00E5FF"
            strokeWidth={0.4}
            strokeOpacity={0.25}
          />

          {/* Rune characters around the ring */}
          {Array.from(RUNES).map((rune, i) => {
            const angle = (Math.PI * 2 * i) / RUNES.length - Math.PI / 2;
            const rx = runicR - 2;
            return (
              <SvgText
                key={`rune-${i}`}
                x={cx + rx * Math.cos(angle)}
                y={cy + rx * Math.sin(angle) + 2.5}
                textAnchor="middle"
                fontSize={5.5}
                fill="#00E5FF"
                opacity={0.55}
              >
                {rune}
              </SvgText>
            );
          })}

          {/* Cardinal tick marks on outer ring */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (Math.PI * 2 * i) / 8;
            const r1 = runicR - 0.3;
            const r2 = runicR + (i % 2 === 0 ? 2.5 : 1.5);
            return (
              <Line
                key={`tick-${i}`}
                x1={cx + r1 * Math.cos(angle)}
                y1={cy + r1 * Math.sin(angle)}
                x2={cx + r2 * Math.cos(angle)}
                y2={cy + r2 * Math.sin(angle)}
                stroke="#00E5FF"
                strokeWidth={i % 2 === 0 ? 1 : 0.5}
                strokeOpacity={i % 2 === 0 ? 0.6 : 0.35}
              />
            );
          })}

          {/* Small diamonds at cardinal points */}
          {[0, 2, 4, 6].map((i) => {
            const angle = (Math.PI * 2 * i) / 8;
            const dr = runicR + 4;
            const dx = cx + dr * Math.cos(angle);
            const dy = cy + dr * Math.sin(angle);
            return (
              <Polygon
                key={`cdiamond-${i}`}
                points={`${dx},${dy - 2} ${dx + 1.5},${dy} ${dx},${dy + 2} ${dx - 1.5},${dy}`}
                fill="#00E5FF"
                opacity={0.45}
              />
            );
          })}
        </G>
      )}

      {/* D20 Die border glow ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={dieRadius + 2}
        fill="none"
        stroke="#00BCD4"
        strokeWidth={0.8}
        strokeOpacity={0.3}
      />

      {/* Outer triangular faces */}
      {geo.outerFaces.map((face, i) => (
        <Polygon
          key={`of-${i}`}
          points={pointsToString(face.points)}
          fill={
            face.shade > 0.7
              ? "url(#logoFaceHL)"
              : face.shade > 0.5
                ? "url(#logoFaceMain)"
                : "url(#logoFaceSH)"
          }
          stroke="#032D35"
          strokeWidth={0.5}
          strokeOpacity={0.6}
          opacity={0.88 + face.shade * 0.12}
        />
      ))}

      {/* Inner triangular faces */}
      {geo.innerFaces.map((face, i) => (
        <Polygon
          key={`if-${i}`}
          points={pointsToString(face.points)}
          fill={face.shade > 0.5 ? "url(#logoFaceMain)" : "url(#logoFaceSH)"}
          stroke="#032D35"
          strokeWidth={0.5}
          strokeOpacity={0.45}
          opacity={0.82 + face.shade * 0.18}
        />
      ))}

      {/* Center pentagon face */}
      <Polygon
        points={pointsToString(geo.centerFace)}
        fill="url(#logoCenterGrad)"
        stroke="#33EBFF"
        strokeWidth={0.6}
        strokeOpacity={0.25}
      />

      {/* Specular highlights on top faces */}
      <Polygon
        points={pointsToString(geo.outerFaces[0].points)}
        fill="url(#logoEdgeShine)"
        opacity={0.45}
      />
      <Polygon
        points={pointsToString(geo.outerFaces[4].points)}
        fill="url(#logoEdgeShine)"
        opacity={0.3}
      />

      {/* Edge highlight lines for 3D depth */}
      {geo.outerPoints.map((point, i) => {
        const inner = geo.innerPoints[i];
        return (
          <Path
            key={`el-${i}`}
            d={`M${point.x.toFixed(1)},${point.y.toFixed(1)} L${inner.x.toFixed(1)},${inner.y.toFixed(1)}`}
            stroke="#33EBFF"
            strokeWidth={0.35}
            strokeOpacity={i === 0 || i === 4 ? 0.4 : 0.15}
          />
        );
      })}

      {/* "20" number Ã¢â‚¬â€ shadow */}
      <SvgText
        x={cx + 0.4}
        y={cy + fontSize * 0.34 + 0.7}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill="#000000"
        opacity={0.45}
      >
        20
      </SvgText>
      {/* "20" number Ã¢â‚¬â€ main */}
      <SvgText
        x={cx}
        y={cy + fontSize * 0.34}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill="#ffffff"
        opacity={0.95}
      >
        20
      </SvgText>

      {/* Top vertex sparkle */}
      <Circle
        cx={geo.outerPoints[0].x}
        cy={geo.outerPoints[0].y}
        r={1.2}
        fill="#ffffff"
        opacity={0.45}
      />

      {/* Sparkle accents */}
      <G opacity={0.6}>
        <Path
          d={`M${cx + dieRadius + 5},${cy - dieRadius + 2} l1.5,-3 l1.5,3 l-1.5,3 z`}
          fill="#00E5FF"
          opacity={0.7}
        />
        <Circle
          cx={cx - dieRadius - 3}
          cy={cy + dieRadius - 5}
          r={1}
          fill="#00E5FF"
          opacity={0.5}
        />
      </G>
    </Svg>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main Logo Component Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export default function DndLogo({
  size = "md",
  showLabel = true,
  animated = true,
  showRunicRing = true,
  showDragonAccents = true,
  style,
}: DndLogoProps) {
  const preset = SIZE_PRESETS[size];

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance spring
    Animated.spring(entranceAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    if (!animated) return;

    // Pulse loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Glow opacity loop
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.65,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [animated, pulseAnim, glowAnim, entranceAnim]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: entranceAnim,
          transform: [{ scale: Animated.multiply(entranceAnim, pulseAnim) }],
        },
        style,
      ]}
    >
      {/* Native glow shadow behind the die */}
      <Animated.View
        style={[
          styles.nativeGlow,
          {
            width: preset.outerRing,
            height: preset.outerRing,
            borderRadius: preset.outerRing / 2,
            opacity: glowAnim,
            shadowColor: "#00BCD4",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: preset.glowRadius,
            elevation: 10,
            backgroundColor: "rgba(0, 188, 212, 0.08)",
          },
        ]}
      />

      {/* Main D20 SVG */}
      <D20Svg svgSize={preset.svgSize} showRunicRing={showRunicRing} />

      {/* Gold sparkle accent */}
      <Animated.View
        style={[
          styles.sparkle,
          {
            opacity: glowAnim,
            top: -2,
            right: showRunicRing ? -2 : preset.outerRing * 0.08,
          },
        ]}
      >
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Path
            d="M7,0 L8.2,5.2 L14,7 L8.2,8.8 L7,14 L5.8,8.8 L0,7 L5.8,5.2 Z"
            fill="#00E5FF"
            opacity={0.85}
          />
        </Svg>
      </Animated.View>

      {/* Label below the die */}
      {showLabel && (
        <View style={[styles.labelContainer, { marginTop: preset.labelGap }]}>
          {/* Dragon wing accents flanking the text */}
          {showDragonAccents && size !== "sm" && (
            <View style={styles.labelRow}>
              {/* Left wing */}
              <Svg
                width={22}
                height={12}
                viewBox="0 0 22 12"
                style={styles.wingLeft}
              >
                <Path
                  d="M22,6 C18,6 14,3 10,2 C6,1 2,2 0,4 C2,5 6,4 10,5 C14,6 18,7 22,6 Z"
                  fill="#00E5FF"
                  opacity={0.4}
                />
                <Path
                  d="M22,6 C18,7 14,9 10,10 C6,11 2,10 0,8 C2,7 6,8 10,7 C14,6 18,6 22,6 Z"
                  fill="#00E5FF"
                  opacity={0.25}
                />
              </Svg>

              <View style={styles.labelTextContainer}>
                <Text
                  style={[
                    styles.labelTitle,
                    { fontSize: preset.labelFontSize },
                  ]}
                >
                  DyMEs
                </Text>
                <Text
                  style={[
                    styles.labelSubtitle,
                    { fontSize: preset.subtitleSize },
                  ]}
                >
                  5Âª EDICIÃ“N
                </Text>
              </View>

              {/* Right wing (mirrored) */}
              <Svg
                width={22}
                height={12}
                viewBox="0 0 22 12"
                style={styles.wingRight}
              >
                <Path
                  d="M0,6 C4,6 8,3 12,2 C16,1 20,2 22,4 C20,5 16,4 12,5 C8,6 4,7 0,6 Z"
                  fill="#00E5FF"
                  opacity={0.4}
                />
                <Path
                  d="M0,6 C4,7 8,9 12,10 C16,11 20,10 22,8 C20,7 16,8 12,7 C8,6 4,6 0,6 Z"
                  fill="#00E5FF"
                  opacity={0.25}
                />
              </Svg>
            </View>
          )}

          {/* Fallback for small size without dragon accents */}
          {(!showDragonAccents || size === "sm") && (
            <View style={styles.labelTextContainer}>
              <Text
                style={[styles.labelTitle, { fontSize: preset.labelFontSize }]}
              >
                DyMEs
              </Text>
              <Text
                style={[
                  styles.labelSubtitle,
                  { fontSize: preset.subtitleSize },
                ]}
              >
                5Âª EDICIÃ“N
              </Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Compact Inline Logo (for headers) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

interface InlineLogoProps {
  style?: ViewStyle;
}

export function InlineDndLogo({ style }: InlineLogoProps) {
  const { colors } = useTheme();
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [entranceAnim]);

  return (
    <Animated.View
      style={[
        styles.inlineWrapper,
        {
          opacity: entranceAnim,
          transform: [{ scale: entranceAnim }],
        },
        style,
      ]}
    >
      {/* Inline D20 SVG Ã¢â‚¬â€ small, no runic ring */}
      <View style={styles.inlineDieContainer}>
        <D20Svg svgSize={38} showRunicRing={false} />
      </View>

      <View style={styles.inlineTextContainer}>
        <Text
          style={[
            styles.inlineTitle,
            {
              color: colors.headerLabelColor,
              textShadowColor: colors.accentGoldGlow,
            },
          ]}
        >
          DyMEs
        </Text>
        <View style={styles.inlineSubRow}>
          {/* Tiny decorative line before subtitle */}
          <View
            style={[
              styles.inlineSubLine,
              { backgroundColor: colors.accentGoldGlow },
            ]}
          />
          <Text
            style={[
              styles.inlineSubtitle,
              { color: colors.headerLabelColor + "80" },
            ]}
          >
            5Âª EdiciÃ³n
          </Text>
          <View
            style={[
              styles.inlineSubLine,
              { backgroundColor: colors.accentGoldGlow },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Minimal D20 Logo (just the die, no text) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

interface MinimalLogoProps {
  size?: number;
  animated?: boolean;
  showRunicRing?: boolean;
  style?: ViewStyle;
}

export function MinimalD20Logo({
  size = 48,
  animated = false,
  showRunicRing = false,
  style,
}: MinimalLogoProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
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
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [animated, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
    >
      <D20Svg svgSize={size} showRunicRing={showRunicRing} />
    </Animated.View>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Styles Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  nativeGlow: {
    position: "absolute",
  },
  sparkle: {
    position: "absolute",
  },
  labelContainer: {
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  labelTextContainer: {
    alignItems: "center",
  },
  wingLeft: {
    marginRight: 4,
    marginTop: 2,
  },
  wingRight: {
    marginLeft: 4,
    marginTop: 2,
  },
  labelTitle: {
    color: "#00E5FF",
    fontWeight: "900",
    letterSpacing: 3,
    textShadowColor: "rgba(0, 229, 255, 0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  labelSubtitle: {
    color: "rgba(0, 229, 255, 0.55)",
    fontWeight: "700",
    letterSpacing: 5,
    marginTop: 1,
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Inline Logo Ã¢â€â‚¬Ã¢â€â‚¬
  inlineWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  inlineDieContainer: {
    shadowColor: "#00BCD4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  inlineTextContainer: {
    marginLeft: 10,
  },
  inlineTitle: {
    color: "#00E5FF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 229, 255, 0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  inlineSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  inlineSubLine: {
    width: 10,
    height: 1,
    backgroundColor: "rgba(0, 229, 255, 0.25)",
    marginHorizontal: 4,
  },
  inlineSubtitle: {
    color: "rgba(0, 229, 255, 0.45)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
});
