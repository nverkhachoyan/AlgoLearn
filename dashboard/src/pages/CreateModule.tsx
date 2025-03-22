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
  App,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
  CodeOutlined,
  FileTextOutlined,
  QuestionOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useCoursesStore } from "../store";
import { Module } from "../types/models";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Types
interface Section {
  id: string;
  type: "markdown" | "code" | "question" | "lottie";
  position: number;
  content: any;
}

const LottieSection = ({}: {
  section: Section;
  onChange: (updatedSection: Section) => void;
}) => {
  return (
    <Form.Item
      label="Content"
      required
      rules={[{ required: true, message: "Please enter content" }]}
    >
      <DotLottieReact src="/anim.lottie" loop autoplay />
    </Form.Item>
  );
};

// Section Components
const MarkdownSection = ({
  section,
  onChange,
}: {
  section: Section;
  onChange: (updatedSection: Section) => void;
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

const CodeSection = ({
  section,
  onChange,
}: {
  section: Section;
  onChange: (updatedSection: Section) => void;
}) => (
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

const QuestionSection = ({
  section,
  onChange,
}: {
  section: Section;
  onChange: (updatedSection: Section) => void;
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

// Main component
const CreateModulePage: React.FC = () => {
  const { courseId, unitId } = useParams<{
    courseId: string;
    unitId: string;
  }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { createModule, isLoading } = useCoursesStore();
  const [sections, setSections] = useState<Section[]>([]);

  // Section management functions
  const handleAddSection = (
    type: "markdown" | "code" | "question" | "lottie"
  ) => {
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
    const { source, destination } = result;

    // Dropped outside the list or no movement
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setSections(updatePositions(items));
  };

  const handleUpdateSection = (updatedSection: Section) => {
    setSections(
      sections.map((s) => (s.id === updatedSection.id ? updatedSection : s))
    );
  };

  // Form submission
  const handleSubmit = async (values: Module) => {
    if (!courseId || !unitId) return;

    try {
      const moduleData = {
        ...values,
        moduleNumber: Number(values.moduleNumber),
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

  // Render section based on type
  const renderSectionContent = (section: Section) => {
    switch (section.type) {
      case "markdown":
        return (
          <MarkdownSection section={section} onChange={handleUpdateSection} />
        );
      case "code":
        return <CodeSection section={section} onChange={handleUpdateSection} />;
      case "question":
        return (
          <QuestionSection section={section} onChange={handleUpdateSection} />
        );
      case "lottie":
        return (
          <LottieSection section={section} onChange={handleUpdateSection} />
        );
      default:
        return null;
    }
  };

  // Section Header Component
  const SectionHeader = ({ section }: { section: Section }) => (
    <div
      className="drag-handle"
      style={{
        marginBottom: 16,
        padding: 8,
        borderRadius: 4,
      }}
    >
      <Space>
        <DragOutlined />
        <Text>
          {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
        </Text>
        <Text type="secondary">Position: {section.position}</Text>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSection(section.id)}
        />
      </Space>
    </div>
  );

  return (
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
          name="moduleNumber"
          label="Module Number"
          rules={[{ required: true, message: "Please enter module number" }]}
        >
          <Input placeholder="Enter module number" />
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

          <Button
            onClick={() => handleAddSection("lottie")}
            icon={<PlaySquareOutlined />}
          >
            Add Animation
          </Button>
        </Space>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections-droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="sections-container"
                style={{
                  padding: 8,
                  minHeight: sections.length ? "auto" : "100px",
                }}
              >
                {sections.length > 0 ? (
                  sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
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
                            <SectionHeader section={section} />
                            {renderSectionContent(section)}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    Add a section to get started
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={sections.length === 0}
          >
            Create Module
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateModulePage;
