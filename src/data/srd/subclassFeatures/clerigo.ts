/**
 * Rasgos de subclase: Clérigo
 * PHB'24 + XGtE + PHB'14 + TCoE
 */

import type { SubclassFeatureData } from "./types";

export const CLERIGO_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Dominio de la Vida (PHB'24) ────────────────────────────────────
  {
    subclaseId: "dominio_vida",
    claseId: "clerigo",
    nombre: "Dominio de la Vida",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Vida",
            descripcion:
              "Siempre tienes preparados: Ayuda, Bendición, Curar Heridas y Restauración Menor. A nivel 5: Palabra de Curación en Masa, Revivir. A nivel 7: Aura de Vida, Custodia contra la Muerte. A nivel 9: Restauración Mayor, Curar Heridas en Masa.",
          },
          {
            nombre: "Discípulo de la Vida",
            descripcion:
              "Cuando un conjuro que lanzas con un espacio de conjuro restaura PG a una criatura, esa criatura recupera PG adicionales iguales a 2 + el nivel del espacio de conjuro (en el turno que lo lanzas).",
          },
          {
            nombre: "Preservar la Vida",
            descripcion:
              "Como acción mágica, presentas tu Símbolo Sagrado y gastas un uso de Canalizar Divinidad para restaurar PG: hasta 5 × tu nivel de clérigo. Elige criaturas Ensangrentadas a 9 m (puedes incluirte) y reparte los PG entre ellas. No puedes restaurar más de la mitad del PG máximo de una criatura.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Sanador Bendito",
            descripcion:
              "Cuando lanzas un conjuro con un espacio de conjuro que restaura PG a una criatura que no seas tú, inmediatamente después recuperas PG iguales a 2 + el nivel del espacio de conjuro.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Curación Suprema",
            descripcion:
              "Cuando normalmente tirarías uno o más dados para restaurar PG con un conjuro o Canalizar Divinidad, no los tires: usa el valor máximo de cada dado. Por ejemplo, en lugar de 2d6 PG, restauras 12.",
          },
        ],
      },
    ],
  },

  // ── Dominio de la Luz (PHB'24) ─────────────────────────────────────
  {
    subclaseId: "dominio_luz",
    claseId: "clerigo",
    nombre: "Dominio de la Luz",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Luz",
            descripcion:
              "Siempre tienes preparados: Manos Ardientes, Fuego Feérico, Rayo Abrasador y Ver Invisibilidad. A nivel 5: Luz del Día, Bola de Fuego. A nivel 7: Ojo Arcano, Muro de Fuego. A nivel 9: Columna de Llama, Escudriñar.",
          },
          {
            nombre: "Resplandor del Alba",
            descripcion:
              "Como acción mágica, presentas tu Símbolo Sagrado y gastas un uso de Canalizar Divinidad para emitir un destello en una Emanación de 9 m. Toda oscuridad mágica en el área es disipada. Cada criatura hostil de tu elección: salvación de CON o 2d10 + nivel de clérigo de daño Radiante, mitad si supera.",
          },
          {
            nombre: "Destello Protector",
            descripcion:
              "Cuando una criatura que puedas ver a 9 m realiza una tirada de ataque, puedes usar tu reacción para imponer desventaja en ese ataque, haciendo brillar una luz antes del impacto. Usos iguales a tu mod. SAB (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Destello Protector Mejorado",
            descripcion:
              "Recuperas todos los usos de Destello Protector en un descanso corto o largo. Además, cuando usas Destello Protector, puedes dar al objetivo del ataque PG temporales iguales a 2d6 + tu mod. SAB.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Corona de Luz",
            descripcion:
              "Como acción mágica, emites un aura de luz solar que dura 1 minuto (o hasta que la disipes, sin acción). Emites luz brillante a 18 m y tenue otros 9 m. Tus enemigos en la luz brillante tienen desventaja en salvaciones contra tu Resplandor del Alba y contra cualquier conjuro que inflija daño de Fuego o Radiante. Usos iguales a tu mod. SAB (mín. 1) por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Dominio del Engaño (PHB'24) ────────────────────────────────────
  {
    subclaseId: "dominio_engano",
    claseId: "clerigo",
    nombre: "Dominio del Engaño",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio del Engaño",
            descripcion:
              "Siempre tienes preparados: Hechizar Persona, Disfrazarse, Invisibilidad y Pasar sin Dejar Rastro. A nivel 5: Patrón Hipnótico, Indetectabilidad. A nivel 7: Confusión, Puerta Dimensional. A nivel 9: Dominar Persona, Modificar Recuerdos.",
          },
          {
            nombre: "Bendición del Embaucador",
            descripcion:
              "Como acción mágica, elige a ti mismo o a una criatura voluntaria a 9 m: gana ventaja en pruebas de DES (Sigilo). Dura hasta tu próximo descanso largo o hasta que uses este rasgo de nuevo.",
          },
          {
            nombre: "Invocar Duplicado",
            descripcion:
              "Como acción adicional, gastas un uso de Canalizar Divinidad para crear una ilusión visual perfecta de ti mismo en un espacio desocupado a 9 m. La ilusión es intangible, dura 1 minuto y se anima imitando tus gestos. Beneficios: puedes lanzar conjuros como si estuvieras en su espacio; tienes ventaja en ataques contra criaturas a 1,5 m de la ilusión si tú también lo estás; como acción adicional, puedes mover la ilusión 9 m (hasta 36 m de ti).",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Transposición del Embaucador",
            descripcion:
              "Cuando uses la acción adicional para crear o mover la ilusión de Invocar Duplicado, puedes teletransportarte intercambiando tu posición con la de la ilusión.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Duplicado Mejorado",
            descripcion:
              "Tu Invocar Duplicado gana mejoras: Distracción Compartida (tú y tus aliados tienen ventaja en ataques contra criaturas a 1,5 m de la ilusión) y Ilusión Sanadora (cuando la ilusión termina, tú o una criatura a 1,5 m de ella recuperáis PG iguales a tu nivel de clérigo).",
          },
        ],
      },
    ],
  },

  // ── Dominio de la Guerra (PHB'24) ──────────────────────────────────
  {
    subclaseId: "dominio_guerra",
    claseId: "clerigo",
    nombre: "Dominio de la Guerra",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Guerra",
            descripcion:
              "Siempre tienes preparados: Rayo Guía, Arma Mágica, Escudo de Fe y Arma Espiritual. A nivel 5: Manto del Cruzado, Guardianes Espirituales. A nivel 7: Escudo de Fuego, Libertad de Movimiento. A nivel 9: Retener Monstruo, Golpe del Viento de Acero.",
          },
          {
            nombre: "Sacerdote Guerrero",
            descripcion:
              "Como acción adicional, puedes realizar un ataque con un arma o un Golpe Desarmado. Usos iguales a tu mod. SAB (mín. 1) por descanso corto o largo.",
          },
          {
            nombre: "Golpe Guiado",
            descripcion:
              "Cuando tú o una criatura a 9 m falláis una tirada de ataque, puedes gastar un uso de Canalizar Divinidad para dar +10 al resultado (puede convertirlo en impacto). Si beneficias a otra criatura, debes usar tu reacción.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Bendición del Dios de la Guerra",
            descripcion:
              "Puedes gastar un uso de Canalizar Divinidad para lanzar Escudo de Fe o Arma Espiritual sin gastar espacio de conjuro. Cuando lo haces, el conjuro no requiere concentración: dura 1 minuto, pero termina antes si lanzas ese conjuro de nuevo, quedas incapacitado o mueres.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Avatar de Batalla",
            descripcion:
              "Ganas resistencia a daño contundente, perforante y cortante.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "contundente",
                modifier: "resistance",
              },
              {
                kind: "damageModifier",
                damageType: "cortante",
                modifier: "resistance",
              },
              {
                kind: "damageModifier",
                damageType: "perforante",
                modifier: "resistance",
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Dominio de la Forja (XGtE) ────────────────────────────────────
  {
    subclaseId: "dominio_forja",
    claseId: "clerigo",
    nombre: "Dominio de la Forja",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Forja",
            descripcion:
              "Siempre tienes preparados: Identificar, Golpe Abrasador, Calentar Metal y Arma Mágica. A nivel 5: Arma Elemental, Protección contra la Energía. A nivel 7: Fabricar, Muro de Fuego. A nivel 9: Animar Objetos, Creación.",
          },
          {
            nombre: "Competencia Adicional",
            descripcion:
              "Ganas competencia con armadura pesada y herramientas de herrero.",
          },
          {
            nombre: "Bendición de la Forja",
            descripcion:
              "Al final de un descanso largo, puedes tocar un objeto no mágico (armadura o arma sencilla/marcial) para convertirlo en objeto mágico hasta tu siguiente descanso largo: +1 a CA si es armadura, o +1 a tiradas de ataque y daño si es arma. 1 uso por descanso largo.",
          },
          {
            nombre: "Canalizar Divinidad: Bendición del Artesano",
            descripcion:
              "Realizas un ritual de 1 hora para crear un objeto no mágico que incluya metal: un arma, una armadura, 10 municiones, herramientas u otro objeto metálico de hasta 100 po. Debes aportar metal (incluidas monedas) por el valor del objeto.",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras pesadas"],
          herramientas: ["Herramientas de herrero"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Alma de la Forja",
            descripcion:
              "Ganas resistencia al daño de fuego. Mientras lleves armadura pesada, ganas +1 a la CA.",
            efectos: [
              { kind: "acBonus", bonus: 1, condition: "con armadura pesada" },
              {
                kind: "damageModifier",
                damageType: "fuego",
                modifier: "resistance",
              },
            ],
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Santo de la Forja y el Fuego",
            descripcion:
              "Ganas inmunidad al daño de fuego. Mientras lleves armadura pesada, ganas resistencia al daño contundente, perforante y cortante de ataques no mágicos.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "fuego",
                modifier: "immunity",
              },
              {
                kind: "damageModifier",
                damageType: "contundente",
                modifier: "resistance",
              },
              {
                kind: "damageModifier",
                damageType: "cortante",
                modifier: "resistance",
              },
              {
                kind: "damageModifier",
                damageType: "perforante",
                modifier: "resistance",
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Dominio de la Tumba (XGtE) ────────────────────────────────────
  {
    subclaseId: "dominio_tumba",
    claseId: "clerigo",
    nombre: "Dominio de la Tumba",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Tumba",
            descripcion:
              "Siempre tienes preparados: Perdición, Vida Falsa, Descanso Apacible y Rayo Debilitador. A nivel 5: Revivir, Toque Vampírico. A nivel 7: Añublo, Custodia contra la Muerte. A nivel 9: Caparazón Antivida, Resucitar Muertos.",
          },
          {
            nombre: "Círculo de Mortalidad",
            descripcion:
              "Cuando normalmente tirarías dados para restaurar PG con un conjuro a una criatura a 0 PG, usa el valor máximo de cada dado. Además, aprendes Piedad como truco (no cuenta para tu límite); para ti tiene alcance de 9 m y lo puedes lanzar como acción adicional.",
          },
          {
            nombre: "Ojos de la Tumba",
            descripcion:
              "Como acción, detectas la ubicación de cada muerto viviente a 18 m que no esté tras cobertura total ni protegido contra adivinación. No revela identidad ni capacidades. Usos iguales a tu mod. SAB (mín. 1) por descanso largo.",
          },
          {
            nombre: "Canalizar Divinidad: Camino a la Tumba",
            descripcion:
              "Como acción, elige una criatura a 9 m que puedas ver y márcala hasta el final de tu siguiente turno. El siguiente ataque que tú o un aliado acierte contra ella inflige vulnerabilidad a todo el daño de ese ataque. Luego la marca termina.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Centinela ante la Puerta",
            descripcion:
              "Como reacción, cuando tú o una criatura a 9 m sufre un golpe crítico, puedes convertirlo en un golpe normal (cancelando efectos de crítico). Usos iguales a tu mod. SAB (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Guardián de las Almas",
            descripcion:
              "Cuando un enemigo que puedas ver muere a 18 m de ti, tú o una criatura de tu elección a 18 m recuperáis PG iguales al número de Dados de Golpe del enemigo. Solo funciona si no estás incapacitado. Una vez usado, no se puede repetir hasta el inicio de tu siguiente turno.",
          },
        ],
      },
    ],
  },

  // ── Dominio de la Naturaleza (PHB'14) ──────────────────────────────
  {
    subclaseId: "dominio_naturaleza",
    claseId: "clerigo",
    nombre: "Dominio de la Naturaleza",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Naturaleza",
            descripcion:
              "Siempre tienes preparados: Amistad con los Animales, Hablar con Animales, Piel de Corteza y Crecimiento de Espinas. A nivel 5: Crecimiento Vegetal, Muro de Viento. A nivel 7: Dominar Bestia, Liana Apresadora. A nivel 9: Plaga de Insectos, Zancada Arbórea.",
          },
          {
            nombre: "Acólito de la Naturaleza",
            descripcion:
              "Aprendes un truco de druida de tu elección (cuenta como truco de clérigo). Ganas competencia en una habilidad: Trato con Animales, Naturaleza o Supervivencia.",
          },
          {
            nombre: "Competencia con Armadura Pesada",
            descripcion: "Ganas competencia con armadura pesada.",
          },
          {
            nombre: "Canalizar Divinidad: Encantar Animales y Plantas",
            descripcion:
              "Como acción, cada bestia y criatura planta que pueda verte a 9 m debe superar una salvación de SAB o queda hechizada por ti durante 1 minuto o hasta que reciba daño. Mientras hechizada, es amistosa contigo y con las criaturas que designes.",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras pesadas"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Amortiguar Elementos",
            descripcion:
              "Cuando tú o una criatura a 9 m recibe daño de Ácido, Frío, Fuego, Rayo o Trueno, puedes usar tu reacción para otorgar resistencia a esa instancia de daño.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Maestro de la Naturaleza",
            descripcion:
              "Mientras criaturas estén hechizadas por tu Encantar Animales y Plantas, puedes usar una acción adicional en tu turno para ordenarles verbalmente qué harán en su siguiente turno.",
          },
        ],
      },
    ],
  },

  // ── Dominio de la Tempestad (PHB'14) ───────────────────────────────
  {
    subclaseId: "dominio_tempestad",
    claseId: "clerigo",
    nombre: "Dominio de la Tempestad",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Tempestad",
            descripcion:
              "Siempre tienes preparados: Nube de Niebla, Onda Atronadora, Ráfaga de Viento y Despedazar. A nivel 5: Invocar Rayo, Tormenta de Aguanieve. A nivel 7: Controlar Agua, Tormenta de Hielo. A nivel 9: Ola Destructora, Plaga de Insectos.",
          },
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia con armas marciales y armadura pesada.",
          },
          {
            nombre: "Ira de la Tormenta",
            descripcion:
              "Cuando una criatura a 1,5 m que puedas ver te impacta con un ataque, puedes usar tu reacción para forzar una salvación de DES. Si falla: 2d8 de daño de Rayo o Trueno (tú eliges). Si supera: mitad de daño. Usos iguales a tu mod. SAB (mín. 1) por descanso largo.",
          },
          {
            nombre: "Canalizar Divinidad: Furia Destructora",
            descripcion:
              "Cuando tires daño de Rayo o Trueno, puedes usar Canalizar Divinidad para infligir el daño máximo posible en lugar de tirar los dados.",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras pesadas"],
          armas: ["Armas marciales"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Portador del Trueno",
            descripcion:
              "Cuando infliges daño de Rayo a una criatura Grande o menor, puedes empujarla hasta 3 m lejos de ti.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Nacido de la Tormenta",
            descripcion:
              "Ganas velocidad de vuelo igual a tu velocidad de caminar siempre que no estés bajo tierra ni en interior.",
            efectos: [
              {
                kind: "speedBonus",
                fly: "walk",
                condition: "no bajo tierra ni en interior",
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Dominio del Orden (TCoE) ───────────────────────────────────────
  {
    subclaseId: "dominio_orden",
    claseId: "clerigo",
    nombre: "Dominio del Orden",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio del Orden",
            descripcion:
              "Siempre tienes preparados: Orden Perentoria, Heroísmo, Retener Persona y Zona de Verdad. A nivel 5: Palabra de Curación en Masa, Lentitud. A nivel 7: Compulsión, Localizar Criatura. A nivel 9: Comunión, Dominar Persona.",
          },
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia con armadura pesada. También competencia en Intimidación o Persuasión (tu elección).",
          },
          {
            nombre: "Voz de la Autoridad",
            descripcion:
              "Cuando lanzas un conjuro de nivel 1+ que tiene como objetivo a un aliado, ese aliado puede usar su reacción inmediatamente después para realizar un ataque con arma contra una criatura de tu elección que puedas ver. Si el conjuro afecta a varios aliados, tú eliges cuál ataca.",
          },
          {
            nombre: "Canalizar Divinidad: Demanda del Orden",
            descripcion:
              "Como acción, presentas tu símbolo sagrado. Cada criatura de tu elección a 9 m que pueda verte u oírte debe superar una salvación de SAB o queda hechizada hasta el final de tu siguiente turno o hasta que reciba daño. También puedes hacer que las criaturas hechizadas suelten lo que sostengan.",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras pesadas"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Encarnación del Derecho",
            descripcion:
              "Si lanzas un conjuro de la escuela de Encantamiento de nivel 1+ cuyo tiempo de lanzamiento es 1 acción, puedes cambiarlo a 1 acción adicional para ese lanzamiento. Usos iguales a tu mod. SAB (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Ira del Orden",
            descripcion:
              "Si inflinges tu daño de Golpe Divino a una criatura en tu turno, puedes maldecirla hasta el inicio de tu siguiente turno. La siguiente vez que un aliado impacte a la criatura maldecida, recibe 2d8 de daño psíquico adicional y la maldición termina. Una vez por turno.",
          },
        ],
      },
    ],
  },

  // ── Dominio de la Paz (TCoE) ───────────────────────────────────────
  {
    subclaseId: "dominio_paz",
    claseId: "clerigo",
    nombre: "Dominio de la Paz",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio de la Paz",
            descripcion:
              "Siempre tienes preparados: Heroísmo, Santuario, Ayuda y Vínculo Protector. A nivel 5: Faro de Esperanza, Enviar Mensaje. A nivel 7: Aura de Pureza, Esfera Resiliente de Otiluke. A nivel 9: Restauración Mayor, Vínculo Telepático de Rary.",
          },
          {
            nombre: "Implemento de la Paz",
            descripcion:
              "Ganas competencia en una habilidad: Perspicacia, Interpretación o Persuasión (tu elección).",
          },
          {
            nombre: "Vínculo de Empatía",
            descripcion:
              "Como acción, elige un número de criaturas voluntarias a 9 m (incluyéndote) igual a tu bon. competencia. Creas un vínculo mágico durante 10 minutos. Mientras una criatura vinculada esté a 9 m de otra vinculada, puede tirar 1d4 y sumarlo a una tirada de ataque, prueba de característica o salvación (máx. una vez por turno). Usos iguales a bon. competencia por descanso largo.",
          },
          {
            nombre: "Canalizar Divinidad: Bálsamo de Paz",
            descripcion:
              "Como acción, te mueves hasta tu velocidad sin provocar ataques de oportunidad. Cuando te muevas a 1,5 m de una criatura, puedes restaurar 2d6 + mod. SAB de PG (cada criatura solo una vez por uso).",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Vínculo Protector",
            descripcion:
              "Cuando una criatura afectada por tu Vínculo de Empatía va a recibir daño, una segunda criatura vinculada a 9 m de la primera puede usar su reacción para teletransportarse a un espacio a 1,5 m de la primera y recibir todo el daño en su lugar.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Vínculo Expansivo",
            descripcion:
              "Los beneficios de Vínculo de Empatía y Vínculo Protector ahora funcionan cuando las criaturas están a 18 m entre sí. Además, cuando una criatura usa Vínculo Protector para absorber el daño de otra, tiene resistencia a ese daño.",
          },
        ],
      },
    ],
  },

  // ── Dominio del Crepúsculo (TCoE) ─────────────────────────────────
  {
    subclaseId: "dominio_crepusculo",
    claseId: "clerigo",
    nombre: "Dominio del Crepúsculo",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros de Dominio del Crepúsculo",
            descripcion:
              "Siempre tienes preparados: Fuego Feérico, Sueño, Rayo de Luna y Ver Invisibilidad. A nivel 5: Aura de Vitalidad, Refugio Diminuto de Leomund. A nivel 7: Aura de Vida, Invisibilidad Mayor. A nivel 9: Círculo de Poder, Despistar.",
          },
          {
            nombre: "Competencias Adicionales",
            descripcion:
              "Ganas competencia con armas marciales y armadura pesada.",
          },
          {
            nombre: "Ojos de la Noche",
            descripcion:
              "Ganas visión en la oscuridad a 90 m. En ese radio ves en penumbra como en luz brillante y en oscuridad como en penumbra. Como acción, puedes compartir esta visión con criaturas voluntarias a 3 m (hasta tu mod. SAB, mín. 1). Dura 1 hora. 1 uso por descanso largo (o gasta un espacio de conjuro para repetir).",
            efectos: [{ kind: "darkvision", range: 300 }],
          },
          {
            nombre: "Bendición del Vigilante",
            descripcion:
              "Como acción, toca a una criatura (incluyéndote). Gana ventaja en su siguiente tirada de iniciativa. El beneficio termina tras la tirada o si usas este rasgo de nuevo.",
          },
          {
            nombre: "Canalizar Divinidad: Santuario Crepuscular",
            descripcion:
              "Como acción, presentas tu símbolo sagrado y una esfera de luz tenue de 9 m de radio aparece centrada en ti durante 1 minuto (o hasta que quedes incapacitado o mueras). Se mueve contigo. Cuando una criatura (incluyéndote) termina su turno en la esfera, le otorgas un beneficio: PG temporales iguales a 1d6 + nivel de clérigo, o terminar un efecto de hechizado o asustado.",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras pesadas"],
          armas: ["Armas marciales"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Pasos Nocturnos",
            descripcion:
              "Como acción adicional, cuando estés en penumbra u oscuridad, puedes darte mágicamente velocidad de vuelo igual a tu velocidad de caminar durante 1 minuto. Usos iguales a tu bon. competencia por descanso largo.",
          },
        ],
      },
      {
        nivel: 17,
        rasgos: [
          {
            nombre: "Velo del Crepúsculo",
            descripcion:
              "Tú y tus aliados tenéis media cobertura mientras estéis dentro de la esfera creada por tu Santuario Crepuscular.",
          },
        ],
      },
    ],
  },
];
