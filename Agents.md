# AGENTS.md — DyMEs (D&D 5e Character Manager)

> Instrucciones para agentes de código (GitHub Copilot, Cursor, etc.) que trabajan en este repositorio.
> Para documentación extendida de la estructura, ver `docs/Code_Structure.md`.

---

## Resumen del Proyecto

Aplicación móvil (Android) para gestionar personajes y partidas de **Dungeons & Dragons 5ª Edición** completamente en español. Permite crear personajes paso a paso, gestionar campañas, consultar el SRD, tirar dados, y controlar combate, inventario, hechizos y notas.

**Modos de uso:**
- **Jugador** — crear/gestionar personajes, unirse a campañas
- **Master** — crear campañas, ver personajes de jugadores en tiempo real

---

## Tech Stack

| Tecnología | Versión | Propósito |
|---|---|---|
| React Native | 0.81 | Framework UI |
| Expo | 54 | Build, runtime, módulos nativos |
| Expo Router | 6 | Navegación file-based |
| TypeScript | 5.9 | Tipado estático (strict mode) |
| Zustand | 5 | Estado global |
| NativeWind | 4.1 | Tailwind CSS para React Native |
| Tailwind CSS | 3.4 | Utilidades de estilo |
| Supabase | 2.97 | Backend (auth, DB, realtime) |
| AsyncStorage | 2.2 | Persistencia local |
| React Native Reanimated | 4.1 | Animaciones |

**React Compiler** está habilitado experimentalmente en `app.json`.

---

## Estructura de Carpetas (resumen funcional)

```
app/                     → Rutas Expo Router (file-based navigation)
src/
  components/            → Componentes por dominio (campaigns, character, combat, creation, etc.)
    ui/                  → Componentes reutilizables (design system)
  constants/             → Constantes del juego (habilidades, hechizos, items, colores)
  data/srd/              → Base de datos SRD completa (razas, clases, conjuros)
  hooks/                 → Hooks personalizados
  lib/                   → Clientes singleton (e.g. supabase client)
  services/              → Capa de servicios (DB operations)
  stores/                → Zustand stores por dominio
    characterStore/      → Store de personaje compuesto por slices
  types/                 → Definiciones TypeScript
  utils/                 → Funciones utilitarias puras
assets/                  → Imágenes estáticas (avatares, iconos campañas)
docs/                    → Documentación, historias de usuario, manual SRD
scripts/                 → Scripts de generación (hechizos, avatares, iconos)
supabase/migrations/     → Migraciones SQL
```

---

## Path Aliases

Definidos en `tsconfig.json`. **Siempre usar aliases en imports, nunca rutas relativas largas.**

| Alias | Ruta |
|---|---|
| `@/*` | `./src/*` |
| `@components/*` | `./src/components/*` |
| `@constants/*` | `./src/constants/*` |
| `@hooks/*` | `./src/hooks/*` |
| `@stores/*` | `./src/stores/*` |
| `@types/*` | `./src/types/*` |
| `@utils/*` | `./src/utils/*` |
| `@data/*` | `./src/data/*` |

---

## Convenciones de Código

### Estado Global (Zustand)

- **Stores por dominio**: `authStore`, `campaignStore`, `characterListStore`, `creationStore`, `masterStore`, `settingsStore`
- **Character store modular**: compuesto por slices en `src/stores/characterStore/`:
  - `characterCrudSlice` — CRUD y carga de personaje
  - `combatSlice` — HP, condiciones, combat tracker
  - `progressionSlice` — level up, XP
  - `magicSlice` — spell slots, spells preparados
  - `classResourceSlice` — recursos de clase (ki, rage, etc.)
  - `inventorySlice` — objetos, equipo, monedas
  - `notesSlice` — notas del personaje
  - `restSlice` — descanso corto/largo
- **Persistencia manual**: usar helpers de `src/utils/storage.ts` (setItem/getItem/removeItem). **NUNCA usar Zustand persist middleware.**
- **Helpers puros**: extraer lógica de negocio compleja a archivos `*Helpers.ts` separados. Stores solo orquestan.
- Para añadir funcionalidad al character store: crear/extender un slice, no inflar `index.ts`.

### Backend (Supabase)

- **Client singleton**: `src/lib/supabase.ts` — solo se importa desde `src/services/` y `src/lib/`
- **Capa de servicios**: `src/services/supabaseService.ts` — centraliza TODAS las operaciones de DB
- **NUNCA importar el client de Supabase directamente en componentes, hooks o stores**. Siempre pasar por la capa de servicios.
- Modelo de datos: personajes se almacenan como JSON blob en `personajes.datos` con campos opcionales prefijados con `_` para sub-estado (magia, recursos, inventario, notas).
- Offline-first: almacenamiento local primario + sync/backup a cloud.

### Componentes

- Organizados por **dominio/feature** bajo `src/components/`
- Componentes reutilizables en `src/components/ui/` con barrel export en `index.ts`
- **Patrón**: pantallas orquestan → componentes renderizan → stores/hooks proveen estado
- Estilos: **NativeWind `className` preferido**. Usar `StyleSheet` solo para estilos dinámicos o que dependen de valores calculados.

### Tipos

- Barrel export desde `src/types/index.ts` — importar tipos desde ahí cuando sea posible
- Tipos específicos de dominio en archivos separados: `character.ts`, `campaign.ts`, `master.ts`, `spell.ts`, `item.ts`, `notes.ts`, `creation.ts`, `traitEffects.ts`, `supabase.ts`
- Trait effects pipeline: definir en `src/types/traitEffects.ts` → computar en `src/utils/traitEffects.ts` → aplicar en level-up/creation flows

