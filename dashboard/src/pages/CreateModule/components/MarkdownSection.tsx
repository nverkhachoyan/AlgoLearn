import { Flex } from "antd";
import { NewMarkdown, NewSection } from "../../../store/types";
import React from "react";
import MDEditor from "@uiw/react-md-editor";
import ConditionalRenderer from "../../../components/ConditionalRenderer";
import "./markdown.css";

type MarkdownSectionProps = {
  section: NewSection & { content: NewMarkdown };
  onChange: (updatedSection: NewSection) => void;
};

const MarkdownSection: React.FC<MarkdownSectionProps> = ({
  section,
  onChange,
}) => (
  <Flex vertical>
    <ConditionalRenderer
      condition={section.content.markdown !== ""}
      renderTrue={() => (
        <MDEditor.Markdown
          source={section.content.markdown}
          style={{
            marginTop: 20,
            marginBottom: 20,
            borderRadius: 8,
            padding: 15,
          }}
        />
      )}
      renderFalse={() => <p>Start typing markdown to see a preview.</p>}
    />
    <MDEditor
      minHeight={400}
      style={{ borderRadius: 8, overflow: "hidden" }}
      preview="edit"
      value={section.content.markdown}
      onChange={(v) =>
        onChange({ ...section, content: { markdown: v as string } })
      }
    />
  </Flex>
);

export default MarkdownSection;
