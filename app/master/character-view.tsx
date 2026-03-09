/**
 * Master Character View — Read-only full character sheet (HU-10.8)
 *
 * Shows the complete character data of a player in the master's campaign.
 * All sections are read-only — the master can only observe, not edit.
 *
 * Receives character data via route params (characterId) and reads from
 * the liveCharacters cache or directly from Supabase.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { supabase } from "@/lib/supabase";
import { getRaceData, getSubraceData } from "@/data/srd/races";
import { getClassData } from "@/data/srd/classes";
import { getBackgroundData } from "@/data/srd/backgrounds";
import { getSpellById } from "@/data/srd/spells";
import { formatModifier, calcProficiencyBonus } from "@/utils/character";
import {
  ABILITY_ABBR,
  SKILLS,
  ALIGNMENT_NAMES,
  CONDITION_NAMES,
} from "@/constants/character";
import { ABILITY_KEYS, getSpellLevelColors } from "@/constants/abilities";
import { COIN_ABBR } from "@/constants/items";
import type { Character, AbilityKey, SkillKey } from "@/types/character";
import { withAlpha, type ThemeColors } from "@/utils/theme";
import type { SyncedCharacterData } from "@/hooks/useCharacterSync";
import type { InternalMagicState, SlotInfo } from "@/stores/characterStore/helpers";
import type { ClassResourcesState, ClassResourceInfo } from "@/stores/characterStore/classResourceTypes";
import { UNLIMITED_RESOURCE } from "@/stores/characterStore/classResourceTypes";
import type { Inventory, InventoryItem, CoinType, Coins } from "@/types/item";

// ─── Types ───────────────────────────────────────────────────────────

type SectionId =
  | "basic"
  | "abilities"
  | "combat"
  | "skills"
  | "spells"
  | "resources"
  | "inventory"
  | "traits"
  | "proficiencies";

// ─── Coin helpers ────────────────────────────────────────────────────

const COIN_COLORS: Record<CoinType, string> = {
  mc: "#B87333",
  mp: "#C0C0C0",
  me: "#5B9BD5",
  mo: "#DAA520",
  mpl: "#E5E4E2",
};

const COIN_ORDER: CoinType[] = ["mpl", "mo", "me", "mp", "mc"];

// ─── HP Helpers ──────────────────────────────────────────────────────

function getHpColor(current: number, max: number): string {
  if (max === 0) return "#6B7280";
  const ratio = current / max;
  if (ratio > 0.5) return "#22C55E";
  if (ratio > 0.25) return "#F59E0B";
  if (ratio > 0) return "#EF4444";
  return "#7C3AED";
}

function getHpLabel(current: number, max: number): string {
  if (max === 0) return "—";
  if (current <= 0) return "Inconsciente";
  const ratio = current / max;
  if (ratio <= 0.25) return "Crítico";
  if (ratio <= 0.5) return "Herido";
  return "Sano";
}

function getDamageModLabel(modifier: string): string {
  if (modifier === "resistance") return "Res.";
  if (modifier === "immunity") return "Inmun.";
  return "Vuln.";
}

function getSkillProfColor(level: string | undefined, gold: string, green: string): string {
  if (level === "expertise") return gold;
  if (level === "proficient") return green;
  return "transparent";
}

function getRechargeLabel(recharge: string): string {
  if (recharge === "short_rest") return "Desc. corto";
  if (recharge === "long_rest") return "Desc. largo";
  return "Amanecer";
}

// ─── Component ───────────────────────────────────────────────────────

export default function MasterCharacterView() {
  const router = useRouter();
  const { characterId, playerName } = useLocalSearchParams<{
    characterId: string;
    playerName?: string;
  }>();
  const { colors } = useTheme();
  const spellLevelColors = useMemo(() => getSpellLevelColors(colors), [colors]);

  const [character, setCharacter] = useState<Character | null>(null);
  const [magicState, setMagicState] = useState<InternalMagicState | null>(null);
  const [classResources, setClassResources] = useState<ClassResourcesState | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(["basic", "abilities", "combat"]),
  );
  const [editingCoins, setEditingCoins] = useState(false);
  const [coinDraft, setCoinDraft] = useState<Record<CoinType, string>>({ mc: "0", mp: "0", me: "0", mo: "0", mpl: "0" });
  const [addItemName, setAddItemName] = useState("");
  const [addItemQty, setAddItemQty] = useState("1");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch character from Supabase
  useEffect(() => {
    if (!characterId) return;

    const fetch = async () => {
      try {
        setLoading(true);
        const { data, error: dbError } = await supabase
          .from("personajes")
          .select("datos")
          .eq("id", characterId)
          .single<{ datos: Record<string, unknown> }>();

        if (dbError) throw new Error(dbError.message);
        if (!data?.datos) throw new Error("Sin datos de personaje");

        const syncedData = data.datos as unknown as SyncedCharacterData;
        const { _magicState, _classResources, _inventory, ...charData } = syncedData;
        setCharacter(charData as Character);
        setMagicState(_magicState ?? null);
        setClassResources(_classResources ?? null);
        setInventory(_inventory ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetch();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`master-char-${characterId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "personajes",
          filter: `id=eq.${characterId}`,
        },
        (payload) => {
          const newData = payload.new as { datos: unknown };
          if (newData?.datos) {
            const syncedData = newData.datos as unknown as SyncedCharacterData;
            const { _magicState, _classResources, _inventory, ...charData } = syncedData;
            setCharacter(charData as Character);
            setMagicState(_magicState ?? null);
            setClassResources(_classResources ?? null);
            setInventory(_inventory ?? null);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [characterId]);

  // Entrance animation
  useEffect(() => {
    if (character) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [character, fadeAnim]);

  const toggleSection = (id: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Supabase datos update helper ──
  const updateDatos = useCallback(async (patch: Record<string, unknown>) => {
    if (!characterId) return;
    try {
      const { data: current } = await supabase
        .from("personajes")
        .select("datos")
        .eq("id", characterId)
        .single<{ datos: Record<string, unknown> }>();
      if (!current?.datos) return;
      const merged = { ...current.datos, ...patch };
      await (supabase as any)
        .from("personajes")
        .update({ datos: merged })
        .eq("id", characterId);
    } catch (err) {
      console.error("[MasterCharView] updateDatos:", err);
    }
  }, [characterId]);

  // ── Coin editing ──
  const startEditingCoins = useCallback(() => {
    if (!inventory) return;
    setCoinDraft({
      mc: String(inventory.coins.mc),
      mp: String(inventory.coins.mp),
      me: String(inventory.coins.me),
      mo: String(inventory.coins.mo),
      mpl: String(inventory.coins.mpl),
    });
    setEditingCoins(true);
  }, [inventory]);

  const saveCoins = useCallback(async () => {
    if (!inventory) return;
    const newCoins: Coins = {
      mc: Math.max(0, parseInt(coinDraft.mc, 10) || 0),
      mp: Math.max(0, parseInt(coinDraft.mp, 10) || 0),
      me: Math.max(0, parseInt(coinDraft.me, 10) || 0),
      mo: Math.max(0, parseInt(coinDraft.mo, 10) || 0),
      mpl: Math.max(0, parseInt(coinDraft.mpl, 10) || 0),
    };
    const updatedInv = { ...inventory, coins: newCoins };
    setInventory(updatedInv);
    setEditingCoins(false);
    await updateDatos({ _inventory: updatedInv });
  }, [inventory, coinDraft, updateDatos]);

  // ── Inventory item management ──
  const handleAddItem = useCallback(async () => {
    if (!inventory || !addItemName.trim()) return;
    const qty = Math.max(1, parseInt(addItemQty, 10) || 1);
    const newItem: InventoryItem = {
      id: `master-${Date.now()}`,
      nombre: addItemName.trim(),
      categoria: "otro",
      cantidad: qty,
      peso: 0,
      equipado: false,
      custom: true,
    };
    const updatedInv = { ...inventory, items: [...inventory.items, newItem] };
    setInventory(updatedInv);
    setAddItemName("");
    setAddItemQty("1");
    await updateDatos({ _inventory: updatedInv });
  }, [inventory, addItemName, addItemQty, updateDatos]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    if (!inventory) return;
    const updatedInv = { ...inventory, items: inventory.items.filter(i => i.id !== itemId) };
    setInventory(updatedInv);
    await updateDatos({ _inventory: updatedInv });
  }, [inventory, updateDatos]);

  // ── Derived data ──
  const raceData = character ? getRaceData(character.raza) : null;
  const subraceData =
    character?.subraza
      ? getSubraceData(character.raza, character.subraza)
      : null;
  const classData = character ? getClassData(character.clase) : null;
  const backgroundData = character ? getBackgroundData(character.trasfondo) : null;
  const profBonus = character ? calcProficiencyBonus(character.nivel) : 0;

  // Prepared/known spells
  const preparedSpells = useMemo(() => {
    if (!character) return [];
    return character.preparedSpellIds
      .map((id) => getSpellById(id))
      .filter(Boolean);
  }, [character]);

  const knownSpells = useMemo(() => {
    if (!character) return [];
    return character.knownSpellIds
      .map((id) => getSpellById(id))
      .filter(Boolean);
  }, [character]);

  // ── Loading ──
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bgPrimary }]}>
        <LinearGradient
          colors={[colors.gradientMain[0], colors.gradientMain[3]]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.accentGold} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Cargando personaje...
        </Text>
      </View>
    );
  }

  // ── Error ──
  if (error || !character) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bgPrimary }]}>
        <LinearGradient
          colors={[colors.gradientMain[0], colors.gradientMain[3]]}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="alert-circle-outline" size={48} color={colors.accentDanger} />
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>
          {error || "Personaje no encontrado"}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.errorLink, { color: colors.accentGold }]}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hpColor = getHpColor(character.hp.current, character.hp.max);
  const hpPct =
    character.hp.max > 0
      ? Math.min(100, (character.hp.current / character.hp.max) * 100)
      : 0;

  // ── Render ──
  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <LinearGradient
        colors={[colors.gradientMain[0], colors.gradientMain[3]]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
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
            {character.nombre}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {playerName ? `Jugador: ${playerName}` : "Vista de Master"}
          </Text>
        </View>

        {/* Real-time indicator */}
        <View style={styles.realtimeBadge}>
          <View style={[styles.realtimeDot, { backgroundColor: colors.accentGreen }]} />
          <Text style={[styles.realtimeLabel, { color: colors.textMuted }]}>En vivo</Text>
        </View>
      </View>

      {/* Character Summary Banner */}
      <View style={[styles.summaryBanner, { backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryName, { color: colors.textPrimary }]}>
              {character.customRaceName ?? raceData?.nombre ?? character.raza}{" "}
              {subraceData ? `(${subraceData.nombre})` : ""}
            </Text>
            <Text style={[styles.summaryClass, { color: colors.accentGold }]}>
              {classData?.nombre ?? character.clase} Nv. {character.nivel}
              {character.subclase ? ` — ${character.subclase}` : ""}
            </Text>
            <Text style={[styles.summaryBg, { color: colors.textMuted }]}>
              {character.customBackgroundName ?? backgroundData?.nombre ?? character.trasfondo}
              {character.alineamiento ? ` · ${ALIGNMENT_NAMES[character.alineamiento]}` : ""}
            </Text>
          </View>

          {/* HP compact */}
          <View style={styles.summaryHp}>
            <Text style={[styles.hpBigValue, { color: hpColor }]}>
              {character.hp.current}
              <Text style={[styles.hpBigMax, { color: colors.textMuted }]}>
                /{character.hp.max}
              </Text>
            </Text>
            <View style={[styles.hpBarBg, { backgroundColor: colors.bgSubtle }]}>
              <View
                style={[
                  styles.hpBarFill,
                  { backgroundColor: hpColor, width: `${hpPct}%` },
                ]}
              />
            </View>
            <Text style={[styles.hpStatusLabel, { color: hpColor }]}>
              {getHpLabel(character.hp.current, character.hp.max)}
            </Text>
            {character.hp.temp > 0 && (
              <Text style={[styles.hpTemp, { color: colors.accentBlue }]}>
                +{character.hp.temp} temp
              </Text>
            )}
          </View>
        </View>

        {/* Conditions */}
        {character.conditions.length > 0 && (
          <View style={styles.conditionsRow}>
            {character.conditions.map((c, i) => (
              <View
                key={`${c.condition}-${i}`}
                style={[styles.conditionChip, { backgroundColor: `${colors.accentAmber}20` }]}
              >
                <Ionicons name="warning-outline" size={10} color={colors.accentAmber} />
                <Text style={[styles.conditionText, { color: colors.accentAmber }]}>
                  {CONDITION_NAMES[c.condition] ?? c.condition}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Concentration */}
        {character.concentration && (
          <View style={[styles.concentrationRow, { backgroundColor: `${colors.accentBlue}10` }]}>
            <Ionicons name="eye-outline" size={14} color={colors.accentBlue} />
            <Text style={[styles.concentrationText, { color: colors.accentBlue }]}>
              Concentrado en: {character.concentration.spellName}
            </Text>
          </View>
        )}
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* â•â•â• Ability Scores â•â•â• */}
        <Section title="Características" icon="stats-chart" expanded={expandedSections.has("abilities")} onToggle={() => toggleSection("abilities")} colors={colors}>
            {/* Ability grid */}
            <View style={styles.abilityGrid}>
              {ABILITY_KEYS.map((key) => {
                const detail = character.abilityScores[key];
                return (
                  <View
                    key={key}
                    style={[
                      styles.abilityBox,
                      { backgroundColor: withAlpha(colors.accentRed, 0.06), borderColor: withAlpha(colors.accentRed, 0.18) },
                    ]}
                  >
                    <Text style={[styles.abilityAbbr, { color: colors.accentRed }]}>
                      {ABILITY_ABBR[key]}
                    </Text>
                    <Text style={[styles.abilityTotal, { color: colors.textPrimary }]}>
                      {detail.total}
                    </Text>
                    <View style={[styles.abilityModPill, { backgroundColor: withAlpha(colors.accentRed, 0.13) }]}>
                      <Text style={[styles.abilityMod, { color: colors.accentRed }]}>
                        {formatModifier(detail.modifier)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Proficiency Bonus */}
            <View style={[styles.profRow, { borderTopColor: colors.borderSeparator }]}>
              <Text style={[styles.profLabel, { color: colors.textMuted }]}>
                Bonificador de competencia
              </Text>
              <Text style={[styles.profValue, { color: colors.accentGold }]}>
                +{profBonus}
              </Text>
            </View>

            {/* Saving Throws */}
            <View style={styles.savingThrowsRow}>
              <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                Tiradas de salvación
              </Text>
              <View style={styles.savingThrowsGrid}>
                {ABILITY_KEYS.map((key) => {
                  const st = character.savingThrows[key];
                  const mod = character.abilityScores[key].modifier;
                  const bonus = mod + (st.proficient ? profBonus : 0);
                  return (
                    <View key={key} style={styles.savingThrowItem}>
                      <View style={[
                        styles.profDot,
                        { backgroundColor: st.proficient ? colors.accentRed : colors.bgSubtle },
                      ]} />
                      <Text style={[styles.stAbbr, { color: colors.textMuted }]}>
                        {ABILITY_ABBR[key]}
                      </Text>
                      <Text style={[styles.stValue, { color: colors.textPrimary }]}>
                        {formatModifier(bonus)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
        </Section>

        {/* â•â•â• Combat Stats â•â•â• */}
        <Section title="Combate" icon="shield-half-outline" expanded={expandedSections.has("combat")} onToggle={() => toggleSection("combat")} colors={colors}>
            {/* Combat stats grid */}
            <View style={styles.combatGrid}>
              <View style={styles.combatCircleCard}>
                <View style={[styles.combatStatCircle, { backgroundColor: withAlpha(colors.accentRed, 0.15) }]}>
                  <Ionicons name="footsteps-outline" size={28} color={colors.accentRed} />
                </View>
                <Text style={[styles.combatStatValue, { color: colors.textPrimary }]}>{character.speed.walk} ft</Text>
                <Text style={[styles.combatStatLabel, { color: colors.textMuted }]}>Velocidad</Text>
              </View>
              <View style={styles.combatCircleCard}>
                <View style={[styles.combatStatCircle, { backgroundColor: withAlpha(colors.accentRed, 0.15) }]}>
                  <Ionicons name="flash-outline" size={28} color={colors.accentRed} />
                </View>
                <Text style={[styles.combatStatValue, { color: colors.textPrimary }]}>{formatModifier(character.abilityScores.des.modifier)}</Text>
                <Text style={[styles.combatStatLabel, { color: colors.textMuted }]}>Iniciativa</Text>
              </View>
              <View style={styles.combatCircleCard}>
                <View style={[styles.combatStatCircle, { backgroundColor: withAlpha(colors.accentRed, 0.15) }]}>
                  <Ionicons name="dice-outline" size={28} color={colors.accentRed} />
                </View>
                <Text style={[styles.combatStatValue, { color: colors.textPrimary }]}>{character.hitDice.remaining}/{character.hitDice.total} {character.hitDice.die}</Text>
                <Text style={[styles.combatStatLabel, { color: colors.textMuted }]}>Dados golpe</Text>
              </View>
            </View>

            {/* Death Saves */}
            {(character.deathSaves.successes > 0 || character.deathSaves.failures > 0) && (
              <View style={[styles.deathSavesRow, { borderTopColor: colors.borderSeparator }]}>
                <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                  Salvaciones de muerte
                </Text>
                <View style={styles.deathSavesValues}>
                  <View style={styles.deathSaveGroup}>
                    <Text style={[styles.deathSaveLabel, { color: colors.accentGreen }]}>Éxitos</Text>
                    <View style={styles.deathSaveDots}>
                      {[0, 1, 2].map((i) => (
                        <View
                          key={`s${i}`}
                          style={[
                            styles.deathDot,
                            {
                              backgroundColor:
                                i < character.deathSaves.successes
                                  ? colors.accentGreen
                                  : colors.bgSubtle,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.deathSaveGroup}>
                    <Text style={[styles.deathSaveLabel, { color: colors.accentDanger }]}>Fallos</Text>
                    <View style={styles.deathSaveDots}>
                      {[0, 1, 2].map((i) => (
                        <View
                          key={`f${i}`}
                          style={[
                            styles.deathDot,
                            {
                              backgroundColor:
                                i < character.deathSaves.failures
                                  ? colors.accentDanger
                                  : colors.bgSubtle,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Damage Modifiers */}
            {character.damageModifiers.length > 0 && (
              <View style={[styles.damageModRow, { borderTopColor: colors.borderSeparator }]}>
                <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                  Resistencias / Inmunidades
                </Text>
                <View style={styles.damageModChips}>
                  {character.damageModifiers.map((dm, i) => (
                    <View
                      key={`${dm.type}-${i}`}
                      style={[styles.damageChip, { backgroundColor: withAlpha(colors.accentBlue, 0.1) }]}
                    >
                      <Text style={[styles.damageChipText, { color: colors.accentBlue }]}>
                        {getDamageModLabel(dm.modifier)}{" "}
                        {dm.type}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
        </Section>

        {/* â•â•â• Skills â•â•â• */}
        <Section title="Habilidades" icon="list-outline" expanded={expandedSections.has("skills")} onToggle={() => toggleSection("skills")} colors={colors}>
            <View style={styles.skillsList}>
              {(Object.entries(SKILLS) as [SkillKey, { nombre: string; habilidad: AbilityKey }][]).map(
                ([key, skill]) => {
                  const prof = character.skillProficiencies[key];
                  const abilMod = character.abilityScores[skill.habilidad].modifier;
                  let bonus = abilMod;
                  if (prof?.level === "proficient") bonus += profBonus;
                  if (prof?.level === "expertise") bonus += profBonus * 2;

                  return (
                    <View key={key} style={styles.skillRow}>
                      <View style={[
                        styles.skillProfDot,
                        {
                          backgroundColor: getSkillProfColor(prof?.level, colors.accentGold, colors.accentGreen),
                          borderColor:
                            prof?.level !== "none" && prof?.level
                              ? "transparent"
                              : colors.textMuted,
                        },
                      ]} />
                      <Text
                        style={[
                          styles.skillName,
                          { color: prof?.level !== "none" && prof?.level ? colors.textPrimary : colors.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {skill.nombre}
                      </Text>
                      <Text style={[styles.skillAbil, { color: colors.textMuted }]}>
                        {ABILITY_ABBR[skill.habilidad]}
                      </Text>
                      <Text style={[styles.skillBonus, { color: colors.textPrimary }]}>
                        {formatModifier(bonus)}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
        </Section>

        {/* â•â•â• Spells â•â•â• */}
        {(knownSpells.length > 0 || preparedSpells.length > 0) && (
          <Section title="Hechizos" icon="sparkles-outline" expanded={expandedSections.has("spells")} onToggle={() => toggleSection("spells")} colors={colors}>
                {/* Prepared spells */}
                {preparedSpells.length > 0 && (
                  <View style={styles.spellSection}>
                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                      Preparados ({preparedSpells.length})
                    </Text>
                    <View style={styles.spellChipsWrap}>
                      {preparedSpells.map((spell) =>
                        spell ? (
                          <View
                            key={spell.id}
                            style={[
                              styles.spellChip,
                              {
                                backgroundColor: `${spellLevelColors[spell.nivel] ?? colors.textMuted}12`,
                                borderColor: `${spellLevelColors[spell.nivel] ?? colors.textMuted}30`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.spellChipLevel,
                                { color: spellLevelColors[spell.nivel] ?? colors.textMuted },
                              ]}
                            >
                              {spell.nivel === 0 ? "T" : spell.nivel}
                            </Text>
                            <Text
                              style={[styles.spellChipName, { color: colors.textPrimary }]}
                              numberOfLines={1}
                            >
                              {spell.nombre}
                            </Text>

                          </View>
                        ) : null,
                      )}
                    </View>
                  </View>
                )}

                {/* Known (not prepared) spells */}
                {knownSpells.length > preparedSpells.length && (
                  <View style={[styles.spellSection, { borderTopColor: colors.borderSeparator, borderTopWidth: 1, paddingTop: 12 }]}>
                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                      Conocidos ({knownSpells.length})
                    </Text>
                    <View style={styles.spellChipsWrap}>
                      {knownSpells
                        .filter((s) => s && !character.preparedSpellIds.includes(s.id))
                        .map((spell) =>
                          spell ? (
                            <View
                              key={spell.id}
                              style={[
                                styles.spellChip,
                                {
                                  backgroundColor: `${colors.textMuted}08`,
                                  borderColor: `${colors.textMuted}20`,
                                },
                              ]}
                            >
                              <Text style={[styles.spellChipLevel, { color: colors.textMuted }]}>
                                {spell.nivel === 0 ? "T" : spell.nivel}
                              </Text>
                              <Text
                                style={[styles.spellChipName, { color: colors.textSecondary }]}
                                numberOfLines={1}
                              >
                                {spell.nombre}
                              </Text>
                            </View>
                          ) : null,
                        )}
                    </View>
                  </View>
                )}
          </Section>
        )}

        {/* â•â•â• Spell Slots & Class Resources â•â•â• */}
        {(magicState || classResources) && (
          <Section title="Recursos" icon="battery-half-outline" expanded={expandedSections.has("resources")} onToggle={() => toggleSection("resources")} colors={colors}>
                {/* Spell Slots */}
                {magicState && Object.keys(magicState.spellSlots).length > 0 && (
                  <View style={styles.resourceGroup}>
                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                      Espacios de conjuro
                    </Text>
                    <View style={styles.slotGrid}>
                      {Object.entries(magicState.spellSlots)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([level, slot]) => {
                          const s = slot as SlotInfo;
                          if (s.total === 0) return null;
                          const remaining = s.total - s.used;
                          return (
                            <View key={level} style={[styles.slotBox, { backgroundColor: withAlpha(colors.accentBlue, 0.06), borderColor: withAlpha(colors.accentBlue, 0.15) }]}>
                              <Text style={[styles.slotLevel, { color: colors.accentBlue }]}>
                                Nv. {level}
                              </Text>
                              <View style={styles.slotDots}>
                                {Array.from({ length: s.total }).map((_, i) => (
                                  <View
                                    key={i}
                                    style={[
                                      styles.slotDot,
                                      {
                                        backgroundColor: i < remaining ? colors.accentBlue : colors.bgSubtle,
                                      },
                                    ]}
                                  />
                                ))}
                              </View>
                              <Text style={[styles.slotCount, { color: remaining > 0 ? colors.textPrimary : colors.textMuted }]}>
                                {remaining}/{s.total}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  </View>
                )}

                {/* Pact Magic Slots (Warlock) */}
                {magicState?.pactMagicSlots && (
                  <View style={[styles.resourceGroup, { borderTopColor: colors.borderSeparator, borderTopWidth: 1, paddingTop: 12 }]}>
                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                      Magia de pacto (Nv. {magicState.pactMagicSlots.slotLevel})
                    </Text>
                    <View style={styles.slotDots}>
                      {Array.from({ length: magicState.pactMagicSlots.total }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.slotDot,
                            {
                              backgroundColor:
                                i < magicState.pactMagicSlots!.total - magicState.pactMagicSlots!.used
                                  ? colors.accentDanger
                                  : colors.bgSubtle,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.slotCount, { color: colors.textPrimary, marginTop: 4 }]}>
                      {magicState.pactMagicSlots.total - magicState.pactMagicSlots.used}/{magicState.pactMagicSlots.total}
                    </Text>
                  </View>
                )}

                {/* Sorcery Points */}
                {magicState?.sorceryPoints && (
                  <View style={[styles.resourceGroup, { borderTopColor: colors.borderSeparator, borderTopWidth: 1, paddingTop: 12 }]}>
                    <View style={styles.resourceRow}>
                      <Text style={[styles.resourceName, { color: colors.textPrimary }]}>
                        Puntos de hechicería
                      </Text>
                      <Text style={[styles.resourceValue, { color: colors.accentDanger }]}>
                        {magicState.sorceryPoints.current}/{magicState.sorceryPoints.max}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Class Resources (Ki, Rage, etc.) */}
                {classResources && Object.keys(classResources.resources).length > 0 && (
                  <View style={[styles.resourceGroup, { borderTopColor: colors.borderSeparator, borderTopWidth: 1, paddingTop: 12 }]}>
                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                      Recursos de clase
                    </Text>
                    {Object.values(classResources.resources).map((res: ClassResourceInfo) => (
                      <View key={res.id} style={styles.resourceRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.resourceName, { color: colors.textPrimary }]}>
                            {res.nombre}
                          </Text>
                          <Text style={[styles.resourceRecovery, { color: colors.textMuted }]}>
                            {getRechargeLabel(res.recovery)}
                          </Text>
                        </View>
                        <Text style={[styles.resourceValue, { color: colors.accentGold }]}>
                          {res.max >= UNLIMITED_RESOURCE ? `∞` : `${res.current}/${res.max}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
          </Section>
        )}

        {/* â•â•â• Inventory & Money â•â•â• */}
        {inventory && (
          <Section title="Inventario" icon="bag-outline" expanded={expandedSections.has("inventory")} onToggle={() => toggleSection("inventory")} colors={colors}>
                {/* Money */}
                <View style={styles.resourceGroup}>
                  <View style={styles.coinHeader}>
                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary, marginBottom: 0 }]}>
                      Monedas
                    </Text>
                    {!editingCoins ? (
                      <TouchableOpacity onPress={startEditingCoins} hitSlop={8}>
                        <Ionicons name="pencil-outline" size={16} color={colors.accentGold} />
                      </TouchableOpacity>
                    ) : (
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity onPress={() => setEditingCoins(false)} hitSlop={8}>
                          <Ionicons name="close" size={18} color={colors.accentDanger} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={saveCoins} hitSlop={8}>
                          <Ionicons name="checkmark" size={18} color={colors.accentGreen} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {!editingCoins ? (
                    <View style={styles.coinRow}>
                      {COIN_ORDER.map((type) => (
                        <View key={type} style={[styles.coinBox, { backgroundColor: `${COIN_COLORS[type]}15`, borderColor: `${COIN_COLORS[type]}30` }]}>
                          <Text style={[styles.coinValue, { color: COIN_COLORS[type] }]}>
                            {inventory.coins[type]}
                          </Text>
                          <Text style={[styles.coinLabel, { color: colors.textMuted }]}>
                            {COIN_ABBR[type]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.coinRow}>
                      {COIN_ORDER.map((type) => (
                        <View key={type} style={[styles.coinEditBox, { borderColor: COIN_COLORS[type] }]}>
                          <Text style={[styles.coinLabel, { color: COIN_COLORS[type], marginBottom: 2 }]}>
                            {COIN_ABBR[type]}
                          </Text>
                          <TextInput
                            style={[styles.coinInput, { color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                            keyboardType="numeric"
                            value={coinDraft[type]}
                            onChangeText={(v) => setCoinDraft(prev => ({ ...prev, [type]: v }))}
                            selectTextOnFocus
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Items list */}
                <View style={[styles.resourceGroup, { borderTopColor: colors.borderSeparator, borderTopWidth: 1, paddingTop: 12 }]}>
                  <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>
                    Objetos ({inventory.items.length})
                  </Text>

                  {inventory.items.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                      Sin objetos
                    </Text>
                  ) : (
                    inventory.items.map((item) => (
                      <View
                        key={item.id}
                        style={[styles.inventoryItemRow, { borderBottomColor: colors.borderSeparator }]}
                      >
                        <View style={styles.inventoryItemInfo}>
                          <Text style={[styles.inventoryItemName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {item.nombre}
                          </Text>
                          <View style={styles.inventoryItemMeta}>
                            {item.cantidad > 1 && (
                              <Text style={[styles.inventoryItemQty, { color: colors.textMuted }]}>
                                x{item.cantidad}
                              </Text>
                            )}
                            {item.equipado && (
                              <View style={[styles.equippedBadge, { backgroundColor: withAlpha(colors.accentGreen, 0.12) }]}>
                                <Text style={[styles.equippedText, { color: colors.accentGreen }]}>Equipado</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item.id)}
                          hitSlop={8}
                          style={styles.removeItemBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.accentDanger} />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}

                  {/* Add item form */}
                  <View style={[styles.addItemRow, { borderTopColor: colors.borderSeparator }]}>
                    <TextInput
                      style={[styles.addItemInput, { color: colors.textPrimary, borderColor: colors.borderSubtle, backgroundColor: colors.bgSubtle }]}
                      placeholder="Nombre del objeto..."
                      placeholderTextColor={colors.textMuted}
                      value={addItemName}
                      onChangeText={setAddItemName}
                    />
                    <TextInput
                      style={[styles.addItemQtyInput, { color: colors.textPrimary, borderColor: colors.borderSubtle, backgroundColor: colors.bgSubtle }]}
                      placeholder="x"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={addItemQty}
                      onChangeText={setAddItemQty}
                    />
                    <TouchableOpacity
                      style={[
                        styles.addItemBtn,
                        { backgroundColor: addItemName.trim() ? colors.accentGold : colors.bgSubtle },
                      ]}
                      onPress={handleAddItem}
                      disabled={!addItemName.trim()}
                    >
                      <Ionicons name="add" size={18} color={addItemName.trim() ? colors.textInverted : colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
          </Section>
        )}

        {/* â•â•â• Traits â•â•â• */}
        {character.traits.length > 0 && (
          <Section title="Rasgos y capacidades" icon="ribbon-outline" expanded={expandedSections.has("traits")} onToggle={() => toggleSection("traits")} colors={colors}>
                {character.traits.map((trait) => (
                  <View key={trait.id} style={[styles.traitRow, { borderBottomColor: colors.borderSeparator }]}>
                    <View style={styles.traitHeader}>
                      <Text style={[styles.traitName, { color: colors.textPrimary }]}>
                        {trait.nombre}
                      </Text>
                      <Text style={[styles.traitSource, { color: colors.textMuted }]}>
                        {trait.origen}
                      </Text>
                    </View>
                    <Text style={[styles.traitDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                      {trait.descripcion}
                    </Text>
                    {trait.maxUses !== null && (
                      <View style={styles.traitUsesRow}>
                        <Text style={[styles.traitUses, { color: colors.accentGold }]}>
                          Usos: {trait.currentUses ?? 0}/{trait.maxUses}
                        </Text>
                        {trait.recharge && (
                          <Text style={[styles.traitRecharge, { color: colors.textMuted }]}>
                            ({getRechargeLabel(trait.recharge)})
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
          </Section>
        )}

        {/* â•â•â• Proficiencies â•â•â• */}
        <Section title="Competencias" icon="construct-outline" expanded={expandedSections.has("proficiencies")} onToggle={() => toggleSection("proficiencies")} colors={colors}>
            {character.proficiencies.armors.length > 0 && (
              <ProficiencyGroup
                label="Armaduras"
                items={character.proficiencies.armors}
                colors={colors}
              />
            )}
            {character.proficiencies.weapons.length > 0 && (
              <ProficiencyGroup
                label="Armas"
                items={character.proficiencies.weapons}
                colors={colors}
              />
            )}
            {character.proficiencies.tools.length > 0 && (
              <ProficiencyGroup
                label="Herramientas"
                items={character.proficiencies.tools}
                colors={colors}
              />
            )}
            {character.proficiencies.languages.length > 0 && (
              <ProficiencyGroup
                label="Idiomas"
                items={character.proficiencies.languages}
                colors={colors}
              />
            )}
        </Section>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function Section({
  title,
  icon,
  expanded,
  onToggle,
  colors,
  children,
}: Readonly<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  expanded: boolean;
  onToggle: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}>) {
  return (
    <View style={[styles.sectionWrapper, { backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.sectionIconBg, { backgroundColor: withAlpha(colors.accentGold, 0.13) }]}>
          <Ionicons name={icon} size={16} color={colors.accentGold} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={[styles.sectionContent, { borderTopColor: colors.borderDefault }]}>
          {children}
        </View>
      )}
    </View>
  );
}

function ProficiencyGroup({
  label,
  items,
  colors,
}: Readonly<{
  label: string;
  items: string[];
  colors: ThemeColors;
}>) {
  return (
    <View style={styles.profGroup}>
      <Text style={[styles.profGroupLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.profGroupItems, { color: colors.textPrimary }]}>
        {items.join(", ")}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: { fontSize: 14, marginTop: 8 },
  errorText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  errorLink: { fontSize: 14, fontWeight: "600", marginTop: 8 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 11, marginTop: 2 },

  realtimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  realtimeLabel: { fontSize: 10, fontWeight: "600" },

  // Summary Banner
  summaryBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryInfo: { flex: 1, marginRight: 12 },
  summaryName: { fontSize: 14, fontWeight: "700" },
  summaryClass: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  summaryBg: { fontSize: 12, marginTop: 2 },

  summaryHp: { alignItems: "flex-end", minWidth: 90 },
  hpBigValue: { fontSize: 24, fontWeight: "900" },
  hpBigMax: { fontSize: 14, fontWeight: "500" },
  hpBarBg: { width: 90, height: 6, borderRadius: 3, marginTop: 4 },
  hpBarFill: { height: 6, borderRadius: 3 },
  hpStatusLabel: { fontSize: 10, fontWeight: "700", marginTop: 2, textTransform: "uppercase" },
  hpTemp: { fontSize: 10, fontWeight: "600", marginTop: 1 },

  conditionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  conditionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  conditionText: { fontSize: 11, fontWeight: "600" },

  concentrationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  concentrationText: { fontSize: 12, fontWeight: "600" },

  // ScrollView
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Section wrapper (unified card)
  sectionWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  sectionIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },

  // Section content (shown when expanded)
  sectionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    paddingTop: 12,
  },

  // Abilities
  abilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  abilityBox: {
    width: "30%",
    flexGrow: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  abilityAbbr: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  abilityTotal: { fontSize: 22, fontWeight: "900", marginVertical: 2 },
  abilityModPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 4,
  },
  abilityMod: { fontSize: 14, fontWeight: "700" },

  profRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  profLabel: { fontSize: 13, fontWeight: "500" },
  profValue: { fontSize: 16, fontWeight: "800" },

  savingThrowsRow: { marginTop: 12 },
  subSectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  savingThrowsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  savingThrowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: "28%",
  },
  profDot: { width: 8, height: 8, borderRadius: 4 },
  stAbbr: { fontSize: 11, fontWeight: "600" },
  stValue: { fontSize: 13, fontWeight: "700" },

  // Combat
  combatGrid: {
    flexDirection: "row",
    gap: 8,
  },
  combatCircleCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  combatStatCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  combatStatValue: { fontSize: 14, fontWeight: "800", textAlign: "center" },
  combatStatLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", textAlign: "center" },

  deathSavesRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  deathSavesValues: { flexDirection: "row", gap: 24 },
  deathSaveGroup: { gap: 6 },
  deathSaveLabel: { fontSize: 11, fontWeight: "700" },
  deathSaveDots: { flexDirection: "row", gap: 6 },
  deathDot: { width: 10, height: 10, borderRadius: 5 },

  damageModRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  damageModChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  damageChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  damageChipText: { fontSize: 11, fontWeight: "600" },

  // Skills
  skillsList: { gap: 1 },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 8,
  },
  skillProfDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  skillName: { flex: 1, fontSize: 13, fontWeight: "500" },
  skillAbil: { fontSize: 10, fontWeight: "600", width: 28, textAlign: "center" },
  skillBonus: { fontSize: 14, fontWeight: "700", width: 30, textAlign: "right" },

  // Spells
  spellSection: { marginBottom: 4 },
  spellChipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  spellChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  spellChipLevel: { fontSize: 10, fontWeight: "800" },
  spellChipName: { fontSize: 12, fontWeight: "500", maxWidth: 140 },

  // Traits
  traitRow: { paddingVertical: 10, borderBottomWidth: 1 },
  traitHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  traitName: { fontSize: 14, fontWeight: "700", flex: 1 },
  traitSource: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  traitDesc: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  traitUsesRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  traitUses: { fontSize: 12, fontWeight: "700" },
  traitRecharge: { fontSize: 11 },

  // Proficiencies
  profGroup: { marginBottom: 10 },
  profGroupLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  profGroupItems: { fontSize: 13, lineHeight: 20 },

  // Resources / Spell slots
  resourceGroup: { marginBottom: 4 },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotBox: {
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 70,
  },
  slotLevel: { fontSize: 11, fontWeight: "800", marginBottom: 4, letterSpacing: 0.3 },
  slotDots: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  slotDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  slotCount: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  resourceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  resourceName: { fontSize: 14, fontWeight: "600" },
  resourceValue: { fontSize: 16, fontWeight: "800" },
  resourceRecovery: { fontSize: 10, fontWeight: "500", marginTop: 1 },

  // Coins
  coinHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  coinRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  coinBox: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 52,
  },
  coinValue: { fontSize: 16, fontWeight: "800" },
  coinLabel: { fontSize: 10, fontWeight: "700", marginTop: 2, letterSpacing: 0.5 },
  coinEditBox: {
    alignItems: "center",
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 6,
  },
  coinInput: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    borderBottomWidth: 1,
    paddingVertical: 2,
    minWidth: 36,
  },

  // Inventory
  inventoryItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  inventoryItemInfo: { flex: 1, gap: 2 },
  inventoryItemName: { fontSize: 14, fontWeight: "600" },
  inventoryItemMeta: { flexDirection: "row", gap: 6, alignItems: "center" },
  inventoryItemQty: { fontSize: 12, fontWeight: "600" },
  equippedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  equippedText: { fontSize: 10, fontWeight: "700" },
  removeItemBtn: { padding: 6 },
  emptyText: { fontSize: 13, fontStyle: "italic", paddingVertical: 8 },
  addItemRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: "center",
  },
  addItemInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  addItemQtyInput: {
    width: 42,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  addItemBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
