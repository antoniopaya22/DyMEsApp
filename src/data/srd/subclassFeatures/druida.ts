/**
 * Rasgos de subclase: Druida
 * PHB'24 (Tierra, Luna, Mar, Estrellas) + XGE (Sueños, Pastor) + TCE (Esporas, Llama)
 */

import type { SubclassFeatureData } from "./types";

export const DRUIDA_SUBCLASS_FEATURES: SubclassFeatureData[] = [
  // ── Círculo de la Tierra (PHB'24 p84) ──────────────────────────────
  {
    subclaseId: "circulo_tierra",
    claseId: "druida",
    nombre: "Círculo de la Tierra",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Círculo de la Tierra",
            descripcion:
              "Al terminar un descanso largo, elige un tipo de tierra: árida, polar, templada o tropical. Tienes preparados los conjuros listados para tu nivel de druida o inferior.\n\nÁrida: Borrosidad, Manos Ardientes, Descarga de Fuego (nv3); Bola de Fuego (nv5); Plaga (nv7); Muro de Piedra (nv9).\nPolar: Nube de Niebla, Inmovilizar Persona, Rayo de Escarcha (nv3); Cellisca (nv5); Tormenta de Hielo (nv7); Cono de Frío (nv9).\nTemplada: Paso Brumoso, Descarga Eléctrica, Sueño (nv3); Relámpago (nv5); Libertad de Movimiento (nv7); Paso entre Árboles (nv9).\nTropical: Salpicadura Ácida, Rayo de Enfermedad, Telaraña (nv3); Nube Apestosa (nv5); Polimorfar (nv7); Plaga de Insectos (nv9).",
          },
          {
            nombre: "Auxilio de la Tierra",
            descripcion:
              "Como acción mágica, gastas un uso de Forma Salvaje y eliges un punto a 18 m. En una esfera de 3 m de radio, cada criatura que elijas hace una salvación de CON contra tu CD de conjuros: 2d6 de daño necrótico en fallo (mitad en éxito). Una criatura que elijas en el área recupera 2d6 PG. El daño y curación aumentan a 3d6 al nv10 y 4d6 al nv14.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Recuperación Natural",
            descripcion:
              "Puedes lanzar uno de los conjuros de nv1+ de tus Conjuros del Círculo sin gastar espacio, una vez por descanso largo. Además, al terminar un descanso corto puedes recuperar espacios de conjuro cuya suma de niveles sea ≤ la mitad de tu nivel de druida (redondeado arriba), sin espacios de nv6+. Una vez por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Protección de la Naturaleza",
            descripcion:
              "Eres inmune a la condición de Envenenado y tienes resistencia a un tipo de daño según tu tierra actual: Árida → Fuego, Polar → Frío, Templada → Rayo, Tropical → Veneno.",
            efectos: [
              {
                kind: "damageModifier",
                damageType: "veneno",
                modifier: "immunity",
              },
            ],
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Santuario de la Naturaleza",
            descripcion:
              "Como acción mágica, gastas un uso de Forma Salvaje para hacer aparecer árboles y enredaderas espectrales en un cubo de 4,5 m sobre el suelo a 36 m de ti. Duran 1 minuto. Tú y tus aliados tenéis media cobertura en el área, y tus aliados obtienen la resistencia actual de tu Protección de la Naturaleza. Como acción adicional puedes mover el cubo hasta 18 m.",
          },
        ],
      },
    ],
  },

  // ── Círculo de la Luna (PHB'24 p86) ────────────────────────────────
  {
    subclaseId: "circulo_luna",
    claseId: "druida",
    nombre: "Círculo de la Luna",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Círculo de la Luna",
            descripcion:
              "Siempre tienes preparados: Curar Heridas, Rayo de Luna, Chispa Estelar (nv3); Conjurar Animales (nv5); Fuente de Luz Lunar (nv7); Curación en Masa (nv9). Puedes lanzar estos conjuros en Forma Salvaje.",
          },
          {
            nombre: "Formas del Círculo",
            descripcion:
              "Tu Forma Salvaje mejora. CD máx. = tu nivel de druida ÷ 3 (redondeado abajo). Tu CA en forma salvaje es 13 + mod. SAB si es mayor que la CA de la bestia. Ganas PG temporales = 3 × tu nivel de druida (en lugar del normal).",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Formas del Círculo Mejoradas",
            descripcion:
              "Radiancia Lunar: cada ataque en Forma Salvaje puede infligir su daño normal o daño radiante (eliges cada vez que impactas). Resistencia Aumentada: puedes sumar tu mod. SAB a tus salvaciones de CON.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Paso de Luz Lunar",
            descripcion:
              "Como acción adicional, te teletransportas hasta 9 m a un espacio desocupado que puedas ver, y tienes ventaja en la siguiente tirada de ataque antes del final de tu turno. Usos = mod. SAB (mín. 1) por descanso largo. También puedes gastar un espacio de nv2+ para recuperar un uso.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Forma Lunar",
            descripcion:
              "Radiancia Lunar Mejorada: una vez por turno, infliges 2d10 de daño radiante extra con un ataque en Forma Salvaje. Luz de Luna Compartida: cuando usas Paso de Luz Lunar, puedes teletransportar a una criatura voluntaria a 3 m de ti a un espacio desocupado a 3 m de tu destino.",
          },
        ],
      },
    ],
  },

  // ── Círculo del Mar (PHB'24 p87) ───────────────────────────────────
  {
    subclaseId: "circulo_mar",
    claseId: "druida",
    nombre: "Círculo del Mar",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Círculo del Mar",
            descripcion:
              "Siempre tienes preparados: Nube de Niebla, Ráfaga de Viento, Rayo de Escarcha, Despedazar, Onda Atronadora (nv3); Relámpago, Respirar bajo el Agua (nv5); Control del Agua, Tormenta de Hielo (nv7); Conjurar Elemental, Inmovilizar Monstruo (nv9).",
          },
          {
            nombre: "Ira del Mar",
            descripcion:
              "Como acción adicional, gastas un uso de Forma Salvaje para manifestar una emanación de 1,5 m de rocío oceánico que te rodea durante 10 minutos. Al manifestarla y como acción adicional en turnos posteriores, elige una criatura en la emanación: debe superar una salvación de CON contra tu CD o recibir daño de Frío (d6 × tu mod. SAB, mín. 1d6) y ser empujada hasta 4,5 m si es Grande o menor.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Afinidad Acuática",
            descripcion:
              "La emanación de Ira del Mar aumenta a 3 m. Además, obtienes velocidad de nado igual a tu velocidad.",
            efectos: [{ kind: "speedBonus", swim: "walk" }],
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Hijo de la Tormenta",
            descripcion:
              "Mientras tu Ira del Mar esté activa: obtienes velocidad de vuelo igual a tu velocidad, y tienes resistencia al daño de Frío, Rayo y Trueno.",
            efectos: [
              {
                kind: "speedBonus",
                fly: "walk",
                condition: "durante Ira del Mar",
              },
              {
                kind: "damageModifier",
                damageType: "frio",
                modifier: "resistance",
              },
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
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Don Oceánico",
            descripcion:
              "Puedes manifestar la emanación de Ira del Mar alrededor de una criatura voluntaria a 18 m en lugar de ti misma; esa criatura obtiene todos los beneficios y usa tu CD y mod. SAB. Si gastas dos usos de Forma Salvaje, puedes manifestarla alrededor de ambos (la criatura y tú).",
          },
        ],
      },
    ],
  },

  // ── Círculo de las Estrellas (PHB'24 p88) ──────────────────────────
  {
    subclaseId: "circulo_estrellas",
    claseId: "druida",
    nombre: "Círculo de las Estrellas",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Mapa Estelar",
            descripcion:
              "Has creado un mapa estelar (objeto Diminuto, foco druídico). Mientras lo sostienes, tienes preparados Guía y Rayo Orientador, y puedes lanzar Rayo Orientador sin gastar espacio un número de veces = mod. SAB (mín. 1) por descanso largo. Si pierdes el mapa, puedes recrearlo en 1 hora (durante un descanso).",
          },
          {
            nombre: "Forma Estelar",
            descripcion:
              "Como acción adicional, gastas un uso de Forma Salvaje para adoptar una forma estelar (10 min, luz brillante 3 m + tenue 3 m). Elige constelación:\n\nArquero: al activar y como acción adicional, haz un ataque de conjuro a distancia (18 m): 1d8 + mod. SAB de daño radiante.\nCáliz: cuando lanzas un conjuro con espacio que restaure PG, tú u otra criatura a 9 m recupera 1d8 + mod. SAB PG.\nDragón: en pruebas de INT o SAB y salvaciones de CON para concentración, tratas un resultado de 9 o menos en el d20 como 10.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Augurio Cósmico",
            descripcion:
              "Al terminar un descanso largo, tira un dado. Según el resultado (par o impar), obtienes una reacción especial hasta tu próximo descanso largo:\n\nBienestar (par): cuando una criatura a 9 m vaya a hacer una prueba con d20, puedes usar tu reacción para tirar 1d6 y sumarlo.\nDesgracia (impar): lo mismo pero restando 1d6.\n\nUsos = mod. SAB (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Constelaciones Centelleantes",
            descripcion:
              "Tus constelaciones mejoran: el 1d8 de Arquero y Cáliz se convierte en 2d8. Mientras Dragón esté activo, tienes velocidad de vuelo de 6 m y puedes levitar. Además, al inicio de cada turno en Forma Estelar puedes cambiar de constelación.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Lleno de Estrellas",
            descripcion:
              "Mientras estés en Forma Estelar, te vuelves parcialmente incorpóreo: tienes resistencia al daño contundente, perforante y cortante.",
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

  // ── Círculo de los Sueños (XGE p22) ───────────────────────────────
  {
    subclaseId: "circulo_suenos",
    claseId: "druida",
    nombre: "Círculo de los Sueños",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Bálsamo del Círculo Veraniego",
            descripcion:
              "Tienes una reserva de energía feérica representada por d6 × tu nivel de druida. Como acción adicional, elige una criatura que puedas ver a 36 m y gasta dados (máx. la mitad de tu nivel de druida). Tira los dados gastados: el objetivo recupera PG iguales al total y gana 1 PG temporal por dado. Recuperas todos los dados tras un descanso largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Hogar de Sombras del Claro de Luna",
            descripcion:
              "Durante un descanso corto o largo, tocas un punto y aparece una esfera mágica invisible de 9 m. Mientras estéis dentro, tú y tus aliados tenéis +5 a pruebas de DES (Sigilo) y SAB (Percepción). Las llamas abiertas en la esfera no son visibles desde fuera. Desaparece al final del descanso o al salir tú de ella.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Pasajes Ocultos",
            descripcion:
              "Como acción adicional, te teletransportas hasta 18 m a un espacio desocupado que puedas ver. Alternativamente, como acción, teletransportas a una criatura voluntaria que toques hasta 9 m. Usos = mod. SAB (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Caminante entre Sueños",
            descripcion:
              "Al terminar un descanso corto, puedes lanzar uno de estos conjuros sin gastar espacio ni componentes materiales: Ensueño (tú como mensajero), Escudriñar, o Círculo de Teletransporte (abre un portal al último lugar donde completaste un descanso largo en tu plano actual). Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Círculo del Pastor (XGE p23) ───────────────────────────────────
  {
    subclaseId: "circulo_pastor",
    claseId: "druida",
    nombre: "Círculo del Pastor",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Habla del Bosque",
            descripcion:
              "Aprendes a hablar, leer y escribir Silvano. Las bestias pueden entender tu habla y puedes descifrar sus ruidos y movimientos.",
          },
          {
            nombre: "Tótem Espiritual",
            descripcion:
              "Como acción adicional, invocas un espíritu incorpóreo en un punto a 18 m. Crea un aura de 9 m y dura 1 minuto. Como acción adicional puedes moverlo 18 m. Elige tipo:\n\nOso: cada criatura que elijas en el aura gana PG temporales = 5 + tu nivel de druida. Aliados tienen ventaja en pruebas y salvaciones de FUE.\nHalcón: puedes usar tu reacción para dar ventaja a una tirada de ataque contra un objetivo en el aura. Aliados tienen ventaja en SAB (Percepción).\nUnicornio: aliados tienen ventaja en pruebas para detectar criaturas en el aura. Al lanzar curación con espacio, cada criatura que elijas en el aura recupera PG = tu nivel de druida.\n\nUna vez por descanso corto o largo.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Invocador Poderoso",
            descripcion:
              "Las bestias y feéricos invocados o creados por tus conjuros ganan: 2 PG extra por dado de golpe, y el daño de sus armas naturales cuenta como mágico.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Espíritu Guardián",
            descripcion:
              "Tu Tótem Espiritual protege a tus invocaciones. Cuando una bestia o feérico invocado/creado por tus conjuros termina su turno en el aura del tótem, recupera PG = la mitad de tu nivel de druida.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Invocación Fiel",
            descripcion:
              "Si eres reducido a 0 PG o quedas incapacitado contra tu voluntad, obtienes inmediatamente los beneficios de Conjurar Animales como si fuera de nv9. Invoca cuatro bestias de CD 2 o menor a 6 m de ti. Si no reciben órdenes, te protegen y atacan a tus enemigos. 1 hora, sin concentración. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },

  // ── Círculo de las Esporas (TCE p36) ───────────────────────────────
  {
    subclaseId: "circulo_esporas",
    claseId: "druida",
    nombre: "Círculo de las Esporas",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Círculo de las Esporas",
            descripcion:
              "Aprendes el truco Toque Gélido. Siempre tienes preparados: Ceguera/Sordera, Reposo Apacible (nv3); Animar Muertos, Forma Gaseosa (nv5); Plaga, Confusión (nv7); Nube Letal, Contagio (nv9).",
          },
          {
            nombre: "Halo de Esporas",
            descripcion:
              "Cuando una criatura que puedas ver se mueve a un espacio a 3 m de ti o comienza su turno ahí, puedes usar tu reacción para infligir 1d4 de daño necrótico (salvación de CON). Aumenta a 1d6 (nv6), 1d8 (nv10), 1d10 (nv14).",
          },
          {
            nombre: "Entidad Simbiótica",
            descripcion:
              "Como acción, gastas un uso de Forma Salvaje para despertar tus esporas. Ganas 4 PG temporales por nivel de druida. Mientras los tengas: tu Halo de Esporas tira el dado de daño dos veces, y tus ataques cuerpo a cuerpo infligen 1d6 de daño necrótico extra. Dura 10 minutos o hasta perder los PG temporales.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Infestación Fúngica",
            descripcion:
              "Si una bestia o humanoide Pequeño o Mediano muere a 3 m de ti, puedes usar tu reacción para animarlo: se levanta con 1 PG usando el bloque de zombie. Dura 1 hora. Obedece tus órdenes mentales y solo puede usar la acción de Ataque. Usos = mod. SAB (mín. 1) por descanso largo.",
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Propagación de Esporas",
            descripcion:
              "Como acción adicional mientras Entidad Simbiótica esté activa, lanzas esporas hasta 9 m creando un cubo de 3 m que dura 1 minuto. Las criaturas que entren o empiecen su turno ahí reciben tu daño de Halo de Esporas (salvación de CON). Máx. una vez por turno por criatura. No puedes usar tu reacción de Halo mientras el cubo persista.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Cuerpo Fúngico",
            descripcion:
              "No puedes ser cegado, ensordecido, asustado ni envenenado. Cualquier golpe crítico contra ti cuenta como golpe normal, a menos que estés incapacitado.",
          },
        ],
      },
    ],
  },

  // ── Círculo de la Llama (TCE p39) ──────────────────────────────────
  {
    subclaseId: "circulo_llama",
    claseId: "druida",
    nombre: "Círculo de la Llama",
    niveles: [
      {
        nivel: 3,
        rasgos: [
          {
            nombre: "Conjuros del Círculo de la Llama",
            descripcion:
              "Siempre tienes preparados: Manos Ardientes, Curar Heridas (nv2); Esfera Ardiente, Rayo Abrasador (nv3); Crecimiento Vegetal, Revivificar (nv5); Aura de Vida, Escudo de Fuego (nv7); Columna de Fuego, Curación en Masa (nv9).",
          },
          {
            nombre: "Invocar Espíritu de Llama",
            descripcion:
              "Como acción, gastas un uso de Forma Salvaje para invocar tu espíritu de llama en un espacio desocupado a 9 m. Cada criatura a 3 m (salvo tú) hace salvación de DES o recibe 2d6 de daño de fuego. Es amistoso y obedece tus órdenes; en combate actúa justo después de ti. Solo hace Esquivar a menos que uses tu acción adicional para ordenarle otra cosa. Dura 1 hora o hasta caer a 0 PG.",
          },
        ],
      },
      {
        nivel: 6,
        rasgos: [
          {
            nombre: "Vínculo Mejorado",
            descripcion:
              'Cuando lanzas un conjuro que inflige daño de fuego o restaura PG mientras tu espíritu de llama está invocado, tira 1d8 y suma el resultado a una tirada de daño o curación del conjuro. Además, los conjuros con alcance distinto de "personal" pueden originarse desde ti o desde el espíritu.',
          },
        ],
      },
      {
        nivel: 10,
        rasgos: [
          {
            nombre: "Llamas Cauterizantes",
            descripcion:
              "Cuando una criatura Pequeña o mayor muere a 9 m de ti o de tu espíritu, aparece una llama espectral en su espacio durante 1 minuto. Cuando una criatura entra en ese espacio, puedes usar tu reacción para extinguir la llama y curarla o infligirle daño de fuego = 2d10 + mod. SAB. Usos = bonificador de competencia por descanso largo.",
          },
        ],
      },
      {
        nivel: 14,
        rasgos: [
          {
            nombre: "Resurgir Ardiente",
            descripcion:
              "Si tu espíritu de llama está a 36 m cuando caes a 0 PG y quedas inconsciente, puedes hacer que el espíritu caiga a 0 PG. Entonces recuperas la mitad de tus PG máximos y te pones de pie inmediatamente. Una vez por descanso largo.",
          },
        ],
      },
    ],
  },
];
