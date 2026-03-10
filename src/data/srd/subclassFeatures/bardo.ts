/**
 * Rasgos de subclase: Bardo
 */

import type { SubclassFeatureData } from "./types";

export const BARDO_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Colegio del Conocimiento ──────────────────────────────────────
  {
    subclaseId: "colegio_conocimiento",
    claseId: "bardo",
    nombre: "Colegio del Conocimiento",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia en tres habilidades cualesquiera de tu elección.",
          },
          {
            nombre: "Palabras Cortantes",
            descripcion:
              "Cuando una criatura que puedas ver a 18 m o menos realice una tirada de ataque, una prueba de característica o una tirada de daño, puedes emplear tu reacción y gastar un uso de Inspiración Bárdica para tirar un dado de Inspiración Bárdica y restar el resultado a la tirada de la criatura. La criatura debe poder oírte y no ser inmune al estado hechizado.",
          },
        ],
        habilidadesExtra: {
          cantidad: 3,
          cualquiera: true,
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Secretos Mágicos Adicionales",
            descripcion:
              "Aprendes dos conjuros a tu elección de las listas de cualquier clase. Puedes elegir trucos o conjuros de un nivel que puedas lanzar. Estos conjuros se consideran conjuros de bardo pero no cuentan para el total de conjuros que conoces.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Habilidad sin Parangón",
            descripcion:
              "Cuando hagas una prueba de característica, puedes gastar un uso de Inspiración Bárdica. Tira el dado de Inspiración Bárdica y suma el resultado a tu prueba. Puedes elegir hacerlo después de tirar el d20, pero antes de que el GM diga si la superas o no.",
          },
        ],
      },
    ],
  },

  // ── Colegio del Valor ──────────────────────────────────────────────
  {
    subclaseId: "colegio_valor",
    claseId: "bardo",
    nombre: "Colegio del Valor",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia con armaduras medianas, escudos y armas marciales.",
          },
          {
            nombre: "Inspiración de Combate",
            descripcion:
              "Cuando otorgas un dado de Inspiración Bárdica, el aliado puede usarlo para sumar a una tirada de daño de arma, o como reacción para sumarlo a su CA contra un ataque (después de ver la tirada, pero antes de saber si impacta).",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras medianas", "Escudos"],
          armas: ["Armas marciales"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Ataque Extra",
            descripcion:
              "Puedes atacar dos veces, en lugar de una, cada vez que realices la acción de Atacar en tu turno.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Magia de Batalla",
            descripcion:
              "Cuando uses tu acción para lanzar un conjuro de bardo, puedes hacer un ataque con arma como acción bonus.",
          },
        ],
      },
    ],
  },

  // ── Colegio de las Espadas ─────────────────────────────────────────
  {
    subclaseId: "colegio_espadas",
    claseId: "bardo",
    nombre: "Colegio de las Espadas",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia con armaduras medianas y con la cimitarra. Puedes usar un arma cuerpo a cuerpo en la que seas competente como canalizador mágico para tus conjuros de bardo.",
          },
          {
            nombre: "Estilo de Combate",
            descripcion: "Eliges un estilo de combate como especialidad.",
            elecciones: [
              {
                id: "estilo_combate",
                nombre: "Estilo de Combate",
                instruccion: "Elige tu estilo de combate:",
                tipo: "single",
                opciones: [
                  {
                    id: "duelo",
                    nombre: "Duelo",
                    descripcion:
                      "Cuando empuñas un arma cuerpo a cuerpo en una mano y ninguna otra arma, obtienes un bonificador de +2 a las tiradas de daño con esa arma.",
                  },
                  {
                    id: "dos_armas",
                    nombre: "Combate con Dos Armas",
                    descripcion:
                      "Cuando combates con dos armas, puedes sumar tu modificador de característica al daño del segundo ataque.",
                  },
                ],
              },
            ],
          },
          {
            nombre: "Florituras con Cuchillas",
            descripcion:
              "Al realizar la acción de Atacar, puedes gastar un uso de Inspiración Bárdica y sumar el dado a la tirada de daño. Además, elige una floritura: Defensiva (suma el dado a tu CA hasta tu siguiente turno), Móvil (suma el dado a tu velocidad, sin ataques de oportunidad del objetivo), u Ofensiva (empujas al objetivo 1,5 m × el resultado del dado).",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras medianas"],
          armas: ["Cimitarra"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Ataque Extra",
            descripcion:
              "Puedes atacar dos veces, en lugar de una, cada vez que realices la acción de Atacar en tu turno.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Floritura Magistral",
            descripcion:
              "Cada vez que uses una Floritura con Cuchillas, puedes tirar un d6 en lugar de gastar un dado de Inspiración Bárdica.",
          },
        ],
      },
    ],
  },

  // ── Colegio del Glamour ────────────────────────────────────────────
  {
    subclaseId: "colegio_glamour",
    claseId: "bardo",
    nombre: "Colegio del Glamour",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Magia Seductora",
            descripcion:
              "Cuando lanzas un conjuro de la escuela de Encantamiento o Ilusión, puedes hacer que una criatura que puedas ver a 18 m o menos realice una tirada de salvación de Sabiduría contra tu CD de conjuros. Si falla, queda Hechizada o Asustada (a tu elección) durante 1 minuto. La criatura puede repetir la tirada al final de cada turno. Puedes usar este rasgo un número de veces igual a tu mod. de Carisma (mín. 1) por descanso largo.",
          },
          {
            nombre: "Manto de Inspiración",
            descripcion:
              "Como acción bonus, puedes gastar un uso de Inspiración Bárdica para dar a un número de aliados a 18 m igual a tu mod. de Carisma (mín. 1) puntos de golpe temporales de 2d6 (suben a 2d8 a nv8, 2d10 a nv13, 2d12 a nv18). Cada aliado puede usar su reacción para moverse hasta su velocidad sin provocar ataques de oportunidad.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Manto de la Majestad",
            descripcion:
              "Como acción bonus, te invistes de un manto de majestad feérica durante 1 minuto. Mientras dure, puedes lanzar Mandato como acción bonus sin gastar un espacio de conjuro. Cualquier criatura hechizada por ti falla automáticamente su salvación contra Mandato. Una vez por descanso largo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Majestad Inquebrantable",
            descripcion:
              "Como acción bonus, proyectas una presencia de majestad sobrenatural durante 1 minuto. Cuando una criatura te ataque por primera vez en un turno, debe superar una salvación de Carisma contra tu CD de conjuros o el ataque falla automáticamente. Si supera la salvación, tiene desventaja en las salvaciones contra tus conjuros hasta el final de tu siguiente turno. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Colegio de la Elocuencia ───────────────────────────────────────
  {
    subclaseId: "colegio_elocuencia",
    claseId: "bardo",
    nombre: "Colegio de la Elocuencia",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Lengua de Plata",
            descripcion:
              "Cuando hagas una prueba de Persuasión o Engaño, puedes tratar un resultado de 9 o menos en el d20 como un 10.",
          },
          {
            nombre: "Palabras Inquietantes",
            descripcion:
              "Como acción bonus, gasta un uso de Inspiración Bárdica y elige una criatura que puedas ver a 18 m o menos. Tira el dado de Inspiración Bárdica: el objetivo resta ese resultado a la próxima salvación que realice antes del inicio de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Elocuencia Imparable",
            descripcion:
              "Cuando una criatura suma tu dado de Inspiración Bárdica a una prueba de característica, tirada de ataque o tirada de salvación y aun así falla, no pierde ese uso de Inspiración Bárdica.",
          },
          {
            nombre: "Discurso Universal",
            descripcion:
              "Como acción, elige una o más criaturas que puedas ver a 18 m o menos (hasta tu mod. de Carisma, mín. 1). Esas criaturas te entienden mágicamente, independientemente del idioma, durante 1 hora. Usos = mod. de Carisma por descanso largo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Palabras Universales",
            descripcion:
              "Como acción, puedes lanzar Sugestión sin gastar un espacio de conjuro. Puedes elegir hasta 5 criaturas a 18 m o menos como objetivos simultáneos (una sola sugerencia para todas). Cada una debe superar su propia tirada de salvación. Puedes usar este rasgo una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Colegio de los Lamentos ────────────────────────────────────────
  {
    subclaseId: "colegio_lamentos",
    claseId: "bardo",
    nombre: "Colegio de los Lamentos",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Cuchillas Psíquicas",
            descripcion:
              "Al impactar con un ataque con arma, puedes gastar un uso de Inspiración Bárdica para infligir daño psíquico adicional: 2d6 a nivel 3, 3d6 a nivel 5, 5d6 a nivel 10 y 8d6 a nivel 15. Una vez por turno.",
          },
          {
            nombre: "Palabras del Terror",
            descripcion:
              "Si hablas con un humanoide a solas durante al menos 1 minuto, puedes intentar sembrar el terror. El objetivo debe superar una salvación de Sabiduría contra tu CD de conjuros o quedará aterrorizado por ti o por otra criatura de tu elección. El efecto dura 1 hora, salvo que la criatura sea atacada o dañada. Si supera la tirada, no sabe que intentaste asustarlo. Puedes usar este rasgo una vez por descanso corto o largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Manto de Susurros",
            descripcion:
              "Cuando un humanoide muere a 9 m o menos de ti, puedes capturar mágicamente su sombra con tu reacción. Retienes la sombra hasta que la uses o hasta un descanso largo. Como acción, puedes consumir la sombra para asumir la apariencia, voz y recuerdos superficiales de esa criatura durante 1 hora. Otra criatura solo puede desenmascararte superando una prueba de Perspicacia (Sabiduría) contra tu CD de conjuros. El disfraz termina prematuramente si lo desestimas (sin acción) o usas de nuevo este rasgo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Tradición Sombría",
            descripcion:
              "Como acción, susurras mágicamente a un humanoide a 9 m o menos y lo fascinas durante 8 horas. Mientras dure el efecto, la criatura te obedece y no puede atacarte ni dañarte. Si la criatura es atacada, dañada o forzada a hacer una salvación, el efecto termina. Cuando el efecto acaba, el objetivo no recuerda haber sido dominado. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Colegio de la Creación ─────────────────────────────────────────
  {
    subclaseId: "colegio_creacion",
    claseId: "bardo",
    nombre: "Colegio de la Creación",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Mota de Potencial",
            descripcion:
              "Cuando otorgas un dado de Inspiración Bárdica, la criatura también gana un beneficio dependiendo de cómo use el dado:\n• Prueba de característica: tira el dado dos veces y elige cuál usar.\n• Tirada de ataque: si impacta, el objetivo y cada criatura a tu elección a 1,5 m del objetivo reciben daño de trueno igual al dado de Inspiración.\n• Tirada de salvación: si falla, gana PG temporales iguales al dado de Inspiración + tu mod. de Carisma.\nLa mota desaparece si no se usa antes de que reciba otro dado de Inspiración Bárdica.",
          },
          {
            nombre: "Rendimiento Creativo",
            descripcion:
              "Como acción, creas un objeto no mágico de tamaño Mediano o menor en un espacio desocupado a 3 m. El objeto debe ser algo que hayas visto e igual o menor a tu nivel × 6 m³ de valor. Emite un brillo tenue en 1,5 m. Duración: mod. de Competencia en horas. Puedes tener un solo objeto activo a la vez. Usos = mod. de Carisma (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Danza Animada",
            descripcion:
              "Como acción bonus, animas un objeto Grande o menor a 9 m. El objeto usa las estadísticas de Objeto Danzante y obedece tus órdenes. Dura 1 hora o hasta que caiga a 0 PG. El objeto actúa justo después de ti en la iniciativa. Puedes usar este rasgo una vez por descanso largo, o gastando un espacio de conjuro de nivel 3 o superior.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Rendimiento Creativo",
            descripcion:
              "Cuando usas Rendimiento Creativo, puedes crear un objeto de tamaño Grande y el límite de valor sube a tu nivel × 18 m³. Además, puedes crear más de un objeto a la vez (máximo igual a tu mod. de Carisma, mín. 2).",
          },
        ],
      },
    ],
  },

  // ── Colegio de la Danza ──────────────────────────────────────────
  {
    subclaseId: "colegio_danza",
    claseId: "bardo",
    nombre: "Colegio de la Danza",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Gracia Deslumbrante",
            descripcion:
              "Mientras no lleves armadura y no empuñes Escudo, ganas las siguientes ventajas:\n• Tu CA es igual a 10 + mod. de Destreza + mod. de Carisma.\n• Tu velocidad aumenta en 3 m.\n• Tienes ventaja en las salvaciones de Destreza.",
            efectos: [
              {
                kind: "acFormula",
                formula: {
                  type: "unarmoredDefense",
                  abilities: ["des", "car"],
                },
                allowShield: false,
              },
              {
                kind: "speedBonus",
                walkBonus: 10,
                condition: "sin armadura ni escudo",
              },
            ],
          },
          {
            nombre: "Pirueta Inspiradora",
            descripcion:
              "Cuando usas una acción bonus para otorgar un dado de Inspiración Bárdica, puedes moverte hasta la mitad de tu velocidad sin provocar ataques de oportunidad.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Danza Cautivadora",
            descripcion:
              "Como acción bonus, puedes empezar a danzar de forma cautivadora. Hasta el final de tu siguiente turno, siempre que una criatura a 9 m o menos te ataque, debe superar una salvación de Sabiduría contra tu CD de conjuros o su ataque tiene desventaja. Puedes usar este rasgo un número de veces igual a tu mod. de Carisma (mín. 1) por descanso largo.",
          },
          {
            nombre: "Giro Tándem",
            descripcion:
              "Cuando un aliado a 9 m o menos que tenga tu dado de Inspiración Bárdica sea atacado, puedes usar tu reacción para consumir ese dado. Tanto tú como el aliado os podéis mover hasta la mitad de vuestra velocidad sin provocar ataques de oportunidad, y la CA de ese aliado contra el ataque provocador aumenta en el resultado del dado de Inspiración Bárdica.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Danza de la Victoria",
            descripcion:
              "Cuando un enemigo a 18 m o menos sea reducido a 0 PG, puedes usar tu reacción para ejecutar la Danza de la Victoria. Elige un número de aliados que puedas ver a 18 m o menos (hasta tu mod. de Carisma, mín. 1). Cada uno puede usar su reacción para moverse hasta la mitad de su velocidad sin provocar ataques de oportunidad; adicionalmente, cada aliado gana PG temporales iguales a tu dado de Inspiración Bárdica + tu mod. de Carisma.",
          },
        ],
      },
    ],
  },
];
