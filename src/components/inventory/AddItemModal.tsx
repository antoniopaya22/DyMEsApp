/**
 * AddItemModal - Bottom-sheet modal for adding new inventory items
 *
 * Form with name, category, quantity, weight, value, and description fields.
 * When category is "arma", shows weapon-specific fields (damage dice, type, properties).
 * Extracted from InventoryTab.tsx
 */

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import {
  ITEM_CATEGORY_ICONS,
  WEAPON_TYPE_NAMES,
  WEAPON_PROPERTY_NAMES,
  type ItemCategory,
  type WeaponType,
  type WeaponProperty,
  type WeaponDetails,
} from "@/types/item";
import type { DamageType } from "@/types/character";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { useUnidadesActuales } from "@/stores/settingsStore";
import { etiquetaPeso } from "@/utils/units";

const CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: "arma", label: "Arma" },
  { value: "armadura", label: "Armadura" },
  { value: "escudo", label: "Escudo" },
  { value: "equipo_aventurero", label: "Equipo de aventurero" },
  { value: "herramienta", label: "Herramienta" },
  { value: "consumible", label: "Consumible" },
  { value: "municion", label: "Munición" },
  { value: "objeto_magico", label: "Objeto mágico" },
  { value: "montura_vehiculo", label: "Montura / Vehículo" },
  { value: "otro", label: "Otro" },
];

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

