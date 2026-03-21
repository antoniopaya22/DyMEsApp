/**
 * Auth Store — Zustand store for authentication and user profile.
 *
 * Handles Google OAuth via Supabase’s signInWithOAuth + expo-web-browser,
 * email/password auth, session management, profile loading, and
 * app-mode switching (jugador / master).
 *
 * Google OAuth flow:
 *  1. supabase.auth.signInWithOAuth generates the authorization URL
 *  2. We open it with WebBrowser.openAuthSessionAsync
 *  3. Supabase redirects back to the custom scheme (dymes://)
 *  4. We extract the tokens from the URL fragment and set the session
 */

import { create } from "zustand";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { makeRedirectUri } from "expo-auth-session";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import type { Profile, AppMode } from "@/types/master";
import { translateAuthError } from "@/utils/auth";
import { clearUserData, extractErrorMessage } from "@/utils/storage";
import { restoreFromCloud } from "@/services/supabaseService";
import { useCharacterStore } from "./characterStore";
import { useCampaignStore } from "./campaignStore";
import { useCharacterListStore } from "./characterListStore";
import { useMasterStore } from "./masterStore";

// Warm up the browser on Android for faster OAuth popup
if (Platform.OS === "android") {
  WebBrowser.warmUpAsync();
}

// Redirect URI for OAuth callback
// makeRedirectUri() auto-detects:
//  - Expo Go    → exp://IP:PORT/--/  (IP-dependent but covered by wildcard)
//  - Standalone → dymes://           (from app.json scheme, stable)
//
// The "/--/" path suffix is REQUIRED in Expo Go: Android's intent filter
// for Expo Go only intercepts URLs matching exp://HOST:PORT/--/*.
// Without it, the browser redirect can't return to the app.
//
// Supabase uses "**" (globstar) that matches ANY sequence of characters
// including "." and "/", so "exp://**" covers "exp://IP:PORT/--/".
//
// Supabase Dashboard → Redirect URLs:  exp://**  and  dymes://**
function getRedirectUri(): string {
  if (Platform.OS === "web") {
    if (globalThis.window === undefined) return "";
    return globalThis.location.origin;
  }
  
  // Expo requires the /--/ path suffix for deep linking to intercept callbacks properly in Expo Go
  // This explicitly generates exp://IP:PORT/--/ instead of just exp://IP:PORT
  const baseUri = makeRedirectUri();
  
  // Add /--/ safely if we're in Expo Go and it wasn't added automatically
  if (baseUri.startsWith('exp://') && !baseUri.includes('/--/')) {
     const separator = baseUri.endsWith('/') ? '--/' : '/--/';
     return `${baseUri}${separator}`;
  }
  
  return baseUri;
}
const REDIRECT_URI = getRedirectUri();

/**
 * Parse an OAuth callback URL and establish a Supabase session.
 * Handles both PKCE (?code=xxx) and implicit (#access_token=xxx) flows.
 * Returns the session if successfully established.
 */
async function extractAndSetSession(callbackUrl: string): Promise<Session | null> {
  try {
    const url = new URL(callbackUrl);

    // PKCE flow: ?code=xxx
    const code = url.searchParams.get("code");
    if (code) {
      console.log("[AuthStore] PKCE code detected, exchanging for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error(
          "[AuthStore] exchangeCodeForSession failed:",
          error.message,
        );
        return null;
      }
      return data.session;
    }

    // Implicit flow: #access_token=xxx&refresh_token=xxx
    const fragment = url.hash.substring(1);
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        console.log("[AuthStore] Implicit tokens detected, setting session...");
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error("[AuthStore] setSession failed:", error.message);
          return null;
        }
        return data.session;
      }
    }

    console.warn(
      "[AuthStore] Callback URL had no code or tokens:",
      callbackUrl.substring(0, 100),
    );
    return null;
  } catch (err) {
    console.error("[AuthStore] extractAndSetSession error:", err);
    return null;
  }
}

// ─── State ───────────────────────────────────────────────────────────

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  /** Success message (e.g. after signup requiring email confirmation) */
  successMessage: string | null;
}

