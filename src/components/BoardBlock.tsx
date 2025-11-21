import React, { useState, useRef, useEffect } from 'react';
import { BlockType } from '../types';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Copy,
  GripVertical,
  X,
  Calendar,
  User,
  Tag,
  Flag,
  LayoutGrid,
  Table as TableIcon,
  MessageSquare,
  PlusCircle,
  Image as ImageIcon,
  Smile,
  ChevronDown,
  ImagePlus,
  Upload,
  AtSign,
  Paperclip,
  File,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from "@/components/ui/textarea";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { IconPicker } from './IconPicker';
import { EmojiPicker } from './EmojiPicker';

// Icon Picker Modal Component
interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

function IconPickerModal({
  isOpen,
  onClose,
  onSelect
}: IconPickerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Icon</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="emoji" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="emoji" className="flex-1">Emoji</TabsTrigger>
            <TabsTrigger value="icons" className="flex-1">Icons</TabsTrigger>
          </TabsList>
          <TabsContent value="emoji" className="mt-4">
            <Picker
              data={data}
              onEmojiSelect={(emoji: any) => {
                onSelect(emoji.native);
                onClose();
              }}
              theme="light"
            />
          </TabsContent>
          <TabsContent value="icons" className="mt-4">
            <IconPicker onSelect={(icon) => {
              onSelect(icon);
              onClose();
            }} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Cover Picker Modal Component
interface CoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cover: { type: 'image' | 'color'; value: string }) => void;
}

function CoverPickerModal({
  isOpen,
  onClose,
  onSelect
}: CoverPickerModalProps) {
  const [color, setColor] = useState("#000000");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect({ type: 'image', value: reader.result as string });
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (selectedColor: string) => {
    setColor(selectedColor);
    onSelect({ type: 'color', value: selectedColor });
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('#') && (value.length <= 7)) {
      setColor(value);
    } else if (!value.startsWith('#') && value.length <= 6) {
      setColor(`#${value}`);
    }
  };

  const handleHexInputBlur = () => {
    // Validate hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      onSelect({ type: 'color', value: color });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
        onSelect({ type: 'color', value: color });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Cover</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">Upload Image</TabsTrigger>
            <TabsTrigger value="color" className="flex-1">Color</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <p className="text-sm text-muted-foreground">
                Recommended size: 1500x500px
              </p>
            </div>
          </TabsContent>
          <TabsContent value="color" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div
                  className="w-32 h-32 rounded-lg border"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hex Code</label>
                    <Input
                      type="text"
                      value={color}
                      onChange={handleHexInputChange}
                      onBlur={handleHexInputBlur}
                      onKeyDown={handleKeyDown}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['#9CA3AF', '#60A5FA', '#34D399', '#F87171', '#FBBF24', '#A78BFA', '#F472B6', '#6B7280', '#1F2937', '#FFFFFF'].map((presetColor) => (
                  <Button
                    key={presetColor}
                    variant="outline"
                    className="w-8 h-8 p-0 border"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handleColorChange(presetColor)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Types
type TaskStatus = 'todo' | 'doing' | 'done' | string;

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface TaskComment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  replies?: TaskComment[];
  parentId?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface TaskProperty {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'user' | 'checkbox';
  value: any;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedUsers?: User[];
  dueDate?: string;
  properties?: TaskProperty[];
  comments?: TaskComment[];
  coverImage?: string;
  icon?: string;
  priority?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

interface BoardData {
  columns: Column[];
  tasks: Record<string, Task>;
}

// Default data for new board
const getDefaultBoardData = (): BoardData => {
  return {
    columns: [
      { id: 'col-1', title: 'To do', tasks: [], color: 'hsl(var(--muted-foreground))' },
      { id: 'col-2', title: 'Doing', tasks: [], color: 'hsl(var(--primary))' },
      { id: 'col-3', title: 'Done', tasks: [], color: 'hsl(var(--green-500))' }, // Using a specific green if semantic 'success' is not defined, or fallback to primary
    ],
    tasks: {}
  };
};

// Helper function to generate IDs
const generateId = (prefix: string = 'item') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to get default column color based on title
const getDefaultColumnColor = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('todo') || lowerTitle.includes('not')) {
    return 'hsl(var(--muted-foreground))'; // Gray for To Do/Not Started
  } else if (lowerTitle.includes('progress') || lowerTitle.includes('doing')) {
    return 'hsl(var(--primary))'; // Primary for In Progress/Doing
  } else if (lowerTitle.includes('done') || lowerTitle.includes('complete')) {
    return 'hsl(var(--green-500))'; // Green for Done/Completed (assuming green-500 exists or use hex if must)
  }
  return 'hsl(var(--muted-foreground))'; // Default gray
};

// Six-dot handle component for drag and drop
const SixDotHandle = ({ className }: { className?: string }) => (
  <div className={cn("cursor-grab", className)}>
    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
  </div>
);

// Task Card Component
const TaskCard = ({ task, onClick, onDelete }: { task: Task; onClick: () => void; onDelete: (taskId: string) => void }) => {
  if (!task) {
    console.error("TaskCard received null or undefined task");
    return <div className="p-2 text-red-500">Invalid task</div>;
  }

  console.log("Rendering TaskCard:", task);

  // Priority colors
  const priorityColors: Record<string, string> = {
    'high': 'hsl(var(--destructive))',
    'medium': '#F59E0B', // Keep orange for medium as warning
    'low': '#10B981', // Keep green for low as success
    'none': 'hsl(var(--muted-foreground))'
  };

  return (
    <div
      className="bg-white relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <Trash className="h-3 w-3" />
        </Button>
      </div>

      {task.coverImage && (
        <div className="w-full mb-3 rounded overflow-hidden h-24">
          <img src={task.coverImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-2">
        {task.icon && (
          <div className="text-lg mb-2">{task.icon}</div>
        )}

        <h3 className="font-medium text-sm mb-1">{task.title || "Untitled Task"}</h3>

        <div className="flex items-center justify-between mt-2">
          {/* Show assignees if any */}
          {task.assignedUsers && task.assignedUsers.length > 0 ? (
            <div className="flex -space-x-2">
              {task.assignedUsers.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-5 w-5 border border-white">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {task.assignedUsers.length > 3 && (
                <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  +{task.assignedUsers.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div></div>
          )}

          {/* Show priority if not 'none' */}
          {task.priority && task.priority !== 'none' && (
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: priorityColors[task.priority] || priorityColors.none }}
              title={`Priority: ${task.priority}`}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

// Column Component
const BoardColumn = ({
  column,
  tasks,
  onAddTask,
  onTaskClick,
  onTitleChange,
  onDeleteColumn,
  onColorChange,
  onDeleteTask
}: {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
  onTitleChange: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onColorChange: (columnId: string, color: string) => void;
  onDeleteTask: (taskId: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [hexColor, setHexColor] = useState(column.color || getDefaultColumnColor(column.title));
  const inputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setHexColor(column.color || getDefaultColumnColor(column.title));
  }, [column.color, column.title]);

  const handleTitleSave = () => {
    onTitleChange(column.id, title);
    setIsEditing(false);
  };

  const handleColorChange = (color: string) => {
    setHexColor(color);
    onColorChange(column.id, color);
    setColorPickerOpen(false);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('#') && (value.length <= 7)) {
      setHexColor(value);
    } else if (!value.startsWith('#') && value.length <= 6) {
      setHexColor(`#${value}`);
    }
  };

  const handleHexInputBlur = () => {
    // Validate hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
      onColorChange(column.id, hexColor);
    } else {
      // Reset to previous valid color
      setHexColor(column.color || getDefaultColumnColor(column.title));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
        onColorChange(column.id, hexColor);
        setColorPickerOpen(false);
      }
    } else if (e.key === 'Escape') {
      setHexColor(column.color || getDefaultColumnColor(column.title));
      setColorPickerOpen(false);
    }
  };

  // Log the tasks for debugging
  console.log(`Rendering column ${column.id} with ${tasks?.length || 0} tasks:`, tasks);

  return (
    <div className="min-w-[230px] max-w-[230px] flex flex-col bg-gray-50/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') {
                setTitle(column.title);
                setIsEditing(false);
              }
            }}
            className="h-8 text-sm font-medium"
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-medium cursor-pointer flex items-center gap-2"
            onClick={() => setIsEditing(true)}
            style={{ color: column.color || getDefaultColumnColor(column.title) }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: column.color || getDefaultColumnColor(column.title) }}
            ></span>
            {column.title}
            <span className="text-muted-foreground ml-1 text-xs">
              {Array.isArray(tasks) ? tasks.length : 0}
            </span>
          </h3>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteColumn(column.id)}>
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal h-8 px-2"
                >
                  Color
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-3">
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    {['#9CA3AF', '#60A5FA', '#34D399', '#F87171', '#FBBF24', '#A78BFA', '#F472B6', '#6B7280', '#1F2937', '#FFFFFF'].map((color) => (
                      <Button
                        key={color}
                        variant="outline"
                        className="w-8 h-8 p-0 border"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: hexColor }}
                    ></div>
                    <Input
                      ref={colorInputRef}
                      value={hexColor}
                      onChange={handleHexInputChange}
                      onBlur={handleHexInputBlur}
                      onKeyDown={handleKeyDown}
                      className="h-8 flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto min-h-[100px] space-y-2 mb-2 ${snapshot.isDraggingOver ? "bg-accent/50" : ""
              }`}
          >
            {Array.isArray(tasks) && tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white rounded-md border p-3 mb-2 ${snapshot.isDragging ? "shadow-lg" : ""
                        }`}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => onTaskClick(task)}
                        onDelete={onDeleteTask}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No tasks yet
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Create Task Button - Inside column */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-transparent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("New Task button clicked for column:", column.id);
          onAddTask(column.id);
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Task
      </Button>
    </div>
  );
};

