import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Switch,
  Select,
  Card,
  ColorPicker,
  Space,
  Tag,
  Upload,
  message,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import { Course, DifficultyLevel } from "../../types/models";
import { UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface CourseFormProps {
  initialValues?: Partial<Course>;
  onSubmit: (values: Partial<Course>, iconFile?: RcFile) => void;
  loading?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>(initialValues?.imgUrl || "");
  const [iconFile, setIconFile] = useState<RcFile | null>(null);

  const handleImageSelect = (file: RcFile) => {
    setIconFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    form.setFieldsValue({ imgUrl: "" }); // Clear the URL field as we're using local file
    return false; // Prevent default upload behavior
  };

  const handleFormSubmit = (values: Partial<Course>) => {
    // Pass both values and the file to parent onSubmit
    onSubmit(values, iconFile || undefined);
  };

  const uploadProps = {
    beforeUpload: handleImageSelect,
    showUploadList: false,
    accept: "image/*",
  };

  return (
    <Card
      bordered={false}
      className="course-form-card"
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          draft: true,
          backgroundColor: "#ffffff",
          imgUrl: "",
          difficultyLevel: "beginner",
          ...initialValues,
        }}
        onFinish={handleFormSubmit}
        style={{ maxWidth: "100%" }}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Title level={4} style={{ marginBottom: 24 }}>
              Basic Information
            </Title>
            <Form.Item
              name="name"
              label="Course Name"
              rules={[
                { required: true, message: "Please enter a course name" },
              ]}
            >
              <Input placeholder="Enter course name" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter a course description",
                },
              ]}
            >
              <TextArea rows={4} placeholder="Enter course description" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Title level={4} style={{ marginBottom: 24 }}>
              Course Display
            </Title>
            <Form.Item
              name="imgUrl"
              label="Course Icon"
              extra={
                <Text type="secondary">Upload an image or provide a URL</Text>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    border: imageUrl
                      ? "1px solid #f0f0f0"
                      : "2px dashed #d9d9d9",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px",
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "150px",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Course icon"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "120px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <Text type="secondary" style={{ marginBottom: "8px" }}>
                      No image selected
                    </Text>
                  )}
                  <Upload {...uploadProps} style={{ marginTop: "12px" }}>
                    <Button
                      icon={<UploadOutlined />}
                      style={{ marginTop: "8px" }}
                    >
                      {imageUrl ? "Change Image" : "Select Image"}
                    </Button>
                  </Upload>
                </div>
                <Input
                  placeholder="Or enter icon URL"
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setIconFile(null); // Clear file selection if URL is entered
                  }}
                  prefix={<InfoCircleOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Space>
            </Form.Item>

            <Form.Item name="backgroundColor" label="Background Color">
              <ColorPicker />
            </Form.Item>

            <Form.Item
              name="difficultyLevel"
              label="Difficulty Level"
              rules={[
                { required: true, message: "Please select a difficulty level" },
              ]}
            >
              <Select>
                <Select.Option value="beginner">Beginner</Select.Option>
                <Select.Option value="intermediate">Intermediate</Select.Option>
                <Select.Option value="advanced">Advanced</Select.Option>
                <Select.Option value="expert">Expert</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={4} style={{ marginBottom: 24 }}>
          Course Content Information
        </Title>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="requirements"
              label="Requirements"
              rules={[
                { required: true, message: "Please enter course requirements" },
              ]}
            >
              <TextArea rows={4} placeholder="Enter course requirements" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="whatYouLearn"
              label="What You'll Learn"
              rules={[
                {
                  required: true,
                  message: "Please enter what students will learn",
                },
              ]}
            >
              <TextArea rows={4} placeholder="Enter what students will learn" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="draft"
          label="Draft Mode"
          valuePropName="checked"
          help="Keep in draft mode while creating content"
        >
          <Switch defaultChecked />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ minWidth: "120px" }}
          >
            {initialValues ? "Update Course" : "Create Course"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CourseForm;
