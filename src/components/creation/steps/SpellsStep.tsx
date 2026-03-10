import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useCreationStore,
  TOTAL_STEPS,
  calcTotalScoresPreview,
} from "@/stores/creationStore";
import { getClassData } from "@/data/srd";
import { getCantripsForClass, getSpellsForClass } from "@/data/srd/spells";
import { getSpellDescription } from "@/data/srd/spellDescriptions";
import type { ClassId, AbilityKey } from "@/types/character";
import { calcModifier } from "@/utils/character";
import { useTheme, useScrollToTop, useCreationNavigation } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";

const CURRENT_STEP = 7;

// ─── Helper: build spell display objects from SRD data ───────────────

function buildSpellList(
  classId: string,
  level: number,
): { id: string; nombre: string; descripcion: string }[] {
  const spells =
    level === 0
      ? getCantripsForClass(classId as ClassId)
      : getSpellsForClass(classId as ClassId, level);

  return spells.map((s) => {
    const desc = getSpellDescription(s.id);
    // Build a short summary: first sentence of description, or fallback
    let shortDesc = desc?.descripcion ?? "";
    // Take first sentence (up to first period followed by space or end)
    const firstSentence = shortDesc.match(/^[^.]+\./);
    if (firstSentence && firstSentence[0].length < 120) {
      shortDesc = firstSentence[0];
    } else if (shortDesc.length > 120) {
      shortDesc = shortDesc.slice(0, 117) + "...";
    }
    return {
      id: s.id,
      nombre: s.nombre,
      descripcion: shortDesc,
    };
  });
}

