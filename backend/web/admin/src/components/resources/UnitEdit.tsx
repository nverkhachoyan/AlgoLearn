import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  required,
  useRecordContext,
  Button,
  useRedirect,
  TopToolbar,
} from "react-admin";
import { Unit } from "../../types";
import ModuleList from "./ModuleList";
import { Box } from "@mui/material";

const UnitEditActions = () => {
  const record = useRecordContext<Unit>();
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

const UnitEdit = () => {
  const record = useRecordContext<Unit>();

  return (
    <Box>
      <Edit actions={<UnitEditActions />}>
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
      </Edit>
      {record && <ModuleList />}
    </Box>
  );
};

export default UnitEdit;
