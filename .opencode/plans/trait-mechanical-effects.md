# Efectos Mecanicos de Rasgos — Plan de Implementacion

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Que los rasgos raciales, de clase y de subclase que otorgan bonificaciones mecanicas (CA, velocidad, resistencias, competencias, salvaciones, iniciativa, PG extra, usos limitados) se apliquen automaticamente al personaje, tanto en la creacion como al subir de nivel.

**Architecture:** Enriquecer las interfaces de datos SRD (`LevelFeature`, `SubclassFeatureDetail`, `RaceTrait`) con un campo opcional `efectos: TraitEffect[]` que contiene efectos mecanicos tipados. Los builders (`buildCharacterTraits`, `buildNewTraits`, `buildSubclassTraits`) leen estos efectos y los aplican al personaje. Los getters del store (`getArmorClass`, `getSavingThrowBonus`, etc.) consultan los rasgos del personaje para computar valores derivados. Los campos del personaje (`speed`, `darkvision`, `damageModifiers`, `proficiencies`, `savingThrows`) se actualizan durante el level-up cuando hay efectos aplicables.

**Tech Stack:** TypeScript 5.9, Zustand 5, React Native / Expo

---

## Fase 0: Tipos y sistema de efectos

### Task 1: Definir el tipo `TraitEffect` y variantes

**Files:**

- Create: `src/types/traitEffects.ts`

**Step 1: Crear el archivo de tipos de efectos**

```typescript
// src/types/traitEffects.ts

import type { AbilityKey, DamageType, SkillKey } from "./character";

// ── Formulas de CA alternativas ──

export type ACFormula =
  | { type: "standard" } // 10 + DEX (default)
  | { type: "unarmoredDefense"; abilities: AbilityKey[] } // 10 + DEX + CON/WIS/CHA
  | { type: "naturalArmor"; baseAC: number }; // baseAC + DEX (ej. Draconic 13+DEX)

export interface ACFormulaEffect {
  kind: "acFormula";
  /** Formula de CA sin armadura */
  formula: ACFormula;
  /** Permite usar escudo con esta formula? */
  allowShield: boolean;
}

export interface ACBonusEffect {
  kind: "acBonus";
  /** Bonificador plano a la CA */
  bonus: number;
  /** Condicion textual (ej. "con armadura pesada") */
  condition?: string;
}

// ── Velocidad ──

export interface SpeedBonusEffect {
  kind: "speedBonus";
  /** Bonificador a velocidad base (en pies) */
  walkBonus?: number;
  /** Establece velocidad de nado */
  swim?: number | "walk";
  /** Establece velocidad de trepar */
  climb?: number | "walk";
  /** Establece velocidad de vuelo */
  fly?: number;
  /** Condicion textual (ej. "sin armadura pesada") */
  condition?: string;
}

// ── Resistencias / Inmunidades ──

export interface DamageModifierEffect {
  kind: "damageModifier";
  damageType: DamageType;
  modifier: "resistance" | "immunity" | "vulnerability";
}

// ── Competencias ──

export interface ProficiencyEffect {
  kind: "proficiency";
  armors?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
}

// ── Competencia en habilidades ──

export interface SkillProficiencyEffect {
  kind: "skillProficiency";
  skills: SkillKey[];
  level: "proficient" | "expertise";
}

// ── Competencia en salvaciones ──

export interface SavingThrowProficiencyEffect {
  kind: "savingThrowProficiency";
  abilities: AbilityKey[] | "all";
}

// ── Bonificador a iniciativa ──

export interface InitiativeBonusEffect {
  kind: "initiativeBonus";
  /** Caracteristica que se suma a la iniciativa */
  abilityBonus?: AbilityKey;
  /** Bonificador fijo */
  flatBonus?: number;
  /** Usa el bonificador de competencia? */
  addProficiencyBonus?: boolean;
}

// ── PG extra ──

export interface HPBonusEffect {
  kind: "hpBonus";
  /** PG extra por nivel de la clase (ej. Resiliencia Draconica = 1) */
  perLevel: number;
  /** PG extra plano al obtener el rasgo */
  flat?: number;
}

// ── Vision en la oscuridad ──

export interface DarkvisionEffect {
  kind: "darkvision";
  /** Rango en pies. Si el personaje ya tiene darkvision, usa el mayor. */
  range: number;
  /** Sumar al rango existente en vez de reemplazar? */
  additive?: boolean;
}

// ── Usos limitados (para rasgos que deberian tener tracking) ──

export interface LimitedUseEffect {
  kind: "limitedUse";
  /** Usos maximos (puede ser un numero fijo o "proficiencyBonus") */
  maxUses: number | "proficiencyBonus";
  /** Tipo de recarga */
  recharge: "short_rest" | "long_rest" | "dawn";
}

// ── Union discriminada ──

export type TraitEffect =
  | ACFormulaEffect
  | ACBonusEffect
  | SpeedBonusEffect
  | DamageModifierEffect
  | ProficiencyEffect
  | SkillProficiencyEffect
  | SavingThrowProficiencyEffect
  | InitiativeBonusEffect
  | HPBonusEffect
  | DarkvisionEffect
  | LimitedUseEffect;
```

