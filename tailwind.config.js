/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // ─── Animation Durations ─────────────────────────────────
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        450: "450ms",
      },
      colors: {
        // Color primario de la app — azul turquesa neón
        primary: {
          50: "#F0FDFF",
          100: "#CCFBFF",
          200: "#99F6FF",
          300: "#67EEFF",
          400: "#33E5FF",
          500: "#00E5FF",
          600: "#0E7490",
          700: "#0C5E75",
          800: "#0A4D61",
          900: "#083D4D",
          950: "#062D39",
        },
        // Fondo oscuro temático — azul marino profundo
        dark: {
          50: "#EDF2F7",
          100: "#E2E8F0",
          200: "#CBD5E1",
          300: "#8899AA",
          400: "#5A6F82",
          500: "#2D4054",
          600: "#1E2D42",
          700: "#182338",
          800: "#101B2E",
          900: "#0B1221",
          950: "#060A14",
        },
        // Cian / Teal — escala complementaria
        gold: {
          50: "#F0FDFF",
          100: "#CCFBFE",
          200: "#99F0FE",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
          950: "#083344",
        },
        // Colores de características de D&D
        str: "#dc2626", // Fuerza - Rojo
        dex: "#16a34a", // Destreza - Verde
        con: "#ea580c", // Constitución - Naranja
        int: "#2563eb", // Inteligencia - Azul
        wis: "#9333ea", // Sabiduría - Púrpura
        cha: "#db2777", // Carisma - Rosa
        // Colores de estado de vida
        hp: {
          full: "#22c55e",
          high: "#84cc16",
          mid: "#eab308",
          low: "#f97316",
          critical: "#ef4444",
          temp: "#3b82f6",
        },
        // Colores de rareza de objetos
        rarity: {
          common: "#9ca3af",
          uncommon: "#22c55e",
          rare: "#3b82f6",
          "very-rare": "#a855f7",
          legendary: "#f59e0b",
          artifact: "#ef4444",
        },
        // Escuelas de magia
        magic: {
          abjuration: "#3b82f6",
          conjuration: "#f59e0b",
          divination: "#a3a3a3",
          enchantment: "#ec4899",
          evocation: "#ef4444",
          illusion: "#a855f7",
          necromancy: "#22c55e",
          transmutation: "#f97316",
        },
        // Superficie y bordes — azul marino
        surface: {
          DEFAULT: "#101B2E",
          light: "#182338",
          lighter: "#1E2D42",
          card: "#101B2E",
          border: "#1E2D42",
        },
        parchment: {
          DEFAULT: "#EDF2F7",
          dark: "#DAE2EC",
          light: "#F1F5F9",
          card: "#F7FAFC",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        card: "14px",
        "card-lg": "18px",
        "card-sm": "10px",
      },
      spacing: {
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        88: "22rem",
        100: "25rem",
        120: "30rem",
      },
      // ─── Opacity Tokens ────────────────────────────────────
      opacity: {
        3: "0.03",
        4: "0.04",
        6: "0.06",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        85: "0.85",
      },
      // ─── Font Size Extensions ──────────────────────────────
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        "3xs": ["8px", { lineHeight: "12px" }],
      },
      // ─── Letter Spacing ────────────────────────────────────
      letterSpacing: {
        "extra-wide": "0.15em",
        "ultra-wide": "0.25em",
      },
      // ─── Z-index ───────────────────────────────────────────
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      // ─── Min/Max Heights ───────────────────────────────────
      minHeight: {
        14: "3.5rem",
        16: "4rem",
        20: "5rem",
      },
    },
  },
  plugins: [],
};
