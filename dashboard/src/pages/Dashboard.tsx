import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Statistic,
  Card,
  Input,
  Select,
  Empty,
  Spin,
  Button,
  Tabs,
  Tag,
  Badge,
  Breadcrumb,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  HomeOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useStore } from "../store";
import CourseCard from "../components/courses/CourseCard";
import { DifficultyLevel } from "../types/models";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const courses = useStore((state) => state.courses);
  const fetchCourses = useStore((state) => state.fetchCourses);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<
    DifficultyLevel | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchCourses();
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchCourses]);

  const totalCourses = courses.length;

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      filterDifficulty === "all" || course.difficultyLevel === filterDifficulty;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "published" && !course.draft) ||
      (activeTab === "draft" && course.draft);

    return matchesSearch && matchesDifficulty && matchesTab;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      // date
      return (
        new Date(b.updatedAt || "").getTime() -
        new Date(a.updatedAt || "").getTime()
      );
    }
  });

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchCourses();
    } catch (error) {
      console.error("Failed to refresh courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourseGrid = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="loading-text">Loading your courses...</Text>
        </div>
      );
    }

    if (sortedCourses.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              {searchQuery || filterDifficulty !== "all"
                ? "No courses match your filters"
                : "No courses found. Start creating your first course!"}
            </span>
          }
        >
          {!searchQuery && filterDifficulty === "all" && (
            <Link to="/courses/create">
              <Button type="primary" icon={<PlusOutlined />}>
                Create Course
              </Button>
            </Link>
          )}
        </Empty>
      );
    }

    return (
      <div className="course-grid">
        {sortedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Breadcrumb navigation */}
      <Breadcrumb style={{ marginBottom: "12px" }}>
        <Breadcrumb.Item>
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <BookOutlined /> Dashboard
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Header section */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <Title level={3}>My Courses</Title>
          <Text type="secondary">Manage and track all your courses</Text>
        </div>
        <Link to="/courses/create">
          <Button type="primary" icon={<PlusOutlined />} size="middle">
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Total Courses"
              value={totalCourses}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Published"
              value={courses.filter((course) => !course.draft).length}
              prefix={<Badge status="success" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Draft"
              value={courses.filter((course) => course.draft).length}
              prefix={<Badge status="warning" />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters section */}
      <div className="filters-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={10} md={8}>
            <Input
              placeholder="Search courses"
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              placeholder="Difficulty"
              style={{ width: "100%" }}
              value={filterDifficulty}
              onChange={(value) => setFilterDifficulty(value)}
              allowClear
            >
              <Option value="beginner">
                <Tag color="green">Beginner</Tag>
              </Option>
              <Option value="intermediate">
                <Tag color="blue">Intermediate</Tag>
              </Option>
              <Option value="advanced">
                <Tag color="orange">Advanced</Tag>
              </Option>
              <Option value="expert">
                <Tag color="red">Expert</Tag>
              </Option>
            </Select>
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              placeholder="Sort by"
              style={{ width: "100%" }}
              value={sortBy}
              onChange={(value: "name" | "date") => setSortBy(value)}
            >
              <Option value="date">Recently Updated</Option>
              <Option value="name">Name</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={4} className="refresh-button-col">
            <Space>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                />
              </Tooltip>
              <Tooltip title="Clear filters">
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDifficulty("all");
                    setSortBy("date");
                  }}
                >
                  Clear
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>

        {/* Display active filters */}
        {(searchQuery || filterDifficulty !== "all") && (
          <div style={{ marginTop: "12px" }}>
            <Text type="secondary" style={{ marginRight: 8 }}>
              <FilterOutlined /> Active filters:
            </Text>
            <Space wrap>
              {searchQuery && (
                <Tag closable onClose={() => setSearchQuery("")}>
                  Search: {searchQuery}
                </Tag>
              )}
              {filterDifficulty !== "all" && filterDifficulty && (
                <Tag
                  color={
                    filterDifficulty === "beginner"
                      ? "green"
                      : filterDifficulty === "intermediate"
                      ? "blue"
                      : filterDifficulty === "advanced"
                      ? "orange"
                      : "red"
                  }
                  closable
                  onClose={() => setFilterDifficulty("all")}
                >
                  {filterDifficulty.charAt(0).toUpperCase() +
                    filterDifficulty.slice(1)}
                </Tag>
              )}
            </Space>
          </div>
        )}
      </div>

      {/* Tabs section */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="course-tabs"
      >
        <TabPane tab="All Courses" key="all" />
        <TabPane tab="Published" key="published" />
        <TabPane tab="Drafts" key="draft" />
      </Tabs>

      {/* Courses grid */}
      {renderCourseGrid()}
    </div>
  );
};

export default Dashboard;
