/**
 * Inventory utility functions — weight, encumbrance, AC, weapon calcs.
 * Extracted from types/item.ts for separation of concerns.
 */
import type {
  InventoryItem,
  Inventory,
  Coins,
  CoinType,
  WeaponDetails,
  WeaponDamage,
} from "@/types/item";
import type { EquipmentChoice } from "@/data/srd/classes";
import { findSrdItem } from "@/data/srd/items";
import { COIN_TO_GOLD_RATE, DEFAULT_COINS } from "@/constants/items";
import { randomUUID } from "expo-crypto";

// ─── Peso y carga ────────────────────────────────────────────────────

export function calcTotalWeight(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + item.peso * item.cantidad, 0);
}

export function calcCoinWeight(coins: Coins): number {
  const totalCoins = Object.values(coins).reduce((sum, count) => sum + count, 0);
  return totalCoins / 50;
}

export function calcInventoryWeight(inventory: Inventory): number {
  return calcTotalWeight(inventory.items) + calcCoinWeight(inventory.coins);
}

export function calcCarryingCapacity(strengthScore: number): number {
  return strengthScore * 15;
}

export function isEncumbered(currentWeight: number, strengthScore: number): boolean {
  return currentWeight > calcCarryingCapacity(strengthScore);
}

export function calcEncumbrancePercentage(
  currentWeight: number,
  strengthScore: number
): number {
  const capacity = calcCarryingCapacity(strengthScore);
  if (capacity === 0) return 0;
  return Math.min(100, Math.round((currentWeight / capacity) * 100));
}

// ─── Monedas ─────────────────────────────────────────────────────────

export function calcTotalGoldValue(coins: Coins): number {
  return Object.entries(coins).reduce((total, [type, count]) => {
    return total + count * COIN_TO_GOLD_RATE[type as CoinType];
  }, 0);
}

// ─── Sintonización ───────────────────────────────────────────────────

export function countActiveAttunements(items: InventoryItem[]): number {
  return items.filter(
    (item) => item.magicDetails?.requiresAttunement && item.magicDetails?.attuned
  ).length;
}

export function canAttune(inventory: Inventory): boolean {
  return countActiveAttunements(inventory.items) < inventory.maxAttunements;
}

// ─── Equipamiento ────────────────────────────────────────────────────

export function getEquippedItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter((item) => item.equipado);
}

export function getEquippedWeapons(items: InventoryItem[]): InventoryItem[] {
  return items.filter((item) => item.equipado && item.categoria === "arma");
}

export function getEquippedArmor(items: InventoryItem[]): InventoryItem | null {
  return (
    items.find((item) => item.equipado && item.categoria === "armadura") ?? null
  );
}

export function getEquippedShield(items: InventoryItem[]): InventoryItem | null {
  return (
    items.find((item) => item.equipado && item.categoria === "escudo") ?? null
  );
}

// ─── Clase de armadura ───────────────────────────────────────────────

export function calcArmorClass(
  equippedArmor: InventoryItem | null,
  equippedShield: InventoryItem | null,
  dexModifier: number,
  miscBonus: number = 0
): {
  total: number;
  base: number;
  dexBonus: number;
  shieldBonus: number;
  miscBonus: number;
  breakdown: string;
} {
  let base: number;
  let dexBonus: number;
  let breakdownParts: string[] = [];

  if (!equippedArmor || !equippedArmor.armorDetails) {
    base = 10;
    dexBonus = dexModifier;
    breakdownParts.push(`10 + DES (${dexModifier >= 0 ? "+" : ""}${dexModifier})`);
  } else {
    const armor = equippedArmor.armorDetails;
    base = armor.baseAC;

    if (!armor.addDexModifier) {
      dexBonus = 0;
      breakdownParts.push(`${equippedArmor.nombre} (${base})`);
    } else if (armor.maxDexBonus !== null) {
      dexBonus = Math.min(dexModifier, armor.maxDexBonus);
      breakdownParts.push(
        `${equippedArmor.nombre} (${base}) + DES (${dexBonus >= 0 ? "+" : ""}${dexBonus}, máx. +${armor.maxDexBonus})`
      );
    } else {
      dexBonus = dexModifier;
      breakdownParts.push(
        `${equippedArmor.nombre} (${base}) + DES (${dexBonus >= 0 ? "+" : ""}${dexBonus})`
      );
    }
  }

  const shieldBonus = equippedShield?.armorDetails?.baseAC ?? 0;
  if (shieldBonus > 0) {
    breakdownParts.push(`Escudo (+${shieldBonus})`);
  }

  if (miscBonus !== 0) {
    breakdownParts.push(`Varios (${miscBonus >= 0 ? "+" : ""}${miscBonus})`);
  }

  const total = base + dexBonus + shieldBonus + miscBonus;

  return {
    total,
    base,
    dexBonus,
    shieldBonus,
    miscBonus,
    breakdown: breakdownParts.join(" + ") + ` = ${total}`,
  };
}

// ─── Armas ───────────────────────────────────────────────────────────

export function calcWeaponAttackBonus(
  weapon: WeaponDetails,
  strModifier: number,
  dexModifier: number,
  proficiencyBonus: number,
  isProficient: boolean
): number {
  let abilityMod: number;

  if (weapon.properties.includes("sutil")) {
    abilityMod = Math.max(strModifier, dexModifier);
  } else if (weapon.melee) {
    abilityMod = strModifier;
  } else {
    abilityMod = dexModifier;
  }

  return abilityMod + (isProficient ? proficiencyBonus : 0);
}

