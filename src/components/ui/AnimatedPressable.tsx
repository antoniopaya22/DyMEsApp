/**
 * AnimatedPressable - A reusable button/pressable with smooth scale animation
 * and optional glow effect for a modern, polished feel.
 *
 * ✅ Theme-aware: adapts to light/dark mode via useTheme()
 */

import { useRef, useCallback } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";

interface AnimatedPressableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Scale when pressed (default: 0.96) */
  pressScale?: number;
  /** Duration of the press animation in ms (default: 100) */
  pressDuration?: number;
  /** Whether to show a glow shadow effect */
  glow?: boolean;
  /** Color of the glow (default: primary red) */
  glowColor?: string;
  /** Glow intensity / shadow radius (default: 12) */
  glowRadius?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Active opacity when pressed (default: 1, handled by scale) */
  activeOpacity?: number;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility role */
  accessibilityRole?: string;
}

export default function AnimatedPressable({
  onPress,
  onLongPress,
  children,
  style,
  pressScale = 0.96,
  pressDuration = 100,
  glow = false,
  glowColor,
  glowRadius = 12,
  disabled = false,
  activeOpacity = 1,
  accessibilityLabel,
}: AnimatedPressableProps) {
  const { colors: pressColors } = useTheme();
  const resolvedGlowColor = glowColor ?? pressColors.accentRed;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: pressScale,
      duration: pressDuration,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, pressScale, pressDuration]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const glowStyle: ViewStyle | Record<string, never> = glow
    ? {
        shadowColor: resolvedGlowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: glowRadius,
        elevation: 8,
      }
    : {};

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        glowStyle,
        disabled && styles.disabled,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Preset Button Variants ──────────────────────────────────────────

interface ButtonPresetProps {
  onPress?: () => void;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
}

/** Resolve button variant styles from the active theme */
function getVariantStyles(
  colors: import("@/utils/theme").ThemeColors,
): Record<
  string,
  { bg: string; border: string; text: string; glow: string } | null
> {
  return {
    primary: {
      bg: colors.accentRed,
      border: colors.accentRed,
      text: colors.textInverted,
      glow: colors.accentRed,
    },
    danger: {
      bg: "rgba(239,68,68,0.15)",
      border: "rgba(239,68,68,0.3)",
      text: colors.accentDanger,
      glow: colors.accentDanger,
    },
    gold: {
      bg: "rgba(0,229,255,0.15)",
      border: "rgba(0,229,255,0.3)",
      text: colors.accentGold,
      glow: colors.accentGold,
    },
    // secondary and ghost are theme-dependent → handled in component
    secondary: null,
    ghost: null,
  };
}

const SIZE_STYLES: Record<
  string,
  {
    paddingH: number;
    paddingV: number;
    fontSize: number;
    iconSize: number;
    borderRadius: number;
  }
> = {
  sm: {
    paddingH: 14,
    paddingV: 8,
    fontSize: 13,
    iconSize: 16,
    borderRadius: 8,
  },
  md: {
    paddingH: 20,
    paddingV: 13,
    fontSize: 15,
    iconSize: 20,
    borderRadius: 12,
  },
  lg: {
    paddingH: 28,
    paddingV: 16,
    fontSize: 17,
    iconSize: 22,
    borderRadius: 14,
  },
};

export function DndButton({
  onPress,
  label,
  icon,
  iconSize,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style: customStyle,
}: ButtonPresetProps) {
  const { colors, isDark } = useTheme();
  const s = SIZE_STYLES[size] || SIZE_STYLES.md;
  const showGlow = variant === "primary" && !disabled;

  // Resolve theme-aware variant styles
  const VARIANT_STYLES = getVariantStyles(colors);
  const v = (() => {
    const staticV = VARIANT_STYLES[variant];
    if (staticV) return staticV;

    if (variant === "secondary") {
      return {
        bg: colors.bgCard,
        border: colors.borderDefault,
        text: colors.textPrimary,
        glow: "transparent",
      };
    }

    // ghost
    return {
      bg: "transparent",
      border: "transparent",
      text: colors.textSecondary,
      glow: "transparent",
    };
  })();

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      glow={showGlow}
      glowColor={v.glow}
      glowRadius={10}
      pressScale={0.97}
      style={
        [
          {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            backgroundColor: v.bg,
            borderColor: v.border,
            borderWidth: variant === "ghost" ? 0 : 1,
            borderRadius: s.borderRadius,
            paddingHorizontal: s.paddingH,
            paddingVertical: s.paddingV,
            opacity: disabled ? 0.5 : 1,
          },
          fullWidth ? ({ width: "100%" } as any) : undefined,
          customStyle as ViewStyle | undefined,
        ].filter(Boolean) as ViewStyle[]
      }
    >
      {loading ? (
        <Text
          style={{ color: v.text, fontSize: s.fontSize, fontWeight: "600" }}
        >
          Cargando...
        </Text>
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={iconSize || s.iconSize}
              color={v.text}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={{
              color: v.text,
              fontSize: s.fontSize,
              fontWeight: "700",
            }}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

// ─── Icon Button (circular) ─────────────────────────────────────────

export interface IconButtonProps {
  onPress?: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  glow?: boolean;
  glowColor?: string;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
}

export function IconButton({
  onPress,
  icon,
  size = 44,
  iconSize,
  color,
  backgroundColor,
  borderColor,
  glow = false,
  glowColor,
  disabled = false,
  style: customStyle,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();

  // Resolve theme-aware defaults
  const resolvedColor = color ?? colors.textPrimary;
  const resolvedBg = backgroundColor ?? colors.bgCard;
  const resolvedBorder = borderColor ?? colors.borderDefault;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      glow={glow}
      glowColor={glowColor || resolvedColor}
      pressScale={0.9}
      accessibilityLabel={accessibilityLabel}
      style={
        [
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: resolvedBg,
            borderWidth: 1,
            borderColor: resolvedBorder,
            alignItems: "center" as const,
            justifyContent: "center" as const,
          },
          customStyle as ViewStyle | undefined,
        ].filter(Boolean) as ViewStyle[]
      }
    >
      <Ionicons
        name={icon}
        size={iconSize || size * 0.45}
        color={resolvedColor}
      />
    </AnimatedPressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
