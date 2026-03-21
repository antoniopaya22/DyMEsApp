/**
 * Utilidades para detectar rasgos pasivos de clase, subclase y raza que
 * modifican las pruebas de habilidad (skill checks) del personaje.
 *
 * ── Rasgos contemplados ──────────────────────────────────────────────
 *
 * MÍNIMO EN EL D20 (pasivos, siempre activos):
 *  - Lengua de Plata  (Bardo / Elocuencia, nv 3): mín 10 en Persuasión y Engaño
 *  - Talento Fiable   (Pícaro, nv 7):              mín 10 en habilidades con competencia
 *  - Oído p/ el Engaño(Pícaro / Inquisitivo, nv 3):mín 8 en Perspicacia
 *
 * RETIRADA DE 1 NATURAL:
 *  - Afortunado        (Mediano, raza):            re-tirar 1 natural en cualquier d20
 *
 * BONIFICADOR PASIVO AL MODIFICADOR:
 *  - Aprendiz (Bardo, nv 2):                       +½ comp en habilidades sin competencia
 *  - Encanto Sobrenatural (Explorador / Errante Feérico, nv 3): +SAB a pruebas de CAR
 *  - Cortesano Elegante (Guerrero / Samurái, nv 7): +SAB a Persuasión
 */

import type { Character, SkillKey, AbilityKey } from "@/types/character";
import { SKILLS } from "@/constants/character";
import { getSubclassOptions } from "@/data/srd/subclasses";

// ─── Tipos ───────────────────────────────────────────────────────────

/** Mínimo aplicable al d20 de una prueba de habilidad. */
export interface SkillRollMinimum {
  /** Valor mínimo del d20 (antes de aplicar el modificador). */
  minDieValue: number;
  /** Nombre del rasgo que otorga el mínimo. */
  featureName: string;
}

/** Indica que el personaje puede volver a tirar un 1 natural. */
export interface SkillRollReroll {
  /** Nombre del rasgo que otorga la retirada. */
  featureName: string;
}

/** Bonificador plano extra que aplica pasivamente. */
export interface SkillPassiveBonus {
  /** Valor del bonificador. */
  bonus: number;
  /** Nombre del rasgo. */
  featureName: string;
  /** Si `true`, el bonificador ya se incluye en `getSkillBonus` y solo se muestra informativamente. */
  includedInBase: boolean;
}

/** Resumen completo de modificadores pasivos para una tirada de habilidad. */
export interface SkillRollModifiers {
  /** Mínimo de d20 más alto que aplique, o `null`. */
  minimum: SkillRollMinimum | null;
  /** Retirada de 1 natural (ej. Mediano Afortunado), o `null`. */
  rerollNat1: SkillRollReroll | null;
  /** Bonificadores planos pasivos que ya están sumados al mod base. */
  passiveBonuses: SkillPassiveBonus[];
}

// ─── Helpers privados ────────────────────────────────────────────────

/**
 * Resuelve el ID interno de la subclase del personaje.
 * `character.subclase` puede contener el nombre display ("Colegio de la Elocuencia")
 * o el ID ("colegio_elocuencia"). Esta función normaliza ambos casos al ID.
 */
function resolveSubclassId(character: Character): string | null {
  const raw = character.subclase;
  if (!raw) return null;

  // Si ya es un ID conocido (slug sin espacios), devolverlo directamente
  const opts = getSubclassOptions(character.clase);
  const byId = opts.find((o) => o.id === raw);
  if (byId) return byId.id;

  // Si es un nombre display, buscar el ID correspondiente
  const byName = opts.find((o) => o.nombre === raw);
  return byName?.id ?? raw;
}

/** Habilidades cuya característica base es Carisma. */
const CHA_SKILLS: ReadonlySet<SkillKey> = new Set(
  (Object.entries(SKILLS) as [SkillKey, { habilidad: AbilityKey }][])
    .filter(([, def]) => def.habilidad === "car")
    .map(([key]) => key),
);

