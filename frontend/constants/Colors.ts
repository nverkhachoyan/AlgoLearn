import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { fontConfig } from './Fonts';

// Light theme colors with  existing color palette
export const lightTheme = {
  colors: {
    // Core colors
    primary: '#1E1E1E', //main brand color
    onPrimary: '#FFFFFF',
    primaryContainer: '#F7F7F7', //inputBackground
    onPrimaryContainer: '#000000',

    // Secondary colors
    secondary: '#636F73', //textDimmed color
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8E8E8', //listBackground
    onSecondaryContainer: '#1E1E1E',

    // Tertiary colors
    tertiary: 'rgb(0, 122, 255)', //primary blue
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#E2E2E2', //inputBackgroundFocused
    onTertiaryContainer: '#000000',

    // Error states
    error: '#DC3545', //errorColor
    onError: '#FFFFFF',
    errorContainer: '#B2222C', //dangerBgColor
    onErrorContainer: '#FFFFFF', //dangerTextColor

    // Background colors
    background: '#FFFFFF', //background
    onBackground: '#000000', //text
    surface: '#FFFFFF', //cardBackground
    onSurface: '#000000', //text
    surfaceVariant: '#FFF', //tabBarBackground
    onSurfaceVariant: '#636F73', //textDimmed

    // Other colors
    outline: '#333333', //inputBorder
    outlineVariant: '#E8E8E8',
    shadow: 'rgba(0, 0, 0, 0.1)',
    scrim: 'rgba(0, 0, 0, 0.3)',
    inverseSurface: '#1E1E1E',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#FFFFFF',

    // Elevation levels
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F7F7F7',
      level3: '#F0F0F0',
      level4: '#E8E8E8',
      level5: '#E2E2E2',
    },

    // Disabled states
    surfaceDisabled: 'rgba(30, 30, 30, 0.12)',
    onSurfaceDisabled: 'rgba(30, 30, 30, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    link: '#1E90FF',
    hover: '#555',
    active: '#0000FF',
    disabled: '#D3D3D3',
    alert: '#FFC107',
  },
};

// Dark theme colors
export const darkTheme = {
  colors: {
    // Core colors
    primary: '#FFFFFF', // Inverted for dark theme
    onPrimary: '#1E1E1E',
    primaryContainer: '#333333', // inputBackground dark
    onPrimaryContainer: '#FFFFFF',

    // Secondary colors
    secondary: '#C2C2C2', // textDimmed dark
    onSecondary: '#1E1E1E',
    secondaryContainer: '#333333', // listBackground dark
    onSecondaryContainer: '#FFFFFF',

    // Tertiary colors
    tertiary: '#4F6CF7', // primary blue
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#252525', // inputBackgroundFocused dark
    onTertiaryContainer: '#FFFFFF',

    // Error states
    error: '#DC3545', // errorColor
    onError: '#FFFFFF',
    errorContainer: '#B2222C', // dangerBgColor
    onErrorContainer: '#FFFFFF',

    // Background colors
    background: '#121212', // dark background
    onBackground: '#FFFFFF', // dark text
    surface: '#24272E', // cardBackground dark
    onSurface: '#FFFFFF',
    surfaceVariant: '#F7F9FC', // tabBarBackground dark
    onSurfaceVariant: '#C2C2C2', // textDimmed dark

    outline: '#E8E8E8', // inputBorder dark
    outlineVariant: '#333333',
    shadow: 'rgba(0, 0, 0, 0.3)',
    scrim: 'rgba(0, 0, 0, 0.6)',
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#1E1E1E',
    inversePrimary: '#1E1E1E',

    elevation: {
      level0: 'transparent',
      level1: '#18181A',
      level2: '#1E1E1E',
      level3: '#24272E',
      level4: '#2A2D35',
      level5: '#333333',
    },

    surfaceDisabled: 'rgba(255, 255, 255, 0.12)',
    onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    link: '#1E90FF',
    hover: '#AAA',
    active: '#0000FF',
    disabled: '#555',
    alert: '#FFC107',
  },
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  fonts: fontConfig,
  colors: {
    ...darkTheme.colors,
    tabs: {
      default: '#ccc',
      index: '#2D3347',
      feed: '#414A52',
      explore: '#36375A',
      challenges: '#403633',
      leaderboard: '#2B3D4A',
    },
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    link: '#1E90FF',
    hover: '#AAA',
    active: '#0000FF',
    disabled: '#555',
    alert: '#FFC107',
  },
};

