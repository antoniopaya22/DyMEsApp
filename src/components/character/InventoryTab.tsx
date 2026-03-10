/**
 * InventoryTab - Pestaña de inventario del personaje
 * Muestra: lista de objetos, equipar/desequipar, monedas, peso,
 * formulario para añadir objetos, y transacciones de monedas.
 *
 * Sub-components extracted to src/components/inventory/:
 *   InventoryItemCard, AddItemModal, CoinTransactionModal
 */

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import { useHeaderScroll } from "@/hooks";
import { ConfirmDialog, Toast } from "@/components/ui";
import { useTheme, useDialog, useToast } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import {
  useUnidadesActuales,
  useEncumbranceDetallada,
} from "@/stores/settingsStore";
import { convertirPeso, etiquetaPeso, formatDistancia } from "@/utils/units";
import {
  ITEM_CATEGORY_NAMES,
  COIN_ABBR,
  calcCoinWeight,
  calcInventoryWeight,
  calcCarryingCapacity,
  calcEncumbrancePercentage,
  calcDetailedEncumbrance,
  calcTotalGoldValue,
  countActiveAttunements,
  type ItemCategory,
  type CoinType,
  type InventoryItem,
  type EncumbranceTier,
} from "@/types/item";

import type { ThemeColors } from "@/utils/theme";
import { COIN_ICON_COLORS, COIN_ORDER } from "@/constants/colors";

// Extracted sub-components
import {
  InventoryItemCard,
  AddItemModal,
  CoinTransactionModal,
} from "@/components/inventory";

function getCoinColors(colors: ThemeColors): Record<CoinType, string> {
  return {
    mc: colors.accentRed,
    mp: colors.accentRed,
    me: colors.accentRed,
    mo: colors.accentRed,
    mpl: colors.accentRed,
  };
}

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

// ─── Main Component ──────────────────────────────────────────────────

