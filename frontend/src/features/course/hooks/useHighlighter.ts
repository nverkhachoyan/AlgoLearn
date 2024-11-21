import { useMemo } from "react";

const keywords = [
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
];

const tokenize = (code: string) => {
  const tokens = [];
  let current = "";

  let isProcessingComment = false;
  let comment = "";

  let isProcessingString = false;
  let string = "";

  for (let char of code) {
    if (isProcessingComment) {
      if (/(\n)/.test(char)) {
        tokens.push(comment);
        comment = "";
        tokens.push(char);
        isProcessingComment = false;
      } else {
        comment += char;
      }
    } else if (isProcessingString) {
      if (/["'`]/.test(char)) {
        isProcessingString = false;
        tokens.push(string);
        string = "";
      } else {
        string += char;
      }
    } else if (/["'`]/.test(char)) {
      isProcessingString = true;
      if (current) tokens.push(current);
      current = "";
      string = char;
    } else if (/[*\/]/.test(char)) {
      isProcessingComment = true;
      if (current) tokens.push(current);
      current = "";
      comment = char;
    } else if (/\s/.test(char)) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = "";
    } else if (/[(){}\[\];]/.test(char)) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = "";
    } else if (/(\n)/.test(char)) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);

  return tokens.map((token) => {
    if (/(\/)+/.test(token)) return { type: "comment", value: token };
    if (keywords.includes(token)) return { type: "keyword", value: token };
    if (/^["'`].*["'`]$/.test(token)) return { type: "string", value: token };
    if (/^\d+$/.test(token)) return { type: "number", value: token };
    if (/^[a-zA-Z_]\w*$/.test(token))
      return { type: "identifier", value: token };
    if (/(\n)/.test(token)) return { type: "newline", value: token };
    return { type: "punctuation", value: token };
  });
};

const useHighlighter = (code: string) => {
  return useMemo(() => tokenize(code), [code]);
};

export default useHighlighter;
