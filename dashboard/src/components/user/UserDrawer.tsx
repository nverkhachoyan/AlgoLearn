import React from "react";
import {
  Drawer,
  Typography,
  Space,
  Descriptions,
  Tag,
  Switch,
  Select,
  Divider,
  Button,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useStore } from "../../store";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface UserDrawerProps {
  open: boolean;
  onClose: () => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({ open, onClose }) => {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const isDarkMode = useStore((state) => state.isDarkMode);
  const useSystemTheme = useStore((state) => state.useSystemTheme);
  const setIsDarkMode = useStore((state) => state.setIsDarkMode);
  const setUseSystemTheme = useStore((state) => state.setUseSystemTheme);

  if (!user) return null;

  const timezones = [
    "UTC",
    "America/Los_Angeles",
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
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

  // Get user initials for avatar
  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Drawer
      title={
        <Space>
          <UserOutlined />
          <span>User Profile</span>
        </Space>
      }
      width={400}
      placement="right"
      onClose={onClose}
      open={open}
      extra={
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={() => {
            logout();
            onClose();
          }}
        >
          Logout
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row align="middle" gutter={[16, 0]}>
          <Col>
            <Avatar
              size={64}
              src={user.profilePictureUrl}
              style={{
                backgroundColor: user.profilePictureUrl
                  ? "transparent"
                  : getAvatarColor(user.username),
              }}
            >
              {user.profilePictureUrl ? null : getUserInitials(user.username)}
            </Avatar>
          </Col>
          <Col flex="1">
            <Title level={4} style={{ margin: 0 }}>
              {user.username}
            </Title>
            <Space style={{ marginTop: 8 }}>
              <Tag color={user.role === "admin" ? "red" : "blue"}>
                {user.role}
              </Tag>
              <Tag color={user.isActive ? "green" : "gray"}>
                {user.isActive ? "Active" : "Inactive"}
              </Tag>
            </Space>
          </Col>
        </Row>

        <Descriptions column={1}>
          <Descriptions.Item label={<MailOutlined />}>
            {user.email}
            {!user.isEmailVerified && (
              <Tag color="warning" style={{ marginLeft: 8 }}>
                Not Verified
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={<ClockCircleOutlined />}>
            Last Login:{" "}
            {user.lastLoginAt === "0001-01-01T00:00:00Z"
              ? "Never"
              : dayjs(user.lastLoginAt).format("YYYY-MM-DD HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item label={<SettingOutlined />}>
            CPUs: {user.cpus}
          </Descriptions.Item>
        </Descriptions>

        <Divider>Preferences</Divider>

        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>Dark Mode</Text>
            <Switch
              checked={isDarkMode}
              onChange={(checked) => {
                setIsDarkMode(checked);
                setUseSystemTheme(false);
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>Use System Theme</Text>
            <Switch
              checked={useSystemTheme}
              onChange={(checked) => setUseSystemTheme(checked)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>Language</Text>
            <Select
              value={user.preferences.lang}
              style={{ width: 120 }}
              onChange={(value) => console.log(value)}
            >
              {languages.map((lang) => (
                <Option key={lang.value} value={lang.value}>
                  {lang.label}
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>
              <GlobalOutlined /> Timezone
            </Text>
            <Select
              value={user.preferences.timezone}
              style={{ width: 180 }}
              onChange={(value) => console.log(value)}
            >
              {timezones.map((tz) => (
                <Option key={tz} value={tz}>
                  {tz}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Space>
    </Drawer>
  );
};

export default UserDrawer;
