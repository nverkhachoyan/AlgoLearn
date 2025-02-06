import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useStore from "../store";
import { Spin } from "antd";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  // Only select the auth-related state we need
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const token = useStore((state) => state.token);
  const isLoading = useStore((state) => state.isLoading);
  const checkAuth = useStore((state) => state.checkAuth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      checkAuth();
    }
  }, [token, isAuthenticated, checkAuth]);

  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
