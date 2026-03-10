/**
 * ConfirmDialog - Beautiful animated confirmation dialog
 *
 * Replaces native Alert.alert with a themed D&D-style modal dialog.
 * Features smooth animations, icon support, and multiple button variants.
 *
 * ✅ Theme-aware: adapts to light/dark mode via useTheme()
 */

import { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  BackHandler,
} from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";

// ─── Types ───────────────────────────────────────────────────────────

export type DialogType =
  | "confirm"
  | "danger"
  | "warning"
  | "success"
  | "info"
  | "error";

export interface DialogButton {
  /** Button label text */
  text: string;
  /** Visual style of the button */
  style?: "default" | "cancel" | "destructive";
  /** Callback when button is pressed */
  onPress?: () => void;
}

export interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Dialog type determines icon and accent color */
  type?: DialogType;
  /** Title text displayed at the top */
  title: string;
  /** Description / message body */
  message?: string;
  /** Array of buttons to display */
  buttons?: DialogButton[];
  /** Callback when dialog is dismissed (backdrop press or cancel) */
  onDismiss?: () => void;
  /** Custom icon name (overrides type-based icon) */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom icon color (overrides type-based color) */
  iconColor?: string;
  /** Whether tapping backdrop dismisses the dialog (default: true) */
  dismissOnBackdrop?: boolean;
  /** Whether to show close button in top-right corner (default: false) */
  showCloseButton?: boolean;
  /** Custom React content to replace the icon (e.g. a number) */
  customIconContent?: ReactNode;
}

// ─── Type Config (accent colors stay consistent across themes) ───────

interface TypeConfigEntry {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
}

