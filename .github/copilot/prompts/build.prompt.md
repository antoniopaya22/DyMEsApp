---
mode: agent
description: "Build APK for distribution (preview profile)"
---

# Build APK para distribución

Genera un build APK de Android usando EAS Build con el perfil `preview`, listo para distribuir.

## Pre-checks

1. Verifica que `eas-cli` está instalado ejecutando `eas --version`. Si no está instalado, instálalo con `npm install -g eas-cli`.
2. Verifica que el usuario tiene sesión activa en EAS ejecutando `eas whoami`. Si no hay sesión, indica que debe ejecutar `eas login` manualmente (no ejecutes login automáticamente por seguridad).
3. Verifica que `eas.json` tiene el perfil `preview` con `buildType: "apk"`.

## Build

Ejecuta el build:

```bash
eas build --profile preview --platform android --non-interactive
```

## Post-build

1. Informa al usuario que el build se ha iniciado en los servidores de EAS.
2. Indica que puede seguir el progreso en https://expo.dev o ejecutando `eas build:list`.
3. Una vez completado, la APK estará disponible para descarga desde el dashboard de EAS.
