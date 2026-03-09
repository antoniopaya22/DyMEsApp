/**
 * HPTracker - Hit Points display and management
 *
 * Shows HP bar, damage/heal inputs, and temp HP controls.
 * Extracted from CombatTab.tsx
 */

import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { getHpColor, getHpLabel } from "@/utils/combat";

interface HPTrackerProps {
  onShowToast: (message: string) => void;
}

export function HPTracker({ onShowToast }: HPTrackerProps) {
  const { colors } = useTheme();
  const { character, takeDamage, heal, setTempHP } = useCharacterStore();

  const hp = character?.hp;
  const hpColor = hp ? getHpColor(hp.current, hp.max, colors) : colors.textMuted;
  const hpPct = hp && hp.max > 0 ? Math.min(100, (hp.current / hp.max) * 100) : 0;

  const [damageInput, setDamageInput] = useState("");
  const [healInput, setHealInput] = useState("");
  const [tempHpInput, setTempHpInput] = useState("");

  // Animated HP bar width
  const hpBarAnim = useRef(new Animated.Value(hpPct / 100)).current;
  // Flash overlay for damage/heal feedback
  const flashAnim = useRef(new Animated.Value(0)).current;
  const flashColorRef = useRef(colors.accentDanger);
  // Pulse for HP number on change
  const hpScaleAnim = useRef(new Animated.Value(1)).current;

  // Animate HP bar smoothly when percentage changes
  useEffect(() => {
    const anim = Animated.timing(hpBarAnim, {
      toValue: hpPct / 100,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width animation requires JS driver
    });
    anim.start();
    return () => anim.stop();
  }, [hpPct, hpBarAnim]);

  // Pulse the HP number when it changes
  useEffect(() => {
    if (!hp) return;
    const anim = Animated.sequence([
      Animated.spring(hpScaleAnim, {
        toValue: 1.15,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(hpScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [hp?.current, hpScaleAnim]);

  /** Flash the card border on damage or heal */
  const triggerFlash = (color: string) => {
    flashColorRef.current = color;
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  if (!character || !hp) return null;

  const handleDamage = async () => {
    const parsed = parseInt(damageInput, 10);
    const amount = damageInput.trim() === "" ? 1 : parsed;
    if (isNaN(amount) || amount <= 0) return;
    triggerFlash(colors.accentDanger);
    await takeDamage(amount);
    setDamageInput("");
  };

  const handleHeal = async () => {
    const parsed = parseInt(healInput, 10);
    const amount = healInput.trim() === "" ? 1 : parsed;
    if (isNaN(amount) || amount <= 0) return;
    triggerFlash(colors.accentGreen);
    await heal(amount);
    setHealInput("");
  };

  const handleSetTempHP = async () => {
    const amount = parseInt(tempHpInput, 10);
    if (isNaN(amount) || amount < 0) return;
    await setTempHP(amount);
    setTempHpInput("");
    onShowToast(`PG temp: ${amount}`);
  };

  const flashBorderColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderDefault, flashColorRef.current],
  });

  return (
    <Animated.View
      className="rounded-card border p-4 mb-4"
      style={{
        backgroundColor: colors.bgElevated,
        borderColor: flashBorderColor,
        borderWidth: 1,
      }}
    >
      <Text className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>
        Puntos de Golpe
      </Text>

      {/* HP Bar */}
      <View className="items-center mb-4">
        <View className="flex-row items-baseline mb-1">
          <Animated.Text
            className="text-5xl font-bold"
            style={{ color: hpColor, transform: [{ scale: hpScaleAnim }] }}
          >
            {hp.current}
          </Animated.Text>
          <Text className="text-xl font-semibold ml-1" style={{ color: colors.textMuted }}>
            / {hp.max}
          </Text>
        </View>

        {hp.temp > 0 && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="shield" size={14} color={colors.accentRed} />
            <Text className="text-sm font-semibold ml-1" style={{ color: colors.accentRed }}>
              +{hp.temp} temporales
            </Text>
          </View>
        )}

        <Text
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: hpColor }}
        >
          {getHpLabel(hp.current, hp.max)}
        </Text>

        {/* Progress bar */}
        <View className="w-full h-3 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: colors.bgSecondary }}>
          <Animated.View
            className="h-full rounded-full"
            style={{
              width: hpBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: hpColor,
            }}
          />
        </View>
      </View>

      {/* HP Controls */}
      <View className="flex-row mb-3">
        {/* Damage */}
        <View className="flex-1 mr-1.5">
          <View className="flex-row">
            <TextInput
              className="flex-1 rounded-l-lg px-3 py-2.5 text-sm border border-r-0"
              style={{ backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderDefault }}
              placeholder="Daño"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              defaultValue={damageInput}
              onChangeText={setDamageInput}
              onSubmitEditing={handleDamage}
              returnKeyType="done"
            />
            <TouchableOpacity
              className="rounded-r-lg px-3 items-center justify-center border"
              style={{ backgroundColor: withAlpha(colors.accentDanger, 0.8), borderColor: withAlpha(colors.accentDanger, 0.8) }}
              onPress={handleDamage}
            >
              <Ionicons name="remove" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Heal */}
        <View className="flex-1 ml-1.5">
          <View className="flex-row">
            <TextInput
              className="flex-1 rounded-l-lg px-3 py-2.5 text-sm border border-r-0"
              style={{ backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderDefault }}
              placeholder="Curar"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              defaultValue={healInput}
              onChangeText={setHealInput}
              onSubmitEditing={handleHeal}
              returnKeyType="done"
            />
            <TouchableOpacity
              className="rounded-r-lg px-3 items-center justify-center border"
              style={{ backgroundColor: withAlpha(colors.accentGreen, 0.8), borderColor: withAlpha(colors.accentGreen, 0.8) }}
              onPress={handleHeal}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Temp HP */}
      <View className="flex-row">
        <TextInput
          className="flex-1 rounded-l-lg px-3 py-2.5 text-sm border border-r-0"
          style={{ backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderDefault }}
          placeholder="PG Temporales"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          defaultValue={tempHpInput}
          onChangeText={setTempHpInput}
          onSubmitEditing={handleSetTempHP}
          returnKeyType="done"
        />
        <TouchableOpacity
          className="rounded-r-lg px-3 items-center justify-center border"
          style={{ backgroundColor: withAlpha(colors.accentRed, 0.8), borderColor: withAlpha(colors.accentRed, 0.8) }}
          onPress={handleSetTempHP}
        >
          <Ionicons name="shield" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
