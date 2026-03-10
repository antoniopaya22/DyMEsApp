/**
 * ItemCard - Expandable item detail card for the Compendium
 *
 * Shows item name, category, weight and value in collapsed state.
 * Expands to show full detail: description, weapon/armor specifics.
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
import type { SrdItemTemplate } from "@/data/srd";
import {
  ITEM_CATEGORY_NAMES,
  ITEM_CATEGORY_ICONS,
  WEAPON_TYPE_NAMES,
  WEAPON_PROPERTY_NAMES,
  ARMOR_TYPE_NAMES,
} from "@/constants/items";
import type { WeaponType, WeaponProperty, ArmorType } from "@/types/item";
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

/** Category accent colors */
const CATEGORY_COLORS: Record<string, string> = {
  arma: "#ef4444",
  armadura: "#3b82f6",
  escudo: "#3b82f6",
  equipo_aventurero: "#22c55e",
  herramienta: "#f59e0b",
  montura_vehiculo: "#a855f7",
  consumible: "#ec4899",
  objeto_magico: "#8b5cf6",
  municion: "#f97316",
  otro: "#9ca3af",
};

interface ItemCardProps {
  data: SrdItemTemplate;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ItemCard({ data, isExpanded, onToggle }: ItemCardProps) {
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

  const accentColor = CATEGORY_COLORS[data.categoria] ?? colors.accentGreen;
  const categoryName = ITEM_CATEGORY_NAMES[data.categoria] ?? data.categoria;
  const categoryIcon = ITEM_CATEGORY_ICONS[data.categoria] ?? "cube";
  const wd = data.weaponDetails;
  const ad = data.armorDetails;

  // Subtitle: category + weight/value summary
  const subtitleParts: string[] = [categoryName];
  if (data.peso > 0) subtitleParts.push(`${data.peso} lb`);
  if (data.valor != null && data.valor > 0)
    subtitleParts.push(`${data.valor} po`);

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
          <Ionicons name={categoryIcon as any} size={22} color={accentColor} />
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
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </Animated.View>
      </View>

      {/* Expanded detail */}
      {isExpanded && (
        <View
          style={[s.cardDetail, { borderTopColor: colors.borderSeparator }]}
        >
          {/* Badges row */}
          <View style={s.detailRow}>
            <DetailBadge
              label="Categoría"
              value={categoryName}
              color={accentColor}
            />
            {data.peso > 0 && (
              <DetailBadge
                label="Peso"
                value={`${data.peso} lb`}
                color={colors.accentAmber}
              />
            )}
            {data.valor != null && data.valor > 0 && (
              <DetailBadge
                label="Valor"
                value={`${data.valor} po`}
                color={colors.accentGold}
              />
            )}
          </View>

          {/* Description */}
          {data.descripcion && (
            <View style={s.detailSection}>
              <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                Descripción
              </Text>
              <Text style={[s.detailText, { color: colors.textSecondary }]}>
                {data.descripcion}
              </Text>
            </View>
          )}

          {/* Weapon details */}
          {wd && (
            <>
              <View style={s.detailSection}>
                <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                  Tipo de arma
                </Text>
                <Text style={[s.detailText, { color: colors.textSecondary }]}>
                  {WEAPON_TYPE_NAMES[wd.weaponType as WeaponType] ??
                    wd.weaponType}
                </Text>
              </View>

              <View style={s.detailSection}>
                <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                  Daño
                </Text>
                <Text style={[s.detailText, { color: colors.textSecondary }]}>
                  {wd.damage.dice} {wd.damage.damageType}
                </Text>
                {wd.versatileDamage && (
                  <Text
                    style={[
                      s.detailText,
                      { color: colors.textMuted, marginTop: 2, fontSize: 13 },
                    ]}
                  >
                    Versátil: {wd.versatileDamage.dice}{" "}
                    {wd.versatileDamage.damageType}
                  </Text>
                )}
              </View>

              {wd.properties && wd.properties.length > 0 && (
                <View style={s.detailSection}>
                  <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                    Propiedades
                  </Text>
                  <View style={s.skillTagsRow}>
                    {wd.properties.map((prop) => (
                      <View
                        key={prop}
                        style={[
                          s.skillTag,
                          {
                            backgroundColor: colors.tabBg,
                            borderColor: colors.tabBorder,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.skillTagText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {WEAPON_PROPERTY_NAMES[prop as WeaponProperty] ??
                            prop}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {wd.range && (
                <View style={s.detailSection}>
                  <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                    Alcance
                  </Text>
                  <Text style={[s.detailText, { color: colors.textSecondary }]}>
                    {wd.range.normal} m / {wd.range.long} m
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Armor details */}
          {ad && (
            <>
              <View style={s.detailSection}>
                <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                  Tipo de armadura
                </Text>
                <Text style={[s.detailText, { color: colors.textSecondary }]}>
                  {ARMOR_TYPE_NAMES[ad.armorType as ArmorType] ?? ad.armorType}
                </Text>
              </View>

              <View style={s.detailSection}>
                <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                  Clase de armadura
                </Text>
                <Text style={[s.detailText, { color: colors.textSecondary }]}>
                  CA {ad.baseAC}
                  {ad.addDexModifier
                    ? ad.maxDexBonus != null
                      ? ` + DES (máx. ${ad.maxDexBonus})`
                      : " + DES"
                    : ""}
                </Text>
              </View>

              {ad.strengthRequirement != null && ad.strengthRequirement > 0 && (
                <View style={s.detailSection}>
                  <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                    Requisito de fuerza
                  </Text>
                  <Text style={[s.detailText, { color: colors.textSecondary }]}>
                    FUE {ad.strengthRequirement}
                  </Text>
                </View>
              )}

              {ad.stealthDisadvantage && (
                <View style={s.detailSection}>
                  <Text style={[s.detailLabel, { color: colors.accentGold }]}>
                    Sigilo
                  </Text>
                  <Text style={[s.detailText, { color: colors.accentDanger }]}>
                    Desventaja en Sigilo
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </GlowCard>
  );
}
