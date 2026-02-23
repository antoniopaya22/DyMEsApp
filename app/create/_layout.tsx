import { Stack } from "expo-router";
import { useTheme } from "@/hooks";

/**
 * Layout del wizard de creación de personaje.
 * Usa un Stack navigator para los pasos del proceso.
 * Los pasos son:
 *   1. index    → Nombre del personaje
 *   2. race     → Selección de raza y subraza
 *   3. class    → Selección de clase
 *   4. abilities → Asignación de puntuaciones de característica
 *   5. background → Selección de trasfondo
 *   6. skills   → Competencias en habilidades
 *   7. spells   → Habilidades iniciales (si aplica)
 *   8. equipment → Equipamiento inicial
 *   9. personality → Personalidad y alineamiento
 *  10. appearance → Apariencia (opcional)
 *  11. summary  → Resumen y confirmación
 */
export default function CharacterCreationLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="race" />
      <Stack.Screen name="class" />
      <Stack.Screen name="abilities" />
      <Stack.Screen name="background" />
      <Stack.Screen name="skills" />
      <Stack.Screen name="spells" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="personality" />
      <Stack.Screen name="appearance" />
      <Stack.Screen
        name="summary"
        options={{
          animation: "fade",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