**Step 2: Re-exportar desde `src/types/index.ts`**

Anadir la linea:

```typescript
export * from "./traitEffects";
```

---

### Task 2: Extender las interfaces SRD con campo `efectos`

**Files:**

- Modify: `src/data/srd/subclassFeatures/types.ts`
- Modify: `src/data/srd/leveling.ts` (interface `LevelFeature`)
- Modify: `src/data/srd/races.ts` (interface `RaceTrait`)

**Step 1: Anadir `efectos` a `SubclassFeatureDetail`**

En `src/data/srd/subclassFeatures/types.ts`, agregar a la interfaz `SubclassFeatureDetail` (linea 32-39):

```typescript
import type { TraitEffect } from "@/types/traitEffects";

export interface SubclassFeatureDetail {
  nombre: string;
  descripcion: string;
  elecciones?: SubclassFeatureChoice[];
  /** Efectos mecanicos estructurados (opcional) */
  efectos?: TraitEffect[];
}
```

**Step 2: Anadir `efectos` a `LevelFeature`**

En `src/data/srd/leveling.ts`, modificar la interfaz `LevelFeature` (linea 82-88):

```typescript
import type { TraitEffect } from "@/types/traitEffects";

export interface LevelFeature {
  nombre: string;
  descripcion: string;
  nivel: number;
  esSubclase?: boolean;
  /** Efectos mecanicos estructurados (opcional) */
  efectos?: TraitEffect[];
}
```

**Step 3: Anadir `efectos` a `RaceTrait`**

En `src/data/srd/races.ts`, modificar la interfaz `RaceTrait` (linea 11-14):

```typescript
import type { TraitEffect } from "@/types/traitEffects";

export interface RaceTrait {
  nombre: string;
  descripcion: string;
  /** Efectos mecanicos estructurados (opcional) */
  efectos?: TraitEffect[];
}
```

---

### Task 3: Extender la interfaz `Trait` del personaje

**Files:**

- Modify: `src/types/character.ts` (interface `Trait`, lineas 300-311)

**Step 1: Anadir `efectos` al Trait almacenado**

```typescript
import type { TraitEffect } from "./traitEffects";

export interface Trait {
  id: string;
  nombre: string;
  descripcion: string;
  origen: "raza" | "clase" | "subclase" | "trasfondo" | "dote" | "manual";
  maxUses: number | null;
  currentUses: number | null;
  recharge: "short_rest" | "long_rest" | "dawn" | null;
  /** Efectos mecanicos del rasgo (vacio o undefined = sin efecto mecanico) */
  efectos?: TraitEffect[];
}
```

---

## Fase 1: Poblar datos SRD con efectos

### Task 4: Efectos de rasgos de CLASE en `leveling.ts`

**Files:**

- Modify: `src/data/srd/leveling.ts`

Anadir `efectos` a los rasgos de clase que tienen impacto mecanico dentro de `CLASS_LEVEL_FEATURES`. Lista exhaustiva:

**Barbaro:**

- "Defensa sin Armadura" (nivel 1): `efectos: [{ kind: "acFormula", formula: { type: "unarmoredDefense", abilities: ["des", "con"] }, allowShield: true }]`
- "Movimiento Rapido" (nivel 5): `efectos: [{ kind: "speedBonus", walkBonus: 10, condition: "sin armadura pesada" }]`

**Monje:**

- "Defensa sin Armadura" (nivel 1): `efectos: [{ kind: "acFormula", formula: { type: "unarmoredDefense", abilities: ["des", "sab"] }, allowShield: false }]`
- "Movimiento sin Armadura" (nivel 2): `efectos: [{ kind: "speedBonus", walkBonus: 10, condition: "sin armadura ni escudo" }]`
  - NOTA: El bonus escala con el nivel. El getter usara una tabla de lookup (ver Task 23).
- "Superviviente Disciplinado" (nivel 14): `efectos: [{ kind: "savingThrowProficiency", abilities: "all" }]`

**Explorador (Ranger):**

- "Recorrer Tierras" (nivel 6): `efectos: [{ kind: "speedBonus", walkBonus: 10, swim: "walk", climb: "walk" }]`

**Picaro:**

- "Mente Escurridiza" (nivel 15): `efectos: [{ kind: "savingThrowProficiency", abilities: ["sab", "car"] }]`

Buscar todos los demas rasgos de clase con mecanica en `CLASS_LEVEL_FEATURES` y agregar efectos correspondientes.

---

### Task 5: Efectos de rasgos de SUBCLASE — archivos `subclassFeatures/*.ts`

**Files:**

- Modify: 12 archivos en `src/data/srd/subclassFeatures/`

Para cada subclase, anadir el campo `efectos` a los rasgos con impacto mecanico:

**hechicero.ts — Linaje Draconico:**

- "Resiliencia Draconica" (nv1): `efectos: [{ kind: "acFormula", formula: { type: "naturalArmor", baseAC: 13 }, allowShield: true }, { kind: "hpBonus", perLevel: 1, flat: 0 }]`

