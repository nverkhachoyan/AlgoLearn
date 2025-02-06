import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Form,
  Input,
  Select,
  Divider,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
  CodeOutlined,
  FileTextOutlined,
  QuestionOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import useStore from "../store";
import { Module } from "../types/models";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Section {
  id: string;
  type: "markdown" | "code" | "question";
  position: number;
  content: any;
}

interface ModuleForm {
  name: string;
  description: string;
  sections: Section[];
}

const CreateModulePage: React.FC = () => {
  const { courseId, unitId } = useParams<{
    courseId: string;
    unitId: string;
  }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { createModule, isLoading } = useStore();
  const [sections, setSections] = useState<Section[]>([]);

  const handleAddSection = (type: "markdown" | "code" | "question") => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      position: sections.length + 1,
      content:
        type === "markdown"
          ? { markdown: "" }
          : type === "code"
          ? { code: "", language: "javascript" }
          : {
              id: Date.now(),
              type: "multiple_choice",
              question: "",
              options: [
                { id: 1, content: "", isCorrect: false },
                { id: 2, content: "", isCorrect: false },
              ],
            },
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
    const updatedSections = sections.filter((s) => s.id !== id);
    setSections(updatePositions(updatedSections));
  };

  const updatePositions = (updatedSections: Section[]) => {
    return updatedSections.map((section, index) => ({
      ...section,
      position: index + 1,
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(updatePositions(items));
  };

  const handleSubmit = async (values: Module) => {
    if (!courseId || !unitId) return;

    try {
      const moduleData = {
        ...values,
        sections: sections.map((section) => ({
          id: Number(section.id),
          type: section.type,
          position: section.position,
          content: section.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      };

      await createModule(Number(courseId), Number(unitId), moduleData);
      message.success("Module created successfully");
      navigate(`/courses/${courseId}`);
    } catch (error) {
      message.error("Failed to create module");
    }
  };

  const renderSectionContent = (section: Section) => {
    switch (section.type) {
      case "markdown":
        return (
          <Form.Item
            label="Content"
            required
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <TextArea
              rows={4}
              value={section.content.markdown}
              onChange={(e) =>
                setSections(
                  sections.map((s) =>
                    s.id === section.id
                      ? { ...s, content: { markdown: e.target.value } }
                      : s
                  )
                )
              }
              placeholder="Enter markdown content"
            />
          </Form.Item>
        );

      case "code":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Language"
              required
              rules={[{ required: true, message: "Please select a language" }]}
            >
              <Select
                value={section.content.language}
                onChange={(value) =>
                  setSections(
                    sections.map((s) =>
                      s.id === section.id
                        ? {
                            ...s,
                            content: { ...s.content, language: value },
                          }
                        : s
                    )
                  )
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
                  setSections(
                    sections.map((s) =>
                      s.id === section.id
                        ? {
                            ...s,
                            content: { ...s.content, code: e.target.value },
                          }
                        : s
                    )
                  )
                }
                placeholder="Enter code"
              />
            </Form.Item>
          </Space>
        );

      case "question":
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
                  setSections(
                    sections.map((s) =>
                      s.id === section.id
                        ? {
                            ...s,
                            content: { ...s.content, question: e.target.value },
                          }
                        : s
                    )
                  )
                }
                placeholder="Enter question"
              />
            </Form.Item>
            <Title level={5}>Options</Title>
            {section.content.options.map((option: any, index: number) => (
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
                      setSections(
                        sections.map((s) =>
                          s.id === section.id
                            ? {
                                ...s,
                                content: {
                                  ...s.content,
                                  options: s.content.options.map(
                                    (o: any, i: number) =>
                                      i === index
                                        ? { ...o, content: e.target.value }
                                        : o
                                  ),
                                },
                              }
                            : s
                        )
                      )
                    }
                    placeholder={`Option ${index + 1}`}
                  />
                </Form.Item>
                <Form.Item>
                  <Select
                    value={option.isCorrect}
                    onChange={(value) =>
                      setSections(
                        sections.map((s) =>
                          s.id === section.id
                            ? {
                                ...s,
                                content: {
                                  ...s.content,
                                  options: s.content.options.map(
                                    (o: any, i: number) =>
                                      i === index
                                        ? { ...o, isCorrect: value }
                                        : o
                                  ),
                                },
                              }
                            : s
                        )
                      )
                    }
                  >
                    <Option value={true}>Correct</Option>
                    <Option value={false}>Incorrect</Option>
                  </Select>
                </Form.Item>
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() =>
                setSections(
                  sections.map((s) =>
                    s.id === section.id
                      ? {
                          ...s,
                          content: {
                            ...s.content,
                            options: [
                              ...s.content.options,
                              {
                                id: Date.now(),
                                content: "",
                                isCorrect: false,
                              },
                            ],
                          },
                        }
                      : s
                  )
                )
              }
              icon={<PlusOutlined />}
            >
              Add Option
            </Button>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Title level={2}>Create New Module</Title>

          <Form.Item
            name="name"
            label="Module Name"
            rules={[{ required: true, message: "Please enter module name" }]}
          >
            <Input placeholder="Enter module name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter module description" />
          </Form.Item>

          <Divider>Sections</Divider>

          <Space style={{ marginBottom: 16 }}>
            <Button
              onClick={() => handleAddSection("markdown")}
              icon={<FileTextOutlined />}
            >
              Add Markdown
            </Button>
            <Button
              onClick={() => handleAddSection("code")}
              icon={<CodeOutlined />}
            >
              Add Code
            </Button>
            <Button
              onClick={() => handleAddSection("question")}
              icon={<QuestionOutlined />}
            >
              Add Question
            </Button>
          </Space>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ padding: 8 }}
                >
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`draggable-section ${
                            snapshot.isDragging ? "dragging" : ""
                          }`}
                        >
                          <Card
                            style={{
                              marginBottom: 16,
                              border: snapshot.isDragging
                                ? "2px solid #1890ff"
                                : undefined,
                            }}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="drag-handle"
                              style={{
                                marginBottom: 16,
                                padding: 8,
                                background: "#fafafa",
                                borderRadius: 4,
                              }}
                            >
                              <Space>
                                <DragOutlined />
                                <Text>
                                  {section.type.charAt(0).toUpperCase() +
                                    section.type.slice(1)}{" "}
                                  Section
                                </Text>
                                <Text type="secondary">
                                  Position: {section.position}
                                </Text>
                                <Button
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() =>
                                    handleRemoveSection(section.id)
                                  }
                                />
                              </Space>
                            </div>
                            {renderSectionContent(section)}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Create Module
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateModulePage;
