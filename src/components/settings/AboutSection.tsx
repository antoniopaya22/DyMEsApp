/**
 * AboutSection - App info, license, tech, credits
 * Extracted from settings.tsx
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APP_INFO } from "@/stores/settingsStore";
import { useTheme } from "@/hooks";

interface AboutSectionProps {
  onOpenSRDLink: () => void;
}

export function AboutSection({ onOpenSRDLink }: AboutSectionProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.sectionContent,
        { borderTopColor: colors.borderSeparator },
      ]}
    >
      {/* App info */}
      <View
        style={[
          styles.aboutBlock,
          { borderBottomColor: colors.borderSeparator },
        ]}
      >
        <Text style={[styles.aboutAppName, { color: colors.accentGold }]}>
          {APP_INFO.nombre}
        </Text>
        <Text style={[styles.aboutVersion, { color: colors.sectionDescColor }]}>
          Versión {APP_INFO.version}
        </Text>
        <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
          {APP_INFO.descripcion}
        </Text>
      </View>

      {/* License */}
      <View
        style={[
          styles.aboutBlock,
          { borderBottomColor: colors.borderSeparator },
        ]}
      >
        <Text style={[styles.aboutSubtitle, { color: colors.textPrimary }]}>
          <Ionicons name="document-text-outline" size={15} color={colors.textPrimary} />{" "}
          Licencia SRD
        </Text>
        <Text style={[styles.aboutText, { color: colors.sectionDescColor }]}>
          {APP_INFO.licenciaSRD}
        </Text>
        <TouchableOpacity onPress={onOpenSRDLink} style={styles.link}>
          <Ionicons name="open-outline" size={14} color={colors.accentBlue} />
          <Text style={[styles.linkText, { color: colors.accentBlue }]}>
            SRD 5.1 en Español
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tech */}
      <View
        style={[
          styles.aboutBlock,
          { borderBottomColor: colors.borderSeparator },
        ]}
      >
        <Text style={[styles.aboutSubtitle, { color: colors.textPrimary }]}>
          <Ionicons name="build-outline" size={15} color={colors.textPrimary} />{" "}
          Tecnologías
        </Text>
        <View style={styles.techGrid}>
          {APP_INFO.tecnologias.map((tech) => (
            <View
              key={tech}
              style={[
                styles.techBadge,
                {
                  backgroundColor: colors.chipBg,
                  borderColor: colors.chipBorder,
                },
              ]}
            >
              <Text style={[styles.techBadgeText, { color: colors.chipText }]}>
                {tech}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Credits */}
      <View style={[styles.aboutBlock, { borderBottomWidth: 0 }]}>
        <Text style={[styles.aboutSubtitle, { color: colors.textPrimary }]}>
          <Ionicons name="person-outline" size={15} color={colors.textPrimary} />{" "}
          Créditos
        </Text>
        <Text style={[styles.aboutText, { color: colors.sectionDescColor }]}>
          Desarrollado por {APP_INFO.desarrollador}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContent: {},
  aboutBlock: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  aboutAppName: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  aboutVersion: {
    fontSize: 13,
    marginTop: 2,
  },
  aboutDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  aboutSubtitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 19,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
    textDecorationLine: "underline",
  },
  techGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  techBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  techBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
