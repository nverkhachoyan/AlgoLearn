import { Typography, Space, Button } from "antd";
import { DeleteOutlined, DragOutlined } from "@ant-design/icons";

import { NewSection } from "../../../store/types";

const { Text } = Typography;

const SectionHeader = ({
  section,
  handleRemove,
}: {
  section: NewSection;
  handleRemove: (sectionId: number) => void;
}) => (
  <div
    className="drag-handle"
    style={{
      marginBottom: 16,
      padding: 8,
      borderRadius: 4,
    }}
  >
    <Space>
      <DragOutlined />
      <Text>
        {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
      </Text>
      <Text type="secondary">Position: {section.position}</Text>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleRemove(section.id)}
      />
    </Space>
  </div>
);

export default SectionHeader;
