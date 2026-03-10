/**
 * Base de datos de dotes (feats) de D&D 5e en español.
 * Incluye las 53 dotes del XPHB (PHB 2024) y 5 exclusivas de TCE.
 * Usado para la selección de dotes en la creación/progresión de personaje y en el compendio.
 */

import type { AbilityKey } from "@/types/character";

// ─── Tipos ──────────────────────────────────────────────────────────

/** Categoría de la dote según el XPHB 2024 */
export type FeatCategory = "general" | "origen" | "combate" | "epica";

/** Fuente de la dote */
export type FeatSource = "XPHB" | "TCE";

/** Efecto mecánico estructurado de una dote */
export interface FeatEffect {
  /** Tipo de efecto */
  type:
    | "asi"
    | "proficiency"
    | "spell"
    | "hp_max"
    | "speed"
    | "sense"
    | "trait";

  // ── ASI ──
  /** Características elegibles para el ASI (el jugador elige 1) */
  asiChoices?: AbilityKey[];
  /** Cantidad de incremento (default 1) */
  asiAmount?: number;

  // ── Proficiency ──
  /** Tipo de competencia */
  proficiencyType?: "armor" | "weapon" | "tool" | "saving_throw" | "skill";
  /** Valor(es) de la competencia */
  proficiencyValues?: string[];
  /** Si el jugador elige entre las opciones (vs obtener todas) */
  proficiencyChoice?: boolean;
  /** Cuántas elige (default 1) */
  proficiencyChoiceCount?: number;

  // ── Spell ──
  /** IDs de conjuros otorgados */
  spellIds?: string[];
  /** Característica de lanzamiento */
  spellAbility?: AbilityKey | "choice";
  /** Si son trucos o conjuros con nivel */
  spellLevel?: number;
  /** Veces que se puede lanzar sin gastar espacio (por descanso largo) */
  spellFreeUses?: number;

  // ── HP Max ──
  /** Bonificación fija a PV máximos */
  hpBonus?: number;
  /** Bonificación a PV máximos por nivel */
  hpBonusPerLevel?: number;

  // ── Speed ──
  /** Bonificación a velocidad en pies */
  speedBonus?: number;

  // ── Sense ──
  /** Tipo de sentido */
  senseType?: "darkvision" | "blindsight" | "tremorsense";
  /** Alcance del sentido en pies */
  senseRange?: number;

  // ── Trait ──
  /** Descripción textual del efecto mecánico */
  traitDescription?: string;
}

/** Definición completa de una dote */
export interface Feat {
  /** Identificador único (kebab-case en español) */
  id: string;
  /** Nombre en español */
  nombre: string;
  /** Nombre original en inglés */
  nombreOriginal: string;
  /** Fuente */
  fuente: FeatSource;
  /** Categoría XPHB 2024 */
  categoria: FeatCategory;
  /** Descripción general en español */
  descripcion: string;
  /** Prerrequisito (null si no tiene) */
  prerrequisito: string | null;
  /** Si se puede tomar más de una vez */
  repetible: boolean;
  /** Efectos mecánicos estructurados */
  efectos: FeatEffect[];
}

// ─── Dotes de origen (XPHB) ────────────────────────────────────────

