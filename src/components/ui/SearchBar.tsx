/**
 * SearchBar — Reusable animated search input with focus effects.
 *
 * Extracted from index.tsx (AnimatedSearchBar) and compendium.tsx (renderSearchBar)
 * into a single, theme-aware, professional component.
 *
 * Features:
 * - Smooth border & background animations on focus
 * - Optional clear button when text is present
 * - Entrance fade-in animation
 * - Fully themed for light/dark mode via useTheme()
 *
 * ✅ Theme-aware: adapts to light/dark mode via useTheme()
 */

import { useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useEntranceAnimation } from "@/hooks";

// ─── Props ───────────────────────────────────────────────────────────

export interface SearchBarProps {
  /** Current search text value */
  value: string;
  /** Callback when text changes */
  onChangeText: (text: string) => void;
  /** Callback when clear button is pressed (defaults to onChangeText("")) */
  onClear?: () => void;
  /** Placeholder text (default: "Buscar...") */
  placeholder?: string;
  /** Whether to animate the entrance (default: true) */
  animated?: boolean;
  /** Entrance animation delay in ms (default: 200) */
  entranceDelay?: number;
  /** Size variant (default: "md") */
  size?: "sm" | "md" | "lg";
  /** Custom icon name (default: "search") */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Whether to auto-focus on mount (default: false) */
  autoFocus?: boolean;
  /** Additional TextInput props */
  inputProps?: Omit<
    TextInputProps,
    "value" | "onChangeText" | "placeholder" | "placeholderTextColor" | "style"
  >;
  /** Custom outer container style */
  style?: ViewStyle;
  /** Whether the search bar is disabled */
  disabled?: boolean;
}

// ─── Size Presets ────────────────────────────────────────────────────

const SIZE_PRESETS = {
  sm: {
    paddingH: 12,
    paddingV: 8,
    fontSize: 13,
    iconSize: 16,
    clearSize: 14,
    clearButtonSize: 22,
    borderRadius: 10,
    marginTop: 8,
  },
  md: {
    paddingH: 14,
    paddingV: 10,
    fontSize: 15,
    iconSize: 18,
    clearSize: 14,
    clearButtonSize: 26,
    borderRadius: 12,
    marginTop: 10,
  },
  lg: {
    paddingH: 16,
    paddingV: 12,
    fontSize: 16,
    iconSize: 20,
    clearSize: 16,
    clearButtonSize: 28,
    borderRadius: 14,
    marginTop: 12,
  },
};

// ─── Component ───────────────────────────────────────────────────────

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Buscar...",
  animated = true,
  entranceDelay = 200,
  size = "md",
  icon = "search",
  autoFocus = false,
  inputProps,
  style: customStyle,
  disabled = false,
}: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const preset = SIZE_PRESETS[size];

  // Focus animation (border + bg transition)
  const focusAnim = useRef(new Animated.Value(0)).current;
  // Entrance fade-in
  const { opacity: entranceAnim } = useEntranceAnimation({
    active: animated,
    delay: entranceDelay,
  });

  // ── Focus handlers ──
  const handleFocus = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  // ── Clear handler ──
  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    } else {
      onChangeText("");
    }
  }, [onClear, onChangeText]);

  // ── Interpolated colors ──
  const borderColorInterp = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.searchBorder, colors.searchBorderFocused],
  });

  const bgColorInterp = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.searchBg, colors.bgInput],
  });

  // ── Icon color adapts to focus state ──
  const iconColor = colors.searchPlaceholder;
  const iconFocusColor = colors.accentGold;

  const iconColorInterp = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [iconColor, iconFocusColor],
  });

  return (
    <Animated.View
      style={[
        { opacity: entranceAnim },
        disabled && styles.disabled,
        customStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            borderColor: borderColorInterp,
            backgroundColor: bgColorInterp,
            borderRadius: preset.borderRadius,
            paddingHorizontal: preset.paddingH,
            paddingVertical: preset.paddingV,
          },
        ]}
      >
        {/* Search icon */}
        <Animated.View
          style={{
            opacity: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            }),
          }}
        >
          <Ionicons name={icon} size={preset.iconSize} color={iconColor} />
        </Animated.View>

        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.searchText,
              fontSize: preset.fontSize,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.searchPlaceholder}
          defaultValue={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          editable={!disabled}
          returnKeyType="search"
          {...inputProps}
        />

        {/* Clear button */}
        {value.length > 0 && !disabled && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <View
              style={[
                styles.clearButton,
                {
                  width: preset.clearButtonSize,
                  height: preset.clearButtonSize,
                  borderRadius: preset.clearButtonSize / 2,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                },
              ]}
            >
              <Ionicons
                name="close"
                size={preset.clearSize}
                color={colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 2,
  },
  clearButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
