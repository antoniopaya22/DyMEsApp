/**
 * BackgroundCard - Expandable background detail card for the Compendium
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
import { GlowCard } from "@/components/ui";
import { BACKGROUND_ICONS } from "@/data/srd";
import type { BackgroundData } from "@/data/srd";
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

interface BackgroundCardProps {
  data: BackgroundData;
  isExpanded: boolean;
  onToggle: () => void;
}

export function BackgroundCard({
  data,
  isExpanded,
  onToggle,
}: BackgroundCardProps) {
  const { colors } = useTheme();
  const icon =
    BACKGROUND_ICONS[data.id as keyof typeof BACKGROUND_ICONS] ||
    "document-text-outline";
  const personalityTraits = data.personality?.traits ?? [];

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

  const accentColor = colors.accentBlue;

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
          <Ionicons name={icon as any} size={22} color={accentColor} />
        </View>
        <View style={s.cardInfo}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[s.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {data.skillProficiencies.length > 0
              ? data.skillProficiencies
                  .map((sk) => formatSkillName(sk))
                  .join(", ")
              : "Sin habilidades específicas"}
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
          {/* Description */}
          {data.descripcion && (
            <View style={s.detailSection}>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.descripcion}
              </Text>
            </View>
          )}

          {/* Skills */}
          {data.skillProficiencies.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Competencias en habilidades
              </Text>
              <View style={s.skillTagsRow}>
                {data.skillProficiencies.map((skill) => (
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

          {/* Tools & Languages */}
          {data.toolProficiencies.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Herramientas
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.toolProficiencies.join(", ")}
              </Text>
            </View>
          )}

          {data.extraLanguages > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Idiomas
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.extraLanguages} idioma(s) a elegir
              </Text>
            </View>
          )}

          {/* Equipment */}
          {data.equipment && data.equipment.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Equipamiento
              </Text>
              {data.equipment.map((eq, i) => (
                <Text
                  key={i}
                  style={[s.equipItem, { color: colors.textSecondary }]}
                >
                  • {eq}
                </Text>
              ))}
            </View>
          )}

          {/* Gold */}
          {data.startingGold > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Oro inicial
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.startingGold} po
              </Text>
            </View>
          )}

          {/* Feature */}
          {data.featureName && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Rasgo especial
              </Text>
              <View style={s.traitItem}>
                <Text style={[s.traitName, { color: colors.textPrimary }]}>
                  {data.featureName}
                </Text>
                <Text style={[s.traitDesc, { color: colors.textSecondary }]}>
                  {data.featureDescription}
                </Text>
              </View>
            </View>
          )}

          {/* Personality tables */}
          {personalityTraits.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Rasgos de personalidad ({personalityTraits.length})
              </Text>
              {personalityTraits.slice(0, 3).map((trait: string, i: number) => (
                <Text
                  key={i}
                  style={[s.personalityItem, { color: colors.textSecondary }]}
                >
                  {i + 1}. {trait}
                </Text>
              ))}
              {personalityTraits.length > 3 && (
                <Text style={[s.moreText, { color: colors.textMuted }]}>
                  + {personalityTraits.length - 3} más...
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </GlowCard>
  );
}
