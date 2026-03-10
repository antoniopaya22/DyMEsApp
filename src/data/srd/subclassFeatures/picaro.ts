/**
 * Rasgos de subclase: Picaro
 */

import type { SubclassFeatureData } from "./types";

export const PICARO_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // -- Ladron -------------------------------------------------------
  {
    subclaseId: "ladron",
    claseId: "picaro",
    nombre: "Ladron",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Manos Rapidas",
            descripcion:
              "Como accion bonus, puedes hacer una de las siguientes cosas: una prueba de DES (Juego de Manos) para abrir una cerradura o desarmar una trampa con herramientas de ladron, o robar un bolsillo; o usar la accion de Utilizar un Objeto o la accion de Magia para usar un objeto magico que la requiera.",
          },
          {
            nombre: "Trabajo en Alturas",
            descripcion:
              "Ganas velocidad de Trepar igual a tu velocidad. Ademas, puedes calcular tu distancia de salto usando tu Destreza en lugar de tu Fuerza.",
            efectos: [{ kind: "speedBonus", climb: "walk" }],
          },
        ],
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Sigilo Supremo",
            descripcion:
              "Ganas la siguiente opcion de Golpe Astuto.\n\nAtaque Sigiloso (coste: 1d6). Si estas Invisible por la accion de Esconderte, este ataque no finaliza esa condicion si terminas el turno tras cobertura de tres cuartos o cobertura total.",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Usar Dispositivo Magico",
            descripcion:
              "Has aprendido a maximizar los objetos magicos:\n- Sintonizacion: puedes sintonizarte con hasta 4 objetos magicos a la vez.\n- Cargas: cuando uses una propiedad que gaste cargas, tira 1d6. Con un 6, no gastas la carga.\n- Pergaminos: puedes usar cualquier Pergamino de Conjuro, usando INT como caracteristica de lanzamiento. Si es truco o nivel 1, lo lanzas sin problema. Si es de nivel superior, debes superar una prueba de INT (Arcanos) CD 10 + nivel del conjuro.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Reflejos de Ladron",
            descripcion:
              "Puedes realizar dos turnos en la primera ronda de combate. El primer turno es en tu iniciativa normal y el segundo en tu iniciativa - 10.",
          },
        ],
      },
    ],
  },

  // -- Asesino ------------------------------------------------------
  {
    subclaseId: "asesino",
    claseId: "picaro",
    nombre: "Asesino",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Asesinar",
            descripcion:
              "Tienes ventaja en tiradas de Iniciativa. Durante la primera ronda de combate, tienes ventaja en tiradas de ataque contra cualquier criatura que no haya actuado aun. Si tu Ataque Furtivo impacta durante esa ronda, el objetivo recibe dano extra del tipo del arma igual a tu nivel de picaro.",
          },
          {
            nombre: "Herramientas de Asesino",
            descripcion:
              "Recibes un Kit de Disfraz y un Kit de Venenos, y ganas competencia con ambos.",
          },
        ],
        competenciasGanadas: {
          herramientas: ["Kit de disfraz", "Kit de venenos"],
        },
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Experiencia en Infiltracion",
            descripcion:
              "Eres experto en las siguientes tecnicas de infiltracion:\n- Imitacion Magistral: puedes imitar de forma infalible el habla, la caligrafia, o ambas, de otra persona si pasas al menos 1 hora estudiandola.\n- Apuntar en Movimiento: tu velocidad no se reduce a 0 cuando usas Apuntar Firme.",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Armas Envenenadas",
            descripcion:
              "Cuando uses la opcion de Veneno de tu Golpe Astuto, el objetivo tambien recibe 2d6 de dano de veneno cada vez que falle la tirada de salvacion. Este dano ignora la Resistencia al veneno.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Golpe Mortal",
            descripcion:
              "Cuando impactas con tu Ataque Furtivo en la primera ronda de combate, el objetivo debe superar una salvacion de CON (CD 8 + mod. DES + bon. competencia) o el dano del ataque se duplica contra el.",
          },
        ],
      },
    ],
  },

  // -- Embaucador Arcano --------------------------------------------
  {
    subclaseId: "embaucador_arcano",
    claseId: "picaro",
    nombre: "Embaucador Arcano",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuracion",
            descripcion:
              "Aprendes a lanzar conjuros. Conoces 3 trucos: Mano de Mago (obligatorio) y 2 mas de la lista de mago. Preparas 3 conjuros de nivel 1 de la lista de mago. INT es tu caracteristica de conjuracion. Puedes usar un foco arcano. Al nivel 10, aprendes un truco de mago adicional.",
          },
          {
            nombre: "Mano de Mago Versatil",
            descripcion:
              "Cuando lanzas Mano de Mago, puedes hacerla Invisible y lanzarla como accion bonus. Puedes controlarla como accion bonus y, a traves de ella, hacer pruebas de DES (Juego de Manos).",
          },
        ],
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Emboscada Magica",
            descripcion:
              "Si estas Invisible cuando lanzas un conjuro a una criatura, tiene desventaja en cualquier salvacion contra ese conjuro en ese turno.",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Embaucador Versatil",
            descripcion:
              "Cuando uses la opcion de Tropiezo de tu Golpe Astuto, tambien puedes usar esa opcion en otra criatura a 1,5 m o menos de la mano espectral de Mano de Mago.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Ladron de Conjuros",
            descripcion:
              "Justo despues de que una criatura lance un conjuro que te incluya como objetivo o en su area, puedes usar tu reaccion para forzar una salvacion de INT contra tu CD de conjuros. Si falla, niegas el efecto del conjuro contra ti, y si es de nivel 1+ y de un nivel que puedas lanzar, lo robas: lo tienes preparado durante 8 horas y la criatura no puede lanzarlo durante ese tiempo. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // -- Acechador de Almas -------------------------------------------
  {
    subclaseId: "acechador_almas",
    claseId: "picaro",
    nombre: "Acechador de Almas",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Poder Psionico",
            descripcion:
              "Tienes Dados de Energia Psionica que alimentan tus poderes. Empiezas con 4 dados d6 (suben a d8 en nv5, d10 en nv11, d12 en nv17; el numero sube a 6 en nv5, 8 en nv9, 10 en nv13, 12 en nv17). Recuperas 1 dado en un descanso corto y todos en un descanso largo.\n- Chispa de Pericia: si fallas una prueba con competencia, puedes tirar un dado psionico y sumarlo. Solo se gasta si la prueba tiene exito.\n- Susurros Psiquicos: como accion de Magia, elige hasta tu bon. de competencia en criaturas visibles y tira un dado psionico. Durante ese numero de horas, podeis comunicaros telepaticamente a 1,6 km. La primera vez por descanso largo es gratuita.",
          },
          {
            nombre: "Cuchillas Psiquicas",
            descripcion:
              "Cuando usas la accion de Atacar o haces un ataque de oportunidad, puedes manifestar una Cuchilla Psiquica en tu mano libre. Es un arma sencilla cuerpo a cuerpo: 1d6 psiquico, Sutileza, Arrojadiza (18/36 m), maestria: Hostigar (no cuenta para tu limite de maestrias). La cuchilla desaparece tras impactar o fallar. Tras atacar con ella en tu turno, puedes atacar con una segunda como accion bonus (1d4 en lugar de 1d6).",
          },
        ],
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Cuchillas del Alma",
            descripcion:
              "Ganas los siguientes poderes:\n- Golpes Rastreadores: si fallas un ataque con tu Cuchilla Psiquica, puedes tirar un dado psionico y sumarlo a la tirada. Si esto causa un impacto, el dado se gasta.\n- Teletransporte Psiquico: como accion bonus, manifiestas una Cuchilla Psiquica, gastas un dado psionico, lo tiras y te teletransportas a un espacio desocupado visible a un numero de pies igual a 10 x el resultado.",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Velo Psiquico",
            descripcion:
              "Como accion de Magia, te vuelves Invisible durante 1 hora o hasta que lo desestimes (sin accion). La invisibilidad termina prematuramente si infliges dano o fuerzas una salvacion. Una vez por descanso largo, o gastando un dado psionico para restaurar el uso.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Desgarro Mental",
            descripcion:
              "Cuando infliges dano de Ataque Furtivo con tus Cuchillas Psiquicas, puedes forzar al objetivo a hacer una salvacion de SAB (CD 8 + mod. DES + bon. competencia). Si falla, queda Aturdido durante 1 minuto (repite la tirada al final de cada turno). Una vez por descanso largo, o gastando 3 dados psionicos para restaurar el uso.",
          },
        ],
      },
    ],
  },

  // -- Espadachin ---------------------------------------------------
  {
    subclaseId: "espadachin",
    claseId: "picaro",
    nombre: "Espadachin",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Juego de Pies Elegante",
            descripcion:
              "Durante tu turno, si realizas un ataque cuerpo a cuerpo contra una criatura, esa criatura no puede hacerte ataques de oportunidad por el resto de tu turno.",
          },
          {
            nombre: "Audacia Temeraria",
            descripcion:
              "Puedes anadir tu mod. de CAR a las tiradas de iniciativa. Ademas, no necesitas ventaja para usar Ataque Furtivo si estas a 1,5 m del objetivo, no hay otra criatura a 1,5 m de ti y no tienes desventaja.",
            efectos: [{ kind: "initiativeBonus", abilityBonus: "car" }],
          },
        ],
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Panache",
            descripcion:
              "Como accion, puedes hacer una prueba de CAR (Persuasion) contra la SAB (Perspicacia) de una criatura que pueda oirte y comparta un idioma contigo. Si tienes exito y es hostil: tiene desventaja en ataques contra otros y no puede hacer ataques de oportunidad contra otros salvo tu (1 min). Si no es hostil: queda hechizada 1 min. El efecto termina si tus companeros la atacan o danan.",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Maniobra Elegante",
            descripcion:
              "Como accion bonus, ganas ventaja en la siguiente prueba de DES (Acrobacias) o FUE (Atletismo) durante ese turno.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Maestro Duelista",
            descripcion:
              "Cuando fallas una tirada de ataque, puedes repetirla con ventaja. Una vez por descanso corto o largo.",
          },
        ],
      },
    ],
  },

  // -- Inquisitivo --------------------------------------------------
  {
    subclaseId: "inquisitivo",
    claseId: "picaro",
    nombre: "Inquisitivo",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Oido para el Engano",
            descripcion:
              "Cuando hagas una prueba de SAB (Perspicacia) para determinar si una criatura miente, puedes tratar cualquier resultado de 7 o menos en el d20 como un 8.",
          },
          {
            nombre: "Ojo para los Detalles",
            descripcion:
              "Como accion bonus, puedes hacer una prueba de SAB (Percepcion) para detectar una criatura u objeto oculto, o una prueba de INT (Investigacion) para descifrar pistas.",
          },
          {
            nombre: "Combate Perspicaz",
            descripcion:
              "Como accion bonus, haz una prueba de SAB (Perspicacia) contra el CAR (Engano) de una criatura visible no incapacitada. Si tienes exito, puedes usar tu Ataque Furtivo contra ella sin ventaja (pero no con desventaja) durante 1 minuto o hasta que lo uses contra otro objetivo.",
          },
        ],
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Ojo Firme",
            descripcion:
              "Tienes ventaja en pruebas de SAB (Percepcion) e INT (Investigacion) si no te mueves mas de la mitad de tu velocidad en ese turno.",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Ojo Infalible",
            descripcion:
              "Como accion, detectas la presencia de ilusiones, cambiaformas fuera de su forma original y otra magia disenada para enganar los sentidos a 9 m (si no estas ciego ni sordo). Sabes que algo intenta enganarte, pero no su naturaleza. Usos = mod. SAB (min. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Ojo de la Debilidad",
            descripcion:
              "Mientras tu Combate Perspicaz este activo contra una criatura, tu dano de Ataque Furtivo contra ella aumenta en 3d6.",
          },
        ],
      },
    ],
  },

  // -- Espia Maestro ------------------------------------------------
  {
    subclaseId: "espia_maestro",
    claseId: "picaro",
    nombre: "Espia Maestro",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Maestro de la Intriga",
            descripcion:
              "Ganas competencia con el kit de disfraz, el kit de falsificacion y un juego a tu eleccion. Aprendes dos idiomas adicionales. Ademas, puedes imitar de forma infalible el habla y acento de una criatura que hayas escuchado hablar al menos 1 minuto.",
          },
          {
            nombre: "Maestro de Tacticas",
            descripcion:
              "Puedes usar la accion de Ayudar como accion bonus. Cuando usas Ayudar para asistir a un aliado atacando, el objetivo puede estar a 9 m de ti (en lugar de 1,5 m), siempre que pueda verte u oirte.",
          },
        ],
        competenciasGanadas: {
          herramientas: ["Kit de disfraz", "Kit de falsificacion"],
        },
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Manipulador Perspicaz",
            descripcion:
              "Si pasas al menos 1 minuto observando o interactuando con una criatura fuera de combate, puedes aprender cierta informacion sobre sus capacidades comparadas con las tuyas. El DM te dice si es igual, superior o inferior en dos de las siguientes: puntuacion de INT, SAB, CAR o niveles de clase.",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Mala Direccion",
            descripcion:
              "Cuando seas objetivo de un ataque y una criatura a 1,5 m te de cobertura, puedes usar tu reaccion para que el ataque se dirija a esa criatura en su lugar.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Alma de Engano",
            descripcion:
              "Tus pensamientos no pueden ser leidos por telepatia u otros medios a menos que lo permitas. Puedes presentar pensamientos falsos (prueba de CAR (Engano) contra la SAB (Perspicacia) del lector). Ninguna magia puede determinar si mientes si no lo deseas, y no puedes ser obligado magicamente a decir la verdad.",
          },
        ],
      },
    ],
  },

  // -- Fantasma -----------------------------------------------------
  {
    subclaseId: "fantasma",
    claseId: "picaro",
    nombre: "Fantasma",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Susurros de los Muertos",
            descripcion:
              "Cuando terminas un descanso corto o largo, puedes ganar competencia en una habilidad o herramienta que no tengas. Esta competencia dura hasta que vuelvas a usar este rasgo.",
          },
          {
            nombre: "Lamentos de la Tumba",
            descripcion:
              "Justo despues de infligir dano de Ataque Furtivo en tu turno, puedes elegir una segunda criatura que puedas ver a 9 m de la primera. Tira la mitad de tus dados de Ataque Furtivo (redondeando arriba): la segunda criatura recibe dano necrotico igual al resultado. Usos = bon. de competencia por descanso largo.",
          },
        ],
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Fichas del Mas Alla",
            descripcion:
              "Cuando una criatura visible muera a 9 m de ti, puedes usar tu reaccion para crear una ficha espiritual diminuta. Puedes tener hasta tu bon. de competencia en fichas.\n- Mientras lleves una ficha, tienes ventaja en salvaciones de muerte y de CON.\n- Puedes destruir una ficha al infligir Ataque Furtivo para usar Lamentos de la Tumba sin gastar un uso.\n- Como accion, destruyes una ficha para hacerle una pregunta al espiritu (responde brevemente en un idioma que conocia).",
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Paseo Fantasmal",
            descripcion:
              "Como accion bonus, adoptas una forma espectral durante 10 minutos. Ganas velocidad de vuelo de 3 m (puedes flotar) y puedes atravesar criaturas y objetos como terreno dificil (1d10 de fuerza si terminas tu turno dentro). Los ataques contra ti tienen desventaja. Una vez por descanso largo, o destruyendo una ficha como parte de la accion bonus.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Amigo de la Muerte",
            descripcion:
              "Cuando uses Lamentos de la Tumba, puedes infligir el dano necrotico tanto a la primera como a la segunda criatura. Ademas, al final de un descanso largo, si no tienes fichas espirituales, aparece una en tu mano automaticamente.",
          },
        ],
      },
    ],
  },

  // -- Explorador ---------------------------------------------------
  {
    subclaseId: "explorador",
    claseId: "picaro",
    nombre: "Explorador",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Escaramuzador",
            descripcion:
              "Cuando un enemigo termina su turno a 1,5 m de ti, puedes usar tu reaccion para moverte hasta la mitad de tu velocidad. Este movimiento no provoca ataques de oportunidad.",
          },
          {
            nombre: "Superviviente",
            descripcion:
              "Ganas competencia en Naturaleza y Supervivencia (si aun no la tienes). Tu bonificador de competencia se duplica para cualquier prueba que use esas competencias.",
          },
        ],
        habilidadesExtra: {
          cantidad: 2,
          entre: ["naturaleza", "supervivencia"],
        },
      },
      {
        nivel: 9,
        rasgos: [
          {
            nombre: "Movilidad Superior",
            descripcion:
              "Tu velocidad de caminar aumenta en 3 m. Si tienes velocidad de trepar o nadar, tambien aumenta en 3 m.",
            efectos: [{ kind: "speedBonus", walkBonus: 10 }],
          },
        ],
      },
      {
        nivel: 13,
        rasgos: [
          {
            nombre: "Maestro de Emboscadas",
            descripcion:
              "Tienes ventaja en tiradas de iniciativa. La primera criatura que impactes en la primera ronda de combate resulta mas facil de atacar: las tiradas de ataque contra ella tienen ventaja hasta el inicio de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Ataque Repentino",
            descripcion:
              "Si realizas la accion de Atacar, puedes hacer un ataque adicional como accion bonus. Este ataque puede beneficiarse de tu Ataque Furtivo incluso si ya lo usaste este turno, pero no contra el mismo objetivo.",
          },
        ],
      },
    ],
  },
];
