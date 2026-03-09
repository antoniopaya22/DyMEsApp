import { useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useCharacterListStore,
  type CharacterSummary,
} from "@/stores/characterListStore";
import { getClassData } from "@/data/srd/classes";
import { getRaceData, getSubraceData } from "@/data/srd/races";
import {
  ConfirmDialog,
  Toast,
  SearchBar,
  TorchGlow,
  D20Watermark,
  FloatingParticles,
  AppHeader,
} from "@/components/ui";
import { useTheme, useDialog, useToast } from "@/hooks";
import { CharacterCard, HomeEmptyState } from "@/components/campaigns";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Main Home Screen ────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { characters, loadCharacters, deleteCharacter } =
    useCharacterListStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { dialogProps, showDestructive } = useDialog();
  const { toastProps, showSuccess } = useToast();

  const fabScale = useRef(new Animated.Value(1)).current;
  const fabGlow = useRef(new Animated.Value(0.35)).current;

  // Subtle pulsing glow on FAB
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, {
          toValue: 0.55,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fabGlow, {
          toValue: 0.30,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [fabGlow]);

  useFocusEffect(
    useCallback(() => {
      loadCharacters();
    }, [loadCharacters]),
  );

  const filteredCharacters = characters.filter((c) =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteCharacter = (char: CharacterSummary) => {
    showDestructive(
      "Eliminar personaje",
      `¿Estás seguro de que quieres eliminar "${char.nombre}"? Se perderán todos los datos de forma permanente.`,
      () => {
        deleteCharacter(char.id);
        showSuccess(
          "Personaje eliminado",
          `"${char.nombre}" ha sido eliminado`,
        );
      },
      { confirmText: "Eliminar", cancelText: "Cancelar" },
    );
  };

  const handlePressCharacter = (char: CharacterSummary) => {
    router.push(`/character/${char.id}`);
  };

  const renderCharacterCard = ({
    item,
    index,
  }: {
    item: CharacterSummary;
    index: number;
  }) => {
    const classData = item.clase ? getClassData(item.clase) : null;
    const raceData = item.raza ? getRaceData(item.raza) : null;
    const subraceData =
      item.raza && item.subraza
        ? getSubraceData(item.raza, item.subraza)
        : null;

    const raceName =
      item.customRaceName ??
      subraceData?.nombre ??
      raceData?.nombre ??
      "—";

    return (
      <CharacterCard
        item={item}
        index={index}
        classTheme={classData}
        raceName={raceName}
        onPress={() => handlePressCharacter(item)}
        onLongPress={() => handleDeleteCharacter(item)}
      />
    );
  };

  const renderEmptyList = () => (
    <HomeEmptyState onCreateFirst={() => router.push("/create")} />
  );

  const renderLongPressHint = () => {
    if (characters.length === 0) return null;
    return (
      <View style={styles.longPressHintRow}>
        <Ionicons
          name="finger-print-outline"
          size={13}
          color={colors.textMuted}
        />
        <Text style={[styles.longPressHintText, { color: colors.textMuted }]}>
          Mantén presionado un personaje para más opciones
        </Text>
      </View>
    );
  };

  const renderListHeader = () => {
    if (characters.length === 0) return null;
    return (
      <View style={styles.listHeaderContainer}>
        {filteredCharacters.length !== characters.length && (
          <Text style={[styles.filterResultText, { color: colors.textMuted }]}>
            {filteredCharacters.length}{" "}
            {filteredCharacters.length === 1 ? "resultado" : "resultados"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={colors.gradientMain}
        locations={colors.gradientLocations}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmospheric torch glow effects */}
      <TorchGlow
        color={colors.accentRed}
        position="top-right"
        size={180}
        intensity={isDark ? 0.06 : 0.04}
        animated
      />
      <TorchGlow
        color={colors.accentGold}
        position="top-left"
        size={120}
        intensity={isDark ? 0.04 : 0.03}
        animated
      />

      {/* Floating ember particles */}
      {isDark && (
        <FloatingParticles
          count={8}
          color={colors.accentGold}
          width={SCREEN_WIDTH}
          height={600}
          maxSize={3}
          opacity={0.3}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}

      {/* D20 watermark */}
      <View
        style={{
          position: "absolute",
          bottom: -40,
          right: -40,
          opacity: isDark ? 0.04 : 0.03,
        }}
      >
        <D20Watermark size={240} variant="dark" opacity={1} />
      </View>

      {/* Header */}
      <AppHeader showBack>
        {characters.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Buscar personaje..."
            style={{ marginTop: 10 }}
          />
        )}
      </AppHeader>

      {/* Character list */}
      <FlatList
        data={filteredCharacters}
        keyExtractor={(item) => item.id}
        renderItem={renderCharacterCard}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderLongPressHint}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 100,
          flexGrow: characters.length === 0 ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadCharacters();
              setRefreshing(false);
            }}
            tintColor={colors.accentGold}
            colors={[colors.accentGold]}
          />
        }
      />

      {/* FAB — New character */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ scale: fabScale }],
            shadowOpacity: fabGlow,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.push("/create")}
          onPressIn={() => {
            Animated.timing(fabScale, {
              toValue: 0.9,
              duration: 100,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(fabScale, {
              toValue: 1,
              friction: 5,
              tension: 200,
              useNativeDriver: true,
            }).start();
          }}
          activeOpacity={1}
          style={styles.fabTouchable}
        >
          <LinearGradient
            colors={["#00D4E8", colors.accentRed, "#0097A7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={colors.textInverted} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <ConfirmDialog {...dialogProps} />
      <Toast {...toastProps} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── FAB ──
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: "#00BCD4",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 8,
  },
  fabTouchable: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
  },
  fabGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── List ──
  listHeaderContainer: {
    marginBottom: 8,
  },
  filterResultText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },

  // ── Long press hint ──
  longPressHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 6,
    opacity: 0.7,
  },
  longPressHintText: {
    fontSize: 12,
    fontWeight: "500",
    fontStyle: "italic",
  },
});
