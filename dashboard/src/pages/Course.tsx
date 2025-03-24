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
  Spin,
  Empty,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  BookOutlined,
  OrderedListOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useStore } from "../store";
import { buildImgUrl } from "../store/utils";
import { Unit, Module } from "../types/models";

const { Title, Text, Paragraph } = Typography;

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isUnitModalVisible, setIsUnitModalVisible] = React.useState(false);

  const createUnit = useStore((state) => state.createUnit);
  const course = useStore((state) => state.selectedCourse);
  const fetchCourse = useStore((state) => state.fetchCourse);
  const isCourseLoading = useStore((state) => state.isCourseLoading);

  const imageUrl = buildImgUrl(
    "courses",
    course?.folderObjectKey,
    course?.imgKey,
    course?.mediaExt
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
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty description={`Course not found.`} />
      </div>
    );
  }

  const moduleItem = (unit: Unit, module: Module) => (
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
          </Space>
          <RightOutlined style={{ opacity: 0.5 }} />
        </Space>
      </Link>
    </li>
  );

  const unitItems = course.units?.map((unit) => ({
    key: unit.id,
    label: (
      <Space>
        <BookOutlined />
        <Text strong>{unit.name}</Text>
        <Text type="secondary">({unit.modules?.length || 0} modules)</Text>
      </Space>
    ),
    children: unit.modules?.length ? (
      <div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginBottom: 16 }}
          onClick={() =>
            navigate(`/courses/${id}/units/${unit.id}/modules/create`)
          }
        >
          Add Module
        </Button>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {unit.modules.map((module) => moduleItem(unit, module))}
        </ul>
      </div>
    ) : (
      <div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            navigate(`/courses/${id}/units/${unit.id}/modules/create`)
          }
        >
          Add First Module
        </Button>
      </div>
    ),
  }));

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
                <img
                  src={imageUrl}
                  alt="Course icon"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "120px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </div>
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
            {course.units.length ? (
              <Collapse items={unitItems} />
            ) : (
              <Space>Course does not have units.</Space>
            )}
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
        confirmLoading={isCourseLoading}
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
            name="unitNumber"
            label="Unit Number"
            rules={[{ required: true, message: "Please enter unit number" }]}
          >
            <Input placeholder="Enter unit number" />
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
