import { useEffect, useState } from "react";
import {
  useInput,
  useNotify,
  InputProps,
  useDataProvider,
  useRecordContext,
} from "react-admin";
import { Button, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface FileUploadInputProps extends InputProps {
  source: string;
  label?: string;
}

export const FileUploadInput = (props: FileUploadInputProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    field: { onChange },
    fieldState: { error },
  } = useInput(props);
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const record = useRecordContext();

  useEffect(() => {
    if (selectedFile) {
      handleUpload();
    }
  }, [selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        notify("Please select an image file", { type: "error" });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        notify("File size should be less than 5MB", { type: "error" });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      // Use dataProvider to handle upload
      const { data } = await dataProvider.upload("upload", {
        file: selectedFile,
      });

      // Update the form field with the key
      onChange(data.key);

      // If we're in edit mode (record exists), update the course immediately
      if (record?.id) {
        await dataProvider.update("courses", {
          id: record.id,
          data: { iconUrl: data.key },
          previousData: record,
        });
      }

      notify("File uploaded successfully", { type: "success" });
    } catch (error) {
      console.error("Upload error:", error);
      notify(`Upload error: ${error}`, { type: "error" });
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="raised-button-file"
        type="file"
        onChange={handleFileSelect}
      />
      <label htmlFor="raised-button-file">
        <Button
          variant="contained"
          component="span"
          startIcon={
            uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />
          }
          disabled={uploading}
        >
          {props.label || "Upload"}
        </Button>
      </label>
      {error && <span style={{ color: "red" }}>{error.message}</span>}
    </div>
  );
};
