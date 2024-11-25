import { memo } from "react";
import { CodeContent } from "@/src/features/module/types";
import CodeBlock from "./CodeBlock";

interface CodeSectionProps {
  content: CodeContent;
  colors: any;
}

export const CodeSection = memo(({ content, colors }: CodeSectionProps) => (
  <CodeBlock
    colors={colors}
    code={content.content.replace(/```javascript\n|```/g, "")}
  />
));
