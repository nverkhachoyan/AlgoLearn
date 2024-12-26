import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  required,
  useRedirect,
  Button,
  TopToolbar,
} from "react-admin";

const UnitCreateActions = () => {
  const redirect = useRedirect();

  const handleBack = () => {
    redirect("list", "courses");
  };

  return (
    <TopToolbar>
      <Button label="Back to Courses" onClick={handleBack} />
    </TopToolbar>
  );
};

const UnitCreate = () => (
  <Create actions={<UnitCreateActions />}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} fullWidth />
      <TextInput
        source="description"
        validate={[required()]}
        multiline
        rows={3}
        fullWidth
      />
      <NumberInput
        source="unitNumber"
        validate={[required()]}
        min={0}
        step={1}
      />
    </SimpleForm>
  </Create>
);

export default UnitCreate;
