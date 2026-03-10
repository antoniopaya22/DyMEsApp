/**
 * InventoryItemCard - Expandable inventory item card
 *
 * Shows item summary with category icon, name, badges (equipped, magic).
 * Expands to show weapon/armor/magic details, notes, stats, and action buttons.
 * For weapons, an "Edit" button opens inline editing of damage dice and properties.
 * Extracted from InventoryTab.tsx
 */

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ITEM_CATEGORY_NAMES,
  ITEM_CATEGORY_ICONS,
  WEAPON_PROPERTY_NAMES,
  type InventoryItem,
  type WeaponType,
  type WeaponProperty,
  type WeaponDetails,
} from "@/types/item";
import type { DamageType } from "@/types/character";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { useUnidadesActuales } from "@/stores/settingsStore";
import { formatPeso, formatDistancia } from "@/utils/units";

// ─── Weapon editing constants ────────────────────────────────────────

const WEAPON_TYPE_OPTIONS: { value: WeaponType; label: string }[] = [
  { value: "sencilla_cuerpo", label: "Sencilla (cuerpo)" },
  { value: "sencilla_distancia", label: "Sencilla (distancia)" },
  { value: "marcial_cuerpo", label: "Marcial (cuerpo)" },
  { value: "marcial_distancia", label: "Marcial (distancia)" },
];

const DAMAGE_TYPE_OPTIONS: { value: DamageType; label: string }[] = [
  { value: "contundente", label: "Contundente" },
  { value: "cortante", label: "Cortante" },
  { value: "perforante", label: "Perforante" },
  { value: "fuego", label: "Fuego" },
  { value: "frio", label: "Frío" },
  { value: "relampago", label: "Relámpago" },
  { value: "trueno", label: "Trueno" },
  { value: "acido", label: "Ácido" },
  { value: "veneno", label: "Veneno" },
  { value: "necrotico", label: "Necrótico" },
  { value: "radiante", label: "Radiante" },
  { value: "psiquico", label: "Psíquico" },
  { value: "fuerza", label: "Fuerza" },
];

const WEAPON_PROP_OPTIONS: { value: WeaponProperty; label: string }[] = [
  { value: "ligera", label: "Ligera" },
  { value: "pesada", label: "Pesada" },
  { value: "sutil", label: "Sutil" },
  { value: "arrojadiza", label: "Arrojadiza" },
  { value: "municion", label: "Munición" },
  { value: "alcance", label: "Alcance" },
  { value: "a_dos_manos", label: "A dos manos" },
  { value: "versatil", label: "Versátil" },
  { value: "recarga", label: "Recarga" },
  { value: "especial", label: "Especial" },
];

const COMMON_DICE = ["1d4", "1d6", "1d8", "1d10", "1d12", "2d6"];

const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  contundente: "Contundente",
  cortante: "Cortante",
  perforante: "Perforante",
  fuego: "Fuego",
  frio: "Frío",
  relampago: "Relámpago",
  trueno: "Trueno",
  acido: "Ácido",
  veneno: "Veneno",
  necrotico: "Necrótico",
  radiante: "Radiante",
  psiquico: "Psíquico",
  fuerza: "Fuerza",
};

interface InventoryItemCardProps {
  item: InventoryItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleEquip: () => void;
  onUpdateQuantity: (delta: number) => void;
  onDelete: () => void;
  onUpdateItem?: (updates: Partial<InventoryItem>) => void;
}

