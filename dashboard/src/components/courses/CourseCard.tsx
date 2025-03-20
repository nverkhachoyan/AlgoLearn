import { Card, Avatar } from "antd";
import {
  SettingOutlined,
  EditOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { Course } from "../../types/models";
import { Link } from "react-router-dom";
interface CourseCardProps {
  course: Course;
}

const cdnUrl = "https://algolearn.sfo3.cdn.digitaloceanspaces.com";

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const imgUrl = `${cdnUrl}/courses/${course.folderObjectKey}/${course.imgKey}.${course.mediaExt}`;

  return (
    <Card
      style={{ width: 300 }}
      cover={<img alt={course.name} src={imgUrl} />}
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
          avatar={<Avatar src={imgUrl} />}
          title={course.name}
          description={course.description}
        />
      </Link>
    </Card>
  );
};

export default CourseCard;
