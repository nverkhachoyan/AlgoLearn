import React from "react";
import { FloatButton, Tooltip } from "antd";
import {
  PlusOutlined,
  BookOutlined,
  OrderedListOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useStore from "../../store";

const CreateButton: React.FC = () => {
  const navigate = useNavigate();
  const selectedCourse = useStore((state) => state.selectedCourse);
  const selectedUnit = useStore((state) => state.selectedUnit);

  const handleCreate = (type: "course" | "unit" | "module") => {
    switch (type) {
      case "course":
        navigate("/courses/create");
        break;
      case "unit":
        if (selectedCourse) {
          navigate(`/courses/${selectedCourse.id}`);
        }
        break;
      case "module":
        if (selectedCourse && selectedUnit) {
          navigate(
            `/courses/${selectedCourse.id}/units/${selectedUnit.id}/modules/create`
          );
        }
        break;
    }
  };

  if (selectedCourse && selectedUnit) {
    return (
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<PlusOutlined />}
      >
        <Tooltip title="Create Module" placement="left">
          <FloatButton
            icon={<FileTextOutlined />}
            onClick={() => handleCreate("module")}
          />
        </Tooltip>
      </FloatButton.Group>
    );
  }

  if (selectedCourse) {
    return (
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<PlusOutlined />}
      >
        <Tooltip title="Create Unit" placement="left">
          <FloatButton
            icon={<OrderedListOutlined />}
            onClick={() => handleCreate("unit")}
          />
        </Tooltip>
      </FloatButton.Group>
    );
  }

  return (
    <FloatButton.Group
      trigger="hover"
      type="primary"
      style={{ right: 24, bottom: 24 }}
      icon={<PlusOutlined />}
    >
      <Tooltip title="Create Course" placement="left">
        <FloatButton
          icon={<BookOutlined />}
          onClick={() => handleCreate("course")}
        />
      </Tooltip>
    </FloatButton.Group>
  );
};

export default CreateButton;
