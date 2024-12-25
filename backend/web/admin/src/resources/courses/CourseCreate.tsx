import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  SelectInput,
  required,
  minLength,
} from "react-admin";

const difficultyChoices = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
];

export const CourseCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput
        source="title"
        validate={[required(), minLength(3)]}
        fullWidth
      />
      <TextInput
        source="description"
        validate={[required(), minLength(10)]}
        multiline
        rows={4}
        fullWidth
      />
      <SelectInput
        source="difficulty"
        choices={difficultyChoices}
        validate={required()}
      />
      <BooleanInput source="is_published" defaultValue={false} />
    </SimpleForm>
  </Create>
);
