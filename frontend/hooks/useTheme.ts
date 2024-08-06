import { useTheme as useNavigationTheme } from '@react-navigation/native';
import { DarkTheme, DefaultTheme, Theme } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const useTheme = () => {
  const colorScheme = useColorScheme();
  const navigationTheme = useNavigationTheme() as Theme;
  const appTheme =
    colorScheme === 'light' ? (DefaultTheme as Theme) : (DarkTheme as Theme);

  return { ...navigationTheme, ...appTheme };
};

export default useTheme;
