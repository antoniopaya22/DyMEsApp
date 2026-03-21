# Copilot Instructions — DyMEs

Este proyecto es una app de D&D 5e en español construida con Expo + React Native + TypeScript + Zustand + NativeWind + Supabase.

## Reglas generales

- Lee `AGENTS.md` en la raíz del proyecto para convenciones detalladas antes de hacer cambios significativos.
- Usa **path aliases** (`@/`, `@stores/`, `@components/`, etc.) en todos los imports. Nunca rutas relativas profundas.
- El dominio del juego (UI, variables de negocio, tipos) está en **español**. Commits y comentarios técnicos en **inglés**.
- Commits siguen **Conventional Commits**: `type(scope): description` en inglés.

## Reglas de arquitectura

- Estado global: **Zustand** con persistencia manual via `@utils/storage`. No usar persist middleware.
- Base de datos: acceder **solo** via `src/services/supabaseService.ts`. No importar el client de Supabase en componentes, hooks o stores.
- Estilos: preferir NativeWind `className`. Solo usar `StyleSheet` para estilos dinámicos.
- Lógica de negocio compleja: extraer a helpers puros (`*Helpers.ts`). Stores deben ser orquestadores delgados.
- Character store: compuesto por slices en `src/stores/characterStore/`. Añadir funcionalidad creando/editando slices, no en index.ts.

## Formato

- Prettier: singleQuote, semi, trailingComma all, printWidth 100
- TypeScript strict mode habilitado
