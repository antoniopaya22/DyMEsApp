import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { getSpellById } from "@/data/srd/spells";
import { getSubclassFeaturesForLevel } from "@/data/srd/subclassFeatures";
import { getFeatById } from "@/data/srd/feats";
import { METAMAGIC_NAMES, type MetamagicOption } from "@/types/spell";
import {
  ABILITY_NAMES,
  ABILITY_ABBR,
  type AbilityKey,
  type AbilityScores,
  type SkillKey,
  type Character,
} from "@/types/character";
import type { LevelUpSummary } from "@/data/srd/leveling";
import { ABILITY_KEYS } from "@/constants/abilities";
import { SKILLS } from "@/constants/character";

interface ConfirmStepProps {
  summary: LevelUpSummary;
  character: Character;
  newLevel: number;
  classData: any;
  hpMethod: "fixed" | "roll";
  hpRolled: number | null;
  hpGainTotal: number;
  newMaxHP: number;
  conMod: number;
  fixedHP: number;
  profChanged: boolean;
  newProfBonus: number;
  oldProfBonus: number;
  asiPoints: Record<AbilityKey, number>;
  totalASIUsed: number;
  subclassName: string;
  newCantrips: string[];
  newSpells: string[];
  newSpellbook: string[];
  wantsToSwap: boolean;
  swapOldSpell: string;
  swapNewSpell: string;
  selectedMetamagic: string[];
  selectedSubclassId: string | null;
  isCustomSubclass: boolean;
  featureChoices: Record<string, string[]>;
  chooseFeat?: boolean;
  selectedFeatId?: string | null;
  featAsiChoices?: Partial<AbilityScores>;
  selectedExpertise?: SkillKey[];
}