const WEAPON_PROPERTY_OPTIONS: { value: WeaponProperty; label: string }[] = [
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

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export function AddItemModal({
  visible,
  onClose,
  onShowToast,
}: AddItemModalProps) {
  const { colors } = useTheme();
  const unidades = useUnidadesActuales();
  const { addItem } = useCharacterStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("otro");
  const [quantity, setQuantity] = useState("1");
  const [weight, setWeight] = useState("0");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  // Weapon-specific state
  const [weaponType, setWeaponType] = useState<WeaponType>("sencilla_cuerpo");
  const [damageDice, setDamageDice] = useState("1d6");
  const [damageType, setDamageType] = useState<DamageType>("cortante");
  const [weaponProps, setWeaponProps] = useState<WeaponProperty[]>([]);

  // Bonus damage state
  const [hasBonusDamage, setHasBonusDamage] = useState(false);
  const [bonusDice, setBonusDice] = useState("1d6");
  const [bonusDamageType, setBonusDamageType] = useState<DamageType>("fuego");

  const resetForm = () => {
    setName("");
    setCategory("otro");
    setQuantity("1");
    setWeight("0");
    setDescription("");
    setValue("");
    setWeaponType("sencilla_cuerpo");
    setDamageDice("1d6");
    setDamageType("cortante");
    setWeaponProps([]);
    setHasBonusDamage(false);
    setBonusDice("1d6");
    setBonusDamageType("fuego");
  };

  const toggleWeaponProp = (prop: WeaponProperty) => {
    setWeaponProps((prev) =>
      prev.includes(prop) ? prev.filter((p) => p !== prop) : [...prev, prop],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      onShowToast("Introduce un nombre para el objeto");
      return;
    }

    const qty = parseInt(quantity, 10) || 1;
    const wt = parseFloat(weight) || 0;
    const val = parseFloat(value) || undefined;

    // Build weapon details if category is "arma"
    let weaponDetails: WeaponDetails | undefined;
    if (category === "arma") {
      const isMelee =
        weaponType === "sencilla_cuerpo" || weaponType === "marcial_cuerpo";
      weaponDetails = {
        weaponType,
        damage: {
          dice: damageDice.trim() || "1d6",
          damageType,
        },
        properties: weaponProps,
        melee: isMelee,
        ...(hasBonusDamage
          ? {
              bonusDamage: {
                dice: bonusDice.trim() || "1d6",
                damageType: bonusDamageType,
              },
            }
          : {}),
      };
    }

    await addItem({
      nombre: name.trim(),
      categoria: category,
      cantidad: qty,
      peso: wt,
      valor: val,
      descripcion: description.trim() || undefined,
      equipado: false,
      custom: true,
      weaponDetails,
    });

    const itemName = name.trim();
    resetForm();
    onClose();
    onShowToast(`"${itemName}" añadido al inventario`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className="rounded-t-3xl border-t"
          style={{
            backgroundColor: colors.bgPrimary,
            borderColor: colors.borderDefault,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <Text
              className="text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Añadir Objeto
            </Text>
            <TouchableOpacity
              className="h-8 w-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.bgSecondary }}
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5 pb-8"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Card: Información básica ── */}
            <View
              className="rounded-card border p-4 mb-4"
              style={{
                backgroundColor: colors.bgElevated,
                borderColor: colors.borderDefault,
              }}
            >
              {/* Name */}
              <Text
                className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: colors.textSecondary }}
              >
                Nombre <Text style={{ color: colors.accentRed }}>*</Text>
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3 text-sm border mb-4"
                style={{
                  backgroundColor: colors.bgInput,
                  color: colors.textPrimary,
                  borderColor: colors.borderDefault,
                }}
                placeholder="Ej: Espada larga"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={100}
                autoFocus
              />

              {/* Category */}
              <Text
                className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: colors.textSecondary }}
              >
                Categoría
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORY_OPTIONS.map((opt) => {
                  const isSelected = category === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      className="rounded-full px-3.5 py-2 mr-2 border"
                      style={{
                        backgroundColor: isSelected
                          ? withAlpha(colors.accentRed, 0.2)
                          : colors.bgSecondary,
                        borderColor: isSelected
                          ? withAlpha(colors.accentRed, 0.5)
                          : colors.borderDefault,
                      }}
                      onPress={() => setCategory(opt.value)}
                    >
                      <View className="flex-row items-center">
                        <Ionicons
                          name={ITEM_CATEGORY_ICONS[opt.value] as any}
                          size={14}
                          color={
                            isSelected ? colors.accentRed : colors.textSecondary
                          }
                        />
                        <Text
                          className="text-xs font-medium ml-1.5"
                          style={{
                            color: isSelected
                              ? colors.accentRed
                              : colors.textSecondary,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Card: Detalles ── */}
            <View
              className="rounded-card border p-4 mb-4"
              style={{
                backgroundColor: colors.bgElevated,
                borderColor: colors.borderDefault,
              }}
            >
              {/* Quantity & Weight row */}
              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    Cantidad
                  </Text>
                  <TextInput
                    className="rounded-xl px-4 py-3 text-sm border"
                    style={{
                      backgroundColor: colors.bgInput,
                      color: colors.textPrimary,
                      borderColor: colors.borderDefault,
                    }}
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View className="flex-1 mx-1">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    {`Peso (${etiquetaPeso(unidades)})`}
                  </Text>
                  <TextInput
                    className="rounded-xl px-4 py-3 text-sm border"
                    style={{
                      backgroundColor: colors.bgInput,
                      color: colors.textPrimary,
                      borderColor: colors.borderDefault,
                    }}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    Valor (MO)
                  </Text>
                  <TextInput
                    className="rounded-xl px-4 py-3 text-sm border"
                    style={{
                      backgroundColor: colors.bgInput,
                      color: colors.textPrimary,
                      borderColor: colors.borderDefault,
                    }}
                    placeholder="—"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={value}
                    onChangeText={setValue}
                  />
                </View>
              </View>

              {/* Description */}
              <Text
                className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: colors.textSecondary }}
              >
                Descripción (opcional)
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3 text-sm border min-h-[80px]"
                style={{
                  backgroundColor: colors.bgInput,
                  color: colors.textPrimary,
                  borderColor: colors.borderDefault,
                }}
                placeholder="Añade una descripción..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                maxLength={500}
              />
            </View>

            {/* ── Weapon Configuration (only when category is "arma") ── */}
            {category === "arma" && (
              <View
                className="rounded-card border p-4 mb-4"
                style={{
                  borderColor: colors.accentDanger + "40",
                  backgroundColor: colors.accentDanger + "08",
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="flash-outline"
                    size={16}
                    color={colors.accentDanger}
                  />
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider ml-1.5"
                    style={{ color: colors.accentDanger }}
                  >
                    Configuración de Arma
                  </Text>
                </View>

                {/* Weapon Type */}
                <Text
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  Tipo de arma
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  {WEAPON_TYPE_OPTIONS.map((opt) => {
                    const isSelected = weaponType === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        className="rounded-full px-3 py-1.5 mr-2 border"
                        style={{
                          backgroundColor: isSelected
                            ? withAlpha(colors.accentRed, 0.2)
                            : colors.bgSecondary,
                          borderColor: isSelected
                            ? withAlpha(colors.accentRed, 0.5)
                            : colors.borderDefault,
                        }}
                        onPress={() => setWeaponType(opt.value)}
                      >
                        <Text
                          className="text-[11px] font-medium"
                          style={{
                            color: isSelected
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

                {/* Damage Dice */}
                <Text
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  Dados de daño
                </Text>
                <View className="flex-row items-center mb-3">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-1"
                  >
                    {COMMON_DICE.map((d) => {
                      const isSelected = damageDice === d;
                      return (
                        <TouchableOpacity
                          key={d}
                          className="rounded-full px-3 py-1.5 mr-2 border"
                          style={{
                            backgroundColor: isSelected
                              ? withAlpha(colors.accentRed, 0.2)
                              : colors.bgSecondary,
                            borderColor: isSelected
                              ? withAlpha(colors.accentRed, 0.5)
                              : colors.borderDefault,
                          }}
                          onPress={() => setDamageDice(d)}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{
                              color: isSelected
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
                    className="rounded-lg px-3 py-1.5 text-xs border ml-2"
                    style={{
                      width: 64,
                      textAlign: "center",
                      backgroundColor: colors.bgInput,
                      color: colors.textPrimary,
                      borderColor: colors.borderDefault,
                    }}
                    placeholder="Otro"
                    placeholderTextColor={colors.textMuted}
                    value={COMMON_DICE.includes(damageDice) ? "" : damageDice}
                    onChangeText={(t) => {
                      if (t.trim()) setDamageDice(t.trim());
                    }}
                    maxLength={10}
                  />
                </View>

                {/* Damage Type */}
                <Text
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  Tipo de daño
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  {DAMAGE_TYPE_OPTIONS.map((opt) => {
                    const isSelected = damageType === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        className="rounded-full px-3 py-1.5 mr-2 border"
                        style={{
                          backgroundColor: isSelected
                            ? withAlpha(colors.accentRed, 0.2)
                            : colors.bgSecondary,
                          borderColor: isSelected
                            ? withAlpha(colors.accentRed, 0.5)
                            : colors.borderDefault,
                        }}
                        onPress={() => setDamageType(opt.value)}
                      >
                        <Text
                          className="text-[11px] font-medium"
                          style={{
                            color: isSelected
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

                {/* Weapon Properties */}
                <Text
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  Propiedades
                </Text>
                <View className="flex-row flex-wrap">
                  {WEAPON_PROPERTY_OPTIONS.map((opt) => {
                    const isSelected = weaponProps.includes(opt.value);
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        className="rounded-full px-3 py-1.5 mr-2 mb-2 border"
                        style={{
                          backgroundColor: isSelected
                            ? withAlpha(colors.accentRed, 0.2)
                            : colors.bgSecondary,
                          borderColor: isSelected
                            ? withAlpha(colors.accentRed, 0.5)
                            : colors.borderDefault,
                        }}
                        onPress={() => toggleWeaponProp(opt.value)}
                      >
                        <Text
                          className="text-[11px] font-medium"
                          style={{
                            color: isSelected
                              ? colors.accentRed
                              : colors.textSecondary,
                          }}
                        >
                          {isSelected ? "✓ " : ""}
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Bonus Damage Toggle */}
                <TouchableOpacity
                  className="flex-row items-center rounded-lg px-3 py-2 mt-1 mb-2 border"
                  style={{
                    backgroundColor: hasBonusDamage
                      ? withAlpha(colors.accentRed, 0.15)
                      : colors.bgSecondary,
                    borderColor: hasBonusDamage
                      ? withAlpha(colors.accentRed, 0.4)
                      : colors.borderDefault,
                  }}
                  onPress={() => setHasBonusDamage(!hasBonusDamage)}
                >
                  <Ionicons
                    name={hasBonusDamage ? "checkbox" : "square-outline"}
                    size={16}
                    color={
                      hasBonusDamage ? colors.accentAmber : colors.textMuted
                    }
                  />
                  <Text
                    className="text-xs font-semibold ml-2"
                    style={{
                      color: hasBonusDamage
                        ? colors.accentAmber
                        : colors.textSecondary,
                    }}
                  >
                    Bonificador de daño adicional
                  </Text>
                </TouchableOpacity>

                {/* Bonus Damage fields */}
                {hasBonusDamage && (
                  <View
                    className="rounded-lg p-3 mb-1"
                    style={{
                      borderWidth: 1,
                      borderColor: colors.accentAmber + "30",
                      backgroundColor: colors.accentAmber + "08",
                    }}
                  >
                    {/* Bonus Dice */}
                    <Text
                      className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Dados de bonificación
                    </Text>
                    <View className="flex-row items-center mb-3">
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-1"
                      >
                        {COMMON_DICE.map((d) => {
                          const isSelected = bonusDice === d;
                          return (
                            <TouchableOpacity
                              key={d}
                              className="rounded-full px-3 py-1.5 mr-2 border"
                              style={{
                                backgroundColor: isSelected
                                  ? withAlpha(colors.accentRed, 0.2)
                                  : colors.bgSecondary,
                                borderColor: isSelected
                                  ? withAlpha(colors.accentRed, 0.5)
                                  : colors.borderDefault,
                              }}
                              onPress={() => setBonusDice(d)}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{
                                  color: isSelected
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
                        className="rounded-lg px-3 py-1.5 text-xs border ml-2"
                        style={{
                          width: 64,
                          textAlign: "center",
                          backgroundColor: colors.bgInput,
                          color: colors.textPrimary,
                          borderColor: colors.borderDefault,
                        }}
                        placeholder="Otro"
                        placeholderTextColor={colors.textMuted}
                        value={COMMON_DICE.includes(bonusDice) ? "" : bonusDice}
                        onChangeText={(t) => {
                          if (t.trim()) setBonusDice(t.trim());
                        }}
                        maxLength={10}
                      />
                    </View>

                    {/* Bonus Damage Type */}
                    <Text
                      className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Tipo de daño del bonificador
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {DAMAGE_TYPE_OPTIONS.map((opt) => {
                        const isSelected = bonusDamageType === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            className="rounded-full px-3 py-1.5 mr-2 border"
                            style={{
                              backgroundColor: isSelected
                                ? withAlpha(colors.accentRed, 0.2)
                                : colors.bgSecondary,
                              borderColor: isSelected
                                ? withAlpha(colors.accentRed, 0.5)
                                : colors.borderDefault,
                            }}
                            onPress={() => setBonusDamageType(opt.value)}
                          >
                            <Text
                              className="text-[11px] font-medium"
                              style={{
                                color: isSelected
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
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${name.trim() ? "" : "opacity-50"}`}
              style={{
                backgroundColor: name.trim()
                  ? colors.accentRed
                  : colors.bgSecondary,
              }}
              onPress={handleSubmit}
              disabled={!name.trim()}
            >
              <Text
                className="font-bold text-base"
                style={{ color: colors.textInverted }}
              >
                Añadir al Inventario
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 rounded-xl py-3 items-center"
              onPress={onClose}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: colors.textSecondary }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
