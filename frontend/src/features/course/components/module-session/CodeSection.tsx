import { memo } from "react";
import { CodeContent } from "@/src/features/module/types";
import CodeBlock from "./CodeBlock";

interface CodeSectionProps {
  content: CodeContent;
}

export const CodeSection = memo(({ content }: CodeSectionProps) => (
  <CodeBlock code={content.content.replace(/```javascript\n|```/g, "")} />
));
