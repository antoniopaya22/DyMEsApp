/**
 * DiceFAB - Floating Action Button for the Dice Roller (HU-11.1)
 *
 * A persistent floating button visible on main screens (character sheet,
 * inventory, spells, combat) that opens the DiceRoller bottom sheet.
 */

import { useState, useRef, useEffect } from "react";
import {
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import DiceRoller from "./DiceRoller";

// ─── Props ───────────────────────────────────────────────────────────

interface DiceFABProps {
  /** Character name to display in the roller header */
  characterName?: string;
  /** Optional preset label for the roll (e.g. "Percepción") */
  presetLabel?: string;
  /** Optional preset formula (e.g. "1d20+5") */
  presetFormula?: string;
  /** Optional preset modifier */
  presetModifier?: number;
  /** Position from the bottom edge (default: 90) */
  bottom?: number;
  /** Position from the right edge (default: 20) */
  right?: number;
  /** Size of the FAB (default: 56) */
  size?: number;
  /** If true, the FAB won't be rendered */
  hidden?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export default function DiceFAB({
  characterName,
  presetLabel,
  presetFormula,
  presetModifier,
  bottom = 90,
  right = 20,
  size = 56,
  hidden = false,
}: DiceFABProps) {
  const { colors } = useTheme();
  const [showRoller, setShowRoller] = useState(false);

  // Entrance animation
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = hidden
      ? Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      : Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        });
    anim.start();
    return () => anim.stop();
  }, [hidden, scaleAnim]);

  // Subtle idle animation - gentle rotation/pulse
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [rotateAnim]);

  const handlePress = () => {
    // Quick press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setShowRoller(true);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "15deg"],
  });

  if (hidden) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            bottom,
            right,
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: colors.accentRed,
            transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.accentRed,
            },
          ]}
        >
          <Ionicons
            name="dice"
            size={size * 0.46}
            color={colors.textInverted}
          />
        </TouchableOpacity>
      </Animated.View>

      <DiceRoller
        visible={showRoller}
        onClose={() => setShowRoller(false)}
        characterName={characterName}
        presetLabel={presetLabel}
        presetFormula={presetFormula}
        presetModifier={presetModifier}
      />
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 999,
    elevation: 8,
    // Shadow for iOS — shadowColor overridden inline via colors.accentRed
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    // Extra shadow for Android
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
});
