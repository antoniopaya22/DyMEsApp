/**
 * useDialog - Hook for managing confirmation dialog state
 *
 * Provides a clean, imperative-style API for showing confirmation dialogs.
 *
 * Usage:
 *   const { dialog, dialogProps, showDialog, showAlert, showConfirm, showDestructive } = useDialog();
 *
 *   // In JSX:
 *   <ConfirmDialog {...dialogProps} />
 *
 *   // To trigger:
 *   showConfirm("Delete?", "Are you sure?", () => doDelete());
 */

import { useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import type { DialogType, DialogButton, ConfirmDialogProps } from "@/components/ui/ConfirmDialog";

// Re-export sibling hooks for backward compatibility
export { useToast } from "./useToast";
export { useWebTransition } from "./useWebTransition";

// ─── Dialog State ────────────────────────────────────────────────────

interface DialogState {
  visible: boolean;
  type: DialogType;
  title: string;
  message?: string;
  buttons: DialogButton[];
  icon?: string;
  iconColor?: string;
  dismissOnBackdrop?: boolean;
  showCloseButton?: boolean;
  customIconContent?: ReactNode;
}

const DEFAULT_DIALOG_STATE: DialogState = {
  visible: false,
  type: "confirm",
  title: "",
  message: undefined,
  buttons: [{ text: "OK", style: "default" }],
  icon: undefined,
  iconColor: undefined,
  dismissOnBackdrop: true,
  showCloseButton: false,
  customIconContent: undefined,
};

// ─── useDialog Hook ──────────────────────────────────────────────────

export function useDialog() {
  const [dialog, setDialog] = useState<DialogState>({ ...DEFAULT_DIALOG_STATE });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  /** Close the dialog */
  const closeDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false }));
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  /**
   * Show a fully custom dialog.
   * Returns a promise that resolves when the dialog is dismissed.
   */
  const showDialog = useCallback(
    (options: {
      type?: DialogType;
      title: string;
      message?: string;
      buttons?: DialogButton[];
      icon?: string;
      iconColor?: string;
      dismissOnBackdrop?: boolean;
      showCloseButton?: boolean;
      customIconContent?: ReactNode;
    }) => {
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;

        const buttons = options.buttons || [{ text: "OK", style: "default" as const }];

        // Wrap button onPress to also close dialog and resolve promise
        const wrappedButtons: DialogButton[] = buttons.map((btn) => ({
          ...btn,
          onPress: () => {
            setDialog((prev) => ({ ...prev, visible: false }));
            btn.onPress?.();
            resolve(btn.style !== "cancel");
            resolveRef.current = null;
          },
        }));

        setDialog({
          visible: true,
          type: options.type || "confirm",
          title: options.title,
          message: options.message,
          buttons: wrappedButtons,
          icon: options.icon,
          iconColor: options.iconColor,
          dismissOnBackdrop: options.dismissOnBackdrop ?? true,
          showCloseButton: options.showCloseButton ?? false,
          customIconContent: options.customIconContent,
        });
      });
    },
    []
  );

  /**
   * Show a simple alert with just an OK button.
   * Like Alert.alert(title, message, [{ text: "OK" }])
   */
  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      options?: {
        type?: DialogType;
        buttonText?: string;
        onDismiss?: () => void;
      }
    ) => {
      return showDialog({
        type: options?.type || "info",
        title,
        message,
        buttons: [
          {
            text: options?.buttonText || "OK",
            style: "default",
            onPress: options?.onDismiss,
          },
        ],
        dismissOnBackdrop: true,
      });
    },
    [showDialog]
  );

  /**
   * Show a confirmation dialog with Cancel and Confirm buttons.
   * Returns true if confirmed, false if cancelled.
   */
  const showConfirm = useCallback(
    (
      title: string,
      message?: string,
      onConfirm?: () => void,
      options?: {
        type?: DialogType;
        confirmText?: string;
        cancelText?: string;
        icon?: string;
      }
    ) => {
      return showDialog({
        type: options?.type || "confirm",
        title,
        message,
        icon: options?.icon,
        buttons: [
          { text: options?.cancelText || "Cancelar", style: "cancel" },
          {
            text: options?.confirmText || "Confirmar",
            style: "default",
            onPress: onConfirm,
          },
        ],
      });
    },
    [showDialog]
  );

  /**
   * Show a destructive confirmation dialog (e.g., delete actions).
   * Red-themed with danger icon.
   */
  const showDestructive = useCallback(
    (
      title: string,
      message?: string,
      onConfirm?: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
      }
    ) => {
      return showDialog({
        type: "danger",
        title,
        message,
        buttons: [
          { text: options?.cancelText || "Cancelar", style: "cancel" },
          {
            text: options?.confirmText || "Eliminar",
            style: "destructive",
            onPress: onConfirm,
          },
        ],
      });
    },
    [showDialog]
  );

  /**
   * Show a success dialog.
   */
  const showSuccess = useCallback(
    (title: string, message?: string, onDismiss?: () => void) => {
      return showDialog({
        type: "success",
        title,
        message,
        buttons: [
          {
            text: "OK",
            style: "default",
            onPress: onDismiss,
          },
        ],
      });
    },
    [showDialog]
  );

  /**
   * Show a warning dialog with optional confirm action.
   */
  const showWarning = useCallback(
    (
      title: string,
      message?: string,
      onConfirm?: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
      }
    ) => {
      return showDialog({
        type: "warning",
        title,
        message,
        buttons: [
          { text: options?.cancelText || "Cancelar", style: "cancel" },
          {
            text: options?.confirmText || "Continuar",
            style: "default",
            onPress: onConfirm,
          },
        ],
      });
    },
    [showDialog]
  );

  /**
   * Show an error dialog.
   */
  const showError = useCallback(
    (title: string, message?: string, onDismiss?: () => void) => {
      return showDialog({
        type: "error",
        title,
        message,
        buttons: [
          {
            text: "OK",
            style: "default",
            onPress: onDismiss,
          },
        ],
      });
    },
    [showDialog]
  );

  // Props to spread on ConfirmDialog component
  const dialogProps: ConfirmDialogProps = {
    visible: dialog.visible,
    type: dialog.type,
    title: dialog.title,
    message: dialog.message,
    buttons: dialog.buttons,
    onDismiss: closeDialog,
    icon: dialog.icon as any,
    iconColor: dialog.iconColor,
    dismissOnBackdrop: dialog.dismissOnBackdrop,
    showCloseButton: dialog.showCloseButton,
    customIconContent: dialog.customIconContent,
  };

  return {
    /** Current dialog state (for custom rendering if needed) */
    dialog,
    /** Props to spread on ConfirmDialog component */
    dialogProps,
    /** Show a fully custom dialog */
    showDialog,
    /** Show a simple OK alert */
    showAlert,
    /** Show a confirm/cancel dialog */
    showConfirm,
    /** Show a destructive (delete) dialog */
    showDestructive,
    /** Show a success dialog */
    showSuccess,
    /** Show a warning dialog with confirm */
    showWarning,
    /** Show an error dialog */
    showError,
    /** Close the dialog manually */
    closeDialog,
  };
}