export default function SpellsStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const { campaignId, pushStep, goBack } = useCreationNavigation();

  const { draft, setSpellChoices, saveDraft, loadDraft } = useCreationStore();

  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [autoSkipped, setAutoSkipped] = useState(false);
  const hasAutoSkipped = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.spellChoices) {
          setSelectedCantrips(currentDraft.spellChoices.cantrips ?? []);
          setSelectedSpells(currentDraft.spellChoices.spells ?? []);
        }

        // Auto-skip for non-spellcasters (only once per mount to avoid loop)
        if (!hasAutoSkipped.current && currentDraft?.clase) {
          const classData = getClassData(currentDraft.clase);
          // Prepared casters (cleric, druid) have spellsAtLevel1 === 0 but DO cast at level 1
          const isPreparedWithSpells =
            classData.preparesSpells &&
            classData.casterType !== "none" &&
            classData.spellcastingAbility;
          const shouldSkip =
            classData.casterType === "none" ||
            (!isPreparedWithSpells &&
              classData.cantripsAtLevel1 === 0 &&
              classData.spellsAtLevel1 === 0);

          if (shouldSkip) {
            hasAutoSkipped.current = true;
            setAutoSkipped(true);
            setSpellChoices({ cantrips: [], spells: [] });
            await saveDraft();
            pushStep("equipment");
          }
        }
      };
      init();
    }, [campaignId]),
  );

  const classId = draft?.clase;
  const classData = classId ? getClassData(classId) : null;
  const maxCantrips = classData?.cantripsAtLevel1 ?? 0;

  // For prepared spellcasters (cleric, druid) with spellsAtLevel1 === 0,
  // dynamically compute prepared spells = max(1, abilityMod + level)
  const isPreparedCasterWithDynamicSlots =
    classData &&
    classData.preparesSpells &&
    classData.spellsAtLevel1 === 0 &&
    classData.casterType !== "none" &&
    classData.spellcastingAbility;

  let maxSpells = classData?.spellsAtLevel1 ?? 0;
  if (
    isPreparedCasterWithDynamicSlots &&
    draft?.abilityScoresBase &&
    draft.raza
  ) {
    const totalScores = calcTotalScoresPreview(
      draft.abilityScoresBase,
      draft.raza,
      draft.subraza ?? null,
      draft.freeAbilityBonuses,
      draft.raza === "personalizada"
        ? draft.customRaceData?.abilityBonuses
        : undefined,
    );
    const abilityKey = classData!.spellcastingAbility as AbilityKey;
    const mod = calcModifier(totalScores[abilityKey]);
    maxSpells = Math.max(1, mod + 1); // ability mod + cleric/druid level (1)
  }

  const availableCantrips = classId ? buildSpellList(classId, 0) : [];
  const availableSpells = classId ? buildSpellList(classId, 1) : [];

  const isValid =
    selectedCantrips.length === maxCantrips &&
    (maxSpells === 0 || selectedSpells.length === maxSpells);

  const handleToggleCantrip = (id: string) => {
    setSelectedCantrips((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= maxCantrips) return prev;
      return [...prev, id];
    });
  };

  const handleToggleSpell = (id: string) => {
    setSelectedSpells((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= maxSpells) return prev;
      return [...prev, id];
    });
  };

  const handleNext = async () => {
    if (!isValid) return;
    setSpellChoices({
      cantrips: selectedCantrips,
      spells: selectedSpells,
      spellbook: classId === "mago" ? selectedSpells : undefined,
    });
    await saveDraft();
    pushStep("equipment");
  };

  const handleBack = () => {
    if (selectedCantrips.length > 0 || selectedSpells.length > 0) {
      setSpellChoices({
        cantrips: selectedCantrips,
        spells: selectedSpells,
      });
    }
    goBack();
  };

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  // If auto-skipping, show nothing (brief flash)
  if (autoSkipped) {
    return (
      <View style={[styles.container, themed.container]}>
        <View style={styles.skipContainer}>
          <Ionicons name="flash-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.skipText, themed.skipText]}>
            Tu clase no lanza conjuros a nivel 1.
          </Text>
          <Text style={[styles.skipSubtext, themed.skipSubtext]}>
            Continuando...
          </Text>
        </View>
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
            <Ionicons name="star-outline" size={40} color={colors.accentRed} />
          </View>
          <Text style={[styles.title, themed.title]}>
            Habilidades Iniciales
          </Text>
          <Text style={[styles.subtitle, themed.subtitle]}>
            {classData
              ? isPreparedCasterWithDynamicSlots
                ? `Como ${classData.nombre}, puedes elegir ${maxCantrips} truco${maxCantrips !== 1 ? "s" : ""} y preparar ${maxSpells} conjuro${maxSpells !== 1 ? "s" : ""} de nivel 1.`
                : `Como ${classData.nombre}, puedes elegir ${maxCantrips} truco${maxCantrips !== 1 ? "s" : ""}${maxSpells > 0 ? ` y ${maxSpells} conjuro${maxSpells !== 1 ? "s" : ""} de nivel 1` : ""}.`
              : "Elige tus trucos y conjuros iniciales."}
          </Text>
          {classData?.spellcastingAbility && (
            <View style={[styles.aptitudBadge, themed.aptitudBadge]}>
              <Ionicons name="sparkles" size={14} color={colors.accentGold} />
              <Text style={[styles.aptitudText, themed.aptitudText]}>
                Aptitud mágica:{" "}
                {classData.spellcastingAbility === "car"
                  ? "Carisma"
                  : classData.spellcastingAbility === "int"
                    ? "Inteligencia"
                    : classData.spellcastingAbility === "sab"
                      ? "Sabiduría"
                      : classData.spellcastingAbility.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Cantrips Section */}
        {maxCantrips > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                Trucos (Cantrips)
              </Text>
              <View style={[styles.counterBadge, themed.card]}>
                <Text
                  style={[
                    styles.counterText,
                    themed.counterText,
                    selectedCantrips.length === maxCantrips && [
                      styles.counterTextValid,
                      themed.counterTextValid,
                    ],
                  ]}
                >
                  {selectedCantrips.length} / {maxCantrips}
                </Text>
              </View>
            </View>

            {availableCantrips.map((cantrip) => {
              const isSelected = selectedCantrips.includes(cantrip.id);
              const isDisabled =
                !isSelected && selectedCantrips.length >= maxCantrips;

              return (
                <TouchableOpacity
                  key={cantrip.id}
                  style={[
                    styles.spellCard,
                    themed.cardElevated,
                    isSelected && styles.spellCardSelected,
                    isDisabled && styles.spellCardDisabled,
                  ]}
                  onPress={() => handleToggleCantrip(cantrip.id)}
                  disabled={isDisabled && !isSelected}
                >
                  <View style={styles.spellCardRow}>
                    <View
                      style={[
                        styles.checkbox,
                        themed.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.textInverted}
                        />
                      )}
                    </View>
                    <View style={styles.spellInfo}>
                      <Text
                        style={[
                          styles.spellName,
                          themed.textPrimary,
                          isSelected && themed.spellNameSelected,
                        ]}
                      >
                        {cantrip.nombre}
                      </Text>
                      <Text
                        style={[styles.spellDesc, themed.textSecondary]}
                        numberOfLines={2}
                      >
                        {cantrip.descripcion}
                      </Text>
                    </View>
                    <View style={[styles.levelBadge, themed.levelBadge]}>
                      <Text
                        style={[styles.levelBadgeText, themed.levelBadgeText]}
                      >
                        Truco
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Level 1 Spells Section */}
        {maxSpells > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, themed.sectionTitle]}>
                Conjuros de Nivel 1
              </Text>
              <View style={[styles.counterBadge, themed.card]}>
                <Text
                  style={[
                    styles.counterText,
                    themed.counterText,
                    selectedSpells.length === maxSpells && [
                      styles.counterTextValid,
                      themed.counterTextValid,
                    ],
                  ]}
                >
                  {selectedSpells.length} / {maxSpells}
                </Text>
              </View>
            </View>

            {availableSpells.map((spell) => {
              const isSelected = selectedSpells.includes(spell.id);
              const isDisabled =
                !isSelected && selectedSpells.length >= maxSpells;

              return (
                <TouchableOpacity
                  key={spell.id}
                  style={[
                    styles.spellCard,
                    themed.cardElevated,
                    isSelected && styles.spellCardSelected,
                    isDisabled && styles.spellCardDisabled,
                  ]}
                  onPress={() => handleToggleSpell(spell.id)}
                  disabled={isDisabled && !isSelected}
                >
                  <View style={styles.spellCardRow}>
                    <View
                      style={[
                        styles.checkbox,
                        themed.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.textInverted}
                        />
                      )}
                    </View>
                    <View style={styles.spellInfo}>
                      <Text
                        style={[
                          styles.spellName,
                          themed.textPrimary,
                          isSelected && themed.spellNameSelected,
                        ]}
                      >
                        {spell.nombre}
                      </Text>
                      <Text
                        style={[styles.spellDesc, themed.textSecondary]}
                        numberOfLines={2}
                      >
                        {spell.descripcion}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.levelBadge,
                        themed.levelBadge,
                        styles.levelBadgeLv1,
                      ]}
                    >
                      <Text
                        style={[styles.levelBadgeText, themed.levelBadgeText]}
                      >
                        Nv.1
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {classId === "mago" && (
              <View style={[styles.infoBox, themed.infoBox]}>
                <Ionicons name="book" size={18} color={colors.accentGold} />
                <Text style={[styles.infoBoxText, themed.infoBoxText]}>
                  Como mago, los conjuros seleccionados se añadirán a tu libro
                  de hechizos. Podrás preparar un número limitado cada día.
                </Text>
              </View>
            )}

            {isPreparedCasterWithDynamicSlots && classId !== "mago" && (
              <View style={[styles.infoBox, themed.infoBox]}>
                <Ionicons
                  name="book-outline"
                  size={18}
                  color={colors.accentGold}
                />
                <Text style={[styles.infoBoxText, themed.infoBoxText]}>
                  Como {classData?.nombre?.toLowerCase()}, preparas conjuros
                  cada día de entre toda la lista de tu clase. Podrás cambiar tu
                  selección tras cada descanso largo.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, themed.footer]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isValid && [styles.nextButtonDisabled, themed.nextButtonDisabled],
          ]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={[styles.nextButtonText, themed.textOnPrimary]}>
            Siguiente: Equipamiento
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={colors.textInverted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1221",
  },
  scroll: {
    flex: 1,
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
    backgroundColor: "#101B2E",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#8899AA",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#101B2E",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00BCD4",
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
    backgroundColor: "rgba(0,188,212,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#8899AA",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  aptitudBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,229,255,0.15)", // static: dark-mode default, overridden inline
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  aptitudText: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#d9d9e6",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  counterBadge: {
    backgroundColor: "#101B2E",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  counterText: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "bold",
  },
  counterTextValid: {
    color: "#22c55e",
  },
  spellCard: {
    backgroundColor: "#182338",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A3A52",
  },
  spellCardSelected: {
    borderColor: "#00BCD4",
    backgroundColor: "rgba(0,188,212,0.08)",
  },
  spellCardDisabled: {
    opacity: 0.4,
  },
  spellCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    height: 28,
    width: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#807953",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxSelected: {
    borderColor: "#00BCD4",
    backgroundColor: "#00BCD4",
  },
  spellInfo: {
    flex: 1,
    marginRight: 8,
  },
  spellName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  spellNameSelected: {
    color: "#ffffff",
  },
  spellDesc: {
    color: "#8899AA",
    fontSize: 12,
    lineHeight: 17,
  },
  levelBadge: {
    backgroundColor: "#182338",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelBadgeLv1: {
    backgroundColor: "rgba(59,130,246,0.2)",
  },
  levelBadgeText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,229,255,0.1)", // static: dark-mode default, overridden inline
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.2)", // static: dark-mode default, overridden inline
  },
  infoBoxText: {
    color: "#d9d9e6",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
  skipContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  skipText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  skipSubtext: {
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E2D42",
  },
  nextButton: {
    backgroundColor: "#00BCD4",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#182338",
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#0B1221",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});
