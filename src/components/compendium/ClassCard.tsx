/**
 * ClassCard - Expandable class detail card for the Compendium
 *
 * Uses GlowCard for consistent styling with the rest of the app,
 * and LayoutAnimation for smooth expand/collapse transitions.
 */

import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlowCard, DetailBadge } from "@/components/ui";
import { CLASS_ICONS } from "@/data/srd";
import type { ClassData } from "@/data/srd";
import { ABILITY_NAMES, type AbilityKey } from "@/types/character";
import { useTheme } from "@/hooks";
import { formatSkillName } from "./compendiumUtils";
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

interface ClassCardProps {
  data: ClassData;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ClassCard({ data, isExpanded, onToggle }: ClassCardProps) {
  const { colors } = useTheme();
  const icon = CLASS_ICONS[data.id as keyof typeof CLASS_ICONS] || "⚔️";

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

  const accentColor = colors.accentDanger;

  return (
    <GlowCard
      accentLine
      accentPosition="left"
      accentColors={[accentColor, `${accentColor}88`, `${accentColor}44`]}
      pressScale={0.98}
      onPress={handleToggle}
      padding={14}
      style={{ marginBottom: 12 }}
    >
      {/* Header */}
      <View style={s.cardHeader}>
        <View
          style={[
            s.cardIconBg,
            { backgroundColor: `${accentColor}${colors.iconBgAlpha}` },
          ]}
        >
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <View style={s.cardInfo}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[s.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            Dado de golpe: {data.hitDie} · Salv:{" "}
            {data.savingThrows
              .map((st) => ABILITY_NAMES[st as AbilityKey]?.slice(0, 3) || st)
              .join(", ")}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </Animated.View>
      </View>

      {/* Expanded detail */}
      {isExpanded && (
        <View
          style={[s.cardDetail, { borderTopColor: colors.borderSeparator }]}
        >
          {/* Hit Die & HP */}
          <View style={s.detailRow}>
            <DetailBadge
              label="Dado de golpe"
              value={data.hitDie}
              color={colors.accentDanger}
            />
            <DetailBadge
              label="PG nivel 1"
              value={`${data.hitDieMax} + CON`}
              color={colors.accentGreen}
            />
          </View>

          {/* Saving Throws */}
          <View style={s.detailSection}>
            <Text style={[s.detailLabel, { color: colors.accentGold }]}>
              Salvaciones competentes
            </Text>
            <Text style={[s.detailText, { color: colors.textSecondary }]}>
              {data.savingThrows
                .map((st) => ABILITY_NAMES[st as AbilityKey] || st)
                .join(", ")}
            </Text>
          </View>

          {/* Armor Proficiencies */}
          {data.armorProficiencies && data.armorProficiencies.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Armaduras
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.armorProficiencies.join(", ")}
              </Text>
            </View>
          )}

          {/* Weapon Proficiencies */}
          {data.weaponProficiencies && data.weaponProficiencies.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Armas
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.weaponProficiencies.join(", ")}
              </Text>
            </View>
          )}

          {/* Tool Proficiencies */}
          {data.toolProficiencies && data.toolProficiencies.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Herramientas
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.toolProficiencies.join(", ")}
              </Text>
            </View>
          )}

          {/* Skills */}
          {data.skillChoicePool && data.skillChoicePool.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Habilidades (elige {data.skillChoiceCount || 2})
              </Text>
              <View style={s.skillTagsRow}>
                {data.skillChoicePool.map((skill) => (
                  <View
                    key={skill}
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
                      {formatSkillName(skill)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Class Features (level 1) */}
          {data.level1Features && data.level1Features.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Rasgos de clase (nivel 1)
              </Text>
              {data.level1Features.map((feature, i) => (
                <View key={i} style={s.traitItem}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={[
                        s.levelBadge,
                        { backgroundColor: `${accentColor}30` },
                      ]}
                    >
                      <Text style={[s.levelBadgeText, { color: accentColor }]}>
                        Nv.{feature.nivel}
                      </Text>
                    </View>
                    <Text
                      style={[
                        s.traitName,
                        { marginLeft: 8, color: colors.textPrimary },
                      ]}
                    >
                      {feature.nombre}
                    </Text>
                  </View>
                  <Text style={[s.traitDesc, { color: colors.textSecondary }]}>
                    {feature.descripcion}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Subclass info */}
          {data.subclassLevel > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Subclase ({data.subclassLabel}) — Nv. {data.subclassLevel}
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                Se elige al alcanzar el nivel {data.subclassLevel}.
              </Text>
            </View>
          )}

          {/* Spellcasting */}
          {data.casterType !== "none" && data.spellcastingAbility && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Lanzamiento de conjuros
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                Característica:{" "}
                {ABILITY_NAMES[data.spellcastingAbility as AbilityKey] ||
                  data.spellcastingAbility}
              </Text>
              <Text
                style={[
                  s.detailText,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Tipo:{" "}
                {data.casterType === "full"
                  ? "Lanzador completo"
                  : data.casterType === "half"
                    ? "Medio lanzador"
                    : data.casterType === "pact"
                      ? "Magia de pacto"
                      : data.casterType}
              </Text>
              {data.preparesSpells && (
                <Text
                  style={[
                    s.detailText,
                    { color: colors.textSecondary, marginTop: 2 },
                  ]}
                >
                  Prepara conjuros diariamente.
                </Text>
              )}
              {data.cantripsAtLevel1 > 0 && (
                <Text
                  style={[
                    s.detailText,
                    { color: colors.textSecondary, marginTop: 2 },
                  ]}
                >
                  Trucos a nivel 1: {data.cantripsAtLevel1}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </GlowCard>
  );
}