/** Detecta mínimos de d20 pasivos. */
function collectMinimums(
  character: Character,
  skill: SkillKey,
  isProficient: boolean,
  subclassId: string | null,
): SkillRollMinimum[] {
  const minimums: SkillRollMinimum[] = [];

  // Bardo — Elocuencia: Lengua de Plata (nv 3) — Persuasión/Engaño: min 10
  if (
    character.clase === "bardo" &&
    subclassId === "colegio_elocuencia" &&
    character.nivel >= 3 &&
    (skill === "engano" || skill === "persuasion")
  ) {
    minimums.push({ minDieValue: 10, featureName: "Lengua de Plata" });
  }

  // Pícaro: Talento Fiable (nv 7) — competentes: min 10
  if (character.clase === "picaro" && character.nivel >= 7 && isProficient) {
    minimums.push({ minDieValue: 10, featureName: "Talento Fiable" });
  }

  // Pícaro — Inquisitivo: Oído para el Engaño (nv 3) — Perspicacia: min 8
  if (
    character.clase === "picaro" &&
    subclassId === "inquisitivo" &&
    character.nivel >= 3 &&
    skill === "perspicacia"
  ) {
    minimums.push({ minDieValue: 8, featureName: "Oído para el Engaño" });
  }

  return minimums;
}

/** Detecta bonificadores pasivos extra. */
function collectPassiveBonuses(
  character: Character,
  skill: SkillKey,
  isProficient: boolean,
  subclassId: string | null,
): SkillPassiveBonus[] {
  const bonuses: SkillPassiveBonus[] = [];

  // Bardo: "Aprendiz de ..." (nv 2) — +½ comp en no-competentes
  if (character.clase === "bardo" && character.nivel >= 2 && !isProficient) {
    const halfProf = Math.floor(character.proficiencyBonus / 2);
    if (halfProf > 0) {
      bonuses.push({ bonus: halfProf, featureName: "Aprendiz de todo", includedInBase: false });
    }
  }

  // Explorador — Errante Feérico: Encanto Sobrenatural (nv 3) — +SAB a CAR
  if (
    character.clase === "explorador" &&
    subclassId === "errante_feerico" &&
    character.nivel >= 3 &&
    CHA_SKILLS.has(skill)
  ) {
    const bonus = character.abilityScores.sab.modifier;
    if (bonus !== 0) {
      bonuses.push({ bonus, featureName: "Encanto Sobrenatural", includedInBase: false });
    }
  }

  // Guerrero — Samurái: Cortesano Elegante (nv 7) — +SAB a Persuasión
  if (
    character.clase === "guerrero" &&
    subclassId === "samurai" &&
    character.nivel >= 7 &&
    skill === "persuasion"
  ) {
    const wisMod = character.abilityScores.sab.modifier;
    if (wisMod > 0) {
      bonuses.push({ bonus: wisMod, featureName: "Cortesano Elegante", includedInBase: false });
    }
  }

  return bonuses;
}

// ─── Función principal ──────────────────────────────────────────────

/**
 * Detecta TODOS los modificadores pasivos que aplican a una tirada
 * de habilidad concreta del personaje.
 *
 * @param character - Personaje activo.
 * @param skill     - Clave de la habilidad que se va a lanzar.
 * @returns Objeto con los modificadores detectados.
 */
export function getSkillRollModifiers(
  character: Character,
  skill: SkillKey,
): SkillRollModifiers {
  const profLevel = character.skillProficiencies[skill]?.level;
  const isProficient =
    profLevel === "proficient" || profLevel === "expertise";

  // Resolver el ID interno de la subclase (character.subclase puede ser nombre o ID)
  const subclassId = resolveSubclassId(character);

  // 1. Mínimos en el d20
  const minimums = collectMinimums(character, skill, isProficient, subclassId);
  const bestMinimum =
    minimums.length === 0
      ? null
      : minimums.reduce<SkillRollMinimum>(
          (best, cur) =>
            cur.minDieValue > best.minDieValue ? cur : best,
          minimums[0],
        );

  // 2. Retirada de 1 natural
  const rerollNat1: SkillRollReroll | null =
    character.raza === "mediano"
      ? { featureName: "Afortunado" }
      : null;

  // 3. Bonificadores pasivos extra
  const passiveBonuses = collectPassiveBonuses(character, skill, isProficient, subclassId);

  return {
    minimum: bestMinimum,
    rerollNat1,
    passiveBonuses,
  };
}

// ─── Retrocompatibilidad ─────────────────────────────────────────────

/**
 * Devuelve el mínimo de d20 más alto para una habilidad, o `null`.
 * (Wrapper para compatibilidad con el código que ya usa esta función.)
 */
export function getSkillCheckMinimum(
  character: Character,
  skill: SkillKey,
): SkillRollMinimum | null {
  return getSkillRollModifiers(character, skill).minimum;
}
