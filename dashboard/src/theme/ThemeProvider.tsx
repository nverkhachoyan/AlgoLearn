import React, { useEffect } from "react";
import { ConfigProvider, theme as antTheme } from "antd";
import { useStore } from "../store";
import { darkTheme, lightTheme } from "./themeConfig";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const useSystemTheme = useStore((state) => state.useSystemTheme);
  const setIsDarkMode = useStore((state) => state.setIsDarkMode);

  // Check for system theme preference
  useEffect(() => {
    if (useSystemTheme) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Set initial value
      setIsDarkMode(mediaQuery.matches);

      // Add listener for changes
      const listener = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [useSystemTheme, setIsDarkMode]);

  // Apply dark mode class to body for global styling
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode
          ? antTheme.darkAlgorithm
          : antTheme.defaultAlgorithm,
        ...(isDarkMode ? darkTheme : lightTheme),
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
