/**
 * Store de creación de personaje (wizard) con Zustand y persistencia del borrador.
 * Gestiona el estado del wizard paso a paso (HU-02) con guardado automático
 * del borrador en AsyncStorage para recuperación.
 */

import { create } from "zustand";
import { randomUUID } from "expo-crypto";
import type {
  CharacterCreationDraft,
  AbilityScores,
  AbilityScoreMethod,
  AbilityKey,
  RaceId,
  SubraceId,
  ClassId,
  BackgroundId,
  SkillKey,
  Alignment,
  Personality,
  Appearance,
  Character,
  SavingThrowProficiencies,
  Sexo,
  DamageModifier,
  DamageType,
} from "@/types/character";
import type { CustomRaceConfig, CustomBackgroundConfig } from "@/types/creation";
import { calcProficiencyBonus } from "@/types/character";
import { STORAGE_KEYS, setItem, getItem, removeItem } from "@/utils/storage";
import { getRaceData, getSubraceData, getTotalRacialBonuses, getRacialSpellsForLevel, buildRaceDataFromCustom, DRAGON_LINEAGES } from "@/data/srd/races";
import { getClassData, calcLevel1HP } from "@/data/srd/classes";
import { getBackgroundData, buildBackgroundDataFromCustom } from "@/data/srd/backgrounds";
import { createDefaultInventory } from "@/types/item";
import {
  buildAbilityScoresDetailed,
  buildSkillProficiencies,
  buildCharacterTraits,
  buildProficiencies,
  buildInitialSpells,
} from "./characterBuilderHelpers";
import { now } from "@/utils/providers";

// ─── Constantes ──────────────────────────────────────────────────────

export const TOTAL_STEPS = 11;

export const STEP_NAMES: Record<number, string> = {
  1: "Nombre",
  2: "Raza",
  3: "Clase",
  4: "Estadísticas",
  5: "Trasfondo",
  6: "Habilidades",
  7: "Hechizos",
  8: "Equipamiento",
  9: "Personalidad",
  10: "Apariencia",
  11: "Resumen",
};

export const STEP_ROUTES: Record<number, string> = {
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
  11: "summary",
};

// ─── Tipos del store ─────────────────────────────────────────────────

interface CreationState {
  /** Borrador actual de creación */
  draft: CharacterCreationDraft | null;
  /** Si se está cargando el borrador */
  loading: boolean;
  /** Mensaje de error */
  error: string | null;
  /** Si hay cambios sin guardar */
  isDirty: boolean;
}

interface CreationActions {
  // ── Gestión del borrador ──
  /** Inicia un nuevo borrador (campaignId opcional, por defecto "current") */
  startCreation: (campaignId?: string) => Promise<void>;
  /** Carga un borrador existente de AsyncStorage */
  loadDraft: (campaignId?: string) => Promise<boolean>;
  /** Guarda el borrador actual en AsyncStorage */
  saveDraft: () => Promise<void>;
  /** Elimina el borrador de creación */
  discardDraft: (campaignId?: string) => Promise<void>;
  /** Comprueba si existe un borrador */
  hasDraft: (campaignId?: string) => Promise<boolean>;

  // ── Navegación entre pasos ──
  /** Avanza al siguiente paso */
  nextStep: () => void;
  /** Retrocede al paso anterior */
  prevStep: () => void;
  /** Va a un paso específico */
  goToStep: (step: number) => void;

