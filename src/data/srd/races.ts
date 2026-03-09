/**
 * Datos SRD de razas de D&D 5e en español.
 * Incluye las 9 razas del SRD con subrazas, bonificadores, rasgos y competencias.
 */

import type { RaceId, SubraceId, AbilityKey, SkillKey, Size } from "@/types/character";
import type { CustomRaceConfig } from "@/types/creation";

// ─── Tipos de datos de raza ──────────────────────────────────────────

export interface RaceTrait {
  nombre: string;
  descripcion: string;
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
  /** Característica de aptitud mágica */
  ability: AbilityKey;
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
  /** Velocidad no reducida por armadura pesada */
  speedNotReducedByArmor?: boolean;
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
  { id: "azul", dragon: "Azul", damageType: "Relámpago", breathWeapon: "Línea de 1,5×9 m", breathSave: "des" },
  { id: "blanco", dragon: "Blanco", damageType: "Frío", breathWeapon: "Cono de 4,5 m", breathSave: "con" },
  { id: "bronce", dragon: "Bronce", damageType: "Relámpago", breathWeapon: "Línea de 1,5×9 m", breathSave: "des" },
  { id: "cobre", dragon: "Cobre", damageType: "Ácido", breathWeapon: "Línea de 1,5×9 m", breathSave: "des" },
  { id: "negro", dragon: "Negro", damageType: "Ácido", breathWeapon: "Línea de 1,5×9 m", breathSave: "des" },
  { id: "oro", dragon: "Oro", damageType: "Fuego", breathWeapon: "Cono de 4,5 m", breathSave: "des" },
  { id: "oropel", dragon: "Oropel", damageType: "Fuego", breathWeapon: "Línea de 1,5×9 m", breathSave: "des" },
  { id: "plata", dragon: "Plata", damageType: "Frío", breathWeapon: "Cono de 4,5 m", breathSave: "con" },
  { id: "rojo", dragon: "Rojo", damageType: "Fuego", breathWeapon: "Cono de 4,5 m", breathSave: "des" },
  { id: "verde", dragon: "Verde", damageType: "Veneno", breathWeapon: "Cono de 4,5 m", breathSave: "con" },
];

// ─── Datos de razas ──────────────────────────────────────────────────

