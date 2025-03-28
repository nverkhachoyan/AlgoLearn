import {
  Flex,
  Image,
  Input,
  Typography,
  Card,
  Form,
  Button,
  InputNumber,
  Divider,
  Upload,
  message,
} from "antd";
import type {
  UploadProps,
  UploadFile,
  RcFile,
  UploadChangeParam,
} from "antd/es/upload/interface";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";
import { NewImage, NewSection } from "../../../store/types";
import React, { useEffect, useState } from "react";
import "./markdown.css";
import {
  UploadOutlined,
  PictureOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Dragger } = Upload;

type ImageSectionProps = {
  section: NewSection & { content: NewImage };
  snapshot: DraggableStateSnapshot;
  onChange: (updatedSection: NewSection) => void;
};

const ImageSection: React.FC<ImageSectionProps> = ({ section, onChange }) => {
  const [imgUrl, setImgUrl] = useState<string>(section.content.url || "");

  useEffect(() => {
    return () => {
      if (imgUrl && imgUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imgUrl);
      }
    };
  }, [imgUrl]);

  const updateSection = (updatedContent: Partial<NewImage>) => {
    onChange({
      ...section,
      content: {
        ...section.content,
        ...updatedContent,
      },
    });
  };

  const handleUploadSuccess = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setImgUrl(objectUrl);
    updateSection({ file, url: objectUrl });
    message.success(`${file.name} uploaded successfully`);
  };

  const handleFileChange = (info: UploadChangeParam<UploadFile<File>>) => {
    const { status } = info.file;

    if (status === "done") {
      const fileObj = info.file.originFileObj;
      if (fileObj) {
        handleUploadSuccess(fileObj);
      }
    } else if (status === "error") {
      message.error(`${info.file.name} upload failed`);
    }
  };

  const handleRemoveImage = () => {
    setImgUrl("");
    updateSection({ file: null, url: "" });
    message.info("Image removed");
  };

  const beforeUpload = (file: RcFile): boolean => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }

    return true;
  };

  const customUploadImplementation = (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;

    setTimeout(() => {
      if (onSuccess && file instanceof File) {
        onSuccess({});
      } else if (onError) {
        onError(new Error("Upload failed"));
      }
    }, 0);
  };

  // Upload component props
  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".jpeg,.png,.jpg",
    showUploadList: false,
    beforeUpload,
    customRequest: customUploadImplementation,
    onChange: handleFileChange,
  };

  // Card styling
  const cardStyle = {
    width: "100%",
    marginBottom: 16,
    borderRadius: "12px",

    transition: "all 0.3s ease",
  };

  // Type-safe InputNumber handler
  const handleNumberChange =
    (field: "width" | "height") => (value: number | null) => {
      if (value !== null) {
        updateSection({ [field]: value });
      }
    };

  return (
    <Card style={cardStyle} className="image-section-card">
      <Flex vertical gap="large" style={{ width: "100%" }}>
        <Flex vertical gap={10}>
          <Title level={5} style={{ margin: 0 }}>
            Headline
          </Title>
          <Input
            value={section.content.headline}
            onChange={(e) => updateSection({ headline: e.target.value })}
            placeholder="Enter your headline here"
            size="large"
            prefix={<EditOutlined style={{ color: "#d9d9d9" }} />}
            style={{ borderRadius: "8px" }}
          />
        </Flex>

        <Flex vertical align="center" style={{ width: "100%" }}>
          {imgUrl ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                textAlign: "center",
              }}
            >
              <Image
                src={imgUrl}
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  maxWidth: section.content.width || 500,
                  maxHeight: section.content.height || 500,
                }}
                preview={false}
              />
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={handleRemoveImage}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                  opacity: 0.8,
                }}
              />
            </div>
          ) : (
            <Dragger
              {...uploadProps}
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px dashed #d9d9d9",
                width: "100%",
              }}
            >
              <div style={{ padding: "20px 0" }}>
                <p className="ant-upload-drag-icon">
                  <PictureOutlined style={{ fontSize: 56, color: "#1890ff" }} />
                </p>
                <p
                  className="ant-upload-text"
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    marginTop: 12,
                  }}
                >
                  Click or drag an image to upload
                </p>
                <p
                  className="ant-upload-hint"
                  style={{
                    color: "#8c8c8c",
                    fontSize: "14px",
                    marginTop: 8,
                  }}
                >
                  Supports JPG, PNG files. Max size: 5MB
                </p>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  style={{
                    marginTop: 16,
                    borderRadius: "8px",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.045)",
                  }}
                >
                  Select Image
                </Button>
              </div>
            </Dragger>
          )}
        </Flex>

        <Divider style={{ margin: "16px 0" }} />

        {/* Size */}
        <Form.Item
          label={<Text strong>Image Size</Text>}
          style={{ marginBottom: 16 }}
        >
          <Flex gap="middle">
            <Form.Item label="Width" style={{ margin: 0 }}>
              <InputNumber
                min={1}
                max={800}
                value={section.content.width ?? 250}
                onChange={handleNumberChange("width")}
                addonAfter="px"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item label="Height" style={{ margin: 0 }}>
              <InputNumber
                min={1}
                max={800}
                value={section.content.height ?? 250}
                onChange={handleNumberChange("height")}
                addonAfter="px"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>
          </Flex>
        </Form.Item>

        <Flex vertical gap={10}>
          <Title level={5} style={{ margin: 0 }}>
            Caption
          </Title>
          <Input
            value={section.content.caption}
            onChange={(e) => updateSection({ caption: e.target.value })}
            placeholder="Enter your caption here"
            size="large"
            style={{ borderRadius: "8px" }}
          />
        </Flex>

        <Flex vertical gap={10}>
          <Title level={5} style={{ margin: 0 }}>
            Alt Text
          </Title>
          <Input
            value={section.content.altText}
            onChange={(e) => updateSection({ altText: e.target.value })}
            placeholder="Enter accessible description for screen readers"
            size="large"
            style={{ borderRadius: "8px" }}
          />
        </Flex>
      </Flex>
    </Card>
  );
};

export default ImageSection;
