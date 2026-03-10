/**
 * Strategy pattern for class-specific resources.
 * Each class has a factory function that returns its resources for a given level.
 * New classes can be supported by adding entries to CLASS_RESOURCE_REGISTRY.
 */

import {
  UNLIMITED_RESOURCE,
  type ClassResourceInfo,
} from "./classResourceTypes";
import { RAGE_USES } from "@/data/srd/leveling";

type ClassResourceFactory = (
  level: number,
) => Record<string, ClassResourceInfo>;

// ─── Individual class strategies ─────────────────────────────────────

function barbaroResources(level: number): Record<string, ClassResourceInfo> {
  const rageMax = RAGE_USES[level] ?? 2;
  return {
    furia: {
      id: "furia",
      nombre: "Furia",
      max: rageMax === "ilimitado" ? UNLIMITED_RESOURCE : (rageMax as number),
      current:
        rageMax === "ilimitado" ? UNLIMITED_RESOURCE : (rageMax as number),
      recovery: "long_rest",
    },
  };
}

function guerreroResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {
    tomar_aliento: {
      id: "tomar_aliento",
      nombre: "Tomar Aliento",
      max: 1,
      current: 1,
      recovery: "short_rest",
    },
  };
  if (level >= 2) {
    const oleadaMax = level >= 17 ? 2 : 1;
    resources.oleada_accion = {
      id: "oleada_accion",
      nombre: "Oleada de Acción",
      max: oleadaMax,
      current: oleadaMax,
      recovery: "short_rest",
    };
  }
  if (level >= 9) {
    const indomableMax = level >= 17 ? 3 : level >= 13 ? 2 : 1;
    resources.indomable = {
      id: "indomable",
      nombre: "Indomable",
      max: indomableMax,
      current: indomableMax,
      recovery: "long_rest",
    };
  }
  return resources;
}

function monjeResources(level: number): Record<string, ClassResourceInfo> {
  if (level < 2) return {};
  const resources: Record<string, ClassResourceInfo> = {
    ki: {
      id: "ki",
      nombre: "Puntos de Concentración",
      max: level,
      current: level,
      recovery: "short_rest",
    },
  };
  // Metabolismo Extraordinario (nivel 2+): 1 uso por descanso largo
  resources.metabolismo_extraordinario = {
    id: "metabolismo_extraordinario",
    nombre: "Metabolismo Extraordinario",
    max: 1,
    current: 1,
    recovery: "long_rest",
  };
  return resources;
}

function picaroResources(level: number): Record<string, ClassResourceInfo> {
  if (level < 20) return {};
  return {
    golpe_de_suerte: {
      id: "golpe_de_suerte",
      nombre: "Golpe de Suerte",
      max: 1,
      current: 1,
      recovery: "short_rest",
    },
  };
}

function paladinResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {
    imposicion_de_manos: {
      id: "imposicion_de_manos",
      nombre: "Imposición de Manos (PG)",
      max: level * 5,
      current: level * 5,
      recovery: "long_rest",
    },
  };
  if (level >= 3) {
    const cdMax = level >= 11 ? 3 : 2;
    resources.canalizar_divinidad = {
      id: "canalizar_divinidad",
      nombre: "Canalizar Divinidad",
      max: cdMax,
      current: cdMax,
      recovery: "short_rest",
    };
  }
  return resources;
}

function exploradorResources(level: number): Record<string, ClassResourceInfo> {
  // Enemigo Predilecto: Marca del Cazador sin gastar espacio (PHB'24)
  const freeHuntersMark = level >= 14 ? 4 : level >= 6 ? 3 : 2;
  const resources: Record<string, ClassResourceInfo> = {
    enemigo_predilecto: {
      id: "enemigo_predilecto",
      nombre: "Marca del Cazador (sin espacio)",
      max: freeHuntersMark,
      current: freeHuntersMark,
      recovery: "long_rest",
    },
  };
  // Velo de la Naturaleza (nivel 14+): mod. SAB usos por descanso largo
  // Se usa UNLIMITED_RESOURCE como placeholder; el mod. SAB real se aplica en el store
  if (level >= 14) {
    resources.velo_naturaleza = {
      id: "velo_naturaleza",
      nombre: "Velo de la Naturaleza",
      max: 1,
      current: 1,
      recovery: "long_rest",
    };
  }
  return resources;
}

