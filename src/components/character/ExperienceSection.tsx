/**
 * ExperienceSection - Sección de gestión de experiencia y subida de nivel.
 * Muestra: XP actual, barra de progreso al siguiente nivel,
 * botones para añadir/quitar XP, y botón de subir de nivel.
 */

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCharacterStore } from "@/stores/characterStore";
import {
  MAX_LEVEL,
  getXPProgress,
  getXPForNextLevel,
  canLevelUp as canLevelUpCheck,
  formatXP,
} from "@/data/srd/leveling";
import { useTheme, usePulseAnimation } from "@/hooks";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Preset XP amounts for quick add/remove
const XP_PRESETS = [25, 50, 100, 250, 500, 1000];

interface ExperienceSectionProps {
  onLevelUp: () => void;
}

export default function ExperienceSection({
  onLevelUp,
}: ExperienceSectionProps) {
  const { isDark, colors } = useTheme();
  const { character, addExperience, removeExperience, setExperience } =
    useCharacterStore();

  const [showXPInput, setShowXPInput] = useState(false);
  const [xpAmount, setXpAmount] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { scale: pulseAnim, glowOpacity: glowAnim } = usePulseAnimation({
    active: canLevelUpCheck(character?.experiencia ?? 0, character?.nivel ?? 1),
    glow: true,
    glowDuration: 3000,
  });

  if (!character) return null;

  const currentXP = character.experiencia;
  const currentLevel = character.nivel;
  const isMaxLevel = currentLevel >= MAX_LEVEL;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const progress = getXPProgress(currentXP, currentLevel);
  const canLevel = canLevelUpCheck(currentXP, currentLevel);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress * 100,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);


  const handleAddXP = async (amount: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await addExperience(amount);
  };

  const handleRemoveXP = async (amount: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await removeExperience(amount);
  };

  const handleCustomXP = async () => {
    const amount = parseInt(xpAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isRemoving) {
      await removeExperience(amount);
    } else {
      await addExperience(amount);
    }
    setXpAmount("");
    setShowXPInput(false);
  };

  const toggleXPInput = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowXPInput(!showXPInput);
    setShowPresets(false);
    setXpAmount("");
  };

  const togglePresets = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPresets(!showPresets);
    setShowXPInput(false);
  };

  return (
    <View
      style={{
        backgroundColor: colors.bgElevated,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: canLevel
          ? `${colors.accentGold}66`
          : colors.borderDefault,
        padding: 12,
        marginBottom: 16,
      }}
    >
      {/* ── Compact header: icon + XP info + progress + action buttons ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Star icon */}
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: colors.accentGoldGlow,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="star" size={15} color={colors.accentGold} />
        </View>

        {/* XP info + progress bar */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text
              style={{
                color: colors.accentGold,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              {formatXP(currentXP)} XP
            </Text>
            {!isMaxLevel && nextLevelXP ? (
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: "500",
                }}
              >
                / {formatXP(nextLevelXP)}
              </Text>
            ) : null}
            {isMaxLevel && (
              <Text
                style={{
                  color: colors.accentGold,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                (Máximo)
              </Text>
            )}
          </View>

          {/* Thin progress bar */}
          {!isMaxLevel && (
            <View
              style={{
                height: 4,
                backgroundColor: colors.borderSeparator,
                borderRadius: 2,
                overflow: "hidden",
                marginTop: 4,
              }}
            >
              <Animated.View
                style={{
                  height: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              >
                <LinearGradient
                  colors={
                    canLevel
                      ? [colors.accentAmber, colors.accentGold]
                      : [colors.accentGold, colors.accentGold]
                  }
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>
          )}
        </View>

        {/* Quick action buttons */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={togglePresets}
            activeOpacity={0.7}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: showPresets
                ? `${colors.accentGold}40`
                : colors.borderSeparator,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: showPresets
                ? `${colors.accentGold}66`
                : colors.borderSubtle,
            }}
          >
            <Ionicons
              name="flash-outline"
              size={14}
              color={showPresets ? colors.accentGold : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleXPInput}
            activeOpacity={0.7}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: showXPInput
                ? `${colors.accentGreen}40`
                : colors.borderSeparator,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: showXPInput
                ? `${colors.accentGreen}66`
                : colors.borderSubtle,
            }}
          >
            <Ionicons
              name={showXPInput ? "close" : "create-outline"}
              size={14}
              color={showXPInput ? colors.accentGreen : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Expandable: Preset XP buttons ── */}
      {showPresets && (
        <View style={{ marginTop: 10 }}>
          {/* Mode toggle */}
          <View style={{ flexDirection: "row", marginBottom: 8, gap: 6 }}>
            <TouchableOpacity
              onPress={() => setIsRemoving(false)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: !isRemoving
                  ? `${colors.accentGreen}30`
                  : colors.borderSeparator,
                borderWidth: 1,
                borderColor: !isRemoving
                  ? `${colors.accentGreen}66`
                  : colors.borderSubtle,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={13}
                color={!isRemoving ? colors.accentGreen : colors.textMuted}
              />
              <Text
                style={{
                  color: !isRemoving ? colors.accentGreen : colors.textMuted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Añadir
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsRemoving(true)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isRemoving
                  ? `${colors.accentDanger}30`
                  : colors.borderSeparator,
                borderWidth: 1,
                borderColor: isRemoving
                  ? `${colors.accentDanger}66`
                  : colors.borderSubtle,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Ionicons
                name="remove-circle-outline"
                size={13}
                color={isRemoving ? colors.accentDanger : colors.textMuted}
              />
              <Text
                style={{
                  color: isRemoving ? colors.accentDanger : colors.textMuted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Quitar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preset grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {XP_PRESETS.map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() =>
                  isRemoving ? handleRemoveXP(amount) : handleAddXP(amount)
                }
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: isRemoving
                    ? `${colors.accentDanger}18`
                    : `${colors.accentGreen}18`,
                  borderWidth: 1,
                  borderColor: isRemoving
                    ? `${colors.accentDanger}40`
                    : `${colors.accentGreen}40`,
                }}
              >
                <Text
                  style={{
                    color: isRemoving
                      ? colors.accentDanger
                      : colors.accentGreen,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {isRemoving ? "−" : "+"}
                  {formatXP(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── Expandable: Custom XP input ── */}
      {showXPInput && (
        <View style={{ marginTop: 10 }}>
          {/* Mode toggle */}
          <View style={{ flexDirection: "row", marginBottom: 8, gap: 6 }}>
            <TouchableOpacity
              onPress={() => setIsRemoving(false)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: !isRemoving
                  ? `${colors.accentGreen}30`
                  : colors.borderSeparator,
                borderWidth: 1,
                borderColor: !isRemoving
                  ? `${colors.accentGreen}66`
                  : colors.borderSubtle,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: !isRemoving ? colors.accentGreen : colors.textMuted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Añadir XP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsRemoving(true)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isRemoving
                  ? `${colors.accentDanger}30`
                  : colors.borderSeparator,
                borderWidth: 1,
                borderColor: isRemoving
                  ? `${colors.accentDanger}66`
                  : colors.borderSubtle,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: isRemoving ? colors.accentDanger : colors.textMuted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Quitar XP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input row */}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.borderSeparator,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isRemoving
                  ? `${colors.accentDanger}50`
                  : `${colors.accentGreen}50`,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color: isRemoving ? colors.accentDanger : colors.accentGreen,
                  fontSize: 15,
                  fontWeight: "700",
                  marginRight: 4,
                }}
              >
                {isRemoving ? "−" : "+"}
              </Text>
              <TextInput
                value={xpAmount}
                onChangeText={(text) =>
                  setXpAmount(text.replace(/[^0-9]/g, ""))
                }
                placeholder="Cantidad de XP"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={handleCustomXP}
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontWeight: "600",
                  paddingVertical: 8,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={handleCustomXP}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={
                  isRemoving
                    ? [colors.accentDanger, colors.accentDanger]
                    : [colors.accentGreen, colors.accentGreen]
                }
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={colors.textInverted}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Level Up Button (primary outlined) ── */}
      {canLevel && !isMaxLevel && (
        <Animated.View
          style={{
            marginTop: 10,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <TouchableOpacity
            onPress={onLevelUp}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: colors.accentGold,
              backgroundColor: "transparent",
              gap: 8,
            }}
          >
            <Ionicons
              name="arrow-up-circle"
              size={20}
              color={colors.accentGold}
            />
            <Text
              style={{
                color: colors.accentGold,
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              ¡Subir a Nivel {currentLevel + 1}!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Milestone level up (subtle, always visible when not max and no XP requirement met) */}
      {!canLevel && !isMaxLevel && (
        <TouchableOpacity
          onPress={onLevelUp}
          activeOpacity={0.7}
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.accentGold,
            backgroundColor: "transparent",
            gap: 8,
          }}
        >
          <Ionicons
            name="arrow-up-circle-outline"
            size={20}
            color={colors.accentGold}
          />
          <Text
            style={{
              color: colors.accentGold,
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            Subir de nivel (hito)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
