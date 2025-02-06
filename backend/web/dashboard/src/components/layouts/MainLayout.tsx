import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOutlined,
  DashboardOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button } from "antd";
import { MenuItem, getItem } from "../../types/menu";
import useStore from "../../store";
import AppContent from "./AppContent";
import CreateButton from "../common/CreateButton";
import { layoutStyles } from "../../styles/layouts";
import ErrorComponent from "../Error";
import UserDrawer from "../user/UserDrawer";

const { Header, Footer, Sider } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isUserDrawerOpen, setIsUserDrawerOpen] = React.useState(false);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useStore((state) => state.setSidebarCollapsed);
  const user = useStore((state) => state.user);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);
  const fetchCourses = useStore((state) => state.fetchCourses);
  const pagination = useStore((state) => state.pagination);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  React.useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchCourses(pagination.current, pagination.pageSize);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <ErrorComponent error={error} navigate={navigate} />;
  }

  const items: MenuItem[] = [
    getItem("Dashboard", "/", <DashboardOutlined />),
    getItem("Courses", "courses", <BookOutlined />, [
      getItem("All Courses", "/courses", <UnorderedListOutlined />),
      getItem("Create Course", "/courses/create", <PlusOutlined />),
    ]),
  ];

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
          <Button type="link" onClick={() => setIsUserDrawerOpen(true)}>
            {user?.username || "User"}
          </Button>
        </Header>
        <AppContent />
        <Footer style={layoutStyles.footer}>
          AlgoLearn Dashboard ©{new Date().getFullYear()}
        </Footer>
      </Layout>
      <CreateButton />
      <UserDrawer
        open={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
      />
    </Layout>
  );
};

export default MainLayout;
