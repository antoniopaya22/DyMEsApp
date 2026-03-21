/**
 * ClassResourcesCombatSection — Recursos de clase en la pestaña de combate.
 *
 * Muestra un tracker interactivo para TODOS los recursos de clase
 * (Furia, Ki, Oleada de Acción, Canalizar Divinidad, Forma Salvaje,
 * Imposición de Manos, Inspiración Bárdica, etc.)
 *
 * Auto-contenido: lee todo del store directamente.
 * Filtra puntos_hechiceria para hechicero (ya gestionados en SpellCombatSection).
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useDialog, useToast } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { useCharacterStore } from "@/stores/characterStore";
import { UNLIMITED_RESOURCE } from "@/stores/characterStore/helpers";
import { getClassData } from "@/data/srd/classes";
import { ConfirmDialog, Toast } from "@/components/ui";

// ─── Resource icon mapping ───────────────────────────────────────────

const RESOURCE_ICONS: Record<string, string> = {
  furia: "flame",
  ki: "hand-left",
  tomar_aliento: "heart",
  oleada_accion: "flash",
  indomable: "shield-checkmark",
  canalizar_divinidad: "sunny",
  forma_salvaje: "paw",
  imposicion_de_manos: "hand-right",
  inspiracion_bardica: "musical-notes",
  recuperacion_arcana: "book",
  enemigo_predilecto: "locate",
  velo_naturaleza: "leaf",
  golpe_de_suerte: "dice",
  astucia_magica: "eye",
  contactar_patron: "chatbox-ellipses",
  metabolismo_extraordinario: "fitness",
};

// ─── Component ───────────────────────────────────────────────────────

export function ClassResourcesCombatSection() {
  const { colors } = useTheme();
  const { dialogProps, showConfirm } = useDialog();
  const { toastProps, showInfo: showToast } = useToast();

  const {
    character,
    classResources,
    useClassResource,
    restoreClassResource,
    restoreAllClassResources,
  } = useCharacterStore();

  if (!character || !classResources) return null;

  // Filter out resources — skip puntos_hechiceria for hechicero (handled in SpellCombatSection)
  const resourceEntries = Object.values(classResources.resources).filter(
    (r) => !(character.clase === "hechicero" && r.id === "puntos_hechiceria"),
  );

  if (resourceEntries.length === 0) return null;

  const classColor = getClassData(character.clase).color;

  // ── Actions ──

  const handleUse = async (resourceId: string, nombre: string) => {
    const success = await useClassResource(resourceId);
    if (success) showToast(`${nombre} usado`);
    else showToast(`No quedan usos de ${nombre}`);
  };

  const handleRestore = async (resourceId: string, nombre: string) => {
    await restoreClassResource(resourceId);
    showToast(`${nombre} restaurado`);
  };

  const handleRestoreAll = () => {
    showConfirm(
      "Restaurar Recursos",
      "¿Restaurar todos los recursos de clase?",
      async () => {
        await restoreAllClassResources();
        showToast("Todos los recursos restaurados");
      },
      { confirmText: "Restaurar", cancelText: "Cancelar", type: "info" },
    );
  };

  // ── Render ──

  const hasUsed = resourceEntries.some(
    (r) => r.current < r.max && r.max < UNLIMITED_RESOURCE,
  );

  return (
    <>
      <View
        className="rounded-card border p-4 mb-4"
        style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name="flash" size={20} color={classColor} />
            <Text className="text-sm font-bold ml-2" style={{ color: colors.textPrimary }}>
              Recursos de Clase
            </Text>
          </View>
          {hasUsed && (
            <TouchableOpacity
              className="rounded-lg px-3 py-1.5 active:opacity-70"
              style={{ backgroundColor: withAlpha(classColor, 0.15) }}
              onPress={handleRestoreAll}
            >
              <Text className="text-xs font-semibold" style={{ color: classColor }}>
                Restaurar todos
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-[10px] mb-3" style={{ color: colors.textMuted }}>
          Toca un punto lleno para gastar, o uno vacío para recuperar
        </Text>

        {/* Resources */}
        {resourceEntries.map((res, idx) => {
          const isUnlimited = res.max >= UNLIMITED_RESOURCE;
          const iconName = RESOURCE_ICONS[res.id] ?? "ellipse";
          const showDots = res.max <= 10 && !isUnlimited;
          const pct = res.max > 0 && !isUnlimited ? (res.current / res.max) * 100 : 100;

          return (
            <View
              key={res.id}
              style={{ marginBottom: idx < resourceEntries.length - 1 ? 12 : 0 }}
            >
              {/* Resource header */}
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center" style={{ gap: 6 }}>
                  <Ionicons name={iconName as any} size={16} color={classColor} />
                  <Text className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {res.nombre}
                  </Text>
                </View>
                <Text className="text-xs font-bold" style={{ color: classColor }}>
                  {isUnlimited ? "∞" : `${res.current}/${res.max}`}
                </Text>
              </View>

              {/* Dot tracker for small resources */}
              {showDots && (
                <View className="flex-row flex-wrap items-center" style={{ gap: 4 }}>
                  {Array.from({ length: res.max }).map((_, i) => {
                    const isFilled = i < res.current;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() =>
                          isFilled
                            ? handleUse(res.id, res.nombre)
                            : handleRestore(res.id, res.nombre)
                        }
                        activeOpacity={0.6}
                        className="h-8 w-8 rounded-lg items-center justify-center border"
                        style={{
                          backgroundColor: isFilled
                            ? withAlpha(classColor, 0.15)
                            : colors.bgPrimary,
                          borderColor: isFilled
                            ? withAlpha(classColor, 0.4)
                            : colors.borderDefault,
                        }}
                      >
                        <Ionicons
                          name={isFilled ? (iconName as any) : `${iconName}-outline` as any}
                          size={14}
                          color={isFilled ? classColor : withAlpha(colors.textMuted, 0.4)}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Progress bar for large resources (Ki at high levels, Imposición de manos) */}
              {!showDots && !isUnlimited && (
                <View>
                  <View
                    className="h-3 rounded-full overflow-hidden mb-2"
                    style={{ backgroundColor: colors.bgSecondary }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: classColor,
                      }}
                    />
                  </View>
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <TouchableOpacity
                      className="flex-row items-center rounded-lg px-3 py-2 active:opacity-70"
                      onPress={() => handleUse(res.id, res.nombre)}
                      disabled={res.current <= 0}
                      style={{
                        backgroundColor: colors.bgCard,
                        opacity: res.current > 0 ? 1 : 0.4,
                      }}
                    >
                      <Ionicons name="remove-circle-outline" size={16} color={classColor} />
                      <Text className="text-xs font-semibold ml-1" style={{ color: colors.textSecondary }}>
                        −1
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center rounded-lg px-3 py-2 active:opacity-70"
                      onPress={() => handleRestore(res.id, res.nombre)}
                      disabled={res.current >= res.max}
                      style={{
                        backgroundColor: colors.bgCard,
                        opacity: res.current < res.max ? 1 : 0.4,
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={16} color={colors.accentGreen} />
                      <Text className="text-xs font-semibold ml-1" style={{ color: colors.textSecondary }}>
                        +1
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Unlimited indicator */}
              {isUnlimited && (
                <View className="flex-row items-center">
                  <Ionicons name="infinite" size={20} color={classColor} />
                  <Text className="text-xs ml-1.5" style={{ color: colors.textMuted }}>
                    Uso ilimitado
                  </Text>
                </View>
              )}

              {/* Recovery label */}
              <Text className="text-[10px] mt-1.5" style={{ color: colors.textMuted }}>
                Se recupera en:{" "}
                {res.recovery === "short_rest" ? "Descanso corto o largo" : "Descanso largo"}
              </Text>
            </View>
          );
        })}
      </View>

      <ConfirmDialog {...dialogProps} />
      <Toast {...toastProps} />
    </>
  );
}
