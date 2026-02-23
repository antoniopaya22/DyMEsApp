/**
 * Opciones de subclase por clase para D&D 5e SRD en español.
 * Cada clase tiene una lista de subclases disponibles con su nombre,
 * breve descripción y fuente original.
 */

import type { ClassId } from "@/types/character";

// ─── Tipos ───────────────────────────────────────────────────────────

export interface SubclassOption {
  /** Identificador único (slug) */
  id: string;
  /** Nombre en español */
  nombre: string;
  /** Descripción corta (1-2 frases) */
  descripcion: string;
  /** Fuente: 'SRD', 'PHB', 'XGtE', 'TCoE', 'UA', etc. */
  fuente: string;
}

// ─── Subclases por clase ─────────────────────────────────────────────

export const SUBCLASS_OPTIONS: Record<ClassId, SubclassOption[]> = {
  // ─── BÁRBARO ───────────────────────────────────────────────────────
  barbaro: [
    {
      id: "senda_berserker",
      nombre: "Senda del Berserker",
      descripcion:
        "Canalizas tu furia en un frenesí violento e imparable. Tu rabia incontrolable te permite atacar sin cesar y aterrorizar al enemigo.",
      fuente: "PHB",
    },
    {
      id: "senda_corazon_salvaje",
      nombre: "Senda del Corazón Salvaje",
      descripcion:
        "Tu furia te conecta con espíritus animales que te otorgan poderes sobrenaturales: la resistencia del oso, el vuelo del águila o la ferocidad del lobo.",
      fuente: "PHB",
    },
    {
      id: "senda_arbol_mundo",
      nombre: "Senda del Árbol del Mundo",
      descripcion:
        "Tu furia te conecta al Árbol del Mundo, el puente cósmico entre los planos. Proteges aliados, teletransportas combatientes y golpeas con raíces ancestrales.",
      fuente: "PHB",
    },
    {
      id: "senda_fanatico",
      nombre: "Senda del Fanático",
      descripcion:
        "Tu furia se alimenta de energía divina. Canalizas poder sagrado para infligir daño necrótico o radiante y luchar más allá de la muerte misma.",
      fuente: "PHB",
    },
    {
      id: "senda_guardian_ancestral",
      nombre: "Senda del Guardián Ancestral",
      descripcion:
        "Invocas a los espíritus de tus antepasados guerreros que luchan a tu lado, protegen a tus aliados y devuelven el daño a tus enemigos.",
      fuente: "XGtE",
    },
    {
      id: "senda_heraldo_tormenta",
      nombre: "Senda del Heraldo de la Tormenta",
      descripcion:
        "Tu furia genera un aura elemental que daña a tus enemigos cercanos. Elige entre el calor abrasador del Desierto, el relámpago del Mar o el frío de la Tundra.",
      fuente: "XGtE",
    },
    {
      id: "senda_bestia",
      nombre: "Senda de la Bestia",
      descripcion:
        "Tu furia desata la bestia interior, transformando tu cuerpo con garras, mordisco o cola como armas naturales ferocísimas.",
      fuente: "TCoE",
    },
    {
      id: "senda_magia_salvaje",
      nombre: "Senda de la Magia Salvaje",
      descripcion:
        "Tu furia genera surges de magia caótica con efectos aleatorios que pueden beneficiarte a ti y a tus aliados de formas imprevisibles.",
      fuente: "TCoE",
    },
  ],

  // ─── BARDO ─────────────────────────────────────────────────────────
  bardo: [
    {
      id: "colegio_conocimiento",
      nombre: "Colegio del Conocimiento",
      descripcion:
        "Recoges conocimiento de casi cualquier fuente. Tu saber y tus palabras cortantes inspiran y desmoralizan a partes iguales.",
      fuente: "PHB",
    },
    {
      id: "colegio_valor",
      nombre: "Colegio del Valor",
      descripcion:
        "Inspiras a otros con actos heroicos. Ganas competencia en armaduras medias, escudos y armas marciales.",
      fuente: "PHB",
    },
    {
      id: "colegio_espadas",
      nombre: "Colegio de las Espadas",
      descripcion:
        "Combinas el arte escénico con la destreza marcial, usando florituras de combate como extensión de tu actuación.",
      fuente: "XGtE",
    },
    {
      id: "colegio_glamour",
      nombre: "Colegio del Glamour",
      descripcion:
        "Canalizas la belleza sobrenatural de las hadas para fascinar, encantar y cautivar a quienes te rodean.",
      fuente: "XGtE",
    },
    {
      id: "colegio_elocuencia",
      nombre: "Colegio de la Elocuencia",
      descripcion:
        "Dominas las palabras con tal maestría que tu retórica puede persuadir, conmover y desarmar cualquier resistencia.",
      fuente: "TCoE",
    },
    {
      id: "colegio_lamentos",
      nombre: "Colegio de los Lamentos",
      descripcion:
        "Usas el miedo, los secretos y la manipulación psicológica como armas, ocultando un veneno emocional tras melodías encantadoras.",
      fuente: "XGtE",
    },
    {
      id: "colegio_creacion",
      nombre: "Colegio de la Creación",
      descripcion:
        "Crees que el cosmos fue cantado a la existencia. Tu música puede traer objetos y maravillas al mundo.",
      fuente: "TCoE",
    },
    {
      id: "colegio_danza",
      nombre: "Colegio de la Danza",
      descripcion:
        "Tu arte es el movimiento. Tu danza inspira a tus aliados, desconcierta a tus enemigos y te protege del peligro.",
      fuente: "PHB",
    },
  ],

  // ─── BRUJO ─────────────────────────────────────────────────────────
  brujo: [
    {
      id: "patron_feerico",
      nombre: "Patrón Feérico",
      descripcion:
        "Tu pacto se nutre del poder del Feywild. Tu patrón es un archihada caprichosa e insondable que te otorga magia de encantamiento y teletransportación.",
      fuente: "PHB'24",
    },
    {
      id: "patron_celestial",
      nombre: "Patrón Celestial",
      descripcion:
        "Tu pacto se nutre de los Planos Superiores. Tu patrón es un ser celestial que te otorga magia curativa y energía radiante.",
      fuente: "PHB'24",
    },
    {
      id: "patron_infernal",
      nombre: "Patrón Infernal",
      descripcion:
        "Tu pacto se nutre de los Planos Inferiores. Tu patrón es un señor demoníaco o diablo que te otorga poder destructivo y resistencia infernal.",
      fuente: "PHB'24",
    },
    {
      id: "patron_gran_antiguo",
      nombre: "Patrón Gran Antiguo",
      descripcion:
        "Tu pacto se nutre de saber prohibido de seres inefables del Reino Lejano. Tu patrón te otorga poder telepático y magia psíquica.",
      fuente: "PHB'24",
    },
    {
      id: "patron_insondable",
      nombre: "El Insondable",
      descripcion:
        "Tu patrón es una entidad de las profundidades oceánicas, otorgándote poder sobre el agua y tentáculos espectrales.",
      fuente: "TCE",
    },
    {
      id: "patron_genio",
      nombre: "El Genio",
      descripcion:
        "Tu patrón es un genio elemental noble. Ganas un refugio especial y poderes vinculados al elemento de tu genio.",
      fuente: "TCE",
    },
    {
      id: "patron_hexblade",
      nombre: "El Hexblade",
      descripcion:
        "Tu patrón se manifiesta a través de armas mágicas de la Shadowfell. Puedes usar Carisma para ataques y maldecir a tus enemigos.",
      fuente: "XGE",
    },
  ],

  // ─── CLÉRIGO ───────────────────────────────────────────────────────
  clerigo: [
    {
      id: "dominio_vida",
      nombre: "Dominio de la Vida",
      descripcion:
        "Te especializas en la energía positiva que sustenta la vida. Tus conjuros curativos son excepcionalmente potentes y puedes canalizar divinidad para restaurar PG masivamente.",
      fuente: "PHB",
    },
    {
      id: "dominio_luz",
      nombre: "Dominio de la Luz",
      descripcion:
        "Canalizas el poder divino para traer fuego abrasador y revelación. Dispersas la oscuridad y castigas a los enemigos con resplandor radiante.",
      fuente: "PHB",
    },
    {
      id: "dominio_engano",
      nombre: "Dominio del Engaño",
      descripcion:
        "Tu magia se centra en el engaño, la ilusión y el sigilo. Creas duplicados ilusorios, te teletransportas y desafías el orden establecido.",
      fuente: "PHB",
    },
    {
      id: "dominio_guerra",
      nombre: "Dominio de la Guerra",
      descripcion:
        "Eres un campeón divino en el campo de batalla. Atacas con acción adicional, guías los golpes de tus aliados y resistes el daño físico.",
      fuente: "PHB",
    },
    {
      id: "dominio_forja",
      nombre: "Dominio de la Forja",
      descripcion:
        "Canalizas el poder de la creación divina. Puedes bendecir armas y armaduras con magia sagrada y crear objetos mediante rituales.",
      fuente: "XGtE",
    },
    {
      id: "dominio_tumba",
      nombre: "Dominio de la Tumba",
      descripcion:
        "Vigilas el límite entre la vida y la muerte. Maximizas la curación en criaturas moribundas y marcas enemigos para su destrucción.",
      fuente: "XGtE",
    },
    {
      id: "dominio_naturaleza",
      nombre: "Dominio de la Naturaleza",
      descripcion:
        "Sirves a una deidad de la naturaleza, obteniendo poder sobre plantas, animales y los elementos naturales.",
      fuente: "PHB'14",
    },
    {
      id: "dominio_tempestad",
      nombre: "Dominio de la Tempestad",
      descripcion:
        "Dominas el poder de las tormentas. Castigas a los atacantes con relámpagos y truenos, y canalizas daño elemental máximo.",
      fuente: "PHB'14",
    },
    {
      id: "dominio_orden",
      nombre: "Dominio del Orden",
      descripcion:
        "Representas la ley divina. Comandas aliados para atacar como reacción y canalizas presencia intimidante para hechizar enemigos.",
      fuente: "TCoE",
    },
    {
      id: "dominio_paz",
      nombre: "Dominio de la Paz",
      descripcion:
        "Tu fe promueve la armonía. Creas vínculos entre aliados que comparten dados extra, se protegen mutuamente y se teletransportan para absorber daño.",
      fuente: "TCoE",
    },
    {
      id: "dominio_crepusculo",
      nombre: "Dominio del Crepúsculo",
      descripcion:
        "Habitas el límite entre la luz y la oscuridad. Otorgas visión en la oscuridad a 90 m, refugio crepuscular con PG temporales y vuelo nocturno.",
      fuente: "TCoE",
    },
  ],

  // ─── DRUIDA ────────────────────────────────────────────────────────
  druida: [
    {
      id: "circulo_tierra",
      nombre: "Círculo de la Tierra",
      descripcion:
        "Salvaguardas conocimiento y ritos antiguos. Eliges un tipo de tierra que te otorga conjuros, y canalizas la vitalidad de la naturaleza para curar y proteger.",
      fuente: "PHB'24",
    },
    {
      id: "circulo_luna",
      nombre: "Círculo de la Luna",
      descripcion:
        "Usas magia lunar para transformarte en bestias más poderosas, con formas mejoradas, radiancia lunar y teletransporte.",
      fuente: "PHB'24",
    },
    {
      id: "circulo_mar",
      nombre: "Círculo del Mar",
      descripcion:
        "Canalizas las fuerzas tempestuosas de océanos y tormentas. Tu Ira del Mar congela y empuja enemigos, y dominas el agua y el viento.",
      fuente: "PHB'24",
    },
    {
      id: "circulo_estrellas",
      nombre: "Círculo de las Estrellas",
      descripcion:
        "Lees los astros y canalizas su poder. Puedes adoptar formas estelares (Arquero, Cáliz, Dragón) que potencian tu magia.",
      fuente: "PHB'24",
    },
    {
      id: "circulo_suenos",
      nombre: "Círculo de los Sueños",
      descripcion:
        "Tienes una conexión profunda con los dominios feéricos. Tu magia cura, protege y permite viajar entre planos.",
      fuente: "XGtE",
    },
    {
      id: "circulo_pastor",
      nombre: "Círculo del Pastor",
      descripcion:
        "Te especializas en invocar espíritus de la naturaleza y proteger a las criaturas con las que te vinculas.",
      fuente: "XGtE",
    },
    {
      id: "circulo_esporas",
      nombre: "Círculo de las Esporas",
      descripcion:
        "Encuentras belleza en la descomposición. Usas esporas y necrosis como armas y puedes animar a los muertos.",
      fuente: "TCoE",
    },
    {
      id: "circulo_llama",
      nombre: "Círculo de la Llama",
      descripcion:
        "Dominas la dualidad del fuego: tanto su poder destructivo como su capacidad creadora y purificadora.",
      fuente: "TCoE",
    },
  ],

  // ─── EXPLORADOR ────────────────────────────────────────────────────
  explorador: [
    {
      id: "cazador",
      nombre: "Cazador",
      descripcion:
        "Proteges la naturaleza y a las personas de las fuerzas que las destruirían, acechando a tu presa en las tierras salvajes y más allá.",
      fuente: "PHB'24",
    },
    {
      id: "senor_bestias",
      nombre: "Señor de las Bestias",
      descripcion:
        "Forjas un vínculo místico con una bestia primordial, canalizando magia primordial y una conexión profunda con el mundo natural.",
      fuente: "PHB'24",
    },
    {
      id: "errante_feerico",
      nombre: "Errante Feérico",
      descripcion:
        "Una mística feérica te rodea. Tu risa alegre ilumina a los abatidos y tu destreza marcial aterroriza a tus enemigos.",
      fuente: "PHB'24",
    },
    {
      id: "acechador_sombrio",
      nombre: "Acechador Sombrío",
      descripcion:
        "Estás como en casa en los lugares más oscuros, empuñando magia del Shadowfell para combatir enemigos que acechan en la oscuridad.",
      fuente: "PHB'24",
    },
    {
      id: "acechador_horizonte",
      nombre: "Acechador del Horizonte",
      descripcion:
        "Proteges el mundo material de las amenazas extraplanares, viajando entre planos para cazar invasores.",
      fuente: "XGtE",
    },
    {
      id: "asesino_monstruos",
      nombre: "Asesino de Monstruos",
      descripcion:
        "Te especializas en cazar criaturas de la noche y portadores de magia siniestra: vampiros, dragones, infernales y otras amenazas mágicas.",
      fuente: "XGtE",
    },
    {
      id: "caminante_enjambre",
      nombre: "Caminante del Enjambre",
      descripcion:
        "Un enjambre de espíritus de la naturaleza se ha vinculado a ti, asistiéndote en batalla y sirviendo como compañía.",
      fuente: "TCoE",
    },
  ],

  // ─── GUERRERO ──────────────────────────────────────────────────────
  guerrero: [
    {
      id: "campeon",
      nombre: "Campeón",
      descripcion:
        "Persigues la excelencia física en combate. Amplías tu rango de crítico, ganas Inspiración Heroica en combate y resistes en las peores situaciones.",
      fuente: "PHB'24",
    },
    {
      id: "maestro_batalla",
      nombre: "Maestro de Batalla",
      descripcion:
        "Empleas maniobras tácticas con dados de superioridad para controlar el campo de batalla con precisión letal.",
      fuente: "PHB'24",
    },
    {
      id: "caballero_sobrenatural",
      nombre: "Caballero Sobrenatural",
      descripcion:
        "Complementas tu maestría marcial con conjuros arcanos de mago, combinando espada y hechicería.",
      fuente: "PHB'24",
    },
    {
      id: "psi_warrior",
      nombre: "Guerrero Psiónico",
      descripcion:
        "Despiertas el poder de tu mente para infundir golpes, crear escudos de fuerza y mover objetos con telequinesis.",
      fuente: "PHB'24",
    },
    {
      id: "arquero_arcano",
      nombre: "Arquero Arcano",
      descripcion:
        "Estudias un método élfico de arquería que teje magia en tus flechas para producir efectos sobrenaturales.",
      fuente: "XGtE",
    },
    {
      id: "caballero",
      nombre: "Caballero",
      descripcion:
        "Sobresales en combate montado y proteges a los que están bajo tu cuidado, marcando enemigos y controlando el campo de batalla.",
      fuente: "XGtE",
    },
    {
      id: "samurai",
      nombre: "Samurái",
      descripcion:
        "Tu espíritu inquebrantable te otorga ventaja en ataques, PG temporales y la capacidad de desafiar a la muerte misma.",
      fuente: "XGtE",
    },
    {
      id: "rune_knight",
      nombre: "Caballero de las Runas",
      descripcion:
        "Inscribes runas mágicas de gigantes en tu equipo, otorgándote poderes sobrenaturales y habilidad para crecer en tamaño.",
      fuente: "TCoE",
    },
  ],

  // ─── HECHICERO ─────────────────────────────────────────────────────
  hechicero: [
    {
      id: "mente_aberrante",
      nombre: "Hechicería Aberrante",
      descripcion:
        "Una influencia alienígena envuelve tu mente, otorgándote poder psiónico. Puedes tocar mentes ajenas y alterar el mundo a tu alrededor.",
      fuente: "PHB",
    },
    {
      id: "alma_relojeria",
      nombre: "Hechicería de Relojería",
      descripcion:
        "La fuerza cósmica del orden te ha imbuido de magia. Tu poder proviene de Mecanus o un plano similar, moldeado por la eficiencia mecánica.",
      fuente: "PHB",
    },
    {
      id: "linaje_draconico",
      nombre: "Hechicería Dracónica",
      descripcion:
        "Tu magia innata proviene del don de un dragón. Ganas escamas, afinidad elemental y alas dracónicas.",
      fuente: "PHB",
    },
    {
      id: "magia_salvaje",
      nombre: "Magia Salvaje",
      descripcion:
        "Tu magia innata surge del caos. Oleadas impredecibles de magia pueden tener efectos aleatorios, beneficiosos o peligrosos.",
      fuente: "PHB",
    },
    {
      id: "alma_divina",
      nombre: "Alma Divina",
      descripcion:
        "Una chispa divina alimenta tu magia. Puedes acceder a conjuros de clérigo además de los de hechicero.",
      fuente: "XGtE",
    },
    {
      id: "alma_sombras",
      nombre: "Magia de las Sombras",
      descripcion:
        "Tu poder procede del Shadowfell. Te rodeas de oscuridad, invocas sabuesos sombríos y caminas entre las sombras.",
      fuente: "XGtE",
    },
    {
      id: "tormenta_tempestuosa",
      nombre: "Hechicería de Tormenta",
      descripcion:
        "El poder de las tormentas fluye por tus venas. Controlas el viento, el rayo y el trueno a tu alrededor.",
      fuente: "XGtE",
    },
  ],

  // ─── MAGO ──────────────────────────────────────────────────────────
  mago: [
    // ── PHB'24 ──
    {
      id: "escuela_abjuracion",
      nombre: "Escuela de Abjuración",
      descripcion:
        "Te especializas en magia protectora. Ganas un Escudo Arcano de PG temporales que se recarga al lanzar conjuros de abjuración.",
      fuente: "PHB'24",
    },
    {
      id: "escuela_adivinacion",
      nombre: "Escuela de Adivinación",
      descripcion:
        "Percibes el futuro y lo oculto. Tras cada descanso largo tiras dados de Portento que puedes usar para reemplazar tiradas de ataque, salvación o aptitud.",
      fuente: "PHB'24",
    },
    {
      id: "escuela_evocacion",
      nombre: "Escuela de Evocación",
      descripcion:
        "Dominas la energía destructiva pura. Tus trucos de daño hieren incluso si el objetivo supera la salvación, y puedes esculpir estallar conjuros para proteger aliados.",
      fuente: "PHB'24",
    },
    {
      id: "escuela_ilusion",
      nombre: "Escuela de Ilusión",
      descripcion:
        "Creas engaños mágicos cada vez más realistas. Tus ilusiones mejoran y pueden llegar a hacerse parcialmente reales.",
      fuente: "PHB'24",
    },
    // ── PHB'14 (legacy) ──
    {
      id: "escuela_conjuracion",
      nombre: "Escuela de Conjuración",
      descripcion:
        "Dominas la invocación de criaturas y objetos. Puedes teletransportarte y crear cosas de la nada.",
      fuente: "PHB'14",
    },
    {
      id: "escuela_encantamiento",
      nombre: "Escuela de Encantamiento",
      descripcion:
        "Manipulas mentes y emociones. Tus hechizos de encantamiento son más poderosos y difíciles de resistir.",
      fuente: "PHB'14",
    },
    {
      id: "escuela_nigromancia",
      nombre: "Escuela de Nigromancia",
      descripcion:
        "Manipulas las fuerzas de la vida y la muerte. Puedes drenar vitalidad y crear siervos no muertos.",
      fuente: "PHB'14",
    },
    {
      id: "escuela_transmutacion",
      nombre: "Escuela de Transmutación",
      descripcion:
        "Alteras la forma y propiedades de la materia. Puedes crear la Piedra del Transmutador con propiedades especiales.",
      fuente: "PHB'14",
    },
    // ── Otros suplementos ──
    {
      id: "orden_escribas",
      nombre: "Orden de los Escribas",
      descripcion:
        "Usas un Despertar de tu libro de conjuros que cobra vida propia. Puedes cambiar tipos de daño y crear pergaminos mágicos.",
      fuente: "TCoE",
    },
    {
      id: "mago_guerra",
      nombre: "Mago de Guerra",
      descripcion:
        "Combinas defensa mágica con ofensiva arcana. Tu Oleada Arcana potencia tu iniciativa y tu Desviación Táctica mejora tu CA y salvaciones.",
      fuente: "XGE",
    },
    {
      id: "cronurgista",
      nombre: "Cronurgista",
      descripcion:
        "Manipulas el flujo del tiempo. Puedes ralentizar enemigos, acelerar aliados y alterar momentos en combate.",
      fuente: "EGtW",
    },
  ],

  // ─── MONJE ─────────────────────────────────────────────────────────
  monje: [
    {
      id: "guerrero_mano_abierta",
      nombre: "Guerrero de la Mano Abierta",
      descripcion:
        "Dominas las técnicas de combate desarmado. Tus golpes pueden impedir reacciones, empujar o derribar enemigos.",
      fuente: "PHB",
    },
    {
      id: "guerrero_sombra",
      nombre: "Guerrero de la Sombra",
      descripcion:
        "Canalizas el poder del Shadowfell para manipular sombras, teletransportarte y volverte invisible.",
      fuente: "PHB",
    },
    {
      id: "guerrero_elementos",
      nombre: "Guerrero de los Elementos",
      descripcion:
        "Canalizas el poder de los Planos Elementales para potenciar tus golpes con ácido, frío, fuego, rayo o trueno.",
      fuente: "PHB",
    },
    {
      id: "guerrero_misericordia",
      nombre: "Guerrero de la Misericordia",
      descripcion:
        "Manipulas la fuerza vital ajena: curas heridas con un toque y traes la muerte con el otro. A menudo lleváis máscara.",
      fuente: "PHB",
    },
    {
      id: "camino_yo_astral",
      nombre: "Camino del Yo Astral",
      descripcion:
        "Crees que tu cuerpo es una ilusión y tu yo astral es tu verdadera forma. Manifiestas brazos, rostro y cuerpo espectrales.",
      fuente: "TCoE",
    },
    {
      id: "camino_maestro_borracho",
      nombre: "Camino del Maestro Borracho",
      descripcion:
        "Te mueves con la torpeza impredecible de un borracho, ocultando un combate maestro tras tropiezos y tambaleos.",
      fuente: "XGtE",
    },
    {
      id: "camino_kensei",
      nombre: "Camino del Kensei",
      descripcion:
        "Tu práctica marcial se centra en armas específicas que dominas como extensiones de tu cuerpo y tu ki.",
      fuente: "XGtE",
    },
    {
      id: "camino_alma_solar",
      nombre: "Camino del Alma Solar",
      descripcion:
        "Canalizas la energía radiante del sol a través de tu ki para lanzar rayos de luz y crear escudos ardientes.",
      fuente: "XGtE",
    },
  ],

  // ─── PALADÍN ───────────────────────────────────────────────────────
  paladin: [
    {
      id: "juramento_devocion",
      nombre: "Juramento de Devoción",
      descripcion:
        "Dedicado a los ideales de justicia y orden. Eres un faro de esperanza, protección y virtud, el arquetipo del caballero de armadura reluciente.",
      fuente: "PHB'24",
    },
    {
      id: "juramento_antiguos",
      nombre: "Juramento de los Antiguos",
      descripcion:
        "Proteges la luz y la vida en el mundo. Amas lo bello y lo vivificante más que cualquier principio de honor o justicia.",
      fuente: "PHB'24",
    },
    {
      id: "juramento_gloria",
      nombre: "Juramento de Gloria",
      descripcion:
        "Aspiras a las alturas del heroísmo. Tú y tus compañeros estáis destinados a lograr la gloria mediante hazañas heroicas.",
      fuente: "PHB'24",
    },
    {
      id: "juramento_venganza",
      nombre: "Juramento de Venganza",
      descripcion:
        "Juraste castigar a quienes cometieron actos gravemente malvados. Tu furia sagrada se dirige contra el mal a cualquier coste.",
      fuente: "PHB'24",
    },
    {
      id: "juramento_conquista",
      nombre: "Juramento de Conquista",
      descripcion:
        "Aplastas el caos con fuerza implacable. Buscas gloria en batalla y la subyugación de tus enemigos.",
      fuente: "XGtE",
    },
    {
      id: "juramento_redencion",
      nombre: "Juramento de Redención",
      descripcion:
        "Crees que incluso los más malvados pueden redimirse. Usas la violencia solo como último recurso y la diplomacia como camino a la paz.",
      fuente: "XGtE",
    },
    {
      id: "juramento_vigilantes",
      nombre: "Juramento de los Vigilantes",
      descripcion:
        "Tu juramento es proteger los reinos mortales de las depredaciones de criaturas extraplanarias. Perfeccionas mente, espíritu y cuerpo como arma definitiva.",
      fuente: "TCoE",
    },
  ],

  // ─── PÍCARO ────────────────────────────────────────────────────────
  picaro: [
    {
      id: "ladron",
      nombre: "Ladrón",
      descripcion:
        "Perfeccionas las artes del hurto y la infiltración. Ganas manos rápidas, habilidad para trepar y usar objetos mágicos.",
      fuente: "PHB",
    },
    {
      id: "asesino",
      nombre: "Asesino",
      descripcion:
        "Te especializas en la eliminación rápida. Ganas competencia con venenos, disfraz y daño devastador contra objetivos desprevenidos.",
      fuente: "PHB",
    },
    {
      id: "embaucador_arcano",
      nombre: "Embaucador Arcano",
      descripcion:
        "Complementas tu agilidad con conjuros de mago, focalizándote en encantamiento e ilusión para engañar y controlar.",
      fuente: "PHB",
    },
    {
      id: "acechador_almas",
      nombre: "Acechador de Almas",
      descripcion:
        "Manifiestas cuchillas psiónicas de energía pura y usas poder mental para comunicarte telepáticamente.",
      fuente: "PHB",
    },
    {
      id: "espadachin",
      nombre: "Espadachín",
      descripcion:
        "Combinas encanto, agilidad y destreza con la espada. Provocas y esquivas con elegancia en combate.",
      fuente: "XGtE",
    },
    {
      id: "inquisitivo",
      nombre: "Inquisitivo",
      descripcion:
        "Eres un maestro deductivo. Descubres mentiras, detectas trampas y analizas debilidades con un vistazo.",
      fuente: "XGtE",
    },
    {
      id: "espia_maestro",
      nombre: "Espía Maestro",
      descripcion:
        "Tu dominio es la guerra social. Controlas información, diriges aliados a distancia y manipulas situaciones.",
      fuente: "XGtE",
    },
    {
      id: "fantasma",
      nombre: "Fantasma",
      descripcion:
        "Conectas con los espíritus de los muertos, adquiriendo habilidades y conocimientos de las almas que te rodean.",
      fuente: "TCoE",
    },
    {
      id: "explorador",
      nombre: "Explorador",
      descripcion:
        "Tu habilidad se centra en el reconocimiento y la supervivencia, moviéndote rápido y reaccionando antes que nadie.",
      fuente: "XGtE",
    },
  ],
};

// ─── Funciones auxiliares ────────────────────────────────────────────

/**
 * Obtiene las opciones de subclase disponibles para una clase.
 */
export function getSubclassOptions(classId: ClassId): SubclassOption[] {
  return SUBCLASS_OPTIONS[classId] ?? [];
}

/**
 * Busca una subclase por su ID.
 */
export function getSubclassById(
  classId: ClassId,
  subclassId: string,
): SubclassOption | undefined {
  return SUBCLASS_OPTIONS[classId]?.find((s) => s.id === subclassId);
}
