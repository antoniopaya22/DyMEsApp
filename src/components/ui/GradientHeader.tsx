/**
 * GradientHeader - Reusable gradient header component with back button,
 * title, subtitle, action buttons, and a beautiful gradient background.
 *
 * Provides a consistent, modern header across all screens with
 * animated entrance and subtle depth effects.
 *
 * ✅ Theme-aware: adapts to light/dark mode via useTheme()
 */

import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { IconButton } from "./AnimatedPressable";
import { useTheme } from "@/hooks";

// ─── Props ───────────────────────────────────────────────────────────

interface GradientHeaderProps {
  /** Main title text */
  title: string;
  /** Optional subtitle / breadcrumb label above the title */
  subtitle?: string;
  /** Color of the subtitle text (default: from theme — accentGold) */
  subtitleColor?: string;
  /** Whether to show the back button (default: true) */
  showBack?: boolean;
  /** Custom back button handler */
  onBack?: () => void;
  /** Action buttons to show on the right side of the header */
  actions?: HeaderAction[];
  /** Gradient colors from top to bottom (default: from theme) */
  gradientColors?: [string, string, ...string[]];
  /** Whether the header has a bottom border (default: true) */
  showBorder?: boolean;
  /** Border color (default: from theme — borderDefault) */
  borderColor?: string;
  /** Whether to animate the entrance (default: true) */
  animated?: boolean;
  /** Custom content to render below the title area */
  children?: React.ReactNode;
  /** Custom style for the outer container */
  style?: ViewStyle;
  /** Whether to add extra top padding for status bar (default: true) */
  safeArea?: boolean;
  /** Size variant of the header: 'compact' | 'standard' | 'large' */
  size?: "compact" | "standard" | "large";
  /** Optional left element instead of back button */
  leftElement?: React.ReactNode;
  /** Optional center element instead of title/subtitle */
  centerElement?: React.ReactNode;
}

interface HeaderAction {
  /** Icon name from Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Handler when the action is pressed */
  onPress: () => void;
  /** Icon color (default: from theme — textSecondary) */
  color?: string;
  /** Background color (default: from theme — headerButtonBg) */
  backgroundColor?: string;
  /** Border color (default: from theme — headerButtonBorder) */
  borderColor?: string;
  /** Whether to show a glow effect */
  glow?: boolean;
  /** Glow color */
  glowColor?: string;
  /** Badge count to show on the icon */
  badge?: number;
  /** Size of the button (default: 40) */
  size?: number;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// ─── Size Presets ────────────────────────────────────────────────────

const SIZE_PRESETS = {
  compact: {
    paddingTop:
      Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 32) + 8,
    paddingBottom: 10,
    titleSize: 20,
    subtitleSize: 11,
    buttonSize: 36,
    iconSize: 18,
  },
  standard: {
    paddingTop:
      Platform.OS === "ios" ? 56 : (StatusBar.currentHeight || 32) + 14,
    paddingBottom: 14,
    titleSize: 26,
    subtitleSize: 12,
    buttonSize: 40,
    iconSize: 20,
  },
  large: {
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 32) + 18,
    paddingBottom: 20,
    titleSize: 32,
    subtitleSize: 13,
    buttonSize: 44,
    iconSize: 22,
  },
};

// ─── Component ───────────────────────────────────────────────────────

