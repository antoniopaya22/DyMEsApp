/**
 * Catálogo SRD de objetos de D&D 5e en español.
 * Contiene armas, armaduras, escudos, munición y equipo común
 * para asignar datos correctos al crear el inventario inicial.
 */

import type {
  ItemCategory,
  WeaponDetails,
  ArmorDetails,
  InventoryItem,
} from "@/types/item";

// ─── Plantilla parcial de un objeto del catálogo ─────────────────────

export interface SrdItemTemplate {
  nombre: string;
  categoria: ItemCategory;
  peso: number;
  valor?: number;
  descripcion?: string;
  weaponDetails?: WeaponDetails;
  armorDetails?: ArmorDetails;
}

// ─── Armas SRD ───────────────────────────────────────────────────────

const WEAPONS: SrdItemTemplate[] = [
  // ── Armas sencillas cuerpo a cuerpo ──
  {
    nombre: "Bastón",
    categoria: "arma",
    peso: 4,
    valor: 0.2,
    weaponDetails: {
      weaponType: "sencilla_cuerpo",
      damage: { dice: "1d6", damageType: "contundente" },
      versatileDamage: { dice: "1d8", damageType: "contundente" },
      properties: ["versatil"],
      melee: true,
    },
  },
  {
    nombre: "Daga",
    categoria: "arma",
    peso: 1,
    valor: 2,
    weaponDetails: {
      weaponType: "sencilla_cuerpo",
      damage: { dice: "1d4", damageType: "perforante" },
      properties: ["sutil", "ligera", "arrojadiza"],
      range: { normal: 20, long: 60 },
      melee: true,
    },
  },
  {
    nombre: "Hacha de mano",
    categoria: "arma",
    peso: 2,
    valor: 5,
    weaponDetails: {
      weaponType: "sencilla_cuerpo",
      damage: { dice: "1d6", damageType: "cortante" },
      properties: ["ligera", "arrojadiza"],
      range: { normal: 20, long: 60 },
      melee: true,
    },
  },
  {
    nombre: "Jabalina",
    categoria: "arma",
    peso: 2,
    valor: 0.5,
    weaponDetails: {
      weaponType: "sencilla_cuerpo",
      damage: { dice: "1d6", damageType: "perforante" },
      properties: ["arrojadiza"],
      range: { normal: 30, long: 120 },
      melee: true,
    },
  },
  {
    nombre: "Maza",
    categoria: "arma",
    peso: 4,
    valor: 5,
    weaponDetails: {
      weaponType: "sencilla_cuerpo",
      damage: { dice: "1d6", damageType: "contundente" },
      properties: [],
      melee: true,
    },
  },
  {
    nombre: "Cabilla (garrote)",
    categoria: "arma",
    peso: 2,
    valor: 0.1,
    weaponDetails: {
      weaponType: "sencilla_cuerpo",
      damage: { dice: "1d4", damageType: "contundente" },
      properties: ["ligera"],
      melee: true,
    },
  },
  // ── Armas sencillas a distancia ──
  {
    nombre: "Ballesta ligera",
    categoria: "arma",
    peso: 5,
    valor: 25,
    weaponDetails: {
      weaponType: "sencilla_distancia",
      damage: { dice: "1d8", damageType: "perforante" },
      properties: ["municion", "recarga", "a_dos_manos"],
      range: { normal: 80, long: 320 },
      melee: false,
    },
  },
  {
    nombre: "Arco corto",
    categoria: "arma",
    peso: 2,
    valor: 25,
    weaponDetails: {
      weaponType: "sencilla_distancia",
      damage: { dice: "1d6", damageType: "perforante" },
      properties: ["municion", "a_dos_manos"],
      range: { normal: 80, long: 320 },
      melee: false,
    },
  },
  {
    nombre: "Dardos",
    categoria: "arma",
    peso: 0.25,
    valor: 0.05,
    weaponDetails: {
      weaponType: "sencilla_distancia",
      damage: { dice: "1d4", damageType: "perforante" },
      properties: ["sutil", "arrojadiza"],
      range: { normal: 20, long: 60 },
      melee: false,
    },
  },
  // ── Armas marciales cuerpo a cuerpo ──
  {
    nombre: "Cimitarra",
    categoria: "arma",
    peso: 3,
    valor: 25,
    weaponDetails: {
      weaponType: "marcial_cuerpo",
      damage: { dice: "1d6", damageType: "cortante" },
      properties: ["sutil", "ligera"],
      melee: true,
    },
  },
  {
    nombre: "Espada corta",
    categoria: "arma",
    peso: 2,
    valor: 10,
    weaponDetails: {
      weaponType: "marcial_cuerpo",
      damage: { dice: "1d6", damageType: "perforante" },
      properties: ["sutil", "ligera"],
      melee: true,
    },
  },
  {
    nombre: "Espada larga",
    categoria: "arma",
    peso: 3,
    valor: 15,
    weaponDetails: {
      weaponType: "marcial_cuerpo",
      damage: { dice: "1d8", damageType: "cortante" },
      versatileDamage: { dice: "1d10", damageType: "cortante" },
      properties: ["versatil"],
      melee: true,
    },
  },
  {
    nombre: "Estoque",
    categoria: "arma",
    peso: 2,
    valor: 25,
    weaponDetails: {
      weaponType: "marcial_cuerpo",
      damage: { dice: "1d8", damageType: "perforante" },
      properties: ["sutil"],
      melee: true,
    },
  },
  {
    nombre: "Hacha a dos manos",
    categoria: "arma",
    peso: 7,
    valor: 30,
    weaponDetails: {
      weaponType: "marcial_cuerpo",
      damage: { dice: "1d12", damageType: "cortante" },
      properties: ["pesada", "a_dos_manos"],
      melee: true,
    },
  },
  {
    nombre: "Martillo de guerra",
    categoria: "arma",
    peso: 2,
    valor: 15,
    weaponDetails: {
      weaponType: "marcial_cuerpo",
      damage: { dice: "1d8", damageType: "contundente" },
      versatileDamage: { dice: "1d10", damageType: "contundente" },
      properties: ["versatil"],
      melee: true,
    },
  },
  // ── Armas marciales a distancia ──
  {
    nombre: "Arco largo",
    categoria: "arma",
    peso: 2,
    valor: 50,
    weaponDetails: {
      weaponType: "marcial_distancia",
      damage: { dice: "1d8", damageType: "perforante" },
      properties: ["municion", "pesada", "a_dos_manos"],
      range: { normal: 150, long: 600 },
      melee: false,
    },
  },
];

