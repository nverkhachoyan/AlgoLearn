import React from "react";
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
} from "antd";
import { Course, DifficultyLevel } from "../../types/models";

const { TextArea } = Input;

interface CourseFormProps {
  initialValues?: Partial<Course>;
  onSubmit: (values: Partial<Course>) => void;
  loading?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          draft: true,
          backgroundColor: "#ffffff",
          iconUrl: "",
          difficultyLevel: "beginner",
          ...initialValues,
        }}
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="Course Name"
          rules={[{ required: true, message: "Please enter a course name" }]}
        >
          <Input placeholder="Enter course name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please enter a course description" },
          ]}
        >
          <TextArea rows={4} placeholder="Enter course description" />
        </Form.Item>

        <Form.Item
          name="requirements"
          label="Requirements"
          rules={[
            { required: true, message: "Please enter course requirements" },
          ]}
        >
          <TextArea rows={4} placeholder="Enter course requirements" />
        </Form.Item>

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

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Form.Item name="backgroundColor" label="Background Color">
            <ColorPicker />
          </Form.Item>

          <Form.Item name="iconUrl" label="Icon URL">
            <Input placeholder="Enter icon URL" />
          </Form.Item>
        </Space>

        <Form.Item
          name="draft"
          label="Draft Mode"
          valuePropName="checked"
          help="Keep in draft mode while creating content"
        >
          <Switch defaultChecked />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? "Update Course" : "Create Course"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CourseForm;
