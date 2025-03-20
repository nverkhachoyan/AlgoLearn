import React from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Breadcrumb, Layout } from "antd";
import Dashboard from "../../pages/Dashboard";
import CoursesPage from "../../pages/Courses";
import CreateCoursePage from "../../pages/CreateCourse";
import EditCoursePage from "../../pages/EditCourse";
import CoursePage from "../../pages/Course";
import ModulePage from "../../pages/Module";
import CreateModulePage from "../../pages/CreateModule";
import { layoutStyles } from "../../styles/layouts";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const location = useLocation();

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    const title =
      pathSnippets[index].charAt(0).toUpperCase() +
      pathSnippets[index].slice(1);
    return {
      key: url,
      title: <Link to={url}>{title}</Link>,
    };
  });

  const items = [
    {
      key: "home",
      title: <Link to="/">Home</Link>,
    },
    ...breadcrumbItems,
  ];

  return (
    <Content style={layoutStyles.content}>
      <Breadcrumb style={layoutStyles.breadcrumb} items={items} />
      <div style={layoutStyles.contentContainer}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/create" element={<CreateCoursePage />} />
          <Route path="/courses/:id/edit" element={<EditCoursePage />} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route
            path="/courses/:courseId/units/:unitId/modules/:moduleId"
            element={<ModulePage />}
          />
          <Route
            path="/courses/:courseId/units/:unitId/modules/create"
            element={<CreateModulePage />}
          />
        </Routes>
      </div>
    </Content>
  );
};

export default AppContent;