const ORIGIN_FEATS: Feat[] = [
  // 1. Alert
  {
    id: "alerta",
    nombre: "Alerta",
    nombreOriginal: "Alert",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Siempre estás atento al peligro. Obtienes un bonificador +2 a la iniciativa, no puedes ser sorprendido mientras estés consciente, y puedes intercambiar tu resultado de iniciativa con el de una criatura aliada que puedas ver.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Bonificador +2 a las tiradas de iniciativa. No puedes ser sorprendido mientras estés consciente. Puedes intercambiar tu resultado de iniciativa con el de un aliado que puedas ver.",
      },
    ],
  },
  // 2. Crafter
  {
    id: "artesano",
    nombre: "Artesano",
    nombreOriginal: "Crafter",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Eres hábil con las herramientas de artesano. Ganas competencia con tres herramientas de artesano a tu elección. Cuando compras un objeto no mágico, puedes pagar el 80% de su precio, y al elaborar un objeto con herramientas de artesano reduces el tiempo de fabricación.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "proficiency",
        proficiencyType: "tool",
        proficiencyValues: ["Herramientas de artesano (a elegir)"],
        proficiencyChoice: true,
        proficiencyChoiceCount: 3,
      },
      {
        type: "trait",
        traitDescription:
          "Descuento del 20% al comprar objetos no mágicos. Fabricación acelerada con herramientas de artesano.",
      },
    ],
  },
  // 3. Healer
  {
    id: "sanador",
    nombre: "Sanador",
    nombreOriginal: "Healer",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Tienes aptitudes para la curación. Con un botiquín de curandero puedes gastar un uso para restaurar 2d4 + 2 puntos de golpe a una criatura, además de estabilizar criaturas inconscientes. Una criatura solo puede beneficiarse de esto una vez por descanso corto o largo.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Gasta un uso del botiquín de curandero para restaurar 2d4 + 2 PG a una criatura (una vez por descanso corto o largo por criatura). Puedes estabilizar criaturas inconscientes con una acción.",
      },
    ],
  },
  // 4. Lucky
  {
    id: "afortunado",
    nombre: "Afortunado",
    nombreOriginal: "Lucky",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Tienes una suerte inexplicable. Ganas puntos de suerte igual a tu bonificador de competencia. Puedes gastar un punto de suerte tras tirar un d20 para una tirada de ataque, prueba de característica o salvación para tirar un d20 adicional y elegir cuál usar. También puedes gastar un punto cuando un atacante tira contra ti. Recuperas todos los puntos de suerte al terminar un descanso largo.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Puntos de suerte iguales a tu bonificador de competencia (se recuperan con descanso largo). Gasta un punto tras tirar un d20 para tirar otro d20 y elegir cuál usar. También funciona contra tiradas de ataque enemigas.",
      },
    ],
  },
  // 5. Magic Initiate
  {
    id: "iniciado-en-la-magia",
    nombre: "Iniciado en la magia",
    nombreOriginal: "Magic Initiate",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Aprendes los fundamentos de una tradición mágica. Elige una clase de lanzador: Clérigo, Druida o Mago. Aprendes dos trucos de la lista de esa clase y un conjuro de nivel 1, que puedes lanzar una vez sin gastar un espacio de conjuro (se recupera con descanso largo). Tu característica de lanzamiento es Sabiduría (Clérigo o Druida) o Inteligencia (Mago). Cada vez que ganes un nivel, puedes reemplazar uno de estos conjuros por otro de la misma lista. Esta dote es repetible eligiendo una clase diferente.",
    prerrequisito: null,
    repetible: true,
    efectos: [
      {
        type: "spell",
        spellIds: [],
        spellAbility: "choice",
        spellLevel: 0,
        spellFreeUses: 0,
      },
      {
        type: "spell",
        spellIds: [],
        spellAbility: "choice",
        spellLevel: 1,
        spellFreeUses: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Elige Clérigo (Sab), Druida (Sab) o Mago (Int). Aprendes 2 trucos y 1 conjuro de nivel 1 de esa lista. El conjuro de nivel 1 se lanza 1 vez gratis por descanso largo. Repetible eligiendo otra clase.",
      },
    ],
  },
  // 6. Musician
  {
    id: "musico",
    nombre: "Músico",
    nombreOriginal: "Musician",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Eres un músico consumado. Ganas competencia con tres instrumentos musicales a tu elección. Tras terminar un descanso corto o largo mientras tocas, tú y hasta un número de aliados igual a tu bonificador de competencia que puedan oírte ganan Inspiración.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "proficiency",
        proficiencyType: "tool",
        proficiencyValues: ["Instrumento musical (a elegir)"],
        proficiencyChoice: true,
        proficiencyChoiceCount: 3,
      },
      {
        type: "trait",
        traitDescription:
          "Tras un descanso corto o largo tocando un instrumento, tú y aliados (hasta tu bonificador de competencia) que puedan oírte ganan Inspiración.",
      },
    ],
  },
  // 7. Savage Attacker
  {
    id: "atacante-salvaje",
    nombre: "Atacante salvaje",
    nombreOriginal: "Savage Attacker",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Has entrenado para golpear con fuerza despiadada. Una vez por turno, cuando impactes con un arma o un ataque desarmado, puedes tirar los dados de daño del ataque dos veces y usar el resultado más alto.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Una vez por turno, al impactar con un arma o ataque desarmado, tira los dados de daño dos veces y usa el resultado más alto.",
      },
    ],
  },
  // 8. Skilled
  {
    id: "habil",
    nombre: "Hábil",
    nombreOriginal: "Skilled",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Has adquirido entrenamiento variado. Ganas competencia en cualquier combinación de tres habilidades o herramientas a tu elección.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "proficiency",
        proficiencyType: "skill",
        proficiencyValues: [
          "Acrobacias",
          "Arcanos",
          "Atletismo",
          "Engaño",
          "Historia",
          "Interpretación",
          "Intimidación",
          "Investigación",
          "Juego de manos",
          "Medicina",
          "Naturaleza",
          "Percepción",
          "Perspicacia",
          "Persuasión",
          "Religión",
          "Sigilo",
          "Supervivencia",
          "Trato con animales",
        ],
        proficiencyChoice: true,
        proficiencyChoiceCount: 3,
      },
    ],
  },
  // 9. Tavern Brawler
  {
    id: "pendenciero",
    nombre: "Pendenciero",
    nombreOriginal: "Tavern Brawler",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Acostumbrado a las peleas callejeras, puedes golpear con fuerza usando objetos improvisados y ataques desarmados. Cuando impactas con un ataque desarmado, puedes infligir 1d4 + tu modificador de Fuerza de daño contundente. Al impactar con un ataque desarmado o un arma improvisada, puedes empujar a la criatura 5 pies o agarrarla.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Ataques desarmados infligen 1d4 + Fue de daño contundente. Al impactar con ataque desarmado o arma improvisada, puedes empujar 5 pies o agarrar al objetivo.",
      },
    ],
  },
  // 10. Tough
  {
    id: "resistente",
    nombre: "Resistente",
    nombreOriginal: "Tough",
    fuente: "XPHB",
    categoria: "origen",
    descripcion:
      "Tu cuerpo es excepcionalmente resiliente. Tus puntos de golpe máximos aumentan en una cantidad igual al doble de tu nivel cuando ganas esta dote. Cada vez que ganas un nivel a partir de entonces, tus puntos de golpe máximos aumentan en 2 adicionales.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "hp_max",
        hpBonusPerLevel: 2,
      },
    ],
  },
];

// ─── Dotes generales (XPHB) ────────────────────────────────────────

