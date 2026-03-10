# Plan: Arreglar el sistema de conjuros para todas las clases lanzadoras

**Fecha:** 2026-03-10
**Estado:** Pendiente de implementación

---

## Resumen del problema

El sistema de conjuros modela internamente TODAS las clases como "known casters" (lanzadores que conocen un número fijo de conjuros). Esto rompe las mecánicas de D&D 5e para:

1. **Lanzadores preparados** (Clérigo, Druida, Paladín) — No pueden acceder a su lista completa de clase. Quedan atrapados con los conjuros seleccionados durante la creación.
2. **Lanzadores conocidos** (Bardo, Hechicero, Explorador) — No pueden intercambiar conjuros al subir de nivel (el `canSwapSpell` siempre es `false` para ellos).
3. **Dato faltante** — Falta el conjuro "Columna de fuego" (Flame Strike) en la base de datos SRD.

### Las tres mecánicas de D&D 5e

| Tipo                | Clases                       | Cómo funciona                                                                                                          |
| ------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Known**           | Brujo                        | Conocen N conjuros fijos. Al subir de nivel: aprenden 1-2 nuevos, pueden intercambiar 1 viejo.                         |
| **Prepared**        | Clérigo, Druida, Paladín     | Acceso a TODA la lista de clase. Cada día eligen cuáles preparar (nivel + mod. aptitud).                               |
| **Spellbook**       | Mago                         | Libro de hechizos. Empiezan con 6, +2 por nivel. Cada día preparan subconjunto (nivel + mod. INT).                     |
| **Prepared (2024)** | Bardo, Hechicero, Explorador | Conocen N conjuros fijos (tabla SPELLS_KNOWN). Pueden intercambiar 1 al subir. Preparan nivel + mod. aptitud de ellos. |

> **Nota sobre modelo híbrido 2014/2024:** Bardo, Hechicero y Explorador tienen `preparesSpells: true` en los datos de clase (estilo 2024) PERO también tienen entradas en la tabla `SPELLS_KNOWN` (estilo 2014). El código derivado en `classes.ts:1568-1575` los clasifica como `"prepared"`, no `"known"`. Esto es intencional — la app usa un modelo híbrido donde estos lanzadores preparan de entre sus conjuros conocidos.

---

## Decisión de diseño confirmada

**Opción A — Cálculo en runtime para lanzadores preparados:**

- Los lanzadores preparados (Clérigo, Druida, Paladín) NO almacenan conjuros "conocidos" de nivel 1+.
- La lista de conjuros disponibles se calcula en runtime desde `getSpellsForClassUpToLevel()`.
- Solo los **trucos** se almacenan en `knownSpellIds`.
- Solo `preparedSpellIds` se persiste para conjuros de nivel 1+.
- Los lanzadores "prepared (2024)" (Bardo, Hechicero, Explorador) siguen usando `knownSpellIds` + `preparedSpellIds` como antes.

---

## Tareas de implementación

### Tarea 1: Añadir conjuro Columna de fuego (Flame Strike)

**Archivos a modificar:**

- `src/data/srd/spells.ts`
- `src/data/srd/spellDescriptions.ts`

**Cambios:**

#### 1a. Añadir entrada en `spells.ts`

Insertar en orden alfabético dentro del array `SRD_SPELLS` (después de "Columna de fuego" — buscar ubicación por `nivel: 5` y `escuela: "Evocación"`):

```typescript
{
  id: "columna_de_fuego",
  nombre: "Columna de fuego",
  nombreOriginal: "Flame Strike",
  nivel: 5,
  escuela: "Evocación",
  ritual: false,
  clases: ["clerigo"],
  fuente: "SRD 5.1",
},
```

> Nota: La posición exacta en el array debe mantener el orden alfabético por `nombre`. Buscar la entrada más cercana alfabéticamente.

#### 1b. Añadir descripción en `spellDescriptions.ts`

Añadir entrada en el `Map` de descripciones:

