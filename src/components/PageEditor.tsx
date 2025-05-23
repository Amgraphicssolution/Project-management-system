import { useState } from "react";
import { PageType, BlockType } from "../types";
import { 
  Plus, 
  GripVertical, 
  Copy, 
  Trash2, 
  FileText, 
  Type, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Search,
  List,
  Table,
  Minus,
  Video,
  Music,
  File as FileIcon,
  Layout,
  FormInput,
  ListTree,
  ExternalLink,
  Figma,
  FileDigit,
  ChevronRight,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  LayoutGrid
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
import { Input } from "@/components/ui/input";
import { LucideIcon } from 'lucide-react';

interface PageEditorProps {
  page: PageType;
  onUpdatePage?: (updatedPage: PageType) => void;
}

interface BlockCategoryType {
  name: string;
  blocks: {
    type: BlockType['type'];
    icon: LucideIcon;
    label: string;
  }[];
}

const blockCategories: BlockCategoryType[] = [
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
      { type: 'board', icon: Layout, label: 'Board' },
      { type: 'quote', icon: Quote, label: 'Quote' },
      { type: 'table', icon: Table, label: 'Table' },
      { type: 'divider', icon: Minus, label: 'Divider' },
    ]
  },
  {
    name: "Media",
    blocks: [
      { type: 'image', icon: Image, label: 'Image' },
      { type: 'video', icon: Video, label: 'Video' },
      { type: 'audio', icon: Music, label: 'Audio' },
      { type: 'file', icon: FileIcon, label: 'File' },
      { type: 'code', icon: Code, label: 'Code' },
    ]
  },
  {
    name: "Advanced Blocks",
    blocks: [
      { type: 'form', icon: FormInput, label: 'Form' },
      { type: 'table-of-contents', icon: ListTree, label: 'Table of Content' },
      { type: 'two-columns', icon: Layout, label: '2 Column' },
      { type: 'three-columns', icon: Layout, label: '3 Column' },
      { type: 'four-columns', icon: Layout, label: '4 Column' },
      { type: 'five-columns', icon: Layout, label: '5 Column' },
    ]
  },
  {
    name: "Embeds",
    blocks: [
      { type: 'embed', icon: ExternalLink, label: 'Embed' },
      { type: 'figma', icon: Figma, label: 'Figma' },
      { type: 'pdf', icon: FileDigit, label: 'PDF' },
      { type: 'adobe', icon: FileIcon, label: 'Adobe' },
    ]
  }
];

