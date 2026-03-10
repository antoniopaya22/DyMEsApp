/**
 * ScrollableTabBar
 *
 * Horizontally-scrollable tab bar for screens with many categories (6+).
 * Each tab gets a minimum width based on its content (not equal-width).
 *
 * Features:
 * - Horizontal ScrollView with per-tab layout tracking
 * - Animated gradient indicator bar under the active tab
 * - Scale-on-press micro-interaction
 * - Auto-scrolls to keep the active tab visible
 * - Per-tab accent color support
 * - Same `TabItem` interface as `SegmentedTabs` for API consistency
 */

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  StyleSheet,
  type LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";
import type { TabItem } from "./SegmentedTabs";

// ─── Props ───────────────────────────────────────────────────────────

export interface ScrollableTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────

export default function ScrollableTabBar({
  tabs,
  activeTab,
  onTabChange,
}: ScrollableTabBarProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  // Track each tab's layout (x position and width) via onLayout
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const [layoutReady, setLayoutReady] = useState(false);

  // Animated values for the indicator
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;

  // Per-tab scale animations
  const scaleAnims = useRef(tabs.map(() => new Animated.Value(1))).current;

  // ── Update indicator position when active tab changes ──
  useEffect(() => {
    const layout = tabLayouts.current[activeTab];
    if (!layout) return;

    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: layout.x,
        friction: 20,
        tension: 170,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorW, {
        toValue: layout.width,
        friction: 20,
        tension: 170,
        useNativeDriver: false, // width can't use native driver
      }),
    ]).start();

    // Auto-scroll to keep the active tab visible
    scrollRef.current?.scrollTo({
      x: Math.max(0, layout.x - 32),
      animated: true,
    });
  }, [activeTab, layoutReady, indicatorX, indicatorW]);

  const handleTabLayout = useCallback(
    (tabId: string, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts.current[tabId] = { x, width };

      // Once all tabs have reported layout, mark ready
      if (Object.keys(tabLayouts.current).length === tabs.length) {
        setLayoutReady(true);
        // Set initial position instantly (no animation)
        const initial = tabLayouts.current[activeTab];
        if (initial) {
          indicatorX.setValue(initial.x);
          indicatorW.setValue(initial.width);
        }
      }
    },
    [tabs.length, activeTab, indicatorX, indicatorW],
  );

  const handlePressIn = (idx: number) => {
    Animated.timing(scaleAnims[idx], {
      toValue: 0.92,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (idx: number) => {
    Animated.spring(scaleAnims[idx], {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const activeColor =
    tabs.find((t) => t.id === activeTab)?.color ?? colors.accentRed;

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: colors.bgSubtle,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      {/* Sliding indicator (absolute, behind tabs) */}
      {layoutReady && (
        <Animated.View
          style={[
            s.indicator,
            {
              width: indicatorW,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        >
          <LinearGradient
            colors={[`${activeColor}22`, `${activeColor}08`]}
            style={s.indicatorGradient}
          />
          {/* Bottom accent bar */}
          <View style={s.indicatorBarContainer}>
            <LinearGradient
              colors={[
                "transparent",
                `${activeColor}AA`,
                activeColor,
                `${activeColor}AA`,
                "transparent",
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={s.indicatorBar}
            />
          </View>
        </Animated.View>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const accentColor = tab.color ?? colors.accentRed;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              onPressIn={() => handlePressIn(idx)}
              onPressOut={() => handlePressOut(idx)}
              activeOpacity={1}
              style={s.tab}
              onLayout={(e) => handleTabLayout(tab.id, e)}
            >
              <Animated.View
                style={[
                  s.tabInner,
                  { transform: [{ scale: scaleAnims[idx] }] },
                ]}
              >
                {tab.icon && (
                  <Ionicons
                    name={isActive ? (tab.iconActive ?? tab.icon) : tab.icon}
                    size={16}
                    color={isActive ? accentColor : colors.textMuted}
                    style={s.tabIcon}
                  />
                )}
                <Text
                  style={[
                    s.tabLabel,
                    {
                      color: isActive ? accentColor : colors.textMuted,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                {/* Active dot */}
                {isActive && (
                  <View
                    style={[s.activeDot, { backgroundColor: accentColor }]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Re-export TabItem for convenience
export type { TabItem };

// ─── Styles ──────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  // Sliding highlight behind the active tab
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  indicatorGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 13,
  },
  indicatorBarContainer: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: 2,
  },
  indicatorBar: {
    flex: 1,
    borderRadius: 1,
  },
  // Individual tab
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabIcon: {
    marginRight: 5,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  activeDot: {
    position: "absolute",
    top: -2,
    right: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
