/**
 * PageHeader
 *
 * Reusable animated header used across secondary screens.
 * Renders a back button, top label, main title, optional right action,
 * and a bottom gradient border.
 *
 * Extracted from the duplicated header pattern in:
 * - settings.tsx
 * - compendium.tsx
 * - campaigns/new.tsx
 *
 * @example
 * <PageHeader
 *   title="Ajustes"
 *   label="DyMEs"
 *   onBack={() => router.back()}
 * />
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, useEntranceAnimation } from "@/hooks";
import GradientBorder from "./GradientBorder";

export interface PageHeaderProps {
  /** Main screen title */
  title: string;
  /** Small top label (defaults to "DyMEs") */
  label?: string;
  /** Called when the back button is pressed */
  onBack: () => void;
  /** Optional subtitle below the title area */
  subtitle?: string;
  /** Content rendered on the right side of the header row */
  rightAction?: React.ReactNode;
  /** Content rendered below the header row (e.g. search bar) */
  children?: React.ReactNode;
  /** Whether to animate entrance (default: true) */
  animated?: boolean;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

export default function PageHeader({
  title,
  label = "DyMEs",
  onBack,
  subtitle,
  rightAction,
  children,
  animated = true,
  style,
}: PageHeaderProps) {
  const { colors } = useTheme();
  const { containerStyle: headerAnimStyle } = useEntranceAnimation({
    active: animated,
    slide: true,
    distance: 12,
    slideDuration: 450,
  });

  return (
    <Animated.View style={[styles.header, headerAnimStyle, style]}>
      <LinearGradient
        colors={colors.gradientHeader}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.headerRow}>
        {/* Back button */}
        <TouchableOpacity
          onPress={onBack}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.headerButtonBg,
              borderColor: colors.headerButtonBorder,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Label + Title */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.headerLabel,
              {
                color: colors.headerLabelColor,
                textShadowColor: colors.accentGoldGlow,
              },
            ]}
          >
            {label}
          </Text>
          <Text
            style={[styles.headerTitle, { color: colors.headerTitleColor }]}
          >
            {title}
          </Text>
        </View>

        {/* Optional right action */}
        {rightAction ?? null}
      </View>

      {/* Optional subtitle */}
      {subtitle ? (
        <Text
          style={[styles.headerSubtitle, { color: colors.sectionDescColor }]}
        >
          {subtitle}
        </Text>
      ) : null}

      {/* Optional children (e.g. SearchBar) */}
      {children}

      {/* Bottom border gradient */}
      <GradientBorder absolute />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 58 : 48,
    paddingBottom: 16,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
});
