/**
 * BackgroundCard - Expandable background detail card for the Compendium
 * Extracted from compendium.tsx
 */

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BACKGROUND_ICONS } from "@/data/srd";
import type { BackgroundData } from "@/data/srd";
import { useTheme } from "@/hooks";
import { formatSkillName } from "./compendiumUtils";
import { cardStyles as styles } from "./compendiumStyles";

interface BackgroundCardProps {
  data: BackgroundData;
  isExpanded: boolean;
  onToggle: () => void;
}

export function BackgroundCard({ data, isExpanded, onToggle }: BackgroundCardProps) {
  const { colors } = useTheme();
  const icon =
    BACKGROUND_ICONS[data.id as keyof typeof BACKGROUND_ICONS] || "document-text-outline";
  const personalityTraits = data.personality?.traits ?? [];

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
            { backgroundColor: `#22c55e${colors.iconBgAlpha}` },
          ]}
        >
          <Ionicons name={icon as any} size={24} color={"#22c55e"} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {data.skillProficiencies.length > 0
              ? data.skillProficiencies.map((s) => formatSkillName(s)).join(", ")
              : "Sin habilidades específicas"}
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
          {/* Description */}
          {data.descripcion && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                {data.descripcion}
              </Text>
            </View>
          )}

          {/* Skills */}
          {data.skillProficiencies.length > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Competencias en habilidades
              </Text>
              <View style={styles.skillTagsRow}>
                {data.skillProficiencies.map((skill) => (
                  <View
                    key={skill}
                    style={[
                      styles.skillTag,
                      {
                        backgroundColor: colors.tabBg,
                        borderColor: colors.tabBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.skillTagText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatSkillName(skill)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tools & Languages */}
          {data.toolProficiencies.length > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Herramientas
              </Text>
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                {data.toolProficiencies.join(", ")}
              </Text>
            </View>
          )}

          {data.extraLanguages > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Idiomas
              </Text>
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                {data.extraLanguages} idioma(s) a elegir
              </Text>
            </View>
          )}

          {/* Equipment */}
          {data.equipment && data.equipment.length > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Equipamiento
              </Text>
              {data.equipment.map((eq, i) => (
                <Text
                  key={i}
                  style={[styles.equipItem, { color: colors.textSecondary }]}
                >
                  • {eq}
                </Text>
              ))}
            </View>
          )}

          {/* Gold */}
          {data.startingGold > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Oro inicial
              </Text>
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                {data.startingGold} po
              </Text>
            </View>
          )}

          {/* Feature */}
          {data.featureName && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Rasgo especial
              </Text>
              <View style={styles.traitItem}>
                <Text
                  style={[styles.traitName, { color: colors.textPrimary }]}
                >
                  {data.featureName}
                </Text>
                <Text
                  style={[styles.traitDesc, { color: colors.textSecondary }]}
                >
                  {data.featureDescription}
                </Text>
              </View>
            </View>
          )}

          {/* Personality tables */}
          {personalityTraits.length > 0 && (
            <View style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.accentGold }]}
              >
                Rasgos de personalidad ({personalityTraits.length})
              </Text>
              {personalityTraits.slice(0, 3).map((trait: string, i: number) => (
                <Text
                  key={i}
                  style={[
                    styles.personalityItem,
                    { color: colors.textSecondary },
                  ]}
                >
                  {i + 1}. {trait}
                </Text>
              ))}
              {personalityTraits.length > 3 && (
                <Text style={[styles.moreText, { color: colors.textMuted }]}>
                  + {personalityTraits.length - 3} más...
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
