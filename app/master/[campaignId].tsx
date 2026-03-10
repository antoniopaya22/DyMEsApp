/**
 * Master Campaign Lobby — Real-time player panel (HU-10.6, HU-10.8)
 *
 * Shows all players linked to the campaign with live character data.
 * The master can add/remove players and see character summaries in real-time.
 */

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useMasterStore } from "@/stores/masterStore";
import { useRealtimeCharacters } from "@/hooks/useRealtimeCharacters";
import { useTheme, useDialog, useToast } from "@/hooks";
import { ConfirmDialog, Toast } from "@/components/ui";
import { CLASS_ICONS, RACE_ICONS } from "@/data/srd";
import { getCharacterAvatar } from "@/utils/avatar";
import type { LobbyPlayer } from "@/types/master";
import type { PersonajeRow } from "@/types/supabase";
import type { Character, ClassId, RaceId } from "@/types/character";
import { getHpColor, getHpLabel } from "@/constants/colors";

// ─── Component ───────────────────────────────────────────────────────

export default function MasterCampaignLobby() {
  const router = useRouter();
  const { campaignId } = useLocalSearchParams<{ campaignId: string }>();
  const { colors } = useTheme();
  const {
    campaigns,
    players,
    loadPlayers,
    loadingPlayers,
    addPlayer,
    removePlayer,
  } = useMasterStore();
  const { dialogProps, showDestructive } = useDialog();
  const { toastProps, showSuccess, showError } = useToast();

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [characterCode, setCharacterCode] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live character data cache (updated via realtime subscription)
  const [liveCharacters, setLiveCharacters] = useState<
    Record<string, PersonajeRow>
  >({});

  const campaign = campaigns.find((c) => c.id === campaignId);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      if (campaignId) loadPlayers(campaignId);
    }, [campaignId, loadPlayers]),
  );

  // Collect character IDs that need real-time tracking
  const characterIds = useMemo(
    () =>
      players
        .map((p) => p.membership.personaje_id)
        .filter((id): id is string => id !== null),
    [players],
  );

  // Subscribe to real-time character updates
  useRealtimeCharacters({
    characterIds,
    enabled: characterIds.length > 0,
    onUpdate: (character) => {
      setLiveCharacters((prev) => ({
        ...prev,
        [character.id]: character,
      }));
    },
    onDelete: (characterId) => {
      setLiveCharacters((prev) => {
        const next = { ...prev };
        delete next[characterId];
        return next;
      });
    },
  });

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    if (!campaignId) return;
    setRefreshing(true);
    try {
      await loadPlayers(campaignId);
    } finally {
      setRefreshing(false);
    }
  }, [campaignId, loadPlayers]);

  // Also seed live cache from initial load
  useEffect(() => {
    const initial: Record<string, PersonajeRow> = {};
    for (const p of players) {
      if (p.character) {
        initial[p.character.id] = p.character;
      }
    }
    setLiveCharacters((prev) => ({ ...initial, ...prev }));
  }, [players]);

  // ── Add Player ──
  const handleAddPlayer = async () => {
    if (!characterCode.trim() || !campaignId) return;
    setAddingPlayer(true);
    try {
      const name = await addPlayer(campaignId, characterCode.trim());
      setShowAddPlayer(false);
      setCharacterCode("");
      showSuccess("Jugador añadido", `${name} se ha unido a la campaña`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al añadir jugador";
      showError("Error", msg);
    } finally {
      setAddingPlayer(false);
    }
  };

  // ── Remove Player ──
  const handleRemovePlayer = (player: LobbyPlayer) => {
    showDestructive(
      "Eliminar jugador",
      `¿Quieres desvincular a "${player.profile.nombre || player.profile.codigo_jugador}" de esta campaña? Su personaje no se eliminará.`,
      () => {
        if (campaignId) {
          removePlayer(campaignId, player.profile.id);
          showSuccess("Jugador eliminado", "El jugador ha sido desvinculado");
        }
      },
      { confirmText: "Desvincular", cancelText: "Cancelar" },
    );
  };

  // ── Render Player Card ──
  const renderPlayerCard = ({ item }: { item: LobbyPlayer }) => {
    const charId = item.membership.personaje_id;
    const charRow = charId ? liveCharacters[charId] : null;
    const charData = charRow?.datos as unknown as Character | undefined;

    const hasCharacter = !!charData;
    const pgCurrent = charData?.hp?.current ?? 0;
    const pgMax = charData?.hp?.max ?? 0;
    const ca = 10; // AC is computed, not stored — placeholder
    const nivel = charData?.nivel ?? 0;
    const clase = charData?.clase ?? "—";
    const nombre = charData?.nombre ?? "Sin personaje";
    const condiciones = charData?.conditions?.map((c) => c.condition) ?? [];
    const portraitSource = charData
      ? getCharacterAvatar(
          charData.clase as ClassId,
          charData.raza as RaceId,
          charData.sexo,
        )
      : null;

    const hpColor = getHpColor(pgCurrent, pgMax, colors);
    const hpPercent = pgMax > 0 ? (pgCurrent / pgMax) * 100 : 0;

    const handlePressPlayer = () => {
      if (charId) {
        router.push({
          pathname: "/master/character-view" as any,
          params: {
            characterId: charId,
            playerName: item.profile.nombre || item.profile.codigo_jugador,
          },
        });
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          {
            backgroundColor: colors.bgElevated,
            borderColor: colors.borderDefault,
          },
        ]}
        onPress={handlePressPlayer}
        onLongPress={() => handleRemovePlayer(item)}
        activeOpacity={0.85}
      >
        {/* Player header */}
        <View style={styles.playerHeader}>
          {charData?.appearance?.avatarUri ? (
            <Image
              source={{ uri: charData.appearance.avatarUri }}
              style={styles.playerAvatarImg}
              contentFit="cover"
              contentPosition="top"
              transition={200}
            />
          ) : portraitSource ? (
            <Image
              source={portraitSource}
              style={styles.playerAvatarImg}
              contentFit="cover"
              contentPosition="top"
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.playerAvatar,
                {
                  backgroundColor: hasCharacter
                    ? `${colors.accentGold}18`
                    : `${colors.accentBlue}20`,
                },
              ]}
            >
              {hasCharacter ? (
                <Ionicons
                  name={
                    (RACE_ICONS[charData!.raza as RaceId] ??
                      "person-outline") as any
                  }
                  size={20}
                  color={colors.accentGold}
                />
              ) : (
                <Ionicons name="person" size={20} color={colors.accentBlue} />
              )}
            </View>
          )}
          <View style={styles.playerHeaderInfo}>
            <Text
              style={[styles.playerName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {item.profile.nombre || item.profile.codigo_jugador}
            </Text>
            <Text style={[styles.playerCode, { color: colors.textMuted }]}>
              {item.profile.codigo_jugador}
            </Text>
          </View>
          {charRow && (
            <Text style={[styles.lastUpdate, { color: colors.textMuted }]}>
              {new Date(charRow.actualizado_en).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>

        {/* Character info */}
        {hasCharacter ? (
          <View style={styles.characterSection}>
            {/* Name, Class & Level */}
            <View style={styles.charRow}>
              <Text
                style={[styles.charName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {nombre}
              </Text>
              <Text style={[styles.charClass, { color: colors.textSecondary }]}>
                {CLASS_ICONS[clase as ClassId] ?? ""} {clase} Nv.{nivel}
              </Text>
            </View>

            {/* HP Bar */}
            <View style={styles.hpRow}>
              <Text style={[styles.hpLabel, { color: colors.textSecondary }]}>
                PG
              </Text>
              <View
                style={[styles.hpBarBg, { backgroundColor: colors.bgSubtle }]}
              >
                <View
                  style={[
                    styles.hpBarFill,
                    {
                      backgroundColor: hpColor,
                      width: `${Math.min(100, Math.max(0, hpPercent))}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.hpValue, { color: hpColor }]}>
                {pgCurrent}/{pgMax}
              </Text>
              <View
                style={[styles.statusChip, { backgroundColor: `${hpColor}20` }]}
              >
                <Text style={[styles.statusChipText, { color: hpColor }]}>
                  {getHpLabel(pgCurrent, pgMax)}
                </Text>
              </View>
            </View>

            {/* AC */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons
                  name="shield-outline"
                  size={14}
                  color={colors.accentBlue}
                />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  CA {ca}
                </Text>
              </View>
            </View>

            {/* Conditions */}
            {condiciones.length > 0 && (
              <View style={styles.conditionsRow}>
                {condiciones.map((cond) => (
                  <View
                    key={cond}
                    style={[
                      styles.conditionChip,
                      { backgroundColor: `${colors.accentAmber}20` },
                    ]}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={10}
                      color={colors.accentAmber}
                    />
                    <Text
                      style={[
                        styles.conditionText,
                        { color: colors.accentAmber },
                      ]}
                    >
                      {cond}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noCharContainer}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={colors.textMuted}
            />
            <Text style={[styles.noCharText, { color: colors.textMuted }]}>
              Esperando selección de personaje...
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ── Empty state ──
  const renderEmpty = () => {
    if (loadingPlayers) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.accentGold} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="people-outline"
          size={64}
          color={colors.textMuted}
          style={{ opacity: 0.4 }}
        />
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
          Sin jugadores
        </Text>
        <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
          Añade jugadores con el código de su personaje
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.bgPrimary, opacity: fadeAnim },
      ]}
    >
      <LinearGradient
        colors={[colors.gradientMain[0], colors.gradientMain[3]]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.headerButtonBg,
              borderColor: colors.headerButtonBorder,
            },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: colors.headerTitleColor }]}
            numberOfLines={1}
          >
            {campaign?.nombre ?? "Campaña"}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {players.length} jugador{players.length === 1 ? "" : "es"}
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* Real-time connection indicator */}
      {characterIds.length > 0 && (
        <View style={styles.realtimeIndicator}>
          <View
            style={[
              styles.realtimeDot,
              { backgroundColor: colors.accentGreen },
            ]}
          />
          <Text style={[styles.realtimeText, { color: colors.textMuted }]}>
            Tiempo real activo
          </Text>
        </View>
      )}

      {/* Player List */}
      <FlatList
        data={players}
        renderItem={renderPlayerCard}
        keyExtractor={(item) => item.membership.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Add Player Button */}
      <TouchableOpacity
        style={[styles.addPlayerBtn, { backgroundColor: colors.accentGold }]}
        onPress={() => setShowAddPlayer(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add" size={20} color={colors.textInverted} />
        <Text style={[styles.addPlayerBtnText, { color: colors.textInverted }]}>
          Añadir jugador
        </Text>
      </TouchableOpacity>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowAddPlayer(false)}
            activeOpacity={1}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.bgElevated,
                borderColor: colors.borderDefault,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Añadir personaje
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Introduce el código del personaje (8 caracteres). El jugador puede
              copiarlo desde Ajustes.
            </Text>

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderDefault,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Ej: A7K3MX2B"
              placeholderTextColor={colors.searchPlaceholder}
              value={characterCode}
              onChangeText={(t) => setCharacterCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.bgSubtle }]}
                onPress={() => {
                  setShowAddPlayer(false);
                  setCharacterCode("");
                }}
              >
                <Text
                  style={[styles.modalBtnText, { color: colors.textSecondary }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: colors.accentGold,
                    opacity: characterCode.trim().length === 8 ? 1 : 0.5,
                  },
                ]}
                onPress={handleAddPlayer}
                disabled={characterCode.trim().length !== 8 || addingPlayer}
              >
                {addingPlayer ? (
                  <ActivityIndicator size="small" color={colors.textInverted} />
                ) : (
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: colors.textInverted },
                    ]}
                  >
                    Buscar y añadir
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ConfirmDialog {...dialogProps} />
      <Toast {...toastProps} />
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  realtimeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
    gap: 6,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  realtimeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  playerCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  playerAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  playerHeaderInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "700",
  },
  playerCode: {
    fontSize: 11,
    marginTop: 1,
    fontFamily: "monospace",
  },
  lastUpdate: {
    fontSize: 10,
    fontFamily: "monospace",
  },
  characterSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  charRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  charName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  charClass: {
    fontSize: 12,
  },
  hpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hpLabel: {
    fontSize: 11,
    fontWeight: "700",
    width: 22,
  },
  hpBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  hpBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  hpValue: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
    minWidth: 50,
    textAlign: "right",
  },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  conditionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  conditionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  noCharContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  noCharText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  addPlayerBtn: {
    position: "absolute",
    bottom: 32,
    left: 24,
    right: 24,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#000", // static: theme-independent
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  addPlayerBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    zIndex: 101,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  modalDesc: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  codeInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 6,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "monospace",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
