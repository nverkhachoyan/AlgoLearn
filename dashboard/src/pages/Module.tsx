import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Divider,
  Progress,
  Spin,
  App,
} from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Empty } from "antd";
import { useStore } from "../store";
import {
  MarkdownContent,
  CodeContent,
  QuestionContent,
  LottieContent,
} from "../types/models";
import MarkdownSection from "../components/sections/MarkdownSection";
import CodeSection from "../components/sections/CodeSection";
import QuestionSection from "../components/sections/QuestionSection";
import LottieSection from "../components/sections/LottieSection";

const { Title, Text } = Typography;

const ModulePage: React.FC = () => {
  const { courseId, unitId, moduleId } = useParams<{
    courseId: string;
    unitId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const selectedModule = useStore((state) => state.selectedModule);
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

  if (isCourseLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!module) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty description={`Module with ID ${moduleId} not found.`} />
      </div>
    );
  }

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2}>{module.name}</Title>
            <Text type="secondary">{module.description}</Text>
          </div>

          <Progress
            percent={Math.round(module.progress * 100)}
            status={module.status === "completed" ? "success" : "active"}
          />

          <div>
            {module.sections.map((section) => (
              <div key={section.id} style={{ marginBottom: 24 }}>
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
                    onAnswer={(optionId) => handleAnswer(section.id!, optionId)}
                  />
                )}
                {section.type === "lottie" && (
                  <LottieSection
                    content={section.content as LottieContent}
                    module={module}
                  />
                )}
                <Divider />
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
            >
              Previous Module
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
            >
              Next Module
              <ArrowRightOutlined />
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ModulePage;