function magoResources(_level: number): Record<string, ClassResourceInfo> {
  // Recuperación Arcana: 1 uso por descanso largo (todos los niveles)
  return {
    recuperacion_arcana: {
      id: "recuperacion_arcana",
      nombre: "Recuperación Arcana",
      max: 1,
      current: 1,
      recovery: "long_rest",
    },
  };
}

function bardoResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  resources.inspiracion_bardica = {
    id: "inspiracion_bardica",
    nombre: "Inspiración Bárdica",
    max: 3, // Should be CHA mod, but factory only receives level. Use 3 as default.
    current: 3,
    recovery: level >= 5 ? "short_rest" : "long_rest",
  };
  return resources;
}

function clerigoResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  if (level >= 2) {
    resources.canalizar_divinidad = {
      id: "canalizar_divinidad",
      nombre: "Canalizar Divinidad",
      max: level >= 18 ? 3 : level >= 6 ? 2 : 1,
      current: level >= 18 ? 3 : level >= 6 ? 2 : 1,
      recovery: "short_rest",
    };
  }
  return resources;
}

function druidaResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  if (level >= 2) {
    resources.forma_salvaje = {
      id: "forma_salvaje",
      nombre: "Forma Salvaje",
      max: level >= 20 ? UNLIMITED_RESOURCE : 2,
      current: level >= 20 ? UNLIMITED_RESOURCE : 2,
      recovery: "short_rest",
    };
  }
  return resources;
}

function hechiceroResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  if (level >= 2) {
    resources.puntos_hechiceria = {
      id: "puntos_hechiceria",
      nombre: "Puntos de Hechicería",
      max: level,
      current: level,
      recovery: "long_rest",
    };
  }
  return resources;
}

function brujoResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  // Astucia Mágica (nivel 2+): recuperar espacios de Magia de Pacto, 1 uso por descanso largo
  if (level >= 2) {
    resources.astucia_magica = {
      id: "astucia_magica",
      nombre: "Astucia Mágica",
      max: 1,
      current: 1,
      recovery: "long_rest",
    };
  }
  // Contactar al Patrón (nivel 9+): 1 uso por descanso largo
  if (level >= 9) {
    resources.contactar_patron = {
      id: "contactar_patron",
      nombre: "Contactar al Patrón",
      max: 1,
      current: 1,
      recovery: "long_rest",
    };
  }
  // Arcano Místico (nv6): nivel 11+
  if (level >= 11) {
    resources.arcano_mistico_6 = {
      id: "arcano_mistico_6",
      nombre: "Arcano Místico (nv6)",
      max: 1,
      current: 1,
      recovery: "long_rest",
    };
  }
  // Arcano Místico (nv7): nivel 13+
  if (level >= 13) {
    resources.arcano_mistico_7 = {
      id: "arcano_mistico_7",
      nombre: "Arcano Místico (nv7)",
      max: 1,
      current: 1,
      recovery: "long_rest",
    };
  }
  // Arcano Místico (nv8): nivel 15+
  if (level >= 15) {
    resources.arcano_mistico_8 = {
      id: "arcano_mistico_8",
      nombre: "Arcano Místico (nv8)",
      max: 1,
      current: 1,
      recovery: "long_rest",
    };
  }
  // Arcano Místico (nv9): nivel 17+
  if (level >= 17) {
    resources.arcano_mistico_9 = {
      id: "arcano_mistico_9",
      nombre: "Arcano Místico (nv9)",
      max: 1,
      current: 1,
      recovery: "long_rest",
    };
  }
  return resources;
}

// ─── Registry ────────────────────────────────────────────────────────

/** Registry mapping class names to their resource factory functions */
const CLASS_RESOURCE_REGISTRY: Record<string, ClassResourceFactory> = {
  barbaro: barbaroResources,
  bardo: bardoResources,
  brujo: brujoResources,
  clerigo: clerigoResources,
  druida: druidaResources,
  explorador: exploradorResources,
  guerrero: guerreroResources,
  hechicero: hechiceroResources,
  mago: magoResources,
  monje: monjeResources,
  paladin: paladinResources,
  picaro: picaroResources,
};

/**
 * Returns the class-specific resources for a given class and level.
 * Uses a strategy/registry pattern — add new entries to CLASS_RESOURCE_REGISTRY
 * to support additional classes.
 */
export function getClassResourcesForLevel(
  clase: string,
  level: number,
): Record<string, ClassResourceInfo> {
  const factory = CLASS_RESOURCE_REGISTRY[clase];
  return factory ? factory(level) : {};
}
