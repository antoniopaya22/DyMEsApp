/**
 * Datos SRD de clases de D&D 5e en español.
 * Incluye las 12 clases del SRD con dados de golpe, competencias,
 * tiradas de salvación, habilidades disponibles y lanzamiento de conjuros.
 */

import type {
  ClassId,
  AbilityKey,
  SkillKey,
  HitDie,
} from "@/types/character";
import type { CasterType } from "@/types/spell";

// ─── Tipos de datos de clase ─────────────────────────────────────────

export interface ClassFeature {
  nombre: string;
  descripcion: string;
  nivel: number;
}

export interface EquipmentChoice {
  id: string;
  label: string;
  options: {
    id: string;
    label: string;
    items: string[];
  }[];
}

export interface ClassData {
  id: ClassId;
  nombre: string;
  descripcion: string;
  hitDie: HitDie;
  /** PG a nivel 1 = hitDieMax + mod. Constitución */
  hitDieMax: number;
  /** PG fijos por nivel (promedio redondeado arriba) */
  hitDieFixed: number;

  // ── Competencias ──
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  /** Opciones de herramienta a elegir (ej: bardo elige un instrumento musical) */
  toolChoices?: string[];
  toolChoiceCount?: number;

  // ── Tiradas de salvación ──
  savingThrows: [AbilityKey, AbilityKey];

  // ── Habilidades ──
  /** Pool de habilidades disponibles para elegir */
  skillChoicePool: SkillKey[];
  /** Número de habilidades a elegir */
  skillChoiceCount: number;

  // ── Lanzamiento de conjuros ──
  casterType: CasterType;
  /** Aptitud mágica (null si no lanza conjuros) */
  spellcastingAbility: AbilityKey | null;
  /** Si prepara conjuros (clérigo, druida, paladín, mago) vs conoce (bardo, hechicero, brujo, explorador) */
  preparesSpells: boolean;
  /** Número de trucos conocidos a nivel 1 (0 si no tiene) */
  cantripsAtLevel1: number;
  /** Número de conjuros de nivel 1 conocidos/en libro a nivel 1 */
  spellsAtLevel1: number;

  // ── Equipo inicial (opciones) ──
  equipmentChoices: EquipmentChoice[];
  /** Equipo que siempre se obtiene */
  defaultEquipment: string[];

  // ── Rasgos de clase a nivel 1 ──
  level1Features: ClassFeature[];

  // ── Subclase ──
  subclassLevel: number;
  subclassLabel: string;

  // ── UI ──
  iconName: string;
  color: string;
}

// ─── Datos de clases ─────────────────────────────────────────────────

