/**
 * Datos SRD de razas de D&D 5e en español.
 * Incluye las 9 razas del SRD con subrazas, bonificadores, rasgos y competencias.
 */

import type {
  RaceId,
  SubraceId,
  AbilityKey,
  SkillKey,
  Size,
} from "@/types/character";
import type { CustomRaceConfig } from "@/types/creation";
import type { TraitEffect } from "@/types/traitEffects";

// ─── Tipos de datos de raza ──────────────────────────────────────────

export interface RaceTrait {
  nombre: string;
  descripcion: string;
  /** Efectos mecánicos estructurados (opcional) */
  efectos?: TraitEffect[];
}

/** Hechizo innato otorgado por la raza/subraza a un nivel determinado */
export interface RacialSpellEntry {
  /** ID del conjuro en la base de datos de hechizos */
  spellId: string;
  /** Nivel de personaje mínimo para obtenerlo (1 = desde el inicio) */
  minLevel: number;
  /** Si es un truco (cantrip) — se puede lanzar a voluntad */
  isCantrip?: boolean;
}

/** Aptitud mágica innata de la raza/subraza */
export interface RacialSpellcasting {
  /** Característica de aptitud mágica (array = el jugador elige una) */
  ability: AbilityKey | AbilityKey[];
  /** Lista de conjuros innatos con nivel mínimo */
  spells: RacialSpellEntry[];
}

export interface SubraceData {
  id: SubraceId;
  nombre: string;
  descripcion: string;
  abilityBonuses: Partial<Record<AbilityKey, number>>;
  traits: RaceTrait[];
  /** Competencias adicionales de la subraza */
  weaponProficiencies?: string[];
  toolProficiencies?: string[];
  /** Competencias con armaduras adicionales de la subraza */
  armorProficiencies?: string[];
  /** Trucos o hechizos adicionales */
  cantrips?: string[];
  /** Conjuros innatos de la subraza (con nivel mínimo) */
  racialSpellcasting?: RacialSpellcasting;
  /** Idiomas adicionales */
  extraLanguages?: number;
  /** PG extra por nivel (ej: Enano de las Colinas) */
  hpBonusPerLevel?: number;
  /** Override de velocidad base (ej: elfo del bosque tiene 35 pies) */
  speedOverride?: number;
  /** Override del rango de visión en la oscuridad (ej: drow tiene 120 pies) */
  darkvisionOverride?: number;
}

export interface RaceData {
  id: RaceId;
  nombre: string;
  descripcion: string;
  abilityBonuses: Partial<Record<AbilityKey, number>>;
  size: Size;
  speed: number;
  /** Velocidad de vuelo en pies */
  flySpeed?: number;
  /** Velocidad de nado en pies */
  swimSpeed?: number;
  /** Velocidad de trepar en pies */
  climbSpeed?: number;
  darkvision: boolean;
  darkvisionRange?: number;
  traits: RaceTrait[];
  languages: string[];
  /** Número de idiomas adicionales a elegir */
  extraLanguages?: number;
  skillProficiencies?: SkillKey[];
  /** Número de habilidades a elegir (ej: semielfo) */
  skillChoiceCount?: number;
  /** Pool de habilidades para elegir (ej: semielfo) */
  skillChoicePool?: SkillKey[];
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  toolProficiencies?: string[];
  /** Opciones de herramientas (ej: Enano elige una) */
  toolChoices?: string[];
  toolChoiceCount?: number;
  /** Número de bonificadores de característica +1 adicionales a elegir (ej: semielfo) */
  freeAbilityBonusCount?: number;
  /** Subrazas disponibles */
  subraces: SubraceData[];
  /** Si la raza necesita elegir un linaje (ej: dracónido) */
  lineageRequired?: boolean;
  /** Conjuros innatos de la raza (con nivel mínimo) */
  racialSpellcasting?: RacialSpellcasting;
  /** PG extra por nivel (ej: Enano PHB'24 — Dwarven Toughness) */
  hpBonusPerLevel?: number;
}

// ─── Linajes dracónidos ──────────────────────────────────────────────

export interface DragonLineage {
  id: string;
  dragon: string;
  damageType: string;
  breathWeapon: string;
  breathSave: AbilityKey;
}

