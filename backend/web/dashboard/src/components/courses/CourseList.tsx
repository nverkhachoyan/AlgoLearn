import React from "react";
import { Table, Button, Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Course } from "../../types/models";
import { useNavigate } from "react-router-dom";
import type { TablePaginationConfig } from "antd/es/table";

interface CourseListProps {
  courses: Course[];
  loading?: boolean;
  onDelete?: (courseId: number) => void;
  onPaginationChange: (page: number, pageSize: number) => void;
  currentPage: number;
  pageSize: number;
  total: number;
}

const CourseList: React.FC<CourseListProps> = React.memo(
  ({
    courses,
    loading = false,
    onDelete,
    onPaginationChange,
    currentPage,
    pageSize,
    total,
  }) => {
    const navigate = useNavigate();

    const handleTableChange = React.useCallback(
      (newPagination: TablePaginationConfig) => {
        const page = newPagination.current || 1;
        const size = newPagination.pageSize || 10;
        onPaginationChange(page, size);
      },
      [onPaginationChange]
    );

    const columns = React.useMemo(
      () => [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (text: string, record: Course) => (
            <a onClick={() => navigate(`/courses/${record.id}`)}>{text}</a>
          ),
        },
        {
          title: "Difficulty",
          dataIndex: "difficultyLevel",
          key: "difficultyLevel",
          render: (level: string) => {
            const colors = {
              beginner: "green",
              intermediate: "blue",
              advanced: "orange",
              expert: "red",
            };
            return (
              <Tag color={colors[level as keyof typeof colors]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Tag>
            );
          },
        },
        {
          title: "Units",
          dataIndex: "units",
          key: "units",
          render: (units: any[]) => (units ? units.length : 0),
        },
        {
          title: "Status",
          dataIndex: "draft",
          key: "draft",
          render: (draft: boolean) => (
            <Tag color={draft ? "orange" : "green"}>
              {draft ? "Draft" : "Published"}
            </Tag>
          ),
        },
        {
          title: "Actions",
          key: "actions",
          render: (_: any, record: Course) => (
            <Space size="middle">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/courses/${record.id}/edit`)}
              />
              {onDelete && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(record.id)}
                />
              )}
            </Space>
          ),
        },
      ],
      [navigate, onDelete]
    );

    return (
      <Table
        columns={columns}
        dataSource={courses}
        loading={loading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} courses`,
        }}
        onChange={handleTableChange}
      />
    );
  }
);

CourseList.displayName = "CourseList";

export default CourseList;
