/**
 * Spell-related constants — school names, slot tables, metamagic data, caster configs.
 * Extracted from types/spell.ts for separation of concerns.
 */
import type {
  MagicSchool,
  SpellLevel,
  MetamagicOption,
  CasterType,
  SpellPreparationType,
} from "@/types/spell";
import type { ClassId, AbilityKey } from "@/types/character";
import {
  CLASS_CASTER_TYPE_FROM_CLASSES,
  SPELLCASTING_ABILITY_FROM_CLASSES,
  CLASS_SPELL_PREPARATION_FROM_CLASSES,
} from "@/data/srd/classes";

// ─── Escuelas de magia ───────────────────────────────────────────────

export const MAGIC_SCHOOL_NAMES: Record<MagicSchool, string> = {
  abjuracion: "Abjuración",
  conjuracion: "Conjuración",
  adivinacion: "Adivinación",
  encantamiento: "Encantamiento",
  evocacion: "Evocación",
  ilusion: "Ilusión",
  nigromancia: "Nigromancia",
  transmutacion: "Transmutación",
};

export const MAGIC_SCHOOL_ICONS: Record<MagicSchool, string> = {
  abjuracion: "🛡️",
  conjuracion: "✨",
  adivinacion: "👁️",
  encantamiento: "💫",
  evocacion: "🔥",
  ilusion: "🌀",
  nigromancia: "💀",
  transmutacion: "🔄",
};

// ─── Niveles de hechizo ──────────────────────────────────────────────

export const SPELL_LEVEL_NAMES: Record<SpellLevel, string> = {
  0: "Truco",
  1: "1er nivel",
  2: "2º nivel",
  3: "3er nivel",
  4: "4º nivel",
  5: "5º nivel",
  6: "6º nivel",
  7: "7º nivel",
  8: "8º nivel",
  9: "9º nivel",
};

// ─── Tablas de espacios de hechizo ───────────────────────────────────

export const FULL_CASTER_SLOTS: Record<number, number[]> = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export const HALF_CASTER_SLOTS: Record<number, number[]> = {
  2: [2],
  3: [3],
  4: [3],
  5: [4, 2],
  6: [4, 2],
  7: [4, 3],
  8: [4, 3],
  9: [4, 3, 2],
  10: [4, 3, 2],
  11: [4, 3, 3],
  12: [4, 3, 3],
  13: [4, 3, 3, 1],
  14: [4, 3, 3, 1],
  15: [4, 3, 3, 2],
  16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1],
  18: [4, 3, 3, 3, 1],
  19: [4, 3, 3, 3, 2],
  20: [4, 3, 3, 3, 2],
};

export const WARLOCK_PACT_SLOTS: Record<number, [number, number]> = {
  1: [1, 1],
  2: [2, 1],
  3: [2, 2],
  4: [2, 2],
  5: [2, 3],
  6: [2, 3],
  7: [2, 4],
  8: [2, 4],
  9: [2, 5],
  10: [2, 5],
  11: [3, 5],
  12: [3, 5],
  13: [3, 5],
  14: [3, 5],
  15: [3, 5],
  16: [3, 5],
  17: [4, 5],
  18: [4, 5],
  19: [4, 5],
  20: [4, 5],
};

// ─── Trucos y hechizos conocidos ─────────────────────────────────────

export const CANTRIPS_KNOWN: Partial<Record<ClassId, Record<number, number>>> = {
  bardo: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  brujo: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  clerigo: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5,
  },
  druida: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  hechicero: {
    1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 6,
    11: 6, 12: 6, 13: 6, 14: 6, 15: 6, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6,
  },
  mago: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5,
  },
};

export const SPELLS_KNOWN: Partial<Record<ClassId, Record<number, number>>> = {
  bardo: {
    1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
    11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22,
  },
  brujo: {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10,
    11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15,
  },
  explorador: {
    1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 7, 7: 8, 8: 8, 9: 10, 10: 10,
    11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15,
  },
  hechicero: {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
    11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15,
  },
};

// ─── Característica de lanzamiento por clase ─────────────────────────
// Derivado de CLASSES en data/srd/classes.ts (fuente única de verdad)

export const SPELLCASTING_ABILITY: Partial<Record<ClassId, AbilityKey>> =
  SPELLCASTING_ABILITY_FROM_CLASSES;

