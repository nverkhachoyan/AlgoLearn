import { Space, Select, Divider } from "antd";
import { NewCode, NewSection } from "../../../store/types";
import CodeEditor from "@uiw/react-textarea-code-editor";
import React from "react";

const { Option } = Select;
type CodeSectionProps = {
  section: NewSection & { content: NewCode };
  onChange: (updatedSection: NewSection) => void;
};
const CodeSection: React.FC<CodeSectionProps> = ({ section, onChange }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
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
    <Divider />
    <CodeEditor
      value={section.content.code}
      language={section.content.language}
      minHeight={400}
      placeholder="Type your code here."
      onChange={(e) =>
        onChange({
          ...section,
          content: { ...section.content, code: e.target.value },
        })
      }
      padding={15}
      style={{
        fontSize: 16,
        fontFamily:
          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
        borderRadius: 8,
      }}
    />
  </Space>
);

export default CodeSection;
