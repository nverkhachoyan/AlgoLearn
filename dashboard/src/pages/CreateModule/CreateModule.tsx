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
  Checkbox,
  Select,
  InputNumber,
  Space,
  Badge,
  theme,
} from "antd";
import {
  CodeOutlined,
  FileTextOutlined,
  QuestionOutlined,
  PlaySquareOutlined,
  FileImageOutlined,
  DownOutlined,
  StopOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableStateSnapshot,
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
const { Option } = Select;

const CreateModulePage: React.FC = () => {
  const { courseId, unitId } = useParams<{
    courseId: string;
    unitId: string;
  }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const createModule = useStore((state) => state.createModule);
  const isCourseLoading = useStore((state) => state.isCourseLoading);
  const [sections, setSections] = useState<NewSection[]>([]);
  const [lastAddedSectionId, setLastAddedSectionId] = useState<number | null>(
    null
  );
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("moduleAutoScroll");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [panelSizes, setPanelSizes] = useState(() => {
    const saved = localStorage.getItem("modulePanelSizes");
    return saved ? JSON.parse(saved) : [60, 40];
  });
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    new Set()
  );
  const [skipDeleteConfirmation, setSkipDeleteConfirmation] = useState<boolean>(
    () => {
      const saved = localStorage.getItem("skipSectionDeleteConfirm");
      return saved !== null ? JSON.parse(saved) : false;
    }
  );

  // Track character count for description
  const [descriptionLength, setDescriptionLength] = useState<number>(0);

  // Existing scroll effect to only run when enabled
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
      setLastAddedSectionId(null);
    }
  }, [sections, lastAddedSectionId, autoScrollEnabled]);

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
    const performDelete = () => {
      const updatedSections = sections.filter((s) => s.id !== id);
      setSections(updatePositions(updatedSections));
    };

    if (skipDeleteConfirmation) {
      performDelete();
      return;
    }

    modal.confirm({
      title: "Are you sure you want to delete this section?",
      content: (
        <div>
          <p>This action cannot be undone.</p>
          <Checkbox
            onChange={(e) => {
              const checked = e.target.checked;
              setSkipDeleteConfirmation(checked);
              localStorage.setItem(
                "skipSectionDeleteConfirm",
                JSON.stringify(checked)
              );
            }}
          >
            Don't show this confirmation again
          </Checkbox>
        </div>
      ),
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: performDelete,
    });
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
    if (!courseId || !unitId) {
      message.error("Missing course or unit information");
      return;
    }

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

      console.log("Calling createModule with:", {
        courseId: Number(courseId),
        unitId: Number(unitId),
        moduleData,
        newSections,
      });

      await createModule(
        Number(courseId),
        Number(unitId),
        moduleData,
        newSections
      );
      message.success("Module created successfully");
      navigate(`/courses/${courseId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      console.error("Error in handleSubmit:", error);

      // Show error message using Ant Design message
      message.error({
        content: `Error: ${errorMessage}`,
        duration: 0,
        key: "zustand-error-message",
        onClick: () => {
          message.destroy("zustand-error-message");
        },
      });
    }
  };

  const renderSectionContent = (
    section: NewSection,
    snapshot: DraggableStateSnapshot
  ) => {
    if (isNewMarkdown(section)) {
      return (
        <MarkdownSection
          section={section}
          snapshot={snapshot}
          onChange={handleUpdateSection}
        />
      );
    }

    if (isNewCode(section)) {
      return (
        <CodeSection
          section={section}
          snapshot={snapshot}
          onChange={handleUpdateSection}
        />
      );
    }

    if (isNewQuestion(section)) {
      return (
        <QuestionSection
          section={section}
          snapshot={snapshot}
          onChange={handleUpdateSection}
        />
      );
    }

    if (isNewLottie(section)) {
      return (
        <LottieSection
          section={section}
          snapshot={snapshot}
          onChange={handleUpdateSection}
        />
      );
    }

    if (isNewImage(section)) {
      return (
        <ImageSection
          section={section}
          snapshot={snapshot}
          onChange={handleUpdateSection}
        />
      );
    }

    throw new Error("unknown section type");
  };

  const toggleSectionCollapse = (sectionId: number) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Enhanced preview for module form values
  const formValues = Form.useWatch([], form);

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
            overflowY: "auto",
            maxHeight: "calc(100vh - 10px)",
            maxWidth: "1200px",
            height: "100%",
            paddingTop: "24px",
            paddingBottom: "24px",
            margin: "0 auto",
          }}
        >
          <Card style={{ width: "99%", margin: "0 auto", marginBottom: 8 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ difficulty: "intermediate", estimatedTime: 15 }}
            >
              <Title level={2}>Create New Module</Title>

              <Flex gap={16} style={{ marginBottom: 16 }}>
                <Form.Item
                  name="name"
                  label="Module Name"
                  rules={[
                    { required: true, message: "Please enter module name" },
                  ]}
                  style={{ flex: 2 }}
                  tooltip={{
                    title: "A concise, descriptive name for this module",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input placeholder="e.g. Introduction to Arrays" />
                </Form.Item>

                <Form.Item
                  name="moduleNumber"
                  label="Module Number"
                  rules={[
                    { required: true, message: "Please enter module number" },
                  ]}
                  style={{ flex: 1 }}
                  tooltip={{
                    title: "The sequence number of this module in the unit",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <InputNumber
                    placeholder="e.g. 1"
                    style={{ width: "100%" }}
                    min={1}
                  />
                </Form.Item>
              </Flex>

              <Flex gap={16}>
                <Form.Item
                  name="difficulty"
                  label="Difficulty Level"
                  style={{ flex: 1 }}
                  initialValue="intermediate"
                >
                  <Select>
                    <Option value="beginner">Beginner</Option>
                    <Option value="intermediate">Intermediate</Option>
                    <Option value="advanced">Advanced</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="estimatedTime"
                  label="Estimated Completion Time (minutes)"
                  style={{ flex: 1 }}
                  initialValue={15}
                >
                  <InputNumber
                    min={5}
                    max={120}
                    addonAfter="min"
                    style={{ width: "100%" }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Form.Item>
              </Flex>

              <Form.Item
                name="description"
                label={
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{ width: "100%" }}
                  >
                    <span>Description</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {descriptionLength}/500 characters
                    </Typography.Text>
                  </Flex>
                }
                rules={[
                  { required: true, message: "Please enter description" },
                  {
                    max: 500,
                    message: "Description cannot exceed 500 characters",
                  },
                ]}
                tooltip={{
                  title:
                    "A brief explanation of what students will learn in this module",
                  icon: <InfoCircleOutlined />,
                }}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter module description"
                  maxLength={500}
                  showCount={false}
                  onChange={(e) => setDescriptionLength(e.target.value.length)}
                />
              </Form.Item>

              <Divider>
                <Space>
                  <FieldTimeOutlined />
                  <span>Module Sections</span>
                </Space>
              </Divider>

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

              {/* Move the submit button inside the form */}
              <Form.Item style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCourseLoading}
                  disabled={sections.length === 0}
                  size="large"
                >
                  Create Module
                </Button>
              </Form.Item>
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
                              <SectionHeader
                                section={section}
                                snapshot={snapshot}
                                handleRemove={handleRemoveSection}
                                isCollapsed={collapsedSections.has(section.id)}
                                toggleCollapse={toggleSectionCollapse}
                              />
                              {!collapsedSections.has(section.id) &&
                                renderSectionContent(section, snapshot)}
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

          {/* Remove the duplicate submit button that was here */}
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
            maxWidth: "600px",
            height: "100%",
            overflowY: "auto",
            padding: "0 20px",
            margin: "24px auto",
          }}
        >
          <Card style={{ width: "100%", marginBottom: "16px", padding: 0 }}>
            <Flex vertical>
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: `1px solid ${token.colorBorder}`,
                }}
              >
                <Title level={4} style={{ margin: "0 0 8px 0" }}>
                  Module Preview
                </Title>
                <Typography.Text type="secondary">
                  Preview of how your module will appear to students
                </Typography.Text>
              </div>

              <div style={{ padding: "16px 24px" }}>
                {/* Module metadata preview */}
                <ConditionalRenderer
                  condition={!!formValues}
                  renderTrue={() => (
                    <Flex vertical gap={16}>
                      <div>
                        <Title level={3} style={{ margin: "0 0 8px 0" }}>
                          {formValues?.name || "Module Name"}
                        </Title>
                        {formValues?.difficulty && (
                          <Flex
                            align="center"
                            gap={8}
                            style={{ marginBottom: 8 }}
                          >
                            {formValues.difficulty === "beginner" && (
                              <Badge status="success" text="Beginner" />
                            )}
                            {formValues.difficulty === "intermediate" && (
                              <Badge status="warning" text="Intermediate" />
                            )}
                            {formValues.difficulty === "advanced" && (
                              <Badge status="error" text="Advanced" />
                            )}

                            {formValues.estimatedTime && (
                              <Flex align="center" gap={4}>
                                <ClockCircleOutlined />
                                <Typography.Text type="secondary">
                                  {formValues.estimatedTime} mins
                                </Typography.Text>
                              </Flex>
                            )}
                          </Flex>
                        )}
                        <Typography.Paragraph
                          style={{ marginTop: 16 }}
                          ellipsis={{
                            rows: 2,
                            expandable: true,
                            symbol: "Read more",
                          }}
                        >
                          {formValues?.description ||
                            "No description provided."}
                        </Typography.Paragraph>
                        {sections.length > 0 && (
                          <Typography.Text type="secondary">
                            This module contains {sections.length} section
                            {sections.length !== 1 ? "s" : ""}.
                          </Typography.Text>
                        )}
                      </div>

                      <Divider style={{ margin: "8px 0" }} />
                    </Flex>
                  )}
                  renderFalse={() => (
                    <div style={{ padding: "20px 0", textAlign: "center" }}>
                      <Typography.Text type="secondary">
                        Fill in module details above to see the preview
                      </Typography.Text>
                    </div>
                  )}
                />

                {/* Section previews */}
                <ConditionalRenderer
                  condition={sections.length > 0}
                  renderTrue={() => {
                    return (
                      <Flex vertical gap={24}>
                        {sections.map((s, index) => (
                          <div key={s.id} className="section-preview">
                            <Flex
                              align="center"
                              gap={8}
                              style={{ marginBottom: 8 }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: token.colorPrimary,
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                {index + 1}
                              </div>
                              <Typography.Text strong>
                                {s.type.charAt(0).toUpperCase() +
                                  s.type.slice(1)}
                              </Typography.Text>
                            </Flex>

                            <div
                              style={{
                                padding: "12px",
                                border: `1px solid ${token.colorBorder}`,
                                borderRadius: token.borderRadius,
                                background: token.colorBgContainer,
                              }}
                            >
                              {isNewMarkdown(s) && (
                                <PreviewMarkdown content={s.content} />
                              )}
                              {isNewQuestion(s) && (
                                <PreviewQuestion
                                  content={s.content}
                                  onAnswer={() => {}}
                                />
                              )}
                              {isNewCode(s) && (
                                <PreviewCode content={s.content} />
                              )}
                              {isNewLottie(s) && (
                                <PreviewLottie
                                  content={s.content}
                                  module={null}
                                />
                              )}
                              {isNewImage(s) && (
                                <PreviewImage
                                  content={s.content}
                                  module={null}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </Flex>
                    );
                  }}
                  renderFalse={() => (
                    <div
                      style={{
                        padding: "40px 0",
                        textAlign: "center",
                        color: token.colorTextSecondary,
                        border: `1px dashed ${token.colorBorder}`,
                        borderRadius: token.borderRadius,
                      }}
                    >
                      <FileTextOutlined
                        style={{ fontSize: 24, marginBottom: 16 }}
                      />
                      <Typography.Title level={5}>
                        No Content Yet
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        Add sections to see a preview of your module
                      </Typography.Text>
                    </div>
                  )}
                />
              </div>
            </Flex>
          </Card>
        </Flex>
      </Panel>
    </PanelGroup>
  );
};

export default CreateModulePage;
