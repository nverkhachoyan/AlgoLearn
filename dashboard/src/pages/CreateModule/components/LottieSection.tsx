import {
  Typography,
  Input,
  InputNumber,
  Switch,
  Flex,
  Form,
  Divider,
  Card,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";

import { NewLottie } from "../../../store/types";
import React, { useState, useRef } from "react";
import { NewSection } from "../../../store/types";
import TextArea from "antd/es/input/TextArea";
import ConditionalRenderer from "../../../components/ConditionalRenderer";
import LottiPreview from "./LottiePreview";
import UploadLottie from "./UploadLottie";
import { useEffect } from "react";

const { Title, Text } = Typography;

type LottieSectionProps = {
  section: NewSection & { content: NewLottie };
  snapshot: DraggableStateSnapshot;
  onChange: (updatedSection: NewSection) => void;
};

const LottieSection: React.FC<LottieSectionProps> = ({
  section,
  snapshot,
  onChange,
}) => {
  const [lottieUrl, setLottieUrl] = useState<string>("");
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string>("");

  useEffect(() => {
    return () => {
      if (lottieUrl) {
        URL.revokeObjectURL(lottieUrl);
      }
    };
  }, [lottieUrl]);

  const updateSection = (updatedContent: Partial<NewLottie>) => {
    onChange({
      ...section,
      content: {
        ...section.content,
        ...updatedContent,
      },
    });
  };

  const handleRemoveLottieFile = () => {
    setLottieUrl("");
    setFilename("");
    updateSection({ file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLottieUrl(objectUrl);
      setFilename(file.name);
      updateSection({ file, tempUrl: objectUrl });
    }
  };

  const handleUploadLottie = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      style={{
        width: "100%",
        marginBottom: 16,
        border: snapshot.isDragging ? "2px solid #1890ff" : undefined,
      }}
    >
      <Flex vertical gap="large" style={{ width: "100%" }}>
        <div>
          <Title level={4}>Animation Upload</Title>
          <Text type="secondary">
            Upload a .lottie file to display an animation
          </Text>
        </div>

        <Form layout="vertical">
          {/* Text content */}
          <Form.Item label="Caption">
            <Input
              value={section.content.caption}
              onChange={(e) => updateSection({ caption: e.target.value })}
              placeholder="Enter your caption here"
            />
          </Form.Item>

          <Form.Item label="Description">
            <TextArea
              value={section.content.description}
              onChange={(e) => updateSection({ description: e.target.value })}
              placeholder="Enter your description here"
              rows={3}
            />
          </Form.Item>

          <Divider />

          {/* Animation file upload */}
          <Form.Item label="Animation File">
            <Flex justify="center">
              <ConditionalRenderer
                condition={lottieUrl !== ""}
                renderTrue={() => (
                  <LottiPreview
                    lottieUrl={lottieUrl}
                    filename={filename}
                    onRemove={handleRemoveLottieFile}
                  />
                )}
                renderFalse={() => (
                  <UploadLottie
                    isHovering={isHovering}
                    onButtonClick={handleUploadLottie}
                    onHoverEnter={() => setIsHovering(true)}
                    onHoverLeave={() => setIsHovering(false)}
                  />
                )}
              />
            </Flex>
          </Form.Item>

          <Divider />

          {/* Size controls */}
          <Form.Item label="Animation Size">
            <Flex gap="middle">
              <Form.Item label="Width" style={{ margin: 0 }}>
                <InputNumber
                  min={1}
                  max={800}
                  defaultValue={section.content.width}
                  onChange={(n) => updateSection({ width: Number(n) })}
                />
              </Form.Item>

              <Form.Item label="Height" style={{ margin: 0 }}>
                <InputNumber
                  min={1}
                  max={800}
                  defaultValue={section.content.height}
                  onChange={(n) => updateSection({ height: Number(n) })}
                />
              </Form.Item>
            </Flex>
          </Form.Item>

          <Divider />

          {/* Animation behavior */}
          <Form.Item label="Animation Behavior">
            <Flex gap="large">
              <Form.Item label="Autoplay" style={{ margin: 0 }}>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked={section.content.autoplay}
                  onChange={(isChecked) =>
                    updateSection({ autoplay: isChecked })
                  }
                />
              </Form.Item>

              <Form.Item label="Loop" style={{ margin: 0 }}>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked={section.content.loop}
                  onChange={(isChecked) => updateSection({ loop: isChecked })}
                />
              </Form.Item>

              <Form.Item label="Speed" style={{ margin: 0 }}>
                <InputNumber
                  min={0.5}
                  max={5.0}
                  step={0.1}
                  defaultValue={section.content.speed}
                  onChange={(n) => updateSection({ speed: Number(n) })}
                />
              </Form.Item>
            </Flex>
          </Form.Item>
        </Form>

        <input
          type="file"
          accept=".lottie"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </Flex>
    </Card>
  );
};

export default LottieSection;
