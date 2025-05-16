
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageType, BlockType } from "../types";
import HeadingBlock from "./HeadingBlock";
import { FileImage, Plus, Type, ListOrdered, Code, FileText, CheckSquare, Quote, SeparatorHorizontal, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PageEditorProps {
  page: PageType;
  onUpdatePage?: (updatedPage: PageType) => void;
}

export default function PageEditor({ page, onUpdatePage }: PageEditorProps) {
  const [blocks, setBlocks] = useState<BlockType[]>(page.blocks);
  const [title, setTitle] = useState(page.title);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<number>(-1);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, title: newTitle });
    }
  };

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
      case "todo":
        return (
          <div key={block.id} className="flex items-start gap-2 mb-2">
            <input 
              type="checkbox" 
              checked={block.checked} 
              onChange={(e) => handleUpdateBlock(index, { ...block, checked: e.target.checked })}
              className="mt-1"
            />
            <Textarea
              value={block.content}
              onChange={(e) => handleUpdateBlock(index, { ...block, content: e.target.value })}
              className="w-full resize-none min-h-[40px] bg-transparent border-0 focus-visible:ring-0 p-0 text-base placeholder:text-muted-foreground"
              placeholder="To-do item..."
            />
          </div>
        );
      case "quote":
        return (
          <div key={block.id} className="border-l-4 border-muted pl-4 mb-4">
            <Textarea
              value={block.content}
              onChange={(e) => handleUpdateBlock(index, { ...block, content: e.target.value })}
              className="w-full resize-none min-h-[60px] bg-transparent border-0 focus-visible:ring-0 p-0 text-base italic placeholder:text-muted-foreground"
              placeholder="Quote text..."
            />
          </div>
        );
      case "divider":
        return <hr key={block.id} className="my-6" />;
      case "toggle":
        return (
          <div key={block.id} className="mb-4">
            <div className="flex items-center gap-2 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
              <Textarea
                value={block.content}
                onChange={(e) => handleUpdateBlock(index, { ...block, content: e.target.value })}
                className="w-full resize-none min-h-[40px] bg-transparent border-0 focus-visible:ring-0 p-0 text-base font-medium placeholder:text-muted-foreground"
                placeholder="Toggle heading..."
              />
            </div>
            <div className="pl-6 hidden">
              {/* Toggle content would be nested blocks */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleUpdateBlock = (index: number, updatedBlock: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const addNewBlock = (type: BlockType['type'], level: number = 1) => {
    const newBlock: BlockType = {
      id: `block-${Date.now()}`,
      type,
      content: "",
      level: type === "heading" ? level as 1 | 2 | 3 | 4 | 5 | 6 : undefined,
    };
    
    if (type === "todo") {
      newBlock.checked = false;
    }
    
    setBlocks([...blocks, newBlock]);
    setShowBlockMenu(false);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: [...blocks, newBlock] });
    }
  };

  const showBlockMenuAtPosition = (index: number) => {
    setMenuPosition(index);
    setShowBlockMenu(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {page.cover && (
        <div className="w-full h-48 rounded-lg mb-6 bg-cover bg-center" style={{ backgroundImage: `url(${page.cover})` }}>
          <div className="flex justify-end p-4">
            <Button variant="ghost" className="bg-background/80 hover:bg-background">
              Change Cover
            </Button>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {page.icon && <span className="text-2xl">{page.icon}</span>}
          {page.emoji && <span className="text-2xl">{page.emoji}</span>}
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="text-3xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        {blocks.map((block, index) => (
          <div 
            key={block.id}
            className="relative group" 
            onClick={() => menuPosition !== index && setShowBlockMenu(false)}
          >
            <div 
              className="absolute -left-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                showBlockMenuAtPosition(index);
              }}
            >
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {renderBlock(block, index)}
          </div>
        ))}
        
        <div className="pt-4">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => addNewBlock("paragraph")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a block
          </Button>
        </div>
      </div>
      
      {showBlockMenu && (
        <div className="fixed bg-background border rounded-md shadow-md p-2 z-50 w-48" style={{
          top: `${menuPosition * 40 + 100}px`,
          left: '100px'
        }}>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("heading", 1)}>
              <Type className="h-4 w-4 mr-2" />
              Heading
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("paragraph")}>
              <FileText className="h-4 w-4 mr-2" />
              Text
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("todo")}>
              <CheckSquare className="h-4 w-4 mr-2" />
              To-do
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("list")}>
              <ListOrdered className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("image")}>
              <FileImage className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("code")}>
              <Code className="h-4 w-4 mr-2" />
              Code
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("quote")}>
              <Quote className="h-4 w-4 mr-2" />
              Quote
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("divider")}>
              <SeparatorHorizontal className="h-4 w-4 mr-2" />
              Divider
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => addNewBlock("toggle")}>
              <ChevronRight className="h-4 w-4 mr-2" />
              Toggle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
