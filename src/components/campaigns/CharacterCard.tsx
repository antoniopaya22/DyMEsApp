/**
 * CharacterCard - Large card with avatar image header
 *
 * Displays character avatar as a prominent header image with name overlay,
 * class/race info, level badge, and date — all inside a rounded card.
 */

import { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, useEntranceAnimation } from "@/hooks";
import { getCharacterAvatar } from "@/utils/avatar";
import type { CharacterSummary } from "@/stores/characterListStore";

const IMAGE_HEIGHT = 180;

interface CharacterCardProps {
  item: CharacterSummary;
  index: number;
  classTheme: { iconName: string; color: string; nombre: string } | null;
  raceName: string;
  onPress: () => void;
  onLongPress: () => void;
}

export function CharacterCard({
  item,
  index,
  classTheme,
  raceName,
  onPress,
  onLongPress,
}: CharacterCardProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { opacity: entranceAnim, translateY } = useEntranceAnimation({
    delay: index * 100,
    duration: 500,
    slide: true,
    distance: 30,
    slideDuration: 550,
  });

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const accentColor = colors.accentGold;
  const avatarSource = getCharacterAvatar(item.clase, item.raza, item.sexo);
  const classIcon =
    (classTheme?.iconName as keyof typeof Ionicons.glyphMap) ??
    "shield-half-sharp";

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: entranceAnim,
          transform: [{ scale: scaleAnim }, { translateY }],
          shadowColor: isDark ? accentColor : colors.shadowColor,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* ── Image Header ── */}
        <View style={styles.imageContainer}>
          {avatarSource ? (
            <Image
              source={avatarSource}
              style={styles.heroImage}
              contentFit="cover"
              contentPosition="top"
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                { backgroundColor: `${classTheme?.color ?? accentColor}18` },
              ]}
            >
              <Ionicons
                name={classIcon}
                size={56}
                color={`${classTheme?.color ?? accentColor}55`}
              />
            </View>
          )}

          {/* Gradient overlay on image for text readability */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.65)"]}
            style={styles.imageGradient}
          />

          {/* Name overlay on image */}
          <View style={styles.imageOverlay}>
            <Text style={styles.heroName} numberOfLines={1}>
              {item.nombre}
            </Text>
          </View>

          {/* Level badge floating top-right */}
          <View
            style={[
              styles.levelBadge,
              {
                backgroundColor: classTheme?.color ?? accentColor,
                shadowColor: classTheme?.color ?? accentColor,
              },
            ]}
          >
            <Text style={[styles.levelText, { color: colors.textInverted }]}>
              NV {item.nivel}
            </Text>
          </View>

          {/* Accent top bar */}
          <View
            style={[
              styles.accentBar,
              { backgroundColor: classTheme?.color ?? accentColor },
            ]}
          />
        </View>

        {/* ── Info Footer ── */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            {/* Class icon */}
            <View
              style={[
                styles.classIconCircle,
                { backgroundColor: `${classTheme?.color ?? accentColor}1A` },
              ]}
            >
              <Ionicons
                name={classIcon}
                size={18}
                color={classTheme?.color ?? accentColor}
              />
            </View>

            {/* Race · Class */}
            <View style={styles.infoText}>
              <Text
                style={[styles.infoTitle, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {classTheme?.nombre ?? "—"}
              </Text>
              <Text
                style={[styles.infoSubtitle, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {raceName}
              </Text>
            </View>

            {/* Date + chevron */}
            <View style={styles.infoRight}>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {new Date(item.actualizadoEn).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
              <View
                style={[
                  styles.chevronCircle,
                  { backgroundColor: colors.cardChevronBg },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.chevronColor}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },

  // ── Image Header ──
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: IMAGE_HEIGHT * 1.4,
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: IMAGE_HEIGHT * 0.6,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 70,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  levelBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  // ── Info Footer ──
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  classIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  infoSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  infoRight: {
    alignItems: "flex-end",
    marginLeft: 8,
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "500",
  },
  chevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
