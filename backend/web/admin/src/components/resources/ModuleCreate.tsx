import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  required,
  SelectInput,
  useRedirect,
  Button,
  TopToolbar,
  RaRecord,
  CreateProps,
} from "react-admin";
import { useLocation } from "react-router-dom";

const ModuleCreateActions = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("courseId");
  const unitId = params.get("unitId");
  const redirect = useRedirect();

  const handleBack = () => {
    redirect(`/modules?courseId=${courseId}&unitId=${unitId}`);
  };

  return (
    <TopToolbar>
      <Button label="Back to Modules" onClick={handleBack} />
    </TopToolbar>
  );
};

const ModuleCreate = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("courseId");
  const unitId = params.get("unitId");

  return (
    <Create<RaRecord>
      transform={(data: RaRecord) => ({
        ...data,
        courseId,
        unitId,
      })}
    >
      <SimpleForm>
        <TextInput source="name" validate={[required()]} fullWidth />
        <TextInput
          source="description"
          validate={[required()]}
          multiline
          rows={3}
          fullWidth
        />
        <TextInput
          source="content"
          validate={[required()]}
          multiline
          rows={5}
          fullWidth
        />
        <NumberInput
          source="moduleNumber"
          validate={[required()]}
          min={0}
          step={1}
        />
        <SelectInput
          source="type"
          validate={[required()]}
          choices={[
            { id: "video", name: "Video" },
            { id: "text", name: "Text" },
            { id: "quiz", name: "Quiz" },
          ]}
        />
      </SimpleForm>
    </Create>
  );
};

export default ModuleCreate;
