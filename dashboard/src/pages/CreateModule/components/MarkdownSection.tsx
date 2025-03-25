import { Flex } from "antd";
import { NewMarkdown, NewSection } from "../../../store/types";
import React from "react";
import MDEditor from "@uiw/react-md-editor";
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
