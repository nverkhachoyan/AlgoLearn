import React from "react";
import { FloatButton, Tooltip } from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  CodeOutlined,
  QuestionOutlined,
  FileImageOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";

type SectionType = "markdown" | "code" | "question" | "lottie" | "image";

interface CreateButtonProps {
  onAddSection: (type: SectionType) => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({ onAddSection }) => {
  return (
    <FloatButton.Group
      trigger="hover"
      type="primary"
      style={{ right: 24, bottom: 24 }}
      icon={<PlusOutlined />}
    >
      <Tooltip title="Add Markdown" placement="left">
        <FloatButton
          icon={<FileTextOutlined />}
          onClick={() => onAddSection("markdown")}
        />
      </Tooltip>
      <Tooltip title="Add Code" placement="left">
        <FloatButton
          icon={<CodeOutlined />}
          onClick={() => onAddSection("code")}
        />
      </Tooltip>
      <Tooltip title="Add Question" placement="left">
        <FloatButton
          icon={<QuestionOutlined />}
          onClick={() => onAddSection("question")}
        />
      </Tooltip>
      <Tooltip title="Add Image" placement="left">
        <FloatButton
          icon={<FileImageOutlined />}
          onClick={() => onAddSection("image")}
        />
      </Tooltip>
      <Tooltip title="Add Animation" placement="left">
        <FloatButton
          icon={<PlaySquareOutlined />}
          onClick={() => onAddSection("lottie")}
        />
      </Tooltip>
    </FloatButton.Group>
  );
};

export default CreateButton;
