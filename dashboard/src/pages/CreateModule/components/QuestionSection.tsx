import { Typography, Space, Button, Form, Input, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { NewQuestion, NewSection } from "../../../store/types";
import React from "react";

const { Title } = Typography;
const { Option } = Select;

type QuestionSectionProps = {
  section: {
    id: string;
    type: "lottie";
    position: number;
    content: NewQuestion;
  };
  onChange: (updatedSection: NewSection) => void;
};

const QuestionSection: React.FC<QuestionSectionProps> = ({
  section,
  onChange,
}) => {
  const addOption = () => {
    const updatedSection = {
      ...section,
      content: {
        ...section.content,
        options: [
          ...section.content.options,
          {
            id: Date.now(),
            content: "",
            isCorrect: false,
          },
        ],
      },
    };
    onChange(updatedSection);
  };

  const updateOption = (index: number, field: string, value: any) => {
    const updatedOptions = section.content.options.map((opt: any, i: number) =>
      i === index ? { ...opt, [field]: value } : opt
    );

    onChange({
      ...section,
      content: {
        ...section.content,
        options: updatedOptions,
      },
    });
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Form.Item
        label="Question"
        required
        rules={[{ required: true, message: "Please enter a question" }]}
      >
        <Input
          value={section.content.question}
          onChange={(e) =>
            onChange({
              ...section,
              content: { ...section.content, question: e.target.value },
            })
          }
          placeholder="Enter question"
        />
      </Form.Item>
      <Title level={5}>Options</Title>
      {section.content.options.map((option: any, index: number) => (
        <Space key={option.id} align="baseline">
          <Form.Item
            required
            rules={[{ required: true, message: "Please enter option content" }]}
          >
            <Input
              value={option.content}
              onChange={(e) => updateOption(index, "content", e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
          </Form.Item>
          <Form.Item>
            <Select
              value={option.isCorrect}
              onChange={(value) => updateOption(index, "isCorrect", value)}
            >
              <Option value={true}>Correct</Option>
              <Option value={false}>Incorrect</Option>
            </Select>
          </Form.Item>
        </Space>
      ))}
      <Button type="dashed" onClick={addOption} icon={<PlusOutlined />}>
        Add Option
      </Button>
    </Space>
  );
};

export default QuestionSection;
