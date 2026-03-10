# DyMEs — Companion App para D&D 5e

Aplicación móvil y web de acompañamiento para **Dungeons & Dragons 5ª Edición**, completamente en español. Basada en el SRD 5.1, permite gestionar partidas, crear personajes paso a paso, llevar hojas de personaje completas, lanzar dados, consultar un compendio de reglas y dirigir campañas como Máster con seguimiento en tiempo real.

> **Referencia SRD:** https://srd.nosolorol.com/DD5/index.html

---

## Características principales

### Autenticación y cuentas
- Inicio de sesión con **email/contraseña** (registro e inicio con pestañas).
- Inicio de sesión con **Google OAuth** (PKCE + flujo implícito vía Supabase).
- Perfil de usuario con avatar, nombre y **código de jugador** compartible.
- Sincronización automática de personajes en la nube con Supabase.
- Restauración de datos desde la nube al iniciar sesión en otro dispositivo.

### Selección de modo
- **Modo Jugador** — Crear y gestionar personajes de D&D.
- **Modo Máster** — Dirigir campañas y monitorizar jugadores en tiempo real.

### Gestión de partidas (Jugador)
- Crear, editar y eliminar campañas con imagen personalizada.
- Vincular y desvincular personajes a cada campaña.
- Ordenar campañas por último acceso; búsqueda rápida.

### Modo Máster (Director de Juego)
- Crear y gestionar campañas de máster.
- **Añadir jugadores por código de personaje** compartible.
- **Lobby en tiempo real**: HP con barra de color, clase, nivel, condiciones de cada jugador.
- **Hoja de personaje de solo lectura** con suscripción Realtime de Supabase.
- El máster puede **editar monedas e inventario** directamente en la ficha del jugador.
- Eliminar jugadores de la campaña (pulsación larga con confirmación).

### Creación de personajes (asistente de 11 pasos)
1. **Nombre** del personaje
2. **Raza** — 9 razas SRD con subrazas + **razas personalizadas** (Enano, Elfo, Mediano, Humano, Dracónido, Gnomo, Semielfo, Semiorco, Tiefling)
3. **Clase** — 12 clases (Bárbaro, Bardo, Brujo, Clérigo, Druida, Explorador, Guerrero, Hechicero, Mago, Monje, Paladín, Pícaro)
4. **Puntuaciones de característica** — Array estándar, compra por puntos, tirada de dados o entrada manual; bonificadores raciales automáticos
5. **Trasfondo** — 13 trasfondos SRD + **trasfondos personalizados** con tablas de personalidad
6. **Habilidades** — Selección de competencias (clase + trasfondo + raza)
7. **Conjuros** — Trucos y conjuros iniciales para lanzadores
8. **Equipo** — Equipo inicial según clase y trasfondo
9. **Personalidad** — Rasgos, ideales, vínculos, defectos, historia; 9 alineamientos
10. **Apariencia** — Edad, altura, peso, colores, avatar
11. **Resumen** — Revisión y confirmación

Guardado automático de borrador para recuperación.

### Hoja de personaje (5 pestañas)
| Pestaña | Contenido |
|---|---|
| **General** | Info básica, puntuaciones de característica, bonificador de competencia, velocidad, personalidad, apariencia |
| **Combate** | PG (actuales/máx/temporales), dados de golpe, salvaciones de muerte, CA, ataques con armas, condiciones, concentración, sección de conjuros de combate |
| **Habilidades** | Rasgos de clase/subclase, recursos de clase, gestión de conjuros, espacios de conjuro, conjuros preparados/conocidos |
| **Inventario** | Objetos con rareza, monedas (transacciones), equipo, peso/carga |
| **Notas** | Notas con categorías, filtrado, barra de nota rápida, editor modal |

### Subida de nivel (asistente multi-paso)
- Seguimiento de PX con detección automática de nivel.
- **Asistente de subida de nivel** con pasos:
  - Ganancia de PG (fija o tirada).
  - Mejoras de puntuación de característica (ASI).
  - Selección de subclase al nivel correspondiente.
  - Aprendizaje de conjuros al subir de nivel.
  - Selección de Metamagia (Hechicero).
  - Resumen y confirmación.
- Historial de niveles.

### Conjuros
- Base de datos completa del SRD (niveles 0–9, 8 escuelas de magia).
- Componentes (V, S, M con coste/consumo), tiempo de lanzamiento, duración, alcance.
- Seguimiento de concentración.
- Listas de conjuros conocidos, preparados y libro de conjuros (Mago).
- Espacios de conjuro, Magia de Pacto (Brujo) y puntos de hechicería (Hechicero).

