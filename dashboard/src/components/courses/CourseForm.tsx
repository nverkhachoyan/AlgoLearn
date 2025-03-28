import React, { useState, useEffect } from "react";
import "./CourseForm.css"; // Import custom CSS for additional compact styling
import {
  Form,
  Input,
  Button,
  Switch,
  Select,
  Card,
  ColorPicker,
  Space,
  Upload,
  Typography,
  Row,
  Col,
  Divider,
  InputNumber,
  Tag as AntTag,
  Tooltip,
} from "antd";
import { UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload/interface";
import { Author, Course, DifficultyLevel, Tag } from "../../types/models";
import { buildImgUrl } from "../../store/utils";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface CourseFormProps {
  initialValues?: Partial<Course>;
  onSubmit: (values: Partial<Course>, iconFile?: RcFile) => void;
  loading?: boolean;
  availableAuthors?: Author[];
  availableTags?: Tag[];
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  availableAuthors = [],
  availableTags = [],
}) => {
  const [form] = Form.useForm();
  const [iconFile, setIconFile] = useState<RcFile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>(
    initialValues?.authors || []
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    initialValues?.tags || []
  );

  useEffect(() => {
    if (
      initialValues?.folderObjectKey &&
      initialValues?.imgKey &&
      initialValues?.mediaExt
    ) {
      const url = buildImgUrl(
        "courses",
        initialValues.folderObjectKey,
        initialValues.imgKey,
        initialValues.mediaExt
      );
      setImageUrl(url);
    } else if (initialValues?.imgUrl) {
      setImageUrl(initialValues.imgUrl);
    }
  }, [initialValues]);

  const handleImageSelect = (file: RcFile) => {
    setIconFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    form.setFieldsValue({ imgUrl: "" });
    return false;
  };

  const handleFormSubmit = (values: Partial<Course>) => {
    // Add authors and tags to form values
    const formValues = {
      ...values,
      authors: selectedAuthors,
      tags: selectedTags,
    };
    onSubmit(formValues, iconFile || undefined);
  };

  const uploadProps = {
    beforeUpload: handleImageSelect,
    showUploadList: false,
    accept: "image/*",
  };

  // Handle author selection changes
  const handleAuthorChange = (authorIds: number[]) => {
    const newSelectedAuthors = availableAuthors.filter((author) =>
      authorIds.includes(author.id)
    );
    setSelectedAuthors(newSelectedAuthors);
  };

  // Handle tag selection changes
  const handleTagChange = (tagIds: number[]) => {
    const newSelectedTags = availableTags.filter((tag) =>
      tagIds.includes(tag.id)
    );
    setSelectedTags(newSelectedTags);
  };

  // Get initial author IDs for the form
  const initialAuthorIds =
    initialValues?.authors?.map((author) => author.id) || [];

  // Get initial tag IDs for the form
  const initialTagIds = initialValues?.tags?.map((tag) => tag.id) || [];

  // Set default initial values
  const defaultInitialValues = {
    draft: true,
    backgroundColor: "#ffffff",
    imgUrl: "",
    difficultyLevel: "beginner" as DifficultyLevel,
    duration: 0,
    rating: 0,
    progress: 0,
    ...initialValues,
  };

  return (
    <Card
      bordered={false}
      className="course-form-card"
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultInitialValues}
        onFinish={handleFormSubmit}
        style={{ maxWidth: "100%" }}
        requiredMark="optional"
        size="middle"
        className="compact-form"
      >
        {/* Basic Information Section */}
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Title level={5} style={{ marginBottom: 16 }}>
              Basic Information
            </Title>
            <Form.Item
              name="name"
              label="Course Name"
              rules={[
                { required: true, message: "Please enter a course name" },
                { max: 100, message: "Name cannot exceed 100 characters" },
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
              <TextArea
                rows={4}
                placeholder="Enter course description"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="difficultyLevel"
                  label="Difficulty Level"
                  rules={[
                    {
                      required: true,
                      message: "Please select a difficulty level",
                    },
                  ]}
                >
                  <Select placeholder="Select difficulty level">
                    <Option value="beginner">Beginner</Option>
                    <Option value="intermediate">Intermediate</Option>
                    <Option value="advanced">Advanced</Option>
                    <Option value="expert">Expert</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="duration"
                  label="Duration (hours)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter estimated duration",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "Duration must be positive",
                    },
                  ]}
                  tooltip="Estimated time to complete this course in hours"
                >
                  <InputNumber
                    min={0}
                    step={0.5}
                    style={{ width: "100%" }}
                    placeholder="Est. hours to complete"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* Course Display Section */}
          <Col xs={24} md={8}>
            <Title level={5} style={{ marginBottom: 16 }}>
              Course Display
            </Title>
            <Form.Item
              name="imgUrl"
              label="Course Icon"
              extra={
                <Text type="secondary">
                  {initialValues?.imgKey
                    ? "Current image shown. Upload a new one to replace it."
                    : "Upload an image or provide a URL"}
                </Text>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    border: imageUrl
                      ? "1px solid #f0f0f0"
                      : "2px dashed #d9d9d9",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "12px",
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Course icon"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100px",
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
                {!initialValues?.imgKey && (
                  <Input
                    placeholder="Or enter icon URL"
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setIconFile(null); // Clear file selection if URL is entered
                    }}
                    prefix={<InfoCircleOutlined style={{ color: "#bfbfbf" }} />}
                  />
                )}
              </Space>
            </Form.Item>

            <Form.Item
              name="backgroundColor"
              label="Background Color"
              tooltip="Background color for the course card"
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "16px 0" }} />

        {/* Authors and Tags Section */}
        <Title level={5} style={{ marginBottom: 16 }}>
          Classification
        </Title>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Authors"
              tooltip="Select one or more course authors"
              rules={[
                {
                  validator: () => {
                    if (selectedAuthors.length === 0) {
                      return Promise.reject(
                        "Please select at least one author"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select authors"
                style={{ width: "100%" }}
                defaultValue={initialAuthorIds}
                onChange={handleAuthorChange}
                optionFilterProp="children"
                optionLabelProp="label"
              >
                {availableAuthors.map((author) => (
                  <Option key={author.id} value={author.id} label={author.name}>
                    {author.name}
                  </Option>
                ))}
              </Select>
              <div style={{ marginTop: "8px" }}>
                {selectedAuthors.map((author) => (
                  <AntTag
                    key={author.id}
                    color="blue"
                    style={{ margin: "4px" }}
                  >
                    {author.name}
                  </AntTag>
                ))}
              </div>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Tags"
              tooltip="Select relevant tags for this course"
            >
              <Select
                mode="multiple"
                placeholder="Select tags"
                style={{ width: "100%" }}
                defaultValue={initialTagIds}
                onChange={handleTagChange}
                optionFilterProp="children"
              >
                {availableTags.map((tag) => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
              <div style={{ marginTop: "8px" }}>
                {selectedTags.map((tag) => (
                  <AntTag key={tag.id} color="green" style={{ margin: "4px" }}>
                    {tag.name}
                  </AntTag>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "16px 0" }} />

        {/* Course Content Information */}
        <Title level={5} style={{ marginBottom: 16 }}>
          Course Content Information
        </Title>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="requirements"
              label="Requirements"
              tooltip="What students need before taking this course"
              rules={[
                { required: true, message: "Please enter course requirements" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter prerequisites and requirements"
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="whatYouLearn"
              label="What You'll Learn"
              tooltip="Key takeaways and skills students will acquire"
              rules={[
                {
                  required: true,
                  message: "Please enter what students will learn",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Key learning outcomes and skills"
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Draft Mode Toggle */}
        <Form.Item
          name="draft"
          label={
            <span>
              Draft Mode
              <Tooltip title="Keep in draft mode while creating content. Course won't be visible to students until published.">
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </span>
          }
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item style={{ marginTop: 16, textAlign: "center" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ minWidth: "120px" }}
          >
            {initialValues?.id ? "Update Course" : "Create Course"}
          </Button>
          <Button style={{ marginLeft: 12 }} onClick={() => form.resetFields()}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CourseForm;
