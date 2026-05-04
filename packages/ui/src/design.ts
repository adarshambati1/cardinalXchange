export const colors = {
  paper: "#f8f8f6",
  cardinal: {
    50: "#fff1f1",
    100: "#ffe1e1",
    200: "#ffc8c8",
    300: "#ffa2a2",
    400: "#fc6f6f",
    500: "#ef4444",
    600: "#cc2525",
    700: "#8c1515",
    800: "#7b1414",
    900: "#651313",
    950: "#360707",
  },
  graphite: {
    50: "#f6f6f4",
    100: "#e9e8e3",
    200: "#d7d4cc",
    300: "#bdb8ac",
    400: "#9b9485",
    500: "#777163",
    600: "#5d574d",
    700: "#49443d",
    800: "#34312c",
    900: "#26231f",
    950: "#15130f",
  },
  gold: {
    50: "#fff8e5",
    100: "#ffedb8",
    200: "#ffdc7a",
    600: "#b77900",
    700: "#875a05",
    800: "#6f4b09",
  },
} as const;

export const fonts = {
  sans: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
} as const;

export const radii = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
} as const;

export const components = {
  Badge: {
    description: "Small label for public Q&A tags and lightweight status text.",
    variants: ["topic", "success"],
  },
  Button: {
    description: "Primary command primitive for forms and navigation actions.",
    sizes: ["sm", "md", "icon"],
    variants: ["primary", "secondary", "ghost", "quiet"],
  },
  Surface: {
    description: "Bordered white content container for Q&A lists, forms, and panels.",
  },
} as const;

export const designSystem = {
  colors,
  components,
  fonts,
  radii,
} as const;

export type ColorTokens = typeof colors;
export type FontTokens = typeof fonts;
export type RadiusTokens = typeof radii;
export type ComponentIndex = typeof components;