const GENERAL_FEATS: Feat[] = [
  // 11. Ability Score Improvement
  {
    id: "mejora-de-caracteristica",
    nombre: "Mejora de característica",
    nombreOriginal: "Ability Score Improvement",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Incrementas una puntuación de característica en 2, o dos puntuaciones de característica en 1 cada una. No puedes incrementar una puntuación por encima de 20 con esta dote.",
    prerrequisito: "Nivel 4+",
    repetible: true,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des", "con", "int", "sab", "car"],
        asiAmount: 2,
      },
      {
        type: "trait",
        traitDescription:
          "Incrementa una característica en 2 o dos características en 1 cada una (máximo 20). Repetible.",
      },
    ],
  },
  // 12. Actor
  {
    id: "actor",
    nombre: "Actor",
    nombreOriginal: "Actor",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres un maestro de la mímica y la actuación. Incrementa tu Carisma en 1 (máximo 20). Tienes ventaja en pruebas de Carisma (Engaño e Interpretación) cuando intentas hacerte pasar por otra persona. Puedes imitar el habla de otra persona o los sonidos de otra criatura si los has escuchado al menos 1 minuto.",
    prerrequisito: "Carisma 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["car"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Ventaja en pruebas de Engaño e Interpretación al hacerte pasar por otro. Puedes imitar voces y sonidos de criaturas que hayas escuchado al menos 1 minuto.",
      },
    ],
  },
  // 13. Athlete
  {
    id: "atleta",
    nombre: "Atleta",
    nombreOriginal: "Athlete",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has recibido entrenamiento atlético intenso. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Levantarte del suelo solo te cuesta 5 pies de movimiento. La escalada no te cuesta movimiento extra. Puedes hacer un salto largo o alto con una carrera de solo 5 pies.",
    prerrequisito: "Fuerza o Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Levantarte del suelo cuesta solo 5 pies de movimiento. La escalada no cuesta movimiento extra. Salto largo/alto con carrera de solo 5 pies.",
      },
    ],
  },
  // 14. Charger
  {
    id: "embestidor",
    nombre: "Embestidor",
    nombreOriginal: "Charger",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres experto en cargar contra el enemigo. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Cuando usas la acción de Carrera, puedes hacer un ataque cuerpo a cuerpo con arma o un empujón como acción adicional. Si te mueves en línea recta al menos 10 pies antes del ataque, obtienes +1d8 al daño o empujas al objetivo 10 pies.",
    prerrequisito: "Fuerza o Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Tras usar Carrera, puedes hacer un ataque cuerpo a cuerpo o empujón como acción adicional. Si te moviste al menos 10 pies en línea recta: +1d8 al daño o empujas 10 pies.",
      },
    ],
  },
  // 15. Chef
  {
    id: "cocinero",
    nombre: "Cocinero",
    nombreOriginal: "Chef",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres un cocinero experto. Incrementa tu Constitución o Sabiduría en 1 (máximo 20). Con utensilios de cocina, durante un descanso corto puedes preparar comida especial para un número de criaturas igual a 4 + tu bonificador de competencia. Cada criatura que la consuma recupera 1d8 PG adicionales al usar un Dado de Golpe. Con 1 hora de cocina puedes preparar golosinas especiales (bonificador de competencia en número), que al comerlas como acción adicional otorgan PG temporales iguales a tu bonificador de competencia.",
    prerrequisito: "Constitución o Sabiduría 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["con", "sab"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "tool",
        proficiencyValues: ["Utensilios de cocina"],
      },
      {
        type: "trait",
        traitDescription:
          "Descanso corto: cocinas para 4 + bonificador de competencia criaturas, que recuperan 1d8 PG extra al usar Dados de Golpe. Puedes preparar golosinas (cantidad = bonificador de competencia) que como acción adicional otorgan PG temporales = bonificador de competencia.",
      },
    ],
  },
  // 16. Crossbow Expert
  {
    id: "experto-en-ballesta",
    nombre: "Experto en ballesta",
    nombreOriginal: "Crossbow Expert",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Gracias a un entrenamiento extenso con ballestas, ignoras la propiedad de carga de las ballestas con las que tengas competencia, no sufres desventaja en ataques a distancia con ballesta contra criaturas a 5 pies de ti, y cuando atacas con un arma a una mano puedes usar una acción adicional para atacar con una ballesta de mano que lleves.",
    prerrequisito: "Competencia con ballesta",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Ignoras la propiedad de carga de las ballestas. Sin desventaja en ataques a distancia con ballesta a 5 pies. Tras atacar con un arma a una mano, puedes atacar con una ballesta de mano como acción adicional.",
      },
    ],
  },
  // 17. Crusher
  {
    id: "aplastador",
    nombre: "Aplastador",
    nombreOriginal: "Crusher",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres experto en golpes aplastantes. Incrementa tu Fuerza o Constitución en 1 (máximo 20). Una vez por turno, cuando impactas con daño contundente, puedes mover al objetivo 5 pies a un espacio desocupado. Cuando obtienes un crítico con daño contundente, las tiradas de ataque contra esa criatura tienen ventaja hasta el inicio de tu siguiente turno.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "con"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Una vez por turno, al impactar con daño contundente puedes mover al objetivo 5 pies. En crítico con daño contundente, los ataques contra esa criatura tienen ventaja hasta el inicio de tu siguiente turno.",
      },
    ],
  },
  // 18. Defensive Duelist
  {
    id: "duelista-defensivo",
    nombre: "Duelista defensivo",
    nombreOriginal: "Defensive Duelist",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Puedes usar tu habilidad con un arma sutil para protegerte. Cuando empuñas un arma sutil con la que tengas competencia y otra criatura te impacta con un ataque cuerpo a cuerpo, puedes usar tu reacción para añadir tu bonificador de competencia a tu CA para ese ataque, pudiendo hacer que falle.",
    prerrequisito: "Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Reacción: al ser impactado en cuerpo a cuerpo mientras empuñas un arma sutil, añade tu bonificador de competencia a tu CA para ese ataque.",
      },
    ],
  },
  // 19. Dual Wielder
  {
    id: "luchador-con-dos-armas",
    nombre: "Luchador con dos armas",
    nombreOriginal: "Dual Wielder",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has dominado la lucha con dos armas. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Cuando usas combate con dos armas, puedes usar armas que no tengan la propiedad ligera siempre que no tengan la propiedad pesada. Puedes desenfundar o enfundar dos armas a una mano en vez de solo una.",
    prerrequisito: "Fuerza o Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Combate con dos armas: puedes usar armas no ligeras (siempre que no sean pesadas). Puedes desenfundar/enfundar dos armas a una mano a la vez.",
      },
    ],
  },
  // 20. Durable
  {
    id: "duradero",
    nombre: "Duradero",
    nombreOriginal: "Durable",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres resistente y difícil de derribar. Incrementa tu Constitución en 1 (máximo 20). Cuando tiras un Dado de Golpe para recuperar puntos de golpe, el mínimo que puedes recuperar es igual al doble de tu modificador de Constitución (mínimo 2).",
    prerrequisito: "Constitución 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["con"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Al tirar Dados de Golpe para recuperar PG, el mínimo que recuperas es el doble de tu modificador de Constitución (mínimo 2).",
      },
    ],
  },
  // 21. Elemental Adept
  {
    id: "adepto-elemental",
    nombre: "Adepto elemental",
    nombreOriginal: "Elemental Adept",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has estudiado un elemento mágico a fondo. Elige un tipo de daño: ácido, frío, fuego, relámpago o trueno. Los conjuros que lances ignoran la resistencia a ese tipo de daño. Además, cuando tires daño de ese tipo con un conjuro, puedes tratar cualquier 1 en los dados de daño como un 2. Esta dote es repetible eligiendo un tipo de daño diferente cada vez.",
    prerrequisito: "Capacidad de lanzar conjuros",
    repetible: true,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Elige: ácido, frío, fuego, relámpago o trueno. Tus conjuros ignoran resistencia a ese tipo de daño. Los 1 en dados de daño de ese tipo cuentan como 2. Repetible con otro tipo.",
      },
    ],
  },
  // 22. Fey Touched
  {
    id: "tocado-por-las-hadas",
    nombre: "Tocado por las hadas",
    nombreOriginal: "Fey Touched",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Tu exposición a la magia feérica te ha cambiado. Incrementa tu Inteligencia, Sabiduría o Carisma en 1 (máximo 20). Aprendes los conjuros paso brumoso y un conjuro de nivel 1 de la escuela de Adivinación o Encantamiento a tu elección. Puedes lanzar cada uno una vez sin gastar un espacio de conjuro (se recupera con descanso largo). También puedes lanzarlos usando espacios que tengas.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "spell",
        spellIds: ["paso_brumoso"],
        spellAbility: "choice",
        spellLevel: 2,
        spellFreeUses: 1,
      },
      {
        type: "spell",
        spellIds: [],
        spellAbility: "choice",
        spellLevel: 1,
        spellFreeUses: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Aprendes paso brumoso y un conjuro de nivel 1 de Adivinación o Encantamiento. Cada uno se puede lanzar 1 vez gratis por descanso largo.",
      },
    ],
  },
  // 23. Great Weapon Master
  {
    id: "maestro-de-armas-grandes",
    nombre: "Maestro de armas grandes",
    nombreOriginal: "Great Weapon Master",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has aprendido a aprovechar el peso de un arma a tu favor. Incrementa tu Fuerza en 1 (máximo 20). Cuando impactas con un ataque usando un arma pesada, puedes infligir daño extra igual a tu bonificador de competencia.",
    prerrequisito: "Fuerza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Al impactar con un arma cuerpo a cuerpo pesada o versátil, puedes añadir tu bonificador de competencia al daño una vez por turno.",
      },
    ],
  },
  // 24. Heavily Armored
  {
    id: "armado-con-armadura-pesada",
    nombre: "Armado con armadura pesada",
    nombreOriginal: "Heavily Armored",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has entrenado para usar armaduras pesadas. Incrementa tu Fuerza o Constitución en 1 (máximo 20). Ganas competencia con armaduras pesadas.",
    prerrequisito: "Competencia con armadura intermedia",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "con"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "armor",
        proficiencyValues: ["armadura pesada"],
      },
    ],
  },
  // 25. Heavy Armor Master
  {
    id: "maestro-de-armadura-pesada",
    nombre: "Maestro de armadura pesada",
    nombreOriginal: "Heavy Armor Master",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Puedes usar tu armadura pesada para desviar golpes. Incrementa tu Fuerza o Constitución en 1 (máximo 20). Mientras lleves armadura pesada, el daño contundente, cortante y perforante que recibas de ataques se reduce en una cantidad igual a tu bonificador de competencia.",
    prerrequisito: "Competencia con armadura pesada",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "con"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Con armadura pesada: el daño contundente, cortante y perforante de ataques se reduce en tu bonificador de competencia.",
      },
    ],
  },
  // 26. Inspiring Leader
  {
    id: "lider-inspirador",
    nombre: "Líder inspirador",
    nombreOriginal: "Inspiring Leader",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Puedes invertir 10 minutos inspirando a tus compañeros. Incrementa tu Sabiduría o Carisma en 1 (máximo 20). Al final de un descanso corto o largo, puedes dar un discurso de ánimo. Hasta 6 aliados que puedan oírte y entenderte ganan PG temporales iguales a tu nivel + tu modificador de la característica incrementada.",
    prerrequisito: "Sabiduría o Carisma 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["sab", "car"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Al final de un descanso corto o largo, da un discurso de 10 minutos. Hasta 6 aliados ganan PG temporales = tu nivel + tu modificador de Sab o Car.",
      },
    ],
  },
  // 27. Keen Mind
  {
    id: "mente-aguda",
    nombre: "Mente aguda",
    nombreOriginal: "Keen Mind",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Tu mente es extraordinariamente aguda. Incrementa tu Inteligencia en 1 (máximo 20). Ganas competencia en una de las siguientes habilidades: Arcanos, Historia, Investigación, Naturaleza o Religión. También puedes usar la acción de Estudiar como acción adicional.",
    prerrequisito: "Inteligencia 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "skill",
        proficiencyValues: [
          "Arcanos",
          "Historia",
          "Investigación",
          "Naturaleza",
          "Religión",
        ],
        proficiencyChoice: true,
        proficiencyChoiceCount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Puedes usar la acción de Estudiar como acción adicional.",
      },
    ],
  },
  // 28. Lightly Armored
  {
    id: "armado-con-armadura-ligera",
    nombre: "Armado con armadura ligera",
    nombreOriginal: "Lightly Armored",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has entrenado para usar armaduras ligeras. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Ganas competencia con armaduras ligeras y escudos.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "armor",
        proficiencyValues: ["armadura ligera", "escudo"],
      },
    ],
  },
  // 29. Mage Slayer
  {
    id: "asesino-de-magos",
    nombre: "Asesino de magos",
    nombreOriginal: "Mage Slayer",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has practicado técnicas para combatir lanzadores de conjuros. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Cuando una criatura dentro de 5 pies de ti lanza un conjuro, puedes usar tu reacción para hacer un ataque de oportunidad contra ella. Cuando dañas a una criatura concentrada en un conjuro, tiene desventaja en la salvación de Concentración.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Reacción: ataque de oportunidad contra una criatura a 5 pies que lance un conjuro. Las criaturas que dañes tienen desventaja en salvaciones de Concentración provocadas por tu daño.",
      },
    ],
  },
  // 30. Medium Armor Master
  {
    id: "maestro-de-armadura-intermedia",
    nombre: "Maestro de armadura intermedia",
    nombreOriginal: "Medium Armor Master",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has practicado con armaduras intermedias hasta dominar su uso. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Llevar armadura intermedia no te impone desventaja en pruebas de Sigilo. Además, el bonificador máximo de Destreza a la CA con armadura intermedia pasa a ser +3 en vez de +2.",
    prerrequisito: "Competencia con armadura intermedia",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Sin desventaja en Sigilo con armadura intermedia. Bonificador máximo de Des a la CA con armadura intermedia: +3.",
      },
    ],
  },
  // 31. Moderately Armored
  {
    id: "armado-con-armadura-intermedia",
    nombre: "Armado con armadura intermedia",
    nombreOriginal: "Moderately Armored",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has entrenado para usar armaduras intermedias. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Ganas competencia con armaduras intermedias y escudos.",
    prerrequisito: "Competencia con armadura ligera",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "armor",
        proficiencyValues: ["armadura intermedia", "escudo"],
      },
    ],
  },
  // 32. Mounted Combatant
  {
    id: "combatiente-montado",
    nombre: "Combatiente montado",
    nombreOriginal: "Mounted Combatant",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres un jinete peligroso. Incrementa tu Fuerza, Destreza o Sabiduría en 1 (máximo 20). Mientras estés montado, tienes ventaja en ataques cuerpo a cuerpo contra criaturas desmontadas más pequeñas que tu montura. Puedes forzar un ataque dirigido a tu montura para que te apunte a ti. Si tu montura es sometida a un efecto que permita una salvación de Destreza para mitad de daño, no recibe daño si tiene éxito y solo mitad si falla.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des", "sab"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Montado: ventaja en ataques cuerpo a cuerpo contra criaturas desmontadas más pequeñas que tu montura. Puedes redirigir ataques de la montura a ti. Tu montura recibe 0 daño en salvaciones de Des exitosas (mitad si falla).",
      },
    ],
  },
  // 33. Observant
  {
    id: "observador",
    nombre: "Observador",
    nombreOriginal: "Observant",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres rápido notando detalles de tu entorno. Incrementa tu Inteligencia o Sabiduría en 1 (máximo 20). Obtienes un +5 a tus puntuaciones pasivas de Percepción e Investigación. Puedes leer los labios si puedes ver la boca de la criatura y comprendes su idioma.",
    prerrequisito: "Inteligencia o Sabiduría 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "+5 a Percepción pasiva e Investigación pasiva. Puedes leer los labios si ves la boca de la criatura y entiendes su idioma.",
      },
    ],
  },
  // 34. Piercer
  {
    id: "perforador",
    nombre: "Perforador",
    nombreOriginal: "Piercer",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres experto con ataques perforantes. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Una vez por turno, cuando impactas con daño perforante, puedes volver a tirar uno de los dados de daño y usar el nuevo resultado. Cuando obtienes un crítico con daño perforante, tiras un dado de daño adicional.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Una vez por turno, al impactar con daño perforante puedes repetir un dado de daño y usar el nuevo resultado. En crítico con daño perforante: un dado de daño adicional.",
      },
    ],
  },
  // 35. Poisoner
  {
    id: "envenenador",
    nombre: "Envenenador",
    nombreOriginal: "Poisoner",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres un experto en venenos. Incrementa tu Destreza o Inteligencia en 1 (máximo 20). Ganas competencia con el kit de envenenador. Como acción adicional puedes aplicar veneno a un arma o munición (1 minuto de duración). La CD de salvación es 8 + tu bonificador de competencia + tu modificador de Inteligencia. Ignoras la resistencia al daño de veneno.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["des", "int"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "tool",
        proficiencyValues: ["Kit de envenenador"],
      },
      {
        type: "trait",
        traitDescription:
          "Acción adicional: aplica veneno a arma o munición (1 minuto, CD 8 + competencia + Int). Ignoras resistencia al daño de veneno.",
      },
    ],
  },
  // 36. Polearm Master
  {
    id: "maestro-de-armas-de-asta",
    nombre: "Maestro de armas de asta",
    nombreOriginal: "Polearm Master",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has dominado las armas de asta. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Cuando atacas con una alabarda, bastón, guja, lucero del alba, lanza o pica, puedes usar una acción adicional para atacar con el extremo del arma (1d4 contundente). Cuando empuñas una de estas armas, criaturas que entren en tu alcance provocan ataques de oportunidad.",
    prerrequisito: "Fuerza o Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Acción adicional: golpe con extremo del arma de asta (1d4 contundente). Criaturas que entren en tu alcance provocan ataques de oportunidad.",
      },
    ],
  },
  // 37. Resilient
  {
    id: "resistente-salvacion",
    nombre: "Resistente (salvación)",
    nombreOriginal: "Resilient",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has entrenado la resistencia de una de tus características. Elige una característica. Incrementa esa puntuación en 1 (máximo 20) y ganas competencia en la salvación de esa característica.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des", "con", "int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "saving_throw",
        proficiencyValues: [
          "Fuerza",
          "Destreza",
          "Constitución",
          "Inteligencia",
          "Sabiduría",
          "Carisma",
        ],
        proficiencyChoice: true,
        proficiencyChoiceCount: 1,
      },
    ],
  },
  // 38. Ritual Caster
  {
    id: "lanzador-de-rituales",
    nombre: "Lanzador de rituales",
    nombreOriginal: "Ritual Caster",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has aprendido a lanzar conjuros como rituales. Incrementa tu Inteligencia, Sabiduría o Carisma en 1 (máximo 20). Eliges dos conjuros de nivel 1 con la etiqueta de ritual de las listas de Clérigo, Druida o Mago. Los tienes siempre preparados y puedes lanzarlos como rituales. Cuando ganes un nivel, puedes reemplazar uno de estos conjuros rituales. Además, puedes transcribir conjuros rituales de pergaminos o libros de conjuros (2 horas y 10 po por nivel del conjuro).",
    prerrequisito: "Inteligencia, Sabiduría o Carisma 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "spell",
        spellIds: [],
        spellAbility: "choice",
        spellLevel: 1,
        spellFreeUses: 0,
      },
      {
        type: "trait",
        traitDescription:
          "Aprendes 2 conjuros rituales de nivel 1 (Clérigo, Druida o Mago), siempre preparados. Puedes transcribir conjuros rituales de pergaminos/libros (2 h + 10 po/nivel).",
      },
    ],
  },
  // 39. Sentinel
  {
    id: "centinela",
    nombre: "Centinela",
    nombreOriginal: "Sentinel",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has dominado las técnicas para aprovechar cada hueco en la defensa del enemigo. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Cuando impactas con un ataque de oportunidad, la velocidad del objetivo baja a 0 por el resto de su turno. Las criaturas dentro de tu alcance provocan ataques de oportunidad incluso si toman la acción de Retirada. Cuando una criatura a tu alcance ataca a un aliado, puedes usar tu reacción para hacer un ataque cuerpo a cuerpo contra esa criatura.",
    prerrequisito: "Fuerza o Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Ataque de oportunidad exitoso: velocidad del objetivo = 0. Retirada no impide ataques de oportunidad. Reacción: ataque cuerpo a cuerpo cuando una criatura a tu alcance ataca a un aliado.",
      },
    ],
  },
  // 40. Shadow Touched
  {
    id: "tocado-por-las-sombras",
    nombre: "Tocado por las sombras",
    nombreOriginal: "Shadow Touched",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Tu exposición a la magia del Shadowfell te ha cambiado. Incrementa tu Inteligencia, Sabiduría o Carisma en 1 (máximo 20). Aprendes los conjuros invisibilidad y un conjuro de nivel 1 de la escuela de Ilusión o Nigromancia a tu elección. Puedes lanzar cada uno una vez sin gastar un espacio de conjuro (se recupera con descanso largo). También puedes lanzarlos con espacios que tengas.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "spell",
        spellIds: ["invisibilidad"],
        spellAbility: "choice",
        spellLevel: 2,
        spellFreeUses: 1,
      },
      {
        type: "spell",
        spellIds: [],
        spellAbility: "choice",
        spellLevel: 1,
        spellFreeUses: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Aprendes invisibilidad y un conjuro de nivel 1 de Ilusión o Nigromancia. Cada uno se puede lanzar 1 vez gratis por descanso largo.",
      },
    ],
  },
  // 41. Sharpshooter
  {
    id: "tirador-certero",
    nombre: "Tirador certero",
    nombreOriginal: "Sharpshooter",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Tu puntería es excepcional. Incrementa tu Destreza en 1 (máximo 20). Tus ataques con armas a distancia ignoran cobertura de medio y tres cuartos. Atacar a largo alcance no te impone desventaja. Cuando impactas con un ataque a distancia, puedes infligir daño extra igual a tu bonificador de competencia.",
    prerrequisito: "Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Ignoras cobertura de medio y tres cuartos con ataques a distancia. Sin desventaja a largo alcance. Al impactar a distancia: daño extra = bonificador de competencia.",
      },
    ],
  },
  // 42. Shield Master
  {
    id: "maestro-de-escudo",
    nombre: "Maestro de escudo",
    nombreOriginal: "Shield Master",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has entrenado con el escudo como arma y defensa. Incrementa tu Fuerza en 1 (máximo 20). Si atacas en tu turno, puedes usar una acción adicional para intentar empujar a una criatura a 5 pies con tu escudo. Si eres sometido a un efecto que permita una salvación de Destreza para mitad de daño, puedes usar tu reacción para interponer tu escudo y no recibir daño si tienes éxito.",
    prerrequisito: "Competencia con escudos",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Acción adicional: empujar a criatura a 5 pies con escudo tras atacar. Reacción: al tener éxito en salvación de Des para mitad de daño, no recibes daño.",
      },
    ],
  },
  // 43. Skilled Expert
  {
    id: "experto-habil",
    nombre: "Experto hábil",
    nombreOriginal: "Skilled Expert",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has perfeccionado tus habilidades. Incrementa una puntuación de característica a tu elección en 1 (máximo 20). Ganas competencia en una habilidad a tu elección. Elige una habilidad en la que tengas competencia: ganas pericia (expertise) en esa habilidad.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des", "con", "int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "skill",
        proficiencyValues: [
          "Acrobacias",
          "Arcanos",
          "Atletismo",
          "Engaño",
          "Historia",
          "Interpretación",
          "Intimidación",
          "Investigación",
          "Juego de manos",
          "Medicina",
          "Naturaleza",
          "Percepción",
          "Perspicacia",
          "Persuasión",
          "Religión",
          "Sigilo",
          "Supervivencia",
          "Trato con animales",
        ],
        proficiencyChoice: true,
        proficiencyChoiceCount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Ganas pericia (expertise) en una habilidad en la que ya tengas competencia.",
      },
    ],
  },
  // 44. Skulker
  {
    id: "acechador",
    nombre: "Acechador",
    nombreOriginal: "Skulker",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres un experto en el sigilo. Incrementa tu Destreza en 1 (máximo 20). Puedes intentar esconderte cuando estés ligeramente oculto. Cuando estés oculto, fallar un ataque a distancia no revela tu posición. Obtienes visión en la oscuridad con un alcance de 60 pies, o si ya la tienes, su alcance aumenta en 60 pies.",
    prerrequisito: "Destreza 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["des"],
        asiAmount: 1,
      },
      {
        type: "sense",
        senseType: "darkvision",
        senseRange: 60,
      },
      {
        type: "trait",
        traitDescription:
          "Puedes esconderte con ocultamiento ligero. Fallar un ataque a distancia oculto no revela tu posición. Visión en la oscuridad 60 pies (o +60 pies si ya la tienes).",
      },
    ],
  },
  // 45. Slasher
  {
    id: "cortador",
    nombre: "Cortador",
    nombreOriginal: "Slasher",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres experto con ataques cortantes. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Una vez por turno, cuando impactas con daño cortante, puedes reducir la velocidad del objetivo en 10 pies hasta el inicio de tu siguiente turno. Cuando obtienes un crítico con daño cortante, el objetivo tiene desventaja en todas las tiradas de ataque hasta el inicio de tu siguiente turno.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Una vez por turno, al impactar con daño cortante reduces la velocidad del objetivo en 10 pies. En crítico con daño cortante: desventaja en ataques del objetivo hasta tu siguiente turno.",
      },
    ],
  },
  // 46. Speedy
  {
    id: "veloz",
    nombre: "Veloz",
    nombreOriginal: "Speedy",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Eres excepcionalmente rápido. Incrementa tu Destreza o Constitución en 1 (máximo 20). Tu velocidad aumenta en 10 pies. Los ataques de oportunidad contra ti tienen desventaja. Puedes moverte a tu velocidad normal cuando te arrastras sin que cuente como terreno difícil.",
    prerrequisito: "Destreza o Constitución 13+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["des", "con"],
        asiAmount: 1,
      },
      {
        type: "speed",
        speedBonus: 10,
      },
      {
        type: "trait",
        traitDescription:
          "Los ataques de oportunidad contra ti tienen desventaja. Arrastrarte no cuesta movimiento extra.",
      },
    ],
  },
  // 47. Spell Sniper
  {
    id: "francotirador-de-conjuros",
    nombre: "Francotirador de conjuros",
    nombreOriginal: "Spell Sniper",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has aprendido técnicas para potenciar tus conjuros de ataque. Incrementa tu Inteligencia, Sabiduría o Carisma en 1 (máximo 20). Los conjuros de ataque que requieran tirada de ataque tienen su alcance duplicado. Tus ataques con conjuros ignoran cobertura de medio y tres cuartos. Aprendes un truco que requiera tirada de ataque de la lista de Clérigo, Druida, Hechicero, Brujo o Mago.",
    prerrequisito: "Capacidad de lanzar conjuros",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "spell",
        spellIds: [],
        spellAbility: "choice",
        spellLevel: 0,
        spellFreeUses: 0,
      },
      {
        type: "trait",
        traitDescription:
          "Alcance duplicado para conjuros de ataque con tirada de ataque. Ignoras cobertura de medio y tres cuartos con conjuros.",
      },
    ],
  },
  // 48. Telekinetic
  {
    id: "telequinetico",
    nombre: "Telequinético",
    nombreOriginal: "Telekinetic",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has aprendido a mover cosas con la mente. Incrementa tu Inteligencia, Sabiduría o Carisma en 1 (máximo 20). Aprendes el truco mano de mago si no lo conoces, y al lanzarlo es invisible y no requiere componentes. Como acción adicional puedes empujar telequinéticamente a una criatura visible a 30 pies. Si es involuntaria, debe superar una salvación de Fuerza (CD 8 + tu bonificador de competencia + tu modificador de la característica incrementada).",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "spell",
        spellIds: ["mano_de_mago"],
        spellAbility: "choice",
        spellLevel: 0,
        spellFreeUses: 0,
      },
      {
        type: "trait",
        traitDescription:
          "Mano de mago es invisible y sin componentes. Acción adicional: empujar a una criatura visible a 30 pies 5 pies hacia ti o lejos (salvación Fue CD 8 + competencia + modificador).",
      },
    ],
  },
  // 49. Telepathic
  {
    id: "telepatico",
    nombre: "Telepático",
    nombreOriginal: "Telepathic",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has despertado habilidades telepáticas. Incrementa tu Inteligencia, Sabiduría o Carisma en 1 (máximo 20). Puedes hablar telepáticamente a cualquier criatura visible a 60 pies. La criatura te entiende si comprende al menos un idioma, pero no puede responder telepáticamente a menos que tenga esa capacidad. Aprendes el conjuro detectar pensamientos y puedes lanzarlo una vez sin gastar espacio (se recupera con descanso largo).",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "spell",
        spellIds: ["detectar_pensamientos"],
        spellAbility: "choice",
        spellLevel: 2,
        spellFreeUses: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Telepatía a 60 pies con criaturas visibles que comprendan un idioma (comunicación unidireccional). Lanza detectar pensamientos 1 vez gratis por descanso largo.",
      },
    ],
  },
  // 50. War Caster
  {
    id: "lanzador-de-guerra",
    nombre: "Lanzador de guerra",
    nombreOriginal: "War Caster",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has practicado lanzar conjuros en medio del combate. Incrementa tu Inteligencia, Sabiduría o Carisma en 1 (máximo 20). Tienes ventaja en las salvaciones de Constitución para mantener la Concentración. Puedes realizar los componentes somáticos de conjuros incluso con armas u escudos en ambas manos. Cuando una criatura provoca un ataque de oportunidad, puedes lanzar un truco contra ella en su lugar (tiempo de lanzamiento 1 acción, que apunte solo a esa criatura).",
    prerrequisito: "Capacidad de lanzar conjuros",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Ventaja en salvaciones de Constitución para Concentración. Componentes somáticos con manos ocupadas (armas/escudo). Ataque de oportunidad: puedes lanzar un truco en su lugar.",
      },
    ],
  },
  // 51. Weapon Master
  {
    id: "maestro-de-armas",
    nombre: "Maestro de armas",
    nombreOriginal: "Weapon Master",
    fuente: "XPHB",
    categoria: "general",
    descripcion:
      "Has entrenado con una variedad de armas. Incrementa tu Fuerza o Destreza en 1 (máximo 20). Ganas competencia con armas marciales.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "weapon",
        proficiencyValues: ["armas marciales"],
      },
    ],
  },
];