**hechicero.ts — Alma de la Tormenta:**

- "Corazon de la Tormenta": `efectos: [{ kind: "damageModifier", damageType: "rayo", modifier: "resistance" }, { kind: "damageModifier", damageType: "trueno", modifier: "resistance" }]`

**hechicero.ts — Sombra:**

- "Ojos del Oscuro": `efectos: [{ kind: "darkvision", range: 120 }]`

**bardo.ts — Colegio de la Danza:**

- "Gracia Deslumbrante" (nv3): `efectos: [{ kind: "acFormula", formula: { type: "unarmoredDefense", abilities: ["des", "car"] }, allowShield: false }, { kind: "speedBonus", walkBonus: 10, condition: "sin armadura ni escudo" }]`

**clerigo.ts — Dominio de la Forja:**

- "Alma de la Forja" (nv6): `efectos: [{ kind: "acBonus", bonus: 1, condition: "con armadura pesada" }, { kind: "damageModifier", damageType: "fuego", modifier: "resistance" }]`
- "Santo de la Forja" (nv17): `efectos: [{ kind: "damageModifier", damageType: "fuego", modifier: "immunity" }, ... BPS resistance]`

**clerigo.ts — Dominio de la Tempestad:**

- "Nacido de la Tormenta" (nv17): `efectos: [{ kind: "speedBonus", fly: 30 }]`

**clerigo.ts — Dominio del Crepusculo:**

- "Ojos de la Noche": `efectos: [{ kind: "darkvision", range: 90 }]`

**clerigo.ts — Dominio de la Guerra:**

- "Avatar de Batalla" (nv17): `efectos: [{ kind: "damageModifier", damageType: "contundente", modifier: "resistance" }, ...]`

**brujo.ts — Hexblade:**

- Nota: `competenciasGanadas` ya existe en el SubclassLevelBlock. Eso se propagara a traves de la Task 9.

**brujo.ts — Celestial:**

- "Alma Radiante" (nv6): `efectos: [{ kind: "damageModifier", damageType: "radiante", modifier: "resistance" }]`

**brujo.ts — Archihada:**

- (Sin efectos mecanicos modelables como bonificadores numericos)

**brujo.ts — Infernal:**

- "Resistencia Infernal" (nv10): `efectos: [{ kind: "damageModifier", damageType: "fuego", modifier: "resistance" }]` (el tipo especifico lo elige el jugador, requiere choice)

**brujo.ts — Abismal:**

- "Don del Mar": `efectos: [{ kind: "speedBonus", swim: 40 }]`
- "Alma Oceanica" (nv6): `efectos: [{ kind: "damageModifier", damageType: "frio", modifier: "resistance" }]`

**monje.ts — Yo Astral:**

- "Yo Astral Despierto" (nv17): `efectos: [{ kind: "acBonus", bonus: 2 }]`

**monje.ts — Sombra:**

- "Artes de las Sombras": `efectos: [{ kind: "darkvision", range: 60, additive: true }]`

**monje.ts — Elementos:**

- "Zancada Elemental" (nv11): `efectos: [{ kind: "speedBonus", fly: ..., swim: ... }]`

**picaro.ts — Espadachin:**

- "Audacia Temeraria" (nv3): `efectos: [{ kind: "initiativeBonus", abilityBonus: "car" }]`

**picaro.ts — Explorador:**

- "Movilidad Superior" (nv9): `efectos: [{ kind: "speedBonus", walkBonus: 10, swim: ..., climb: ... }]`

**picaro.ts — Ladron:**

- "Trabajo en Alturas": `efectos: [{ kind: "speedBonus", climb: "walk" }]`

**mago.ts — Mago de Guerra:**

- "Ingenio Tactico" (nv2): `efectos: [{ kind: "initiativeBonus", abilityBonus: "int" }]`
- "Magia Duradera" (nv10): `efectos: [{ kind: "acBonus", bonus: 2, condition: "durante concentracion" }]`

**mago.ts — Necromancia:**

- "Acostumbrado a la No Muerte" (nv10): `efectos: [{ kind: "damageModifier", damageType: "necrotico", modifier: "resistance" }]`

**explorador.ts — Gloom Stalker:**

- "Emboscador Temible" (nv3): `efectos: [{ kind: "initiativeBonus", abilityBonus: "sab" }, { kind: "darkvision", range: 60, additive: true }]`

**explorador.ts — Errante Feerico:**

- "Encanto Sobrenatural" (nv3): (Ya modelado en skillRollModifiers.ts, no necesita efecto aqui)

**explorador.ts — Enjambre:**

- "Enjambre" (nv7): `efectos: [{ kind: "speedBonus", fly: 10 }]`

**paladin.ts — Gloria:**

- "Aura de Presteza" (nv7): `efectos: [{ kind: "speedBonus", walkBonus: 10 }]`

**paladin.ts — Ancestros:**

- "Aura de Custodia" (nv7): `efectos: [{ kind: "damageModifier", damageType: "necrotico", modifier: "resistance" }, { kind: "damageModifier", damageType: "psiquico", modifier: "resistance" }, { kind: "damageModifier", damageType: "radiante", modifier: "resistance" }]`

