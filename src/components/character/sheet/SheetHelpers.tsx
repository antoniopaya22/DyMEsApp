/**
 * Character Sheet — Shared helpers
 *
 * Types, pure functions, animation hooks, sub-components and styles
 * that are identical between the standalone and campaign sheet screens.
 */

import { useRef, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";
import type { ThemeColors } from "@/utils/theme";

// ─── Tab definitions ─────────────────────────────────────────────────

export type TabId = "overview" | "combat" | "spells" | "inventory" | "notes";

export interface TabDef {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function getTabs(colors: ThemeColors): TabDef[] {
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

export const VALID_TABS = new Set<TabId>([
  "overview",
  "combat",
  "spells",
  "inventory",
  "notes",
]);

export const CENTER_TAB_INDEX = 2; // "General" sits in the middle

// ─── HP Color Helpers ────────────────────────────────────────────────

interface HpColorTokens {
  accentDanger: string;
  accentGreen: string;
  accentLime: string;
  accentYellow: string;
  accentOrange: string;
}

export function getHpBarColor(
  current: number,
  max: number,
  colors: HpColorTokens,
): string {
  if (max <= 0) return colors.accentDanger;
  const pct = current / max;
  if (pct >= 0.75) return colors.accentGreen;
  if (pct >= 0.5) return colors.accentLime;
  if (pct >= 0.25) return colors.accentYellow;
  if (pct > 0) return colors.accentOrange;
  return colors.accentDanger;
}

export function getHpBarGradient(
  current: number,
  max: number,
  colors: HpColorTokens,
): [string, string, ...string[]] {
  if (max <= 0) return [colors.accentDanger, "#dc2626"];
  const pct = current / max;
  if (pct >= 0.75) return [colors.accentGreen, "#16a34a"];
  if (pct >= 0.5) return [colors.accentLime, "#65a30d"];
  if (pct >= 0.25) return [colors.accentYellow, "#ca8a04"];
  if (pct > 0) return [colors.accentOrange, "#ea580c"];
  return [colors.accentDanger, "#dc2626"];
}

// ─── Press animation hooks ───────────────────────────────────────────

export function usePressScale() {
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

export function useActiveGlow(isActive: boolean) {
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

export function CenterTabButton({
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

export function SideTabButton({
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

export function BottomTabButton({
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

export function StatBadge({
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

// ─── Loading State ───────────────────────────────────────────────────

export function SheetLoadingState() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        sheetStyles.loadingContainer,
        { backgroundColor: colors.bgPrimary },
      ]}
    >
      <LinearGradient
        colors={colors.gradientMain}
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
      <Text style={[sheetStyles.loadingText, { color: colors.textSecondary }]}>
        Cargando personaje...
      </Text>
    </View>
  );
}

// ─── Error State ─────────────────────────────────────────────────────

export function SheetErrorState({
  errorMessage,
  onGoBack,
}: Readonly<{
  errorMessage: string;
  onGoBack: () => void;
}>) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        sheetStyles.errorContainer,
        { backgroundColor: colors.bgPrimary },
      ]}
    >
      <LinearGradient
        colors={colors.gradientMain}
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
      <Text style={[sheetStyles.errorMessage, { color: colors.textSecondary }]}>
        {errorMessage}
      </Text>
      <TouchableOpacity
        style={[sheetStyles.errorButton, { shadowColor: colors.accentShadow }]}
        onPress={onGoBack}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.gradientButtonStart, colors.gradientButtonEnd]}
          style={sheetStyles.errorButtonGradient}
        >
          <Text
            style={[
              sheetStyles.errorButtonText,
              { color: colors.textInverted },
            ]}
          >
            Volver
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── No Character State ──────────────────────────────────────────────

export function SheetEmptyState({
  onGoBack,
}: Readonly<{
  onGoBack: () => void;
}>) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        sheetStyles.errorContainer,
        { backgroundColor: colors.bgPrimary },
      ]}
    >
      <LinearGradient
        colors={colors.gradientMain}
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
      <Text style={[sheetStyles.errorMessage, { color: colors.textSecondary }]}>
        No se encontró el personaje asociado a esta partida.
      </Text>
      <TouchableOpacity
        style={[sheetStyles.errorButton, { shadowColor: colors.accentShadow }]}
        onPress={onGoBack}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.gradientButtonStart, colors.gradientButtonEnd]}
          style={sheetStyles.errorButtonGradient}
        >
          <Text
            style={[
              sheetStyles.errorButtonText,
              { color: colors.textInverted },
            ]}
          >
            Volver
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Shared Styles ───────────────────────────────────────────────────

export const sheetStyles = StyleSheet.create({
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
    shadowColor: "#000",
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
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Header ──
  header: {
    position: "relative",
    zIndex: 10,
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
