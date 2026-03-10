/**
 * Tipos compartidos para los rasgos de subclase.
 * Extraídos de subclassFeatures.ts para facilitar la separación por clase.
 */

import type { ClassId } from "@/types/character";
import type { TraitEffect } from "@/types/traitEffects";

export interface SubclassChoiceOption {
  /** Identificador (slug) */
  id: string;
  /** Nombre visible */
  nombre: string;
  /** Descripción del efecto */
  descripcion: string;
}

export interface SubclassFeatureChoice {
  /** Identificador único de la elección */
  id: string;
  /** Nombre de la elección (ej. "Estilo de Combate") */
  nombre: string;
  /** Instrucción breve para el jugador */
  instruccion: string;
  /** Tipo de selección */
  tipo: "single" | "multi";
  /** Cuántas opciones elegir (solo para "multi", por defecto 1) */
  cantidad?: number;
  /** Opciones disponibles */
  opciones: SubclassChoiceOption[];
}

export interface SubclassFeatureDetail {
  /** Nombre del rasgo */
  nombre: string;
  /** Descripción completa */
  descripcion: string;
  /** Si requiere elección del jugador */
  elecciones?: SubclassFeatureChoice[];
  /** Efectos mecánicos estructurados (opcional) */
  efectos?: TraitEffect[];
}

export interface SubclassLevelBlock {
  /** Nivel en que se obtienen estos rasgos */
  nivel: number;
  /** Rasgos obtenidos */
  rasgos: SubclassFeatureDetail[];
  /** Competencias automáticas ganadas */
  competenciasGanadas?: {
    armaduras?: string[];
    armas?: string[];
    herramientas?: string[];
  };
  /** Competencia en habilidades extras (ej. Colegio del Conocimiento) */
  habilidadesExtra?: {
    cantidad: number;
    /** Si es cualquiera o un subconjunto */
    cualquiera?: boolean;
    /** Habilidades específicas entre las que elegir (vacío = cualquiera) */
    entre?: string[];
  };
}

export interface SubclassFeatureData {
  subclaseId: string;
  claseId: ClassId;
  nombre: string;
  niveles: SubclassLevelBlock[];
}
