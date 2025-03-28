import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Space,
  Input,
  Select,
  Row,
  Col,
  Tooltip,
  Badge,
  Empty,
  Tag,
  Segmented,
  Breadcrumb,
  Statistic,
  Alert,
} from "antd";
import {
  PlusOutlined,
  FilterOutlined,
  HomeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  BookOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useStore } from "../store";
import CourseList from "../components/courses/CourseList";
import { DifficultyLevel } from "../types/models";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Helper function to get difficulty color
const getDifficultyColor = (level: DifficultyLevel): string => {
  const colors = {
    beginner: "green",
    intermediate: "blue",
    advanced: "orange",
    expert: "red",
  };
  return colors[level] || "blue";
};

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<string | number>("table");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Store selectors
  const courses = useStore((state) => state.courses);
  const isCourseLoading = useStore((state) => state.isCourseLoading);
  const error = useStore((state) => state.error);
  const pagination = useStore((state) => state.pagination);
  const fetchCourses = useStore((state) => state.fetchCourses);
  const deleteCourse = useStore((state) => state.deleteCourse);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Get statistics
  const totalCourses = pagination?.total || 0;
  const publishedCourses = courses.filter((course) => !course.draft).length;
  const draftCourses = courses.filter((course) => course.draft).length;

  // Filter courses by search term and filters
  const filteredCourses = courses.filter((course) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.tags &&
        course.tags.some((tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    // Difficulty filter
    const matchesDifficulty =
      !filterDifficulty || course.difficultyLevel === filterDifficulty;

    // Status filter
    const matchesStatus =
      !filterStatus ||
      (filterStatus === "published" && !course.draft) ||
      (filterStatus === "draft" && course.draft);

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchCourses(1, 10);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCourses]);

  const handlePaginationChange = useCallback(
    (page: number, size: number) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      fetchCourses(page, size);
    },
    [fetchCourses]
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleRefresh = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    fetchCourses(pagination.current, pagination.pageSize);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDifficulty(null);
    setFilterStatus(null);
  };

  if (error) {
    return (
      <Alert
        message="Error Loading Courses"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" type="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div
      className="courses-page"
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* Breadcrumb navigation */}
      <Breadcrumb style={{ marginBottom: "12px" }}>
        <Breadcrumb.Item>
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <BookOutlined /> Courses
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card size="small">
        {/* Header with title and create button */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "16px" }}
        >
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Courses
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/courses/create")}
              size="middle"
            >
              Create Course
            </Button>
          </Col>
        </Row>

        {/* Statistics cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Total Courses"
                value={totalCourses}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Published"
                value={publishedCourses}
                prefix={<Badge status="success" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Draft"
                value={draftCourses}
                prefix={<Badge status="warning" />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and search */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search courses"
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Filter by difficulty"
              style={{ width: "100%" }}
              allowClear
              value={filterDifficulty}
              onChange={(value) => setFilterDifficulty(value)}
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
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: "100%" }}
              allowClear
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="published">
                <Tag color="green">Published</Tag>
              </Option>
              <Option value="draft">
                <Tag color="orange">Draft</Tag>
              </Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Tooltip title="Refresh">
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
              </Tooltip>
              <Tooltip title="Clear filters">
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </Tooltip>
              <Segmented
                options={[
                  {
                    value: "table",
                    icon: <UnorderedListOutlined />,
                  },
                  {
                    value: "grid",
                    icon: <AppstoreOutlined />,
                  },
                ]}
                value={viewMode}
                onChange={setViewMode}
              />
            </Space>
          </Col>
        </Row>

        {/* Display active filters */}
        {(searchTerm || filterDifficulty || filterStatus) && (
          <div style={{ marginBottom: "16px" }}>
            <Text type="secondary" style={{ marginRight: 8 }}>
              <FilterOutlined /> Active filters:
            </Text>
            <Space wrap>
              {searchTerm && (
                <Tag closable onClose={() => setSearchTerm("")}>
                  Search: {searchTerm}
                </Tag>
              )}
              {filterDifficulty && (
                <Tag
                  color={getDifficultyColor(
                    filterDifficulty as DifficultyLevel
                  )}
                  closable
                  onClose={() => setFilterDifficulty(null)}
                >
                  {filterDifficulty.charAt(0).toUpperCase() +
                    filterDifficulty.slice(1)}
                </Tag>
              )}
              {filterStatus && (
                <Tag
                  color={filterStatus === "published" ? "green" : "orange"}
                  closable
                  onClose={() => setFilterStatus(null)}
                >
                  {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Tag>
              )}
            </Space>
          </div>
        )}

        {/* Course list */}
        {filteredCourses.length === 0 && !isCourseLoading ? (
          <Empty
            description="No courses found matching your criteria"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Empty>
        ) : (
          <CourseList
            courses={filteredCourses}
            loading={isCourseLoading}
            onDelete={deleteCourse}
            onPaginationChange={handlePaginationChange}
            currentPage={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
          />
        )}
      </Card>
    </div>
  );
};

export default React.memo(CoursesPage);
