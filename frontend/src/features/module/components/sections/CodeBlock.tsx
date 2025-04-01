import { memo, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import useHighlighter from "@/src/features/course/hooks/useHighlighter";
import { Card, Text, IconButton, Surface } from "react-native-paper";
import * as Clipboard from "expo-clipboard";

const CodeBlock = memo(({ code, colors }: { code: string; colors: any }) => {
  const tokens = useHighlighter(code);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card style={styles.section} elevation={0} mode="elevated">
      <View style={styles.codeHeader}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: "#FF5F56" }]} />
          <View style={[styles.dot, { backgroundColor: "#FFBD2E" }]} />
          <View style={[styles.dot, { backgroundColor: "#27C93F" }]} />
        </View>

        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <IconButton
            icon={copied ? "check" : "content-copy"}
            iconColor={copied ? "#27C93F" : "#c4c4cc"}
            size={18}
            style={styles.copyIcon}
          />
          <Text
            style={[styles.copyText, { color: copied ? "#27C93F" : "#c4c4cc" }]}
          >
            {copied ? "Copied!" : "Copy"}
          </Text>
        </TouchableOpacity>
      </View>

      <Surface style={styles.codeBlock}>
        <View style={styles.lineNumbers}>
          {code.split("\n").map((_, idx) => (
            <Text key={`line-${idx}`} style={styles.lineNumber}>
              {idx + 1}
            </Text>
          ))}
        </View>
        <View style={styles.codeContent}>
          {tokens.map((token, index) => (
            // @ts-ignore
            <Text key={index} style={[styles.token, styles[token.type]]}>
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
    marginVertical: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  codeHeader: {
    backgroundColor: "#282A36",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.2)",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingRight: 12,
  },
  copyIcon: {
    margin: 0,
  },
  copyText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  codeBlock: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    flexDirection: "row",
    borderRadius: 0,
  },
  lineNumbers: {
    marginRight: 16,
    opacity: 0.5,
    alignItems: "flex-end",
  },
  lineNumber: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#6C7280",
    lineHeight: 20,
  },
  codeContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  token: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
  keyword: {
    color: "#569CD6", // Blue
  },
  string: {
    color: "#CE9178", // Orange-brown
  },
  number: {
    color: "#B5CEA8", // Light green
  },
  identifier: {
    color: "#9CDCFE", // Light blue
  },
  punctuation: {
    color: "#D4D4D4", // Light gray
  },
  newline: {
    width: "100%",
    height: 0,
  },
  comment: {
    color: "#6A9955", // Green
  },
});
