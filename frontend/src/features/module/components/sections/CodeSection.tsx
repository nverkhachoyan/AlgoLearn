import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CodeContent } from '@/src/features/module/types';
import CodeBlock from './CodeBlock';

interface CodeSectionProps {
  content: CodeContent;
  colors: any;
}

export const CodeSection = memo(({ content, colors }: CodeSectionProps) => (
  <View style={styles.container}>
    <CodeBlock colors={colors} code={content.code} />
  </View>
));

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});
