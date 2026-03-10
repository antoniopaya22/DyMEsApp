/**
 * AppHeader
 *
 * Shared header component used across all main screens (mode-select,
 * player home, master home). Provides a consistent navigation bar with:
 * - InlineDndLogo on the left
 * - User avatar button on the right (opens settings/profile)
 * - Settings gear button
 * - Optional extra actions passed via `rightActions`
 *
 * @example
 * <AppHeader />
 * <AppHeader rightActions={<MyButton />} />
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/stores/authStore";
import { useTheme, useEntranceAnimation } from "@/hooks";
import { InlineDndLogo } from "./DndLogo";
import GradientBorder from "./GradientBorder";

// ─── Props ───────────────────────────────────────────────────────────

export interface AppHeaderProps {
  /** Show a back button before the logo (default: false) */
  showBack?: boolean;
  /** Extra action buttons rendered to the left of compendium, settings & avatar */
  rightActions?: React.ReactNode;
  /** Content rendered below the header row (e.g. SearchBar) */
  children?: React.ReactNode;
  /** Whether to animate entrance (default: true) */
  animated?: boolean;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

// ─── Component ───────────────────────────────────────────────────────

export default function AppHeader({
  showBack = false,
  rightActions,
  children,
  animated = true,
  style,
}: Readonly<AppHeaderProps>) {
  const router = useRouter();
  const { colors } = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  const { opacity: headerFade } = useEntranceAnimation({ active: animated });

  // ── Avatar helpers ──
  const avatarUrl = profile?.avatar_url ?? null;
  const displayName = profile?.nombre || user?.email?.split("@")[0] || "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarPress = () => {
    router.push("/account");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <Animated.View style={[styles.header, { opacity: headerFade }, style]}>
      <LinearGradient
        colors={colors.gradientHeader}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.headerRow}>
        {/* Left: Back + Logo */}
        <View style={styles.headerLeft}>
          {showBack && (
            <TouchableOpacity
              style={[
                styles.headerButton,
                {
                  backgroundColor: colors.headerButtonBg,
                  borderColor: colors.headerButtonBorder,
                  marginRight: 8,
                },
              ]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={colors.sectionDescColor}
              />
            </TouchableOpacity>
          )}
          <InlineDndLogo />
        </View>

        {/* Right: Actions + Compendium + Settings + Avatar */}
        <View style={styles.headerActions}>
          {rightActions}

          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: colors.headerButtonBg,
                borderColor: colors.headerButtonBorder,
              },
            ]}
            onPress={() => router.push("/compendium")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="book-outline"
              size={20}
              color={colors.sectionDescColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: colors.headerButtonBg,
                borderColor: colors.headerButtonBorder,
              },
            ]}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.sectionDescColor}
            />
          </TouchableOpacity>

          {/* User avatar */}
          <TouchableOpacity
            style={[
              styles.avatarButton,
              {
                borderColor: colors.accentGold + "60",
              },
            ]}
            onPress={handleAvatarPress}
            activeOpacity={0.7}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: colors.accentGold + "25" },
                ]}
              >
                {initials ? (
                  <Text
                    style={[
                      styles.avatarInitials,
                      { color: colors.accentGold },
                    ]}
                  >
                    {initials}
                  </Text>
                ) : (
                  <Ionicons name="person" size={18} color={colors.accentGold} />
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional children (e.g. SearchBar) */}
      {children}

      {/* Bottom border gradient */}
      <GradientBorder absolute />
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 58 : 48,
    paddingBottom: 14,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
});
