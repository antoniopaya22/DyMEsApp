/**
 * Rasgos de subclase: Brujo
 */

import type { SubclassFeatureData } from "./types";

export const BRUJO_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Patrón Feérico (PHB'24) ────────────────────────────────────────
  {
    subclaseId: "patron_feerico",
    claseId: "brujo",
    nombre: "Patrón Feérico",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Feérico",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de brujo. Nivel 3: Calmar Emociones, Fuego Feérico, Paso Brumoso, Fuerza Fantasmal, Dormir. Nivel 5: Parpadeo, Crecimiento Vegetal. Nivel 7: Dominar Bestia, Invisibilidad Superior. Nivel 9: Dominar Persona, Apariencia.",
          },
          {
            nombre: "Pasos Feéricos",
            descripcion:
              "Puedes lanzar Paso Brumoso sin gastar espacio de conjuro un número de veces igual a tu mod. CAR (mín. 1); recuperas todos los usos tras un descanso largo.\n\nAdemás, al lanzar Paso Brumoso, puedes elegir un efecto adicional:\n\n• Paso Refrescante: Inmediatamente después de teletransportarte, tú o una criatura que puedas ver a 3 m gana 1d10 PG temporales.\n• Paso Provocador: Las criaturas a 1,5 m del espacio que dejaste: salvación de SAB contra tu CD de conjuro o tienen desventaja en ataques contra criaturas que no seas tú hasta el inicio de tu siguiente turno.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Escape Brumoso",
            descripcion:
              "Puedes lanzar Paso Brumoso como reacción en respuesta a recibir daño.\n\nAdemás, los siguientes efectos se añaden a tus opciones de Pasos Feéricos:\n\n• Paso de Desaparición: Tienes la condición Invisible hasta el inicio de tu siguiente turno o hasta inmediatamente después de hacer una tirada de ataque, infligir daño o lanzar un conjuro.\n• Paso Temible: Las criaturas a 1,5 m del espacio que dejaste o del espacio donde apareces (tú eliges): salvación de SAB contra tu CD de conjuro o reciben 2d10 de daño psíquico.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Defensas Seductoras",
            descripcion:
              "Tu patrón te enseña a proteger tu mente y cuerpo. Eres inmune a la condición Hechizado.\n\nAdemás, inmediatamente después de que una criatura que puedas ver te impacte con una tirada de ataque, puedes usar una reacción para reducir el daño a la mitad (redondeo abajo) y forzar al atacante a hacer una salvación de SAB contra tu CD de conjuro. Si falla, recibe daño psíquico igual al daño que tú recibes. Una vez por descanso largo, o puedes gastar un espacio de Magia de Pacto (sin acción) para restaurar el uso.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Magia Seductora",
            descripcion:
              "Tu patrón te otorga la capacidad de entrelazar magia con teletransportación. Inmediatamente después de lanzar un conjuro de Encantamiento o Ilusión usando una acción y un espacio de conjuro, puedes lanzar Paso Brumoso como parte de la misma acción y sin gastar espacio de conjuro.",
          },
        ],
      },
    ],
  },

  // ── Patrón Celestial (PHB'24) ──────────────────────────────────────
  {
    subclaseId: "patron_celestial",
    claseId: "brujo",
    nombre: "Patrón Celestial",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Celestial",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de brujo. Nivel 3: Ayuda, Curar Heridas, Rayo Guía, Restauración Menor, Luz, Llama Sagrada. Nivel 5: Luz Diurna, Revivificar. Nivel 7: Guardián de Fe, Muro de Fuego. Nivel 9: Restauración Superior, Invocar Celestial.",
          },
          {
            nombre: "Luz Curativa",
            descripcion:
              "Ganas la capacidad de canalizar energía celestial para curar heridas. Tienes una reserva de d6 cuyo número es 1 + tu nivel de brujo.\n\nComo acción adicional, puedes curarte a ti mismo o a una criatura que puedas ver a 18 m, gastando dados de la reserva. El máximo de dados que puedes gastar a la vez es igual a tu mod. CAR (mín. 1). Tira los dados y recupera PG iguales al total. La reserva se recarga tras un descanso largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Alma Radiante",
            descripcion:
              "Tu vínculo con tu patrón te permite servir de conducto para la energía radiante. Tienes resistencia al daño radiante. Una vez por turno, cuando un conjuro que lances inflija daño radiante o de fuego, puedes sumar tu mod. CAR al daño contra uno de los objetivos.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Resistencia Celestial",
            descripcion:
              "Ganas PG temporales siempre que uses tu rasgo Astucia Mágica o termines un descanso corto o largo. Estos PG temporales son iguales a tu nivel de brujo + tu mod. CAR. Además, elige hasta cinco criaturas que puedas ver: cada una gana PG temporales iguales a la mitad de tu nivel de brujo + tu mod. CAR.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Venganza Abrasadora",
            descripcion:
              "Cuando tú o un aliado a 18 m de ti esté a punto de hacer una tirada de salvación de muerte, puedes desatar energía radiante para salvar a la criatura. La criatura recupera PG iguales a la mitad de su máximo de PG y puede terminar la condición Derribado sobre sí misma. Cada criatura de tu elección a 9 m recibe daño radiante igual a 2d8 + tu mod. CAR, y queda con la condición Cegado hasta el final del turno actual.\n\nUna vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Patrón Infernal (PHB'24) ───────────────────────────────────────
  {
    subclaseId: "patron_infernal",
    claseId: "brujo",
    nombre: "Patrón Infernal",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Infernal",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de brujo. Nivel 3: Manos Ardientes, Orden Imperiosa, Rayo Abrasador, Sugestión. Nivel 5: Bola de Fuego, Nube Apestosa. Nivel 7: Escudo de Fuego, Muro de Fuego. Nivel 9: Coacción, Plaga de Insectos.",
          },
          {
            nombre: "Bendición del Oscuro",
            descripcion:
              "Cuando reduces a un enemigo a 0 PG, ganas PG temporales iguales a tu mod. CAR + tu nivel de brujo (mínimo 1 PG temporal). También ganas este beneficio si otra persona reduce a un enemigo a 0 PG a 3 m de ti.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Buena Suerte del Oscuro",
            descripcion:
              "Puedes llamar a tu patrón infernal para alterar el destino a tu favor. Cuando hagas una prueba de característica o una tirada de salvación, puedes usar este rasgo para sumar 1d10 al resultado. Puedes hacerlo tras ver la tirada pero antes de que surta efecto.\n\nUsos iguales a tu mod. CAR (mín. 1), y no más de una vez por tirada. Recuperas todos los usos tras un descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Resistencia Infernal",
            descripcion:
              "Elige un tipo de daño (excepto Fuerza) siempre que termines un descanso corto o largo. Tienes resistencia a ese tipo de daño hasta que elijas otro con este rasgo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Viajar al Infierno",
            descripcion:
              "Una vez por turno, cuando impactas a una criatura con una tirada de ataque, puedes intentar transportarla instantáneamente a los Planos Inferiores. El objetivo debe superar una salvación de CAR contra tu CD de conjuro, o desaparece y sufre un paisaje infernal. Recibe 8d10 de daño psíquico si no es un infernal, y tiene la condición Incapacitado hasta el final de tu siguiente turno, cuando regresa al espacio que ocupaba.\n\nUna vez por descanso largo, o puedes gastar un espacio de Magia de Pacto (sin acción) para restaurar el uso.",
          },
        ],
      },
    ],
  },

  // ── Patrón Gran Antiguo (PHB'24) ───────────────────────────────────
  {
    subclaseId: "patron_gran_antiguo",
    claseId: "brujo",
    nombre: "Patrón Gran Antiguo",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Gran Antiguo",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de brujo. Nivel 3: Detectar Pensamientos, Susurros Disonantes, Fuerza Fantasmal, Risa Horrible de Tasha. Nivel 5: Clarividencia, Hambre de Hadar. Nivel 7: Confusión, Invocar Aberración. Nivel 9: Modificar Recuerdos, Telequinesis.",
          },
          {
            nombre: "Mente Despierta",
            descripcion:
              "Puedes formar una conexión telepática entre tu mente y la de otro. Como acción adicional, elige una criatura que puedas ver a 9 m. Tú y ella podéis comunicaros telepáticamente mientras estéis a un número de millas igual a tu mod. CAR (mín. 1). Para entenderos, cada uno debe usar mentalmente un idioma que el otro conozca.\n\nLa conexión dura un número de minutos igual a tu nivel de brujo. Termina antes si usas este rasgo para conectar con otra criatura.",
          },
          {
            nombre: "Conjuros Psíquicos",
            descripcion:
              "Cuando lances un conjuro de brujo que inflija daño, puedes cambiar su tipo de daño a psíquico. Además, cuando lances un conjuro de brujo que sea de Encantamiento o Ilusión, puedes hacerlo sin componentes verbales ni somáticos.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Combatiente Clarividente",
            descripcion:
              "Cuando formas un vínculo telepático con una criatura usando Mente Despierta, puedes forzar a esa criatura a hacer una salvación de SAB contra tu CD de conjuro. Si falla, tiene desventaja en ataques contra ti y tú tienes ventaja en ataques contra ella durante la duración del vínculo.\n\nUna vez por descanso corto o largo, o puedes gastar un espacio de Magia de Pacto (sin acción) para restaurar el uso.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Maleficio Sobrenatural",
            descripcion:
              "Tu patrón alienígena te otorga una maldición poderosa. Siempre tienes preparado el conjuro Maleficio. Cuando lanzas Maleficio y eliges una característica, el objetivo también tiene desventaja en tiradas de salvación de la característica elegida durante la duración del conjuro.",
          },
          {
            nombre: "Escudo de Pensamiento",
            descripcion:
              "Tus pensamientos no pueden ser leídos por telepatía ni otros medios a menos que lo permitas. También tienes resistencia al daño psíquico, y siempre que una criatura te inflija daño psíquico, esa criatura recibe la misma cantidad de daño que tú recibes.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Crear Siervo",
            descripcion:
              "Cuando lanzas Invocar Aberración, puedes modificarlo para que no requiera concentración. Si lo haces, la duración del conjuro es de 1 minuto para ese lanzamiento, y al invocarse, la aberración tiene PG temporales iguales a tu nivel de brujo + tu mod. CAR.\n\nAdemás, la primera vez en cada turno que la aberración impacte a una criatura bajo el efecto de tu Maleficio, inflige daño psíquico extra igual al daño de bonificación de ese conjuro.",
          },
        ],
      },
    ],
  },

  // ── El Insondable (TCE) ────────────────────────────────────────────
  {
    subclaseId: "patron_insondable",
    claseId: "brujo",
    nombre: "El Insondable",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros Expandidos",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de brujo. Nivel 3: Crear o Destruir Agua, Onda Atronadora. Nivel 5: Ráfaga de Viento, Silencio. Nivel 7: Relámpago, Ventisca. Nivel 9: Control del Agua, Invocar Elemental (solo agua). Nivel 11: Mano de Bigby (aparece como tentáculo), Cono de Frío.",
          },
          {
            nombre: "Tentáculo de las Profundidades",
            descripcion:
              "Como acción adicional, invocas un tentáculo espectral de 3 m en un punto que puedas ver a 18 m. Dura 1 minuto o hasta que crees otro. Al crearlo, puedes hacer un ataque de conjuro cuerpo a cuerpo contra una criatura a 3 m de él: 1d8 de daño de frío y reduce la velocidad del objetivo en 3 m hasta el inicio de tu siguiente turno. El daño aumenta a 2d8 a nivel 10.\n\nComo acción adicional en tu turno, puedes mover el tentáculo 9 m y repetir el ataque.\n\nUsos iguales a tu bonificador de competencia por descanso largo.",
          },
          {
            nombre: "Don del Mar",
            descripcion:
              "Ganas velocidad de nado de 12 m y puedes respirar bajo el agua.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Alma Oceánica",
            descripcion:
              "Ganas resistencia al daño de frío. Cuando estás completamente sumergido, cualquier criatura también sumergida puede entender tu habla y tú la suya.",
          },
          {
            nombre: "Custodia de las Profundidades",
            descripcion:
              "Tu Tentáculo de las Profundidades puede defenderte a ti y a otros. Cuando tú o una criatura que puedas ver recibáis daño estando a 3 m del tentáculo, puedes usar tu reacción para reducir el daño a esa criatura en 1d8. El daño reducido aumenta a 2d8 a nivel 10.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Tentáculos Agarradores",
            descripcion:
              "Aprendes Tentáculos Negros de Evard. Cuenta como conjuro de brujo pero no cuenta contra tu límite de conjuros. Puedes lanzarlo una vez sin espacio de conjuro; recuperas el uso tras un descanso largo.\n\nSiempre que lances este conjuro, la magia de tu patrón te refuerza, otorgándote PG temporales iguales a tu nivel de brujo. Además, el daño no puede romper tu concentración en este conjuro.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Inmersión Insondable",
            descripcion:
              "Como acción, puedes teletransportarte a ti mismo y hasta cinco criaturas voluntarias que puedas ver a 9 m. En un remolino de tentáculos, todos desaparecéis y reaparecéis hasta a 1,5 km en un cuerpo de agua que hayas visto (tamaño estanque o mayor) o a 9 m de él, cada uno en un espacio desocupado a 9 m de los demás.\n\nUna vez por descanso corto o largo.",
          },
        ],
      },
    ],
  },

  // ── El Genio (TCE) ─────────────────────────────────────────────────
  {
    subclaseId: "patron_genio",
    claseId: "brujo",
    nombre: "El Genio",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Tipo de Genio",
            descripcion:
              "Elige el tipo de genio que es tu patrón. Esto determina conjuros extra, tipo de daño y resistencia elemental.",
            elecciones: [
              {
                id: "tipo_genio",
                nombre: "Tipo de Genio",
                instruccion: "Elige el tipo de genio que es tu patrón:",
                tipo: "single",
                opciones: [
                  {
                    id: "dao",
                    nombre: "Dao",
                    descripcion:
                      "Tierra. Daño contundente. Conjuros: Detectar Bien y Mal, Santuario; Fuerza Fantasmal, Picos de Piedra; Crear Comida y Agua, Fundirse con la Piedra; Asesino Fantasmal, Moldear Piedra; Creación, Muro de Piedra. Nv9: Deseo.",
                  },
                  {
                    id: "djinni",
                    nombre: "Djinni",
                    descripcion:
                      "Aire. Daño de trueno. Conjuros: Detectar Bien y Mal, Onda Atronadora; Fuerza Fantasmal, Ráfaga de Viento; Crear Comida y Agua, Muro de Viento; Asesino Fantasmal, Invisibilidad Superior; Creación, Apariencia. Nv9: Deseo.",
                  },
                  {
                    id: "efreeti",
                    nombre: "Efreeti",
                    descripcion:
                      "Fuego. Daño de fuego. Conjuros: Detectar Bien y Mal, Manos Ardientes; Fuerza Fantasmal, Rayo Abrasador; Crear Comida y Agua, Bola de Fuego; Asesino Fantasmal, Escudo de Fuego; Creación, Columna de Llamas. Nv9: Deseo.",
                  },
                  {
                    id: "marid",
                    nombre: "Marid",
                    descripcion:
                      "Agua. Daño de frío. Conjuros: Detectar Bien y Mal, Niebla; Fuerza Fantasmal, Difuminar; Crear Comida y Agua, Ventisca; Asesino Fantasmal, Control del Agua; Creación, Cono de Frío. Nv9: Deseo.",
                  },
                ],
              },
            ],
          },
          {
            nombre: "Recipiente del Genio",
            descripcion:
              "Tu patrón te regala un recipiente mágico (lámpara, anillo, botella, etc.). Puedes usarlo como foco de conjuros de brujo.\n\n• Reposo Embotellado: Como acción, desapareces mágicamente dentro del recipiente (cilindro extradimensional de 6 m de radio). Puedes permanecer dentro un número de horas = 2 × bon. competencia. Sales como acción adicional. Si el recipiente es destruido, sales y los objetos aparecen cerca. Una vez por descanso largo.\n\n• Ira del Genio: Una vez por turno, cuando impactes con un ataque, infliges daño extra del tipo de tu genio igual a tu bonificador de competencia.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Don Elemental",
            descripcion:
              "Empiezas a adquirir características de tu genio. Ganas resistencia a un tipo de daño determinado por tu genio: contundente (Dao), trueno (Djinni), fuego (Efreeti) o frío (Marid).\n\nAdemás, como acción adicional, puedes darte una velocidad de vuelo de 9 m durante 10 minutos (puedes flotar). Usos iguales a tu bonificador de competencia por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Recipiente Santuario",
            descripcion:
              "Cuando entras en tu Recipiente del Genio mediante Reposo Embotellado, puedes elegir hasta cinco criaturas voluntarias a 9 m para que entren contigo.\n\nComo acción adicional, puedes expulsar a cualquier número de criaturas. Todos son expulsados si sales, mueres o el recipiente es destruido.\n\nAdemás, cualquiera que permanezca al menos 10 minutos dentro gana el beneficio de un descanso corto, y puede sumar tu bonificador de competencia a los PG recuperados con Dados de Golpe.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Deseo Limitado",
            descripcion:
              "Como acción, puedes hablar a tu Recipiente del Genio pidiendo el efecto de un conjuro de nivel 6 o inferior con tiempo de lanzamiento de 1 acción. El conjuro puede ser de cualquier lista de clase; no necesitas cumplir requisitos ni componentes costosos.\n\nUna vez cada 1d4 descansos largos.",
          },
        ],
      },
    ],
  },

  // ── El Hexblade (XGE) ──────────────────────────────────────────────
  {
    subclaseId: "patron_hexblade",
    claseId: "brujo",
    nombre: "El Hexblade",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros Expandidos del Hexblade",
            descripcion:
              "Siempre tienes preparados ciertos conjuros según tu nivel de brujo. Nivel 3: Escudo, Castigo Colérico. Nivel 5: Difuminar, Castigo Marcador. Nivel 7: Parpadeo, Arma Elemental. Nivel 9: Asesino Fantasmal, Castigo Aturdidor. Nivel 11: Castigo Desterrador, Cono de Frío.",
          },
          {
            nombre: "Maldición del Hexblade",
            descripcion:
              "Como acción adicional, maldices a una criatura que puedas ver a 9 m durante 1 minuto. La maldición termina si el objetivo muere, tú mueres o quedas incapacitado. Mientras dure:\n\n• Ganas bonificación al daño contra el objetivo igual a tu bonificador de competencia.\n• Tus tiradas de ataque contra el objetivo son críticos en 19-20.\n• Si el objetivo muere, recuperas PG iguales a tu nivel de brujo + tu mod. CAR (mín. 1).\n\nUna vez por descanso corto o largo.",
          },
          {
            nombre: "Guerrero Hexblade",
            descripcion:
              "Ganas competencia con armaduras medias, escudos y armas marciales.\n\nAdemás, al terminar un descanso largo puedes tocar un arma sin la propiedad bípede con la que seas competente: puedes usar tu mod. CAR en vez de FUE o DES para tiradas de ataque y daño con ella. Este beneficio dura hasta tu siguiente descanso largo. Si obtienes Pacto del Filo, se extiende a toda arma de pacto.",
          },
        ],
        competenciasGanadas: {
          armaduras: ["Armaduras medias", "Escudos"],
          armas: ["Armas marciales"],
        },
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Espectro Maldito",
            descripcion:
              "Puedes maldecir el alma de una persona que mates, vinculando temporalmente su espíritu a tu servicio. Cuando mates a un humanoide, puedes hacer que su espíritu se alce como un espectro. Al aparecer, el espectro gana PG temporales iguales a la mitad de tu nivel de brujo. Tira iniciativa para el espectro, que tiene sus propios turnos, obedece tus órdenes verbales, y gana un bonus a ataques igual a tu mod. CAR (mín. +0).\n\nEl espectro permanece hasta el final de tu siguiente descanso largo. Una vez por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Armadura de Hechizos",
            descripcion:
              "Si el objetivo maldecido por tu Maldición del Hexblade te impacta con una tirada de ataque, puedes usar tu reacción para tirar un d6. Con un 4 o más, el ataque falla, sin importar la tirada.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Maestro de los Hechizos",
            descripcion:
              "Puedes extender tu Maldición del Hexblade de una criatura muerta a otra. Cuando la criatura maldecida por tu Maldición del Hexblade muere, puedes aplicar la maldición a otra criatura que puedas ver a 9 m, siempre que no estés incapacitado. Al hacerlo, no recuperas PG por la muerte del anterior maldecido.",
          },
        ],
      },
    ],
  },
];
