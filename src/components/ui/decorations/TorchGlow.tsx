import { useEffect, useRef, useMemo } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

interface TorchGlowProps {
  /** Glow color */
  color?: string;
  /** Position of the glow source */
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  /** Size of the glow radius */
  size?: number;
  /** Base opacity (0-1) */
  intensity?: number;
  /** Whether to animate the flicker */
  animated?: boolean;
  style?: ViewStyle;
}

export function TorchGlow({
  color = "#00E5FF",
  position = "top-right",
  size = 150,
  intensity = 0.08,
  animated = true,
  style,
}: TorchGlowProps) {
  const flickerAnim = useRef(new Animated.Value(intensity)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: intensity * 1.6,
          duration: 800 + Math.random() * 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: intensity * 0.6,
          duration: 600 + Math.random() * 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: intensity * 1.3,
          duration: 500 + Math.random() * 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: intensity,
          duration: 700 + Math.random() * 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.12,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    flicker.start();
    breathe.start();

    return () => {
      flicker.stop();
      breathe.stop();
    };
  }, [animated, intensity, flickerAnim, scaleAnim]);

  const positionStyle: ViewStyle = useMemo(() => {
    const base: ViewStyle = { position: "absolute" };
    switch (position) {
      case "top-left":
        return { ...base, top: -size * 0.4, left: -size * 0.4 };
      case "top-right":
        return { ...base, top: -size * 0.4, right: -size * 0.4 };
      case "bottom-left":
        return { ...base, bottom: -size * 0.4, left: -size * 0.4 };
      case "bottom-right":
        return { ...base, bottom: -size * 0.4, right: -size * 0.4 };
      case "center":
        return {
          ...base,
          top: "50%" as any,
          left: "50%" as any,
          marginTop: -size / 2,
          marginLeft: -size / 2,
        };
      default:
        return base;
    }
  }, [position, size]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        positionStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: flickerAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    />
  );
}
