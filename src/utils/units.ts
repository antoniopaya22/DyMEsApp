/**
 * Unit conversion utilities for D&D measurements.
 * Extracted from settingsStore for separation of concerns.
 */

import type { UnitSystem } from "@/stores/settingsStore";

/**
 * Convierte pies a la unidad configurada.
 * Si el sistema es métrico, convierte a metros.
 * Si es imperial, devuelve pies tal cual.
 */
export function convertirDistancia(
  pies: number,
  unidades: UnitSystem,
): { valor: number; unidad: string } {
  if (unidades === "metrico") {
    // Conversión estándar D&D: 5 pies = 1.5 m
    const metros = (pies / 5) * 1.5;
    return { valor: Number.parseFloat(metros.toFixed(1)), unidad: "m" };
  }
  return { valor: pies, unidad: "pies" };
}

/**
 * Convierte libras a la unidad configurada.
 * Si el sistema es métrico, convierte a kg.
 * Si es imperial, devuelve libras tal cual.
 */
export function convertirPeso(
  libras: number,
  unidades: UnitSystem,
): { valor: number; unidad: string } {
  if (unidades === "metrico") {
    const kg = libras * 0.45;
    return { valor: Number.parseFloat(kg.toFixed(1)), unidad: "kg" };
  }
  return { valor: libras, unidad: "lb" };
}

// ─── Convenience formatting helpers ──────────────────────────────────

/**
 * Formatea una distancia en pies como string con la unidad configurada.
 * Ej: formatDistancia(30, "metrico") → "9 m"
 *     formatDistancia(30, "imperial") → "30 pies"
 */
export function formatDistancia(pies: number, unidades: UnitSystem): string {
  const { valor, unidad } = convertirDistancia(pies, unidades);
  return `${valor} ${unidad}`;
}

/**
 * Formatea un peso en libras como string con la unidad configurada.
 * Ej: formatPeso(10, "metrico") → "4.5 kg"
 *     formatPeso(10, "imperial") → "10 lb"
 */
export function formatPeso(libras: number, unidades: UnitSystem): string {
  const { valor, unidad } = convertirPeso(libras, unidades);
  return `${valor} ${unidad}`;
}

/**
 * Devuelve solo la etiqueta de la unidad de peso configurada.
 * Ej: etiquetaPeso("metrico") → "kg"
 *     etiquetaPeso("imperial") → "lb"
 */
export function etiquetaPeso(unidades: UnitSystem): string {
  return unidades === "metrico" ? "kg" : "lb";
}

/**
 * Devuelve solo la etiqueta de la unidad de distancia configurada.
 * Ej: etiquetaDistancia("metrico") → "m"
 *     etiquetaDistancia("imperial") → "pies"
 */
export function etiquetaDistancia(unidades: UnitSystem): string {
  return unidades === "metrico" ? "m" : "pies";
}