// ─── Armaduras SRD ───────────────────────────────────────────────────

const ARMORS: SrdItemTemplate[] = [
  {
    nombre: "Armadura de cuero",
    categoria: "armadura",
    peso: 10,
    valor: 10,
    armorDetails: {
      armorType: "ligera",
      baseAC: 11,
      addDexModifier: true,
      maxDexBonus: null,
      strengthRequirement: null,
      stealthDisadvantage: false,
    },
  },
  {
    nombre: "Cota de escamas",
    categoria: "armadura",
    peso: 45,
    valor: 50,
    armorDetails: {
      armorType: "intermedia",
      baseAC: 14,
      addDexModifier: true,
      maxDexBonus: 2,
      strengthRequirement: null,
      stealthDisadvantage: true,
    },
  },
  {
    nombre: "Cota de malla",
    categoria: "armadura",
    peso: 55,
    valor: 75,
    armorDetails: {
      armorType: "pesada",
      baseAC: 16,
      addDexModifier: false,
      maxDexBonus: 0,
      strengthRequirement: 13,
      stealthDisadvantage: true,
      donTime: "10 minutos",
      doffTime: "5 minutos",
    },
  },
];

// ─── Escudos SRD ─────────────────────────────────────────────────────

const SHIELDS: SrdItemTemplate[] = [
  {
    nombre: "Escudo",
    categoria: "escudo",
    peso: 6,
    valor: 10,
    armorDetails: {
      armorType: "escudo",
      baseAC: 2,
      addDexModifier: false,
      maxDexBonus: 0,
      strengthRequirement: null,
      stealthDisadvantage: false,
    },
  },
  {
    nombre: "Escudo de madera",
    categoria: "escudo",
    peso: 6,
    valor: 10,
    armorDetails: {
      armorType: "escudo",
      baseAC: 2,
      addDexModifier: false,
      maxDexBonus: 0,
      strengthRequirement: null,
      stealthDisadvantage: false,
    },
  },
];

