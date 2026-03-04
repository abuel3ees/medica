export interface ThemeColors {
  primary: string
  accent: string
  background: string
  card: string
  foreground: string
  border: string
  // dark mode overrides
  darkBackground: string
  darkCard: string
  darkForeground: string
  darkBorder: string
  darkPrimary: string
  darkAccent: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
  preview: { primary: string; accent: string; bg: string }
}

export const PRESET_THEMES: Theme[] = [
  {
    id: "terracotta",
    name: "Terracotta",
    description: "Warm earthy tones — the Medica classic",
    colors: {
      primary: "oklch(0.58 0.14 45)",
      accent: "oklch(0.62 0.12 145)",
      background: "oklch(0.97 0.008 75)",
      card: "oklch(0.995 0.004 80)",
      foreground: "oklch(0.16 0.02 70)",
      border: "oklch(0.91 0.01 75)",
      darkBackground: "oklch(0.14 0.01 70)",
      darkCard: "oklch(0.18 0.012 70)",
      darkForeground: "oklch(0.93 0.008 75)",
      darkBorder: "oklch(0.26 0.012 70)",
      darkPrimary: "oklch(0.70 0.14 45)",
      darkAccent: "oklch(0.68 0.12 145)",
    },
    preview: { primary: "#C46A47", accent: "#5A8A6A", bg: "#F5F0EB" },
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Cool professional blue with teal accents",
    colors: {
      primary: "oklch(0.55 0.14 250)",
      accent: "oklch(0.60 0.12 190)",
      background: "oklch(0.97 0.006 250)",
      card: "oklch(0.995 0.003 250)",
      foreground: "oklch(0.16 0.02 250)",
      border: "oklch(0.91 0.008 250)",
      darkBackground: "oklch(0.14 0.01 250)",
      darkCard: "oklch(0.18 0.012 250)",
      darkForeground: "oklch(0.93 0.006 250)",
      darkBorder: "oklch(0.26 0.012 250)",
      darkPrimary: "oklch(0.68 0.14 250)",
      darkAccent: "oklch(0.65 0.12 190)",
    },
    preview: { primary: "#3B7DD8", accent: "#2A9D8F", bg: "#F0F4FA" },
  },
  {
    id: "violet",
    name: "Royal Violet",
    description: "Elegant purple tones with rose accents",
    colors: {
      primary: "oklch(0.55 0.16 300)",
      accent: "oklch(0.62 0.14 350)",
      background: "oklch(0.97 0.008 300)",
      card: "oklch(0.995 0.004 300)",
      foreground: "oklch(0.16 0.02 300)",
      border: "oklch(0.91 0.01 300)",
      darkBackground: "oklch(0.14 0.01 300)",
      darkCard: "oklch(0.18 0.012 300)",
      darkForeground: "oklch(0.93 0.006 300)",
      darkBorder: "oklch(0.26 0.012 300)",
      darkPrimary: "oklch(0.70 0.16 300)",
      darkAccent: "oklch(0.68 0.14 350)",
    },
    preview: { primary: "#7C3AED", accent: "#EC4899", bg: "#F5F0FA" },
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    description: "Fresh greens with warm gold highlights",
    colors: {
      primary: "oklch(0.55 0.14 155)",
      accent: "oklch(0.65 0.14 80)",
      background: "oklch(0.97 0.008 150)",
      card: "oklch(0.995 0.004 150)",
      foreground: "oklch(0.16 0.02 150)",
      border: "oklch(0.91 0.01 150)",
      darkBackground: "oklch(0.14 0.01 150)",
      darkCard: "oklch(0.18 0.012 150)",
      darkForeground: "oklch(0.93 0.006 150)",
      darkBorder: "oklch(0.26 0.012 150)",
      darkPrimary: "oklch(0.68 0.14 155)",
      darkAccent: "oklch(0.72 0.14 80)",
    },
    preview: { primary: "#059669", accent: "#D97706", bg: "#F0FAF4" },
  },
  {
    id: "rose",
    name: "Rose Gold",
    description: "Soft pinks with warm rose gold feeling",
    colors: {
      primary: "oklch(0.60 0.14 15)",
      accent: "oklch(0.58 0.10 50)",
      background: "oklch(0.97 0.008 15)",
      card: "oklch(0.995 0.004 15)",
      foreground: "oklch(0.16 0.02 15)",
      border: "oklch(0.91 0.01 15)",
      darkBackground: "oklch(0.14 0.01 15)",
      darkCard: "oklch(0.18 0.012 15)",
      darkForeground: "oklch(0.93 0.006 15)",
      darkBorder: "oklch(0.26 0.012 15)",
      darkPrimary: "oklch(0.72 0.14 15)",
      darkAccent: "oklch(0.68 0.10 50)",
    },
    preview: { primary: "#E11D48", accent: "#C07A3A", bg: "#FDF2F4" },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Sleek dark theme with cyan neon accents",
    colors: {
      primary: "oklch(0.70 0.16 210)",
      accent: "oklch(0.72 0.14 150)",
      background: "oklch(0.97 0.004 210)",
      card: "oklch(0.995 0.002 210)",
      foreground: "oklch(0.16 0.02 210)",
      border: "oklch(0.91 0.006 210)",
      darkBackground: "oklch(0.12 0.015 260)",
      darkCard: "oklch(0.16 0.015 260)",
      darkForeground: "oklch(0.94 0.006 210)",
      darkBorder: "oklch(0.24 0.015 260)",
      darkPrimary: "oklch(0.75 0.16 210)",
      darkAccent: "oklch(0.72 0.14 150)",
    },
    preview: { primary: "#06B6D4", accent: "#10B981", bg: "#0F172A" },
  },
]

