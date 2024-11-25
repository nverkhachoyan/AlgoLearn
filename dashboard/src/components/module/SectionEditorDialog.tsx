import { useState } from "react";
import { Button } from "../ui/button";
import { Trash2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import CodeEditor from "./CodeEditor";
import RichTextEditor from "./RichTextEditor";

const SectionEditorDialog = ({ isOpen, onClose, onSave, section }) => {
  const [editingSection, setEditingSection] = useState(
    section || { type: "text", content: "" }
  );

  const renderEditor = () => {
    switch (editingSection.type) {
      case "code":
        return (
          <CodeEditor
            value={editingSection.content}
            onChange={(content) =>
              setEditingSection({ ...editingSection, content })
            }
          />
        );
      case "text":
        return (
          <RichTextEditor
            value={editingSection.content}
            onChange={(content) =>
              setEditingSection({ ...editingSection, content })
            }
          />
        );
      case "question":
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Question"
              value={editingSection.content}
              onChange={(e) =>
                setEditingSection({
                  ...editingSection,
                  content: e.target.value,
                })
              }
            />
            <div className="space-y-2">
              {(editingSection.options || []).map((option, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editingSection.options];
                      newOptions[idx] = e.target.value;
                      setEditingSection({
                        ...editingSection,
                        options: newOptions,
                      });
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = editingSection.options.filter(
                        (_, i) => i !== idx
                      );
                      setEditingSection({
                        ...editingSection,
                        options: newOptions,
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setEditingSection({
                    ...editingSection,
                    options: [...(editingSection.options || []), ""],
                  })
                }
              >
                Add Option
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <Textarea
            value={editingSection.content}
            onChange={(e) =>
              setEditingSection({ ...editingSection, content: e.target.value })
            }
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={editingSection.type}
            onValueChange={(value) =>
              setEditingSection({ ...editingSection, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Section Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
          {renderEditor()}
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(editingSection)}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SectionEditorDialog;
