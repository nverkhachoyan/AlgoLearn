import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import ThemeProvider from "./theme/ThemeProvider";
import { useStore } from "./store";
import { App as AntApp, ConfigProvider, theme } from "antd";

const AppRoutes: React.FC = () => {
  const isDarkMode = useStore((state) => state.isDarkMode);

  const lightTheme = {
    token: {
      colorPrimary: "#2563eb",
      colorText: "#1f2937",
      colorTextSecondary: "#4b5563",
      colorBgBase: "#ffffff",
      colorBgContainer: "#ffffff",
      colorBorder: "#e5e7eb",

      borderRadius: 6,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",

      wireframe: false,
    },
    components: {
      Layout: {
        headerBg: "#ffffff",
        bodyBg: "#f3f4f6",
        siderBg: "#001529",
        footerBg: "#ffffff",
      },
      Card: {
        colorBgContainer: "#ffffff",
      },
      Menu: {
        darkItemColor: "#ffffff",
        darkItemBg: "#001529",
      },
    },
  };

  const darkTheme = {
    token: {
      colorPrimary: "#3b82f6",
      colorText: "#e5e7eb",
      colorTextSecondary: "#9ca3af",
      colorBgBase: "#1e1e2d",
      colorBgContainer: "#151521",
      colorBorder: "#2d2d3d",

      borderRadius: 6,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",

      wireframe: false,
    },
    components: {
      Layout: {
        headerBg: "#1e1e2d",
        bodyBg: "#151521",
        siderBg: "#0f0f17",
        footerBg: "#1e1e2d",
      },
      Card: {
        colorBgContainer: "#1e1e2d",
      },
      Menu: {
        darkItemColor: "#ffffff",
        darkItemBg: "#0f0f17",
      },
    },
    algorithm: theme.darkAlgorithm,
  };
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ConfigProvider theme={isDarkMode ? darkTheme : lightTheme}>
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            </ConfigProvider>
          }
        />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AntApp>
        <Router>
          <AppRoutes />
        </Router>
      </AntApp>
    </ThemeProvider>
  );
};

export default App;
