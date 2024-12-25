import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  EditButton,
  CreateButton,
  TopToolbar,
  useGetOne,
  Button,
  useRecordContext,
} from "react-admin";
import { Course } from "../types";
import { Box, Typography } from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";

const ModulesButton = () => {
  const record = useRecordContext();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("courseId");

  return (
    <Button
      component={Link}
      to={`/modules?courseId=${courseId}&unitId=${record.id}`}
      label="Modules"
      onClick={(e) => e.stopPropagation()}
    >
      <ArticleIcon />
    </Button>
  );
};

const UnitList = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("courseId");

  const { data: course } = useGetOne(
    "courses",
    { id: courseId },
    { enabled: !!courseId }
  );

  const ListActions = () => (
    <TopToolbar>
      <CreateButton resource="units" state={{ record: { courseId } }} />
      <Button
        component={Link}
        to={`/units?courseId=${courseId}`}
        label="Back to Units"
      />
    </TopToolbar>
  );

  if (!courseId) {
    return (
      <Box>
        <Typography variant="h6" color="error" gutterBottom>
          Please select a unit to view its modules
        </Typography>
        <Button component={Link} to="/courses" label="Back to Courses" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Units for Course: {course?.name}
      </Typography>
      <List
        resource="units"
        filter={{ courseId }}
        actions={<ListActions />}
        sort={{ field: "updatedAt", order: "DESC" }}
      >
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="description" />
          <NumberField source="unitNumber" />
          <DateField source="createdAt" showTime />
          <DateField source="updatedAt" showTime />
          <ModulesButton />
          <EditButton />
        </Datagrid>
      </List>
    </Box>
  );
};

export default UnitList;
