import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreationStore, TOTAL_STEPS } from "@/stores/creationStore";
import {
  getRaceList,
  getRaceData,
  RACE_ICONS,
  EXPANSION_RACE_IDS,
  getTotalRacialBonuses,
} from "@/data/srd/races";
import type { RaceData, SubraceData } from "@/data/srd/races";
import type { RaceId, SubraceId, AbilityKey } from "@/types/character";
import { ABILITY_NAMES } from "@/types/character";
import type { CustomRaceConfig } from "@/types/creation";
import CustomRaceEditor from "@/components/creation/CustomRaceEditor";
import { useTheme, useScrollToTop } from "@/hooks";
import { withAlpha } from "@/utils/theme";

const CURRENT_STEP = 2;

export default function RaceSelectionStep() {
  const scrollRef = useScrollToTop();
  const { colors } = useTheme();
  const router = useRouter();

  const { draft, setRaza, setCustomRaceData, saveDraft, loadDraft } = useCreationStore();

  const [selectedRace, setSelectedRace] = useState<RaceId | null>(
    draft?.raza ?? null,
  );
  const [selectedSubrace, setSelectedSubrace] = useState<SubraceId>(
    draft?.subraza ?? null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showExpansions, setShowExpansions] = useState(
    draft?.raza ? EXPANSION_RACE_IDS.includes(draft.raza) : false,
  );

  const allRaces = getRaceList().filter((r) => r.id !== "personalizada");
  const races = allRaces.filter((r) => !EXPANSION_RACE_IDS.includes(r.id));
  const expansionRaces = allRaces.filter((r) => EXPANSION_RACE_IDS.includes(r.id));

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (!draft) {
          await loadDraft();
        }
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.raza) {
          setSelectedRace(currentDraft.raza);
          setSelectedSubrace(currentDraft.subraza ?? null);
          if (EXPANSION_RACE_IDS.includes(currentDraft.raza)) {
            setShowExpansions(true);
          }
        }
      };
      init();
    }, []),
  );

  const currentRaceData = selectedRace && selectedRace !== "personalizada"
    ? getRaceData(selectedRace)
    : null;
  const hasSubraces = currentRaceData
    ? currentRaceData.subraces.length > 0
    : false;

  const isCustom = selectedRace === "personalizada";

  const isValid = (): boolean => {
    if (!selectedRace) return false;
    if (isCustom) {
      return (draft?.customRaceData?.nombre?.trim().length ?? 0) >= 1;
    }
    if (hasSubraces && !selectedSubrace) return false;
    return true;
  };

  const handleSelectRace = (raceId: RaceId) => {
    setSelectedRace(raceId);
    if (raceId === "personalizada") {
      setSelectedSubrace(null);
      // Initialize custom race data if not present
      if (!draft?.customRaceData) {
        setCustomRaceData({
          nombre: "",
          descripcion: "",
          abilityBonuses: {},
          size: "mediano",
          speed: 30,
          darkvision: false,
          traits: [],
          languages: ["Común"],
        });
      }
      setShowDetails(true);
      return;
    }
    const race = getRaceData(raceId);
    // Auto-select subrace if there's only one
    if (race.subraces.length === 1) {
      setSelectedSubrace(race.subraces[0].id);
    } else if (race.subraces.length === 0) {
      setSelectedSubrace(null);
    } else {
      setSelectedSubrace(null);
    }
    setShowDetails(true);
  };

  const handleSelectSubrace = (subraceId: SubraceId) => {
    setSelectedSubrace(subraceId);
  };

  const handleNext = async () => {
    if (!isValid() || !selectedRace) return;
    setRaza(selectedRace, selectedSubrace);
    if (isCustom && draft?.customRaceData) {
      setCustomRaceData(draft.customRaceData);
    }
    await saveDraft();
    router.push({
      pathname: "/create/class",
    });
  };

  const handleBack = () => {
    if (selectedRace) {
      setRaza(selectedRace, selectedSubrace);
    }
    router.back();
  };

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  // Get racial bonuses for display
  const racialBonuses = selectedRace
    ? isCustom
      ? (draft?.customRaceData?.abilityBonuses ?? {})
      : getTotalRacialBonuses(selectedRace, selectedSubrace)
    : {};

  const formatBonus = (value: number) => (value > 0 ? `+${value}` : `${value}`);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bgPrimary }}>
      {/* Header with progress */}
      <View className="px-5 pt-16 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            className="h-10 w-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.headerButtonBg }}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
            Paso {CURRENT_STEP} de {TOTAL_STEPS}
          </Text>

          <View className="h-10 w-10" />
        </View>

        {/* Progress bar */}
        <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgInput }}>
          <View
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="px-5 mb-6">
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Elige tu raza
          </Text>
          <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
            La raza de tu personaje determina sus rasgos innatos, bonificadores
            de característica y habilidades especiales.
          </Text>
        </View>

        {/* Race Cards Grid */}
        {!showDetails && (
          <View className="px-5">
            {races.map((race) => (
              <TouchableOpacity
                key={race.id}
                className="mb-3 rounded-card border p-4 active:opacity-80"
                style={{
                  backgroundColor: selectedRace === race.id ? withAlpha(colors.accentRed, 0.12) : colors.bgCard,
                  borderColor: selectedRace === race.id ? withAlpha(colors.accentRed, 0.4) : colors.borderDefault,
                }}
                onPress={() => handleSelectRace(race.id)}
              >
                <View className="flex-row items-center">
                  <View
                    className="h-14 w-14 rounded-xl items-center justify-center mr-4"
                    style={{
                      backgroundColor: selectedRace === race.id
                        ? withAlpha(colors.accentRed, 0.2)
                        : colors.bgSecondary,
                    }}
                  >
                    <Text className="text-2xl">{RACE_ICONS[race.id]}</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                      {race.nombre}
                    </Text>
                    <Text
                      className="text-sm mt-0.5"
                      style={{ color: colors.textSecondary }}
                      numberOfLines={2}
                    >
                      {race.descripcion}
                    </Text>
                    {/* Quick bonus preview */}
                    <View className="flex-row flex-wrap mt-2">
                      {Object.entries(race.abilityBonuses).map(
                        ([key, value]) => (
                          <View
                            key={key}
                            className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1"
                            style={{ backgroundColor: colors.bgSecondary }}
                          >
                            <Text className="text-xs font-semibold" style={{ color: colors.accentGold }}>
                              {ABILITY_NAMES[key as AbilityKey]}{" "}
                              {formatBonus(value as number)}
                            </Text>
                          </View>
                        ),
                      )}
                      {race.darkvision && (
                        <View className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1" style={{ backgroundColor: colors.bgSecondary }}>
                          <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            👁️ Visión osc.
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={
                      selectedRace === race.id
                        ? colors.accentRed
                        : colors.textMuted
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}

            {/* ── Expansiones (collapsible) ── */}
            {expansionRaces.length > 0 && (
              <>
                <TouchableOpacity
                  className="mb-3 rounded-card border p-4 active:opacity-80"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: showExpansions
                      ? withAlpha(colors.accentPurple, 0.4)
                      : colors.borderDefault,
                  }}
                  onPress={() => setShowExpansions(!showExpansions)}
                >
                  <View className="flex-row items-center">
                    <View
                      className="h-14 w-14 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: withAlpha(colors.accentPurple, 0.15) }}
                    >
                      <Text className="text-2xl">📦</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                        Expansiones
                      </Text>
                      <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                        {expansionRaces.length} razas adicionales
                      </Text>
                    </View>
                    <Ionicons
                      name={showExpansions ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={colors.accentPurple}
                    />
                  </View>
                </TouchableOpacity>

                {showExpansions &&
                  expansionRaces.map((race) => (
                    <TouchableOpacity
                      key={race.id}
                      className="mb-3 ml-4 rounded-card border p-4 active:opacity-80"
                      style={{
                        backgroundColor:
                          selectedRace === race.id
                            ? withAlpha(colors.accentPurple, 0.12)
                            : colors.bgCard,
                        borderColor:
                          selectedRace === race.id
                            ? withAlpha(colors.accentPurple, 0.4)
                            : colors.borderDefault,
                      }}
                      onPress={() => handleSelectRace(race.id)}
                    >
                      <View className="flex-row items-center">
                        <View
                          className="h-14 w-14 rounded-xl items-center justify-center mr-4"
                          style={{
                            backgroundColor:
                              selectedRace === race.id
                                ? withAlpha(colors.accentPurple, 0.2)
                                : colors.bgSecondary,
                          }}
                        >
                          <Text className="text-2xl">{RACE_ICONS[race.id]}</Text>
                        </View>

                        <View className="flex-1">
                          <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                            {race.nombre}
                          </Text>
                          <Text
                            className="text-sm mt-0.5"
                            style={{ color: colors.textSecondary }}
                            numberOfLines={2}
                          >
                            {race.descripcion}
                          </Text>
                          <View className="flex-row flex-wrap mt-2">
                            {Object.entries(race.abilityBonuses).map(
                              ([key, value]) => (
                                <View
                                  key={key}
                                  className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1"
                                  style={{ backgroundColor: colors.bgSecondary }}
                                >
                                  <Text className="text-xs font-semibold" style={{ color: colors.accentGold }}>
                                    {ABILITY_NAMES[key as AbilityKey]}{" "}
                                    {formatBonus(value as number)}
                                  </Text>
                                </View>
                              ),
                            )}
                            {race.freeAbilityBonusCount && (
                              <View className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1" style={{ backgroundColor: colors.bgSecondary }}>
                                <Text className="text-xs" style={{ color: colors.accentGold }}>
                                  +{race.freeAbilityBonusCount} a elegir
                                </Text>
                              </View>
                            )}
                            {race.flySpeed && (
                              <View className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1" style={{ backgroundColor: colors.bgSecondary }}>
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                  🪽 Vuelo
                                </Text>
                              </View>
                            )}
                            {race.darkvision && (
                              <View className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1" style={{ backgroundColor: colors.bgSecondary }}>
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                  👁️ Visión osc.
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={
                            selectedRace === race.id
                              ? colors.accentPurple
                              : colors.textMuted
                          }
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
              </>
            )}

            {/* Custom Race Card */}
            <TouchableOpacity
              className="mb-3 rounded-card border p-4 active:opacity-80"
              style={{
                backgroundColor: selectedRace === "personalizada" ? withAlpha(colors.accentRed, 0.12) : colors.bgCard,
                borderColor: selectedRace === "personalizada" ? withAlpha(colors.accentRed, 0.4) : colors.borderDefault,
              }}
              onPress={() => handleSelectRace("personalizada")}
            >
              <View className="flex-row items-center">
                <View
                  className="h-14 w-14 rounded-xl items-center justify-center mr-4"
                  style={{
                    backgroundColor: selectedRace === "personalizada"
                      ? withAlpha(colors.accentRed, 0.2)
                      : colors.bgSecondary,
                  }}
                >
                  <Text className="text-2xl">{RACE_ICONS["personalizada"]}</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    Personalizada
                  </Text>
                  <Text
                    className="text-sm mt-0.5"
                    style={{ color: colors.textSecondary }}
                    numberOfLines={2}
                  >
                    Crea tu propia raza con rasgos, bonificadores y habilidades
                    personalizadas.
                  </Text>
                  <View className="flex-row flex-wrap mt-2">
                    <View className="rounded-full px-2.5 py-0.5 mr-1.5 mb-1" style={{ backgroundColor: colors.bgSecondary }}>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        ✏️ Totalmente configurable
                      </Text>
                    </View>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    selectedRace === "personalizada"
                      ? colors.accentRed
                      : colors.textMuted
                  }
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Custom Race Editor View */}
        {showDetails && isCustom && (
          <View className="px-5">
            {/* Back to list button */}
            <TouchableOpacity
              className="flex-row items-center mb-4 active:opacity-70"
              onPress={() => setShowDetails(false)}
            >
              <Ionicons name="arrow-back" size={16} color={colors.textMuted} />
              <Text className="text-sm ml-1" style={{ color: colors.textMuted }}>
                Ver todas las razas
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="rounded-card border p-5 mb-5" style={{ backgroundColor: colors.bgCard, borderColor: withAlpha(colors.accentRed, 0.3) }}>
              <View className="flex-row items-center">
                <View className="h-16 w-16 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}>
                  <Text className="text-3xl">{RACE_ICONS["personalizada"]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    {draft?.customRaceData?.nombre?.trim() || "Raza Personalizada"}
                  </Text>
                  <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    Configura todos los aspectos de tu raza
                  </Text>
                </View>
              </View>
            </View>

            <CustomRaceEditor
              initialData={draft?.customRaceData}
              onChange={(data) => setCustomRaceData(data)}
            />
          </View>
        )}

        {/* Race Details View */}
        {showDetails && currentRaceData && (
          <View className="px-5">
            {/* Back to list button */}
            <TouchableOpacity
              className="flex-row items-center mb-4 active:opacity-70"
              onPress={() => setShowDetails(false)}
            >
              <Ionicons name="arrow-back" size={16} color={colors.textMuted} />
              <Text className="text-sm ml-1" style={{ color: colors.textMuted }}>
                Ver todas las razas
              </Text>
            </TouchableOpacity>

            {/* Selected Race Header */}
            <View className="rounded-card border p-5 mb-5" style={{ backgroundColor: colors.bgCard, borderColor: withAlpha(colors.accentRed, 0.3) }}>
              <View className="flex-row items-center mb-4">
                <View className="h-16 w-16 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}>
                  <Text className="text-3xl">
                    {RACE_ICONS[currentRaceData.id]}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    {currentRaceData.nombre}
                  </Text>
                  <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    Tamaño:{" "}
                    {currentRaceData.size === "mediano" ? "Mediano" : "Pequeño"}{" "}
                    · Velocidad: {currentRaceData.speed} pies
                  </Text>
                </View>
              </View>

              <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                {currentRaceData.descripcion}
              </Text>
            </View>

            {/* Ability Bonuses */}
            <View className="mb-5">
              <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Bonificadores de Característica
              </Text>
              <View className="flex-row flex-wrap">
                {Object.entries(racialBonuses).map(([key, value]) => (
                  <View
                    key={key}
                    className="border rounded-xl px-4 py-3 mr-2 mb-2 items-center min-w-[80px]"
                    style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
                  >
                    <Text className="text-lg font-bold" style={{ color: colors.accentGold }}>
                      {formatBonus(value as number)}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                      {ABILITY_NAMES[key as AbilityKey]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Subrace Selection */}
            {hasSubraces && (
              <View className="mb-5">
                <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                  Subraza <Text style={{ color: colors.accentRed }}>*</Text>
                </Text>

                {currentRaceData.subraces.map((subrace) => (
                  <TouchableOpacity
                    key={subrace.id}
                    className="mb-2 rounded-card border p-4 active:opacity-80"
                    style={{
                      backgroundColor: selectedSubrace === subrace.id ? withAlpha(colors.accentRed, 0.1) : colors.bgCard,
                      borderColor: selectedSubrace === subrace.id ? withAlpha(colors.accentRed, 0.4) : colors.borderDefault,
                    }}
                    onPress={() => handleSelectSubrace(subrace.id)}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-bold flex-1" style={{ color: colors.textPrimary }}>
                        {subrace.nombre}
                      </Text>
                      <View
                        className="h-6 w-6 rounded-full border-2 items-center justify-center"
                        style={{
                          borderColor: selectedSubrace === subrace.id ? colors.accentRed : colors.textMuted,
                          backgroundColor: selectedSubrace === subrace.id ? colors.accentRed : 'transparent',
                        }}
                      >
                        {selectedSubrace === subrace.id && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                    </View>

                    <Text className="text-sm leading-5 mb-2" style={{ color: colors.textSecondary }}>
                      {subrace.descripcion}
                    </Text>

                    {/* Subrace bonuses */}
                    <View className="flex-row flex-wrap">
                      {Object.entries(subrace.abilityBonuses).map(
                        ([key, value]) => (
                          <View
                            key={key}
                            className="rounded-full px-2.5 py-0.5 mr-1.5"
                            style={{ backgroundColor: colors.bgSecondary }}
                          >
                            <Text className="text-xs font-semibold" style={{ color: colors.accentGold }}>
                              {ABILITY_NAMES[key as AbilityKey]}{" "}
                              {formatBonus(value as number)}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>

                    {/* Subrace traits */}
                    {subrace.traits.length > 0 && (
                      <View className="mt-2">
                        {subrace.traits.map((trait, idx) => (
                          <View key={idx} className="flex-row items-start mt-1">
                            <Text className="text-xs mr-1" style={{ color: colors.textMuted }}>
                              •
                            </Text>
                            <Text className="text-xs flex-1" style={{ color: colors.textSecondary }}>
                              <Text className="font-semibold" style={{ color: colors.textPrimary }}>
                                {trait.nombre}:
                              </Text>{" "}
                              {trait.descripcion}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Race Traits */}
            {currentRaceData.traits.length > 0 && (
              <View className="mb-5">
              <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Rasgos Raciales
              </Text>

                {currentRaceData.traits.map((trait, index) => (
                  <View
                    key={index}
                    className="border rounded-card p-4 mb-2"
                    style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
                  >
                    <Text className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>
                      {trait.nombre}
                    </Text>
                    <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                      {trait.descripcion}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            <View className="mb-5">
              <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Idiomas
              </Text>
              <View className="flex-row flex-wrap">
                {currentRaceData.languages.map((lang, idx) => (
                  <View
                    key={idx}
                    className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                    style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
                  >
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      {lang}
                    </Text>
                  </View>
                ))}
                {currentRaceData.extraLanguages
                  ? Array.from(
                      { length: currentRaceData.extraLanguages },
                      (_, i) => (
                        <View
                          key={`extra_${i}`}
                          className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                          style={{ backgroundColor: withAlpha(colors.accentGold, 0.1), borderColor: withAlpha(colors.accentGold, 0.3) }}
                        >
                          <Text className="text-sm" style={{ color: colors.accentGold }}>
                            +1 a elegir
                          </Text>
                        </View>
                      ),
                    )
                  : null}
              </View>
            </View>

            {/* Other Proficiencies */}
            {currentRaceData.darkvision && (
              <View className="border rounded-card p-4 mb-5" style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}>
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2">👁️</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                      Visión en la Oscuridad
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                      Alcance: {currentRaceData.darkvisionRange ?? 60} pies (
                      {((currentRaceData.darkvisionRange ?? 60) * 0.3).toFixed(
                        0,
                      )}{" "}
                      m)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Weapon Proficiencies from race */}
            {currentRaceData.weaponProficiencies &&
              currentRaceData.weaponProficiencies.length > 0 && (
                <View className="mb-5">
                  <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                    Competencias con Armas
                  </Text>
                  <View className="flex-row flex-wrap">
                    {currentRaceData.weaponProficiencies.map((weapon, idx) => (
                      <View
                        key={idx}
                        className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
                      >
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          {weapon}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {/* Tool choices */}
            {currentRaceData.toolChoices &&
              currentRaceData.toolChoices.length > 0 && (
                <View className="mb-5">
                  <Text className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                    Herramientas (elige {currentRaceData.toolChoiceCount ?? 1})
                  </Text>
                  <Text className="text-xs mb-2" style={{ color: colors.textMuted }}>
                    Se seleccionará durante el paso de equipamiento.
                  </Text>
                  <View className="flex-row flex-wrap">
                    {currentRaceData.toolChoices.map((tool, idx) => (
                      <View
                        key={idx}
                        className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                        style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
                      >
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          {tool}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {/* Skill proficiencies from race */}
            {currentRaceData.skillProficiencies &&
              currentRaceData.skillProficiencies.length > 0 && (
                <View className="mb-5">
                  <Text className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                    Competencias en Habilidades
                  </Text>
                  <View className="flex-row flex-wrap">
                    {currentRaceData.skillProficiencies.map((skill, idx) => {
                      const { SKILLS } = require("@/types/character");
                      const skillDef = SKILLS[skill];
                      return (
                        <View
                          key={idx}
                          className="bg-hp-full/10 border border-hp-full/30 rounded-full px-3 py-1.5 mr-2 mb-2"
                        >
                          <Text className="text-hp-full text-sm">
                            {skillDef?.nombre ?? skill}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
          </View>
        )}
      </ScrollView>

      {/* Footer with navigation buttons */}
      <View className="px-5 pb-10 pt-4 border-t" style={{ borderTopColor: colors.borderDefault }}>
        <TouchableOpacity
          className="rounded-xl py-4 items-center flex-row justify-center mb-3"
          style={{
            backgroundColor: isValid() ? colors.accentRed : colors.bgSecondary,
            opacity: isValid() ? 1 : 0.5,
          }}
          onPress={handleNext}
          disabled={!isValid()}
        >
          <Text className="text-white font-bold text-base mr-2">
            Siguiente: Clase
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-xl py-3.5 items-center"
          onPress={handleBack}
        >
          <Text className="font-semibold text-base" style={{ color: colors.textSecondary }}>
            Atrás
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
