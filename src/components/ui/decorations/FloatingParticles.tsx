import { useEffect, useRef, useMemo } from "react";
import { View, Animated, Easing, StyleSheet, ViewStyle } from "react-native";

interface FloatingParticlesProps {
  /** Number of particles */
  count?: number;
  /** Particle color */
  color?: string;
  /** Container area width */
  width?: number;
  /** Container area height */
  height?: number;
  /** Max particle size */
  maxSize?: number;
  /** Base opacity of particles */
  opacity?: number;
  style?: ViewStyle;
}

interface Particle {
  id: number;
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function FloatingParticles({
  count = 12,
  color = "#00E5FF",
  width = 300,
  height = 400,
  maxSize = 4,
  opacity: baseOpacity = 0.4,
  style,
}: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      startY: height * 0.3 + Math.random() * height * 0.7,
      size: 1 + Math.random() * (maxSize - 1),
      duration: 4000 + Math.random() * 6000,
      delay: Math.random() * 3000,
      opacity: (0.2 + Math.random() * 0.8) * baseOpacity,
    }));
  }, [count, width, height, maxSize, baseOpacity]);

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { width, height }, style]}
    >
      {particles.map((p) => (
        <SingleParticle key={p.id} particle={p} color={color} height={height} />
      ))}
    </View>
  );
}

function SingleParticle({
  particle,
  color,
  height,
}: {
  particle: Particle;
  color: string;
  height: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -(particle.startY + 40),
          duration: particle.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: particle.opacity,
            duration: particle.duration * 0.2,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: particle.opacity,
            duration: particle.duration * 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: particle.duration * 0.3,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: particle.duration * 0.3,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.3,
            duration: particle.duration * 0.7,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Loop
        animate();
      });
    };

    const timeout = setTimeout(animate, particle.delay);
    return () => clearTimeout(timeout);
  }, [particle, translateY, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.startY,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
  },
  particle: {
    position: "absolute",
  },
});
