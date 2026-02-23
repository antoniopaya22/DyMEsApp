/**
 * Datos de progresión de nivel para D&D 5e SRD en español.
 * Incluye: tabla de XP, niveles de ASI por clase, rasgos por nivel,
 * y utilidades para calcular el nivel a partir de la experiencia.
 */

import type { ClassId } from "@/types/character";
import {
  CLASS_CASTER_TYPE,
  CANTRIPS_KNOWN,
  SPELLS_KNOWN,
  CLASS_SPELL_PREPARATION,
  FULL_CASTER_SLOTS,
  HALF_CASTER_SLOTS,
  WARLOCK_PACT_SLOTS,
} from "@/types/spell";

// ─── Tabla de XP por nivel (D&D 5e SRD) ─────────────────────────────

/**
 * XP mínima requerida para alcanzar cada nivel.
 * Índice = nivel (1-20).
 */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

/** Nivel máximo permitido */
export const MAX_LEVEL = 20;

/** XP máxima rastreable (nivel 20) */
export const MAX_XP = 355000;

// ─── Niveles de Mejora de Puntuación de Característica (ASI) ─────────

/**
 * Niveles en los que cada clase obtiene ASI (Ability Score Improvement).
 * La mayoría usa [4, 8, 12, 16, 19]. Guerrero y Pícaro tienen extra.
 */
export const ASI_LEVELS: Record<ClassId, number[]> = {
  barbaro: [4, 8, 12, 16],
  bardo: [4, 8, 12, 16, 19],
  brujo: [4, 8, 12, 16, 19],
  clerigo: [4, 8, 12, 16],
  druida: [4, 8, 12, 16],
  explorador: [4, 8, 12, 16, 19],
  guerrero: [4, 6, 8, 12, 14, 16],
  hechicero: [4, 8, 12, 16],
  mago: [4, 8, 12, 16, 19],
  monje: [4, 8, 12, 16, 19],
  paladin: [4, 8, 12, 16, 19],
  picaro: [4, 8, 10, 12, 16],
};

/** Puntos máximos de una puntuación de característica */
export const MAX_ABILITY_SCORE = 20;

/** Puntos a repartir en un ASI estándar */
export const ASI_POINTS = 2;

// ─── Rasgos de clase por nivel ───────────────────────────────────────

export interface LevelFeature {
  nombre: string;
  descripcion: string;
  nivel: number;
  /** Si es un rasgo de subclase (requiere tener subclase elegida) */
  esSubclase?: boolean;
}

/**
 * Rasgos de clase obtenidos por nivel para cada clase (SRD simplificado).
 * Solo incluye los nombres y descripciones generales; los rasgos de subclase
 * se marcan con `esSubclase: true`.
 */
