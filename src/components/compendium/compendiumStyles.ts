/**
 * Shared styles for Compendium card components
 *
 * Slimmed down — card container/border/shadow styles are now handled by GlowCard.
 * These styles cover the inner content layout shared across all card types.
 */

import { StyleSheet } from "react-native";

export const cardStyles = StyleSheet.create({
  // ── Card header (icon + info + chevron row) ──
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // ── Card Detail (expanded) ──
  cardDetail: {
    paddingTop: 14,
    marginTop: 14,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  detailSection: {
    marginTop: 14,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Traits ──
  traitItem: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  traitName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  traitDesc: {
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Subrace ──
  subraceBlock: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  subraceName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subraceDetail: {
    fontSize: 12,
    marginBottom: 4,
  },

  // ── Tags & Badges ──
  skillTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  moreText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },

  // ── Background extras ──
  equipItem: {
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 4,
  },
  personalityItem: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
});
