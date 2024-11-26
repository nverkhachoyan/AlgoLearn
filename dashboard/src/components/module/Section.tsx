import { Button } from "@/components/ui/button";
import { Edit2, Text, Trash2 } from "lucide-react";
import { GripVertical } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";

const Section = ({ section, index, onEdit, onDelete }) => { 
  const getIconForSectionType = (type: string) => {
    if (type === "text") {
    return <Text/>

    }
    return <Text/>
  }
  
  
  return (<Draggable draggableId={`section-${index}`} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className="flex items-start p-3 bg-white border rounded-lg"
      >
        <div {...provided.dragHandleProps} className="mr-2">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-1 mr-3">{getIconForSectionType(section.type)}</div>
        <div className="flex-1">
          <div className="mb-1 text-sm font-medium text-slate-500">
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
          </div>
          <div className="text-sm">{section.content}</div>
        </div>
        <div className="flex ml-4 space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(section)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(section)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )}
  </Draggable>)
  };

export default Section;
