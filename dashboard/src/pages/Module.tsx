import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Divider,
  Progress,
  Spin,
  App,
  Breadcrumb,
  Affix,
  Tooltip,
  Steps,
  Badge,
  Row,
  Col,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  ReadOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  CodeOutlined,
  FileImageOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Empty } from "antd";
import { useStore } from "../store";
import {
  MarkdownContent,
  CodeContent,
  QuestionContent,
  LottieContent,
  ImageContent,
  SectionProgress,
} from "../types/models";
import MarkdownSection from "../components/sections/MarkdownSection";
import CodeSection from "../components/sections/CodeSection";
import QuestionSection from "../components/sections/QuestionSection";
import LottieSection from "../components/sections/LottieSection";
import ImageSection from "../components/sections/ImageSection";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Helper function to get section icon
const getSectionIcon = (type: string) => {
  switch (type) {
    case "markdown":
      return <FileTextOutlined />;
    case "code":
      return <CodeOutlined />;
    case "question":
      return <QuestionCircleOutlined />;
    case "lottie":
    case "video":
      return <ReadOutlined />;
    case "image":
      return <FileImageOutlined />;
    default:
      return <FileTextOutlined />;
  }
};

// Helper function to get section status
const getSectionStatus = (progress?: SectionProgress) => {
  if (!progress) return "wait";
  if (progress.completedAt) return "finish";
  if (progress.startedAt) return "process";
  return "wait";
};

