import { Flex, Card } from "antd";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";
import { NewMarkdown, NewSection } from "../../../store/types";
import React from "react";
import MDEditor from "@uiw/react-md-editor";
import "./markdown.css";

type MarkdownSectionProps = {
  section: NewSection & { content: NewMarkdown };
  snapshot: DraggableStateSnapshot;
  onChange: (updatedSection: NewSection) => void;
};

const MarkdownSection: React.FC<MarkdownSectionProps> = ({
  section,
  snapshot,
  onChange,
}) => (
  <Card
    style={{
      width: "100%",
      marginBottom: 16,
      border: snapshot.isDragging ? "2px solid #1890ff" : undefined,
    }}
  >
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
  </Card>
);

export default MarkdownSection;
