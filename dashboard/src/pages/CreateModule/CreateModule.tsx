import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Form,
  Input,
  Divider,
  Flex,
  App,
} from "antd";
import {
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
import { useStore } from "../../store";
import { Module } from "../../types/models";
import CodeSection from "./components/CodeSection";
import LottieSection from "./components/LottieSection";
import MarkdownSection from "./components/MarkdownSection";
import QuestionSection from "./components/QuestionSection";
import SectionHeader from "./components/SectionHeader";
import {
  NewCode,
  NewLottie,
  NewMarkdown,
  NewQuestion,
  NewSection,
} from "../../store/types";

const { Title } = Typography;
const { TextArea } = Input;

const CreateModulePage: React.FC = () => {
  const { courseId, unitId } = useParams<{
    courseId: string;
    unitId: string;
  }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const createModule = useStore((state) => state.createModule);
  const isCourseLoading = useStore((state) => state.isCourseLoading);
  const [sections, setSections] = useState<NewSection[]>([]);

  const handleAddSection = (
    type: "markdown" | "code" | "question" | "lottie"
  ) => {
    const contentMap = {
      markdown: { markdown: "" } as NewMarkdown,
      code: { code: "", language: "javascript" } as NewCode,
      question: {
        id: Date.now(),
        type: "multiple_choice",
        question: "",
        options: [
          { id: 1, content: "", isCorrect: false },
          { id: 2, content: "", isCorrect: false },
        ],
      } as NewQuestion,
      lottie: {
        width: 200,
        height: 200,
        autoplay: false,
        loop: false,
        speed: 1.0,
      } as NewLottie,
    };

    const newSection: NewSection = {
      id: sections.length + 1,
      type,
      position: sections.length + 1,
      content: contentMap[type],
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (id: number) => {
    const updatedSections = sections.filter((s) => s.id !== id);
    setSections(updatePositions(updatedSections));
  };

  const updatePositions = (updatedSections: NewSection[]) => {
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

  console.log("SECTIONS", sections);

  const handleUpdateSection = (updatedSection: NewSection) => {
    setSections(
      sections.map((s) => (s.id === updatedSection.id ? updatedSection : s))
    );
  };

  const handleSubmit = async (values: Module) => {
    if (!courseId || !unitId) return;

    try {
      const moduleData = {
        ...values,
        moduleNumber: Number(values.moduleNumber),
      };

      const newSections = sections.map((section) => ({
        id: Number(section.id),
        type: section.type,
        position: section.position,
        content: section.content,
      }));

      await createModule(
        Number(courseId),
        Number(unitId),
        moduleData,
        newSections
      );
      message.success("Module created successfully");
      navigate(`/courses/${courseId}`);
    } catch {
      message.error("Failed to create module");
    }
  };

  const renderSectionContent = (section: NewSection) => {
    switch (section.type) {
      case "markdown":
        return (
          // @ts-expect-error will fix
          <MarkdownSection section={section} onChange={handleUpdateSection} />
        );
      case "code":
        // @ts-expect-error will fix
        return <CodeSection section={section} onChange={handleUpdateSection} />;
      case "question":
        return (
          // @ts-expect-error will fix
          <QuestionSection section={section} onChange={handleUpdateSection} />
        );
      case "lottie":
        return (
          // @ts-expect-error will fix
          <LottieSection section={section} onChange={handleUpdateSection} />
        );
      default:
        return null;
    }
  };

  return (
    <Flex align="center" vertical>
      <Card style={{ width: "60%" }}>
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
                        draggableId={section.id.toString()}
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
                              <SectionHeader
                                section={section}
                                handleRemove={handleRemoveSection}
                              />
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
              loading={isCourseLoading}
              disabled={sections.length === 0}
            >
              Create Module
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  );
};

export default CreateModulePage;
