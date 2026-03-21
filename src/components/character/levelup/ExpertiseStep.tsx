/**
 * ExpertiseStep — Wizard step for selecting Pericia (expertise) skills.
 *
 * Shows all proficient skills that don't already have expertise,
 * letting the player pick which ones get doubled proficiency bonus.
 * Used for Pícaro (level 1/6) and Bardo (level 2/9).
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks';
import { withAlpha } from '@/utils/theme';
import { SKILLS } from '@/constants/character';
import {
  ABILITY_NAMES,
  formatModifier,
  type SkillKey,
  type Character,
} from '@/types/character';
import type { LevelUpSummary } from '@/data/srd/leveling';

// ─── Props ───────────────────────────────────────────────────────────

interface ExpertiseStepProps {
  summary: LevelUpSummary;
  character: Character;
  selectedExpertise: SkillKey[];
  setSelectedExpertise: (skills: SkillKey[]) => void;
}

// ─── Component ───────────────────────────────────────────────────────

export default function ExpertiseStep({
  summary,
  character,
  selectedExpertise,
  setSelectedExpertise,
}: ExpertiseStepProps) {
  const { colors } = useTheme();
  const required = summary.expertiseChoices;

  // Only show proficient skills that don't already have expertise
  const eligibleSkills = (Object.keys(SKILLS) as SkillKey[]).filter((sk) => {
    const prof = character.skillProficiencies[sk];
    return prof.level === 'proficient';
  });

  const handleToggle = (skill: SkillKey) => {
    if (selectedExpertise.includes(skill)) {
      setSelectedExpertise(selectedExpertise.filter((s) => s !== skill));
    } else if (selectedExpertise.length < required) {
      setSelectedExpertise([...selectedExpertise, skill]);
    }
  };

  const profBonus = character.proficiencyBonus;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: withAlpha(colors.accentRed, 0.15),
            borderWidth: 2,
            borderColor: withAlpha(colors.accentRed, 0.3),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Ionicons name="star" size={28} color={colors.accentRed} />
        </View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
          }}
        >
          Pericia
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 4,
            paddingHorizontal: 16,
          }}
        >
          Elige {required} habilidad{required !== 1 ? 'es' : ''} en las que tengas competencia.
          Tu bonificador de competencia se duplicará para ellas.
        </Text>
      </View>

      {/* Counter */}
      <View
        style={{
          alignSelf: 'center',
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 12,
          backgroundColor: withAlpha(
            selectedExpertise.length === required ? colors.accentRed : colors.textMuted,
            0.12,
          ),
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: selectedExpertise.length === required ? colors.accentRed : colors.textMuted,
          }}
        >
          {selectedExpertise.length} / {required} seleccionadas
        </Text>
      </View>

      {/* Already expertise skills (info only) */}
      {(() => {
        const existingExpertise = (Object.keys(SKILLS) as SkillKey[]).filter(
          (sk) => character.skillProficiencies[sk].level === 'expertise',
        );
        if (existingExpertise.length === 0) return null;
        return (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Ya tienes Pericia en:
            </Text>
            {existingExpertise.map((sk) => {
              const def = SKILLS[sk];
              return (
                <View
                  key={sk}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: 4,
                    borderRadius: 10,
                    backgroundColor: withAlpha(colors.accentRed, 0.08),
                    borderWidth: 1,
                    borderColor: withAlpha(colors.accentRed, 0.2),
                  }}
                >
                  <Ionicons name="star" size={16} color={colors.accentRed} />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.accentRed,
                      marginLeft: 8,
                    }}
                  >
                    {def.nombre}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    {ABILITY_NAMES[def.habilidad]}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })()}

      {/* Eligible skills */}
      {eligibleSkills.length === 0 ? (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>
            No tienes habilidades con competencia disponibles para Pericia.
          </Text>
        </View>
      ) : (
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            Habilidades disponibles
          </Text>
          {eligibleSkills.map((sk) => {
            const def = SKILLS[sk];
            const isSelected = selectedExpertise.includes(sk);
            const abilityMod = character.abilityScores[def.habilidad].modifier;
            const currentBonus = abilityMod + profBonus;
            const expertiseBonus = abilityMod + profBonus * 2;

            return (
              <TouchableOpacity
                key={sk}
                activeOpacity={0.6}
                onPress={() => handleToggle(sk)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: 6,
                  borderRadius: 12,
                  backgroundColor: isSelected
                    ? withAlpha(colors.accentRed, 0.1)
                    : colors.bgCard,
                  borderWidth: 1.5,
                  borderColor: isSelected
                    ? withAlpha(colors.accentRed, 0.4)
                    : colors.borderDefault,
                }}
              >
                {/* Selection indicator */}
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.accentRed : colors.borderDefault,
                    backgroundColor: isSelected ? colors.accentRed : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>

                {/* Skill info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: isSelected ? colors.accentRed : colors.textPrimary,
                    }}
                  >
                    {def.nombre}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    {ABILITY_NAMES[def.habilidad]}
                  </Text>
                </View>

                {/* Bonus preview */}
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: isSelected ? colors.accentRed : colors.textSecondary,
                    }}
                  >
                    {isSelected
                      ? formatModifier(expertiseBonus)
                      : formatModifier(currentBonus)}
                  </Text>
                  {isSelected && (
                    <Text style={{ fontSize: 10, color: colors.accentRed }}>
                      ×2 comp.
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
