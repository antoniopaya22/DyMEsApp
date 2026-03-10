/**
 * UI Components - Barrel Export
 *
 * Centralized exports for all reusable UI components.
 * Import from '@/components/ui' for clean imports.
 */

// ─── Animated Pressable & Button Variants ────────────────────────────
export { default as AnimatedPressable } from "./AnimatedPressable";
export { DndButton, IconButton } from "./AnimatedPressable";

// ─── D&D Logo ────────────────────────────────────────────────────────
export { default as DndLogo } from "./DndLogo";
export { InlineDndLogo, MinimalD20Logo } from "./DndLogo";

// ─── D20 SVG Icon ────────────────────────────────────────────────────
export { default as D20Icon } from "./D20Icon";
export { D20Badge, D20Watermark } from "./D20Icon";

// ─── Fantasy Decorations ─────────────────────────────────────────────
export {
  DragonDivider,
  SwordDivider,
  ShieldFrame,
  RunicBorder,
  ParchmentCard,
  TorchGlow,
  CastleHeader,
  ScrollBanner,
  MagicCircle,
  CornerOrnament,
  OrnateFrame,
  FloatingParticles,
  DndBackdrop,
} from "./decorations";

// ─── Glow Card & Variants ────────────────────────────────────────────
export { default as GlowCard } from "./GlowCard";
export { InfoCard, StatCard } from "./GlowCard";

// ─── Fade In Animations ──────────────────────────────────────────────
export { default as FadeInView } from "./FadeInView";
export { StaggeredList, ScaleFadeIn } from "./FadeInView";

// ─── Section Dividers ────────────────────────────────────────────────
export { default as SectionDivider } from "./SectionDivider";
export {
  SubtleDivider,
  OrnateDivider,
  SectionHeaderDivider,
} from "./SectionDivider";

// ─── Gradient Header & Variants ──────────────────────────────────────
export { default as GradientHeader } from "./GradientHeader";
export { CompactHeader, HeroHeader } from "./GradientHeader";

// ─── Confirm Dialog (replaces native Alert.alert) ────────────────────
export { default as ConfirmDialog } from "./ConfirmDialog";
export type {
  ConfirmDialogProps,
  DialogType,
  DialogButton,
} from "./ConfirmDialog";

// ─── Toast Notifications ─────────────────────────────────────────────
export { default as Toast } from "./Toast";
export type { ToastProps, ToastType } from "./Toast";

// ─── Web Transition Overlay ──────────────────────────────────────────
export { default as WebTransition } from "./WebTransition";
export type { WebTransitionProps } from "./WebTransition";

// ─── Search Bar ──────────────────────────────────────────────────────
export { default as SearchBar } from "./SearchBar";
export type { SearchBarProps } from "./SearchBar";

// ─── Screen Container (background gradient wrapper) ──────────────────
export { default as ScreenContainer } from "./ScreenContainer";
export type { ScreenContainerProps } from "./ScreenContainer";

// ─── Page Header (back button + label + title) ──────────────────────
export { default as PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";

// ─── App Header (shared header for main screens) ────────────────────
export { default as AppHeader } from "./AppHeader";
export type { AppHeaderProps } from "./AppHeader";

// ─── Collapsible Section / Card ──────────────────────────────────────
export { default as CollapsibleSection } from "./CollapsibleSection";
export { CollapsibleCard } from "./CollapsibleSection";
export type {
  CollapsibleSectionProps,
  CollapsibleCardProps,
} from "./CollapsibleSection";

// ─── Detail Badge (label + value) ───────────────────────────────────
export { default as DetailBadge } from "./DetailBadge";
export type { DetailBadgeProps } from "./DetailBadge";

// ─── Info Badge (icon + label pill) ──────────────────────────────────
export { default as InfoBadge } from "./InfoBadge";
export type { InfoBadgeProps } from "./InfoBadge";

// ─── Section Label (gradient-line header) ────────────────────────────
export { default as SectionLabel } from "./SectionLabel";
export type { SectionLabelProps } from "./SectionLabel";

// ─── Gradient Border (reusable horizontal gradient line) ─────────────
export { default as GradientBorder } from "./GradientBorder";
export type { GradientBorderProps } from "./GradientBorder";

// ─── Empty State ─────────────────────────────────────────────────────
export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

// ─── Badge / Chip / Tag ──────────────────────────────────────────────
export { default as Badge } from "./Badge";
export type { BadgeProps } from "./Badge";

// ─── Gradient Button (primary CTA) ──────────────────────────────────
export { default as GradientButton } from "./GradientButton";
export type { GradientButtonProps } from "./GradientButton";

// ─── Segmented Tabs (animated tab selector) ──────────────────────────
export { default as SegmentedTabs } from "./SegmentedTabs";
export type { SegmentedTabsProps, TabItem } from "./SegmentedTabs";

// ─── Scrollable Tab Bar (for 5+ tabs, horizontal scroll) ────────────
export { default as ScrollableTabBar } from "./ScrollableTabBar";
export type { ScrollableTabBarProps } from "./ScrollableTabBar";

// ─── Avatar Preview Modal (tap-to-enlarge character photo) ───────────
export { default as AvatarPreviewModal } from "./AvatarPreviewModal";
export type { AvatarPreviewModalProps } from "./AvatarPreviewModal";
