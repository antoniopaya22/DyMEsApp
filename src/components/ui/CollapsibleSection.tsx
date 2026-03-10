/**
 * CollapsibleSection
 *
 * Reusable expandable/collapsible section with an icon, title and chevron toggle.
 * Extracted from the repeated pattern in:
 * - OverviewTab.tsx (CollapsibleSection sub-component)
 * - settings.tsx (renderSectionHeader + section content pattern)
 *
 * Two variants:
 * - `CollapsibleSection` — uses NativeWind/className styling (for character tabs)
 * - `CollapsibleCard` — uses StyleSheet styling (for settings-type screens)
 *
 * Both share animation logic via `useCollapseToggle`.
 *
 * @example
 * // NativeWind variant
 * <CollapsibleSection
 *   title="Habilidades"
 *   icon="list"
 *   isExpanded={expanded}
 *   onToggle={() => setExpanded(!expanded)}
 * >
 *   <Text>Content</Text>
 * </CollapsibleSection>
 *
 * // StyleSheet variant
 * <CollapsibleCard
 *   id="apariencia"
 *   title="Apariencia"
 *   icon="color-palette"
 *   iconColor={colors.accentPurple}
 *   isExpanded={expandedSection === "apariencia"}
 *   onToggle={() => toggle("apariencia")}
 * >
 *   {renderThemeSection()}
 * </CollapsibleCard>
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import type { LayoutAnimationConfig } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Smooth expand/collapse spring config */
const LAYOUT_ANIM_CONFIG: LayoutAnimationConfig = {
  duration: 280,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

/** Shared chevron-rotation + layout-animation logic for both variants */
function useCollapseToggle(isExpanded: boolean, onToggle: () => void) {
  const chevronAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(chevronAnim, {
      toValue: isExpanded ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, chevronAnim]);

  const chevronRotation = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleToggle = () => {
    LayoutAnimation.configureNext(LAYOUT_ANIM_CONFIG);
    onToggle();
  };

  return { chevronRotation, handleToggle };
}

// ─── NativeWind variant (character sheets) ───────────────────────────

export interface CollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** Optional element rendered to the right of the title (before chevron) */
  rightElement?: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  rightElement,
}: CollapsibleSectionProps) {
  const { colors } = useTheme();
  const { chevronRotation, handleToggle } = useCollapseToggle(
    isExpanded,
    onToggle,
  );

  return (
    <View
      className="rounded-card border mb-4 overflow-hidden"
      style={{
        backgroundColor: colors.bgElevated,
        borderColor: colors.borderDefault,
      }}
    >
      <TouchableOpacity
        className="flex-row items-center p-4"
        onPress={handleToggle}
      >
        <Ionicons name={icon} size={20} color={colors.accentGold} />
        <Text
          className="text-base font-semibold flex-1 ml-3"
          style={{ color: colors.textPrimary }}
        >
          {title}
        </Text>
        {rightElement}
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View
          className="px-4 pb-4 border-t pt-3"
          style={{ borderColor: colors.borderDefault }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

// ─── StyleSheet variant (settings screens) ───────────────────────────

export interface CollapsibleCardProps {
  /** Section identifier (used for expand/collapse logic) */
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Tint color for the icon background and icon */
  iconColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleCard({
  title,
  icon,
  iconColor,
  isExpanded,
  onToggle,
  children,
}: CollapsibleCardProps) {
  const { colors } = useTheme();
  const { chevronRotation, handleToggle } = useCollapseToggle(
    isExpanded,
    onToggle,
  );

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.bgElevated,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      {/* Header row */}
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.sectionHeader}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View
            style={[
              styles.sectionIcon,
              { backgroundColor: iconColor + colors.iconBgAlpha },
            ]}
          >
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <Text
            style={[styles.sectionTitle, { color: colors.sectionTitleColor }]}
          >
            {title}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.chevronColor} />
        </Animated.View>
      </TouchableOpacity>

      {/* Expandable content */}
      {isExpanded && (
        <View
          style={[
            styles.sectionContent,
            { borderTopColor: colors.borderSeparator },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000000", // static: theme-independent
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
});
