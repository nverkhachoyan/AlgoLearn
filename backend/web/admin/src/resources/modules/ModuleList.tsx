import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  NumberField,
  DateField,
  EditButton,
  TextInput,
  ReferenceInput,
} from "react-admin";

const moduleFilters = [
  <TextInput source="title" label="Search by title" alwaysOn />,
  <ReferenceInput source="course_id" reference="courses" label="Course" />,
];

export const ModuleList = () => (
  <List filters={moduleFilters}>
    <Datagrid>
      <TextField source="title" />
      <ReferenceField source="course_id" reference="courses">
        <TextField source="title" />
      </ReferenceField>
      <NumberField source="order" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <EditButton />
    </Datagrid>
  </List>
);
