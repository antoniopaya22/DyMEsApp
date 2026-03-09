import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCampaignStore } from "@/stores/campaignStore";
import {
  ConfirmDialog,
  Toast,
  ScreenContainer,
  PageHeader,
  GradientButton,
} from "@/components/ui";
import { CampaignImagePicker } from "@/components/campaigns";
import { type CampaignImageId } from "@/constants/campaignImages";
import { useEntranceAnimation, useTheme, useDialog, useToast } from "@/hooks";

export default function NewCampaignScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { createCampaign } = useCampaignStore();

  const [nombre, setNombre] = useState("");
  const [selectedImage, setSelectedImage] = useState<CampaignImageId | null>("campana1");
  const [saving, setSaving] = useState(false);

  const { dialogProps, showDestructive } = useDialog();
  const { toastProps, showError: toastError } = useToast();

  const isValid = nombre.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    try {
      const campaign = await createCampaign({
        nombre: nombre.trim(),
        imagen: selectedImage || undefined,
      });
      router.replace(`/campaigns/${campaign.id}`);
    } catch (error) {
      toastError("No se pudo crear la partida", "Inténtalo de nuevo");
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    if (nombre.trim().length > 0) {
      showDestructive(
        "Descartar cambios",
        "¿Estás seguro de que quieres salir? Se perderá el nombre introducido.",
        () => router.back(),
        { confirmText: "Descartar", cancelText: "Seguir editando" },
      );
    } else {
      router.back();
    }
  };

  // ── Entrance animations ──
  const { containerStyle: formStyle } = useEntranceAnimation({ slide: true, distance: 20, duration: 400, slideDuration: 450 });
  const { opacity: infoFade } = useEntranceAnimation({ delay: 120, duration: 350 });
  const { opacity: buttonFade } = useEntranceAnimation({ delay: 240, duration: 350 });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScreenContainer>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <PageHeader
            title="Nueva Partida"
            label="Nueva campaña"
            onBack={handleGoBack}
            subtitle="Dale un nombre a tu campaña para empezar. Podrás añadir imagen, descripción y más detalles después."
          />

          {/* ── Form ── */}
          <Animated.View style={[styles.formContainer, formStyle]}>
            {/* Selector de imagen */}
            <CampaignImagePicker
              selected={selectedImage}
              onSelect={setSelectedImage}
            />

            {/* Nombre de la partida */}
            <View style={styles.fieldGroup}>
              <Text
                style={[styles.fieldLabel, { color: colors.textSecondary }]}
              >
                Nombre de la partida{" "}
                <Text
                  style={[
                    styles.fieldLabelRequired,
                    { color: colors.accentRed },
                  ]}
                >
                  *
                </Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.bgInput,
                    borderColor: colors.borderDefault,
                  },
                ]}
              >
                <Ionicons
                  name="text-outline"
                  size={18}
                  color={colors.textMuted}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Ej: Las Minas Perdidas de Phandelver"
                  placeholderTextColor={colors.textMuted}
                  value={nombre}
                  onChangeText={setNombre}
                  maxLength={100}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
              </View>
              <View
                style={[
                  styles.fieldCounter,
                  { backgroundColor: colors.borderSubtle },
                ]}
              >
                <View
                  style={[
                    styles.fieldCounterBar,
                    { width: `${(nombre.length / 100) * 100}%` },
                  ]}
                />
              </View>
              <Text
                style={[styles.fieldCounterText, { color: colors.textMuted }]}
              >
                {nombre.length}/100
              </Text>
            </View>
          </Animated.View>

          {/* ── Info Card ── */}
          <Animated.View
            style={[styles.infoCardContainer, { opacity: infoFade }]}
          >
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderDefault,
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(0,229,255,0.04)", "rgba(0,229,255,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.infoCardAccent}>
                <LinearGradient
                  colors={[
                    colors.accentGold,
                    colors.accentGold + "66",
                    colors.accentGold + "22",
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ flex: 1, width: "100%" }}
                />
              </View>

              <View style={styles.infoCardContent}>
                <View style={styles.infoCardHeader}>
                  <View
                    style={[
                      styles.infoCardIconBg,
                      { backgroundColor: colors.accentGoldGlow },
                    ]}
                  >
                    <Ionicons
                      name="sparkles"
                      size={16}
                      color={colors.accentGold}
                    />
                  </View>
                  <Text
                    style={[
                      styles.infoCardTitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Siguiente paso
                  </Text>
                </View>
                <Text
                  style={[
                    styles.infoCardText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Una vez creada la partida, podrás añadir imagen, descripción y
                  crear un personaje de D&D 5e paso a paso: elegir raza, clase,
                  estadísticas, habilidades, equipamiento y más.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Buttons ── */}
          <Animated.View
            style={[styles.buttonsContainer, { opacity: buttonFade }]}
          >
            <GradientButton
              label="Crear Partida"
              icon="add-circle"
              onPress={handleCreate}
              disabled={!isValid}
              loading={saving}
              loadingLabel="Creando partida..."
            />

            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.bgSubtle,
                  borderColor: colors.borderDefault,
                },
              ]}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ScreenContainer>

      <ConfirmDialog {...dialogProps} />
      <Toast {...toastProps} />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Form ──
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  fieldLabelRequired: {
    color: "#00BCD4",
    fontWeight: "800",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },
  fieldCounter: {
    height: 2,
    backgroundColor: "transparent",
    borderRadius: 1,
    marginTop: 8,
    overflow: "hidden",
  },
  fieldCounterBar: {
    height: "100%",
    backgroundColor: "rgba(0,188,212,0.5)",
    borderRadius: 1,
  },
  fieldCounterText: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 4,
  },

  // ── Info Card ──
  infoCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  infoCardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    overflow: "hidden",
  },
  infoCardContent: {
    padding: 16,
    paddingLeft: 18,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoCardIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(0,229,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoCardText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // ── Buttons ──
  buttonsContainer: {
    paddingHorizontal: 20,
  },
  cancelButton: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
  cancelButtonText: {
    color: "transparent",
    fontWeight: "600",
    fontSize: 15,
  },
});
