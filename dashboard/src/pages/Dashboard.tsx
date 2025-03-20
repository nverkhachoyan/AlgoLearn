import React from "react";
import { Row } from "antd";
import useStore from "../store";
import CourseCard from "../components/courses/CourseCard";

const Dashboard: React.FC = () => {
  const courses = useStore((state) => state.courses);

  return (
    <Row gutter={[16, 16]} justify="center" style={{ gap: 30 }}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </Row>
  );
};

export default Dashboard;