function getTypeConfig(
  colors: import("@/utils/theme").ThemeColors,
): Record<DialogType, TypeConfigEntry> {
  return {
    confirm: {
      icon: "help-circle",
      color: colors.accentLightBlue,
      bgColor: "rgba(96,165,250,0.10)",
      borderColor: "rgba(96,165,250,0.20)",
      ringColor: "rgba(96,165,250,0.12)",
    },
    danger: {
      icon: "warning",
      color: colors.accentDanger,
      bgColor: "rgba(239,68,68,0.10)",
      borderColor: "rgba(239,68,68,0.20)",
      ringColor: "rgba(239,68,68,0.12)",
    },
    warning: {
      icon: "alert-circle",
      color: colors.accentGold,
      bgColor: withAlpha(colors.accentRed, 0.1),
      borderColor: withAlpha(colors.accentRed, 0.2),
      ringColor: withAlpha(colors.accentRed, 0.12),
    },
    success: {
      icon: "checkmark-circle",
      color: colors.accentGreen,
      bgColor: "rgba(34,197,94,0.10)",
      borderColor: "rgba(34,197,94,0.20)",
      ringColor: "rgba(34,197,94,0.12)",
    },
    info: {
      icon: "information-circle",
      color: colors.textSecondary,
      bgColor: "rgba(140,140,179,0.10)",
      borderColor: "rgba(140,140,179,0.20)",
      ringColor: "rgba(140,140,179,0.12)",
    },
    error: {
      icon: "close-circle",
      color: colors.accentDanger,
      bgColor: "rgba(239,68,68,0.10)",
      borderColor: "rgba(239,68,68,0.20)",
      ringColor: "rgba(239,68,68,0.12)",
    },
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DIALOG_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);

// ─── Component ───────────────────────────────────────────────────────

export default function ConfirmDialog({
  visible,
  type = "confirm",
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  onDismiss,
  icon: customIcon,
  iconColor: customIconColor,
  dismissOnBackdrop = true,
  showCloseButton = false,
  customIconContent,
}: ConfirmDialogProps) {
  const { colors, isDark } = useTheme();

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconBounceAnim = useRef(new Animated.Value(0.5)).current;
  const buttonsFadeAnim = useRef(new Animated.Value(0)).current;

  const TYPE_CONFIG = getTypeConfig(colors);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.confirm;
  const iconName = customIcon || config.icon;
  const iconTint = customIconColor || config.color;

  // ── Theme-derived colors ──
  const dialogBg = isDark ? colors.bgCard : colors.bgElevated;
  const dialogBgGradient: [string, string, ...string[]] = isDark
    ? [colors.bgCard, colors.bgSecondary, colors.bgPrimary]
    : [colors.bgElevated, colors.bgCard, colors.bgSecondary];
  const dialogBorderColor = colors.borderDefault;

  const titleColor = colors.textPrimary;
  const messageColor = colors.textSecondary;
  const closeIconColor = colors.textMuted;
  const closeBtnBg = colors.bgSubtle;
  const dividerColor = `${colors.borderDefault}88`;
  const backdropColor = isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.4)";

  // ── Button style resolver (theme-aware) ──
  const getButtonStyle = (style?: string) => {
    switch (style) {
      case "cancel":
        return {
          bg: isDark ? "rgba(140,140,179,0.10)" : "rgba(0,0,0,0.06)",
          border: isDark ? "rgba(140,140,179,0.25)" : "rgba(0,0,0,0.12)",
          text: colors.textSecondary,
        };
      case "destructive":
        return {
          bg: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.10)",
          border: isDark ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.25)",
          text: colors.dangerText,
        };
      default:
        return {
          bg: colors.accentRed,
          border: colors.accentRed,
          text: colors.textInverted,
        };
    }
  };

  // ── Animations ──

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropAnim.setValue(0);
      scaleAnim.setValue(0.75);
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      iconBounceAnim.setValue(0.5);
      buttonsFadeAnim.setValue(0);

      // Entrance animation sequence
      Animated.parallel([
        // Backdrop fade in
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Card scale + fade
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Icon bounce after card appears
        Animated.spring(iconBounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 150,
          useNativeDriver: true,
        }).start();

        // Buttons fade in staggered
        Animated.timing(buttonsFadeAnim, {
          toValue: 1,
          duration: 250,
          delay: 50,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [
    visible,
    backdropAnim,
    scaleAnim,
    fadeAnim,
    slideAnim,
    iconBounceAnim,
    buttonsFadeAnim,
  ]);

  // ── Android back handler ──

  useEffect(() => {
    if (!visible) return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (onDismiss) {
        onDismiss();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, [visible, onDismiss]);

  // ── Dismiss animation ──

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  }, [backdropAnim, fadeAnim, scaleAnim, onDismiss]);

  const handleButtonPress = useCallback(
    (button: DialogButton) => {
      // Run exit animation then callback
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 170,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        button.onPress?.();
      });
    },
    [backdropAnim, fadeAnim, scaleAnim],
  );

  const handleBackdropPress = useCallback(() => {
    if (dismissOnBackdrop) {
      handleDismiss();
    }
  }, [dismissOnBackdrop, handleDismiss]);

  // ── Render ──

  if (!visible) return null;

  // Sort buttons: cancel first (left), then others
  const sortedButtons = [...buttons].sort((a, b) => {
    if (a.style === "cancel") return -1;
    if (b.style === "cancel") return 1;
    return 0;
  });

  const isSingleButton = sortedButtons.length === 1;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropAnim, backgroundColor: backdropColor },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      </Animated.View>

      {/* Dialog container */}
      <View style={styles.container} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.dialog,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Card background with subtle gradient */}
          <View
            style={[
              styles.dialogInner,
              {
                borderColor: dialogBorderColor,
                shadowColor: colors.shadowColor,
                shadowOpacity: isDark ? 0.4 : 0.2,
              },
            ]}
          >
            <LinearGradient
              colors={dialogBgGradient}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            {/* Top accent line */}
            <View style={styles.accentLineTop}>
              <LinearGradient
                colors={["transparent", iconTint, "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.accentLineGradient}
              />
            </View>

            {/* Close button */}
            {showCloseButton && (
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: closeBtnBg }]}
                onPress={handleDismiss}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color={closeIconColor} />
              </TouchableOpacity>
            )}

            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: iconBounceAnim }] },
              ]}
            >
              <View
                style={[styles.iconRing, { borderColor: config.ringColor }]}
              />
              <View
                style={[
                  styles.iconBg,
                  {
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                  },
                ]}
              >
                {customIconContent ?? (
                  <Ionicons name={iconName} size={32} color={iconTint} />
                )}
              </View>
            </Animated.View>

            {/* Title */}
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

            {/* Message */}
            {message ? (
              <Text style={[styles.message, { color: messageColor }]}>
                {message}
              </Text>
            ) : null}

            {/* Divider */}
            <View style={styles.divider}>
              <LinearGradient
                colors={["transparent", dividerColor, "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.dividerGradient}
              />
            </View>

            {/* Buttons */}
            <Animated.View
              style={[
                styles.buttonRow,
                isSingleButton && styles.buttonRowSingle,
                { opacity: buttonsFadeAnim },
              ]}
            >
              {sortedButtons.map((button, index) => {
                const btnStyle = getButtonStyle(button.style);
                const isCancel = button.style === "cancel";
                const isDestructive = button.style === "destructive";
                const isDefault = !isCancel && !isDestructive;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      {
                        backgroundColor: btnStyle.bg,
                        borderColor: btnStyle.border,
                        borderWidth: 1,
                      },
                      isSingleButton && styles.buttonSingle,
                      !isSingleButton && styles.buttonMulti,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    {/* Default (primary) button gets gradient */}
                    {isDefault && (
                      <LinearGradient
                        colors={["#00D4E8", "#00BCD4", "#0097A7"]}
                        style={[StyleSheet.absoluteFill, { borderRadius: 11 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      />
                    )}

                    {/* Destructive icon */}
                    {isDestructive && (
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={btnStyle.text}
                        style={{ marginRight: 6 }}
                      />
                    )}

                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: btnStyle.text,
                          fontWeight: isCancel ? "600" : "700",
                        },
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: DIALOG_WIDTH,
    maxWidth: "100%",
  },
  dialogInner: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    // Shadow (base values — color/opacity set dynamically)
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 20,
  },
  accentLineTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  accentLineGradient: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconContainer: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
    lineHeight: 26,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 18,
  },
  dividerGradient: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  buttonRowSingle: {
    justifyContent: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonSingle: {
    flex: 1,
  },
  buttonMulti: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
