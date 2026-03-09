/**
 * OverviewTab - Pestaña de resumen del personaje
 * Muestra: información básica, experiencia/nivel, puntuaciones de característica,
 * habilidades, tiradas de salvación, competencias y rasgos.
 */

import { useState, useCallback, createElement } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import { useHeaderScroll } from "@/hooks";
import { useCreationStore } from "@/stores/creationStore";
import {
  ABILITY_NAMES,
  ABILITY_ABBR,
  SKILLS,
  ALIGNMENT_NAMES,
  formatModifier,
  type AbilityKey,
  type SkillKey,
} from "@/types/character";
import { getRaceData, getSubraceData } from "@/data/srd/races";
import { getClassData } from "@/data/srd/classes";
import { getSubclassOptions } from "@/data/srd/subclasses";
import { getBackgroundData } from "@/data/srd/backgrounds";
import ExperienceSection from "./ExperienceSection";
import LevelUpModal from "./LevelUpModal";
import PersonalityAppearanceEditor from "./PersonalityAppearanceEditor";
import { useTheme, useDialog } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { CollapsibleSection, InfoBadge, ConfirmDialog } from "@/components/ui";
import { TraitCard } from "./TraitCard";
import { ABILITY_KEYS } from "@/constants/abilities";
import { rollD20 } from "@/utils/dice";
import { getSkillRollModifiers } from "@/utils/skillRollModifiers";
import type { SkillRollModifiers } from "@/utils/skillRollModifiers";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ABILITY_ORDER: AbilityKey[] = ABILITY_KEYS;

