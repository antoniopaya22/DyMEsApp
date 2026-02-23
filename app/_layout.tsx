import "../global.css";

import React, { useEffect, useRef, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks";
import { DARK_THEME } from "@/utils/theme";

const MIN_SPLASH_MS = 1000;
SplashScreen.preventAutoHideAsync().catch(() => {});

// ─── Error Boundary ──────────────────────────────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />;
    }
    return this.props.children;
  }
}

// ─── Error Screen (with gradient background & polish) ────────────────

function ErrorScreen({ error }: { error: Error | null }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // ErrorScreen renders outside of theme context (inside ErrorBoundary),
  // so we use DARK_THEME tokens directly instead of the useTheme() hook.
  const c = DARK_THEME;

  return (
    <View style={[styles.errorContainer, { backgroundColor: c.bgPrimary }]}>
      <LinearGradient
        colors={[c.gradientMain[0], c.gradientMain[1], c.gradientMain[2]]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.errorContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Error icon with glow ring */}
        <View style={styles.errorIconOuter}>
          <View style={styles.errorIconRing} />
          <View
            style={[
              styles.errorIconBg,
              {
                backgroundColor: c.accentGoldGlow,
                borderColor: `${c.accentGold}1F`,
              },
            ]}
          >
            <Ionicons name="warning-outline" size={36} color={c.accentGold} />
          </View>
        </View>

        <Text style={[styles.errorTitle, { color: c.accentGold }]}>
          Error en la aplicación
        </Text>

        <View
          style={[
            styles.errorMessageContainer,
            { backgroundColor: c.dangerBg, borderColor: c.dangerBorder },
          ]}
        >
          <Text style={[styles.errorMessage, { color: c.dangerText }]}>
            {error?.message || "Error desconocido"}
          </Text>
        </View>

        {error?.stack ? (
          <View style={styles.errorStackContainer}>
            <Text style={[styles.errorStackLabel, { color: c.textMuted }]}>
              Detalles técnicos
            </Text>
            <View
              style={[
                styles.errorStackBox,
                { backgroundColor: c.bgSubtle, borderColor: c.borderSubtle },
              ]}
            >
              <Text style={[styles.errorStack, { color: c.textMuted }]}>
                {error.stack.slice(0, 400)}
                {error.stack.length > 400 ? "..." : ""}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Hint text */}
        <View style={styles.errorHintRow}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={c.textMuted}
          />
          <Text style={[styles.errorHintText, { color: c.textMuted }]}>
            Intenta reiniciar la aplicación. Si el problema persiste, contacta
            con soporte.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Inner Layout (needs to be inside ErrorBoundary, uses hooks) ─────

function InnerLayout() {
  const { colors, isDark } = useTheme();
  const { loaded, loadSettings } = useSettingsStore();
  const { initialize, initialized, session } = useAuthStore();
  const { setColorScheme } = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Initialize auth (restore session + listen)
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  // ── Auth-based route protection ──
  // Redirect to login when not authenticated,
  // or away from login when already authenticated.
  useEffect(() => {
    if (!initialized || !appReady) return;

    const firstSegment = segments[0] ?? "";
    const onLoginScreen = firstSegment === "login";

    if (!session && !onLoginScreen) {
      // Not authenticated → go to login
      router.replace("/login");
    } else if (session && onLoginScreen) {
      // Authenticated → leave login screen
      router.replace("/mode-select");
    }
  }, [session, initialized, appReady, segments, router]);

  // Load settings on mount so the theme is available immediately
  useEffect(() => {
    let isMounted = true;
    const start = Date.now();

    const prepare = async () => {
      if (!loaded) {
        await loadSettings();
      }

      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      if (isMounted) {
        setAppReady(true);
      }
    };

    prepare();

    return () => {
      isMounted = false;
    };
  }, [loaded, loadSettings]);

  // Sync the custom theme store with NativeWind's color scheme
  // so that dark: variants in className work correctly
  useEffect(() => {
    setColorScheme(isDark ? "dark" : "light");
  }, [isDark, setColorScheme]);

  useEffect(() => {
    if (appReady && initialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady, initialized]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <LinearGradient
        colors={[colors.gradientMain[0], colors.gradientMain[3]]}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar style={colors.statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "slide_from_right",
          animationDuration: 250,
        }}
      >
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="mode-select" options={{ animation: "fade" }} />
        <Stack.Screen name="index" />
        <Stack.Screen name="campaigns" />
        <Stack.Screen name="create" />
        <Stack.Screen
          name="character"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="master" />
        <Stack.Screen
          name="settings"
          options={{
            animation: "slide_from_bottom",
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="account"
          options={{
            animation: "slide_from_bottom",
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="compendium"
          options={{
            animation: "slide_from_right",
            animationDuration: 250,
          }}
        />
      </Stack>
    </View>
  );
}

// ─── Root Layout ─────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <InnerLayout />
    </ErrorBoundary>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Error Screen ──
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorContent: {
    alignItems: "center",
    maxWidth: 360,
    width: "100%",
  },
  errorIconOuter: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  errorIconRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "rgba(178,172,136,0.15)",
  },
  errorIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  errorMessageContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  errorStackContainer: {
    width: "100%",
    marginBottom: 20,
  },
  errorStackLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  errorStackBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorStack: {
    fontSize: 11,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  errorHintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 8,
    gap: 6,
    marginTop: 4,
  },
  errorHintText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
});
