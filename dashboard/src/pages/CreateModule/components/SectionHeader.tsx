import { Typography, Button, Flex, Tooltip, Badge, theme } from "antd";
import {
  DeleteOutlined,
  DragOutlined,
  FileTextOutlined,
  CodeOutlined,
  QuestionOutlined,
  PlaySquareOutlined,
  FileImageOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";

import { NewSection } from "../../../store/types";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";

const { Text } = Typography;

const SectionHeader = ({
  section,
  snapshot,
  handleRemove,
  isCollapsed,
  toggleCollapse,
}: {
  section: NewSection;
  snapshot: DraggableStateSnapshot;
  handleRemove: (sectionId: number) => void;
  isCollapsed: boolean;
  toggleCollapse: (sectionId: number) => void;
}) => {
  const { token } = theme.useToken();

  const typeColors = {
    markdown: "#1677ff",
    code: "#722ed1",
    question: "#fa8c16",
    lottie: "#13c2c2",
    image: "#52c41a",
    default: token.colorTextSecondary,
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "markdown":
        return <FileTextOutlined style={{ color: typeColors.markdown }} />;
      case "code":
        return <CodeOutlined style={{ color: typeColors.code }} />;
      case "question":
        return <QuestionOutlined style={{ color: typeColors.question }} />;
      case "lottie":
        return <PlaySquareOutlined style={{ color: typeColors.lottie }} />;
      case "image":
        return <FileImageOutlined style={{ color: typeColors.image }} />;
      default:
        return <DragOutlined />;
    }
  };

  const getSectionColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || typeColors.default;
  };

  return (
    <Flex
      className="drag-handle"
      align="center"
      justify="space-between"
      style={{
        marginBottom: 8,
        padding: "6px 4px",
        borderRadius: token.borderRadius,
        borderLeft: `3px solid ${getSectionColor(section.type)}`,
        background: token.colorBgElevated,
        border: snapshot.isDragging ? "2px solid #1890ff" : undefined,
      }}
    >
      <Flex align="center" gap={8}>
        <Tooltip title="Drag to reorder">
          <span style={{ cursor: "move", padding: "0 4px" }}>
            <DragOutlined style={{ color: token.colorTextSecondary }} />
          </span>
        </Tooltip>

        <Flex align="center" gap={4}>
          {getSectionIcon(section.type)}
          <Text strong>
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
          </Text>
        </Flex>

        <Badge
          count={section.position}
          style={{
            backgroundColor: token.colorTextQuaternary,
            marginLeft: 4,
            fontSize: "11px",
          }}
        />
      </Flex>

      <Flex gap={4}>
        <Tooltip title={isCollapsed ? "Expand section" : "Collapse section"}>
          <Button
            type="text"
            size="small"
            icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(section.id);
            }}
          />
        </Tooltip>
        <Tooltip title="Delete section">
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(section.id);
            }}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default SectionHeader;
