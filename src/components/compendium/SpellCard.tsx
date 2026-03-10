/**
 * SpellCard - Expandable spell detail card for the Compendium
 *
 * Shows spell name, level, school, and classes in collapsed state.
 * Expands to show full detail: casting time, range, components,
 * duration, description, and higher-level effects.
 */

import { useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlowCard, DetailBadge } from "@/components/ui";
import { getSpellDescription } from "@/data/srd";
import type { SrdSpell, SpellDescription } from "@/data/srd";
import { SPELL_LEVEL_NAMES } from "@/constants/spells";
import type { SpellLevel } from "@/types/spell";
import { useTheme } from "@/hooks";
import { cardStyles as s } from "./compendiumStyles";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLLAPSE_ANIM = {
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

/** Color per spell level for the icon circle */
const LEVEL_COLORS: Record<number, string> = {
  0: "#9ca3af", // cantrip — gray
  1: "#3b82f6", // blue
  2: "#22c55e", // green
  3: "#f59e0b", // amber
  4: "#ef4444", // red
  5: "#a855f7", // purple
  6: "#ec4899", // pink
  7: "#14b8a6", // teal
  8: "#f97316", // orange
  9: "#eab308", // gold
};

interface SpellCardProps {
  data: SrdSpell;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SpellCard({ data, isExpanded, onToggle }: SpellCardProps) {
  const { colors } = useTheme();
  const desc = isExpanded ? getSpellDescription(data.id) : undefined;

  // Animated chevron rotation
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
    LayoutAnimation.configureNext(COLLAPSE_ANIM);
    onToggle();
  };

  const levelColor = LEVEL_COLORS[data.nivel] ?? colors.accentPurple;
  const isCantrip = data.nivel === 0;
  const levelName =
    SPELL_LEVEL_NAMES[data.nivel as SpellLevel] ?? `Nv.${data.nivel}`;

  return (
    <GlowCard
      accentLine
      accentPosition="left"
      accentColors={[levelColor, `${levelColor}88`, `${levelColor}44`]}
      pressScale={0.98}
      onPress={handleToggle}
      padding={14}
      style={{ marginBottom: 12 }}
    >
      {/* Header */}
      <View style={s.cardHeader}>
        {/* Level circle */}
        <View
          style={[
            local.levelCircle,
            {
              backgroundColor: `${levelColor}20`,
              borderColor: `${levelColor}50`,
            },
          ]}
        >
          {isCantrip ? (
            <Ionicons name="sparkles" size={18} color={levelColor} />
          ) : (
            <Text style={[local.levelNumber, { color: levelColor }]}>
              {data.nivel}
            </Text>
          )}
        </View>
        <View style={s.cardInfo}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[s.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {data.escuela} · {levelName}
          </Text>
        </View>
        {/* Class chips */}
        <View style={local.classChips}>
          {data.clases.slice(0, 3).map((cls) => (
            <View
              key={cls}
              style={[
                local.classChip,
                {
                  backgroundColor: colors.tabBg,
                  borderColor: colors.tabBorder,
                },
              ]}
            >
              <Text style={[local.classChipText, { color: colors.textMuted }]}>
                {cls.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          ))}
          {data.clases.length > 3 && (
            <Text style={[local.classChipText, { color: colors.textMuted }]}>
              +{data.clases.length - 3}
            </Text>
          )}
        </View>
        <Animated.View
          style={{ transform: [{ rotate: chevronRotation }], marginLeft: 8 }}
        >
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </Animated.View>
      </View>

      {/* Expanded detail */}
      {isExpanded && desc && (
        <View
          style={[s.cardDetail, { borderTopColor: colors.borderSeparator }]}
        >
          {/* Badges row */}
          <View style={s.detailRow}>
            <DetailBadge label="Nivel" value={levelName} color={levelColor} />
            <DetailBadge
              label="Escuela"
              value={data.escuela}
              color={colors.accentPurple}
            />
          </View>

          {/* Casting time */}
          <View style={s.detailSection}>
            <View style={local.infoRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.accentGold}
                style={local.infoIcon}
              />
              <Text
                style={[
                  s.detailLabel,
                  { color: colors.accentGold, marginBottom: 0 },
                ]}
              >
                Tiempo de lanzamiento
              </Text>
            </View>
            <Text
              style={[
                s.detailText,
                { color: colors.textSecondary, marginTop: 4 },
              ]}
            >
              {desc.tiempo}
            </Text>
          </View>

          {/* Range */}
          <View style={s.detailSection}>
            <View style={local.infoRow}>
              <Ionicons
                name="locate-outline"
                size={14}
                color={colors.accentGold}
                style={local.infoIcon}
              />
              <Text
                style={[
                  s.detailLabel,
                  { color: colors.accentGold, marginBottom: 0 },
                ]}
              >
                Alcance
              </Text>
            </View>
            <Text
              style={[
                s.detailText,
                { color: colors.textSecondary, marginTop: 4 },
              ]}
            >
              {desc.alcance}
            </Text>
          </View>

          {/* Components */}
          <View style={s.detailSection}>
            <View style={local.infoRow}>
              <Ionicons
                name="flask-outline"
                size={14}
                color={colors.accentGold}
                style={local.infoIcon}
              />
              <Text
                style={[
                  s.detailLabel,
                  { color: colors.accentGold, marginBottom: 0 },
                ]}
              >
                Componentes
              </Text>
            </View>
            <Text
              style={[
                s.detailText,
                { color: colors.textSecondary, marginTop: 4 },
              ]}
            >
              {desc.componentes}
            </Text>
          </View>

          {/* Duration */}
          <View style={s.detailSection}>
            <View style={local.infoRow}>
              <Ionicons
                name="hourglass-outline"
                size={14}
                color={colors.accentGold}
                style={local.infoIcon}
              />
              <Text
                style={[
                  s.detailLabel,
                  { color: colors.accentGold, marginBottom: 0 },
                ]}
              >
                Duración
              </Text>
            </View>
            <Text
              style={[
                s.detailText,
                { color: colors.textSecondary, marginTop: 4 },
              ]}
            >
              {desc.duracion}
            </Text>
          </View>

          {/* Classes */}
          <View style={s.detailSection}>
            <Text style={[s.detailLabel, { color: colors.accentGold }]}>
              Clases
            </Text>
            <View style={s.skillTagsRow}>
              {data.clases.map((cls) => (
                <View
                  key={cls}
                  style={[
                    s.skillTag,
                    {
                      backgroundColor: colors.tabBg,
                      borderColor: colors.tabBorder,
                    },
                  ]}
                >
                  <Text
                    style={[s.skillTagText, { color: colors.textSecondary }]}
                  >
                    {cls.charAt(0).toUpperCase() + cls.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={s.detailSection}>
            <Text style={[s.detailLabel, { color: colors.accentGold }]}>
              Descripción
            </Text>
            <Text style={[s.detailText, { color: colors.textSecondary }]}>
              {desc.descripcion}
            </Text>
          </View>
        </View>
      )}
    </GlowCard>
  );
}

// ─── Local Styles ────────────────────────────────────────────────────

const local = StyleSheet.create({
  levelCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: "900",
  },
  classChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  classChipText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 6,
  },
});