export default function PageEditor({ page, onUpdatePage }: PageEditorProps) {
  const [blocks, setBlocks] = useState<BlockType[]>(page.blocks || []);
  const [hoveredLine, setHoveredLine] = useState<number | string | null>(null);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleUpdateBlock = (index: number, updatedBlock: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, block: BlockType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
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
      setActiveInputIndex(index + 1);
      setShowPlaceholder(true);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: newBlocks });
      }
    } else if (e.key === 'Backspace' && !block.content) {
      e.preventDefault();
      const newBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(newBlocks);
      setActiveInputIndex(index > 0 ? index - 1 : null);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: newBlocks });
      }
    }
  };

  const handleAddBlock = (index: number, type: BlockType['type'] = 'paragraph') => {
    const newBlock: BlockType = {
      id: `block-${Date.now()}`,
      type,
      content: ''
    };

    let newBlocks;
    if (index === -1) {
      newBlocks = [newBlock];
    } else {
      newBlocks = [
        ...blocks.slice(0, index + 1),
        newBlock,
        ...blocks.slice(index + 1)
      ];
    }
    
    setBlocks(newBlocks);
    setActiveInputIndex(index === -1 ? 0 : index + 1);
    setShowPlaceholder(true);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }

    // Focus the new block
    requestAnimationFrame(() => {
      const contentEditableDiv = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable="true"]`);
      if (contentEditableDiv instanceof HTMLElement) {
        contentEditableDiv.focus();
      }
    });
  };

  const handleDuplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index];
    const duplicatedBlock: BlockType = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`
    };
    
    const newBlocks = [
      ...blocks.slice(0, index + 1),
      duplicatedBlock,
      ...blocks.slice(index + 1)
    ];
    
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const handleDeleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const handleConvertBlock = (index: number, newType: BlockType['type']) => {
    const newBlocks = blocks.map((block, i) => 
      i === index ? { ...block, type: newType } : block
    );
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

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

  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const handleMoveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const BlockTypePopover = ({ onSelect }: { onSelect: (type: BlockType['type']) => void }) => {
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
            {blockCategories.map((category) => {
              const filteredBlocks = category.blocks.filter(block =>
                block.label.toLowerCase().includes(localSearchQuery.toLowerCase())
              );
              
              if (filteredBlocks.length === 0) return null;
              
              return (
                <div key={category.name} className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground px-2">
                    {category.name}
                  </div>
                  {filteredBlocks.map((block) => (
                    <button
                      key={block.type}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/5 rounded-sm"
                      onClick={() => {
                        onSelect(block.type);
                        setLocalSearchQuery("");
                      }}
                    >
                      <block.icon className="h-4 w-4" />
                      {block.label}
                    </button>
                  ))}
                </div>
              );
            })}
            {!blockCategories.some(category => 
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
    <div className="max-w-3xl mx-auto px-8 py-10 min-h-screen">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-1"
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      data-block-id={block.id}
                      className="relative group"
                    >
                      {/* Main Block */}
                      <div className="flex items-start gap-2 py-1 px-2 rounded-sm group-hover:bg-accent/5">
                        <div className="flex items-center h-[1.5em] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div 
                                {...provided.dragHandleProps}
                                className="h-[24px] w-[24px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab"
                              >
                                <GripVertical className="h-[16px] w-[16px] text-muted-foreground/50" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[160px]">
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
                                  <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                                    {blockCategories.map((category) => {
                                      const filteredBlocks = category.blocks.filter(block =>
                                        block.label.toLowerCase().includes(searchQuery.toLowerCase())
                                      );
                                      
                                      if (filteredBlocks.length === 0) return null;
                                      
                                      return (
                                        <div key={category.name}>
                                          <DropdownMenuItem disabled className="opacity-50 pointer-events-none px-2">
                                            {category.name}
                                          </DropdownMenuItem>
                                          {filteredBlocks.map((blockType) => (
                                            <DropdownMenuItem 
                                              key={blockType.type}
                                              className="flex items-center gap-2 px-2"
                                              onClick={() => handleConvertBlock(index, blockType.type)}
                                            >
                                              <blockType.icon className="h-4 w-4 shrink-0" />
                                              <span className="truncate">{blockType.label}</span>
                                            </DropdownMenuItem>
                                          ))}
                                          <DropdownMenuSeparator className="mx-2" />
                                        </div>
                                      );
                                    })}
                                    {!blockCategories.some(category => 
                                      category.blocks.some(block => 
                                        block.label.toLowerCase().includes(searchQuery.toLowerCase())
                                      )
                                    ) && (
                                      <div className="text-sm text-muted-foreground text-center py-2">
                                        No blocks found
                                      </div>
                                    )}
                                  </div>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem onClick={() => handleMoveBlockUp(index)} className="flex items-center gap-2">
                                <ArrowUp className="h-4 w-4" />
                                Move up
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteBlock(index)} className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMoveBlockDown(index)} className="flex items-center gap-2">
                                <ArrowDown className="h-4 w-4" />
                                Move down
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <input
                          type="text"
                          value={block.content || ''}
                          onChange={(e) => handleUpdateBlock(index, { ...block, content: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, index, block)}
                          placeholder="Type here..."
                          className="flex-1 bg-transparent border-none outline-none min-h-[24px] whitespace-pre-wrap break-words px-3 text-base placeholder:text-muted-foreground"
                          autoFocus={activeInputIndex === index}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Add Block Button */}
              {blocks.length > 0 && (
                <div className="flex justify-start !mt-4 px-2 add-blocks-button">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="group flex items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        <Plus className="h-5 w-5 text-blue-500" />
                        <span className="text-blue-500 text-sm font-medium">add blocks</span>
                      </button>
                    </PopoverTrigger>
                    <BlockTypePopover 
                      onSelect={(type) => handleAddBlock(blocks.length - 1, type)}
                    />
                  </Popover>
                </div>
              )}
              
              {blocks.length === 0 && (
                <div className="flex items-start gap-2 py-1 px-2 rounded-sm hover:bg-accent/5">
                  <div className="flex items-center h-[1.5em] mt-0.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="h-[24px] w-[24px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab">
                          <GripVertical className="h-[16px] w-[16px] text-muted-foreground/50" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[160px]">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Convert to
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-[220px]">
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
                            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                              {blockCategories.map((category) => {
                                const filteredBlocks = category.blocks.filter(block =>
                                  block.label.toLowerCase().includes(searchQuery.toLowerCase())
                                );
                                
                                if (filteredBlocks.length === 0) return null;
                                
                                return (
                                  <div key={category.name}>
                                    <DropdownMenuItem disabled className="opacity-50 pointer-events-none px-2">
                                      {category.name}
                                    </DropdownMenuItem>
                                    {filteredBlocks.map((blockType) => (
                                      <DropdownMenuItem 
                                        key={blockType.type}
                                        className="flex items-center gap-2 px-2"
                                        onClick={() => handleConvertBlock(-1, blockType.type)}
                                      >
                                        <blockType.icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{blockType.label}</span>
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator className="mx-2" />
                                  </div>
                                );
                              })}
                              {!blockCategories.some(category => 
                                category.blocks.some(block => 
                                  block.label.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                              ) && (
                                <div className="text-sm text-muted-foreground text-center py-2">
                                  No blocks found
                                </div>
                              )}
                            </div>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleMoveBlockUp(-1)} className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4" />
                          Move up
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteBlock(-1)} className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMoveBlockDown(-1)} className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4" />
                          Move down
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="h-[24px] w-[24px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-pointer"
                        >
                          <Plus className="h-[16px] w-[16px] text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <BlockTypePopover 
                        onSelect={(type) => handleAddBlock(-1, type)}
                      />
                    </Popover>
                  </div>
                  <input
                    type="text"
                    placeholder="Type here..."
                    className="flex-1 bg-transparent border-none outline-none min-h-[24px] whitespace-pre-wrap break-words px-3 text-base placeholder:text-muted-foreground"
                    onChange={(e) => handleAddBlock(-1, 'paragraph')}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
