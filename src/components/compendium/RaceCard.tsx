/**
 * RaceCard - Expandable race detail card for the Compendium
 * Extracted from compendium.tsx
 */

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DetailBadge } from "@/components/ui";
import {
  getSubraceData,
  getAllRaceTraits,
  RACE_ICONS,
} from "@/data/srd";
import type { RaceData } from "@/data/srd";
import type { RaceId, SubraceId } from "@/types/character";
import { useTheme } from "@/hooks";
import { formatAbilityBonuses } from "./compendiumUtils";
import { cardStyles as styles } from "./compendiumStyles";

interface RaceCardProps {
  data: RaceData;
  isExpanded: boolean;
  onToggle: () => void;
}

export function RaceCard({ data, isExpanded, onToggle }: RaceCardProps) {
  const { colors } = useTheme();
  const iconName = RACE_ICONS[data.id as keyof typeof RACE_ICONS] || "person-outline";
  const bonusStr = formatAbilityBonuses(data.abilityBonuses || {});
  const traits = getAllRaceTraits(data.id as RaceId, null);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
      ]}
    >
      <TouchableOpacity
        onPress={onToggle}
        style={styles.cardHeader}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.cardIconBg,
            { backgroundColor: `#f59e0b${colors.iconBgAlpha}` },
          ]}
        >
          <Ionicons name={iconName as any} size={22} color={colors.textSecondary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {bonusStr || "Sin bonificadores fijos"}
            {" · "}
            Vel. {data.speed} pies
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.chevronColor}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View
          style={[
            styles.cardDetail,
            { borderTopColor: colors.borderSeparator },
          ]}
        >
          {/* Size & Speed */}
          <View style={styles.detailRow}>
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
              value={`${data.speed} pies`}
              color={colors.accentGreen}
            />
            {data.darkvision && (
              <DetailBadge
                label="Visión oscura"
                value={`${data.darkvisionRange || 60} pies`}
                color={colors.accentDeepPurple}
              />
            )}
          </View>

          {/* Ability Bonuses */}
          {bonusStr && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Bonificadores de característica
              </Text>
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                {bonusStr}
              </Text>
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Idiomas
              </Text>
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                {data.languages.join(", ")}
              </Text>
            </View>
          )}

          {/* Racial traits */}
          {traits && traits.length > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Rasgos raciales
              </Text>
              {traits.map((trait, i) => (
                <View key={i} style={styles.traitItem}>
                  <Text
                    style={[styles.traitName, { color: colors.textPrimary }]}
                  >
                    {trait.nombre}
                  </Text>
                  <Text
                    style={[
                      styles.traitDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {trait.descripcion}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Subraces */}
          {data.subraces && data.subraces.length > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Subrazas
              </Text>
              {data.subraces.map((sr) => {
                const srData = getSubraceData(data.id as RaceId, sr.id as SubraceId);
                const srBonuses = srData?.abilityBonuses
                  ? formatAbilityBonuses(srData.abilityBonuses)
                  : "";
                return (
                  <View
                    key={sr.id}
                    style={[
                      styles.subraceBlock,
                      {
                        backgroundColor: colors.bgSubtle,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subraceName,
                        { color: colors.accentGold },
                      ]}
                    >
                      {sr.nombre}
                    </Text>
                    {srBonuses ? (
                      <Text
                        style={[
                          styles.subraceDetail,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {srBonuses}
                      </Text>
                    ) : null}
                    {srData?.traits && srData.traits.length > 0 && (
                      <>
                        {srData.traits.map((srt, si) => (
                          <View key={si} style={styles.traitItem}>
                            <Text
                              style={[
                                styles.traitName,
                                { fontSize: 12, color: colors.textPrimary },
                              ]}
                            >
                              {srt.nombre}
                            </Text>
                            <Text
                              style={[
                                styles.traitDesc,
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
    </View>
  );
}
