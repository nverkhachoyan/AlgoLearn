import { Card, Avatar } from "antd";
import {
  SettingOutlined,
  EditOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { Course } from "../../types/models";
import { Link, useNavigate } from "react-router-dom";
interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  return (
    <Card
      style={{ width: 300 }}
      cover={<img alt={course.name} src={course.iconUrl} />}
      actions={[
        <SettingOutlined key="setting" />,
        <Link to={`/courses/${course.id}/edit`}>
          <EditOutlined key="edit" />
        </Link>,
        <EllipsisOutlined key="ellipsis" />,
      ]}
    >
      <Link to={`/courses/${course.id}`}>
        <Card.Meta
          avatar={<Avatar src={course.iconUrl} />}
          title={course.name}
          description={course.description}
        />
      </Link>
    </Card>
  );
};

export default CourseCard;
