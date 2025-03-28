import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "antd";
import Dashboard from "../pages/Dashboard";
import CoursesPage from "../pages/Courses";
import CreateCoursePage from "../pages/CreateCourse";
import EditCoursePage from "../pages/EditCourse";
import CoursePage from "../pages/Course";
import ModulePage from "../pages/Module";
import CreateModulePage from "../pages/CreateModule/CreateModule";
import { useStore } from "../store";
import UnitPage from "../pages/Unit";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const isDarkMode = useStore((state) => state.isDarkMode);

  return (
    <Content
      style={{
        height: "calc(100vh - 64px)",
        position: "relative",
      }}
      className={isDarkMode ? "dark-content" : "light-content"}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/create" element={<CreateCoursePage />} />
        <Route path="/courses/:id/edit" element={<EditCoursePage />} />
        <Route path="/courses/:id" element={<CoursePage />} />
        <Route path="/courses/:courseId/units/:unitId" element={<UnitPage />} />
        <Route
          path="/courses/:courseId/units/:unitId/modules/:moduleId"
          element={<ModulePage />}
        />
        <Route
          path="/courses/:courseId/units/:unitId/modules/create"
          element={<CreateModulePage />}
        />
      </Routes>
    </Content>
  );
};

export default AppContent;
