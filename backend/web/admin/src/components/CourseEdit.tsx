import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  minValue,
  maxValue,
} from "react-admin";

const difficultyLevels = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
  { id: "expert", name: "Expert" },
];

export const CourseEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} fullWidth />
      <TextInput source="description" multiline rows={4} fullWidth />
      <TextInput source="requirements" multiline rows={3} fullWidth />
      <TextInput source="whatYouLearn" multiline rows={3} fullWidth />
      <TextInput source="backgroundColor" />
      <TextInput source="iconUrl" />
      <NumberInput
        source="duration"
        validate={[required(), minValue(0)]}
        label="Duration (minutes)"
      />
      <SelectInput
        source="difficultyLevel"
        choices={difficultyLevels}
        validate={[required()]}
      />
      <NumberInput
        source="rating"
        validate={[minValue(0), maxValue(5)]}
        step={0.1}
      />
      <ArrayInput source="authors">
        <SimpleFormIterator>
          <TextInput source="name" label="Author Name" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="name" label="Tag Name" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);