export function calcWeaponDamageModifier(
  weapon: WeaponDetails,
  strModifier: number,
  dexModifier: number
): number {
  if (weapon.properties.includes("sutil")) {
    return Math.max(strModifier, dexModifier);
  }
  return weapon.melee ? strModifier : dexModifier;
}

export function formatWeaponDamage(
  damage: WeaponDamage,
  modifier: number,
  bonusDamage?: WeaponDamage,
): string {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  let result = `${damage.dice}${modStr} ${damage.damageType}`;
  if (bonusDamage) {
    result += ` +${bonusDamage.dice} ${bonusDamage.damageType}`;
  }
  return result;
}

// ─── Factoría ────────────────────────────────────────────────────────

export function createDefaultInventory(
  inventoryId: string,
  characterId: string
): Inventory {
  return {
    id: inventoryId,
    characterId,
    items: [],
    coins: { ...DEFAULT_COINS },
    coinTransactions: [],
    maxAttunements: 3,
  };
}

export function createEmptyItem(id: string): InventoryItem {
  return {
    id,
    nombre: "",
    categoria: "otro",
    cantidad: 1,
    peso: 0,
    equipado: false,
    custom: true,
  };
}

// ─── Inventario inicial desde creación de personaje ──────────────────

/**
 * Parsea un nombre de objeto que puede incluir cantidad con "×N" o "xN".
 * Ej: "Jabalina ×4" → { nombre: "Jabalina", cantidad: 4 }
 *     "Daga" → { nombre: "Daga", cantidad: 1 }
 */
function parseItemNameQuantity(raw: string): { nombre: string; cantidad: number } {
  const match = raw.match(/^(.+?)\s*[×x](\d+)$/i);
  if (match) {
    return { nombre: match[1].trim(), cantidad: parseInt(match[2], 10) };
  }
  return { nombre: raw.trim(), cantidad: 1 };
}

/**
 * Convierte una lista de nombres de objetos (strings) en InventoryItems.
 * Agrupa duplicados sumando cantidades.
 * Busca cada nombre en el catálogo SRD para asignar categoría, peso,
 * detalles de arma/armadura, etc.
 */
function itemNamesToInventoryItems(names: string[]): InventoryItem[] {
  const grouped = new Map<string, number>();

  for (const raw of names) {
    const { nombre, cantidad } = parseItemNameQuantity(raw);
    grouped.set(nombre, (grouped.get(nombre) ?? 0) + cantidad);
  }

  return Array.from(grouped.entries()).map(([nombre, cantidad]) => {
    const srd = findSrdItem(nombre);

    return {
      id: randomUUID(),
      nombre: srd?.nombre ?? nombre,
      descripcion: srd?.descripcion,
      categoria: srd?.categoria ?? "otro",
      cantidad,
      peso: srd?.peso ?? 0,
      valor: srd?.valor,
      equipado: false,
      custom: !srd,
      weaponDetails: srd?.weaponDetails,
      armorDetails: srd?.armorDetails,
    };
  });
}

/**
 * Resuelve las elecciones de equipamiento del draft a una lista plana
 * de nombres de objetos.
 */
function resolveEquipmentChoices(
  equipmentChoices: EquipmentChoice[],
  selectedChoices: Record<string, string>,
): string[] {
  const items: string[] = [];

  for (const choice of equipmentChoices) {
    const selectedOptionId = selectedChoices[choice.id];
    if (!selectedOptionId) continue;

    const option = choice.options.find((o) => o.id === selectedOptionId);
    if (option) {
      items.push(...option.items);
    }
  }

  return items;
}

export interface StartingInventoryParams {
  inventoryId: string;
  characterId: string;
  /** Opciones de equipamiento de la clase */
  classEquipmentChoices: EquipmentChoice[];
  /** Elecciones del usuario (choiceId → optionId) */
  selectedChoices: Record<string, string>;
  /** Equipo que siempre otorga la clase */
  classDefaultEquipment: string[];
  /** Equipo que otorga el trasfondo */
  backgroundEquipment: string[];
  /** Monedas de oro iniciales del trasfondo */
  backgroundStartingGold: number;
}

/**
 * Construye el inventario inicial del personaje a partir del equipamiento
 * elegido durante la creación (clase + trasfondo).
 */
export function buildStartingInventory(params: StartingInventoryParams): Inventory {
  const {
    inventoryId,
    characterId,
    classEquipmentChoices,
    selectedChoices,
    classDefaultEquipment,
    backgroundEquipment,
    backgroundStartingGold,
  } = params;

  // Recopilar todos los nombres de objetos
  const allItemNames: string[] = [
    ...resolveEquipmentChoices(classEquipmentChoices, selectedChoices),
    ...classDefaultEquipment,
    ...backgroundEquipment,
  ];

  const items = itemNamesToInventoryItems(allItemNames);

  const coins: Coins = {
    ...DEFAULT_COINS,
    mo: backgroundStartingGold,
  };

  return {
    id: inventoryId,
    characterId,
    items,
    coins,
    coinTransactions: [],
    maxAttunements: 3,
  };
}
