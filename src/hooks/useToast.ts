/**
 * useToast - Hook for managing toast notification state
 *
 * Provides a clean, imperative-style API for showing toast notifications.
 *
 * Usage:
 *   const { toast, toastProps, showToast, showSuccess, showError } = useToast();
 *
 *   // In JSX:
 *   <Toast {...toastProps} />
 *
 *   // To trigger:
 *   showSuccess("Done!");
 */

import { useState, useCallback, useRef } from "react";
import type { ToastType, ToastProps } from "@/components/ui/Toast";

// ─── Toast State ─────────────────────────────────────────────────────

interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
  subtitle?: string;
  duration: number;
  icon?: string;
  position: "top" | "bottom";
}

const DEFAULT_TOAST_STATE: ToastState = {
  visible: false,
  type: "info",
  message: "",
  subtitle: undefined,
  duration: 3000,
  icon: undefined,
  position: "top",
};

// ─── useToast Hook ───────────────────────────────────────────────────

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ ...DEFAULT_TOAST_STATE });
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Dismiss the current toast */
  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  /**
   * Show a fully custom toast notification.
   */
  const showToast = useCallback(
    (options: {
      type?: ToastType;
      message: string;
      subtitle?: string;
      duration?: number;
      icon?: string;
      position?: "top" | "bottom";
    }) => {
      // If there's already a toast visible, hide it first
      setToast((prev) => {
        if (prev.visible) {
          return { ...prev, visible: false };
        }
        return prev;
      });

      // Clear any pending timer from a previous showToast call
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }

      // Small delay so the previous toast can animate out
      pendingTimerRef.current = setTimeout(() => {
        pendingTimerRef.current = null;
        setToast({
          visible: true,
          type: options.type || "info",
          message: options.message,
          subtitle: options.subtitle,
          duration: options.duration ?? 3000,
          icon: options.icon,
          position: options.position || "top",
        });
      }, 50);
    },
    []
  );

  /** Show a success toast */
  const showSuccess = useCallback(
    (message: string, subtitle?: string) => {
      showToast({ type: "success", message, subtitle });
    },
    [showToast]
  );

  /** Show an error toast */
  const showError = useCallback(
    (message: string, subtitle?: string) => {
      showToast({ type: "error", message, subtitle, duration: 4000 });
    },
    [showToast]
  );

  /** Show a warning toast */
  const showWarning = useCallback(
    (message: string, subtitle?: string) => {
      showToast({ type: "warning", message, subtitle });
    },
    [showToast]
  );

  /** Show an info toast */
  const showInfo = useCallback(
    (message: string, subtitle?: string) => {
      showToast({ type: "info", message, subtitle });
    },
    [showToast]
  );

  // Props to spread on Toast component
  const toastProps: ToastProps = {
    visible: toast.visible,
    type: toast.type,
    message: toast.message,
    subtitle: toast.subtitle,
    duration: toast.duration,
    onDismiss: dismissToast,
    icon: toast.icon as any,
    position: toast.position,
  };

  return {
    /** Current toast state */
    toast,
    /** Props to spread on Toast component */
    toastProps,
    /** Show a fully custom toast */
    showToast,
    /** Show a success toast */
    showSuccess,
    /** Show an error toast */
    showError,
    /** Show a warning toast */
    showWarning,
    /** Show an info toast */
    showInfo,
    /** Dismiss the current toast */
    dismissToast,
  };
}