export const DRAGON_LINEAGES: DragonLineage[] = [
  {
    id: "azul",
    dragon: "Azul",
    damageType: "Relámpago",
    breathWeapon: "Línea de 1,5×9 m",
    breathSave: "des",
  },
  {
    id: "blanco",
    dragon: "Blanco",
    damageType: "Frío",
    breathWeapon: "Cono de 4,5 m",
    breathSave: "con",
  },
  {
    id: "bronce",
    dragon: "Bronce",
    damageType: "Relámpago",
    breathWeapon: "Línea de 1,5×9 m",
    breathSave: "des",
  },
  {
    id: "cobre",
    dragon: "Cobre",
    damageType: "Ácido",
    breathWeapon: "Línea de 1,5×9 m",
    breathSave: "des",
  },
  {
    id: "negro",
    dragon: "Negro",
    damageType: "Ácido",
    breathWeapon: "Línea de 1,5×9 m",
    breathSave: "des",
  },
  {
    id: "oro",
    dragon: "Oro",
    damageType: "Fuego",
    breathWeapon: "Cono de 4,5 m",
    breathSave: "des",
  },
  {
    id: "oropel",
    dragon: "Oropel",
    damageType: "Fuego",
    breathWeapon: "Línea de 1,5×9 m",
    breathSave: "des",
  },
  {
    id: "plata",
    dragon: "Plata",
    damageType: "Frío",
    breathWeapon: "Cono de 4,5 m",
    breathSave: "con",
  },
  {
    id: "rojo",
    dragon: "Rojo",
    damageType: "Fuego",
    breathWeapon: "Cono de 4,5 m",
    breathSave: "des",
  },
  {
    id: "verde",
    dragon: "Verde",
    damageType: "Veneno",
    breathWeapon: "Cono de 4,5 m",
    breathSave: "con",
  },
];

// ─── Datos de razas ──────────────────────────────────────────────────

