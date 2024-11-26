import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

const CodeEditor = ({ value, onChange, language = "python" }) => {
  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-2 bg-slate-100">
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
