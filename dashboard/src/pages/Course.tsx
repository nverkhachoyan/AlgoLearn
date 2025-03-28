import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Collapse,
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Spin,
  Empty,
  Avatar,
  Tooltip,
  Progress,
  Divider,
  List,
  Statistic,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  BookOutlined,
  RightOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  TagOutlined,
  StarFilled,
  FireOutlined,
} from "@ant-design/icons";
import { useStore } from "../store";
import { buildImgUrl } from "../store/utils";
import { Unit, DifficultyLevel } from "../types/models";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Helper function to get difficulty level color
const getDifficultyColor = (level: DifficultyLevel): string => {
  const colors = {
    beginner: "#52c41a", // Green
    intermediate: "#1890ff", // Blue
    advanced: "#fa8c16", // Orange
    expert: "#f5222d", // Red
  };
  return colors[level] || "#1890ff";
};

// Helper component for displaying difficulty level with an icon
const DifficultyTag: React.FC<{ level: DifficultyLevel }> = ({ level }) => {
  const getIcon = () => {
    switch (level) {
      case "beginner":
        return <FireOutlined />;
      case "intermediate":
        return <FireOutlined />;
      case "advanced":
        return <FireOutlined />;
      case "expert":
        return <FireOutlined />;
      default:
        return <FireOutlined />;
    }
  };

  return (
    <Tag color={getDifficultyColor(level)} icon={getIcon()}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Tag>
  );
};

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isUnitModalVisible, setIsUnitModalVisible] = React.useState(false);

  const createUnit = useStore((state) => state.createUnit);
  const course = useStore((state) => state.selectedCourse);
  const fetchCourse = useStore((state) => state.fetchCourse);
  const isCourseLoading = useStore((state) => state.isCourseLoading);

  const imageUrl = useMemo(
    () =>
      buildImgUrl(
        "courses",
        course?.folderObjectKey,
        course?.imgKey,
        course?.mediaExt
      ),
    [course?.folderObjectKey, course?.imgKey, course?.mediaExt]
  );

  useEffect(() => {
    if (id) {
      fetchCourse(Number(id));
    }
  }, [id, fetchCourse]);

  const handleCreateUnit = async (values: {
    name: string;
    unitNumber: number;
    description: string;
  }) => {
    if (id) {
      await createUnit(Number(id), {
        name: values.name,
        unitNumber: Number(values.unitNumber),
        description: values.description,
      });
      setIsUnitModalVisible(false);
      form.resetFields();
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

  if (!course) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Empty description="Course not found" />
      </div>
    );
  }

  const renderModulesList = (unit: Unit) => {
    if (!unit.modules.length) {
      return (
        <div style={{ padding: "8px 0" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No modules yet"
            style={{ margin: "8px 0" }}
          />
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate(`/courses/${id}/units/${unit.id}/modules/create`)
            }
          >
            Add First Module
          </Button>
        </div>
      );
    }

    return (
      <div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          style={{ marginBottom: 8 }}
          onClick={() =>
            navigate(`/courses/${id}/units/${unit.id}/modules/create`)
          }
        >
          Add Module
        </Button>
        <List
          size="small"
          itemLayout="horizontal"
          dataSource={unit.modules}
          renderItem={(module) => (
            <List.Item
              key={module.id}
              actions={[
                <Link
                  to={`/courses/${id}/units/${unit.id}/modules/${module.id}`}
                >
                  <Button type="link" size="small" icon={<RightOutlined />} />
                </Link>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Link
                    to={`/courses/${id}/units/${unit.id}/modules/${module.id}`}
                  >
                    {module.name}
                  </Link>
                }
                description={
                  <Space size={1}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Module {module.moduleNumber}
                    </Text>
                    {module.sections?.length > 0 && (
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        • {module.sections.length} sections
                      </Text>
                    )}
                    {module.status && module.status !== "uninitiated" && (
                      <Tag
                        color={
                          module.status === "completed"
                            ? "success"
                            : "processing"
                        }
                        style={{ fontSize: "12px", padding: "0 4px" }}
                      >
                        {module.status.replace("_", " ")}
                      </Tag>
                    )}
                  </Space>
                }
              />
              {module.progress > 0 && (
                <Progress
                  percent={module.progress}
                  size="small"
                  style={{ width: 60 }}
                />
              )}
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <div
      className="course-page"
      style={{ maxWidth: "1000px", margin: "0 auto" }}
    >
      <Card size="small">
        <Row gutter={[16, 16]}>
          {/* Course header with actions */}
          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {course.name}
                </Title>
              </Col>
              <Col>
                <Space size="small">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/courses/${id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setIsUnitModalVisible(true)}
                  >
                    Add Unit
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>

          {/* Course image and metadata */}
          <Col xs={24} md={8}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <img
                  src={imageUrl}
                  alt={`${course.name} cover`}
                  style={{
                    width: "100%",
                    maxHeight: "150px",
                    objectFit: "contain",
                    borderRadius: "6px",
                    background: course.backgroundColor || "#f0f2f5",
                  }}
                />
              </div>

              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Row gutter={[8, 0]}>
                  <Col span={12}>
                    <Statistic
                      title="Duration"
                      value={`${course.duration} hrs`}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ fontSize: "16px" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Rating"
                      value={course.rating}
                      prefix={<StarFilled style={{ color: "#faad14" }} />}
                      precision={1}
                      valueStyle={{ fontSize: "16px" }}
                    />
                  </Col>
                </Row>

                <Divider style={{ margin: "8px 0" }} />

                <div>
                  <Title
                    level={5}
                    style={{ fontSize: "14px", marginBottom: "4px" }}
                  >
                    <Space>
                      <TagOutlined />
                      Tags
                    </Space>
                  </Title>
                  <div>
                    {course.tags && course.tags.length > 0 ? (
                      course.tags.map((tag) => (
                        <Tag key={tag.id} style={{ margin: "0 4px 4px 0" }}>
                          {tag.name}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary">No tags</Text>
                    )}
                  </div>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <div>
                  <Title
                    level={5}
                    style={{ fontSize: "14px", marginBottom: "4px" }}
                  >
                    <Space>
                      <UserOutlined />
                      Authors
                    </Space>
                  </Title>
                  <div>
                    {course.authors && course.authors.length > 0 ? (
                      <Avatar.Group maxCount={3} size="small">
                        {course.authors.map((author) => (
                          <Tooltip key={author.id} title={author.name}>
                            <Avatar size="small">
                              {author.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Avatar.Group>
                    ) : (
                      <Text type="secondary">No authors listed</Text>
                    )}
                  </div>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <Space wrap size={[0, 4]}>
                  <DifficultyTag level={course.difficultyLevel} />
                  <Tag color={course.draft ? "warning" : "success"}>
                    {course.draft ? "Draft" : "Published"}
                  </Tag>
                  {course.progress > 0 && (
                    <Tag color="processing" icon={<TrophyOutlined />}>
                      {course.progress}%
                    </Tag>
                  )}
                </Space>
              </Space>
            </Space>
          </Col>

          {/* Course details */}
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div>
                <Title level={5} style={{ marginBottom: "4px" }}>
                  Description
                </Title>
                <Paragraph
                  ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                >
                  {course.description}
                </Paragraph>
              </div>

              <div>
                <Title level={5} style={{ marginBottom: "4px" }}>
                  What You'll Learn
                </Title>
                <Paragraph
                  ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                >
                  {course.whatYouLearn}
                </Paragraph>
              </div>

              <div>
                <Title level={5} style={{ marginBottom: "4px" }}>
                  Requirements
                </Title>
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
                >
                  {course.requirements}
                </Paragraph>
              </div>

              {course.progress > 0 && (
                <div>
                  <Title level={5} style={{ marginBottom: "4px" }}>
                    Your Progress
                  </Title>
                  <Progress
                    percent={course.progress}
                    size="small"
                    status="active"
                  />
                  {course.currentUnit && (
                    <Text type="secondary">
                      Current:{" "}
                      <Link
                        to={`/courses/${id}/units/${course.currentUnit.id}`}
                      >
                        {course.currentUnit.name}
                      </Link>
                    </Text>
                  )}
                </div>
              )}
            </Space>
          </Col>

          {/* Units section */}
          <Col span={24}>
            <Title level={4} style={{ marginBottom: "8px" }}>
              <Space>
                <BookOutlined />
                Course Units ({course.units.length})
              </Space>
            </Title>

            {course.units.length > 0 ? (
              <Collapse defaultActiveKey={course.currentUnit?.id} size="small">
                {course.units.map((unit) => (
                  <Panel
                    key={Number(unit.id)}
                    header={
                      <Space>
                        <Text strong>Unit {unit.unitNumber}:</Text>
                        <Text>{unit.name}</Text>
                        <Text type="secondary">
                          ({unit.modules?.length || 0} modules)
                        </Text>
                      </Space>
                    }
                    extra={
                      <Tag color="blue">
                        {unit.modules.length}{" "}
                        {unit.modules.length === 1 ? "module" : "modules"}
                      </Tag>
                    }
                  >
                    <Paragraph
                      ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
                    >
                      {unit.description}
                    </Paragraph>
                    {renderModulesList(unit)}
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <Empty
                description="This course doesn't have any units yet."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setIsUnitModalVisible(true)}
                >
                  Add First Unit
                </Button>
              </Empty>
            )}
          </Col>
        </Row>
      </Card>

      {/* Create Unit Modal */}
      <Modal
        title="Create New Unit"
        open={isUnitModalVisible}
        onOk={form.submit}
        onCancel={() => {
          setIsUnitModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={isCourseLoading}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUnit}
          size="small"
        >
          <Form.Item
            name="name"
            label="Unit Name"
            rules={[{ required: true, message: "Please enter unit name" }]}
          >
            <Input placeholder="Enter unit name" />
          </Form.Item>
          <Form.Item
            name="unitNumber"
            label="Unit Number"
            rules={[
              { required: true, message: "Please enter unit number" },
              {
                type: "number",
                min: 1,
                message: "Unit number must be positive",
              },
            ]}
            initialValue={course.units.length + 1}
          >
            <Input type="number" placeholder="Enter unit number" min={1} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter unit description" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter unit description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursePage;
