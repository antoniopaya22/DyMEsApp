/**
 * useEntranceAnimation - Reusable hook for fade + slide entrance animations
 *
 * Replaces the boilerplate pattern of creating Animated.Value refs + useEffect
 * that was duplicated across 6+ screens.
 *
 * Usage:
 *   const { opacity, containerStyle } = useEntranceAnimation();
 *   const { opacity, translateY, containerStyle } = useEntranceAnimation({ slide: true });
 *   const { containerStyle } = useEntranceAnimation({ delay: index * 80, slide: true });
 *
 *   <Animated.View style={[styles.container, containerStyle]}>
 */

import { useRef, useEffect } from "react";
import { Animated, Easing, type EasingFunction } from "react-native";

interface EntranceAnimationOptions {
  /** Delay before animation starts (ms). Default: 0 */
  delay?: number;
  /** Fade duration (ms). Default: 400 */
  duration?: number;
  /** Enable translateY slide-up. Default: false */
  slide?: boolean;
  /** Slide distance in px (only when slide=true). Default: 20 */
  distance?: number;
  /** Slide duration (ms). If not set, uses duration + 50 */
  slideDuration?: number;
  /** Custom easing. Default: Easing.out(Easing.cubic) */
  easing?: EasingFunction;
  /** Whether to use native driver. Default: true */
  useNativeDriver?: boolean;
  /** Set to false to disable auto-start. Default: true */
  active?: boolean;
}

export function useEntranceAnimation(options: EntranceAnimationOptions = {}) {
  const {
    delay = 0,
    duration = 400,
    slide = false,
    distance = 20,
    slideDuration,
    easing = Easing.out(Easing.cubic),
    useNativeDriver = true,
    active = true,
  } = options;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slide ? distance : 0)).current;

  useEffect(() => {
    if (!active) {
      // Not animating → make immediately visible
      opacity.setValue(1);
      if (slide) translateY.setValue(0);
      return;
    }

    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
      }),
    ];

    if (slide) {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration: slideDuration ?? duration + 50,
          delay,
          easing,
          useNativeDriver,
        })
      );
    }

    Animated.parallel(animations).start();
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const containerStyle = slide
    ? { opacity, transform: [{ translateY }] }
    : { opacity };

  return {
    /** Animated opacity value (0 → 1) */
    opacity,
    /** Animated translateY value (distance → 0). Only active when slide=true */
    translateY,
    /** Ready-to-spread style object: { opacity } or { opacity, transform: [{ translateY }] } */
    containerStyle,
  };
}
