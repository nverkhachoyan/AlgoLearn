import {
  List,
  TextInput,
  SelectInput,
  useListContext,
  RecordContextProvider,
  useRecordContext,
} from "react-admin";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import { formatDistanceToNow } from "date-fns";

const filters = [
  <TextInput source="name" label="Search by name" alwaysOn />,
  <SelectInput
    source="difficultyLevel"
    label="Difficulty"
    choices={[
      { id: "beginner", name: "Beginner" },
      { id: "intermediate", name: "Intermediate" },
      { id: "advanced", name: "Advanced" },
      { id: "expert", name: "Expert" },
    ]}
  />,
];

const getDifficultyColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "beginner":
      return "#4CAF50";
    case "intermediate":
      return "#2196F3";
    case "advanced":
      return "#FF9800";
    case "expert":
      return "#f44336";
    default:
      return "#757575";
  }
};

const CourseCard = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <Box
        sx={{
          height: 140,
          position: "relative",
          backgroundColor: record.backgroundColor || "#1976d2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {record.iconUrl ? (
          <img
            src={record.iconUrl}
            alt={record.name}
            style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain" }}
          />
        ) : (
          <SchoolIcon sx={{ fontSize: 60, color: "white" }} />
        )}
        <Chip
          label={record.difficultyLevel}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: getDifficultyColor(record.difficultyLevel),
            color: "white",
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom noWrap>
          {record.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 2,
          }}
        >
          {record.description}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {record.duration} min
            </Typography>
          </Box>
          {record.rating && (
            <Typography variant="body2" color="text.secondary">
              ★ {record.rating.toFixed(1)}
            </Typography>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Updated{" "}
          {formatDistanceToNow(new Date(record.updatedAt), { addSuffix: true })}
        </Typography>
        <Box>
          <IconButton
            component={Link}
            to={`/units?courseId=${record.id}`}
            size="small"
            color="primary"
            title="View Units"
          >
            <ArticleIcon />
          </IconButton>
          <IconButton
            component={Link}
            to={`/courses/${record.id}`}
            size="small"
            color="primary"
            title="Edit Course"
          >
            <EditIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

const CourseGrid = () => {
  const { data, isLoading } = useListContext();
  if (isLoading || !data) return null;

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {data.map((record) => (
        <Grid item key={record.id} xs={12} sm={6} md={4} lg={3}>
          <RecordContextProvider value={record}>
            <CourseCard />
          </RecordContextProvider>
        </Grid>
      ))}
    </Grid>
  );
};

export const CourseList = () => (
  <List
    filters={filters}
    sort={{ field: "updatedAt", order: "DESC" }}
    component="div"
    sx={{
      // backgroundColor: "#f5f5f5",
      "& .RaList-main": { margin: 0 },
    }}
  >
    <CourseGrid />
  </List>
);
