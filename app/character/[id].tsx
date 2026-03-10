/**
 * Standalone Character Sheet Screen
 *
 * Thin wrapper around `CharacterSheetBase` with:
 * - Hero-image header (StandaloneHeader)
 * - Swipe-between-tabs via PanResponder
 * - HeaderScrollProvider for collapsible header sync
 */

import { useCallback, useMemo, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCharacterListStore } from "@/stores/characterListStore";
import { HeaderScrollProvider, useTheme } from "@/hooks";

import {
  CharacterSheetBase,
  StandaloneHeader,
} from "@/components/character/sheet";
import { getTabs } from "@/components/character/sheet/SheetHelpers";
import type { TabId } from "@/components/character/sheet";

export default function CharacterSheetScreen() {
  const { id: characterId, tab } = useLocalSearchParams<{
    id: string;
    tab?: TabId;
  }>();
  const { touchCharacter } = useCharacterListStore();
  const { colors } = useTheme();
  const TABS = getTabs(colors);

  // ── Header scroll context (shared with tabs) ──
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOnScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      }),
    [scrollY],
  );
  const headerScrollCtx = useMemo(
    () => ({ scrollY, onScroll: headerOnScroll }),
    [scrollY, headerOnScroll],
  );

  // ── Swipe between tabs ──
  const { width: screenWidth } = useWindowDimensions();
  const SWIPE_THRESHOLD = screenWidth * 0.2;
  const SWIPE_VELOCITY = 0.3;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;
  const activeTabRef = useRef<TabId>(tab ?? "overview");

  const swipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gestureState) => {
          const { dx, dy } = gestureState;
          return Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 10;
        },
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderMove: (_evt, gestureState) => {
          tabSlideAnim.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          const { dx, vx } = gestureState;
          const currentTab = activeTabRef.current;
          const currentIndex = TABS.findIndex((t) => t.id === currentTab);
          let newIndex = currentIndex;

          if (
            (dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY) &&
            currentIndex < TABS.length - 1
          ) {
            newIndex = currentIndex + 1;
          } else if (
            (dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY) &&
            currentIndex > 0
          ) {
            newIndex = currentIndex - 1;
          }

          if (newIndex !== currentIndex) {
            const direction = newIndex > currentIndex ? -1 : 1;
            Animated.timing(tabSlideAnim, {
              toValue: direction * screenWidth,
              duration: 150,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start(() => {
              activeTabRef.current = TABS[newIndex].id;
              // Note: The actual state update happens via setActiveTab inside renderTabWrapper
              tabSlideAnim.setValue(-direction * screenWidth * 0.3);
              Animated.timing(tabSlideAnim, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }).start();
            });
          } else {
            Animated.spring(tabSlideAnim, {
              toValue: 0,
              friction: 8,
              tension: 100,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(tabSlideAnim, {
            toValue: 0,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }).start();
        },
      }),
    [TABS, screenWidth, SWIPE_THRESHOLD, tabSlideAnim],
  );

  const onFocus = useCallback(
    (loadCharacter: (id: string) => void) => {
      if (characterId) {
        loadCharacter(characterId);
        touchCharacter(characterId);
      }
    },
    [characterId, touchCharacter],
  );

  return (
    <CharacterSheetBase
      onFocus={onFocus}
      initialTab={tab}
      tabParam={tab}
      renderHeader={(props) => <StandaloneHeader {...props} />}
      renderTabWrapper={({ activeTab, tabContent }) => {
        // Keep ref in sync for swipe handler
        activeTabRef.current = activeTab;
        return (
          <HeaderScrollProvider value={headerScrollCtx}>
            <Animated.View
              style={{ flex: 1, transform: [{ translateX: tabSlideAnim }] }}
              key={activeTab}
              {...swipePanResponder.panHandlers}
            >
              {tabContent}
            </Animated.View>
          </HeaderScrollProvider>
        );
      }}
    />
  );
}
