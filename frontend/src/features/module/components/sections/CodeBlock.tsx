import { memo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useHighlighter from '@/src/features/course/hooks/useHighlighter';
import { Card, Text, Surface } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';
import * as Clipboard from 'expo-clipboard';

const CodeBlock = memo(({ code, colors }: { code: string; colors: any }) => {
  const tokens = useHighlighter(code);
  const [copied, setCopied] = useState(false);
  const { theme } = useAppTheme();
  const { dark } = theme;

  // Modern color scheme
  const successGreen = '#10B981';

  // Theme-specific colors
  const headerBg = dark ? '#282A36' : '#F5F5F7';
  const codeBg = dark ? '#1E1E1E' : '#FAFAFA';
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const copyBtnBg = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const copyColor = dark ? '#c4c4cc' : '#8E8E93';

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Token colors based on theme
  const tokenColors = {
    keyword: dark ? '#569CD6' : '#0550AE', // Blue
    string: dark ? '#CE9178' : '#A31515', // Red/Orange
    number: dark ? '#B5CEA8' : '#098658', // Green
    identifier: dark ? '#9CDCFE' : '#001080', // Blue
    punctuation: dark ? '#D4D4D4' : '#000000', // Gray/Black
    comment: dark ? '#6A9955' : '#008000', // Green
  };

  return (
    <Card style={styles.section} elevation={1}>
      <View style={[styles.codeHeader, { backgroundColor: headerBg }]}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: '#FF5F56' }]} />
          <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
          <View style={[styles.dot, { backgroundColor: '#27C93F' }]} />
        </View>

        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: copyBtnBg }]}
          onPress={copyToClipboard}
        >
          <View style={styles.copyIcon}>
            <Feather
              name={copied ? 'check' : 'copy'}
              size={16}
              color={copied ? successGreen : copyColor}
            />
          </View>
          <Text style={[styles.copyText, { color: copied ? successGreen : copyColor }]}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      <Surface style={[styles.codeBlock, { backgroundColor: codeBg, borderColor }]}>
        <View style={styles.lineNumbers}>
          {code.split('\n').map((_, idx) => (
            <Text
              key={`line-${idx}`}
              style={[styles.lineNumber, { color: dark ? '#6C7280' : '#A0A0A0' }]}
            >
              {idx + 1}
            </Text>
          ))}
        </View>
        <View style={styles.codeContent}>
          {tokens.map((token, index) => (
            <Text
              key={index}
              style={[
                styles.token,
                // @ts-ignore - token.type is a valid property
                { color: tokenColors[token.type] || (dark ? '#D4D4D4' : '#000000') },
              ]}
            >
              {token.value}
            </Text>
          ))}
        </View>
      </Surface>
    </Card>
  );
});

export default CodeBlock;

const styles = StyleSheet.create({
  section: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  codeHeader: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingRight: 8,
    paddingLeft: 4,
  },
  copyIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  codeBlock: {
    padding: 12,
    flexDirection: 'row',
    borderRadius: 0,
    borderTopWidth: 1,
  },
  lineNumbers: {
    marginRight: 12,
    opacity: 0.7,
    alignItems: 'flex-end',
  },
  lineNumber: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  codeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  token: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
});