**guerrero.ts — Samurai:**

- "Cortesano Elegante" (nv7): `efectos: [{ kind: "savingThrowProficiency", abilities: ["sab"] }]`
  - Nota: El bonus a Persuasion ya esta en skillRollModifiers.ts.

**druida.ts — Tierra:**

- "Proteccion de la Naturaleza" (nv10): `efectos: [{ kind: "damageModifier", damageType: "veneno", modifier: "immunity" }]`

**druida.ts — Mar:**

- "Afinidad Acuatica" (nv6): `efectos: [{ kind: "speedBonus", swim: "walk" }]`
- "Hijo de la Tormenta" (nv10): `efectos: [{ kind: "speedBonus", fly: 30 }, { kind: "damageModifier", damageType: "frio", modifier: "resistance" }, { kind: "damageModifier", damageType: "rayo", modifier: "resistance" }, { kind: "damageModifier", damageType: "trueno", modifier: "resistance" }]`

**druida.ts — Estrellas:**

- "Lleno de Estrellas" (nv14): `efectos: [{ kind: "damageModifier", damageType: "contundente", modifier: "resistance" }, ...]`

**druida.ts — Esporas:**

- "Cuerpo Fungico" (nv14): Inmunidades a condiciones (no modelables con el sistema actual).

**barbaro.ts:** Revisar subclases del barbaro si tienen efectos mecanicos modelables.

---

### Task 6: Efectos de rasgos RACIALES en `races.ts`

**Files:**

- Modify: `src/data/srd/races.ts`

Anadir `efectos` a los `RaceTrait`:

- **Enano — "Resistencia Enana"**: `efectos: [{ kind: "damageModifier", damageType: "veneno", modifier: "resistance" }]`
- **Mediano Fornido — "Resistencia de los Fornidos"**: `efectos: [{ kind: "damageModifier", damageType: "veneno", modifier: "resistance" }]`
- **Semiorco — "Aguante Incansable"**: `efectos: [{ kind: "limitedUse", maxUses: 1, recharge: "long_rest" }]`
- **Draconido — "Ataque de Aliento"**: `efectos: [{ kind: "limitedUse", maxUses: "proficiencyBonus", recharge: "long_rest" }]`
- **Liebren — "Reflejos de Liebre"**: `efectos: [{ kind: "initiativeBonus", addProficiencyBonus: true }]`
- **Liebren — "Salto Liebren"**: `efectos: [{ kind: "limitedUse", maxUses: "proficiencyBonus", recharge: "long_rest" }]`
- **Liebren — "Suerte Caprichosa"**: `efectos: [{ kind: "limitedUse", maxUses: "proficiencyBonus", recharge: "long_rest" }]`
- **Tiefling — rasgo de resistencia al fuego**: `efectos: [{ kind: "damageModifier", damageType: "fuego", modifier: "resistance" }]`

Nota: Las resistencias raciales estan actualmente hardcodeadas en `creationStore.ts:724-758`. Con los efectos en los datos, ese hardcodeo se podra eliminar (Task 21).

---

## Fase 2: Builders — Transferir efectos de datos a Trait del personaje

### Task 7: Actualizar `buildCharacterTraits()` para propagar efectos

**Files:**

- Modify: `src/stores/characterBuilderHelpers.ts` (funcion `buildCharacterTraits`, lineas 185-239)

**Step 1: Propagar `efectos` de RaceTrait/LevelFeature a Trait**

En cada construccion de Trait, anadir el campo `efectos`:

```typescript
efectos: trait.efectos?.length ? trait.efectos : undefined,
```

**Step 2: Aplicar efectos `limitedUse` para poblar maxUses/recharge**

Despues de crear cada Trait, si contiene un efecto `limitedUse`, resolver `maxUses` y `recharge`:

```typescript
const limitedUse = (trait.efectos ?? []).find(
  (e) => e.kind === "limitedUse",
) as LimitedUseEffect | undefined;
if (limitedUse) {
  const resolvedMaxUses =
    limitedUse.maxUses === "proficiencyBonus"
      ? calcProficiencyBonus(1) // nivel 1 en creacion
      : limitedUse.maxUses;
  newTrait.maxUses = resolvedMaxUses;
  newTrait.currentUses = resolvedMaxUses;
  newTrait.recharge = limitedUse.recharge;
}
```

---

### Task 8: Actualizar `buildNewTraits()` para propagar efectos

**Files:**

- Modify: `src/stores/characterStore/levelUpHelpers.ts` (funcion `buildNewTraits`, lineas 134-173)

**Step 1:** En el `.map()` que genera traits, anadir:

```typescript
efectos: f.efectos?.length ? f.efectos : undefined,
```

**Step 2:** Aplicar logica `limitedUse` con el nivel correcto.

---

### Task 9: Actualizar `buildSubclassTraits()` para propagar efectos

**Files:**

- Modify: `src/stores/characterStore/levelUpHelpers.ts` (funcion `buildSubclassTraits`, lineas 187-272)

**Step 1:** En el loop de rasgos, anadir `efectos`:

