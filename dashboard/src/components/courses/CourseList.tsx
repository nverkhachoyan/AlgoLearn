import React, { useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Tag as AntTag,
  Space,
  Avatar,
  Tooltip,
  Progress,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  StarFilled,
  BookOutlined,
} from "@ant-design/icons";
import { Course, Tag as CourseTag, Author } from "../../types/models";
import { useNavigate } from "react-router-dom";
import type { TablePaginationConfig } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
// import type { FilterValue, SorterResult } from "antd/es/table/interface";
import ConditionalRenderer from "../ConditionalRenderer";
import { buildImgUrl } from "../../store/utils";

interface CourseListProps {
  courses: Course[];
  loading?: boolean;
  onDelete?: (courseId: number) => void;
  onPaginationChange: (page: number, pageSize: number) => void;
  currentPage: number;
  pageSize: number;
  total: number;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  loading = false,
  onDelete,
  onPaginationChange,
  currentPage,
  pageSize,
  total,
}) => {
  const navigate = useNavigate();

  const handleTableChange = useCallback(
    (
      newPagination: TablePaginationConfig

      // _filters: Record<string, FilterValue | null>,
      // _sorter: SorterResult<Course> | SorterResult<Course>[]
    ) => {
      const page = newPagination.current || 1;
      const size = newPagination.pageSize || 10;
      onPaginationChange(page, size);
    },
    [onPaginationChange]
  );

  const columns = useMemo<ColumnsType<Course>>(
    () => [
      {
        title: "Course",
        dataIndex: "name",
        key: "name",
        render: (text: string, record: Course) => (
          <Space>
            <ConditionalRenderer
              condition={Boolean(record.imgKey && record.imgKey.length > 0)}
              renderTrue={() => (
                <Avatar
                  src={buildImgUrl(
                    "courses",
                    record.folderObjectKey,
                    record.imgKey,
                    record.mediaExt
                  )}
                  shape="square"
                />
              )}
              renderFalse={() => (
                <Avatar
                  icon={<BookOutlined />}
                  shape="square"
                  style={{
                    backgroundColor: record.backgroundColor || "#1890ff",
                  }}
                />
              )}
            />

            <Space direction="vertical" size={0}>
              <a
                onClick={() => navigate(`/courses/${record.id}`)}
                style={{ fontWeight: 500 }}
              >
                {text}
              </a>
              {record.tags && record.tags.length > 0 && (
                <Space size={[0, 4]} wrap style={{ marginTop: 4 }}>
                  {record.tags.slice(0, 3).map((tag: CourseTag) => (
                    <AntTag
                      key={tag.id}
                      style={{ fontSize: "10px", padding: "0 4px", margin: 0 }}
                    >
                      {tag.name}
                    </AntTag>
                  ))}
                  {record.tags.length > 3 && (
                    <Tooltip
                      title={record.tags
                        .slice(3)
                        .map((t: CourseTag) => t.name)
                        .join(", ")}
                    >
                      <AntTag
                        style={{
                          fontSize: "10px",
                          padding: "0 4px",
                          margin: 0,
                        }}
                      >
                        +{record.tags.length - 3}
                      </AntTag>
                    </Tooltip>
                  )}
                </Space>
              )}
            </Space>
          </Space>
        ),
        width: "30%",
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
            <AntTag color={colors[level as keyof typeof colors]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </AntTag>
          );
        },
        width: "12%",
        filters: [
          { text: "Beginner", value: "beginner" },
          { text: "Intermediate", value: "intermediate" },
          { text: "Advanced", value: "advanced" },
          { text: "Expert", value: "expert" },
        ],
        onFilter: (value: boolean | React.Key, record: Course) =>
          record.difficultyLevel === value,
      },
      {
        title: "Structure",
        key: "structure",
        render: (_: unknown, record: Course) => (
          <Space direction="vertical" size={0}>
            <Space size="small">
              <BookOutlined />
              <span>{record.units?.length || 0} units</span>
            </Space>
            {record.duration && (
              <Space size="small">
                <ClockCircleOutlined />
                <span>{record.duration} hrs</span>
              </Space>
            )}
          </Space>
        ),
        width: "15%",
      },
      {
        title: "Authors",
        key: "authors",
        render: (_: unknown, record: Course) =>
          record.authors && record.authors.length > 0 ? (
            <Avatar.Group maxCount={3} size="small">
              {record.authors.map((author: Author) => (
                <Tooltip key={author.id} title={author.name}>
                  <Avatar size="small">
                    {author.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
          ) : (
            <span style={{ color: "#00000040" }}>—</span>
          ),
        width: "10%",
      },
      {
        title: "Status",
        key: "status",
        render: (_: unknown, record: Course) => (
          <Space direction="vertical" size={0}>
            <Badge
              status={record.draft ? "warning" : "success"}
              text={record.draft ? "Draft" : "Published"}
            />
            {record.progress > 0 && (
              <Progress
                percent={record.progress}
                size="small"
                style={{ width: 80 }}
                format={(percent) => `${percent}%`}
                status={record.progress === 100 ? "success" : "active"}
              />
            )}
          </Space>
        ),
        width: "15%",
        filters: [
          { text: "Published", value: false },
          { text: "Draft", value: true },
        ],
        onFilter: (value: boolean | React.Key, record: Course) => {
          // Converting value to boolean if needed (since filter values are often sent as strings)
          if (typeof value === "string") {
            return record.draft === (value === "true");
          }
          return record.draft === value;
        },
      },
      {
        title: "Rating",
        dataIndex: "rating",
        key: "rating",
        render: (rating: number) =>
          rating ? (
            <Space>
              <StarFilled style={{ color: "#faad14" }} />
              <span>{rating.toFixed(1)}</span>
            </Space>
          ) : (
            <span style={{ color: "#00000040" }}>—</span>
          ),
        sorter: (a: Course, b: Course) => (a.rating || 0) - (b.rating || 0),
        width: "8%",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: Course) => (
          <Space size="small">
            <Tooltip title="View">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/courses/${record.id}`)}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/courses/${record.id}/edit`)}
                size="small"
              />
            </Tooltip>
            <ConditionalRenderer
              condition={Boolean(onDelete)}
              renderTrue={() => (
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete!(record.id!)}
                    size="small"
                  />
                </Tooltip>
              )}
              renderFalse={() => null}
            />
          </Space>
        ),
        width: "10%",
      },
    ],
    [navigate, onDelete]
  );

  return (
    <Table<Course>
      columns={columns}
      dataSource={courses}
      loading={loading}
      rowKey="id"
      size="small"
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showTotal: (total: number) => `Total ${total} courses`,
        pageSizeOptions: ["5", "10", "20", "50"],
      }}
      onChange={handleTableChange}
      rowClassName={(record: Course) => (record.draft ? "draft-row" : "")}
      scroll={{ x: 1000 }}
    />
  );
};

export default React.memo(CourseList);
