import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import useStore from "./store";
import "./App.css";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layouts/MainLayout";
import ErrorToast from "./components/common/ErrorToast";

const App: React.FC = () => {
  const isDarkMode = useStore((state) => state.isDarkMode);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ErrorToast />
      </Router>
    </ConfigProvider>
  );
};

export default App;
