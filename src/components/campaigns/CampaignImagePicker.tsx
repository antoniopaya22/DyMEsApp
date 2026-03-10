/**
 * CampaignImagePicker — Horizontal image selector for campaign headers.
 *
 * Displays the 5 campaign header images in a horizontal scroll.
 * The selected image gets a highlighted border and a check badge.
 */

import { useRef, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";
import {
  CAMPAIGN_IMAGES,
  type CampaignImageId,
} from "@/constants/campaignImages";

interface CampaignImagePickerProps {
  /** Currently selected image ID */
  selected: CampaignImageId | null;
  /** Called when an image is tapped */
  onSelect: (id: CampaignImageId) => void;
}

export function CampaignImagePicker({
  selected,
  onSelect,
}: CampaignImagePickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Imagen de portada
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CAMPAIGN_IMAGES.map((img) => {
          const isSelected = selected === img.id;
          return (
            <ImageOption
              key={img.id}
              imageId={img.id}
              source={img.source}
              label={img.label}
              isSelected={isSelected}
              accentColor={colors.accentGold}
              borderColor={colors.borderDefault}
              textColor={colors.textMuted}
              textSelectedColor={colors.accentGold}
              onSelect={onSelect}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Individual image option ─────────────────────────────────────────

interface ImageOptionProps {
  imageId: CampaignImageId;
  source: any;
  label: string;
  isSelected: boolean;
  accentColor: string;
  borderColor: string;
  textColor: string;
  textSelectedColor: string;
  onSelect: (id: CampaignImageId) => void;
}

function ImageOption({
  imageId,
  source,
  label,
  isSelected,
  accentColor,
  borderColor,
  textColor,
  textSelectedColor,
  onSelect,
}: ImageOptionProps) {
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isSelected, scaleAnim]);

  const borderScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(imageId)}
      style={styles.optionWrapper}
    >
      <Animated.View
        style={[
          styles.imageContainer,
          {
            borderColor: isSelected ? accentColor : borderColor,
            borderWidth: isSelected ? 2.5 : 1,
            transform: [{ scale: borderScale }],
          },
        ]}
      >
        <Image source={source} style={styles.image} resizeMode="cover" />

        {/* Dark overlay when NOT selected */}
        {!isSelected && <View style={styles.dimOverlay} />}

        {/* Gold gradient glow when selected */}
        {isSelected && (
          <LinearGradient
            colors={[`${accentColor}00`, `${accentColor}33`]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.selectedGlow}
          />
        )}

        {/* Check badge */}
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: accentColor }]}>
            <Ionicons name="checkmark" size={12} color="#FFF" />
          </View>
        )}
      </Animated.View>

      <Text
        style={[
          styles.optionLabel,
          { color: isSelected ? textSelectedColor : textColor },
          isSelected && styles.optionLabelSelected,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const IMAGE_WIDTH = 120;
const IMAGE_HEIGHT = 72;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  scroll: {
    paddingRight: 4,
    gap: 10,
  },
  optionWrapper: {
    alignItems: "center",
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  selectedGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000", // static: theme-independent
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 5,
    letterSpacing: 0.3,
  },
  optionLabelSelected: {
    fontWeight: "800",
  },
});