export default function GradientHeader({
  title,
  subtitle,
  subtitleColor,
  showBack = true,
  onBack,
  actions = [],
  gradientColors,
  showBorder = true,
  borderColor,
  animated = true,
  children,
  style,
  safeArea = true,
  size = "standard",
  leftElement,
  centerElement,
}: GradientHeaderProps) {
  const { colors, isDark } = useTheme();
  const preset = SIZE_PRESETS[size];

  // Resolve theme-aware defaults
  const resolvedSubtitleColor = subtitleColor ?? colors.accentGold;
  const resolvedGradientColors: [string, string, ...string[]] =
    gradientColors ??
    (isDark
      ? [colors.bgSecondary, colors.bgPrimary, colors.bgPrimary]
      : [colors.bgSecondary, colors.bgPrimary, colors.bgPrimary]);
  const resolvedBorderColor = borderColor ?? colors.borderDefault;
  const titleColor = colors.textPrimary;
  const textureOpacity = isDark ? 0.02 : 0.01;

  // Entrance animations
  const titleOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const titleTranslateY = useRef(new Animated.Value(animated ? 10 : 0)).current;
  const subtitleOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const actionsOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const childrenOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated) return;

    const animations = Animated.stagger(80, [
      // Subtitle fades in first
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Title slides up and fades in
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Actions fade in
      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Children content fades in last
      Animated.timing(childrenOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, [
    animated,
    titleOpacity,
    titleTranslateY,
    subtitleOpacity,
    actionsOpacity,
    childrenOpacity,
  ]);

  return (
    <View style={[styles.outerContainer, style]}>
      <LinearGradient
        colors={resolvedGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingTop: safeArea ? preset.paddingTop : 12,
            paddingBottom: preset.paddingBottom,
          },
        ]}
      >
        {/* Subtle noise / texture overlay for depth */}
        <View style={[styles.textureOverlay, { opacity: textureOpacity }]} />

        {/* Top Row: Back button / Left element, Center, Actions */}
        <View style={styles.topRow}>
          {/* Left side */}
          <View style={styles.leftContainer}>
            {leftElement
              ? leftElement
              : showBack &&
                onBack && (
                  <IconButton
                    icon="arrow-back"
                    size={preset.buttonSize}
                    iconSize={preset.iconSize}
                    color={colors.textPrimary}
                    backgroundColor={colors.headerButtonBg}
                    borderColor={colors.headerButtonBorder}
                    onPress={onBack}
                    accessibilityLabel="Volver atrás"
                  />
                )}
          </View>

          {/* Center - Title area or custom element */}
          <View style={styles.centerContainer}>
            {centerElement ? (
              centerElement
            ) : (
              <View style={styles.titleContainer}>
                {subtitle && (
                  <Animated.Text
                    style={[
                      styles.subtitle,
                      {
                        color: resolvedSubtitleColor,
                        fontSize: preset.subtitleSize,
                        opacity: subtitleOpacity,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {subtitle}
                  </Animated.Text>
                )}
                <Animated.Text
                  style={[
                    styles.title,
                    {
                      color: titleColor,
                      fontSize: preset.titleSize,
                      opacity: titleOpacity,
                      transform: [{ translateY: titleTranslateY }],
                    },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={size !== "large"}
                  minimumFontScale={0.75}
                >
                  {title}
                </Animated.Text>
              </View>
            )}
          </View>

          {/* Right side - Action buttons */}
          <Animated.View
            style={[styles.actionsContainer, { opacity: actionsOpacity }]}
          >
            {actions.map((action, index) => (
              <View key={index} style={styles.actionWrapper}>
                <IconButton
                  icon={action.icon}
                  size={action.size || preset.buttonSize}
                  iconSize={action.size ? action.size * 0.45 : preset.iconSize}
                  color={action.color || colors.sectionDescColor}
                  backgroundColor={
                    action.backgroundColor || colors.headerButtonBg
                  }
                  borderColor={action.borderColor || colors.headerButtonBorder}
                  glow={action.glow}
                  glowColor={action.glowColor}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  accessibilityLabel={action.accessibilityLabel}
                />
                {/* Badge */}
                {action.badge !== undefined && action.badge > 0 && (
                  <View
                    style={[styles.badge, { borderColor: colors.bgPrimary }]}
                  >
                    <Text style={[styles.badgeText, { color: colors.textInverted }]}>
                      {action.badge > 99 ? "99+" : action.badge}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Children content area */}
        {children && (
          <Animated.View
            style={[styles.childrenContainer, { opacity: childrenOpacity }]}
          >
            {children}
          </Animated.View>
        )}
      </LinearGradient>

      {/* Bottom border with gradient fade */}
      {showBorder && (
        <View style={styles.borderContainer}>
          <LinearGradient
            colors={[
              "transparent",
              `${resolvedBorderColor}88`,
              resolvedBorderColor,
              `${resolvedBorderColor}88`,
              "transparent",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.borderGradient}
          />
        </View>
      )}
    </View>
  );
}

// ─── Compact Header Variant ──────────────────────────────────────────
// A minimal header with just back + centered title + optional right action

interface CompactHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: HeaderAction;
  showBorder?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export function CompactHeader({
  title,
  onBack,
  rightAction,
  showBorder = true,
  animated = true,
  style,
}: CompactHeaderProps) {
  return (
    <GradientHeader
      title={title}
      showBack={!!onBack}
      onBack={onBack}
      actions={rightAction ? [rightAction] : []}
      size="compact"
      showBorder={showBorder}
      animated={animated}
      style={style}
    />
  );
}

// ─── Large Hero Header Variant ───────────────────────────────────────
// A prominent header with large title, gradient glow, and decorative elements

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  description?: string;
  onBack?: () => void;
  actions?: HeaderAction[];
  accentColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
  style?: ViewStyle;
}

export function HeroHeader({
  title,
  subtitle,
  subtitleColor,
  description,
  onBack,
  actions = [],
  accentColor,
  children,
  animated = true,
  style,
}: HeroHeaderProps) {
  const { colors, isDark } = useTheme();
  const resolvedAccentColor = accentColor ?? colors.accentRed;
  const descOpacity = useRef(new Animated.Value(animated ? 0 : 1)).current;

  // Resolve hero-specific gradient
  const heroGradient: [string, string, ...string[]] = isDark
    ? [colors.gradientMain[0], colors.bgSecondary, colors.bgPrimary]
    : [colors.bgSecondary, colors.bgPrimary, colors.bgPrimary];

  useEffect(() => {
    if (!animated) return;
    Animated.timing(descOpacity, {
      toValue: 1,
      duration: 400,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animated, descOpacity]);

  return (
    <GradientHeader
      title={title}
      subtitle={subtitle}
      subtitleColor={subtitleColor}
      showBack={!!onBack}
      onBack={onBack}
      actions={actions}
      size="large"
      animated={animated}
      gradientColors={heroGradient}
      style={style}
    >
      {/* Description text */}
      {description && (
        <Animated.Text
          style={[
            styles.heroDescription,
            { opacity: descOpacity, color: colors.textSecondary },
          ]}
          numberOfLines={3}
        >
          {description}
        </Animated.Text>
      )}

      {/* Decorative accent line */}
      <View style={styles.heroAccentContainer}>
        <LinearGradient
          colors={["transparent", `${resolvedAccentColor}60`, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.heroAccentLine}
        />
      </View>

      {children}
    </GradientHeader>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
    zIndex: 10,
  },
  gradient: {
    paddingHorizontal: 16,
    position: "relative",
    overflow: "hidden",
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.01)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  leftContainer: {
    minWidth: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  titleContainer: {
    alignItems: "flex-start",
  },
  subtitle: {
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#00BCD4", // badge bg — overridden inline via colors.accentRed
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    color: "#0B1221",
    fontSize: 9,
    fontWeight: "800",
  },
  childrenContainer: {
    marginTop: 12,
  },
  borderContainer: {
    height: 1,
  },
  borderGradient: {
    height: 1,
    width: "100%",
  },

  // Hero variant styles
  heroDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  heroAccentContainer: {
    marginTop: 14,
    alignItems: "center",
  },
  heroAccentLine: {
    height: 1,
    width: "100%",
  },
});
