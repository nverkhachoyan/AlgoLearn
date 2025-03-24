import { Space, Typography, Input, InputNumber, Switch, Flex } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
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
  onChange: (updatedSection: NewSection) => void;
};

const LottieSection: React.FC<LottieSectionProps> = ({ section, onChange }) => {
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
      updateSection({ file });
    }
  };

  const handleUploadLottie = () => {
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
          onChange={(e) => updateSection({ caption: e.target.value })}
          placeholder="Enter your caption here"
        />
      </Flex>

      <Flex vertical gap={10}>
        <Text>Description</Text>
        <TextArea
          value={section.content.description}
          onChange={(e) => updateSection({ description: e.target.value })}
          placeholder="Enter your description here"
        />
      </Flex>

      <Flex vertical gap={10} align="center">
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

      <Space>
        <Text>Width</Text>
        <InputNumber
          min={1}
          max={200}
          defaultValue={section.content.width}
          onChange={(n) => updateSection({ width: Number(n) })}
        />
        <Text>Height</Text>
        <InputNumber
          min={1}
          max={200}
          defaultValue={section.content.height}
          onChange={(n) => updateSection({ height: Number(n) })}
        />
      </Space>

      <Flex gap={20} vertical>
        <Space>
          <Text>Autoplay</Text>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultValue={section.content.autoplay}
            onChange={(isChecked) => updateSection({ autoplay: isChecked })}
          />
        </Space>

        <Space>
          <Text>Loop</Text>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultValue={section.content.loop}
            onChange={(isChecked) => updateSection({ loop: isChecked })}
          />
        </Space>

        <Space>
          <Text>Speed</Text>
          <InputNumber
            min={0.5}
            max={5.0}
            defaultValue={section.content.speed}
            onChange={(n) => updateSection({ speed: Number(n) })}
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
