import {
  Text as DefaultText,
  View as DefaultView,
  ScrollView as DefaultScrollView,
} from 'react-native';

import { useColorScheme } from './useColorScheme';
import useTheme from '@/hooks/useTheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ScrollViewProps = ThemeProps &
  DefaultScrollView['props'] & {
    contentContainerStyle?: any;
  };

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();

  return (
    <DefaultText
      style={[
        { color: colors.text },
        { fontFamily: 'OpenSauceOne-Regular' },
        style,
      ]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();

  return (
    <DefaultView
      style={[{ backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}

export function ScrollView(props: ScrollViewProps) {
  const { style, contentContainerStyle, lightColor, darkColor, ...otherProps } =
    props;
  const { colors } = useTheme();

  return (
    <DefaultScrollView
      style={[{ backgroundColor: colors.background }, style]}
      contentContainerStyle={contentContainerStyle}
      {...otherProps}
    />
  );
}