### Inventario y equipo
- Gestión de objetos con sistema de rareza (Común → Artefacto).
- Categorías: armas, armaduras, herramientas.
- Monedas (pc, pp, pe, po, pl) con modal de transacciones.
- Reglas de carga (estándar y detallada).

### Combate y puntos de golpe
- PG actuales, máximos y temporales.
- Dados de golpe y salvaciones de muerte.
- Clase de armadura, velocidades, resistencias/inmunidades/vulnerabilidades.
- **Ataques con armas** calculados a partir del inventario.
- 15 condiciones rastreables, concentración.
- Sección de conjuros de combate.

### Recursos de clase
- Seguimiento de recursos específicos (Ki, Ira, Segundo Aliento, Inspiración Bárdica, etc.).
- **Patrón Strategy** para recursos diversos con recuperación por tipo de descanso.
- Recuperación basada en descansos cortos y largos.

### Tirador de dados
- Botón flotante (FAB) en la hoja de personaje.
- Dados estándar: d4, d6, d8, d10, d12, d20, d100.
- Expresiones de dados (ej. `2d6+3`).
- Detección de crítico/pifia en d20.
- Tiradas con ventaja/desventaja.
- Historial de tiradas.
- Modificadores pasivos automáticos (Halfling Lucky, Reliable Talent, Jack of All Trades, etc.).

### Compendio SRD
- Navegador con 3 pestañas: Razas, Clases, Trasfondos.
- Búsqueda global y tarjetas expandibles con detalle completo.

### Ajustes
- **Cuenta:** Perfil de usuario, códigos de personaje (copiar/compartir), modo actual, cerrar sesión.
- **Tema:** Oscuro / Claro / Automático (sistema).
- **Unidades:** Imperial (pies/libras) o Métrico (metros/kg) con conversión automática.
- **Reglas opcionales:** Dotes en lugar de ASI, multiclase, PG fijos, compra por puntos, carga detallada.
- **Gestión de datos:** Eliminar todos los datos (doble confirmación).
- **Acerca de:** Versión, licencia SRD, tecnologías, créditos.

---

