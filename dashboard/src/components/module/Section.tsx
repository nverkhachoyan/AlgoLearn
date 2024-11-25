import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { GripVertical } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";

const Section = ({ section, index, onEdit, onDelete }) => (
  <Draggable draggableId={`section-${index}`} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className="flex items-start p-3 border rounded-lg bg-white"
      >
        <div {...provided.dragHandleProps} className="mr-2">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mr-3 mt-1">{getIconForSectionType(section.type)}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-500 mb-1">
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
          </div>
          <div className="text-sm">{section.content}</div>
        </div>
        <div className="ml-4 flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(section)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(section)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )}
  </Draggable>
);

export default Section;
