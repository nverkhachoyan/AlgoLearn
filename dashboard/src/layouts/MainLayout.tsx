import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOutlined,
  DashboardOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Space, Avatar, Tooltip } from "antd";
import { MenuItem, getItem } from "../types/menu";
import { useStore } from "../store";
import AppContent from "./AppContent";

import { layoutStyles } from "../styles/layouts";
import ErrorComponent from "../components/Error";
import UserDrawer from "../components/user/UserDrawer";

const { Header, Sider } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isUserDrawerOpen, setIsUserDrawerOpen] = React.useState(false);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useStore((state) => state.setSidebarCollapsed);
  const error = useStore((state) => state.error);
  const user = useStore((state) => state.user);

  const fetchUser = useStore((state) => state.fetchUser);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  React.useEffect(() => {
    abortControllerRef.current = new AbortController();

    fetchUser();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleOpenUserDrawer = () => {
    setIsUserDrawerOpen(true);
  };

  const handleCloseUserDrawer = () => {
    setIsUserDrawerOpen(false);
  };

  if (error) {
    return <ErrorComponent error={error} navigate={navigate} />;
  }

  const items: MenuItem[] = [
    getItem("Dashboard", "/", <DashboardOutlined />),
    getItem("Courses", "/courses", <BookOutlined />),
    getItem("Create Course", "/courses/create", <PlusOutlined />),
  ];

  // Generate avatar colors based on username for consistent coloring
  const getAvatarColor = (username: string) => {
    const colors = [
      "#f56a00",
      "#7265e6",
      "#ffbf00",
      "#00a2ae",
      "#1890ff",
      "#52c41a",
      "#722ed1",
      "#eb2f96",
    ];

    // Simple hash function to generate consistent index
    const hash = username
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[hash % colors.length];
  };

  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Layout
      style={{
        height: "100vh",
        // overflow: "hidden",
      }}
      className="custom-scrollbar"
    >
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        theme={isDarkMode ? "dark" : "light"}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          className="logo"
          style={layoutStyles.logo}
          onClick={() => navigate("/")}
        >
          <h1 style={layoutStyles.logoText}>AL</h1>
        </div>
        <Menu
          theme={isDarkMode ? "dark" : "light"}
          style={{ paddingLeft: 8, paddingRight: 8 }}
          defaultSelectedKeys={["/"]}
          mode="inline"
          items={items}
          onClick={({ key }) => {
            navigate(key.toString());
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            ...layoutStyles.header,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            width: "100%",
          }}
        >
          <div style={layoutStyles.headerLeft}>
            <p>Dashboard</p>
          </div>
          <Space>
            <Tooltip title="User Profile" placement="topRight">
              {user ? (
                <Avatar
                  style={{
                    backgroundColor: user.profilePictureUrl
                      ? "transparent"
                      : getAvatarColor(user.username),
                    cursor: "pointer",
                  }}
                  src={user.profilePictureUrl}
                  onClick={handleOpenUserDrawer}
                >
                  {user.profilePictureUrl
                    ? null
                    : getUserInitials(user.username)}
                </Avatar>
              ) : (
                <Avatar
                  icon={<UserOutlined />}
                  style={{ cursor: "pointer" }}
                  onClick={handleOpenUserDrawer}
                />
              )}
            </Tooltip>
          </Space>
        </Header>
        <AppContent />
        {/* <Footer style={layoutStyles.footer}>
          AlgoLearn Dashboard ©{new Date().getFullYear()}
        </Footer> */}
      </Layout>
      <UserDrawer open={isUserDrawerOpen} onClose={handleCloseUserDrawer} />
    </Layout>
  );
};

export default MainLayout;
