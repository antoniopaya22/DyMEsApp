import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreationStore, TOTAL_STEPS } from "@/stores/creationStore";
import {
  getClassList,
  getClassData,
  SPELLCASTING_DESCRIPTIONS,
  isSpellcaster,
} from "@/data/srd/classes";
import type { ClassData } from "@/data/srd/classes";
import type { ClassId } from "@/types/character";
import { ABILITY_NAMES } from "@/types/character";
import { useTheme, useScrollToTop, useCreationNavigation } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import SelectionCard, { PillBadge } from "@/components/creation/SelectionCard";

const CURRENT_STEP = 3;

export default function ClassSelectionStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const { campaignId, pushStep, goBack } = useCreationNavigation();

  const { draft, setClase, saveDraft, loadDraft } = useCreationStore();

  const [selectedClass, setSelectedClass] = useState<ClassId | null>(
    draft?.clase ?? null,
  );
  const [detailClassId, setDetailClassId] = useState<ClassId | null>(null);

  const classes = getClassList();

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (!draft) {
          await loadDraft(campaignId);
        }
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.clase) {
          setSelectedClass(currentDraft.clase);
        }
      };
      init();
    }, [campaignId]),
  );

  const detailClassData = detailClassId ? getClassData(detailClassId) : null;

  const handleOpenDetails = (classId: ClassId) => {
    setDetailClassId(classId);
  };

  const handleConfirmClass = () => {
    if (!detailClassId) return;
    setSelectedClass(detailClassId);
    setDetailClassId(null);
  };

  const handleNext = async () => {
    if (!selectedClass) return;
    setClase(selectedClass);
    await saveDraft();
    pushStep("abilities");
  };

  const handleBack = () => {
    if (selectedClass) {
      setClase(selectedClass);
    }
    goBack();
  };

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  const getCasterLabel = (cls: ClassData): string => {
    switch (cls.casterType) {
      case "full":
        return "Lanzador completo";
      case "half":
        return "Semi-lanzador";
      case "pact":
        return "Magia de pacto";
      default:
        return "Sin magia";
    }
  };

  const getCasterColor = (cls: ClassData): string => {
    switch (cls.casterType) {
      case "full":
      case "half":
      case "pact":
        return colors.accentRed;
      default:
        return colors.textMuted;
    }
  };

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

          <Text
            className="text-sm font-semibold"
            style={{ color: colors.textSecondary }}
          >
            Paso {CURRENT_STEP} de {TOTAL_STEPS}
          </Text>

          <View className="h-10 w-10" />
        </View>

        {/* Progress bar */}
        <View
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.bgInput }}
        >
          <View
            className="h-full rounded-full"
            style={{ width: `${progressPercent}%`, backgroundColor: colors.accentRed }}
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
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: colors.textPrimary }}
          >
            Elige tu clase
          </Text>
          <Text
            className="text-base leading-6"
            style={{ color: colors.textSecondary }}
          >
            Tu clase define las habilidades de combate, la magia y los rasgos
            especiales de tu personaje. Es la elección más importante en la
            creación.
          </Text>
        </View>

        {/* Class list */}
        <View className="px-5">
          {classes.map((cls) => (
            <SelectionCard
              key={cls.id}
              iconName={cls.iconName}
              title={cls.nombre}
              subtitle={cls.descripcion}
              isSelected={selectedClass === cls.id}
              onPress={() => handleOpenDetails(cls.id)}
              accentColor={cls.color}
              trailingIcon="chevron"
              subtitleLines={2}
              pills={
                <>
                  <PillBadge
                    text={cls.hitDie}
                    icon="heart"
                    iconColor={colors.accentGreen}
                  />
                  <PillBadge
                    text={getCasterLabel(cls)}
                    color={getCasterColor(cls)}
                    bgColor={`${getCasterColor(cls)}15`}
                  />
                  <PillBadge
                    text={`Salv: ${ABILITY_NAMES[cls.savingThrows[0]]}, ${ABILITY_NAMES[cls.savingThrows[1]]}`}
                  />
                </>
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* Class Detail Modal */}
      <Modal
        visible={!!detailClassId && !!detailClassData}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailClassId(null)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl"
            style={{ backgroundColor: colors.bgPrimary, maxHeight: "92%" }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-1">
              <View
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: colors.borderDefault }}
              />
            </View>

            {/* Header with close button */}
            <View className="flex-row items-center justify-between px-5 pb-3">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                {detailClassData?.nombre}
              </Text>
              <TouchableOpacity
                className="h-8 w-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.bgSecondary }}
                onPress={() => setDetailClassId(null)}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {detailClassData && (
              <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                {/* Class Header */}
                <View
                  className="rounded-card border p-5 mb-5"
                  style={{
                    backgroundColor: `${detailClassData.color}10`,
                    borderColor: `${detailClassData.color}40`,
                  }}
                >
                  <View className="flex-row items-center mb-4">
                    <View
                      className="h-16 w-16 rounded-xl items-center justify-center mr-4"
                      style={{
                        backgroundColor: `${detailClassData.color}25`,
                      }}
                    >
                      <Ionicons
                        name={detailClassData.iconName as any}
                        size={32}
                        color={detailClassData.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-2xl font-bold"
                        style={{ color: colors.textPrimary }}
                      >
                        {detailClassData.nombre}
                      </Text>
                      <Text
                        className="text-sm mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        Dado de golpe: {detailClassData.hitDie} · PG nivel 1:{" "}
                        {detailClassData.hitDieMax} + mod. CON
                      </Text>
                    </View>
                  </View>

                  <Text
                    className="text-sm leading-5"
                    style={{ color: colors.textSecondary }}
                  >
                    {detailClassData.descripcion}
                  </Text>
                </View>

                {/* Hit Points Summary */}
                <View
                  className="border rounded-card p-4 mb-5"
                  style={{
                    backgroundColor: colors.bgElevated,
                    borderColor: withAlpha(colors.textMuted, 0.2),
                  }}
                >
                  <Text
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Puntos de Golpe
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <View className="h-8 w-8 rounded-full bg-hp-full/20 items-center justify-center mr-3">
                      <Ionicons
                        name="heart"
                        size={16}
                        color={colors.accentGreen}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        Nivel 1: {detailClassData.hitDieMax} + mod. Constitución
                      </Text>
                      <Text
                        className="text-xs mt-0.5"
                        style={{ color: colors.textMuted }}
                      >
                        Niveles superiores: {detailClassData.hitDie} (o{" "}
                        {detailClassData.hitDieFixed}) + mod. CON por nivel
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Saving Throws */}
                <View className="mb-5">
                  <Text
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Tiradas de Salvación
                  </Text>
                  <View className="flex-row">
                    {detailClassData.savingThrows.map((save, idx) => (
                      <View
                        key={save}
                        className="border rounded-xl px-4 py-3 mr-2 items-center min-w-[100px]"
                        style={{
                          backgroundColor: colors.bgElevated,
                          borderColor: withAlpha(colors.textMuted, 0.2),
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.accentGreen}
                        />
                        <Text
                          className="text-sm font-semibold mt-1"
                          style={{ color: colors.textPrimary }}
                        >
                          {ABILITY_NAMES[save]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Armor & Weapon Proficiencies */}
                <View className="mb-5">
                  <Text
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Competencias con Armadura
                  </Text>
                  <View className="flex-row flex-wrap">
                    {detailClassData.armorProficiencies.length > 0 ? (
                      detailClassData.armorProficiencies.map((armor, idx) => (
                        <View
                          key={idx}
                          className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                          style={{
                            backgroundColor: colors.bgElevated,
                            borderColor: withAlpha(colors.textMuted, 0.2),
                          }}
                        >
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {armor}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View
                        className="rounded-full px-3 py-1.5"
                        style={{ backgroundColor: colors.bgSecondary }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: colors.textMuted }}
                        >
                          Ninguna
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="mb-5">
                  <Text
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Competencias con Armas
                  </Text>
                  <View className="flex-row flex-wrap">
                    {detailClassData.weaponProficiencies.map((weapon, idx) => (
                      <View
                        key={idx}
                        className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                        style={{
                          backgroundColor: colors.bgElevated,
                          borderColor: withAlpha(colors.textMuted, 0.2),
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {weapon}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Tool Proficiencies */}
                {(detailClassData.toolProficiencies.length > 0 ||
                  (detailClassData.toolChoices &&
                    detailClassData.toolChoices.length > 0)) && (
                  <View className="mb-5">
                    <Text
                      className="text-sm font-semibold mb-3 uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Competencias con Herramientas
                    </Text>
                    <View className="flex-row flex-wrap">
                      {detailClassData.toolProficiencies.map((tool, idx) => (
                        <View
                          key={idx}
                          className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                          style={{
                            backgroundColor: colors.bgElevated,
                            borderColor: withAlpha(colors.textMuted, 0.2),
                          }}
                        >
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {tool}
                          </Text>
                        </View>
                      ))}
                      {detailClassData.toolChoices && (
                        <View
                          className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                          style={{
                            backgroundColor: withAlpha(colors.accentGold, 0.1),
                            borderColor: withAlpha(colors.accentGold, 0.3),
                          }}
                        >
                          <Text
                            className="text-sm"
                            style={{ color: colors.accentGold }}
                          >
                            +{detailClassData.toolChoiceCount ?? 1} a elegir
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Skill Choices */}
                <View className="mb-5">
                  <Text
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Habilidades (elige {detailClassData.skillChoiceCount})
                  </Text>
                  <View className="flex-row flex-wrap">
                    {detailClassData.skillChoicePool.map((skillKey, idx) => {
                      const { SKILLS } = require("@/types/character");
                      const skillDef = SKILLS[skillKey];
                      return (
                        <View
                          key={idx}
                          className="border rounded-full px-3 py-1.5 mr-2 mb-2"
                          style={{
                            backgroundColor: colors.bgElevated,
                            borderColor: withAlpha(colors.textMuted, 0.2),
                          }}
                        >
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {skillDef?.nombre ?? skillKey}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: colors.textMuted }}
                  >
                    Se elegirán en el paso de Habilidades.
                  </Text>
                </View>

                {/* Spellcasting */}
                {isSpellcaster(detailClassData.id) && (
                  <View className="mb-5">
                    <Text
                      className="text-sm font-semibold mb-3 uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Lanzamiento de Conjuros
                    </Text>

                    <View
                      className="rounded-card border p-4 mb-3"
                      style={{
                        backgroundColor: `${getCasterColor(detailClassData)}10`,
                        borderColor: `${getCasterColor(detailClassData)}30`,
                      }}
                    >
                      <View className="flex-row items-center mb-2">
                        <Ionicons
                          name="sparkles"
                          size={18}
                          color={getCasterColor(detailClassData)}
                        />
                        <Text
                          className="text-sm font-bold ml-2"
                          style={{ color: getCasterColor(detailClassData) }}
                        >
                          {getCasterLabel(detailClassData)}
                        </Text>
                      </View>

                      {SPELLCASTING_DESCRIPTIONS[detailClassData.id] && (
                        <Text
                          className="text-sm leading-5"
                          style={{ color: colors.textSecondary }}
                        >
                          {SPELLCASTING_DESCRIPTIONS[detailClassData.id]}
                        </Text>
                      )}

                      {/* Spellcasting details */}
                      <View className="mt-3 flex-row flex-wrap">
                        {detailClassData.spellcastingAbility && (
                          <View
                            className="rounded-full px-2.5 py-1 mr-2 mb-1"
                            style={{ backgroundColor: colors.bgSecondary }}
                          >
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Aptitud:{" "}
                              {
                                ABILITY_NAMES[
                                  detailClassData.spellcastingAbility
                                ]
                              }
                            </Text>
                          </View>
                        )}
                        {detailClassData.cantripsAtLevel1 > 0 && (
                          <View
                            className="rounded-full px-2.5 py-1 mr-2 mb-1"
                            style={{ backgroundColor: colors.bgSecondary }}
                          >
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Trucos: {detailClassData.cantripsAtLevel1}
                            </Text>
                          </View>
                        )}
                        {detailClassData.spellsAtLevel1 > 0 && (
                          <View
                            className="rounded-full px-2.5 py-1 mr-2 mb-1"
                            style={{ backgroundColor: colors.bgSecondary }}
                          >
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Conjuros nv.1: {detailClassData.spellsAtLevel1}
                            </Text>
                          </View>
                        )}
                        {detailClassData.preparesSpells && (
                          <View
                            className="rounded-full px-2.5 py-1 mr-2 mb-1"
                            style={{ backgroundColor: colors.bgSecondary }}
                          >
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Prepara conjuros
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {/* Level 1 Features */}
                <View className="mb-5">
                  <Text
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Rasgos de Nivel 1
                  </Text>

                  {detailClassData.level1Features.map((feature, idx) => (
                    <View
                      key={idx}
                      className="border rounded-card p-4 mb-2"
                      style={{
                        backgroundColor: colors.bgElevated,
                        borderColor: withAlpha(colors.textMuted, 0.2),
                      }}
                    >
                      <View className="flex-row items-center mb-2">
                        <Ionicons
                          name="star"
                          size={14}
                          color={detailClassData.color}
                        />
                        <Text
                          className="text-sm font-bold ml-2"
                          style={{ color: colors.textPrimary }}
                        >
                          {feature.nombre}
                        </Text>
                      </View>
                      <Text
                        className="text-sm leading-5"
                        style={{ color: colors.textSecondary }}
                      >
                        {feature.descripcion}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Subclass info */}
                <View
                  className="border rounded-card p-4 mb-5"
                  style={{
                    backgroundColor: colors.bgElevated,
                    borderColor: withAlpha(colors.accentGold, 0.2),
                  }}
                >
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="git-branch-outline"
                      size={16}
                      color={colors.accentGold}
                    />
                    <Text
                      className="text-sm font-bold ml-2"
                      style={{ color: colors.accentGold }}
                    >
                      {detailClassData.subclassLabel}
                    </Text>
                  </View>
                  <Text
                    className="text-sm leading-5"
                    style={{ color: colors.textSecondary }}
                  >
                    Al nivel {detailClassData.subclassLevel}, elegirás tu{" "}
                    {detailClassData.subclassLabel.toLowerCase()}, que define la
                    especialización de tu personaje dentro de esta clase.
                  </Text>
                </View>

                {/* Equipment Preview */}
                <View className="mb-5">
                  <Text
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Equipo Inicial
                  </Text>

                  {detailClassData.equipmentChoices.map((choice, idx) => (
                    <View
                      key={idx}
                      className="border rounded-card p-3 mb-2"
                      style={{
                        backgroundColor: colors.bgElevated,
                        borderColor: withAlpha(colors.textMuted, 0.2),
                      }}
                    >
                      <Text
                        className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: colors.textSecondary }}
                      >
                        {choice.label}
                      </Text>
                      {choice.options.map((option, optIdx) => (
                        <View
                          key={optIdx}
                          className="flex-row items-center mb-1 last:mb-0"
                        >
                          <Text
                            className="text-xs mr-1.5"
                            style={{ color: colors.textMuted }}
                          >
                            {String.fromCharCode(97 + optIdx)})
                          </Text>
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {option.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}

                  {detailClassData.defaultEquipment.length > 0 && (
                    <View
                      className="border rounded-card p-3 mb-2"
                      style={{
                        backgroundColor: colors.bgElevated,
                        borderColor: withAlpha(colors.textMuted, 0.2),
                      }}
                    >
                      <Text
                        className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: colors.textSecondary }}
                      >
                        Siempre incluido
                      </Text>
                      {detailClassData.defaultEquipment.map((item, idx) => (
                        <View key={idx} className="flex-row items-center mb-1">
                          <Text
                            className="text-xs mr-1.5"
                            style={{ color: colors.textMuted }}
                          >
                            •
                          </Text>
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text
                    className="text-xs mt-1"
                    style={{ color: colors.textMuted }}
                  >
                    Las opciones de equipo se seleccionarán en el paso de
                    Equipamiento.
                  </Text>
                </View>

                {/* Bottom spacing for scroll */}
                <View className="h-4" />
              </ScrollView>
            )}

            {/* Modal Footer */}
            <View
              className="px-5 pb-8 pt-4 border-t"
              style={{ borderTopColor: colors.borderDefault }}
            >
              <TouchableOpacity
                className="rounded-xl py-4 items-center"
                style={{
                  backgroundColor: detailClassData?.color ?? colors.accentRed,
                }}
                onPress={handleConfirmClass}
              >
                <Text className="text-white font-bold text-base">
                  Seleccionar {detailClassData?.nombre}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer with navigation buttons */}
      <View
        className="px-5 pb-10 pt-4 border-t"
        style={{
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderDefault,
        }}
      >
        <TouchableOpacity
          className="rounded-xl py-4 items-center flex-row justify-center mb-3"
          style={{
            backgroundColor: selectedClass
              ? colors.accentRed
              : colors.bgSecondary,
            opacity: selectedClass ? 1 : 0.5,
          }}
          onPress={handleNext}
          disabled={!selectedClass}
        >
          <Text
            className="font-bold text-base mr-2"
            style={{ color: colors.textInverted }}
          >
            Siguiente: Estadísticas
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={colors.textInverted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-xl py-3.5 items-center"
          onPress={handleBack}
        >
          <Text
            className="font-semibold text-base"
            style={{ color: colors.textSecondary }}
          >
            Atrás
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
