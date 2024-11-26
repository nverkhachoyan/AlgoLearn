import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex gap-2 mb-2">
        <Button variant="outline" size="sm">
          B
        </Button>
        <Button variant="outline" size="sm">
          I
        </Button>
        <Button variant="outline" size="sm">
          U
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] font-mono"
      />
    </div>
  );
};

export default RichTextEditor;
