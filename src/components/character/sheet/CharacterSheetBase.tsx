/**
 * CharacterSheetBase — Shared character sheet shell
 *
 * Contains the full screen layout shared by both standalone and campaign
 * character sheet routes: background gradient, early-return states
 * (loading / error / empty), tab content, DiceFAB, and bottom tab bar.
 *
 * The header is injected via `renderHeader` so each route can supply its
 * own visual treatment (hero-image vs compact).
 */

import { useCallback, useState, useRef, useEffect, ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCharacterStore } from "@/stores/characterStore";
import { useAuthStore } from "@/stores/authStore";
import type { Character } from "@/types/character";

// Import tab components directly to avoid circular dependency
// (character/index.ts re-exports from ./sheet, which exports this file)
import OverviewTab from "@/components/character/OverviewTab";
import CombatTab from "@/components/character/CombatTab";
import AbilitiesTab from "@/components/character/AbilitiesTab";
import InventoryTab from "@/components/character/InventoryTab";
import NotesTab from "@/components/character/NotesTab";
import { DiceFAB } from "@/components/dice";
import { useTheme, useCharacterSync } from "@/hooks";

import {
  TabId,
  TabDef,
  getTabs,
  getHpBarColor,
  getHpBarGradient,
  VALID_TABS,
  CENTER_TAB_INDEX,
  BottomTabButton,
  SheetLoadingState,
  SheetErrorState,
  SheetEmptyState,
  sheetStyles,
} from "./SheetHelpers";

// ─── Props ───────────────────────────────────────────────────────────

export interface HeaderRenderProps {
  character: Character;
  colors: ReturnType<typeof useTheme>["colors"];
  ac: number;
  hpColor: string;
  hpGradient: [string, string, ...string[]];
  hpBarWidth: Animated.Value;
  headerEntrance: Animated.Value;
  handleGoBack: () => void;
  isAuthenticated: boolean;
  characterCode: string | null;
  codeCopied: boolean;
  handleCopyCharacterCode: () => Promise<void>;
}

export interface CharacterSheetBaseProps {
  /** Load the character on focus. Called inside `useFocusEffect`. */
  onFocus: (loadCharacter: (id: string) => void) => void;
  /** Initial tab (from route params). */
  initialTab?: TabId;
  /** Tab route param for sync. */
  tabParam?: TabId;
  /** Render the variant-specific header section. */
  renderHeader: (props: HeaderRenderProps) => ReactNode;
  /** Render the tab content area wrapper (standalone wraps with HeaderScrollProvider + PanResponder). */
  renderTabWrapper?: (props: {
    activeTab: TabId;
    tabContent: ReactNode;
  }) => ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────

export default function CharacterSheetBase({
  onFocus,
  initialTab,
  tabParam,
  renderHeader,
  renderTabWrapper,
}: CharacterSheetBaseProps) {
  const { colors } = useTheme();
  const TABS = getTabs(colors);
  const router = useRouter();
  const {
    character,
    loading,
    error,
    loadCharacter,
    clearCharacter,
    getArmorClass,
    getEffectiveSpeed,
  } = useCharacterStore();
  const isAuthenticated = !!useAuthStore((s) => s.user);

  // Sync character to Supabase & get the shareable code
  const characterCode = useCharacterSync();
  const [codeCopied, setCodeCopied] = useState(false);
  const codeCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedTab =
    initialTab && VALID_TABS.has(initialTab) ? initialTab : "overview";
  const [activeTab, setActiveTab] = useState<TabId>(resolvedTab);

  // Sync activeTab when the `tab` query parameter changes
  useEffect(() => {
    if (tabParam && VALID_TABS.has(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // HP bar animation
  const hpBarWidth = useRef(new Animated.Value(0)).current;
  const headerEntrance = useRef(new Animated.Value(0)).current;

  // Load character data on focus
  useFocusEffect(
    useCallback(() => {
      onFocus(loadCharacter);
      return () => {};
    }, [onFocus, loadCharacter]),
  );

  // Animate header and HP bar when character loads
  useEffect(() => {
    if (character) {
      const pct =
        character.hp.max > 0
          ? Math.min(100, (character.hp.current / character.hp.max) * 100)
          : 0;

      Animated.timing(headerEntrance, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      Animated.timing(hpBarWidth, {
        toValue: pct,
        duration: 800,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [character, hpBarWidth, headerEntrance]);

  const handleGoBack = useCallback(() => {
    clearCharacter();
    if (codeCopyTimerRef.current) clearTimeout(codeCopyTimerRef.current);
    router.back();
  }, [clearCharacter, router]);

  const handleCopyCharacterCode = useCallback(async () => {
    if (!characterCode) return;
    await Clipboard.setStringAsync(characterCode);
    setCodeCopied(true);
    if (codeCopyTimerRef.current) clearTimeout(codeCopyTimerRef.current);
    codeCopyTimerRef.current = setTimeout(() => setCodeCopied(false), 2000);
  }, [characterCode]);

  // ── Early-return states ──
  if (loading && !character) return <SheetLoadingState />;
  if (error && !character)
    return <SheetErrorState errorMessage={error} onGoBack={handleGoBack} />;
  if (!character) return <SheetEmptyState onGoBack={handleGoBack} />;

  const ac = getArmorClass();
  const hpColor = getHpBarColor(character.hp.current, character.hp.max, colors);
  const hpGradient = getHpBarGradient(
    character.hp.current,
    character.hp.max,
    colors,
  );

  // ── Render active tab content ──
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "combat":
        return <CombatTab />;
      case "spells":
        return <AbilitiesTab />;
      case "inventory":
        return <InventoryTab />;
      case "notes":
        return <NotesTab />;
      default:
        return <OverviewTab />;
    }
  };

  const headerProps: HeaderRenderProps = {
    character,
    colors,
    ac,
    hpColor,
    hpGradient,
    hpBarWidth,
    headerEntrance,
    handleGoBack,
    isAuthenticated,
    characterCode,
    codeCopied,
    handleCopyCharacterCode,
  };

  const tabContent = renderTabContent();

  return (
    <View
      style={[sheetStyles.container, { backgroundColor: colors.bgPrimary }]}
    >
      {/* Full background */}
      <LinearGradient
        colors={colors.gradientMain}
        locations={colors.gradientLocations}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header (variant-specific) ── */}
      {renderHeader(headerProps)}

      {/* ── Tab Content ── */}
      {renderTabWrapper ? (
        renderTabWrapper({ activeTab, tabContent })
      ) : (
        <View style={{ flex: 1 }} key={activeTab}>
          {tabContent}
        </View>
      )}

      {/* ── Dice FAB ── */}
      <DiceFAB characterName={character.nombre} bottom={92} right={20} />

      {/* ── Bottom Tab Bar ── */}
      <View
        style={[
          sheetStyles.bottomTabBar,
          {
            backgroundColor: colors.bgElevated,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        {TABS.map((t, idx) => (
          <BottomTabButton
            key={t.id}
            tab={t}
            isActive={activeTab === t.id}
            isCenter={idx === CENTER_TAB_INDEX}
            onPress={() => setActiveTab(t.id)}
            inactiveColor={colors.statsLabel}
            bgColor={colors.bgElevated}
          />
        ))}
      </View>
    </View>
  );
}

// Re-export types for convenience
export type { TabId, TabDef };
