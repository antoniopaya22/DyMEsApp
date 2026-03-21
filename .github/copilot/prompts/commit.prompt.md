---
mode: agent
description: "Stage, commit (Conventional Commits) and push"
---

# Git Commit & Push

Realiza git add, genera un commit message siguiendo Conventional Commits, y push a la rama actual.

## Instrucciones

### 1. Stage changes

```bash
git add -A
```

### 2. Analizar cambios

Ejecuta `git diff --cached --stat` y `git diff --cached` para entender qué archivos han cambiado y qué tipo de cambios son.

### 3. Generar commit message

Basándote en el análisis de los cambios, genera un mensaje de commit siguiendo **Conventional Commits**:

**Formato:**
```
type(scope): descripción concisa en inglés
```

**Types válidos:**
- `feat` — nueva funcionalidad
- `fix` — corrección de bug
- `docs` — solo documentación
- `style` — formateo, sin cambios de lógica
- `refactor` — reestructuración sin cambio de comportamiento
- `perf` — mejora de rendimiento
- `test` — añadir o corregir tests
- `chore` — mantenimiento, config, dependencias
- `ci` — cambios en CI/CD
- `build` — cambios en sistema de build

**Scope:** inferir del área principal afectada (e.g., `character`, `campaign`, `creation`, `ui`, `stores`, `auth`, `master`, `combat`, `inventory`, `spells`, `notes`, `compendium`, `settings`, `navigation`, `deps`).

**Reglas:**
- Mensaje en **inglés**, conciso (max 72 caracteres la primera línea)
- Si hay muchos cambios variados, usar el type más representativo
- Si hay breaking changes, añadir `!` después del scope: `feat(character)!: descripción`
- Opcionalmente añadir body con más detalle si los cambios son complejos

### 4. Mostrar y confirmar

Muestra al usuario el commit message generado y los archivos que se van a commitear. **Pide confirmación antes de ejecutar el commit y push**.

### 5. Commit y Push

Una vez confirmado:
```bash
git commit -m "type(scope): message"
git push origin HEAD
```

Si el push falla porque la rama no tiene upstream, usa:
```bash
git push --set-upstream origin $(git branch --show-current)
```
