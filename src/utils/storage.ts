/**
 * Utilidad wrapper sobre AsyncStorage con tipado seguro.
 * Proporciona métodos genéricos para guardar, leer y eliminar datos
 * con serialización/deserialización JSON automática.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Prefijos de claves para organizar el almacenamiento ─────────────

export const STORAGE_KEYS = {
  CAMPAIGNS: "dyd:campaigns",
  CHARACTER_LIST: "dyd:character_list",
  CHARACTER: (id: string) => `dyd:character:${id}`,
  INVENTORY: (id: string) => `dyd:inventory:${id}`,
  NOTES: (characterId: string) => `dyd:notes:${characterId}`,
  CUSTOM_TAGS: "dyd:custom_tags",
  CREATION_DRAFT: (draftId?: string) => `dyd:draft:${draftId ?? "current"}`,
  SETTINGS: "dyd:settings",
  SPELL_FAVORITES: (characterId: string) => `dyd:spell_favs:${characterId}`,
  MAGIC_STATE: (characterId: string) => `dyd:magic:${characterId}`,
  CLASS_RESOURCES: (characterId: string) => `dyd:class_res:${characterId}`,
} as const;

// ─── Operaciones básicas con tipado ──────────────────────────────────

/**
 * Guarda un valor serializado como JSON en AsyncStorage.
 * @param key - Clave de almacenamiento
 * @param value - Valor a guardar (se serializa con JSON.stringify)
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`[Storage] Error al guardar "${key}":`, error);
    throw new StorageError(
      `No se pudo guardar el dato con clave "${key}"`,
      error,
    );
  }
}

/**
 * Lee y deserializa un valor de AsyncStorage.
 * @param key - Clave de almacenamiento
 * @returns El valor deserializado o null si no existe
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) {
      return null;
    }
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`[Storage] Error al leer "${key}":`, error);
    throw new StorageError(`No se pudo leer el dato con clave "${key}"`, error);
  }
}

/**
 * Lee un valor de AsyncStorage con un valor por defecto si no existe.
 * @param key - Clave de almacenamiento
 * @param defaultValue - Valor por defecto si la clave no existe
 * @returns El valor deserializado o el valor por defecto
 */
export async function getItemOrDefault<T>(
  key: string,
  defaultValue: T,
): Promise<T> {
  const value = await getItem<T>(key);
  return value ?? defaultValue;
}

/**
 * Elimina un valor de AsyncStorage.
 * @param key - Clave de almacenamiento
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Error al eliminar "${key}":`, error);
    throw new StorageError(
      `No se pudo eliminar el dato con clave "${key}"`,
      error,
    );
  }
}

/**
 * Elimina múltiples claves de AsyncStorage de forma atómica.
 * @param keys - Array de claves a eliminar
 */
export async function removeItems(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error(`[Storage] Error al eliminar múltiples claves:`, error);
    throw new StorageError("No se pudieron eliminar los datos", error);
  }
}

// ─── Operaciones de lista (para arrays almacenados) ──────────────────

/**
 * Añade un elemento a un array almacenado en AsyncStorage.
 * Si la clave no existe, crea un array nuevo con el elemento.
 * @param key - Clave de almacenamiento
 * @param item - Elemento a añadir
 */
export async function appendToList<T>(key: string, item: T): Promise<T[]> {
  const existing = await getItemOrDefault<T[]>(key, []);
  const updated = [...existing, item];
  await setItem(key, updated);
  return updated;
}

/**
 * Actualiza un elemento en un array almacenado, usando una función de coincidencia.
 * @param key - Clave de almacenamiento
 * @param matchFn - Función que identifica el elemento a actualizar
 * @param updater - Función que retorna el elemento actualizado
 * @returns El array actualizado, o null si no se encontró el elemento
 */
export async function updateInList<T>(
  key: string,
  matchFn: (item: T) => boolean,
  updater: (item: T) => T,
): Promise<T[] | null> {
  const existing = await getItem<T[]>(key);
  if (!existing) return null;

  let found = false;
  const updated = existing.map((item) => {
    if (matchFn(item)) {
      found = true;
      return updater(item);
    }
    return item;
  });

  if (!found) return null;

  await setItem(key, updated);
  return updated;
}

/**
 * Elimina un elemento de un array almacenado, usando una función de coincidencia.
 * @param key - Clave de almacenamiento
 * @param matchFn - Función que identifica el elemento a eliminar
 * @returns El array actualizado
 */
export async function removeFromList<T>(
  key: string,
  matchFn: (item: T) => boolean,
): Promise<T[]> {
  const existing = await getItemOrDefault<T[]>(key, []);
  const updated = existing.filter((item) => !matchFn(item));
  await setItem(key, updated);
  return updated;
}

// ─── Operaciones de merge ────────────────────────────────────────────

