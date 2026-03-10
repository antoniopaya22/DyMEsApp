/**
 * Rasgos de subclase: Hechicero
 */

import type { SubclassFeatureData } from "./types";

export const HECHICERO_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // -- Hechiceria Aberrante -----------------------------------------
  {
    subclaseId: "mente_aberrante",
    claseId: "hechicero",
    nombre: "Hechiceria Aberrante",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros Psionicos",
            descripcion:
              "Siempre tienes preparados los siguientes conjuros segun tu nivel de hechicero:\nNv 3: Brazos de Hadar, Calmar Emociones, Detectar Pensamientos, Susurros Disonantes, Dardo Mental.\nNv 5: Hambre de Hadar, Enviar.\nNv 7: Tentaculos Negros de Evard, Invocar Aberracion.\nNv 9: Vinculo Telepatico de Rary, Telequinesis.",
          },
          {
            nombre: "Habla Telepatica",
            descripcion:
              "Como accion adicional, elige una criatura visible a 9 m. Tu y ella podeis comunicaros telepaticamente mientras esteis a un numero de millas igual a tu mod. CAR (min. 1). Debeis usar mentalmente un idioma que el otro conozca. Dura un numero de minutos igual a tu nivel de hechicero. Termina si lo usas con otra criatura.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Hechiceria Psionica",
            descripcion:
              "Cuando lanzas un conjuro de nivel 1+ de tu lista de Conjuros Psionicos, puedes lanzarlo gastando PH iguales al nivel del conjuro en lugar de un espacio. Si lo haces, no requiere componentes verbales, somaticos ni materiales (salvo las consumidas o con coste).",
          },
          {
            nombre: "Defensas Psiquicas",
            descripcion:
              "Tienes resistencia al dano psiquico y ventaja en salvaciones para evitar o terminar las condiciones de Hechizado y Asustado.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "psiquico",
                modifier: "resistance",
              },
            ],
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Revelacion en la Carne",
            descripcion:
              "Como accion adicional, gastas 1 PH o mas para alterar tu cuerpo durante 10 minutos. Por cada PH gastado, eliges un beneficio:\n- Adaptacion Acuatica: velocidad de nadar = 2x velocidad, puedes respirar bajo el agua.\n- Vuelo Reluciente: velocidad de vuelo = tu velocidad, puedes flotar.\n- Ver lo Invisible: ves criaturas Invisibles a 18 m sin cobertura total.\n- Movimiento Vermiforme: puedes atravesar espacios de 2,5 cm y gastar 1,5 m de movimiento para escapar de agarres no magicos.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Implosion Deformante",
            descripcion:
              "Como accion de Magia, te teletransportas a un espacio desocupado visible a 36 m. Cada criatura a 9 m del espacio que dejaste debe hacer salvacion de FUE contra tu CD de conjuros. Si falla: 3d10 de fuerza y es arrastrada al espacio mas cercano al que dejaste. Si tiene exito: mitad de dano. Una vez por descanso largo, o gastando 5 PH.",
          },
        ],
      },
    ],
  },

  // -- Hechiceria de Relojeria --------------------------------------
  {
    subclaseId: "alma_relojeria",
    claseId: "hechicero",
    nombre: "Hechiceria de Relojeria",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Relojeria",
            descripcion:
              "Siempre tienes preparados los siguientes conjuros segun tu nivel de hechicero:\nNv 3: Ayuda, Alarma, Restauracion Menor, Proteccion contra el Bien y el Mal.\nNv 5: Disipar Magia, Proteccion contra Energia.\nNv 7: Libertad de Movimiento, Invocar Constructo.\nNv 9: Restauracion Mayor, Muro de Fuerza.",
          },
          {
            nombre: "Restablecer el Equilibrio",
            descripcion:
              "Cuando una criatura visible a 18 m esta a punto de hacer una tirada con ventaja o desventaja, puedes usar tu reaccion para anular esa ventaja o desventaja. Usos = mod. CAR (min. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Bastion del Derecho",
            descripcion:
              "Como accion de Magia, gastas de 1 a 5 PH para crear una custodia magica sobre ti o una criatura visible a 9 m. La custodia tiene un numero de d8 igual a los PH gastados. Cuando la criatura protegida recibe dano, puede gastar esos dados, tirarlos y reducir el dano en el total. Dura hasta tu proximo descanso largo o hasta que lo uses de nuevo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Trance del Orden",
            descripcion:
              "Como accion adicional, entras en un estado de armonia durante 1 minuto: las tiradas de ataque contra ti no pueden beneficiarse de ventaja, y cuando hagas una tirada de d20, puedes tratar un resultado de 9 o menos como un 10. Una vez por descanso largo, o gastando 5 PH.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Cabalgata de Relojeria",
            descripcion:
              "Como accion de Magia, invocas espiritus del orden en un Cubo de 9 m originado en ti. Los espiritus crean los siguientes efectos:\n- Curar: restauran hasta 100 PG, repartidos como quieras entre criaturas en el Cubo.\n- Reparar: todos los objetos danados completamente dentro del Cubo se reparan al instante.\n- Disipar: todo conjuro de nivel 6 o menor termina sobre criaturas y objetos de tu eleccion en el Cubo.\nUna vez por descanso largo, o gastando 7 PH.",
          },
        ],
      },
    ],
  },

  // -- Hechiceria Draconica -----------------------------------------
  {
    subclaseId: "linaje_draconico",
    claseId: "hechicero",
    nombre: "Hechiceria Draconica",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Resiliencia Draconica",
            descripcion:
              "Tu maximo de PG aumenta en 3, y aumenta en 1 por cada nivel de hechicero posterior. Ademas, partes de tu cuerpo estan cubiertas de escamas dragonicas: mientras no lleves armadura, tu CA base es 10 + mod. DES + mod. CAR.",
            efectos: [
              {
                kind: "acFormula",
                formula: {
                  type: "unarmoredDefense",
                  abilities: ["des", "car"],
                },
                allowShield: true,
              },
              { kind: "hpBonus", perLevel: 1 },
            ],
          },
          {
            nombre: "Conjuros Draconicos",
            descripcion:
              "Siempre tienes preparados los siguientes conjuros segun tu nivel de hechicero:\nNv 3: Alterar Aspecto, Orbe Cromatico, Orden Imperiosa, Aliento de Dragon.\nNv 5: Miedo, Volar.\nNv 7: Ojo Arcano, Hechizar Monstruo.\nNv 9: Conocimiento de Leyendas, Invocar Dragon.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Afinidad Elemental",
            descripcion:
              "Tu magia tiene afinidad con un tipo de dano asociado a los dragones. Elige uno: Acido, Frio, Fuego, Relampago o Veneno. Ganas resistencia a ese tipo de dano. Ademas, cuando lanzas un conjuro que inflija dano de ese tipo, puedes sumar tu mod. CAR a una tirada de dano de ese conjuro.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Alas de Dragon",
            descripcion:
              "Como accion adicional, haces brotar alas draconicas de tu espalda. Ganas velocidad de vuelo de 18 m durante 1 hora, o hasta que las descartes (sin accion). Una vez por descanso largo, o gastando 3 PH.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Companero Dragon",
            descripcion:
              "Puedes lanzar Invocar Dragon sin componente material. Tambien puedes lanzarlo una vez sin espacio de conjuro, recuperando el uso en un descanso largo. Al lanzarlo, puedes modificarlo para que no requiera Concentracion; si lo haces, su duracion es de 1 minuto.",
          },
        ],
      },
    ],
  },

  // -- Magia Salvaje ------------------------------------------------
  {
    subclaseId: "magia_salvaje",
    claseId: "hechicero",
    nombre: "Magia Salvaje",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Oleada de Magia Salvaje",
            descripcion:
              "Tu magia puede desatar oleadas de magia indomable. Una vez por turno, puedes tirar 1d20 justo despues de lanzar un conjuro de hechicero con un espacio de conjuro. Si sacas un 20, tira en la tabla de Oleada de Magia Salvaje para generar un efecto magico aleatorio.",
          },
          {
            nombre: "Mareas del Caos",
            descripcion:
              "Puedes manipular el caos para ganar ventaja en una tirada de d20 antes de tirar. Despues, debes lanzar un conjuro de hechicero con un espacio de conjuro o terminar un descanso largo para volver a usar este rasgo. Si lanzas un conjuro con espacio antes de descansar, tiras automaticamente en la tabla de Oleada de Magia Salvaje.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Doblar la Suerte",
            descripcion:
              "Justo despues de que otra criatura visible tire el d20 para una prueba, puedes usar tu reaccion y gastar 1 PH para tirar 1d4 y aplicar el resultado como bonificador o penalizador (a tu eleccion) a esa tirada.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Caos Controlado",
            descripcion:
              "Cuando tires en la tabla de Oleada de Magia Salvaje, puedes tirar dos veces y elegir cual de los dos resultados aplicar.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Oleada Dominada",
            descripcion:
              "Justo despues de lanzar un conjuro de hechicero con un espacio de conjuro, puedes elegir un efecto de la tabla de Oleada de Magia Salvaje en lugar de tirar (excepto la ultima fila). Si el efecto implica una tirada, debes hacerla. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // -- Alma Divina --------------------------------------------------
  {
    subclaseId: "alma_divina",
    claseId: "hechicero",
    nombre: "Alma Divina",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Magia Divina",
            descripcion:
              "Tu conexion con lo divino te permite aprender conjuros de la lista de clerigo ademas de la de hechicero. Cuando aprendas o reemplaces un truco o conjuro de hechicero, puedes elegirlo de la lista de hechicero o de clerigo. Elige una afinidad (Buena: Cura de Heridas, Mala: Infligir Heridas, Legal: Bendicion, Caotica: Perdicion, Neutral: Proteccion contra el Bien y el Mal) y aprendes ese conjuro extra, que no cuenta para tu limite.",
            elecciones: [
              {
                id: "afinidad_divina",
                nombre: "Afinidad Divina",
                instruccion: "Elige tu afinidad divina:",
                tipo: "single",
                opciones: [
                  {
                    id: "buena",
                    nombre: "Buena",
                    descripcion: "Aprendes Cura de Heridas.",
                  },
                  {
                    id: "mala",
                    nombre: "Mala",
                    descripcion: "Aprendes Infligir Heridas.",
                  },
                  {
                    id: "legal",
                    nombre: "Legal",
                    descripcion: "Aprendes Bendicion.",
                  },
                  {
                    id: "caotica",
                    nombre: "Caotica",
                    descripcion: "Aprendes Perdicion.",
                  },
                  {
                    id: "neutral",
                    nombre: "Neutral",
                    descripcion: "Aprendes Proteccion contra el Bien y el Mal.",
                  },
                ],
              },
            ],
          },
          {
            nombre: "Favorecido por los Dioses",
            descripcion:
              "El poder divino protege tu destino. Cuando fallas una tirada de salvacion o erras con un ataque, puedes tirar 2d4 y sumar el resultado, pudiendo cambiar el resultado. Una vez por descanso corto o largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Curacion Empoderada",
            descripcion:
              "Cuando tu o un aliado a 1,5 m tira dados para recuperar PG con un conjuro, puedes gastar 1 PH para repetir cualquier numero de esos dados una vez. Solo una vez por turno.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Alas del Otro Mundo",
            descripcion:
              "Como accion adicional, manifiestas un par de alas espectrales que te dan velocidad de vuelo de 9 m. Las alas duran hasta que quedes incapacitado, mueras o las descartes como accion adicional. Su aspecto depende de tu afinidad: alas de aguila (buena/legal), murcielago (mala/caotica), libelula (neutral).",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Restauracion Sobrenatural",
            descripcion:
              "Como accion adicional, cuando tengas menos de la mitad de tus PG maximos, recuperas un numero de PG igual a la mitad de tu maximo de PG. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // -- Magia de las Sombras -----------------------------------------
  {
    subclaseId: "alma_sombras",
    claseId: "hechicero",
    nombre: "Magia de las Sombras",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Ojos del Oscuro",
            descripcion:
              "Ganas vision en la oscuridad a 36 m. Ademas, puedes lanzar Oscuridad gastando 2 PH o un espacio de conjuro. Si la lanzas con PH, puedes ver a traves de la oscuridad creada por ese conjuro.",
            efectos: [{ kind: "darkvision", range: 120 }],
          },
          {
            nombre: "Fuerza de la Tumba",
            descripcion:
              "Cuando recibes dano que te reduce a 0 PG, puedes hacer una salvacion de CAR (CD 5 + dano recibido). Si tienes exito, quedas a 1 PG en su lugar. No puedes usar esto si el dano es radiante o un golpe critico. Una vez por descanso largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Sabueso de Mal Auspicio",
            descripcion:
              "Como accion adicional, gastas 3 PH para invocar magicamente un sabueso sombrIo que se fija en una criatura visible a 36 m. El sabueso usa las estadisticas de Lobo Terrible (tamano Mediano, monstruosidad) con PG temporales = mitad de tu nivel de hechicero. Aparece a 9 m del objetivo, tiene su propia iniciativa, solo se mueve hacia el objetivo y solo puede atacarle. Mientras el sabueso este a 1,5 m del objetivo, este tiene desventaja en salvaciones contra tus conjuros. Desaparece si llega a 0 PG, el objetivo llega a 0 PG, o tras 5 minutos.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Caminar en las Sombras",
            descripcion:
              "Cuando estes en luz tenue u oscuridad, como accion adicional puedes teletransportarte magicamente hasta 36 m a otro punto en luz tenue u oscuridad que puedas ver.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Forma Sombria",
            descripcion:
              "Como accion adicional, gastas 6 PH para transformarte en una forma sombria durante 1 minuto. Ganas resistencia a todo dano excepto fuerza y radiante, y puedes moverte a traves de criaturas y objetos como si fueran terreno dificil (5 de fuerza si terminas dentro de un objeto). Termina si quedas incapacitado, mueres o lo descartas como accion adicional.",
          },
        ],
      },
    ],
  },

  // -- Hechiceria de Tormenta ---------------------------------------
  {
    subclaseId: "tormenta_tempestuosa",
    claseId: "hechicero",
    nombre: "Hechiceria de Tormenta",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Portavoz del Viento",
            descripcion:
              "Tu magia arcana esta imbuida de aire elemental. Puedes hablar, leer y escribir Primordial (y sus dialectos: Aquan, Auran, Ignan, Terran).",
          },
          {
            nombre: "Magia Tempestuosa",
            descripcion:
              "Puedes usar una accion adicional en tu turno, justo antes o despues de lanzar un conjuro de nivel 1 o superior, para volar hasta 3 m sin provocar ataques de oportunidad.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Corazon de la Tormenta",
            descripcion:
              "Ganas resistencia al dano de relampago y trueno. Ademas, cada vez que empieces a lanzar un conjuro de nivel 1+ que inflija dano de relampago o trueno, una magia tormentosa brota de ti: criaturas de tu eleccion que puedas ver a 3 m reciben dano de relampago o trueno (tu eliges) igual a la mitad de tu nivel de hechicero.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "relampago",
                modifier: "resistance",
              },
              {
                kind: "damageModifier",
                damageType: "trueno",
                modifier: "resistance",
              },
            ],
          },
          {
            nombre: "Guia de la Tormenta",
            descripcion:
              "Si esta lloviendo, puedes usar una accion para detener la lluvia en un radio de 6 m centrado en ti. Si hay viento, puedes usar una accion adicional para elegir la direccion del viento en un radio de 30 m centrado en ti hasta el final de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Furia de la Tormenta",
            descripcion:
              "Cuando recibes dano de un ataque cuerpo a cuerpo, puedes usar tu reaccion para infligir dano de relampago al atacante igual a tu nivel de hechicero. El atacante debe hacer una salvacion de FUE contra tu CD de conjuros o es empujado 6 m en linea recta.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Alma del Viento",
            descripcion:
              "Ganas inmunidad al dano de relampago y trueno. Ademas ganas velocidad de vuelo magica de 18 m. Como accion, puedes reducir tu velocidad de vuelo a 9 m durante 1 hora y otorgar velocidad de vuelo magica de 9 m a hasta 3 + mod. CAR criaturas a 9 m durante 1 hora. Una vez por descanso corto o largo.",
          },
        ],
      },
    ],
  },
];
