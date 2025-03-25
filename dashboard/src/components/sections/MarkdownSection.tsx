import ReactMarkdown from "react-markdown";
import { MarkdownContent } from "../../types/models";
import { NewMarkdown } from "../../store/types";

const MarkdownSection: React.FC<{ content: MarkdownContent | NewMarkdown }> = ({
  content,
}) => (
  <div className="markdown-content">
    <ReactMarkdown>{content.markdown}</ReactMarkdown>
  </div>
);

export default MarkdownSection;
