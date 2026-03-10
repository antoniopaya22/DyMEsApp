import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { formatModifier, type Character } from "@/types/character";
import { withAlpha } from "@/utils/theme";
import { usePvFijos } from "@/stores/settingsStore";

interface HPStepProps {
  hpMethod: "fixed" | "roll";
  setHpMethod: (m: "fixed" | "roll") => void;
  hpRolled: number | null;
  setHpRolled: (v: number | null) => void;
  isRolling: boolean;
  rollHPDie: () => void;
  dieSides: number;
  fixedHP: number;
  conMod: number;
  hpGainTotal: number;
  newMaxHP: number;
  character: Character;
  classData: any;
}

export default function HPStep({
  hpMethod,
  setHpMethod,
  hpRolled,
  setHpRolled,
  isRolling,
  rollHPDie,
  dieSides,
  fixedHP,
  conMod,
  hpGainTotal,
  newMaxHP,
  character,
  classData,
}: HPStepProps) {
  const { colors } = useTheme();
  const pvFijos = usePvFijos();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          fontWeight: "500",
          textAlign: "center",
          marginBottom: 20,
          lineHeight: 20,
        }}
      >
        {pvFijos
          ? "Al subir de nivel, ganas Puntos de Golpe adicionales usando el valor fijo del dado de golpe."
          : "Al subir de nivel, ganas Puntos de Golpe adicionales. Elige cómo determinar los PG ganados."}
      </Text>

      {/* Method selection */}
      <View style={{ gap: 12, marginBottom: 20 }}>
        {/* Fixed option */}
        <TouchableOpacity
          onPress={() => {
            setHpMethod("fixed");
            setHpRolled(null);
          }}
          activeOpacity={0.7}
          style={{
            borderRadius: 14,
            borderWidth: 2,
            borderColor:
              hpMethod === "fixed"
                ? withAlpha(colors.accentRed, 0.5)
                : colors.borderDefault,
            backgroundColor:
              hpMethod === "fixed"
                ? withAlpha(colors.accentRed, 0.08)
                : colors.bgCard,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor:
                  hpMethod === "fixed"
                    ? withAlpha(colors.accentRed, 0.2)
                    : withAlpha(colors.textMuted, 0.15),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={
                  hpMethod === "fixed" ? colors.accentRed : colors.textMuted
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color:
                    hpMethod === "fixed"
                      ? colors.accentRed
                      : colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Valor Fijo
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                {fixedHP} (promedio de {classData?.hitDie ?? "d8"}) + CON (
                {formatModifier(conMod)})
              </Text>
            </View>
            <View
              style={{
                backgroundColor:
                  hpMethod === "fixed"
                    ? withAlpha(colors.accentRed, 0.2)
                    : withAlpha(colors.textMuted, 0.15),
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color:
                    hpMethod === "fixed"
                      ? colors.accentRed
                      : colors.textSecondary,
                  fontSize: 18,
                  fontWeight: "800",
                }}
              >
                +{Math.max(1, fixedHP + conMod)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Roll option */}
        {!pvFijos && (
          <TouchableOpacity
            onPress={() => setHpMethod("roll")}
            activeOpacity={0.7}
            style={{
              borderRadius: 14,
              borderWidth: 2,
              borderColor:
                hpMethod === "roll"
                  ? withAlpha(colors.accentRed, 0.5)
                  : colors.borderDefault,
              backgroundColor:
                hpMethod === "roll"
                  ? withAlpha(colors.accentRed, 0.08)
                  : colors.bgCard,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor:
                    hpMethod === "roll"
                      ? withAlpha(colors.accentRed, 0.2)
                      : withAlpha(colors.textMuted, 0.15),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="dice-outline"
                  size={20}
                  color={
                    hpMethod === "roll" ? colors.accentRed : colors.textMuted
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color:
                      hpMethod === "roll"
                        ? colors.accentRed
                        : colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Tirar Dado
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    fontWeight: "500",
                    marginTop: 2,
                  }}
                >
                  1{classData?.hitDie ?? "d8"} (1-{dieSides}) + CON (
                  {formatModifier(conMod)})
                </Text>
              </View>
              {hpMethod === "roll" && hpRolled !== null && (
                <View
                  style={{
                    backgroundColor: withAlpha(colors.accentRed, 0.2),
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: colors.accentRed,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    +{Math.max(1, hpRolled + conMod)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Roll dice button */}
      {!pvFijos && hpMethod === "roll" && (
        <View style={{ alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={rollHPDie}
            disabled={isRolling}
            activeOpacity={0.7}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              opacity: isRolling ? 0.7 : 1,
            }}
          >
            <View
              style={{
                backgroundColor: colors.accentRed,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
                paddingHorizontal: 32,
                gap: 8,
              }}
            >
              <Ionicons name="dice" size={22} color={colors.textInverted} />
              <Text
                style={{
                  color: colors.textInverted,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {isRolling
                  ? "Tirando..."
                  : hpRolled !== null
                    ? "Volver a tirar"
                    : `Tirar ${classData?.hitDie ?? "d8"}`}
              </Text>
            </View>
          </TouchableOpacity>

          {hpRolled !== null && !isRolling && (
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Dado:
                </Text>
                <View
                  style={{
                    backgroundColor: colors.bgCard,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: colors.borderDefault,
                  }}
                >
                  <Text
                    style={{
                      color: colors.accentRed,
                      fontSize: 20,
                      fontWeight: "900",
                    }}
                  >
                    {hpRolled}
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  + CON ({formatModifier(conMod)}) ={" "}
                </Text>
                <Text
                  style={{
                    color: colors.accentRed,
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  {Math.max(1, hpRolled + conMod)} PG
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* HP Preview */}
      {(hpMethod === "fixed" || hpRolled !== null) && (
        <View
          style={{
            marginTop: 20,
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderDefault,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="heart" size={20} color={colors.accentDanger} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              PG Máximos
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {character.hp.max}{" "}
            </Text>
            <Text
              style={{
                color: colors.accentRed,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              → {newMaxHP}
            </Text>
            <Text
              style={{
                color: colors.accentRed,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {" "}
              (+{hpGainTotal})
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