export default function ConfirmStep({
  summary,
  character,
  newLevel,
  classData,
  hpMethod,
  hpRolled,
  hpGainTotal,
  newMaxHP,
  conMod,
  fixedHP,
  profChanged,
  newProfBonus,
  oldProfBonus,
  asiPoints,
  totalASIUsed,
  subclassName,
  newCantrips,
  newSpells,
  newSpellbook,
  wantsToSwap,
  swapOldSpell,
  swapNewSpell,
  selectedMetamagic,
  selectedSubclassId,
  isCustomSubclass,
  featureChoices,
  chooseFeat = false,
  selectedFeatId = null,
  featAsiChoices = {},
  selectedExpertise = [],
}: ConfirmStepProps) {
  const { colors } = useTheme();

  // Compute all changes for review
  const changes: Array<{
    icon: string;
    color: string;
    label: string;
    detail: string;
  }> = [];

  // Level
  changes.push({
    icon: "star",
    color: colors.accentRed,
    label: "Nivel",
    detail: `${character.nivel} → ${newLevel}`,
  });

  // HP
  changes.push({
    icon: "heart",
    color: colors.accentDanger,
    label: "Puntos de Golpe",
    detail: `${character.hp.max} → ${newMaxHP} (+${hpGainTotal}, ${hpMethod === "fixed" ? "fijo" : "dado"})`,
  });

  // Hit Dice
  changes.push({
    icon: "cube-outline",
    color: colors.accentRed,
    label: "Dados de Golpe",
    detail: `${character.hitDice.total}${classData?.hitDie ?? "d8"} → ${newLevel}${classData?.hitDie ?? "d8"}`,
  });

  // Proficiency
  if (profChanged) {
    changes.push({
      icon: "ribbon",
      color: colors.accentRed,
      label: "Bonificador de Competencia",
      detail: `+${oldProfBonus} → +${newProfBonus}`,
    });
  }

  // ASI or Feat
  if (summary?.hasASI) {
    if (chooseFeat && selectedFeatId) {
      const feat = getFeatById(selectedFeatId);
      const featName = feat?.nombre ?? selectedFeatId;
      const asiEntries = Object.entries(featAsiChoices).filter(
        ([_, v]) => (v ?? 0) > 0,
      );
      const asiDetail =
        asiEntries.length > 0
          ? ` (${asiEntries.map(([k, v]) => `${ABILITY_ABBR[k as AbilityKey]} +${v}`).join(", ")})`
          : "";
      changes.push({
        icon: "ribbon",
        color: colors.accentRed,
        label: "Dote",
        detail: `${featName}${asiDetail}`,
      });
    } else if (totalASIUsed > 0) {
      const asiDetails = ABILITY_KEYS.filter((k) => asiPoints[k] > 0)
        .map((k) => `${ABILITY_ABBR[k]} +${asiPoints[k]}`)
        .join(", ");
      changes.push({
        icon: "trending-up",
        color: colors.accentRed,
        label: "Mejora de Característica",
        detail: asiDetails,
      });
    }
  }

  // Subclass
  if (subclassName.trim()) {
    changes.push({
      icon: "git-branch",
      color: colors.accentRed,
      label: classData?.subclassLabel ?? "Subclase",
      detail: subclassName.trim(),
    });

    // Subclass feature choices
    if (selectedSubclassId && !isCustomSubclass && character) {
      const confirmBlock = getSubclassFeaturesForLevel(
        character.clase as any,
        selectedSubclassId,
        newLevel,
      );
      if (confirmBlock) {
        // List gained features
        const featureNames = confirmBlock.rasgos.map((r) => r.nombre);
        if (featureNames.length > 0) {
          changes.push({
            icon: "flash",
            color: colors.accentRed,
            label: "Rasgos de Subclase",
            detail: featureNames.join(", "),
          });
        }

        // List player choices
        const choiceLabels: string[] = [];
        for (const rasgo of confirmBlock.rasgos) {
          if (rasgo.elecciones) {
            for (const eleccion of rasgo.elecciones) {
              const selectedIds = featureChoices[eleccion.id] ?? [];
              const selectedNames = selectedIds.map(
                (sid) =>
                  eleccion.opciones.find((o) => o.id === sid)?.nombre ?? sid,
              );
              if (selectedNames.length > 0) {
                choiceLabels.push(selectedNames.join(", "));
              }
            }
          }
        }
        if (choiceLabels.length > 0) {
          changes.push({
            icon: "options",
            color: colors.accentRed,
            label: "Elecciones",
            detail: choiceLabels.join(" | "),
          });
        }
      }
    }
  }

  // Features
  if (summary && summary.features.length > 0) {
    changes.push({
      icon: "flash",
      color: colors.accentRed,
      label: "Nuevos Rasgos",
      detail: summary.features.map((f) => f.nombre).join(", "),
    });
  }

  // Spells learned — resolve IDs to display names
  const resolveSpellName = (id: string) =>
    getSpellById(id)?.nombre ?? id.replace(/^custom:(truco:)?/, "");

  if (newCantrips.length > 0) {
    changes.push({
      icon: "sparkles",
      color: colors.accentRed,
      label: "Trucos Nuevos",
      detail: newCantrips.map(resolveSpellName).join(", "),
    });
  }

  if (newSpells.length > 0) {
    changes.push({
      icon: "book",
      color: colors.accentRed,
      label: "Hechizos Nuevos",
      detail: newSpells.map(resolveSpellName).join(", "),
    });
  }

  if (newSpellbook.length > 0) {
    changes.push({
      icon: "document-text",
      color: colors.accentRed,
      label: "Libro de Conjuros",
      detail: `+${newSpellbook.length}: ${newSpellbook.map(resolveSpellName).join(", ")}`,
    });
  }

  if (wantsToSwap && swapOldSpell && swapNewSpell) {
    changes.push({
      icon: "swap-horizontal",
      color: colors.accentRed,
      label: "Intercambio",
      detail: `${resolveSpellName(swapOldSpell)} → ${resolveSpellName(swapNewSpell)}`,
    });
  }

  // Metamagic
  if (selectedMetamagic.length > 0) {
    changes.push({
      icon: "flash",
      color: colors.accentRed,
      label: "Metamagia",
      detail: selectedMetamagic
        .map((id) => METAMAGIC_NAMES[id as MetamagicOption] ?? id)
        .join(", "),
    });
  }

  // Expertise
  if (selectedExpertise.length > 0) {
    changes.push({
      icon: "star",
      color: colors.accentRed,
      label: "Pericia",
      detail: selectedExpertise
        .map((sk) => SKILLS[sk]?.nombre ?? sk)
        .join(", "),
    });
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: withAlpha(colors.accentRed, 0.15),
            borderWidth: 2,
            borderColor: withAlpha(colors.accentRed, 0.3),
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={32}
            color={colors.accentRed}
          />
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          ¿Todo listo?
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: "500",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Revisa los cambios antes de confirmar
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {changes.map((change, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              padding: 12,
              gap: 10,
              borderWidth: 1,
              borderColor: colors.borderDefault,
            }}
          >
            <Ionicons
              name={change.icon as any}
              size={18}
              color={change.color}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {change.label}
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 1,
                }}
              >
                {change.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