export default function OverviewTab() {
  const { isDark, colors } = useTheme();
  const { onScroll } = useHeaderScroll();
  const router = useRouter();
  const { character, saveCharacter, resetToLevel1, getSavingThrowBonus, getSkillBonus, updatePersonality, updateAppearance, updateAlignment, updateName } = useCharacterStore();
  const { startRecreation } = useCreationStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "abilities",
  );
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<"personality" | "appearance">("personality");
  const { dialogProps, showDialog } = useDialog();

  const handleRollD20 = useCallback(
    (
      title: string,
      label: string,
      mod: number,
      modifiers?: SkillRollModifiers,
    ) => {
      // Calcular bonificadores pasivos extra (no incluidos en mod base)
      const extraPassive = (modifiers?.passiveBonuses ?? [])
        .filter((pb) => !pb.includedInBase)
        .reduce((sum, pb) => sum + pb.bonus, 0);
      const modStr = formatModifier(mod);
      const extraModParts = (modifiers?.passiveBonuses ?? [])
        .filter((pb) => !pb.includedInBase)
        .map((pb) => `+${pb.bonus}`);
      const fullModStr = extraModParts.length > 0
        ? `${modStr} ${extraModParts.join(" ")}`
        : modStr;

      // Construir notas de rasgos activos para el diálogo de confirmación
      const notes: string[] = [];
      if (modifiers?.minimum) {
        notes.push(
          `⚡ ${modifiers.minimum.featureName}: mínimo ${modifiers.minimum.minDieValue} en el d20`,
        );
      }
      if (modifiers?.rerollNat1) {
        notes.push(
          `🍀 ${modifiers.rerollNat1.featureName}: re-tirar 1 natural`,
        );
      }
      for (const pb of modifiers?.passiveBonuses ?? []) {
        if (!pb.includedInBase) {
          notes.push(`✦ ${pb.featureName}: +${pb.bonus}`);
        }
      }
      const noteStr = notes.length > 0 ? `\n${notes.join("\n")}` : "";

      showDialog({
        type: "confirm",
        title,
        message: `¿Tirar 1d20 ${fullModStr} (${label})?${noteStr}`,
        icon: "dice-outline",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          {
            text: "🎲 Tirar",
            style: "default",
            onPress: () => {
              let result = rollD20(mod);
              let rawDie = result.rolls[0].value;
              const extras: string[] = [];

              // 1. Retirada de 1 natural (Mediano — Afortunado)
              if (modifiers?.rerollNat1 && rawDie === 1) {
                const rerolled = rollD20(mod);
                const newDie = rerolled.rolls[0].value;
                extras.push(
                  `🍀 ${modifiers.rerollNat1.featureName}: 1 → ${newDie}`,
                );
                result = rerolled;
                rawDie = newDie;
              }

              // 2. Aplicar mínimo de d20
              const dieMinimum = modifiers?.minimum ?? null;
              const minApplied =
                dieMinimum != null && rawDie < dieMinimum.minDieValue;
              const effectiveDie = minApplied
                ? dieMinimum.minDieValue
                : rawDie;
              const finalTotal = (minApplied
                ? effectiveDie + mod
                : result.total) + extraPassive;

              let emoji = "";
              if (result.isCritical) {
                emoji = " ✨";
                extras.unshift("¡CRÍTICO NATURAL!");
              } else if (result.isFumble && !minApplied) {
                emoji = " 💀";
                extras.unshift("¡PIFIA!");
              }
              if (minApplied) {
                extras.push(
                  `⚡ ${dieMinimum.featureName}: ${rawDie} → ${effectiveDie}`,
                );
              }

              // 3. Anotar bonificadores pasivos extra (no incluidos en el mod base)
              for (const pb of modifiers?.passiveBonuses ?? []) {
                if (!pb.includedInBase) {
                  extras.push(`✦ ${pb.featureName}: +${pb.bonus}`);
                }
              }

              const dieDisplay = minApplied
                ? `${rawDie}→${effectiveDie}`
                : `${rawDie}`;
              const extraStr =
                extras.length > 0 ? `\n\n${extras.join("\n")}` : "";

              setTimeout(() => {
                showDialog({
                  type: result.isCritical
                    ? "success"
                    : result.isFumble
                      ? "danger"
                      : "info",
                  title: `${label}${emoji}`,
                  message: `🎲 d20 [${dieDisplay}] ${fullModStr} = ${finalTotal}${extraStr}`,
                  buttons: [{ text: "OK", style: "default" }],
                  customIconContent: createElement(
                    Text,
                    {
                      style: {
                        fontSize: 28,
                        fontWeight: "bold" as const,
                        color: result.isCritical
                          ? colors.accentGreen
                          : result.isFumble
                            ? colors.accentDanger
                            : colors.textPrimary,
                      },
                    },
                    String(finalTotal),
                  ),
                });
              }, 350);
            },
          },
        ],
      });
    },
    [showDialog],
  );

  const handleAbilityRoll = useCallback(
    (key: AbilityKey) => {
      if (!character) return;
      const abilityName = ABILITY_NAMES[key];
      const mod = character.abilityScores[key].modifier;
      handleRollD20(`Tirada de ${abilityName}`, abilityName, mod);
    },
    [character, handleRollD20],
  );

  const handleSavingThrowRoll = useCallback(
    (key: AbilityKey) => {
      if (!character) return;
      const abilityName = ABILITY_NAMES[key];
      const bonus = getSavingThrowBonus(key);
      handleRollD20(`Salvación de ${abilityName}`, `Salvación ${abilityName}`, bonus);
    },
    [character, getSavingThrowBonus, handleRollD20],
  );

  const handleSkillRoll = useCallback(
    (key: SkillKey) => {
      if (!character) return;
      const skillName = SKILLS[key].nombre;
      const baseBonus = getSkillBonus(key);

      // Detectar todos los modificadores pasivos que aplican
      const modifiers = getSkillRollModifiers(character, key);

      // Pasar solo el mod base; handleRollD20 suma y muestra los extras aparte
      handleRollD20(
        `Tirada de ${skillName}`,
        skillName,
        baseBonus,
        modifiers,
      );
    },
    [character, getSkillBonus, handleRollD20],
  );

  const openEditor = useCallback((tab: "personality" | "appearance") => {
    setEditorTab(tab);
    setShowEditor(true);
  }, []);

  const handleLevelUp = useCallback(() => {
    setShowLevelUpModal(true);
  }, []);

  const handleLevelUpComplete = useCallback(async () => {
    setShowLevelUpModal(false);
    await saveCharacter();
  }, [saveCharacter]);

  const handleResetToLevel1 = useCallback(() => {
    if (!character) return;
    Alert.alert(
      "Resetear a Nivel 1",
      "¿Estás seguro? Se volverá al asistente de creación para que selecciones de nuevo tus estadísticas, habilidades, hechizos y equipamiento. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetear",
          style: "destructive",
          onPress: async () => {
            // Create a recreation draft from the current character
            await startRecreation(character);
            // Navigate to the creation wizard (abilities step)
            if (character.campaignId) {
              // Master mode: go through campaign route
              router.replace(
                `/campaigns/${character.campaignId}/character/create/abilities`,
              );
            } else {
              // Single player: go through direct create route
              router.replace("/create/abilities");
            }
          },
        },
      ],
    );
  }, [character, startRecreation, router]);

  if (!character) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-base" style={{ color: colors.textSecondary }}>
          No se ha cargado ningún personaje
        </Text>
      </View>
    );
  }

  const raceData = getRaceData(character.raza);
  const classData = getClassData(character.clase);
  const backgroundData = getBackgroundData(character.trasfondo);
  const backgroundDisplayName = character.customBackgroundName ?? backgroundData.nombre;

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  // ── Render helpers ──

  const renderBasicInfo = () => {
    return (
    <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
      <View className="flex-row flex-wrap">
        <InfoBadge
          icon="book-outline"
          label={backgroundDisplayName}
        />
        {character.alineamiento && (
          <InfoBadge
            icon="compass-outline"
            label={ALIGNMENT_NAMES[character.alineamiento]}
          />
        )}
        <InfoBadge
          icon="star-outline"
          label={`XP: ${character.experiencia}`}
        />
        <InfoBadge
          icon="ribbon-outline"
          label={`Competencia: +${character.proficiencyBonus}`}
        />
        <InfoBadge
          icon="walk-outline"
          label={`${character.speed.walk} pies`}
        />
        {character.speed.swim ? (
          <InfoBadge
            icon="water-outline"
            label={`Nadar: ${character.speed.swim} pies`}
          />
        ) : null}
        {character.speed.climb ? (
          <InfoBadge
            icon="trending-up-outline"
            label={`Trepar: ${character.speed.climb} pies`}
          />
        ) : null}
        {character.speed.fly ? (
          <InfoBadge
            icon="airplane-outline"
            label={`Volar: ${character.speed.fly} pies`}
          />
        ) : null}
      </View>
    </View>
  );
  };

  const renderAbilityScores = () => (
    <CollapsibleSection
      title="Puntuaciones de Característica"
      icon="stats-chart"
      isExpanded={expandedSection === "abilities"}
      onToggle={() => toggleSection("abilities")}
    >
      <View className="flex-row flex-wrap justify-between">
        {ABILITY_ORDER.map((key) => {
          const score = character.abilityScores[key];
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => handleAbilityRoll(key)}
              className="w-[31%] rounded-xl p-3 mb-3 items-center border"
              style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
            >
              <Text
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: colors.accentRed }}
              >
                {ABILITY_ABBR[key]}
              </Text>
              <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {score.total}
              </Text>
              <View
                className="rounded-full px-3 py-1 mt-1"
                style={{ backgroundColor: withAlpha(colors.accentRed, 0.13) }}
              >
                <Text className="text-sm font-bold" style={{ color: colors.accentRed }}>
                  {formatModifier(score.modifier)}
                </Text>
              </View>
              {score.racial > 0 && (
                <Text className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                  Base {score.base} + Racial {score.racial}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </CollapsibleSection>
  );

  const renderSavingThrows = () => {
    return (
      <CollapsibleSection
        title="Tiradas de Salvación"
        icon="shield-checkmark"
        isExpanded={expandedSection === "saves"}
        onToggle={() => toggleSection("saves")}
      >
        <View className="flex-row flex-wrap">
          {ABILITY_ORDER.map((key) => {
            const save = character.savingThrows[key];
            const bonus = getSavingThrowBonus(key);
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => handleSavingThrowRoll(key)}
                className="w-1/2 pr-2 mb-2"
              >
                <View
                  className="flex-row items-center rounded-lg p-2.5 border"
                  style={{
                    backgroundColor: save.proficient
                      ? withAlpha(colors.accentRed, 0.15)
                      : colors.bgCard,
                    borderColor: save.proficient
                      ? withAlpha(colors.accentRed, 0.5)
                      : colors.borderDefault,
                  }}
                >
                  <View
                    className="h-6 w-6 rounded-full items-center justify-center mr-2"
                    style={{
                      backgroundColor: save.proficient
                        ? withAlpha(colors.accentRed, 0.35)
                        : colors.bgElevated,
                    }}
                  >
                    {save.proficient ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : (
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: colors.textMuted }}
                      />
                    )}
                  </View>
                  <Text className="text-xs font-bold flex-1" style={{ color: save.proficient ? colors.accentRed : colors.textMuted }}>
                    {ABILITY_ABBR[key]}
                  </Text>
                  <Text
                    className="text-sm font-bold"
                    style={{
                      color: save.proficient ? colors.accentRed : colors.textMuted,
                    }}
                  >
                    {formatModifier(bonus)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </CollapsibleSection>
    );
  };

  const renderSkills = () => {
    const sortedSkills = (Object.keys(SKILLS) as SkillKey[]).sort((a, b) =>
      SKILLS[a].nombre.localeCompare(SKILLS[b].nombre, "es"),
    );

    return (
      <CollapsibleSection
        title="Habilidades"
        icon="list"
        isExpanded={expandedSection === "skills"}
        onToggle={() => toggleSection("skills")}
      >
        {sortedSkills.map((key) => {
          const skill = SKILLS[key];
          const proficiency = character.skillProficiencies[key];
          const baseBonus = getSkillBonus(key);
          const isProficient = proficiency.level === "proficient";
          const isExpertise = proficiency.level === "expertise";

          // Sumar bonificadores pasivos de rasgos de clase/subclase
          const modifiers = getSkillRollModifiers(character, key);
          const extraBonus = modifiers.passiveBonuses
            .filter((pb) => !pb.includedInBase)
            .reduce((sum, pb) => sum + pb.bonus, 0);
          const bonus = baseBonus + extraBonus;

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => handleSkillRoll(key)}
              className="flex-row items-center py-2 border-b"
              style={{ borderBottomColor: withAlpha(colors.borderDefault, 0.5) }}
            >
              {/* Proficiency indicator */}
              <View className="h-5 w-5 rounded-full items-center justify-center mr-2">
                {isExpertise ? (
                  <View
                    className="h-5 w-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}
                  >
                    <Ionicons name="star" size={12} color={colors.accentRed} />
                  </View>
                ) : isProficient ? (
                  <View
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: colors.accentRed }}
                  />
                ) : (
                  <View className="h-4 w-4 rounded-full border-2" style={{ borderColor: colors.textMuted }} />
                )}
              </View>

              {/* Skill name */}
              <View className="flex-1">
                <Text
                  className="text-sm"
                  style={{
                    color:
                      isProficient || isExpertise
                        ? colors.textPrimary
                        : colors.textSecondary,
                    fontWeight: isProficient || isExpertise ? "600" : "400",
                  }}
                >
                  {skill.nombre}
                </Text>
                <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                  {ABILITY_ABBR[skill.habilidad]}
                </Text>
              </View>

              {/* Bonus */}
              <Text
                className="text-sm font-bold min-w-[36px] text-right"
                style={{
                  color:
                    isProficient || isExpertise
                      ? colors.accentRed
                      : colors.textMuted,
                }}
              >
                {formatModifier(bonus)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </CollapsibleSection>
    );
  };

  const renderProficiencies = () => (
    <CollapsibleSection
      title="Competencias"
      icon="construct"
      isExpanded={expandedSection === "proficiencies"}
      onToggle={() => toggleSection("proficiencies")}
    >
      {character.proficiencies.armors.length > 0 && (
        <ProficiencyGroup
          title="Armaduras"
          icon="shield-outline"
          items={character.proficiencies.armors}
        />
      )}
      {character.proficiencies.weapons.length > 0 && (
        <ProficiencyGroup
          title="Armas"
          icon="flash-outline"
          items={character.proficiencies.weapons}
        />
      )}
      {character.proficiencies.tools.length > 0 && (
        <ProficiencyGroup
          title="Herramientas"
          icon="hammer-outline"
          items={character.proficiencies.tools}
        />
      )}
      {character.proficiencies.languages.length > 0 && (
        <ProficiencyGroup
          title="Idiomas"
          icon="chatbubbles-outline"
          items={character.proficiencies.languages}
        />
      )}
    </CollapsibleSection>
  );

  const renderTraits = () => (
    <CollapsibleSection
      title="Rasgos y Capacidades"
      icon="sparkles"
      isExpanded={expandedSection === "traits"}
      onToggle={() => toggleSection("traits")}
    >
      {character.traits.length === 0 ? (
        <Text className="text-sm italic" style={{ color: colors.textMuted }}>
          Sin rasgos especiales
        </Text>
      ) : (
        character.traits.map((trait) => (
          <TraitCard key={trait.id} trait={trait} />
        ))
      )}
    </CollapsibleSection>
  );

  const renderPersonality = () => (
    <CollapsibleSection
      title="Personalidad"
      icon="heart"
      isExpanded={expandedSection === "personality"}
      onToggle={() => toggleSection("personality")}
      rightElement={
        <TouchableOpacity
          onPress={() => openEditor("personality")}
          hitSlop={8}
          style={{ marginRight: 4 }}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.accentGold} />
        </TouchableOpacity>
      }
    >
      {character.personality.traits.length > 0 && (
        <View className="mb-3">
          <Text className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.accentGold }}>
            Rasgos de Personalidad
          </Text>
          {character.personality.traits.map((trait, idx) => (
            <Text
              key={idx}
              className="text-sm leading-5 mb-1"
              style={{ color: colors.textSecondary }}
            >
              • {trait}
            </Text>
          ))}
        </View>
      )}
      {character.personality.ideals ? (
        <View className="mb-3">
          <Text className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.accentGold }}>
            Ideales
          </Text>
          <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
            {character.personality.ideals}
          </Text>
        </View>
      ) : null}
      {character.personality.bonds ? (
        <View className="mb-3">
          <Text className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.accentGold }}>
            Vínculos
          </Text>
          <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
            {character.personality.bonds}
          </Text>
        </View>
      ) : null}
      {character.personality.flaws ? (
        <View className="mb-3">
          <Text className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.accentGold }}>
            Defectos
          </Text>
          <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
            {character.personality.flaws}
          </Text>
        </View>
      ) : null}
      {character.personality.backstory ? (
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.accentGold }}>
            Trasfondo
          </Text>
          <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
            {character.personality.backstory}
          </Text>
        </View>
      ) : null}
      {!character.personality.traits.length &&
        !character.personality.ideals &&
        !character.personality.bonds &&
        !character.personality.flaws && (
          <Text className="text-sm italic" style={{ color: colors.textMuted }}>
            Sin datos de personalidad
          </Text>
        )}
    </CollapsibleSection>
  );

  const renderAppearance = () => {
    const a = character.appearance;
    const hasData = a.age || a.height || a.weight || a.eyeColor || a.hairColor || a.skinColor || a.description;
    return (
      <CollapsibleSection
        title="Apariencia"
        icon="person"
        isExpanded={expandedSection === "appearance"}
        onToggle={() => toggleSection("appearance")}
        rightElement={
          <TouchableOpacity
            onPress={() => openEditor("appearance")}
            hitSlop={8}
            style={{ marginRight: 4 }}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.accentGold} />
          </TouchableOpacity>
        }
      >
        {hasData ? (
          <View>
            {(a.age || a.height || a.weight) && (
              <View className="flex-row flex-wrap mb-2" style={{ gap: 8 }}>
                {a.age ? (
                  <InfoBadge icon="calendar-outline" label={a.age} />
                ) : null}
                {a.height ? (
                  <InfoBadge icon="resize-outline" label={a.height} />
                ) : null}
                {a.weight ? (
                  <InfoBadge icon="barbell-outline" label={a.weight} />
                ) : null}
              </View>
            )}
            {(a.eyeColor || a.hairColor || a.skinColor) && (
              <View className="flex-row flex-wrap mb-2" style={{ gap: 8 }}>
                {a.eyeColor ? (
                  <InfoBadge icon="eye-outline" label={`Ojos: ${a.eyeColor}`} />
                ) : null}
                {a.hairColor ? (
                  <InfoBadge icon="cut-outline" label={`Pelo: ${a.hairColor}`} />
                ) : null}
                {a.skinColor ? (
                  <InfoBadge icon="hand-left-outline" label={`Piel: ${a.skinColor}`} />
                ) : null}
              </View>
            )}
            {a.description ? (
              <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                {a.description}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text className="text-sm italic" style={{ color: colors.textMuted }}>
            Sin datos de apariencia — pulsa el lápiz para añadir
          </Text>
        )}
      </CollapsibleSection>
    );
  };

  const renderSpeed = () => null; // Speed info moved to renderBasicInfo

  return (
    <>
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {renderBasicInfo()}
        <ExperienceSection onLevelUp={handleLevelUp} />
        {renderAbilityScores()}
        {renderSavingThrows()}
        {renderSkills()}
        {renderProficiencies()}
        {renderTraits()}
        {renderPersonality()}
        {renderAppearance()}

        {/* Reset to Level 1 button */}
        {character.nivel > 1 && (
          <TouchableOpacity
            onPress={handleResetToLevel1}
            activeOpacity={0.7}
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: withAlpha(colors.accentDanger, 0.08),
              borderWidth: 1,
              borderColor: withAlpha(colors.accentDanger, 0.25),
              gap: 8,
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.accentDanger}
            />
            <Text
              style={{
                color: colors.accentDanger,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Resetear personaje a nivel 1
            </Text>
          </TouchableOpacity>
        )}
      </Animated.ScrollView>

      <LevelUpModal
        visible={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        onComplete={handleLevelUpComplete}
      />

      <ConfirmDialog {...dialogProps} />

      {character && (
        <PersonalityAppearanceEditor
          visible={showEditor}
          onClose={() => setShowEditor(false)}
          personality={character.personality}
          appearance={character.appearance}
          alignment={character.alineamiento}
          nombre={character.nombre}
          onSavePersonality={updatePersonality}
          onSaveAppearance={updateAppearance}
          onSaveAlignment={updateAlignment}
          onSaveName={updateName}
          initialTab={editorTab}
        />
      )}

    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function SpeedBadge({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors: sbColors } = useTheme();
  return (
    <View className="flex-row items-center rounded-lg px-3 py-2 mr-2 mb-2 border" style={{ backgroundColor: sbColors.bgCard, borderColor: sbColors.borderDefault }}>
      <Ionicons name={icon} size={16} color={sbColors.accentGreen} />
      <View className="ml-2">
        <Text className="text-[10px] uppercase" style={{ color: sbColors.textMuted }}>{label}</Text>
        <Text className="text-sm font-bold" style={{ color: sbColors.textPrimary }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProficiencyGroup({
  icon,
  title,
  items,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
}) {
  const { colors: pgColors } = useTheme();
  return (
    <View className="mb-3">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={14} color={pgColors.textMuted} />
        <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: pgColors.textSecondary }}>
          {title}
        </Text>
      </View>
      <View className="flex-row flex-wrap">
        {items.map((item, idx) => (
          <View
            key={idx}
            className="rounded-lg px-2.5 py-1.5 mr-1.5 mb-1.5 border"
            style={{ backgroundColor: pgColors.chipBg, borderColor: pgColors.chipBorder }}
          >
            <Text className="text-xs" style={{ color: pgColors.textSecondary }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}


