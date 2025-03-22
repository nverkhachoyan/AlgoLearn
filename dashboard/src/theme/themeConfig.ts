import { ThemeConfig } from "antd";

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: "#2563eb",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#6366f1",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#f9fafb",
    colorBgLayout: "#f3f4f6",
    colorText: "#1f2937",
    colorTextSecondary: "#4b5563",
    borderRadius: 6,
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      bodyBg: "#f3f4f6",
      footerBg: "#ffffff",
    },
    Card: {
      colorBorderSecondary: "#e5e7eb",
      actionsBg: "#f9fafb",
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: "#3b82f6",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#818cf8",
    colorBgContainer: "#1e1e2d",
    colorBgElevated: "#252536",
    colorBgLayout: "#151521",
    colorText: "#e5e7eb",
    colorTextSecondary: "#9ca3af",
    borderRadius: 6,
  },
  components: {
    Layout: {
      headerBg: "#1e1e2d",
      bodyBg: "#151521",
      footerBg: "#1e1e2d",
    },
    Card: {
      colorBorderSecondary: "#2d2d3d",
      actionsBg: "#252536",
    },
  },
};