export const RACES: Record<RaceId, RaceData> = {
  // ─── ENANO (PHB'24) ─────────────────────────────────────────────────
  enano: {
    id: "enano",
    nombre: "Enano",
    descripcion:
      "Robustos, resistentes y forjados en la piedra. Los enanos son conocidos por su resistencia, su amor por la artesanía y su inquebrantable sentido del honor.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 120,
    traits: [
      {
        nombre: "Resistencia Enana",
        descripcion:
          "Tienes resistencia al daño de veneno. También tienes ventaja en las tiradas de salvación que hagas para evitar o poner fin a la condición envenenado.",
        efectos: [
          {
            kind: "damageModifier",
            damageType: "veneno",
            modifier: "resistance",
          },
        ],
      },
      {
        nombre: "Afinidad con la Piedra",
        descripcion:
          "Como acción adicional, ganas Sentido del Temblor con un alcance de 18 m (60 pies) durante 10 minutos. Debes estar en una superficie de piedra, y esta termina antes si no estás en contacto con ella. Puedes usar este rasgo un número de veces igual a tu bonificador de competencia y recuperas todos los usos tras un descanso largo.",
        efectos: [
          {
            kind: "limitedUse",
            maxUses: "proficiencyBonus",
            recharge: "long_rest",
          },
        ],
      },
      {
        nombre: "Dureza Enana",
        descripcion:
          "Tus puntos de golpe máximos se incrementan en 1 y aumentarán en 1 más cada vez que subas de nivel.",
      },
    ],
    languages: ["Común", "Enano"],
    hpBonusPerLevel: 1,
    subraces: [
      {
        id: "enano_colinas",
        nombre: "Enano de las Colinas",
        descripcion:
          "(Legado PHB'14) Posees sentidos agudos, una profunda intuición y una resistencia extraordinaria.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Aguante Enano (Legado)",
            descripcion:
              "Tus puntos de golpe máximos se incrementan en 1 y aumentarán en 1 más cada vez que subas de nivel. (Incluido ya en la raza base actualizada.)",
          },
        ],
        hpBonusPerLevel: 0,
      },
      {
        id: "enano_montanas",
        nombre: "Enano de las Montañas",
        descripcion:
          "(Legado PHB'14) Eres fuerte y robusto, acostumbrado a una vida dura en terrenos escabrosos.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Entrenamiento con Armadura Enana",
            descripcion: "Eres competente con las armaduras ligeras y medias.",
          },
        ],
        armorProficiencies: ["Armaduras ligeras", "Armaduras medias"],
      },
    ],
  },

  // ─── ELFO (PHB'24) ──────────────────────────────────────────────────
  elfo: {
    id: "elfo",
    nombre: "Elfo",
    descripcion:
      "Esbeltos, ágiles y conectados con la magia. Los elfos son seres longevos con sentidos agudos y una conexión profunda con la naturaleza y el mundo feérico.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Linaje Feérico",
        descripcion:
          "Tienes ventaja en las tiradas de salvación para evitar que te hechicen.",
      },
      {
        nombre: "Agudeza Élfica",
        descripcion:
          "Eres competente en una de las siguientes habilidades a tu elección: Perspicacia, Percepción o Supervivencia.",
      },
      {
        nombre: "Trance",
        descripcion:
          "No necesitas dormir y la magia no puede dormirte. Puedes terminar un descanso largo en solo 4 horas si pasas esas horas en un trance meditativo, durante el cual permaneces consciente.",
      },
    ],
    languages: ["Común", "Élfico"],
    skillChoiceCount: 1,
    skillChoicePool: ["perspicacia", "percepcion", "supervivencia"],
    subraces: [
      {
        id: "alto_elfo",
        nombre: "Alto Elfo",
        descripcion:
          "Posees una mente aguda y un dominio de, como mínimo, los rudimentos de la magia.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Truco",
            descripcion:
              "Conoces un truco de tu elección de la lista de conjuros de mago. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica.",
          },
          {
            nombre: "Detectar Magia",
            descripcion:
              "Puedes lanzar detectar magia con este rasgo. A partir del nivel 3, también puedes lanzar paso brumoso. Puedes lanzar cada uno de estos conjuros sin un espacio de conjuros una vez, y recuperas la capacidad de hacerlo tras un descanso largo. También puedes lanzar estos conjuros usando espacios que tengas del nivel adecuado. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica.",
          },
        ],
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "detectar_magia", minLevel: 1 },
            { spellId: "paso_brumoso", minLevel: 3 },
          ],
        },
      },
      {
        id: "elfo_bosque",
        nombre: "Elfo del Bosque",
        descripcion:
          "Posees sentidos e intuición agudos, y tus pies ágiles te llevan rápida y sigilosamente a través de tus bosques nativos.",
        abilityBonuses: {},
        speedOverride: 35,
        traits: [
          {
            nombre: "Pies Ligeros",
            descripcion:
              "Tu velocidad base caminando aumenta a 10,5 m (35 pies).",
          },
          {
            nombre: "Magia del Bosque",
            descripcion:
              "Conoces el truco druidismo. A partir del nivel 3, puedes lanzar zancada larga. A partir del nivel 5, puedes lanzar pasar sin rastro. Puedes lanzar cada uno de estos conjuros sin un espacio de conjuros una vez, y recuperas la capacidad de hacerlo tras un descanso largo. También puedes lanzar estos conjuros usando espacios que tengas del nivel adecuado. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica.",
          },
        ],
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "druidismo", minLevel: 1, isCantrip: true },
            { spellId: "zancada_larga", minLevel: 3 },
            { spellId: "pasar_sin_rastro", minLevel: 5 },
          ],
        },
      },
      {
        id: "elfo_oscuro",
        nombre: "Elfo Oscuro (Drow)",
        descripcion:
          "Descendientes de una subraza de elfos de piel oscura que fueron desterrados al Infraoscuro.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Visión en la Oscuridad Superior",
            descripcion:
              "Tu visión en la oscuridad tiene un alcance de 36 m (120 pies).",
            efectos: [{ kind: "darkvision", range: 120 }],
          },
          {
            nombre: "Magia Drow",
            descripcion:
              "Conoces el truco luces danzantes. A partir del nivel 3 puedes lanzar hadas de fuego una vez al día. A partir del nivel 5 puedes lanzar oscuridad una vez al día. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica.",
          },
        ],
        darkvisionOverride: 120,
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "luces_danzantes", minLevel: 1, isCantrip: true },
            { spellId: "fuego_feerico", minLevel: 3 },
            { spellId: "oscuridad", minLevel: 5 },
          ],
        },
      },
    ],
  },

  // ─── MEDIANO (PHB'24) ───────────────────────────────────────────────
  mediano: {
    id: "mediano",
    nombre: "Mediano",
    descripcion:
      "Pequeños, ágiles y tremendamente afortunados. Los medianos son gente amable y curiosa que valora la comodidad del hogar pero no teme a la aventura.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "pequeno",
    speed: 30,
    darkvision: false,
    traits: [
      {
        nombre: "Afortunado",
        descripcion:
          "Cuando saques un 1 en el d20 al hacer una tirada de ataque, prueba de característica o tirada de salvación, puedes volver a tirar el dado y usar el nuevo resultado.",
      },
      {
        nombre: "Valiente",
        descripcion:
          "Tienes ventaja en las tiradas de salvación para evitar que te asusten.",
      },
      {
        nombre: "Agilidad de Mediano",
        descripcion:
          "Puedes moverte a través del espacio ocupado por una criatura cuyo tamaño sea, al menos, una categoría superior al tuyo.",
      },
      {
        nombre: "Sigiloso por Naturaleza",
        descripcion:
          "Puedes realizar la acción de Esconderse incluso cuando solo estés oculto por una criatura que sea al menos una categoría de tamaño superior a ti.",
      },
    ],
    languages: ["Común", "Mediano"],
    subraces: [
      {
        id: "mediano_piesligeros",
        nombre: "Mediano Piesligeros",
        descripcion:
          "(Legado PHB'14) Puedes esconderte con facilidad, incluso tras otras personas.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Sigiloso por Naturaleza (Legado)",
            descripcion:
              "Puedes intentar esconderte incluso tras una criatura cuyo tamaño sea, al menos, una categoría superior al tuyo. (Incluido ya en la raza base actualizada.)",
          },
        ],
      },
      {
        id: "mediano_fornido",
        nombre: "Mediano Fornido",
        descripcion:
          "(Legado PHB'14) Más resistente que otros medianos, se dice que llevan sangre enana en sus venas.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Resistencia de los Fornidos",
            descripcion:
              "Tienes ventaja en las tiradas de salvación contra veneno y posees resistencia al daño de veneno.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "veneno",
                modifier: "resistance",
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── HUMANO (PHB'24) ────────────────────────────────────────────────
  humano: {
    id: "humano",
    nombre: "Humano",
    descripcion:
      "Versátiles, ambiciosos y diversos. Los humanos son la raza más adaptable y abundante, capaces de destacar en cualquier campo gracias a su determinación.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "mediano",
    speed: 30,
    darkvision: false,
    traits: [
      {
        nombre: "Ingenioso",
        descripcion:
          "Ganas Inspiración Heroica cada vez que terminas un descanso largo.",
      },
      {
        nombre: "Habilidoso",
        descripcion: "Ganas competencia en una habilidad de tu elección.",
      },
      {
        nombre: "Versátil",
        descripcion:
          "Ganas una Dote de Origen de tu elección. (La selección de dotes se gestiona por separado.)",
      },
    ],
    languages: ["Común"],
    skillChoiceCount: 1,
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
    subraces: [],
  },

  // ─── DRACÓNIDO (PHB'24) ─────────────────────────────────────────────
  draconido: {
    id: "draconido",
    nombre: "Dracónido",
    descripcion:
      "Descendientes de dragones, los dracónidos son guerreros orgullosos con aliento destructivo y escamas que reflejan su linaje ancestral.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Linaje Dracónico",
        descripcion:
          "Posees la sangre de los dragones. Elige un tipo de dragón: tu Ataque de Aliento y Resistencia al Daño vendrán determinados por este linaje.",
      },
      {
        nombre: "Ataque de Aliento",
        descripcion:
          "Cuando realizas la acción de Atacar en tu turno, puedes reemplazar uno de tus ataques con una exhalación de energía mágica en un cono de 4,5 m (15 pies) o una línea de 1,5×9 m (30 pies) según tu linaje. Cada criatura en el área debe realizar una tirada de salvación (CD = 8 + mod. Constitución + bonificador por competencia). Daño: 1d10 (aumenta a 2d10 a nivel 5, 3d10 a nivel 11, 4d10 a nivel 17) en fallo, o mitad en éxito. Puedes usar este rasgo un número de veces igual a tu bonificador de competencia y recuperas todos los usos tras un descanso largo.",
        efectos: [
          {
            kind: "limitedUse",
            maxUses: "proficiencyBonus",
            recharge: "long_rest",
          },
        ],
      },
      {
        nombre: "Resistencia al Daño",
        descripcion:
          "Posees resistencia al tipo de daño asociado a tu Linaje Dracónico.",
      },
      {
        nombre: "Vuelo Dracónico",
        descripcion:
          "A partir del nivel 5, puedes usar una acción adicional para manifestar alas espectrales. Ganas velocidad de vuelo igual a tu velocidad de movimiento durante 10 minutos. Puedes usar este rasgo un número de veces igual a tu bonificador de competencia y recuperas todos los usos tras un descanso largo. No puedes usar este rasgo si llevas armadura media o pesada.",
        efectos: [
          {
            kind: "limitedUse",
            maxUses: "proficiencyBonus",
            recharge: "long_rest",
          },
        ],
      },
    ],
    languages: ["Común", "Dracónico"],
    lineageRequired: true,
    subraces: [],
  },

  // ─── GNOMO (PHB'24) ─────────────────────────────────────────────────
  gnomo: {
    id: "gnomo",
    nombre: "Gnomo",
    descripcion:
      "Ingeniosos, curiosos y llenos de energía. Los gnomos combinan una mente brillante con un espíritu alegre que les impulsa a explorar todos los misterios del mundo.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "pequeno",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Astucia Gnoma",
        descripcion:
          "Tienes ventaja en las tiradas de salvación de Inteligencia, Sabiduría y Carisma.",
      },
    ],
    languages: ["Común", "Gnomo"],
    subraces: [
      {
        id: "gnomo_bosque",
        nombre: "Gnomo del Bosque",
        descripcion:
          "Posees una habilidad natural para la ilusión y una conexión con los animales pequeños.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Ilusionista Nato",
            descripcion:
              "Conoces el truco ilusión menor. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica para lanzarlo.",
          },
          {
            nombre: "Hablar con los Animales",
            descripcion:
              "Puedes lanzar el conjuro hablar con los animales un número de veces igual a tu bonificador de competencia y recuperas todos los usos tras un descanso largo. También puedes lanzar este conjuro usando espacios que tengas del nivel adecuado.",
            efectos: [
              {
                kind: "limitedUse",
                maxUses: "proficiencyBonus",
                recharge: "long_rest",
              },
            ],
          },
        ],
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "ilusion_menor", minLevel: 1, isCantrip: true },
            { spellId: "hablar_con_los_animales", minLevel: 1 },
          ],
        },
      },
      {
        id: "gnomo_rocas",
        nombre: "Gnomo de las Rocas",
        descripcion:
          "Posees un ingenio natural y eres más resistente que otros gnomos.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Manitas",
            descripcion:
              "Conoces los trucos remendar y prestidigitación. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica para lanzarlos.",
          },
        ],
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "remendar", minLevel: 1, isCantrip: true },
            { spellId: "prestidigitacion", minLevel: 1, isCantrip: true },
          ],
        },
      },
    ],
  },

  // ─── SEMIELFO ──────────────────────────────────────────────────────
  semielfo: {
    id: "semielfo",
    nombre: "Semielfo",
    descripcion:
      "Con lo mejor de ambos mundos, los semielfos combinan la gracia élfica con la versatilidad humana, caminando entre dos culturas con carisma natural.",
    abilityBonuses: { car: 2 },
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Linaje Feérico",
        descripcion:
          "Tienes ventaja en las tiradas de salvación para evitar que te hechicen y la magia no puede dormirte.",
      },
      {
        nombre: "Versátil con Habilidades",
        descripcion: "Ganas competencia en dos habilidades de tu elección.",
      },
    ],
    languages: ["Común", "Élfico"],
    extraLanguages: 1,
    freeAbilityBonusCount: 2,
    skillChoiceCount: 2,
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
    subraces: [],
  },

  // ─── SEMIORCO ──────────────────────────────────────────────────────
  semiorco: {
    id: "semiorco",
    nombre: "Semiorco",
    descripcion:
      "Fuertes, resistentes y con una ferocidad innata. Los semiorcos combinan la brutalidad orca con la determinación humana, destacando como guerreros formidables.",
    abilityBonuses: { fue: 2, con: 1 },
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Amenazador",
        descripcion: "Eres competente en la habilidad Intimidación.",
      },
      {
        nombre: "Aguante Incansable",
        descripcion:
          "Cuando tus PG se reducen a 0 pero no mueres, puedes recuperar 1 PG. Debes terminar un descanso largo para reutilizarlo.",
        efectos: [{ kind: "limitedUse", maxUses: 1, recharge: "long_rest" }],
      },
      {
        nombre: "Ataques Salvajes",
        descripcion:
          "Cuando causes un crítico con un ataque cuerpo a cuerpo, puedes tirar uno de los dados de daño del arma una vez más y sumarlo al daño del crítico.",
      },
    ],
    languages: ["Común", "Orco"],
    skillProficiencies: ["intimidacion"],
    subraces: [],
  },

  // ─── TIEFLING (PHB'24) ──────────────────────────────────────────────
  tiefling: {
    id: "tiefling",
    nombre: "Tiefling",
    descripcion:
      "Marcados por su herencia infernal, los tieflings cargan con la desconfianza del mundo pero poseen un carisma cautivador y poderes mágicos innatos. Elige un Legado Infernal que determina tus poderes.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Legado Infernal",
        descripcion:
          "Eres heredero de un legado infernal que te otorga poderes mágicos innatos. Elige un legado: Abisal, Ctónico o Infernal.",
      },
    ],
    languages: ["Común", "Infernal"],
    racialSpellcasting: {
      ability: ["int", "sab", "car"],
      spells: [{ spellId: "taumaturgia", minLevel: 1, isCantrip: true }],
    },
    subraces: [
      {
        id: "tiefling_abisal",
        nombre: "Legado Abisal",
        descripcion:
          "Tu linaje te conecta con los Abismos, otorgándote resistencia al veneno y magia vinculada a la corrupción abisal.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Resistencia Abisal",
            descripcion: "Tienes resistencia al daño de veneno.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "veneno",
                modifier: "resistance",
              },
            ],
          },
          {
            nombre: "Magia Abisal",
            descripcion:
              "Conoces el truco taumaturgia. A partir del nivel 3, puedes lanzar rayo de enfermedad una vez. A partir del nivel 5, puedes lanzar corona de locura una vez. Recuperas la capacidad de lanzar estos conjuros tras un descanso largo. También puedes lanzarlos usando espacios de conjuros del nivel adecuado. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica.",
          },
        ],
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "rayo_de_enfermedad", minLevel: 3 },
            { spellId: "corona_de_locura", minLevel: 5 },
          ],
        },
      },
      {
        id: "tiefling_ctonico",
        nombre: "Legado Ctónico",
        descripcion:
          "Tu linaje te conecta con el inframundo, otorgándote resistencia al daño necrótico y magia vinculada a la muerte.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Resistencia Ctónica",
            descripcion: "Tienes resistencia al daño necrótico.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "necrotico",
                modifier: "resistance",
              },
            ],
          },
          {
            nombre: "Magia Ctónica",
            descripcion:
              "Conoces el truco taumaturgia. A partir del nivel 3, puedes lanzar toque gélido de la muerte una vez. A partir del nivel 5, puedes lanzar oscuridad una vez. Recuperas la capacidad de lanzar estos conjuros tras un descanso largo. También puedes lanzarlos usando espacios de conjuros del nivel adecuado. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica.",
          },
        ],
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "toque_gelido_de_la_muerte", minLevel: 3 },
            { spellId: "oscuridad", minLevel: 5 },
          ],
        },
      },
      {
        id: "tiefling_infernal",
        nombre: "Legado Infernal",
        descripcion:
          "Tu linaje te conecta con los Nueve Infiernos, otorgándote resistencia al fuego y magia infernal clásica.",
        abilityBonuses: {},
        traits: [
          {
            nombre: "Resistencia Infernal",
            descripcion: "Tienes resistencia al daño de fuego.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "fuego",
                modifier: "resistance",
              },
            ],
          },
          {
            nombre: "Magia Infernal",
            descripcion:
              "Conoces el truco taumaturgia. A partir del nivel 3, puedes lanzar reprensión infernal (nivel 2) una vez. A partir del nivel 5, puedes lanzar oscuridad una vez. Recuperas la capacidad de lanzar estos conjuros tras un descanso largo. También puedes lanzarlos usando espacios de conjuros del nivel adecuado. Puedes usar Inteligencia, Sabiduría o Carisma como aptitud mágica.",
          },
        ],
        racialSpellcasting: {
          ability: ["int", "sab", "car"],
          spells: [
            { spellId: "reprension_infernal", minLevel: 3 },
            { spellId: "oscuridad", minLevel: 5 },
          ],
        },
      },
    ],
  },

  // ─── HADA (MPMM — corregida) ────────────────────────────────────────
  hada: {
    id: "hada",
    nombre: "Hada",
    descripcion:
      "Las hadas son pequeñas criaturas feéricas aladas, vinculadas a la magia y a la naturaleza, que proceden de los Parajes Feéricos. Traviesas, curiosas y poderosas para su tamaño.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "pequeno",
    speed: 30,
    flySpeed: 30,
    darkvision: false,
    traits: [
      {
        nombre: "Tipo de Criatura: Feérico",
        descripcion:
          "Eres de tipo feérico en lugar de humanoide. Esto afecta a hechizos y efectos que especifiquen tipo de criatura (como hechizar persona).",
      },
      {
        nombre: "Vuelo",
        descripcion:
          "Tienes velocidad de vuelo igual a tu velocidad en tierra. No puedes volar si llevas armadura media o pesada.",
      },
      {
        nombre: "Magia Feérica",
        descripcion:
          "Conoces el truco druidismo. A partir del nivel 3, puedes lanzar hechizo de hada una vez al día. A partir del nivel 5, puedes lanzar aumentar/reducir una vez al día. Puedes elegir Inteligencia, Sabiduría o Carisma como aptitud mágica para estos conjuros. No necesitas componentes materiales.",
      },
    ],
    languages: ["Común", "Silvano"],
    subraces: [],
    racialSpellcasting: {
      ability: ["int", "sab", "car"],
      spells: [
        { spellId: "druidismo", minLevel: 1, isCantrip: true },
        { spellId: "hechizo_de_hada", minLevel: 3 },
        { spellId: "aumentar_reducir", minLevel: 5 },
      ],
    },
  },

  // ─── LIEBREN (MPMM — corregida) ─────────────────────────────────────
  liebren: {
    id: "liebren",
    nombre: "Liebren",
    descripcion:
      "Los liebren son humanoides con rasgos de liebre: orejas largas, patas fuertes y reflejos rápidos. Representan la suerte cambiante y la agilidad de los habitantes de los Parajes Feéricos.",
    abilityBonuses: {},
    freeAbilityBonusCount: 3,
    size: "mediano",
    speed: 30,
    darkvision: false,
    traits: [
      {
        nombre: "Reflejos de Liebre",
        descripcion:
          "Puedes sumar tu bonificador de competencia a tu tirada de iniciativa.",
        efectos: [{ kind: "initiativeBonus", addProficiencyBonus: true }],
      },
      {
        nombre: "Salto Liebren",
        descripcion:
          "Como acción bonus, puedes saltar una distancia igual a 5 veces tu bonificador de competencia sin provocar ataques de oportunidad. Puedes usar este rasgo un número de veces igual a tu bonificador de competencia, y recuperas todos los usos tras un descanso largo.",
        efectos: [
          {
            kind: "limitedUse",
            maxUses: "proficiencyBonus",
            recharge: "long_rest",
          },
        ],
      },
      {
        nombre: "Pies de la Suerte",
        descripcion:
          "Cuando falles una tirada de salvación de Destreza, puedes usar tu reacción para tirar un d4 y sumarlo al resultado, pudiendo cambiar el resultado. Puedes usar este rasgo un número de veces igual a tu bonificador de competencia y recuperas todos los usos tras un descanso largo.",
        efectos: [
          {
            kind: "limitedUse",
            maxUses: "proficiencyBonus",
            recharge: "long_rest",
          },
        ],
      },
      {
        nombre: "Pies Ágiles",
        descripcion:
          "Tu caminar ágil te hace difícil de alcanzar. Tienes competencia en la habilidad Percepción.",
      },
    ],
    languages: ["Común"],
    extraLanguages: 1,
    skillProficiencies: ["percepcion"],
    subraces: [],
  },

  // ─── PERSONALIZADA ─────────────────────────────────────────────────
  personalizada: {
    id: "personalizada",
    nombre: "Personalizada",
    descripcion:
      "Una raza personalizada con rasgos, bonificadores y habilidades definidos por el jugador.",
    abilityBonuses: {},
    size: "mediano",
    speed: 30,
    darkvision: false,
    traits: [],
    languages: ["Común"],
    subraces: [],
  },
};

