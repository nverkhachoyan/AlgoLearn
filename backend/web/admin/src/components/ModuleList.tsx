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
} from "react-admin";
import { Box, Typography } from "@mui/material";
import { useLocation, Link } from "react-router-dom";

const ModuleList = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("courseId");
  const unitId = params.get("unitId");

  const { data: unit } = useGetOne(
    "units",
    { id: unitId },
    { enabled: !!unitId && !!courseId }
  );

  const ListActions = () => (
    <TopToolbar>
      <CreateButton
        resource="modules"
        state={{ record: { courseId, unitId } }}
      />
      <Button
        component={Link}
        to={`/units?courseId=${courseId}`}
        label="Back to Units"
      />
    </TopToolbar>
  );

  if (!courseId || !unitId) {
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
        Modules for Unit: {unit?.name}
      </Typography>
      <List
        resource="modules"
        filter={{ courseId, unitId }}
        actions={<ListActions />}
        sort={{ field: "updatedAt", order: "DESC" }}
      >
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="description" />
          <NumberField source="moduleNumber" />
          <TextField source="type" />
          <DateField source="createdAt" showTime />
          <DateField source="updatedAt" showTime />
          <EditButton />
        </Datagrid>
      </List>
    </Box>
  );
};

export default ModuleList;
