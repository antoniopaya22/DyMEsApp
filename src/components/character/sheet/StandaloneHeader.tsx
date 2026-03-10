/**
 * StandaloneHeader — Hero-image header for the standalone character sheet
 *
 * Displays a large character avatar with gradient overlay, floating back
 * button, name/subtitle, stats footer with HP bar, and character code chip.
 */

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getCharacterAvatar } from "@/utils/avatar";
import { getClassData } from "@/data/srd/classes";
import { getRaceData, getSubraceData } from "@/data/srd/races";
import { AvatarPreviewModal } from "@/components/ui";
import { useUnidadesActuales } from "@/stores/settingsStore";
import { convertirDistancia } from "@/utils/units";
import { useCharacterStore } from "@/stores/characterStore";

import { StatBadge, sheetStyles } from "./SheetHelpers";
import type { HeaderRenderProps } from "./CharacterSheetBase";

// ─── Constants ───────────────────────────────────────────────────────

const HERO_HEIGHT = 240;

// ─── Component ───────────────────────────────────────────────────────

export default function StandaloneHeader({
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
  const unidades = useUnidadesActuales();
  const { getEffectiveSpeed } = useCharacterStore();
  const [avatarPreview, setAvatarPreview] = useState(false);

  // Resolve avatar + class/race display data
  const avatarSource = getCharacterAvatar(
    character.clase,
    character.raza,
    character.sexo,
  );
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
  const classIcon =
    (classData.iconName as keyof typeof Ionicons.glyphMap) ??
    "shield-half-sharp";
  const accentColor = classData.color ?? colors.accentRed;

  return (
    <>
      <View style={sheetStyles.header}>
        {/* ── Hero header ── */}
        <View style={heroStyles.heroImageContainer}>
          {avatarSource ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setAvatarPreview(true)}
              style={StyleSheet.absoluteFill}
            >
              <Image
                source={avatarSource}
                style={heroStyles.heroImage}
                contentFit="cover"
                contentPosition="top"
                transition={200}
              />
            </TouchableOpacity>
          ) : (
            <View
              style={[
                heroStyles.heroPlaceholder,
                { backgroundColor: `${accentColor}18` },
              ]}
            >
              <Ionicons name={classIcon} size={72} color={`${accentColor}50`} />
            </View>
          )}

          {/* Dark gradient overlay at bottom for text readability */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={heroStyles.heroGradient}
            pointerEvents="none"
          />

          {/* Back button — floating top-left */}
          <View style={heroStyles.heroFloatingButtons}>
            <TouchableOpacity
              style={heroStyles.heroBackButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Name + subtitle overlaid at bottom */}
          <View style={heroStyles.heroNameOverlay} pointerEvents="none">
            <Text style={heroStyles.heroName} numberOfLines={1}>
              {character.nombre}
            </Text>
            <Text style={heroStyles.heroSubtitle} numberOfLines={1}>
              {classData.nombre} · {raceName}
            </Text>
          </View>
        </View>

        {/* Stats Footer */}
        <Animated.View
          style={[
            heroStyles.statsFooter,
            {
              backgroundColor: colors.bgElevated,
              borderBottomColor: colors.borderSubtle,
              opacity: headerEntrance,
            },
          ]}
        >
          <View style={heroStyles.statsRow}>
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

            {/* HP Section */}
            <View style={heroStyles.hpFooterSection}>
              <View style={heroStyles.hpFooterValueRow}>
                <Ionicons name="heart" size={14} color={colors.accentGold} />
                <Text
                  style={[
                    heroStyles.hpFooterCurrent,
                    { color: colors.accentGold },
                  ]}
                >
                  {character.hp.current}
                </Text>
                <Text
                  style={[heroStyles.hpFooterMax, { color: colors.statsLabel }]}
                >
                  /{character.hp.max}
                </Text>
                {character.hp.temp > 0 && (
                  <View style={heroStyles.hpFooterTempBadge}>
                    <Ionicons
                      name="shield"
                      size={8}
                      color={colors.accentBlue}
                    />
                    <Text
                      style={[
                        heroStyles.hpFooterTempText,
                        { color: colors.accentBlue },
                      ]}
                    >
                      +{character.hp.temp}
                    </Text>
                  </View>
                )}
              </View>
              {/* Mini HP bar */}
              <View
                style={[
                  heroStyles.hpFooterBarBg,
                  { backgroundColor: colors.borderSubtle },
                ]}
              >
                <Animated.View
                  style={[
                    heroStyles.hpFooterBarFill,
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
                style={[
                  sheetStyles.codeChipValue,
                  { color: colors.accentGold },
                ]}
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
      </View>

      {/* Avatar preview modal */}
      <AvatarPreviewModal
        visible={avatarPreview}
        source={getCharacterAvatar(
          character.clase,
          character.raza,
          character.sexo,
        )}
        characterName={character.nombre}
        onClose={() => setAvatarPreview(false)}
      />
    </>
  );
}

// ─── Standalone-only styles ──────────────────────────────────────────

const heroStyles = StyleSheet.create({
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
});
