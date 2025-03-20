import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodeContent } from "../../types/models";

const CodeSection: React.FC<{ content: CodeContent }> = ({ content }) => (
  <div className="code-content">
    <SyntaxHighlighter
      language={content.language}
      style={vscDarkPlus}
      showLineNumbers
    >
      {content.code}
    </SyntaxHighlighter>
  </div>
);

export default CodeSection;
