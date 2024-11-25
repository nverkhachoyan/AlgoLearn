import { useState } from "react";
import { Button } from "..//ui/button";
import { Input } from "../ui/input";
import { Textarea } from "..//ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";

const CourseFormDialog = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
}: any) => {
  const [formData, setFormData] = useState(initialData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData.id ? "Edit Course" : "New Course"}
          </DialogTitle>
          <DialogDescription>
            Create or edit a course. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(formData)}>Save Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormDialog;
