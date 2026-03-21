/**
 * DndLogo — App logo using the official DyMEs brand images.
 *
 * Features:
 * - Image-based logo from assets/logos/
 * - Animated entrance, pulse, and glow
 * - Multiple size variants (sm, md, lg, xl)
 * - Inline compact variant for headers
 * - Minimal icon-only variant
 *
 * Usage:
 *   <DndLogo size="lg" animated />
 *   <InlineDndLogo />
 *   <MinimalD20Logo size={80} />
 */

import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme, usePulseAnimation } from '@/hooks';

// ─── Logo assets ─────────────────────────────────────────────────────
const LOGO_DARK = require('../../../assets/logos/Logo_Modo_oscuro.png');
const LOGO_LIGHT = require('../../../assets/logos/Logo_Modo_claro.png');
const LOGO_DARK_NO_TEXT = require('../../../assets/logos/Logo_Modo_oscuro_Sin_Texto.png');
const LOGO_LIGHT_NO_TEXT = require('../../../assets/logos/Logo_Modo_claro_Sin_Texto.png');

// ─── Props ───────────────────────────────────────────────────────────

interface DndLogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show the text label below (kept for API compat, ignored — logo includes text) */
  showLabel?: boolean;
  /** Whether to animate (pulse/glow) */
  animated?: boolean;
  /** Kept for API compat */
  showRunicRing?: boolean;
  /** Kept for API compat */
  showDragonAccents?: boolean;
  /** Custom container style */
  style?: ViewStyle;
}

// ─── Size Presets ────────────────────────────────────────────────────

const SIZE_PRESETS = {
  sm: { imageSize: 100 },
  md: { imageSize: 140 },
  lg: { imageSize: 180 },
  xl: { imageSize: 240 },
};

// ─── Main Logo Component ─────────────────────────────────────────────

export default function DndLogo({
  size = 'md',
  animated = true,
  style,
}: DndLogoProps) {
  const { isDark } = useTheme();
  const preset = SIZE_PRESETS[size];
  const logoSource = isDark ? LOGO_DARK : LOGO_LIGHT;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    if (!animated) return;

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
      {/* Glow behind the logo */}
      <Animated.View
        style={[
          styles.nativeGlow,
          {
            width: preset.imageSize * 0.8,
            height: preset.imageSize * 0.8,
            borderRadius: preset.imageSize * 0.4,
            opacity: glowAnim,
            shadowColor: '#00BCD4',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 24,
            elevation: 10,
            backgroundColor: 'rgba(0, 188, 212, 0.08)',
          },
        ]}
      />

      <Image
        source={logoSource}
        style={{ width: preset.imageSize, height: preset.imageSize }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// ─── Compact Inline Logo (for headers) ───────────────────────────────

interface InlineLogoProps {
  style?: ViewStyle;
}

export function InlineDndLogo({ style }: InlineLogoProps) {
  const { colors, isDark } = useTheme();
  const iconSource = isDark ? LOGO_DARK_NO_TEXT : LOGO_LIGHT_NO_TEXT;
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
      <Image
        source={iconSource}
        style={styles.inlineImage}
        resizeMode="contain"
      />

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
          <View
            style={[styles.inlineSubLine, { backgroundColor: colors.accentGoldGlow }]}
          />
          <Text
            style={[styles.inlineSubtitle, { color: colors.headerLabelColor + '80' }]}
          >
            5ª Edición
          </Text>
          <View
            style={[styles.inlineSubLine, { backgroundColor: colors.accentGoldGlow }]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Minimal Logo (just the icon, no text) ───────────────────────────

interface MinimalLogoProps {
  size?: number;
  animated?: boolean;
  showRunicRing?: boolean;
  style?: ViewStyle;
}

export function MinimalD20Logo({
  size = 48,
  animated = false,
  style,
}: MinimalLogoProps) {
  const { isDark } = useTheme();
  const iconSource = isDark ? LOGO_DARK_NO_TEXT : LOGO_LIGHT_NO_TEXT;
  const { scale: pulseAnim } = usePulseAnimation({
    active: animated,
    maxScale: 1.04,
    duration: 4000,
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      <Image
        source={iconSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeGlow: {
    position: 'absolute',
  },

  // Inline Logo
  inlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineImage: {
    width: 38,
    height: 38,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  inlineTextContainer: {
    marginLeft: 10,
  },
  inlineTitle: {
    color: '#00E5FF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 229, 255, 0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  inlineSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  inlineSubLine: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    marginHorizontal: 4,
  },
  inlineSubtitle: {
    color: 'rgba(0, 229, 255, 0.45)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
});
