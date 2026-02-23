/**
 * Rasgos de subclase: Explorador
 */

import type { SubclassFeatureData } from "./types";

export const EXPLORADOR_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Cazador (PHB'24) ───────────────────────────────────────────────
  {
    subclaseId: "cazador",
    claseId: "explorador",
    nombre: "Cazador",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Presa del Cazador",
            descripcion:
              "Ganas una de las siguientes opciones. Puedes cambiar tu elección tras un descanso corto o largo.",
            elecciones: [
              {
                id: "presa_cazador",
                nombre: "Presa del Cazador",
                instruccion: "Elige tu especialización de caza:",
                tipo: "single",
                opciones: [
                  {
                    id: "matador_colosos",
                    nombre: "Matador de Colosos",
                    descripcion:
                      "Tu tenacidad puede desgastar incluso a los enemigos más resistentes. Cuando impactas a una criatura con un arma, el arma inflige 1d8 de daño extra al objetivo si le faltan PG. Solo puedes infligir este daño extra una vez por turno.",
                  },
                  {
                    id: "destructor_hordas",
                    nombre: "Destructor de Hordas",
                    descripcion:
                      "Una vez en cada uno de tus turnos, cuando hagas un ataque con un arma, puedes hacer otro ataque con la misma arma contra una criatura diferente que esté a 1,5 m del objetivo original, dentro del alcance de tu arma y que no hayas atacado este turno.",
                  },
                ],
              },
            ],
          },
          {
            nombre: "Conocimiento del Cazador",
            descripcion:
              "Puedes invocar las fuerzas de la naturaleza para revelar fortalezas y debilidades de tu presa. Mientras una criatura está marcada por tu Marca del Cazador, sabes si tiene Inmunidades, Resistencias o Vulnerabilidades, y cuáles son.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Tácticas Defensivas",
            descripcion:
              "Ganas una de las siguientes opciones. Puedes cambiar tu elección tras un descanso corto o largo.",
            elecciones: [
              {
                id: "tactica_defensiva",
                nombre: "Tácticas Defensivas",
                instruccion: "Elige tu táctica defensiva:",
                tipo: "single",
                opciones: [
                  {
                    id: "escapar_horda",
                    nombre: "Escapar de la Horda",
                    descripcion:
                      "Los ataques de oportunidad contra ti tienen desventaja.",
                  },
                  {
                    id: "defensa_multiataques",
                    nombre: "Defensa contra Multiataques",
                    descripcion:
                      "Cuando una criatura te impacta con una tirada de ataque, esa criatura tiene desventaja en todas las demás tiradas de ataque contra ti durante el resto del turno.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Presa Superior del Cazador",
            descripcion:
              "Una vez por turno, cuando infliges daño a una criatura marcada por tu Marca del Cazador, también puedes infligir el daño extra de ese conjuro a otra criatura diferente que puedas ver a 9 m de la primera criatura.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Defensa Superior del Cazador",
            descripcion:
              "Cuando recibes daño, puedes usar tu reacción para otorgarte resistencia a ese daño y a cualquier otro daño del mismo tipo hasta el final del turno actual.",
          },
        ],
      },
    ],
  },

  // ── Señor de las Bestias (PHB'24) ──────────────────────────────────
  {
    subclaseId: "senor_bestias",
    claseId: "explorador",
    nombre: "Señor de las Bestias",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Compañero Primordial",
            descripcion:
              "Invocas mágicamente una bestia primordial que obtiene fuerza de tu vínculo con la naturaleza. Elige su bloque de estadísticas: Bestia de Tierra, Bestia de Mar o Bestia de Cielo. También determinas el tipo de animal.\n\nEn combate, la bestia actúa en tu turno. Puede moverse y usar su reacción, pero solo usa la acción Esquivar a menos que uses una acción adicional para ordenarle una acción de su bloque de estadísticas u otra acción. También puedes sacrificar uno de tus ataques al usar la acción de Atacar para que la bestia use la acción Golpe Bestial.\n\nSi la bestia ha muerto en la última hora, puedes usar una acción mágica para tocarla y gastar un espacio de conjuro: vuelve a la vida tras 1 minuto con todos sus PG. Tras cada descanso largo, puedes invocar una bestia diferente.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Entrenamiento Excepcional",
            descripcion:
              "Cuando usas una acción adicional para ordenar a tu bestia una acción, también puedes ordenarle Correr, Desengancharse, Esquivar o Ayudar usando su acción adicional.\n\nAdemás, siempre que la bestia impacte con una tirada de ataque e inflija daño, puede infligir daño de fuerza o su tipo de daño normal (a tu elección).",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Furia Bestial",
            descripcion:
              "Cuando ordenas a tu bestia usar la acción Golpe Bestial, puede usarla dos veces.\n\nAdemás, la primera vez en cada turno que la bestia impacte a una criatura bajo el efecto de tu conjuro Marca del Cazador, inflige daño de fuerza extra igual al dado de bonificación de ese conjuro.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Compartir Conjuros",
            descripcion:
              "Cuando lanzas un conjuro con objetivo en ti mismo, también puedes afectar a tu bestia compañera con el conjuro si está a 9 m de ti.",
          },
        ],
      },
    ],
  },

  // ── Errante Feérico (PHB'24) ───────────────────────────────────────
  {
    subclaseId: "errante_feerico",
    claseId: "explorador",
    nombre: "Errante Feérico",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Golpes Temibles",
            descripcion:
              "Puedes aumentar tus golpes con arma con magia perturbadora del Feywild. Cuando impactas a una criatura con un arma, puedes infligir 1d4 de daño psíquico extra al objetivo (solo una vez por turno). El daño extra aumenta a 1d6 a nivel 11 de explorador.",
          },
          {
            nombre: "Conjuros del Errante Feérico",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de explorador. Nivel 3: Hechizar persona. Nivel 5: Paso brumoso. Nivel 9: Invocar feérico. Nivel 13: Puerta dimensional. Nivel 17: Engañar.",
          },
          {
            nombre: "Encanto Sobrenatural",
            descripcion:
              "Siempre que hagas una prueba de CAR, ganas una bonificación igual a tu mod. SAB (mínimo +1). También ganas competencia en una de estas habilidades a tu elección: Engaño, Interpretación o Persuasión.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Giro Cautivador",
            descripcion:
              "La magia del Feywild protege tu mente. Tienes ventaja en salvaciones para evitar o terminar las condiciones Hechizado o Asustado.\n\nAdemás, siempre que tú o una criatura que puedas ver a 36 m supere una salvación para evitar o terminar la condición Hechizado o Asustado, puedes usar tu reacción para forzar a otra criatura que puedas ver a 36 m a hacer una salvación de SAB contra tu CD de conjuro. Si falla, queda Hechizada o Asustada (a tu elección) durante 1 minuto. El objetivo repite la salvación al final de cada turno, terminando el efecto con un éxito.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Refuerzos Feéricos",
            descripcion:
              "Puedes lanzar Invocar Feérico sin componente material. También puedes lanzarlo una vez sin espacio de conjuro; recuperas la capacidad tras un descanso largo.\n\nSiempre que comiences a lanzar el conjuro, puedes modificarlo para que no requiera concentración. Si lo haces, la duración del conjuro es de 1 minuto para ese lanzamiento.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Caminante Brumoso",
            descripcion:
              "Puedes lanzar Paso Brumoso sin gastar espacio de conjuro un número de veces igual a tu mod. SAB (mín. 1); recuperas todos los usos tras un descanso largo.\n\nAdemás, siempre que lances Paso Brumoso, puedes llevar contigo a una criatura voluntaria que puedas ver a 1,5 m de ti. Esa criatura se teletransporta a un espacio desocupado de tu elección a 1,5 m de tu destino.",
          },
        ],
      },
    ],
  },

  // ── Acechador Sombrío (PHB'24) ─────────────────────────────────────
  {
    subclaseId: "acechador_sombrio",
    claseId: "explorador",
    nombre: "Acechador Sombrío",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Emboscador Temible",
            descripcion:
              "Has dominado el arte de crear emboscadas aterradoras.\n\n• Salto del Emboscador: Al inicio de tu primer turno de cada combate, tu velocidad aumenta en 3 m hasta el final de ese turno.\n• Golpe Temible: Cuando atacas a una criatura y la impactas con un arma, puedes infligir 2d6 de daño psíquico extra. Puedes usar este beneficio solo una vez por turno, un número de veces igual a tu mod. SAB (mín. 1); recuperas todos los usos tras un descanso largo.\n• Bonificación a la Iniciativa: Cuando tiras iniciativa, puedes sumar tu mod. SAB al resultado.",
          },
          {
            nombre: "Conjuros del Acechador Sombrío",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de explorador. Nivel 3: Disfrazarse. Nivel 5: Truco de cuerda. Nivel 9: Miedo. Nivel 13: Invisibilidad superior. Nivel 17: Apariencia.",
          },
          {
            nombre: "Visión Umbral",
            descripcion:
              "Ganas visión en la oscuridad con un alcance de 18 m. Si ya la tienes, su alcance aumenta en 18 m.\n\nAdemás, mientras estés completamente en Oscuridad, tienes la condición Invisible para cualquier criatura que dependa de la visión en la oscuridad para verte en esa Oscuridad.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Mente de Hierro",
            descripcion:
              "Has perfeccionado tu capacidad para resistir poderes que alteran la mente. Ganas competencia en salvaciones de SAB. Si ya la tienes, ganas competencia en salvaciones de INT o CAR (a tu elección).",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Ráfaga del Acechador",
            descripcion:
              "El daño psíquico de tu Golpe Temible aumenta a 2d8. Además, cuando uses el efecto Golpe Temible de tu rasgo Emboscador Temible, puedes causar uno de los siguientes efectos adicionales.\n\n• Golpe Repentino: Puedes hacer otro ataque con la misma arma contra una criatura diferente que esté a 1,5 m del objetivo original y dentro del alcance del arma.\n• Miedo Masivo: El objetivo y cada criatura a 3 m de él deben hacer una salvación de SAB contra tu CD de conjuro. Si fallan, tienen la condición Asustado hasta el inicio de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Esquiva Sombría",
            descripcion:
              "Cuando una criatura hace una tirada de ataque contra ti, puedes usar tu reacción para imponerle desventaja en esa tirada. Tanto si el ataque impacta como si falla, puedes teletransportarte hasta 9 m a un espacio desocupado que puedas ver.",
          },
        ],
      },
    ],
  },

  // ── Acechador del Horizonte (XGE) ──────────────────────────────────
  {
    subclaseId: "acechador_horizonte",
    claseId: "explorador",
    nombre: "Acechador del Horizonte",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Acechador del Horizonte",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de explorador. Nivel 3: Protección contra el bien y el mal. Nivel 5: Paso brumoso. Nivel 9: Acelerar. Nivel 13: Destierro. Nivel 17: Círculo de teletransportación.",
          },
          {
            nombre: "Detectar Portal",
            descripcion:
              "Como acción, detectas la distancia y dirección al portal planar más cercano a 1,5 km de ti. Una vez usado, debes terminar un descanso corto o largo para volver a usarlo.",
          },
          {
            nombre: "Guerrero Planar",
            descripcion:
              "Como acción adicional, elige una criatura que puedas ver a 9 m de ti. La próxima vez que impactes a esa criatura en este turno con un ataque de arma, todo el daño se convierte en daño de fuerza, y la criatura recibe 1d8 de daño de fuerza extra. El daño extra aumenta a 2d8 a nivel 11.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Paso Etéreo",
            descripcion:
              "Como acción adicional, puedes lanzar Forma Etérea sin gastar un espacio de conjuro, pero el conjuro termina al final del turno actual. Una vez por descanso corto o largo.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Golpe Distante",
            descripcion:
              "Cuando usas la acción de Atacar, puedes teletransportarte hasta 3 m antes de cada ataque a un espacio desocupado que puedas ver. Si atacas al menos a dos criaturas diferentes con la acción, puedes hacer un ataque adicional contra una tercera criatura.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Defensa Espectral",
            descripcion:
              "Cuando recibes daño de un ataque, puedes usar tu reacción para otorgarte resistencia a todo el daño de ese ataque en este turno.",
          },
        ],
      },
    ],
  },

  // ── Asesino de Monstruos (XGE) ─────────────────────────────────────
  {
    subclaseId: "asesino_monstruos",
    claseId: "explorador",
    nombre: "Asesino de Monstruos",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Asesino de Monstruos",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de explorador. Nivel 3: Protección contra el bien y el mal. Nivel 5: Zona de verdad. Nivel 9: Círculo mágico. Nivel 13: Destierro. Nivel 17: Retener monstruo.",
          },
          {
            nombre: "Sentido del Cazador",
            descripcion:
              "Como acción, elige una criatura que puedas ver a 18 m de ti. Aprendes inmediatamente si tiene inmunidades, resistencias o vulnerabilidades al daño y cuáles son. Si está oculta a la magia de adivinación, percibes que no tiene ninguna.\n\nUsos iguales a tu mod. SAB (mín. 1); recuperas todos los usos tras un descanso largo.",
          },
          {
            nombre: "Presa del Cazabestias",
            descripcion:
              "Como acción adicional, designa una criatura que puedas ver a 18 m como objetivo de este rasgo. La primera vez en cada turno que impactes a ese objetivo con un ataque de arma, recibe 1d6 de daño extra del arma. Dura hasta un descanso corto o largo, o hasta que designes a otra criatura.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Defensa Sobrenatural",
            descripcion:
              "Siempre que el objetivo de tu Presa del Cazabestias te fuerce a hacer una salvación, o siempre que hagas una prueba para escapar de su agarre, suma 1d6 a tu tirada.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Némesis del Usuario de Magia",
            descripcion:
              "Cuando veas a una criatura lanzar un conjuro o teletransportarse a 18 m de ti, puedes usar tu reacción para intentar frustrarla mágicamente. La criatura debe superar una salvación de SAB contra tu CD de conjuro, o su conjuro o teletransportación falla y se desperdicia. Una vez por descanso corto o largo.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Contraataque del Cazabestias",
            descripcion:
              "Si el objetivo de tu Presa del Cazabestias te fuerza a hacer una salvación, puedes usar tu reacción para hacer un ataque de arma contra él. Este ataque se realiza inmediatamente antes de la salvación. Si impactas, tu salvación tiene éxito automáticamente, además de los efectos normales del ataque.",
          },
        ],
      },
    ],
  },

  // ── Caminante del Enjambre (TCE) ───────────────────────────────────
  {
    subclaseId: "caminante_enjambre",
    claseId: "explorador",
    nombre: "Caminante del Enjambre",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Enjambre Reunido",
            descripcion:
              "Un enjambre de espíritus intangibles de la naturaleza se ha vinculado a ti. Una vez en cada uno de tus turnos, puedes hacer que el enjambre te asista de una de las siguientes formas, inmediatamente después de impactar a una criatura con un ataque:\n\n• El objetivo del ataque recibe 1d6 de daño perforante del enjambre.\n• El objetivo debe superar una salvación de FUE contra tu CD de conjuro o ser movido hasta 4,5 m horizontalmente en una dirección de tu elección.\n• Tú eres movido 1,5 m horizontalmente en una dirección de tu elección.",
          },
          {
            nombre: "Conjuros del Caminante del Enjambre",
            descripcion:
              "Aprendes el truco Mano de Mago (el mano toma la forma de tu enjambre). Siempre tienes preparados ciertos conjuros según tu nivel de explorador. Nivel 3: Fuego feérico. Nivel 5: Telaraña. Nivel 9: Forma gaseosa. Nivel 13: Ojo arcano. Nivel 17: Plaga de insectos.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Marea Retorcida",
            descripcion:
              "Como acción adicional, ganas velocidad de vuelo de 3 m y puedes flotar. Este efecto dura 1 minuto o hasta que estés incapacitado. Usos iguales a tu bonificador de competencia por descanso largo.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Enjambre Poderoso",
            descripcion:
              "Tu Enjambre Reunido mejora de las siguientes formas:\n\n• El daño del enjambre aumenta a 1d8.\n• Si una criatura falla su salvación contra ser movida por el enjambre, también puedes hacer que el enjambre la derribe.\n• Cuando eres movido por el enjambre, obtienes media cobertura hasta el inicio de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Dispersión del Enjambre",
            descripcion:
              "Puedes descorporizarte en tu enjambre para esquivar el peligro. Cuando recibes daño, puedes usar tu reacción para otorgarte resistencia a ese daño. Desapareces en tu enjambre y luego te teletransportas a un espacio desocupado que puedas ver a 9 m, donde reapareces con el enjambre.\n\nUsos iguales a tu bonificador de competencia por descanso largo.",
          },
        ],
      },
    ],
  },
];
