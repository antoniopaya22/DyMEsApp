/**
 * HomeEmptyState - Empty state for the home screen
 *
 * Animated D20 icon with floating loop, welcome text,
 * dragon divider, and CTA button.
 * Extracted from app/index.tsx
 */

import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  DragonDivider,
  MinimalD20Logo,
} from "@/components/ui";
import { useTheme } from "@/hooks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HomeEmptyStateProps {
  onCreateFirst: () => void;
}

export function HomeEmptyState({ onCreateFirst }: HomeEmptyStateProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();

    return () => floatLoop.stop();
  }, [scaleAnim, fadeAnim, floatAnim]);

  return (
    <View style={styles.emptyContainer}>
      {/* Floating D20 icon */}
      <Animated.View
        style={[
          styles.emptyIconOuter,
          {
            transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
          },
        ]}
      >
        <MinimalD20Logo size={80} animated showRunicRing />
      </Animated.View>

      {/* Text */}
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <Text style={[styles.emptyTitle, { color: colors.emptyTitle }]}>
          ¡Bienvenido, aventurero!
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.emptySubtitle }]}>
          No tienes ningún personaje todavía.{"\n"}Crea tu primer personaje
          para empezar a jugar.
        </Text>

        <DragonDivider
          color={colors.accentGold}
          height={32}
          spacing={16}
          style={{ width: SCREEN_WIDTH * 0.7 }}
        />

        <TouchableOpacity
          style={styles.emptyButton}
          onPress={onCreateFirst}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#d32f2f", colors.accentRed, "#a51c1c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyButtonGradient}
          >
            <Ionicons name="add" size={22} color="white" />
            <Text style={styles.emptyButtonText}>Crear primer personaje</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.emptyHintRow}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={colors.emptyHintText}
          />
          <Text style={[styles.emptyHintText, { color: colors.emptyHintText }]}>
            También puedes explorar el{" "}
            <Text style={{ color: colors.accentGold + "90" }}>Compendio</Text>{" "}
            con razas, clases y trasfondos
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  emptyIconOuter: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#8f3d38",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  emptyHintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 12,
    gap: 6,
  },
  emptyHintText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
});
