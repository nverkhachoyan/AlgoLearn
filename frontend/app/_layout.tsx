import {Slot} from "expo-router";
import {AuthProvider} from "@/context/AuthProvider";
import {ThemeProvider} from "@react-navigation/native";
import {DarkTheme, DefaultTheme, Theme} from "@/constants/Colors";
import {useColorScheme} from "react-native";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {RootSiblingParent} from "react-native-root-siblings";
import {PaperProvider,   MD3LightTheme as CustomTheme,} from 'react-native-paper';

const colors = {
  "colors": {
    "primary": "rgb(171, 199, 255)",
    "onPrimary": "rgb(0, 47, 101)",
    "primaryContainer": "rgb(3, 69, 142)",
    "onPrimaryContainer": "rgb(215, 227, 255)",
    "secondary": "rgb(190, 198, 220)",
    "onSecondary": "rgb(40, 48, 65)",
    "secondaryContainer": "rgb(62, 71, 89)",
    "onSecondaryContainer": "rgb(218, 226, 249)",
    "tertiary": "rgb(221, 188, 224)",
    "onTertiary": "rgb(63, 40, 68)",
    "tertiaryContainer": "rgb(87, 62, 92)",
    "onTertiaryContainer": "rgb(250, 216, 253)",
    "error": "rgb(255, 180, 171)",
    "onError": "rgb(105, 0, 5)",
    "errorContainer": "rgb(147, 0, 10)",
    "onErrorContainer": "rgb(255, 180, 171)",
    "background": "rgb(26, 27, 31)",
    "onBackground": "rgb(227, 226, 230)",
    "surface": "rgb(26, 27, 31)",
    "onSurface": "rgb(227, 226, 230)",
    "surfaceVariant": "rgb(68, 71, 78)",
    "onSurfaceVariant": "rgb(196, 198, 208)",
    "outline": "rgb(142, 144, 153)",
    "outlineVariant": "rgb(68, 71, 78)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(227, 226, 230)",
    "inverseOnSurface": "rgb(47, 48, 51)",
    "inversePrimary": "rgb(44, 94, 167)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(33, 36, 42)",
      "level2": "rgb(38, 41, 49)",
      "level3": "rgb(42, 46, 56)",
      "level4": "rgb(43, 48, 58)",
      "level5": "rgb(46, 51, 62)"
    },
    "surfaceDisabled": "rgba(227, 226, 230, 0.12)",
    "onSurfaceDisabled": "rgba(227, 226, 230, 0.38)",
    "backdrop": "rgba(45, 48, 56, 0.4)"
  }
}

const queryClient = new QueryClient();
const theme = {
  ...CustomTheme,
  colors: colors.colors, // Copy it from the color codes scheme and then use it here
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        value={
          colorScheme === "dark"
            ? (DarkTheme as Theme)
            : (DefaultTheme as Theme)
        }
      >
        <PaperProvider theme={theme}>
          <RootSiblingParent>
            <AuthProvider>
              <Slot/>
            </AuthProvider>
          </RootSiblingParent>
        </PaperProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
