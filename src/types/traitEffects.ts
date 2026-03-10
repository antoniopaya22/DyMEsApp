/**
 * Tipos para efectos mecánicos de rasgos (raciales, de clase, de subclase).
 * Cada variante describe un tipo de bonificación que un rasgo puede otorgar.
 */

import type { AbilityKey, DamageType, SkillKey } from "./character";

// ── Fórmulas de CA alternativas ──────────────────────────────────────

export type ACFormula =
  | { type: "standard" } // 10 + DEX (por defecto)
  | { type: "unarmoredDefense"; abilities: AbilityKey[] } // 10 + sum(abilities)
  | { type: "naturalArmor"; baseAC: number }; // baseAC + DEX

export interface ACFormulaEffect {
  kind: "acFormula";
  /** Fórmula de CA sin armadura */
  formula: ACFormula;
  /** ¿Permite usar escudo con esta fórmula? */
  allowShield: boolean;
}

export interface ACBonusEffect {
  kind: "acBonus";
  /** Bonificador plano a la CA */
  bonus: number;
  /** Condición textual (ej. "con armadura pesada") */
  condition?: string;
}

// ── Velocidad ────────────────────────────────────────────────────────

export interface SpeedBonusEffect {
  kind: "speedBonus";
  /** Bonificador a velocidad base caminando (en pies) */
  walkBonus?: number;
  /** Establece velocidad de nado (número fijo o "walk" = igual a caminar) */
  swim?: number | "walk";
  /** Establece velocidad de trepar */
  climb?: number | "walk";
  /** Establece velocidad de vuelo (número fijo o "walk" = igual a caminar) */
  fly?: number | "walk";
  /** Condición textual (ej. "sin armadura pesada") */
  condition?: string;
}

// ── Resistencias / Inmunidades ───────────────────────────────────────

export interface DamageModifierEffect {
  kind: "damageModifier";
  damageType: DamageType;
  modifier: "resistance" | "immunity" | "vulnerability";
}

// ── Competencias ─────────────────────────────────────────────────────

export interface ProficiencyEffect {
  kind: "proficiency";
  armors?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
}

// ── Competencia en habilidades ───────────────────────────────────────

export interface SkillProficiencyEffect {
  kind: "skillProficiency";
  skills: SkillKey[];
  level: "proficient" | "expertise";
}

// ── Competencia en salvaciones ───────────────────────────────────────

export interface SavingThrowProficiencyEffect {
  kind: "savingThrowProficiency";
  abilities: AbilityKey[] | "all";
}

// ── Bonificador a iniciativa ─────────────────────────────────────────

export interface InitiativeBonusEffect {
  kind: "initiativeBonus";
  /** Característica que se suma a la iniciativa */
  abilityBonus?: AbilityKey;
  /** Bonificador fijo */
  flatBonus?: number;
  /** ¿Usa el bonificador de competencia? */
  addProficiencyBonus?: boolean;
}

// ── PG extra ─────────────────────────────────────────────────────────

export interface HPBonusEffect {
  kind: "hpBonus";
  /** PG extra por nivel de la clase (ej. Resiliencia Dracónica = 1) */
  perLevel: number;
  /** PG extra plano al obtener el rasgo */
  flat?: number;
}

// ── Visión en la oscuridad ───────────────────────────────────────────

export interface DarkvisionEffect {
  kind: "darkvision";
  /** Rango en pies. Si el personaje ya tiene darkvision, usa el mayor. */
  range: number;
  /** ¿Sumar al rango existente en vez de reemplazar? */
  additive?: boolean;
}

// ── Usos limitados (para rasgos que deberían tener tracking) ─────────

export interface LimitedUseEffect {
  kind: "limitedUse";
  /** Usos máximos (puede ser un número fijo o "proficiencyBonus") */
  maxUses: number | "proficiencyBonus";
  /** Tipo de recarga */
  recharge: "short_rest" | "long_rest" | "dawn";
}

// ── Unión discriminada ───────────────────────────────────────────────

export type TraitEffect =
  | ACFormulaEffect
  | ACBonusEffect
  | SpeedBonusEffect
  | DamageModifierEffect
  | ProficiencyEffect
  | SkillProficiencyEffect
  | SavingThrowProficiencyEffect
  | InitiativeBonusEffect
  | HPBonusEffect
  | DarkvisionEffect
  | LimitedUseEffect;