// ─── Funciones auxiliares ────────────────────────────────────────────

/**
 * Construye un RaceData a partir de una configuración de raza personalizada.
 * Permite reutilizar toda la lógica de buildCharacter sin cambios.
 */
export function buildRaceDataFromCustom(config: CustomRaceConfig): RaceData {
  return {
    id: "personalizada",
    nombre: config.nombre || "Personalizada",
    descripcion: config.descripcion || "",
    abilityBonuses: config.abilityBonuses,
    size: config.size,
    speed: config.speed,
    flySpeed: config.flySpeed,
    swimSpeed: config.swimSpeed,
    climbSpeed: config.climbSpeed,
    darkvision: config.darkvision,
    darkvisionRange: config.darkvisionRange,
    traits: config.traits.map((t) => ({
      nombre: t.nombre,
      descripcion: t.descripcion,
    })),
    languages: config.languages.length > 0 ? config.languages : ["Común"],
    skillProficiencies: config.skillProficiencies as SkillKey[] | undefined,
    weaponProficiencies: config.weaponProficiencies,
    armorProficiencies: config.armorProficiencies,
    toolProficiencies: config.toolProficiencies,
    subraces: [],
    racialSpellcasting:
      config.racialSpells && config.racialSpells.length > 0
        ? {
            ability: "car" as AbilityKey, // Default spellcasting ability
            spells: config.racialSpells.map((s) => ({
              spellId: s.nombre.toLowerCase().replace(/\s+/g, "_"),
              minLevel: s.minLevel,
              isCantrip: s.isCantrip || undefined,
            })),
          }
        : undefined,
  };
}

