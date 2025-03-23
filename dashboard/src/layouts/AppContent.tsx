import React from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Breadcrumb, Layout } from "antd";
import Dashboard from "../pages/Dashboard";
import CoursesPage from "../pages/Courses";
import CreateCoursePage from "../pages/CreateCourse";
import EditCoursePage from "../pages/EditCourse";
import CoursePage from "../pages/Course";
import ModulePage from "../pages/Module";
import CreateModulePage from "../pages/CreateModule/CreateModule";
import { layoutStyles } from "../styles/layouts";
import { useStore } from "../store";
import UnitPage from "../pages/Unit";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const location = useLocation();
  const selectedCourse = useStore((state) => state.selectedCourse);
  const selectedUnit = useStore((state) => state.selectedUnit);
  const selectedModule = useStore((state) => state.selectedModule);
  const isDarkMode = useStore((state) => state.isDarkMode);

  const pathSnippets = location.pathname.split("/").filter((i) => i);

  const breadcrumbItems = () => {
    const pathMap = [
      { path: "courses", selectedItem: selectedCourse },
      { path: "units", selectedItem: selectedUnit },
      { path: "modules", selectedItem: selectedModule },
    ];

    return pathMap
      .filter((item) => pathSnippets.includes(item.path))
      .map((item) => ({
        key: item.path,
        title: (
          <Link to={`/${item.path}/${item.selectedItem?.id}`}>
            {item.selectedItem?.name}
          </Link>
        ),
      }));
  };

  const items = [
    {
      key: "home",
      title: <Link to="/">Home</Link>,
    },
    ...breadcrumbItems(),
  ];

  return (
    <Content
      style={layoutStyles.content}
      className={isDarkMode ? "dark-content" : "light-content"}
    >
      <Breadcrumb style={layoutStyles.breadcrumb} items={items} />

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
