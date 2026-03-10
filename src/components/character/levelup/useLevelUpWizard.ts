/**
 * useLevelUpWizard — all state, navigation, validation & confirm logic
 * for the level-up modal wizard.
 *
 * Extracted from LevelUpModal.tsx to honour SRP.
 */

import { useState, useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";
import {
  useCharacterStore,
  type LevelUpOptions,
} from "@/stores/characterStore";
import { usePvFijos, useDotesActivas } from "@/stores/settingsStore";
import {
  getLevelUpSummary,
  ASI_POINTS,
  MAX_ABILITY_SCORE,
  type LevelUpSummary,
} from "@/data/srd/leveling";
import { getClassData } from "@/data/srd/classes";
import {
  getSubclassChoicesForLevel,
  getSubclassFeaturesForLevel,
} from "@/data/srd/subclassFeatures";
import { getSubclassOptions } from "@/data/srd/subclasses";
import {
  calcModifier,
  calcProficiencyBonus,
  hitDieFixedValue,
  hitDieValue,
  type AbilityKey,
  type AbilityScores,
} from "@/types/character";
import { getFeatById } from "@/data/srd/feats";
import { Ionicons } from "@expo/vector-icons";

// Re-export so existing consumers keep working
export { getAbilityColors, ABILITY_KEYS } from "@/constants/abilities";

// ─── Public types ────────────────────────────────────────────────────

export type StepId =
  | "summary"
  | "hp"
  | "asi"
  | "spells"
  | "subclass"
  | "metamagic"
  | "confirm";

export interface StepDef {
  id: StepId;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useLevelUpWizard(
  visible: boolean,
  onClose: () => void,
  onComplete: () => void,
) {
  const { character, levelUp, getMagicState } = useCharacterStore();
  const pvFijos = usePvFijos();
  const dotesActivas = useDotesActivas();

  // ── Wizard navigation ──
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepDef[]>([]);
  const [summary, setSummary] = useState<LevelUpSummary | null>(null);

  // ── HP ──
  const [hpMethod, setHpMethod] = useState<"fixed" | "roll">("fixed");
  const [hpRolled, setHpRolled] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // ── ASI ──
  const [asiPoints, setAsiPoints] = useState<Record<AbilityKey, number>>({
    fue: 0,
    des: 0,
    con: 0,
    int: 0,
    sab: 0,
    car: 0,
  });

  // ── Feat (alternative to ASI when dotesActivas is enabled) ──
  const [chooseFeat, setChooseFeat] = useState(false);
  const [selectedFeatId, setSelectedFeatId] = useState<string | null>(null);
  const [featAsiChoices, setFeatAsiChoices] = useState<Partial<AbilityScores>>(
    {},
  );

  // ── Subclass ──
  const [subclassName, setSubclassName] = useState("");
  const [selectedSubclassId, setSelectedSubclassId] = useState<string | null>(
    null,
  );
  const [isCustomSubclass, setIsCustomSubclass] = useState(false);
  const [featureChoices, setFeatureChoices] = useState<
    Record<string, string[]>
  >({});

  // ── Spells ──
  const [newCantrips, setNewCantrips] = useState<string[]>([]);
  const [newSpells, setNewSpells] = useState<string[]>([]);
  const [newSpellbook, setNewSpellbook] = useState<string[]>([]);
  const [swapOldSpell, setSwapOldSpell] = useState("");
  const [swapNewSpell, setSwapNewSpell] = useState("");
  const [wantsToSwap, setWantsToSwap] = useState(false);
  const [spellSearch, setSpellSearch] = useState("");

  // ── Metamagic ──
  const [selectedMetamagic, setSelectedMetamagic] = useState<string[]>([]);

  // ── Custom spells (free text) ──
  const [customCantripName, setCustomCantripName] = useState("");
  const [customSpellName, setCustomSpellName] = useState("");

  // ── Spell description expand ──
  const [expandedSpellIds, setExpandedSpellIds] = useState<Set<string>>(
    new Set(),
  );

  // ── Processing ──
  const [isProcessing, setIsProcessing] = useState(false);

  // ── HP roll interval ref (cleanup on unmount) ──
  const hpRollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Animations ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // ── Derived values ──
  const newLevel = character ? character.nivel + 1 : 1;
  const classData = character ? getClassData(character.clase) : null;
  const dieSides = classData ? hitDieValue(classData.hitDie) : 8;
  const fixedHP = classData ? hitDieFixedValue(classData.hitDie) : 5;
  const conMod = character
    ? calcModifier(character.abilityScores.con.total)
    : 0;

  const totalASIUsed = Object.values(asiPoints).reduce((s, v) => s + v, 0);
  const asiRemaining = ASI_POINTS - totalASIUsed;

  const hpGainBase = hpMethod === "fixed" ? fixedHP : (hpRolled ?? 0);
  const hpGainTotal = Math.max(1, hpGainBase + conMod);
  const newMaxHP = character ? character.hp.max + hpGainTotal : 0;

  const newProfBonus = calcProficiencyBonus(newLevel);
  const oldProfBonus = character?.proficiencyBonus ?? 2;
  const profChanged = newProfBonus !== oldProfBonus;

  // ── Feat ASI derived values ──
  const selectedFeat = selectedFeatId ? getFeatById(selectedFeatId) : null;
  const featAsiEffect =
    selectedFeat?.efectos.find((e) => e.type === "asi") ?? null;
  const featAsiAmount = featAsiEffect?.asiAmount ?? 0;
  const featAsiAllowedKeys = featAsiEffect?.asiChoices ?? [];
  const featAsiUsed = Object.values(featAsiChoices).reduce(
    (s, v) => s + (v ?? 0),
    0,
  );
  const featAsiComplete = featAsiAmount === 0 || featAsiUsed === featAsiAmount;

  // ── Navigation helpers ──
  const currentStep = steps[currentStepIndex] as StepDef | undefined;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // ── Build steps on open ──
  useEffect(() => {
    if (visible && character) {
      const s = getLevelUpSummary(character.clase, newLevel);
      setSummary(s);

      const buildSteps: StepDef[] = [
        { id: "summary", title: "Resumen", icon: "list-outline" },
        { id: "hp", title: "Puntos de Golpe", icon: "heart-outline" },
      ];

      if (s.hasASI) {
        buildSteps.push({
          id: "asi",
          title: "Mejora de Característica",
          icon: "trending-up-outline",
        });
      }

      if (s.spellLearning) {
        const sl = s.spellLearning;
        const hasNewSpells =
          sl.newCantrips > 0 ||
          sl.newSpellsKnown > 0 ||
          sl.newSpellbookSpells > 0 ||
          sl.canSwapSpell;
        if (hasNewSpells) {
          buildSteps.push({
            id: "spells",
            title: "Hechizos",
            icon: "sparkles-outline",
          });
        }
      }

      if (s.choosesSubclass && !character.subclase) {
        // Initial subclass selection (e.g. level 3)
        buildSteps.push({
          id: "subclass",
          title: classData?.subclassLabel ?? "Subclase",
          icon: "git-branch-outline",
        });
      } else if (character.subclase) {
        // Character already has a subclass — check if there are features at this level
        const existingOpts = getSubclassOptions(character.clase as any);
        const existingMatch = existingOpts.find(
          (o) => o.nombre === character.subclase,
        );
        if (existingMatch) {
          const subBlock = getSubclassFeaturesForLevel(
            character.clase as any,
            existingMatch.id,
            newLevel,
          );
          if (subBlock) {
            buildSteps.push({
              id: "subclass",
              title: classData?.subclassLabel ?? "Subclase",
              icon: "git-branch-outline",
            });
          }
        }
      }

      if (s.newMetamagicChoices > 0) {
        buildSteps.push({
          id: "metamagic",
          title: "Metamagia",
          icon: "flash-outline",
        });
      }

      buildSteps.push({
        id: "confirm",
        title: "Confirmar",
        icon: "checkmark-circle-outline",
      });

      setSteps(buildSteps);
      setCurrentStepIndex(0);

      // Reset all state
      setHpMethod("fixed"); // Always start with fixed; when pvFijos is on, roll is hidden
      setHpRolled(null);
      setIsRolling(false);
      setAsiPoints({ fue: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 });
      setChooseFeat(false);
      setSelectedFeatId(null);
      setFeatAsiChoices({});
      setFeatureChoices({});

      // Pre-populate subclass state if the character already has one
      if (character.subclase) {
        const existingOpts = getSubclassOptions(character.clase as any);
        const existingMatch = existingOpts.find(
          (o) => o.nombre === character.subclase,
        );
        setSubclassName(character.subclase);
        setSelectedSubclassId(existingMatch?.id ?? null);
        setIsCustomSubclass(!existingMatch);
      } else {
        setSubclassName("");
        setSelectedSubclassId(null);
        setIsCustomSubclass(false);
      }
      setIsProcessing(false);
      setNewCantrips([]);
      setNewSpells([]);
      setNewSpellbook([]);
      setSwapOldSpell("");
      setSwapNewSpell("");
      setWantsToSwap(false);
      setSpellSearch("");
      setCustomCantripName("");
      setCustomSpellName("");
      setSelectedMetamagic([]);
      setExpandedSpellIds(new Set());
    }
  }, [visible, character]);

  // ── Step transition animation ──
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStepIndex, fadeAnim, slideAnim]);

  // ── canProceed ──
  const canProceed = (): boolean => {
    if (!currentStep) return false;
    switch (currentStep.id) {
      case "summary":
        return true;
      case "hp":
        return hpMethod === "fixed" || hpRolled !== null;
      case "asi":
        // If user chose a feat instead of ASI, feat must be selected and its ASI distributed
        if (chooseFeat) return selectedFeatId !== null && featAsiComplete;
        return totalASIUsed === ASI_POINTS;
      case "spells": {
        if (!summary?.spellLearning) return true;
        const sl = summary.spellLearning;
        if (sl.newCantrips > 0 && newCantrips.length < sl.newCantrips)
          return false;
        if (sl.newSpellsKnown > 0 && newSpells.length < sl.newSpellsKnown)
          return false;
        if (
          sl.newSpellbookSpells > 0 &&
          newSpellbook.length < sl.newSpellbookSpells
        )
          return false;
        if (wantsToSwap && sl.canSwapSpell) {
          if (!swapOldSpell || !swapNewSpell) return false;
        }
        return true;
      }
      case "subclass": {
        if (subclassName.trim().length === 0) return false;
        if (selectedSubclassId && !isCustomSubclass && character) {
          const choices = getSubclassChoicesForLevel(
            character.clase as any,
            selectedSubclassId,
            newLevel,
          );
          for (const choice of choices) {
            const selected = featureChoices[choice.id] ?? [];
            const needed = choice.tipo === "multi" ? (choice.cantidad ?? 1) : 1;
            if (selected.length < needed) return false;
          }
        }
        return true;
      }
      case "metamagic":
        return summary
          ? selectedMetamagic.length === summary.newMetamagicChoices
          : false;
      case "confirm":
        return true;
      default:
        return true;
    }
  };

  // ── Navigation ──
  const goNext = () => {
    if (isLastStep) {
      handleConfirm();
    } else {
      setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }
  };

  const goBack = () => {
    if (isFirstStep) {
      onClose();
    } else {
      setCurrentStepIndex((i) => Math.max(i - 1, 0));
    }
  };

  // ── ASI handlers ──
  const incrementASI = (key: AbilityKey) => {
    if (asiRemaining <= 0) return;
    if (!character) return;
    const currentTotal = character.abilityScores[key].total + asiPoints[key];
    if (currentTotal >= MAX_ABILITY_SCORE) return;
    setAsiPoints((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const decrementASI = (key: AbilityKey) => {
    if (asiPoints[key] <= 0) return;
    setAsiPoints((prev) => ({ ...prev, [key]: prev[key] - 1 }));
  };

  // ── Feat ASI handlers ──
  const handleSelectFeat = (id: string | null) => {
    setSelectedFeatId(id);
    // Reset ASI choices when feat changes
    setFeatAsiChoices({});
  };

  const incrementFeatASI = (key: AbilityKey) => {
    if (featAsiUsed >= featAsiAmount) return;
    if (!featAsiAllowedKeys.includes(key)) return;
    if (!character) return;
    const currentTotal =
      character.abilityScores[key].total + (featAsiChoices[key] ?? 0);
    if (currentTotal >= MAX_ABILITY_SCORE) return;
    setFeatAsiChoices((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  const decrementFeatASI = (key: AbilityKey) => {
    if ((featAsiChoices[key] ?? 0) <= 0) return;
    setFeatAsiChoices((prev) => {
      const newVal = (prev[key] ?? 0) - 1;
      if (newVal <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: newVal };
    });
  };

  // ── HP handlers ──
  const rollHPDie = () => {
    if (isRolling) return;
    setIsRolling(true);
    setHpRolled(null);

    // Clear any previous interval
    if (hpRollIntervalRef.current) clearInterval(hpRollIntervalRef.current);

    let count = 0;
    const maxCount = 12;
    hpRollIntervalRef.current = setInterval(() => {
      const fakeRoll = Math.floor(Math.random() * dieSides) + 1;
      setHpRolled(fakeRoll);
      count++;
      if (count >= maxCount) {
        if (hpRollIntervalRef.current) clearInterval(hpRollIntervalRef.current);
        hpRollIntervalRef.current = null;
        const finalRoll = Math.floor(Math.random() * dieSides) + 1;
        setHpRolled(finalRoll);
        setIsRolling(false);
      }
    }, 80);
  };

  // Cleanup HP roll interval on unmount
  useEffect(() => {
    return () => {
      if (hpRollIntervalRef.current) clearInterval(hpRollIntervalRef.current);
    };
  }, []);

  // ── Confirm ──
  const handleConfirm = async () => {
    if (!character || isProcessing) return;
    setIsProcessing(true);

    try {
      const options: LevelUpOptions = {
        hpMethod,
        hpRolled: hpMethod === "roll" && hpRolled ? hpRolled : undefined,
        abilityImprovements:
          summary?.hasASI && !chooseFeat && totalASIUsed > 0
            ? Object.fromEntries(
                Object.entries(asiPoints).filter(([_, v]) => v > 0),
              )
            : undefined,
        featChosen:
          summary?.hasASI && chooseFeat && selectedFeatId
            ? selectedFeatId
            : undefined,
        featAsiChoices:
          summary?.hasASI && chooseFeat && selectedFeatId && featAsiUsed > 0
            ? Object.fromEntries(
                Object.entries(featAsiChoices).filter(([_, v]) => (v ?? 0) > 0),
              )
            : undefined,
        subclassChosen:
          summary?.choosesSubclass && !character.subclase && subclassName.trim()
            ? subclassName.trim()
            : undefined,
        subclassFeatureChoices:
          Object.keys(featureChoices).length > 0
            ? Object.entries(featureChoices).map(
                ([choiceId, selectedOptionIds]) => ({
                  choiceId,
                  selectedOptionIds,
                }),
              )
            : undefined,
        cantripsLearned: newCantrips.length > 0 ? newCantrips : undefined,
        spellsLearned: newSpells.length > 0 ? newSpells : undefined,
        spellbookAdded: newSpellbook.length > 0 ? newSpellbook : undefined,
        spellSwapped:
          wantsToSwap && swapOldSpell && swapNewSpell
            ? [swapOldSpell, swapNewSpell]
            : undefined,
        metamagicChosen:
          selectedMetamagic.length > 0 ? selectedMetamagic : undefined,
      };

      await levelUp(options);
      onComplete();
    } catch (err) {
      console.error("[LevelUpModal] Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Return all state & handlers ──
  return {
    // Core
    character,
    summary,
    classData,
    getMagicState,

    // Navigation
    steps,
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    canProceed,

    // HP
    hpMethod,
    setHpMethod,
    hpRolled,
    setHpRolled,
    isRolling,
    rollHPDie,
    dieSides,
    fixedHP,
    conMod,
    hpGainBase,
    hpGainTotal,
    newMaxHP,

    // Level / proficiency
    newLevel,
    newProfBonus,
    oldProfBonus,
    profChanged,

    // ASI
    asiPoints,
    asiRemaining,
    totalASIUsed,
    incrementASI,
    decrementASI,

    // Feats (alternative to ASI)
    dotesActivas,
    chooseFeat,
    setChooseFeat,
    selectedFeatId,
    setSelectedFeatId: handleSelectFeat,
    featAsiChoices,
    featAsiEffect,
    featAsiAmount,
    featAsiAllowedKeys,
    featAsiUsed,
    featAsiComplete,
    incrementFeatASI,
    decrementFeatASI,

    // Subclass
    subclassName,
    setSubclassName,
    selectedSubclassId,
    setSelectedSubclassId,
    isCustomSubclass,
    setIsCustomSubclass,
    featureChoices,
    setFeatureChoices,

    // Spells
    newCantrips,
    setNewCantrips,
    newSpells,
    setNewSpells,
    newSpellbook,
    setNewSpellbook,
    swapOldSpell,
    setSwapOldSpell,
    swapNewSpell,
    setSwapNewSpell,
    wantsToSwap,
    setWantsToSwap,
    spellSearch,
    setSpellSearch,
    customCantripName,
    setCustomCantripName,
    customSpellName,
    setCustomSpellName,
    expandedSpellIds,
    setExpandedSpellIds,

    // Metamagic
    selectedMetamagic,
    setSelectedMetamagic,

    // Processing & animation
    isProcessing,
    fadeAnim,
    slideAnim,
  };
}

export type LevelUpWizard = ReturnType<typeof useLevelUpWizard>;