export const CLASS_LEVEL_FEATURES: Record<ClassId, LevelFeature[]> = {
  // ─── BÁRBARO ───────────────────────────────────────────────────────
  barbaro: [
    { nombre: "Furia", descripcion: "Puedes enfurecerte como acción adicional. Ganas bonificador al daño cuerpo a cuerpo (+2), ventaja en pruebas y salvaciones de FUE, y resistencia a daño contundente, cortante y perforante. Dura 10 asaltos o hasta que la termines. 2 usos por descanso largo.", nivel: 1 },
    { nombre: "Defensa sin Armadura", descripcion: "Mientras no lleves armadura, tu CA = 10 + mod. DES + mod. CON. Puedes usar escudo y mantener este beneficio.", nivel: 1 },
    { nombre: "Maestría con Armas", descripcion: "Ganas la propiedad de Maestría de dos armas con las que tengas competencia. Puedes cambiar una cada descanso largo.", nivel: 1 },
    { nombre: "Sentido del Peligro", descripcion: "Ventaja en salvaciones de DES contra efectos que puedas ver, siempre que no estés incapacitado.", nivel: 2 },
    { nombre: "Ataque Temerario", descripcion: "Al realizar tu primer ataque cuerpo a cuerpo del turno, puedes atacar con ventaja. Si lo haces, los ataques contra ti tienen ventaja hasta el inicio de tu siguiente turno.", nivel: 2 },
    { nombre: "Senda Primordial", descripcion: "Elige tu Senda Primordial (subclase).", nivel: 3, esSubclase: true },
    { nombre: "Conocimiento Primordial", descripcion: "Ganas competencia en una habilidad de tu elección: Atletismo, Intimidación, Naturaleza, Percepción, Supervivencia o Trato con Animales. Puedes cambiar esta elección cada vez que subas de nivel.", nivel: 3 },
    { nombre: "Furia: 3 usos", descripcion: "Tus usos de Furia aumentan a 3.", nivel: 3 },
    { nombre: "Ataque Extra", descripcion: "Puedes atacar dos veces en tu turno al usar la acción de Atacar.", nivel: 5 },
    { nombre: "Movimiento Rápido", descripcion: "Tu velocidad aumenta en 3 m (10 pies) mientras no lleves armadura pesada.", nivel: 5 },
    { nombre: "Rasgo de Senda", descripcion: "Obtienes un rasgo de tu Senda Primordial.", nivel: 6, esSubclase: true },
    { nombre: "Furia: 4 usos", descripcion: "Tus usos de Furia aumentan a 4.", nivel: 6 },
    { nombre: "Instinto Salvaje", descripcion: "Ventaja en tiradas de iniciativa. Si estás sorprendido al inicio del combate pero no incapacitado, puedes actuar normalmente si enfureces primero (consume un uso de Furia).", nivel: 7 },
    { nombre: "Abalanzarse Instintivamente", descripcion: "Al entrar en furia, puedes moverte hasta la mitad de tu velocidad sin gastar movimiento ni provocar ataques de oportunidad.", nivel: 7 },
    { nombre: "Golpe Brutal", descripcion: "Al impactar con un ataque de arma cuerpo a cuerpo usando Ataque Temerario, puedes renunciar a la ventaja para infligir 1d10 de daño extra y aplicar uno de los efectos de Golpe Brutal: Golpe Forzoso (empujar 4,5 m) o Golpe Deslizante (reducir velocidad a 0 hasta tu siguiente turno).", nivel: 9 },
    { nombre: "Furia: daño +3", descripcion: "Tu bonificador de daño de Furia aumenta a +3.", nivel: 9 },
    { nombre: "Rasgo de Senda", descripcion: "Obtienes un rasgo de tu Senda Primordial.", nivel: 10, esSubclase: true },
    { nombre: "Furia Incansable", descripcion: "Si caes a 0 PG mientras estés en furia, puedes hacer una salvación de CON CD 10 (aumenta +5 cada vez que usas esto entre descansos largos). Si la superas, caes a 1 PG en su lugar.", nivel: 11 },
    { nombre: "Furia: 5 usos", descripcion: "Tus usos de Furia aumentan a 5.", nivel: 12 },
    { nombre: "Golpe Brutal Mejorado", descripcion: "Obtienes dos efectos adicionales de Golpe Brutal: Golpe Aturdidor (desventaja en su siguiente tirada de ataque) y Golpe Ruptor (siguiente ataque contra esa criatura tiene ventaja y +1d10 extra).", nivel: 13 },
    { nombre: "Rasgo de Senda", descripcion: "Obtienes un rasgo de tu Senda Primordial.", nivel: 14, esSubclase: true },
    { nombre: "Furia Persistente", descripcion: "Tu Furia ya no termina prematuramente. Solo se acaba si caes inconsciente o la finalizas voluntariamente. Cuando tires iniciativa, si te quedan menos de 1 uso recuperas 1 uso de Furia.", nivel: 15 },
    { nombre: "Furia: daño +4", descripcion: "Tu bonificador de daño de Furia aumenta a +4.", nivel: 16 },
    { nombre: "Golpe Brutal Superior", descripcion: "El daño extra de Golpe Brutal aumenta a 2d10. Además, puedes aplicar dos efectos de Golpe Brutal a la vez (en lugar de uno).", nivel: 17 },
    { nombre: "Furia: 6 usos", descripcion: "Tus usos de Furia aumentan a 6.", nivel: 17 },
    { nombre: "Poder Indomable", descripcion: "Si tu puntuación de FUE o CON es menor que tu máximo, se convierte en su máximo. Tu máximo para FUE y CON es ahora 25.", nivel: 18 },
    { nombre: "Don Épico", descripcion: "Obtienes un Don Épico (ver dotes épicas).", nivel: 19 },
    { nombre: "Campeón Primordial", descripcion: "Encarnas el poder primordial. Tu FUE y CON aumentan en 4 y su máximo pasa a 25. Tus usos de Furia son ilimitados.", nivel: 20 },
  ],

  // ─── BARDO ─────────────────────────────────────────────────────────
  bardo: [
    { nombre: "Lanzamiento de Conjuros", descripcion: "Puedes lanzar conjuros de bardo usando CAR como aptitud mágica.", nivel: 1 },
    { nombre: "Inspiración Bárdica (d6)", descripcion: "Puedes inspirar a otros con tu música. Como acción bonus, un aliado a 18 m que pueda oírte gana un dado d6 para sumar a una tirada de ataque, característica o salvación. Usos = mod. CAR (mín. 1) por descanso largo.", nivel: 1 },
    { nombre: "Aprendiz de Todo", descripcion: "Suma la mitad de tu bonificador de competencia (redondeado abajo) a cualquier prueba de característica en la que no tengas competencia.", nivel: 2 },
    { nombre: "Pericia", descripcion: "Elige dos habilidades en las que tengas competencia. Tu bonificador se duplica para ellas (Pericia).", nivel: 2 },
    { nombre: "Colegio de Bardo", descripcion: "Elige tu Colegio de Bardo (subclase).", nivel: 3, esSubclase: true },
    { nombre: "Fuente de Inspiración", descripcion: "Tu Inspiración Bárdica se recupera en descansos cortos o largos. Además, puedes gastar un espacio de conjuro para recuperar un uso de Inspiración Bárdica (sin acción).", nivel: 5 },
    { nombre: "Inspiración Bárdica (d8)", descripcion: "El dado de Inspiración Bárdica sube a d8.", nivel: 5 },
    { nombre: "Rasgo de Colegio", descripcion: "Obtienes un rasgo de tu Colegio de Bardo.", nivel: 6, esSubclase: true },
    { nombre: "Contraencanto", descripcion: "Cuando tú o un aliado a 9 m o menos falláis una salvación contra estar Hechizado o Asustado, puedes usar tu reacción para repetir la tirada con ventaja.", nivel: 7 },
    { nombre: "Pericia (2 más)", descripcion: "Elige dos habilidades más para obtener Pericia.", nivel: 9 },
    { nombre: "Secretos Mágicos", descripcion: "Cuando prepares conjuros de bardo, puedes incluir también conjuros de las listas de Clérigo, Druida y Mago. Deben respetar los espacios de conjuro que puedas usar.", nivel: 10 },
    { nombre: "Inspiración Bárdica (d10)", descripcion: "El dado de Inspiración Bárdica sube a d10.", nivel: 10 },
    { nombre: "Rasgo de Colegio", descripcion: "Obtienes un rasgo de tu Colegio de Bardo.", nivel: 14, esSubclase: true },
    { nombre: "Inspiración Bárdica (d12)", descripcion: "El dado de Inspiración Bárdica sube a d12.", nivel: 15 },
    { nombre: "Inspiración Superior", descripcion: "Cuando tires iniciativa y te queden menos de 2 usos de Inspiración Bárdica, recuperas hasta tener 2 usos.", nivel: 18 },
    { nombre: "Palabras de la Creación", descripcion: "Siempre tienes preparados Palabra de Poder Curar y Palabra de Poder Matar. Cuando lances cualquiera de ellos, puedes elegir una segunda criatura a 3 m o menos del objetivo para que sufra el mismo efecto.", nivel: 20 },
  ],

  // ─── BRUJO ─────────────────────────────────────────────────────────
  brujo: [
    { nombre: "Invocaciones Sobrenaturales", descripcion: "Obtienes 1 Invocación Sobrenatural a tu elección (como Pacto del Tomo). Ganas más según tu nivel: 3 al nv2, 5 al nv5, 6 al nv7, 7 al nv9, 8 al nv12. Puedes reemplazar una al subir de nivel.", nivel: 1 },
    { nombre: "Magia de Pacto", descripcion: "Conoces 2 trucos y preparas 2 conjuros de nivel 1 de brujo. Tus espacios de Magia de Pacto se recuperan tras un descanso corto o largo. CAR es tu aptitud mágica.", nivel: 1 },
    { nombre: "Astucia Mágica", descripcion: "Puedes realizar un rito esotérico durante 1 minuto para recuperar espacios de Magia de Pacto gastados (hasta la mitad del máximo, redondeando arriba). Una vez por descanso largo.", nivel: 2 },
    { nombre: "Subclase de Brujo", descripcion: "Ganas una subclase de Brujo a tu elección.", nivel: 3, esSubclase: true },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Brujo.", nivel: 6, esSubclase: true },
    { nombre: "Contactar al Patrón", descripcion: "Siempre tienes preparado Contactar a Otro Plano. Puedes lanzarlo sin gastar espacio para contactar a tu patrón, superando automáticamente la salvación. Una vez por descanso largo.", nivel: 9 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Brujo.", nivel: 10, esSubclase: true },
    { nombre: "Arcano Místico (nv6)", descripcion: "Tu patrón te otorga un secreto mágico: elige un conjuro de brujo de nivel 6 como arcano. Puedes lanzarlo una vez sin gastar espacio; recuperas el uso tras un descanso largo. Puedes reemplazar un arcano por otro del mismo nivel al subir de nivel.", nivel: 11 },
    { nombre: "Arcano Místico (nv7)", descripcion: "Ganas un conjuro de brujo de nivel 7 como arcano (1 uso por descanso largo).", nivel: 13 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Brujo.", nivel: 14, esSubclase: true },
    { nombre: "Arcano Místico (nv8)", descripcion: "Ganas un conjuro de brujo de nivel 8 como arcano (1 uso por descanso largo).", nivel: 15 },
    { nombre: "Arcano Místico (nv9)", descripcion: "Ganas un conjuro de brujo de nivel 9 como arcano (1 uso por descanso largo).", nivel: 17 },
    { nombre: "Don Épico", descripcion: "Obtienes la dote Don Épico de tu elección. Se recomienda Don del Destino.", nivel: 19 },
    { nombre: "Maestro Sobrenatural", descripcion: "Cuando usas Astucia Mágica, recuperas todos los espacios de Magia de Pacto gastados (en lugar de hasta la mitad).", nivel: 20 },
  ],

  // ─── CLÉRIGO ───────────────────────────────────────────────────────
  clerigo: [
    { nombre: "Lanzamiento de Conjuros", descripcion: "Puedes lanzar conjuros de clérigo usando SAB como aptitud mágica. Conoces 3 trucos de clérigo. Preparas conjuros de nivel 1+ tras un descanso largo (4 al nivel 1). Recuperas todos los espacios con un descanso largo.", nivel: 1 },
    { nombre: "Orden Divino", descripcion: "Elige un rol sagrado: Protector (competencia con armas marciales y armadura pesada) o Taumaturgo (un truco de clérigo extra y bonus de mod. SAB a pruebas de Arcano o Religión).", nivel: 1 },
    { nombre: "Canalizar Divinidad (2 usos)", descripcion: "Puedes canalizar energía divina para crear efectos mágicos: Chispa Divina (acción mágica, 1d8 + mod. SAB para curar o dañar a 9 m) y Expulsar Muertos Vivientes (acción mágica, muertos vivientes a 9 m: salvación de SAB o asustados e incapacitados 1 minuto). Recuperas 1 uso en descanso corto, todos en descanso largo.", nivel: 2 },
    { nombre: "Dominio Divino", descripcion: "Elige tu Dominio Divino (subclase).", nivel: 3, esSubclase: true },
    { nombre: "Cauterizar Muertos Vivientes", descripcion: "Cuando usas Expulsar Muertos Vivientes, puedes tirar un número de d8 iguales a tu mod. SAB (mín. 1d8) y sumar los resultados. Cada muerto viviente que falle la salvación recibe daño Radiante igual al total (no termina el efecto de Expulsar).", nivel: 5 },
    { nombre: "Rasgo de Dominio", descripcion: "Obtienes un rasgo de tu Dominio Divino.", nivel: 6, esSubclase: true },
    { nombre: "Canalizar Divinidad (3 usos)", descripcion: "Puedes usar Canalizar Divinidad 3 veces entre descansos.", nivel: 6 },
    { nombre: "Golpes Benditos", descripcion: "El poder divino te infunde en combate. Elige una opción: Golpe Divino (una vez por turno, al impactar con un arma, +1d8 de daño Necrótico o Radiante) o Conjuración Potente (suma tu mod. SAB al daño de trucos de clérigo).", nivel: 7 },
    { nombre: "Chispa Divina (2d8)", descripcion: "El daño/curación de Chispa Divina aumenta a 2d8.", nivel: 7 },
    { nombre: "Intervención Divina", descripcion: "Como acción mágica, elige cualquier conjuro de clérigo de nivel 5 o inferior que no requiera reacción. Lo lanzas sin gastar espacio de conjuro ni componentes materiales. 1 uso por descanso largo.", nivel: 10 },
    { nombre: "Chispa Divina (3d8)", descripcion: "El daño/curación de Chispa Divina aumenta a 3d8.", nivel: 13 },
    { nombre: "Golpes Benditos Mejorado", descripcion: "Tu opción de Golpes Benditos mejora. Golpe Divino: el daño extra aumenta a 2d8. Conjuración Potente: al dañar con un truco de clérigo, puedes otorgar PG temporales iguales al doble de tu mod. SAB a ti o a una criatura a 18 m.", nivel: 14 },
    { nombre: "Rasgo de Dominio", descripcion: "Obtienes un rasgo de tu Dominio Divino.", nivel: 17, esSubclase: true },
    { nombre: "Canalizar Divinidad (4 usos)", descripcion: "Puedes usar Canalizar Divinidad 4 veces entre descansos.", nivel: 18 },
    { nombre: "Chispa Divina (4d8)", descripcion: "El daño/curación de Chispa Divina aumenta a 4d8.", nivel: 18 },
    { nombre: "Don Épico", descripcion: "Obtienes un Don Épico (ver dotes épicas). Se recomienda Don de la Suerte.", nivel: 19 },
    { nombre: "Intervención Divina Mayor", descripcion: "Cuando usas Intervención Divina, puedes elegir Deseo como conjuro. Si lo haces, no puedes usar Intervención Divina de nuevo hasta completar 2d4 descansos largos.", nivel: 20 },
  ],

  // ─── DRUIDA ────────────────────────────────────────────────────────
  druida: [
    { nombre: "Druídico", descripcion: "Conoces el druídico, el idioma secreto de los druidas. Siempre tienes preparado Hablar con Animales. Puedes dejar mensajes ocultos que solo otros druidas pueden detectar (CD 15 INT Investigación para detectar, pero no descifrar).", nivel: 1 },
    { nombre: "Orden Primordial", descripcion: "Elige un rol sagrado. Mago: conoces un truco de druida extra y añades tu mod. SAB (mín. +1) a pruebas de INT (Arcanos o Naturaleza). Guardián: competencia con armas marciales y entrenamiento con armaduras medias.", nivel: 1 },
    { nombre: "Lanzamiento de Conjuros", descripcion: "Puedes lanzar conjuros de druida usando SAB como aptitud mágica. Conoces 2 trucos (3 al nv4, 4 al nv10). Preparas conjuros de nv1+ según la tabla de Druida.", nivel: 1 },
    { nombre: "Compañero Salvaje", descripcion: "Como acción mágica, puedes gastar un espacio de conjuro o un uso de Forma Salvaje para lanzar Encontrar Familiar sin componentes materiales. El familiar es Feérico y desaparece al terminar un descanso largo.", nivel: 2 },
    { nombre: "Forma Salvaje", descripcion: "Como acción adicional, adoptas una forma bestial conocida durante horas = mitad de tu nivel de druida. 2 usos (3 al nv6, 4 al nv17). Ganas PG temporales = tu nivel de druida. CD máx. 1/4 inicial (1/2 al nv4, 1 al nv8). Vuelo a partir de nv8. Conservas INT, SAB, CAR, rasgos de clase, idiomas y dotes.", nivel: 2 },
    { nombre: "Círculo Druídico", descripcion: "Elige tu Círculo Druídico (subclase).", nivel: 3, esSubclase: true },
    { nombre: "Resurgimiento Salvaje", descripcion: "Una vez por turno, si no tienes usos de Forma Salvaje, puedes gastar un espacio de conjuro para recuperar un uso. También puedes gastar un uso de Forma Salvaje para obtener un espacio de nv1 (una vez por descanso largo).", nivel: 5 },
    { nombre: "Rasgo de Círculo", descripcion: "Obtienes un rasgo de tu Círculo Druídico.", nivel: 6, esSubclase: true },
    { nombre: "Furia Elemental", descripcion: "Elige una opción. Lanzamiento Potente: suma tu mod. SAB al daño de trucos de druida. Golpe Primordial: una vez por turno, al impactar con un arma o ataque bestial, infliges 1d8 extra de daño de Frío, Fuego, Rayo o Trueno.", nivel: 7 },
    { nombre: "Rasgo de Círculo", descripcion: "Obtienes un rasgo de tu Círculo Druídico.", nivel: 10, esSubclase: true },
    { nombre: "Rasgo de Círculo", descripcion: "Obtienes un rasgo de tu Círculo Druídico.", nivel: 14, esSubclase: true },
    { nombre: "Furia Elemental Mejorada", descripcion: "Mejora tu opción de Furia Elemental. Lanzamiento Potente: trucos con alcance 3 m+ aumentan su alcance en 90 m. Golpe Primordial: el daño extra aumenta a 2d8.", nivel: 15 },
    { nombre: "Conjuros Bestiales", descripcion: "Mientras usas Forma Salvaje puedes lanzar conjuros en forma bestial, excepto conjuros con componente material que tenga coste o se consuma.", nivel: 18 },
    { nombre: "Bendición Épica", descripcion: "Obtienes la dote Bendición Épica de tu elección (se recomienda Bendición de Viaje Dimensional).", nivel: 19 },
    { nombre: "Archidruida", descripcion: "Forma Salvaje Perenne: al tirar Iniciativa sin usos de Forma Salvaje, recuperas uno. Mago de la Naturaleza: puedes convertir usos de Forma Salvaje en un espacio de conjuro (cada uso = 2 niveles de espacio; una vez por descanso largo). Longevidad: por cada 10 años, envejeces solo 1.", nivel: 20 },
  ],

  // ─── EXPLORADOR ────────────────────────────────────────────────────
  explorador: [
    { nombre: "Lanzamiento de Conjuros", descripcion: "Has aprendido a canalizar la esencia mágica de la naturaleza para lanzar conjuros. SAB es tu aptitud mágica. Preparas conjuros de la lista de explorador cada descanso largo. Puedes usar un Foco Druídico.", nivel: 1 },
    { nombre: "Enemigo Predilecto", descripcion: "Siempre tienes preparado el conjuro Marca del Cazador. Puedes lanzarlo 2 veces sin gastar espacio de conjuro (3 a nivel 6, 4 a nivel 14); recuperas todos los usos tras un descanso largo.", nivel: 1 },
    { nombre: "Maestría con Armas", descripcion: "Puedes usar las propiedades de maestría de dos tipos de armas con las que tengas competencia. Puedes cambiar tus elecciones tras cada descanso largo.", nivel: 1 },
    { nombre: "Explorador Hábil", descripcion: "Gracias a tus viajes, ganas Pericia en una habilidad en la que tengas competencia (y carezcas de Pericia), y aprendes dos idiomas adicionales.", nivel: 2 },
    { nombre: "Estilo de Combate", descripcion: "Ganas una dote de Estilo de Combate a tu elección. También puedes elegir Guerrero Druídico: aprendes dos trucos de druida (cuentan como conjuros de explorador, usan SAB).", nivel: 2 },
    { nombre: "Subclase de Explorador", descripcion: "Ganas una subclase de Explorador a tu elección.", nivel: 3, esSubclase: true },
    { nombre: "Ataque Extra", descripcion: "Puedes atacar dos veces al usar la acción de Atacar.", nivel: 5 },
    { nombre: "Recorrer Tierras", descripcion: "Tu velocidad aumenta en 3 m mientras no lleves armadura pesada. También ganas velocidad de Escalar y velocidad de Nadar igual a tu velocidad.", nivel: 6 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Explorador.", nivel: 7, esSubclase: true },
    { nombre: "Pericia", descripcion: "Elige dos de tus competencias en habilidades en las que carezcas de Pericia. Ganas Pericia en ellas.", nivel: 9 },
    { nombre: "Incansable", descripcion: "Las fuerzas primordiales te alimentan. Como acción mágica, ganas PG temporales = 1d8 + mod. SAB (usos = mod. SAB por descanso largo). Además, al terminar un descanso corto, tu nivel de Extenuación disminuye en 1.", nivel: 10 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Explorador.", nivel: 11, esSubclase: true },
    { nombre: "Cazador Implacable", descripcion: "Recibir daño no puede romper tu concentración en Marca del Cazador.", nivel: 13 },
    { nombre: "Velo de la Naturaleza", descripcion: "Como acción adicional, invocas espíritus de la naturaleza para volverte Invisible hasta el final de tu siguiente turno. Usos = mod. SAB (mín. 1) por descanso largo.", nivel: 14 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Explorador.", nivel: 15, esSubclase: true },
    { nombre: "Cazador Preciso", descripcion: "Tienes ventaja en tiradas de ataque contra la criatura actualmente marcada por tu Marca del Cazador.", nivel: 17 },
    { nombre: "Sentidos Salvajes", descripcion: "Tu conexión con las fuerzas de la naturaleza te otorga Vista Ciega con un alcance de 9 m.", nivel: 18 },
    { nombre: "Don Épico", descripcion: "Obtienes un Don Épico u otra dote a tu elección. Se recomienda Don de Viaje Dimensional.", nivel: 19 },
    { nombre: "Asesino de Enemigos", descripcion: "El dado de daño de tu Marca del Cazador es un d10 en lugar de un d6.", nivel: 20 },
  ],

  // ─── GUERRERO ──────────────────────────────────────────────────────
  guerrero: [
    { nombre: "Estilo de Combate", descripcion: "Obtienes la dote de Estilo de Combate de tu elección (se recomienda Defensa). Al subir de nivel de guerrero puedes cambiarla por otra.", nivel: 1 },
    { nombre: "Tomar Aliento", descripcion: "Como acción adicional, recuperas PG = 1d10 + tu nivel de guerrero. 2 usos (3 al nv4, 4 al nv10, 5 al nv15, 6 al nv20). Recuperas 1 uso en descanso corto; todos en descanso largo.", nivel: 1 },
    { nombre: "Maestría con Armas", descripcion: "Puedes usar las propiedades de maestría de 3 tipos de armas sencillas o marciales. Al terminar un descanso largo puedes cambiar una elección. Aumenta a 4 (nv4), 5 (nv10), 6 (nv16).", nivel: 1 },
    { nombre: "Oleada de Acción", descripcion: "En tu turno, puedes realizar una acción adicional (excepto la acción Mágica). 1 uso por descanso corto o largo. A partir de nv17, 2 usos por descanso (pero solo uno por turno).", nivel: 2 },
    { nombre: "Mente Táctica", descripcion: "Cuando fallas una prueba de característica, puedes gastar un uso de Tomar Aliento (sin recuperar PG): tira 1d10 y súmalo a la prueba. Si aún fallas, no gastas el uso.", nivel: 2 },
    { nombre: "Arquetipo Marcial", descripcion: "Elige tu Arquetipo Marcial (subclase).", nivel: 3, esSubclase: true },
    { nombre: "Ataque Extra", descripcion: "Puedes atacar dos veces al usar la acción de Atacar.", nivel: 5 },
    { nombre: "Cambio Táctico", descripcion: "Cuando activas Tomar Aliento como acción adicional, puedes moverte hasta la mitad de tu velocidad sin provocar ataques de oportunidad.", nivel: 5 },
    { nombre: "Rasgo de Arquetipo", descripcion: "Obtienes un rasgo de tu Arquetipo Marcial.", nivel: 7, esSubclase: true },
    { nombre: "Indomable", descripcion: "Si fallas una tirada de salvación, puedes repetirla con un bonificador = tu nivel de guerrero. Debes usar el nuevo resultado. 1 uso por descanso largo (2 al nv13, 3 al nv17).", nivel: 9 },
    { nombre: "Maestro Táctico", descripcion: "Cuando atacas con un arma cuya propiedad de maestría puedas usar, puedes reemplazarla por Empujar, Debilitar o Ralentizar en ese ataque.", nivel: 9 },
    { nombre: "Rasgo de Arquetipo", descripcion: "Obtienes un rasgo de tu Arquetipo Marcial.", nivel: 10, esSubclase: true },
    { nombre: "Ataque Extra (2)", descripcion: "Puedes atacar tres veces al usar la acción de Atacar.", nivel: 11 },
    { nombre: "Ataques Estudiados", descripcion: "Si haces una tirada de ataque contra una criatura y fallas, tienes ventaja en tu siguiente tirada de ataque contra esa criatura antes del final de tu siguiente turno.", nivel: 13 },
    { nombre: "Rasgo de Arquetipo", descripcion: "Obtienes un rasgo de tu Arquetipo Marcial.", nivel: 15, esSubclase: true },
    { nombre: "Rasgo de Arquetipo", descripcion: "Obtienes un rasgo de tu Arquetipo Marcial.", nivel: 18, esSubclase: true },
    { nombre: "Bendición Épica", descripcion: "Obtienes la dote Bendición Épica de tu elección (se recomienda Bendición de Destreza en Combate).", nivel: 19 },
    { nombre: "Ataque Extra (3)", descripcion: "Puedes atacar cuatro veces al usar la acción de Atacar.", nivel: 20 },
  ],

  // ─── HECHICERO ─────────────────────────────────────────────────────
  hechicero: [
    { nombre: "Lanzamiento de Conjuros", descripcion: "Puedes lanzar conjuros de hechicero usando CAR como aptitud mágica. Preparas conjuros de la lista de hechicero.", nivel: 1 },
    { nombre: "Hechicería Innata", descripcion: "Como acción adicional, desatas tu magia innata durante 1 minuto: la CD de tus conjuros de hechicero aumenta en 1 y tienes ventaja en tiradas de ataque de conjuros de hechicero. 2 usos por descanso largo.", nivel: 1 },
    { nombre: "Fuente de Magia", descripcion: "Obtienes Puntos de Hechicería (PH) = tu nivel de hechicero. Puedes convertir espacios en PH y crear espacios con PH (máx. nivel 5). Los PH y espacios creados se recuperan en un descanso largo.", nivel: 2 },
    { nombre: "Metamagia (2 opciones)", descripcion: "Elige 2 opciones de Metamagia para modificar tus conjuros gastando Puntos de Hechicería. Solo puedes aplicar una por conjuro (salvo que se indique lo contrario). Al subir de nivel puedes intercambiar una opción.", nivel: 2 },
    { nombre: "Origen Mágico", descripcion: "Elige tu Origen Mágico (subclase).", nivel: 3, esSubclase: true },
    { nombre: "Restauración Hechicera", descripcion: "Al terminar un descanso corto, puedes recuperar PH gastados hasta un máximo igual a la mitad de tu nivel de hechicero (redondeando abajo). Una vez por descanso largo.", nivel: 5 },
    { nombre: "Rasgo de Origen", descripcion: "Obtienes un rasgo de tu Origen Mágico.", nivel: 6, esSubclase: true },
    { nombre: "Hechicería Encarnada", descripcion: "Mientras tu Hechicería Innata esté activa, puedes aplicar hasta 2 opciones de Metamagia a cada conjuro. Si no te quedan usos de Hechicería Innata, puedes activarla gastando 2 PH.", nivel: 7 },
    { nombre: "Metamagia (2 opciones más)", descripcion: "Elige 2 opciones de Metamagia adicionales.", nivel: 10 },
    { nombre: "Rasgo de Origen", descripcion: "Obtienes un rasgo de tu Origen Mágico.", nivel: 14, esSubclase: true },
    { nombre: "Metamagia (2 opciones más)", descripcion: "Elige 2 opciones de Metamagia adicionales.", nivel: 17 },
    { nombre: "Rasgo de Origen", descripcion: "Obtienes un rasgo de tu Origen Mágico.", nivel: 18, esSubclase: true },
    { nombre: "Bendición Épica", descripcion: "Obtienes la dote Bendición Épica u otra dote a tu elección. Se recomienda Bendición de Viaje Dimensional.", nivel: 19 },
    { nombre: "Apoteosis Arcana", descripcion: "Mientras tu Hechicería Innata esté activa, puedes usar una opción de Metamagia en cada turno sin gastar Puntos de Hechicería.", nivel: 20 },
  ],

  // ─── MAGO ──────────────────────────────────────────────────────────
  mago: [
    { nombre: "Lanzamiento de Conjuros", descripcion: "Puedes lanzar conjuros de mago usando INT como aptitud mágica. Usas un libro de conjuros (empieza con 6 conjuros de nv1). Preparas un número de conjuros según la tabla de Mago. Ganas +2 conjuros al libro por nivel.", nivel: 1 },
    { nombre: "Adepto de Rituales", descripcion: "Puedes lanzar cualquier conjuro como ritual si tiene la etiqueta Ritual y está en tu libro de conjuros. No necesitas tenerlo preparado, pero debes leer del libro.", nivel: 1 },
    { nombre: "Recuperación Arcana", descripcion: "Al terminar un descanso corto, puedes recuperar espacios de conjuro cuyo nivel combinado ≤ mitad de tu nivel de mago (redondeando arriba). Ningún espacio puede ser de nivel 6+. Una vez por descanso largo.", nivel: 1 },
    { nombre: "Erudito", descripcion: "Mientras estudias magia, también te has especializado en otro campo. Ganas Pericia en una habilidad en la que tengas competencia: Arcanos, Historia, Investigación, Medicina, Naturaleza o Religión.", nivel: 2 },
    { nombre: "Subclase de Mago", descripcion: "Ganas una subclase de Mago a tu elección.", nivel: 3, esSubclase: true },
    { nombre: "Memorizar Conjuro", descripcion: "Al terminar un descanso corto, puedes estudiar tu libro y reemplazar un conjuro de nv1+ que tengas preparado por otro de nv1+ del libro.", nivel: 5 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Mago.", nivel: 6, esSubclase: true },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Mago.", nivel: 10, esSubclase: true },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Mago.", nivel: 14, esSubclase: true },
    { nombre: "Dominio de Conjuros", descripcion: "Elige un conjuro de mago de nv1 y otro de nv2 en tu libro con tiempo de lanzamiento de una acción. Siempre los tienes preparados y puedes lanzarlos a su nivel más bajo sin gastar espacio. Puedes reemplazar uno tras cada descanso largo.", nivel: 18 },
    { nombre: "Don Épico", descripcion: "Obtienes la dote Don Épico de tu elección. Se recomienda Don de Recuerdo de Conjuros.", nivel: 19 },
    { nombre: "Conjuros Insignia", descripcion: "Elige 2 conjuros de mago de nv3 en tu libro como insignias. Siempre los tienes preparados y puedes lanzar cada uno a nv3 sin gastar espacio una vez por descanso corto o largo.", nivel: 20 },
  ],

  // ─── MONJE ─────────────────────────────────────────────────────────
  monje: [
    { nombre: "Artes Marciales", descripcion: "Dominas estilos de combate con golpes desarmados y armas de monje (sencillas cuerpo a cuerpo y marciales ligeras). Sin armadura ni escudo: puedes usar DES para ataques y daño; el dado de daño es 1d6 (sube con el nivel); puedes hacer un golpe desarmado como acción adicional.", nivel: 1 },
    { nombre: "Defensa sin Armadura", descripcion: "Sin armadura ni escudo, tu CA = 10 + mod. DES + mod. SAB.", nivel: 1 },
    { nombre: "Concentración del Monje", descripcion: "Obtienes Puntos de Concentración = tu nivel de monje. Se recuperan en un descanso corto o largo. Te permiten usar: Ráfaga de Golpes (1 PC: dos golpes desarmados como acción adicional), Defensa Paciente (Desenganche gratis como acción adicional, o 1 PC para Desenganche + Esquivar) y Paso del Viento (Carrera gratis como acción adicional, o 1 PC para Desenganche + Carrera y salto duplicado).", nivel: 2 },
    { nombre: "Movimiento sin Armadura (+10 pies)", descripcion: "Tu velocidad aumenta 10 pies sin armadura ni escudo. Aumenta con el nivel.", nivel: 2 },
    { nombre: "Metabolismo Extraordinario", descripcion: "Al tirar Iniciativa, puedes recuperar todos tus Puntos de Concentración gastados. Al hacerlo, tiras tu dado de Artes Marciales y recuperas PG = nivel de monje + resultado. Una vez por descanso largo.", nivel: 2 },
    { nombre: "Desviar Ataques", descripcion: "Cuando un ataque te impacta e inflige daño contundente, perforante o cortante, puedes usar tu reacción para reducir el daño en 1d10 + mod. DES + nivel de monje. Si reduces a 0, puedes gastar 1 PC para redirigir el ataque a una criatura cercana (salvación DES).", nivel: 3 },
    { nombre: "Subclase de Monje", descripcion: "Elige tu subclase de Monje.", nivel: 3, esSubclase: true },
    { nombre: "Caída Lenta", descripcion: "Puedes usar tu reacción para reducir el daño por caída en 5 × nivel de monje.", nivel: 4 },
    { nombre: "Ataque Extra", descripcion: "Puedes atacar dos veces al usar la acción de Atacar.", nivel: 5 },
    { nombre: "Golpe Aturdidor", descripcion: "Una vez por turno cuando impactas con un arma de monje o golpe desarmado, puedes gastar 1 PC. El objetivo hace salvación de CON: si falla, queda Aturdido hasta el inicio de tu siguiente turno; si tiene éxito, su velocidad se reduce a la mitad y el siguiente ataque contra él tiene ventaja.", nivel: 5 },
    { nombre: "Golpes Potenciados", descripcion: "Tus golpes desarmados pueden infligir daño de Fuerza en lugar de su tipo normal (a tu elección).", nivel: 6 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Monje.", nivel: 6, esSubclase: true },
    { nombre: "Evasión", descripcion: "Si haces una salvación de DES para mitad de daño, no recibes daño en éxito y mitad en fallo. No funciona si estás incapacitado.", nivel: 7 },
    { nombre: "Movimiento Acrobático", descripcion: "Sin armadura ni escudo, puedes moverte por superficies verticales y sobre líquidos en tu turno sin caer durante el movimiento.", nivel: 9 },
    { nombre: "Concentración Elevada", descripcion: "Ráfaga de Golpes: 1 PC para 3 golpes desarmados (en vez de 2). Defensa Paciente: al gastar 1 PC, obtienes PG temporales = 2 dados de Artes Marciales. Paso del Viento: al gastar 1 PC, puedes mover a una criatura voluntaria Grande o menor contigo.", nivel: 10 },
    { nombre: "Autorrestauración", descripcion: "Al final de cada turno, puedes eliminar de ti mismo una condición: Hechizado, Asustado o Envenenado. Además, no necesitas comida ni bebida.", nivel: 10 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Monje.", nivel: 11, esSubclase: true },
    { nombre: "Desviar Energía", descripcion: "Tu Desviar Ataques funciona ahora contra ataques de cualquier tipo de daño, no solo contundente, perforante o cortante.", nivel: 13 },
    { nombre: "Superviviente Disciplinado", descripcion: "Tienes competencia en todas las tiradas de salvación. Si fallas una, puedes gastar 1 PC para repetirla (debes usar el nuevo resultado).", nivel: 14 },
    { nombre: "Concentración Perfecta", descripcion: "Cuando tiras Iniciativa y no usas Metabolismo Extraordinario, recuperas Puntos de Concentración hasta tener 4 (si tienes 3 o menos).", nivel: 15 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Monje.", nivel: 17, esSubclase: true },
    { nombre: "Defensa Superior", descripcion: "Al inicio de tu turno, puedes gastar 3 PC para obtener resistencia a todo tipo de daño excepto Fuerza durante 1 minuto o hasta quedar incapacitado.", nivel: 18 },
    { nombre: "Don Épico", descripcion: "Obtienes un Don Épico u otra dote a tu elección. Se recomienda Don de Ofensiva Irresistible.", nivel: 19 },
    { nombre: "Cuerpo y Mente", descripcion: "Tu DES y SAB aumentan en 4, hasta un máximo de 25.", nivel: 20 },
  ],

  // ─── PALADÍN ───────────────────────────────────────────────────────
  paladin: [
    { nombre: "Imposición de Manos", descripcion: "Tu toque bendito puede curar heridas. Tienes una reserva de poder curativo que se repone tras un descanso largo, igual a 5 × tu nivel de paladín. Como acción adicional, puedes restaurar PG a una criatura que toques (incluido tú mismo). También puedes gastar 5 PG de la reserva para eliminar la condición Envenenado.", nivel: 1 },
    { nombre: "Lanzamiento de Conjuros", descripcion: "Has aprendido a lanzar conjuros mediante oración y meditación. CAR es tu aptitud mágica. Preparas conjuros de la lista de paladín cada descanso largo.", nivel: 1 },
    { nombre: "Maestría con Armas", descripcion: "Puedes usar las propiedades de maestría de dos tipos de armas con las que tengas competencia. Puedes cambiar tus elecciones tras cada descanso largo.", nivel: 1 },
    { nombre: "Estilo de Combate", descripcion: "Ganas una dote de Estilo de Combate a tu elección. También puedes elegir Guerrero Bendito: aprendes dos trucos de clérigo (cuentan como conjuros de paladín, usan CAR).", nivel: 2 },
    { nombre: "Castigo del Paladín", descripcion: "Siempre tienes preparado el conjuro Castigo Divino. Además, puedes lanzarlo una vez sin gastar espacio de conjuro; recuperas este uso tras un descanso largo.", nivel: 2 },
    { nombre: "Canalizar Divinidad", descripcion: "Puedes canalizar energía divina para crear efectos mágicos. Comienzas con Sentido Divino: como acción adicional, detectas celestiales, infernales y muertos vivientes a 18 m durante 10 minutos, y detectas lugares consagrados o profanados. 2 usos (3 a nivel 11); recuperas 1 uso en descanso corto y todos en descanso largo.", nivel: 3 },
    { nombre: "Subclase de Paladín", descripcion: "Ganas una subclase de Paladín a tu elección.", nivel: 3, esSubclase: true },
    { nombre: "Ataque Extra", descripcion: "Puedes atacar dos veces al usar la acción de Atacar.", nivel: 5 },
    { nombre: "Corcel Fiel", descripcion: "Siempre tienes preparado el conjuro Encontrar Corcel. Además, puedes lanzarlo una vez sin gastar espacio de conjuro; recuperas este uso tras un descanso largo.", nivel: 5 },
    { nombre: "Aura de Protección", descripcion: "Irradias un aura protectora en una Emanación de 3 m. Tú y tus aliados en el aura sumáis tu mod. CAR (mín. +1) a las tiradas de salvación. Inactiva si estás incapacitado.", nivel: 6 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Paladín.", nivel: 7, esSubclase: true },
    { nombre: "Expulsar Enemigos", descripcion: "Como acción mágica, gastas un uso de Canalizar Divinidad para abrumar enemigos. Elige un número de criaturas igual a tu mod. CAR (mín. 1) a 18 m. Cada una: salvación de SAB o Asustada 1 minuto o hasta recibir daño. Mientras asustada, solo puede moverse, actuar O usar acción adicional en su turno.", nivel: 9 },
    { nombre: "Aura de Coraje", descripcion: "Tú y tus aliados tenéis inmunidad a la condición Asustado mientras estéis en tu Aura de Protección.", nivel: 10 },
    { nombre: "Golpes Radiantes", descripcion: "Cuando impactas con una tirada de ataque usando un arma cuerpo a cuerpo o un Golpe sin Armas, el objetivo recibe 1d8 de daño radiante adicional.", nivel: 11 },
    { nombre: "Toque Restaurador", descripcion: "Al usar Imposición de Manos, puedes eliminar una o más de estas condiciones: Cegado, Hechizado, Ensordecido, Asustado, Paralizado o Aturdido. Debes gastar 5 PG de la reserva por cada condición eliminada (no restauran PG).", nivel: 14 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes un rasgo de tu subclase de Paladín.", nivel: 15, esSubclase: true },
    { nombre: "Expansión del Aura", descripcion: "Tu Aura de Protección es ahora una Emanación de 9 m.", nivel: 18 },
    { nombre: "Don Épico", descripcion: "Obtienes un Don Épico u otra dote a tu elección. Se recomienda Don de Visión Verdadera.", nivel: 19 },
    { nombre: "Rasgo de Subclase", descripcion: "Obtienes el rasgo culminante de tu subclase de Paladín.", nivel: 20, esSubclase: true },
  ],

  // ─── PÍCARO ────────────────────────────────────────────────────────
  picaro: [
    { nombre: "Pericia", descripcion: "Elige dos habilidades en las que tengas competencia. Tu bonificador se duplica para ellas (Pericia). Juego de Manos y Sigilo son recomendadas.", nivel: 1 },
    { nombre: "Ataque Furtivo (1d6)", descripcion: "Una vez por turno, infliges 1d6 extra a una criatura que impactes con un ataque si tienes ventaja y usas un arma con Sutileza o a Distancia. No necesitas ventaja si un aliado está a 1,5 m del objetivo (sin estar incapacitado) y no tienes desventaja. El daño aumenta con el nivel.", nivel: 1 },
    { nombre: "Jerga de Ladrones", descripcion: "Conoces la Jerga de Ladrones y un idioma adicional a tu elección.", nivel: 1 },
    { nombre: "Maestría con Armas", descripcion: "Puedes usar las propiedades de maestría de dos tipos de armas con las que tengas competencia. Puedes cambiar tus elecciones tras un descanso largo.", nivel: 1 },
    { nombre: "Acción Astuta", descripcion: "En tu turno, puedes realizar una de las siguientes acciones como acción bonus: Correr, Desengancharte o Esconderte.", nivel: 2 },
    { nombre: "Apuntar Firme", descripcion: "Como acción bonus, te otorgas ventaja en tu siguiente tirada de ataque este turno. Solo puedes usarlo si no te has movido, y tu velocidad se reduce a 0 hasta el final del turno.", nivel: 3 },
    { nombre: "Arquetipo de Pícaro", descripcion: "Elige tu Arquetipo de Pícaro (subclase).", nivel: 3, esSubclase: true },
    { nombre: "Golpe Astuto", descripcion: "Cuando infliges daño de Ataque Furtivo, puedes renunciar a dados para añadir un efecto. Veneno (1d6): salvación CON o Envenenado 1 min. Tropiezo (1d6): DES o Derribado. Retirada (1d6): te mueves la mitad de tu velocidad sin ataques de oportunidad. La CD = 8 + mod. DES + bon. competencia.", nivel: 5 },
    { nombre: "Esquivar Peligro", descripcion: "Cuando un atacante que puedas ver te impacta con un ataque, puedes usar tu reacción para reducir el daño a la mitad (redondeado abajo).", nivel: 5 },
    { nombre: "Pericia (2 más)", descripcion: "Elige dos habilidades más para obtener Pericia.", nivel: 6 },
    { nombre: "Evasión", descripcion: "Si haces una salvación de DES para mitad de daño, recibes 0 en éxito y mitad en fallo. No puedes usarlo si estás incapacitado.", nivel: 7 },
    { nombre: "Talento Fiable", descripcion: "Cuando hagas una prueba de característica con competencia en habilidad o herramienta, cualquier resultado de d20 de 9 o menos cuenta como 10.", nivel: 7 },
    { nombre: "Rasgo de Arquetipo", descripcion: "Obtienes un rasgo de tu Arquetipo de Pícaro.", nivel: 9, esSubclase: true },
    { nombre: "Golpe Astuto Mejorado", descripcion: "Puedes aplicar hasta dos efectos de Golpe Astuto cuando inflijas daño de Ataque Furtivo, pagando el coste de dados de cada efecto.", nivel: 11 },
    { nombre: "Rasgo de Arquetipo", descripcion: "Obtienes un rasgo de tu Arquetipo de Pícaro.", nivel: 13, esSubclase: true },
    { nombre: "Golpes Desviados", descripcion: "Nuevos efectos de Golpe Astuto: Aturdir (2d6, salvación CON o solo puede moverse O actuar en su turno), Noquear (6d6, salvación CON o Inconsciente 1 min), Oscurecer (3d6, salvación DES o Cegado hasta final de su turno).", nivel: 14 },
    { nombre: "Mente Escurridiza", descripcion: "Ganas competencia en tiradas de salvación de SAB y CAR.", nivel: 15 },
    { nombre: "Rasgo de Arquetipo", descripcion: "Obtienes un rasgo de tu Arquetipo de Pícaro.", nivel: 17, esSubclase: true },
    { nombre: "Esquivo", descripcion: "Ningún ataque puede tener ventaja contra ti mientras no estés incapacitado.", nivel: 18 },
    { nombre: "Bendición Épica", descripcion: "Ganas una Dote Épica u otra dote a tu elección. Se recomienda Bendición del Espíritu Nocturno.", nivel: 19 },
    { nombre: "Golpe de Suerte", descripcion: "Si fallas una prueba de d20, puedes convertir el resultado en un 20. Una vez por descanso corto o largo.", nivel: 20 },
  ],
};

// ─── Dados de Ataque Furtivo del Pícaro por nivel ────────────────────

export const SNEAK_ATTACK_DICE: Record<number, string> = {
  1: "1d6", 2: "1d6",
  3: "2d6", 4: "2d6",
  5: "3d6", 6: "3d6",
  7: "4d6", 8: "4d6",
  9: "5d6", 10: "5d6",
  11: "6d6", 12: "6d6",
  13: "7d6", 14: "7d6",
  15: "8d6", 16: "8d6",
  17: "9d6", 18: "9d6",
  19: "10d6", 20: "10d6",
};

// ─── Usos de Furia del Bárbaro por nivel ─────────────────────────────

export const RAGE_USES: Record<number, number | "ilimitado"> = {
  1: 2, 2: 2,
  3: 3, 4: 3, 5: 3,
  6: 4, 7: 4, 8: 4, 9: 4, 10: 4, 11: 4,
  12: 5, 13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6,
  20: "ilimitado",
};

// ─── Daño de Furia del Bárbaro por nivel ─────────────────────────────

export const RAGE_DAMAGE: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2,
  9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
  16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
};

// ─── Dado de Artes Marciales del Monje por nivel ─────────────────────

export const MARTIAL_ARTS_DIE: Record<number, string> = {
  1: "1d6", 2: "1d6", 3: "1d6", 4: "1d6",
  5: "1d8", 6: "1d8", 7: "1d8", 8: "1d8", 9: "1d8", 10: "1d8",
  11: "1d10", 12: "1d10", 13: "1d10", 14: "1d10", 15: "1d10", 16: "1d10",
  17: "1d12", 18: "1d12", 19: "1d12", 20: "1d12",
};

// ─── Invocaciones Sobrenaturales del Brujo por nivel ─────────────────

export const WARLOCK_INVOCATIONS: Record<number, number> = {
  1: 1, 2: 3, 3: 3, 4: 3,
  5: 5, 6: 5,
  7: 6, 8: 6,
  9: 7, 10: 7, 11: 7,
  12: 8, 13: 8, 14: 8,
  15: 8, 16: 8, 17: 8,
  18: 8, 19: 8, 20: 8,
};

// ─── Funciones utilitarias ───────────────────────────────────────────

/**
 * Calcula el nivel correspondiente a una cantidad de XP.
 */
export function getLevelForXP(xp: number): number {
  let level = 1;
  for (let l = 20; l >= 1; l--) {
    if (xp >= XP_THRESHOLDS[l]) {
      level = l;
      break;
    }
  }
  return level;
}

/**
 * Obtiene la XP necesaria para el siguiente nivel.
 * Retorna null si ya está en nivel 20.
 */
export function getXPForNextLevel(currentLevel: number): number | null {
  if (currentLevel >= MAX_LEVEL) return null;
  return XP_THRESHOLDS[currentLevel + 1];
}

/**
 * Calcula el progreso de XP hacia el siguiente nivel (0 a 1).
 */
export function getXPProgress(xp: number, currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 1;

  const currentThreshold = XP_THRESHOLDS[currentLevel];
  const nextThreshold = XP_THRESHOLDS[currentLevel + 1];
  const range = nextThreshold - currentThreshold;

  if (range <= 0) return 1;

  return Math.min(1, Math.max(0, (xp - currentThreshold) / range));
}

/**
 * Comprueba si el personaje tiene suficiente XP para subir de nivel.
 */
export function canLevelUp(xp: number, currentLevel: number): boolean {
  if (currentLevel >= MAX_LEVEL) return false;
  return xp >= XP_THRESHOLDS[currentLevel + 1];
}

/**
 * Obtiene los rasgos de clase que se ganan al subir a un nivel concreto.
 */
export function getFeaturesForLevel(
  classId: ClassId,
  level: number
): LevelFeature[] {
  const features = CLASS_LEVEL_FEATURES[classId];
  return features.filter((f) => f.nivel === level);
}

/**
 * Comprueba si un nivel concreto otorga ASI para una clase.
 */
export function isASILevel(classId: ClassId, level: number): boolean {
  return ASI_LEVELS[classId].includes(level);
}

/**
 * Comprueba si un nivel concreto requiere elegir subclase.
 */
export function isSubclassLevel(classId: ClassId, level: number): boolean {
  const features = CLASS_LEVEL_FEATURES[classId];
  return features.some(
    (f) => f.nivel === level && f.esSubclase === true && f.descripcion.toLowerCase().includes("elige")
  );
}

/**
 * Obtiene un resumen de lo que ocurre al subir a un nivel concreto.
 */
export interface LevelUpSummary {
  newLevel: number;
  /** Rasgos ganados */
  features: LevelFeature[];
  /** Si obtiene ASI (Mejora de Característica) */
  hasASI: boolean;
  /** Si debe elegir subclase */
  choosesSubclass: boolean;
  /** Nuevo bonificador de competencia */
  proficiencyBonus: number;
  /** XP necesaria para el nivel actual */
  xpThreshold: number;
  /** Información sobre hechizos que se aprenden al subir */
  spellLearning: SpellLearningInfo | null;
  /** Número de opciones de Metamagia nuevas que se eligen (solo hechicero) */
  newMetamagicChoices: number;
}

/**
 * Información sobre hechizos que se aprenden al subir de nivel.
 */
export interface SpellLearningInfo {
  /** Trucos nuevos que se pueden aprender */
  newCantrips: number;
  /** Hechizos nuevos que se pueden aprender (clases que "conocen") */
  newSpellsKnown: number;
  /** Si el personaje puede intercambiar un hechizo conocido por otro */
  canSwapSpell: boolean;
  /** Hechizos nuevos en el libro de conjuros (solo mago: +2 por nivel) */
  newSpellbookSpells: number;
  /** Nivel máximo de hechizo al que tiene acceso */
  maxSpellLevel: number;
  /** Tipo de preparación de la clase */
  preparationType: "known" | "prepared" | "spellbook" | "pact" | "none";
  /** Si gana acceso a un nuevo nivel de hechizo en este nivel */
  gainsNewSpellLevel: boolean;
  /** Trucos totales que debería tener */
  totalCantrips: number;
  /** Hechizos conocidos totales que debería tener */
  totalSpellsKnown: number;
}

export function getLevelUpSummary(
  classId: ClassId,
  newLevel: number
): LevelUpSummary {
  // Metamagia: hechicero gana 2 opciones al nivel 2, 2 más al 10 y 2 más al 17
  let newMetamagicChoices = 0;
  if (classId === "hechicero") {
    if (newLevel === 2) newMetamagicChoices = 2;
    else if (newLevel === 10 || newLevel === 17) newMetamagicChoices = 2;
  }

  return {
    newLevel,
    features: getFeaturesForLevel(classId, newLevel),
    hasASI: isASILevel(classId, newLevel),
    choosesSubclass: isSubclassLevel(classId, newLevel),
    proficiencyBonus: Math.floor((newLevel - 1) / 4) + 2,
    xpThreshold: XP_THRESHOLDS[newLevel],
    spellLearning: getSpellLearningInfo(classId, newLevel),
    newMetamagicChoices,
  };
}

/**
 * Formatea un número de XP con separadores de miles.
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString("es-ES");
}

/**
 * Comprueba si el bonificador de competencia cambia al subir de nivel.
 */
export function proficiencyBonusChanges(
  oldLevel: number,
  newLevel: number
): boolean {
  const oldBonus = Math.floor((oldLevel - 1) / 4) + 2;
  const newBonus = Math.floor((newLevel - 1) / 4) + 2;
  return oldBonus !== newBonus;
}

/**
 * Obtiene todos los niveles de ASI restantes por encima del nivel actual.
 */
export function getRemainingASILevels(
  classId: ClassId,
  currentLevel: number
): number[] {
  return ASI_LEVELS[classId].filter((l) => l > currentLevel);
}

// ─── Aprendizaje de hechizos al subir de nivel ──────────────────────

/**
 * Calcula el nivel máximo de hechizo al que una clase tiene acceso a un nivel dado.
 */
export function getMaxSpellLevelForClass(
  classId: ClassId,
  classLevel: number
): number {
  const casterType = CLASS_CASTER_TYPE[classId];

  if (casterType === "none") return 0;

  if (casterType === "pact") {
    // Brujo: el nivel de espacio de pacto
    const pactData = WARLOCK_PACT_SLOTS[classLevel];
    return pactData ? pactData[1] : 0;
  }

  const table = casterType === "full" ? FULL_CASTER_SLOTS : HALF_CASTER_SLOTS;
  const slots = table[classLevel];
  if (!slots) return 0;

  // El nivel máximo es el índice más alto con espacios > 0 (+ 1 porque es 0-indexed)
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i] > 0) return i + 1;
  }
  return 0;
}

/**
 * Calcula la información de aprendizaje de hechizos al subir a un nivel dado.
 * Retorna null si la clase no es lanzadora de conjuros.
 */
export function getSpellLearningInfo(
  classId: ClassId,
  newLevel: number
): SpellLearningInfo | null {
  const casterType = CLASS_CASTER_TYPE[classId];
  if (casterType === "none") return null;

  const oldLevel = newLevel - 1;
  const prepType = CLASS_SPELL_PREPARATION[classId];

  // ── Trucos ──
  const cantripsTable = CANTRIPS_KNOWN[classId];
  const totalCantrips = cantripsTable?.[newLevel] ?? 0;
  const oldCantrips = cantripsTable?.[oldLevel] ?? 0;
  const newCantrips = Math.max(0, totalCantrips - oldCantrips);

  // ── Hechizos conocidos/preparados (bardo, brujo, hechicero: conocen; explorador: prepara) ──
  const spellsTable = SPELLS_KNOWN[classId];
  const totalSpellsKnown = spellsTable?.[newLevel] ?? 0;
  const oldSpellsKnown = spellsTable?.[oldLevel] ?? 0;
  const newSpellsKnown = Math.max(0, totalSpellsKnown - oldSpellsKnown);

  // ── Libro de conjuros del mago: +2 conjuros al libro por nivel ──
  const newSpellbookSpells = classId === "mago" ? 2 : 0;

  // ── ¿Puede intercambiar un hechizo? (bardo, hechicero, brujo al subir de nivel) ──
  const canSwapSpell = prepType === "known" && newLevel > 1;

  // ── Nivel máximo de hechizo ──
  const maxSpellLevel = getMaxSpellLevelForClass(classId, newLevel);
  const oldMaxSpellLevel = getMaxSpellLevelForClass(classId, oldLevel);
  const gainsNewSpellLevel = maxSpellLevel > oldMaxSpellLevel;

  // Determinar tipo de preparación para mostrar en la UI
  let preparationType: SpellLearningInfo["preparationType"];
  if (casterType === "pact") {
    preparationType = "pact";
  } else if (prepType === "spellbook") {
    preparationType = "spellbook";
  } else if (prepType === "prepared") {
    preparationType = "prepared";
  } else if (prepType === "known") {
    preparationType = "known";
  } else {
    preparationType = "none";
  }

  // Si no hay nada que aprender ni cambiar, y la clase no es lanzadora, retornar null
  const hasAnySpellChange =
    newCantrips > 0 ||
    newSpellsKnown > 0 ||
    newSpellbookSpells > 0 ||
    canSwapSpell ||
    gainsNewSpellLevel ||
    totalCantrips > 0 ||
    totalSpellsKnown > 0;

  if (!hasAnySpellChange) return null;

  return {
    newCantrips,
    newSpellsKnown,
    canSwapSpell,
    newSpellbookSpells,
    maxSpellLevel,
    preparationType,
    gainsNewSpellLevel,
    totalCantrips,
    totalSpellsKnown,
  };
}
