import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  TextInput,
  SelectInput,
  Button,
  useRecordContext,
} from "react-admin";
import { Link } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";

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

const UnitsButton = () => {
  const record = useRecordContext();
  return (
    <Button
      component={Link}
      to={`/units?courseId=${record.id}`}
      label="Units"
      onClick={(e) => e.stopPropagation()}
    >
      <ArticleIcon />
    </Button>
  );
};

export const CourseList = () => (
  <List
    filters={filters}
    sort={{ field: "updatedAt", order: "DESC" }}
    sx={{ padding: 1.5 }}
  >
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      <TextField source="difficultyLevel" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
      <UnitsButton />
      <EditButton />
    </Datagrid>
  </List>
);