/**
 * Obtiene los datos completos de una raza por su ID.
 */
export function getRaceData(raceId: RaceId): RaceData {
  return RACES[raceId];
}

/**
 * Obtiene los datos de una subraza específica.
 */
export function getSubraceData(
  raceId: RaceId,
  subraceId: SubraceId,
): SubraceData | null {
  if (!subraceId) return null;
  const race = RACES[raceId];
  return race.subraces.find((s) => s.id === subraceId) ?? null;
}

/**
 * Calcula los bonificadores de característica totales
 * combinando raza + subraza.
 */
export function getTotalRacialBonuses(
  raceId: RaceId,
  subraceId: SubraceId,
): Partial<Record<AbilityKey, number>> {
  const race = RACES[raceId];
  const subrace = subraceId
    ? race.subraces.find((s) => s.id === subraceId)
    : null;

  const bonuses: Partial<Record<AbilityKey, number>> = {
    ...race.abilityBonuses,
  };

  if (subrace) {
    for (const [key, value] of Object.entries(subrace.abilityBonuses)) {
      const abilityKey = key as AbilityKey;
      bonuses[abilityKey] = (bonuses[abilityKey] ?? 0) + value;
    }
  }

  return bonuses;
}

/**
 * Obtiene todos los rasgos combinados de raza + subraza.
 */
