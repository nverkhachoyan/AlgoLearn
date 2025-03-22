import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import ErrorToast from "./components/common/ErrorToast";
import ThemeProvider from "./theme/ThemeProvider";
import { App as AntApp } from "antd";

const AppRoutes: React.FC = () => {
  return (
    <>
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
