
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BlockType, ProjectType } from "../types";
import HeadingBlock from "./HeadingBlock";
import ConversationWidget from "./ConversationWidget";
import AIAssistant from "./AIAssistant";
import { Textarea } from "@/components/ui/textarea";

interface PageBuilderProps {
  project: ProjectType;
  onUpdateProject?: (updatedProject: ProjectType) => void;
}

export default function PageBuilder({ project, onUpdateProject }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<BlockType[]>(project.blocks);
  
  const renderBlock = (block: BlockType, index: number) => {
    switch (block.type) {
      case "heading":
        return (
          <HeadingBlock
            key={block.id}
            content={block.content}
            level={block.level || 1}
            editable
            onChange={(content) => handleUpdateBlock(index, { ...block, content })}
          />
        );
      case "paragraph":
        return (
          <Textarea
            key={block.id}
            value={block.content}
            onChange={(e) => handleUpdateBlock(index, { ...block, content: e.target.value })}
            className="w-full resize-none min-h-[100px] mb-4 bg-transparent border-0 focus-visible:ring-0 p-0 text-base placeholder:text-muted-foreground"
            placeholder="Type text here..."
          />
        );
      default:
        return null;
    }
  };

  const handleUpdateBlock = (index: number, updatedBlock: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
    
    if (onUpdateProject) {
      onUpdateProject({ ...project, blocks: newBlocks });
    }
  };

  const addNewBlock = (type: BlockType['type'], level: number = 1) => {
    const newBlock: BlockType = {
      id: `block-${Date.now()}`,
      type,
      content: type === "heading" ? "New Heading" : "",
      level: type === "heading" ? level as 1 | 2 | 3 | 4 | 5 | 6 : undefined,
    };
    
    setBlocks([...blocks, newBlock]);
    
    if (onUpdateProject) {
      onUpdateProject({ ...project, blocks: [...blocks, newBlock] });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-8 space-y-4">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" size="sm" onClick={() => addNewBlock("heading", 1)}>
            <Plus className="h-4 w-4 mr-1" />
            H1
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNewBlock("heading", 2)}>
            <Plus className="h-4 w-4 mr-1" />
            H2
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNewBlock("heading", 3)}>
            <Plus className="h-4 w-4 mr-1" />
            H3
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNewBlock("heading", 4)}>
            <Plus className="h-4 w-4 mr-1" />
            H4
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNewBlock("heading", 5)}>
            <Plus className="h-4 w-4 mr-1" />
            H5
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNewBlock("heading", 6)}>
            <Plus className="h-4 w-4 mr-1" />
            H6
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNewBlock("paragraph")}>
            <Plus className="h-4 w-4 mr-1" />
            Text
          </Button>
        </div>
      </div>
      
      <div className="w-full lg:w-[320px] space-y-6">
        <AIAssistant />
        <ConversationWidget conversations={project.conversations} />
      </div>
    </div>
  );
}