```typescript
["columna_de_fuego", {
  tiempo: "1 acción",
  alcance: "18 metros (60 pies)",
  componentes: "V, S, M (una pizca de azufre)",
  duracion: "Instantánea",
  descripcion: "Una columna vertical de fuego divino ruge desde los cielos en un lugar que especifiques. Cada criatura en un cilindro de 3 metros de radio y 12 metros de alto centrado en un punto dentro del alcance debe hacer una tirada de salvación de Destreza. Una criatura sufre 4d6 de daño de fuego y 4d6 de daño radiante si falla la salvación, o la mitad del daño si la supera.",
  aNivelesSuperiores: "Cuando lanzas este conjuro usando un espacio de conjuro de nivel 6 o superior, el daño de fuego o el daño radiante (a tu elección) aumenta en 1d6 por cada nivel de espacio por encima de 5.",
}],
```

**Verificación:** Después de añadir, comprobar que `getSpellsForClass("clerigo").find(s => s.id === "columna_de_fuego")` devuelve la entrada.

---

### Tarea 2: Arreglar `canSwapSpell` para Bardo, Hechicero y Explorador

**Archivo:** `src/data/srd/leveling.ts`
**Línea:** 650

**Problema actual:**

```typescript
// Línea 650
const canSwapSpell = prepType === "known" && newLevel > 1;
```

`prepType` para Bardo, Hechicero y Explorador es `"prepared"` (por `CLASS_SPELL_PREPARATION` derivado de `preparesSpells: true`). Solo Brujo tiene `prepType === "known"`. Pero el Brujo tiene `casterType === "pact"`, por lo que su `prepType` es `"known"` — esto es correcto para Brujo.

**Solución:** Cambiar la condición para que identifique a los lanzadores que tienen tabla `SPELLS_KNOWN` (Bardo, Hechicero, Explorador, Brujo):

```typescript
// Línea 650 — ANTES:
const canSwapSpell = prepType === "known" && newLevel > 1;

// DESPUÉS:
const hasSpellsKnownTable = SPELLS_KNOWN[classId] !== undefined;
const canSwapSpell = hasSpellsKnownTable && newLevel > 1;
```

**Razonamiento:** Las clases con tabla `SPELLS_KNOWN` son exactamente las que pueden intercambiar: Bardo, Brujo, Explorador, Hechicero. Los lanzadores preparados puros (Clérigo, Druida, Paladín) y el Mago NO tienen entrada en `SPELLS_KNOWN` y NO pueden intercambiar (porque ya tienen acceso a toda su lista / libro).

**Import necesario:** `SPELLS_KNOWN` ya está importado en `leveling.ts` (se usa en línea 641).

**Verificación:** Llamar a `getSpellLearningInfo("bardo", 5)` y confirmar que `canSwapSpell === true`.

---

### Tarea 3: Implementar preparación diaria para lanzadores preparados

Este es el cambio más grande. El objetivo es que Clérigo, Druida y Paladín vean **toda** su lista de clase en la pestaña Habilidades, pudiendo preparar/desprepar conjuros libremente (hasta el máximo).

**Archivos a modificar:**

- `src/components/character/AbilitiesTab.tsx` (líneas 95-132)
- `src/components/character/abilities/SpellcastingSection.tsx` (props + renderizado)

#### 3a. Modificar `AbilitiesTab.tsx` — Expandir `allSpellIds` para lanzadores preparados

**Ubicación:** Líneas 93-133