```typescript
efectos: rasgo.efectos?.length ? rasgo.efectos : undefined,
```

**Step 2:** Aplicar logica `limitedUse`.

**Step 3:** Si `subLevelBlock.competenciasGanadas` existe, generar un efecto `proficiency` en el Trait en vez de solo texto:

```typescript
efectos: [{
  kind: "proficiency" as const,
  armors: comp.armaduras,
  weapons: comp.armas,
  tools: comp.herramientas,
}],
```

---

## Fase 3: Aplicar efectos al personaje durante level-up

### Task 10: Crear funcion `computeTraitEffectMutations()`

**Files:**

- Create: `src/utils/traitEffects.ts`

Funcion pura que toma un `Character` y un array de `Trait[]` nuevos, y retorna las mutaciones necesarias:

```typescript
import type {
  Character,
  DamageModifier,
  SpeedInfo,
  Proficiencies,
  AbilityKey,
} from "@/types/character";
import type { Trait } from "@/types/character";
import type { TraitEffect } from "@/types/traitEffects";

export interface TraitEffectMutations {
  speedUpdates?: Partial<SpeedInfo>;
  newDamageModifiers?: DamageModifier[];
  newProficiencies?: Partial<Proficiencies>;
  savingThrowChanges?: { ability: AbilityKey; proficient: boolean }[];
  darkvisionUpdate?: number;
  hpBonusFromTraits?: number;
  // Nota: acFormula, acBonus, initiativeBonus se aplican en tiempo de lectura (getters), no aqui
}

export function computeTraitEffectMutations(
  character: Character,
  newTraits: Trait[],
): TraitEffectMutations {
  const mutations: TraitEffectMutations = {};
  const speedUpdates: Partial<SpeedInfo> = {};
  const newDamageModifiers: DamageModifier[] = [];
  const newProficiencies: Partial<Proficiencies> = {
    armors: [],
    weapons: [],
    tools: [],
    languages: [],
  };
  const savingThrowChanges: { ability: AbilityKey; proficient: boolean }[] = [];
  let darkvisionUpdate: number | undefined;
  let hpBonusFromTraits = 0;

  for (const trait of newTraits) {
    if (!trait.efectos) continue;
    for (const effect of trait.efectos) {
      switch (effect.kind) {
        case "speedBonus":
          if (effect.walkBonus)
            speedUpdates.walk = (speedUpdates.walk ?? 0) + effect.walkBonus;
          // swim, climb, fly logic...
          break;
        case "damageModifier":
          newDamageModifiers.push({
            type: effect.damageType,
            modifier: effect.modifier,
            source: trait.nombre,
          });
          break;
        case "proficiency":
          if (effect.armors) newProficiencies.armors!.push(...effect.armors);
          if (effect.weapons) newProficiencies.weapons!.push(...effect.weapons);
          if (effect.tools) newProficiencies.tools!.push(...effect.tools);
          if (effect.languages)
            newProficiencies.languages!.push(...effect.languages);
          break;
        case "savingThrowProficiency":
          if (effect.abilities === "all") {
            const allAbilities: AbilityKey[] = [
              "fue",
              "des",
              "con",
              "int",
              "sab",
              "car",
            ];
            allAbilities.forEach((a) =>
              savingThrowChanges.push({ ability: a, proficient: true }),
            );
          } else {
            effect.abilities.forEach((a) =>
              savingThrowChanges.push({ ability: a, proficient: true }),
            );
          }
          break;
        case "darkvision":
          if (effect.additive) {
            darkvisionUpdate = (character.darkvision || 0) + effect.range;
          } else {
            darkvisionUpdate = Math.max(darkvisionUpdate ?? 0, effect.range);
          }
          break;
        case "hpBonus":
          hpBonusFromTraits +=
            effect.perLevel * character.nivel + (effect.flat ?? 0);
          break;
        // acFormula, acBonus, initiativeBonus: handled by getters, not mutations
      }
    }
  }

  if (Object.keys(speedUpdates).length > 0)
    mutations.speedUpdates = speedUpdates;
  if (newDamageModifiers.length > 0)
    mutations.newDamageModifiers = newDamageModifiers;
  if (Object.values(newProficiencies).some((arr) => arr && arr.length > 0))
    mutations.newProficiencies = newProficiencies;
  if (savingThrowChanges.length > 0)
    mutations.savingThrowChanges = savingThrowChanges;
  if (darkvisionUpdate !== undefined)
    mutations.darkvisionUpdate = darkvisionUpdate;
  if (hpBonusFromTraits > 0) mutations.hpBonusFromTraits = hpBonusFromTraits;

  return mutations;
}
```

---

### Task 11: Integrar `computeTraitEffectMutations` en `levelUp()`

**Files:**

- Modify: `src/stores/characterStore/progressionSlice.ts` (funcion `levelUp`, lineas 99-198)

**Step 1:** Despues de construir `newTraits` (linea 130), llamar a `computeTraitEffectMutations()`:

```typescript
import { computeTraitEffectMutations } from "@/utils/traitEffects";

// Dentro de levelUp(), despues de newTraits:
const effectMutations = computeTraitEffectMutations(updatedChar, newTraits);
```

