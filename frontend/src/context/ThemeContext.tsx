import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import {
  customLightTheme,
  customDarkTheme,
  ThemeType as ColorThemeType,
  AppTheme as ColorAppTheme,
} from '@/constants/Colors';

// Re-export types from Colors.ts
export type AppTheme = ColorAppTheme;
export type ThemeType = ColorThemeType;

type ThemeContextType = {
  theme: AppTheme;
  colorScheme: ThemeType;
  dark: boolean;
  light: boolean;
};

const initialColorScheme = (Appearance.getColorScheme() as ThemeType) || 'light';
const initialTheme = initialColorScheme === 'dark' ? customDarkTheme : customLightTheme;

const ThemeContext = createContext<ThemeContextType>({
  theme: initialTheme,
  colorScheme: initialColorScheme,
  dark: initialColorScheme === 'dark',
  light: initialColorScheme === 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = (useColorScheme() as ThemeType) || 'light';
  const [currentColorScheme, setCurrentColorScheme] = useState<ThemeType>(systemColorScheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setCurrentColorScheme(colorScheme as ThemeType);
      }
    });

    return () => subscription.remove();
  }, []);

  const theme = currentColorScheme === 'dark' ? customDarkTheme : customLightTheme;

  const value = {
    theme,
    colorScheme: currentColorScheme,
    dark: currentColorScheme === 'dark',
    light: currentColorScheme === 'light',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context.theme) {
    // fallback to light theme if context theme is somehow undefined
    return {
      ...context,
      theme: customLightTheme,
    };
  }
  return context;
}
