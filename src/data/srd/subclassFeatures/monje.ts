/**
 * Rasgos de subclase: Monje
 * Actualizado a PHB 2024 + subclases de ediciones anteriores (XGE, TCE).
 */

import type { SubclassFeatureData } from "./types";

export const MONJE_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Guerrero de la Mano Abierta (PHB'24) ───────────────────────────
  {
    subclaseId: "guerrero_mano_abierta",
    claseId: "monje",
    nombre: "Guerrero de la Mano Abierta",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Técnica de la Mano Abierta",
            descripcion:
              "Cuando impactas a una criatura con un ataque de tu Ráfaga de Golpes, puedes imponerle uno de los siguientes efectos:\n\n• Aturdir: El objetivo no puede realizar Ataques de Oportunidad hasta el inicio de su siguiente turno.\n• Empujar: El objetivo debe superar una salvación de FUE o ser empujado hasta 4,5 m (15 pies) lejos de ti.\n• Derribar: El objetivo debe superar una salvación de DES o queda con la condición Derribado.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Integralidad Corporal",
            descripcion:
              "Como acción adicional, puedes tirar tu dado de Artes Marciales y recuperas PG iguales al resultado + tu mod. SAB (mínimo 1 PG). Puedes usar este rasgo un número de veces igual a tu mod. SAB (mínimo 1). Recuperas todos los usos tras un descanso largo.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Paso Veloz",
            descripcion:
              "Cuando usas una acción adicional que no sea Paso del Viento, puedes usar Paso del Viento inmediatamente después de esa acción adicional.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Palma Estremecedora",
            descripcion:
              "Cuando impactas a una criatura con un golpe desarmado, puedes gastar 4 PC para iniciar vibraciones letales en su cuerpo. Las vibraciones duran un número de días igual a tu nivel de monje y son inofensivas a menos que uses una acción (o renuncies a un ataque en tu acción de Atacar) para finalizarlas. Tú y el objetivo debéis estar en el mismo plano. El objetivo hace una salvación de CON: recibe 10d12 de daño de Fuerza en fallo, o la mitad en éxito. Solo puedes tener una criatura bajo este efecto a la vez.",
          },
        ],
      },
    ],
  },

  // ── Guerrero de la Sombra (PHB'24) ─────────────────────────────────
  {
    subclaseId: "guerrero_sombra",
    claseId: "monje",
    nombre: "Guerrero de la Sombra",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Artes de las Sombras",
            descripcion:
              "Has aprendido a canalizar el poder del Shadowfell:\n\n• Oscuridad: Puedes gastar 1 PC para lanzar Oscuridad sin componentes. Puedes ver dentro del área. Mientras persista, puedes mover el área hasta 18 m (60 pies) de ti al inicio de cada turno.\n• Visión en la Oscuridad: Obtienes Visión en la Oscuridad a 18 m (60 pies). Si ya la tienes, su alcance aumenta en 18 m.\n• Figuras Sombrías: Conoces el truco Ilusión Menor. SAB es tu aptitud mágica.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Paso de Sombra",
            descripcion:
              "Cuando estés totalmente en luz tenue u oscuridad, puedes usar tu acción adicional para teletransportarte hasta 18 m (60 pies) a un espacio libre que puedas ver y que también esté en luz tenue u oscuridad. Luego tienes ventaja en el primer ataque cuerpo a cuerpo que realices antes del final del turno.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Paso de Sombra Mejorado",
            descripcion:
              "Puedes gastar 1 PC al usar Paso de Sombra para eliminar el requisito de que debas empezar y terminar en luz tenue u oscuridad. Como parte de esta acción adicional, puedes realizar un golpe desarmado inmediatamente después de teletransportarte.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Manto de Sombras",
            descripcion:
              "Como acción mágica, mientras estés totalmente en luz tenue u oscuridad, puedes gastar 3 PC para cubrirte de sombras durante 1 minuto, hasta quedar incapacitado o hasta terminar tu turno en luz brillante. Mientras dure:\n\n• Invisibilidad: Tienes la condición Invisible.\n• Parcialmente Incorpóreo: Puedes moverte a través de espacios ocupados como Terreno Difícil. Si terminas tu turno en uno, eres desplazado al último espacio libre.\n• Ráfaga de Sombras: Puedes usar Ráfaga de Golpes sin gastar PC.",
          },
        ],
      },
    ],
  },

  // ── Guerrero de los Elementos (PHB'24) ─────────────────────────────
  {
    subclaseId: "guerrero_elementos",
    claseId: "monje",
    nombre: "Guerrero de los Elementos",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Sintonía Elemental",
            descripcion:
              "Al inicio de tu turno, puedes gastar 1 PC para imbuirte de energía elemental durante 10 minutos (o hasta quedar incapacitado). Mientras esté activo:\n\n• Alcance: Tus golpes desarmados tienen 3 m (10 pies) de alcance adicional, ya que la energía elemental se extiende desde ti.\n• Golpes Elementales: Tus golpes desarmados pueden infligir Ácido, Frío, Fuego, Rayo o Trueno (a tu elección) en lugar de su daño normal. Además, puedes forzar al objetivo a una salvación de FUE: en fallo, lo mueves hasta 3 m hacia ti o lejos de ti.",
          },
          {
            nombre: "Manipular Elementos",
            descripcion:
              "Conoces el conjuro Elementalismo. SAB es tu aptitud mágica para él.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Estallido Elemental",
            descripcion:
              "Como acción mágica, puedes gastar 2 PC para causar una explosión de energía elemental en una esfera de 6 m (20 pies) de radio centrada en un punto a 36 m (120 pies) de ti. Elige un tipo de daño: Ácido, Frío, Fuego, Rayo o Trueno. Cada criatura en la esfera hace salvación de DES: recibe 3 dados de Artes Marciales de daño del tipo elegido en fallo, o la mitad en éxito.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Zancada Elemental",
            descripcion:
              "Mientras tu Sintonía Elemental esté activa, también tienes velocidad de Vuelo y de Nado iguales a tu velocidad.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Epítome Elemental",
            descripcion:
              "Mientras tu Sintonía Elemental esté activa, también obtienes los siguientes beneficios:\n\n• Resistencia al Daño: Obtienes Resistencia a un tipo de daño a tu elección: Ácido, Frío, Fuego, Rayo o Trueno. Puedes cambiar la elección al inicio de cada turno.\n• Zancada Destructiva: Cuando usas Paso del Viento, tu velocidad aumenta en 6 m (20 pies) hasta el final del turno. Durante ese tiempo, cualquier criatura de tu elección recibe daño igual a un dado de Artes Marciales cuando entras en un espacio a 1,5 m de ella (Ácido, Frío, Fuego, Rayo o Trueno a tu elección; una vez por turno por criatura).\n• Golpes Potenciados: Una vez por turno, al impactar con un golpe desarmado, puedes infligir daño extra igual a un dado de Artes Marciales (del mismo tipo).",
          },
        ],
      },
    ],
  },

  // ── Guerrero de la Misericordia (PHB'24) ───────────────────────────
  {
    subclaseId: "guerrero_misericordia",
    claseId: "monje",
    nombre: "Guerrero de la Misericordia",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Implementos de la Misericordia",
            descripcion:
              "Ganas competencia en las habilidades Perspicacia y Medicina, y con el Kit de Herbalista.",
          },
          {
            nombre: "Mano de la Curación",
            descripcion:
              "Como acción mágica, puedes gastar 1 PC para tocar a una criatura y restaurar PG iguales a un dado de Artes Marciales + tu mod. SAB. Cuando usas Ráfaga de Golpes, puedes reemplazar uno de los golpes desarmados por un uso de este rasgo sin gastar un PC para la curación.",
          },
          {
            nombre: "Mano del Dolor",
            descripcion:
              "Una vez por turno, cuando impactas a una criatura con un golpe desarmado e infliges daño, puedes gastar 1 PC para infligir daño necrótico extra igual a un dado de Artes Marciales + tu mod. SAB.",
          },
        ],
        competenciasGanadas: {
          herramientas: ["Kit de herbalista"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Toque del Médico",
            descripcion:
              "Tus rasgos Mano del Dolor y Mano de la Curación mejoran:\n\n• Mano del Dolor: Cuando usas Mano del Dolor, también puedes dar al objetivo la condición Envenenado hasta el final de tu siguiente turno.\n• Mano de la Curación: Cuando usas Mano de la Curación, también puedes terminar una de estas condiciones en la criatura: Cegado, Ensordecido, Paralizado, Envenenado o Aturdido.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Ráfaga de Curación y Dolor",
            descripcion:
              "Cuando usas Ráfaga de Golpes, puedes reemplazar cada golpe desarmado por un uso de Mano de la Curación sin gastar PC para la curación.\n\nAdemás, cuando haces un golpe desarmado con Ráfaga de Golpes e infliges daño, puedes usar Mano del Dolor sin gastar PC (sigue siendo una vez por turno).\n\nPuedes usar estos beneficios un total de veces igual a tu mod. SAB (mínimo 1). Recuperas todos los usos tras un descanso largo.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Mano de la Misericordia Suprema",
            descripcion:
              "Como acción mágica, puedes tocar el cadáver de una criatura que haya muerto en las últimas 24 horas y gastar 5 PC. La criatura vuelve a la vida con PG = 4d10 + tu mod. SAB. Si murió con alguna de estas condiciones, revive sin ellas: Cegado, Ensordecido, Paralizado, Envenenado y Aturdido. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Camino del Yo Astral (TCE) ─────────────────────────────────────
  {
    subclaseId: "camino_yo_astral",
    claseId: "monje",
    nombre: "Camino del Yo Astral",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Brazos del Yo Astral",
            descripcion:
              "Como acción adicional, puedes gastar 1 PC para invocar los brazos de tu yo astral. Cada criatura de tu elección que puedas ver a 3 m de ti debe superar una salvación de DES o recibir daño de fuerza = 2 dados de Artes Marciales.\n\nDuran 10 minutos (terminan prematuramente si quedas incapacitado o mueres). Mientras estén presentes:\n\n• Puedes usar tu mod. SAB en lugar de FUE para pruebas y salvaciones de FUE.\n• Puedes usarlos para golpes desarmados con 1,5 m (5 pies) de alcance adicional.\n• Los golpes con los brazos pueden usar tu mod. SAB en lugar de FUE o DES, y su tipo de daño es Fuerza.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Rostro del Yo Astral",
            descripcion:
              "Como acción adicional (o como parte de la acción adicional para activar los Brazos), puedes gastar 1 PC para invocar el rostro de tu yo astral durante 10 minutos. Determinas su apariencia. Mientras esté presente:\n\n• Vista Astral: Puedes ver normalmente en oscuridad, tanto mágica como no mágica, a 36 m (120 pies).\n• Sabiduría del Espíritu: Ventaja en pruebas de SAB (Perspicacia) y CAR (Intimidación).\n• Palabra del Espíritu: Puedes dirigir tu voz a una criatura a 18 m que puedas ver (solo ella te oye), o amplificarla para que todas las criaturas a 180 m te oigan.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Cuerpo del Yo Astral",
            descripcion:
              "Cuando tienes tanto los brazos como el rostro astral invocados, puedes hacer aparecer el cuerpo de tu yo astral (sin acción). Mientras esté presente:\n\n• Desviar Energía: Cuando recibes daño de ácido, frío, fuego, fuerza, rayo o trueno, puedes usar tu reacción para reducirlo en 1d10 + tu mod. SAB (mínimo 1).\n• Brazos Potenciados: Una vez por turno, al impactar con los Brazos del Yo Astral, puedes infligir daño extra igual a tu dado de Artes Marciales.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Yo Astral Despierto",
            descripcion:
              "Como acción adicional, puedes gastar 5 PC para invocar los brazos, rostro y cuerpo de tu yo astral y despertar su poder durante 10 minutos (termina prematuramente si quedas incapacitado o mueres). Mientras esté despierto:\n\n• Armadura del Espíritu: +2 a CA.\n• Bombardeo Astral: Cuando uses Ataque Extra para atacar dos veces, puedes en su lugar atacar tres veces si todos los ataques se realizan con los brazos astrales.",
          },
        ],
      },
    ],
  },

  // ── Camino del Maestro Borracho (XGE) ──────────────────────────────
  {
    subclaseId: "camino_maestro_borracho",
    claseId: "monje",
    nombre: "Camino del Maestro Borracho",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia en la habilidad Actuación y con los Suministros de Cervecero.",
          },
          {
            nombre: "Técnica del Borracho",
            descripcion:
              "Siempre que usas Ráfaga de Golpes, obtienes el beneficio de la acción Desenganche, y tu velocidad de caminar aumenta en 3 m (10 pies) hasta el final del turno actual.",
          },
        ],
        competenciasGanadas: {
          herramientas: ["Suministros de cervecero"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Vaivén Achispado",
            descripcion:
              "Obtienes los siguientes beneficios:\n\n• Levantarse de un Salto: Cuando estés derribado, puedes levantarte gastando solo 1,5 m (5 pies) de movimiento, en vez de la mitad de tu velocidad.\n• Redirigir Ataque: Cuando una criatura te falla con un ataque cuerpo a cuerpo, puedes gastar 1 PC como reacción para que el ataque impacte a otra criatura (que no sea el atacante) que puedas ver a 1,5 m de ti.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Suerte del Borracho",
            descripcion:
              "Cuando realizas una prueba de característica, tirada de ataque o tirada de salvación con desventaja, puedes gastar 2 PC para cancelar la desventaja en esa tirada.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Frenesí Embriagado",
            descripcion:
              "Cuando usas Ráfaga de Golpes, puedes realizar hasta tres ataques adicionales con ella (hasta un total de cinco ataques de Ráfaga de Golpes), siempre que cada ataque de Ráfaga de Golpes apunte a una criatura diferente en ese turno.",
          },
        ],
      },
    ],
  },

  // ── Camino del Kensei (XGE) ────────────────────────────────────────
  {
    subclaseId: "camino_kensei",
    claseId: "monje",
    nombre: "Camino del Kensei",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Senda del Kensei",
            descripcion:
              "Tu entrenamiento marcial te lleva a dominar armas específicas:\n\n• Armas Kensei: Elige 2 armas kensei: 1 cuerpo a cuerpo y 1 a distancia (sencillas o marciales sin propiedades Pesada o Especial; el arco largo es válido). Son armas de monje para ti. A niveles 6, 11 y 17 puedes elegir otra.\n• Parada Ágil: Si haces un golpe desarmado como parte de la acción de Atacar y empuñas un arma kensei cuerpo a cuerpo, obtienes +2 a CA hasta el inicio de tu siguiente turno (mientras la tengas en la mano y no estés incapacitado).\n• Disparo del Kensei: Puedes usar una acción adicional para que tus ataques a distancia con arma kensei inflijan 1d4 de daño extra del tipo del arma hasta el final del turno.\n• Pincelada del Kensei: Ganas competencia en un tipo de suministros de caligrafía o de pinturas.",
            elecciones: [
              {
                id: "arma_kensei_cac",
                nombre: "Arma Kensei Cuerpo a Cuerpo",
                instruccion: "Elige tu arma kensei cuerpo a cuerpo:",
                tipo: "single",
                opciones: [
                  { id: "espada_larga", nombre: "Espada Larga", descripcion: "1d8 (1d10 a dos manos) cortante." },
                  { id: "espada_corta", nombre: "Espada Corta", descripcion: "1d6 cortante, ligera, finura." },
                  { id: "hacha_guerra", nombre: "Hacha de Guerra", descripcion: "1d8 (1d10 a dos manos) cortante." },
                  { id: "latigo", nombre: "Látigo", descripcion: "1d4 cortante, finura, alcance." },
                  { id: "cimitarra", nombre: "Cimitarra", descripcion: "1d6 cortante, ligera, finura." },
                ],
              },
              {
                id: "arma_kensei_dist",
                nombre: "Arma Kensei a Distancia",
                instruccion: "Elige tu arma kensei a distancia:",
                tipo: "single",
                opciones: [
                  { id: "arco_largo", nombre: "Arco Largo", descripcion: "1d8 perforante, pesada (excepción kensei), munición, distancia (45/180 m)." },
                  { id: "arco_corto", nombre: "Arco Corto", descripcion: "1d6 perforante, munición, distancia (24/96 m)." },
                  { id: "dardo", nombre: "Dardo", descripcion: "1d4 perforante, finura, arrojadiza (6/18 m)." },
                ],
              },
            ],
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Uno con la Hoja",
            descripcion:
              "Tu ki se extiende a tus armas kensei:\n\n• Armas Kensei Mágicas: Tus ataques con armas kensei cuentan como mágicos para superar resistencias e inmunidades.\n• Golpe Diestro: Cuando impactas a un objetivo con un arma kensei, puedes gastar 1 PC para infligir daño extra igual a tu dado de Artes Marciales. Solo una vez por turno.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Afilar la Hoja",
            descripcion:
              "Como acción adicional, puedes gastar hasta 3 PC para otorgar a un arma kensei que toques un bonificador a las tiradas de ataque y daño igual al número de PC gastados. Dura 1 minuto o hasta que vuelvas a usar este rasgo. No tiene efecto en armas mágicas que ya tengan bonificador a ataque y daño.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Precisión Infalible",
            descripcion:
              "Si fallas una tirada de ataque con un arma de monje en tu turno, puedes repetirla. Solo puedes usar este rasgo una vez por turno.",
          },
        ],
      },
    ],
  },

  // ── Camino del Alma Solar (XGE) ────────────────────────────────────
  {
    subclaseId: "camino_alma_solar",
    claseId: "monje",
    nombre: "Camino del Alma Solar",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Rayo del Sol Radiante",
            descripcion:
              "Puedes lanzar rayos de luz radiante como nueva opción de ataque con la acción de Atacar. Es un ataque de conjuro a distancia con alcance 9 m (30 pies). Eres competente con él y sumas tu mod. DES al ataque y al daño. El daño es Radiante y el dado es un d4 (cambia según la columna de Artes Marciales).\n\nCuando usas la acción de Atacar con este ataque especial, puedes gastar 1 PC para lanzar 2 ataques especiales como acción adicional. Cuando obtienes Ataque Extra, puedes usar este ataque para cualquiera de tus ataques.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Arco Ardiente Solar",
            descripcion:
              "Inmediatamente después de usar la acción de Atacar en tu turno, puedes gastar 2 PC para lanzar Manos Ardientes como acción adicional.\n\nPuedes gastar PC adicionales para lanzar Manos Ardientes a un nivel superior. Cada PC adicional aumenta el nivel del conjuro en 1. El máximo de PC (incluyendo los 2 iniciales) que puedes gastar es igual a la mitad de tu nivel de monje.",
          },
        ],
      },
      {
        nivel: 11,
        rasgos: [
          {
            nombre: "Estallido Solar Abrasador",
            descripcion:
              "Como acción, puedes crear un orbe de luz y lanzarlo a un punto que elijas a 45 m (150 pies), donde estalla en una esfera de luz radiante de 6 m (20 pies) de radio.\n\nCada criatura en la esfera debe superar una salvación de CON o recibir 2d6 de daño Radiante. Una criatura detrás de cobertura total opaca no necesita hacer la salvación. Puedes gastar hasta 3 PC extra para aumentar el daño en 2d6 por cada PC gastado.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Escudo Solar",
            descripcion:
              "Emites un aura luminosa y mágica. Irradias luz brillante en un radio de 9 m (30 pies) y luz tenue en 9 m adicionales. Puedes apagar o restaurar la luz como acción adicional.\n\nSi una criatura te impacta con un ataque cuerpo a cuerpo mientras la luz brilla, puedes usar tu reacción para infligir daño Radiante a esa criatura igual a 5 + tu mod. SAB.",
          },
        ],
      },
    ],
  },
];