**Step 2:** Aplicar las mutaciones al `updatedChar` (entre lineas 132-148):

```typescript
// Speed: aplicar bonificadores acumulados a la velocidad base
if (effectMutations.speedUpdates) {
  const s = updatedChar.speed;
  updatedChar = {
    ...updatedChar,
    speed: {
      walk: s.walk + (effectMutations.speedUpdates.walk ?? 0),
      ...(effectMutations.speedUpdates.swim !== undefined ||
      s.swim !== undefined
        ? { swim: effectMutations.speedUpdates.swim ?? s.swim }
        : {}),
      ...(effectMutations.speedUpdates.climb !== undefined ||
      s.climb !== undefined
        ? { climb: effectMutations.speedUpdates.climb ?? s.climb }
        : {}),
      ...(effectMutations.speedUpdates.fly !== undefined || s.fly !== undefined
        ? { fly: effectMutations.speedUpdates.fly ?? s.fly }
        : {}),
    },
  };
}

// Damage modifiers
if (effectMutations.newDamageModifiers?.length) {
  updatedChar = {
    ...updatedChar,
    damageModifiers: [
      ...updatedChar.damageModifiers,
      ...effectMutations.newDamageModifiers,
    ],
  };
}

// Proficiencies (merge sin duplicados)
if (effectMutations.newProficiencies) {
  const p = updatedChar.proficiencies;
  updatedChar = {
    ...updatedChar,
    proficiencies: {
      armors: [
        ...new Set([
          ...p.armors,
          ...(effectMutations.newProficiencies.armors ?? []),
        ]),
      ],
      weapons: [
        ...new Set([
          ...p.weapons,
          ...(effectMutations.newProficiencies.weapons ?? []),
        ]),
      ],
      tools: [
        ...new Set([
          ...p.tools,
          ...(effectMutations.newProficiencies.tools ?? []),
        ]),
      ],
      languages: [
        ...new Set([
          ...p.languages,
          ...(effectMutations.newProficiencies.languages ?? []),
        ]),
      ],
    },
  };
}

// Saving throws
if (effectMutations.savingThrowChanges?.length) {
  const st = { ...updatedChar.savingThrows };
  for (const change of effectMutations.savingThrowChanges) {
    st[change.ability] = {
      ...st[change.ability],
      proficient: change.proficient,
      source: "clase",
    };
  }
  updatedChar = { ...updatedChar, savingThrows: st };
}

// Darkvision
if (effectMutations.darkvisionUpdate !== undefined) {
  updatedChar = {
    ...updatedChar,
    darkvision: Math.max(
      updatedChar.darkvision,
      effectMutations.darkvisionUpdate,
    ),
  };
}

// HP bonus from traits (ej. Resiliencia Draconica +1/nivel retroactivo)
if (effectMutations.hpBonusFromTraits) {
  updatedChar = {
    ...updatedChar,
    hp: {
      ...updatedChar.hp,
      max: updatedChar.hp.max + effectMutations.hpBonusFromTraits,
      current: updatedChar.hp.current + effectMutations.hpBonusFromTraits,
    },
  };
}
```

---

### Task 12: Integrar efectos en `buildCharacter()` de creacion

**Files:**

- Modify: `src/stores/creationStore.ts` (funcion `buildCharacter`, lineas 629-848)

**Step 1:** Despues de construir los traits (~linea 713), llamar a `computeTraitEffectMutations()` para aplicar efectos de rasgos raciales y de clase nivel 1.

**Step 2:** Reemplazar los bloques hardcodeados de resistencias raciales (lineas 724-758) con la lectura de efectos `damageModifier` de los traits construidos. Mantener el fallback para razas personalizadas.

**Step 3:** Aplicar speed, darkvision, proficiencies, saving throws desde las mutaciones en vez de solo desde los campos de RaceData.

---

## Fase 4: Getters del store — Lectura de efectos en tiempo real

### Task 13: Refactorizar `getArmorClass()` para usar efectos de CA

**Files:**

- Modify: `src/stores/characterStore/characterCrudSlice.ts` (funcion `getArmorClass`, lineas 237-276)

Logica:

1. Recopilar todas las `acFormula` y `acBonus` de `character.traits`
2. Si lleva armadura equipada: usar reglas de armadura normales (no aplica formula alternativa)
3. Si NO lleva armadura: evaluar cada `acFormula` y usar la mayor:
   - `unarmoredDefense`: 10 + sum(abilities modifiers)
   - `naturalArmor`: baseAC + DEX mod
4. Aplicar escudo si lo permite la formula
5. Sumar `acBonus` planos (evaluando condiciones como "con armadura pesada")

Ver pseudocodigo completo en la seccion de investigacion.

---

### Task 14: Crear getter `getInitiativeBonus()`

**Files:**

- Modify: `src/stores/characterStore/characterCrudSlice.ts`
- Modify: `src/stores/characterStore/types.ts` (anadir a `CharacterCrudActions`)

Implementacion:

- Base = DES modifier
- Iterar `character.traits` buscando efectos `initiativeBonus`
- Sumar `abilityBonus`, `flatBonus`, `addProficiencyBonus`

