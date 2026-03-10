/**
 * useWebTransition - Hook for managing URL transition overlay state
 *
 * Provides a clean API for opening URLs with a visual transition effect.
 *
 * Usage:
 *   const { webTransitionProps, openUrl } = useWebTransition();
 *
 *   // In JSX:
 *   <WebTransition {...webTransitionProps} />
 *
 *   // To trigger:
 *   openUrl("https://example.com", { label: "Opening..." });
 */

import { useState, useCallback } from "react";
import { DARK_THEME } from "@/utils/theme";

// ─── Web Transition State ────────────────────────────────────────────

interface WebTransitionState {
  visible: boolean;
  url: string;
  label?: string;
  delay: number;
  accentColor: string;
  icon?: string;
}

const DEFAULT_WEB_TRANSITION_STATE: WebTransitionState = {
  visible: false,
  url: "",
  label: undefined,
  delay: 1200,
  accentColor: DARK_THEME.accentLightBlue,
  icon: undefined,
};

// ─── useWebTransition Hook ───────────────────────────────────────────

export function useWebTransition() {
  const [webTransition, setWebTransition] = useState<WebTransitionState>({
    ...DEFAULT_WEB_TRANSITION_STATE,
  });

  /** Close the transition overlay */
  const closeTransition = useCallback(() => {
    setWebTransition((prev) => ({ ...prev, visible: false }));
  }, []);

  /**
   * Open a URL with the transition overlay.
   */
  const openUrl = useCallback(
    (
      url: string,
      options?: {
        label?: string;
        delay?: number;
        accentColor?: string;
        icon?: string;
      },
    ) => {
      setWebTransition({
        visible: true,
        url,
        label: options?.label,
        delay: options?.delay ?? 1200,
        accentColor: options?.accentColor || DARK_THEME.accentLightBlue,
        icon: options?.icon,
      });
    },
    [],
  );

  // Props to spread on WebTransition component
  const webTransitionProps = {
    visible: webTransition.visible,
    url: webTransition.url,
    label: webTransition.label,
    delay: webTransition.delay,
    accentColor: webTransition.accentColor,
    icon: webTransition.icon as any,
    onDismiss: closeTransition,
  };

  return {
    /** Current web transition state */
    webTransition,
    /** Props to spread on WebTransition component */
    webTransitionProps,
    /** Open a URL with the transition overlay */
    openUrl,
    /** Close the transition overlay */
    closeTransition,
  };
}
