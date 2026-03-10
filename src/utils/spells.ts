/**
 * Spell utility functions — slot calculations, formatting helpers.
 * Extracted from types/spell.ts for separation of concerns.
 */
import type { ClassId } from "@/types/character";
import type {
  SpellComponents,
  SpellDuration,
  CastingTime,
  SpellRange,
  AreaShape,
  PactMagicSlots,
} from "@/types/spell";
import {
  CLASS_CASTER_TYPE,
  FULL_CASTER_SLOTS,
  HALF_CASTER_SLOTS,
  WARLOCK_PACT_SLOTS,
} from "@/constants/spells";
import type { UnitSystem } from "@/stores/settingsStore";
import { formatDistancia } from "@/utils/units";

// ─── Cálculos ────────────────────────────────────────────────────────

/**
 * Calcula el número de hechizos preparados para clases que preparan.
 */
export function calcPreparedSpells(
  classId: ClassId,
  classLevel: number,
  abilityModifier: number,
): number {
  switch (classId) {
    case "bardo":
    case "hechicero":
    case "clerigo":
    case "druida":
      return Math.max(1, classLevel + abilityModifier);
    case "mago":
      return Math.max(1, classLevel + abilityModifier);
    case "paladin":
      return Math.max(1, Math.floor(classLevel / 2) + abilityModifier);
    default:
      return 0;
  }
}

/**
 * Calcula la CD de salvación de conjuros.
 * CD = 8 + bonificador de competencia + modificador de característica de lanzamiento
 */
export function calcSpellSaveDC(
  proficiencyBonus: number,
  abilityModifier: number,
): number {
  return 8 + proficiencyBonus + abilityModifier;
}

/**
 * Calcula el bonificador de ataque con conjuros.
 */
export function calcSpellAttackBonus(
  proficiencyBonus: number,
  abilityModifier: number,
): number {
  return proficiencyBonus + abilityModifier;
}

/**
 * Obtiene los espacios de hechizo para una clase y nivel dados.
 */
export function getSpellSlots(
  classId: ClassId,
  classLevel: number,
): Record<number, number> {
  const casterType = CLASS_CASTER_TYPE[classId];
  const slots: Record<number, number> = {};

  if (casterType === "none") return slots;

  if (casterType === "pact") {
    const pactData = WARLOCK_PACT_SLOTS[classLevel];
    if (pactData) {
      // El Brujo tiene un sistema especial, se maneja con PactMagicSlots
      // Aquí retornamos vacío; los slots de pacto se gestionan por separado
    }
    return slots;
  }

  const table = casterType === "full" ? FULL_CASTER_SLOTS : HALF_CASTER_SLOTS;
  const levelSlots = table[classLevel];

  if (levelSlots) {
    levelSlots.forEach((count, index) => {
      if (count > 0) {
        slots[index + 1] = count;
      }
    });
  }

  return slots;
}

/**
 * Obtiene los espacios de pacto del Brujo para un nivel dado.
 */
export function getPactMagicSlots(classLevel: number): PactMagicSlots | null {
  const data = WARLOCK_PACT_SLOTS[classLevel];
  if (!data) return null;

  return {
    total: data[0],
    slotLevel: data[1],
    used: 0,
  };
}

// ─── Formateo ────────────────────────────────────────────────────────

/**
 * Formatea los componentes del hechizo para mostrar.
 * Ejemplo: "V, S, M (un trozo de pelo de gato)"
 */
export function formatSpellComponents(components: SpellComponents): string {
  const parts: string[] = [];
  if (components.verbal) parts.push("V");
  if (components.somatic) parts.push("S");
  if (components.material) {
    if (components.materialDescription) {
      parts.push(`M (${components.materialDescription})`);
    } else {
      parts.push("M");
    }
  }
  return parts.join(", ");
}

/**
 * Formatea la duración del hechizo para mostrar.
 */
export function formatSpellDuration(duration: SpellDuration): string {
  const prefix = duration.concentration ? "Concentración, " : "";

  switch (duration.unit) {
    case "instantaneo":
      return "Instantáneo";
    case "hasta_disipar":
      return `${prefix}hasta disipar`;
    case "permanente":
      return "Permanente";
    case "especial":
      return `${prefix}Especial`;
    case "ronda":
      return `${prefix}1 ronda`;
    case "rondas":
      return `${prefix}${duration.amount} rondas`;
    case "minuto":
      return `${prefix}1 minuto`;
    case "minutos":
      return `${prefix}${duration.amount} minutos`;
    case "hora":
      return `${prefix}1 hora`;
    case "horas":
      return `${prefix}${duration.amount} horas`;
    case "dia":
      return `${prefix}1 día`;
    case "dias":
      return `${prefix}${duration.amount} días`;
    default:
      return `${prefix}${duration.amount ?? ""} ${duration.unit}`;
  }
}