// ───────────────── Font presets ─────────────────

export interface FontPreset {
  id: string
  name: string
  family: string          // CSS font-family value
  fallback: string        // fallback stack
  sampleText: string      // preview sentence
}

export const PRESET_FONTS: FontPreset[] = [
  {
    id: "inter",
    name: "Inter",
    family: "Inter",
    fallback: "ui-sans-serif, system-ui, sans-serif",
    sampleText: "Clean and modern — the Medica default",
  },
  {
    id: "jakarta",
    name: "Plus Jakarta Sans",
    family: "Plus Jakarta Sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
    sampleText: "Friendly geometric with warm curves",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    family: "DM Sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
    sampleText: "Compact and balanced for data-heavy UIs",
  },
  {
    id: "nunito",
    name: "Nunito",
    family: "Nunito",
    fallback: "ui-sans-serif, system-ui, sans-serif",
    sampleText: "Soft, rounded, easy on the eyes",
  },
  {
    id: "outfit",
    name: "Outfit",
    family: "Outfit",
    fallback: "ui-sans-serif, system-ui, sans-serif",
    sampleText: "Sleek and contemporary with clean lines",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: "Space Grotesk",
    fallback: "ui-sans-serif, system-ui, sans-serif",
    sampleText: "Distinctive character with a techy edge",
  },
]

const THEME_STORAGE_KEY = "medica-theme"
const FONT_STORAGE_KEY = "medica-font"

export function getStoredThemeId(): string {
  if (typeof window === "undefined") return "terracotta"
  return localStorage.getItem(THEME_STORAGE_KEY) || "terracotta"
}

export function getStoredFontId(): string {
  if (typeof window === "undefined") return "inter"
  return localStorage.getItem(FONT_STORAGE_KEY) || "inter"
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const colors = theme.colors

  // Light mode vars
  root.style.setProperty("--primary", colors.primary)
  root.style.setProperty("--accent", colors.accent)
  root.style.setProperty("--background", colors.background)
  root.style.setProperty("--card", colors.card)
  root.style.setProperty("--foreground", colors.foreground)
  root.style.setProperty("--card-foreground", colors.foreground)
  root.style.setProperty("--popover", colors.card)
  root.style.setProperty("--popover-foreground", colors.foreground)
  root.style.setProperty("--secondary-foreground", colors.foreground)
  root.style.setProperty("--border", colors.border)
  root.style.setProperty("--input", colors.border)
  root.style.setProperty("--ring", colors.primary)
  root.style.setProperty("--sidebar-primary", colors.primary)
  root.style.setProperty("--sidebar-ring", colors.primary)
  root.style.setProperty("--chart-1", colors.primary)
  root.style.setProperty("--chart-2", colors.accent)

  // Store the theme id
  localStorage.setItem(THEME_STORAGE_KEY, theme.id)

  // Store dark overrides as data attributes for the theme applier
  root.dataset.themeId = theme.id
}

export function applyDarkOverrides(theme: Theme) {
  // Apply dark mode overrides via a style tag
  const id = "medica-theme-dark-overrides"
  let style = document.getElementById(id) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement("style")
    style.id = id
    document.head.appendChild(style)
  }
  const c = theme.colors
  style.textContent = `
    .dark {
      --primary: ${c.darkPrimary} !important;
      --accent: ${c.darkAccent} !important;
      --background: ${c.darkBackground} !important;
      --card: ${c.darkCard} !important;
      --foreground: ${c.darkForeground} !important;
      --card-foreground: ${c.darkForeground} !important;
      --popover: ${c.darkCard} !important;
      --popover-foreground: ${c.darkForeground} !important;
      --border: ${c.darkBorder} !important;
      --input: ${c.darkBorder} !important;
      --ring: ${c.darkPrimary} !important;
      --sidebar-primary: ${c.darkPrimary} !important;
      --sidebar-ring: ${c.darkPrimary} !important;
      --chart-1: ${c.darkPrimary} !important;
      --chart-2: ${c.darkAccent} !important;
    }
  `
}

export function initializeTheme() {
  const themeId = getStoredThemeId()
  if (themeId === "terracotta") return // default, no overrides needed
  const theme = PRESET_THEMES.find((t) => t.id === themeId)
  if (theme) {
    applyTheme(theme)
    applyDarkOverrides(theme)
  }
}

export function resetTheme() {
  const root = document.documentElement
  // Remove all inline style properties
  const props = [
    "--primary", "--accent", "--background", "--card", "--foreground",
    "--card-foreground", "--popover", "--popover-foreground", "--secondary-foreground",
    "--border", "--input", "--ring", "--sidebar-primary", "--sidebar-ring",
    "--chart-1", "--chart-2",
  ]
  props.forEach((p) => root.style.removeProperty(p))
  delete root.dataset.themeId

  // Remove dark overrides
  const style = document.getElementById("medica-theme-dark-overrides")
  if (style) style.remove()

  localStorage.setItem(THEME_STORAGE_KEY, "terracotta")
}

// ───────────────── Font helpers ─────────────────

export function applyFont(font: FontPreset) {
  const root = document.documentElement
  root.style.setProperty("--font-sans", `'${font.family}', ${font.fallback}`)
  localStorage.setItem(FONT_STORAGE_KEY, font.id)
}

export function resetFont() {
  const root = document.documentElement
  root.style.removeProperty("--font-sans")
  localStorage.setItem(FONT_STORAGE_KEY, "inter")
}

export function initializeFont() {
  const fontId = getStoredFontId()
  if (fontId === "inter") return // default, nothing to override
  const font = PRESET_FONTS.find((f) => f.id === fontId)
  if (font) {
    applyFont(font)
  }
}
