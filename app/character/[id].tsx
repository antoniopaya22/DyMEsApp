/**
 * Character Sheet Screen
 * Tab-based view showing: Overview, Combat, Spells, Inventory, Notes
 *
 * Enhanced with gradient header, animated HP bar, and polished tab bar.
 * Fully theme-aware — uses `colors` tokens from `useTheme()` throughout.
 */

import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Platform,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCharacterStore } from "@/stores/characterStore";
import { useCharacterListStore } from "@/stores/characterListStore";
import { useAuthStore } from "@/stores/authStore";
import { getCharacterAvatar } from "@/utils/avatar";
import { getClassData } from "@/data/srd/classes";
import { getRaceData, getSubraceData } from "@/data/srd/races";
import { AvatarPreviewModal } from "@/components/ui";

import {
  OverviewTab,
  CombatTab,
  AbilitiesTab,
  InventoryTab,
  NotesTab,
} from "@/components/character";
import { DiceFAB } from "@/components/dice";
import { useTheme, useCharacterSync, HeaderScrollProvider } from "@/hooks";

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
      color: colors.accentRed,
    },
    {
      id: "spells",
      label: "Habilidades",
      icon: "star-outline",
      iconActive: "star",
      color: colors.accentRed,
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
      color: colors.accentRed,
    },
    {
      id: "notes",
      label: "Notas",
      icon: "document-text-outline",
      iconActive: "document-text",
      color: colors.accentRed,
    },
  ];
}

// ─── Header Layout Constants ─────────────────────────────────────────