/**
 * Formatea el tiempo de lanzamiento del hechizo.
 */
export function formatCastingTime(castingTime: CastingTime): string {
  switch (castingTime.unit) {
    case "accion":
      return "1 acción";
    case "accion_adicional":
      return "1 acción adicional";
    case "reaccion":
      return castingTime.reactionTrigger
        ? `1 reacción, ${castingTime.reactionTrigger}`
        : "1 reacción";
    case "minuto":
      return "1 minuto";
    case "minutos":
      return `${castingTime.amount} minutos`;
    case "hora":
      return "1 hora";
    case "horas":
      return `${castingTime.amount} horas`;
    default:
      return `${castingTime.amount} ${castingTime.unit}`;
  }
}

/**
 * Formatea el alcance del hechizo (structurado SpellRange).
 * Si se pasa unidades, convierte la distancia; si no, muestra en pies.
 */
export function formatSpellRange(
  range: SpellRange,
  unidades?: UnitSystem,
): string {
  const fmt = (pies: number) =>
    unidades ? formatDistancia(pies, unidades) : `${pies} pies`;

  switch (range.type) {
    case "personal":
      if (range.area) {
        const shapeName =
          AREA_SHAPE_NAMES[range.area.shape] ?? range.area.shape;
        return `Personal (${shapeName} de ${fmt(range.area.size)})`;
      }
      return "Personal";
    case "toque":
      return "Toque";
    case "distancia":
      return range.distance ? fmt(range.distance) : "Distancia";
    case "vision":
      return "Visión";
    case "ilimitado":
      return "Ilimitado";
    case "especial":
      return "Especial";
    default:
      return String(range.type);
  }
}

/** Spanish names for area shapes used in formatted output */
const AREA_SHAPE_NAMES: Record<string, string> = {
  esfera: "esfera",
  cubo: "cubo",
  cono: "cono",
  cilindro: "cilindro",
  linea: "línea",
  hemisferio: "semiesfera",
};

// ─── Parsing de alcance desde cadenas de texto ───────────────────────

/**
 * Mapa de metros → pies para los valores que aparecen en spellDescriptions.
 * D&D standard: 1.5 m = 5 ft, so feet = meters / 1.5 * 5 = meters * (10/3)
 */
function metrosAPies(metros: number): number {
  return Math.round((metros / 1.5) * 5);
}

/**
 * Parsea la cadena de alcance cruda de spellDescriptions.ts a una SpellRange.
 *
 * Handles all 30 known patterns:
 * - "Toque" → toque
 * - "Lanzador" → personal (no area)
 * - "Vista" → vision
 * - "Ilimitado" → ilimitado
 * - "Especial" → especial
 * - "18 m", "9 m", etc. → distancia (meters → feet)
 * - "1,5 km", "750 km" → distancia (km → feet)
 * - "18 metros (60 pies)" → distancia (feet from parenthetical)
 * - "Lanzador (radio de X m)" → personal + area (esfera)
 * - "Lanzador (cono de X m)" → personal + area (cono)
 * - "Lanzador (línea de X m)" → personal + area (linea)
 * - "Lanzador (cubo de X m)" → personal + area (cubo)
 * - "Lanzador (esfera de X m de radio)" → personal + area (esfera)
 * - "Lanzador (semiesfera de X m de radio)" → personal + area (hemisferio)
 */
