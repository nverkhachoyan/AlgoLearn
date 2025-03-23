import {
  Space,
  Button,
  Typography,
  Alert,
  Input,
  InputNumber,
  Form,
  Switch,
  Flex,
} from "antd";
import {
  UploadOutlined,
  FileOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { NewLottie } from "../../../store/types";
import React, { useState, useRef } from "react";
import { NewSection } from "../../../store/types";
import TextArea from "antd/es/input/TextArea";

const { Title, Text } = Typography;

type LottieSectionProps = {
  section: {
    id: string;
    type: "lottie";
    position: number;
    content: NewLottie;
  };
  onChange: (updatedSection: NewSection) => void;
};

const LottieSection: React.FC<LottieSectionProps> = ({ section }) => {
  const [lottieUrl, setLottieUrl] = useState<string>("");
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLottieUrl(objectUrl);
      setFilename(file.name);
      section.content.fileUrl = objectUrl;
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={4}>Animation Upload</Title>
      <Text type="secondary" style={{ display: "block", marginBottom: "20px" }}>
        Upload a .lottie file to display an animation
      </Text>

      <Flex vertical gap={10}>
        <Text>Caption</Text>
        <Input
          value={section.content.caption}
          placeholder="Enter your caption here"
        />
      </Flex>

      <Flex vertical gap={10}>
        <Text>Description</Text>
        <TextArea
          value={section.content.caption}
          placeholder="Enter your description here"
        />
      </Flex>

      <Flex vertical gap={10} align="center">
        {lottieUrl ? (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <DotLottieReact
              src={lottieUrl as any}
              loop
              autoplay
              style={{
                height: "300px",
                width: "100%",
                maxWidth: "400px",
                marginBottom: "16px",
              }}
            />
            <div style={{ textAlign: "center", marginBottom: 15 }}>
              <Button
                danger
                style={{ marginLeft: "10px", borderRadius: "6px" }}
                onClick={() => {
                  setLottieUrl("");
                  setFilename("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  section.content.fileUrl = "";
                }}
              >
                Remove
              </Button>
            </div>
            <Alert
              message={`Current file: ${filename}`}
              type="success"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          </div>
        ) : (
          <div
            style={{
              maxWidth: 400,
              border: `2px dashed ${isHovering ? "#1890ff" : "#d9d9d9"}`,
              borderRadius: "8px",
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "all 0.3s",
              backgroundColor: isHovering ? "#f0f7ff" : "#fafafa",
            }}
            onClick={handleButtonClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <FileOutlined
              style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}
            />
            <p>Click or drag file to this area to upload</p>
            <p style={{ color: "#888" }}>
              Support for .lottie animated files only
            </p>
          </div>
        )}
      </Flex>

      <Space>
        <Text>Width</Text>
        <InputNumber min={1} max={200} defaultValue={section.content.width} />
        <Text>Height</Text>
        <InputNumber min={1} max={200} defaultValue={section.content.height} />
      </Space>

      <Flex gap={20} vertical>
        <Space>
          <Text>Autoplay</Text>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultValue={section.content.autoplay}
          />
        </Space>

        <Space>
          <Text>Loop</Text>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultValue={section.content.loop}
          />
        </Space>

        <Space>
          <Text>Speed</Text>
          <InputNumber
            min={0.5}
            max={5.0}
            defaultValue={section.content.speed}
          />
        </Space>
      </Flex>

      <input
        type="file"
        accept=".lottie"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
    </Space>
  );
};

export default LottieSection;
