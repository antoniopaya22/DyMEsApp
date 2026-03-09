/**
 * LevelUpModal — wizard shell.
 *
 * All business logic lives in `useLevelUpWizard`.
 * Each wizard step is a standalone component under `./levelup/`.
 *
 * Visual chrome matches the creation-wizard design language:
 * continuous progress bar, icon-circle title, solid-color footer buttons.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";

// Hook & step components
import { useLevelUpWizard } from "./levelup/useLevelUpWizard";
import SummaryStep from "./levelup/SummaryStep";
import HPStep from "./levelup/HPStep";
import ASIStep from "./levelup/ASIStep";
import SpellsStep from "./levelup/SpellsStep";
import SubclassStep from "./levelup/SubclassStep";
import MetamagicStep from "./levelup/MetamagicStep";
import ConfirmStep from "./levelup/ConfirmStep";

// ─── Props ───────────────────────────────────────────────────────────

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────

export default function LevelUpModal({
  visible,
  onClose,
  onComplete,
}: LevelUpModalProps) {
  const { colors } = useTheme();
  const w = useLevelUpWizard(visible, onClose, onComplete);

  if (!w.character || !w.summary || w.steps.length === 0) return null;

  // ── Step dispatcher ──
  const renderStepContent = () => {
    if (!w.currentStep) return null;
    switch (w.currentStep.id) {
      case "summary":
        return (
          <SummaryStep
            summary={w.summary!}
            newLevel={w.newLevel}
            classData={w.classData}
            profChanged={w.profChanged}
            newProfBonus={w.newProfBonus}
            oldProfBonus={w.oldProfBonus}
            character={w.character!}
          />
        );
      case "hp":
        return (
          <HPStep
            hpMethod={w.hpMethod}
            setHpMethod={w.setHpMethod}
            hpRolled={w.hpRolled}
            setHpRolled={w.setHpRolled}
            isRolling={w.isRolling}
            rollHPDie={w.rollHPDie}
            dieSides={w.dieSides}
            fixedHP={w.fixedHP}
            conMod={w.conMod}
            hpGainTotal={w.hpGainTotal}
            newMaxHP={w.newMaxHP}
            character={w.character!}
            classData={w.classData}
          />
        );
      case "asi":
        return (
          <ASIStep
            asiPoints={w.asiPoints}
            asiRemaining={w.asiRemaining}
            totalASIUsed={w.totalASIUsed}
            incrementASI={w.incrementASI}
            decrementASI={w.decrementASI}
            character={w.character!}
          />
        );
      case "spells":
        return (
          <SpellsStep
            summary={w.summary!}
            character={w.character!}
            newLevel={w.newLevel}
            newCantrips={w.newCantrips}
            setNewCantrips={w.setNewCantrips}
            newSpells={w.newSpells}
            setNewSpells={w.setNewSpells}
            newSpellbook={w.newSpellbook}
            setNewSpellbook={w.setNewSpellbook}
            swapOldSpell={w.swapOldSpell}
            setSwapOldSpell={w.setSwapOldSpell}
            swapNewSpell={w.swapNewSpell}
            setSwapNewSpell={w.setSwapNewSpell}
            wantsToSwap={w.wantsToSwap}
            setWantsToSwap={w.setWantsToSwap}
            spellSearch={w.spellSearch}
            setSpellSearch={w.setSpellSearch}
            customCantripName={w.customCantripName}
            setCustomCantripName={w.setCustomCantripName}
            customSpellName={w.customSpellName}
            setCustomSpellName={w.setCustomSpellName}
            expandedSpellIds={w.expandedSpellIds}
            setExpandedSpellIds={w.setExpandedSpellIds}
            getMagicState={w.getMagicState}
          />
        );
      case "subclass":
        return (
          <SubclassStep
            summary={w.summary!}
            character={w.character!}
            newLevel={w.newLevel}
            classData={w.classData}
            subclassName={w.subclassName}
            setSubclassName={w.setSubclassName}
            selectedSubclassId={w.selectedSubclassId}
            setSelectedSubclassId={w.setSelectedSubclassId}
            isCustomSubclass={w.isCustomSubclass}
            setIsCustomSubclass={w.setIsCustomSubclass}
            featureChoices={w.featureChoices}
            setFeatureChoices={w.setFeatureChoices}
          />
        );
      case "metamagic":
        return (
          <MetamagicStep
            summary={w.summary!}
            selectedMetamagic={w.selectedMetamagic}
            setSelectedMetamagic={w.setSelectedMetamagic}
            getMagicState={w.getMagicState}
          />
        );
      case "confirm":
        return (
          <ConfirmStep
            summary={w.summary!}
            character={w.character!}
            newLevel={w.newLevel}
            classData={w.classData}
            hpMethod={w.hpMethod}
            hpRolled={w.hpRolled}
            hpGainTotal={w.hpGainTotal}
            newMaxHP={w.newMaxHP}
            conMod={w.conMod}
            fixedHP={w.fixedHP}
            profChanged={w.profChanged}
            newProfBonus={w.newProfBonus}
            oldProfBonus={w.oldProfBonus}
            asiPoints={w.asiPoints}
            totalASIUsed={w.totalASIUsed}
            subclassName={w.subclassName}
            newCantrips={w.newCantrips}
            newSpells={w.newSpells}
            newSpellbook={w.newSpellbook}
            wantsToSwap={w.wantsToSwap}
            swapOldSpell={w.swapOldSpell}
            swapNewSpell={w.swapNewSpell}
            selectedMetamagic={w.selectedMetamagic}
            selectedSubclassId={w.selectedSubclassId}
            isCustomSubclass={w.isCustomSubclass}
            featureChoices={w.featureChoices}
          />
        );
      default:
        return null;
    }
  };

  // ─── Main render ───────────────────────────────────────────────────

  const progressPercent =
    ((w.currentStepIndex + 1) / w.steps.length) * 100;
  const disabled = !w.canProceed() || w.isProcessing;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[s.root, { backgroundColor: colors.bgPrimary }]}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity
              onPress={w.goBack}
              activeOpacity={0.7}
              style={[
                s.headerBtn,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderDefault,
                },
              ]}
            >
              <Ionicons
                name={w.isFirstStep ? "close" : "arrow-back"}
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={[s.stepText, { color: colors.textSecondary }]}>
              Paso {w.currentStepIndex + 1} de {w.steps.length}
            </Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={[
                s.headerBtn,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderDefault,
                },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Continuous progress bar */}
          <View style={[s.progressBar, { backgroundColor: colors.bgInput }]}>
            <View
              style={[
                s.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: colors.accentRed,
                },
              ]}
            />
          </View>
        </View>

        {/* ── Step content (animated) ── */}
        <Animated.View
          style={[
            s.content,
            {
              opacity: w.fadeAnim,
              transform: [{ translateY: w.slideAnim }],
            },
          ]}
        >
          {/* Step title section (centered, like creation wizard) */}
          {w.currentStep && (
            <View style={s.titleSection}>
              <View
                style={[
                  s.iconCircle,
                  { backgroundColor: withAlpha(colors.accentRed, 0.15) },
                ]}
              >
                <Ionicons
                  name={w.currentStep.icon}
                  size={32}
                  color={colors.accentRed}
                />
              </View>
              <Text style={[s.title, { color: colors.textPrimary }]}>
                {w.currentStep.title}
              </Text>
              <Text style={[s.subtitle, { color: colors.textSecondary }]}>
                {w.character.nombre} · {w.classData?.nombre}
              </Text>
            </View>
          )}

          {renderStepContent()}
        </Animated.View>

        {/* ── Footer ── */}
        <View style={[s.footer, { borderTopColor: colors.borderDefault }]}>
          <View style={s.footerRow}>
            {/* Back / Cancel */}
            <TouchableOpacity
              onPress={w.goBack}
              activeOpacity={0.7}
              style={[
                s.secondaryBtn,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderDefault,
                },
              ]}
            >
              <Ionicons
                name={w.isFirstStep ? "close-outline" : "arrow-back-outline"}
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[s.secondaryBtnText, { color: colors.textSecondary }]}>
                {w.isFirstStep ? "Cancelar" : "Atrás"}
              </Text>
            </TouchableOpacity>

            {/* Next / Confirm */}
            <TouchableOpacity
              onPress={w.goNext}
              disabled={disabled}
              activeOpacity={0.8}
              style={[
                s.primaryBtn,
                {
                  backgroundColor: colors.accentRed,
                },
                disabled && {
                  backgroundColor: colors.bgSecondary,
                  opacity: 0.5,
                },
              ]}
            >
              {w.isProcessing ? (
                <>
                  <ActivityIndicator size="small" color={colors.textInverted} />
                  <Text style={[s.primaryBtnText, { color: colors.textInverted }]}>
                    Aplicando…
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[s.primaryBtnText, { color: colors.textInverted }]}>
                    {w.isLastStep ? "¡Confirmar!" : "Siguiente"}
                  </Text>
                  <Ionicons
                    name={w.isLastStep ? "checkmark-circle" : "arrow-forward"}
                    size={18}
                    color={colors.textInverted}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles (structural — colors via theme) ──────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
