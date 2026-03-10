/**
 * AvatarPreviewModal - Full-screen avatar preview overlay
 *
 * Shows the character avatar image in a large, centered modal
 * when the user taps on the small avatar thumbnail.
 * Features smooth fade + scale animation and tap-to-dismiss.
 */

import {
  View,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import type { ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useModalAnimation } from "@/hooks";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_SIZE = Math.min(SCREEN_WIDTH - 64, SCREEN_HEIGHT * 0.45, 360);

export interface AvatarPreviewModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** The image source to display */
  source: ImageSource | null;
  /** Character name shown below the image */
  characterName?: string;
  /** Called when the modal should close */
  onClose: () => void;
}

export default function AvatarPreviewModal({
  visible,
  source,
  characterName,
  onClose,
}: AvatarPreviewModalProps) {
  const { colors, isDark } = useTheme();

  const { backdropAnim, scaleAnim, fadeAnim, dismiss } = useModalAnimation({
    visible,
    onDismiss: onClose,
    initialScale: 0.7,
    dismissScale: 0.7,
    springFriction: 7,
  });

  const handleClose = () => dismiss();

  if (!source) return null;

  const borderColor = isDark ? colors.borderDefault : colors.borderSubtle;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          {/* Backdrop */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.80)"
                  : "rgba(0,0,0,0.60)",
                opacity: backdropAnim,
              },
            ]}
          />

          {/* Image container */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                backgroundColor: colors.bgCard,
                borderColor,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={source}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />

            {/* Character name overlay at bottom */}
            {characterName && (
              <View style={styles.nameOverlay}>
                <View
                  style={[
                    styles.nameBg,
                    {
                      backgroundColor: isDark
                        ? "rgba(0,0,0,0.65)"
                        : "rgba(0,0,0,0.50)",
                    },
                  ]}
                >
                  <Animated.Text
                    style={[styles.nameText, { color: "#fff" }]}
                    numberOfLines={1}
                  >
                    {characterName}
                  </Animated.Text>
                </View>
              </View>
            )}

            {/* Close hint */}
            <View style={styles.closeHint}>
              <View
                style={[
                  styles.closeHintBg,
                  {
                    backgroundColor: isDark
                      ? "rgba(0,0,0,0.55)"
                      : "rgba(0,0,0,0.40)",
                  },
                ]}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000", // static: theme-independent
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  nameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  nameBg: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  closeHint: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeHintBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