export const RACES: Record<RaceId, RaceData> = {
  // ─── ENANO ─────────────────────────────────────────────────────────
  enano: {
    id: "enano",
    nombre: "Enano",
    descripcion:
      "Robustos, resistentes y forjados en la piedra. Los enanos son conocidos por su resistencia, su amor por la artesanía y su inquebrantable sentido del honor.",
    abilityBonuses: { con: 2 },
    size: "mediano",
    speed: 25,
    speedNotReducedByArmor: true,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Resistencia Enana",
        descripcion:
          "Tienes ventaja en las tiradas de salvación contra veneno y posees resistencia al daño de veneno.",
      },
      {
        nombre: "Entrenamiento de Combate Enano",
        descripcion:
          "Eres competente con hachas de guerra, hachas de mano, martillos de guerra y martillos ligeros.",
      },
      {
        nombre: "Afinidad con la Piedra",
        descripcion:
          "Cuando hagas una prueba de Inteligencia (Historia) relacionada con el origen de un trabajo en piedra, se te considerará competente en Historia y sumarás el doble de tu bonificador por competencia.",
      },
    ],
    languages: ["Común", "Enano"],
    weaponProficiencies: [
      "Hacha de guerra",
      "Hacha de mano",
      "Martillo de guerra",
      "Martillo ligero",
    ],
    toolChoices: [
      "Herramientas de albañil",
      "Herramientas de herrero",
      "Suministros de cervecero",
    ],
    toolChoiceCount: 1,
    subraces: [
      {
        id: "enano_colinas",
        nombre: "Enano de las Colinas",
        descripcion:
          "Posees sentidos agudos, una profunda intuición y una resistencia extraordinaria.",
        abilityBonuses: { sab: 1 },
        traits: [
          {
            nombre: "Aguante Enano",
            descripcion:
              "Tus puntos de golpe máximos se incrementan en 1 y aumentarán en 1 más cada vez que subas de nivel.",
          },
        ],
        hpBonusPerLevel: 1,
      },
      {
        id: "enano_montanas",
        nombre: "Enano de las Montañas",
        descripcion:
          "Eres fuerte y robusto, acostumbrado a una vida dura en terrenos escabrosos.",
        abilityBonuses: { fue: 2 },
        traits: [
          {
            nombre: "Entrenamiento con Armadura Enana",
            descripcion:
              "Eres competente con las armaduras ligeras y medias.",
          },
        ],
        armorProficiencies: ["Armaduras ligeras", "Armaduras medias"],
      },
    ],
  },

  // ─── ELFO ──────────────────────────────────────────────────────────
  elfo: {
    id: "elfo",
    nombre: "Elfo",
    descripcion:
      "Esbeltos, ágiles y conectados con la magia. Los elfos son seres longevos con sentidos agudos y una conexión profunda con la naturaleza y el mundo feérico.",
    abilityBonuses: { des: 2 },
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Sentidos Agudos",
        descripcion: "Eres competente en la habilidad Percepción.",
      },
      {
        nombre: "Linaje Feérico",
        descripcion:
          "Tienes ventaja en las tiradas de salvación para evitar que te hechicen y la magia no puede dormirte.",
      },
      {
        nombre: "Trance",
        descripcion:
          "Los elfos no necesitan dormir. Meditan profundamente durante 4 horas al día, obteniendo los mismos beneficios que un humano con 8 horas de sueño.",
      },
    ],
    languages: ["Común", "Élfico"],
    skillProficiencies: ["percepcion"],
    subraces: [
      {
        id: "alto_elfo",
        nombre: "Alto Elfo",
        descripcion:
          "Posees una mente aguda y un dominio de, como mínimo, los rudimentos de la magia.",
        abilityBonuses: { int: 1 },
        traits: [
          {
            nombre: "Entrenamiento con Armas Élficas",
            descripcion:
              "Eres competente con espadas cortas, espadas largas, arcos cortos y arcos largos.",
          },
          {
            nombre: "Truco",
            descripcion:
              "Conoces un truco de tu elección de la lista de conjuros de mago. La Inteligencia es tu aptitud mágica para lanzarlo.",
          },
          {
            nombre: "Idioma Adicional",
            descripcion:
              "Puedes hablar, leer y escribir un idioma adicional de tu elección.",
          },
        ],
        weaponProficiencies: [
          "Espada corta",
          "Espada larga",
          "Arco corto",
          "Arco largo",
        ],
        extraLanguages: 1,
        racialSpellcasting: {
          ability: "int",
          spells: [
            // El jugador elige 1 truco de mago — se gestiona como cantrip elegible
            // El spellId se resuelve en la creación (racialCantripChoice del draft)
          ],
        },
      },
      {
        id: "elfo_bosque",
        nombre: "Elfo del Bosque",
        descripcion:
          "Posees sentidos e intuición agudos, y tus pies ágiles te llevan rápida y sigilosamente a través de tus bosques nativos.",
        abilityBonuses: { sab: 1 },
        speedOverride: 35,
        traits: [
          {
            nombre: "Entrenamiento con Armas Élficas",
            descripcion:
              "Eres competente con espadas cortas, espadas largas, arcos cortos y arcos largos.",
          },
          {
            nombre: "Pies Ligeros",
            descripcion:
              "Tu velocidad base caminando aumenta a 10,5 m (35 pies).",
          },
          {
            nombre: "Máscara de la Espesura",
            descripcion:
              "Puedes intentar esconderte incluso cuando estés levemente oculto por follaje, lluvia intensa, nieve u otro fenómeno natural.",
          },
        ],
        weaponProficiencies: [
          "Espada corta",
          "Espada larga",
          "Arco corto",
          "Arco largo",
        ],
      },
      {
        id: "elfo_oscuro",
        nombre: "Elfo Oscuro (Drow)",
        descripcion:
          "Descendientes de una subraza de elfos de piel oscura que fueron desterrados al Infraoscuro.",
        abilityBonuses: { car: 1 },
        traits: [
          {
            nombre: "Visión en la Oscuridad Superior",
            descripcion:
              "Tu visión en la oscuridad tiene un alcance de 36 m (120 pies).",
          },
          {
            nombre: "Sensibilidad a la Luz Solar",
            descripcion:
              "Tienes desventaja en tiradas de ataque y en pruebas de Sabiduría (Percepción) basadas en la vista cuando tú, el objetivo o lo que intentas percibir está bajo la luz solar directa.",
          },
          {
            nombre: "Magia Drow",
            descripcion:
              "Conoces el truco luces danzantes. Al nivel 3 puedes lanzar hadas de fuego una vez al día. Al nivel 5 puedes lanzar oscuridad una vez al día. El Carisma es tu aptitud mágica.",
          },
          {
            nombre: "Entrenamiento con Armas Drow",
            descripcion:
              "Eres competente con estoques, espadas cortas y ballestas de mano.",
          },
        ],
        weaponProficiencies: [
          "Estoque",
          "Espada corta",
          "Ballesta de mano",
        ],
        darkvisionOverride: 120,
        racialSpellcasting: {
          ability: "car",
          spells: [
            { spellId: "luces_danzantes", minLevel: 1, isCantrip: true },
            { spellId: "fuego_feerico", minLevel: 3 },
            { spellId: "oscuridad", minLevel: 5 },
          ],
        },
      },
    ],
  },

  // ─── MEDIANO ───────────────────────────────────────────────────────
  mediano: {
    id: "mediano",
    nombre: "Mediano",
    descripcion:
      "Pequeños, ágiles y tremendamente afortunados. Los medianos son gente amable y curiosa que valora la comodidad del hogar pero no teme a la aventura.",
    abilityBonuses: { des: 2 },
    size: "pequeno",
    speed: 25,
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
    ],
    languages: ["Común", "Mediano"],
    subraces: [
      {
        id: "mediano_piesligeros",
        nombre: "Mediano Piesligeros",
        descripcion:
          "Puedes esconderte con facilidad, incluso tras otras personas. Eres afable y te llevas bien con los demás.",
        abilityBonuses: { car: 1 },
        traits: [
          {
            nombre: "Sigiloso por Naturaleza",
            descripcion:
              "Puedes intentar esconderte incluso tras una criatura cuyo tamaño sea, al menos, una categoría superior al tuyo.",
          },
        ],
      },
      {
        id: "mediano_fornido",
        nombre: "Mediano Fornido",
        descripcion:
          "Más resistente que otros medianos, se dice que llevan sangre enana en sus venas.",
        abilityBonuses: { con: 1 },
        traits: [
          {
            nombre: "Resistencia de los Fornidos",
            descripcion:
              "Tienes ventaja en las tiradas de salvación contra veneno y posees resistencia al daño de veneno.",
          },
        ],
      },
    ],
  },

  // ─── HUMANO ────────────────────────────────────────────────────────
  humano: {
    id: "humano",
    nombre: "Humano",
    descripcion:
      "Versátiles, ambiciosos y diversos. Los humanos son la raza más adaptable y abundante, capaces de destacar en cualquier campo gracias a su determinación.",
    abilityBonuses: { fue: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 },
    size: "mediano",
    speed: 30,
    darkvision: false,
    traits: [],
    languages: ["Común"],
    extraLanguages: 1,
    subraces: [],
  },

  // ─── DRACÓNIDO ─────────────────────────────────────────────────────
  draconido: {
    id: "draconido",
    nombre: "Dracónido",
    descripcion:
      "Descendientes de dragones, los dracónidos son guerreros orgullosos con aliento destructivo y escamas que reflejan su linaje ancestral.",
    abilityBonuses: { fue: 2, car: 1 },
    size: "mediano",
    speed: 30,
    darkvision: false,
    traits: [
      {
        nombre: "Linaje Dracónico",
        descripcion:
          "Posees la sangre de los dragones. Elige un tipo de dragón: tu Ataque de Aliento y Resistencia al Daño vendrán determinados por este linaje.",
      },
      {
        nombre: "Ataque de Aliento",
        descripcion:
          "Puedes usar tu acción para exhalar energía destructora. La CD es 8 + mod. Constitución + bonificador por competencia. Daño: 2d6 (aumenta a 3d6 a nivel 6, 4d6 a nivel 11, 5d6 a nivel 16). Se recupera tras un descanso corto o largo.",
      },
      {
        nombre: "Resistencia al Daño",
        descripcion:
          "Posees resistencia al tipo de daño asociado a tu Linaje Dracónico.",
      },
    ],
    languages: ["Común", "Dracónico"],
    lineageRequired: true,
    subraces: [],
  },

  // ─── GNOMO ─────────────────────────────────────────────────────────
  gnomo: {
    id: "gnomo",
    nombre: "Gnomo",
    descripcion:
      "Ingeniosos, curiosos y llenos de energía. Los gnomos combinan una mente brillante con un espíritu alegre que les impulsa a explorar todos los misterios del mundo.",
    abilityBonuses: { int: 2 },
    size: "pequeno",
    speed: 25,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Astucia Gnoma",
        descripcion:
          "Tienes ventaja en todas las tiradas de salvación de Inteligencia, Sabiduría y Carisma contra magia.",
      },
    ],
    languages: ["Común", "Gnomo"],
    subraces: [
      {
        id: "gnomo_bosque",
        nombre: "Gnomo del Bosque",
        descripcion:
          "Posees una habilidad natural para la ilusión y la rapidez innata, así como una conexión con los animales pequeños.",
        abilityBonuses: { des: 1 },
        traits: [
          {
            nombre: "Ilusionista Nato",
            descripcion:
              "Conoces el truco ilusión menor. La Inteligencia es tu aptitud mágica para lanzarlo.",
          },
          {
            nombre: "Hablar con las Bestias Pequeñas",
            descripcion:
              "Puedes comunicarte con bestias de tamaño Pequeño o inferior mediante sonidos y gestos simples.",
          },
        ],
        cantrips: ["ilusion_menor"],
        racialSpellcasting: {
          ability: "int",
          spells: [
            { spellId: "ilusion_menor", minLevel: 1, isCantrip: true },
          ],
        },
      },
      {
        id: "gnomo_rocas",
        nombre: "Gnomo de las Rocas",
        descripcion:
          "Posees un ingenio natural y eres más resistente que otros gnomos.",
        abilityBonuses: { con: 1 },
        traits: [
          {
            nombre: "Saber del Artífice",
            descripcion:
              "Cuando hagas una prueba de Inteligencia (Historia) relacionada con objetos mágicos, alquímicos o tecnológicos, sumarás el doble de tu bonificador por competencia.",
          },
          {
            nombre: "Manitas",
            descripcion:
              "Eres competente con herramientas de manitas. Puedes construir dispositivos mecánicos Diminutos (caja de música, encendedor o juguete mecánico).",
          },
        ],
        toolProficiencies: ["Herramientas de manitas"],
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
        descripcion:
          "Ganas competencia en dos habilidades de tu elección.",
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

  // ─── TIEFLING ──────────────────────────────────────────────────────
  tiefling: {
    id: "tiefling",
    nombre: "Tiefling",
    descripcion:
      "Marcados por su herencia infernal, los tieflings cargan con la desconfianza del mundo pero poseen un carisma cautivador y poderes mágicos innatos.",
    abilityBonuses: { int: 1, car: 2 },
    size: "mediano",
    speed: 30,
    darkvision: true,
    darkvisionRange: 60,
    traits: [
      {
        nombre: "Resistencia Infernal",
        descripcion: "Tienes resistencia al daño de fuego.",
      },
      {
        nombre: "Linaje Infernal",
        descripcion:
          "Conoces el truco taumaturgia. Al nivel 3 puedes lanzar reprensión infernal (nivel 2) una vez al día. Al nivel 5 puedes lanzar oscuridad una vez al día. El Carisma es tu aptitud mágica.",
      },
    ],
    languages: ["Común", "Infernal"],
    subraces: [],
    racialSpellcasting: {
      ability: "car",
      spells: [
        { spellId: "taumaturgia", minLevel: 1, isCantrip: true },
        { spellId: "reprension_infernal", minLevel: 3 },
        { spellId: "oscuridad", minLevel: 5 },
      ],
    },
  },

  // ─── HADA (Expansión) ───────────────────────────────────────────────
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
          "Conoces el truco prestidigitación. A partir del nivel 3, puedes lanzar hechizo de hada una vez al día. A partir del nivel 5, puedes lanzar aumentar/reducir una vez al día. Puedes elegir Inteligencia, Sabiduría o Carisma como aptitud mágica para estos conjuros. No necesitas componentes materiales.",
      },
    ],
    languages: ["Común", "Silvano"],
    subraces: [],
    racialSpellcasting: {
      ability: "car",
      spells: [
        { spellId: "prestidigitacion", minLevel: 1, isCantrip: true },
        { spellId: "hechizo_de_hada", minLevel: 3 },
        { spellId: "aumentar_reducir", minLevel: 5 },
      ],
    },
  },

  // ─── LIEBREN (Expansión) ───────────────────────────────────────────
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
      },
      {
        nombre: "Salto Liebren",
        descripcion:
          "Como acción bonus, puedes saltar una distancia igual a 5 veces tu bonificador de competencia sin provocar ataques de oportunidad. Puedes usar este rasgo un número de veces igual a tu bonificador de competencia, y recuperas todos los usos tras un descanso largo.",
      },
      {
        nombre: "Suerte Caprichosa",
        descripcion:
          "Cuando falles una prueba de característica, tirada de ataque, tirada de salvación o prueba de característica, puedes tirar un d4 y sumarlo al resultado, pudiendo cambiar el resultado. Puedes usar este rasgo un número de veces igual a tu bonificador de competencia y recuperas todos los usos tras un descanso largo.",
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
    traits: config.traits.map((t) => ({ nombre: t.nombre, descripcion: t.descripcion })),
    languages: config.languages.length > 0 ? config.languages : ["Común"],
    skillProficiencies: config.skillProficiencies as SkillKey[] | undefined,
    weaponProficiencies: config.weaponProficiencies,
    armorProficiencies: config.armorProficiencies,
    toolProficiencies: config.toolProficiencies,
    subraces: [],
    racialSpellcasting: config.racialSpells && config.racialSpells.length > 0
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
  subraceId: SubraceId
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
  subraceId: SubraceId
): Partial<Record<AbilityKey, number>> {
  const race = RACES[raceId];
  const subrace = subraceId
    ? race.subraces.find((s) => s.id === subraceId)
    : null;

  const bonuses: Partial<Record<AbilityKey, number>> = { ...race.abilityBonuses };

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
  subraceId: SubraceId
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
      ...race.racialSpellcasting.spells.filter((s) => s.minLevel <= characterLevel),
    );
  }
  if (subrace?.racialSpellcasting) {
    entries.push(
      ...subrace.racialSpellcasting.spells.filter((s) => s.minLevel <= characterLevel),
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
