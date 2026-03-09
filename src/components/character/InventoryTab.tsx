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
  ITEM_CATEGORY_NAMES,
  COIN_ABBR,
  calcCoinWeight,
  calcInventoryWeight,
  calcCarryingCapacity,
  calcEncumbrancePercentage,
  calcTotalGoldValue,
  countActiveAttunements,
  type ItemCategory,
  type CoinType,
  type InventoryItem,
} from "@/types/item";

import type { ThemeColors } from "@/utils/theme";

// Extracted sub-components
import {
  InventoryItemCard,
  AddItemModal,
  CoinTransactionModal,
} from "@/components/inventory";

// ─── Helpers ─────────────────────────────────────────────────────────

const COIN_ORDER: CoinType[] = ["mpl", "mo", "me", "mp", "mc"];

/** Metallic colors for coin icons (theme-independent) */
const COIN_ICON_COLORS: Record<CoinType, string> = {
  mc: "#B87333",   // copper
  mp: "#C0C0C0",   // silver
  me: "#5B8DBE",   // electrum (blue-silver)
  mo: "#FFD700",   // gold
  mpl: "#E5E4E2",  // platinum
};

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
  const { onScroll } = useHeaderScroll();
  const coinColors = useMemo(() => getCoinColors(colors), [colors]);
  const { toastProps, showInfo: showToast } = useToast();
  const {
    character,
    inventory,
    removeItem,
    toggleEquipItem,
    updateItem,
  } = useCharacterStore();

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
  const maxCarry = calcCarryingCapacity(strScore);
  const encumbrancePct = calcEncumbrancePercentage(totalWeight, strScore);
  const isOverweight = totalWeight > maxCarry;
  const totalGold = calcTotalGoldValue(inventory.coins);
  const activeAttunements = countActiveAttunements(inventory.items);

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
      item.equipado
        ? `${item.nombre} desequipado`
        : `${item.nombre} equipado`,
    );
  };

  // ── Render Sections ──

  const renderWeightBar = () => {
    const barColor = isOverweight
      ? colors.accentDanger
      : encumbrancePct > 75
        ? colors.accentAmber
        : colors.accentRed;

    return (
      <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name="scale-outline" size={18} color={barColor} />
            <Text className="text-xs font-semibold uppercase tracking-wider ml-2" style={{ color: colors.textSecondary }}>
              Capacidad de Carga
            </Text>
          </View>
          <Text className="text-sm font-bold" style={{ color: barColor }}>
            {totalWeight.toFixed(1)} / {maxCarry} lb
          </Text>
        </View>

        <View className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgSecondary }}>
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
            <Text className="text-xs ml-1" style={{ color: colors.accentDanger }}>
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
    <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="cash-outline" size={18} color={colors.accentRed} />
          <Text className="text-xs font-semibold uppercase tracking-wider ml-2" style={{ color: colors.textSecondary }}>
            Monedas
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-lg px-3 py-1.5"
          style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}
          onPress={() => setShowCoinModal(true)}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.accentRed }}>
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
              <Ionicons name="ellipse" size={18} color={COIN_ICON_COLORS[type]} />
            </View>
            <Text
              className="text-lg font-bold"
              style={{ color: coinColors[type] }}
            >
              {inventory.coins[type]}
            </Text>
            <Text className="text-[10px] uppercase" style={{ color: colors.textMuted }}>
              {COIN_ABBR[type]}
            </Text>
          </View>
        ))}
      </View>

      <View className="border-t pt-2" style={{ borderColor: colors.borderDefault }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.textMuted }}>Total en oro</Text>
          <Text className="text-sm font-bold" style={{ color: colors.accentGold }}>
            {totalGold.toFixed(2)} MO
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs" style={{ color: colors.textMuted }}>Peso de monedas</Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {calcCoinWeight(inventory.coins).toFixed(1)} lb
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
              backgroundColor: isActive ? withAlpha(colors.accentRed, 0.2) : colors.chipBg,
              borderColor: isActive ? withAlpha(colors.accentRed, 0.5) : colors.chipBorder,
            }}
            onPress={() => setFilter(tab.key)}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: isActive ? colors.accentRed : colors.textSecondary }}
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
        <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
          Objetos ({filteredItems.length})
        </Text>
        <TouchableOpacity
          className="rounded-lg px-3 py-1.5 flex-row items-center"
          style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}
          onPress={() => setShowAddItem(true)}
        >
          <Ionicons name="add" size={16} color={colors.accentRed} />
          <Text className="text-xs font-semibold ml-1" style={{ color: colors.accentRed }}>
            Añadir
          </Text>
        </TouchableOpacity>
      </View>

      {renderFilterTabs()}
    </View>
  );

  const renderInventoryItem = useCallback(({ item }: { item: InventoryItem }) => (
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
  ), [expandedItemId, handleToggleEquip, handleDeleteItem, updateItem]);

  const itemKeyExtractor = useCallback((item: InventoryItem) => item.id, []);

  const ListEmptyInventory = () => (
    <View className="rounded-card border p-6 items-center" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
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
        <Text className="text-xs font-semibold" style={{ color: colors.textInverted }}>
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
