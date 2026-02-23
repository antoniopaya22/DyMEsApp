/**
 * Rasgos de subclase: Paladín
 */

import type { SubclassFeatureData } from "./types";

export const PALADIN_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Juramento de Devoción (PHB'24) ─────────────────────────────────
  {
    subclaseId: "juramento_devocion",
    claseId: "paladin",
    nombre: "Juramento de Devoción",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Juramento",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de paladín. Nivel 3: Protección contra el mal y el bien, Escudo de la fe. Nivel 5: Auxilio, Zona de verdad. Nivel 9: Faro de esperanza, Disipar magia. Nivel 13: Libertad de movimiento, Guardián de la fe. Nivel 17: Comunión, Columna de fuego.",
          },
          {
            nombre: "Arma Sagrada",
            descripcion:
              "Al usar la acción de Atacar, puedes gastar un uso de Canalizar Divinidad para imbuir un arma cuerpo a cuerpo que sostengas con energía positiva. Durante 10 minutos o hasta usar este rasgo de nuevo: sumas tu mod. CAR a las tiradas de ataque (mín. +1), y cada vez que impactas puedes infligir su tipo de daño normal o daño radiante. El arma emite luz brillante en 6 m y tenue en 6 m más. Puedes terminar el efecto anticipadamente (sin acción).",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Aura de Devoción",
            descripcion:
              "Tú y tus aliados tenéis inmunidad a la condición Hechizado mientras estéis en tu Aura de Protección. Si un aliado Hechizado entra en el aura, esa condición no tiene efecto mientras permanezca en ella.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Castigo de Protección",
            descripcion:
              "Tu castigo mágico irradia energía protectora. Siempre que lances Castigo Divino, tú y tus aliados tenéis media cobertura mientras estéis en tu Aura de Protección. El aura tiene este beneficio hasta el inicio de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 20,
        rasgos: [
          {
            nombre: "Nimbo Sagrado",
            descripcion:
              "Como acción adicional, puedes imbuir tu Aura de Protección con poder sagrado, otorgando los siguientes beneficios durante 10 minutos o hasta que los termines (sin acción). Una vez usado, necesitas un descanso largo o gastar un espacio de conjuro de nivel 5 para usarlo de nuevo.\n\n• Protección Sagrada: Tienes ventaja en cualquier salvación forzada por un infernal o un muerto viviente.\n• Daño Radiante: Cuando un enemigo empieza su turno en el aura, recibe daño radiante igual a tu mod. CAR + tu bonificador de competencia.\n• Luz Solar: El aura se llena de luz brillante que es luz solar.",
          },
        ],
      },
    ],
  },

  // ── Juramento de los Antiguos (PHB'24) ─────────────────────────────
  {
    subclaseId: "juramento_antiguos",
    claseId: "paladin",
    nombre: "Juramento de los Antiguos",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Juramento",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de paladín. Nivel 3: Golpe atrapante, Hablar con animales. Nivel 5: Paso brumoso, Rayo lunar. Nivel 9: Crecimiento vegetal, Protección contra energía. Nivel 13: Tormenta de hielo, Piel de piedra. Nivel 17: Comunión con la naturaleza, Zancada arbórea.",
          },
          {
            nombre: "Ira de la Naturaleza",
            descripcion:
              "Como acción mágica, puedes gastar un uso de Canalizar Divinidad para conjurar enredaderas espectrales. Cada criatura de tu elección que puedas ver a 4,5 m de ti debe superar una salvación de FUE o tener la condición de Apresado durante 1 minuto. Una criatura Apresada repite la salvación al final de cada uno de sus turnos, terminando el efecto en sí misma con un éxito.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Aura de Custodia",
            descripcion:
              "La magia ancestral cae sobre ti con tal peso que forma una protección arcana; tú y tus aliados tenéis resistencia al daño necrótico, psíquico y radiante mientras estéis en tu Aura de Protección.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Centinela Imperecedero",
            descripcion:
              "Cuando llegas a 0 PG y no mueres directamente, puedes quedar a 1 PG en su lugar, y recuperas un número de PG igual a tres veces tu nivel de paladín. Una vez usado, necesitas un descanso largo para volver a usarlo.\n\nAdemás, no puedes envejecer mágicamente y dejas de envejecer visiblemente.",
          },
        ],
      },
      {
        nivel: 20,
        rasgos: [
          {
            nombre: "Campeón de los Ancianos",
            descripcion:
              "Como acción adicional, puedes imbuir tu Aura de Protección con poder primigenio, otorgando los siguientes beneficios durante 1 minuto o hasta que los termines (sin acción). Una vez usado, necesitas un descanso largo o gastar un espacio de conjuro de nivel 5 para usarlo de nuevo.\n\n• Desafiar la Resistencia: Los enemigos en el aura tienen desventaja en las salvaciones contra tus conjuros y opciones de Canalizar Divinidad.\n• Regeneración: Al inicio de cada uno de tus turnos, recuperas 10 PG.\n• Conjuros Veloces: Siempre que lances un conjuro con tiempo de lanzamiento de una acción, puedes lanzarlo usando una acción adicional en su lugar.",
          },
        ],
      },
    ],
  },

  // ── Juramento de Gloria (PHB'24) ───────────────────────────────────
  {
    subclaseId: "juramento_gloria",
    claseId: "paladin",
    nombre: "Juramento de Gloria",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Juramento",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de paladín. Nivel 3: Rayo guía, Heroísmo. Nivel 5: Mejorar característica, Arma mágica. Nivel 9: Acelerar, Protección contra energía. Nivel 13: Compulsión, Libertad de movimiento. Nivel 17: Saber legendario, Presencia regia de Yolande.",
          },
          {
            nombre: "Castigo Inspirador",
            descripcion:
              "Inmediatamente después de lanzar Castigo Divino, puedes gastar un uso de Canalizar Divinidad y distribuir PG temporales a criaturas de tu elección a 9 m de ti (puedes incluirte). El total de PG temporales es 2d8 + tu nivel de paladín, repartidos como desees.",
          },
          {
            nombre: "Atleta Sin Par",
            descripcion:
              "Como acción adicional, puedes gastar un uso de Canalizar Divinidad para aumentar tu atletismo. Durante 1 hora: tienes ventaja en pruebas de Atletismo (FUE) y Acrobacia (DES), y la distancia de tus saltos de longitud y altura aumenta en 3 m (el coste de movimiento es normal).",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Aura de Presteza",
            descripcion:
              "Tu velocidad aumenta en 3 m. Además, siempre que un aliado entre en tu Aura de Protección por primera vez en un turno o empiece su turno allí, la velocidad de ese aliado aumenta en 3 m hasta el final de su siguiente turno.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Defensa Gloriosa",
            descripcion:
              "Puedes convertir la defensa en un golpe repentino. Cuando tú u otra criatura a 3 m de ti es impactada por una tirada de ataque, puedes usar tu reacción para otorgar una bonificación a la CA del objetivo contra ese ataque, pudiendo hacer que falle. La bonificación es igual a tu mod. CAR (mín. +1). Si el ataque falla, puedes hacer un ataque con arma contra el atacante como parte de la misma reacción si está al alcance de tu arma.\n\nPuedes usar este rasgo un número de veces igual a tu mod. CAR (mínimo 1), y recuperas todos los usos tras un descanso largo.",
          },
        ],
      },
      {
        nivel: 20,
        rasgos: [
          {
            nombre: "Leyenda Viviente",
            descripcion:
              "Como acción adicional, ganas los siguientes beneficios durante 10 minutos. Una vez usado, necesitas un descanso largo o gastar un espacio de conjuro de nivel 5 para usarlo de nuevo.\n\n• Carismático: Estás bendecido con una presencia sobrenatural y tienes ventaja en todas las pruebas de CAR.\n• Repetir Salvación: Si fallas una salvación, puedes usar tu reacción para repetirla. Debes usar el nuevo resultado.\n• Golpe Certero: Una vez en cada uno de tus turnos, cuando hagas una tirada de ataque con arma y falles, puedes hacer que ese ataque impacte en su lugar.",
          },
        ],
      },
    ],
  },

  // ── Juramento de Venganza (PHB'24) ─────────────────────────────────
  {
    subclaseId: "juramento_venganza",
    claseId: "paladin",
    nombre: "Juramento de Venganza",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Juramento",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de paladín. Nivel 3: Perdición, Marca del cazador. Nivel 5: Retener persona, Paso brumoso. Nivel 9: Acelerar, Protección contra energía. Nivel 13: Destierro, Puerta dimensional. Nivel 17: Retener monstruo, Ojo atisbador.",
          },
          {
            nombre: "Voto de Enemistad",
            descripcion:
              "Al usar la acción de Atacar, puedes gastar un uso de Canalizar Divinidad para pronunciar un voto de enemistad contra una criatura que puedas ver a 9 m de ti. Tienes ventaja en tiradas de ataque contra ella durante 1 minuto o hasta usar este rasgo de nuevo.\n\nSi la criatura cae a 0 PG antes de que el voto termine, puedes transferir el voto a otra criatura a 9 m de ti (sin acción).",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Vengador Implacable",
            descripcion:
              "Tu concentración sobrenatural te ayuda a cortar la retirada de un enemigo. Cuando impactas a una criatura con un ataque de oportunidad, puedes reducir su velocidad a 0 hasta el final del turno actual. Luego puedes moverte hasta la mitad de tu velocidad como parte de la misma reacción. Este movimiento no provoca ataques de oportunidad.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Alma de Venganza",
            descripcion:
              "Inmediatamente después de que una criatura bajo el efecto de tu Voto de Enemistad impacte o falle con una tirada de ataque, puedes usar tu reacción para hacer un ataque cuerpo a cuerpo contra esa criatura si está al alcance.",
          },
        ],
      },
      {
        nivel: 20,
        rasgos: [
          {
            nombre: "Ángel Vengador",
            descripcion:
              "Como acción adicional, ganas los siguientes beneficios durante 10 minutos o hasta que los termines (sin acción). Una vez usado, necesitas un descanso largo o gastar un espacio de conjuro de nivel 5 para usarlo de nuevo.\n\n• Vuelo: Brotan alas espectrales en tu espalda. Tienes velocidad de vuelo de 18 m y puedes flotar.\n• Aura Atemorizante: Siempre que un enemigo empiece su turno en tu Aura de Protección, debe superar una salvación de SAB o tener la condición Asustado durante 1 minuto o hasta recibir daño. Las tiradas de ataque contra la criatura Asustada tienen ventaja.",
          },
        ],
      },
    ],
  },

  // ── Juramento de Conquista (XGE) ───────────────────────────────────
  {
    subclaseId: "juramento_conquista",
    claseId: "paladin",
    nombre: "Juramento de Conquista",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Juramento",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de paladín. Nivel 3: Armadura de Agathys, Orden imperiosa. Nivel 5: Retener persona, Arma espiritual. Nivel 9: Maldición, Miedo. Nivel 13: Dominar bestia, Piel de piedra. Nivel 17: Nube aniquiladora, Dominar persona.",
          },
          {
            nombre: "Canalizar Divinidad: Presencia Conquistadora",
            descripcion:
              "Como acción, fuerzas a cada criatura de tu elección que puedas ver a 9 m de ti a hacer una salvación de SAB. Si falla, queda Asustada de ti durante 1 minuto. La criatura Asustada puede repetir la salvación al final de cada uno de sus turnos, terminando el efecto en sí misma con un éxito.",
          },
          {
            nombre: "Canalizar Divinidad: Golpe Guiado",
            descripcion:
              "Cuando haces una tirada de ataque, puedes usar Canalizar Divinidad para ganar +10 al resultado. Lo decides después de ver la tirada, pero antes de que el DM diga si impacta o falla.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Aura de Conquista",
            descripcion:
              "Emanas constantemente un aura amenazante de 3 m mientras no estés incapacitado. Si una criatura está Asustada de ti, su velocidad se reduce a 0 mientras esté en el aura, y recibe daño psíquico igual a la mitad de tu nivel de paladín si empieza su turno allí. A nivel 18, el radio aumenta a 9 m.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Reproche Desdeñoso",
            descripcion:
              "Quienes osan golpearte son castigados psíquicamente. Siempre que una criatura te impacte con un ataque, esa criatura recibe daño psíquico igual a tu mod. CAR (mínimo 1) si no estás incapacitado.",
          },
        ],
      },
      {
        nivel: 20,
        rasgos: [
          {
            nombre: "Conquistador Invencible",
            descripcion:
              "Como acción, te transformas mágicamente en un avatar de conquista, ganando los siguientes beneficios durante 1 minuto:\n\n• Tienes resistencia a todo daño.\n• Cuando usas la acción de Atacar, puedes hacer un ataque adicional como parte de esa acción.\n• Tus ataques con arma cuerpo a cuerpo obtienen un crítico con un 19 o 20 en el d20.\n\nUna vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Juramento de Redención (XGE) ───────────────────────────────────
  {
    subclaseId: "juramento_redencion",
    claseId: "paladin",
    nombre: "Juramento de Redención",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Juramento",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de paladín. Nivel 3: Santuario, Sueño. Nivel 5: Calmar emociones, Retener persona. Nivel 9: Contrahechizo, Patrón hipnótico. Nivel 13: Esfera resiliente de Otiluke, Piel de piedra. Nivel 17: Retener monstruo, Muro de fuerza.",
          },
          {
            nombre: "Canalizar Divinidad: Emisario de la Paz",
            descripcion:
              "Como acción adicional, ganas +5 a las pruebas de Persuasión (CAR) durante los próximos 10 minutos.",
          },
          {
            nombre: "Canalizar Divinidad: Reproche del Violento",
            descripcion:
              "Inmediatamente después de que un atacante a 9 m de ti inflija daño con un ataque contra una criatura que no seas tú, puedes usar tu reacción para forzar al atacante a hacer una salvación de SAB. Si falla, recibe daño radiante igual al daño que acaba de infligir. Si tiene éxito, recibe la mitad.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Aura del Guardián",
            descripcion:
              "Puedes escudar a otros del daño a costa de tu propia salud. Cuando una criatura a 3 m de ti recibe daño, puedes usar tu reacción para recibir mágicamente ese daño en su lugar. Este rasgo no transfiere otros efectos que puedan acompañar al daño, y este daño no puede reducirse de ninguna forma. A nivel 18, el radio aumenta a 9 m.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Espíritu Protector",
            descripcion:
              "Una presencia sagrada repara tus heridas en batalla. Recuperas PG iguales a 1d6 + la mitad de tu nivel de paladín si terminas tu turno en combate con menos de la mitad de tus PG máximos y no estás incapacitado.",
          },
        ],
      },
      {
        nivel: 20,
        rasgos: [
          {
            nombre: "Emisario de Redención",
            descripcion:
              "Te conviertes en un avatar de paz, lo que te otorga dos beneficios:\n\n• Tienes resistencia a todo daño infligido por otras criaturas (sus ataques, conjuros y otros efectos).\n• Siempre que una criatura te impacte con un ataque, recibe daño radiante igual a la mitad del daño que te inflige.\n\nSi atacas a una criatura, lanzas un conjuro sobre ella, o le infliges daño por cualquier medio excepto este rasgo, ninguno de los dos beneficios funciona contra esa criatura hasta que termines un descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Juramento de los Vigilantes (TCE) ──────────────────────────────
  {
    subclaseId: "juramento_vigilantes",
    claseId: "paladin",
    nombre: "Juramento de los Vigilantes",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Juramento",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de paladín. Nivel 3: Alarma, Detectar magia. Nivel 5: Rayo lunar, Ver invisibilidad. Nivel 9: Contrahechizo, Indetectabilidad. Nivel 13: Aura de pureza, Destierro. Nivel 17: Retener monstruo, Ojo atisbador.",
          },
          {
            nombre: "Canalizar Divinidad: Voluntad del Vigía",
            descripcion:
              "Como acción, elige un número de criaturas que puedas ver a 9 m de ti, hasta un máximo igual a tu mod. CAR (mínimo 1). Durante 1 minuto, tú y las criaturas elegidas tenéis ventaja en salvaciones de INT, SAB y CAR.",
          },
          {
            nombre: "Canalizar Divinidad: Expulsar Extraplanarios",
            descripcion:
              "Como acción, presentas tu símbolo sagrado y cada aberración, celestial, elemental, feérico o infernal a 9 m de ti que pueda oírte debe hacer una salvación de SAB. Si falla, la criatura es expulsada durante 1 minuto o hasta recibir daño. Una criatura expulsada debe gastar sus turnos intentando alejarse de ti lo más posible, y no puede terminar voluntariamente su movimiento a 9 m de ti.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Aura del Centinela",
            descripcion:
              "Emites un aura de alerta mientras no estés incapacitado. Cuando tú y cualquier criatura de tu elección a 3 m de ti tiréis iniciativa, todos ganáis una bonificación a la iniciativa igual a tu bonificador de competencia. A nivel 18, el radio del aura aumenta a 9 m.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Reproche Vigilante",
            descripcion:
              "Has aprendido a castigar a cualquiera que emplee embrujos contra ti y tus protegidos. Siempre que tú o una criatura que puedas ver a 9 m de ti supere una salvación de INT, SAB o CAR, puedes usar tu reacción para infligir 2d8 + tu mod. CAR de daño de fuerza a la criatura que forzó la salvación.",
          },
        ],
      },
      {
        nivel: 20,
        rasgos: [
          {
            nombre: "Baluarte Mortal",
            descripcion:
              "Como acción adicional, manifiestas una chispa de poder divino, ganando los siguientes beneficios durante 1 minuto:\n\n• Ganas visión verdadera con un alcance de 36 m.\n• Tienes ventaja en tiradas de ataque contra aberraciones, celestiales, elementales, feéricos e infernales.\n• Cuando impactas a una criatura con una tirada de ataque e infliges daño, puedes forzarla a hacer una salvación de CAR contra tu CD de conjuro. Si falla, es desterrada mágicamente a su plano de origen (si no está allí actualmente). Si tiene éxito, no puede ser desterrada por este rasgo durante 24 horas.\n\nUna vez usado, necesitas un descanso largo o gastar un espacio de conjuro de nivel 5 para usarlo de nuevo.",
          },
        ],
      },
    ],
  },
];
