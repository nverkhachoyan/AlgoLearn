import {
  List,
  Datagrid,
  TextField,
  DateField,
  TextInput,
  SelectInput,
  DateInput,
  BooleanInput,
} from "react-admin";
import { Box } from "@mui/material";

const filters = [
  <TextInput source="username" label="Search by username" alwaysOn />,
  <SelectInput
    source="role"
    label="Role"
    choices={[
      { id: "admin", name: "Admin" },
      { id: "student", name: "Student" },
      { id: "instructor", name: "Instructor" },
    ]}
  />,
  <BooleanInput source="IsEmailVerified" label="Email Verified" />,
  <DateInput source="createdAt" label="Created At" />,
  <DateInput source="updatedAt" label="Updated At" />,
];

export const UserList = () => (
  <Box>
    <List
      filters={filters}
      sort={{ field: "updatedAt", order: "DESC" }}
      sx={{ padding: 1.5 }}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="username" />
        <TextField source="email" />
        <TextField source="role" />
        <TextField source="firstName" />
        <TextField source="lastName" />
        <TextField source="bio" />
        <TextField source="location" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
        {/* <EditButton /> */}
      </Datagrid>
    </List>
  </Box>
);