// ─── Munición SRD ────────────────────────────────────────────────────

const AMMO: SrdItemTemplate[] = [
  {
    nombre: "Flechas",
    categoria: "municion",
    peso: 0.05,
    valor: 0.05,
    descripcion: "Flechas para arcos.",
  },
  {
    nombre: "Virotes",
    categoria: "municion",
    peso: 0.075,
    valor: 0.05,
    descripcion: "Virotes para ballestas.",
  },
];

// ─── Equipo aventurero SRD ───────────────────────────────────────────

const ADVENTURING_GEAR: SrdItemTemplate[] = [
  // ── Canalizadores / focos ──
  { nombre: "Canalizador arcano", categoria: "equipo_aventurero", peso: 1, valor: 10, descripcion: "Un bastón, varita, orbe o cristal que sirve como foco arcano para lanzar conjuros." },
  { nombre: "Canalizador druídico", categoria: "equipo_aventurero", peso: 1, valor: 5, descripcion: "Un totem, bastón de madera u otro objeto natural que sirve como foco druídico." },
  { nombre: "Saquito de componentes", categoria: "equipo_aventurero", peso: 2, valor: 25, descripcion: "Un pequeño saco de cuero resistente al agua con los componentes materiales más comunes." },
  { nombre: "Símbolo sagrado", categoria: "equipo_aventurero", peso: 1, valor: 5, descripcion: "Un amuleto, emblema o reliquia que representa a una deidad. Se usa como foco de conjuros divinos." },
  { nombre: "Símbolo sagrado (regalo de ordenación)", categoria: "equipo_aventurero", peso: 1, valor: 5, descripcion: "Un amuleto sagrado recibido al entrar en el templo." },
  // ── Libros y estuches ──
  { nombre: "Libro de conjuros", categoria: "equipo_aventurero", peso: 3, valor: 50, descripcion: "Un libro encuadernado en cuero con 100 páginas en blanco para registrar conjuros." },
  { nombre: "Devocionario o rueda de oraciones", categoria: "equipo_aventurero", peso: 1, valor: 1, descripcion: "Libro de oraciones o instrumento de meditación." },
  { nombre: "Estuche de pergaminos lleno de notas de tus estudios u oraciones", categoria: "equipo_aventurero", peso: 1, valor: 1 },
  // ── Paquetes de equipo ──
  { nombre: "Paquete de explorador", categoria: "equipo_aventurero", peso: 33, valor: 10, descripcion: "Incluye mochila, saco de dormir, raciones (10 días), odre, cuerda de cáñamo (15 m), yesquero, 10 antorchas y kit de aseo." },
  { nombre: "Paquete de explorador de mazmorras", categoria: "equipo_aventurero", peso: 38, valor: 12, descripcion: "Incluye mochila, palanca, martillo, 10 pitones, 10 antorchas, yesquero, raciones (10 días), odre y cuerda de cáñamo (15 m)." },
  { nombre: "Paquete de diplomático", categoria: "equipo_aventurero", peso: 18, valor: 39, descripcion: "Incluye cofre, estuche de mapas/pergaminos, ropas finas, frasco de tinta, pluma, lámpara, 2 frascos de aceite, 5 hojas de papel, vial de perfume, lacre y jabón." },
  { nombre: "Paquete de entretenedor", categoria: "equipo_aventurero", peso: 19, valor: 40, descripcion: "Incluye mochila, saco de dormir, 2 disfraces, 5 velas, raciones (5 días), odre y kit de disfraz." },
  { nombre: "Paquete de sacerdote", categoria: "equipo_aventurero", peso: 24, valor: 19, descripcion: "Incluye mochila, manta, 10 velas, yesquero, caja de limosnas, 2 bloques de incienso, incensario, vestiduras, raciones (2 días) y odre." },
  { nombre: "Paquete de erudito", categoria: "equipo_aventurero", peso: 12, valor: 40, descripcion: "Incluye mochila, libro de saber, frasco de tinta, pluma, 10 hojas de pergamino, bolsita de arena y cuchillo pequeño." },
  { nombre: "Paquete de ladrón", categoria: "equipo_aventurero", peso: 22, valor: 16, descripcion: "Incluye mochila, bolsa de bolas de rodamiento, cuerda (15 m), 5 velas, palanca, martillo, 10 pitones, linterna con pantalla, raciones (5 días), yesquero y odre." },
  // ── Aljabas ──
  { nombre: "Aljaba", categoria: "equipo_aventurero", peso: 1, valor: 1, descripcion: "Contiene hasta 20 flechas." },
  { nombre: "Aljaba con 20 flechas", categoria: "equipo_aventurero", peso: 2, valor: 2, descripcion: "Una aljaba con 20 flechas incluidas." },
  // ── Herramientas ──
  { nombre: "Herramientas de ladrón", categoria: "herramienta", peso: 1, valor: 25, descripcion: "Un juego de ganzúas, limas pequeñas, espejos, tijeras y alicates." },
  { nombre: "Herramientas de artesano (un juego de tu elección)", categoria: "herramienta", peso: 5, valor: 15 },
  { nombre: "Instrumento musical (a elegir)", categoria: "herramienta", peso: 2, valor: 15, descripcion: "Un instrumento musical a tu elección." },
  { nombre: "Instrumento musical (uno de tu elección)", categoria: "herramienta", peso: 2, valor: 15, descripcion: "Un instrumento musical a tu elección." },
  { nombre: "Kit de disfraz", categoria: "herramienta", peso: 3, valor: 25, descripcion: "Cosméticos, tintes para el pelo y pequeños accesorios." },
  { nombre: "Kit de herboristería", categoria: "herramienta", peso: 3, valor: 5, descripcion: "Pinzas, mortero, bolsas y frascos para herboristería." },
  // ── Ropa ──
  { nombre: "Vestiduras", categoria: "equipo_aventurero", peso: 3, valor: 1 },
  { nombre: "Muda de ropas comunes", categoria: "equipo_aventurero", peso: 3, valor: 0.5 },
  { nombre: "Muda de ropas finas", categoria: "equipo_aventurero", peso: 6, valor: 15 },
  { nombre: "Muda de ropas de viaje", categoria: "equipo_aventurero", peso: 4, valor: 2 },
  { nombre: "Muda de ropas oscuras y comunes con capucha", categoria: "equipo_aventurero", peso: 3, valor: 0.5 },
  { nombre: "Ropas que cambian sutilmente de color con la luz", categoria: "equipo_aventurero", peso: 3, valor: 2 },
  { nombre: "Disfraz", categoria: "equipo_aventurero", peso: 3, valor: 5 },
  { nombre: "Disfraz de feria", categoria: "equipo_aventurero", peso: 3, valor: 5 },
  // ── Objetos varios ──
  { nombre: "5 varas de incienso", categoria: "equipo_aventurero", peso: 0, valor: 1 },
  { nombre: "Manta de invierno", categoria: "equipo_aventurero", peso: 3, valor: 0.5 },
  { nombre: "Palanca", categoria: "equipo_aventurero", peso: 5, valor: 2 },
  { nombre: "Pala", categoria: "equipo_aventurero", peso: 5, valor: 2 },
  { nombre: "Olla de hierro", categoria: "equipo_aventurero", peso: 10, valor: 2 },
  { nombre: "Frasco de tinta negra", categoria: "equipo_aventurero", peso: 0, valor: 10 },
  { nombre: "Pluma", categoria: "equipo_aventurero", peso: 0, valor: 0.02 },
  { nombre: "Cuchillo pequeño", categoria: "equipo_aventurero", peso: 0.5, valor: 0.1 },
  { nombre: "15 metros de cuerda de seda", categoria: "equipo_aventurero", peso: 5, valor: 10 },
  { nombre: "Trampa para cazar", categoria: "equipo_aventurero", peso: 25, valor: 5 },
  { nombre: "Carpa pequeña plegable", categoria: "equipo_aventurero", peso: 20, valor: 2 },
  { nombre: "Martillo de carpintero", categoria: "equipo_aventurero", peso: 3, valor: 1 },
  // ── Tokens / objetos de trasfondo ──
  { nombre: "Insignia de rango", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Trofeo tomado de un enemigo caído (daga, hoja rota o trozo de estandarte)", categoria: "equipo_aventurero", peso: 1, valor: 0 },
  { nombre: "Trofeo de un animal que mataste", categoria: "equipo_aventurero", peso: 1, valor: 0 },
  { nombre: "Juego de dados de hueso o baraja de cartas", categoria: "equipo_aventurero", peso: 0, valor: 0.1 },
  { nombre: "Anillo de sello", categoria: "equipo_aventurero", peso: 0, valor: 5 },
  { nombre: "Pergamino con el árbol genealógico", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Carta de un colega difunto con una pregunta que aún no has podido responder", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Carta de presentación de tu gremio", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "El favor de un admirador (carta de amor, mechón de pelo o baratija)", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Herramientas de estafa (diez botellas tapadas con líquidos de colores, un conjunto de dados trucados, una baraja de cartas marcadas o un anillo de sello de un duque imaginario)", categoria: "equipo_aventurero", peso: 3, valor: 0 },
  { nombre: "Mapa de la ciudad en la que creciste", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Mascota ratón", categoria: "otro", peso: 0, valor: 0 },
  { nombre: "Recuerdo de tus padres", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Amuleto de la suerte (conejo, piedrecita o similar)", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Bolsa con 5 po", categoria: "equipo_aventurero", peso: 0.1, valor: 5, descripcion: "Una bolsa con 5 monedas de oro." },
  { nombre: "Bolsa con 8 po", categoria: "equipo_aventurero", peso: 0.16, valor: 8, descripcion: "Una bolsa con 8 monedas de oro." },
  { nombre: "Piedra de toque feérica (pequeño objeto del Feywild)", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Frasquito de polvo de hada (decorativo)", categoria: "equipo_aventurero", peso: 0, valor: 0 },
  { nombre: "Diario de sueños feéricos", categoria: "equipo_aventurero", peso: 1, valor: 1 },
  { nombre: "Recuerdo del carnaval (pluma iridiscente, entrada mágica, etc.)", categoria: "equipo_aventurero", peso: 0, valor: 0 },
];

// ─── Mapeo de nombres de objetos genéricos de elección ───────────────
// Los "a elegir" se almacenan como están; el jugador los concreta luego.
const GENERIC_CHOICES: SrdItemTemplate[] = [
  { nombre: "Arma marcial (a elegir)", categoria: "arma", peso: 3, valor: 15, descripcion: "Un arma marcial a tu elección." },
  { nombre: "Arma marcial cuerpo a cuerpo (a elegir)", categoria: "arma", peso: 3, valor: 15, descripcion: "Un arma marcial cuerpo a cuerpo a tu elección." },
  { nombre: "Arma sencilla (a elegir)", categoria: "arma", peso: 2, valor: 2, descripcion: "Un arma sencilla a tu elección." },
  { nombre: "Arma sencilla cuerpo a cuerpo (a elegir)", categoria: "arma", peso: 2, valor: 2, descripcion: "Un arma sencilla cuerpo a cuerpo a tu elección." },
];

// ─── Índice de búsqueda ──────────────────────────────────────────────

const ALL_TEMPLATES: SrdItemTemplate[] = [
  ...WEAPONS,
  ...ARMORS,
  ...SHIELDS,
  ...AMMO,
  ...ADVENTURING_GEAR,
  ...GENERIC_CHOICES,
];

/** Mapa de búsqueda rápida: nombre (minúsculas) → plantilla */
const ITEM_INDEX = new Map<string, SrdItemTemplate>();
for (const tpl of ALL_TEMPLATES) {
  ITEM_INDEX.set(tpl.nombre.toLowerCase(), tpl);
}

// ─── API pública ─────────────────────────────────────────────────────

/**
 * Busca un objeto SRD por su nombre exacto (case-insensitive).
 * Devuelve la plantilla con categoría, peso, detalles de arma/armadura, etc.
 */
export function findSrdItem(nombre: string): SrdItemTemplate | undefined {
  return ITEM_INDEX.get(nombre.toLowerCase());
}

/**
 * Devuelve todas las plantillas de items SRD.
 */
export function getAllSrdItems(): SrdItemTemplate[] {
  return ALL_TEMPLATES;
}
