import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Space, Spin, Flex, Button } from "antd";
import { Empty } from "antd";

import { useStore } from "../store";

const { Title, Text } = Typography;

const UnitPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, unitId } = useParams<{
    courseId: string;
    unitId: string;
  }>();

  const selectedUnit = useStore((state) => state.selectedUnit);
  const isCourseLoading = useStore((state) => state.isCourseLoading);
  const fetchUnit = useStore((state) => state.fetchUnit);

  const unit = selectedUnit;

  useEffect(() => {
    if (courseId && unitId) {
      fetchUnit(Number(courseId), Number(unitId));
    }
  }, [courseId, unitId]);

  if (isCourseLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty description={`Unit with ID ${unitId} not found.`} />
      </div>
    );
  }

  return (
    <div>
      <Flex vertical style={{ maxWidth: "50%" }}>
        <div>
          <Title level={2}>{unit.name}</Title>
          <Text type="secondary">{unit.description}</Text>
        </div>
        <Flex vertical gap={10}>
          {unit.modules.map((module) => (
            <Card
              key={module.id}
              title={`${module.moduleNumber} ${module.name}`}
              style={{ width: 400 }}
              actions={[
                <Button
                  title="Edit"
                  // TODO: add edit for modules
                  onClick={() => navigate("/")}
                >
                  Edit
                </Button>,
                <Button danger>Delete</Button>,
              ]}
            >
              <Text> {module.name}</Text>
            </Card>
          ))}
        </Flex>
      </Flex>
    </div>
  );
};

export default UnitPage;
