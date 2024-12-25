import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  NumberInput,
  required,
  minLength,
  minValue,
} from "react-admin";

export const ModuleEdit = () => (
  <Edit>
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
      <ReferenceInput
        source="course_id"
        reference="courses"
        validate={required()}
      />
      <NumberInput source="order" validate={[required(), minValue(1)]} />
    </SimpleForm>
  </Edit>
);
