/**
 * Rasgos de subclase: Mago
 * PHB'24: Abjuración, Adivinación, Evocación, Ilusión
 * PHB'14: Conjuración, Encantamiento, Nigromancia, Transmutación
 * XGE: Mago de Guerra
 * TCoE: Orden de los Escribas
 * EGtW: Cronurgista
 */

import type { SubclassFeatureData } from "./types";

export const MAGO_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ══════════════════════════════════════════════════════════════════
  //  PHB'24
  // ══════════════════════════════════════════════════════════════════

  // ── Escuela de Abjuración (PHB'24) ────────────────────────────────
  {
    subclaseId: "escuela_abjuracion",
    claseId: "mago",
    nombre: "Escuela de Abjuración",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Sabio de Abjuración",
            descripcion:
              "Cada vez que ganas un nivel de Mago a partir del 3, puedes añadir un conjuro de Abjuración del listado de Mago a tu libro de conjuros gratis (debe ser de un nivel que puedas preparar). Además, al obtener esta subclase elige 2 conjuros de Abjuración de nivel 1 del listado de Mago y añádelos gratis al libro.",
          },
          {
            nombre: "Custodia Arcana",
            descripcion:
              "Puedes tejer magia protectora a tu alrededor. Cuando lanzas un conjuro de Abjuración de nivel 1+, la custodia gana PG iguales al doble del nivel del conjuro. La custodia tiene PG máximos = tu nivel de Mago × 2 + tu mod. INT. Cada vez que recibes daño, la custodia absorbe el daño primero. Si la custodia llega a 0 PG, el exceso de daño lo recibes tú.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Custodia Proyectada",
            descripcion:
              "Cuando una criatura que puedas ver a 9 m recibe daño, puedes usar tu reacción para hacer que tu Custodia Arcana absorba ese daño. Si la custodia se reduce a 0, tú recibes el daño sobrante.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Rompeconjuros",
            descripcion:
              "Puedes usar Disipar Magia como acción adicional. Además, cuando restauras PG con éxito a una criatura usando un conjuro de Abjuración de nivel 1+, también puedes terminar un conjuro de tu elección sobre esa criatura (de un nivel igual o inferior al espacio usado para el conjuro de abjuración).",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Resistencia a Conjuros",
            descripcion:
              "Tienes Ventaja en las tiradas de salvación contra conjuros y tienes Resistencia al daño de los conjuros.",
          },
        ],
      },
    ],
  },

  // ── Escuela de Adivinación (PHB'24) ────────────────────────────────
  {
    subclaseId: "escuela_adivinacion",
    claseId: "mago",
    nombre: "Escuela de Adivinación",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Sabio de Adivinación",
            descripcion:
              "Cada vez que ganas un nivel de Mago a partir del 3, puedes añadir un conjuro de Adivinación del listado de Mago a tu libro de conjuros gratis (debe ser de un nivel que puedas preparar). Además, al obtener esta subclase elige 2 conjuros de Adivinación de nivel 1 del listado de Mago y añádelos gratis al libro.",
          },
          {
            nombre: "Portento",
            descripcion:
              "Al terminar un Descanso Largo, tiras 2d20 y anotas los resultados. Puedes reemplazar cualquier tirada de Prueba de Ataque, Salvación o Aptitud hecha por ti o una criatura que puedas ver por una de esas tiradas de Portento. Debes decidir antes de la tirada. Cada dado de Portento se usa una vez.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Adivinación Experta",
            descripcion:
              "Lanzar conjuros de adivinación te resulta natural. Cuando lanzas un conjuro de Adivinación de nivel 2+ usando un espacio de conjuro, recuperas un espacio de nivel inferior al usado (máximo nv5).",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "El Tercer Ojo",
            descripcion:
              "Como acción adicional, ganas uno de los siguientes beneficios hasta que hagas un Descanso Corto o Largo: Visión en la oscuridad 36 m, la capacidad de ver al Plano Etéreo a 18 m, la capacidad de leer cualquier idioma, o la capacidad de ver criaturas y objetos Invisibles a 3 m.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Portento Mayor",
            descripcion:
              "Las visiones en tus sueños se intensifican. Ahora tiras 3d20 para tu rasgo Portento en lugar de 2d20.",
          },
        ],
      },
    ],
  },

  // ── Escuela de Evocación (PHB'24) ──────────────────────────────────
  {
    subclaseId: "escuela_evocacion",
    claseId: "mago",
    nombre: "Escuela de Evocación",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Sabio de Evocación",
            descripcion:
              "Cada vez que ganas un nivel de Mago a partir del 3, puedes añadir un conjuro de Evocación del listado de Mago a tu libro de conjuros gratis (debe ser de un nivel que puedas preparar). Además, al obtener esta subclase elige 2 conjuros de Evocación de nivel 1 del listado de Mago y añádelos gratis al libro.",
          },
          {
            nombre: "Truco Potente",
            descripcion:
              "Tus trucos de daño afectan incluso a criaturas que superen su salvación. En lugar de no sufrir daño, reciben la mitad del daño del truco (sin efectos adicionales).",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Esculpir Conjuros",
            descripcion:
              "Cuando lanzas un conjuro de Evocación que obligue a otras criaturas a hacer una salvación, puedes proteger a algunas de ellas. Elige un número de criaturas hasta 1 + el nivel del conjuro. Las criaturas elegidas superan automáticamente la salvación y no reciben daño del conjuro.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Evocación Empoderada",
            descripcion:
              "Puedes añadir tu mod. INT a una tirada de daño de cualquier conjuro de Evocación de Mago que lances. El daño extra se aplica a una sola tirada de daño del conjuro, que puede afectar a una o más criaturas.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Sobrecargar",
            descripcion:
              "Puedes aumentar el poder de tus conjuros de evocación más simples. Cuando lanzas un conjuro de Evocación de mago de nivel 1–5, puedes infligir el daño máximo con él. Puedes usar esto una vez gratis por Descanso Largo. Si lo usas otra vez antes de un Descanso Largo, recibes 2d10 de daño Necrótico por nivel del conjuro (que no puedes reducir). Cada vez adicional el daño por uso previo se acumula.",
          },
        ],
      },
    ],
  },

  // ── Escuela de Ilusión (PHB'24) ────────────────────────────────────
  {
    subclaseId: "escuela_ilusion",
    claseId: "mago",
    nombre: "Escuela de Ilusión",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Sabio de Ilusión",
            descripcion:
              "Cada vez que ganas un nivel de Mago a partir del 3, puedes añadir un conjuro de Ilusión del listado de Mago a tu libro de conjuros gratis (debe ser de un nivel que puedas preparar). Además, al obtener esta subclase elige 2 conjuros de Ilusión de nivel 1 del listado de Mago y añádelos gratis al libro.",
          },
          {
            nombre: "Ilusiones Mejoradas",
            descripcion:
              "Al lanzar un conjuro de Ilusión con un componente Material, puedes quitar el componente Material si cuesta 10 po o menos. Además, puedes lanzar el truco Ilusión Menor sin componente Somático, al lanzarlo creas tanto una imagen como un sonido a la vez, y aumentas su tamaño hasta un cubo de 3 m de cada lado.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Criaturas Fantasmales",
            descripcion:
              "Siempre tienes preparado el conjuro Invocación de Bestias Fantasmales. Cuando lo lanzas puedes cambiar su área de Cono a Esfera de 3 m de radio dentro de 18 m, y puedes elegir que las formas ilusorias tengan el aspecto de objetos o fenómenos ambientales (niebla, lluvia, etc.) en lugar de criaturas.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Yo Ilusorio",
            descripcion:
              "Cuando recibes daño de una criatura que puedas ver, puedes usar tu reacción para interponer una copia ilusoria entre tú y el atacante. El ataque falla automáticamente y tú te teletransportas hasta 9 m a un espacio que puedas ver. Puedes usar esto un número de veces igual a tu mod. INT (mínimo 1) por Descanso Largo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Realidad Ilusoria",
            descripcion:
              "Cuando lanzas un conjuro de Ilusión de nivel 1+, puedes elegir un objeto inanimado no mágico que forme parte de la ilusión y hacerlo real. El objeto permanece real hasta 1 minuto y debe caber en un cubo de 1,5 m. No puede infligir daño ni crear condiciones perjudiciales directamente. Puedes usar esto una vez por Descanso Corto o Largo.",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  //  PHB'14 (legacy) — rasgos remapeados a nv 3/6/10/14
  // ══════════════════════════════════════════════════════════════════

  // ── Escuela de Conjuración (PHB'14) ────────────────────────────────
  {
    subclaseId: "escuela_conjuracion",
    claseId: "mago",
    nombre: "Escuela de Conjuración",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Erudito en Conjuración",
            descripcion:
              "El oro y tiempo para copiar conjuros de conjuración en tu libro se reduce a la mitad.",
          },
          {
            nombre: "Conjuración Menor",
            descripcion:
              "Como acción, conjuras un objeto inanimado en tu mano o en el suelo a 3 m. No puede ser mayor que 90 cm de lado ni pesar más de 5 kg. Desaparece tras 1 hora o al usar esta capacidad de nuevo. No puede ser un objeto mágico.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Transposición Benigna",
            descripcion:
              "Como acción, te teletransportas hasta 9 m a un espacio desocupado que puedas ver. Alternativamente, elige a una criatura voluntaria Pequeña o Mediana a 9 m: os intercambiáis posiciones. Una vez por descanso largo (o gasta un espacio de conjuro para repetirlo).",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Conjuración Enfocada",
            descripcion:
              "Mientras te concentras en un conjuro de conjuración, tu concentración no se rompe al recibir daño.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Invocaciones Perdurables",
            descripcion:
              "Cualquier criatura que invoques o crees con un conjuro de conjuración tiene 30 PG temporales.",
          },
        ],
      },
    ],
  },

  // ── Escuela de Encantamiento (PHB'14) ──────────────────────────────
  {
    subclaseId: "escuela_encantamiento",
    claseId: "mago",
    nombre: "Escuela de Encantamiento",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Erudito en Encantamiento",
            descripcion:
              "El oro y tiempo para copiar conjuros de encantamiento en tu libro se reduce a la mitad.",
          },
          {
            nombre: "Mirada Hipnótica",
            descripcion:
              "Como acción, elige a un humanoide a 1,5 m que puedas ver. Si no es hostil, queda hechizado hasta el final de tu siguiente turno. Velocidad 0, incapacitado, visiblemente aturdido. En turnos siguientes puedes mantener el efecto con tu acción. Termina si te mueves a más de 1,5 m de la criatura, si no puede verte ni oírte, o si recibe daño.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Encanto Instintivo",
            descripcion:
              "Cuando una criatura a 9 m que puedas ver te ataca, puedes usar tu reacción para desviar el ataque a otra criatura a 9 m (debe poder ser objetivo). El atacante debe hacer salvación de SAB; si falla, debe atacar a la otra criatura.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Encantamiento Dividido",
            descripcion:
              "Cuando lanzas un conjuro de encantamiento de nivel 1+ que apunte a una sola criatura, puedes apuntar a una segunda criatura en el alcance del conjuro.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Alterar Recuerdos",
            descripcion:
              "Cuando una criatura queda hechizada por tus conjuros, puedes alterar su memoria: no recuerda nada de lo que hiciste mientras estuvo hechizada (1 + mod. de CAR horas).",
          },
        ],
      },
    ],
  },

  // ── Escuela de Nigromancia (PHB'14) ────────────────────────────────
  {
    subclaseId: "escuela_nigromancia",
    claseId: "mago",
    nombre: "Escuela de Nigromancia",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Erudito en Nigromancia",
            descripcion:
              "El oro y tiempo para copiar conjuros de nigromancia en tu libro se reduce a la mitad.",
          },
          {
            nombre: "Cosecha Lúgubre",
            descripcion:
              "Cuando matas a una o más criaturas con un conjuro de nivel 1+, recuperas PG iguales al doble del nivel del conjuro (o triple si es de nigromancia). No funciona contra constructos ni no-muertos.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Siervos No Muertos",
            descripcion:
              "Los no-muertos que crees con Animar Muertos tienen beneficios adicionales: sus PG máximos aumentan en tu nivel de mago, y añaden tu bon. de competencia a sus tiradas de daño con armas.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Acostumbrado a la No Muerte",
            descripcion:
              "Ganas resistencia al daño necrótico. Tu máximo de PG no puede ser reducido.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Dominar No Muertos",
            descripcion:
              "Como acción, apuntas a un no-muerto a 18 m: salvación de CAR con desventaja de tu CD de conjuro o queda bajo tu control. Un no-muerto inteligente (INT 8+) repite la salvación al final de cada hora. Si tiene éxito, no puedes usarlo contra él de nuevo.",
          },
        ],
      },
    ],
  },

  // ── Escuela de Transmutación (PHB'14) ──────────────────────────────
  {
    subclaseId: "escuela_transmutacion",
    claseId: "mago",
    nombre: "Escuela de Transmutación",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Erudito en Transmutación",
            descripcion:
              "El oro y tiempo para copiar conjuros de transmutación en tu libro se reduce a la mitad.",
          },
          {
            nombre: "Alquimia Menor",
            descripcion:
              "Puedes alterar temporalmente las propiedades de materiales no mágicos. Como acción, transformas hasta 30 cm cúbicos de madera en piedra, piedra en hierro, hierro en cobre, o cobre en plata. Dura 1 hora o hasta que pierdas concentración.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Piedra del Transmutador",
            descripcion:
              "En 8 horas creas una piedra que otorga uno de estos beneficios al portador: visión en la oscuridad 18 m, +3 m de velocidad, competencia en salvaciones de CON, o resistencia a un tipo de daño elemental (ácido, frío, fuego, rayo o trueno). Eliges el beneficio al crearla y puedes cambiarlo con Alquimia Menor.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Cambiaformas",
            descripcion:
              "Puedes lanzar Polimorfismo sobre ti mismo sin gastar un espacio de conjuro. Cuando lo haces, solo puedes transformarte en una bestia con CR igual o inferior a 1. Una vez por descanso corto.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Transmutador Maestro",
            descripcion:
              "Puedes destruir tu Piedra del Transmutador para obtener uno de estos efectos: transmutar un objeto no mágico (hasta 1,5 m de lado) a otro material; eliminar maldiciones, enfermedades y venenos de una criatura; lanzar Revivir a una criatura tocando la piedra en los 8 minutos siguientes a su muerte; o lanzar Alterar Forma sobre ti mismo.",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  //  Otros suplementos — rasgos remapeados a nv 3/6/10/14
  // ══════════════════════════════════════════════════════════════════

  // ── Orden de los Escribas (TCoE) ───────────────────────────────────
  {
    subclaseId: "orden_escribas",
    claseId: "mago",
    nombre: "Orden de los Escribas",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Pluma del Mago",
            descripcion:
              "Como acción adicional, creas una pluma mágica Diminuta en tu mano libre. Tiene las siguientes propiedades: no necesita tinta; el tiempo para copiar un conjuro en tu libro se reduce a 2 minutos por nivel; puedes borrar lo que hayas escrito con ella pasando la pluma. La pluma desaparece si creas otra o mueres.",
          },
          {
            nombre: "Libro de Conjuros Despierto",
            descripcion:
              "Usando herramientas de caligrafía especiales, tu libro cobra una conciencia limitada. Mientras lo tengas en la mano: puedes usar el libro como foco arcano; cuando lanzas un conjuro de mago con daño, puedes cambiar su tipo de daño por el de otro conjuro del libro del mismo nivel; una vez por descanso largo, puedes lanzar un conjuro ritual en su tiempo normal en vez de +10 min.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Mente Manifiesta",
            descripcion:
              "Como acción adicional, proyectas la mente de tu Libro de Conjuros Despierto como un objeto Diminuto espectral a 18 m. La mente flota, tiene 60 pies de visión a oscuras, y puede percibir por ti desde su posición. Puedes lanzar conjuros de mago desde su posición (usando tus estadísticas). Puedes moverla hasta 9 m como acción adicional. Usos = mod. INT (mín. 1) por descanso largo; reaparece con un espacio de conjuro.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Escriba Maestro",
            descripcion:
              "Cuando terminas un descanso largo, puedes crear un pergamino mágico tocando tu Pluma a un papel en blanco. El pergamino contiene un conjuro de tu libro de nivel 1 o 2 (el conjuro se borra del libro temporalmente). Cualquiera que sostenga el pergamino puede lanzar el conjuro usando tu aptitud y CD. El espacio gastado es de 1 nivel inferior al del conjuro (mín. 1). El pergamino pierde su potencia cuando inicias un descanso largo y el conjuro vuelve al libro.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Uno con la Palabra",
            descripcion:
              "Tu conexión con el libro es total. Mientras lleves tu Libro de Conjuros Despierto, tienes Ventaja en salvaciones de Arcano. Si recibes daño mientras tu Mente Manifiesta está activa, puedes usar tu reacción para disiparla, hacerte resistente al daño y recibir la mitad. Si tu libro es destruido, puedes usar tu reacción para sacrificar 3d6 conjuros del libro (aleatorios, todos los niveles) para evitar su destrucción.",
          },
        ],
      },
    ],
  },

  // ── Mago de Guerra (XGE) ───────────────────────────────────────────
  {
    subclaseId: "mago_guerra",
    claseId: "mago",
    nombre: "Mago de Guerra",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Desviación Arcana",
            descripcion:
              "Cuando te golpea un ataque o fallas una salvación, puedes usar tu reacción para ganar +2 a CA contra ese ataque o +4 a la salvación. Si lo usas, no puedes lanzar conjuros de nivel 1+ hasta el final de tu siguiente turno (solo trucos).",
          },
          {
            nombre: "Ingenio Táctico",
            descripcion:
              "Sumas tu mod. INT a tus tiradas de iniciativa.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Oleada de Poder",
            descripcion:
              "Acumulas energía mágica residual de tu magia defensiva. Empiezas con oleadas de poder = mitad de tu nivel de mago (redondeado arriba). Ganas una oleada cuando usas Desviación Arcana o disipas un conjuro con éxito (máx. = mitad nivel mago). Como acción adicional, puedes gastar una oleada para infligir daño de Fuerza extra = mitad de tu nivel de mago a un objetivo del conjuro.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Magia Duradera",
            descripcion:
              "Mientras mantienes concentración en un conjuro, ganas +2 a CA y a todas las salvaciones.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Manto Desviador",
            descripcion:
              "Cuando usas Desviación Arcana, hasta 3 criaturas a tu elección dentro de 18 m reciben daño de Fuerza igual a la mitad de tu nivel de Mago.",
          },
        ],
      },
    ],
  },

  // ── Cronurgista (EGtW) ─────────────────────────────────────────────
  {
    subclaseId: "cronurgista",
    claseId: "mago",
    nombre: "Cronurgista",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Ajuste Temporal",
            descripcion:
              "Como reacción, cuando tú u otra criatura a 9 m hace una tirada de ataque, prueba de habilidad o salvación, puedes obligar a repetirla. Usos iguales a tu mod. de INT por descanso largo.",
          },
          {
            nombre: "Cronurgía Temporal",
            descripcion:
              "Como acción adicional, elige una criatura Grande o menor a 18 m que puedas ver: salvación de SAB o su velocidad se reduce a la mitad, no puede hacer reacciones, y no puede hacer más de un ataque en su turno, hasta el final de tu siguiente turno. Usos = mod. de INT por descanso largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Hechizo Acelerado",
            descripcion:
              "Cuando lanzas un conjuro de nivel 1–4 con tiempo de 1 acción, puedes condensarlo en un mote de posibilidad (una esfera Diminuta, brillante). Cualquier criatura que lleve el mote puede lanzar el conjuro usando tu aptitud y CD. El mote desaparece tras 1 hora o al usarse. Usos = mod. de INT por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Convergencia de la Posibilidad",
            descripcion:
              "Puedes proteger a una criatura contra un peligro futuro. Como acción, elige una criatura a 18 m. La próxima vez que reciba daño en el siguiente minuto, puede usar su reacción para ganar Resistencia a ese daño y teletransportarse hasta 9 m. Una vez por Descanso Largo (o gasta un espacio de nv5+ para repetirlo).",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Arcanos Inversos",
            descripcion:
              "Tu comprensión del tiempo te permite manipular la magia. Cuando ves una criatura a 18 m lanzar un conjuro, puedes usar tu reacción para gastar un espacio del mismo nivel o superior e intentar anularlo con contrahechizo automático.",
          },
        ],
      },
    ],
  },
];
