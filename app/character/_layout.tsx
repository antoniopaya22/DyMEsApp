import { Stack } from "expo-router";
import { useTheme } from "@/hooks";

export default function CharacterLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
