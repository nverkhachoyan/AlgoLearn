import { Button } from "../ui/button";
import { Code } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { Textarea } from "../ui/textarea";

const CodeEditor = ({ value, onChange, language = "python" }) => {
  return (
    <div className="border rounded-lg">
      <div className="bg-slate-100 p-2 flex justify-between items-center">
        <Select defaultValue={language}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Code className="w-4 h-4 mr-2" />
          Format
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] font-mono p-4 bg-slate-950 text-slate-50"
      />
    </div>
  );
};

export default CodeEditor;
