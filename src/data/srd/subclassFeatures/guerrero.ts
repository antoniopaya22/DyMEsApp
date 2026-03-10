/**
 * Rasgos de subclase: Guerrero
 * PHB'24 (Campeón, Maestro de Batalla, Caballero Sobrenatural, Guerrero Psiónico)
 * XGE (Arquero Arcano, Caballero, Samurái) + TCE (Caballero de las Runas)
 */

import type { SubclassFeatureData } from "./types";

export const GUERRERO_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Campeón (PHB'24 p96) ──────────────────────────────────────────
  {
    subclaseId: "campeon",
    claseId: "guerrero",
    nombre: "Campeón",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Crítico Mejorado",
            descripcion:
              "Tus tiradas de ataque con armas y ataques sin armas obtienen un golpe crítico con un 19 o 20 natural en el d20.",
          },
          {
            nombre: "Atleta Notable",
            descripcion:
              "Tienes ventaja en las tiradas de Iniciativa y en las pruebas de FUE (Atletismo). Además, inmediatamente después de obtener un golpe crítico, puedes moverte hasta la mitad de tu velocidad sin provocar ataques de oportunidad.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Estilo de Combate Adicional",
            descripcion:
              "Obtienes otra dote de Estilo de Combate de tu elección.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Guerrero Heroico",
            descripcion:
              "Durante el combate, puedes darte Inspiración Heroica al inicio de cada uno de tus turnos si no la tienes.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Crítico Superior",
            descripcion:
              "Tus tiradas de ataque con armas y ataques sin armas obtienen un golpe crítico con un 18, 19 o 20 natural en el d20.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Superviviente",
            descripcion:
              "Desafiar la Muerte: tienes ventaja en las tiradas de salvación de muerte. Además, con un 18–20 obtienes el beneficio de sacar un 20. Recuperación Heroica: al inicio de cada turno, si estás Ensangrentado (mitad de PG o menos) y tienes al menos 1 PG, recuperas 5 + tu mod. CON puntos de golpe.",
          },
        ],
      },
    ],
  },

  // ── Maestro de Batalla (PHB'24 p93) ────────────────────────────────
  {
    subclaseId: "maestro_batalla",
    claseId: "guerrero",
    nombre: "Maestro de Batalla",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Superioridad en Combate",
            descripcion:
              "Aprendes 3 maniobras (ves más en turnos posteriores). Tienes 4 dados de superioridad (d8), que se gastan al usarlos. Recuperas todos en un descanso corto o largo. Solo puedes usar una maniobra por ataque. Aprendes 2 maniobras más al nv7, 10 y 15. CD de salvación = 8 + mod. FUE o DES (tu elección) + bonificador de competencia.",
            elecciones: [
              {
                id: "maniobras_nivel3",
                nombre: "Maniobras",
                instruccion: "Elige 3 maniobras de combate:",
                tipo: "multi",
                cantidad: 3,
                opciones: [
                  {
                    id: "maniobra_emboscada",
                    nombre: "Emboscada",
                    descripcion:
                      "Suma un dado de superioridad a una prueba de DES (Sigilo) o tirada de Iniciativa.",
                  },
                  {
                    id: "maniobra_cebo",
                    nombre: "Cebo y Cambio",
                    descripcion:
                      "A 1,5 m de una criatura voluntaria, intercambia posiciones gastando 1,5 m. Tú o ella ganáis +dado a CA hasta el inicio de tu siguiente turno.",
                  },
                  {
                    id: "maniobra_mando",
                    nombre: "Orden de Ataque",
                    descripcion:
                      "Reemplaza un ataque para que un aliado ataque con su reacción, sumando el dado al daño.",
                  },
                  {
                    id: "maniobra_presencia",
                    nombre: "Presencia Imponente",
                    descripcion:
                      "Suma un dado de superioridad a una prueba de CAR (Intimidación, Interpretación o Persuasión).",
                  },
                  {
                    id: "maniobra_desarmar",
                    nombre: "Ataque de Desarme",
                    descripcion:
                      "Al impactar, suma el dado al daño. El objetivo debe superar FUE o soltar un objeto.",
                  },
                  {
                    id: "maniobra_distraer",
                    nombre: "Golpe Distractor",
                    descripcion:
                      "Al impactar, suma el dado al daño. El siguiente ataque de otro aliado contra ese objetivo tiene ventaja.",
                  },
                  {
                    id: "maniobra_evasion",
                    nombre: "Evasión Táctica",
                    descripcion:
                      "Como acción adicional, toma la acción de Desengancharse y suma el dado a tu CA hasta el inicio de tu siguiente turno.",
                  },
                  {
                    id: "maniobra_fintar",
                    nombre: "Finta",
                    descripcion:
                      "Como acción adicional, elige una criatura a 1,5 m. Tienes ventaja en tu siguiente ataque contra ella; si impactas, suma el dado al daño.",
                  },
                  {
                    id: "maniobra_provocar",
                    nombre: "Ataque Provocador",
                    descripcion:
                      "Al impactar, suma el dado al daño. El objetivo debe superar SAB o tener desventaja en ataques contra otros hasta el final de tu siguiente turno.",
                  },
                  {
                    id: "maniobra_embestida",
                    nombre: "Embestida",
                    descripcion:
                      "Como acción adicional, toma la acción de Carrera. Si te mueves 1,5 m en línea recta antes de impactar cuerpo a cuerpo, suma el dado al daño.",
                  },
                  {
                    id: "maniobra_maniobrar",
                    nombre: "Ataque de Maniobra",
                    descripcion:
                      "Al impactar, suma el dado al daño. Un aliado puede usar su reacción para moverse la mitad de su velocidad sin provocar ataques de oportunidad del objetivo.",
                  },
                  {
                    id: "maniobra_amenazar",
                    nombre: "Ataque Amenazante",
                    descripcion:
                      "Al impactar, suma el dado al daño. El objetivo debe superar SAB o quedar Asustado hasta el final de tu siguiente turno.",
                  },
                  {
                    id: "maniobra_parada",
                    nombre: "Parada",
                    descripcion:
                      "Cuando recibes daño cuerpo a cuerpo, usa tu reacción para reducir el daño en dado + mod. FUE o DES.",
                  },
                  {
                    id: "maniobra_precision",
                    nombre: "Ataque de Precisión",
                    descripcion:
                      "Cuando fallas un ataque, suma el dado de superioridad a la tirada, pudiendo convertirlo en impacto.",
                  },
                  {
                    id: "maniobra_empujar",
                    nombre: "Ataque de Empuje",
                    descripcion:
                      "Al impactar, suma el dado al daño. Si es Grande o menor, debe superar FUE o ser empujado hasta 4,5 m.",
                  },
                  {
                    id: "maniobra_animar",
                    nombre: "Arenga",
                    descripcion:
                      "Como acción adicional, un aliado a 9 m gana PG temporales = dado + mitad de tu nivel de guerrero.",
                  },
                  {
                    id: "maniobra_ripostar",
                    nombre: "Ripostar",
                    descripcion:
                      "Cuando una criatura falla un ataque cuerpo a cuerpo contra ti, usa tu reacción para atacar y sumar el dado al daño.",
                  },
                  {
                    id: "maniobra_barrer",
                    nombre: "Ataque de Barrido",
                    descripcion:
                      "Al impactar cuerpo a cuerpo, elige otra criatura a 1,5 m del objetivo y a tu alcance. Si la tirada original la impactaría, recibe daño = dado de superioridad.",
                  },
                  {
                    id: "maniobra_evaluacion",
                    nombre: "Evaluación Táctica",
                    descripcion:
                      "Suma un dado de superioridad a una prueba de INT (Historia/Investigación) o SAB (Perspicacia).",
                  },
                  {
                    id: "maniobra_zancadilla",
                    nombre: "Ataque de Zancadilla",
                    descripcion:
                      "Al impactar, suma el dado al daño. Si el objetivo es Grande o menor, debe superar FUE o caer Derribado.",
                  },
                ],
              },
            ],
          },
          {
            nombre: "Estudiante de la Guerra",
            descripcion:
              "Ganas competencia con un tipo de herramientas de artesano de tu elección y competencia en una habilidad disponible para guerreros a nivel 1.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Conoce a tu Enemigo",
            descripcion:
              "Como acción adicional, elige una criatura que puedas ver a 9 m. Sabes si tiene alguna inmunidad, resistencia o vulnerabilidad, y cuáles son. Usos: 1 por descanso largo (puedes restaurar un uso gastando un dado de superioridad).",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Superioridad en Combate Mejorada",
            descripcion: "Tus dados de superioridad se convierten en d10.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Implacable",
            descripcion:
              "Una vez por turno, cuando uses una maniobra, puedes tirar 1d8 y usar el resultado en lugar de gastar un dado de superioridad.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Superioridad en Combate Suprema",
            descripcion: "Tus dados de superioridad se convierten en d12.",
          },
        ],
      },
    ],
  },

  // ── Caballero Sobrenatural (PHB'24 p96) ────────────────────────────
  {
    subclaseId: "caballero_sobrenatural",
    claseId: "guerrero",
    nombre: "Caballero Sobrenatural",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuración",
            descripcion:
              "Aprendes 2 trucos de la lista de mago (se recomiendan Rayo de Escarcha y Descarga Eléctrica). Al nv10, aprendes otro. Preparas 3 conjuros de nv1+ de mago. Tu aptitud de conjuro es INT. Puedes usar un foco arcano.",
          },
          {
            nombre: "Vínculo con Arma",
            descripcion:
              "Mediante un ritual de 1 hora (durante un descanso corto), vinculas un arma. No puedes ser desarmado de ella (salvo Incapacitado), y puedes invocarla con una acción adicional desde el mismo plano. Máximo 2 armas vinculadas, pero solo invocas una a la vez.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Magia de Guerra",
            descripcion:
              "Cuando usas la acción de Atacar, puedes reemplazar uno de los ataques por lanzar un truco de mago con tiempo de lanzamiento de una acción.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Golpe Sobrenatural",
            descripcion:
              "Al impactar a una criatura con un arma, esa criatura tiene desventaja en la siguiente salvación contra un conjuro que lances antes del final de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Carga Arcana",
            descripcion:
              "Cuando usas Oleada de Acción, puedes teletransportarte hasta 9 m a un espacio desocupado que puedas ver. Puedes hacerlo antes o después de la acción adicional.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Magia de Guerra Mejorada",
            descripcion:
              "Cuando usas la acción de Atacar, puedes reemplazar dos de los ataques por lanzar un conjuro de mago de nv1 o nv2 con tiempo de lanzamiento de una acción.",
          },
        ],
      },
    ],
  },

  // ── Guerrero Psiónico (PHB'24 p98) ─────────────────────────────────
  {
    subclaseId: "psi_warrior",
    claseId: "guerrero",
    nombre: "Guerrero Psiónico",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Energía Psiónica",
            descripcion:
              "Tienes Dados de Energía Psiónica según tu nivel: 4d6 (nv3), 6d8 (nv5), 8d8 (nv9), 8d10 (nv11), 10d10 (nv13), 12d12 (nv17). Recuperas 1 en descanso corto, todos en descanso largo.\n\nCampo Protector: cuando tú o una criatura a 9 m recibe daño, como reacción gasta un dado y reduce el daño en resultado + mod. INT (mín. 1).\nGolpe Psiónico: una vez por turno, al impactar a un objetivo a 9 m, gasta un dado para infligir daño de fuerza extra = resultado + mod. INT.\nMovimiento Telequinético: como acción mágica, mueve un objeto Grande o menor o criatura voluntaria a 9 m hasta 9 m. Si es Diminuto, a/desde tu mano. 1 uso por descanso corto/largo (o gasta un dado).",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Adepto Telequinético",
            descripcion:
              "Salto Psiónico: como acción adicional, ganas velocidad de vuelo = 2× tu velocidad hasta el final del turno. 1 uso por descanso corto/largo (o gasta un dado). Empuje Telequinético: cuando infliges daño con Golpe Psiónico, puedes forzar al objetivo una salvación de FUE (CD 8 + mod. INT + bon. comp.) o queda Derribado o es transportado hasta 3 m horizontalmente.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Mente Protegida",
            descripcion:
              "Tienes resistencia al daño psíquico. Además, si empiezas tu turno con la condición Hechizado o Asustado, puedes gastar un dado de Energía Psiónica (sin acción) para terminar todos los efectos que te den esas condiciones.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Baluarte de Fuerza",
            descripcion:
              "Como acción adicional, elige criaturas (incluyéndote) a 9 m, hasta un número = mod. INT (mín. 1). Cada una obtiene media cobertura durante 1 minuto o hasta que quedes Incapacitado. 1 uso por descanso largo (o gasta un dado).",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Maestro Telequinético",
            descripcion:
              "Siempre tienes preparado Telequinesis. Puedes lanzarlo sin espacio ni componentes (INT como aptitud). Mientras mantengas concentración, puedes hacer un ataque con arma como acción adicional en cada turno. 1 uso por descanso largo (o gasta un dado).",
          },
        ],
      },
    ],
  },

  // ── Arquero Arcano (XGE p28) ──────────────────────────────────────
  {
    subclaseId: "arquero_arcano",
    claseId: "guerrero",
    nombre: "Arquero Arcano",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Saber del Arquero Arcano",
            descripcion:
              "Ganas competencia en Arcanos o Naturaleza (a tu elección) y aprendes el truco Prestidigitación o Druidismo.",
          },
          {
            nombre: "Disparo Arcano",
            descripcion:
              "Aprendes 2 opciones de Disparo Arcano. Una vez por turno, al disparar con arco corto o largo como parte de la acción de Atacar, puedes aplicar una opción. 2 usos por descanso corto o largo. Aprendes opciones adicionales al nv7, 10, 15 y 18. Al nv18 todas las opciones mejoran.\n\nOpciones: Flecha Desterradora (CAR o desterrado 1 turno; nv18: +2d6 fuerza), Flecha Seductora (+2d6 psíquico, SAB o hechizado por un aliado; nv18: 4d6), Flecha Explosiva (+2d6 fuerza a objetivo y criaturas a 3 m; nv18: 4d6), Flecha Debilitante (+2d6 necrótico, CON o daño de arma a la mitad; nv18: 4d6), Flecha Atrapante (+2d6 veneno, −3 m velocidad, 2d6 cortante al moverse; nv18: 4d6), Flecha Penetrante (línea 1×9 m, DES o daño del arco +1d6 perforante; nv18: 2d6), Flecha Buscadora (elige criatura vista en 1 min, DES o daño +1d6 fuerza; nv18: 2d6), Flecha de Sombra (+2d6 psíquico, SAB o no ve más allá de 1,5 m; nv18: 4d6).",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Flecha Mágica",
            descripcion:
              "Las flechas no mágicas que dispares con arco corto o largo cuentan como mágicas para superar resistencias e inmunidades.",
          },
          {
            nombre: "Tiro Curvo",
            descripcion:
              "Cuando fallas con una flecha mágica, puedes usar tu acción adicional para repetir la tirada contra un objetivo diferente a 18 m del original.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Opción de Disparo Arcano adicional",
            descripcion: "Aprendes una opción de Disparo Arcano adicional.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Disparo Siempre Listo",
            descripcion:
              "Cuando tiras Iniciativa y no tienes usos de Disparo Arcano, recuperas un uso.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Disparo Arcano Mejorado",
            descripcion:
              "Aprendes una opción de Disparo Arcano adicional. Todas las opciones mejoran al alcanzar nv18 de guerrero (daño extra aumentado según cada opción).",
          },
        ],
      },
    ],
  },

  // ── Caballero (XGE p30) ───────────────────────────────────────────
  {
    subclaseId: "caballero",
    claseId: "guerrero",
    nombre: "Caballero",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Competencia Adicional",
            descripcion:
              "Ganas competencia en una habilidad a tu elección: Trato con Animales, Historia, Perspicacia, Interpretación o Persuasión. Alternativamente, aprendes un idioma.",
          },
          {
            nombre: "Nacido para la Silla",
            descripcion:
              "Tienes ventaja en las salvaciones para evitar caer de tu montura. Si caes y desciendes 3 m o menos, aterrizas de pie (si no estás incapacitado). Montar o desmontar te cuesta solo 1,5 m de movimiento.",
          },
          {
            nombre: "Marca Inquebrantable",
            descripcion:
              "Al impactar con un ataque cuerpo a cuerpo, marcas a la criatura hasta el final de tu siguiente turno. Mientras esté a 1,5 m de ti, tiene desventaja en ataques que no te tengan de objetivo. Si la criatura marcada daña a alguien que no seas tú, puedes hacer un ataque especial cuerpo a cuerpo como acción adicional en tu siguiente turno (con ventaja, +mitad nivel guerrero de daño extra). Usos del ataque especial = mod. FUE (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Maniobra de Protección",
            descripcion:
              "Si tú o una criatura a 1,5 m es impactada, puedes usar tu reacción (si llevas un arma cuerpo a cuerpo o escudo) para tirar 1d8 y sumarlo a la CA del objetivo contra ese ataque. Si el ataque aún impacta, el objetivo tiene resistencia al daño del ataque. Usos = mod. CON (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Mantener la Línea",
            descripcion:
              "Las criaturas provocan ataques de oportunidad de tu parte cuando se mueven 1,5 m o más dentro de tu alcance. Si impactas con un ataque de oportunidad, la velocidad del objetivo se reduce a 0 hasta el final del turno actual.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Carga Feroz",
            descripcion:
              "Si te mueves al menos 3 m en línea recta justo antes de impactar con un ataque, el objetivo debe superar una salvación de FUE (CD 8 + bon. comp. + mod. FUE) o caer Derribado. Solo una vez por turno.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Defensor Vigilante",
            descripcion:
              "En combate, obtienes una reacción especial que puedes usar una vez en el turno de cada otra criatura (no en el tuyo). Solo puedes usarla para hacer un ataque de oportunidad, y no en el mismo turno en que usas tu reacción normal.",
          },
        ],
      },
    ],
  },

  // ── Samurái (XGE p31) ─────────────────────────────────────────────
  {
    subclaseId: "samurai",
    claseId: "guerrero",
    nombre: "Samurái",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Competencia Adicional",
            descripcion:
              "Ganas competencia en una habilidad: Historia, Perspicacia, Interpretación o Persuasión. Alternativamente, aprendes un idioma.",
          },
          {
            nombre: "Espíritu de Combate",
            descripcion:
              "Como acción adicional, te das ventaja en todas las tiradas de ataque con arma hasta el final del turno actual. También ganas 5 PG temporales (10 al nv10, 15 al nv15). 3 usos por descanso largo.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Cortesano Elegante",
            descripcion:
              "Sumas tu mod. SAB a las pruebas de CAR (Persuasión). Ganas competencia en salvaciones de SAB. Si ya la tienes, ganas INT o CAR (a tu elección).",
            efectos: [{ kind: "savingThrowProficiency", abilities: ["sab"] }],
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Espíritu Incansable",
            descripcion:
              "Cuando tiras Iniciativa y no tienes usos de Espíritu de Combate, recuperas un uso.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Golpe Rápido",
            descripcion:
              "Si usas la acción de Atacar y tienes ventaja contra un objetivo, puedes renunciar a la ventaja en esa tirada para hacer un ataque adicional con arma contra ese objetivo como parte de la misma acción. Solo una vez por turno.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Fuerza Antes de la Muerte",
            descripcion:
              "Si recibes daño que te reduce a 0 PG sin matarte, puedes usar tu reacción para tomar un turno extra inmediatamente (interrumpiendo el turno actual). Si sigues a 0 PG al final de ese turno, caes inconsciente. Durante ese turno, recibir daño causa fallos de salvación de muerte normalmente. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Caballero de las Runas (TCE p44) ──────────────────────────────
  {
    subclaseId: "rune_knight",
    claseId: "guerrero",
    nombre: "Caballero de las Runas",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia con herramientas de herrero y aprendes a hablar, leer y escribir Gigante.",
          },
          {
            nombre: "Grabador de Runas",
            descripcion:
              "Conoces 2 runas (3 al nv7, 4 al nv10, 5 al nv15). Al terminar un descanso largo, inscribes cada runa en un objeto diferente (arma, armadura, escudo, joyería u objeto que lleves). Cada runa otorga un beneficio pasivo y un poder activo (1 uso por descanso corto/largo). CD = 8 + bon. comp. + mod. CON.\n\nRuna de la Nube: ventaja en DES (Juego de Manos) y CAR (Engaño). Activa: cuando tú o alguien a 9 m es impactado, redirige el ataque a otra criatura a 9 m.\nRuna del Fuego: doble competencia en pruebas de herramientas. Activa: al impactar, +2d6 fuego y FUE o apresado (2d6 fuego/turno, 1 min).\nRuna de la Escarcha: ventaja en SAB (Trato con Animales) y CAR (Intimidación). Activa: +2 a pruebas y salvaciones de FUE y CON durante 10 min.\nRuna de Piedra: ventaja en SAB (Perspicacia), visión en la oscuridad 36 m. Activa: al terminar su turno a 9 m, SAB o hechizado (velocidad 0, incapacitado, 1 min).\nRuna de la Colina (nv7+): ventaja en salvaciones vs veneno, resistencia a veneno. Activa: resistencia a contundente/perforante/cortante 1 min.\nRuna de la Tormenta (nv7+): ventaja en INT (Arcanos), no puedes ser sorprendido. Activa: estado profético 1 min, puedes dar ventaja o desventaja a tiradas a 18 m.",
            elecciones: [
              {
                id: "runas_nivel3",
                nombre: "Runas",
                instruccion: "Elige 2 runas:",
                tipo: "multi",
                cantidad: 2,
                opciones: [
                  {
                    id: "runa_nube",
                    nombre: "Runa de la Nube",
                    descripcion:
                      "Ventaja en Juego de Manos y Engaño. Activa: redirige un ataque a otra criatura.",
                  },
                  {
                    id: "runa_fuego",
                    nombre: "Runa del Fuego",
                    descripcion:
                      "Doble competencia con herramientas. Activa: +2d6 fuego y posible apresamiento.",
                  },
                  {
                    id: "runa_escarcha",
                    nombre: "Runa de la Escarcha",
                    descripcion:
                      "Ventaja en Trato con Animales e Intimidación. Activa: +2 a FUE y CON 10 min.",
                  },
                  {
                    id: "runa_piedra",
                    nombre: "Runa de Piedra",
                    descripcion:
                      "Ventaja en Perspicacia, visión en la oscuridad. Activa: hechiza a una criatura cercana.",
                  },
                  {
                    id: "runa_colina",
                    nombre: "Runa de la Colina (nv7+)",
                    descripcion:
                      "Resistencia a veneno. Activa: resistencia a contundente/perforante/cortante 1 min.",
                  },
                  {
                    id: "runa_tormenta",
                    nombre: "Runa de la Tormenta (nv7+)",
                    descripcion:
                      "Ventaja en Arcanos, no sorprendido. Activa: da ventaja/desventaja a tiradas cercanas.",
                  },
                ],
              },
            ],
          },
          {
            nombre: "Poder del Gigante",
            descripcion:
              "Como acción adicional, durante 1 minuto: creces a Grande (si cabe), ventaja en pruebas y salvaciones de FUE, y una vez por turno un ataque inflige 1d6 de daño extra (1d8 al nv10, 1d10 al nv18). Usos = bon. de competencia por descanso largo.",
          },
        ],
      },
      {
        nivel: 7,
        rasgos: [
          {
            nombre: "Escudo Rúnico",
            descripcion:
              "Cuando otra criatura que puedas ver a 18 m es impactada, puedes usar tu reacción para forzar al atacante a repetir el d20 y usar el nuevo resultado. Usos = bon. de competencia por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Gran Estatura",
            descripcion:
              "Creces 3d4 pulgadas de forma permanente. Además, el daño extra de Poder del Gigante aumenta a 1d8.",
          },
        ],
      },
      {
        nivel: 15,
        rasgos: [
          {
            nombre: "Maestro de Runas",
            descripcion:
              "Puedes invocar cada runa dos veces por descanso corto o largo, en lugar de una.",
          },
        ],
      },
      {
        nivel: 18,
        rasgos: [
          {
            nombre: "Coloso Rúnico",
            descripcion:
              "El daño extra de Poder del Gigante aumenta a 1d10. Además, cuando usas Poder del Gigante puedes crecer a Enorme, y tu alcance aumenta en 1,5 m mientras seas de ese tamaño.",
          },
        ],
      },
    ],
  },
];
