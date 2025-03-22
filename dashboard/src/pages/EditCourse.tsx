import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCoursesStore } from "../store";
import CourseForm from "../components/courses/CourseForm";
import { Course } from "../types/models";
import { Spin } from "antd";

const EditCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateCourse, isLoading, courses, fetchCourses } = useCoursesStore();

  const course = courses.find((c) => c.id === Number(id));

  useEffect(() => {
    if (!course) {
      fetchCourses();
    }
  }, [course, fetchCourses]);

  const handleSubmit = async (values: Partial<Course>) => {
    if (id) {
      await updateCourse(Number(id), values);
      navigate("/courses");
    }
  };

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1>Edit Course</h1>
      <CourseForm
        initialValues={course}
        onSubmit={handleSubmit}
        loading={isLoading}
      />
    </div>
  );
};

export default EditCoursePage;
