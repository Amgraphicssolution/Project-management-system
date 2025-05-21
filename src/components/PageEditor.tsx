import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageType, BlockType } from "../types";
import HeadingBlock from "./HeadingBlock";
import { 
  FileImage, 
  Plus, 
  Type, 
  ListOrdered, 
  Code, 
  FileText, 
  CheckSquare, 
  Quote, 
  SeparatorHorizontal, 
  ChevronRight,
  GripVertical,
  Search,
  Image,
  Video,
  Music,
  File,
  LayoutGrid,
  Table,
  List,
  Columns2,
  Columns3,
  Link2,
  Figma
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";

interface PageEditorProps {
  page: PageType;
  onUpdatePage?: (updatedPage: PageType) => void;
}

const blockTypes = [
  {
    category: "Basic Blocks",
    blocks: [
      { type: "paragraph", icon: FileText, label: "Text" },
      { type: "heading-1", icon: Type, label: "H1 Heading" },
      { type: "heading-2", icon: Type, label: "H2 Heading" },
      { type: "heading-3", icon: Type, label: "H3 Heading" },
      { type: "heading-4", icon: Type, label: "H4 Heading" },
      { type: "heading-5", icon: Type, label: "H5 Heading" },
      { type: "heading-6", icon: Type, label: "H6 Heading" },
      { type: "bullet-list", icon: ListOrdered, label: "Bullet List" },
      { type: "number-list", icon: ListOrdered, label: "Number List" },
      { type: "to-do", icon: CheckSquare, label: "To-do List" },
      { type: "toggle", icon: ChevronRight, label: "Toggle List" },
      { type: "board", icon: LayoutGrid, label: "Board" },
      { type: "quote", icon: Quote, label: "Quote" },
      { type: "table", icon: Table, label: "Table" },
      { type: "divider", icon: SeparatorHorizontal, label: "Divider" }
    ]
  },
  {
    category: "Media",
    blocks: [
      { type: "image", icon: Image, label: "Image" },
      { type: "video", icon: Video, label: "Video" },
      { type: "audio", icon: Music, label: "Audio" },
      { type: "file", icon: File, label: "File" },
      { type: "code", icon: Code, label: "Code" }
    ]
  },
  {
    category: "Advanced Blocks",
    blocks: [
      { type: "form", icon: FileText, label: "Form" },
      { type: "table-of-contents", icon: List, label: "Table of Content" },
      { type: "two-columns", icon: Columns2, label: "2 Columns" },
      { type: "three-columns", icon: Columns3, label: "3 Columns" },
      { type: "four-columns", icon: Columns3, label: "4 Columns" },
      { type: "five-columns", icon: Columns3, label: "5 Columns" }
    ]
  },
  {
    category: "Embeds",
    blocks: [
      { type: "embed", icon: Link2, label: "Embed" },
      { type: "figma", icon: Figma, label: "Figma" },
      { type: "pdf", icon: FileText, label: "PDF" },
      { type: "adobe", icon: FileText, label: "Adobe" }
    ]
  }
];

export default function PageEditor({ page, onUpdatePage }: PageEditorProps) {
  const [blocks, setBlocks] = useState<BlockType[]>(page.blocks || []);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onUpdatePage) {
      onUpdatePage({
        ...page,
        blocks
      });
    }
  }, [blocks, onUpdatePage, page]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowBlockMenu(false);
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBlocks(items);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: items });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, block: BlockType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // For lists, create a new item of the same type
      if (block.type === 'number-list' || block.type === 'bullet-list') {
        const newBlock: BlockType = {
          id: `block-${Date.now()}`,
          type: block.type,
          content: ''
        };
        
        const newBlocks = [
          ...blocks.slice(0, index + 1),
          newBlock,
          ...blocks.slice(index + 1)
        ];
        
        setBlocks(newBlocks);
        if (onUpdatePage) {
          onUpdatePage({ ...page, blocks: newBlocks });
        }
      } else {
        // For other blocks, create a new paragraph
        const newBlock: BlockType = {
          id: `block-${Date.now()}`,
          type: 'paragraph',
          content: ''
        };
        
        const newBlocks = [
          ...blocks.slice(0, index + 1),
          newBlock,
          ...blocks.slice(index + 1)
        ];
        
        setBlocks(newBlocks);
        if (onUpdatePage) {
          onUpdatePage({ ...page, blocks: newBlocks });
        }
      }
    } else if (e.key === 'Backspace' && !block.content) {
      // If backspace is pressed on an empty block
      e.preventDefault();
      const newBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(newBlocks);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: newBlocks });
      }
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Get the click position relative to the editor
    const rect = editor.getBoundingClientRect();
    const y = e.clientY - rect.top + editor.scrollTop;

    // Find the closest block to the click position
    const blockElements = editor.querySelectorAll('[data-block]');
    let targetIndex = blocks.length; // Default to end of blocks

    for (let i = 0; i < blockElements.length; i++) {
      const blockRect = blockElements[i].getBoundingClientRect();
      const blockMiddle = blockRect.top + blockRect.height / 2;
      
      if (e.clientY < blockMiddle) {
        targetIndex = i;
        break;
      }
    }

    // Show block menu at click position
    showBlockMenuAtPosition(targetIndex - 1, {
      left: e.clientX,
      right: e.clientX,
      top: e.clientY,
      bottom: e.clientY,
      height: 0,
      width: 0,
      x: e.clientX,
      y: e.clientY,
      toJSON: () => {}
    });
  };

  const renderBlock = (block: BlockType, index: number) => {
    const isEmptyBlock = !block.content;
    const isFocused = activeInputIndex === index;
    const isHovered = hoveredLine === index;

    const blockContent = (
      <div className="flex-1 min-h-[24px] relative group/block">
        {(() => {
          switch (block.type) {
            case "heading-1":
            case "heading-2":
            case "heading-3":
            case "heading-4":
            case "heading-5":
            case "heading-6":
              const level = parseInt(block.type.split('-')[1]) as 1 | 2 | 3 | 4 | 5 | 6;
              return (
                <HeadingBlock
                  key={block.id}
                  content={block.content}
                  level={level}
                  editable
                  onChange={(content) => handleUpdateBlock(index, { ...block, content })}
                />
              );
            case "bullet-list":
              return (
                <div 
                  className="relative min-h-[24px] w-full pl-6"
                  onClick={() => setActiveInputIndex(index)}
                >
                  <div className="absolute left-1 top-2 w-1.5 h-1.5 rounded-full bg-foreground"></div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' })}
                    onKeyDown={(e) => handleKeyDown(e, index, block)}
                    className="outline-none w-full min-h-[24px] whitespace-pre-wrap break-words"
                    placeholder="List item"
                    data-empty={isEmptyBlock}
                  >
                    {block.content}
                  </div>
                </div>
              );
            case "number-list":
              return (
                <div 
                  className="relative min-h-[24px] w-full pl-6"
                  onClick={() => setActiveInputIndex(index)}
                >
                  <div className="absolute left-0 text-sm text-foreground">{index + 1}.</div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' })}
                    onKeyDown={(e) => handleKeyDown(e, index, block)}
                    className="outline-none w-full min-h-[24px] whitespace-pre-wrap break-words"
                    placeholder="List item"
                    data-empty={isEmptyBlock}
                  >
                    {block.content}
                  </div>
                </div>
              );
            case "to-do":
              return (
                <div 
                  className="relative min-h-[24px] w-full pl-6 flex items-start gap-2"
                  onClick={() => setActiveInputIndex(index)}
                >
                  <input
                    type="checkbox"
                    checked={block.checked}
                    onChange={(e) => handleUpdateBlock(index, { ...block, checked: e.target.checked })}
                    className="mt-1.5"
                  />
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' })}
                    onKeyDown={(e) => handleKeyDown(e, index, block)}
                    className={cn(
                      "outline-none w-full min-h-[24px] whitespace-pre-wrap break-words",
                      block.checked && "line-through text-muted-foreground"
                    )}
                    placeholder="To-do"
                    data-empty={isEmptyBlock}
                  >
                    {block.content}
                  </div>
                </div>
              );
            case "quote":
              return (
                <div 
                  className="relative min-h-[24px] w-full pl-4 border-l-4 border-foreground"
                  onClick={() => setActiveInputIndex(index)}
                >
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' })}
                    onKeyDown={(e) => handleKeyDown(e, index, block)}
                    className="outline-none w-full min-h-[24px] whitespace-pre-wrap break-words italic"
                    placeholder="Quote"
                    data-empty={isEmptyBlock}
                  >
                    {block.content}
                  </div>
                </div>
              );
            case "code":
              return (
                <div 
                  className="relative min-h-[24px] w-full font-mono bg-muted/50 rounded-md p-4"
                  onClick={() => setActiveInputIndex(index)}
                >
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' })}
                    onKeyDown={(e) => handleKeyDown(e, index, block)}
                    className="outline-none w-full min-h-[24px] whitespace-pre-wrap break-words"
                    placeholder="Code"
                    data-empty={isEmptyBlock}
                  >
                    {block.content}
                  </div>
                </div>
              );
            case "divider":
              return (
                <div className="py-4">
                  <hr className="border-border" />
                </div>
              );
            case "toggle":
              return (
                <div 
                  className="relative min-h-[24px] w-full"
                  onClick={() => setActiveInputIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateBlock(index, { ...block, checked: !block.checked });
                      }}
                      className="p-0.5 hover:bg-accent/10 rounded"
                    >
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        block.checked && "transform rotate-90"
                      )} />
                    </button>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' })}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      className="outline-none w-full min-h-[24px] whitespace-pre-wrap break-words"
                      placeholder="Toggle"
                      data-empty={isEmptyBlock}
                    >
                      {block.content}
                    </div>
                  </div>
                  {block.checked && block.children && (
                    <div className="pl-6 mt-1">
                      {block.children.map((child, childIndex) => renderBlock(child, `${index}-${childIndex}`))}
                    </div>
                  )}
                </div>
              );
            case "paragraph":
            default:
              return (
                <div 
                  className="relative min-h-[24px] w-full"
                  onClick={() => setActiveInputIndex(index)}
                >
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' })}
                    onKeyDown={(e) => handleKeyDown(e, index, block)}
                    className="outline-none w-full min-h-[24px] whitespace-pre-wrap break-words"
                    placeholder="Type '/' for commands"
                    data-empty={isEmptyBlock}
                  >
                    {block.content}
                  </div>
                  {isEmptyBlock && !isFocused && (
                    <div className="absolute top-0 left-0 text-muted-foreground pointer-events-none">
                      Type '/' for commands
                    </div>
                  )}
                </div>
              );
          }
        })()}
      </div>
    );

    return (
      <Draggable key={block.id} draggableId={block.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            data-block
            className="group relative"
          >
            <div className={cn(
              "flex items-start gap-2 py-1 px-2 -mx-2 rounded-sm",
              isFocused && "bg-accent/5"
            )}>
              <div className="flex items-center h-[1.5em] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                <div 
                  {...provided.dragHandleProps}
                  className="h-[20px] w-[20px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab"
                >
                  <GripVertical className="h-[14px] w-[14px] text-muted-foreground/50" />
                </div>
              </div>
              <div className="flex-1 min-h-[1.5em] outline-none">
                {blockContent}
              </div>
            </div>
            <AddBlockLine index={index} />
          </div>
        )}
      </Draggable>
    );
  };

  const handleUpdateBlock = (index: number, updatedBlock: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }

    // If the block is empty and it's not the last one, remove it
    if (!updatedBlock.content && blocks.length > 1 && index !== blocks.length - 1) {
      const filteredBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(filteredBlocks);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: filteredBlocks });
      }
    }

    // If we're at the end of a block and press Enter, create a new block
    if (updatedBlock.content.endsWith('\n')) {
      const newBlock = {
        id: `block-${Date.now()}`,
        type: 'paragraph',
        content: ''
      };
      const updatedBlocks = [
        ...blocks.slice(0, index + 1).map(b => 
          b.id === updatedBlock.id ? { ...b, content: b.content.slice(0, -1) } : b
        ),
        newBlock,
        ...blocks.slice(index + 1)
      ];
      setBlocks(updatedBlocks);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: updatedBlocks });
      }
    }
  };

  const addNewBlock = (type: BlockType['type']) => {
    const newBlock: BlockType = {
      id: `block-${Date.now()}`,
      type,
      content: "",
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(selectedBlockIndex + 1, 0, newBlock);
    
    setBlocks(newBlocks);
    setShowBlockMenu(false);
    setShowSearch(false);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
    
    setActiveInputIndex(newBlock.id);
  };

  const showBlockMenuAtPosition = (index: number, rect: DOMRect) => {
    const menuX = rect.left;
    const menuY = rect.bottom + window.scrollY;
    
    setSelectedBlockIndex(index);
    setMenuPosition({ x: menuX, y: menuY });
    setShowBlockMenu(true);
    setShowSearch(true);
  };

  const EmptyState = () => (
    <div className="py-4 px-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            showBlockMenuAtPosition(-1, rect);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <div 
          className="flex-1 text-sm text-muted-foreground cursor-text"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            showBlockMenuAtPosition(-1, rect);
          }}
        >
          <div className="px-3 py-1 rounded hover:bg-accent/5">
            Write, press 'space' for AI, '/' for commands...
          </div>
        </div>
      </div>
    </div>
  );

  const AddBlockLine = ({ index }: { index: number }) => {
    const isActive = activeInputIndex === index;
    const isHovered = hoveredLine === index;
    
    return (
      <div 
        className={cn(
          "group relative h-[24px] -mx-2 px-2",
          isActive && "h-[42px]"
        )}
        onMouseEnter={() => setHoveredLine(index)}
        onMouseLeave={() => setHoveredLine(null)}
        onClick={() => setActiveInputIndex(index)}
      >
        <div className={cn(
          "absolute inset-0 flex items-center opacity-0 transition-opacity duration-100",
          (isHovered || isActive) && "opacity-100"
        )}>
          <div className="flex items-center">
            <div className="h-[20px] w-[20px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab">
              <GripVertical className="h-[14px] w-[14px] text-muted-foreground/50" />
            </div>
            <div className="h-[20px] w-[20px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-pointer">
              <Plus className="h-[14px] w-[14px] text-muted-foreground/50" />
            </div>
          </div>
          {!isActive && (
            <div className="h-[2px] flex-1 mx-1 bg-primary/5" />
          )}
        </div>

        {isActive && (
          <div 
            className="absolute left-10 right-2 top-1/2 -translate-y-1/2"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              showBlockMenuAtPosition(index, rect);
            }}
          >
            <div className="px-3 py-2 rounded-sm bg-background/80 backdrop-blur-sm border border-border/40 cursor-text text-sm text-muted-foreground">
              Type '/' for commands
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={editorRef}
      className="max-w-3xl mx-auto px-8 py-10 min-h-screen"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setActiveInputIndex(null);
        }
      }}
    >
      <div className="space-y-1">
        <AddBlockLine index={-1} />
      </div>
      
      <div className="mt-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {blocks.map((block, index) => (
                  <div key={block.id}>
                    {renderBlock(block, index)}
                  </div>
                ))}
                {provided.placeholder}
                {!blocks.length && (
                  <div className="text-muted-foreground/60 text-lg">
                    Type '/' for commands
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      {showBlockMenu && (
        <div 
          ref={menuRef}
          className="fixed bg-background/80 backdrop-blur-sm border border-border/40 rounded-md shadow-lg z-50 w-64 flex flex-col overflow-hidden" 
          style={{
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            maxHeight: '320px'
          }}
        >
          <div className="p-2 border-b border-border/40">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                placeholder="Search for a block..."
                className="pl-8 h-8 bg-accent/5 border-0 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-accent">
            {blockTypes
              .filter(category => 
                category.blocks.some(block => 
                  block.label.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map(category => (
                <div key={category.category} className="py-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground/70">
                    {category.category}
                  </div>
                  <div>
                    {category.blocks
                      .filter(block => 
                        block.label.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          className="w-full text-sm px-2 py-1 hover:bg-accent/5 flex items-center text-left"
                          onClick={() => {
                            addNewBlock(type);
                            setShowBlockMenu(false);
                          }}
                        >
                          <Icon className="h-4 w-4 mr-2 text-muted-foreground/70" />
                          {label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