// ─── Dotes épicas (XPHB) ───────────────────────────────────────────

const EPIC_BOON_FEATS: Feat[] = [
  // 52. Epic Boon of Combat Prowess
  {
    id: "don-epico-de-destreza-en-combate",
    nombre: "Don épico de destreza en combate",
    nombreOriginal: "Epic Boon of Combat Prowess",
    fuente: "XPHB",
    categoria: "epica",
    descripcion:
      "Has alcanzado una maestría marcial épica. Incrementa una puntuación de característica a tu elección en 1 (máximo 30). Cuando fallas una tirada de ataque, puedes añadir tu bonificador de competencia a la tirada, posiblemente convirtiendo el fallo en un impacto. Una vez que uses esta capacidad, no puedes hacerlo de nuevo hasta el inicio de tu siguiente turno.",
    prerrequisito: "Nivel 19+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des", "con", "int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Una vez por turno, al fallar un ataque puedes añadir tu bonificador de competencia a la tirada.",
      },
    ],
  },
  // 53. Epic Boon of Fate
  {
    id: "don-epico-del-destino",
    nombre: "Don épico del destino",
    nombreOriginal: "Epic Boon of Fate",
    fuente: "XPHB",
    categoria: "epica",
    descripcion:
      "Has adquirido el poder de alterar el destino. Incrementa una puntuación de característica a tu elección en 1 (máximo 30). Cuando tú u otra criatura a 60 pies hace una tirada de ataque, prueba de característica o salvación, puedes usar tu reacción para añadir o restar 2d4 al resultado. Puedes usar esta capacidad un número de veces igual a tu bonificador de competencia (se recuperan con descanso largo).",
    prerrequisito: "Nivel 19+",
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["fue", "des", "con", "int", "sab", "car"],
        asiAmount: 1,
      },
      {
        type: "trait",
        traitDescription:
          "Reacción (usos = bonificador de competencia, descanso largo): cuando tú o una criatura a 60 pies haga un ataque, prueba o salvación, añade o resta 2d4 al resultado.",
      },
    ],
  },
];

