import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
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
  FileImageOutlined,
  DownOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useStore } from "../../store";
import { Module } from "../../types/models";
import CodeSection from "./components/CodeSection";
import LottieSection from "./components/LottieSection";
import MarkdownSection from "./components/MarkdownSection";
import QuestionSection from "./components/QuestionSection";
import ImageSection from "./components/ImageSection";
import SectionHeader from "./components/SectionHeader";
import PreviewMarkdown from "../../components/sections/MarkdownSection";
import PreviewQuestion from "../../components/sections/QuestionSection";
import PreviewImage from "../../components/sections/ImageSection";
import PreviewLottie from "../../components/sections/LottieSection";
import PreviewCode from "../../components/sections/CodeSection";

import {
  isNewCode,
  isNewImage,
  isNewLottie,
  isNewMarkdown,
  isNewQuestion,
  NewCode,
  NewLottie,
  NewMarkdown,
  NewQuestion,
  NewSection,
} from "../../store/types";
import CreateButton from "./components/CreateButton";
import ConditionalRenderer from "../../components/ConditionalRenderer";

import "./scrollbar.css";

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
  const [lastAddedSectionId, setLastAddedSectionId] = useState<number | null>(
    null
  );
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("moduleAutoScroll");
    return saved !== null ? JSON.parse(saved) : true; // Default to enabled
  });
  const [panelSizes, setPanelSizes] = useState(() => {
    const saved = localStorage.getItem("modulePanelSizes");
    return saved ? JSON.parse(saved) : [60, 40];
  });

  // Modify the existing scroll effect to only run when enabled
  useEffect(() => {
    if (
      autoScrollEnabled &&
      lastAddedSectionId !== null &&
      sections.length > 0
    ) {
      setTimeout(() => {
        const sectionElements = document.querySelectorAll(".draggable-section");
        if (sectionElements.length > 0) {
          const lastSection = sectionElements[sectionElements.length - 1];
          lastSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setLastAddedSectionId(null);
      }, 100);
    } else if (lastAddedSectionId !== null) {
      // Reset lastAddedSectionId even when we don't scroll
      setLastAddedSectionId(null);
    }
  }, [sections, lastAddedSectionId, autoScrollEnabled]);

  // Handler for toggling auto-scroll
  const toggleAutoScroll = () => {
    const newState = !autoScrollEnabled;
    setAutoScrollEnabled(newState);
    localStorage.setItem("moduleAutoScroll", JSON.stringify(newState));
  };

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleResize = (sizes: number[]) => {
    setPanelSizes(sizes);
    localStorage.setItem("modulePanelSizes", JSON.stringify(sizes));
  };

  const handleAddSection = (
    type: "markdown" | "code" | "question" | "lottie" | "image"
  ) => {
    const contentMap = {
      markdown: {} as NewMarkdown,
      code: { language: "javascript" } as NewCode,
      question: {
        id: Date.now(),
        type: "multiple_choice",
        options: [
          { id: 1, isCorrect: false },
          { id: 2, isCorrect: false },
        ],
      } as NewQuestion,
      lottie: {
        width: 200,
        height: 200,
        autoplay: false,
        loop: false,
        speed: 1.0,
      } as NewLottie,
      image: {},
    };

    const newSectionId = sections.length + 1;
    const newSection: NewSection = {
      id: newSectionId,
      type,
      position: newSectionId,
      content: contentMap[type],
    };
    setSections([...sections, newSection]);
    setLastAddedSectionId(newSectionId);
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
    if (isNewMarkdown(section)) {
      return (
        <MarkdownSection section={section} onChange={handleUpdateSection} />
      );
    }

    if (isNewCode(section)) {
      return <CodeSection section={section} onChange={handleUpdateSection} />;
    }

    if (isNewQuestion(section)) {
      return (
        <QuestionSection section={section} onChange={handleUpdateSection} />
      );
    }

    if (isNewLottie(section)) {
      return <LottieSection section={section} onChange={handleUpdateSection} />;
    }

    if (isNewImage(section)) {
      return <ImageSection section={section} onChange={handleUpdateSection} />;
    }

    throw new Error("unknown section type");
  };

  return (
    <PanelGroup
      direction="horizontal"
      style={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
      onLayout={handleResize}
    >
      {/* Left side - Editor */}
      <Panel defaultSize={panelSizes[0]} minSize={30}>
        <Flex
          align="stretch"
          vertical
          className="custom-scrollbar"
          style={{
            paddingRight: "20px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 10px)",
            height: "100%",
            paddingTop: "24px",
            paddingBottom: "24px",
          }}
        >
          <Card style={{ width: "99%", margin: "0 auto", marginBottom: 8 }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Title level={2}>Create New Module</Title>

              <Form.Item
                name="name"
                label="Module Name"
                rules={[
                  { required: true, message: "Please enter module name" },
                ]}
              >
                <Input placeholder="Enter module name" />
              </Form.Item>

              <Form.Item
                name="moduleNumber"
                label="Module Number"
                rules={[
                  { required: true, message: "Please enter module number" },
                ]}
              >
                <Input placeholder="Enter module number" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <TextArea rows={4} placeholder="Enter module description" />
              </Form.Item>

              <Divider>Sections</Divider>

              <Flex wrap gap={10} style={{ marginBottom: 16 }}>
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
                  onClick={() => handleAddSection("image")}
                  icon={<FileImageOutlined />}
                >
                  Add Image
                </Button>
                <Button
                  onClick={() => handleAddSection("lottie")}
                  icon={<PlaySquareOutlined />}
                >
                  Add Animation
                </Button>

                <Button
                  onClick={toggleAutoScroll}
                  type={autoScrollEnabled ? "default" : "dashed"}
                  icon={autoScrollEnabled ? <DownOutlined /> : <StopOutlined />}
                >
                  {autoScrollEnabled ? "Auto-scroll On" : "Auto-scroll Off"}
                </Button>
              </Flex>
            </Form>
          </Card>

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
                  <ConditionalRenderer
                    condition={sections.length > 0}
                    renderTrue={() =>
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
                                  width: "100%",
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
                    }
                    renderFalse={() => (
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
                  />

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
          <CreateButton onAddSection={handleAddSection} />
        </Flex>
      </Panel>

      <PanelResizeHandle
        style={{
          width: "4px",
          background: "var(--border-color)",
          cursor: "col-resize",
        }}
      />

      <Panel defaultSize={panelSizes[1]} minSize={30}>
        {/* Right side - Preview */}
        <Flex
          align="center"
          vertical
          className="custom-scrollbar"
          style={{
            position: "sticky",
            alignSelf: "flex-start",
            height: "100%",
            overflowY: "auto",
            padding: "0 20px",
          }}
        >
          <Title level={4} style={{ margin: "20px 0" }}>
            Preview
          </Title>

          <ConditionalRenderer
            condition={sections.length > 0}
            renderTrue={() => {
              return sections.map((s, index) => (
                <Card
                  key={s.id}
                  style={{ width: "100%", marginBottom: "16px" }}
                >
                  <Typography.Text type="secondary">
                    Section {index + 1}:{" "}
                    {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                  </Typography.Text>

                  {isNewMarkdown(s) && <PreviewMarkdown content={s.content} />}
                  {isNewQuestion(s) && (
                    <PreviewQuestion content={s.content} onAnswer={() => {}} />
                  )}
                  {isNewCode(s) && <PreviewCode content={s.content} />}
                  {isNewLottie(s) && (
                    <PreviewLottie content={s.content} module={null} />
                  )}
                  {isNewImage(s) && (
                    <PreviewImage content={s.content} module={null} />
                  )}
                </Card>
              ));
            }}
            renderFalse={() => {
              return (
                <Card style={{ width: "100%" }}>
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    Add sections to see a preview
                  </div>
                </Card>
              );
            }}
          />
        </Flex>
      </Panel>
    </PanelGroup>
  );
};

export default CreateModulePage;
