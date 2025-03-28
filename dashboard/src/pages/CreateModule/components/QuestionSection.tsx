import { Typography, Space, Button, Form, Input, Select, Card } from "antd";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";
import { PlusOutlined } from "@ant-design/icons";
import { NewQuestion, NewSection } from "../../../store/types";
import { QuestionOption } from "../../../types/models";
import React from "react";

const { Title } = Typography;
const { Option } = Select;

type QuestionSectionProps = {
  section: NewSection & { content: NewQuestion };
  snapshot: DraggableStateSnapshot;
  onChange: (updatedSection: NewSection) => void;
};

const QuestionSection: React.FC<QuestionSectionProps> = ({
  section,
  snapshot,
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

  const updateOption = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedOptions = section.content.options.map(
      (opt: QuestionOption, i: number) =>
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
    <Card
      style={{
        width: "100%",
        marginBottom: 16,
        border: snapshot.isDragging ? "2px solid #1890ff" : undefined,
      }}
    >
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
        {section.content.options.map(
          (option: QuestionOption, index: number) => (
            <Space key={option.id} align="baseline">
              <Form.Item
                required
                rules={[
                  { required: true, message: "Please enter option content" },
                ]}
              >
                <Input
                  value={option.content}
                  onChange={(e) =>
                    updateOption(index, "content", String(e.target.value))
                  }
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
          )
        )}
        <Button type="dashed" onClick={addOption} icon={<PlusOutlined />}>
          Add Option
        </Button>
      </Space>
    </Card>
  );
};

export default QuestionSection;
