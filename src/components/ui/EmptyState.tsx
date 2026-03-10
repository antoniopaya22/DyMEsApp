/**
 * EmptyState
 *
 * Generic empty-state placeholder with icon, title and subtitle.
 * Optionally shows a CTA button.
 *
 * Extracted from the repeated empty-state patterns in:
 * - index.tsx (EmptyState with CTA)
 * - compendium.tsx (renderEmpty for no search results)
 *
 * @example
 * // Simple "no results" state
 * <EmptyState
 *   icon="search"
 *   title='No se encontraron razas con "xyz"'
 * />
 *
 * // Full CTA state
 * <EmptyState
 *   icon="add-circle-outline"
 *   title="¡Bienvenido, aventurero!"
 *   subtitle="No tienes ninguna partida todavía."
 *   ctaLabel="Crear primera partida"
 *   onCtaPress={() => router.push("/campaigns/new")}
 * />
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";

export interface EmptyStateProps {
  /** Ionicons icon name displayed prominently */
  icon: keyof typeof Ionicons.glyphMap;
  /** Primary heading */
  title: string;
  /** Optional secondary text */
  subtitle?: string;
  /** Custom content rendered instead of the default icon */
  customIcon?: React.ReactNode;
  /** CTA button label */
  ctaLabel?: string;
  /** Called when the CTA button is pressed */
  onCtaPress?: () => void;
  /** Gradient colors for the CTA button (defaults to red gradient) */
  ctaColors?: readonly [string, string, ...string[]];
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  customIcon,
  ctaLabel,
  onCtaPress,
  ctaColors,
}: EmptyStateProps) {
  const { colors } = useTheme();

  // Entrance animations
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(12)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(12)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(16)).current;
  // Idle bounce loop
  const idleBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const stagger = Animated.stagger(120, [
      // Icon: scale-up bounce
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Title: fade + slide
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Subtitle: fade + slide
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // CTA: fade + slide
      Animated.parallel([
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ctaTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);
    stagger.start();

    // Subtle idle bounce on the icon
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idleBounce, {
          toValue: -4,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(idleBounce, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    // Start idle bounce after entrance (delayed)
    const timer = setTimeout(() => loop.start(), 800);

    return () => {
      stagger.stop();
      loop.stop();
      clearTimeout(timer);
    };
  }, []);

  const defaultCtaColors = [
    colors.gradientButtonStart,
    colors.gradientButtonMid,
    colors.gradientButtonEnd,
  ] as const;
  const resolvedCtaColors = ctaColors ?? defaultCtaColors;

  return (
    <View style={styles.container}>
      {/* Icon */}
      <Animated.View
        style={{
          opacity: iconOpacity,
          transform: [{ scale: iconScale }, { translateY: idleBounce }],
        }}
      >
        {customIcon ?? (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${colors.textMuted}12`,
                borderColor: `${colors.textMuted}20`,
              },
            ]}
          >
            <Ionicons name={icon} size={36} color={colors.textMuted} />
          </View>
        )}
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            color: colors.emptyTitle ?? colors.textPrimary,
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        {title}
      </Animated.Text>

      {/* Subtitle */}
      {subtitle ? (
        <Animated.Text
          style={[
            styles.subtitle,
            {
              color: colors.emptySubtitle ?? colors.textSecondary,
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleTranslateY }],
            },
          ]}
        >
          {subtitle}
        </Animated.Text>
      ) : null}

      {/* Optional CTA */}
      {ctaLabel && onCtaPress ? (
        <Animated.View
          style={{
            opacity: ctaOpacity,
            transform: [{ translateY: ctaTranslateY }],
          }}
        >
          <TouchableOpacity
            style={[styles.ctaButton, { shadowColor: colors.accentShadow }]}
            onPress={onCtaPress}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={resolvedCtaColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Ionicons name="add" size={22} color={colors.textInverted} />
              <Text style={[styles.ctaText, { color: colors.textInverted }]}>
                {ctaLabel}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000", // static: theme-independent
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 8,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  ctaText: {
    fontWeight: "800",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});
