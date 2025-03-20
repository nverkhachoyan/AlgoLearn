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
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import useStore from "../../store";
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
  const setIsDarkMode = useStore((state) => state.setIsDarkMode);

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
        <div>
          <Title level={4}>{user.username}</Title>
          <Space>
            <Tag color={user.role === "admin" ? "red" : "blue"}>
              {user.role}
            </Tag>
            <Tag color={user.isActive ? "green" : "gray"}>
              {user.isActive ? "Active" : "Inactive"}
            </Tag>
          </Space>
        </div>

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
              onChange={(checked) => setIsDarkMode(checked)}
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