interface AuthActions {
  initialize: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Register a new account with email + password + optional display name */
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setAppMode: (mode: AppMode) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Store ───────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ── Initial state ──
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  error: null,
  successMessage: null,

  // ── Initialize ──
  initialize: () => {
    // 1. Restore existing session
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        set({
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true,
        });
        if (session?.user) {
          get().fetchProfile();
          // Restore campaigns + characters from Supabase if local storage is empty
          const restored = await restoreFromCloud(session.user.id);
          if (restored > 0) {
            console.log(
              `[AuthStore] Restored ${restored} campaigns from cloud`,
            );
            useCampaignStore.getState().loadCampaigns();
            useCharacterListStore.getState().loadCharacters();
          }
        }
      })
      .catch((err) => {
        console.error("[AuthStore] getSession failed:", err);
        set({ loading: false, initialized: true });
      });

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        console.log(
          "[AuthStore] onAuthStateChange:",
          _event,
          "session:",
          !!session,
          "user:",
          session?.user?.email,
        );
        // Synchronous state update — safe to do inside the callback.
        set({ session, user: session?.user ?? null, loading: false });

        if (session?.user) {
          // IMPORTANT: Defer all async Supabase queries to the next tick.
          // supabase-js v2 fires onAuthStateChange while holding an internal
          // session lock. Any REST query (fetchProfile, restoreFromCloud)
          // needs to read the session via the same lock → deadlock.
          // setTimeout(0) ensures the lock is released before we query.
          const userId = session.user.id;
          const event = _event;
          setTimeout(async () => {
            await get().fetchProfile();
            if (event === "SIGNED_IN") {
              const restored = await restoreFromCloud(userId);
              if (restored > 0) {
                console.log(
                  `[AuthStore] Restored ${restored} campaigns from cloud`,
                );
                useCampaignStore.getState().loadCampaigns();
                useCharacterListStore.getState().loadCharacters();
              }
            }
          }, 0);
        } else {
          set({ profile: null });
        }
      },
    );

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  },

  // ── Google Sign-In ──
  // Web: direct redirect (page navigates to Google → back to app).
  //       detectSessionInUrl + onAuthStateChange handle the rest.
  // Native: popup via WebBrowser + manual token extraction.
  signInWithGoogle: async () => {
    set({ loading: true, error: null, successMessage: null });
    try {
      if (Platform.OS === "web") {
        // ── Web: full-page redirect ──
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: globalThis.location.origin,
          },
        });
        if (error) throw error;
        // The browser will navigate away; session is picked up on reload
        // via detectSessionInUrl + onAuthStateChange.
        return;
      }

      // ── Native: WebBrowser popup ──
      // 1. Get the OAuth authorization URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: REDIRECT_URI,
          skipBrowserRedirect: true,
        },
      });
      if (error || !data.url)
        throw error ?? new Error("No se obtuvo la URL de autorización");

      // 2. Open the auth URL in the system browser
      console.log("[AuthStore] Opening OAuth with REDIRECT_URI:", REDIRECT_URI);
      console.log("[AuthStore] Full auth URL:", data.url);
      // Extract the redirect_to that Supabase will use
      try {
        const authUrlParsed = new URL(data.url);
        console.log(
          "[AuthStore] redirect_to in auth URL:",
          authUrlParsed.searchParams.get("redirect_to"),
        );
      } catch {
        /* ignore parse errors */
      }

      // ── Set up a one-shot Linking listener ──
      // On Android / Expo Go, openAuthSessionAsync may return "dismiss"
      // even though the redirect DID succeed. In that case the callback
      // URL arrives as a Linking event. We capture it here so that
      // only ONE place ever calls setSession (no race condition).
      let linkingUrl: string | null = null;
      const linkingSub = Linking.addEventListener("url", (event) => {
        linkingUrl = event.url;
      });

      // Wrap openAuthSessionAsync with a timeout so it never hangs forever.
      const BROWSER_TIMEOUT_MS = 120_000; // 2 minutes
      const browserPromise = WebBrowser.openAuthSessionAsync(
        data.url,
        REDIRECT_URI,
      );
      let didTimeout = false;
      const timeoutPromise =
        new Promise<WebBrowser.WebBrowserAuthSessionResult>((resolve) =>
          setTimeout(() => {
            didTimeout = true;
            resolve({ type: WebBrowser.WebBrowserResultType.DISMISS });
          }, BROWSER_TIMEOUT_MS),
        );
      const result = await Promise.race([browserPromise, timeoutPromise]);

      // Clean up the Custom Tab on Android
      if (Platform.OS === "android") {
        WebBrowser.coolDownAsync();
      }

      // Clean up the Linking listener
      linkingSub.remove();

      console.log(
        "[AuthStore] WebBrowser result:",
        result.type,
        didTimeout ? "(timed out)" : "",
        result.type === "success"
          ? (result as { url?: string }).url?.substring(0, 100)
          : "",
      );

      // If timed out, try to close the browser popup
      if (didTimeout) {
        try {
          WebBrowser.dismissBrowser();
        } catch {
          /* may not be open */
        }
      }

      // Determine the callback URL: prefer WebBrowser's result,
      // fall back to the URL captured by the Linking listener.
      let callbackUrl: string | null = null;
      if (result.type === "success" && "url" in result && result.url) {
        callbackUrl = result.url;
      } else if (linkingUrl) {
        console.log(
          "[AuthStore] WebBrowser returned",
          result.type,
          "— using Linking URL as fallback",
        );
        callbackUrl = linkingUrl;
      }

      if (callbackUrl) {
        const establishedSession = await extractAndSetSession(callbackUrl);
        if (establishedSession) {
          // Immediately set the session to avoid a race condition with Expo Router
          // _layout.tsx needs the session populated before loading becomes false.
          set({
            session: establishedSession,
            user: establishedSession.user,
            loading: false,
          });
          return;
        }
      }

      // Wait briefly for onAuthStateChange in case session was set
      // through another path (e.g. cold start initial URL).
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // If onAuthStateChange already set the session, we're done
      if (get().session) {
        set({ loading: false });
        return;
      }

      // Otherwise, clear loading — user will need to try again
      console.warn(
        "[AuthStore] OAuth: no session established. " +
          "Ensure that the Redirect URL in Supabase Dashboard " +
          "(Authentication → URL Configuration) includes: " +
          REDIRECT_URI,
      );
      set({ loading: false });
    } catch (err) {
      const raw = extractErrorMessage(
        err,
        "Error al iniciar sesión con Google",
      );
      const message = translateAuthError(raw);
      console.error("[AuthStore] signInWithGoogle:", raw);
      set({ error: message, loading: false });
    }
  },

  // ── Email Sign-In ──
  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({
        session: data.session,
        user: data.user,
        loading: false,
      });
    } catch (err) {
      const raw = extractErrorMessage(err, "Error al iniciar sesión");
      const message = translateAuthError(raw);
      console.error("[AuthStore] signInWithEmail:", raw);
      set({ error: message, loading: false });
    }
  },

  // ── Email Sign-Up ──
  signUpWithEmail: async (email: string, password: string, name?: string) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: name ? { full_name: name } : undefined,
        },
      });
      if (error) throw error;

      // Supabase returns a fake user with no session when email already exists
      // (to prevent email enumeration). Detect this case:
      const isExistingUser =
        data.user && !data.session && data.user.identities?.length === 0;

      if (isExistingUser) {
        set({
          loading: false,
          error: "Ya existe una cuenta con este correo electrónico",
        });
        return;
      }

      // If email confirmation is required, session may be null
      if (data.session) {
        set({
          session: data.session,
          user: data.user,
          loading: false,
        });
      } else {
        set({
          loading: false,
          successMessage:
            "\u00a1Cuenta creada! Revisa tu correo para confirmar tu cuenta.",
        });
      }
    } catch (err) {
      const raw = extractErrorMessage(err, "Error al crear la cuenta");
      const message = translateAuthError(raw);
      console.error("[AuthStore] signUpWithEmail:", raw);
      set({ error: message, loading: false });
    }
  },

  // ── Sign Out ──
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all in-memory stores so the next user starts fresh
      useCharacterStore.getState().clearCharacter();
      useCampaignStore.setState({
        campaigns: [],
        activeCampaignId: null,
        loading: false,
        error: null,
      });
      useCharacterListStore.setState({
        characters: [],
        loading: false,
        error: null,
        migrated: false,
      });
      useMasterStore.setState({
        campaigns: [],
        activeCampaignId: null,
        players: [],
        loadingCampaigns: false,
        loadingPlayers: false,
        error: null,
      });

      // Also wipe persisted user data from AsyncStorage (keeps settings)
      await clearUserData();

      set({ session: null, user: null, profile: null, loading: false });
    } catch (err) {
      const raw = extractErrorMessage(err, "Error al cerrar sesión");
      const message = translateAuthError(raw);
      console.error("[AuthStore] signOut:", raw);
      set({ error: message, loading: false });
    }
  },

  // ── Fetch Profile ──
  fetchProfile: async () => {
    const user = get().user;
    if (!user) {
      console.log("[AuthStore] fetchProfile: no user, skipping");
      return;
    }

    try {
      console.log(
        "[AuthStore] fetchProfile: fetching for user",
        user.id,
        user.email,
      );
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn(
          "[AuthStore] fetchProfile error:",
          error.code,
          error.message,
        );
        // Table doesn't exist yet — skip silently
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          return;
        }

        // Profile row not found — auto-create it from user metadata
        // (the handle_new_user trigger may not have fired for this user)
        if (error.code === "PGRST116") {
          console.log(
            "[AuthStore] fetchProfile: no profile row found, creating one...",
          );
          const meta = user.user_metadata ?? {};
          const nombre =
            meta.full_name ||
            meta.name ||
            user.email?.split("@")[0] ||
            "Usuario";
          const avatarUrl = meta.avatar_url || meta.picture || null;

          const { data: created, error: insertErr } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              nombre,
              avatar_url: avatarUrl,
            })
            .select()
            .single();

          if (insertErr) {
            console.error(
              "[AuthStore] fetchProfile: failed to create profile:",
              insertErr.message,
            );
            return;
          }
          const createdProfile = created as Profile | null;
          console.log(
            "[AuthStore] fetchProfile: created profile",
            createdProfile?.nombre,
            createdProfile?.codigo_jugador,
          );
          set({ profile: createdProfile as Profile });
          return;
        }

        throw error;
      }
      const fetchedProfile = data as Profile | null;
      console.log(
        "[AuthStore] fetchProfile: got profile",
        fetchedProfile?.nombre,
        fetchedProfile?.codigo_jugador,
      );
      set({ profile: fetchedProfile as Profile });
    } catch (err) {
      console.error("[AuthStore] fetchProfile:", err);
    }
  },

  // ── Set App Mode ──
  setAppMode: async (mode: AppMode) => {
    const user = get().user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ modo_actual: mode })
        .eq("id", user.id);

      if (error) {
        // Table doesn't exist yet — just update local state
        if (error.message?.includes("does not exist")) {
          set((state) => ({
            profile: state.profile
              ? { ...state.profile, modo_actual: mode }
              : null,
          }));
          return;
        }
        throw error;
      }

      set((state) => ({
        profile: state.profile ? { ...state.profile, modo_actual: mode } : null,
      }));
    } catch (err) {
      console.error("[AuthStore] setAppMode:", err);
    }
  },

  // ── Clear Error ──
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
}));

// ─── Selectors ───────────────────────────────────────────────────────

export const selectIsAuthenticated = (state: AuthStore) => !!state.session;
export const selectPlayerCode = (state: AuthStore) =>
  state.profile?.codigo_jugador ?? null;
export const selectAppMode = (state: AuthStore) =>
  state.profile?.modo_actual ?? "jugador";
export const selectIsPremium = (state: AuthStore) =>
  state.profile?.es_premium ?? false;
