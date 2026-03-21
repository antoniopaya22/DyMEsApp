/**
 * useModalAnimation - Reusable hook for modal entrance/dismiss animations
 *
 * Provides three animated values (backdrop opacity, card scale, card fade)
 * and a dismiss function that plays the reverse animation before calling
 * onDismiss. Suitable for centered modals with backdrop + scale/fade pattern.
 */

import { useRef, useEffect, useCallback } from "react";
import { Animated, Easing } from "react-native";

export interface ModalAnimationOptions {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called after dismiss animation completes */
  onDismiss?: () => void;
  /** Initial scale before entrance (default: 0.75) */
  initialScale?: number;
  /** Scale on dismiss (default: 0.85) */
  dismissScale?: number;
  /** Entrance duration in ms (default: 250) */
  entranceDuration?: number;
  /** Dismiss duration in ms (default: 180) */
  dismissDuration?: number;
  /** Whether to use spring for scale entrance (default: true) */
  useSpring?: boolean;
  /** Spring friction (default: 8) */
  springFriction?: number;
  /** Spring tension (default: 100) */
  springTension?: number;
}

export function useModalAnimation(options: ModalAnimationOptions) {
  const {
    visible,
    onDismiss,
    initialScale = 0.75,
    dismissScale = 0.85,
    entranceDuration = 250,
    dismissDuration = 180,
    useSpring = true,
    springFriction = 8,
    springTension = 100,
  } = options;

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset
      backdropAnim.setValue(0);
      scaleAnim.setValue(initialScale);
      fadeAnim.setValue(0);

      // Entrance
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: entranceDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        useSpring
          ? Animated.spring(scaleAnim, {
              toValue: 1,
              friction: springFriction,
              tension: springTension,
              useNativeDriver: true,
            })
          : Animated.timing(scaleAnim, {
              toValue: 1,
              duration: entranceDuration + 50,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: entranceDuration - 50,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDismissingRef = useRef(false);

  const dismiss = useCallback(
    (callback?: () => void) => {
      if (isDismissingRef.current) return;
      isDismissingRef.current = true;

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: dismissDuration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: dismissDuration - 30,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: dismissScale,
          duration: dismissDuration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        isDismissingRef.current = false;
        (callback ?? onDismiss)?.();
      });
    },
    [
      backdropAnim,
      fadeAnim,
      scaleAnim,
      dismissScale,
      dismissDuration,
      onDismiss,
    ],
  );

  return {
    /** Animated backdrop opacity (0→1) */
    backdropAnim,
    /** Animated card scale */
    scaleAnim,
    /** Animated card opacity (0→1) */
    fadeAnim,
    /** Play dismiss animation, then call callback or onDismiss */
    dismiss,
  };
}