export default function InventoryTab() {
  const { colors } = useTheme();
  const unidades = useUnidadesActuales();
  const encumbranceDetallada = useEncumbranceDetallada();
  const { onScroll } = useHeaderScroll();
  const coinColors = useMemo(() => getCoinColors(colors), [colors]);
  const { toastProps, showInfo: showToast } = useToast();
  const { character, inventory, removeItem, toggleEquipItem, updateItem } =
    useCharacterStore();

  const [showAddItem, setShowAddItem] = useState(false);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "equipped" | ItemCategory>(
    "all",
  );
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const { dialogProps, showDestructive } = useDialog();

  if (!character || !inventory) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-base" style={{ color: colors.textSecondary }}>
          No se ha cargado el inventario
        </Text>
      </View>
    );
  }

  const strScore = character.abilityScores.fue.total;
  const totalWeight = calcInventoryWeight(inventory);
  const totalGold = calcTotalGoldValue(inventory.coins);
  const activeAttunements = countActiveAttunements(inventory.items);

  // Encumbrance calculation — simple or detailed depending on setting
  const detailed = encumbranceDetallada
    ? calcDetailedEncumbrance(totalWeight, strScore)
    : null;
  const maxCarry = calcCarryingCapacity(strScore);
  const encumbrancePct = detailed
    ? detailed.percentage
    : calcEncumbrancePercentage(totalWeight, strScore);
  const isOverweight = totalWeight > maxCarry;

  // Filter items
  const filteredItems = inventory.items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "equipped") return item.equipado;
    return item.categoria === filter;
  });

  // ── Actions ──

  const handleDeleteItem = (item: InventoryItem) => {
    showDestructive(
      "Eliminar objeto",
      `¿Eliminar "${item.nombre}" del inventario?`,
      async () => {
        await removeItem(item.id);
        setExpandedItemId(null);
        showToast(`"${item.nombre}" eliminado`);
      },
      { confirmText: "Eliminar", cancelText: "Cancelar" },
    );
  };

  const handleUpdateQuantity = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.cantidad + delta);
    if (newQty === 0) {
      handleDeleteItem(item);
      return;
    }
    await updateItem(item.id, { cantidad: newQty });
  };

  const handleToggleEquip = async (item: InventoryItem) => {
    await toggleEquipItem(item.id);
    showToast(
      item.equipado ? `${item.nombre} desequipado` : `${item.nombre} equipado`,
    );
  };

  // ── Render Sections ──

  const renderWeightBar = () => {
    // ── Detailed encumbrance mode ──
    if (detailed) {
      const tierColors: Record<EncumbranceTier, string> = {
        normal: colors.accentGreen,
        cargado: colors.accentAmber,
        muy_cargado: colors.accentDanger,
        sobrecargado: colors.accentDanger,
      };
      const tierLabels: Record<EncumbranceTier, string> = {
        normal: "Normal",
        cargado: "Cargado",
        muy_cargado: "Muy cargado",
        sobrecargado: "Sobrecargado",
      };
      const tierColor = tierColors[detailed.tier];

      // Convert thresholds to display units
      const displayWeight = convertirPeso(totalWeight, unidades).valor;
      const displayMax = convertirPeso(detailed.maxCapacity, unidades).valor;
      const displayEncThreshold = convertirPeso(
        detailed.encumberedThreshold,
        unidades,
      ).valor;
      const displayHeavyThreshold = convertirPeso(
        detailed.heavilyEncumberedThreshold,
        unidades,
      ).valor;
      const weightUnit = etiquetaPeso(unidades);

      // Marker positions as percentages on the bar
      const encPct =
        detailed.maxCapacity > 0
          ? Math.round(
              (detailed.encumberedThreshold / detailed.maxCapacity) * 100,
            )
          : 33;
      const heavyPct =
        detailed.maxCapacity > 0
          ? Math.round(
              (detailed.heavilyEncumberedThreshold / detailed.maxCapacity) *
                100,
            )
          : 67;

      return (
        <View
          className="rounded-card border p-4 mb-4"
          style={{
            backgroundColor: colors.bgElevated,
            borderColor: colors.borderDefault,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="scale-outline" size={18} color={tierColor} />
              <Text
                className="text-xs font-semibold uppercase tracking-wider ml-2"
                style={{ color: colors.textSecondary }}
              >
                Carga Detallada
              </Text>
              <View
                className="rounded-full px-2 py-0.5 ml-2"
                style={{ backgroundColor: withAlpha(tierColor, 0.2) }}
              >
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{ color: tierColor }}
                >
                  {tierLabels[detailed.tier]}
                </Text>
              </View>
            </View>
            <Text className="text-sm font-bold" style={{ color: tierColor }}>
              {displayWeight.toFixed(1)} / {displayMax} {weightUnit}
            </Text>
          </View>

          {/* Multi-segment bar */}
          <View
            className="h-3 rounded-full overflow-hidden flex-row"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            {/* Fill bar */}
            <View
              className="h-full rounded-full absolute left-0 top-0"
              style={{
                width: `${Math.min(100, detailed.percentage)}%`,
                backgroundColor: tierColor,
              }}
            />
            {/* Tier markers */}
            <View
              className="absolute top-0 h-full"
              style={{
                left: `${encPct}%`,
                width: 1.5,
                backgroundColor: withAlpha(colors.textMuted, 0.5),
              }}
            />
            <View
              className="absolute top-0 h-full"
              style={{
                left: `${heavyPct}%`,
                width: 1.5,
                backgroundColor: withAlpha(colors.textMuted, 0.5),
              }}
            />
          </View>

          {/* Threshold labels */}
          <View className="flex-row justify-between mt-1.5">
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>
              0
            </Text>
            <Text
              className="text-[10px]"
              style={{
                color:
                  detailed.tier === "normal"
                    ? colors.textMuted
                    : colors.accentAmber,
                left: `${encPct - 10}%`,
              }}
            >
              {displayEncThreshold} {weightUnit}
            </Text>
            <Text
              className="text-[10px]"
              style={{
                color:
                  detailed.tier === "muy_cargado" ||
                  detailed.tier === "sobrecargado"
                    ? colors.accentDanger
                    : colors.textMuted,
              }}
            >
              {displayHeavyThreshold} {weightUnit}
            </Text>
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>
              {displayMax} {weightUnit}
            </Text>
          </View>

          {/* Penalty info */}
          {detailed.tier === "cargado" && (
            <View className="flex-row items-center mt-2">
              <Ionicons
                name="speedometer-outline"
                size={14}
                color={colors.accentAmber}
              />
              <Text
                className="text-xs ml-1"
                style={{ color: colors.accentAmber }}
              >
                Velocidad −
                {formatDistancia(detailed.speedPenaltyFeet, unidades)}
              </Text>
            </View>
          )}
          {detailed.tier === "muy_cargado" && (
            <View className="mt-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="speedometer-outline"
                  size={14}
                  color={colors.accentDanger}
                />
                <Text
                  className="text-xs ml-1"
                  style={{ color: colors.accentDanger }}
                >
                  Velocidad −
                  {formatDistancia(detailed.speedPenaltyFeet, unidades)}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.accentDanger}
                />
                <Text
                  className="text-xs ml-1"
                  style={{ color: colors.accentDanger }}
                >
                  Desventaja en ataques, salvaciones y pruebas de FUE, DES, CON
                </Text>
              </View>
            </View>
          )}
          {detailed.tier === "sobrecargado" && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="warning" size={14} color={colors.accentDanger} />
              <Text
                className="text-xs ml-1"
                style={{ color: colors.accentDanger }}
              >
                ¡No puedes moverte! Superas tu capacidad máxima.
              </Text>
            </View>
          )}

          {/* Attunement info */}
          <View className="flex-row items-center mt-2">
            <Ionicons name="link-outline" size={14} color={colors.accentRed} />
            <Text className="text-xs ml-1" style={{ color: colors.textMuted }}>
              Sintonizaciones: {activeAttunements}/{inventory.maxAttunements}
            </Text>
          </View>
        </View>
      );
    }

    // ── Simple encumbrance mode (default) ──
    const barColor = isOverweight
      ? colors.accentDanger
      : encumbrancePct > 75
        ? colors.accentAmber
        : colors.accentRed;

    return (
      <View
        className="rounded-card border p-4 mb-4"
        style={{
          backgroundColor: colors.bgElevated,
          borderColor: colors.borderDefault,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name="scale-outline" size={18} color={barColor} />
            <Text
              className="text-xs font-semibold uppercase tracking-wider ml-2"
              style={{ color: colors.textSecondary }}
            >
              Capacidad de Carga
            </Text>
          </View>
          <Text className="text-sm font-bold" style={{ color: barColor }}>
            {convertirPeso(totalWeight, unidades).valor.toFixed(1)} /{" "}
            {convertirPeso(maxCarry, unidades).valor} {etiquetaPeso(unidades)}
          </Text>
        </View>

        <View
          className="h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.bgSecondary }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, encumbrancePct)}%`,
              backgroundColor: barColor,
            }}
          />
        </View>

        {isOverweight && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="warning" size={14} color={colors.accentDanger} />
            <Text
              className="text-xs ml-1"
              style={{ color: colors.accentDanger }}
            >
              ¡Sobrecargado! Velocidad reducida.
            </Text>
          </View>
        )}

        {/* Attunement info */}
        <View className="flex-row items-center mt-2">
          <Ionicons name="link-outline" size={14} color={colors.accentRed} />
          <Text className="text-xs ml-1" style={{ color: colors.textMuted }}>
            Sintonizaciones: {activeAttunements}/{inventory.maxAttunements}
          </Text>
        </View>
      </View>
    );
  };

  const renderCoins = () => (
    <View
      className="rounded-card border p-4 mb-4"
      style={{
        backgroundColor: colors.bgElevated,
        borderColor: colors.borderDefault,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="cash-outline" size={18} color={colors.accentRed} />
          <Text
            className="text-xs font-semibold uppercase tracking-wider ml-2"
            style={{ color: colors.textSecondary }}
          >
            Monedas
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-lg px-3 py-1.5"
          style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}
          onPress={() => setShowCoinModal(true)}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: colors.accentRed }}
          >
            Gestionar
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between mb-3">
        {COIN_ORDER.map((type) => (
          <View key={type} className="items-center flex-1">
            <View
              className="h-8 w-8 rounded-full items-center justify-center mb-0.5"
              style={{ backgroundColor: `${COIN_ICON_COLORS[type]}20` }}
            >
              <Ionicons
                name="ellipse"
                size={18}
                color={COIN_ICON_COLORS[type]}
              />
            </View>
            <Text
              className="text-lg font-bold"
              style={{ color: coinColors[type] }}
            >
              {inventory.coins[type]}
            </Text>
            <Text
              className="text-[10px] uppercase"
              style={{ color: colors.textMuted }}
            >
              {COIN_ABBR[type]}
            </Text>
          </View>
        ))}
      </View>

      <View
        className="border-t pt-2"
        style={{ borderColor: colors.borderDefault }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.textMuted }}>
            Total en oro
          </Text>
          <Text
            className="text-sm font-bold"
            style={{ color: colors.accentGold }}
          >
            {totalGold.toFixed(2)} MO
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs" style={{ color: colors.textMuted }}>
            Peso de monedas
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {convertirPeso(
              calcCoinWeight(inventory.coins),
              unidades,
            ).valor.toFixed(1)}{" "}
            {etiquetaPeso(unidades)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-3"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {[
        { key: "all" as const, label: "Todos", count: inventory.items.length },
        {
          key: "equipped" as const,
          label: "Equipado",
          count: inventory.items.filter((i) => i.equipado).length,
        },
        ...CATEGORY_OPTIONS.filter((c) =>
          inventory.items.some((i) => i.categoria === c.value),
        ).map((c) => ({
          key: c.value as ItemCategory,
          label: c.label,
          count: inventory.items.filter((i) => i.categoria === c.value).length,
        })),
      ].map((tab) => {
        const isActive = filter === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            className="rounded-full px-4 py-2 mr-2 border"
            style={{
              backgroundColor: isActive
                ? withAlpha(colors.accentRed, 0.2)
                : colors.chipBg,
              borderColor: isActive
                ? withAlpha(colors.accentRed, 0.5)
                : colors.chipBorder,
            }}
            onPress={() => setFilter(tab.key)}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: isActive ? colors.accentRed : colors.textSecondary,
              }}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderItemListHeader = () => (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: colors.textSecondary }}
        >
          Objetos ({filteredItems.length})
        </Text>
        <TouchableOpacity
          className="rounded-lg px-3 py-1.5 flex-row items-center"
          style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}
          onPress={() => setShowAddItem(true)}
        >
          <Ionicons name="add" size={16} color={colors.accentRed} />
          <Text
            className="text-xs font-semibold ml-1"
            style={{ color: colors.accentRed }}
          >
            Añadir
          </Text>
        </TouchableOpacity>
      </View>

      {renderFilterTabs()}
    </View>
  );

  const renderInventoryItem = useCallback(
    ({ item }: { item: InventoryItem }) => (
      <InventoryItemCard
        item={item}
        isExpanded={expandedItemId === item.id}
        onToggleExpand={() =>
          setExpandedItemId(expandedItemId === item.id ? null : item.id)
        }
        onToggleEquip={() => handleToggleEquip(item)}
        onUpdateQuantity={(delta) => handleUpdateQuantity(item, delta)}
        onDelete={() => handleDeleteItem(item)}
        onUpdateItem={(updates) => updateItem(item.id, updates)}
      />
    ),
    [expandedItemId, handleToggleEquip, handleDeleteItem, updateItem],
  );

  const itemKeyExtractor = useCallback((item: InventoryItem) => item.id, []);

  const ListEmptyInventory = () => (
    <View
      className="rounded-card border p-6 items-center"
      style={{
        backgroundColor: colors.bgElevated,
        borderColor: colors.borderDefault,
      }}
    >
      <Ionicons name="bag-outline" size={32} color={colors.textMuted} />
      <Text className="text-sm mt-2" style={{ color: colors.textMuted }}>
        {filter === "all"
          ? "Tu inventario está vacío"
          : "No hay objetos en esta categoría"}
      </Text>
      <TouchableOpacity
        className="mt-3 rounded-lg px-4 py-2"
        style={{ backgroundColor: colors.accentRed }}
        onPress={() => setShowAddItem(true)}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: colors.textInverted }}
        >
          Añadir objeto
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      {renderWeightBar()}
      {renderCoins()}
      {renderItemListHeader()}
    </>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={filteredItems}
        renderItem={renderInventoryItem}
        keyExtractor={itemKeyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyInventory}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
      />

      <AddItemModal
        visible={showAddItem}
        onClose={() => setShowAddItem(false)}
        onShowToast={showToast}
      />
      <CoinTransactionModal
        visible={showCoinModal}
        onClose={() => setShowCoinModal(false)}
        onShowToast={showToast}
      />

      {/* Custom dialog (replaces Alert.alert) */}
      <ConfirmDialog {...dialogProps} />

      {/* Toast notifications */}
      <Toast {...toastProps} />
    </View>
  );
}
