/**
 * Login Screen — Email + Google Sign-In with Supabase
 *
 * Supports two authentication flows:
 *  1. Email + password (sign in / sign up)
 *  2. Google OAuth via Supabase signInWithOAuth + WebBrowser
 */

import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type TextInput as TextInputType,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { DndLogo } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";

type AuthTab = "login" | "register";

// ─── Component ───────────────────────────────────────────────────────

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loading,
    error,
    successMessage,
    session,
    clearError,
    clearSuccess,
  } = useAuthStore();

  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Input refs for keyboard navigation
  const emailRef = useRef<TextInputType>(null);
  const passwordRef = useRef<TextInputType>(null);

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  const handleEmailSubmit = () => {
    if (!email.trim() || !password.trim()) return;
    if (tab === "login") {
      signInWithEmail(email.trim(), password);
    } else {
      signUpWithEmail(email.trim(), password, name.trim() || undefined);
    }
  };

  const switchTab = (next: AuthTab) => {
    clearError();
    clearSuccess();
    setPassword("");
    setName("");
    setTab(next);
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isValidEmail && password.length >= 6;

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.bgPrimary },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <LinearGradient
          colors={[colors.gradientMain[0], colors.gradientMain[3]]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ─── Logo ─── */}
          <View style={styles.logoContainer}>
            <DndLogo size="lg" animated />
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Gestiona tus partidas y personajes
          </Text>

          {/* ─── Tabs login / register ─── */}
          <AuthTabBar tab={tab} onSwitch={switchTab} />

          {/* ─── Messages ─── */}
          {error ? (
            <MessageBox
              message={error}
              variant="error"
              onDismiss={clearError}
            />
          ) : null}
          {successMessage ? (
            <MessageBox
              message={successMessage}
              variant="success"
              onDismiss={clearSuccess}
            />
          ) : null}

          {/* ─── Email form ─── */}
          <View style={styles.form}>
            {tab === "register" && (
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.bgInput,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.textMuted}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Nombre (opcional)"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            )}
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Correo electrónico"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                textContentType="emailAddress"
              />
            </View>

            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete={
                  tab === "register" ? "new-password" : "current-password"
                }
                ref={passwordRef}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (canSubmit) handleEmailSubmit();
                }}
                textContentType={
                  tab === "register" ? "newPassword" : "password"
                }
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  shadowColor: colors.accentShadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                },
                (!canSubmit || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleEmailSubmit}
              disabled={!canSubmit || loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  canSubmit && !loading
                    ? [
                        colors.gradientButtonStart,
                        colors.gradientButtonMid,
                        colors.gradientButtonEnd,
                      ]
                    : [colors.bgElevated, colors.bgCard, colors.bgSecondary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.textInverted} />
                ) : (
                  <Text
                    style={[
                      styles.submitText,
                      {
                        color: canSubmit
                          ? colors.textInverted
                          : colors.textMuted,
                      },
                    ]}
                  >
                    {tab === "login" ? "Entrar" : "Crear cuenta"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ─── Divider ─── */}
          <View style={styles.dividerRow}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: colors.borderSubtle },
              ]}
            />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>
              o
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: colors.borderSubtle },
              ]}
            />
          </View>

          {/* ─── Google button ─── */}
          <GoogleSignInButton loading={loading} onPress={handleGoogleSignIn} />

          {/* Privacy note */}
          <Text style={[styles.privacyText, { color: colors.textMuted }]}>
            Al continuar, aceptas los términos de uso{"\n"}y la política de
            privacidad.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    alignItems: "center",
    maxWidth: 360,
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: 1,
    marginBottom: 16,
    position: "relative",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    width: "50%",
    height: 2.5,
    borderRadius: 2,
  },
  tabText: {
    fontSize: 15,
  },

  // ── Messages ──
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    width: "100%",
    gap: 8,
  },
  messageText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 17,
  },

  // ── Form ──
  form: {
    width: "100%",
    gap: 12,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  submitButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitGradient: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Google ──
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000", // static: theme-independent
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    gap: 10,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Footer ──
  privacyText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },
});

// ─── Sub-components ──────────────────────────────────────────────────

const TAB_LABELS: Record<AuthTab, string> = {
  login: "Iniciar sesión",
  register: "Registrarse",
};

function AuthTabBar({
  tab,
  onSwitch,
}: Readonly<{ tab: AuthTab; onSwitch: (t: AuthTab) => void }>) {
  const { colors } = useTheme();
  const tabs: AuthTab[] = ["login", "register"];
  const indicatorAnim = useRef(
    new Animated.Value(tab === "login" ? 0 : 1),
  ).current;
  const containerWidth = useRef(0);

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: tab === "login" ? 0 : 1,
      friction: 20,
      tension: 170,
      useNativeDriver: true,
    }).start();
  }, [tab, indicatorAnim]);

  const halfWidth = containerWidth.current / 2 || 180;

  return (
    <View
      style={[styles.tabRow, { borderColor: colors.borderSubtle }]}
      onLayout={(e) => {
        containerWidth.current = e.nativeEvent.layout.width;
      }}
    >
      {/* Sliding indicator */}
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            backgroundColor: colors.accentRed,
            transform: [
              {
                translateX: indicatorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, halfWidth],
                }),
              },
            ],
          },
        ]}
      />
      {tabs.map((t) => {
        const active = tab === t;
        return (
          <TouchableOpacity
            key={t}
            style={styles.tab}
            onPress={() => onSwitch(t)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: active ? colors.accentRed : colors.textMuted,
                  fontWeight: active ? "700" : "500",
                },
              ]}
            >
              {TAB_LABELS[t]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MessageBox({
  message,
  variant,
  onDismiss,
}: Readonly<{
  message: string;
  variant: "error" | "success";
  onDismiss: () => void;
}>) {
  const { colors } = useTheme();
  const isError = variant === "error";
  const bg = isError ? colors.dangerBg : `${colors.accentGreen}15`;
  const border = isError ? colors.dangerBorder : `${colors.accentGreen}40`;
  const fg = isError ? colors.dangerText : colors.accentGreen;
  const icon = isError ? "alert-circle" : "checkmark-circle";

  return (
    <View
      style={[styles.messageBox, { backgroundColor: bg, borderColor: border }]}
    >
      <Ionicons name={icon} size={16} color={fg} />
      <Text style={[styles.messageText, { color: fg }]}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={8}>
        <Ionicons name="close" size={16} color={fg} />
      </TouchableOpacity>
    </View>
  );
}

function GoogleSignInButton({
  loading,
  onPress,
}: Readonly<{ loading: boolean; onPress: () => void }>) {
  const { colors, isDark } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.googleButton,
        {
          opacity: loading ? 0.7 : 1,
          backgroundColor: isDark ? colors.bgCard : "#FFFFFF",
          borderColor: isDark ? colors.borderDefault : "transparent",
          borderWidth: isDark ? 1 : 0,
        },
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text
            style={[
              styles.googleButtonText,
              { color: isDark ? colors.textPrimary : "#333333" },
            ]}
          >
            Continuar con Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
