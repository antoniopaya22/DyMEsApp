/**
 * GlowCard - A card component with animated glow border effect,
 * gradient accent line, and smooth press animation.
 *
 * Used throughout the app to give a modern, magical feel to card elements.
 *
 * ✅ Theme-aware: adapts to light/dark mode via useTheme()
 */

import { useRef, useCallback, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";

// ─── Props ───────────────────────────────────────────────────────────

interface GlowCardProps {
  children: React.ReactNode;
  /** Called when the card is pressed */
  onPress?: () => void;
  /** Called on long press */
  onLongPress?: () => void;
  /** Whether the card is pressable (default: true if onPress is provided) */
  pressable?: boolean;
  /** Background color of the card (default: from theme — bgCard) */
  backgroundColor?: string;
  /** Border color (default: from theme — borderDefault) */
  borderColor?: string;
  /** Whether to show the animated glow effect (default: false) */
  glow?: boolean;
  /** Glow color (default: primary red) */
  glowColor?: string;
  /** Glow intensity (shadow radius, default: 12) */
  glowIntensity?: number;
  /** Whether to animate the glow (pulse effect, default: true) */
  animateGlow?: boolean;
  /** Whether to show the gradient accent line on the left (default: false) */
  accentLine?: boolean;
  /** Accent line position: 'left' | 'top' (default: 'left') */
  accentPosition?: "left" | "top";
  /** Gradient colors for the accent line */
  accentColors?: [string, string, ...string[]];
  /** Border radius (default: 14) */
  borderRadius?: number;
  /** Padding inside the card (default: 16) */
  padding?: number;
  /** Scale when pressed (default: 0.98) */
  pressScale?: number;
  /** Whether the card has an entrance fade-in animation */
  fadeIn?: boolean;
  /** Delay for the entrance animation in ms (useful for staggered lists) */
  fadeInDelay?: number;
  /** Custom style overrides */
  style?: ViewStyle | ViewStyle[];
  /** Whether the card is disabled */
  disabled?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export default function GlowCard({
  children,
  onPress,
  onLongPress,
  pressable,
  backgroundColor,
  borderColor,
  glow = false,
  glowColor,
  glowIntensity = 12,
  animateGlow = true,
  accentLine = false,
  accentPosition = "left",
  accentColors,
  borderRadius = 14,
  padding = 16,
  pressScale = 0.98,
  fadeIn = false,
  fadeInDelay = 0,
  style,
  disabled = false,
}: GlowCardProps) {
  const { colors, isDark } = useTheme();

  // Resolve theme-aware defaults
  const resolvedGlowColor = glowColor ?? colors.accentRed;
  const resolvedAccentColors: [string, string, ...string[]] = accentColors ?? [
    colors.accentRed,
    "#00BCD4",
    "#33EBFF",
  ];
  const resolvedBg = backgroundColor ?? colors.bgCard;
  const resolvedBorder = borderColor ?? colors.borderDefault;

  const isPressable =
    pressable !== undefined ? pressable : !!(onPress || onLongPress);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const entranceAnim = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(fadeIn ? 16 : 0)).current;

  // Entrance animation
  useEffect(() => {
    if (fadeIn) {
      const delay = fadeInDelay || 0;
      const anim = Animated.parallel([
        Animated.timing(entranceAnim, {
          toValue: 1,
          duration: 400,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 450,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      anim.start();
      return () => anim.stop();
    }
  }, [fadeIn, fadeInDelay, entranceAnim, translateY]);

  // Glow pulse animation
  useEffect(() => {
    if (!glow || !animateGlow) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.25,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [glow, animateGlow, glowAnim]);

  // Press animations
  const handlePressIn = useCallback(() => {
    if (!isPressable) return;
    Animated.timing(scaleAnim, {
      toValue: pressScale,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isPressable, scaleAnim, pressScale]);

  const handlePressOut = useCallback(() => {
    if (!isPressable) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [isPressable, scaleAnim]);

  // Computed glow shadow style (theme-aware)
  const glowShadowStyle: ViewStyle = glow
    ? {
        shadowColor: resolvedGlowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: glowIntensity,
        elevation: 8,
      }
    : {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.shadowOpacity,
        shadowRadius: 4,
        elevation: 3,
      };

  // Inner gradient overlay colors (adapt to theme)
  const innerGlowColors: [string, string, ...string[]] = isDark
    ? ["rgba(255,255,255,0.03)", "rgba(255,255,255,0)", "rgba(0,0,0,0.05)"]
    : ["rgba(255,255,255,0.6)", "rgba(255,255,255,0.1)", "rgba(0,0,0,0.02)"];

  // Build the card content
  const cardContent = (
    <View
      style={[
        styles.cardInner,
        {
          backgroundColor: resolvedBg,
          borderColor: glow ? `${glowColor}44` : resolvedBorder,
          borderRadius,
          overflow: "hidden",
        },
      ]}
    >
      {/* Accent line */}
      {accentLine && accentPosition === "left" && (
        <View
          style={[
            styles.accentLeft,
            {
              borderTopLeftRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
            },
          ]}
        >
          <LinearGradient
            colors={resolvedAccentColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.accentGradientLeft}
          />
        </View>
      )}
      {accentLine && accentPosition === "top" && (
        <View
          style={[
            styles.accentTop,
            {
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
            },
          ]}
        >
          <LinearGradient
            colors={resolvedAccentColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.accentGradientTop}
          />
        </View>
      )}

      {/* Inner subtle gradient overlay for depth */}
      <View style={[styles.innerGlow, { borderRadius: borderRadius - 1 }]}>
        <LinearGradient
          colors={innerGlowColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Content area */}
      <View
        style={[
          styles.content,
          {
            padding,
            paddingLeft:
              accentLine && accentPosition === "left" ? padding + 3 : padding,
            paddingTop:
              accentLine && accentPosition === "top" ? padding + 3 : padding,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );

  // Wrap everything in animations
  return (
    <Animated.View
      style={[
        {
          opacity: entranceAnim,
          transform: [{ scale: scaleAnim }, { translateY }],
        },
        glow && animateGlow
          ? {
              ...glowShadowStyle,
              shadowOpacity: glowAnim as any,
            }
          : glow
            ? { ...glowShadowStyle, shadowOpacity: 0.5 }
            : glowShadowStyle,
        style,
      ]}
    >
      {isPressable ? (
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          disabled={disabled}
        >
          {cardContent}
        </TouchableOpacity>
      ) : (
        cardContent
      )}
    </Animated.View>
  );
}

// ─── Variant: Highlighted Info Card ──────────────────────────────────

interface InfoCardProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  borderColor?: string;
  style?: ViewStyle;
}

export function InfoCard({
  children,
  icon,
  color,
  borderColor: customBorder,
  style,
}: InfoCardProps) {
  const { colors: infoColors } = useTheme();
  const resolvedColor = color ?? infoColors.accentGold;
  return (
    <GlowCard
      backgroundColor={`${resolvedColor}10`}
      borderColor={customBorder || `${resolvedColor}30`}
      borderRadius={12}
      padding={14}
      style={style}
    >
      <View style={styles.infoCardInner}>
        {icon && <View style={styles.infoCardIcon}>{icon}</View>}
        <View style={styles.infoCardContent}>{children}</View>
      </View>
    </GlowCard>
  );
}

// ─── Variant: Stat Card (compact, for grids) ─────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

export function StatCard({
  label,
  value,
  color,
  icon,
  onPress,
  style,
}: StatCardProps) {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.accentGold;

  return (
    <GlowCard
      onPress={onPress}
      accentLine
      accentPosition="top"
      accentColors={[resolvedColor, `${resolvedColor}88`, `${resolvedColor}44`]}
      borderRadius={12}
      padding={12}
      pressScale={0.95}
      style={
        [styles.statCard, style as ViewStyle | undefined].filter(
          Boolean,
        ) as ViewStyle[]
      }
    >
      <View style={styles.statCardInner}>
        {icon && <View style={{ marginBottom: 6 }}>{icon}</View>}
        <View
          style={[
            styles.statCardValueContainer,
            { backgroundColor: `${resolvedColor}15` },
          ]}
        >
          <Animated.Text
            style={[styles.statCardValue, { color: resolvedColor }]}
          >
            {value}
          </Animated.Text>
        </View>
        <Animated.Text
          style={[styles.statCardLabel, { color: colors.textSecondary }]}
        >
          {label}
        </Animated.Text>
      </View>
    </GlowCard>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardInner: {
    borderWidth: 1,
    position: "relative",
  },
  accentLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    zIndex: 2,
    overflow: "hidden",
  },
  accentGradientLeft: {
    flex: 1,
    width: "100%",
  },
  accentTop: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    height: 3,
    zIndex: 2,
    overflow: "hidden",
  },
  accentGradientTop: {
    flex: 1,
    height: "100%",
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: "hidden",
  },
  content: {
    zIndex: 1,
  },
  // InfoCard styles
  infoCardInner: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoCardIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  infoCardContent: {
    flex: 1,
  },
  // StatCard styles
  statCard: {
    flex: 1,
  },
  statCardInner: {
    alignItems: "center",
  },
  statCardValueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    minWidth: 48,
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
});
