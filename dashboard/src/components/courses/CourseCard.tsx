import { Card, Avatar, Dropdown, App } from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  SendOutlined,
  DeleteOutlined,
  AlignLeftOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Course } from "../../types/models";
import { Link } from "react-router-dom";
import { buildImgUrl } from "../../store/utils";
import type { MenuProps } from "antd";
import { useState } from "react";

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const { message } = App.useApp();

  const imgUrl = buildImgUrl(
    "courses",
    course.folderObjectKey,
    course.imgKey,
    course.mediaExt
  );

  const handlePublish = () => {
    message.success(`Course "${course.name}" published!`);
    // Add actual publish logic here
  };

  const handleDelete = () => {
    message.success(`Course "${course.name}" deleted!`);
    // Add actual delete logic here
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "publish",
      label: "Publish",
      icon: <SendOutlined />,
      onClick: handlePublish,
    },
    {
      key: "delete",
      danger: true,
      style: { backgroundColor: isDeleteHovered ? "#943234" : "#bd3537" },
      label: "Delete Course",
      icon: <DeleteOutlined />,
      onMouseEnter: () => setIsDeleteHovered(true),
      onMouseLeave: () => setIsDeleteHovered(false),
      onClick: handleDelete,
    },
  ];

  return (
    <Card
      hoverable
      style={{
        width: "100%",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-5px)" : "none",
        boxShadow: isHovered ? "var(--card-shadow)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cover={
        imgUrl ? (
          <img
            alt={course.name}
            src={imgUrl}
            style={{
              borderRadius: "6px 6px 0 0",
              width: "100%",
              height: "160px",
              objectFit: "cover",
            }}
          />
        ) : (
          <BookOutlined
            alt={course.name}
            style={{
              borderRadius: "6px 6px 0 0",
              fontSize: "2rem",
              width: "100%",
              height: "160px",
              objectFit: "cover",
              alignContent: "center",
            }}
          />
        )
      }
      actions={[
        <Link to={`/courses/${course.id}/edit`}>
          <EditOutlined key="edit" />
        </Link>,
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <EllipsisOutlined key="ellipsis" />
        </Dropdown>,
      ]}
    >
      <Link to={`/courses/${course.id}`} style={{ color: "var(--text-color)" }}>
        <Card.Meta
          avatar={<Avatar src={imgUrl ? imgUrl : <AlignLeftOutlined />} />}
          title={
            <div style={{ color: "var(--text-color)" }}>{course.name}</div>
          }
          description={
            <div style={{ color: "var(--secondary-text-color)" }}>
              {course.description}
            </div>
          }
        />
      </Link>
    </Card>
  );
};

export default CourseCard;
