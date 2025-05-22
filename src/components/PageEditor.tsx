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
  FileDigit
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
      { type: 'to-do', icon: List, label: 'To-do List' },
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
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
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

    if (!updatedBlock.content && blocks.length > 1 && index !== blocks.length - 1) {
      const filteredBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(filteredBlocks);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: filteredBlocks });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, block: BlockType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowPlaceholder(false);
      
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
    } else if (e.key === 'Backspace' && !block.content) {
      e.preventDefault();
      setShowPlaceholder(false);
      const newBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(newBlocks);
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
    
    const newBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1)
    ];
    
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
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

  const BlockTypePopover = ({ onSelect }: { onSelect: (type: BlockType['type']) => void }) => (
    <PopoverContent 
      align="start" 
      className="w-64 p-2" 
      onOpenAutoFocus={(e) => e.preventDefault()}
      onInteractOutside={(e) => {
        if (isPopoverOpen) {
          e.preventDefault();
        }
      }}
    >
      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-2 py-1 border rounded-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type to filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-8 bg-transparent border-0 outline-none text-sm focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                e.preventDefault();
              }
            }}
            autoFocus
          />
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {blockCategories.map((category) => {
            const filteredBlocks = category.blocks.filter(block =>
              block.label.toLowerCase().includes(searchQuery.toLowerCase())
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(block.type as BlockType['type']);
                      setSearchQuery("");
                      setIsPopoverOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
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
              block.label.toLowerCase().includes(searchQuery.toLowerCase())
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
                      className="group relative"
                      onMouseEnter={() => setHoveredLine(index)}
                      onMouseLeave={() => setHoveredLine(null)}
                    >
                      <div className="flex items-start gap-2 py-1 px-2 rounded-sm">
                        <div className={`flex items-center h-[1.5em] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ${hoveredLine === index ? 'opacity-100' : ''}`}>
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
                                <DropdownMenuSubTrigger>
                                  Convert to
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {blockCategories.map((category) => (
                                    <div key={category.name}>
                                      <DropdownMenuItem disabled className="font-medium">
                                        {category.name}
                                      </DropdownMenuItem>
                                      {category.blocks.map((blockType) => (
                                        <DropdownMenuItem 
                                          key={blockType.type}
                                          onClick={() => handleConvertBlock(index, blockType.type)}
                                        >
                                          <blockType.icon className="h-4 w-4 mr-2" />
                                          {blockType.label}
                                        </DropdownMenuItem>
                                      ))}
                                      <DropdownMenuSeparator />
                                    </div>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem onClick={() => handleMoveBlockUp(index)}>
                                Move up
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteBlock(index)}>
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMoveBlockDown(index)}>
                                Move down
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                              <button
                                className="h-[24px] w-[24px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-pointer"
                              >
                                <Plus className="h-[16px] w-[16px] text-muted-foreground" />
                              </button>
                            </PopoverTrigger>
                            <BlockTypePopover 
                              onSelect={(type) => {
                                const newBlock: BlockType = {
                                  id: `block-${Date.now()}`,
                                  type: type,
                                  content: ''
                                };
                                setBlocks([newBlock]);
                                setShowPlaceholder(true);
                                setActiveInputIndex(0);
                                if (onUpdatePage) {
                                  onUpdatePage({ ...page, blocks: [newBlock] });
                                }
                              }} 
                            />
                          </Popover>
                        </div>
                        <div className="flex-1 min-h-[1.5em] outline-none">
                          <div 
                            className="relative min-h-[24px] w-full"
                            onClick={() => {
                              setActiveInputIndex(index);
                              if (!block.content) {
                                setShowPlaceholder(true);
                              }
                            }}
                          >
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                handleUpdateBlock(index, { ...block, content: e.currentTarget.textContent || '' });
                                setShowPlaceholder(false);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, index, block)}
                              onInput={() => setShowPlaceholder(false)}
                              className="outline-none w-full min-h-[24px] whitespace-pre-wrap break-words"
                            >
                              {block.content}
                            </div>
                            {!block.content && activeInputIndex === index && showPlaceholder && (
                              <div className="absolute top-0 left-0 text-muted-foreground pointer-events-none">
                                Write, press 'space' for AI, '/' for commands...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {blocks.length === 0 && (
                <div 
                  className="group relative"
                  onMouseEnter={() => setHoveredLine(-1)}
                  onMouseLeave={() => setHoveredLine(null)}
                >
                  <div className="flex items-start gap-2 py-1 px-2 rounded-sm">
                    <div className={`flex items-center h-[1.5em] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ${hoveredLine === -1 ? 'opacity-100' : ''}`}>
                      <div className="h-[24px] w-[24px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab">
                        <GripVertical className="h-[16px] w-[16px] text-muted-foreground/50" />
                      </div>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            className="h-[24px] w-[24px] flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-pointer"
                          >
                            <Plus className="h-[16px] w-[16px] text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <BlockTypePopover 
                          onSelect={(type) => {
                            const newBlock: BlockType = {
                              id: `block-${Date.now()}`,
                              type: type,
                              content: ''
                            };
                            setBlocks([newBlock]);
                            setShowPlaceholder(true);
                            setActiveInputIndex(0);
                            if (onUpdatePage) {
                              onUpdatePage({ ...page, blocks: [newBlock] });
                            }
                          }} 
                        />
                      </Popover>
                    </div>
                    <div 
                      className="flex-1 text-sm cursor-text"
                      onClick={() => {
                        const newBlock: BlockType = {
                          id: `block-${Date.now()}`,
                          type: 'paragraph',
                          content: ''
                        };
                        setBlocks([newBlock]);
                        setShowPlaceholder(true);
                        setActiveInputIndex(0);
                        if (onUpdatePage) {
                          onUpdatePage({ ...page, blocks: [newBlock] });
                        }
                      }}
                    >
                      <div className="px-3 py-1 rounded hover:bg-accent/5" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