---

### Task 15: Crear getter `getEffectiveSpeed()`

**Files:**

- Modify: `src/stores/characterStore/characterCrudSlice.ts`
- Modify: `src/stores/characterStore/types.ts`

Implementacion:

- Base = `character.speed`
- Iterar traits con `speedBonus` y acumular bonificadores
- Caso especial: Monje "Movimiento sin Armadura" usa tabla de escalado (Task 23)

---

## Fase 5: Actualizar la UI para usar los nuevos getters

### Task 16: Componentes que muestran CA (verificar)

**Files:**

- `src/components/character/CombatTab.tsx`
- `app/character/[id].tsx`
- `app/campaigns/[id]/character/sheet.tsx`

Estos ya llaman a `getArmorClass()`. Si el getter fue actualizado correctamente, deberian funcionar sin cambios. Verificar.

---

### Task 17: Componentes que muestran Iniciativa

**Files:**

- Modify: `src/components/character/CombatTab.tsx` (lineas 155-168)
- Modify: `app/master/character-view.tsx` (lineas 567-568)

Cambiar de `character.abilityScores.des.modifier` a `getInitiativeBonus()`.

---

### Task 18: Componentes que muestran Velocidad

**Files:**

- Modify: `src/components/character/OverviewTab.tsx` (lineas 337-356)
- Modify: `src/components/character/CombatTab.tsx` (lineas 176-177)
- Modify: `app/character/[id].tsx` (~linea 872)
- Modify: `app/campaigns/[id]/character/sheet.tsx` (~linea 749)
- Modify: `app/master/character-view.tsx` (~linea 560)

Cambiar de `character.speed.walk` a `getEffectiveSpeed().walk` (y equivalentes para swim/climb/fly).

---

### Task 19: Mostrar resistencias en la ficha del jugador

**Files:**

- Modify: `src/components/character/CombatTab.tsx`

Anadir seccion que muestre `character.damageModifiers` si tiene elementos. Actualmente solo se muestra en la vista del master.

---

## Fase 6: Corregir bugs existentes

### Task 20: Fix Hill Dwarf HP bonus en level-up

**Files:**

- Modify: `src/stores/characterStore/levelUpHelpers.ts` (`applyHPGain`, lineas 55-69)
- Modify: `src/stores/characterStore/progressionSlice.ts` (call site)

Anadir parametro `hpBonusPerLevel` a `applyHPGain`:

```typescript
export function applyHPGain(
  character: Character,
  options: Pick<LevelUpOptions, "hpMethod" | "hpRolled">,
  dieSides: number,
  hpBonusPerLevel: number = 0,
): HPGainResult {
  // ... calculo existente ...
  const hpGained = Math.max(1, hpRoll + conMod) + hpBonusPerLevel;
  return { hpRoll, hpGained, conMod };
}
```

En `progressionSlice.ts`:

```typescript
const subraceData = character.subraza
  ? getSubraceData(character.raza, character.subraza)
  : null;
const hpBonusPerLevel = subraceData?.hpBonusPerLevel ?? 0;
const { hpGained, conMod } = applyHPGain(
  character,
  options,
  dieSides,
  hpBonusPerLevel,
);
```

---

### Task 21: Eliminar hardcodeo de resistencias raciales en creationStore

**Files:**

- Modify: `src/stores/creationStore.ts` (lineas 724-758)

Reemplazar los bloques `if (draft.raza === "enano")` etc. con lectura generica de efectos `damageModifier` desde los traits construidos. Mantener fallback para razas personalizadas.

---

## Fase 7: Recursos de clase faltantes

### Task 22: Anadir estrategias para Bardo, Clerigo, Druida, Hechicero

**Files:**

- Modify: `src/stores/characterStore/classResourceStrategies.ts`
- Modify: `src/stores/characterStore/classResourceTypes.ts` (si se necesita extender ClassResourceFactory)

**Bardo — Inspiracion Bardica:**

```typescript
function bardoResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  // Nota: max deberia ser CHA mod (min 1), pero la factory solo recibe level.
  // Opcion 1: Usar un placeholder (3) y sobreescribirlo al cargar el personaje.
  // Opcion 2: Cambiar la firma de ClassResourceFactory para recibir character.
  // DECISION: Optar por opcion 2 si es factible, o usar opcion 1 como compromiso.
  resources.inspiracion_bardica = {
    id: "inspiracion_bardica",
    nombre: "Inspiracion Bardica",
    max: 3,
    current: 3,
    recovery: level >= 5 ? "short_rest" : "long_rest",
  };
  return resources;
}
```

**Clerigo — Canalizar Divinidad:**

```typescript
function clerigoResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  if (level >= 2) {
    resources.canalizar_divinidad = {
      id: "canalizar_divinidad",
      nombre: "Canalizar Divinidad",
      max: level >= 18 ? 3 : level >= 6 ? 2 : 1,
      current: level >= 18 ? 3 : level >= 6 ? 2 : 1,
      recovery: "short_rest",
    };
  }
  return resources;
}
```

**Druida — Forma Salvaje:**