### Hooks

- Barrel export desde `src/hooks/index.ts`
- Son orquestadores/adaptadores sobre stores, services y estado de UI
- Hooks clave: `useTheme()`, `useDialog()`, `useToast()`, `useCharacterSync()`, `useCreationNavigation()`

### Estilos y Tema

- Paleta temática D&D definida en `tailwind.config.js` con colores semánticos (parchment, leather, ink, gold, etc.)
- Dark mode soportado via clase (`darkMode: 'class'`)
- Tema resuelto por `useTheme()` hook → tokens en `src/utils/theme.ts`
- Colores base en `src/constants/colors.ts`

### Navegación

- File-based routing con Expo Router
- Auth guard global en `app/_layout.tsx` — no dispersar auth checks en pantallas individuales
- Feature stacks en carpetas de rutas (`app/campaigns/`, `app/character/`, `app/create/`, `app/master/`)
- Transiciones customizadas definidas en layout files

### Testing

- Funciones puras usando providers de `src/utils/providers.ts` para inyectar randomness y tiempo (facilita testing determinista)
- Helpers de lógica de negocio en `*Helpers.ts` diseñados para ser testables sin dependencias externas

### Naming

- Archivos: `camelCase.ts` para stores/hooks/utils, `PascalCase.tsx` para componentes
- Rutas: convenciones Expo Router (`_layout.tsx`, `[id].tsx`, `index.tsx`)
- Dominio del juego: terminología en **español** (personaje, campaña, hechizo, etc.)
- Commits: **inglés**, Conventional Commits (`type(scope): description`)

---

## Reglas Críticas (Do's & Don'ts)

### SIEMPRE
- ✅ Usar path aliases (`@/`, `@stores/`, `@components/`, etc.) en imports
- ✅ Acceder a DB solo via `src/services/supabaseService.ts`
- ✅ Persistir estado via `src/utils/storage.ts` helpers
- ✅ Extraer lógica compleja a helpers puros
- ✅ Importar tipos desde `@types/` barrel cuando sea posible
- ✅ Usar NativeWind `className` para estilos
- ✅ Nuevos slices de character en `src/stores/characterStore/`
- ✅ Mantener auth guard centralizado en `app/_layout.tsx`

### NUNCA
- ❌ Importar `supabase` directamente en componentes/hooks/stores
- ❌ Usar Zustand persist middleware
- ❌ Poner lógica de negocio pesada directamente en stores
- ❌ Crear rutas relativas profundas (`../../../`) cuando existe un alias
- ❌ Dispersar auth guards en pantallas individuales
- ❌ Modificar `src/stores/characterStore/index.ts` para añadir lógica — usar/crear slices

---

## Build Commands

| Comando | Descripción |
|---|---|
| `npm start` | Inicia Expo dev server |
| `npm run android` | Inicia en Android |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `/build` | Prompt: genera APK de distribución (EAS preview) |
| `/build-dev` | Prompt: genera APK de desarrollo (EAS development) |
| `/commit` | Prompt: git add + commit convencional + push |

EAS build profiles en `eas.json`:
- `development` — dev client APK para debugging
- `preview` — APK para distribución interna
- `production` — App Bundle para Play Store

---

## Archivos Clave por Tarea

### Si necesitas... → Lee primero:

| Tarea | Archivos clave |
|---|---|
| Entender la estructura | `docs/Code_Structure.md` |
| Añadir pantalla/ruta | `app/_layout.tsx` + carpeta de ruta relevante |
| Modificar personaje | `src/stores/characterStore/` + `src/types/character.ts` |
| Añadir funcionalidad al personaje | Crear/editar slice en `src/stores/characterStore/` |
| Operaciones de base de datos | `src/services/supabaseService.ts` + `src/types/supabase.ts` |
| Crear componente UI reutilizable | `src/components/ui/` + exportar en `index.ts` |
| Modificar tema/colores | `tailwind.config.js` + `src/utils/theme.ts` + `src/constants/colors.ts` |
| Añadir datos SRD | `src/data/srd/` + `src/constants/` relevante |
| Trait effects / mecánicas | `src/types/traitEffects.ts` → `src/utils/traitEffects.ts` |
| Level up / progresión | `src/stores/characterStore/progressionSlice.ts` + `levelUpHelpers.ts` |
| Campañas | `src/stores/campaignStore.ts` + `src/types/campaign.ts` |
| Modo Master | `src/stores/masterStore.ts` + `src/types/master.ts` + `src/hooks/useRealtimeCharacters.ts` |
| Creación de personaje | `src/stores/creationStore.ts` + `src/types/creation.ts` + `src/components/creation/` |
| Auth / login | `src/stores/authStore.ts` + `app/login.tsx` |
| Persistencia local | `src/utils/storage.ts` |
| Animaciones | `src/hooks/useEntranceAnimation.ts`, `usePulseAnimation.ts`, `useModalAnimation.ts` |

---

## Documentación Adicional

- `docs/Code_Structure.md` — estructura detallada del código
- `docs/historias_usuario/` — historias de usuario (HU-01 a HU-15)
- `docs/manual/` — manual del SRD (clases, razas, conjuros, trasfondos)
- `docs/plans/` — planes de refactorización y mejoras
