import React from "react";
import { Button } from "antd";
import { useStore } from "../store";

const ErrorComponent: React.FC<{
  error: string;
  navigate: (path: string) => void;
}> = (props) => {
  const logout = useStore((state) => state.logout);
  const handleLogout = () => {
    logout();
    props.navigate("/login");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>Error: {props.error}</div>
      <div>
        <Button onClick={() => props.navigate("/")}>Go to Home</Button>
      </div>
      <div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
};

export default ErrorComponent;