## Stack tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| [Expo](https://expo.dev) | SDK 54 | Toolchain y sistema de build |
| React Native | 0.81.5 | Framework UI multiplataforma |
| React | 19.1.0 | Librería de UI |
| Expo Router | ~6.0.23 | Navegación basada en archivos (typed routes) |
| NativeWind | ^4.1.23 | Tailwind CSS para React Native |
| Zustand | ^5.0.0 | Gestión de estado |
| [Supabase](https://supabase.com) | ^2.97.0 | Backend: autenticación, base de datos, Realtime |
| AsyncStorage | 2.2.0 | Persistencia local (offline-first) |
| TypeScript | ~5.9.2 | Tipado estático (strict mode) |
| React Native Reanimated | ~4.1.1 | Animaciones avanzadas |
| React Native SVG | 15.12.1 | Gráficos vectoriales (D20, logo, decoraciones) |
| expo-image-picker | ~17.0.10 | Selección de imágenes |
| expo-print / expo-sharing | ~15.0.8 / ~14.0.8 | Exportación y compartir |
| expo-clipboard | ~8.0.8 | Copiar al portapapeles |
| expo-linear-gradient | ~15.0.8 | Degradados visuales |

**New Architecture** habilitada (`"newArchEnabled": true`).

---

## Estructura del proyecto

```
app/                        # Pantallas (Expo Router file-based routing)
├── _layout.tsx             # Layout raíz
├── index.tsx               # Inicio — lista de campañas
├── login.tsx               # Inicio de sesión (email + Google OAuth)
├── mode-select.tsx         # Selección de modo (Jugador / Máster)
├── account.tsx             # Perfil de usuario y códigos de personaje
├── compendium.tsx          # Compendio SRD
├── settings.tsx            # Ajustes
├── campaigns/              # Gestión de campañas (Jugador)
│   ├── new.tsx             # Nueva campaña
│   └── [id]/
│       ├── index.tsx       # Detalle de campaña
│       └── character/
│           ├── sheet.tsx   # Hoja de personaje (5 pestañas)
│           └── create/     # Asistente de creación (11 pasos)
├── character/              # Vista de personaje independiente
│   └── [id].tsx
├── create/                 # Asistente de creación standalone (11 pasos)
│   ├── index.tsx           # Nombre
│   ├── race.tsx            # Raza
│   ├── class.tsx           # Clase
│   ├── abilities.tsx       # Puntuaciones de característica
│   ├── background.tsx      # Trasfondo
│   ├── skills.tsx          # Habilidades
│   ├── spells.tsx          # Conjuros
│   ├── equipment.tsx       # Equipo
│   ├── personality.tsx     # Personalidad
│   ├── appearance.tsx      # Apariencia
│   └── summary.tsx         # Resumen
└── master/                 # Modo Máster (Director de Juego)
    ├── index.tsx           # Lista de campañas del máster
    ├── [campaignId].tsx    # Lobby de campaña (jugadores en tiempo real)
    └── character-view.tsx  # Hoja de personaje de solo lectura

src/
├── components/             # Componentes por dominio
│   ├── ui/                 # Componentes base reutilizables
│   │   ├── AppHeader, Badge, ConfirmDialog, EmptyState, GlowCard
│   │   ├── GradientButton, GradientHeader, PageHeader, SearchBar
│   │   ├── SegmentedTabs, Toast, AnimatedPressable, FadeInView
│   │   └── decorations/   # 14 componentes decorativos temáticos
│   ├── campaigns/          # CampaignCard, CharacterCard, HomeEmptyState, StatsRow
│   ├── character/          # Pestañas de hoja: Overview, Combat, Abilities, Inventory, Notes
│   │   ├── abilities/      # CantripsSection, ClassAbilities, SpellcastingSection, etc.
│   │   └── levelup/        # Asistente: ASIStep, HPStep, SubclassStep, SpellsStep, MetamagicStep, etc.
│   ├── combat/             # HPTracker, DeathSavesTracker, HitDiceSection, ConditionsSection, WeaponAttacks
│   ├── compendium/         # RaceCard, ClassCard, BackgroundCard
│   ├── creation/           # CustomRaceEditor, CustomBackgroundEditor, WizardStepPlaceholder
│   ├── dice/               # DiceFAB, DiceRoller
│   ├── inventory/          # InventoryItemCard, AddItemModal, CoinTransactionModal
│   ├── notes/              # NoteCard, NoteEditorModal, NoteFilterBar, QuickNoteBar
│   └── settings/           # ThemeSection, UnitsSection, RulesSection, DataSection, AccountSection, AboutSection
├── stores/                 # Zustand stores
│   ├── authStore.ts        # Autenticación, sesión, perfil, modo app
│   ├── campaignStore.ts    # CRUD de campañas (Jugador)
│   ├── characterListStore.ts # Lista de personajes con auto-migración
│   ├── creationStore.ts    # Asistente de creación con auto-guardado
│   ├── masterStore.ts      # Campañas y jugadores del máster (Supabase)
│   ├── settingsStore.ts    # Tema, unidades, reglas opcionales
│   ├── characterBuilderHelpers.ts # Funciones puras de construcción de personaje
│   └── characterStore/     # Store modular (8 slices)
├── services/
│   └── supabaseService.ts  # Capa de acceso a datos de Supabase
├── lib/
│   └── supabase.ts         # Cliente Supabase singleton
├── data/srd/               # Datos del SRD
│   ├── races.ts, classes.ts, backgrounds.ts, spells.ts
│   ├── subclasses.ts, classAbilities.ts, leveling.ts
│   ├── spellDescriptions.ts
│   └── subclassFeatures/   # Rasgos de subclase por clase (13 archivos)
├── types/                  # Tipos TypeScript
│   ├── character.ts, spell.ts, campaign.ts, item.ts, notes.ts
│   ├── creation.ts, master.ts, supabase.ts
│   └── index.ts            # Re-exportaciones
├── hooks/                  # Hooks personalizados
│   ├── useTheme.ts         # Tokens de color según tema
│   ├── useDialog.ts        # Diálogos imperativos
│   ├── useToast.ts         # Notificaciones toast
│   ├── useCharacterSync.ts # Sincronización offline-first con Supabase
│   ├── useRealtimeCharacters.ts # Suscripciones Realtime (Máster)
│   ├── useEntranceAnimation.ts, usePulseAnimation.ts
│   ├── useScrollToTop.ts, useWebTransition.ts
│   └── index.ts
├── constants/              # Constantes del juego
│   ├── abilities.ts, character.ts, items.ts, notes.ts, spells.ts
└── utils/                  # Funciones utilitarias puras
    ├── theme.ts, dice.ts, storage.ts, combat.ts, spells.ts
    ├── character.ts, inventory.ts, notes.ts
    ├── auth.ts             # Traducción de errores de Supabase al español
    ├── units.ts            # Conversión de unidades (imperial ↔ métrico)
    ├── skillRollModifiers.ts # Modificadores pasivos de tiradas de habilidad
    ├── d20Geometry.ts      # Geometría del D20 para SVG
    ├── creationStepTheme.ts # Estilos temáticos para pasos de creación
    ├── date.ts             # Formateo de fechas en español
    └── providers.ts        # Inyección de random/now para testing

supabase/
└── migrations/             # Migraciones SQL (4 archivos)

docs/                       # Documentación e historias de usuario
```

### Arquitectura del Character Store (modular)

El store de personaje está compuesto por **8 domain slices** con Zustand:

| Slice | Responsabilidad |
|---|---|
| `characterCrudSlice` | Cargar/guardar/limpiar + getters computados |
| `combatSlice` | PG, dados de golpe, salvaciones de muerte, condiciones |
| `progressionSlice` | PX, subida de nivel |
| `magicSlice` | Espacios de conjuro, Magia de Pacto, puntos de hechicería |
| `classResourceSlice` | Ki, Ira, Segundo Aliento (patrón Strategy) |
| `inventorySlice` | Objetos y monedas |
| `notesSlice` | Notas CRUD |
| `restSlice` | Orquestación de descanso corto y largo |

Archivos auxiliares: `helpers.ts`, `levelUpHelpers.ts`, `classResourceStrategies.ts`, `classResourceTypes.ts`, `types.ts`.

### Arquitectura Supabase

Base de datos PostgreSQL con **5 tablas**:

| Tabla | Descripción |
|---|---|
| `profiles` | Perfil de usuario (`codigo_jugador`, `es_premium`, `modo_actual`) |
| `personajes` | Personajes sincronizados con datos JSONB |
| `campanas_master` | Campañas creadas por el Máster |
| `campana_jugadores` | Relación campaña–jugador (multi-jugador) |
| `campanas_jugador` | Campañas locales del jugador (sincronización) |

- **Row Level Security (RLS)** con políticas por usuario.
- **Realtime** habilitado para `personajes` (seguimiento en vivo en modo Máster).
- **4 migraciones** SQL para master mode, corrección de recursión RLS, códigos de personaje y políticas de inserción de perfil.

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx expo start

# Ejecutar en Android
npx expo start --android

# Ejecutar en iOS
npx expo start --ios

# Ejecutar en web
npx expo start --web
```

### Build con EAS

```bash
# Preview (APK para Android)
eas build --profile preview --platform android

# Producción (AAB para Android)
eas build --profile production --platform android
```

---

## Contenido SRD incluido

| Categoría | Detalle |
|---|---|
| **Razas** | 9 razas con subrazas, rasgos, bonificadores, idiomas + razas personalizadas |
| **Clases** | 12 clases con rasgos, equipo, lanzamiento de conjuros, dados de golpe |
| **Subclases** | Opciones de subclase con rasgos por nivel (13 archivos de rasgos) |
| **Trasfondos** | 13 trasfondos con tablas de personalidad + trasfondos personalizados |
| **Conjuros** | Base de datos completa del SRD (niveles 0–9) con descripciones en español |
| **Progresión** | Umbrales de PX, niveles de ASI, tablas de rasgos de clase |
| **Habilidades de clase** | Rasgos de clase por nivel |

---

## Tema y personalización

La app soporta **tema oscuro, claro y automático** (según sistema) con ~80+ tokens semánticos de color. El `tailwind.config.js` incluye paletas temáticas de D&D: colores por puntuación de característica, estado de PG, rareza de objetos y escuelas de magia.

14 **componentes decorativos temáticos** (CastleHeader, DragonDivider, MagicCircle, ParchmentCard, RunicBorder, ScrollBanner, ShieldFrame, SwordDivider, TorchGlow, etc.) proporcionan ambientación visual.

---

## Sincronización y datos

- **Offline-first:** Los datos se guardan primero en AsyncStorage (claves prefijadas `dyd:`).
- **Sync con Supabase:** El hook `useCharacterSync` observa el estado del personaje, calcula un fingerprint JSON y hace push con debounce (2s).
- **Flush al desmontar:** Los cambios pendientes se sincronizan al salir de la hoja de personaje.
- **Restauración cloud:** Al iniciar sesión, se restauran campañas y personajes desde Supabase a AsyncStorage.
- **Códigos de personaje:** Cada personaje sincronizado tiene un código compartible que el Máster usa para añadir jugadores.

---

## Licencia

El contenido del SRD 5.1 es propiedad de Wizards of the Coast y se distribuye bajo la [OGL 1.0a](https://www.opengamingfoundation.org/ogl.html).
