---
mode: agent
description: "Build development client APK"
---

# Build de desarrollo

Genera un build de desarrollo de Android usando EAS Build con el perfil `development`. Este build incluye el development client para hot-reload y debugging.

## Pre-checks

1. Verifica que `eas-cli` está instalado ejecutando `eas --version`. Si no está instalado, instálalo con `npm install -g eas-cli`.
2. Verifica que el usuario tiene sesión activa en EAS ejecutando `eas whoami`. Si no hay sesión, indica que debe ejecutar `eas login` manualmente (no ejecutes login automáticamente por seguridad).
3. Verifica que `expo-dev-client` está en las dependencias del proyecto (`package.json`). Si no está, instálalo con `npx expo install expo-dev-client`.
4. Verifica que `eas.json` tiene el perfil `development` con `developmentClient: true`.

## Build

Ejecuta el build:

```bash
eas build --profile development --platform android --non-interactive
```

## Post-build

1. Informa al usuario que el build de desarrollo se ha iniciado.
2. Indica que puede seguir el progreso en https://expo.dev o ejecutando `eas build:list`.
3. Una vez instalada la APK de desarrollo en el dispositivo, puede conectarse ejecutando `npx expo start --dev-client`.