export const customLightTheme = {
  ...MD3LightTheme,
  fonts: fontConfig,
  colors: {
    ...lightTheme.colors,
    tabs: {
      default: '#1E1E1E',
      index: '#C7D3E8',
      feed: '#D7DEE3',
      explore: '#D0D1E8',
      challenges: '#E5D8D5',
      leaderboard: '#CADBE8',
    },
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    link: '#1E90FF',
    hover: '#555',
    active: '#0000FF',
    disabled: '#D3D3D3',
    alert: '#FFC107',
  },
};

export type AppTheme = typeof customLightTheme | typeof customDarkTheme;
export type ThemeType = 'light' | 'dark';
export type Colors = typeof customLightTheme.colors | typeof customDarkTheme.colors;

export const themes = {
  light: customLightTheme,
  dark: customDarkTheme,
};

export type TabName = 'index' | 'explore' | 'challenges' | 'leaderboard' | 'feed';
export const TabGradients: Record<
  TabName,
  {
    dark: readonly [string, string, string];
    light: readonly [string, string, string];
  }
> = {
  index: {
    dark: ['#24272E', '#2D3347', '#363F5C'] as const,
    light: ['#E6EAF5', '#C7D3E8', '#A8BDDB'] as const,
  },
  explore: {
    dark: ['#292D3E', '#36375A', '#433D76'] as const,
    light: ['#E8E9F5', '#D0D1E8', '#B8BADA'] as const,
  },
  challenges: {
    dark: ['#2E2A29', '#403633', '#524440'] as const,
    light: ['#F2EBE9', '#E5D8D5', '#D8C5C1'] as const,
  },
  leaderboard: {
    dark: ['#242C33', '#2B3D4A', '#324B5E'] as const,
    light: ['#E6EDF2', '#CADBE8', '#AECBDF'] as const,
  },
  feed: {
    dark: ['#4F6CF7', '#3D4FA3', '#2A3550'] as const,
    light: ['#4F6CF7', '#6A78ED', '#8A84E2'] as const,
  },
};

export const USER_PROFILE_GRADIENTS = {
  default: {
    name: 'Default',
    light: ['#4F6CF7', '#6A78ED', '#8A84E2'],
    dark: ['#4F6CF7', '#3D4FA3', '#2A3550'],
  },
  purple: {
    name: 'Purple',
    light: ['#8A2BE2', '#AE67DD', '#D8BFD8'],
    dark: ['#8A2BE2', '#612094', '#38204C'],
  },
  green: {
    name: 'Green',
    light: ['#2E8B57', '#63AE7B', '#98FB98'],
    dark: ['#2E8B57', '#246843', '#1A3C2A'],
  },
  sunset: {
    name: 'Sunset',
    light: ['#FF7F50', '#FF9765', '#FFA07A'],
    dark: ['#FF7F50', '#CF573D', '#5E2F25'],
  },
  ocean: {
    name: 'Ocean',
    light: ['#00CED1', '#43DFDF', '#87CEEB'],
    dark: ['#00CED1', '#059B9F', '#0A4958'],
  },
  amber: {
    name: 'Amber',
    light: ['#E6B800', '#F0CA40', '#F9E080'],
    dark: ['#E6B800', '#A38308', '#4D4000'],
  },
};

export const ACCENT_GRADIENT: {
  dark: readonly [string, string, string];
  light: readonly [string, string, string];
} = {
  dark: ['#5E3773', '#7A3E8C', '#9247A9'],
  light: ['#F0E1F7', '#E0C2F0', '#D0A3E9'],
};
