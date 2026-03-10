/**
 * CompactHeader — Campaign character sheet header
 *
 * Compact horizontal layout with themed gradient background, animated
 * entrance, back button, character name, stat badges, HP badge, full-width
 * HP bar with glow, character code chip, and decorative bottom border.
 */

import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";
import { useUnidadesActuales } from "@/stores/settingsStore";
import { convertirDistancia } from "@/utils/units";
import { useCharacterStore } from "@/stores/characterStore";
import GradientBorder from "@/components/ui/GradientBorder";

import { StatBadge, sheetStyles } from "./SheetHelpers";
import type { HeaderRenderProps } from "./CharacterSheetBase";

// ─── Component ───────────────────────────────────────────────────────

export default function CompactHeader({
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
}: HeaderRenderProps) {
  const { isDark } = useTheme();
  const unidades = useUnidadesActuales();
  const { getEffectiveSpeed } = useCharacterStore();

  // Header overlay gradient
  const headerGradient: [string, string, ...string[]] = isDark
    ? [colors.gradientMain[0], colors.gradientMain[1], colors.bgPrimary + "00"]
    : [colors.bgSecondary, colors.bgSecondary, `${colors.bgPrimary}00`];

  return (
    <View style={sheetStyles.header}>
      <LinearGradient colors={headerGradient} style={StyleSheet.absoluteFill} />

      <Animated.View
        style={[
          compactStyles.headerContent,
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
        <View style={compactStyles.headerTopRow}>
          {/* Back button */}
          <TouchableOpacity
            style={[
              compactStyles.headerBackButton,
              {
                backgroundColor: colors.headerButtonBg,
                borderColor: colors.headerButtonBorder,
              },
            ]}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Character name and level */}
          <View style={compactStyles.headerCenter}>
            <Text
              style={[compactStyles.headerName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {character.nombre}
            </Text>
            <View style={compactStyles.headerStatsRow}>
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
                value={`${convertirDistancia(getEffectiveSpeed().walk, unidades).valor}`}
                color={colors.accentGold}
                delay={200}
                labelColor={colors.statsLabel}
              />
            </View>
          </View>

          {/* HP badge */}
          <View style={compactStyles.headerHpBadge}>
            <View style={compactStyles.headerHpValueRow}>
              <Text style={[compactStyles.headerHpCurrent, { color: hpColor }]}>
                {character.hp.current}
              </Text>
              <Text
                style={[
                  compactStyles.headerHpMax,
                  { color: colors.statsLabel },
                ]}
              >
                /{character.hp.max}
              </Text>
            </View>
            {character.hp.temp > 0 && (
              <View style={compactStyles.headerHpTempBadge}>
                <Ionicons name="shield" size={8} color={colors.accentBlue} />
                <Text
                  style={[
                    compactStyles.headerHpTempText,
                    { color: colors.accentBlue },
                  ]}
                >
                  +{character.hp.temp}
                </Text>
              </View>
            )}
            <Text
              style={[
                compactStyles.headerHpLabel,
                { color: colors.statsLabel },
              ]}
            >
              PG
            </Text>
          </View>
        </View>

        {/* HP Bar */}
        <View style={compactStyles.hpBarContainer}>
          <View
            style={[
              compactStyles.hpBarBg,
              { backgroundColor: colors.borderSubtle },
            ]}
          >
            <Animated.View
              style={[
                compactStyles.hpBarFill,
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
                style={compactStyles.hpBarGradient}
              />
            </Animated.View>
          </View>
          {/* HP glow effect */}
          <Animated.View
            style={[
              compactStyles.hpBarGlow,
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
              {
                backgroundColor: `${colors.accentGold}15`,
                borderColor: `${colors.accentGold}30`,
              },
            ]}
            onPress={handleCopyCharacterCode}
            activeOpacity={0.7}
          >
            <Ionicons
              name={codeCopied ? "checkmark-circle" : "key-outline"}
              size={12}
              color={colors.accentGold}
            />
            <Text
              style={[sheetStyles.codeChipLabel, { color: colors.textMuted }]}
            >
              Código:
            </Text>
            <Text
              style={[sheetStyles.codeChipValue, { color: colors.accentGold }]}
            >
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
      <GradientBorder />
    </View>
  );
}

// ─── Campaign-only styles ────────────────────────────────────────────

const compactStyles = StyleSheet.create({
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
});
