import ReactMarkdown from "react-markdown";
import { MarkdownContent } from "../../types/models";

const MarkdownSection: React.FC<{ content: MarkdownContent }> = ({
  content,
}) => (
  <div className="markdown-content">
    <ReactMarkdown>{content.markdown}</ReactMarkdown>
  </div>
);

export default MarkdownSection;