/**
 * Hace un merge parcial de un objeto almacenado (shallow merge).
 * Útil para actualizar solo algunos campos de un objeto sin reescribir todo.
 * @param key - Clave de almacenamiento
 * @param partial - Campos parciales a actualizar
 * @returns El objeto completo actualizado, o null si la clave no existe
 */
export async function mergeItem<T extends Record<string, unknown>>(
  key: string,
  partial: Partial<T>,
): Promise<T | null> {
  const existing = await getItem<T>(key);
  if (!existing) return null;

  const updated = { ...existing, ...partial };
  await setItem(key, updated);
  return updated;
}

// ─── Operaciones de consulta ─────────────────────────────────────────

/**
 * Verifica si una clave existe en AsyncStorage.
 * @param key - Clave de almacenamiento
 */
export async function hasItem(key: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch {
    return false;
  }
}

/**
 * Obtiene todas las claves que comienzan con un prefijo dado.
 * Útil para buscar todas las entradas de un tipo específico.
 * @param prefix - Prefijo de búsqueda
 */
export async function getKeysByPrefix(prefix: string): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter((key) => key.startsWith(prefix));
  } catch (error) {
    console.error(
      `[Storage] Error al buscar claves con prefijo "${prefix}":`,
      error,
    );
    return [];
  }
}

/**
 * Obtiene múltiples valores de AsyncStorage de una sola vez.
 * @param keys - Array de claves a leer
 * @returns Un Map con las claves y sus valores deserializados
 */
export async function getMultipleItems<T>(
  keys: string[],
): Promise<Map<string, T | null>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result = new Map<string, T | null>();

    for (const [key, value] of pairs) {
      if (value === null) {
        result.set(key, null);
      } else {
        try {
          result.set(key, JSON.parse(value) as T);
        } catch {
          result.set(key, null);
        }
      }
    }

    return result;
  } catch (error) {
    console.error("[Storage] Error al leer múltiples claves:", error);
    throw new StorageError("No se pudieron leer los datos", error);
  }
}

// ─── Utilidades de mantenimiento ─────────────────────────────────────

/**
 * Elimina los datos de usuario (campañas, personajes, inventarios, notas,
 * borradores, hechizos, recursos de clase) pero conserva settings.
 * Se usa al cerrar sesión para que el siguiente usuario empiece limpio.
 */
export async function clearUserData(): Promise<void> {
  const keepPrefixes = ["dyd:settings"];
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(
      (key) =>
        key.startsWith("dyd:") &&
        !keepPrefixes.some((prefix) => key.startsWith(prefix)),
    );
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error("[Storage] Error al limpiar datos de usuario:", error);
    throw new StorageError(
      "No se pudieron limpiar los datos de usuario",
      error,
    );
  }
}

/**
 * Elimina TODOS los datos de la aplicación del almacenamiento.
 * ⚠️ DESTRUCTIVO: Solo usar para desarrollo o reset completo.
 */
export async function clearAll(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter((key) => key.startsWith("dyd:"));
    if (appKeys.length > 0) {
      await AsyncStorage.multiRemove(appKeys);
    }
  } catch (error) {
    console.error("[Storage] Error al limpiar almacenamiento:", error);
    throw new StorageError("No se pudo limpiar el almacenamiento", error);
  }
}

/**
 * Obtiene el tamaño aproximado de los datos almacenados (en bytes).
 * Útil para depuración y monitoreo.
 */
export async function getStorageSize(): Promise<{
  totalKeys: number;
  approximateBytes: number;
}> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter((key) => key.startsWith("dyd:"));
    const pairs = await AsyncStorage.multiGet(appKeys);

    let totalBytes = 0;
    for (const [key, value] of pairs) {
      totalBytes += key.length * 2; // Caracteres UTF-16
      if (value) {
        totalBytes += value.length * 2;
      }
    }

    return {
      totalKeys: appKeys.length,
      approximateBytes: totalBytes,
    };
  } catch {
    return { totalKeys: 0, approximateBytes: 0 };
  }
}

// ─── Utilidades de ordenación para stores ────────────────────────────

/** Interfaz mínima para elementos con timestamp de actualización */
interface HasTimestamp {
  actualizadoEn: string;
}

/**
 * Ordena elementos por fecha de último acceso (más reciente primero).
 * Genérico para Campaign, CharacterSummary, o cualquier entidad con `actualizadoEn`.
 */
export function sortByLastAccess<T extends HasTimestamp>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.actualizadoEn).getTime() - new Date(a.actualizadoEn).getTime(),
  );
}

// ─── Utilidades de errores para stores ───────────────────────────────

/**
 * Extrae un mensaje legible de un error desconocido (catch blocks).
 * @param err - El error capturado (unknown)
 * @param fallback - Mensaje por defecto si err no es una instancia de Error
 */
export function extractErrorMessage(
  err: unknown,
  fallback = "Error desconocido",
): string {
  return err instanceof Error ? err.message : fallback;
}

// ─── Error personalizado ─────────────────────────────────────────────

export class StorageError extends Error {
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "StorageError";
    this.cause = cause;
  }
}
