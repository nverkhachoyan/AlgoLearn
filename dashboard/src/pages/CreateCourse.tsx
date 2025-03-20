import React from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store";
import CourseForm from "../components/courses/CourseForm";
import { Course } from "../types/models";
import ErrorComponent from "../components/Error";
import type { RcFile } from "antd/es/upload/interface";

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { createCourse, isLoading, error } = useStore();

  const handleSubmit = async (values: Partial<Course>, iconFile?: RcFile) => {
    await createCourse(values, iconFile);
    navigate("/courses");
  };

  if (error) {
    return <ErrorComponent error={error} navigate={navigate} />;
  }

  return (
    <div>
      <h1>Create New Course</h1>
      <CourseForm onSubmit={handleSubmit} loading={isLoading} />
    </div>
  );
};

export default CreateCoursePage;
