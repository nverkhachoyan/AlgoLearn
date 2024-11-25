import { Button } from "../ui/button";
import { Textarea } from "..//ui/textarea";

const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-2 flex gap-2">
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
