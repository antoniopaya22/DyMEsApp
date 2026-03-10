/**
 * Hooks barrel export
 *
 * Import hooks from here for a clean API:
 *   import { useDialog, useToast, useTheme } from "@/hooks";
 */

export { useDialog } from "./useDialog";
export { useToast } from "./useToast";
export { useWebTransition } from "./useWebTransition";
export { useTheme } from "./useTheme";
export { useEntranceAnimation } from "./useEntranceAnimation";
export { usePulseAnimation } from "./usePulseAnimation";
export { useRealtimeCharacters } from "./useRealtimeCharacters";
export { useCharacterSync } from "./useCharacterSync";
export { useScrollToTop } from "./useScrollToTop";
export { useModalAnimation } from "./useModalAnimation";
export type { ModalAnimationOptions } from "./useModalAnimation";
export { useHeaderScroll, HeaderScrollProvider } from "./useHeaderScroll";
export { useCreationNavigation } from "./useCreationNavigation";
export type { WizardStep } from "./useCreationNavigation";