  // ── Setters de cada paso del wizard ──
  /** Paso 1: Nombre */
  setNombre: (nombre: string) => void;
  /** Paso 1: Sexo */
  setSexo: (sexo: Sexo) => void;
  /** Paso 2: Raza y subraza */
  setRaza: (raza: RaceId, subraza: SubraceId) => void;
  /** Paso 2: Datos de raza personalizada */
  setCustomRaceData: (data: CustomRaceConfig) => void;
  /** Paso 3: Clase */
  setClase: (clase: ClassId) => void;
  /** Paso 4: Estadísticas */
  setAbilityScoreMethod: (method: AbilityScoreMethod) => void;
  setAbilityScores: (scores: AbilityScores) => void;
  /** Paso 5: Trasfondo */
  setTrasfondo: (trasfondo: BackgroundId) => void;
  /** Paso 5: Datos de trasfondo personalizado */
  setCustomBackgroundData: (data: CustomBackgroundConfig) => void;
  /** Paso 6: Habilidades */
  setSkillChoices: (skills: SkillKey[]) => void;
  /** Paso 7: Hechizos */
  setSpellChoices: (choices: {
    cantrips: string[];
    spells: string[];
    spellbook?: string[];
  }) => void;
  /** Paso 8: Equipamiento */
  setEquipmentChoices: (choices: Record<string, string>) => void;
  /** Paso 9: Personalidad y alineamiento */
  setPersonality: (personality: Personality) => void;
  setAlineamiento: (alineamiento: Alignment) => void;
  /** Paso 10: Apariencia */
  setAppearance: (appearance: Appearance) => void;
  /** Bonificadores libres de raza (semielfo) */
  setFreeAbilityBonuses: (bonuses: AbilityKey[]) => void;
  /** Linaje dracónico (solo dracónido) */
  setDragonLineage: (lineageId: string) => void;
  /** Herramienta elegida por la raza (ej: enano) */
  setRaceToolChoice: (tool: string) => void;
  /** Truco racial elegido (ej: alto elfo) */
  setRacialCantripChoice: (spellId: string) => void;

  // ── Re-creación ──
  /** Crea un borrador pre-rellenado a partir de un personaje existente para re-creación */
  startRecreation: (character: Character) => Promise<void>;

  // ── Validación ──
  /** Valida si un paso está completo */
  isStepValid: (step: number) => boolean;
  /** Obtiene los pasos completados hasta ahora */
  getCompletedSteps: () => number[];

  // ── Construcción del personaje ──
  /** Ensambla el personaje final a partir del borrador */
  buildCharacter: () => Character | null;

  // ── Utilidades ──
  /** Limpia el estado del store */
  reset: () => void;
  /** Limpia errores */
  clearError: () => void;
}

type CreationStore = CreationState & CreationActions;

// ─── Estado inicial ──────────────────────────────────────────────────

const INITIAL_STATE: CreationState = {
  draft: null,
  loading: false,
  error: null,
  isDirty: false,
};

// ─── Store ───────────────────────────────────────────────────────────

