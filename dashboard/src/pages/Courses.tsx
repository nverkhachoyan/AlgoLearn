import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CourseList from "../components/courses/CourseList";

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();

  const courses = useStore((state) => state.courses);
  const isCourseLoading = useStore((state) => state.isCourseLoading);
  const error = useStore((state) => state.error);
  const pagination = useStore((state) => state.pagination);
  const fetchCourses = useStore((state) => state.fetchCourses);
  const deleteCourse = useStore((state) => state.deleteCourse);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchCourses(1, 10);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCourses]);

  const handlePaginationChange = React.useCallback(
    (page: number, size: number) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      fetchCourses(page, size);
    },
    [fetchCourses]
  );

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Courses</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/courses/create")}
        >
          Create Course
        </Button>
      </div>
      <CourseList
        courses={courses}
        loading={isCourseLoading}
        onDelete={deleteCourse}
        onPaginationChange={handlePaginationChange}
        currentPage={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
      />
    </div>
  );
};

export default React.memo(CoursesPage);
