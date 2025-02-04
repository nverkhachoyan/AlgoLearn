import { memo } from "react";
import { Text, StyleSheet } from "react-native";
import useHighlighter from "@/src/features/course/hooks/useHighlighter";
import { Card } from "react-native-paper";

const CodeBlock = memo(({ code, colors }: { code: string; colors: any }) => {
  const tokens = useHighlighter(code);

  return (
    <Card style={[styles.section]}>
      <Card.Content style={[styles.section, styles.codeBlock]}>
        {tokens.map((token, index) => (
          // @ts-ignore
          <Text key={index} style={[styles.token, styles[token.type]]}>
            {token.value}
          </Text>
        ))}
      </Card.Content>
    </Card>
  );
});

export default CodeBlock;

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
  codeBlock: {
    backgroundColor: "#19171C",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  token: {
    fontFamily: "monospace",
  },
  keyword: {
    color: "#07a",
  },
  string: {
    color: "#690",
  },
  number: {
    color: "#905",
  },
  identifier: {
    color: "#DD4A68",
  },
  punctuation: {
    color: "#999",
  },
  newline: {
    width: "100%",
    height: 0,
  },
  comment: {
    color: "#690",
  },
});
