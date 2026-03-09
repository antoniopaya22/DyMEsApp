import { useEffect, useRef, useMemo } from "react";
import { View, Animated, Easing, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Line,
  Text as SvgText,
} from "react-native-svg";

interface MagicCircleProps {
  /** Size of the circle */
  size?: number;
  /** Primary color */
  color?: string;
  /** Whether rings rotate */
  animated?: boolean;
  /** Overall opacity */
  opacity?: number;
  /** Number of rune symbols on the outer ring */
  runeCount?: number;
  style?: ViewStyle;
}

const RUNE_CHARS = ["ᚠ", "ᚡ", "ᚢ", "ᚣ", "ᚤ", "ᚥ", "ᚦ", "ᚧ", "ᚨ", "ᚩ", "ᚪ", "ᚫ"];

export function MagicCircle({
  size = 200,
  color = "#00E5FF",
  animated = true,
  opacity: baseOpacity = 0.15,
  runeCount = 8,
  style,
}: MagicCircleProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const reverseRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!animated) return;

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const reverseRotate = Animated.loop(
      Animated.timing(reverseRotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    rotate.start();
    reverseRotate.start();
    pulse.start();

    return () => {
      rotate.stop();
      reverseRotate.stop();
      pulse.stop();
    };
  }, [animated, rotateAnim, reverseRotateAnim, pulseAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const reverseRotateInterpolate = reverseRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const cx = 100;
  const cy = 100;

  // Generate rune positions around the outer ring
  const runes = useMemo(() => {
    const result = [];
    for (let i = 0; i < runeCount; i++) {
      const angle = (Math.PI * 2 * i) / runeCount - Math.PI / 2;
      const r = 85;
      result.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        char: RUNE_CHARS[i % RUNE_CHARS.length],
      });
    }
    return result;
  }, [runeCount]);

  // Generate pentagram points
  const pentagramPath = useMemo(() => {
    const r = 55;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      points.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }
    // Connect every other point to form a star
    const order = [0, 2, 4, 1, 3, 0];
    return (
      order
        .map(
          (idx, i) =>
            `${i === 0 ? "M" : "L"} ${points[idx].x.toFixed(1)},${points[idx].y.toFixed(1)}`,
        )
        .join(" ") + " Z"
    );
  }, []);

  const innerCircleSvg = (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <RadialGradient id="mcGlow" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor={color} stopOpacity="0.2" />
          <Stop offset="0.7" stopColor={color} stopOpacity="0.05" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background glow */}
      <Circle cx={cx} cy={cy} r={98} fill="url(#mcGlow)" />

      {/* Outer ring */}
      <Circle
        cx={cx} cy={cy} r={92}
        fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.6}
      />
      <Circle
        cx={cx} cy={cy} r={88}
        fill="none" stroke={color} strokeWidth={0.5} strokeOpacity={0.3}
      />

      {/* Rune characters around the outer ring */}
      {runes.map((rune, i) => (
        <SvgText
          key={i}
          x={rune.x} y={rune.y + 4}
          textAnchor="middle" fontSize={10}
          fill={color} opacity={0.7}
        >
          {rune.char}
        </SvgText>
      ))}

      {/* Middle ring */}
      <Circle
        cx={cx} cy={cy} r={70}
        fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.4}
      />

      {/* Inner ring */}
      <Circle
        cx={cx} cy={cy} r={38}
        fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.5}
      />

      {/* Pentagram / star */}
      <Path
        d={pentagramPath}
        fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.35}
      />

      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={3} fill={color} opacity={0.5} />
      <Circle cx={cx} cy={cy} r={1.5} fill="#ffffff" opacity={0.2} />

      {/* Cardinal direction marks on middle ring */}
      {[0, 90, 180, 270].map((deg, i) => {
        const angle = (deg * Math.PI) / 180;
        const r1 = 67;
        const r2 = 73;
        return (
          <Line
            key={`cardinal-${i}`}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke={color} strokeWidth={1.5} strokeOpacity={0.5}
          />
        );
      })}
    </Svg>
  );

  if (animated) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.container,
          {
            width: size,
            height: size,
            opacity: pulseAnim.interpolate({
              inputRange: [0.7, 1],
              outputRange: [baseOpacity * 0.7, baseOpacity],
            }),
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        >
          {innerCircleSvg}
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { width: size, height: size, opacity: baseOpacity },
        style,
      ]}
    >
      {innerCircleSvg}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: "100%",
    height: "100%",
  },
});