// ─── Tipo de lanzador y preparación ──────────────────────────────────
// Derivado de CLASSES en data/srd/classes.ts (fuente única de verdad)

export const CLASS_CASTER_TYPE: Record<ClassId, CasterType> =
  CLASS_CASTER_TYPE_FROM_CLASSES;

export const CLASS_SPELL_PREPARATION: Record<ClassId, SpellPreparationType> =
  CLASS_SPELL_PREPARATION_FROM_CLASSES;

// ─── Metamagia ───────────────────────────────────────────────────────

export const METAMAGIC_NAMES: Record<MetamagicOption, string> = {
  hechizo_cuidadoso: "Hechizo Cuidadoso",
  hechizo_distante: "Hechizo Distante",
  hechizo_potenciado: "Hechizo Potenciado",
  hechizo_extendido: "Hechizo Extendido",
  hechizo_intensificado: "Hechizo Intensificado",
  hechizo_rapido: "Hechizo Rápido",
  hechizo_buscador: "Hechizo Buscador",
  hechizo_sutil: "Hechizo Sutil",
  hechizo_transmutado: "Hechizo Transmutado",
  hechizo_duplicado: "Hechizo Duplicado",
};

export const METAMAGIC_COSTS: Record<MetamagicOption, number> = {
  hechizo_cuidadoso: 1,
  hechizo_distante: 1,
  hechizo_potenciado: 1,
  hechizo_extendido: 1,
  hechizo_intensificado: 2,
  hechizo_rapido: 2,
  hechizo_buscador: 1,
  hechizo_sutil: 1,
  hechizo_transmutado: 1,
  hechizo_duplicado: 1,
};

export const METAMAGIC_DESCRIPTIONS: Record<MetamagicOption, string> = {
  hechizo_cuidadoso:
    "Al lanzar un conjuro que obliga a tiradas de salvación, protege a hasta mod. CAR criaturas (mín. 1): superan automáticamente la salvación y no reciben daño si normalmente recibirían mitad. Coste: 1 PH.",
  hechizo_distante:
    "Duplica el alcance de un conjuro (mín. 1,5 m) o cambia un conjuro de toque a 9 m de alcance. Coste: 1 PH.",
  hechizo_potenciado:
    "Repite hasta mod. CAR dados de daño de un conjuro (mín. 1). Compatible con otra Metamagia. Coste: 1 PH.",
  hechizo_extendido:
    "Duplica la duración de un conjuro (mín. 1 minuto, máx. 24 h). Si requiere Concentración, tienes ventaja en salvaciones para mantenerla. Coste: 1 PH.",
  hechizo_intensificado:
    "Un objetivo del conjuro tiene desventaja en salvaciones contra él. Coste: 2 PH.",
  hechizo_rapido:
    "Cambia el tiempo de lanzamiento de 1 acción a 1 acción adicional. No puedes usar esto si ya lanzaste un conjuro de nivel 1+ este turno, ni lanzar uno después. Coste: 2 PH.",
  hechizo_buscador:
    "Si fallas una tirada de ataque con un conjuro, puedes repetir el d20 (debes usar el nuevo resultado). Compatible con otra Metamagia. Coste: 1 PH.",
  hechizo_sutil:
    "Lanza el conjuro sin componentes verbales, somáticos ni materiales (excepto los consumidos o con coste especificado). Coste: 1 PH.",
  hechizo_transmutado:
    "Cambia el tipo de daño de un conjuro a otro de la lista: Ácido, Frío, Fuego, Relámpago, Veneno, Trueno. Coste: 1 PH.",
  hechizo_duplicado:
    "Al lanzar un conjuro que pueda subirse de nivel para afectar a una criatura adicional, aumenta su nivel efectivo en 1. Coste: 1 PH.",
};

export const ALL_METAMAGIC_OPTIONS: MetamagicOption[] = [
  "hechizo_cuidadoso",
  "hechizo_distante",
  "hechizo_potenciado",
  "hechizo_extendido",
  "hechizo_intensificado",
  "hechizo_rapido",
  "hechizo_buscador",
  "hechizo_sutil",
  "hechizo_transmutado",
  "hechizo_duplicado",
];
