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
  LayoutGrid,
  Check,
  ChevronDown
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
import TableBlock from './TableBlock';
import ImageBlock from './ImageBlock';

interface ListItem {
  id: string;
  content: string;
  checked?: boolean;
}

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
  const [expandedToggles, setExpandedToggles] = useState<Set<string>>(new Set());
  const [activeListItemId, setActiveListItemId] = useState<string | null>(null);

  const handleUpdateBlock = (index: number, updatedBlock: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const handleMoveNestedBlockUp = (parentIndex: number, blockIndex: number) => {
    if (blockIndex === 0) return;
    const newBlocks = [...blocks];
    const parentBlock = newBlocks[parentIndex];
    if (parentBlock.children) {
      [parentBlock.children[blockIndex - 1], parentBlock.children[blockIndex]] = 
      [parentBlock.children[blockIndex], parentBlock.children[blockIndex - 1]];
      setBlocks(newBlocks);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: newBlocks });
      }
    }
  };

  const handleMoveNestedBlockDown = (parentIndex: number, blockIndex: number) => {
    const parentBlock = blocks[parentIndex];
    if (!parentBlock.children || blockIndex === parentBlock.children.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[parentIndex].children![blockIndex], newBlocks[parentIndex].children![blockIndex + 1]] = 
    [newBlocks[parentIndex].children![blockIndex + 1], newBlocks[parentIndex].children![blockIndex]];
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, block: BlockType, itemIndex?: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (isListType(block.type)) {
        // Add new item to the list
        const newBlocks = [...blocks];
        let targetBlock: BlockType;
        let targetIndex: number;

        if (block.parentId) {
          // Handle nested list
          const parentIndex = blocks.findIndex(b => b.id === block.parentId);
          if (parentIndex !== -1) {
            const parentBlock = newBlocks[parentIndex];
            if (parentBlock.children) {
              const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
              targetBlock = parentBlock.children[blockIndex];
              targetIndex = blockIndex;
            }
          }
        } else {
          // Handle top-level list
          targetBlock = newBlocks[index];
          targetIndex = index;
        }

        if (targetBlock) {
          const listItems = targetBlock.listItems || [];
          
          // Initialize list items if empty
          if (listItems.length === 0) {
            listItems.push({
              id: targetBlock.id,
              content: targetBlock.content || '',
              checked: targetBlock.type === 'to-do' ? false : undefined
            });
          }

          // Add new empty item
          const newItemId = `item-${Date.now()}`;
          listItems.push({
            id: newItemId,
            content: '',
            checked: targetBlock.type === 'to-do' ? false : undefined
          });

          if (block.parentId) {
            // Update nested block
            const parentIndex = blocks.findIndex(b => b.id === block.parentId);
            if (parentIndex !== -1 && newBlocks[parentIndex].children) {
              const blockIndex = newBlocks[parentIndex].children!.findIndex(b => b.id === block.id);
              newBlocks[parentIndex].children![blockIndex] = {
                ...targetBlock,
                listItems,
                items: listItems.map(item => item.content)
              };
            }
          } else {
            // Update top-level block
            newBlocks[index] = {
              ...targetBlock,
              listItems,
              items: listItems.map(item => item.content)
            };
          }

          setBlocks(newBlocks);
          setActiveListItemId(newItemId);
          
          if (onUpdatePage) {
            onUpdatePage({ ...page, blocks: newBlocks });
          }
        }
      } else {
        // Regular block behavior
      const newBlock: BlockType = {
        id: `block-${Date.now()}`,
          type: block.type,
        content: ''
      };
      
        // If this is a nested block in a toggle list
        if (block.parentId) {
          const parentIndex = blocks.findIndex(b => b.id === block.parentId);
          if (parentIndex !== -1) {
            const newBlocks = [...blocks];
            const parentBlock = newBlocks[parentIndex];
            if (!parentBlock.children) parentBlock.children = [];
            const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
            parentBlock.children.splice(blockIndex + 1, 0, newBlock);
            setBlocks(newBlocks);
            if (onUpdatePage) {
              onUpdatePage({ ...page, blocks: newBlocks });
            }
            return;
          }
        }
        
        // Regular block addition
      const newBlocks = [
        ...blocks.slice(0, index + 1),
        newBlock,
        ...blocks.slice(index + 1)
      ];
      
      setBlocks(newBlocks);
        setActiveInputIndex(index + 1);
        setActiveListItemId(null);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: newBlocks });
        }
      }
    } else if (e.key === 'Backspace') {
      if (isListType(block.type)) {
        const listItems = block.listItems || [];
        const currentItem = listItems[itemIndex || 0];
        
        if (!currentItem.content) {
          e.preventDefault();
          
          const newBlocks = [...blocks];
          let targetBlock: BlockType;
          let parentIndex: number = -1;
          let blockIndex: number = -1;

          if (block.parentId) {
            // Handle nested list
            parentIndex = blocks.findIndex(b => b.id === block.parentId);
            if (parentIndex !== -1) {
              const parentBlock = newBlocks[parentIndex];
              if (parentBlock.children) {
                blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
                targetBlock = parentBlock.children[blockIndex];
              }
            }
          } else {
            // Handle top-level list
            targetBlock = newBlocks[index];
            blockIndex = index;
          }

          if (targetBlock) {
            const newListItems = [...listItems];
            newListItems.splice(itemIndex || 0, 1);

            // If this was the last or only item in the list
            if (newListItems.length === 0) {
              if (block.parentId) {
                // Remove the nested block entirely
                if (parentIndex !== -1 && blockIndex !== -1) {
                  newBlocks[parentIndex].children?.splice(blockIndex, 1);
                }
              } else {
                // Convert to paragraph or remove the block
                if (block.type === 'toggle' && targetBlock.children?.length) {
                  // If it's a toggle with children, convert to paragraph
                  newBlocks[index] = {
                    ...targetBlock,
                    type: 'paragraph',
                    content: '',
                    listItems: undefined,
                    items: undefined
                  };
                } else {
                  // Remove the block entirely
                  newBlocks.splice(index, 1);
                }
              }
            } else {
              // Update the block with remaining items
              const updatedBlock = {
                ...targetBlock,
                listItems: newListItems,
                items: newListItems.map(item => item.content)
              };

              if (block.parentId) {
                if (parentIndex !== -1 && blockIndex !== -1) {
                  newBlocks[parentIndex].children![blockIndex] = updatedBlock;
                }
              } else {
                newBlocks[index] = updatedBlock;
              }
            }

            setBlocks(newBlocks);
            if (newListItems.length > 0) {
              setActiveListItemId(newListItems[Math.max(0, (itemIndex || 1) - 1)].id);
            }
            if (onUpdatePage) {
              onUpdatePage({ ...page, blocks: newBlocks });
            }
          }
        }
      } else if (!block.content) {
      e.preventDefault();
        // Regular block deletion
        if (block.parentId) {
          // If this is a nested block in a toggle list
          const parentIndex = blocks.findIndex(b => b.id === block.parentId);
          if (parentIndex !== -1) {
            const newBlocks = [...blocks];
            const parentBlock = newBlocks[parentIndex];
            if (parentBlock.children) {
              const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
              parentBlock.children.splice(blockIndex, 1);
      setBlocks(newBlocks);
      if (onUpdatePage) {
        onUpdatePage({ ...page, blocks: newBlocks });
      }
            }
            return;
          }
        }
        
        // Regular block deletion
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
        setActiveInputIndex(index > 0 ? index - 1 : null);
        if (onUpdatePage) {
          onUpdatePage({ ...page, blocks: newBlocks });
        }
      }
    }
  };

  const isListType = (type: string) => {
    return ['bullet-list', 'number-list', 'to-do', 'toggle'].includes(type);
  };

  const handleAddNestedBlock = (parentIndex: number, type: BlockType['type'] = 'paragraph') => {
    const newBlock: BlockType = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      parentId: blocks[parentIndex].id // Add parent reference
    };

    const newBlocks = [...blocks];
    if (!newBlocks[parentIndex].children) {
      newBlocks[parentIndex].children = [];
    }
    newBlocks[parentIndex].children?.push(newBlock);
    setBlocks(newBlocks);
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }
  };

  const renderBlock = (block: BlockType, index: number | string, isNested: boolean = false) => {
    const numericIndex = typeof index === 'string' ? parseInt(index) : index;
    
    if (block.type === 'table') {
      return (
        <div className="relative group">
          <div className="flex items-start gap-4 group-hover:bg-accent/5 rounded-sm">
            <div className="flex-shrink-0 flex items-center self-stretch opacity-0 group-hover:opacity-100 transition-opacity duration-100 pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab">
                    <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={2} align="start" className="w-[160px]">
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
                                  onClick={() => handleConvertBlock(numericIndex, blockType.type)}
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
                  {!isNested && (
                    <>
                      <DropdownMenuItem onClick={() => handleMoveBlockUp(numericIndex)} className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4" />
                        Move up
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMoveBlockDown(numericIndex)} className="flex items-center gap-2">
                        <ArrowDown className="h-4 w-4" />
                        Move down
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteBlock(numericIndex)} className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1 min-h-[32px]">
              <TableBlock
                key={block.id}
                block={block}
                onUpdate={updatedBlock => handleUpdateBlock(numericIndex, updatedBlock)}
                onDelete={() => handleDeleteBlock(numericIndex)}
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (block.type === 'image') {
      return (
        <div className="relative group">
          <ImageBlock
            key={block.id}
            block={block}
            onUpdate={updatedBlock => handleUpdateBlock(numericIndex, updatedBlock)}
            onDelete={() => handleDeleteBlock(numericIndex)}
            onMoveUp={() => handleMoveBlockUp(numericIndex)}
            onMoveDown={() => handleMoveBlockDown(numericIndex)}
            onConvert={(newType) => handleConvertBlock(numericIndex, newType)}
          />
        </div>
      );
    }

    return (
      <div className="relative group">
        <div className="flex items-center group-hover:bg-accent/5 rounded-sm">
          <div className="flex-shrink-0 flex items-center self-stretch opacity-0 group-hover:opacity-100 transition-opacity duration-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab">
                  <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={2} align="start" className="w-[160px]">
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
                                onClick={() => handleConvertBlock(numericIndex, blockType.type)}
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
                {!isNested && (
                  <>
                    <DropdownMenuItem onClick={() => handleMoveBlockUp(numericIndex)} className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Move up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMoveBlockDown(numericIndex)} className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      Move down
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateBlock(numericIndex)} className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteBlock(numericIndex)} className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 min-h-[32px]">
            {block.type === 'divider' ? (
              <div className="flex items-center px-3 py-2">
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>
            ) : block.type === 'quote' ? (
              <div className="flex gap-3 py-1">
                <div className="w-1 bg-gray-200 rounded-full flex-shrink-0" />
                <input
                  type="text"
                  value={block.content || ''}
                  onChange={(e) => {
                    if (isNested && block.parentId) {
                      const parentIndex = blocks.findIndex(b => b.id === block.parentId);
                      if (parentIndex !== -1) {
                        const newBlocks = [...blocks];
                        const parentBlock = newBlocks[parentIndex];
                        if (parentBlock.children) {
                          const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
                          parentBlock.children[blockIndex] = {
                            ...block,
                            content: e.target.value
                          };
                          setBlocks(newBlocks);
                          if (onUpdatePage) {
                            onUpdatePage({ ...page, blocks: newBlocks });
                          }
                        }
                      }
                    } else {
                      handleUpdateBlock(numericIndex, { 
                        ...block, 
                        content: e.target.value 
                      });
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, numericIndex, block)}
                  placeholder={getPlaceholderForType(block.type)}
                  className={getClassNameForType(block.type)}
                  autoFocus={activeInputIndex === numericIndex}
                />
              </div>
            ) : isListType(block.type) ? (
              renderListItems(block, numericIndex, isNested)
            ) : (
              <input
                type="text"
                value={block.content || ''}
                onChange={(e) => {
                  if (isNested && block.parentId) {
                    const parentIndex = blocks.findIndex(b => b.id === block.parentId);
                    if (parentIndex !== -1) {
                      const newBlocks = [...blocks];
                      const parentBlock = newBlocks[parentIndex];
                      if (parentBlock.children) {
                        const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
                        parentBlock.children[blockIndex] = {
                          ...block,
                          content: e.target.value
                        };
                        setBlocks(newBlocks);
                        if (onUpdatePage) {
                          onUpdatePage({ ...page, blocks: newBlocks });
                        }
                      }
                    }
                  } else {
                    handleUpdateBlock(numericIndex, { 
                      ...block, 
                      content: e.target.value 
                    });
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, numericIndex, block)}
                placeholder={getPlaceholderForType(block.type)}
                className={getClassNameForType(block.type)}
                autoFocus={activeInputIndex === numericIndex}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderListItems = (block: BlockType, index: number, isNested: boolean = false) => {
    const listItems = block.listItems || [{
      id: block.id,
      content: block.content,
      checked: block.type === 'to-do' ? block.checked : undefined
    }];

    if (block.type === 'toggle') {
      const isExpanded = expandedToggles.has(block.id);
      
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedToggles);
                if (isExpanded) {
                  newExpanded.delete(block.id);
                } else {
                  newExpanded.add(block.id);
                }
                setExpandedToggles(newExpanded);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <input
              type="text"
              value={listItems[0].content}
              onChange={(e) => {
                const newBlocks = [...blocks];
                if (isNested && block.parentId) {
                  const parentIndex = blocks.findIndex(b => b.id === block.parentId);
                  if (parentIndex !== -1) {
                    const parentBlock = newBlocks[parentIndex];
                    if (parentBlock.children) {
                      const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
                      const listItems = [...(parentBlock.children[blockIndex].listItems || [])];
                      listItems[0] = { ...listItems[0], content: e.target.value };
                      parentBlock.children[blockIndex] = {
                        ...parentBlock.children[blockIndex],
                        listItems,
                        items: listItems.map(item => item.content)
                      };
                    }
                  }
                } else {
                  const listItems = [...(newBlocks[index].listItems || [])];
                  listItems[0] = { ...listItems[0], content: e.target.value };
                  newBlocks[index] = {
                    ...newBlocks[index],
                    listItems,
                    items: listItems.map(item => item.content)
                  };
                }
                setBlocks(newBlocks);
                if (onUpdatePage) {
                  onUpdatePage({ ...page, blocks: newBlocks });
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, index, block, 0)}
              onFocus={() => setActiveListItemId(listItems[0].id)}
              ref={activeListItemId === listItems[0].id ? (input) => input?.focus() : undefined}
              placeholder="Toggle heading"
              className="flex-1 bg-transparent border-none outline-none text-base font-medium leading-relaxed"
            />
          </div>
          {isExpanded && (
            <div className="ml-6 mt-1 border-l-2 border-gray-200 pl-4">
              {block.children?.map((childBlock, childIndex) => (
                <div key={childBlock.id} className="py-1">
                  {renderBlock(childBlock, childIndex, true)}
                </div>
              ))}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 text-sm text-blue-500 hover:opacity-70 transition-opacity py-1">
                      <Plus className="h-5 w-5" />
                      <span>Add block</span>
                    </button>
                  </PopoverTrigger>
                  <BlockTypePopover 
                    onSelect={(type) => handleAddNestedBlock(index, type)}
                  />
                </Popover>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {listItems.map((item, itemIndex) => (
          <div key={item.id} className="flex items-center gap-2">
            {block.type === 'bullet-list' && (
              <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 ml-2" />
            )}
            {block.type === 'number-list' && (
              <span className="text-gray-500 min-w-[1.5rem] text-right mr-2">{itemIndex + 1}.</span>
            )}
            {block.type === 'to-do' && (
              <button
                className={`w-4 h-4 border rounded ${item.checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} flex items-center justify-center`}
                onClick={() => {
                  const newBlocks = [...blocks];
                  if (isNested && block.parentId) {
                    const parentIndex = blocks.findIndex(b => b.id === block.parentId);
                    if (parentIndex !== -1) {
                      const parentBlock = newBlocks[parentIndex];
                      if (parentBlock.children) {
                        const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
                        const listItems = [...(parentBlock.children[blockIndex].listItems || [])];
                        listItems[itemIndex] = { ...item, checked: !item.checked };
                        parentBlock.children[blockIndex] = {
                          ...parentBlock.children[blockIndex],
                          listItems,
                          items: listItems.map(item => item.content)
                        };
                      }
                    }
                  } else {
                    const listItems = [...(newBlocks[index].listItems || [])];
                    listItems[itemIndex] = { ...item, checked: !item.checked };
                    newBlocks[index] = {
                      ...newBlocks[index],
                      listItems,
                      items: listItems.map(item => item.content)
                    };
                  }
                  setBlocks(newBlocks);
                  if (onUpdatePage) {
                    onUpdatePage({ ...page, blocks: newBlocks });
                  }
                }}
              >
                {item.checked && <Check className="w-3 h-3 text-white" />}
              </button>
            )}
            <input
              type="text"
              value={item.content}
              onChange={(e) => {
                const newBlocks = [...blocks];
                if (isNested && block.parentId) {
                  const parentIndex = blocks.findIndex(b => b.id === block.parentId);
                  if (parentIndex !== -1) {
                    const parentBlock = newBlocks[parentIndex];
                    if (parentBlock.children) {
                      const blockIndex = parentBlock.children.findIndex(b => b.id === block.id);
                      const listItems = [...(parentBlock.children[blockIndex].listItems || [])];
                      listItems[itemIndex] = { ...item, content: e.target.value };
                      parentBlock.children[blockIndex] = {
                        ...parentBlock.children[blockIndex],
                        listItems,
                        items: listItems.map(item => item.content)
                      };
                    }
                  }
                } else {
                  const listItems = [...(newBlocks[index].listItems || [])];
                  listItems[itemIndex] = { ...item, content: e.target.value };
                  newBlocks[index] = {
                    ...newBlocks[index],
                    listItems,
                    items: listItems.map(item => item.content)
                  };
                }
                setBlocks(newBlocks);
                if (onUpdatePage) {
                  onUpdatePage({ ...page, blocks: newBlocks });
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, index, block, itemIndex)}
              onFocus={() => setActiveListItemId(item.id)}
              ref={activeListItemId === item.id ? (input) => input?.focus() : undefined}
              placeholder="List item"
              className="flex-1 bg-transparent border-none outline-none text-base leading-relaxed"
            />
          </div>
        ))}
      </div>
    );
  };

  // Helper functions
  const getPlaceholderForType = (type: BlockType['type']) => {
    switch (type) {
      case 'heading-1': return 'Heading 1';
      case 'heading-2': return 'Heading 2';
      case 'heading-3': return 'Heading 3';
      case 'heading-4': return 'Heading 4';
      case 'heading-5': return 'Heading 5';
      case 'heading-6': return 'Heading 6';
      case 'quote': return 'Write a quote...';
      default: return 'Type here...';
    }
  };

  const getClassNameForType = (type: BlockType['type']) => {
    const baseClasses = 'w-full bg-transparent border-none outline-none whitespace-pre-wrap break-words px-3 placeholder:text-muted-foreground';
    switch (type) {
      case 'heading-1': return `${baseClasses} text-[2rem] font-bold tracking-tight leading-tight py-6 text-gray-800`;
      case 'heading-2': return `${baseClasses} text-[1.75rem] font-bold tracking-tight leading-tight py-5 text-gray-800`;
      case 'heading-3': return `${baseClasses} text-[1.5rem] font-bold leading-snug py-4 text-gray-800`;
      case 'heading-4': return `${baseClasses} text-[1.25rem] font-semibold leading-snug py-3 text-gray-800`;
      case 'heading-5': return `${baseClasses} text-[1.15rem] font-semibold leading-snug py-2 text-gray-800`;
      case 'heading-6': return `${baseClasses} text-[1.05rem] font-semibold leading-snug py-2 text-gray-800`;
      case 'divider': return `${baseClasses} pointer-events-none h-9 flex items-center`;
      case 'quote': return `${baseClasses} text-lg font-medium leading-relaxed py-2 text-gray-700 italic`;
      default: return `${baseClasses} text-base font-normal leading-relaxed py-1 text-gray-600`;
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
    setIsPopoverOpen(false);
    
    if (onUpdatePage) {
      onUpdatePage({ ...page, blocks: newBlocks });
    }

    // Focus the new block
    requestAnimationFrame(() => {
      const contentEditableDiv = document.querySelector(`[data-block-id="${newBlock.id}"] input`);
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
                      {renderBlock(block, index)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Add Block Button */}
              {blocks.length > 0 && (
                <div className="flex justify-start !mt-4 px-2 opacity-0 hover:opacity-100 transition-opacity">
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className="group flex items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        <Plus className="h-5 w-5 text-blue-500" />
                        <span className="text-blue-500 text-sm font-medium">Add blocks</span>
                      </button>
                    </PopoverTrigger>
                    <BlockTypePopover 
                      onSelect={(type) => {
                        handleAddBlock(blocks.length - 1, type);
                      }}
                    />
                  </Popover>
                </div>
              )}
              
              {blocks.length === 0 && (
                <div className="flex items-start gap-2 py-1 px-2 rounded-sm hover:bg-accent/5">
                  <div className="flex items-center h-[1.5em] mt-0.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <div className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent sideOffset={2} align="start" className="w-[160px]">
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
                            className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-pointer"
                          >
                            <Plus className="h-5 w-5 text-muted-foreground" />
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