const STATUS_BAR_TOP = Platform.OS === "ios" ? 54 : 38;
const HERO_HEIGHT = 240;

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
  const { colors } = useTheme();
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
  const [avatarPreview, setAvatarPreview] = useState(false);
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
  const activeTabRef = useRef<TabId>(resolvedTab);

  // Keep ref in sync
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Sync activeTab when the `tab` query parameter changes (e.g. navigating back with a different tab)
  useEffect(() => {
    if (tab && validTabs.has(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  // HP bar animation
  const hpBarWidth = useRef(new Animated.Value(0)).current;
  const headerEntrance = useRef(new Animated.Value(0)).current;

  // ── Header scroll context (shared with tabs) ──
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOnScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      ),
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
            // Animate out
            Animated.timing(tabSlideAnim, {
              toValue: direction * screenWidth,
              duration: 150,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start(() => {
              setActiveTab(TABS[newIndex].id);
              // Snap in from opposite side
              tabSlideAnim.setValue(-direction * screenWidth * 0.3);
              Animated.timing(tabSlideAnim, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }).start();
            });
          } else {
            // Snap back
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
            colors={["#00D4E8", colors.accentRed]}
            style={sheetStyles.errorButtonGradient}
          >
            <Text style={[sheetStyles.errorButtonText, { color: colors.textInverted }]}>Volver</Text>
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
            colors={["#00D4E8", colors.accentRed]}
            style={sheetStyles.errorButtonGradient}
          >
            <Text style={[sheetStyles.errorButtonText, { color: colors.textInverted }]}>Volver</Text>
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

  // Resolve avatar + class/race display data
  const avatarSource = getCharacterAvatar(character.clase, character.raza, character.sexo);
  const classData = getClassData(character.clase);
  const raceData = getRaceData(character.raza);
  const subraceData = character.subraza
    ? getSubraceData(character.raza, character.subraza)
    : null;
  const raceName =
    character.customRaceData?.nombre ??
    subraceData?.nombre ??
    raceData?.nombre ??
    "—";
  const classIcon = (classData.iconName as keyof typeof Ionicons.glyphMap) ?? "shield-half-sharp";
  const accentColor = classData.color ?? colors.accentRed;

  // ── Collapsible header: simple show/hide, no height animation ──

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

        {/* ── Hero header (always expanded) ── */}
          <View style={sheetStyles.heroImageContainer}>
            {avatarSource ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setAvatarPreview(true)}
                style={StyleSheet.absoluteFill}
              >
                <Image
                  source={avatarSource}
                  style={sheetStyles.heroImage}
                  contentFit="cover"
                  contentPosition="top"
                  transition={200}
                />
              </TouchableOpacity>
            ) : (
              <View style={[sheetStyles.heroPlaceholder, { backgroundColor: `${accentColor}18` }]}>
                <Ionicons name={classIcon} size={72} color={`${accentColor}50`} />
              </View>
            )}

            {/* Dark gradient overlay at bottom for text readability */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={sheetStyles.heroGradient}
              pointerEvents="none"
            />

            {/* Back button — floating top-left */}
            <View style={sheetStyles.heroFloatingButtons}>
              <TouchableOpacity
                style={sheetStyles.heroBackButton}
                onPress={handleGoBack}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Name + subtitle overlaid at bottom */}
            <View style={sheetStyles.heroNameOverlay} pointerEvents="none">
              <Text style={sheetStyles.heroName} numberOfLines={1}>
                {character.nombre}
              </Text>
              <Text style={sheetStyles.heroSubtitle} numberOfLines={1}>
                {classData.nombre} · {raceName}
              </Text>
            </View>
          </View>

        {/* Stats Footer */}
        <Animated.View
          style={[
            sheetStyles.statsFooter,
            {
              backgroundColor: colors.bgElevated,
              borderBottomColor: colors.borderSubtle,
              opacity: headerEntrance,
            },
          ]}
        >
          <View style={sheetStyles.statsRow}>
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
              color={colors.accentGold}
              delay={150}
              labelColor={colors.statsLabel}
            />
            <StatBadge
              label="VEL"
              value={`${character.speed.walk}`}
              color={colors.accentGold}
              delay={200}
              labelColor={colors.statsLabel}
            />

            {/* HP Section */}
            <View style={sheetStyles.hpFooterSection}>
              <View style={sheetStyles.hpFooterValueRow}>
                <Ionicons name="heart" size={14} color={colors.accentGold} />
                <Text style={[sheetStyles.hpFooterCurrent, { color: colors.accentGold }]}>
                  {character.hp.current}
                </Text>
                <Text style={[sheetStyles.hpFooterMax, { color: colors.statsLabel }]}>
                  /{character.hp.max}
                </Text>
                {character.hp.temp > 0 && (
                  <View style={sheetStyles.hpFooterTempBadge}>
                    <Ionicons name="shield" size={8} color={colors.accentBlue} />
                    <Text style={[sheetStyles.hpFooterTempText, { color: colors.accentBlue }]}>
                      +{character.hp.temp}
                    </Text>
                  </View>
                )}
              </View>
              {/* Mini HP bar */}
              <View style={[sheetStyles.hpFooterBarBg, { backgroundColor: colors.borderSubtle }]}>
                <Animated.View
                  style={[
                    sheetStyles.hpFooterBarFill,
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
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>
            </View>
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
      </View>

      {/* ── Tab Content ── */}
      <HeaderScrollProvider value={headerScrollCtx}>
        <Animated.View
          style={{ flex: 1, transform: [{ translateX: tabSlideAnim }] }}
          key={activeTab}
          {...swipePanResponder.panHandlers}
        >
          {renderTabContent()}
        </Animated.View>
      </HeaderScrollProvider>

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

      {/* Avatar preview modal */}
      <AvatarPreviewModal
        visible={avatarPreview}
        source={getCharacterAvatar(character.clase, character.raza, character.sexo)}
        characterName={character.nombre}
        onClose={() => setAvatarPreview(false)}
      />
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
    shadowColor: "#00BCD4", // overridden inline via colors.accentRed
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
    color: "#0B1221",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Header ──
  header: {
    position: "relative",
    zIndex: 10,
  },

  // ── Hero Image ──
  heroImageContainer: {
    height: HERO_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 1.35,
    width: "100%",
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  heroFloatingButtons: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 38,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroNameOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // ── Stats Footer ──
  statsFooter: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
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

  // ── HP Footer Section ──
  hpFooterSection: {
    flex: 1,
    marginLeft: 4,
  },
  hpFooterValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  hpFooterCurrent: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  hpFooterMax: {
    fontSize: 12,
    fontWeight: "600",
  },
  hpFooterTempBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.12)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 2,
    gap: 2,
  },
  hpFooterTempText: {
    fontSize: 9,
    fontWeight: "700",
  },
  hpFooterBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  hpFooterBarFill: {
    height: "100%",
    borderRadius: 2,
    overflow: "hidden",
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
});
