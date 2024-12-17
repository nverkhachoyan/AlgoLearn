import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { fontConfig } from "./Fonts";

// Light theme colors with your existing color palette
export const lightTheme = {
  colors: {
    // Core colors
    primary: "#1E1E1E", // Your main brand color
    onPrimary: "#FFFFFF",
    primaryContainer: "#F7F7F7", // Your inputBackground
    onPrimaryContainer: "#000000",

    // Secondary colors
    secondary: "#636F73", // Your textDimmed color
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E8E8E8", // Your listBackground
    onSecondaryContainer: "#1E1E1E",

    // Tertiary colors
    tertiary: "rgb(0, 122, 255)", // Your primary blue
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#E2E2E2", // Your inputBackgroundFocused
    onTertiaryContainer: "#000000",

    // Error states
    error: "#DC3545", // Your errorColor
    onError: "#FFFFFF",
    errorContainer: "#B2222C", // Your dangerBgColor
    onErrorContainer: "#FFFFFF", // Your dangerTextColor

    // Background colors
    background: "#FFFFFF", // Your background
    onBackground: "#000000", // Your text
    surface: "#FFFFFF", // Your cardBackground
    onSurface: "#000000", // Your text
    surfaceVariant: "#FFF", // Your tabBarBackground
    onSurfaceVariant: "#636F73", // Your textDimmed

    // Other colors
    outline: "#333333", // Your inputBorder
    outlineVariant: "#E8E8E8",
    shadow: "rgba(0, 0, 0, 0.1)",
    scrim: "rgba(0, 0, 0, 0.3)",
    inverseSurface: "#1E1E1E",
    inverseOnSurface: "#FFFFFF",
    inversePrimary: "#FFFFFF",

    // Elevation levels
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F7F7F7",
      level3: "#F0F0F0",
      level4: "#E8E8E8",
      level5: "#E2E2E2",
    },

    // Disabled states
    surfaceDisabled: "rgba(30, 30, 30, 0.12)",
    onSurfaceDisabled: "rgba(30, 30, 30, 0.38)",
    backdrop: "rgba(0, 0, 0, 0.4)",
    success: "#28a745",
    warning: "#ffc107",
    info: "#17a2b8",
    link: "#1E90FF",
    hover: "#555",
    active: "#0000FF",
    disabled: "#D3D3D3",
    alert: "#FFC107",
  },
};

// Dark theme colors
export const darkTheme = {
  colors: {
    // Core colors
    primary: "#FFFFFF", // Inverted for dark theme
    onPrimary: "#1E1E1E",
    primaryContainer: "#333333", // Your inputBackground dark
    onPrimaryContainer: "#FFFFFF",

    // Secondary colors
    secondary: "#C2C2C2", // Your textDimmed dark
    onSecondary: "#1E1E1E",
    secondaryContainer: "#333333", // Your listBackground dark
    onSecondaryContainer: "#FFFFFF",

    // Tertiary colors
    tertiary: "rgb(0, 122, 255)", // Your primary blue
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#252525", // Your inputBackgroundFocused dark
    onTertiaryContainer: "#FFFFFF",

    // Error states
    error: "#DC3545", // Your errorColor
    onError: "#FFFFFF",
    errorContainer: "#B2222C", // Your dangerBgColor
    onErrorContainer: "#FFFFFF",

    // Background colors
    background: "#121212", // Your dark background
    onBackground: "#FFFFFF", // Your dark text
    surface: "#24272E", // Your cardBackground dark
    onSurface: "#FFFFFF",
    surfaceVariant: "#24272E", // Your tabBarBackground dark
    onSurfaceVariant: "#C2C2C2", // Your textDimmed dark

    // Other colors
    outline: "#E8E8E8", // Your inputBorder dark
    outlineVariant: "#333333",
    shadow: "rgba(0, 0, 0, 0.3)",
    scrim: "rgba(0, 0, 0, 0.6)",
    inverseSurface: "#FFFFFF",
    inverseOnSurface: "#1E1E1E",
    inversePrimary: "#1E1E1E",

    // Elevation levels
    elevation: {
      level0: "transparent",
      level1: "#18181A", // Your questionCardBg
      level2: "#1E1E1E", // Your questionSelectedBg
      level3: "#24272E", // Your secondaryBackground
      level4: "#2A2D35",
      level5: "#333333",
    },

    // Disabled states
    surfaceDisabled: "rgba(255, 255, 255, 0.12)",
    onSurfaceDisabled: "rgba(255, 255, 255, 0.38)",
    backdrop: "rgba(0, 0, 0, 0.6)",
    success: "#28a745",
    warning: "#ffc107",
    info: "#17a2b8",
    link: "#1E90FF",
    hover: "#AAA",
    active: "#0000FF",
    disabled: "#555",
    alert: "#FFC107",
  },
};

// Extended themes with custom properties
export const customDarkTheme = {
  ...MD3DarkTheme,
  fonts: fontConfig,
  colors: {
    ...darkTheme.colors,
    // Your custom tab colors
    tabs: {
      default: "#ccc",
      home: "#FCC931",
      feed: "#9F52C5",
      explore: "#25A879",
      challenges: "#1CC0CB",
      leaderboard: "#5561E9",
    },
    // Additional custom colors that don't fit MD3 tokens
    success: "#28a745",
    warning: "#ffc107",
    info: "#17a2b8",
    link: "#1E90FF",
    hover: "#AAA",
    active: "#0000FF",
    disabled: "#555",
    alert: "#FFC107",
  },
};

export const customLightTheme = {
  ...MD3LightTheme,
  fonts: fontConfig,
  colors: {
    ...lightTheme.colors,
    // Your custom tab colors
    tabs: {
      default: "#1E1E1E",
      home: "#FCC931",
      feed: "#9F52C5",
      explore: "#25A879",
      challenges: "#1CC0CB",
      leaderboard: "#5561E9",
    },
    // Additional custom colors
    success: "#28a745",
    warning: "#ffc107",
    info: "#17a2b8",
    link: "#1E90FF",
    hover: "#555",
    active: "#0000FF",
    disabled: "#D3D3D3",
    alert: "#FFC107",
  },
};

// Type definitions
export type AppTheme = typeof customLightTheme | typeof customDarkTheme;
export type ThemeType = "light" | "dark";
export type Colors =
  | typeof customLightTheme.colors
  | typeof customDarkTheme.colors;

// Optional: Export themes object for convenience
export const themes = {
  light: customLightTheme,
  dark: customDarkTheme,
};
