import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  DateField,
  EditButton,
  TextInput,
  BooleanInput,
} from "react-admin";

const courseFilters = [
  <TextInput source="title" label="Search by title" alwaysOn />,
  <BooleanInput source="is_published" label="Published" />,
];

export const CourseList = () => (
  <List filters={courseFilters}>
    <Datagrid>
      <TextField source="title" />
      <TextField source="description" />
      <TextField source="difficulty" />
      <BooleanField source="is_published" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <EditButton />
    </Datagrid>
  </List>
);
