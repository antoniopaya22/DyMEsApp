import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreationStore, TOTAL_STEPS } from "@/stores/creationStore";
import { SEXO_NAMES, type Sexo } from "@/types/character";
import { ConfirmDialog } from "@/components/ui";
import { useTheme, useDialog } from "@/hooks";
import { withAlpha } from "@/utils/theme";

const CURRENT_STEP = 1;

export default function CharacterNameStep() {
  const { colors } = useTheme();
  const router = useRouter();

  const { draft, startCreation, loadDraft, saveDraft, setNombre, setSexo, isStepValid } =
    useCreationStore();

  const [nombre, setNombreLocal] = useState("");
  const [sexo, setSexoLocal] = useState<Sexo | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);
  const { dialogProps, showDestructive } = useDialog();

  // ── Entrance animations ──
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(15)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const inputSlide = useRef(new Animated.Value(15)).current;
  const sexAnim = useRef(new Animated.Value(0)).current;
  const sexSlide = useRef(new Animated.Value(15)).current;
  const suggestionsAnim = useRef(new Animated.Value(0)).current;
  const suggestionsSlide = useRef(new Animated.Value(15)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const footerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!initialized) return;
    // Staggered entrance
    Animated.stagger(90, [
      // Icon bounce
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
        Animated.timing(iconAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      // Title + subtitle
      Animated.parallel([
        Animated.timing(titleAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Input field
      Animated.parallel([
        Animated.timing(inputAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(inputSlide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Sex selector
      Animated.parallel([
        Animated.timing(sexAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sexSlide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Suggestions
      Animated.parallel([
        Animated.timing(suggestionsAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(suggestionsSlide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Footer
      Animated.parallel([
        Animated.timing(footerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(footerSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
    // Animated progress bar fill
    Animated.timing(progressBarAnim, {
      toValue: progressPercent / 100,
      duration: 800,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [initialized]);

  // Inicializar o cargar borrador al montar
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        // Intentar cargar borrador existente
        const loaded = await loadDraft();
        if (loaded) {
          const currentDraft = useCreationStore.getState().draft;
          if (currentDraft?.nombre) {
            setNombreLocal(currentDraft.nombre);
          }
          if (currentDraft?.sexo) {
            setSexoLocal(currentDraft.sexo);
          }
        } else {
          // Crear nuevo borrador
          await startCreation();
        }
        setInitialized(true);
      };
      init();
    }, []),
  );

  // Sincronizar el nombre local con el store
  const draftNombre = draft?.nombre;
  useEffect(() => {
    if (initialized && nombre !== draftNombre) {
      setNombre(nombre);
    }
  }, [nombre, initialized, draftNombre, setNombre]);

  // Sincronizar el sexo local con el store
  const draftSexo = draft?.sexo;
  useEffect(() => {
    if (initialized && sexo && sexo !== draftSexo) {
      setSexo(sexo);
    }
  }, [sexo, initialized, draftSexo, setSexo]);

  const isValid = nombre.trim().length >= 1 && !!sexo;

  const handleNext = async () => {
    if (!isValid) return;
    // Guardar borrador antes de navegar
    setNombre(nombre.trim());
    if (sexo) setSexo(sexo);
    await saveDraft();
    router.push("/create/race");
  };

  const handleCancel = () => {
    if (nombre.trim().length > 0 || sexo) {
      showDestructive(
        "Cancelar creación",
        "¿Estás seguro de que quieres cancelar? El borrador se guardará automáticamente y podrás continuar más tarde.",
        async () => {
          if (nombre.trim().length > 0) {
            setNombre(nombre.trim());
          }
          if (sexo) setSexo(sexo);
          await saveDraft();
          router.back();
        },
        { confirmText: "Salir", cancelText: "Seguir editando" },
      );
    } else {
      router.back();
    }
  };

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.bgPrimary }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        {/* Header con progreso */}
        <View className="px-5 pt-16 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              className="h-10 w-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.headerButtonBg }}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
              Paso {CURRENT_STEP} de {TOTAL_STEPS}
            </Text>

            {/* Placeholder para mantener el layout centrado */}
            <View className="h-10 w-10" />
          </View>

          {/* Barra de progreso */}
          <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgInput }}>
            <Animated.View
              className="h-full bg-primary-500 rounded-full"
              style={{
                width: progressBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        </View>

        {/* Contenido del paso */}
        <View className="flex-1 px-5 justify-center" style={{ marginTop: -60 }}>
          <Animated.View className="items-center mb-10" style={{ opacity: iconAnim, transform: [{ scale: iconScale }] }}>
            <View className="h-20 w-20 rounded-full bg-primary-500/15 items-center justify-center mb-5">
              <Ionicons
                name="text-outline"
                size={40}
                color={colors.accentRed}
              />
            </View>

            <Animated.View style={{ opacity: titleAnim, transform: [{ translateY: titleSlide }] }}>
              <Text className="text-2xl font-bold text-center mb-2" style={{ color: colors.textPrimary }}>
                ¿Cómo se llama tu personaje?
              </Text>
              <Text className="text-base text-center leading-6 px-4" style={{ color: colors.textSecondary }}>
                Elige un nombre que identifique a tu héroe en la partida. Podrás
                cambiarlo más adelante.
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Campo de nombre */}
          <Animated.View className="mb-6" style={{ opacity: inputAnim, transform: [{ translateY: inputSlide }] }}>
            <TextInput
              className="rounded-xl px-5 py-4 text-xl border font-semibold"
              style={{ backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderDefault }}
              placeholder="Nombre del personaje"
              placeholderTextColor={colors.textMuted}
              value={nombre}
              onChangeText={setNombreLocal}
              maxLength={50}
              autoFocus
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
            <Text className="text-xs mt-2 text-center" style={{ color: colors.textMuted }}>
              Máximo 50 caracteres · Se admiten tildes y caracteres especiales
            </Text>
          </Animated.View>

          {/* Selector de sexo */}
          <Animated.View className="mb-6" style={{ opacity: sexAnim, transform: [{ translateY: sexSlide }] }}>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: colors.textMuted }}>
              Sexo del personaje
            </Text>
            <View className="flex-row justify-center">
              {(Object.entries(SEXO_NAMES) as [Sexo, string][]).map(([key, label]) => {
                const selected = sexo === key;
                const icon = key === "masculino" ? "male" : key === "femenino" ? "female" : "male-female";
                return (
                  <TouchableOpacity
                    key={key}
                    className="items-center justify-center rounded-xl px-5 py-3 mx-2 border"
                    style={{
                      backgroundColor: selected ? colors.accentRed : colors.bgCard,
                      borderColor: selected ? colors.accentRed : colors.borderDefault,
                      minWidth: 90,
                    }}
                    onPress={() => setSexoLocal(key)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={22}
                      color={selected ? colors.textInverted : colors.textSecondary}
                    />
                    <Text
                      className="text-sm font-semibold mt-1"
                      style={{ color: selected ? colors.textInverted : colors.textSecondary }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Sugerencias */}
          <Animated.View className="mb-8" style={{ opacity: suggestionsAnim, transform: [{ translateY: suggestionsSlide }] }}>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: colors.textMuted }}>
              Ideas de nombre
            </Text>
            <View className="flex-row flex-wrap justify-center">
              {[
                "Thorin",
                "Elara",
                "Ragnar",
                "Lyra",
                "Aldric",
                "Isolde",
                "Kael",
                "Seraphina",
              ].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  className="border rounded-full px-4 py-2 m-1"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
                  onPress={() => setNombreLocal(suggestion)}
                >
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>

        {/* Footer con botones de navegación */}
        <Animated.View className="px-5 pb-10 pt-4 border-t" style={{ borderTopColor: colors.borderDefault, opacity: footerAnim, transform: [{ translateY: footerSlide }] }}>
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center"
            style={{
              backgroundColor: isValid ? colors.accentRed : colors.bgSecondary,
              opacity: isValid ? 1 : 0.5,
            }}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text className="font-bold text-base mr-2" style={{ color: colors.textInverted }}>
              Siguiente: Raza
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textInverted} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      {/* Custom dialog (replaces Alert.alert) */}
      <ConfirmDialog {...dialogProps} />
    </KeyboardAvoidingView>
  );
}
