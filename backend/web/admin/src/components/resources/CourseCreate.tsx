import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  minValue,
  maxValue,
  useNotify,
  useDataProvider,
} from "react-admin";
import {
  Autocomplete,
  TextField as MuiTextField,
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PreviewIcon from "@mui/icons-material/Preview";
import { FileUploadInput } from "../common/FileUploadInput";

interface Tag {
  id: string | number;
  name: string;
  inputValue?: string;
}

const difficultyLevels = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
  { id: "expert", name: "Expert" },
];

const getDifficultyColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "#4CAF50";
    case "intermediate":
      return "#2196F3";
    case "advanced":
      return "#FF9800";
    case "expert":
      return "#f44336";
    default:
      return "#757575";
  }
};

// Custom Tag Input component
const TagInput = ({
  onChange,
  value = [],
}: {
  onChange: (value: Tag[]) => void;
  value: Tag[];
}) => {
  const [searchText, setSearchText] = useState("");
  const [options, setOptions] = useState<Tag[]>([]);
  const notify = useNotify();
  const dataProvider = useDataProvider();

  // Fetch tags based on search
  const debouncedSearch = debounce(async (query: string) => {
    if (!query) return;

    try {
      const { data } = await dataProvider.getList("tags", {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "name", order: "ASC" },
        filter: { q: query },
      });
      setOptions(data);
    } catch (error) {
      console.error("Error searching tags:", error);
      notify("Error searching tags", { type: "error" });
    }
  }, 300);

  useEffect(() => {
    if (searchText) {
      debouncedSearch(searchText);
    }
  }, [searchText, debouncedSearch]);

  const handleCreateTag = async (newTagName: string) => {
    try {
      const { data: newTag } = await dataProvider.create("tags", {
        data: { name: newTagName },
      });
      setOptions([...options, newTag]);
      onChange([...value, newTag]);
      notify("Tag created successfully", { type: "success" });
    } catch (error) {
      console.error("Error creating tag:", error);
      notify("Error creating tag", { type: "error" });
    }
  };

  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      getOptionLabel={(option: Tag) => option.name}
      isOptionEqualToValue={(option: Tag, value: Tag) => option.id === value.id}
      onInputChange={(_, newInputValue) => setSearchText(newInputValue)}
      renderInput={(params) => (
        <MuiTextField {...params} label="Tags" variant="outlined" fullWidth />
      )}
      filterOptions={(options, params) => {
        const filtered = options.filter((option) =>
          option.name.toLowerCase().includes(params.inputValue.toLowerCase())
        );

        // Check if the input value matches any existing option exactly
        const inputMatchesExisting = filtered.some(
          (option) =>
            option.name.toLowerCase() === params.inputValue.toLowerCase()
        );

        // Only add the "Create" option if there's no exact match
        if (params.inputValue !== "" && !inputMatchesExisting) {
          filtered.push({
            id: `new-${params.inputValue}`,
            name: `Create "${params.inputValue}"`,
            inputValue: params.inputValue,
          });
        }

        // Ensure unique options based on ID
        return filtered.filter(
          (option, index, self) =>
            index === self.findIndex((t) => t.id === option.id)
        );
      }}
      onChange={(_, newValue) => {
        const lastOption = newValue[newValue.length - 1] as Tag;
        if (lastOption && lastOption.id?.toString().startsWith("new-")) {
          handleCreateTag(lastOption.inputValue!);
        } else {
          onChange(newValue as Tag[]);
        }
      }}
    />
  );
};

interface FormValues {
  name: string;
  description: string;
  difficultyLevel: string;
  duration: number;
  rating: number;
  backgroundColor: string;
  iconUrl: string;
  requirements?: string;
  whatYouLearn?: string;
  authors?: Array<{ name: string }>;
  tags?: Tag[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // TODO: Remove this when we figure out the proper React Admin form types
}

export const CourseCreate = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [previewData, setPreviewData] = useState<FormValues>({
    name: "",
    description: "",
    difficultyLevel: "",
    duration: 0,
    rating: 0,
    backgroundColor: "#1976d2",
    iconUrl: "",
  });