// Table View Component
const BoardTableView = ({
  tasks,
  onTaskClick
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) => {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50">
            <th className="text-left p-3 text-sm font-medium">Title</th>
            <th className="text-left p-3 text-sm font-medium">Status</th>
            <th className="text-left p-3 text-sm font-medium">Assigned To</th>
            <th className="text-left p-3 text-sm font-medium">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-800/20 cursor-pointer"
            >
              <td className="p-3 text-sm" onClick={() => onTaskClick(task)}>
                <div className="flex items-center gap-2">
                  {task.icon && <span>{task.icon}</span>}
                  {task.title}
                </div>
              </td>
              <td className="p-3 text-sm" onClick={() => onTaskClick(task)}>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                  {capitalizeFirstLetter(task.status)}
                </span>
              </td>
              <td className="p-3 text-sm" onClick={() => onTaskClick(task)}>
                {task.assignedUsers && task.assignedUsers.length > 0 ? (
                  <div className="flex -space-x-2">
                    {task.assignedUsers.map((user) => (
                      <Avatar key={user.id} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-3 text-sm" onClick={() => onTaskClick(task)}>
                {task.dueDate ? (
                  <span className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Add a utility function to capitalize the first letter of a string
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Task Detail Dialog Component
const TaskDetailDialog = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  boardData
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  boardData: BoardData;
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [showDueDate, setShowDueDate] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  // Comment system states
  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');
  const [showMentionDropdown, setShowMentionDropdown] = useState<boolean>(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [fileUploading, setFileUploading] = useState<boolean>(false);

  // Refs
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock users for mention functionality
  const users = [
    { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 'user3', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 'user4', name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 'user5', name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=5' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 'high', label: 'High', color: 'hsl(var(--destructive))' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'none', label: 'None', color: 'hsl(var(--muted-foreground))' }
  ];

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setShowDueDate(!!task.dueDate);
      setShowDescription(!!task.description);
    }
  }, [task]);

  // Update the task whenever editedTask changes, but debounced
  useEffect(() => {
    if (editedTask) {
      // Use a timeout to debounce updates during editing
      const timeoutId = setTimeout(() => {
        console.log("Task detail dialog updating task:", editedTask);
        onUpdate({ ...editedTask });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [editedTask, onUpdate]);

  // Save changes when the dialog is closed
  useEffect(() => {
    // When dialog is closed and we have an edited task, save changes immediately
    if (!isOpen && editedTask) {
      console.log("Dialog closed, saving final state:", editedTask);
      onUpdate({ ...editedTask });
    }
  }, [isOpen, editedTask, onUpdate]);

  if (!editedTask) return null;

  const handleIconAdd = () => {
    setIsIconPickerOpen(true);
  };

  const handleIconSelect = (icon: string) => {
    setEditedTask({
      ...editedTask,
      icon: icon
    });
  };

  const handleIconRemove = () => {
    setEditedTask({
      ...editedTask,
      icon: undefined
    });
  };

  const handleCoverAdd = () => {
    setIsCoverPickerOpen(true);
  };

  const handleCoverSelect = (cover: { type: 'image' | 'color'; value: string }) => {
    setEditedTask({
      ...editedTask,
      coverImage: cover.value
    });
  };

  const handleCoverRemove = () => {
    setEditedTask({
      ...editedTask,
      coverImage: undefined
    });
  };

  const handleDescriptionAdd = () => {
    setShowDescription(true);
    if (!editedTask.description) {
      setEditedTask({
        ...editedTask,
        description: ""
      });
    }
  };

  // Function to determine if the cover is a color or an image
  const isCoverColor = (cover: string | undefined) => {
    return cover && /^#([0-9A-F]{3}){1,2}$/i.test(cover);
  };

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setEditedTask({
      ...editedTask,
      status: newStatus.toLowerCase()
    });
  };

  // Handle assignee change
  const handleAssigneeChange = (user: User) => {
    // Check if user is already assigned
    const isAssigned = editedTask.assignedUsers?.some(u => u.id === user.id);

    if (isAssigned) {
      // Remove user
      setEditedTask({
        ...editedTask,
        assignedUsers: editedTask.assignedUsers?.filter(u => u.id !== user.id)
      });
    } else {
      // Add user
      setEditedTask({
        ...editedTask,
        assignedUsers: [...(editedTask.assignedUsers || []), user]
      });
    }
  };

  // Handle priority change
  const handlePriorityChange = (priority: string) => {
    setEditedTask({
      ...editedTask,
      priority: priority
    });
  };

  // Comment system functions

  // Format timestamp for comments
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Format as date
    return date.toLocaleDateString();
  };

  // Add new comment
  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: TaskComment = {
      id: Date.now().toString(),
      author: {
        name: 'Current User', // In a real app, this would come from auth
        avatar: 'https://i.pravatar.cc/150?img=8', // In a real app, this would come from auth
      },
      content: newComment.trim(),
      timestamp: new Date()
    };

    setEditedTask({
      ...editedTask,
      comments: [...(editedTask.comments || []), comment]
    });

    setNewComment('');

    // Focus back on input
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // Delete comment
  const deleteComment = (commentId: string) => {
    if (!editedTask.comments) return;

    setEditedTask({
      ...editedTask,
      comments: editedTask.comments.filter(comment => comment.id !== commentId)
    });
  };

  // Add reply to a comment
  const addReply = (parentId: string) => {
    if (!replyContent.trim() || !editedTask.comments) return;

    const newReply: TaskComment = {
      id: Date.now().toString(),
      author: {
        name: 'Current User', // In a real app, this would come from auth
        avatar: 'https://i.pravatar.cc/150?img=8', // In a real app, this would come from auth
      },
      content: replyContent,
      timestamp: new Date(),
      parentId: parentId
    };

    const updatedComments = editedTask.comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    });

    setEditedTask({
      ...editedTask,
      comments: updatedComments
    });

    setReplyContent('');
    setReplyingTo(null);
  };

  // Delete reply
  const deleteReply = (parentId: string, replyId: string) => {
    if (!editedTask.comments) return;

    const updatedComments = editedTask.comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== replyId)
        };
      }
      return comment;
    });

    setEditedTask({
      ...editedTask,
      comments: updatedComments
    });
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: any) => {
    if (!emoji?.native) return;

    const textareaElement = document.activeElement;
    if (textareaElement?.tagName === 'TEXTAREA') {
      const textarea = textareaElement as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + emoji.native + text.substring(end);

      if (textarea.id === 'mainComment') {
        setNewComment(newText);
      } else if (textarea.id === 'replyComment') {
        setReplyContent(newText);
      }

      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.native.length, start + emoji.native.length);
      }, 0);
    } else {
      // Fallback if no textarea is focused
      if (replyingTo) {
        setReplyContent(prev => prev + emoji.native);
      } else {
        setNewComment(prev => prev + emoji.native);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, commentId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileUploading(true);

    // Process each file
    Array.from(files).forEach(file => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;

        const fileAttachment = {
          id: Date.now().toString(),
          name: file.name,
          url: fileUrl,
          type: file.type,
          size: file.size
        };

        if (commentId) {
          // Add attachment to specific comment
          if (!editedTask.comments) return;

          const updatedComments = editedTask.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                attachments: [...(comment.attachments || []), fileAttachment]
              };
            }
            return comment;
          });

          setEditedTask({
            ...editedTask,
            comments: updatedComments
          });
        } else {
          // Create new comment with attachment
          const newComment: TaskComment = {
            id: Date.now().toString(),
            author: {
              name: 'Current User',
              avatar: 'https://i.pravatar.cc/150?img=8',
            },
            content: 'Attached file',
            timestamp: new Date(),
            attachments: [fileAttachment]
          };

          setEditedTask({
            ...editedTask,
            comments: [...(editedTask.comments || []), newComment]
          });
        }

        setFileUploading(false);
      };

      reader.onerror = () => {
        console.error('Error reading file');
        setFileUploading(false);
      };

      reader.readAsDataURL(file);
    });

    // Reset the file input
    e.target.value = '';
  };

  // Handle comment input change with mention detection
  const handleCommentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1 && (atIndex === 0 || /\s/.test(textBeforeCursor[atIndex - 1]))) {
      const query = textBeforeCursor.substring(atIndex + 1);
      if (query.length > 0 && !query.includes(' ')) {
        setMentionQuery(query);
        setShowMentionDropdown(true);
        setMentionStartIndex(atIndex);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  // Handle user selection from mention dropdown
  const handleUserMention = (user: { id: string; name: string; avatar?: string }) => {
    if (mentionStartIndex !== -1) {
      const beforeMention = newComment.substring(0, mentionStartIndex);
      const afterMention = newComment.substring(mentionStartIndex + 1 + mentionQuery.length);

      const mentionText = `@${user.name} `;
      setNewComment(beforeMention + mentionText + afterMention);

      setShowMentionDropdown(false);
      setMentionQuery('');

      // Focus and set cursor position after the mention
      if (commentInputRef.current) {
        const newCursorPos = mentionStartIndex + mentionText.length;
        setTimeout(() => {
          commentInputRef.current?.focus();
          commentInputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  // Filter users based on mention query
  const filteredUsers = mentionQuery
    ? users.filter(user =>
      user.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    : [];

  // Render a file attachment
  const renderAttachment = (attachment: { id: string; name: string; url: string; type: string; size: number }) => {
    const isImage = attachment.type.startsWith('image/');
    const isDocument = attachment.type.includes('pdf') ||
      attachment.type.includes('doc') ||
      attachment.type.includes('sheet') ||
      attachment.type.includes('text');

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div key={attachment.id} className="mt-2 border rounded-md p-2 bg-gray-50">
        <div className="flex items-center gap-2">
          {isImage ? (
            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
              <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
              {isDocument ? <FileText className="h-5 w-5 text-blue-500" /> : <File className="h-5 w-5 text-gray-500" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Render comment with replies
  const renderComment = (comment: TaskComment, isReply: boolean = false) => (
    <div key={comment.id} className={`flex gap-3 ${isReply ? 'mt-3' : 'mb-4'}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div>
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground ml-2">{formatTimestamp(comment.timestamp)}</span>
          </div>
          <p className="text-sm text-foreground/90">{comment.content}</p>

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="space-y-2 mt-2">
              {comment.attachments.map(attachment => renderAttachment(attachment))}
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-1">
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-6 px-0"
              onClick={() => setReplyingTo(comment.id)}
            >
              Reply
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive h-6 px-0"
            onClick={() => isReply ? deleteReply(comment.parentId!, comment.id) : deleteComment(comment.id)}
          >
            Delete
          </Button>
        </div>

        {replyingTo === comment.id && (
          <div className="flex gap-3 items-start mt-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  id="replyComment"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full resize-none text-sm min-h-[60px] focus-visible:ring-primary pr-10 border-gray-200"
                  rows={2}
                />
                <div className="absolute right-2 top-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="h-7"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="h-7 bg-primary hover:bg-primary/90"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-3 border-l-2 border-gray-100 pl-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // The useEffect will handle the update when isOpen changes
        onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80" />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="w-[80vw] h-[85vh] max-w-4xl max-h-[850px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
          >
            {/* Action buttons - top right */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-red-100 text-red-600"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this task?")) {
                    onDelete(editedTask.id);
                  }
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Cover Image/Color Section */}
              {editedTask.coverImage && (
                <div
                  className="w-full h-48 rounded-lg mb-6 bg-cover bg-center relative group"
                  style={isCoverColor(editedTask.coverImage)
                    ? { backgroundColor: editedTask.coverImage }
                    : { backgroundImage: `url(${editedTask.coverImage})` }
                  }
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button variant="secondary" className="bg-background/80 hover:bg-background" onClick={handleCoverAdd}>
                      Change Cover
                    </Button>
                    <Button variant="secondary" className="bg-background/80 hover:bg-background" onClick={handleCoverRemove}>
                      Remove Cover
                    </Button>
                  </div>
                </div>
              )}

              {/* Task Header - Left-aligned layout matching ProjectPage */}
              <div className="flex items-center gap-4 mb-8">
                {/* Icon on the left */}
                <div className="flex-shrink-0">
                  {editedTask.icon ? (
                    <Button
                      variant="ghost"
                      size="lg"
                      className="h-16 w-16 text-2xl"
                      onClick={handleIconAdd}
                    >
                      {editedTask.icon}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="lg"
                      className="h-16 w-16"
                      onClick={handleIconAdd}
                    >
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                {/* Title and actions */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={editedTask.title}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      placeholder="Task Name"
                      className="text-3xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    />

                    {/* Action Buttons - Right of title */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={handleIconAdd}>
                        {!editedTask.icon ? "Add Icon" : "Change Icon"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCoverAdd}>
                        {!editedTask.coverImage ? "Add Cover" : "Change Cover"}
                      </Button>
                      {!showDescription && (
                        <Button variant="outline" size="sm" onClick={handleDescriptionAdd}>
                          Add Description
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this task?')) {
                            onDelete(editedTask.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Task
                      </Button>
                    </div>
                  </div>

                  {/* Description - Only shown if added */}
                  {showDescription && (
                    <div className="mt-4">
                      <textarea
                        value={editedTask.description || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                        className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a description..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Task Properties */}
              <div className="space-y-4 mb-8">
                {/* Status dropdown */}
                <div className="flex items-center">
                  <div className="flex items-center gap-2 w-24">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 justify-between text-left font-normal px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: boardData.columns.find(
                                col => col.title.toLowerCase() === editedTask.status.toLowerCase()
                              )?.color || '#9CA3AF'
                            }}
                          ></span>
                          <span>{capitalizeFirstLetter(editedTask.status)}</span>
                          <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="start">
                      <div className="py-1">
                        {boardData?.columns?.map((column) => (
                          <button
                            key={column.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => handleStatusChange(column.title.toLowerCase())}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: column.color || '#9CA3AF' }}
                            ></span>
                            {column.title}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Assignees dropdown */}
                <div className="flex items-center">
                  <div className="flex items-center gap-2 w-24">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assign</span>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 justify-between text-left font-normal px-3 py-1.5"
                      >
                        {editedTask.assignedUsers && editedTask.assignedUsers.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 mr-1">
                              {editedTask.assignedUsers.slice(0, 3).map((user) => (
                                <Avatar key={user.id} className="h-5 w-5 border border-white">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {editedTask.assignedUsers.length > 3 && (
                                <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                  +{editedTask.assignedUsers.length - 3}
                                </div>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Unassigned</span>
                            <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                          </div>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-0" align="start">
                      <div className="p-2">
                        <div className="mb-2 px-2">
                          <span className="text-sm font-medium">Assign to...</span>
                        </div>
                        {users.map((user) => {
                          const isAssigned = editedTask.assignedUsers?.some(u => u.id === user.id);
                          return (
                            <div
                              key={user.id}
                              className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                              onClick={() => {
                                if (isAssigned) {
                                  setEditedTask({
                                    ...editedTask,
                                    assignedUsers: editedTask.assignedUsers?.filter(u => u.id !== user.id)
                                  });
                                } else {
                                  setEditedTask({
                                    ...editedTask,
                                    assignedUsers: [...(editedTask.assignedUsers || []), user]
                                  });
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{user.name}</span>
                              </div>
                              {isAssigned && (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Priority dropdown */}
                <div className="flex items-center">
                  <div className="flex items-center gap-2 w-24">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Priority</span>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 justify-between text-left font-normal px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          {editedTask.priority ? (
                            <>
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: priorityOptions.find(p => p.value === editedTask.priority)?.color || '#9CA3AF'
                                }}
                              ></span>
                              <span>{priorityOptions.find(p => p.value === editedTask.priority)?.label || 'None'}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                          <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="start">
                      <div className="py-1">
                        {priorityOptions.map((priority) => (
                          <button
                            key={priority.value}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => handlePriorityChange(priority.value)}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: priority.color }}
                            ></span>
                            {priority.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Due Date - Optional */}
                {showDueDate && (
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 w-24">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Due Date</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={editedTask.dueDate || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                        className="border rounded-md p-2 text-sm h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowDueDate(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Property Button - Minimal style */}
              <div className="mb-8">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add property
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {!showDueDate && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setShowDueDate(true)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Due Date
                      </DropdownMenuItem>
                    )}
                    {!showDescription && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleDescriptionAdd}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Description
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Comments Section - Always visible */}
              <div className="mb-8">
                <h3 className="font-medium mb-4">Comments</h3>
                <div className="border-l-2 border-gray-100 pl-4">
                  {/* Display existing comments if any */}
                  {editedTask.comments && editedTask.comments.length > 0 && (
                    <div className="space-y-4 mb-4">
                      {editedTask.comments.filter(comment => !comment.parentId).map(comment => renderComment(comment))}
                    </div>
                  )}

                  {/* Comment input */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="relative">
                        <Textarea
                          id="mainComment"
                          ref={commentInputRef}
                          value={newComment}
                          onChange={handleCommentInputChange}
                          placeholder="Add a comment..."
                          className="w-full resize-none text-sm min-h-[80px] focus-visible:ring-primary pr-10 border-gray-200"
                          rows={3}
                        />
                        <div className="absolute right-2 top-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-transparent"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {showEmojiPicker && (
                            <div className="absolute right-0 z-10">
                              <Picker
                                data={data}
                                onEmojiSelect={handleEmojiSelect}
                                theme="light"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User mention dropdown */}
                      {showMentionDropdown && filteredUsers.length > 0 && (
                        <div className="absolute z-10 mt-1 w-60 bg-white border rounded-md shadow-lg">
                          <div className="p-1">
                            {filteredUsers.map(user => (
                              <div
                                key={user.id}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => handleUserMention(user)}
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{user.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          {/* Attachment button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-transparent"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={handleFileUpload}
                              multiple
                            />
                          </Button>

                          {/* Mention button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-transparent"
                            onClick={() => {
                              setNewComment(prev => prev + '@');
                              if (commentInputRef.current) {
                                commentInputRef.current.focus();
                              }
                            }}
                          >
                            <AtSign className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={addComment}
                          disabled={!newComment.trim() || fileUploading}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {fileUploading ? (
                            <div className="flex items-center gap-1">
                              <span className="animate-spin">⏳</span> Uploading...
                            </div>
                          ) : (
                            'Comment'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Empty state if no comments */}
                  {(!editedTask.comments || editedTask.comments.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">No comments yet</p>
                      <p className="text-xs text-muted-foreground/70">Start the conversation by adding a comment above</p>
                    </div>
                  )}
                </div>
              </div>
            </div >
          </div >
        </div >
      </DialogPortal >

      {/* Icon Picker Modal */}
      < IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelect={handleIconSelect}
      />

      {/* Cover Picker Modal */}
      < CoverPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={handleCoverSelect}
      />
    </Dialog >
  );
};

// Add a function to create a new board block
const createNewBoardBlock = () => {
  const defaultData = getDefaultBoardData();
  return {
    id: `board-${Date.now()}`,
    type: 'board',
    content: JSON.stringify(defaultData)
  };
};

// Main Board Block Component
const BoardBlock = ({
  block,
  onUpdate,
  onDelete,
  className = '',
}: {
  block: any;
  onUpdate: (block: any) => void;
  onDelete: () => void;
  className?: string;
}) => {
  console.log("BoardBlock rendering with block:", block);

  // Initialize the block if it's new and doesn't have content
  useEffect(() => {
    // CRITICAL: Only run this effect if the block is still a board type
    // This prevents the BoardBlock from reverting conversions to other block types
    if (!block || block.type !== 'board') {
      return;
    }

    if (block && (!block.content || block.content === '')) {
      // Create a new board block with default data
      const defaultData = getDefaultBoardData();
      const newBlock = {
        ...block,
        content: JSON.stringify(defaultData)
      };

      // Update the block content
      onUpdate(newBlock);

      // Set the board data
      setBoardData(defaultData);
    } else if (block && block.content) {
      try {
        // Parse the existing content
        const parsedData = parseBoardData();

        // Ensure columns have valid task arrays
        let hasChanges = false;
        if (parsedData.columns.length > 0) {
          parsedData.columns.forEach(column => {
            if (!Array.isArray(column.tasks)) {
              column.tasks = [];
              hasChanges = true;
            }
          });
        }

        setBoardData(parsedData);

        // Only update the block content if we made changes to the structure
        // or if the stringified version is different (normalization)
        const normalizedContent = JSON.stringify(parsedData);
        if (hasChanges || normalizedContent !== block.content) {
          onUpdate({
            ...block,
            content: normalizedContent
          });
        }
      } catch (e) {
        console.error("Error parsing board data:", e);

        // If parsing fails, use default data
        const defaultData = getDefaultBoardData();
        setBoardData(defaultData);

        // Update the block content with default data
        onUpdate({
          ...block,
          content: JSON.stringify(defaultData)
        });
      }
    }
  }, [block.content, block.type]); // Run when content OR type changes

  // Parse the board data from the block's content or use default
  const parseBoardData = (): BoardData => {
    if (block && block.content) {
      try {
        const parsed = JSON.parse(block.content);
        if (parsed && Array.isArray(parsed.columns)) {
          // Ensure each column has a valid tasks array
          const validatedColumns = parsed.columns.map(col => ({
            id: col.id || generateId('col'),
            title: col.title || 'Untitled',
            color: col.color || getDefaultColumnColor(col.title || 'Untitled'),
            tasks: Array.isArray(col.tasks) ? col.tasks.map(task => ({
              id: task.id || generateId('task'),
              title: task.title || 'Untitled Task',
              status: task.status || col.title?.toLowerCase() || 'todo',
              ...task
            })) : []
          }));

          // Ensure tasks object exists
          const validatedTasks = parsed.tasks || {};

          return {
            columns: validatedColumns,
            tasks: validatedTasks
          };
        }
      } catch (e) {
        console.error("Error parsing board data:", e);
        throw e; // Re-throw to handle in the caller
      }
    }
    return getDefaultBoardData();
  };

  const [boardData, setBoardData] = useState<BoardData>(parseBoardData());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [activeView, setActiveView] = useState('board');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // Add an effect to update the board data when the block content changes
  useEffect(() => {
    // CRITICAL: Only sync content if this is still a board block
    if (!block || block.type !== 'board') {
      return;
    }

    if (block && block.content) {
      try {
        // Only update if the content has actually changed
        const currentContent = JSON.stringify(boardData);
        if (currentContent !== block.content) {
          const parsedData = parseBoardData();

          // Ensure all columns have valid tasks arrays
          parsedData.columns.forEach(column => {
            if (!Array.isArray(column.tasks)) {
              column.tasks = [];
            }
          });

          setBoardData(parsedData);
        }
      } catch (e) {
        console.error("Error parsing updated block content:", e);
      }
    }
  }, [block?.content]);

  // NOTE: Removed the unmount effect that was saving state on unmount
  // It was causing issues with block conversions by reverting the type
  // The parent PageEditor already handles saving state appropriately

  // This useEffect was previously used for task deletion, now removed
  useEffect(() => {
    // This effect is intentionally left empty
  }, []);

  // Handle adding a new column
  const handleAddColumn = () => {
    const newColumn: Column = {
      id: generateId('col'),
      title: 'New Column',
      tasks: [],
      color: getDefaultColumnColor('New Column')
    };

    const newBoardData = {
      ...boardData,
      columns: [...boardData.columns, newColumn]
    };

    setBoardData(newBoardData);

    if (onUpdate && block) {
      onUpdate({
        ...block,
        content: JSON.stringify(newBoardData)
      });
    }
  };

  // Handle column title change
  const handleColumnTitleChange = (columnId: string, newTitle: string) => {
    const newBoardData = {
      ...boardData,
      columns: boardData.columns.map(col =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    };

    setBoardData(newBoardData);

    if (onUpdate && block) {
      onUpdate({
        ...block,
        content: JSON.stringify(newBoardData)
      });
    }
  };

  // Handle adding a new task - completely rewritten for reliability
  const handleAddTask = (columnId: string) => {
    console.log("Adding task to column:", columnId);

    // Find the column
    const column = boardData.columns.find(col => col.id === columnId);
    if (!column) {
      console.error("Column not found:", columnId);
      return;
    }

    // Generate a unique ID
    const taskId = generateId('task');

    // Create the new task
    const newTask: Task = {
      id: taskId,
      title: 'New task',
      status: column.title.toLowerCase()
    };

    console.log("Created new task:", newTask);

    // Using a more direct approach to update the board data
    const newColumns = boardData.columns.map(col => {
      if (col.id === columnId) {
        // Create a new tasks array with the new task
        const tasks = Array.isArray(col.tasks) ? [...col.tasks] : [];
        return {
          ...col,
          tasks: [...tasks, { ...newTask }]
        };
      }
      return { ...col };
    });

    // Create new tasks record
    const newTasks = {
      ...boardData.tasks,
      [taskId]: { ...newTask }
    };

    // Create new board data
    const newBoardData = {
      columns: newColumns,
      tasks: newTasks
    };

    console.log("Updated board data:", newBoardData);

    // Update state first
    setBoardData(newBoardData);

    // Then update block content
    if (onUpdate && block) {
      const updatedBlock = {
        ...block,
        content: JSON.stringify(newBoardData)
      };
      console.log("Updating block with new content");
      onUpdate(updatedBlock);
    }

    // Force a re-render by setting a timeout
    setTimeout(() => {
      console.log("Re-rendering after task creation");
      const forcedUpdate = { ...newBoardData };
      setBoardData(forcedUpdate);

      // Don't automatically open the task detail dialog
      // User can click on the task to open it manually
    }, 50);
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  // Handle task update with a more reliable approach
  const handleTaskUpdate = (updatedTask: Task) => {
    console.log("Updating task:", updatedTask);

    // Get the old task from the current state to check status change
    const oldTask = boardData.columns
      .flatMap(col => Array.isArray(col.tasks) ? col.tasks : [])
      .find(t => t.id === updatedTask.id) || boardData.tasks[updatedTask.id];

    if (!oldTask) {
      console.error("Cannot update task: original task not found");
      return;
    }

    const oldStatus = oldTask?.status?.toLowerCase();
    const newStatus = updatedTask.status?.toLowerCase();
    const statusChanged = oldStatus !== newStatus;

    console.log(`Task status change: ${oldStatus} -> ${newStatus}, changed: ${statusChanged}`);
    console.log("Task title updated:", oldTask.title, "->", updatedTask.title);

    // Create a deep copy of board data to ensure all references are new
    const newBoardData = JSON.parse(JSON.stringify(boardData));

    // Update in tasks record first
    newBoardData.tasks[updatedTask.id] = { ...updatedTask };

    // Handle status change if needed
    if (statusChanged) {
      // Remove from old status column
      const oldStatusColumnIndex = newBoardData.columns.findIndex(
        col => col.title.toLowerCase() === oldStatus
      );

      if (oldStatusColumnIndex !== -1) {
        const oldColumn = newBoardData.columns[oldStatusColumnIndex];
        if (Array.isArray(oldColumn.tasks)) {
          newBoardData.columns[oldStatusColumnIndex].tasks =
            oldColumn.tasks.filter(t => t.id !== updatedTask.id);
        }
      }

      // Add to new status column
      const newStatusColumnIndex = newBoardData.columns.findIndex(
        col => col.title.toLowerCase() === newStatus
      );

      if (newStatusColumnIndex !== -1) {
        const newColumn = newBoardData.columns[newStatusColumnIndex];
        if (!Array.isArray(newColumn.tasks)) {
          newBoardData.columns[newStatusColumnIndex].tasks = [];
        }

        // Check if task already exists in this column
        const taskExists = newBoardData.columns[newStatusColumnIndex].tasks.some(
          t => t.id === updatedTask.id
        );

        if (!taskExists) {
          newBoardData.columns[newStatusColumnIndex].tasks.push({ ...updatedTask });
        }
      }
    } else {
      // Just update the task in its current column
      newBoardData.columns.forEach((col, index) => {
        if (Array.isArray(col.tasks)) {
          const taskIndex = col.tasks.findIndex(t => t.id === updatedTask.id);
          if (taskIndex !== -1) {
            newBoardData.columns[index].tasks[taskIndex] = { ...updatedTask };
          }
        }
      });
    }

    console.log("Updated board data after task update:", newBoardData);

    // Update state first
    setBoardData(newBoardData);

    // Then update block content
    if (onUpdate && block) {
      const updatedBlock = {
        ...block,
        content: JSON.stringify(newBoardData)
      };
      onUpdate(updatedBlock);
    }

    // Update the selected task if it's open in the dialog
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask({ ...updatedTask });
    }

    // Force a re-render after a short delay
    setTimeout(() => {
      console.log("Re-rendering after task update");
      const forcedUpdate = JSON.parse(JSON.stringify(newBoardData));
      setBoardData(forcedUpdate);
    }, 50);
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    console.log("Deleting task:", taskId);
    console.log("Current board data before deletion:", boardData);

    // Create a deep copy of board data
    const newBoardData = JSON.parse(JSON.stringify(boardData));

    // Remove from tasks record
    if (newBoardData.tasks[taskId]) {
      delete newBoardData.tasks[taskId];
    }

    // Remove from columns
    if (Array.isArray(newBoardData.columns)) {
      newBoardData.columns.forEach((col: Column) => {
        if (Array.isArray(col.tasks)) {
          col.tasks = col.tasks.filter((t: Task) => t.id !== taskId);
        }
      });
    } else {
      console.error("newBoardData.columns is not an array:", newBoardData.columns);
    }

    console.log("Updated board data after deletion:", newBoardData);

    // Update state
    setBoardData(newBoardData);

    // Update block content
    if (onUpdate && block) {
      onUpdate({
        ...block,
        content: JSON.stringify(newBoardData)
      });
    }

    // Close dialog directly without triggering the stale state update in handleCloseTaskDetail
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      handleDeleteTask(taskToDelete);
      setIsDeleteAlertOpen(false);
      setTaskToDelete(null);
    }
  };

  const requestDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteAlertOpen(true);
  };

  // Handle closing the task detail dialog
  const handleCloseTaskDetail = () => {
    console.log("Closing task detail dialog");

    // Force a re-render of the board after closing
    setTimeout(() => {
      console.log("Re-rendering after dialog close");
      const forcedUpdate = JSON.parse(JSON.stringify(boardData));
      setBoardData(forcedUpdate);
    }, 100);

    // Close the dialog and clear selection
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

  // Handle drag and drop with a much simpler approach
  const handleDragEnd = (result: any) => {
    console.log("Drag end result:", result);
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      console.log("Dropped outside list");
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log("Dropped in same position");
      return;
    }

    // Make a complete deep copy of the board data to avoid reference issues
    const newBoardData = JSON.parse(JSON.stringify(boardData));

    // Find source column
    const sourceColIndex = newBoardData.columns.findIndex(
      col => col.id === source.droppableId
    );

    // Find destination column
    const destColIndex = newBoardData.columns.findIndex(
      col => col.id === destination.droppableId
    );

    // If either column is not found, exit
    if (sourceColIndex === -1 || destColIndex === -1) {
      console.error("Source or destination column not found");
      return;
    }

    // Ensure tasks arrays exist
    if (!Array.isArray(newBoardData.columns[sourceColIndex].tasks)) {
      newBoardData.columns[sourceColIndex].tasks = [];
    }

    if (!Array.isArray(newBoardData.columns[destColIndex].tasks)) {
      newBoardData.columns[destColIndex].tasks = [];
    }

    // Get the task being moved
    const taskToMove = { ...newBoardData.columns[sourceColIndex].tasks[source.index] };

    // If task doesn't exist, exit
    if (!taskToMove) {
      console.error("Task to move not found");
      return;
    }

    console.log("Moving task:", taskToMove);

    // Remove from source column
    newBoardData.columns[sourceColIndex].tasks.splice(source.index, 1);

    // If moving to a different column, update the task's status
    if (source.droppableId !== destination.droppableId) {
      const newStatus = newBoardData.columns[destColIndex].title.toLowerCase();
      console.log(`Updating task status from ${taskToMove.status} to ${newStatus}`);
      taskToMove.status = newStatus;

      // Update in tasks record
      if (newBoardData.tasks[taskToMove.id]) {
        newBoardData.tasks[taskToMove.id] = { ...taskToMove };
      }
    }

    // Add to destination column
    newBoardData.columns[destColIndex].tasks.splice(destination.index, 0, taskToMove);

    console.log("Updated board data:", newBoardData);

    // FIX: Update state FIRST to prevent glitching
    setBoardData(newBoardData);

    // Then update block content
    if (onUpdate && block) {
      const updatedBlock = {
        ...block,
        content: JSON.stringify(newBoardData)
      };
      onUpdate(updatedBlock);
    }

    // Update selected task if it's open
    if (selectedTask && selectedTask.id === taskToMove.id) {
      setSelectedTask({ ...taskToMove });
    }
  };

  // Get all tasks for table view
  const getAllTasks = () => {
    return boardData.columns.flatMap(col => Array.isArray(col.tasks) ? col.tasks : []);
  };

  // Handle column deletion
  const handleDeleteColumn = (columnId: string) => {
    // Find the column to delete
    const columnToDelete = boardData.columns.find(col => col.id === columnId);
    if (!columnToDelete) return;

    // Get all task IDs from the column
    const taskIdsToRemove = columnToDelete.tasks.map(task => task.id);

    // Create a new tasks object without the removed tasks
    const updatedTasks = { ...boardData.tasks };
    taskIdsToRemove.forEach(taskId => {
      delete updatedTasks[taskId];
    });

    // Remove the column from columns array
    const updatedColumns = boardData.columns.filter(col => col.id !== columnId);

    const newBoardData = {
      tasks: updatedTasks,
      columns: updatedColumns
    };

    setBoardData(newBoardData);

    if (onUpdate && block) {
      onUpdate({
        ...block,
        content: JSON.stringify(newBoardData)
      });
    }
  };

  // Handle column color change
  const handleColumnColorChange = (columnId: string, color: string) => {
    const newBoardData = {
      ...boardData,
      columns: boardData.columns.map(col =>
        col.id === columnId ? { ...col, color } : col
      )
    };

    setBoardData(newBoardData);

    if (onUpdate && block) {
      onUpdate({
        ...block,
        content: JSON.stringify(newBoardData)
      });
    }
  };

  // CRITICAL: Don't render anything if this block has been converted to a different type
  // This prevents the BoardBlock from showing while React is unmounting/remounting
  if (!block || block.type !== 'board') {
    return null;
  }

  return (
    <div className={cn("my-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant={activeView === 'board' ? "secondary" : "ghost"}
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setActiveView('board')}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </Button>
          <Button
            variant={activeView === 'table' ? "secondary" : "ghost"}
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setActiveView('table')}
          >
            <TableIcon className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      <div className="rounded-lg">
        {activeView === 'board' && (
          <div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {boardData.columns.map((column) => {
                  // Ensure column has a tasks array
                  const columnTasks = Array.isArray(column.tasks) ? column.tasks : [];

                  return (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      tasks={columnTasks}
                      onAddTask={handleAddTask}
                      onTaskClick={handleTaskClick}
                      onTitleChange={handleColumnTitleChange}
                      onDeleteColumn={handleDeleteColumn}
                      onColorChange={handleColumnColorChange}
                      onDeleteTask={requestDeleteTask}
                    />
                  );
                })}

                {/* Add Column Button - Positioned to the right of columns */}
                <div className="flex items-center">
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full bg-blue-500 hover:bg-primary/90 text-white"
                    onClick={handleAddColumn}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DragDropContext>
          </div>
        )}

        {activeView === 'table' && (
          <BoardTableView
            tasks={getAllTasks()}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
        onUpdate={handleTaskUpdate}
        onDelete={handleDeleteTask}
        boardData={boardData}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardBlock;


