import React, { ReactNode } from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';

export interface CardProps extends ViewProps {
  elevation?: number;
  children: ReactNode;
}

export function Card({ style, elevation = 1, children, ...props }: CardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: elevation },
          shadowOpacity: 0.1 + elevation * 0.05,
          shadowRadius: elevation * 2,
          elevation: elevation,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardTitleProps extends ViewProps {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function CardTitle({ style, title, subtitle, left, right, ...props }: CardTitleProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.cardTitle, style]} {...props}>
      {left && <View style={styles.titleLeft}>{left}</View>}
      <View style={styles.titleContent}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View style={styles.titleRight}>{right}</View>}
    </View>
  );
}

interface CardContentProps extends ViewProps {
  children: ReactNode;
}

export function CardContent({ style, children, ...props }: CardContentProps) {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
}

interface CardActionsProps extends ViewProps {
  children: ReactNode;
}

export function CardActions({ style, children, ...props }: CardActionsProps) {
  return (
    <View style={[styles.cardActions, style]} {...props}>
      {children}
    </View>
  );
}

interface CardCoverProps extends ViewProps {
  children: ReactNode;
}

export function CardCover({ style, children, ...props }: CardCoverProps) {
  return (
    <View style={[styles.cardCover, style]} {...props}>
      {children}
    </View>
  );
}

interface CardTouchableProps extends TouchableOpacityProps {
  children: ReactNode;
}

export function CardTouchable({ style, children, ...props }: CardTouchableProps) {
  return (
    <TouchableOpacity style={[styles.card, style]} {...props}>
      {children}
    </TouchableOpacity>
  );
}

// Helper Text component to avoid circular dependencies
function Text({ style, children }: { style?: any; children: ReactNode }) {
  const { theme } = useAppTheme();
  return <View style={{ color: theme.colors.onSurface, ...style }}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  titleLeft: {
    marginRight: 16,
  },
  titleContent: {
    flex: 1,
  },
  titleRight: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 8,
  },
  cardCover: {
    overflow: 'hidden',
  },
});