export const useCreationStore = create<CreationStore>((set, get) => ({
  ...INITIAL_STATE,

  // ── Gestión del borrador ───────────────────────────────────────────

  startCreation: async (campaignId?: string) => {
    const draftId = campaignId ?? "current";
    const newDraft: CharacterCreationDraft = {
      currentStep: 1,
      campaignId: draftId,
      lastSaved: now(),
    };
    set({ draft: newDraft, isDirty: true, error: null });
    try {
      await setItem(STORAGE_KEYS.CREATION_DRAFT(draftId), newDraft);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[CreationStore] startCreation: ${message}`);
    }
  },

  loadDraft: async (campaignId?: string) => {
    set({ loading: true, error: null });
    try {
      const draftId = campaignId ?? "current";
      const stored = await getItem<CharacterCreationDraft>(
        STORAGE_KEYS.CREATION_DRAFT(draftId)
      );
      if (stored) {
        set({ draft: stored, loading: false, isDirty: false });
        return true;
      }
      set({ loading: false });
      return false;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el borrador";
      console.error("[CreationStore] loadDraft:", message);
      set({ error: message, loading: false });
      return false;
    }
  },

  saveDraft: async () => {
    const { draft } = get();
    if (!draft) return;

    try {
      const updatedDraft = {
        ...draft,
        lastSaved: now(),
      };
      await setItem(
        STORAGE_KEYS.CREATION_DRAFT(draft.campaignId),
        updatedDraft
      );
      set({ draft: updatedDraft, isDirty: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al guardar el borrador";
      console.error("[CreationStore] saveDraft:", message);
      set({ error: message });
    }
  },

  discardDraft: async (campaignId?: string) => {
    try {
      const draftId = campaignId ?? "current";
      await removeItem(STORAGE_KEYS.CREATION_DRAFT(draftId));
      set(INITIAL_STATE);
    } catch (err) {
      console.warn("[CreationStore] discardDraft: error al eliminar borrador");
    }
  },

  hasDraft: async (campaignId?: string) => {
    try {
      const draftId = campaignId ?? "current";
      const stored = await getItem<CharacterCreationDraft>(
        STORAGE_KEYS.CREATION_DRAFT(draftId)
      );
      return stored !== null;
    } catch {
      return false;
    }
  },

  // ── Navegación entre pasos ─────────────────────────────────────────

  nextStep: () => {
    const { draft } = get();
    if (!draft || draft.currentStep >= TOTAL_STEPS) return;
    const newDraft = { ...draft, currentStep: draft.currentStep + 1 };
    set({ draft: newDraft, isDirty: true });
  },

  prevStep: () => {
    const { draft } = get();
    if (!draft || draft.currentStep <= 1) return;
    const newDraft = { ...draft, currentStep: draft.currentStep - 1 };
    set({ draft: newDraft, isDirty: true });
  },

  goToStep: (step: number) => {
    const { draft } = get();
    if (!draft || step < 1 || step > TOTAL_STEPS) return;
    const newDraft = { ...draft, currentStep: step };
    set({ draft: newDraft, isDirty: true });
  },

  // ── Setters de cada paso ───────────────────────────────────────────

  setNombre: (nombre: string) => {
    const { draft } = get();
    if (!draft) return;
    set({ draft: { ...draft, nombre }, isDirty: true });
  },

  setSexo: (sexo: Sexo) => {
    const { draft } = get();
    if (!draft) return;
    set({ draft: { ...draft, sexo }, isDirty: true });
  },

  setRaza: (raza: RaceId, subraza: SubraceId) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: {
        ...draft,
        raza,
        subraza,
        // Limpiar elecciones que dependen de la raza
        skillChoices: undefined,
        dragonLineage: undefined,
        raceToolChoice: undefined,
        racialCantripChoice: undefined,
        // Limpiar datos custom si se elige una raza estándar
        ...(raza !== "personalizada" ? { customRaceData: undefined } : {}),
      },
      isDirty: true,
    });
  },

  setCustomRaceData: (data: CustomRaceConfig) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, customRaceData: data },
      isDirty: true,
    });
  },

  setClase: (clase: ClassId) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: {
        ...draft,
        clase,
        // Limpiar elecciones que dependen de la clase
        skillChoices: undefined,
        spellChoices: undefined,
        equipmentChoices: undefined,
      },
      isDirty: true,
    });
  },

  setAbilityScoreMethod: (method: AbilityScoreMethod) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, abilityScoreMethod: method },
      isDirty: true,
    });
  },

  setAbilityScores: (scores: AbilityScores) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, abilityScoresBase: scores },
      isDirty: true,
    });
  },

  setTrasfondo: (trasfondo: BackgroundId) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: {
        ...draft,
        trasfondo,
        // Limpiar elecciones de habilidades ya que el trasfondo otorga habilidades fijas
        skillChoices: undefined,
        // Limpiar datos custom si se cambia a un trasfondo SRD
        customBackgroundData: trasfondo === "personalizada"
          ? draft.customBackgroundData
          : undefined,
      },
      isDirty: true,
    });
  },

  setCustomBackgroundData: (data: CustomBackgroundConfig) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: {
        ...draft,
        customBackgroundData: data,
        // Limpiar skills cuando cambia el trasfondo custom
        skillChoices: undefined,
      },
      isDirty: true,
    });
  },

  setSkillChoices: (skills: SkillKey[]) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, skillChoices: skills },
      isDirty: true,
    });
  },

  setSpellChoices: (choices) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, spellChoices: choices },
      isDirty: true,
    });
  },

  setEquipmentChoices: (choices: Record<string, string>) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, equipmentChoices: choices },
      isDirty: true,
    });
  },

  setPersonality: (personality: Personality) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, personality },
      isDirty: true,
    });
  },

  setAlineamiento: (alineamiento: Alignment) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, alineamiento },
      isDirty: true,
    });
  },

  setAppearance: (appearance: Appearance) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, appearance },
      isDirty: true,
    });
  },

  setFreeAbilityBonuses: (bonuses: AbilityKey[]) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, freeAbilityBonuses: bonuses },
      isDirty: true,
    });
  },

  setDragonLineage: (lineageId: string) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, dragonLineage: lineageId },
      isDirty: true,
    });
  },

  setRaceToolChoice: (tool: string) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, raceToolChoice: tool },
      isDirty: true,
    });
  },

  setRacialCantripChoice: (spellId: string) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, racialCantripChoice: spellId },
      isDirty: true,
    });
  },

  startRecreation: async (character: Character) => {
    // Build a draft pre-populated with the character's immutable creation data.
    // Ability scores, skills, spells, and equipment are left blank so the user
    // can re-select them through the wizard starting at step 4.
    const newDraft: CharacterCreationDraft = {
      currentStep: 4, // Start at abilities step
      campaignId: character.campaignId ?? "current",

      // Pre-filled: choices the user should NOT re-make
      nombre: character.nombre,
      sexo: character.sexo,
      raza: character.raza,
      subraza: character.subraza ?? undefined,
      customRaceData: character.raza === "personalizada" ? character.customRaceData : undefined,
      clase: character.clase,
      trasfondo: character.trasfondo,
      customBackgroundData: character.trasfondo === "personalizada" ? character.customBackgroundData : undefined,
      alineamiento: character.alineamiento,
      personality: character.personality,
      appearance: character.appearance,

      // Blank: choices the user WILL re-make
      abilityScoreMethod: undefined,
      abilityScoresBase: undefined,
      skillChoices: undefined,
      spellChoices: undefined,
      equipmentChoices: undefined,
      freeAbilityBonuses: undefined,

      // Re-creation metadata
      recreatingCharacterId: character.id,
      recreatingInventoryId: character.inventoryId,

      lastSaved: now(),
    };

    set({ draft: newDraft, isDirty: true, error: null });
    try {
      await setItem(STORAGE_KEYS.CREATION_DRAFT(character.campaignId ?? "current"), newDraft);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[CreationStore] startRecreation: ${message}`);
    }
  },

  // ── Validación ─────────────────────────────────────────────────────

  isStepValid: (step: number) => {
    const { draft } = get();
    if (!draft) return false;

    switch (step) {
      case 1: // Nombre
        return !!draft.nombre && draft.nombre.trim().length >= 1 && !!draft.sexo;

      case 2: // Raza
        if (!draft.raza) return false;
        if (draft.raza === "personalizada") {
          // Custom race needs at least a name
          return !!draft.customRaceData && draft.customRaceData.nombre.trim().length >= 1;
        }
        const raceData = getRaceData(draft.raza);
        // Si la raza tiene subrazas, una debe estar seleccionada
        if (raceData.subraces.length > 0 && !draft.subraza) return false;
        return true;

      case 3: // Clase
        return !!draft.clase;

      case 4: // Estadísticas
        if (!draft.abilityScoreMethod || !draft.abilityScoresBase) return false;
        const scores = draft.abilityScoresBase;
        // Todas las puntuaciones deben ser al menos 1
        return (
          scores.fue >= 1 &&
          scores.des >= 1 &&
          scores.con >= 1 &&
          scores.int >= 1 &&
          scores.sab >= 1 &&
          scores.car >= 1
        );

      case 5: // Trasfondo
        if (!draft.trasfondo) return false;
        if (draft.trasfondo === "personalizada") {
          return !!draft.customBackgroundData && draft.customBackgroundData.nombre.trim().length >= 1;
        }
        return true;

      case 6: // Habilidades
        return !!draft.skillChoices && draft.skillChoices.length > 0;

      case 7: // Hechizos (puede ser válido sin hechizos si la clase no lanza conjuros)
        if (!draft.clase) return false;
        const classData = getClassData(draft.clase);
        if (classData.casterType === "none") return true;
        // Half-casters sin conjuros a nivel 1 (explorador, paladín)
        if (classData.cantripsAtLevel1 === 0 && classData.spellsAtLevel1 === 0) return true;
        return !!draft.spellChoices;

      case 8: // Equipamiento
        return !!draft.equipmentChoices;

      case 9: // Personalidad (opcional)
        return true;

      case 10: // Apariencia (opcional, siempre válido)
        return true;

      case 11: // Resumen (válido si todos los pasos anteriores son válidos)
        // Check steps 1-9 directly to avoid circular recursion with getCompletedSteps
        for (let s = 1; s <= 9; s++) {
          if (!get().isStepValid(s)) return false;
        }
        return true;

      default:
        return false;
    }
  },

  getCompletedSteps: () => {
    const { isStepValid } = get();
    const completed: number[] = [];
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (isStepValid(i)) {
        completed.push(i);
      }
    }
    return completed;
  },

  // ── Construcción del personaje ─────────────────────────────────────

  buildCharacter: () => {
    const { draft } = get();
    if (!draft) return null;

    if (
      !draft.nombre ||
      !draft.raza ||
      !draft.clase ||
      !draft.abilityScoresBase ||
      !draft.trasfondo
    ) {
      return null;
    }

    const characterId = draft.recreatingCharacterId ?? randomUUID();
    const inventoryId = draft.recreatingInventoryId ?? randomUUID();
    const timestamp = now();

    const raceData = draft.raza === "personalizada" && draft.customRaceData
      ? buildRaceDataFromCustom(draft.customRaceData)
      : getRaceData(draft.raza);
    const subraceData = draft.subraza
      ? getSubraceData(draft.raza, draft.subraza)
      : null;
    const classData = getClassData(draft.clase);
    const backgroundData = draft.trasfondo === "personalizada" && draft.customBackgroundData
      ? buildBackgroundDataFromCustom(draft.customBackgroundData)
      : getBackgroundData(draft.trasfondo);

    // ── Puntuaciones de característica ──
    const racialBonuses = draft.raza === "personalizada" && draft.customRaceData
      ? draft.customRaceData.abilityBonuses
      : getTotalRacialBonuses(draft.raza, draft.subraza ?? null);
    const abilityScores = buildAbilityScoresDetailed(
      draft.abilityScoresBase,
      racialBonuses,
      draft.freeAbilityBonuses,
    );

    // ── Competencias de habilidades ──
    const skillProficiencies = buildSkillProficiencies({
      backgroundSkills: backgroundData.skillProficiencies,
      raceSkills: raceData.skillProficiencies,
      playerChoices: draft.skillChoices,
    });

    // ── Tiradas de salvación ──
    const abilityKeys: AbilityKey[] = ["fue", "des", "con", "int", "sab", "car"];
    const savingThrows = {} as SavingThrowProficiencies;
    for (const key of abilityKeys) {
      savingThrows[key] = {
        proficient: classData.savingThrows.includes(key),
        source: classData.savingThrows.includes(key) ? "clase" : undefined,
      };
    }

    // ── Puntos de golpe ──
    const conMod = abilityScores.con.modifier;
    const hpBonusPerLevel = subraceData?.hpBonusPerLevel ?? 0;
    const maxHP = calcLevel1HP(draft.clase, conMod) + hpBonusPerLevel;

    // ── Competencias generales ──
    const proficiencies = buildProficiencies({
      classArmors: classData.armorProficiencies,
      classWeapons: classData.weaponProficiencies,
      classTools: classData.toolProficiencies,
      raceWeapons: raceData.weaponProficiencies,
      raceArmors: raceData.armorProficiencies,
      raceTools: raceData.toolProficiencies,
      raceLanguages: raceData.languages,
      subraceWeapons: subraceData?.weaponProficiencies,
      subraceArmors: subraceData?.armorProficiencies,
      subraceTools: subraceData?.toolProficiencies,
      backgroundTools: backgroundData.toolProficiencies,
      raceToolChoice: draft.raceToolChoice,
    });

    // ── Rasgos ──
    const traits = buildCharacterTraits({
      raceTraits: raceData.traits,
      subraceTraits: subraceData?.traits,
      classLevel1Features: classData.level1Features,
      backgroundFeatureName: backgroundData.featureName,
      backgroundFeatureDescription: backgroundData.featureDescription,
    });

    // ── Personalidad y apariencia ──
    const personality: Personality = draft.personality ?? {
      traits: [],
      ideals: "",
      bonds: "",
      flaws: "",
    };
    const appearance: Appearance = draft.appearance ?? {};

    // ── Resistencias al daño (raciales) ──
    const damageModifiers: DamageModifier[] = [];
    if (draft.raza === "personalizada" && draft.customRaceData?.damageResistances) {
      for (const type of draft.customRaceData.damageResistances) {
        damageModifiers.push({
          type,
          modifier: "resistance" as const,
          source: draft.customRaceData.nombre || "Raza personalizada",
        });
      }
    } else {
      // Resistencias SRD
      if (draft.raza === "enano") {
        damageModifiers.push({ type: "veneno", modifier: "resistance", source: raceData.nombre });
      }
      if (draft.raza === "tiefling") {
        damageModifiers.push({ type: "fuego", modifier: "resistance", source: raceData.nombre });
      }
      if (draft.subraza === "mediano_fornido") {
        damageModifiers.push({ type: "veneno", modifier: "resistance", source: subraceData!.nombre });
      }
      if (draft.raza === "draconido" && draft.dragonLineage) {
        const lineage = DRAGON_LINEAGES.find(l => l.id === draft.dragonLineage);
        if (lineage) {
          const damageTypeId = lineage.damageType
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") as DamageType;
          damageModifiers.push({
            type: damageTypeId,
            modifier: "resistance",
            source: `Linaje Dracónico (${lineage.dragon})`,
          });
        }
      }
    }

    // ── Visión en la oscuridad ──
    const darkvision = draft.raza === "personalizada"
      ? (draft.customRaceData?.darkvision ? 60 : 0)
      : raceData.darkvision
        ? (subraceData?.darkvisionOverride ?? raceData.darkvisionRange ?? 60)
        : 0;

    // ── Hechizos ──
    const racialSpellsLv1 = draft.raza === "personalizada" && draft.customRaceData?.racialSpells
      ? draft.customRaceData.racialSpells
          .filter((s) => s.minLevel <= 1)
          .map((s) => s.nombre.toLowerCase().replace(/\s+/g, "_"))
      : draft.raza !== "personalizada"
        ? getRacialSpellsForLevel(
            draft.raza,
            draft.subraza ?? null,
            1,
          ).map((s) => s.spellId)
        : [];

    const { knownSpellIds, preparedSpellIds, spellbookIds } = buildInitialSpells(
      draft.spellChoices,
      draft.clase,
      racialSpellsLv1,
    );

    // ── Historial de nivel ──
    const levelHistory: Character["levelHistory"] = [
      {
        level: 1,
        date: timestamp,
        hpGained: maxHP,
        hpMethod: "fixed",
        spellsLearned: knownSpellIds.length > 0 ? [...knownSpellIds] : undefined,
      },
    ];

    // ── Ensamblar personaje ──
    const character: Character = {
      id: characterId,
      campaignId: draft.campaignId === "current" ? undefined : draft.campaignId,
      nombre: draft.nombre.trim(),
      sexo: draft.sexo,
      raza: draft.raza,
      subraza: draft.subraza ?? null,
      customRaceName: draft.raza === "personalizada" ? draft.customRaceData?.nombre?.trim() : undefined,
      customRaceData: draft.raza === "personalizada" ? draft.customRaceData : undefined,
      clase: draft.clase,
      customBackgroundName: draft.trasfondo === "personalizada" ? draft.customBackgroundData?.nombre?.trim() : undefined,
      customBackgroundData: draft.trasfondo === "personalizada" ? draft.customBackgroundData : undefined,
      subclase: null,
      nivel: 1,
      experiencia: 0,
      trasfondo: draft.trasfondo,
      alineamiento: draft.alineamiento ?? "neutral",
      abilityScores,
      skillProficiencies,
      savingThrows,
      hp: { max: maxHP, current: maxHP, temp: 0 },
      hitDice: { die: classData.hitDie, total: 1, remaining: 1 },
      deathSaves: { successes: 0, failures: 0 },
      speed: {
        walk: subraceData?.speedOverride ?? raceData.speed,
        ...(raceData.flySpeed ? { fly: raceData.flySpeed } : {}),
        ...(raceData.swimSpeed ? { swim: raceData.swimSpeed } : {}),
        ...(raceData.climbSpeed ? { climb: raceData.climbSpeed } : {}),
      },
      darkvision,
      dragonLineage: draft.dragonLineage,
      damageModifiers,
      conditions: [],
      concentration: null,
      proficiencies,
      proficiencyBonus: calcProficiencyBonus(1),
      traits,
      personality,
      appearance,
      levelHistory,
      knownSpellIds,
      preparedSpellIds,
      spellbookIds,
      inventoryId,
      creadoEn: timestamp,
      actualizadoEn: timestamp,
    };

    return character;
  },

  // ── Utilidades ─────────────────────────────────────────────────────

  reset: () => {
    set(INITIAL_STATE);
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ─── Funciones auxiliares exportadas ─────────────────────────────────

/**
 * Calcula las puntuaciones totales (base + racial + free bonuses) para previsualización.
 */
export function calcTotalScoresPreview(
  baseScores: AbilityScores,
  raceId: RaceId,
  subraceId: SubraceId,
  freeAbilityBonuses?: AbilityKey[],
  customBonuses?: Partial<Record<AbilityKey, number>>,
): AbilityScores {
  const racialBonuses = raceId === "personalizada" && customBonuses
    ? customBonuses
    : getTotalRacialBonuses(raceId, subraceId ?? null);

  // Compute free bonuses (e.g. semi-elf picks 2 × +1)
  const freeBonuses: Partial<Record<AbilityKey, number>> = {};
  if (freeAbilityBonuses && freeAbilityBonuses.length > 0) {
    for (const key of freeAbilityBonuses) {
      freeBonuses[key] = (freeBonuses[key] ?? 0) + 1;
    }
  }

  return {
    fue: baseScores.fue + (racialBonuses.fue ?? 0) + (freeBonuses.fue ?? 0),
    des: baseScores.des + (racialBonuses.des ?? 0) + (freeBonuses.des ?? 0),
    con: baseScores.con + (racialBonuses.con ?? 0) + (freeBonuses.con ?? 0),
    int: baseScores.int + (racialBonuses.int ?? 0) + (freeBonuses.int ?? 0),
    sab: baseScores.sab + (racialBonuses.sab ?? 0) + (freeBonuses.sab ?? 0),
    car: baseScores.car + (racialBonuses.car ?? 0) + (freeBonuses.car ?? 0),
  };
}

/**
 * Obtiene todas las habilidades ya otorgadas por raza y trasfondo
 * (para excluirlas de las opciones de clase).
 */
export function getGrantedSkills(
  raceId: RaceId | undefined,
  trasfondoId: BackgroundId | undefined,
  customBackgroundData?: CustomBackgroundConfig,
): SkillKey[] {
  const granted: SkillKey[] = [];

  if (raceId) {
    const raceData = getRaceData(raceId);
    if (raceData.skillProficiencies) {
      granted.push(...raceData.skillProficiencies);
    }
  }

  if (trasfondoId) {
    if (trasfondoId === "personalizada" && customBackgroundData) {
      granted.push(...customBackgroundData.skillProficiencies);
    } else {
      const bgData = getBackgroundData(trasfondoId);
      granted.push(...bgData.skillProficiencies);
    }
  }

  return [...new Set(granted)];
}

/**
 * Obtiene las habilidades disponibles para elegir de la clase,
 * excluyendo las ya otorgadas por raza y trasfondo.
 */
export function getAvailableClassSkills(
  classId: ClassId,
  raceId: RaceId | undefined,
  trasfondoId: BackgroundId | undefined,
  customBackgroundData?: CustomBackgroundConfig,
): SkillKey[] {
  const classData = getClassData(classId);
  const granted = getGrantedSkills(raceId, trasfondoId, customBackgroundData);

  // Combinar pool de clase + pool de raza (ej: semielfo puede elegir de las 18)
  const pool = new Set<SkillKey>(classData.skillChoicePool);
  if (raceId && raceId !== "personalizada") {
    const raceData = getRaceData(raceId);
    if (raceData.skillChoicePool) {
      for (const skill of raceData.skillChoicePool) {
        pool.add(skill);
      }
    }
  }

  return [...pool].filter(
    (skill) => !granted.includes(skill)
  );
}

/**
 * Devuelve cuántas habilidades debe elegir el jugador en total
 * (clase + raza si aplica, como semielfo).
 */
export function getRequiredSkillCount(
  classId: ClassId | undefined,
  raceId: RaceId | undefined
): number {
  let count = 0;

  if (classId) {
    const classData = getClassData(classId);
    count += classData.skillChoiceCount;
  }

  if (raceId) {
    const raceData = getRaceData(raceId);
    if (raceData.skillChoiceCount) {
      count += raceData.skillChoiceCount;
    }
  }

  return count;
}

// ─── Standalone helpers for cross-store usage ────────────────────────

/**
 * Removes the creation draft for a given campaign.
 * Exposed as a standalone function so other stores (e.g. campaignStore)
 * can delete a draft without coupling to STORAGE_KEYS.CREATION_DRAFT.
 */
export async function deleteCreationDraft(campaignId?: string): Promise<void> {
  try {
    await removeItem(STORAGE_KEYS.CREATION_DRAFT(campaignId));
  } catch {
    // Draft may not exist — safe to ignore
  }
}
