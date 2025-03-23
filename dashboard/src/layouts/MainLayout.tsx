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
import CreateButton from "../components/common/CreateButton";
import { layoutStyles } from "../styles/layouts";
import ErrorComponent from "../components/Error";
import UserDrawer from "../components/user/UserDrawer";

const { Header, Footer, Sider } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isUserDrawerOpen, setIsUserDrawerOpen] = React.useState(false);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useStore((state) => state.setSidebarCollapsed);
  const error = useStore((state) => state.error);
  const user = useStore((state) => state.user);
  const fetchCourses = useStore((state) => state.fetchCourses);
  const fetchUser = useStore((state) => state.fetchUser);
  const pagination = useStore((state) => state.pagination);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  React.useEffect(() => {
    abortControllerRef.current = new AbortController();

    fetchUser();
    fetchCourses(pagination.current, pagination.pageSize);

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
    <Layout style={layoutStyles.mainLayout}>
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      >
        <div
          className="logo"
          style={layoutStyles.logo}
          onClick={() => navigate("/")}
        >
          <h1 style={layoutStyles.logoText}>AlgoLearn</h1>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["/"]}
          mode="inline"
          items={items}
          onClick={({ key }) => {
            navigate(key.toString());
          }}
        />
      </Sider>
      <Layout>
        <Header style={layoutStyles.header}>
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
        <Footer style={layoutStyles.footer}>
          AlgoLearn Dashboard ©{new Date().getFullYear()}
        </Footer>
      </Layout>
      <CreateButton />
      <UserDrawer open={isUserDrawerOpen} onClose={handleCloseUserDrawer} />
    </Layout>
  );
};

export default MainLayout;
