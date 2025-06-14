import { useState } from "react";
import { BlockType } from "../types";
import { 
  GripVertical, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  LayoutGrid,
  Plus,
  Search,
  ChevronDown,
  FileText,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table,
  Minus,
  Code,
  Image,
  Video,
  Music,
  FileIcon,
  Layout,
  FormInput,
  ExternalLink,
  Figma
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Function to generate a unique ID
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Define block categories for the column block popover
const columnBlockCategories = [
  {
    name: "Basic Blocks",
    blocks: [
      { type: 'paragraph', icon: FileText, label: 'Text' },
      { type: 'heading-1', icon: Type, label: 'H1 Heading' },
      { type: 'heading-2', icon: Type, label: 'H2 Heading' },
      { type: 'heading-3', icon: Type, label: 'H3 Heading' },
      { type: 'heading-4', icon: Type, label: 'H4 Heading' },
      { type: 'heading-5', icon: Type, label: 'H5 Heading' },
      { type: 'heading-6', icon: Type, label: 'H6 Heading' },
      { type: 'bullet-list', icon: List, label: 'Bullet List' },
      { type: 'number-list', icon: ListOrdered, label: 'Number List' },
      { type: 'to-do', icon: CheckSquare, label: 'To-do List' },
      { type: 'toggle', icon: List, label: 'Toggle List' },
      { type: 'quote', icon: Quote, label: 'Quote' },
      { type: 'divider', icon: Minus, label: 'Divider' },
      { type: 'code', icon: Code, label: 'Code' },
    ]
  },
  {
    name: "Media",
    blocks: [
      { type: 'image', icon: Image, label: 'Image' },
      { type: 'video', icon: Video, label: 'Video' },
      { type: 'audio', icon: Music, label: 'Audio' },
      { type: 'file', icon: FileIcon, label: 'File' },
    ]
  },
  {
    name: "Embeds",
    blocks: [
      { type: 'embed', icon: ExternalLink, label: 'Embed' },
      { type: 'figma', icon: Figma, label: 'Figma' },
    ]
  }
];

interface ColumnBlockProps {
  block: BlockType;
  onUpdate: (block: BlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onConvert: (type: BlockType['type']) => void;
  renderBlock: (block: BlockType, index: number, isNested: boolean) => React.ReactNode;
  handleAddBlock: (index: number, type: BlockType['type']) => void;
  handleUpdateBlock: (index: number, updatedBlock: BlockType) => void;
  handleDeleteBlock: (index: number) => void;
}

export default function ColumnBlock({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert,
  renderBlock,
  handleAddBlock,
  handleUpdateBlock,
  handleDeleteBlock
}: ColumnBlockProps) {
  const [gap, setGap] = useState<number>(block.gap || 16);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<Record<string, boolean>>({});
  
  // Determine number of columns based on block type
  const getColumnCount = () => {
    switch (block.type) {
      case 'two-columns': return 2;
      case 'three-columns': return 3;
      case 'four-columns': return 4;
      case 'five-columns': return 5;
      default: return 2;
    }
  };
  
  // Initialize columns if they don't exist
  if (!block.columns) {
    const columnCount = getColumnCount();
    const columns = Array(columnCount).fill(null).map(() => ({
      id: generateId(),
      blocks: []
    }));
    onUpdate({ ...block, columns, gap });
  }

  const handleGapChange = (value: number[]) => {
    const newGap = value[0];
    setGap(newGap);
    onUpdate({ ...block, gap: newGap });
  };

  const handleAddBlockToColumn = (columnIndex: number, type: BlockType['type'] = 'paragraph') => {
    if (!block.columns) return;
    
    const newBlock: BlockType = {
      id: generateId(),
      type,
      content: ''
    };
    
    const updatedColumns = [...block.columns];
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      blocks: [...(updatedColumns[columnIndex].blocks || []), newBlock]
    };
    
    onUpdate({ ...block, columns: updatedColumns });
    setIsPopoverOpen({ ...isPopoverOpen, [columnIndex]: false });
  };

  const handleUpdateColumnBlock = (columnIndex: number, blockIndex: number, updatedBlock: BlockType) => {
    if (!block.columns) return;
    
    const updatedColumns = [...block.columns];
    const columnBlocks = [...updatedColumns[columnIndex].blocks];
    columnBlocks[blockIndex] = updatedBlock;
    
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      blocks: columnBlocks
    };
    
    onUpdate({ ...block, columns: updatedColumns });
  };

  const handleDeleteColumnBlock = (columnIndex: number, blockIndex: number) => {
    if (!block.columns) return;
    
    const updatedColumns = [...block.columns];
    const columnBlocks = [...updatedColumns[columnIndex].blocks];
    columnBlocks.splice(blockIndex, 1);
    
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      blocks: columnBlocks
    };
    
    onUpdate({ ...block, columns: updatedColumns });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !block.columns) return;

    const sourceColumnId = result.source.droppableId;
    const destColumnId = result.destination.droppableId;
    const sourceColumnIndex = block.columns.findIndex(col => col.id === sourceColumnId);
    const destColumnIndex = block.columns.findIndex(col => col.id === destColumnId);
    
    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

    const updatedColumns = [...block.columns];
    const sourceBlocks = [...updatedColumns[sourceColumnIndex].blocks];
    const [movedBlock] = sourceBlocks.splice(result.source.index, 1);
    
    if (sourceColumnIndex === destColumnIndex) {
      // Moving within the same column
      sourceBlocks.splice(result.destination.index, 0, movedBlock);
      updatedColumns[sourceColumnIndex] = {
        ...updatedColumns[sourceColumnIndex],
        blocks: sourceBlocks
      };
    } else {
      // Moving between columns
      const destBlocks = [...updatedColumns[destColumnIndex].blocks];
      destBlocks.splice(result.destination.index, 0, movedBlock);
      
      updatedColumns[sourceColumnIndex] = {
        ...updatedColumns[sourceColumnIndex],
        blocks: sourceBlocks
      };
      
      updatedColumns[destColumnIndex] = {
        ...updatedColumns[destColumnIndex],
        blocks: destBlocks
      };
    }
    
    onUpdate({ ...block, columns: updatedColumns });
  };

  const BlockTypePopover = ({ onSelect, columnIndex }: { onSelect: (type: BlockType['type']) => void, columnIndex: number }) => {
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    
    return (
      <PopoverContent 
        align="start" 
        className="w-64 p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 border rounded-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Type to filter..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="flex-1 h-8 bg-transparent border-0 outline-none text-sm focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {columnBlockCategories.map((category) => {
              const filteredBlocks = category.blocks.filter(block =>
                block.label.toLowerCase().includes(localSearchQuery.toLowerCase())
              );
              
              if (filteredBlocks.length === 0) return null;
              
              return (
                <div key={category.name} className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground px-2">
                    {category.name}
                  </div>
                  {filteredBlocks.map((blockType) => (
                    <button
                      key={blockType.type}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/5 rounded-sm"
                      onClick={() => {
                        onSelect(blockType.type);
                        setLocalSearchQuery("");
                      }}
                    >
                      <blockType.icon className="h-4 w-4" />
                      {blockType.label}
                    </button>
                  ))}
                </div>
              );
            })}
            {!columnBlockCategories.some(category => 
              category.blocks.some(block => 
                block.label.toLowerCase().includes(localSearchQuery.toLowerCase())
              )
            ) && (
              <div className="text-sm text-muted-foreground text-center py-2">
                No blocks found
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    );
  };

  return (
    <div className="relative group w-full">
      <div className="flex items-center gap-4 group-hover:bg-accent/5 rounded-sm py-1.5 mb-2">
        <div className="flex-shrink-0 flex self-stretch opacity-0 group-hover:opacity-100 transition-opacity duration-100 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab">
                <GripVertical className="h-5 w-5 text-muted-foreground/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={2} align="start" className="w-[220px]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Convert to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <div className="flex items-center gap-2 px-2 py-1.5 border-b">
                    <Search className="h-4 w-4 text-muted-foreground/70" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 h-5 bg-transparent border-0 outline-none text-sm focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={onMoveUp} className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMoveDown} className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Move down
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="flex items-center gap-2 text-red-500 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Column Gap:</span>
            <div className="w-32">
              <Slider
                value={[gap]}
                min={0}
                max={48}
                step={4}
                onValueChange={handleGapChange}
              />
            </div>
            <span className="text-xs text-muted-foreground">{gap}px</span>
          </div>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div 
          className="flex w-full" 
          style={{ gap: `${gap}px` }}
        >
          {block.columns?.map((column, columnIndex) => (
            <div 
              key={column.id} 
              className="flex-1 min-w-0 border border-dashed border-gray-200 rounded-md p-2"
            >
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[100px] space-y-2"
                  >
                    {column.blocks?.map((columnBlock, blockIndex) => (
                      <Draggable key={columnBlock.id} draggableId={columnBlock.id} index={blockIndex}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative group"
                          >
                            {/* Render the actual block content */}
                            <div className="border border-transparent hover:border-gray-200 rounded-md p-1">
                              {renderBlock(columnBlock, blockIndex, true)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {column.blocks?.length === 0 ? (
                      // Center the Add Block button both vertically and horizontally when column is empty
                      <div className="flex items-center justify-center h-[60px]">
                        <Popover 
                          open={isPopoverOpen[columnIndex]} 
                          onOpenChange={(open) => setIsPopoverOpen({...isPopoverOpen, [columnIndex]: open})}
                        >
                          <PopoverTrigger asChild>
                            <button
                              className="group flex items-center gap-2 hover:opacity-70 transition-opacity"
                            >
                              <Plus className="h-5 w-5 text-blue-500" />
                              <span className="text-blue-500 text-sm font-medium">Add block</span>
                            </button>
                          </PopoverTrigger>
                          <BlockTypePopover 
                            columnIndex={columnIndex}
                            onSelect={(type) => handleAddBlockToColumn(columnIndex, type)}
                          />
                        </Popover>
                      </div>
                    ) : (
                      // Show Add Block button at the bottom when column has content
                      <div className="flex justify-center mt-3">
                        <Popover 
                          open={isPopoverOpen[columnIndex]} 
                          onOpenChange={(open) => setIsPopoverOpen({...isPopoverOpen, [columnIndex]: open})}
                        >
                          <PopoverTrigger asChild>
                            <button
                              className="group flex items-center gap-2 hover:opacity-70 transition-opacity"
                            >
                              <Plus className="h-4 w-4 text-blue-500" />
                              <span className="text-blue-500 text-xs font-medium">Add block</span>
                            </button>
                          </PopoverTrigger>
                          <BlockTypePopover 
                            columnIndex={columnIndex}
                            onSelect={(type) => handleAddBlockToColumn(columnIndex, type)}
                          />
                        </Popover>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
} 