import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreationStore, TOTAL_STEPS } from "@/stores/creationStore";
import {
  getRaceList,
  getRaceData,
  RACE_ICONS,
  EXPANSION_RACE_IDS,
  getTotalRacialBonuses,
  DRAGON_LINEAGES,
} from "@/data/srd/races";
import type { RaceData, SubraceData, DragonLineage } from "@/data/srd/races";
import type { RaceId, SubraceId, AbilityKey } from "@/types/character";
import { ABILITY_NAMES } from "@/types/character";
import type { CustomRaceConfig } from "@/types/creation";
import CustomRaceEditor from "@/components/creation/CustomRaceEditor";
import { useTheme, useScrollToTop } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import SelectionCard, { ExpansionToggleCard, PillBadge } from "@/components/creation/SelectionCard";

const CURRENT_STEP = 2;

/** Renders ability bonus + trait pills for a race card */
function RacePills({ race, colors }: { race: RaceData; colors: ReturnType<typeof useTheme>["colors"] }) {
  const formatBonus = (v: number) => (v > 0 ? `+${v}` : `${v}`);
  return (
    <>
      {Object.entries(race.abilityBonuses).map(([key, value]) => (
        <PillBadge key={key} text={`${ABILITY_NAMES[key as AbilityKey]} ${formatBonus(value as number)}`} color={colors.accentGold} />
      ))}
      {race.freeAbilityBonusCount ? (
        <PillBadge text={`+${race.freeAbilityBonusCount} a elegir`} color={colors.accentGold} />
      ) : null}
      {race.flySpeed ? <PillBadge text="Vuelo" icon="airplane-outline" /> : null}
      {race.darkvision ? <PillBadge text="Visión osc." icon="eye-outline" /> : null}
    </>
  );
}

