/**
 * DeathSavesTracker - Death saving throw tracker
 *
 * Shows success/failure circles and +1 buttons, only visible when unconscious.
 * Extracted from CombatTab.tsx
 */

import { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import type { DialogType } from "@/components/ui/ConfirmDialog";

/** D&D 5e: 3 death saves needed to stabilize or die */
const MAX_DEATH_SAVES = 3;
const DEATH_SAVE_INDICES = Array.from({ length: MAX_DEATH_SAVES }, (_, i) => i);

interface DeathSavesTrackerProps {
  onShowAlert: (
    title: string,
    message?: string,
    options?: { type?: DialogType; buttonText?: string },
  ) => void;
  onShowConfirm: (
    title: string,
    message?: string,
    onConfirm?: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: DialogType;
    },
  ) => void;
}

export function DeathSavesTracker({
  onShowAlert,
  onShowConfirm,
}: DeathSavesTrackerProps) {
  const { colors } = useTheme();
  const { character, addDeathSuccess, addDeathFailure, resetDeathSaves } =
    useCharacterStore();

  if (!character) return null;

  const { hp, deathSaves } = character;
  const isUnconscious = hp.current === 0;

  // Entrance animation for the entire card
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.9)).current;
  // Individual circle scales for bounce on fill
  const successScales = useRef(
    DEATH_SAVE_INDICES.map(() => new Animated.Value(1))
  ).current;
  const failureScales = useRef(
    DEATH_SAVE_INDICES.map(() => new Animated.Value(1))
  ).current;
  // Previous values to detect changes
  const prevSuccesses = useRef(0);
  const prevFailures = useRef(0);

  // Entrance animation when becoming unconscious
  useEffect(() => {
    if (isUnconscious) {
      entranceOpacity.setValue(0);
      entranceScale.setValue(0.9);
      const anim = Animated.parallel([
        Animated.timing(entranceOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(entranceScale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
      ]);
      anim.start();
      return () => anim.stop();
    }
  }, [isUnconscious]);

  // Bounce the latest filled circle when successes/failures change
  useEffect(() => {
    if (!isUnconscious) return;
    if (deathSaves.successes > prevSuccesses.current && deathSaves.successes <= MAX_DEATH_SAVES) {
      const idx = deathSaves.successes - 1;
      successScales[idx].setValue(0.3);
      const anim = Animated.spring(successScales[idx], { toValue: 1, friction: 4, tension: 180, useNativeDriver: true });
      anim.start();
      prevSuccesses.current = deathSaves.successes;
      return () => anim.stop();
    }
    prevSuccesses.current = deathSaves.successes;
  }, [deathSaves.successes, isUnconscious]);

  useEffect(() => {
    if (!isUnconscious) return;
    if (deathSaves.failures > prevFailures.current && deathSaves.failures <= MAX_DEATH_SAVES) {
      const idx = deathSaves.failures - 1;
      failureScales[idx].setValue(0.3);
      const anim = Animated.spring(failureScales[idx], { toValue: 1, friction: 4, tension: 180, useNativeDriver: true });
      anim.start();
      prevFailures.current = deathSaves.failures;
      return () => anim.stop();
    }
    prevFailures.current = deathSaves.failures;
  }, [deathSaves.failures, isUnconscious]);

  if (!isUnconscious) return null;

  const handleDeathSuccess = async () => {
    const result = await addDeathSuccess();
    if (result === "stable") {
      onShowAlert(
        "¡Estabilizado!",
        "Has conseguido 3 éxitos. Tu personaje se estabiliza con 1 PG.",
        { type: "success", buttonText: "OK" },
      );
    }
  };

  const handleDeathFailure = async () => {
    const result = await addDeathFailure();
    if (result === "dead") {
      onShowAlert(
        "Muerte",
        "Has acumulado 3 fallos. Tu personaje ha muerto.",
        { type: "danger", buttonText: "OK" },
      );
    }
  };

  return (
    <Animated.View
      className="rounded-card border p-4 mb-4"
      style={{
        backgroundColor: colors.bgElevated,
        borderColor: withAlpha(colors.accentDanger, 0.3),
        opacity: entranceOpacity,
        transform: [{ scale: entranceScale }],
      }}
    >
      <View className="flex-row items-center mb-3">
        <Ionicons
          name="skull-outline"
          size={20}
          color={colors.accentDanger}
        />
        <Text className="text-sm font-semibold ml-2 uppercase tracking-wider" style={{ color: colors.accentDanger }}>
          Salvaciones de Muerte
        </Text>
      </View>

      {/* Successes */}
      <View className="flex-row items-center mb-3">
        <Text className="text-sm font-medium w-16" style={{ color: colors.accentGreen }}>
          Éxitos
        </Text>
        <View className="flex-row flex-1 justify-center">
          {DEATH_SAVE_INDICES.map((i) => (
            <Animated.View
              key={`s-${i}`}
              className="h-8 w-8 rounded-full mx-1 items-center justify-center border-2"
              style={{
                backgroundColor:
                  i < deathSaves.successes
                    ? colors.accentGreen
                    : "transparent",
                borderColor:
                  i < deathSaves.successes
                    ? colors.accentGreen
                    : colors.borderDefault,
                transform: [{ scale: successScales[i] }],
              }}
            >
              {i < deathSaves.successes && (
                <Ionicons name="checkmark" size={18} color="white" />
              )}
            </Animated.View>
          ))}
        </View>
        <TouchableOpacity
          className="rounded-lg px-3 py-2"
          style={{ backgroundColor: withAlpha(colors.accentGreen, 0.8) }}
          onPress={handleDeathSuccess}
        >
          <Text className="text-xs font-bold" style={{ color: '#fff' }}>
            +1
          </Text>
        </TouchableOpacity>
      </View>

      {/* Failures */}
      <View className="flex-row items-center mb-3">
        <Text className="text-sm font-medium w-16" style={{ color: colors.accentDanger }}>Fallos</Text>
        <View className="flex-row flex-1 justify-center">
          {DEATH_SAVE_INDICES.map((i) => (
            <Animated.View
              key={`f-${i}`}
              className="h-8 w-8 rounded-full mx-1 items-center justify-center border-2"
              style={{
                backgroundColor:
                  i < deathSaves.failures
                    ? colors.accentDanger
                    : "transparent",
                borderColor:
                  i < deathSaves.failures
                    ? colors.accentDanger
                    : colors.borderDefault,
                transform: [{ scale: failureScales[i] }],
              }}
            >
              {i < deathSaves.failures && (
                <Ionicons name="close" size={18} color="white" />
              )}
            </Animated.View>
          ))}
        </View>
        <TouchableOpacity
          className="rounded-lg px-3 py-2"
          style={{ backgroundColor: withAlpha(colors.accentDanger, 0.8) }}
          onPress={handleDeathFailure}
        >
          <Text className="text-xs font-bold" style={{ color: '#fff' }}>
            +1
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="rounded-lg py-2 items-center"
        style={{ backgroundColor: colors.bgCard }}
        onPress={() => {
          onShowConfirm(
            "Reiniciar Salvaciones",
            "¿Reiniciar las salvaciones de muerte?",
            resetDeathSaves,
            {
              confirmText: "Reiniciar",
              cancelText: "Cancelar",
              type: "warning",
            },
          );
        }}
      >
        <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
          Reiniciar
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
