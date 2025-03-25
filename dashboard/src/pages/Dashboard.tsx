import React, { useEffect } from "react";
import { List, Row, Col } from "antd";
import { useStore } from "../store";
import CourseCard from "../components/courses/CourseCard";

const Dashboard: React.FC = () => {
  const courses = useStore((state) => state.courses);
  const fetchCourses = useStore((state) => state.fetchCourses);

  useEffect(() => {
    const fetchResources = async () => {
      await fetchCourses();
    };
    fetchResources();
  }, [fetchCourses]);

  return (
    <div className="dashboard-container" style={{ padding: "20px" }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 4,
              xxl: 4,
            }}
            dataSource={courses}
            renderItem={(course) => (
              <List.Item>
                <CourseCard course={course} />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
