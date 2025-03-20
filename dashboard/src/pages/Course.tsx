import React, { useEffect } from "react";
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
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  BookOutlined,
  OrderedListOutlined,
  RightOutlined,
} from "@ant-design/icons";
import useStore from "../store";
import { Unit } from "../types/models";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const cdnUrl = "https://algolearn.sfo3.cdn.digitaloceanspaces.com";

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isUnitModalVisible, setIsUnitModalVisible] = React.useState(false);

  const {
    selectedCourse: course,
    fetchCourse,
    isLoading,
    createUnit,
  } = useStore();

  useEffect(() => {
    if (id) {
      fetchCourse(Number(id));
    }
  }, [id, fetchCourse]);

  const handleCreateUnit = async (values: {
    name: string;
    description: string;
  }) => {
    if (id) {
      await createUnit(Number(id), values);
      setIsUnitModalVisible(false);
      form.resetFields();
    }
  };

  if (!course) {
    return null;
  }

  return (
    <div>
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={2}>{course.name}</Title>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/courses/${id}/edit`)}
              >
                Edit Course
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsUnitModalVisible(true)}
              >
                Add Unit
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={5}>Description</Title>
                <Paragraph>{course.description}</Paragraph>
              </div>

              <div>
                <Title level={5}>Requirements</Title>
                <Paragraph>{course.requirements}</Paragraph>
              </div>

              <div>
                <Title level={5}>What You'll Learn</Title>
                <Paragraph>{course.whatYouLearn}</Paragraph>
              </div>

              <div>
                <Space>
                  <Tag color="blue">{course.difficultyLevel}</Tag>
                  <Tag color={course.draft ? "orange" : "green"}>
                    {course.draft ? "Draft" : "Published"}
                  </Tag>
                </Space>
              </div>
            </Space>
          </Col>

          <Col span={24}>
            <Title level={3}>
              <Space>
                <OrderedListOutlined />
                Units
              </Space>
            </Title>
            <Collapse>
              {course.units?.map((unit) => (
                <Panel
                  header={
                    <Space>
                      <BookOutlined />
                      <Text strong>{unit.name}</Text>
                      <Text type="secondary">
                        ({unit.modules?.length || 0} modules)
                      </Text>
                    </Space>
                  }
                  key={unit.id}
                >
                  {unit.modules?.length ? (
                    <div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                        onClick={() =>
                          navigate(
                            `/courses/${id}/units/${unit.id}/modules/create`
                          )
                        }
                      >
                        Add Module
                      </Button>
                      <ul style={{ listStyleType: "none", padding: 0 }}>
                        {unit.modules.map((module) => (
                          <li
                            key={module.id}
                            style={{
                              padding: "8px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <Link
                              to={`/courses/${id}/units/${unit.id}/modules/${module.id}`}
                              style={{ display: "block", color: "inherit" }}
                            >
                              <Space
                                style={{
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Space>
                                  <Text>{module.name}</Text>
                                  <Tag color="blue">{module.status}</Tag>
                                </Space>
                                <RightOutlined style={{ opacity: 0.5 }} />
                              </Space>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          navigate(
                            `/courses/${id}/units/${unit.id}/modules/create`
                          )
                        }
                      >
                        Add First Module
                      </Button>
                    </div>
                  )}
                </Panel>
              ))}
            </Collapse>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Create New Unit"
        open={isUnitModalVisible}
        onOk={form.submit}
        onCancel={() => {
          setIsUnitModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={isLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUnit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter unit name" }]}
          >
            <Input placeholder="Enter unit name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter unit description" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter unit description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursePage;