export const CLASSES: Record<ClassId, ClassData> = {
  // ─── BÁRBARO ───────────────────────────────────────────────────────
  barbaro: {
    id: "barbaro",
    nombre: "Bárbaro",
    descripcion:
      "Un guerrero feroz que recurre a la furia primordial para arrasar a sus enemigos en el campo de batalla.",
    hitDie: "d12",
    hitDieMax: 12,
    hitDieFixed: 7,

    armorProficiencies: [
      "Armaduras ligeras",
      "Armaduras medias",
      "Escudos",
    ],
    weaponProficiencies: ["Armas sencillas", "Armas marciales"],
    toolProficiencies: [],

    savingThrows: ["fue", "con"],

    skillChoicePool: [
      "atletismo",
      "intimidacion",
      "naturaleza",
      "percepcion",
      "supervivencia",
      "trato_con_animales",
    ],
    skillChoiceCount: 2,

    casterType: "none",
    spellcastingAbility: null,
    preparesSpells: false,
    cantripsAtLevel1: 0,
    spellsAtLevel1: 0,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma principal",
        options: [
          {
            id: "greataxe",
            label: "Un hacha a dos manos",
            items: ["Hacha a dos manos"],
          },
          {
            id: "martial_melee",
            label: "Cualquier arma cuerpo a cuerpo marcial",
            items: ["Arma marcial cuerpo a cuerpo (a elegir)"],
          },
        ],
      },
      {
        id: "weapon2",
        label: "Arma secundaria",
        options: [
          {
            id: "handaxes",
            label: "Dos hachas de mano",
            items: ["Hacha de mano", "Hacha de mano"],
          },
          {
            id: "simple",
            label: "Cualquier arma sencilla",
            items: ["Arma sencilla (a elegir)"],
          },
        ],
      },
    ],
    defaultEquipment: [
      "Paquete de explorador",
      "Jabalina ×4",
    ],

    level1Features: [
      {
        nombre: "Furia",
        descripcion:
          "Puedes usar una acción adicional para enfurecerte. Ganas ventaja en pruebas y salvaciones de FUE, bonificador al daño cuerpo a cuerpo (+2), y resistencia al daño contundente, cortante y perforante. Dura 10 asaltos. Usos: 2 (aumentan con el nivel).",
        nivel: 1,
      },
      {
        nombre: "Defensa sin Armadura",
        descripcion:
          "Mientras no lleves armadura, tu CA es 10 + mod. Destreza + mod. Constitución. Puedes usar escudo y mantener este beneficio.",
        nivel: 1,
      },
      {
        nombre: "Maestría con Armas",
        descripcion:
          "Ganas la propiedad de Maestría de dos armas con las que tengas competencia. Puedes cambiar una cada descanso largo.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Senda Primordial",
    iconName: "flash-outline",
    color: "#ea580c",
  },

  // ─── BARDO ─────────────────────────────────────────────────────────
  bardo: {
    id: "bardo",
    nombre: "Bardo",
    descripcion:
      "Un maestro de la canción, el habla y la magia que teje su arte en la realidad, inspirando aliados y confundiendo enemigos.",
    hitDie: "d8",
    hitDieMax: 8,
    hitDieFixed: 5,

    armorProficiencies: ["Armaduras ligeras"],
    weaponProficiencies: [
      "Armas sencillas",
      "Ballestas de mano",
      "Espadas cortas",
      "Espadas largas",
      "Estoques",
    ],
    toolProficiencies: [],
    toolChoices: [
      "Laúd",
      "Flauta",
      "Lira",
      "Cuerno",
      "Viola",
      "Tambor",
      "Dulcémele",
      "Gaita",
      "Chirimía",
      "Zanfona",
    ],
    toolChoiceCount: 3,

    savingThrows: ["des", "car"],

    skillChoicePool: [
      "acrobacias",
      "atletismo",
      "engano",
      "historia",
      "interpretacion",
      "intimidacion",
      "investigacion",
      "juego_de_manos",
      "medicina",
      "naturaleza",
      "percepcion",
      "perspicacia",
      "persuasion",
      "religion",
      "sigilo",
      "supervivencia",
      "trato_con_animales",
      "arcanos",
    ],
    skillChoiceCount: 3,

    casterType: "full",
    spellcastingAbility: "car",
    preparesSpells: true,
    cantripsAtLevel1: 2,
    spellsAtLevel1: 4,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma",
        options: [
          {
            id: "rapier",
            label: "Un estoque",
            items: ["Estoque"],
          },
          {
            id: "longsword",
            label: "Una espada larga",
            items: ["Espada larga"],
          },
          {
            id: "simple",
            label: "Cualquier arma sencilla",
            items: ["Arma sencilla (a elegir)"],
          },
        ],
      },
      {
        id: "pack",
        label: "Paquete",
        options: [
          {
            id: "diplomat",
            label: "Paquete de diplomático",
            items: ["Paquete de diplomático"],
          },
          {
            id: "entertainer",
            label: "Paquete de entretenedor",
            items: ["Paquete de entretenedor"],
          },
        ],
      },
    ],
    defaultEquipment: [
      "Armadura de cuero",
      "Daga",
      "Instrumento musical (a elegir)",
    ],

    level1Features: [
      {
        nombre: "Lanzamiento de Conjuros",
        descripcion:
          "Puedes lanzar conjuros de bardo usando el Carisma como aptitud mágica. Preparas conjuros de la lista de bardo tras cada descanso largo. Trucos: 2, Conjuros preparados: nivel de bardo + mod. de Carisma (mínimo 1).",
        nivel: 1,
      },
      {
        nombre: "Inspiración de Bardo",
        descripcion:
          "Puedes inspirar a otros con tu arte. Un aliado a 18 m que pueda oírte gana un dado de Inspiración de Bardo (d6) que puede sumar a una tirada de ataque, característica o salvación. Usos: mod. Carisma por descanso largo.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Colegio de Bardo",
    iconName: "musical-notes-outline",
    color: "#a855f7",
  },

  // ─── BRUJO ─────────────────────────────────────────────────────────
  brujo: {
    id: "brujo",
    nombre: "Brujo",
    descripcion:
      "Un portador de magia derivada de un pacto con una entidad de otro plano, que usa invocaciones y conjuros alimentados por un poder ajeno.",
    hitDie: "d8",
    hitDieMax: 8,
    hitDieFixed: 5,

    armorProficiencies: ["Armaduras ligeras"],
    weaponProficiencies: ["Armas sencillas"],
    toolProficiencies: [],

    savingThrows: ["sab", "car"],

    skillChoicePool: [
      "arcanos",
      "engano",
      "historia",
      "intimidacion",
      "investigacion",
      "naturaleza",
      "religion",
    ],
    skillChoiceCount: 2,

    casterType: "pact",
    spellcastingAbility: "car",
    preparesSpells: false,
    cantripsAtLevel1: 2,
    spellsAtLevel1: 2,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma principal",
        options: [
          {
            id: "light_crossbow",
            label: "Una ballesta ligera y 20 virotes",
            items: ["Ballesta ligera", "Virotes ×20"],
          },
          {
            id: "simple",
            label: "Cualquier arma sencilla",
            items: ["Arma sencilla (a elegir)"],
          },
        ],
      },
      {
        id: "focus",
        label: "Canalizador",
        options: [
          {
            id: "component_pouch",
            label: "Un saquito de componentes",
            items: ["Saquito de componentes"],
          },
          {
            id: "arcane_focus",
            label: "Un canalizador arcano",
            items: ["Canalizador arcano"],
          },
        ],
      },
    ],
    defaultEquipment: [
      "Armadura de cuero",
      "Arma sencilla (a elegir)",
      "Paquete de explorador de mazmorras",
      "Daga ×2",
    ],

    level1Features: [
      {
        nombre: "Invocaciones Sobrenaturales",
        descripcion:
          "Obtienes 1 Invocación Sobrenatural a tu elección (como Pacto del Tomo, Pacto del Filo o Pacto de la Cadena). Ganas más según tu nivel de brujo.",
        nivel: 1,
      },
      {
        nombre: "Magia de Pacto",
        descripcion:
          "Conoces 2 trucos y preparas 2 conjuros de nivel 1 de brujo. Tus espacios de Magia de Pacto se recuperan tras un descanso corto o largo. CAR es tu aptitud mágica.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Subclase de Brujo",
    iconName: "eye-outline",
    color: "#8b5cf6",
  },

  // ─── CLÉRIGO ───────────────────────────────────────────────────────
  clerigo: {
    id: "clerigo",
    nombre: "Clérigo",
    descripcion:
      "Un canalizador del poder divino que emplea la fe y la devoción a su deidad para curar, proteger y castigar a los enemigos de su dios.",
    hitDie: "d8",
    hitDieMax: 8,
    hitDieFixed: 5,

    armorProficiencies: [
      "Armaduras ligeras",
      "Armaduras medias",
      "Escudos",
    ],
    weaponProficiencies: ["Armas sencillas"],
    toolProficiencies: [],

    savingThrows: ["sab", "car"],

    skillChoicePool: [
      "historia",
      "medicina",
      "perspicacia",
      "persuasion",
      "religion",
    ],
    skillChoiceCount: 2,

    casterType: "full",
    spellcastingAbility: "sab",
    preparesSpells: true,
    cantripsAtLevel1: 3,
    spellsAtLevel1: 0,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma",
        options: [
          {
            id: "mace",
            label: "Una maza",
            items: ["Maza"],
          },
          {
            id: "warhammer",
            label: "Un martillo de guerra (si eres competente)",
            items: ["Martillo de guerra"],
          },
        ],
      },
      {
        id: "armor",
        label: "Armadura",
        options: [
          {
            id: "scale_mail",
            label: "Una cota de escamas",
            items: ["Cota de escamas"],
          },
          {
            id: "leather",
            label: "Una armadura de cuero",
            items: ["Armadura de cuero"],
          },
          {
            id: "chain_mail",
            label: "Una cota de malla (si eres competente)",
            items: ["Cota de malla"],
          },
        ],
      },
      {
        id: "weapon2",
        label: "Arma secundaria",
        options: [
          {
            id: "light_crossbow",
            label: "Una ballesta ligera y 20 virotes",
            items: ["Ballesta ligera", "Virotes ×20"],
          },
          {
            id: "simple",
            label: "Cualquier arma sencilla",
            items: ["Arma sencilla (a elegir)"],
          },
        ],
      },
      {
        id: "pack",
        label: "Paquete",
        options: [
          {
            id: "priest",
            label: "Paquete de sacerdote",
            items: ["Paquete de sacerdote"],
          },
          {
            id: "explorer",
            label: "Paquete de explorador",
            items: ["Paquete de explorador"],
          },
        ],
      },
    ],
    defaultEquipment: ["Escudo", "Símbolo sagrado"],

    level1Features: [
      {
        nombre: "Lanzamiento de Conjuros",
        descripcion:
          "Puedes lanzar conjuros de clérigo usando la Sabiduría como aptitud mágica. Conoces 3 trucos (4 al nivel 4, 5 al nivel 10). Preparas conjuros de nivel 1+: elige 4 conjuros de nivel 1 de la lista de clérigo. Puedes cambiar la lista tras cada descanso largo.",
        nivel: 1,
      },
      {
        nombre: "Orden Divino",
        descripcion:
          "Elige un rol sagrado: Protector (competencia con armas marciales y armadura pesada) o Taumaturgo (un truco de clérigo extra y bonus de mod. SAB a pruebas de Arcano o Religión).",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Dominio Divino",
    iconName: "medkit-outline",
    color: "#f59e0b",
  },

  // ─── DRUIDA ────────────────────────────────────────────────────────
  druida: {
    id: "druida",
    nombre: "Druida",
    descripcion:
      "Un sacerdote de la Vieja Fe que extrae su poder de la fuerza divina de la naturaleza, capaz de adoptar formas animales y conjurar la energía de los elementos.",
    hitDie: "d8",
    hitDieMax: 8,
    hitDieFixed: 5,

    armorProficiencies: [
      "Armaduras ligeras",
      "Armaduras medias",
      "Escudos (no metálicos)",
    ],
    weaponProficiencies: [
      "Bastones",
      "Cimitarras",
      "Clavas",
      "Dagas",
      "Dardos",
      "Hoces",
      "Jabalinas",
      "Mazas",
      "Hondas",
      "Lanzas",
    ],
    toolProficiencies: ["Kit de herboristería"],

    savingThrows: ["int", "sab"],

    skillChoicePool: [
      "arcanos",
      "medicina",
      "naturaleza",
      "percepcion",
      "perspicacia",
      "religion",
      "supervivencia",
      "trato_con_animales",
    ],
    skillChoiceCount: 2,

    casterType: "full",
    spellcastingAbility: "sab",
    preparesSpells: true,
    cantripsAtLevel1: 2,
    spellsAtLevel1: 0,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma/escudo",
        options: [
          {
            id: "shield_wood",
            label: "Un escudo de madera",
            items: ["Escudo de madera"],
          },
          {
            id: "simple",
            label: "Cualquier arma sencilla",
            items: ["Arma sencilla (a elegir)"],
          },
        ],
      },
      {
        id: "weapon2",
        label: "Arma secundaria",
        options: [
          {
            id: "scimitar",
            label: "Una cimitarra",
            items: ["Cimitarra"],
          },
          {
            id: "simple_melee",
            label: "Cualquier arma sencilla cuerpo a cuerpo",
            items: ["Arma sencilla cuerpo a cuerpo (a elegir)"],
          },
        ],
      },
    ],
    defaultEquipment: [
      "Armadura de cuero",
      "Paquete de explorador",
      "Canalizador druídico",
    ],

    level1Features: [
      {
        nombre: "Druídico",
        descripcion:
          "Conoces el druídico, el idioma secreto de los druidas. Siempre tienes preparado Hablar con Animales. Puedes dejar mensajes ocultos (CD 15 INT Investigación para detectar, no descifrar).",
        nivel: 1,
      },
      {
        nombre: "Orden Primordial",
        descripcion:
          "Elige un rol sagrado. Mago: truco de druida extra y +mod. SAB (mín. +1) a pruebas de INT (Arcanos/Naturaleza). Guardián: competencia con armas marciales y armaduras medias.",
        nivel: 1,
      },
      {
        nombre: "Lanzamiento de Conjuros",
        descripcion:
          "Puedes lanzar conjuros de druida usando la Sabiduría como aptitud mágica. Conoces 2 trucos. Preparas conjuros de nv1+ según la tabla de Druida.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Círculo Druídico",
    iconName: "leaf-outline",
    color: "#16a34a",
  },

  // ─── EXPLORADOR ────────────────────────────────────────────────────
  explorador: {
    id: "explorador",
    nombre: "Explorador",
    descripcion:
      "Un guerrero de la espesura que emplea el combate marcial y la magia de la naturaleza para defender los confines de la civilización.",
    hitDie: "d10",
    hitDieMax: 10,
    hitDieFixed: 6,

    armorProficiencies: [
      "Armaduras ligeras",
      "Armaduras medias",
      "Escudos",
    ],
    weaponProficiencies: ["Armas sencillas", "Armas marciales"],
    toolProficiencies: [],

    savingThrows: ["fue", "des"],

    skillChoicePool: [
      "atletismo",
      "investigacion",
      "naturaleza",
      "percepcion",
      "perspicacia",
      "sigilo",
      "supervivencia",
      "trato_con_animales",
    ],
    skillChoiceCount: 3,

    casterType: "half",
    spellcastingAbility: "sab",
    preparesSpells: true,
    cantripsAtLevel1: 0,
    spellsAtLevel1: 2,

    equipmentChoices: [
      {
        id: "armor",
        label: "Armadura",
        options: [
          {
            id: "scale_mail",
            label: "Una cota de escamas",
            items: ["Cota de escamas"],
          },
          {
            id: "leather",
            label: "Una armadura de cuero",
            items: ["Armadura de cuero"],
          },
        ],
      },
      {
        id: "weapon1",
        label: "Armas",
        options: [
          {
            id: "two_shortswords",
            label: "Dos espadas cortas",
            items: ["Espada corta", "Espada corta"],
          },
          {
            id: "two_simple_melee",
            label: "Dos armas sencillas cuerpo a cuerpo",
            items: [
              "Arma sencilla cuerpo a cuerpo (a elegir)",
              "Arma sencilla cuerpo a cuerpo (a elegir)",
            ],
          },
        ],
      },
    ],
    defaultEquipment: [
      "Paquete de explorador de mazmorras",
      "Arco largo",
      "Aljaba con 20 flechas",
    ],

    level1Features: [
      {
        nombre: "Lanzamiento de Conjuros",
        descripcion:
          "Has aprendido a canalizar la esencia mágica de la naturaleza para lanzar conjuros. SAB es tu aptitud mágica. Preparas conjuros de la lista de explorador.",
        nivel: 1,
      },
      {
        nombre: "Enemigo Predilecto",
        descripcion:
          "Siempre tienes preparado Marca del Cazador. Puedes lanzarlo varias veces sin gastar espacio de conjuro; recuperas todos los usos tras un descanso largo.",
        nivel: 1,
      },
      {
        nombre: "Maestría con Armas",
        descripcion:
          "Puedes usar las propiedades de maestría de dos tipos de armas con las que tengas competencia. Puedes cambiar tus elecciones tras cada descanso largo.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Subclase de Explorador",
    iconName: "compass-outline",
    color: "#059669",
  },

  // ─── GUERRERO ──────────────────────────────────────────────────────
  guerrero: {
    id: "guerrero",
    nombre: "Guerrero",
    descripcion:
      "Un maestro del combate marcial que domina una amplia variedad de armas y armaduras para sobrevivir en cualquier campo de batalla.",
    hitDie: "d10",
    hitDieMax: 10,
    hitDieFixed: 6,

    armorProficiencies: ["Todas las armaduras", "Escudos"],
    weaponProficiencies: ["Armas sencillas", "Armas marciales"],
    toolProficiencies: [],

    savingThrows: ["fue", "con"],

    skillChoicePool: [
      "acrobacias",
      "atletismo",
      "historia",
      "intimidacion",
      "percepcion",
      "perspicacia",
      "supervivencia",
      "trato_con_animales",
    ],
    skillChoiceCount: 2,

    casterType: "none",
    spellcastingAbility: null,
    preparesSpells: false,
    cantripsAtLevel1: 0,
    spellsAtLevel1: 0,

    equipmentChoices: [
      {
        id: "armor",
        label: "Armadura",
        options: [
          {
            id: "chain_mail",
            label: "Una cota de malla",
            items: ["Cota de malla"],
          },
          {
            id: "leather_longbow",
            label: "Armadura de cuero, arco largo y 20 flechas",
            items: ["Armadura de cuero", "Arco largo", "Flechas ×20"],
          },
        ],
      },
      {
        id: "weapon1",
        label: "Arma principal",
        options: [
          {
            id: "martial_shield",
            label: "Un arma marcial y un escudo",
            items: ["Arma marcial (a elegir)", "Escudo"],
          },
          {
            id: "two_martial",
            label: "Dos armas marciales",
            items: [
              "Arma marcial (a elegir)",
              "Arma marcial (a elegir)",
            ],
          },
        ],
      },
      {
        id: "weapon2",
        label: "Arma a distancia",
        options: [
          {
            id: "light_crossbow",
            label: "Una ballesta ligera y 20 virotes",
            items: ["Ballesta ligera", "Virotes ×20"],
          },
          {
            id: "handaxes",
            label: "Dos hachas de mano",
            items: ["Hacha de mano", "Hacha de mano"],
          },
        ],
      },
      {
        id: "pack",
        label: "Paquete",
        options: [
          {
            id: "dungeoneer",
            label: "Paquete de explorador de mazmorras",
            items: ["Paquete de explorador de mazmorras"],
          },
          {
            id: "explorer",
            label: "Paquete de explorador",
            items: ["Paquete de explorador"],
          },
        ],
      },
    ],
    defaultEquipment: [],

    level1Features: [
      {
        nombre: "Estilo de Combate",
        descripcion:
          "Obtienes la dote de Estilo de Combate de tu elección (se recomienda Defensa). Al subir de nivel de guerrero puedes cambiarla.",
        nivel: 1,
      },
      {
        nombre: "Tomar Aliento",
        descripcion:
          "Como acción adicional, recuperas PG = 1d10 + tu nivel de guerrero. 2 usos iniciales. Recuperas 1 en descanso corto, todos en descanso largo.",
        nivel: 1,
      },
      {
        nombre: "Maestría con Armas",
        descripcion:
          "Puedes usar las propiedades de maestría de 3 tipos de armas sencillas o marciales. Cambias una elección al terminar un descanso largo.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Arquetipo Marcial",
    iconName: "shield-outline",
    color: "#64748b",
  },

  // ─── HECHICERO ─────────────────────────────────────────────────────
  hechicero: {
    id: "hechicero",
    nombre: "Hechicero",
    descripcion:
      "Un lanzador de conjuros que extrae su magia innata de un don o de un linaje, capaz de doblar y retorcer los conjuros para adaptarlos a sus necesidades.",
    hitDie: "d6",
    hitDieMax: 6,
    hitDieFixed: 4,

    armorProficiencies: [],
    weaponProficiencies: [
      "Ballestas ligeras",
      "Bastones",
      "Dagas",
      "Dardos",
      "Hondas",
    ],
    toolProficiencies: [],

    savingThrows: ["con", "car"],

    skillChoicePool: [
      "arcanos",
      "engano",
      "intimidacion",
      "perspicacia",
      "persuasion",
      "religion",
    ],
    skillChoiceCount: 2,

    casterType: "full",
    spellcastingAbility: "car",
    preparesSpells: true,
    cantripsAtLevel1: 4,
    spellsAtLevel1: 2,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma",
        options: [
          {
            id: "light_crossbow",
            label: "Una ballesta ligera y 20 virotes",
            items: ["Ballesta ligera", "Virotes ×20"],
          },
          {
            id: "simple",
            label: "Cualquier arma sencilla",
            items: ["Arma sencilla (a elegir)"],
          },
        ],
      },
      {
        id: "focus",
        label: "Canalizador",
        options: [
          {
            id: "component_pouch",
            label: "Un saquito de componentes",
            items: ["Saquito de componentes"],
          },
          {
            id: "arcane_focus",
            label: "Un canalizador arcano",
            items: ["Canalizador arcano"],
          },
        ],
      },
    ],
    defaultEquipment: [
      "Paquete de explorador de mazmorras",
      "Daga ×2",
    ],

    level1Features: [
      {
        nombre: "Lanzamiento de Conjuros",
        descripcion:
          "Puedes lanzar conjuros de hechicero usando el Carisma como aptitud mágica. Conoces 4 trucos y preparas 2 conjuros de nivel 1.",
        nivel: 1,
      },
      {
        nombre: "Hechicería Innata",
        descripcion:
          "Como acción adicional, desatas tu magia innata durante 1 minuto: la CD de tus conjuros de hechicero aumenta en 1 y tienes ventaja en tiradas de ataque de conjuros. 2 usos por descanso largo.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Origen Mágico",
    iconName: "sparkles-outline",
    color: "#c026d3",
  },

  // ─── MAGO ──────────────────────────────────────────────────────────
  mago: {
    id: "mago",
    nombre: "Mago",
    descripcion:
      "Un erudito de la magia arcana que emplea el estudio meticuloso y la memorización de conjuros para doblegar la realidad a su voluntad.",
    hitDie: "d6",
    hitDieMax: 6,
    hitDieFixed: 4,

    armorProficiencies: [],
    weaponProficiencies: [
      "Ballestas ligeras",
      "Bastones",
      "Dagas",
      "Dardos",
      "Hondas",
    ],
    toolProficiencies: [],

    savingThrows: ["int", "sab"],

    skillChoicePool: [
      "arcanos",
      "historia",
      "investigacion",
      "medicina",
      "perspicacia",
      "religion",
    ],
    skillChoiceCount: 2,

    casterType: "full",
    spellcastingAbility: "int",
    preparesSpells: true,
    cantripsAtLevel1: 3,
    spellsAtLevel1: 6,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma",
        options: [
          {
            id: "quarterstaff",
            label: "Un bastón",
            items: ["Bastón"],
          },
          {
            id: "dagger",
            label: "Una daga",
            items: ["Daga"],
          },
        ],
      },
      {
        id: "focus",
        label: "Canalizador",
        options: [
          {
            id: "component_pouch",
            label: "Un saquito de componentes",
            items: ["Saquito de componentes"],
          },
          {
            id: "arcane_focus",
            label: "Un canalizador arcano",
            items: ["Canalizador arcano"],
          },
        ],
      },
      {
        id: "pack",
        label: "Paquete",
        options: [
          {
            id: "scholar",
            label: "Paquete de erudito",
            items: ["Paquete de erudito"],
          },
          {
            id: "explorer",
            label: "Paquete de explorador",
            items: ["Paquete de explorador"],
          },
        ],
      },
    ],
    defaultEquipment: ["Libro de conjuros"],

    level1Features: [
      {
        nombre: "Lanzamiento de Conjuros",
        descripcion:
          "Puedes lanzar conjuros de mago usando INT como aptitud mágica. Conoces 3 trucos. Tu libro de conjuros contiene 6 conjuros de nv1. Preparas conjuros según la tabla de Mago. Ganas +2 conjuros al libro por cada nivel.",
        nivel: 1,
      },
      {
        nombre: "Adepto de Rituales",
        descripcion:
          "Puedes lanzar cualquier conjuro como ritual si tiene la etiqueta Ritual y está en tu libro de conjuros. No necesitas tenerlo preparado.",
        nivel: 1,
      },
      {
        nombre: "Recuperación Arcana",
        descripcion:
          "Al terminar un descanso corto, puedes recuperar espacios de conjuro cuya suma de niveles ≤ mitad de tu nivel de mago (redondeando arriba), sin que ningún espacio sea de nv6+. Una vez por descanso largo.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Subclase de Mago",
    iconName: "book-outline",
    color: "#2563eb",
  },

  // ─── MONJE ─────────────────────────────────────────────────────────
  monje: {
    id: "monje",
    nombre: "Monje",
    descripcion:
      "Un maestro de las artes marciales que canaliza el poder del cuerpo para lograr perfección física y espiritual, empleando la concentración como arma.",
    hitDie: "d8",
    hitDieMax: 8,
    hitDieFixed: 5,

    armorProficiencies: [],
    weaponProficiencies: [
      "Armas sencillas cuerpo a cuerpo",
      "Armas marciales cuerpo a cuerpo con propiedad Ligera",
    ],
    toolProficiencies: [],
    toolChoices: [
      "Herramientas de artesano (a elegir)",
      "Instrumento musical (a elegir)",
    ],
    toolChoiceCount: 1,

    savingThrows: ["fue", "des"],

    skillChoicePool: [
      "acrobacias",
      "atletismo",
      "historia",
      "perspicacia",
      "religion",
      "sigilo",
    ],
    skillChoiceCount: 2,

    casterType: "none",
    spellcastingAbility: null,
    preparesSpells: false,
    cantripsAtLevel1: 0,
    spellsAtLevel1: 0,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma",
        options: [
          {
            id: "shortsword",
            label: "Una espada corta",
            items: ["Espada corta"],
          },
          {
            id: "simple",
            label: "Cualquier arma sencilla",
            items: ["Arma sencilla (a elegir)"],
          },
        ],
      },
      {
        id: "pack",
        label: "Paquete",
        options: [
          {
            id: "dungeoneer",
            label: "Paquete de explorador de mazmorras",
            items: ["Paquete de explorador de mazmorras"],
          },
          {
            id: "explorer",
            label: "Paquete de explorador",
            items: ["Paquete de explorador"],
          },
        ],
      },
    ],
    defaultEquipment: ["Dardos ×10"],

    level1Features: [
      {
        nombre: "Artes Marciales",
        descripcion:
          "Dominas estilos de combate con golpes desarmados y armas de monje (sencillas cuerpo a cuerpo y marciales ligeras). Sin armadura ni escudo: puedes usar DES en lugar de FUE para ataques y daño; tus armas de monje usan un d6 de daño (sube con el nivel); puedes hacer un golpe desarmado como acción adicional. También puedes usar DES en lugar de FUE para determinar la CD de Agarrar o Empujar.",
        nivel: 1,
      },
      {
        nombre: "Defensa sin Armadura",
        descripcion:
          "Mientras no lleves armadura ni empuñes un escudo, tu CA es 10 + mod. Destreza + mod. Sabiduría.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Subclase de Monje",
    iconName: "hand-left-outline",
    color: "#0891b2",
  },

  // ─── PALADÍN ───────────────────────────────────────────────────────
  paladin: {
    id: "paladin",
    nombre: "Paladín",
    descripcion:
      "Un guerrero sagrado unido a un juramento que canaliza el poder divino para proteger a los inocentes y castigar a los malvados.",
    hitDie: "d10",
    hitDieMax: 10,
    hitDieFixed: 6,

    armorProficiencies: ["Todas las armaduras", "Escudos"],
    weaponProficiencies: ["Armas sencillas", "Armas marciales"],
    toolProficiencies: [],

    savingThrows: ["sab", "car"],

    skillChoicePool: [
      "atletismo",
      "intimidacion",
      "medicina",
      "perspicacia",
      "persuasion",
      "religion",
    ],
    skillChoiceCount: 2,

    casterType: "half",
    spellcastingAbility: "car",
    preparesSpells: true,
    cantripsAtLevel1: 0,
    spellsAtLevel1: 2,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma principal",
        options: [
          {
            id: "martial_shield",
            label: "Un arma marcial y un escudo",
            items: ["Arma marcial (a elegir)", "Escudo"],
          },
          {
            id: "two_martial",
            label: "Dos armas marciales",
            items: [
              "Arma marcial (a elegir)",
              "Arma marcial (a elegir)",
            ],
          },
        ],
      },
      {
        id: "weapon2",
        label: "Arma secundaria",
        options: [
          {
            id: "javelins",
            label: "Cinco jabalinas",
            items: ["Jabalina ×5"],
          },
          {
            id: "simple_melee",
            label: "Cualquier arma sencilla cuerpo a cuerpo",
            items: ["Arma sencilla cuerpo a cuerpo (a elegir)"],
          },
        ],
      },
      {
        id: "pack",
        label: "Paquete",
        options: [
          {
            id: "priest",
            label: "Paquete de sacerdote",
            items: ["Paquete de sacerdote"],
          },
          {
            id: "explorer",
            label: "Paquete de explorador",
            items: ["Paquete de explorador"],
          },
        ],
      },
    ],
    defaultEquipment: ["Cota de malla", "Símbolo sagrado"],

    level1Features: [
      {
        nombre: "Imposición de Manos",
        descripcion:
          "Tu toque bendito puede curar heridas. Tienes una reserva de poder curativo (5 × nivel de paladín) que se repone tras un descanso largo. Como acción adicional, restauras PG o gastas 5 puntos para eliminar la condición Envenenado.",
        nivel: 1,
      },
      {
        nombre: "Lanzamiento de Conjuros",
        descripcion:
          "Has aprendido a lanzar conjuros mediante oración y meditación. CAR es tu aptitud mágica. Preparas conjuros de la lista de paladín.",
        nivel: 1,
      },
      {
        nombre: "Maestría con Armas",
        descripcion:
          "Puedes usar las propiedades de maestría de dos tipos de armas con las que tengas competencia. Puedes cambiar tus elecciones tras cada descanso largo.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Subclase de Paladín",
    iconName: "sunny-outline",
    color: "#eab308",
  },

  // ─── PÍCARO ────────────────────────────────────────────────────────
  picaro: {
    id: "picaro",
    nombre: "Pícaro",
    descripcion:
      "Un hábil especialista en sigilo, trampas y ataques precisos que aprovecha la astucia y la agilidad para superar cualquier obstáculo.",
    hitDie: "d8",
    hitDieMax: 8,
    hitDieFixed: 5,

    armorProficiencies: ["Armaduras ligeras"],
    weaponProficiencies: [
      "Armas sencillas",
      "Ballestas de mano",
      "Espadas cortas",
      "Espadas largas",
      "Estoques",
    ],
    toolProficiencies: ["Herramientas de ladrón"],

    savingThrows: ["des", "int"],

    skillChoicePool: [
      "acrobacias",
      "atletismo",
      "engano",
      "interpretacion",
      "intimidacion",
      "investigacion",
      "juego_de_manos",
      "percepcion",
      "perspicacia",
      "persuasion",
      "sigilo",
    ],
    skillChoiceCount: 4,

    casterType: "none",
    spellcastingAbility: null,
    preparesSpells: false,
    cantripsAtLevel1: 0,
    spellsAtLevel1: 0,

    equipmentChoices: [
      {
        id: "weapon1",
        label: "Arma principal",
        options: [
          {
            id: "rapier",
            label: "Un estoque",
            items: ["Estoque"],
          },
          {
            id: "shortsword",
            label: "Una espada corta",
            items: ["Espada corta"],
          },
        ],
      },
      {
        id: "weapon2",
        label: "Arma secundaria",
        options: [
          {
            id: "shortbow",
            label: "Un arco corto y aljaba con 20 flechas",
            items: ["Arco corto", "Aljaba", "Flechas ×20"],
          },
          {
            id: "shortsword2",
            label: "Una espada corta",
            items: ["Espada corta"],
          },
        ],
      },
      {
        id: "pack",
        label: "Paquete",
        options: [
          {
            id: "burglar",
            label: "Paquete de ladrón",
            items: ["Paquete de ladrón"],
          },
          {
            id: "dungeoneer",
            label: "Paquete de explorador de mazmorras",
            items: ["Paquete de explorador de mazmorras"],
          },
          {
            id: "explorer",
            label: "Paquete de explorador",
            items: ["Paquete de explorador"],
          },
        ],
      },
    ],
    defaultEquipment: [
      "Armadura de cuero",
      "Daga ×2",
      "Herramientas de ladrón",
    ],

    level1Features: [
      {
        nombre: "Pericia",
        descripcion:
          "Elige dos competencias en habilidades (o una habilidad y herramientas de ladrón). Tu bonificador por competencia se duplica para pruebas que usen esas competencias.",
        nivel: 1,
      },
      {
        nombre: "Ataque Furtivo",
        descripcion:
          "Una vez por turno, puedes infligir 1d6 de daño adicional a una criatura que impactes con un ataque si tienes ventaja o si un aliado está a 1,5 m del objetivo. El arma debe ser sutil o a distancia.",
        nivel: 1,
      },
      {
        nombre: "Jerga de Ladrones",
        descripcion:
          "Conoces la jerga de ladrones, un lenguaje secreto de señales, símbolos y argot que permite ocultar mensajes en conversaciones aparentemente normales.",
        nivel: 1,
      },
      {
        nombre: "Maestría con Armas",
        descripcion:
          "Tu entrenamiento con armas te permite usar la propiedad de Maestría de dos tipos de arma con las que tengas competencia. Cuando terminas un descanso largo, puedes cambiar un tipo de arma por otro.",
        nivel: 1,
      },
    ],

    subclassLevel: 3,
    subclassLabel: "Arquetipo de Pícaro",
    iconName: "eye-off-outline",
    color: "#374151",
  },
};

// ─── Funciones auxiliares ────────────────────────────────────────────

/**
 * Obtiene los datos completos de una clase por su ID.
 */
export function getClassData(classId: ClassId): ClassData {
  return CLASSES[classId];
}

/**
 * Devuelve la lista de clases como un array ordenado para selección.
 */
export function getClassList(): ClassData[] {
  return Object.values(CLASSES);
}

/**
 * Devuelve si la clase es lanzadora de conjuros.
 */
export function isSpellcaster(classId: ClassId): boolean {
  return CLASSES[classId].casterType !== "none";
}

/**
 * Devuelve si la clase tiene conjuros a nivel 1.
 */
export function hasSpellsAtLevel1(classId: ClassId): boolean {
  const cls = CLASSES[classId];
  return cls.cantripsAtLevel1 > 0 || cls.spellsAtLevel1 > 0;
}

/**
 * Calcula los PG a nivel 1 de una clase.
 */
export function calcLevel1HP(classId: ClassId, conModifier: number): number {
  const cls = CLASSES[classId];
  return cls.hitDieMax + conModifier;
}

/**
 * Iconos Ionicons representativos de cada clase.
 */
export const CLASS_ICONS: Record<ClassId, string> = {
  barbaro: "hammer-outline",
  bardo: "musical-notes-outline",
  brujo: "eye-outline",
  clerigo: "medkit-outline",
  druida: "leaf-outline",
  explorador: "compass-outline",
  guerrero: "shield-outline",
  hechicero: "sparkles-outline",
  mago: "book-outline",
  monje: "hand-left-outline",
  paladin: "sunny-outline",
  picaro: "cut-outline",
};

/**
 * Descripción corta de cada aptitud mágica según la clase.
 */
export const SPELLCASTING_DESCRIPTIONS: Partial<Record<ClassId, string>> = {
  bardo:
    "El Carisma es tu aptitud mágica. Conoces un número fijo de conjuros que eliges de la lista de bardo.",
  brujo:
    "El Carisma es tu aptitud mágica. Preparas conjuros de la lista de brujo. Tus espacios de Magia de Pacto se recuperan tras un descanso corto o largo.",
  clerigo:
    "La Sabiduría es tu aptitud mágica. Preparas conjuros cada día de entre toda la lista de clérigo.",
  druida:
    "La Sabiduría es tu aptitud mágica. Preparas conjuros cada día de entre toda la lista de druida.",
  explorador:
    "La Sabiduría es tu aptitud mágica. Preparas conjuros de la lista de explorador cada descanso largo.",
  hechicero:
    "El Carisma es tu aptitud mágica. Tu magia es innata. Conoces un número fijo de conjuros y puedes usar Puntos de Hechicería para modificarlos.",
  mago:
    "La Inteligencia es tu aptitud mágica. Registras conjuros en tu libro de conjuros y preparas una selección cada descanso largo. Puedes lanzar rituales del libro sin prepararlos.",
  paladin:
    "El Carisma es tu aptitud mágica. Preparas conjuros de la lista de paladín cada descanso largo.",
};

// ─── Constantes derivadas (fuente única de verdad) ───────────────────

/**
 * Tipo de lanzador por clase, derivado de CLASSES.
 * Antes hardcodeado en constants/spells.ts — ahora esta es la fuente canónica.
 */
export const CLASS_CASTER_TYPE_FROM_CLASSES = Object.fromEntries(
  Object.entries(CLASSES).map(([id, c]) => [id, c.casterType]),
) as Record<ClassId, CasterType>;

/**
 * Característica de lanzamiento por clase, derivada de CLASSES.
 * Antes hardcodeado en constants/spells.ts — ahora esta es la fuente canónica.
 */
export const SPELLCASTING_ABILITY_FROM_CLASSES = Object.fromEntries(
  Object.entries(CLASSES)
    .filter(([, c]) => c.spellcastingAbility !== null)
    .map(([id, c]) => [id, c.spellcastingAbility]),
) as Partial<Record<ClassId, AbilityKey>>;

/**
 * Tipo de preparación de conjuros por clase, derivado de CLASSES.
 */
export const CLASS_SPELL_PREPARATION_FROM_CLASSES = Object.fromEntries(
  Object.entries(CLASSES).map(([id, c]) => {
    if (c.casterType === "none") return [id, "none"] as const;
    if (c.preparesSpells) {
      return [id, id === "mago" ? "spellbook" : "prepared"] as const;
    }
    return [id, "known"] as const;
  }),
) as Record<ClassId, "known" | "prepared" | "spellbook" | "none">;
