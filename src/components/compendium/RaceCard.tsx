/**
 * RaceCard - Expandable race detail card for the Compendium
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
import { getSubraceData, getAllRaceTraits, RACE_ICONS } from "@/data/srd";
import type { RaceData } from "@/data/srd";
import type { RaceId, SubraceId } from "@/types/character";
import { useTheme } from "@/hooks";
import { useUnidadesActuales } from "@/stores/settingsStore";
import { formatDistancia } from "@/utils/units";
import { formatAbilityBonuses } from "./compendiumUtils";
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

interface RaceCardProps {
  data: RaceData;
  isExpanded: boolean;
  onToggle: () => void;
}

export function RaceCard({ data, isExpanded, onToggle }: RaceCardProps) {
  const { colors } = useTheme();
  const unidades = useUnidadesActuales();
  const iconName =
    RACE_ICONS[data.id as keyof typeof RACE_ICONS] || "person-outline";
  const bonusStr = formatAbilityBonuses(data.abilityBonuses || {});
  const traits = getAllRaceTraits(data.id as RaceId, null);

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

  const accentColor = colors.accentAmber;

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
          <Ionicons name={iconName as any} size={22} color={accentColor} />
        </View>
        <View style={s.cardInfo}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[s.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {bonusStr || "Sin bonificadores fijos"}
            {" · "}
            Vel. {formatDistancia(data.speed, unidades)}
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
          {/* Size & Speed badges */}
          <View style={s.detailRow}>
            <DetailBadge
              label="Tamaño"
              value={
                data.size === "diminuto"
                  ? "Diminuto"
                  : data.size === "mediano"
                    ? "Mediano"
                    : data.size === "pequeno"
                      ? "Pequeño"
                      : "Grande"
              }
              color={colors.accentPurple}
            />
            <DetailBadge
              label="Velocidad"
              value={formatDistancia(data.speed, unidades)}
              color={colors.accentGreen}
            />
            {data.darkvision && (
              <DetailBadge
                label="Visión oscura"
                value={formatDistancia(data.darkvisionRange || 60, unidades)}
                color={colors.accentDeepPurple}
              />
            )}
          </View>

          {/* Ability Bonuses */}
          {bonusStr && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Bonificadores de característica
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {bonusStr}
              </Text>
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Idiomas
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.languages.join(", ")}
              </Text>
            </View>
          )}

          {/* Racial traits */}
          {traits && traits.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Rasgos raciales
              </Text>
              {traits.map((trait, i) => (
                <View key={i} style={s.traitItem}>
                  <Text style={[s.traitName, { color: colors.textPrimary }]}>
                    {trait.nombre}
                  </Text>
                  <Text style={[s.traitDesc, { color: colors.textSecondary }]}>
                    {trait.descripcion}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Subraces */}
          {data.subraces && data.subraces.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Subrazas
              </Text>
              {data.subraces.map((sr) => {
                const srData = getSubraceData(
                  data.id as RaceId,
                  sr.id as SubraceId,
                );
                const srBonuses = srData?.abilityBonuses
                  ? formatAbilityBonuses(srData.abilityBonuses)
                  : "";
                return (
                  <View
                    key={sr.id}
                    style={[
                      s.subraceBlock,
                      {
                        backgroundColor: colors.bgSubtle,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[s.subraceName, { color: accentColor }]}>
                      {sr.nombre}
                    </Text>
                    {srBonuses ? (
                      <Text
                        style={[
                          s.subraceDetail,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {srBonuses}
                      </Text>
                    ) : null}
                    {srData?.traits && srData.traits.length > 0 && (
                      <>
                        {srData.traits.map((srt, si) => (
                          <View key={si} style={s.traitItem}>
                            <Text
                              style={[
                                s.traitName,
                                { fontSize: 12, color: colors.textPrimary },
                              ]}
                            >
                              {srt.nombre}
                            </Text>
                            <Text
                              style={[
                                s.traitDesc,
                                { fontSize: 11, color: colors.textSecondary },
                              ]}
                            >
                              {srt.descripcion}
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
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
