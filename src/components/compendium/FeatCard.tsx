/**
 * FeatCard - Expandable feat detail card for the Compendium
 *
 * Shows feat name, category, source, and prerequisite in collapsed state.
 * Expands to show full description and structured mechanical effects.
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
import type { Feat, FeatCategory } from "@/data/srd";
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

/** Category display info */
const FEAT_CATEGORY_INFO: Record<
  FeatCategory,
  { label: string; icon: string; color: string }
> = {
  origen: { label: "Origen", icon: "leaf", color: "#22c55e" },
  general: { label: "General", icon: "star", color: "#3b82f6" },
  combate: { label: "Combate", icon: "flame", color: "#ef4444" },
  epica: { label: "Epica", icon: "diamond", color: "#a855f7" },
};

/** Effect type display names */
const EFFECT_TYPE_NAMES: Record<string, string> = {
  asi: "Mejora de característica",
  proficiency: "Competencia",
  spell: "Conjuro",
  hp_max: "Puntos de golpe",
  speed: "Velocidad",
  sense: "Sentido",
  trait: "Rasgo",
};

interface FeatCardProps {
  data: Feat;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FeatCard({ data, isExpanded, onToggle }: FeatCardProps) {
  const { colors } = useTheme();

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

  const catInfo =
    FEAT_CATEGORY_INFO[data.categoria] ?? FEAT_CATEGORY_INFO.general;
  const accentColor = catInfo.color;

  // Subtitle parts
  const subtitleParts: string[] = [catInfo.label, data.fuente];
  if (data.prerrequisito) subtitleParts.push(data.prerrequisito);

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
          <Ionicons name={catInfo.icon as any} size={22} color={accentColor} />
        </View>
        <View style={s.cardInfo}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[s.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitleParts.join(" · ")}
          </Text>
        </View>
        {/* Source badge */}
        <View
          style={[
            local.sourceBadge,
            {
              backgroundColor: colors.tabBg,
              borderColor: colors.tabBorder,
            },
          ]}
        >
          <Text style={[local.sourceBadgeText, { color: colors.textMuted }]}>
            {data.fuente}
          </Text>
        </View>
        <Animated.View
          style={{ transform: [{ rotate: chevronRotation }], marginLeft: 8 }}
        >
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </Animated.View>
      </View>

      {/* Expanded detail */}
      {isExpanded && (
        <View
          style={[s.cardDetail, { borderTopColor: colors.borderSeparator }]}
        >
          {/* Badges */}
          <View style={s.detailRow}>
            <DetailBadge
              label="Categoría"
              value={catInfo.label}
              color={accentColor}
            />
            <DetailBadge
              label="Fuente"
              value={data.fuente}
              color={colors.accentAmber}
            />
            {data.repetible && (
              <DetailBadge
                label="Repetible"
                value="Sí"
                color={colors.accentGreen}
              />
            )}
          </View>

          {/* Original name */}
          {data.nombreOriginal && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Nombre original
              </Text>
              <Text
                style={[
                  s.detailText,
                  { color: colors.textMuted, fontStyle: "italic" },
                ]}
              >
                {data.nombreOriginal}
              </Text>
            </View>
          )}

          {/* Prerequisite */}
          {data.prerrequisito && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Prerrequisito
              </Text>
              <Text style={[s.detailText, { color: colors.accentDanger }]}>
                {data.prerrequisito}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={s.detailSection}>
            <Text style={[s.detailLabel, { color: colors.accentGold }]}>
              Descripción
            </Text>
            <Text style={[s.detailText, { color: colors.textSecondary }]}>
              {data.descripcion}
            </Text>
          </View>

          {/* Structured effects */}
          {data.efectos && data.efectos.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Efectos mecánicos
              </Text>
              {data.efectos.map((effect, i) => {
                const effectLabel =
                  EFFECT_TYPE_NAMES[effect.type] ?? effect.type;
                let detail = "";

                switch (effect.type) {
                  case "asi":
                    detail = effect.asiChoices
                      ? `+${effect.asiAmount ?? 1} a ${effect.asiChoices.join(" o ").toUpperCase()}`
                      : `+${effect.asiAmount ?? 1}`;
                    break;
                  case "proficiency":
                    detail = effect.proficiencyValues?.join(", ") ?? "";
                    if (effect.proficiencyChoice)
                      detail += ` (elige ${effect.proficiencyChoiceCount ?? 1})`;
                    break;
                  case "spell":
                    detail = effect.spellIds?.join(", ") ?? "";
                    break;
                  case "hp_max":
                    if (effect.hpBonusPerLevel)
                      detail = `+${effect.hpBonusPerLevel} PG por nivel`;
                    else if (effect.hpBonus) detail = `+${effect.hpBonus} PG`;
                    break;
                  case "speed":
                    detail = `+${effect.speedBonus ?? 0} pies`;
                    break;
                  case "sense":
                    detail = `${effect.senseType ?? ""} ${effect.senseRange ?? ""}m`;
                    break;
                  case "trait":
                    detail = effect.traitDescription ?? "";
                    break;
                }

                return (
                  <View key={i} style={s.traitItem}>
                    <View style={local.effectRow}>
                      <View
                        style={[
                          s.levelBadge,
                          { backgroundColor: `${accentColor}25` },
                        ]}
                      >
                        <Text
                          style={[s.levelBadgeText, { color: accentColor }]}
                        >
                          {effectLabel}
                        </Text>
                      </View>
                    </View>
                    {detail ? (
                      <Text
                        style={[
                          s.traitDesc,
                          { color: colors.textSecondary, marginTop: 2 },
                        ]}
                      >
                        {detail}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </GlowCard>
  );
}

// ─── Local Styles ────────────────────────────────────────────────────

const local = StyleSheet.create({
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  effectRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