export function getAllRaceTraits(
  raceId: RaceId,
  subraceId: SubraceId,
): RaceTrait[] {
  const race = RACES[raceId];
  const subrace = subraceId
    ? race.subraces.find((s) => s.id === subraceId)
    : null;

  const traits = [...race.traits];
  if (subrace) {
    traits.push(...subrace.traits);
  }
  return traits;
}

/**
 * Devuelve la lista de razas como un array ordenado para selección.
 */
export function getRaceList(): RaceData[] {
  return Object.values(RACES);
}

/**
 * Devuelve si una raza tiene subrazas disponibles.
 */
export function hasSubraces(raceId: RaceId): boolean {
  return RACES[raceId].subraces.length > 0;
}

/**
 * Obtiene los conjuros innatos raciales disponibles a un nivel dado.
 * Combina los de la raza base y la subraza (si tiene).
 */
export function getRacialSpellsForLevel(
  raceId: RaceId,
  subraceId: SubraceId,
  characterLevel: number,
): RacialSpellEntry[] {
  const race = RACES[raceId];
  const subrace = subraceId
    ? race.subraces.find((s) => s.id === subraceId)
    : null;

  const entries: RacialSpellEntry[] = [];

  if (race.racialSpellcasting) {
    entries.push(
      ...race.racialSpellcasting.spells.filter(
        (s) => s.minLevel <= characterLevel,
      ),
    );
  }
  if (subrace?.racialSpellcasting) {
    entries.push(
      ...subrace.racialSpellcasting.spells.filter(
        (s) => s.minLevel <= characterLevel,
      ),
    );
  }

  return entries;
}