export default function RaceSelectionStep() {
  const scrollRef = useScrollToTop();
  const { colors } = useTheme();
  const router = useRouter();
  const { id: campaignId } = useLocalSearchParams<{ id: string }>();

  const { draft, setRaza, setCustomRaceData, setDragonLineage, setRaceToolChoice, saveDraft, loadDraft } = useCreationStore();

  const [selectedRace, setSelectedRace] = useState<RaceId | null>(
    draft?.raza ?? null,
  );
  const [selectedSubrace, setSelectedSubrace] = useState<SubraceId>(
    draft?.subraza ?? null,
  );
  const [detailRaceId, setDetailRaceId] = useState<RaceId | null>(null);
  const [modalSubrace, setModalSubrace] = useState<SubraceId>(null);
  const [modalLineage, setModalLineage] = useState<string | undefined>(draft?.dragonLineage);
  const [modalToolChoice, setModalToolChoice] = useState<string | undefined>(draft?.raceToolChoice);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [showExpansions, setShowExpansions] = useState(
    draft?.raza ? EXPANSION_RACE_IDS.includes(draft.raza) : false,
  );

  const allRaces = getRaceList().filter((r) => r.id !== "personalizada");
  const races = allRaces.filter((r) => !EXPANSION_RACE_IDS.includes(r.id));
  const expansionRaces = allRaces.filter((r) => EXPANSION_RACE_IDS.includes(r.id));

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (!campaignId) return;
        if (!draft) {
          await loadDraft(campaignId);
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
    }, [campaignId]),
  );

  const detailRaceData = detailRaceId && detailRaceId !== "personalizada"
    ? getRaceData(detailRaceId)
    : null;

  const isCustom = selectedRace === "personalizada";

  const isValid = (): boolean => {
    if (!selectedRace) return false;
    if (isCustom) {
      return (draft?.customRaceData?.nombre?.trim().length ?? 0) >= 1;
    }
    const raceData = getRaceData(selectedRace);
    if (raceData.subraces.length > 0 && !selectedSubrace) return false;
    if (raceData.lineageRequired && !draft?.dragonLineage) return false;
    return true;
  };

  const isModalSelectable = (): boolean => {
    if (!detailRaceData) return false;
    if (detailRaceData.subraces.length > 0 && !modalSubrace) return false;
    if (detailRaceData.lineageRequired && !modalLineage) return false;
    return true;
  };

  const handleOpenDetails = (raceId: RaceId) => {
    if (raceId === "personalizada") {
      setSelectedRace("personalizada");
      setSelectedSubrace(null);
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
      setShowCustomEditor(true);
      return;
    }
    const race = getRaceData(raceId);
    let autoSubrace: SubraceId = null;
    if (race.subraces.length === 1) {
      autoSubrace = race.subraces[0].id;
    } else if (selectedRace === raceId && selectedSubrace) {
      autoSubrace = selectedSubrace;
    }
    setModalSubrace(autoSubrace);
    // Restore lineage/tool choices if re-opening the same race
    if (selectedRace === raceId) {
      setModalLineage(draft?.dragonLineage);
      setModalToolChoice(draft?.raceToolChoice);
    } else {
      setModalLineage(undefined);
      setModalToolChoice(undefined);
    }
    setDetailRaceId(raceId);
  };

  const handleConfirmRace = () => {
    if (!detailRaceId) return;
    setSelectedRace(detailRaceId);
    setSelectedSubrace(modalSubrace);
    // Guardar linaje dracónico si aplica
    if (detailRaceData?.lineageRequired && modalLineage) {
      setDragonLineage(modalLineage);
    }
    // Guardar herramienta elegida si aplica
    if (detailRaceData?.toolChoices && detailRaceData.toolChoices.length > 0 && modalToolChoice) {
      setRaceToolChoice(modalToolChoice);
    }
    setDetailRaceId(null);
  };

  const handleSelectSubrace = (subraceId: SubraceId) => {
    setModalSubrace(subraceId);
  };

  const handleNext = async () => {
    if (!isValid() || !selectedRace) return;
    setRaza(selectedRace, selectedSubrace);
    if (isCustom && draft?.customRaceData) {
      setCustomRaceData(draft.customRaceData);
    }
    await saveDraft();
    router.push({
      pathname: "/campaigns/[id]/character/create/class",
      params: { id: campaignId },
    });
  };

  const handleBack = () => {
    if (selectedRace) {
      setRaza(selectedRace, selectedSubrace);
    }
    router.back();
  };

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  // Get racial bonuses for modal display
  const modalBonuses = detailRaceId
    ? getTotalRacialBonuses(detailRaceId, modalSubrace)
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
        {!showCustomEditor && (
          <View className="px-5">
            {races.map((race) => (
              <SelectionCard
                key={race.id}
                iconName={RACE_ICONS[race.id]}
                title={race.nombre}
                subtitle={race.descripcion}
                isSelected={selectedRace === race.id}
                onPress={() => handleOpenDetails(race.id)}
                trailingIcon="chevron"
                subtitleLines={2}
                pills={<RacePills race={race} colors={colors} />}
              />
            ))}

            {/* Custom Race Card */}
            <SelectionCard
              iconName={RACE_ICONS["personalizada"]}
              title="Personalizada"
              subtitle="Crea tu propia raza con rasgos, bonificadores y habilidades personalizadas."
              isSelected={selectedRace === "personalizada"}
              onPress={() => handleOpenDetails("personalizada")}
              trailingIcon="chevron"
              subtitleLines={2}
              pills={<PillBadge text="Totalmente configurable" icon="build-outline" />}
            />

            {/* ── Expansiones (collapsible) ── */}
            {expansionRaces.length > 0 && (
              <>
                <ExpansionToggleCard
                  isExpanded={showExpansions}
                  onToggle={() => setShowExpansions(!showExpansions)}
                  subtitle={`${expansionRaces.length} razas adicionales`}
                />

                {showExpansions &&
                  expansionRaces.map((race) => (
                    <SelectionCard
                      key={race.id}
                      iconName={RACE_ICONS[race.id]}
                      title={race.nombre}
                      subtitle={race.descripcion}
                      isSelected={selectedRace === race.id}
                      onPress={() => handleOpenDetails(race.id)}
                      trailingIcon="chevron"
                      subtitleLines={2}
                      indented
                      pills={<RacePills race={race} colors={colors} />}
                    />
                  ))}
              </>
            )}
          </View>
        )}

        {/* Custom Race Editor View */}
        {showCustomEditor && isCustom && (
          <View className="px-5">
            {/* Back to list button */}
            <TouchableOpacity
              className="flex-row items-center mb-4 active:opacity-70"
              onPress={() => setShowCustomEditor(false)}
            >
              <Ionicons name="arrow-back" size={16} color={colors.textMuted} />
              <Text className="text-sm ml-1" style={{ color: colors.textMuted }}>
                Ver todas las razas
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="rounded-card border p-5 mb-5" style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.accentRed, 0.3) }}>
              <View className="flex-row items-center">
                <View className="h-16 w-16 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}>
                  <Ionicons name={RACE_ICONS["personalizada"] as any} size={32} color={colors.accentRed} />
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

      </ScrollView>

      {/* ── Race Details Modal ── */}
      <Modal
        visible={!!detailRaceId && !!detailRaceData}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailRaceId(null)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="rounded-t-3xl" style={{ backgroundColor: colors.bgPrimary, maxHeight: '92%' }}>
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full" style={{ backgroundColor: colors.textMuted }} />
            </View>

            {/* Header with close */}
            <View className="flex-row items-center justify-between px-5 pb-3">
              <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                {detailRaceData?.nombre}
              </Text>
              <TouchableOpacity
                className="h-8 w-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.bgSecondary }}
                onPress={() => setDetailRaceId(null)}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="px-5"
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {detailRaceData && (
                <>
                  {/* Race Header Card */}
                  <View className="rounded-card border p-5 mb-5" style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.accentRed, 0.3) }}>
                    <View className="flex-row items-center mb-4">
                      <View className="h-16 w-16 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}>
                        <Ionicons name={RACE_ICONS[detailRaceData.id] as any} size={32} color={colors.accentRed} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                          {detailRaceData.nombre}
                        </Text>
                        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                          Tamaño: {detailRaceData.size === "mediano" ? "Mediano" : "Pequeño"} · Velocidad: {detailRaceData.speed} pies
                        </Text>
                      </View>
                    </View>

                    <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                      {detailRaceData.descripcion}
                    </Text>
                  </View>

                  {/* Ability Bonuses */}
                  <View className="mb-5">
                    <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                      Bonificadores de Característica
                    </Text>
                    <View className="flex-row flex-wrap">
                      {Object.entries(modalBonuses).map(([key, value]) => (
                        <View
                          key={key}
                          className="border rounded-xl px-4 py-3 mr-2 mb-2 items-center min-w-[80px]"
                          style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.textMuted, 0.2) }}
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
                  {detailRaceData.subraces.length > 0 && (
                    <View className="mb-5">
                      <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                        Subraza <Text style={{ color: colors.accentRed }}>*</Text>
                      </Text>

                      {detailRaceData.subraces.map((subrace) => (
                        <TouchableOpacity
                          key={subrace.id}
                          className="mb-2 rounded-card border p-4 active:opacity-80"
                          style={{
                            backgroundColor: modalSubrace === subrace.id ? withAlpha(colors.accentRed, 0.1) : colors.bgElevated,
                            borderColor: modalSubrace === subrace.id ? withAlpha(colors.accentRed, 0.4) : withAlpha(colors.textMuted, 0.2),
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
                                borderColor: modalSubrace === subrace.id ? colors.accentRed : colors.textMuted,
                                backgroundColor: modalSubrace === subrace.id ? colors.accentRed : 'transparent',
                              }}
                            >
                              {modalSubrace === subrace.id && (
                                <Ionicons name="checkmark" size={14} color={colors.textInverted} />
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

                  {/* Dragon Lineage Selection */}
                  {detailRaceData.lineageRequired && (
                    <View className="mb-5">
                      <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                        Linaje Dracónico <Text style={{ color: colors.accentRed }}>*</Text>
                      </Text>

                      {DRAGON_LINEAGES.map((lineage) => (
                        <TouchableOpacity
                          key={lineage.id}
                          className="mb-2 rounded-card border p-4 active:opacity-80"
                          style={{
                            backgroundColor: modalLineage === lineage.id ? withAlpha(colors.accentRed, 0.1) : colors.bgElevated,
                            borderColor: modalLineage === lineage.id ? withAlpha(colors.accentRed, 0.4) : withAlpha(colors.textMuted, 0.2),
                          }}
                          onPress={() => setModalLineage(lineage.id)}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
                                Dragón {lineage.dragon}
                              </Text>
                              <View className="flex-row flex-wrap mt-1">
                                <View className="rounded-full px-2.5 py-0.5 mr-1.5" style={{ backgroundColor: colors.bgSecondary }}>
                                  <Text className="text-xs font-semibold" style={{ color: colors.accentGold }}>
                                    {lineage.damageType}
                                  </Text>
                                </View>
                                <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: colors.bgSecondary }}>
                                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                    {lineage.breathWeapon}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View
                              className="h-6 w-6 rounded-full border-2 items-center justify-center ml-3"
                              style={{
                                borderColor: modalLineage === lineage.id ? colors.accentRed : colors.textMuted,
                                backgroundColor: modalLineage === lineage.id ? colors.accentRed : 'transparent',
                              }}
                            >
                              {modalLineage === lineage.id && (
                                <Ionicons name="checkmark" size={14} color={colors.textInverted} />
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Race Traits */}
                  {detailRaceData.traits.length > 0 && (
                    <View className="mb-5">
                      <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                        Rasgos Raciales
                      </Text>

                      {detailRaceData.traits.map((trait, index) => (
                        <View
                          key={index}
                          className="border rounded-card p-4 mb-2"
                          style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.textMuted, 0.2) }}
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
                      {detailRaceData.languages.map((lang, idx) => (
                        <View
                          key={idx}
                          className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                          style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.textMuted, 0.2) }}
                        >
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            {lang}
                          </Text>
                        </View>
                      ))}
                      {detailRaceData.extraLanguages
                        ? Array.from(
                            { length: detailRaceData.extraLanguages },
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

                  {/* Darkvision */}
                  {detailRaceData.darkvision && (
                    <View className="border rounded-card p-4 mb-5" style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.textMuted, 0.2) }}>
                      <View className="flex-row items-center">
                        <Ionicons name="eye-outline" size={20} color={colors.accentRed} style={{ marginRight: 10 }} />
                        <View className="flex-1">
                          <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                            Visión en la Oscuridad
                          </Text>
                          <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                            Alcance: {detailRaceData.darkvisionRange ?? 60} pies ({((detailRaceData.darkvisionRange ?? 60) * 0.3).toFixed(0)} m)
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Weapon Proficiencies */}
                  {detailRaceData.weaponProficiencies &&
                    detailRaceData.weaponProficiencies.length > 0 && (
                      <View className="mb-5">
                        <Text className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                          Competencias con Armas
                        </Text>
                        <View className="flex-row flex-wrap">
                          {detailRaceData.weaponProficiencies.map((weapon, idx) => (
                            <View
                              key={idx}
                              className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                              style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.textMuted, 0.2) }}
                            >
                              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                {weapon}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                  {/* Tool Choices */}
                  {detailRaceData.toolChoices &&
                    detailRaceData.toolChoices.length > 0 && (
                      <View className="mb-5">
                        <Text className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                          Herramientas (elige {detailRaceData.toolChoiceCount ?? 1})
                        </Text>
                        <View className="flex-row flex-wrap">
                          {detailRaceData.toolChoices.map((tool, idx) => (
                            <TouchableOpacity
                              key={idx}
                              className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                              style={{
                                backgroundColor: modalToolChoice === tool ? withAlpha(colors.accentRed, 0.15) : colors.bgElevated,
                                borderColor: modalToolChoice === tool ? withAlpha(colors.accentRed, 0.4) : withAlpha(colors.textMuted, 0.2),
                              }}
                              onPress={() => setModalToolChoice(tool)}
                            >
                              <Text className="text-xs" style={{ color: modalToolChoice === tool ? colors.accentRed : colors.textSecondary }}>
                                {tool}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                  {/* Skill Proficiencies */}
                  {detailRaceData.skillProficiencies &&
                    detailRaceData.skillProficiencies.length > 0 && (
                      <View className="mb-5">
                        <Text className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                          Competencias en Habilidades
                        </Text>
                        <View className="flex-row flex-wrap">
                          {detailRaceData.skillProficiencies.map((skill, idx) => {
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
                </>
              )}
            </ScrollView>

            {/* Fixed footer with Select button */}
            <View className="px-5 pb-10 pt-4 border-t" style={{ borderTopColor: colors.borderDefault }}>
              <TouchableOpacity
                className="rounded-xl py-4 items-center flex-row justify-center"
                style={{
                  backgroundColor: isModalSelectable() ? colors.accentRed : colors.bgSecondary,
                  opacity: isModalSelectable() ? 1 : 0.5,
                }}
                onPress={handleConfirmRace}
                disabled={!isModalSelectable()}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.textInverted} style={{ marginRight: 8 }} />
                <Text className="font-bold text-base" style={{ color: colors.textInverted }}>
                  Seleccionar {detailRaceData?.nombre}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          <Text className="font-bold text-base mr-2" style={{ color: colors.textInverted }}>
            Siguiente: Clase
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.textInverted} />
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