// ─── Dotes exclusivas de TCE ────────────────────────────────────────

const TCE_EXCLUSIVE_FEATS: Feat[] = [
  // 54. Artificer Initiate
  {
    id: "iniciado-del-artificiero",
    nombre: "Iniciado del artificiero",
    nombreOriginal: "Artificer Initiate",
    fuente: "TCE",
    categoria: "general",
    descripcion:
      "Has aprendido algo de la inventiva del artificiero. Aprendes un truco de la lista de conjuros del artificiero y un conjuro de nivel 1, que puedes lanzar una vez sin gastar un espacio de conjuro (se recupera con descanso largo). Inteligencia es tu característica de lanzamiento. Ganas competencia con un tipo de herramientas de artesano a tu elección.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "spell",
        spellIds: [],
        spellAbility: "int",
        spellLevel: 0,
        spellFreeUses: 0,
      },
      {
        type: "spell",
        spellIds: [],
        spellAbility: "int",
        spellLevel: 1,
        spellFreeUses: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "tool",
        proficiencyValues: ["Herramientas de artesano (a elegir)"],
        proficiencyChoice: true,
        proficiencyChoiceCount: 1,
      },
    ],
  },
  // 55. Eldritch Adept
  {
    id: "adepto-sobrenatural",
    nombre: "Adepto sobrenatural",
    nombreOriginal: "Eldritch Adept",
    fuente: "TCE",
    categoria: "general",
    descripcion:
      "Estudiando la magia oculta, has descubierto invocaciones sobrenaturales. Aprendes una invocación sobrenatural de tu elección de la lista del brujo. Si la invocación tiene un prerrequisito, solo puedes elegirla si eres brujo y cumples el prerrequisito. Cada vez que ganes un nivel, puedes reemplazarla por otra invocación.",
    prerrequisito: "Capacidad de lanzar conjuros",
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Aprendes una invocación sobrenatural del brujo. Si la invocación tiene prerrequisito, debes ser brujo y cumplirlo. Se puede cambiar al subir de nivel.",
      },
    ],
  },
  // 56. Fighting Initiate
  {
    id: "iniciado-en-combate",
    nombre: "Iniciado en combate",
    nombreOriginal: "Fighting Initiate",
    fuente: "TCE",
    categoria: "general",
    descripcion:
      "Tu entrenamiento marcial te ha enseñado un estilo de combate particular. Aprendes un estilo de combate de la lista del guerrero. No puedes elegir un estilo que ya poseas. Cada vez que ganes un nivel, puedes reemplazarlo por otro estilo del guerrero que no tengas.",
    prerrequisito: "Competencia con un arma marcial",
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Aprendes un estilo de combate del guerrero. Se puede cambiar al subir de nivel.",
      },
    ],
  },
  // 57. Gunner
  {
    id: "artillero",
    nombre: "Artillero",
    nombreOriginal: "Gunner",
    fuente: "TCE",
    categoria: "general",
    descripcion:
      "Tienes una mano firme con las armas de fuego. Incrementa tu Destreza en 1 (máximo 20). Ganas competencia con armas de fuego. No sufres desventaja en ataques a distancia contra criaturas a 5 pies de ti. Ignoras la propiedad de carga de las armas de fuego.",
    prerrequisito: null,
    repetible: false,
    efectos: [
      {
        type: "asi",
        asiChoices: ["des"],
        asiAmount: 1,
      },
      {
        type: "proficiency",
        proficiencyType: "weapon",
        proficiencyValues: ["armas de fuego"],
      },
      {
        type: "trait",
        traitDescription:
          "Sin desventaja en ataques a distancia a 5 pies. Ignoras la propiedad de carga de armas de fuego.",
      },
    ],
  },
  // 58. Metamagic Adept
  {
    id: "adepto-en-metamagia",
    nombre: "Adepto en metamagia",
    nombreOriginal: "Metamagic Adept",
    fuente: "TCE",
    categoria: "general",
    descripcion:
      "Has aprendido a exprimir tu magia más allá de sus límites. Aprendes dos opciones de Metamagia del hechicero. Solo puedes usar una opción de Metamagia por conjuro, a menos que se indique lo contrario. Ganas 2 puntos de hechicería para gastar en Metamagia (se recuperan con descanso largo). Si ya tienes puntos de hechicería, estos se suman a tu reserva.",
    prerrequisito: "Capacidad de lanzar conjuros",
    repetible: false,
    efectos: [
      {
        type: "trait",
        traitDescription:
          "Aprendes 2 opciones de Metamagia del hechicero. Ganas 2 puntos de hechicería (descanso largo) para Metamagia. Se suman a puntos existentes.",
      },
    ],
  },
];

// ─── Exportaciones ──────────────────────────────────────────────────

/** Todas las dotes disponibles (53 XPHB + 5 TCE exclusivas = 58) */
export const ALL_FEATS: Feat[] = [
  ...ORIGIN_FEATS,
  ...GENERAL_FEATS,
  ...EPIC_BOON_FEATS,
  ...TCE_EXCLUSIVE_FEATS,
];

/** Busca una dote por su ID */
export function getFeatById(id: string): Feat | undefined {
  return ALL_FEATS.find((f) => f.id === id);
}

/** Filtra dotes por categoría */
export function getFeatsByCategory(category: FeatCategory): Feat[] {
  return ALL_FEATS.filter((f) => f.categoria === category);
}

/** Obtiene las dotes disponibles en la creación de personaje (dotes de origen) */
export function getOriginFeats(): Feat[] {
  return getFeatsByCategory("origen");
}
