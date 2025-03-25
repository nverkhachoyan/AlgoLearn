import { Flex, Image, Input, Typography } from "antd";
import { NewImage, NewSection } from "../../../store/types";
import React, { useEffect, useRef, useState } from "react";
import ConditionalRenderer from "../../../components/ConditionalRenderer";
import "./markdown.css";
import { FileOutlined } from "@ant-design/icons";

const { Text } = Typography;

type ImageSectionProps = {
  section: NewSection & { content: NewImage };
  onChange: (updatedSection: NewSection) => void;
};

const ImageSection: React.FC<ImageSectionProps> = ({ section, onChange }) => {
  const [imgUrl, setImgUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {}, [imgUrl]);

  const updateSection = (updatedContent: Partial<NewImage>) => {
    onChange({
      ...section,
      content: {
        ...section.content,
        ...updatedContent,
      },
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImgUrl(objectUrl);
      updateSection({ file });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Flex vertical gap={10}>
      <Flex vertical gap={10}>
        <Text>Headline</Text>
        <Input
          value={section.content.headline}
          onChange={(e) => updateSection({ headline: e.target.value })}
          placeholder="Enter your headline here"
        />
      </Flex>
      <Flex vertical align="center">
        <ConditionalRenderer
          condition={imgUrl !== ""}
          renderTrue={() => (
            <Image
              src={imgUrl}
              style={{ borderRadius: 8, overflow: "hidden" }}
            />
          )}
          renderFalse={() => (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload lottie animation"
              style={{
                maxWidth: 400,
                maxHeight: 200,
                border: `2px dashed ${isHovering ? "#1890ff" : "#d9d9d9"}`,
                borderRadius: "8px",
                padding: "20px 20px",
                textAlign: "center",
                cursor: "pointer",
                marginTop: "20px",
                transition: "all 0.3s",
              }}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClick();
                }
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <FileOutlined
                style={{ fontSize: 20, color: "#1890ff", marginBottom: 16 }}
              />
              <p>Click or drag image to this area to upload</p>
            </div>
          )}
        />
      </Flex>
      <input
        type="file"
        accept=".jpeg,.png,.jpg"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <Flex vertical gap={10}>
        <Text>Caption</Text>
        <Input
          value={section.content.caption}
          onChange={(e) => updateSection({ caption: e.target.value })}
          placeholder="Enter your caption here"
        />
      </Flex>
      <Flex vertical gap={10}>
        <Text>Alt Text</Text>
        <Input
          value={section.content.altText}
          onChange={(e) => updateSection({ altText: e.target.value })}
          placeholder="Enter your alt text here"
        />
      </Flex>
    </Flex>
  );
};

export default ImageSection;