/**
 * Obtiene los conjuros innatos raciales que se desbloquean exactamente en un nivel.
 */
export function getRacialSpellsUnlockedAtLevel(
  raceId: RaceId,
  subraceId: SubraceId,
  level: number,
): RacialSpellEntry[] {
  const race = RACES[raceId];
  const subrace = subraceId
    ? race.subraces.find((s) => s.id === subraceId)
    : null;

  const entries: RacialSpellEntry[] = [];

  if (race.racialSpellcasting) {
    entries.push(
      ...race.racialSpellcasting.spells.filter((s) => s.minLevel === level),
    );
  }
  if (subrace?.racialSpellcasting) {
    entries.push(
      ...subrace.racialSpellcasting.spells.filter((s) => s.minLevel === level),
    );
  }

  return entries;
}

/**
 * Devuelve el icono emoji representativo de cada raza.
 */
export const RACE_ICONS: Record<RaceId, string> = {
  enano: "hammer-outline",
  elfo: "leaf-outline",
  mediano: "footsteps-outline",
  humano: "person-outline",
  draconido: "shield-half-outline",
  gnomo: "construct-outline",
  semielfo: "flower-outline",
  semiorco: "skull-outline",
  tiefling: "flame-outline",
  hada: "sparkles-outline",
  liebren: "paw-outline",
  personalizada: "create-outline",
};

/** IDs de razas de expansión (no SRD básico) */
export const EXPANSION_RACE_IDS: RaceId[] = ["hada", "liebren"];

/**
 * Lista de todos los idiomas estándar y exóticos disponibles para elegir.
 */
export const AVAILABLE_LANGUAGES = {
  standard: [
    "Común",
    "Enano",
    "Élfico",
    "Gigante",
    "Gnomo",
    "Goblin",
    "Mediano",
    "Orco",
  ],
  exotic: [
    "Abisal",
    "Celestial",
    "Dracónico",
    "Infernal",
    "Infracomún",
    "Primordial",
    "Silvano",
  ],
};
