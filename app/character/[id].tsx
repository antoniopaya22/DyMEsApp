/**
 * Character Sheet Screen
 * Tab-based view showing: Overview, Combat, Spells, Inventory, Notes
 *
 * Enhanced with gradient header, animated HP bar, and polished tab bar.
 * Fully theme-aware — uses `colors` tokens from `useTheme()` throughout.
 */

import { useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCharacterStore } from "@/stores/characterStore";
import { useCharacterListStore } from "@/stores/characterListStore";
import { useAuthStore } from "@/stores/authStore";

import {
  OverviewTab,
  CombatTab,
  AbilitiesTab,
  InventoryTab,
  NotesTab,
} from "@/components/character";
import { DiceFAB } from "@/components/dice";
import { useTheme, useCharacterSync } from "@/hooks";

// ─── Tab definitions ─────────────────────────────────────────────────

type TabId = "overview" | "combat" | "spells" | "inventory" | "notes";

interface TabDef {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  color: string;
}

function getTabs(colors: import("@/utils/theme").ThemeColors): TabDef[] {
  return [
    {
      id: "combat",
      label: "Combate",
      icon: "heart-outline",
      iconActive: "heart",
      color: colors.accentGreen,
    },
    {
      id: "spells",
      label: "Habilidades",
      icon: "star-outline",
      iconActive: "star",
      color: colors.accentDanger,
    },
    {
      id: "overview",
      label: "General",
      icon: "shield-half-sharp",
      iconActive: "shield",
      color: colors.accentRed,
    },
    {
      id: "inventory",
      label: "Inventario",
      icon: "bag-outline",
      iconActive: "bag",
      color: colors.accentGold,
    },
    {
      id: "notes",
      label: "Notas",
      icon: "document-text-outline",
      iconActive: "document-text",
      color: colors.accentBlue,
    },
  ];
}

// ─── HP Color Helper ─────────────────────────────────────────────────

function getHpBarColor(
  current: number,
  max: number,
  colors: {
    accentDanger: string;
    accentGreen: string;
    accentLime: string;
    accentYellow: string;
    accentOrange: string;
  },
): string {
  if (max <= 0) return colors.accentDanger;
  const pct = current / max;
  if (pct >= 0.75) return colors.accentGreen;
  if (pct >= 0.5) return colors.accentLime;
  if (pct >= 0.25) return colors.accentYellow;
  if (pct > 0) return colors.accentOrange;
  return colors.accentDanger;
}

function getHpBarGradient(
  current: number,
  max: number,
  colors: {
    accentDanger: string;
    accentGreen: string;
    accentLime: string;
    accentYellow: string;
    accentOrange: string;
  },
): [string, string, ...string[]] {
  if (max <= 0) return [colors.accentDanger, "#dc2626"];
  const pct = current / max;
  if (pct >= 0.75) return [colors.accentGreen, "#16a34a"];
  if (pct >= 0.5) return [colors.accentLime, "#65a30d"];
  if (pct >= 0.25) return [colors.accentYellow, "#ca8a04"];
  if (pct > 0) return [colors.accentOrange, "#ea580c"];
  return [colors.accentDanger, "#dc2626"];
}

// ─── Center Tab Index ────────────────────────────────────────────────

const CENTER_TAB_INDEX = 2; // "General" sits in the middle

// ─── Press animation helpers ─────────────────────────────────────────

function usePressScale() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.timing(scaleAnim, {
      toValue: 0.88,
      duration: 80,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  return { scaleAnim, onPressIn, onPressOut };
}

function useActiveGlow(isActive: boolean) {
  const glowAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isActive ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isActive, glowAnim]);
  return glowAnim;
}

// ─── Center Tab (General) ────────────────────────────────────────────

