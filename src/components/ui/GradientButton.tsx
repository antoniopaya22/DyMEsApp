/**
 * GradientButton
 *
 * Primary CTA button with a LinearGradient background.
 * Supports enabled/disabled states with different gradient colors.
 *
 * Extracted from the repeated gradient-button pattern in:
 * - index.tsx (empty state "Crear primera partida" button, header add button)
 * - campaigns/new.tsx ("Crear Partida" button)
 *
 * @example
 * <GradientButton
 *   label="Crear Partida"
 *   icon="add-circle"
 *   onPress={handleCreate}
 *   disabled={!isValid}
 * />
 */

import React, { useRef, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";

export interface GradientButtonProps {
  /** Button label */
  label: string;
  /** Called on press */
  onPress: () => void;
  /** Optional leading Ionicon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Gradient colors when enabled (defaults to red gradient) */
  colors?: readonly [string, string, ...string[]];
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Loading / in-progress label override */
  loadingLabel?: string;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

export default function GradientButton({
  label,
  onPress,
  icon,
  colors: gradientColors,
  disabled = false,
  loadingLabel,
  loading = false,
  style,
}: GradientButtonProps) {
  const { colors } = useTheme();

  const enabledColors = gradientColors ?? [
    colors.gradientButtonStart,
    colors.gradientButtonMid,
    colors.gradientButtonEnd,
  ];

  const disabledColors: readonly [string, string, ...string[]] = [
    colors.bgElevated,
    colors.bgCard,
    colors.bgSecondary,
  ];

  const isDisabled = disabled || loading;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          { shadowColor: colors.accentShadow },
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        onPressIn={!isDisabled ? handlePressIn : undefined}
        onPressOut={!isDisabled ? handlePressOut : undefined}
        disabled={isDisabled}
        activeOpacity={1}
      >
        <LinearGradient
          colors={isDisabled ? disabledColors : enabledColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading && loadingLabel ? (
            <Text style={styles.label}>{loadingLabel}</Text>
          ) : (
            <>
              {icon && (
                <Ionicons name={icon} size={22} color={colors.textInverted} />
              )}
              <Text
                style={[
                  styles.label,
                  { color: colors.textInverted },
                  icon ? { marginLeft: 8 } : undefined,
                ]}
              >
                {label}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000", // static: theme-independent
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  label: {
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
