/**
 * RulesSection - Optional D&D 5e rules toggles
 * Extracted from settings.tsx
 */

import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTheme } from "@/hooks";

const RULES: {
  key:
    | "dotesActivas"
    | "multiclase"
    | "pvFijos"
    | "compraPuntos"
    | "encumbranceDetallada";
  label: string;
  desc: string;
  comingSoon?: boolean;
}[] = [
  {
    key: "dotesActivas",
    label: "Dotes (Feats)",
    desc: "Permite elegir dotes en lugar de ASI al subir de nivel.",
  },
  {
    key: "multiclase",
    label: "Multiclase",
    desc: "Permite subir de nivel en una clase diferente.",
    comingSoon: true,
  },
  {
    key: "pvFijos",
    label: "PV fijos al subir de nivel",
    desc: "Usa el valor fijo del dado en lugar de tirar.",
  },
  {
    key: "compraPuntos",
    label: "Compra de puntos",
    desc: "Habilita el sistema de compra de puntos de característica en la creación.",
  },
  {
    key: "encumbranceDetallada",
    label: "Carga detallada",
    desc: "Aplica reglas de carga y peso estrictas.",
  },
];

interface RulesSectionProps {
  onResetRules: () => void;
}

export function RulesSection({ onResetRules }: RulesSectionProps) {
  const { colors } = useTheme();
  const { settings, toggleOptionalRule } = useSettingsStore();

  return (
    <View
      style={[
        styles.sectionContent,
        { borderTopColor: colors.borderSeparator },
      ]}
    >
      <Text
        style={[styles.sectionDescription, { color: colors.sectionDescColor }]}
      >
        Activa o desactiva reglas opcionales de D&D 5e. Estos ajustes se aplican
        a todos los personajes.
      </Text>

      {RULES.map((rule) => (
        <View
          key={rule.key}
          style={[
            styles.ruleRow,
            { borderBottomColor: colors.borderSeparator },
            rule.comingSoon && { opacity: 0.5 },
          ]}
        >
          <View style={styles.ruleInfo}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={[styles.ruleLabel, { color: colors.textPrimary }]}>
                {rule.label}
              </Text>
              {rule.comingSoon && (
                <View
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 10,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Próximamente
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.ruleDesc, { color: colors.textMuted }]}>
              {rule.desc}
            </Text>
          </View>
          <Switch
            value={
              rule.comingSoon ? false : settings.reglasOpcionales[rule.key]
            }
            onValueChange={() => toggleOptionalRule(rule.key)}
            disabled={rule.comingSoon}
            trackColor={{
              false: colors.switchTrackOff,
              true: colors.switchTrackOn,
            }}
            thumbColor={
              rule.comingSoon
                ? colors.switchThumbOff
                : settings.reglasOpcionales[rule.key]
                  ? colors.switchThumbOn
                  : colors.switchThumbOff
            }
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={onResetRules}
        style={[
          styles.resetButton,
          {
            backgroundColor: colors.optionBg,
            borderColor: colors.optionBorder,
          },
        ]}
      >
        <Ionicons name="refresh" size={16} color={colors.sectionDescColor} />
        <Text
          style={[styles.resetButtonText, { color: colors.sectionDescColor }]}
        >
          Restablecer reglas por defecto
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContent: {},
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 12,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ruleInfo: {
    flex: 1,
    marginRight: 12,
  },
  ruleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  ruleDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
});
