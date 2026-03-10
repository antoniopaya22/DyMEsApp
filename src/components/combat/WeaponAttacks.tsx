/**
 * WeaponAttacks - Equipped weapons section for the Combat tab.
 *
 * Shows all equipped weapons with their attack bonus and damage formula.
 * Tapping attack/damage opens a confirm dialog, then shows the roll result.
 */

import { createElement, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import { useTheme, useDialog } from "@/hooks";
import {
  getEquippedWeapons,
  calcWeaponAttackBonus,
  calcWeaponDamageModifier,
  formatWeaponDamage,
} from "@/utils/inventory";
import { WEAPON_PROPERTY_NAMES } from "@/constants/items";
import { ConfirmDialog } from "@/components/ui";
import { rollD20, parseFormula, executeFormula } from "@/utils/dice";
import { formatModifier } from "@/utils/character";
import type { InventoryItem, WeaponDetails } from "@/types/item";

// ─── Helpers ─────────────────────────────────────────────────────────

/** Check if character is proficient with a weapon based on proficiencies list */
function isWeaponProficient(
  weapon: WeaponDetails,
  weaponName: string,
  proficiencies: string[],
): boolean {
  const lowerName = weaponName.toLowerCase();
  const lowerProfs = proficiencies.map((p) => p.toLowerCase());

  // Direct name match
  if (lowerProfs.some((p) => lowerName.includes(p) || p.includes(lowerName))) {
    return true;
  }

  // Category-based check
  const { weaponType } = weapon;
  if (
    (weaponType === "sencilla_cuerpo" || weaponType === "sencilla_distancia") &&
    lowerProfs.some((p) => p.includes("sencilla"))
  ) {
    return true;
  }
  if (
    (weaponType === "marcial_cuerpo" || weaponType === "marcial_distancia") &&
    lowerProfs.some((p) => p.includes("marcial"))
  ) {
    return true;
  }

  return false;
}

// ─── Component ───────────────────────────────────────────────────────

export function WeaponAttacks() {
  const { colors } = useTheme();
  const { character, inventory } = useCharacterStore();
  const { dialogProps, showDialog } = useDialog();

  if (!character || !inventory) return null;

  const equippedWeapons = getEquippedWeapons(inventory.items);
  if (equippedWeapons.length === 0) return null;

  const strMod = character.abilityScores.fue.modifier;
  const dexMod = character.abilityScores.des.modifier;
  const profBonus = character.proficiencyBonus;
  const weaponProfs = character.proficiencies.weapons;

  const handleAttackRoll = (weapon: InventoryItem) => {
    if (!weapon.weaponDetails) return;

    const wd = weapon.weaponDetails;
    const isProficient = isWeaponProficient(wd, weapon.nombre, weaponProfs);
    const attackBonus = calcWeaponAttackBonus(
      wd,
      strMod,
      dexMod,
      profBonus,
      isProficient,
    );
    const modStr = formatModifier(attackBonus);

    showDialog({
      type: "confirm",
      title: `Ataque: ${weapon.nombre}`,
      message: `¿Tirar 1d20 ${modStr}?`,
      icon: "dice-outline",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "🎲 Tirar",
          style: "default",
          onPress: () => {
            const result = rollD20(attackBonus);
            const dieValue = result.rolls[0].value;
            let emoji = "";
            let extra = "";
            if (result.isCritical) {
              emoji = " ✨";
              extra = "\n\n¡CRÍTICO NATURAL!";
            } else if (result.isFumble) {
              emoji = " 💀";
              extra = "\n\n¡PIFIA!";
            }
            setTimeout(() => {
              showDialog({
                type: result.isCritical
                  ? "success"
                  : result.isFumble
                    ? "danger"
                    : "info",
                title: `Ataque: ${weapon.nombre}${emoji}`,
                message: `🎲 d20 [${dieValue}] ${modStr} = ${result.total}${extra}`,
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
                  String(result.total),
                ),
              });
            }, 350);
          },
        },
      ],
    });
  };

  const handleDamageRoll = (weapon: InventoryItem) => {
    if (!weapon.weaponDetails) return;

    const wd = weapon.weaponDetails;
    const damageMod = calcWeaponDamageModifier(wd, strMod, dexMod);
    const damageStr = formatWeaponDamage(wd.damage, damageMod, wd.bonusDamage);

    showDialog({
      type: "confirm",
      title: `Daño: ${weapon.nombre}`,
      message: `¿Tirar ${damageStr}?`,
      icon: "flame-outline",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "🎲 Tirar",
          style: "default",
          onPress: () => {
            // Roll main damage
            const mainParsed = parseFormula(wd.damage.dice);
            if (!mainParsed) return;
            const mainResult = executeFormula(mainParsed, "normal", damageMod);
            const mainDice = mainResult.rolls.map((r) => r.value).join(", ");
            const mainModStr =
              damageMod !== 0
                ? damageMod > 0
                  ? ` +${damageMod}`
                  : ` ${damageMod}`
                : "";

            let totalDamage = mainResult.total;
            let resultMsg = `🎲 ${wd.damage.dice}${mainModStr} → [${mainDice}]${mainModStr} = ${mainResult.total} ${wd.damage.damageType}`;

            // Roll bonus damage separately if present
            if (wd.bonusDamage) {
              const bonusParsed = parseFormula(wd.bonusDamage.dice);
              if (bonusParsed) {
                const bonusResult = executeFormula(bonusParsed, "normal", 0);
                const bonusDice = bonusResult.rolls
                  .map((r) => r.value)
                  .join(", ");
                totalDamage += bonusResult.total;
                resultMsg += `\n🎲 +${wd.bonusDamage.dice} → [${bonusDice}] = ${bonusResult.total} ${wd.bonusDamage.damageType}`;
              }
            }

            setTimeout(() => {
              showDialog({
                type: "info",
                title: `Daño: ${weapon.nombre}`,
                message: `${resultMsg}\n\nTotal: ${totalDamage}`,
                buttons: [{ text: "OK", style: "default" }],
                customIconContent: createElement(
                  Text,
                  {
                    style: {
                      fontSize: 28,
                      fontWeight: "bold" as const,
                      color: colors.accentDanger,
                    },
                  },
                  String(totalDamage),
                ),
              });
            }, 350);
          },
        },
      ],
    });
  };

  return (
    <>
      <View
        className="rounded-card border p-4 mb-4"
        style={{
          backgroundColor: colors.bgElevated,
          borderColor: colors.borderDefault,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Ionicons
            name="flash-outline"
            size={20}
            color={colors.accentDanger}
          />
          <Text
            className="text-xs font-semibold uppercase tracking-wider ml-2"
            style={{ color: colors.textSecondary }}
          >
            Ataques
          </Text>
        </View>

        {/* Weapon list */}
        {equippedWeapons.map((weapon) => {
          if (!weapon.weaponDetails) return null;
          const wd = weapon.weaponDetails;
          const isProficient = isWeaponProficient(
            wd,
            weapon.nombre,
            weaponProfs,
          );
          const attackBonus = calcWeaponAttackBonus(
            wd,
            strMod,
            dexMod,
            profBonus,
            isProficient,
          );
          const damageMod = calcWeaponDamageModifier(wd, strMod, dexMod);
          const damageStr = formatWeaponDamage(
            wd.damage,
            damageMod,
            wd.bonusDamage,
          );

          // Properties summary
          const props = wd.properties
            .map((p) => WEAPON_PROPERTY_NAMES[p])
            .join(", ");

          return (
            <View
              key={weapon.id}
              className="mb-2"
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                backgroundColor: colors.bgCard,
                overflow: "hidden",
              }}
            >
              {/* Weapon name row */}
              <View
                className="flex-row items-center px-3 py-2"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderSubtle,
                }}
              >
                <Ionicons
                  name={wd.melee ? "hand-left-outline" : "locate-outline"}
                  size={16}
                  color={colors.accentDanger}
                />
                <Text
                  className="flex-1 ml-2 font-semibold text-sm"
                  style={{ color: colors.textPrimary }}
                  numberOfLines={1}
                >
                  {weapon.nombre}
                </Text>
                {props.length > 0 && (
                  <Text
                    className="text-[10px]"
                    style={{ color: colors.textMuted }}
                    numberOfLines={1}
                  >
                    {props}
                  </Text>
                )}
              </View>

              {/* Attack & Damage buttons */}
              <View className="flex-row">
                {/* Attack roll button */}
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2.5 active:opacity-70"
                  style={{
                    borderRightWidth: 1,
                    borderRightColor: colors.borderSubtle,
                  }}
                  onPress={() => handleAttackRoll(weapon)}
                >
                  <Ionicons
                    name="dice-outline"
                    size={14}
                    color={colors.accentRed}
                  />
                  <Text
                    className="ml-1.5 text-xs font-bold"
                    style={{ color: colors.accentRed }}
                  >
                    Ataque {formatModifier(attackBonus)}
                  </Text>
                </TouchableOpacity>

                {/* Damage roll button */}
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2.5 active:opacity-70"
                  onPress={() => handleDamageRoll(weapon)}
                >
                  <Ionicons
                    name="flame-outline"
                    size={14}
                    color={colors.accentDanger}
                  />
                  <Text
                    className="ml-1.5 text-xs font-bold"
                    style={{ color: colors.accentDanger }}
                  >
                    {damageStr}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Custom dialog for roll confirmations & results */}
      <ConfirmDialog {...dialogProps} />
    </>
  );
}
