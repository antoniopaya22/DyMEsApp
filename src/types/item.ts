/**
 * Tipos para el sistema de inventario y equipamiento de D&D 5e en español (HU-07)
 */

import type { AbilityKey, DamageType } from "./character";
import { EQUIPMENT_PACK_IDS } from "@/constants/items";

// Re-export constants (moved to @/constants/items)
export {
  ITEM_CATEGORY_NAMES,
  ITEM_CATEGORY_ICONS,
  WEAPON_TYPE_NAMES,
  WEAPON_PROPERTY_NAMES,
  ARMOR_TYPE_NAMES,
  ITEM_RARITY_NAMES,
  ITEM_RARITY_COLORS,
  COIN_NAMES,
  COIN_ABBR,
  COIN_ICONS,
  COIN_TO_GOLD_RATE,
  DEFAULT_COINS,
  EQUIPMENT_PACK_IDS,
} from "@/constants/items";

// Re-export utility functions (moved to @/utils/inventory)
export {
  calcTotalWeight,
  calcCoinWeight,
  calcInventoryWeight,
  calcCarryingCapacity,
  isEncumbered,
  calcEncumbrancePercentage,
  calcDetailedEncumbrance,
  calcTotalGoldValue,
  countActiveAttunements,
  canAttune,
  getEquippedItems,
  getEquippedWeapons,
  getEquippedArmor,
  getEquippedShield,
  calcArmorClass,
  calcWeaponAttackBonus,
  calcWeaponDamageModifier,
  formatWeaponDamage,
  createDefaultInventory,
  createEmptyItem,
  buildStartingInventory,
} from "@/utils/inventory";

export type { EncumbranceTier, DetailedEncumbrance } from "@/utils/inventory";

// ─── Categorías de objetos ───────────────────────────────────────────

export type ItemCategory =
  | "arma"
  | "armadura"
  | "escudo"
  | "equipo_aventurero"
  | "herramienta"
  | "montura_vehiculo"
  | "consumible"
  | "objeto_magico"
  | "municion"
  | "otro";

// ─── Armas ───────────────────────────────────────────────────────────

export type WeaponType =
  | "sencilla_cuerpo"
  | "sencilla_distancia"
  | "marcial_cuerpo"
  | "marcial_distancia";

export type WeaponProperty =
  | "ligera"
  | "pesada"
  | "sutil"
  | "arrojadiza"
  | "municion"
  | "alcance"
  | "a_dos_manos"
  | "versatil"
  | "recarga"
  | "especial";

export interface WeaponRange {
  /** Alcance normal en pies */
  normal: number;
  /** Alcance largo en pies */
  long: number;
}

export interface WeaponDamage {
  /** Dado(s) de daño, ej: "1d8", "2d6" */
  dice: string;
  /** Tipo de daño */
  damageType: DamageType;
}

export interface WeaponDetails {
  /** Tipo de arma */
  weaponType: WeaponType;
  /** Daño base */
  damage: WeaponDamage;
  /** Daño versátil (a dos manos), si aplica */
  versatileDamage?: WeaponDamage;
  /** Bonificador de daño adicional (ej: +1d6 fuego de una espada flamígera) */
  bonusDamage?: WeaponDamage;
  /** Propiedades del arma */
  properties: WeaponProperty[];
  /** Alcance (para armas arrojadizas o de munición) */
  range?: WeaponRange;
  /** Si es cuerpo a cuerpo o a distancia */
  melee: boolean;
}

// ─── Armaduras ───────────────────────────────────────────────────────

export type ArmorType = "ligera" | "intermedia" | "pesada" | "escudo";

export interface ArmorDetails {
  /** Tipo de armadura */
  armorType: ArmorType;
  /** CA base que otorga */
  baseAC: number;
  /** Si aplica modificador de Destreza a la CA */
  addDexModifier: boolean;
  /** Máximo de modificador de Destreza aplicable (null = sin límite) */
  maxDexBonus: number | null;
  /** Requisito de Fuerza mínima (null = sin requisito) */
  strengthRequirement: number | null;
  /** Si impone desventaja en pruebas de Sigilo */
  stealthDisadvantage: boolean;
  /** Tiempo para ponérsela */
  donTime?: string;
  /** Tiempo para quitársela */
  doffTime?: string;
}

// ─── Rareza de objetos mágicos ───────────────────────────────────────

export type ItemRarity =
  | "comun"
  | "poco_comun"
  | "raro"
  | "muy_raro"
  | "legendario"
  | "artefacto";

// ─── Propiedades de objeto mágico ────────────────────────────────────

export interface MagicItemDetails {
  /** Rareza del objeto */
  rarity: ItemRarity;
  /** Si requiere sintonización */
  requiresAttunement: boolean;
  /** Restricciones de sintonización (ej: "solo clérigos") */
  attunementRestriction?: string;
  /** Si está actualmente sintonizado con el personaje */
  attuned: boolean;
  /** Descripción de las propiedades mágicas */
  magicDescription?: string;
  /** Cargas (si el objeto tiene cargas) */
  charges?: {
    max: number;
    current: number;
    rechargeDescription?: string;
  };
}

// ─── Objeto de inventario ────────────────────────────────────────────

export interface InventoryItem {
  /** UUID del objeto en el inventario */
  id: string;
  /** Nombre del objeto */
  nombre: string;
  /** Descripción completa */
  descripcion?: string;
  /** Categoría del objeto */
  categoria: ItemCategory;
  /** Cantidad */
  cantidad: number;
  /** Peso individual en libras */
  peso: number;
  /** Valor en monedas de oro (1 = 1 po) */
  valor?: number;
  /** Si el objeto está equipado */
  equipado: boolean;
  /** Si es un objeto personalizado (no del SRD) */
  custom: boolean;
  /** ID de referencia al catálogo SRD (null si es custom) */
  srdId?: string;

  /** Detalles de arma (solo si categoria === 'arma') */
  weaponDetails?: WeaponDetails;
  /** Detalles de armadura (solo si categoria === 'armadura' o 'escudo') */
  armorDetails?: ArmorDetails;
  /** Detalles de objeto mágico (si es mágico) */
  magicDetails?: MagicItemDetails;

  /** Notas adicionales del jugador sobre este objeto */
  notas?: string;
}

// ─── Monedas ─────────────────────────────────────────────────────────

export type CoinType = "mc" | "mp" | "me" | "mo" | "mpl";

export type Coins = Record<CoinType, number>;

// ─── Transacción de monedas ──────────────────────────────────────────

export interface CoinTransaction {
  id: string;
  timestamp: string;
  type: "income" | "expense" | "conversion";
  coins: Partial<Coins>;
  description?: string;
}

// ─── Inventario completo ─────────────────────────────────────────────

export interface Inventory {
  /** UUID del inventario */
  id: string;
  /** UUID del personaje asociado */
  characterId: string;
  /** Lista de objetos */
  items: InventoryItem[];
  /** Monedas del personaje */
  coins: Coins;
  /** Historial de transacciones de monedas */
  coinTransactions: CoinTransaction[];
  /** Máximo de sintonizaciones activas (por defecto 3) */
  maxAttunements: number;
}

// ─── Packs de equipo predefinidos ────────────────────────────────────

export interface EquipmentPack {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  items: {
    srdId: string;
    nombre: string;
    cantidad: number;
  }[];
}

export type EquipmentPackId = (typeof EQUIPMENT_PACK_IDS)[number];
