import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  required,
  SelectInput,
  useRedirect,
  Button,
  TopToolbar,
  useRecordContext,
  RaRecord,
} from "react-admin";
import { Module } from "../types";
import { useLocation } from "react-router-dom";

const ModuleEditActions = () => {
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

const ModuleEdit = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("courseId");
  const unitId = params.get("unitId");

  return (
    <Edit
      mutationMode="pessimistic"
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
    </Edit>
  );
};

export default ModuleEdit;