```typescript
function druidaResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  if (level >= 2) {
    const UNLIMITED = 999;
    resources.forma_salvaje = {
      id: "forma_salvaje",
      nombre: "Forma Salvaje",
      max: level >= 20 ? UNLIMITED : 2,
      current: level >= 20 ? UNLIMITED : 2,
      recovery: "short_rest",
    };
  }
  return resources;
}
```

**Hechicero — Puntos de Hechiceria:**

```typescript
function hechiceroResources(level: number): Record<string, ClassResourceInfo> {
  const resources: Record<string, ClassResourceInfo> = {};
  if (level >= 2) {
    resources.puntos_hechiceria = {
      id: "puntos_hechiceria",
      nombre: "Puntos de Hechiceria",
      max: level,
      current: level,
      recovery: "long_rest",
    };
  }
  return resources;
}
```

Registrar en `CLASS_RESOURCE_REGISTRY`:

```typescript
bardo: bardoResources,
clerigo: clerigoResources,
druida: druidaResources,
hechicero: hechiceroResources,
```

---

## Fase 8: Velocidad del Monje (caso especial de escalado)

### Task 23: Tabla de velocidad del Monje y logica de escalado

**Files:**

- Modify: `src/data/srd/leveling.ts` (anadir tabla `MONK_SPEED_BONUS`)
- Modify: getter `getEffectiveSpeed()` en `characterCrudSlice.ts`

**Step 1: Tabla en leveling.ts:**

```typescript
export const MONK_SPEED_BONUS: Record<number, number> = {
  2: 10,
  3: 10,
  4: 10,
  5: 10,
  6: 15,
  7: 15,
  8: 15,
  9: 15,
  10: 20,
  11: 20,
  12: 20,
  13: 20,
  14: 25,
  15: 25,
  16: 25,
  17: 25,
  18: 30,
  19: 30,
  20: 30,
};
```

**Step 2: En `getEffectiveSpeed()`**, cuando el trait es "Movimiento sin Armadura" de monje, usar la tabla en vez del `walkBonus` del efecto.

---

## Fase 9: Tests

### Task 24: Tests para `getArmorClass` con formulas alternativas

Tests unitarios:

- Barbaro sin armadura: CA = 10 + DES + CON
- Monje sin armadura ni escudo: CA = 10 + DES + SAB
- Hechicero Draconico sin armadura: CA = 13 + DES
- Con armadura equipada: la formula alternativa NO aplica
- Multiples formulas: se usa la mayor
- Bonificadores planos se suman

### Task 25: Tests para `getInitiativeBonus`

- Sin bonificadores: retorna DES mod
- Con bonificador de habilidad: DES + ability
- Con bonificador de competencia: DES + prof bonus

### Task 26: Tests para `computeTraitEffectMutations`

- Efecto de velocidad
- Efecto de resistencia
- Efecto de competencia
- Efecto de salvacion
- Efecto de darkvision
- Efecto de HP

### Task 27: Tests para Hill Dwarf HP bonus

- `applyHPGain` con `hpBonusPerLevel: 1` anade +1

---

## Resumen de archivos tocados

| Archivo                                                | Accion                                                  |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `src/types/traitEffects.ts`                            | **CREAR**                                               |
| `src/types/index.ts`                                   | Modificar (re-export)                                   |
| `src/types/character.ts`                               | Modificar (`Trait.efectos`)                             |
| `src/data/srd/subclassFeatures/types.ts`               | Modificar (`SubclassFeatureDetail.efectos`)             |
| `src/data/srd/leveling.ts`                             | Modificar (`LevelFeature.efectos` + tabla monk + datos) |
| `src/data/srd/races.ts`                                | Modificar (`RaceTrait.efectos` + datos)                 |
| `src/data/srd/subclassFeatures/*.ts` (12 archivos)     | Modificar (datos con efectos)                           |
| `src/utils/traitEffects.ts`                            | **CREAR**                                               |
| `src/stores/characterBuilderHelpers.ts`                | Modificar                                               |
| `src/stores/characterStore/levelUpHelpers.ts`          | Modificar                                               |
| `src/stores/characterStore/progressionSlice.ts`        | Modificar                                               |
| `src/stores/characterStore/characterCrudSlice.ts`      | Modificar (getters)                                     |
| `src/stores/characterStore/types.ts`                   | Modificar (nuevos getters)                              |
| `src/stores/characterStore/classResourceStrategies.ts` | Modificar (4 clases nuevas)                             |
| `src/stores/creationStore.ts`                          | Modificar (eliminar hardcodeo)                          |
| `src/components/character/CombatTab.tsx`               | Modificar (iniciativa, resistencias)                    |
| `src/components/character/OverviewTab.tsx`             | Modificar (velocidad)                                   |
| `app/character/[id].tsx`                               | Modificar (velocidad)                                   |
| `app/campaigns/[id]/character/sheet.tsx`               | Modificar (velocidad)                                   |
| `app/master/character-view.tsx`                        | Modificar (iniciativa, velocidad)                       |
| `src/__tests__/traitEffects.test.ts`                   | **CREAR**                                               |
