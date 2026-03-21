/**
 * Mode Selection Screen (HU-10.1)
 *
 * Shown after first login or accessible from Settings.
 * Lets the user choose between "Modo Jugador" and "Modo Master".
 * Full-bleed vertical layout with D20 hero, atmospheric effects, and
 * polished mode cards.
 */

import { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore, selectIsPremium } from "@/stores/authStore";
import { useTheme } from "@/hooks";
import {
  DndLogo,
  TorchGlow,
  FloatingParticles,
  D20Watermark,
} from "@/components/ui";
import type { AppMode } from "@/types/master";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Component ───────────────────────────────────────────────────────

export default function ModeSelectionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { setAppMode } = useAuthStore();
  const isPremium = useAuthStore(selectIsPremium);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const cardTopAnim = useRef(new Animated.Value(50)).current;
  const cardBottomAnim = useRef(new Animated.Value(50)).current;
  const scaleTopAnim = useRef(new Animated.Value(1)).current;
  const scaleBottomAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(heroSlide, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(cardTopAnim, {
        toValue: 0,
        friction: 8,
        tension: 55,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.spring(cardBottomAnim, {
        toValue: 0,
        friction: 8,
        tension: 55,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, heroSlide, cardTopAnim, cardBottomAnim]);

  const handleSelectMode = async (mode: AppMode) => {
    await setAppMode(mode);
    if (mode === "master") {
      router.push("/master" as any);
    } else {
      router.push("/");
    }
  };

  const handlePressIn = useCallback((anim: Animated.Value) => {
    Animated.timing(anim, {
      toValue: 0.96,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback((anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={colors.gradientMain}
        locations={colors.gradientLocations}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmospheric effects */}
      <TorchGlow
        color={colors.accentGold}
        position="top-right"
        size={200}
        intensity={isDark ? 0.07 : 0.04}
        animated
      />
      <TorchGlow
        color={colors.accentGold}
        position="top-left"
        size={140}
        intensity={isDark ? 0.04 : 0.03}
        animated
      />

      {isDark && (
        <FloatingParticles
          count={6}
          color={colors.accentGold}
          width={SCREEN_WIDTH}
          height={500}
          maxSize={2.5}
          opacity={0.25}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}

      {/* D20 watermark bottom-right */}
      <View style={styles.watermark}>
        <D20Watermark size={200} variant="dark" opacity={1} />
      </View>

      {/* ── Content ── */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Hero section: Logo + Title */}
        <Animated.View
          style={[
            styles.heroSection,
            { transform: [{ translateY: heroSlide }] },
          ]}
        >
          <DndLogo size="lg" animated />

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Elige tu camino
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Puedes cambiar de modo en cualquier momento desde Ajustes
          </Text>
        </Animated.View>

        {/* Mode Cards — vertical stack */}
        <View style={styles.cardsColumn}>
          {/* ── Player Mode Card ── */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [
                  { translateY: cardTopAnim },
                  { scale: scaleTopAnim },
                ],
                shadowColor: colors.accentGold,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderDefault,
                },
              ]}
              onPress={() => handleSelectMode("jugador")}
              onPressIn={() => handlePressIn(scaleTopAnim)}
              onPressOut={() => handlePressOut(scaleTopAnim)}
              activeOpacity={1}
            >
              {/* Accent top bar */}
              <LinearGradient
                colors={[colors.accentGold, `${colors.accentGold}60`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardAccentBar}
              />

              <View style={styles.cardBody}>
                <View
                  style={[
                    styles.cardIconCircle,
                    { backgroundColor: `${colors.accentGold}18` },
                  ]}
                >
                  <Ionicons
                    name="shield-outline"
                    size={30}
                    color={colors.accentGold}
                  />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text
                    style={[styles.cardTitle, { color: colors.textPrimary }]}
                  >
                    Modo Jugador
                  </Text>
                  <Text
                    style={[
                      styles.cardDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Crea y gestiona tus personajes de D&D
                  </Text>
                </View>

                <View
                  style={[
                    styles.cardChevron,
                    { backgroundColor: colors.bgSubtle },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.accentGold}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Master Mode Card ── */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [
                  { translateY: cardBottomAnim },
                  { scale: scaleBottomAnim },
                ],
                shadowColor: colors.accentPurple,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: isPremium
                    ? `${colors.accentPurple}40`
                    : colors.borderDefault,
                },
              ]}
              onPress={() => handleSelectMode("master")}
              onPressIn={() => handlePressIn(scaleBottomAnim)}
              onPressOut={() => handlePressOut(scaleBottomAnim)}
              activeOpacity={1}
            >
              {/* Accent top bar */}
              <LinearGradient
                colors={[colors.accentPurple, `${colors.accentPurple}60`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardAccentBar}
              />

              {/* Premium badge */}
              <View
                style={[
                  styles.premiumBadge,
                  {
                    backgroundColor: isPremium
                      ? colors.accentPurple
                      : colors.textMuted,
                  },
                ]}
              >
                <Ionicons name="star" size={9} color="#FFF" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>

              <View style={styles.cardBody}>
                <View
                  style={[
                    styles.cardIconCircle,
                    { backgroundColor: `${colors.accentPurple}18` },
                  ]}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={30}
                    color={colors.accentPurple}
                  />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text
                    style={[styles.cardTitle, { color: colors.textPrimary }]}
                  >
                    Modo Master
                  </Text>
                  <Text
                    style={[
                      styles.cardDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Dirige campañas y monitoriza jugadores en tiempo real
                  </Text>
                </View>

                <View
                  style={[
                    styles.cardChevron,
                    { backgroundColor: colors.bgSubtle },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.accentPurple}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  watermark: {
    position: "absolute",
    bottom: -30,
    right: -30,
    opacity: 0.04,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // ── Hero ──
  heroSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // ── Cards ──
  cardsColumn: {
    width: "100%",
    gap: 14,
  },
  cardWrapper: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardAccentBar: {
    height: 3,
    width: "100%",
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 18,
    gap: 14,
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Premium badge ──
  premiumBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
    zIndex: 1,
  },
  premiumBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
