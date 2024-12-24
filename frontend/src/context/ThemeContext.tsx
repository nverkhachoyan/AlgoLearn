import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme, Appearance } from "react-native";
import {
  customLightTheme,
  customDarkTheme,
  AppTheme,
} from "@/constants/Colors";

type ThemeContextType = {
  theme: AppTheme;
  colorScheme: "light" | "dark";
  themeVersion: number;
};

const initialTheme =
  Appearance.getColorScheme() === "dark" ? customDarkTheme : customLightTheme;

const ThemeContext = createContext<ThemeContextType>({
  theme: initialTheme,
  colorScheme: Appearance.getColorScheme() || "light",
  themeVersion: 0,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [currentColorScheme, setCurrentColorScheme] = useState<
    "light" | "dark"
  >(systemColorScheme || "light");
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setCurrentColorScheme(colorScheme);
        setThemeVersion((prev) => prev + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  const theme =
    currentColorScheme === "dark" ? customDarkTheme : customLightTheme;

  const value = {
    theme,
    colorScheme: currentColorScheme,
    themeVersion,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
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