const ModulePage: React.FC = () => {
  const { courseId, unitId, moduleId } = useParams<{
    courseId: string;
    unitId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [activeSection, setActiveSection] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // Store selectors
  const selectedModule = useStore((state) => state.selectedModule);
  const selectedCourse = useStore((state) => state.selectedCourse);
  const selectedUnit = useStore(() =>
    selectedCourse?.units.find((u) => u.id === Number(unitId))
  );
  const isCourseLoading = useStore((state) => state.isCourseLoading);
  const fetchModule = useStore((state) => state.fetchModule);
  const answerQuestion = useStore((state) => state.answerQuestion);
  const moduleNavigation = useStore((state) => state.moduleNavigation);
  const module = selectedModule;

  useEffect(() => {
    if (courseId && unitId && moduleId) {
      fetchModule(Number(courseId), Number(unitId), Number(moduleId));
    }
  }, [courseId, unitId, moduleId, fetchModule]);

  useEffect(() => {
    // Set active section to current section from module or first section
    if (module?.currentSectionNumber) {
      setActiveSection(module.currentSectionNumber);
    } else if (module?.sections && module?.sections.length > 0) {
      setActiveSection(0);
    }
  }, [module]);

  const handleAnswer = async (sectionId: number, optionId: number) => {
    if (courseId && unitId && moduleId) {
      try {
        await answerQuestion(
          Number(courseId),
          Number(unitId),
          Number(moduleId),
          sectionId,
          optionId
        );
        message.success("Answer submitted successfully");
      } catch {
        message.error("Failed to submit answer");
      }
    }
  };

  const handleNavigation = (
    nextModuleId?: number | null,
    nextUnitId?: number | null
  ) => {
    if (nextModuleId && nextUnitId) {
      navigate(
        `/courses/${courseId}/units/${nextUnitId}/modules/${nextModuleId}`
      );
    } else if (nextModuleId) {
      navigate(`/courses/${courseId}/units/${unitId}/modules/${nextModuleId}`);
    }
  };

  const handleSectionChange = (current: number) => {
    setActiveSection(current);
    // Scroll to section (could be enhanced with a more sophisticated scrolling mechanism)
    const element = document.getElementById(`section-${current}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isCourseLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!module) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Empty description={`Module with ID ${moduleId} not found.`} />
      </div>
    );
  }

  const estimatedReadTime = module.sections.length * 5; // Simple estimation, 5 min per section

  return (
    <div
      className="module-page"
      style={{ maxWidth: "1100px", margin: "0 auto" }}
    >
      {/* Breadcrumb navigation */}
      <Breadcrumb style={{ marginBottom: "12px" }}>
        <Breadcrumb.Item>
          <Link to="/courses">
            <HomeOutlined /> Courses
          </Link>
        </Breadcrumb.Item>
        {selectedCourse && (
          <Breadcrumb.Item>
            <Link to={`/courses/${courseId}`}>{selectedCourse.name}</Link>
          </Breadcrumb.Item>
        )}
        {selectedUnit && (
          <Breadcrumb.Item>
            <Link to={`/courses/${courseId}/units/${unitId}`}>
              Unit {selectedUnit.unitNumber}: {selectedUnit.name}
            </Link>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>{module.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={16}>
        {/* Sidebar with section navigation */}
        {showSidebar && (
          <Col xs={24} md={6}>
            <Affix offsetTop={10}>
              <Card size="small" className="section-nav-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <Text strong>Module Sections</Text>
                  <Tag color="blue">
                    <ClockCircleOutlined /> ~{estimatedReadTime} min
                  </Tag>
                </div>

                <Steps
                  direction="vertical"
                  size="small"
                  current={activeSection}
                  onChange={handleSectionChange}
                  style={{
                    maxHeight: "60vh",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  {module.sections.map((section, index) => (
                    <Step
                      key={section.id}
                      title={`Section ${index + 1}`}
                      description={
                        <Text ellipsis style={{ fontSize: "12px" }}>
                          {section.type.charAt(0).toUpperCase() +
                            section.type.slice(1)}
                        </Text>
                      }
                      icon={getSectionIcon(section.type)}
                      status={getSectionStatus(section.progress)}
                    />
                  ))}
                </Steps>

                <div style={{ marginTop: "12px" }}>
                  <Progress
                    percent={Math.round(module.progress * 100)}
                    size="small"
                    status={
                      module.status === "completed" ? "success" : "active"
                    }
                  />
                </div>
              </Card>
            </Affix>
          </Col>
        )}

        {/* Main content */}
        <Col xs={24} md={showSidebar ? 18 : 24}>
          <Card size="small">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setShowSidebar(!showSidebar)}
                  size="small"
                />
                <Title
                  level={3}
                  style={{ marginTop: "8px", marginBottom: "4px" }}
                >
                  {module.name}
                </Title>
                <Paragraph type="secondary">{module.description}</Paragraph>
              </div>

              <Space>
                <Tooltip
                  title={
                    module.status === "completed" ? "Completed" : "In progress"
                  }
                >
                  <Badge
                    status={
                      module.status === "completed" ? "success" : "processing"
                    }
                    text={module.status.replace("_", " ")}
                  />
                </Tooltip>
              </Space>
            </div>

            <Progress
              percent={Math.round(module.progress * 100)}
              size="small"
              status={module.status === "completed" ? "success" : "active"}
              style={{ marginBottom: "24px" }}
            />

            <div className="module-sections">
              {module.sections.map((section, index) => (
                <div
                  key={section.id}
                  id={`section-${index}`}
                  style={{ marginBottom: 24, scrollMarginTop: "20px" }}
                  className={activeSection === index ? "active-section" : ""}
                >
                  <div
                    className="section-header"
                    style={{ marginBottom: "8px" }}
                  >
                    <Space>
                      {getSectionIcon(section.type)}
                      <Text strong>Section {index + 1}</Text>
                      {section.progress?.completedAt && (
                        <CheckCircleFilled style={{ color: "#52c41a" }} />
                      )}
                    </Space>
                  </div>

                  {section.type === "markdown" && (
                    <MarkdownSection
                      content={section.content as MarkdownContent}
                    />
                  )}
                  {section.type === "code" && (
                    <CodeSection content={section.content as CodeContent} />
                  )}
                  {section.type === "question" && (
                    <QuestionSection
                      content={section.content as QuestionContent}
                      onAnswer={(optionId) =>
                        handleAnswer(section.id!, optionId)
                      }
                    />
                  )}
                  {section.type === "lottie" && (
                    <LottieSection
                      content={section.content as LottieContent}
                      module={module}
                    />
                  )}
                  {section.type === "image" && (
                    <ImageSection
                      content={section.content as ImageContent}
                      module={module}
                    />
                  )}
                  <Divider style={{ margin: "16px 0" }} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                icon={<ArrowLeftOutlined />}
                disabled={!moduleNavigation?.prevModuleId}
                onClick={() =>
                  handleNavigation(
                    moduleNavigation?.prevModuleId,
                    moduleNavigation?.prevUnitId
                  )
                }
                size="middle"
              >
                Previous
              </Button>

              <Button
                type="primary"
                disabled={!moduleNavigation?.nextModuleId}
                onClick={() =>
                  handleNavigation(
                    moduleNavigation?.nextModuleId,
                    moduleNavigation?.nextUnitId
                  )
                }
                size="middle"
              >
                Next
                <ArrowRightOutlined />
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModulePage;
