/**
 * SubclassCard - Expandable subclass detail card for the Compendium
 *
 * Shows subclass name, parent class, and source in collapsed state.
 * Expands to show description and feature list by level.
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
import { GlowCard } from "@/components/ui";
import { CLASS_ICONS, getSubclassFeatures } from "@/data/srd";
import type { SubclassOption, SubclassFeatureData } from "@/data/srd";
import type { ClassId } from "@/types/character";
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

/** Color per class for subclass accent */
const CLASS_COLORS: Record<string, string> = {
  barbaro: "#ef4444",
  bardo: "#a855f7",
  brujo: "#8b5cf6",
  clerigo: "#f59e0b",
  druida: "#22c55e",
  explorador: "#14b8a6",
  guerrero: "#dc2626",
  hechicero: "#ec4899",
  mago: "#3b82f6",
  monje: "#06b6d4",
  paladin: "#eab308",
  picaro: "#64748b",
};

/** Display names for classes */
const CLASS_DISPLAY_NAMES: Record<string, string> = {
  barbaro: "Bárbaro",
  bardo: "Bardo",
  brujo: "Brujo",
  clerigo: "Clérigo",
  druida: "Druida",
  explorador: "Explorador",
  guerrero: "Guerrero",
  hechicero: "Hechicero",
  mago: "Mago",
  monje: "Monje",
  paladin: "Paladín",
  picaro: "Pícaro",
};

interface SubclassCardProps {
  data: SubclassOption & { classId: string };
  isExpanded: boolean;
  onToggle: () => void;
}

export function SubclassCard({
  data,
  isExpanded,
  onToggle,
}: SubclassCardProps) {
  const { colors } = useTheme();
  const classIcon =
    CLASS_ICONS[data.classId as keyof typeof CLASS_ICONS] || "hammer-outline";
  const accentColor = CLASS_COLORS[data.classId] ?? colors.accentDeepPurple;
  const className = CLASS_DISPLAY_NAMES[data.classId] ?? data.classId;

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

  // Load features only when expanded (lazy)
  const features = isExpanded
    ? getSubclassFeatures(data.classId as ClassId, data.id)
    : undefined;

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
          <Ionicons name={classIcon as any} size={22} color={accentColor} />
        </View>
        <View style={s.cardInfo}>
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
            {data.nombre}
          </Text>
          <Text
            style={[s.cardSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {className} · {data.fuente}
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
          {/* Description */}
          {data.descripcion && (
            <View style={s.detailSection}>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.descripcion}
              </Text>
            </View>
          )}

          {/* Features by level */}
          {features && features.niveles && features.niveles.length > 0 && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Rasgos por nivel
              </Text>
              {features.niveles.map((levelBlock) => (
                <View key={levelBlock.nivel} style={local.levelBlock}>
                  {/* Level header */}
                  <View style={local.levelHeader}>
                    <View
                      style={[
                        s.levelBadge,
                        { backgroundColor: `${accentColor}25` },
                      ]}
                    >
                      <Text style={[s.levelBadgeText, { color: accentColor }]}>
                        Nv.{levelBlock.nivel}
                      </Text>
                    </View>
                  </View>
                  {/* Features at this level */}
                  {levelBlock.rasgos.map((feature, fi) => (
                    <View key={fi} style={s.traitItem}>
                      <Text
                        style={[s.traitName, { color: colors.textPrimary }]}
                      >
                        {feature.nombre}
                      </Text>
                      <Text
                        style={[s.traitDesc, { color: colors.textSecondary }]}
                      >
                        {feature.descripcion}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
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
  levelBlock: {
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
});
