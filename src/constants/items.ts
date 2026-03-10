/**
 * Item/inventory constants — category names, weapon/armor types, coins.
 * Extracted from types/item.ts for separation of concerns.
 */
import type {
  ItemCategory,
  WeaponType,
  WeaponProperty,
  ArmorType,
  ItemRarity,
  CoinType,
  Coins,
} from "@/types/item";

// ─── Categorías de objetos ───────────────────────────────────────────

export const ITEM_CATEGORY_NAMES: Record<ItemCategory, string> = {
  arma: "Arma",
  armadura: "Armadura",
  escudo: "Escudo",
  equipo_aventurero: "Equipo de aventurero",
  herramienta: "Herramienta",
  montura_vehiculo: "Montura / Vehículo",
  consumible: "Consumible",
  objeto_magico: "Objeto mágico",
  municion: "Munición",
  otro: "Otro",
};

export const ITEM_CATEGORY_ICONS: Record<ItemCategory, string> = {
  arma: "hammer",
  armadura: "shield-half",
  escudo: "shield",
  equipo_aventurero: "bag",
  herramienta: "construct",
  montura_vehiculo: "speedometer",
  consumible: "flask",
  objeto_magico: "sparkles",
  municion: "arrow-forward",
  otro: "cube",
};

// ─── Armas ───────────────────────────────────────────────────────────

export const WEAPON_TYPE_NAMES: Record<WeaponType, string> = {
  sencilla_cuerpo: "Arma sencilla cuerpo a cuerpo",
  sencilla_distancia: "Arma sencilla a distancia",
  marcial_cuerpo: "Arma marcial cuerpo a cuerpo",
  marcial_distancia: "Arma marcial a distancia",
};

export const WEAPON_PROPERTY_NAMES: Record<WeaponProperty, string> = {
  ligera: "Ligera",
  pesada: "Pesada",
  sutil: "Sutil",
  arrojadiza: "Arrojadiza",
  municion: "Munición",
  alcance: "Alcance",
  a_dos_manos: "A dos manos",
  versatil: "Versátil",
  recarga: "Recarga",
  especial: "Especial",
};

// ─── Armaduras ───────────────────────────────────────────────────────

export const ARMOR_TYPE_NAMES: Record<ArmorType, string> = {
  ligera: "Armadura ligera",
  intermedia: "Armadura intermedia",
  pesada: "Armadura pesada",
  escudo: "Escudo",
};

// ─── Rareza ──────────────────────────────────────────────────────────

export const ITEM_RARITY_NAMES: Record<ItemRarity, string> = {
  comun: "Común",
  poco_comun: "Poco común",
  raro: "Raro",
  muy_raro: "Muy raro",
  legendario: "Legendario",
  artefacto: "Artefacto",
};

/**
 * Static rarity colors — dark-mode optimized (Tailwind 500 shades).
 * These are domain-specific category colors, not theme tokens.
 * They may need a light-mode variant if contrast becomes an issue.
 */
export const ITEM_RARITY_COLORS: Record<ItemRarity, string> = {
  comun: "#9ca3af",
  poco_comun: "#22c55e",
  raro: "#3b82f6",
  muy_raro: "#a855f7",
  legendario: "#f59e0b",
  artefacto: "#ef4444",
};

// ─── Monedas ─────────────────────────────────────────────────────────

export const COIN_NAMES: Record<CoinType, string> = {
  mc: "Monedas de cobre",
  mp: "Monedas de plata",
  me: "Monedas de electro",
  mo: "Monedas de oro",
  mpl: "Monedas de platino",
};

export const COIN_ABBR: Record<CoinType, string> = {
  mc: "MC",
  mp: "MP",
  me: "ME",
  mo: "MO",
  mpl: "MPl",
};

export const COIN_ICONS: Record<CoinType, string> = {
  mc: "🟤",
  mp: "⚪",
  me: "🔵",
  mo: "🟡",
  mpl: "⚜️",
};

export const COIN_TO_GOLD_RATE: Record<CoinType, number> = {
  mc: 0.01,
  mp: 0.1,
  me: 0.5,
  mo: 1,
  mpl: 10,
};

export const DEFAULT_COINS: Coins = {
  mc: 0,
  mp: 0,
  me: 0,
  mo: 0,
  mpl: 0,
};

// ─── Pack de equipo ──────────────────────────────────────────────────

export const EQUIPMENT_PACK_IDS = [
  "pack_explorador_mazmorras",
  "pack_diplomatico",
  "pack_entretenedor",
  "pack_explorador",
  "pack_sacerdote",
  "pack_estudioso",
  "pack_ladron",
] as const;