function CenterTabButton({
  tab,
  isActive,
  onPress,
  inactiveColor,
  bgColor,
}: Readonly<{
  tab: TabDef;
  isActive: boolean;
  onPress: () => void;
  inactiveColor: string;
  bgColor: string;
}>) {
  const { scaleAnim, onPressIn, onPressOut } = usePressScale();
  const glowAnim = useActiveGlow(isActive);

  const pillBg = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${tab.color}00`, `${tab.color}20`],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={sheetStyles.centerTabTouchable}
    >
      <Animated.View
        style={[
          sheetStyles.centerTabOuter,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: bgColor,
            borderColor: isActive ? `${tab.color}40` : `${inactiveColor}15`,
            shadowColor: isActive ? tab.color : "#000",
            shadowOpacity: isActive ? 0.35 : 0.1,
            elevation: isActive ? 8 : 3,
          },
        ]}
      >
        <Animated.View
          style={[sheetStyles.centerTabInner, { backgroundColor: pillBg }]}
        >
          <Ionicons
            name={isActive ? tab.iconActive : tab.icon}
            size={26}
            color={isActive ? tab.color : inactiveColor}
          />
        </Animated.View>
      </Animated.View>
      <Text
        style={[
          sheetStyles.bottomTabLabel,
          {
            color: isActive ? tab.color : inactiveColor,
            fontWeight: isActive ? "700" : "500",
            marginTop: 4,
          },
        ]}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Side Tab Button ─────────────────────────────────────────────────

function SideTabButton({
  tab,
  isActive,
  onPress,
  inactiveColor,
}: Readonly<{
  tab: TabDef;
  isActive: boolean;
  onPress: () => void;
  inactiveColor: string;
}>) {
  const { scaleAnim, onPressIn, onPressOut } = usePressScale();
  const glowAnim = useActiveGlow(isActive);

  const activeBg = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${tab.color}00`, `${tab.color}18`],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={sheetStyles.bottomTabTouchable}
    >
      <Animated.View
        style={[
          sheetStyles.bottomTabItem,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.View
          style={[sheetStyles.bottomTabPill, { backgroundColor: activeBg }]}
        >
          <Ionicons
            name={isActive ? tab.iconActive : tab.icon}
            size={21}
            color={isActive ? tab.color : inactiveColor}
          />
        </Animated.View>
        <Text
          style={[
            sheetStyles.bottomTabLabel,
            {
              color: isActive ? tab.color : inactiveColor,
              fontWeight: isActive ? "700" : "400",
            },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Tab Button Dispatcher ───────────────────────────────────────────

function BottomTabButton({
  tab,
  isActive,
  isCenter,
  onPress,
  inactiveColor,
  bgColor,
}: Readonly<{
  tab: TabDef;
  isActive: boolean;
  isCenter: boolean;
  onPress: () => void;
  inactiveColor: string;
  bgColor: string;
}>) {
  if (isCenter) {
    return (
      <CenterTabButton
        tab={tab}
        isActive={isActive}
        onPress={onPress}
        inactiveColor={inactiveColor}
        bgColor={bgColor}
      />
    );
  }
  return (
    <SideTabButton
      tab={tab}
      isActive={isActive}
      onPress={onPress}
      inactiveColor={inactiveColor}
    />
  );
}

// ─── Stat Badge (CA, Vel, Nv) ────────────────────────────────────────

function StatBadge({
  label,
  value,
  color,
  delay = 0,
  labelColor,
}: Readonly<{
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
  labelColor: string;
}>) {
  const { colors: sbColors } = useTheme();
  const resolvedColor = color ?? sbColors.textSecondary;
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 350,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, entranceAnim]);

  return (
    <Animated.View
      style={[
        sheetStyles.statBadge,
        {
          opacity: entranceAnim,
          borderColor: `${resolvedColor}25`,
          backgroundColor: `${resolvedColor}08`,
        },
      ]}
    >
      <Text style={[sheetStyles.statBadgeValue, { color: resolvedColor }]}>
        {value}
      </Text>
      <Text style={[sheetStyles.statBadgeLabel, { color: labelColor }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function CharacterSheetScreen() {
  const { colors, isDark } = useTheme();
  const TABS = getTabs(colors);
  const router = useRouter();
  const { id: characterId, tab } = useLocalSearchParams<{
    id: string;
    tab?: TabId;
  }>();
  const {
    character,
    loading,
    error,
    loadCharacter,
    clearCharacter,
    getArmorClass,
  } = useCharacterStore();
  const { touchCharacter } = useCharacterListStore();
  const isAuthenticated = !!useAuthStore((s) => s.user);

  // Sync character to Supabase & get the shareable code
  const characterCode = useCharacterSync();
  const [codeCopied, setCodeCopied] = useState(false);
  const codeCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validTabs = new Set<TabId>([
    "overview",
    "combat",
    "spells",
    "inventory",
    "notes",
  ]);
  const resolvedTab = tab && validTabs.has(tab) ? tab : "overview";
  const [activeTab, setActiveTab] = useState<TabId>(resolvedTab);

  // Sync activeTab when the `tab` query parameter changes (e.g. navigating back with a different tab)
  useEffect(() => {
    if (tab && validTabs.has(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  // HP bar animation
  const hpBarWidth = useRef(new Animated.Value(0)).current;
  const headerEntrance = useRef(new Animated.Value(0)).current;

  // Load character data on focus
  useFocusEffect(
    useCallback(() => {
      if (characterId) {
        loadCharacter(characterId);
        touchCharacter(characterId);
      }

      return () => {
        // Optionally clear on blur - keeping data for performance
      };
    }, [characterId, loadCharacter, touchCharacter]),
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

  const handleGoBack = () => {
    clearCharacter();
    if (codeCopyTimerRef.current) clearTimeout(codeCopyTimerRef.current);
    router.back();
  };

  const handleCopyCharacterCode = async () => {
    if (!characterCode) return;
    await Clipboard.setStringAsync(characterCode);
    setCodeCopied(true);
    if (codeCopyTimerRef.current) clearTimeout(codeCopyTimerRef.current);
    codeCopyTimerRef.current = setTimeout(() => setCodeCopied(false), 2000);
  };

  // Compute themed gradient colors
  const mainGradient = colors.gradientMain;
  // Header overlay gradient: from a slightly darker shade to transparent
  const headerGradient: [string, string, ...string[]] = isDark
    ? [colors.gradientMain[0], colors.gradientMain[1], colors.bgPrimary + "00"]
    : [colors.bgSecondary, colors.bgSecondary, `${colors.bgPrimary}00`];

  const headerBorderGradient: [string, string, ...string[]] = [
    "transparent",
    `${colors.borderDefault}66`,
    colors.borderDefault,
    `${colors.borderDefault}66`,
    "transparent",
  ];

  // ── Loading state ──
  if (loading && !character) {
    return (
      <View
        style={[
          sheetStyles.loadingContainer,
          { backgroundColor: colors.bgPrimary },
        ]}
      >
        <LinearGradient
          colors={mainGradient}
          locations={colors.gradientLocations}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            sheetStyles.loadingIconBg,
            {
              backgroundColor: colors.bgSubtle,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <ActivityIndicator size="large" color={colors.accentRed} />
        </View>
        <Text
          style={[sheetStyles.loadingText, { color: colors.textSecondary }]}
        >
          Cargando personaje...
        </Text>
      </View>
    );
  }

  // ── Error state ──
  if (error && !character) {
    return (
      <View
        style={[
          sheetStyles.errorContainer,
          { backgroundColor: colors.bgPrimary },
        ]}
      >
        <LinearGradient
          colors={mainGradient}
          locations={colors.gradientLocations}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            sheetStyles.errorIconBg,
            {
              backgroundColor: colors.dangerBg,
              borderColor: colors.dangerBorder,
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={colors.dangerText}
          />
        </View>
        <Text style={[sheetStyles.errorTitle, { color: colors.textPrimary }]}>
          Error al cargar
        </Text>
        <Text
          style={[sheetStyles.errorMessage, { color: colors.textSecondary }]}
        >
          {error}
        </Text>
        <TouchableOpacity
          style={sheetStyles.errorButton}
          onPress={handleGoBack}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#d32f2f", colors.accentRed]}
            style={sheetStyles.errorButtonGradient}
          >
            <Text style={sheetStyles.errorButtonText}>Volver</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // ── No character state ──
  if (!character) {
    return (
      <View
        style={[
          sheetStyles.errorContainer,
          { backgroundColor: colors.bgPrimary },
        ]}
      >
        <LinearGradient
          colors={mainGradient}
          locations={colors.gradientLocations}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            sheetStyles.errorIconBg,
            {
              backgroundColor: colors.bgSubtle,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Ionicons name="person-outline" size={44} color={colors.textMuted} />
        </View>
        <Text style={[sheetStyles.errorTitle, { color: colors.textPrimary }]}>
          Personaje no encontrado
        </Text>
        <Text
          style={[sheetStyles.errorMessage, { color: colors.textSecondary }]}
        >
          No se encontró el personaje asociado a esta partida.
        </Text>
        <TouchableOpacity
          style={sheetStyles.errorButton}
          onPress={handleGoBack}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#d32f2f", colors.accentRed]}
            style={sheetStyles.errorButtonGradient}
          >
            <Text style={sheetStyles.errorButtonText}>Volver</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

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

  return (
    <View
      style={[sheetStyles.container, { backgroundColor: colors.bgPrimary }]}
    >
      {/* Full background */}
      <LinearGradient
        colors={mainGradient}
        locations={colors.gradientLocations}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header ── */}
      <View style={sheetStyles.header}>
        <LinearGradient
          colors={headerGradient}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            sheetStyles.headerContent,
            {
              opacity: headerEntrance,
              transform: [
                {
                  translateY: headerEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Top row: back + name + HP */}
          <View style={sheetStyles.headerTopRow}>
            {/* Back button */}
            <TouchableOpacity
              style={[
                sheetStyles.headerBackButton,
                {
                  backgroundColor: colors.headerButtonBg,
                  borderColor: colors.headerButtonBorder,
                },
              ]}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Character name and level */}
            <View style={sheetStyles.headerCenter}>
              <Text
                style={[sheetStyles.headerName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {character.nombre}
              </Text>
              <View style={sheetStyles.headerStatsRow}>
                <StatBadge
                  label="NV"
                  value={character.nivel}
                  color={colors.accentGold}
                  delay={100}
                  labelColor={colors.statsLabel}
                />
                <StatBadge
                  label="CA"
                  value={ac}
                  color={colors.accentBlue}
                  delay={150}
                  labelColor={colors.statsLabel}
                />
                <StatBadge
                  label="VEL"
                  value={`${character.speed.walk}`}
                  color={colors.accentGreen}
                  delay={200}
                  labelColor={colors.statsLabel}
                />
              </View>
            </View>

            {/* HP badge */}
            <View style={sheetStyles.headerHpBadge}>
              <View style={sheetStyles.headerHpValueRow}>
                <Text style={[sheetStyles.headerHpCurrent, { color: hpColor }]}>
                  {character.hp.current}
                </Text>
                <Text
                  style={[
                    sheetStyles.headerHpMax,
                    { color: colors.statsLabel },
                  ]}
                >
                  /{character.hp.max}
                </Text>
              </View>
              {character.hp.temp > 0 && (
                <View style={sheetStyles.headerHpTempBadge}>
                  <Ionicons name="shield" size={8} color={colors.accentBlue} />
                  <Text style={[sheetStyles.headerHpTempText, { color: colors.accentBlue }]}>
                    +{character.hp.temp}
                  </Text>
                </View>
              )}
              <Text
                style={[
                  sheetStyles.headerHpLabel,
                  { color: colors.statsLabel },
                ]}
              >
                PG
              </Text>
            </View>
          </View>

          {/* HP Bar */}
          <View style={sheetStyles.hpBarContainer}>
            <View
              style={[
                sheetStyles.hpBarBg,
                { backgroundColor: colors.borderSubtle },
              ]}
            >
              <Animated.View
                style={[
                  sheetStyles.hpBarFill,
                  {
                    width: hpBarWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={hpGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={sheetStyles.hpBarGradient}
                />
              </Animated.View>
            </View>
            {/* HP glow effect */}
            <Animated.View
              style={[
                sheetStyles.hpBarGlow,
                {
                  backgroundColor: `${hpColor}15`,
                  width: hpBarWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          {/* Character Code Chip — shareable code for Master */}
          {isAuthenticated && characterCode && (
            <TouchableOpacity
              style={[
                sheetStyles.codeChip,
                { backgroundColor: `${colors.accentGold}15`, borderColor: `${colors.accentGold}30` },
              ]}
              onPress={handleCopyCharacterCode}
              activeOpacity={0.7}
            >
              <Ionicons
                name={codeCopied ? "checkmark-circle" : "key-outline"}
                size={12}
                color={colors.accentGold}
              />
              <Text style={[sheetStyles.codeChipLabel, { color: colors.textMuted }]}>
                Código:
              </Text>
              <Text style={[sheetStyles.codeChipValue, { color: colors.accentGold }]}>
                {characterCode}
              </Text>
              <Ionicons
                name={codeCopied ? "checkmark" : "copy-outline"}
                size={12}
                color={colors.accentGold}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Bottom border gradient */}
        <View style={sheetStyles.headerBorder}>
          <LinearGradient
            colors={headerBorderGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ height: 1, width: "100%" }}
          />
        </View>
      </View>

      {/* ── Tab Content ── */}
      <View style={{ flex: 1 }} key={activeTab}>
        {renderTabContent()}
      </View>

      {/* ── Dice FAB (HU-11.1) ── */}
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

// ─── Styles ──────────────────────────────────────────────────────────
// Only layout / sizing values live here. All color values are applied
// via inline style overrides using the `colors` theme tokens so that
// both light and dark themes are supported.

const sheetStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Loading / Error ──
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  errorButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#8f3d38", // overridden inline via colors.accentRed
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: "center",
  },
  errorButtonText: {
    color: "#ffffff", // overridden inline via colors.textPrimary
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Header ──
  header: {
    position: "relative",
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 42,
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  headerStatsRow: {
    flexDirection: "row",
    gap: 6,
  },

  // ── Stat Badge ──
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
  },
  statBadgeValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  statBadgeLabel: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // ── HP Badge ──
  headerHpBadge: {
    alignItems: "center",
    minWidth: 52,
  },
  headerHpValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  headerHpCurrent: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerHpMax: {
    fontSize: 12,
    fontWeight: "600",
  },
  headerHpTempBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.12)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 1,
    gap: 2,
  },
  headerHpTempText: {
    color: "transparent", // themed inline via colors.accentBlue
    fontSize: 9,
    fontWeight: "700",
  },
  headerHpLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 1,
  },

  // ── HP Bar ──
  hpBarContainer: {
    marginTop: 10,
    marginHorizontal: 2,
    position: "relative",
  },
  hpBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  hpBarFill: {
    height: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  hpBarGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  hpBarGlow: {
    position: "absolute",
    top: -2,
    left: 0,
    height: 8,
    borderRadius: 4,
  },

  // ── Character Code Chip ──
  codeChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  codeChipLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  codeChipValue: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    fontFamily: "monospace",
  },

  // ── Bottom Tab Bar ──
  bottomTabBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Platform.OS === "ios" ? 22 : 8,
    paddingTop: 6,
    paddingHorizontal: 4,
  } as const,
  bottomTabTouchable: {
    flex: 1,
    alignItems: "center",
  } as const,
  bottomTabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  } as const,
  bottomTabPill: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  } as const,
  bottomTabLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
    marginTop: 3,
  } as const,
  // ── Center (General) Tab ──
  centerTabTouchable: {
    flex: 1,
    alignItems: "center",
    marginTop: -18,
  } as const,
  centerTabOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  } as const,
  centerTabInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  } as const,

  // ── Header Border ──
  headerBorder: {
    height: 1,
  },
});