export function parseAlcance(alcance: string): SpellRange {
  const trimmed = alcance.trim();

  // Exact matches
  if (trimmed === "Toque") return { type: "toque" };
  if (trimmed === "Lanzador") return { type: "personal" };
  if (trimmed === "Vista") return { type: "vision" };
  if (trimmed === "Ilimitado") return { type: "ilimitado" };
  if (trimmed === "Especial") return { type: "especial" };

  // "Lanzador (...)" → personal with area
  const lanzadorMatch = trimmed.match(/^Lanzador\s*\((.+)\)$/);
  if (lanzadorMatch) {
    const areaStr = lanzadorMatch[1];
    const area = parseAreaString(areaStr);
    return area ? { type: "personal", area } : { type: "personal" };
  }

  // "X metros (Y pies)" — use the pies value directly
  const metrosPiesMatch = trimmed.match(
    /^[\d,.]+\s*metros?\s*\((\d+)\s*pies\)$/i,
  );
  if (metrosPiesMatch) {
    return { type: "distancia", distance: parseInt(metrosPiesMatch[1], 10) };
  }

  // "X,Y km" or "X km"
  const kmMatch = trimmed.match(/^([\d,.]+)\s*km$/);
  if (kmMatch) {
    const km = parseSpanishNumber(kmMatch[1]);
    // 1 km = 1000m, convert to feet
    return { type: "distancia", distance: metrosAPies(km * 1000) };
  }

  // "X m" or "X,Y m"
  const mMatch = trimmed.match(/^([\d,.]+)\s*m$/);
  if (mMatch) {
    const metros = parseSpanishNumber(mMatch[1]);
    return { type: "distancia", distance: metrosAPies(metros) };
  }

  // Fallback: treat as especial
  return { type: "especial" };
}

/**
 * Parses area descriptions inside "Lanzador (...)" patterns.
 * Examples:
 *   "radio de 3 m" → esfera, 3m
 *   "cono de 18 m" → cono, 18m
 *   "línea de 30 m" → linea, 30m
 *   "cubo de 4,5 m" → cubo, 4.5m
 *   "esfera de 3 m de radio" → esfera, 3m
 *   "semiesfera de 3 m de radio" → hemisferio, 3m
 */
function parseAreaString(
  areaStr: string,
): { shape: AreaShape; size: number } | null {
  // "radio de X km" → esfera (kilometers)
  const radioKmMatch = areaStr.match(/^radio\s+de\s+([\d,.]+)\s*km/);
  if (radioKmMatch) {
    return {
      shape: "esfera",
      size: metrosAPies(parseSpanishNumber(radioKmMatch[1]) * 1000),
    };
  }

  // "radio de X m" → esfera
  const radioMatch = areaStr.match(/^radio\s+de\s+([\d,.]+)\s*m/);
  if (radioMatch) {
    return {
      shape: "esfera",
      size: metrosAPies(parseSpanishNumber(radioMatch[1])),
    };
  }

  // "esfera de X m de radio"
  const esferaMatch = areaStr.match(/^esfera\s+de\s+([\d,.]+)\s*m/);
  if (esferaMatch) {
    return {
      shape: "esfera",
      size: metrosAPies(parseSpanishNumber(esferaMatch[1])),
    };
  }

  // "semiesfera de X m de radio"
  const semiMatch = areaStr.match(/^semiesfera\s+de\s+([\d,.]+)\s*m/);
  if (semiMatch) {
    return {
      shape: "hemisferio",
      size: metrosAPies(parseSpanishNumber(semiMatch[1])),
    };
  }

  // "cono de X m"
  const conoMatch = areaStr.match(/^cono\s+de\s+([\d,.]+)\s*m/);
  if (conoMatch) {
    return {
      shape: "cono",
      size: metrosAPies(parseSpanishNumber(conoMatch[1])),
    };
  }

  // "línea de X m"
  const lineaMatch = areaStr.match(/^l[ií]nea\s+de\s+([\d,.]+)\s*m/);
  if (lineaMatch) {
    return {
      shape: "linea",
      size: metrosAPies(parseSpanishNumber(lineaMatch[1])),
    };
  }

  // "cubo de X m"
  const cuboMatch = areaStr.match(/^cubo\s+de\s+([\d,.]+)\s*m/);
  if (cuboMatch) {
    return {
      shape: "cubo",
      size: metrosAPies(parseSpanishNumber(cuboMatch[1])),
    };
  }

  return null;
}

/**
 * Parses a Spanish-locale number string: "1,5" → 1.5, "750" → 750
 */
function parseSpanishNumber(str: string): number {
  return parseFloat(str.replace(",", "."));
}

/**
 * Convenience function: takes a raw alcance string from spellDescriptions.ts
 * and returns a unit-aware formatted string.
 *
 * This is the main entry point for components displaying spell range.
 * It parses the string to structured SpellRange, then formats it with the
 * configured unit system.
 */
export function formatAlcanceRaw(
  alcance: string,
  unidades: UnitSystem,
): string {
  const range = parseAlcance(alcance);
  return formatSpellRange(range, unidades);
}
