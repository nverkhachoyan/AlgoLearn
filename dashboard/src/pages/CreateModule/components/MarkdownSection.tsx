import { Form, Input } from "antd";
import { NewMarkdown, NewSection } from "../../../store/types";
import React from "react";

const { TextArea } = Input;

type MarkdownSectionProps = {
  section: {
    id: string;
    type: "lottie";
    position: number;
    content: NewMarkdown;
  };
  onChange: (updatedSection: NewSection) => void;
};

const MarkdownSection: React.FC<MarkdownSectionProps> = ({
  section,
  onChange,
}) => (
  <Form.Item
    label="Content"
    required
    rules={[{ required: true, message: "Please enter content" }]}
  >
    <TextArea
      rows={4}
      value={section.content.markdown}
      onChange={(e) =>
        onChange({
          ...section,
          content: { markdown: e.target.value },
        })
      }
      placeholder="Enter markdown content"
    />
  </Form.Item>
);

export default MarkdownSection;