  // TODO: Improve type safety when we better understand React Admin's form types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormChange = (values: any) => {
    setPreviewData(values as FormValues);
  };

  return (
    <Create
      sx={{
        maxWidth: 1200,
        margin: "0 auto !important",
        marginBottom: "25px !important",
        "& .css-142c0mx-MuiPaper-root-MuiCard-root": {
          backgroundColor: "transparent !important",
          backgroundImage: "none !important",
          boxShadow: "none !important",
        },
        "& .css-lr3sbp-MuiPaper-root-MuiCard-root": {
          backgroundColor: "transparent !important",
          backgroundImage: "none !important",
          boxShadow: "none !important",
        },
      }}
    >
      <SimpleForm onChange={handleFormChange}>
        <Box
          sx={{
            maxWidth: 1200,
            margin: "0 auto",
            p: 2,
          }}
        >
          <Grid container spacing={3}>
            {/* Preview Card */}
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: (theme) => theme.palette.background.paper,
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <PreviewIcon color="primary" />
                  <Typography variant="h6">Course Preview</Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        height: 200,
                        backgroundColor:
                          previewData.backgroundColor || "#1976d2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {previewData.iconUrl ? (
                        <img
                          src={
                            previewData.iconUrl.startsWith("http")
                              ? previewData.iconUrl
                              : `https://algolearn.nyc3.digitaloceanspaces.com/${previewData.iconUrl}`
                          }
                          alt="Course Preview"
                          style={{
                            maxHeight: "80%",
                            maxWidth: "80%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <SchoolIcon sx={{ fontSize: 80, color: "white" }} />
                      )}
                      {previewData.difficultyLevel && (
                        <Chip
                          label={previewData.difficultyLevel}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: getDifficultyColor(
                              previewData.difficultyLevel
                            ),
                            color: "white",
                          }}
                        />
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h5" gutterBottom>
                      {previewData.name || "Course Name"}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      {previewData.description ||
                        "Course description will appear here..."}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {previewData.duration > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {previewData.duration} min
                          </Typography>
                        </Box>
                      )}
                      {previewData.rating > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          ★ {previewData.rating.toFixed(1)}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextInput
                      source="name"
                      validate={[required()]}
                      fullWidth
                      label="Course Name"
                      helperText="Enter the name of the course"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextInput
                      source="description"
                      multiline
                      rows={4}
                      fullWidth
                      label="Course Description"
                      helperText="Provide a detailed description of the course"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom color="primary">
                  Course Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextInput
                      source="requirements"
                      multiline
                      rows={3}
                      fullWidth
                      label="Prerequisites"
                      helperText="List the course prerequisites"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextInput
                      source="whatYouLearn"
                      multiline
                      rows={3}
                      fullWidth
                      label="Learning Outcomes"
                      helperText="What students will learn"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Course Settings
                  </Typography>
                  <Stack spacing={2}>
                    <SelectInput
                      source="difficultyLevel"
                      choices={difficultyLevels}
                      validate={[required()]}
                      label="Difficulty"
                    />
                    <NumberInput
                      source="duration"
                      validate={[required(), minValue(0)]}
                      label="Duration (minutes)"
                    />
                    <NumberInput
                      source="rating"
                      validate={[minValue(0), maxValue(5)]}
                      step={0.1}
                      label="Rating"
                    />
                  </Stack>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Visual Settings
                  </Typography>
                  <Stack spacing={2}>
                    <TextInput
                      source="backgroundColor"
                      fullWidth
                      label="Background Color"
                      helperText="Hex color code (e.g., #FFFFFF)"
                    />
                    <FileUploadInput source="iconUrl" label="Course Icon" />
                  </Stack>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <PersonAddIcon color="primary" />
                    <Typography variant="h6" color="primary">
                      Authors
                    </Typography>
                  </Stack>
                  <ArrayInput source="authors">
                    <SimpleFormIterator inline>
                      <TextInput
                        source="name"
                        label="Author Name"
                        helperText={false}
                      />
                    </SimpleFormIterator>
                  </ArrayInput>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <LocalOfferIcon color="primary" />
                    <Typography variant="h6" color="primary">
                      Tags
                    </Typography>
                  </Stack>
                  <TagInput value={tags} onChange={setTags} />
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </SimpleForm>
    </Create>
  );
};