export function InventoryItemCard({
  item,
  isExpanded,
  onToggleExpand,
  onToggleEquip,
  onUpdateQuantity,
  onDelete,
  onUpdateItem,
}: InventoryItemCardProps) {
  const { colors } = useTheme();
  const unidades = useUnidadesActuales();

  const categoryIcon = ITEM_CATEGORY_ICONS[item.categoria] ?? "cube";
  const categoryName = ITEM_CATEGORY_NAMES[item.categoria] ?? "Otro";

  // Weapon editing state
  const [editingWeapon, setEditingWeapon] = useState(false);
  const [editWeaponType, setEditWeaponType] = useState<WeaponType>(
    item.weaponDetails?.weaponType ?? "sencilla_cuerpo",
  );
  const [editDamageDice, setEditDamageDice] = useState(
    item.weaponDetails?.damage.dice ?? "1d6",
  );
  const [editDamageType, setEditDamageType] = useState<DamageType>(
    item.weaponDetails?.damage.damageType ?? "cortante",
  );
  const [editWeaponProps, setEditWeaponProps] = useState<WeaponProperty[]>(
    item.weaponDetails?.properties ?? [],
  );

  // Bonus damage editing state
  const [editHasBonusDamage, setEditHasBonusDamage] = useState(
    !!item.weaponDetails?.bonusDamage,
  );
  const [editBonusDice, setEditBonusDice] = useState(
    item.weaponDetails?.bonusDamage?.dice ?? "1d6",
  );
  const [editBonusDamageType, setEditBonusDamageType] = useState<DamageType>(
    item.weaponDetails?.bonusDamage?.damageType ?? "fuego",
  );

  const toggleEditProp = (prop: WeaponProperty) => {
    setEditWeaponProps((prev) =>
      prev.includes(prop) ? prev.filter((p) => p !== prop) : [...prev, prop],
    );
  };

  const handleSaveWeapon = () => {
    if (!onUpdateItem) return;
    const isMelee =
      editWeaponType === "sencilla_cuerpo" ||
      editWeaponType === "marcial_cuerpo";
    const weaponDetails: WeaponDetails = {
      weaponType: editWeaponType,
      damage: {
        dice: editDamageDice.trim() || "1d6",
        damageType: editDamageType,
      },
      properties: editWeaponProps,
      melee: isMelee,
      // Preserve existing range/versatile data
      ...(item.weaponDetails?.range ? { range: item.weaponDetails.range } : {}),
      ...(item.weaponDetails?.versatileDamage
        ? { versatileDamage: item.weaponDetails.versatileDamage }
        : {}),
      ...(editHasBonusDamage
        ? {
            bonusDamage: {
              dice: editBonusDice.trim() || "1d6",
              damageType: editBonusDamageType,
            },
          }
        : {}),
    };
    onUpdateItem({ weaponDetails });
    setEditingWeapon(false);
  };

  const handleStartEditWeapon = () => {
    // Sync state to current weapon data
    if (item.weaponDetails) {
      setEditWeaponType(item.weaponDetails.weaponType);
      setEditDamageDice(item.weaponDetails.damage.dice);
      setEditDamageType(item.weaponDetails.damage.damageType);
      setEditWeaponProps([...item.weaponDetails.properties]);
      setEditHasBonusDamage(!!item.weaponDetails.bonusDamage);
      setEditBonusDice(item.weaponDetails.bonusDamage?.dice ?? "1d6");
      setEditBonusDamageType(
        item.weaponDetails.bonusDamage?.damageType ?? "fuego",
      );
    }
    setEditingWeapon(true);
  };

  const handleAddWeaponDetails = () => {
    // Initialize editing with defaults for items without weapon details
    setEditWeaponType("sencilla_cuerpo");
    setEditDamageDice("1d6");
    setEditDamageType("cortante");
    setEditWeaponProps([]);
    setEditHasBonusDamage(false);
    setEditBonusDice("1d6");
    setEditBonusDamageType("fuego");
    setEditingWeapon(true);
  };

  return (
    <TouchableOpacity
      key={item.id}
      className="rounded-card border mb-2 overflow-hidden"
      style={{
        backgroundColor: colors.bgElevated,
        borderColor: colors.borderDefault,
      }}
      onPress={onToggleExpand}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center p-3">
        {/* Category icon */}
        <View
          className="h-10 w-10 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: colors.bgSecondary }}
        >
          <Ionicons
            name={categoryIcon as any}
            size={20}
            color={colors.textSecondary}
          />
        </View>

        {/* Item info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className="text-sm font-semibold flex-1"
              style={{
                color: item.equipado ? colors.accentRed : colors.textPrimary,
              }}
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
            {item.cantidad > 1 && (
              <View
                className="rounded-full px-2 py-0.5 ml-1"
                style={{ backgroundColor: colors.chipBg }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: colors.textSecondary }}
                >
                  x{item.cantidad}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>
              {categoryName}
            </Text>
            {item.peso > 0 && (
              <Text
                className="text-[10px] ml-2"
                style={{ color: colors.textMuted }}
              >
                {formatPeso(item.peso * item.cantidad, unidades)}
              </Text>
            )}
            {item.equipado && (
              <View className="flex-row items-center ml-2">
                <Ionicons
                  name="checkmark-circle"
                  size={10}
                  color={colors.accentRed}
                />
                <Text
                  className="text-[10px] ml-0.5"
                  style={{ color: colors.accentRed }}
                >
                  Equipado
                </Text>
              </View>
            )}
            {item.magicDetails && (
              <View className="flex-row items-center ml-2">
                <Ionicons name="sparkles" size={10} color={colors.accentRed} />
                <Text
                  className="text-[10px] ml-0.5"
                  style={{ color: colors.accentRed }}
                >
                  Mágico
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Equip toggle */}
        {(item.categoria === "arma" ||
          item.categoria === "armadura" ||
          item.categoria === "escudo") && (
          <TouchableOpacity
            className="h-8 w-8 rounded-full items-center justify-center ml-2 border"
            style={{
              backgroundColor: item.equipado
                ? withAlpha(colors.accentRed, 0.2)
                : colors.bgCard,
              borderColor: item.equipado
                ? withAlpha(colors.accentRed, 0.5)
                : colors.borderDefault,
            }}
            onPress={onToggleEquip}
          >
            <Ionicons
              name={item.equipado ? "body" : "body-outline"}
              size={16}
              color={item.equipado ? colors.accentRed : colors.textMuted}
            />
          </TouchableOpacity>
        )}

        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textMuted}
          style={{ marginLeft: 8 }}
        />
      </View>

      {/* Expanded details */}
      {isExpanded && (
        <View
          className="px-3 pb-3 border-t pt-2"
          style={{ borderColor: colors.borderDefault }}
        >
          {item.descripcion && (
            <Text
              className="text-xs leading-5 mb-2"
              style={{ color: colors.textSecondary }}
            >
              {item.descripcion}
            </Text>
          )}

          {/* Weapon details */}
          {item.categoria === "arma" &&
            !editingWeapon &&
            item.weaponDetails && (
              <View
                className="rounded-lg p-2.5 mb-2"
                style={{ backgroundColor: colors.bgSecondary }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: colors.accentDanger }}
                  >
                    Datos de Arma
                  </Text>
                  {onUpdateItem && (
                    <TouchableOpacity
                      className="flex-row items-center px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.bgSecondary }}
                      onPress={handleStartEditWeapon}
                    >
                      <Ionicons
                        name="pencil"
                        size={10}
                        color={colors.accentRed}
                      />
                      <Text
                        className="text-[10px] ml-1"
                        style={{ color: colors.accentRed }}
                      >
                        Editar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Daño: {item.weaponDetails.damage.dice}{" "}
                  {DAMAGE_TYPE_LABELS[item.weaponDetails.damage.damageType] ??
                    item.weaponDetails.damage.damageType}
                </Text>
                {item.weaponDetails.versatileDamage && (
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Versátil: {item.weaponDetails.versatileDamage.dice}{" "}
                    {DAMAGE_TYPE_LABELS[
                      item.weaponDetails.versatileDamage.damageType
                    ] ?? item.weaponDetails.versatileDamage.damageType}
                  </Text>
                )}
                {item.weaponDetails.bonusDamage && (
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Bonificación: +{item.weaponDetails.bonusDamage.dice}{" "}
                    {DAMAGE_TYPE_LABELS[
                      item.weaponDetails.bonusDamage.damageType
                    ] ?? item.weaponDetails.bonusDamage.damageType}
                  </Text>
                )}
                {item.weaponDetails.range && (
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Alcance:{" "}
                    {formatDistancia(item.weaponDetails.range.normal, unidades)}
                    /{formatDistancia(item.weaponDetails.range.long, unidades)}
                  </Text>
                )}
                {item.weaponDetails.properties.length > 0 && (
                  <Text
                    className="text-xs mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Propiedades:{" "}
                    {item.weaponDetails.properties
                      .map((p) => WEAPON_PROPERTY_NAMES[p] ?? p)
                      .join(", ")}
                  </Text>
                )}
              </View>
            )}

          {/* Add weapon details button (for weapons without details) */}
          {item.categoria === "arma" &&
            !editingWeapon &&
            !item.weaponDetails &&
            onUpdateItem && (
              <TouchableOpacity
                className="flex-row items-center justify-center border rounded-lg py-2 mb-2"
                style={{
                  backgroundColor: withAlpha(colors.accentRed, 0.1),
                  borderColor: withAlpha(colors.accentRed, 0.3),
                }}
                onPress={handleAddWeaponDetails}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={14}
                  color={colors.accentRed}
                />
                <Text
                  className="text-xs font-semibold ml-1.5"
                  style={{ color: colors.accentRed }}
                >
                  Configurar datos de arma
                </Text>
              </TouchableOpacity>
            )}

          {/* Inline weapon editor */}
          {item.categoria === "arma" && editingWeapon && (
            <View
              className="rounded-lg p-3 mb-2"
              style={{
                borderWidth: 1,
                borderColor: colors.accentRed + "40",
                backgroundColor: colors.accentRed + "08",
              }}
            >
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: colors.accentRed }}
              >
                Editar Arma
              </Text>

              {/* Weapon type */}
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.textSecondary }}
              >
                Tipo
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                {WEAPON_TYPE_OPTIONS.map((opt) => {
                  const isSel = editWeaponType === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      className="rounded-full px-2.5 py-1 mr-1.5 border"
                      style={{
                        backgroundColor: isSel
                          ? withAlpha(colors.accentRed, 0.2)
                          : colors.bgSecondary,
                        borderColor: isSel
                          ? withAlpha(colors.accentRed, 0.5)
                          : colors.borderDefault,
                      }}
                      onPress={() => setEditWeaponType(opt.value)}
                    >
                      <Text
                        className="text-[10px] font-medium"
                        style={{
                          color: isSel
                            ? colors.accentRed
                            : colors.textSecondary,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Damage dice */}
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.textSecondary }}
              >
                Dados de daño
              </Text>
              <View className="flex-row items-center mb-2">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-1"
                >
                  {COMMON_DICE.map((d) => {
                    const isSel = editDamageDice === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        className="rounded-full px-2.5 py-1 mr-1.5 border"
                        style={{
                          backgroundColor: isSel
                            ? withAlpha(colors.accentRed, 0.2)
                            : colors.bgSecondary,
                          borderColor: isSel
                            ? withAlpha(colors.accentRed, 0.5)
                            : colors.borderDefault,
                        }}
                        onPress={() => setEditDamageDice(d)}
                      >
                        <Text
                          className="text-[10px] font-bold"
                          style={{
                            color: isSel
                              ? colors.accentRed
                              : colors.textSecondary,
                          }}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TextInput
                  className="rounded-lg px-2 py-1 text-[10px] border ml-1.5"
                  style={{
                    width: 56,
                    textAlign: "center",
                    backgroundColor: colors.bgInput,
                    color: colors.textPrimary,
                    borderColor: colors.borderDefault,
                  }}
                  placeholder="Otro"
                  placeholderTextColor={colors.textMuted}
                  value={
                    COMMON_DICE.includes(editDamageDice) ? "" : editDamageDice
                  }
                  onChangeText={(t) => {
                    if (t.trim()) setEditDamageDice(t.trim());
                  }}
                  maxLength={10}
                />
              </View>

              {/* Damage type */}
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.textSecondary }}
              >
                Tipo de daño
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                {DAMAGE_TYPE_OPTIONS.map((opt) => {
                  const isSel = editDamageType === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      className="rounded-full px-2.5 py-1 mr-1.5 border"
                      style={{
                        backgroundColor: isSel
                          ? withAlpha(colors.accentRed, 0.2)
                          : colors.bgSecondary,
                        borderColor: isSel
                          ? withAlpha(colors.accentRed, 0.5)
                          : colors.borderDefault,
                      }}
                      onPress={() => setEditDamageType(opt.value)}
                    >
                      <Text
                        className="text-[10px] font-medium"
                        style={{
                          color: isSel
                            ? colors.accentRed
                            : colors.textSecondary,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Properties */}
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.textSecondary }}
              >
                Propiedades
              </Text>
              <View className="flex-row flex-wrap mb-2">
                {WEAPON_PROP_OPTIONS.map((opt) => {
                  const isSel = editWeaponProps.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      className="rounded-full px-2.5 py-1 mr-1.5 mb-1.5 border"
                      style={{
                        backgroundColor: isSel
                          ? withAlpha(colors.accentRed, 0.2)
                          : colors.bgSecondary,
                        borderColor: isSel
                          ? withAlpha(colors.accentRed, 0.5)
                          : colors.borderDefault,
                      }}
                      onPress={() => toggleEditProp(opt.value)}
                    >
                      <Text
                        className="text-[10px] font-medium"
                        style={{
                          color: isSel
                            ? colors.accentRed
                            : colors.textSecondary,
                        }}
                      >
                        {isSel ? "✓ " : ""}
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bonus Damage Toggle */}
              <TouchableOpacity
                className="flex-row items-center rounded-lg px-2.5 py-1.5 mb-2 border"
                style={{
                  backgroundColor: editHasBonusDamage
                    ? withAlpha(colors.accentRed, 0.15)
                    : colors.bgSecondary,
                  borderColor: editHasBonusDamage
                    ? withAlpha(colors.accentRed, 0.4)
                    : colors.borderDefault,
                }}
                onPress={() => setEditHasBonusDamage(!editHasBonusDamage)}
              >
                <Ionicons
                  name={editHasBonusDamage ? "checkbox" : "square-outline"}
                  size={14}
                  color={
                    editHasBonusDamage ? colors.accentRed : colors.textMuted
                  }
                />
                <Text
                  className="text-[10px] font-semibold ml-1.5"
                  style={{
                    color: editHasBonusDamage
                      ? colors.accentRed
                      : colors.textSecondary,
                  }}
                >
                  Bonificador de daño adicional
                </Text>
              </TouchableOpacity>

              {/* Bonus Damage fields */}
              {editHasBonusDamage && (
                <View
                  className="rounded-lg p-2.5 mb-2"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.accentRed + "30",
                    backgroundColor: colors.accentRed + "08",
                  }}
                >
                  <Text
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Dados de bonificación
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="flex-1"
                    >
                      {COMMON_DICE.map((d) => {
                        const isSel = editBonusDice === d;
                        return (
                          <TouchableOpacity
                            key={d}
                            className="rounded-full px-2.5 py-1 mr-1.5 border"
                            style={{
                              backgroundColor: isSel
                                ? withAlpha(colors.accentRed, 0.2)
                                : colors.bgSecondary,
                              borderColor: isSel
                                ? withAlpha(colors.accentRed, 0.5)
                                : colors.borderDefault,
                            }}
                            onPress={() => setEditBonusDice(d)}
                          >
                            <Text
                              className="text-[10px] font-bold"
                              style={{
                                color: isSel
                                  ? colors.accentRed
                                  : colors.textSecondary,
                              }}
                            >
                              {d}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    <TextInput
                      className="rounded-lg px-2 py-1 text-[10px] border ml-1.5"
                      style={{
                        width: 56,
                        textAlign: "center",
                        backgroundColor: colors.bgInput,
                        color: colors.textPrimary,
                        borderColor: colors.borderDefault,
                      }}
                      placeholder="Otro"
                      placeholderTextColor={colors.textMuted}
                      value={
                        COMMON_DICE.includes(editBonusDice) ? "" : editBonusDice
                      }
                      onChangeText={(t) => {
                        if (t.trim()) setEditBonusDice(t.trim());
                      }}
                      maxLength={10}
                    />
                  </View>

                  <Text
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Tipo de daño del bonificador
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {DAMAGE_TYPE_OPTIONS.map((opt) => {
                      const isSel = editBonusDamageType === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          className="rounded-full px-2.5 py-1 mr-1.5 border"
                          style={{
                            backgroundColor: isSel
                              ? withAlpha(colors.accentRed, 0.2)
                              : colors.bgSecondary,
                            borderColor: isSel
                              ? withAlpha(colors.accentRed, 0.5)
                              : colors.borderDefault,
                          }}
                          onPress={() => setEditBonusDamageType(opt.value)}
                        >
                          <Text
                            className="text-[10px] font-medium"
                            style={{
                              color: isSel
                                ? colors.accentRed
                                : colors.textSecondary,
                            }}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Save / Cancel */}
              <View className="flex-row justify-end">
                <TouchableOpacity
                  className="px-3 py-1.5 rounded-lg mr-2"
                  onPress={() => setEditingWeapon(false)}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.textMuted }}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-1.5 rounded-lg"
                  style={{ backgroundColor: colors.accentRed }}
                  onPress={handleSaveWeapon}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: colors.textInverted }}
                  >
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Armor details */}
          {item.armorDetails && (
            <View
              className="rounded-lg p-2.5 mb-2"
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.accentRed }}
              >
                Datos de Armadura
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                CA base: {item.armorDetails.baseAC}
              </Text>
              {item.armorDetails.addDexModifier && (
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  + mod. DES
                  {item.armorDetails.maxDexBonus !== null
                    ? ` (máx. +${item.armorDetails.maxDexBonus})`
                    : ""}
                </Text>
              )}
              {item.armorDetails.strengthRequirement && (
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Requiere FUE {item.armorDetails.strengthRequirement}
                </Text>
              )}
              {item.armorDetails.stealthDisadvantage && (
                <Text
                  className="text-xs"
                  style={{ color: colors.accentDanger }}
                >
                  Desventaja en Sigilo
                </Text>
              )}
            </View>
          )}

          {/* Magic item details */}
          {item.magicDetails && (
            <View
              className="rounded-lg p-2.5 mb-2"
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.accentRed }}
              >
                Propiedades Mágicas
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Rareza: {item.magicDetails.rarity}
              </Text>
              {item.magicDetails.requiresAttunement && (
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Requiere sintonización
                  {item.magicDetails.attunementRestriction
                    ? ` (${item.magicDetails.attunementRestriction})`
                    : ""}
                </Text>
              )}
              {item.magicDetails.charges && (
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Cargas: {item.magicDetails.charges.current}/
                  {item.magicDetails.charges.max}
                </Text>
              )}
              {item.magicDetails.magicDescription && (
                <Text
                  className="text-xs mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  {item.magicDetails.magicDescription}
                </Text>
              )}
            </View>
          )}

          {/* Notes */}
          {item.notas && (
            <View
              className="rounded-lg p-2.5 mb-2"
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <Text
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.accentRed }}
              >
                Notas
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {item.notas}
              </Text>
            </View>
          )}

          {/* Item stats */}
          <View className="flex-row flex-wrap mb-2">
            {item.valor !== undefined && item.valor > 0 && (
              <View
                className="flex-row items-center rounded-lg px-2.5 py-1.5 mr-2 mb-1"
                style={{ backgroundColor: colors.chipBg }}
              >
                <Ionicons
                  name="cash-outline"
                  size={12}
                  color={colors.accentRed}
                />
                <Text
                  className="text-xs ml-1"
                  style={{ color: colors.textSecondary }}
                >
                  {item.valor} MO
                </Text>
              </View>
            )}
            <View
              className="flex-row items-center rounded-lg px-2.5 py-1.5 mr-2 mb-1"
              style={{ backgroundColor: colors.chipBg }}
            >
              <Ionicons
                name="scale-outline"
                size={12}
                color={colors.textMuted}
              />
              <Text
                className="text-xs ml-1"
                style={{ color: colors.textSecondary }}
              >
                {formatPeso(item.peso, unidades)} c/u
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View className="flex-row items-center justify-between mt-1">
            {/* Quantity controls */}
            <View className="flex-row items-center">
              <TouchableOpacity
                className="h-8 w-8 rounded-lg items-center justify-center"
                style={{ backgroundColor: colors.bgCard }}
                onPress={() => onUpdateQuantity(-1)}
              >
                <Ionicons name="remove" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              <Text
                className="text-sm font-bold mx-3 min-w-[24px] text-center"
                style={{ color: colors.textPrimary }}
              >
                {item.cantidad}
              </Text>
              <TouchableOpacity
                className="h-8 w-8 rounded-lg items-center justify-center"
                style={{ backgroundColor: colors.bgCard }}
                onPress={() => onUpdateQuantity(1)}
              >
                <Ionicons name="add" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Delete */}
            <TouchableOpacity
              className="flex-row items-center border rounded-lg px-3 py-1.5"
              style={{
                backgroundColor: withAlpha(colors.accentDanger, 0.15),
                borderColor: withAlpha(colors.accentDanger, 0.3),
              }}
              onPress={onDelete}
            >
              <Ionicons
                name="trash-outline"
                size={14}
                color={colors.accentDanger}
              />
              <Text
                className="text-xs font-semibold ml-1"
                style={{ color: colors.accentDanger }}
              >
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
