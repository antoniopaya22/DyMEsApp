/**
 * Utilidad para obtener el avatar de un personaje según su clase, raza y sexo.
 *
 * Busca en el registro estático generado por scripts/generate-avatar-registry.js.
 * Si no existe imagen para la combinación exacta, intenta fallbacks:
 *   1. Misma clase + raza + sexo opuesto (para "otro")
 *   2. null (sin imagen — el componente debe mostrar un fallback como icono/emoji)
 */

import type { ImageSource } from "expo-image";
import type { ClassId, RaceId, Sexo } from "@/types/character";
import { AVATAR_REGISTRY } from "@/constants/avatarRegistry";

/**
 * Devuelve la fuente de imagen para el avatar del personaje, o `null`
 * si no existe imagen disponible para esa combinación.
 */
export function getCharacterAvatar(
  clase: ClassId,
  raza: RaceId,
  sexo?: Sexo,
): ImageSource | null {
  if (!sexo || raza === "personalizada") return null;

  // Intento directo
  const key = `${clase}_${raza}_${sexo}` as const;
  const direct = AVATAR_REGISTRY[key];
  if (direct) return direct;

  // Fallback para "otro": intentar femenino, luego masculino
  if (sexo === "otro") {
    const femKey = `${clase}_${raza}_femenino` as const;
    const fem = AVATAR_REGISTRY[femKey];
    if (fem) return fem;

    const mascKey = `${clase}_${raza}_masculino` as const;
    const masc = AVATAR_REGISTRY[mascKey];
    if (masc) return masc;
  }

  return null;
}
