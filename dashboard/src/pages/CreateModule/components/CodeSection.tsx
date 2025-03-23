import { Space, Form, Input, Select } from "antd";
import { NewCode, NewSection } from "../../../store/types";
import React from "react";

const { TextArea } = Input;
const { Option } = Select;
type CodeSectionProps = {
  section: {
    id: string;
    type: "lottie";
    position: number;
    content: NewCode;
  };
  onChange: (updatedSection: NewSection) => void;
};
const CodeSection: React.FC<CodeSectionProps> = ({ section, onChange }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    <Form.Item
      label="Language"
      required
      rules={[{ required: true, message: "Please select a language" }]}
    >
      <Select
        value={section.content.language}
        onChange={(value) =>
          onChange({
            ...section,
            content: { ...section.content, language: value },
          })
        }
      >
        <Option value="javascript">JavaScript</Option>
        <Option value="python">Python</Option>
        <Option value="java">Java</Option>
        <Option value="rust">Rust</Option>
        <Option value="cpp">C++</Option>
      </Select>
    </Form.Item>
    <Form.Item
      label="Code"
      required
      rules={[{ required: true, message: "Please enter code" }]}
    >
      <TextArea
        rows={6}
        value={section.content.code}
        onChange={(e) =>
          onChange({
            ...section,
            content: { ...section.content, code: e.target.value },
          })
        }
        placeholder="Enter code"
      />
    </Form.Item>
  </Space>
);

export default CodeSection;
