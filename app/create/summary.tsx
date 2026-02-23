import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ConfirmDialog } from "@/components/ui";
import { useTheme, useDialog, useScrollToTop } from "@/hooks";
import {
  useCreationStore,
  TOTAL_STEPS,
  STEP_NAMES,
  calcTotalScoresPreview,
} from "@/stores/creationStore";
import { useCharacterListStore } from "@/stores/characterListStore";
import { getRaceData, getClassData, getBackgroundData } from "@/data/srd";
import { buildRaceDataFromCustom } from "@/data/srd/races";
import {
  ABILITY_ABBR,
  ABILITY_NAMES,
  ALIGNMENT_NAMES,
  SKILLS,
  calcModifier,
  type AbilityKey,
} from "@/types/character";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";

const CURRENT_STEP = 11;

const ABILITY_KEYS: AbilityKey[] = ["fue", "des", "con", "int", "sab", "car"];

function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export default function SummaryStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();
  const { dialogProps, showConfirm, showSuccess, showError } = useDialog();

  const {
    draft,
    isStepValid,
    getCompletedSteps,
    buildCharacter,
    discardDraft,
    saveDraft,
    loadDraft,
  } = useCreationStore();

  const { addCharacter, loadCharacters } = useCharacterListStore();

  const [creating, setCreating] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadDraft();
        setInitialized(true);
      };
      init();
    }, []),
  );

  const completedSteps = initialized ? getCompletedSteps() : [];
  const allRequiredComplete = completedSteps.length >= 9;

  // Draft data
  const raceData = draft?.raza
    ? draft.raza === "personalizada" && draft.customRaceData
      ? buildRaceDataFromCustom(draft.customRaceData)
      : getRaceData(draft.raza)
    : null;
  const classData = draft?.clase ? getClassData(draft.clase) : null;
  const backgroundData = draft?.trasfondo
    ? draft.trasfondo === "personalizada" && draft.customBackgroundData
      ? {
          nombre: draft.customBackgroundData.nombre || "Personalizada",
          skillProficiencies: draft.customBackgroundData.skillProficiencies,
          featureName: draft.customBackgroundData.featureName,
        }
      : getBackgroundData(draft.trasfondo)
    : null;

  // Ability scores preview
  const baseScores = draft?.abilityScoresBase;
  const totalScores =
    baseScores && draft?.raza
      ? calcTotalScoresPreview(
          baseScores,
          draft.raza,
          draft.subraza ?? null,
          draft.freeAbilityBonuses,
          draft.customRaceData?.abilityBonuses,
        )
      : null;

  // Granted + chosen skills
  const allSkills = draft?.skillChoices ?? [];

  const handleCreate = async () => {
    console.log(
      "[SummaryStep] handleCreate llamado. allRequiredComplete:",
      allRequiredComplete,
      "creating:",
      creating,
    );
    if (!allRequiredComplete || creating) {
      console.log("[SummaryStep] handleCreate abortado (botón deshabilitado)");
      return;
    }

    const isRecreation = !!draft?.recreatingCharacterId;

    showConfirm(
      isRecreation ? "Recrear Personaje" : "Crear Personaje",
      isRecreation
        ? "¿Estás seguro de que quieres recrear este personaje con las nuevas opciones? Se reemplazarán las estadísticas, habilidades, hechizos y equipamiento anteriores."
        : "¿Estás seguro de que quieres crear este personaje? Podrás editar sus datos desde la hoja de personaje después.",
      async () => {
        setCreating(true);
        try {
          console.log("[SummaryStep] Construyendo personaje...");
          const character = buildCharacter();
          if (!character) {
            const missing: string[] = [];
            if (!draft?.nombre) missing.push("Nombre");
            if (!draft?.raza) missing.push("Raza");
            if (!draft?.clase) missing.push("Clase");
            if (!draft?.abilityScoresBase) missing.push("Estadísticas");
            if (!draft?.trasfondo) missing.push("Trasfondo");

            throw new Error(
              `No se pudo construir el personaje. Faltan datos: ${missing.join(", ") || "desconocido"}.`,
            );
          }

          console.log("[SummaryStep] Guardando personaje:", character.id);

          const { setItem } = await import("@/utils/storage");
          const { STORAGE_KEYS } = await import("@/utils/storage");
          const { createDefaultInventory } = await import("@/types/item");

          await setItem(STORAGE_KEYS.CHARACTER(character.id), character);
          console.log("[SummaryStep] Personaje guardado en storage");

          if (!isRecreation) {
            // Only create a new inventory for brand new characters
            const inventory = createDefaultInventory(
              character.inventoryId,
              character.id,
            );
            await setItem(STORAGE_KEYS.INVENTORY(character.id), inventory);
            console.log("[SummaryStep] Inventario creado");
          }

          await addCharacter(character);
          console.log("[SummaryStep] Personaje añadido a la lista");

          const charName = character.nombre;
          const charId = character.id;

          console.log("[SummaryStep] Mostrando diálogo de éxito...");

          // Show success dialog BEFORE discarding the draft to prevent
          // a re-render (draft→null) that could interfere with the dialog
          showSuccess(
            isRecreation ? "¡Personaje Recreado!" : "¡Personaje Creado!",
            isRecreation
              ? `${charName} ha sido recreado con las nuevas opciones. ¡Buena aventura!`
              : `${charName} ha sido creado exitosamente. ¡Buena aventura!`,
            async () => {
              console.log("[SummaryStep] OK pulsado, navegando...");
              // Clean up draft and reload character list
              try {
                await discardDraft();
                await loadCharacters();
              } catch (e) {
                console.warn("[SummaryStep] Error limpiando draft:", e);
              }
              // Navigate directly to the character sheet.
              router.replace(`/character/${charId}`);
            },
          );

          // Keep creating=true so the button stays disabled while
          // the success dialog is visible
        } catch (error) {
          console.error("[SummaryStep] Error creando personaje:", error);
          const message =
            error instanceof Error
              ? error.message
              : "Error desconocido al crear el personaje";
          showError("Error", message);
          setCreating(false);
        }
      },
      { confirmText: isRecreation ? "¡Recrear!" : "¡Crear!", cancelText: "Revisar", type: "confirm" },
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleGoToStep = (step: number) => {
    const routes: Record<number, string> = {
      1: "index",
      2: "race",
      3: "class",
      4: "abilities",
      5: "background",
      6: "skills",
      7: "spells",
      8: "equipment",
      9: "personality",
      10: "appearance",
    };
    const route = routes[step];
    if (route) {
      router.push(`/create/${route}`);
    }
  };

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  if (!initialized) {
    return (
      <View style={[styles.container, themed.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accentRed} />
        <Text style={[styles.loadingText, themed.loadingText]}>
          Cargando resumen...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, themed.container]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.backButton, themed.backButton]}
              onPress={handleBack}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.stepText, themed.stepText]}>
              Paso {CURRENT_STEP} de {TOTAL_STEPS}
            </Text>
            <View style={{ height: 40, width: 40 }} />
          </View>
          <View style={[styles.progressBar, themed.progressBar]}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="checkmark-circle-outline"
              size={44}
              color={colors.accentRed}
            />
          </View>
          <Text style={[styles.title, themed.title]}>
            Resumen del Personaje
          </Text>
          <Text style={[styles.subtitle, themed.subtitle]}>
            Revisa todos los datos de tu personaje antes de crearlo. Pulsa en
            cualquier sección para editarla.
          </Text>
        </View>

        {/* Steps completion checklist */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.sectionTitle]}>
            Estado de Pasos
          </Text>
          <View style={[styles.checklistCard, themed.card]}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => {
              const valid = isStepValid(step);
              const stepName = STEP_NAMES[step] ?? `Paso ${step}`;
              return (
                <TouchableOpacity
                  key={step}
                  style={[
                    styles.checklistRow,
                    { borderBottomColor: colors.borderSubtle },
                  ]}
                  onPress={() => handleGoToStep(step)}
                >
                  <Ionicons
                    name={valid ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={valid ? colors.accentGreen : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.checklistText,
                      { color: colors.textMuted },
                      valid && [
                        styles.checklistTextDone,
                        { color: colors.textPrimary },
                      ],
                    ]}
                  >
                    {step}. {stepName}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Character Summary Card */}
        {draft && (
          <>
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                Información Básica
              </Text>
              <View style={[styles.summaryCard, themed.card]}>
                {draft.nombre && (
                  <View
                    style={[
                      styles.summaryRow,
                      { borderBottomColor: colors.borderSubtle },
                    ]}
                  >
                    <Text style={[styles.summaryLabel, themed.textSecondary]}>
                      Nombre
                    </Text>
                    <Text style={[styles.summaryValue, themed.textPrimary]}>
                      {draft.nombre}
                    </Text>
                  </View>
                )}

                {raceData && (
                  <View
                    style={[
                      styles.summaryRow,
                      { borderBottomColor: colors.borderSubtle },
                    ]}
                  >
                    <Text style={[styles.summaryLabel, themed.textSecondary]}>
                      Raza
                    </Text>
                    <Text style={[styles.summaryValue, themed.textPrimary]}>
                      {raceData.nombre}
                      {draft.subraza
                        ? ` (${raceData.subraces.find((s) => s.id === draft.subraza)?.nombre ?? draft.subraza})`
                        : ""}
                    </Text>
                  </View>
                )}

                {classData && (
                  <View
                    style={[
                      styles.summaryRow,
                      { borderBottomColor: colors.borderSubtle },
                    ]}
                  >
                    <Text style={[styles.summaryLabel, themed.textSecondary]}>
                      Clase
                    </Text>
                    <Text style={[styles.summaryValue, themed.textPrimary]}>
                      {classData.nombre} (Nivel 1)
                    </Text>
                  </View>
                )}

                {backgroundData && (
                  <View
                    style={[
                      styles.summaryRow,
                      { borderBottomColor: colors.borderSubtle },
                    ]}
                  >
                    <Text style={[styles.summaryLabel, themed.textSecondary]}>
                      Trasfondo
                    </Text>
                    <Text style={[styles.summaryValue, themed.textPrimary]}>
                      {backgroundData.nombre}
                    </Text>
                  </View>
                )}

                {draft.alineamiento && (
                  <View
                    style={[
                      styles.summaryRow,
                      { borderBottomColor: colors.borderSubtle },
                    ]}
                  >
                    <Text style={[styles.summaryLabel, themed.textSecondary]}>
                      Alineamiento
                    </Text>
                    <Text style={[styles.summaryValue, themed.textPrimary]}>
                      {ALIGNMENT_NAMES[draft.alineamiento]}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Ability Scores */}
            {totalScores && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                  Puntuaciones de Característica
                </Text>
                <View style={styles.scoresGrid}>
                  {ABILITY_KEYS.map((key) => {
                    const total = totalScores[key];
                    const mod = calcModifier(total);
                    return (
                      <View key={key} style={[styles.scoreCard, themed.card]}>
                        <Text
                          style={[
                            styles.scoreAbbr,
                            { color: colors.accentGold },
                          ]}
                        >
                          {ABILITY_ABBR[key]}
                        </Text>
                        <Text style={[styles.scoreTotal, themed.textPrimary]}>
                          {total}
                        </Text>
                        <Text style={[styles.scoreMod, themed.textSecondary]}>
                          {formatMod(mod)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* HP Preview */}
                {classData && totalScores && (
                  <View style={[styles.hpPreview, themed.hpPreview]}>
                    <View style={styles.hpIcon}>
                      <Ionicons
                        name="heart"
                        size={20}
                        color={colors.accentGreen}
                      />
                    </View>
                    <View style={styles.hpInfo}>
                      <Text style={[styles.hpLabel, themed.hpLabel]}>
                        Puntos de Golpe a Nivel 1
                      </Text>
                      <Text
                        style={[styles.hpValue, { color: colors.accentGreen }]}
                      >
                        {classData.hitDieMax + calcModifier(totalScores.con)} PG
                      </Text>
                    </View>
                    <View style={[styles.hitDieBadge, themed.hitDieBadge]}>
                      <Text style={[styles.hitDieText, themed.hitDieText]}>
                        Dado: {classData.hitDie}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Skills */}
            {allSkills.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                  Competencias en Habilidades
                </Text>
                <View style={styles.skillsGrid}>
                  {allSkills.map((sk) => {
                    const def = SKILLS[sk];
                    return (
                      <View
                        key={sk}
                        style={[
                          styles.skillBadge,
                          {
                            backgroundColor: colors.bgCard,
                            borderColor: `${colors.accentGreen}30`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={colors.accentGreen}
                        />
                        <Text
                          style={[styles.skillBadgeText, themed.textPrimary]}
                        >
                          {def?.nombre ?? sk}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Spells */}
            {draft.spellChoices &&
              (draft.spellChoices.cantrips.length > 0 ||
                draft.spellChoices.spells.length > 0) && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                    Habilidades
                  </Text>
                  <View style={[styles.summaryCard, themed.card]}>
                    {draft.spellChoices.cantrips.length > 0 && (
                      <View
                        style={[
                          styles.summaryRow,
                          { borderBottomColor: colors.borderSubtle },
                        ]}
                      >
                        <Text
                          style={[styles.summaryLabel, themed.textSecondary]}
                        >
                          Trucos
                        </Text>
                        <Text style={[styles.summaryValue, themed.textPrimary]}>
                          {draft.spellChoices.cantrips.length} seleccionados
                        </Text>
                      </View>
                    )}
                    {draft.spellChoices.spells.length > 0 && (
                      <View
                        style={[
                          styles.summaryRow,
                          { borderBottomColor: colors.borderSubtle },
                        ]}
                      >
                        <Text
                          style={[styles.summaryLabel, themed.textSecondary]}
                        >
                          Conjuros Nv.1
                        </Text>
                        <Text style={[styles.summaryValue, themed.textPrimary]}>
                          {draft.spellChoices.spells.length} seleccionados
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

            {/* Personality */}
            {draft.personality && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                  Personalidad
                </Text>
                <View style={[styles.summaryCard, themed.card]}>
                  {draft.personality.traits &&
                    draft.personality.traits.length > 0 && (
                      <View
                        style={[
                          styles.personalityRow,
                          { borderBottomColor: colors.borderSubtle },
                        ]}
                      >
                        <Text
                          style={[
                            styles.personalityLabel,
                            { color: colors.accentGold },
                          ]}
                        >
                          Rasgos
                        </Text>
                        <Text
                          style={[styles.personalityValue, themed.textPrimary]}
                        >
                          {Array.isArray(draft.personality.traits)
                            ? draft.personality.traits.join("; ")
                            : draft.personality.traits}
                        </Text>
                      </View>
                    )}
                  {draft.personality.ideals && (
                    <View
                      style={[
                        styles.personalityRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text
                        style={[
                          styles.personalityLabel,
                          { color: colors.accentGold },
                        ]}
                      >
                        Ideales
                      </Text>
                      <Text
                        style={[styles.personalityValue, themed.textPrimary]}
                      >
                        {draft.personality.ideals}
                      </Text>
                    </View>
                  )}
                  {draft.personality.bonds && (
                    <View
                      style={[
                        styles.personalityRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text
                        style={[
                          styles.personalityLabel,
                          { color: colors.accentGold },
                        ]}
                      >
                        Vínculos
                      </Text>
                      <Text
                        style={[styles.personalityValue, themed.textPrimary]}
                      >
                        {draft.personality.bonds}
                      </Text>
                    </View>
                  )}
                  {draft.personality.flaws && (
                    <View
                      style={[
                        styles.personalityRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text
                        style={[
                          styles.personalityLabel,
                          { color: colors.accentGold },
                        ]}
                      >
                        Defectos
                      </Text>
                      <Text
                        style={[styles.personalityValue, themed.textPrimary]}
                      >
                        {draft.personality.flaws}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Appearance */}
            {draft.appearance && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                  Apariencia
                </Text>
                <View style={[styles.summaryCard, themed.card]}>
                  {draft.appearance.age && (
                    <View
                      style={[
                        styles.summaryRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, themed.textSecondary]}>
                        Edad
                      </Text>
                      <Text style={[styles.summaryValue, themed.textPrimary]}>
                        {draft.appearance.age}
                      </Text>
                    </View>
                  )}
                  {draft.appearance.height && (
                    <View
                      style={[
                        styles.summaryRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, themed.textSecondary]}>
                        Altura
                      </Text>
                      <Text style={[styles.summaryValue, themed.textPrimary]}>
                        {draft.appearance.height}
                      </Text>
                    </View>
                  )}
                  {draft.appearance.weight && (
                    <View
                      style={[
                        styles.summaryRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, themed.textSecondary]}>
                        Peso
                      </Text>
                      <Text style={[styles.summaryValue, themed.textPrimary]}>
                        {draft.appearance.weight}
                      </Text>
                    </View>
                  )}
                  {draft.appearance.hairColor && (
                    <View
                      style={[
                        styles.summaryRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, themed.textSecondary]}>
                        Pelo
                      </Text>
                      <Text style={[styles.summaryValue, themed.textPrimary]}>
                        {draft.appearance.hairColor}
                      </Text>
                    </View>
                  )}
                  {draft.appearance.eyeColor && (
                    <View
                      style={[
                        styles.summaryRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, themed.textSecondary]}>
                        Ojos
                      </Text>
                      <Text style={[styles.summaryValue, themed.textPrimary]}>
                        {draft.appearance.eyeColor}
                      </Text>
                    </View>
                  )}
                  {draft.appearance.skinColor && (
                    <View
                      style={[
                        styles.summaryRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, themed.textSecondary]}>
                        Piel
                      </Text>
                      <Text style={[styles.summaryValue, themed.textPrimary]}>
                        {draft.appearance.skinColor}
                      </Text>
                    </View>
                  )}
                  {draft.appearance.description && (
                    <View
                      style={[
                        styles.personalityRow,
                        { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <Text
                        style={[
                          styles.personalityLabel,
                          { color: colors.accentGold },
                        ]}
                      >
                        Descripción
                      </Text>
                      <Text
                        style={[styles.personalityValue, themed.textPrimary]}
                      >
                        {draft.appearance.description}
                      </Text>
                    </View>
                  )}
                  {!draft.appearance.age &&
                    !draft.appearance.height &&
                    !draft.appearance.weight &&
                    !draft.appearance.hairColor &&
                    !draft.appearance.eyeColor &&
                    !draft.appearance.skinColor &&
                    !draft.appearance.description && (
                      <Text style={[styles.emptyNote, themed.textMuted]}>
                        Sin datos de apariencia (se puede rellenar después)
                      </Text>
                    )}
                </View>
              </View>
            )}
          </>
        )}

        {/* Validation warning */}
        {!allRequiredComplete && (
          <View style={styles.section}>
            <View style={[styles.warningBox, themed.warningBox]}>
              <Ionicons name="warning" size={22} color={colors.accentGold} />
              <View style={styles.warningContent}>
                <Text
                  style={[styles.warningTitle, { color: colors.accentGold }]}
                >
                  Pasos incompletos
                </Text>
                <Text style={[styles.warningText, themed.textPrimary]}>
                  Debes completar al menos los pasos 1-9 antes de crear el
                  personaje. Pulsa en los pasos marcados con ○ para
                  completarlos.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, themed.footer]}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!allRequiredComplete || creating) && [
              styles.createButtonDisabled,
              themed.nextButtonDisabled,
            ],
          ]}
          onPress={handleCreate}
          disabled={!allRequiredComplete || creating}
        >
          {creating ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.createButtonText}>Creando personaje...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={22} color="white" />
              <Text style={styles.createButtonText}>¡Crear Personaje!</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      {/* Custom dialog (replaces Alert.alert) */}
      <ConfirmDialog {...dialogProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#272519", // overridden by themed.container
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  loadingText: {
    color: "#AAA37B", // overridden by themed.loadingText
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#2E2C1E", // overridden by themed.backButton
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#AAA37B", // overridden by themed.stepText
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#2E2C1E", // overridden by themed.progressBar
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8f3d38",
    borderRadius: 3,
  },
  titleSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  iconCircle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "rgba(143,61,56,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    color: "#ffffff", // overridden by themed.title
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#AAA37B", // overridden by themed.subtitle
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#d9d9e6", // overridden by themed.sectionTitle
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  checklistCard: {
    backgroundColor: "#323021", // overridden by themed.card
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#514D35", // overridden by themed.card
    overflow: "hidden",
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#423E2B", // overridden inline
  },
  checklistText: {
    flex: 1,
    color: "#AAA37B", // overridden inline
    fontSize: 15,
    marginLeft: 12,
  },
  checklistTextDone: {
    color: "#d9d9e6", // overridden inline
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#323021", // overridden by themed.card
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#514D35", // overridden by themed.card
    padding: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#423E2B", // overridden inline
  },
  summaryLabel: {
    color: "#AAA37B", // overridden by themed.textSecondary
    fontSize: 14,
    fontWeight: "600",
  },
  summaryValue: {
    color: "#ffffff", // overridden by themed.textPrimary
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  scoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  scoreCard: {
    width: "30%",
    backgroundColor: "#323021", // overridden by themed.card
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#514D35", // overridden by themed.card
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  scoreAbbr: {
    color: "#CDC9B2", // overridden inline
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  scoreTotal: {
    color: "#ffffff", // overridden by themed.textPrimary
    fontSize: 24,
    fontWeight: "bold",
  },
  scoreMod: {
    color: "#AAA37B", // overridden by themed.textSecondary
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  hpPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#323021", // overridden by themed.card
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#514D35", // overridden by themed.card
    padding: 14,
  },
  hpIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "rgba(34,197,94,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  hpInfo: {
    flex: 1,
  },
  hpLabel: {
    color: "#AAA37B", // overridden by themed.textSecondary
    fontSize: 13,
  },
  hpValue: {
    color: "#22c55e", // overridden inline
    fontSize: 20,
    fontWeight: "bold",
  },
  hitDieBadge: {
    backgroundColor: "#423E2B", // overridden inline
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hitDieText: {
    color: "#D4D1BD", // overridden by themed.textSecondary
    fontSize: 13,
    fontWeight: "600",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#323021", // overridden inline
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)", // overridden inline
  },
  skillBadgeText: {
    color: "#d9d9e6", // overridden by themed.textPrimary
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  personalityRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#423E2B", // overridden inline
  },
  personalityLabel: {
    color: "#CDC9B2", // overridden inline
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  personalityValue: {
    color: "#d9d9e6", // overridden by themed.textPrimary
    fontSize: 14,
    lineHeight: 20,
  },
  emptyNote: {
    color: "#807953", // overridden by themed.textMuted
    fontSize: 14,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245,158,11,0.1)", // overridden by themed.warningBox
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)", // overridden by themed.warningBox
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    color: "#f59e0b", // overridden inline
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  warningText: {
    color: "#d9d9e6", // overridden by themed.textPrimary
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#514D35", // overridden by themed.footer
  },
  createButton: {
    backgroundColor: "#8f3d38",
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#423E2B", // overridden by themed.nextButtonDisabled
    opacity: 0.5,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