**Lógica actual (Bug #1):**

```typescript
// Líneas 95-109
const allSpellIds = magicState
  ? [
      ...new Set([
        ...magicState.knownSpellIds,
        ...magicState.preparedSpellIds,
        ...magicState.spellbookIds,
      ]),
    ]
  : [
      ...new Set([
        ...character.knownSpellIds,
        ...character.preparedSpellIds,
        ...character.spellbookIds,
      ]),
    ];
```

Esto solo muestra conjuros ya almacenados. Para lanzadores preparados, necesita incluir TODA la lista de clase desde el SRD.

**Código nuevo:**

```typescript
// ── Spell data (for casters) ──

// Determinar si es un lanzador preparado puro (acceso a toda la lista de clase)
const isPreparedCaster =
  preparationType === "prepared" && !SPELLS_KNOWN[character.clase as ClassId]; // Clérigo, Druida, Paladín

const maxSpellLevel = getMaxSpellLevelForClass(
  character.clase as ClassId,
  character.nivel,
);

// Para lanzadores preparados: incluir todos los conjuros de clase disponibles
const classSpellIds = isPreparedCaster
  ? getSpellsForClassUpToLevel(character.clase as ClassId, maxSpellLevel).map(
      (s) => s.id,
    )
  : [];

const storedSpellIds = magicState
  ? [
      ...magicState.knownSpellIds,
      ...magicState.preparedSpellIds,
      ...magicState.spellbookIds,
    ]
  : [
      ...character.knownSpellIds,
      ...character.preparedSpellIds,
      ...character.spellbookIds,
    ];

const allSpellIds = [...new Set([...storedSpellIds, ...classSpellIds])];
```

**Imports nuevos necesarios en `AbilitiesTab.tsx`:**

```typescript
import { getSpellsForClassUpToLevel } from "@/data/srd/spells";
import { getMaxSpellLevelForClass } from "@/data/srd/leveling";
import { SPELLS_KNOWN } from "@/constants/spells";
import type { ClassId } from "@/types/character";
```

> Verificar qué imports ya existen antes de añadir.

**Nota sobre cantrips:** La separación de trucos (líneas 111-122) sigue funcionando porque filtra por `spell.nivel === 0` / `spell.nivel > 0`. Los conjuros de clase del SRD tienen `nivel > 0` (la función `getSpellsForClassUpToLevel` ya excluye trucos por definición — `s.nivel > 0` en línea 435 de spells.ts).

**Nota sobre `spellsByLevel`:** El agrupamiento (líneas 124-133) sigue funcionando porque opera sobre `levelSpells` que ya es el subconjunto correcto.

#### 3b. Modificar `SpellcastingSection.tsx` — Diferenciar "disponible" de "preparado"

**Problema actual:** La sección muestra TODOS los conjuros como una lista plana, pero para lanzadores preparados necesita mostrar cuáles están **preparados** y cuáles simplemente están **disponibles para preparar**.

**La UI actual ya tiene toggle de preparación** (líneas 436-438 de SpellcastingSection.tsx):

```typescript
const canToggle =
  !isCantrip &&
  (preparationType === "prepared" || preparationType === "spellbook");
```

Y el `SpellCard` ya muestra botón de preparar/desprepar cuando `canTogglePrepared` es true. **Esto ya funciona correctamente.**

**Lo que hay que ajustar:**

El título de la sección (líneas 374-379) dice "Conjuros Preparados" para `preparationType === "prepared"`. Para lanzadores preparados puros (Clérigo, Druida, Paladín) esto es engañoso porque la lista ahora incluye TODOS los conjuros disponibles, no solo los preparados.

**Cambio en `SpellcastingSection.tsx`:**

Añadir un nuevo prop `isPreparedCaster` al `SpellcastingSectionProps` interface:

```typescript
// En SpellcastingSectionProps (línea 238):
export interface SpellcastingSectionProps {
  // ... props existentes ...
  isPreparedCaster?: boolean; // true para Clérigo, Druida, Paladín
}
```

Cambiar el título de la sección (línea 374-379):

```typescript
const sectionTitle =
  preparationType === "spellbook"
    ? "Libro de Hechizos"
    : isPreparedCaster
      ? "Lista de Conjuros de Clase"
      : preparationType === "prepared"
        ? "Conjuros Preparados"
        : "Conjuros Conocidos";
```

Pasar el prop desde `AbilitiesTab.tsx` donde se renderiza `SpellcastingSection`:

```typescript
<SpellcastingSection
  // ... props existentes ...
  isPreparedCaster={isPreparedCaster}
/>
```

> Buscar en `AbilitiesTab.tsx` dónde se renderiza `<SpellcastingSection` para añadir el prop.

#### 3c. Verificar que `togglePreparedSpell` funciona con conjuros no almacenados

**Archivo:** `src/stores/characterStore/magicSlice.ts` (líneas 126-152)

**Análisis:** La función `togglePreparedSpell`:

1. Lee `magicState.preparedSpellIds` (línea 130)
2. Si el spell está preparado, lo quita; si no, lo añade (líneas 132-134)
3. Actualiza `magicState.preparedSpellIds` y `character.preparedSpellIds` (líneas 137-150)

**¿Funciona con conjuros del SRD no almacenados?** SÍ. La función solo manipula `preparedSpellIds`. No requiere que el conjuro esté en `knownSpellIds`. Cuando un Clérigo pulse "preparar" en un conjuro de la lista de clase, ese `spellId` se añadirá a `preparedSpellIds` correctamente.

**Sin cambios necesarios en `magicSlice.ts`.**

#### 3d. Verificar `canCastSpell` e `isPrepared`

En `AbilitiesTab.tsx` (líneas 150-158):

```typescript
const canCastSpell = (id: string): boolean => {
  if (preparationType === "known" || preparationType === "none") return true;
  return isPrepared(id);
};

const isPrepared = (id: string): boolean => {
  if (magicState) return magicState.preparedSpellIds.includes(id);
  return character.preparedSpellIds.includes(id);
};
```

Para lanzadores preparados (`preparationType === "prepared"`), `canCastSpell` ya delega a `isPrepared`, que verifica `preparedSpellIds`. Los conjuros del SRD que NO estén preparados mostrarán `prepared: false` en el `SpellCard`, lo que muestra el toggle vacío. **Correcto, sin cambios.**

#### 3e. Verificar `currentPreparedCount` y `maxPreparedSpells`

En `AbilitiesTab.tsx` (líneas 165-180):

```typescript
const currentPreparedCount = magicState
  ? magicState.preparedSpellIds.filter(...)
  : character.preparedSpellIds.filter(...);

const maxPreparedSpells =
  (preparationType === "prepared" || preparationType === "spellbook") && spellcastingAbility
    ? calcPreparedSpells(character.clase, character.nivel, abilityMod)
    : undefined;
```

**Esto ya funciona correctamente.** `calcPreparedSpells` en `utils/spells.ts:27-44` tiene las fórmulas correctas para cada clase. El contador "X/Y preparados" se mostrará en la UI existente (líneas 397-399 de SpellcastingSection.tsx).

**Posible mejora (no bloquea):** Considerar limitar en `togglePreparedSpell` que no se puedan preparar más conjuros que `maxPreparedSpells`. Actualmente no hay validación — el usuario puede preparar infinitos. Pero esto se puede hacer en una tarea posterior.

---

### Tarea 4: Ajustar creación de personaje para lanzadores preparados

**Archivos a modificar:**

- `src/stores/characterBuilderHelpers.ts` (función `buildInitialSpells`, líneas 293-332)
- `app/create/spells.tsx` (UI de selección de conjuros en creación)
- `app/campaigns/[id]/character/create/spells.tsx` (duplicado campaña)

#### 4a. Modificar `buildInitialSpells`

**Problema:** Actualmente pone TODOS los conjuros seleccionados en `knownSpellIds` (líneas 313-319), y luego copia `spellChoices.spells` a `preparedSpellIds` (línea 328).

Para lanzadores preparados puros (Clérigo, Druida, Paladín):

- Los **trucos** deben ir a `knownSpellIds` (son permanentes).
- Los **conjuros de nivel 1+** deben ir SOLO a `preparedSpellIds` (son la preparación inicial), NO a `knownSpellIds`.

**Código nuevo:**

```typescript
export function buildInitialSpells(
  spellChoices: SpellChoices | undefined,
  clase: string,
  racialSpellIds?: string[],
): InitialSpellState {
  const knownSpellIds: string[] = [];
  const preparedSpellIds: string[] = [];
  const spellbookIds: string[] = [];

  // Determinar si es lanzador preparado puro (Clérigo, Druida, Paladín)
  const isPreparedCaster =
    CLASS_SPELL_PREPARATION[clase as ClassId] === "prepared" &&
    !SPELLS_KNOWN[clase as ClassId];

  // Añadir conjuros innatos raciales (trucos y hechizos de nivel 1)
  if (racialSpellIds) {
    for (const spellId of racialSpellIds) {
      if (!knownSpellIds.includes(spellId)) {
        knownSpellIds.push(spellId);
      }
    }
  }

  if (spellChoices) {
    // Trucos: siempre a knownSpellIds
    for (const spellId of spellChoices.cantrips ?? []) {
      if (!knownSpellIds.includes(spellId)) {
        knownSpellIds.push(spellId);
      }
    }

    if (isPreparedCaster) {
      // Lanzadores preparados: conjuros nivel 1+ solo a preparedSpellIds
      preparedSpellIds.push(...(spellChoices.spells ?? []));
    } else {
      // Otros lanzadores: conjuros a knownSpellIds + preparedSpellIds
      for (const spellId of spellChoices.spells ?? []) {
        if (!knownSpellIds.includes(spellId)) {
          knownSpellIds.push(spellId);
        }
      }
      // Los conjuros conocidos se preparan automáticamente a nivel 1
      preparedSpellIds.push(...(spellChoices.spells ?? []));
    }

    // Para magos, también llenar el libro de hechizos
    if (clase === "mago" && spellChoices.spellbook) {
      spellbookIds.push(...spellChoices.spellbook);
    }
  }

  return { knownSpellIds, preparedSpellIds, spellbookIds };
}
```

**Imports necesarios en `characterBuilderHelpers.ts`:**

```typescript
import { CLASS_SPELL_PREPARATION } from "@/data/srd/classes"; // o desde @/constants/spells
import { SPELLS_KNOWN } from "@/constants/spells";
import type { ClassId } from "@/types/character";
```

> Verificar las rutas de importación existentes en el archivo.

#### 4b. Verificar la UI de creación (spells.tsx)

**Archivo:** `app/create/spells.tsx` (708 líneas)

La pantalla de creación de conjuros muestra conjuros para seleccionar según la clase. Para lanzadores preparados, actualmente ofrece elegir un número fijo de conjuros. Con el nuevo modelo:

**¿Necesita cambiar?** Sí, parcialmente:

- Para Clérigo/Druida/Paladín, la creación debería permitir elegir los conjuros **inicialmente preparados** (no "conocidos"). El número debería ser `calcPreparedSpells(clase, 1, abilityModifier)`.
- Los textos de la UI deben decir "conjuros preparados" en vez de "conjuros conocidos" para estas clases.

**Sin embargo**, el cambio en la UI de creación es SECUNDARIO. El cambio crítico está en `buildInitialSpells`. La UI de creación puede seguir pidiendo seleccionar N conjuros — la diferencia es que internamente irán a `preparedSpellIds` en vez de `knownSpellIds`. Los textos de UI se pueden mejorar en una tarea posterior.

**Acción:** Leer `app/create/spells.tsx` durante la implementación para verificar si hay textos que referencien "conjuros conocidos" y deban cambiarse a "conjuros preparados" para las clases preparadas. Esto es baja prioridad pero deseable.

#### 4c. Duplicado de campaña

**Archivo:** `app/campaigns/[id]/character/create/spells.tsx`

Cualquier cambio en `app/create/spells.tsx` debe replicarse aquí. Verificar si es un duplicado exacto o hay diferencias.

---

### Tarea 5: Ajustar level-up para lanzadores preparados

**Archivos a modificar:**

- `src/data/srd/leveling.ts` (función `getSpellLearningInfo`)
- `src/stores/characterStore/levelUpHelpers.ts` (función `applyMagicProgression`)
- `src/components/character/levelup/SpellsStep.tsx` (UI de level-up)

#### 5a. Verificar `getSpellLearningInfo` para lanzadores preparados

**Análisis actual (líneas 624-694):**

Para Clérigo (ejemplo):

- `casterType === "full"` → no es null
- `prepType === "prepared"`
- `cantripsTable` = `CANTRIPS_KNOWN["clerigo"]` → tiene entradas (3 trucos a nivel 1, etc.)
- `spellsTable` = `SPELLS_KNOWN["clerigo"]` → `undefined` → `totalSpellsKnown = 0`, `newSpellsKnown = 0`
- `canSwapSpell` = false (correcto — lanzadores preparados no intercambian)
- `gainsNewSpellLevel` = true/false según nivel

El resultado es que `newSpellsKnown = 0` para Clérigo, lo cual es **correcto** — un Clérigo no "aprende" conjuros nuevos al subir de nivel, simplemente tiene acceso a conjuros de nivel más alto si desbloquea un nuevo nivel de espacio.

**Sin embargo**, la función devuelve `hasAnySpellChange` (línea 672-679) que incluye `gainsNewSpellLevel` y `totalCantrips > 0`, así que la UI de level-up sí se mostrará cuando haya trucos nuevos o nuevo nivel de conjuro.

**Cambio necesario:** Ninguno directo en `getSpellLearningInfo` para lanzadores preparados (los cambios de Tarea 2 ya arreglaron `canSwapSpell`).

**PERO**: La información `preparationType: "prepared"` que retorna debe ser usada por `SpellsStep.tsx` para mostrar un mensaje informativo del tipo "Ahora tienes acceso a conjuros de nivel X. Ve a la pestaña Habilidades para preparar tus conjuros."

#### 5b. Verificar `applyMagicProgression`

**Análisis (líneas 322-403):**

```typescript
const newKnown = [
  ...(options.cantripsLearned ?? []),
  ...(options.spellsLearned ?? []),
].filter(Boolean);
for (const spellId of newKnown) {
  if (!newMagicState.knownSpellIds.includes(spellId)) {
    newMagicState.knownSpellIds.push(spellId);
  }
}
```

Para lanzadores preparados puros, `spellsLearned` será vacío (solo `cantripsLearned` tendrá valores si hay trucos nuevos). Los trucos nuevos sí deben ir a `knownSpellIds`. **Correcto, sin cambios.**

#### 5c. Verificar `SpellsStep.tsx` (UI de level-up)

**Acción durante implementación:** Leer este archivo para verificar:

1. Que no intente mostrar un selector de "conjuros nuevos" para Clérigo/Druida/Paladín cuando `newSpellsKnown === 0`.
2. Que muestre un mensaje informativo si se desbloquea un nuevo nivel de espacio.

**Posible cambio:** Si actualmente muestra "Selecciona 0 conjuros nuevos" o algo similar para preparados, ajustar el texto.

---

### Tarea 6: Verificación y testing

#### 6a. Verificaciones manuales

1. **Crear Clérigo nivel 1:**
   - Creación: seleccionar trucos (3) y conjuros preparados iniciales
   - Post-creación: la pestaña Habilidades muestra TODOS los conjuros de Clérigo nivel 1 con toggle de preparar
   - Verificar que "Columna de fuego" aparece en la lista a nivel 9+ (cuando tiene espacios de nivel 5)

2. **Crear Druida nivel 1:**
   - Misma verificación que Clérigo

3. **Crear Paladín nivel 2:**
   - Paladín obtiene magia a nivel 2 (half caster). Verificar que en nivel 2 ve conjuros de nivel 1

4. **Crear Bardo nivel 1:**
   - Creación: seleccionar 4 conjuros conocidos
   - Post-creación: solo ve sus 4 conjuros conocidos (NO toda la lista de clase)
   - Level-up a nivel 2: puede intercambiar 1 conjuro y aprender 1 nuevo

5. **Crear Hechicero nivel 1:**
   - Mismo comportamiento que Bardo

6. **Crear Explorador nivel 2:**
   - Explorador obtiene magia a nivel 2 (half caster)
   - Puede intercambiar al subir de nivel

7. **Crear Mago nivel 1:**
   - Sin cambios esperados — libro de hechizos funciona como antes

8. **Crear Brujo nivel 1:**
   - Sin cambios esperados — magia de pacto funciona como antes

#### 6b. Build y TypeScript

```bash
npx expo export --platform web 2>&1 | head -50
npx tsc --noEmit
```

---

## Orden de implementación recomendado

1. **Tarea 1** (Flame Strike) — Independiente, se puede hacer primero como warm-up.
2. **Tarea 2** (canSwapSpell) — 1 línea, arreglo rápido.
3. **Tarea 4** (buildInitialSpells) — Necesario antes de Tarea 3 para que los datos sean correctos al crear nuevos personajes.
4. **Tarea 3** (AbilitiesTab) — El cambio principal de UI.
5. **Tarea 5** (level-up) — Verificar y ajustar textos.
6. **Tarea 6** (verificación) — Al final.

> Las tareas 1 y 2 son independientes entre sí y se pueden ejecutar en paralelo.
> Las tareas 3, 4 y 5 tienen dependencias lógicas pero técnicamente pueden implementarse en cualquier orden.

---

## Archivos afectados (resumen)

| Archivo                                                              | Tipo de cambio                            |
| -------------------------------------------------------------------- | ----------------------------------------- |
| `src/data/srd/spells.ts`                                             | Añadir entrada Flame Strike               |
| `src/data/srd/spellDescriptions.ts`                                  | Añadir descripción Flame Strike           |
| `src/data/srd/leveling.ts:650`                                       | Arreglar condición canSwapSpell           |
| `src/components/character/AbilitiesTab.tsx:95-109`                   | Expandir allSpellIds para preparados      |
| `src/components/character/abilities/SpellcastingSection.tsx:238,374` | Nuevo prop + título sección               |
| `src/stores/characterBuilderHelpers.ts:293-332`                      | Bifurcar lógica para preparados           |
| `src/components/character/levelup/SpellsStep.tsx`                    | Verificar/ajustar textos (posible)        |
| `app/create/spells.tsx`                                              | Verificar/ajustar textos (baja prioridad) |
| `app/campaigns/[id]/character/create/spells.tsx`                     | Replicar cambios de create/spells.tsx     |

---

## Riesgos y consideraciones

1. **Personajes existentes:** Los personajes Clérigo/Druida/Paladín ya creados tendrán conjuros en `knownSpellIds` que ya no deberían estar ahí. Esto NO rompe nada porque la unión `storedSpellIds + classSpellIds` en AbilitiesTab simplemente los incluirá. Con el tiempo, cuando el usuario prepare/desprepare, los `preparedSpellIds` se actualizarán correctamente. Los `knownSpellIds` obsoletos no causan daño (solo ocupan espacio en storage).

2. **Rendimiento:** `getSpellsForClassUpToLevel()` filtra el array `SRD_SPELLS` (319 entradas). Para un Clérigo de nivel 20 esto devuelve ~100+ conjuros. Esto es aceptable — se calcula una vez en el render de AbilitiesTab. Si fuera necesario, se puede memoizar con `useMemo`.

3. **Conjuros de dominio (subclase):** Los conjuros de dominio del Clérigo están definidos como texto descriptivo en `src/data/srd/subclassFeatures/clerigo.ts`, NO como datos estructurados con IDs. Esto significa que los conjuros de dominio no se añadirán automáticamente a la lista. Esto es una limitación preexistente y NO está en scope de esta tarea.

4. **Modelo híbrido Bardo/Hechicero/Explorador:** Estos lanzadores tienen `SPELLS_KNOWN` tabla, por lo que `isPreparedCaster` será `false` para ellos. Seguirán usando `knownSpellIds` como antes. Su `canSwapSpell` se arregla en Tarea 2. No hay riesgo de regresión.
