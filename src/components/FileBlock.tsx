import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ExternalLink, 
  X, 
  GripVertical,
  Upload,
  Link as LinkIcon,
  Plus,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Trash2,
  Image as ImageIcon,
  Search,
  FileText,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Layout,
  Quote,
  Table,
  Minus,
  Video,
  Music,
  FileIcon,
  Code,
  FormInput,
  ListTree,
  Figma,
  FileDigit,
  MessageSquare,
  Edit,
  Loader2,
  File,
  FilePlus,
  FileMinus,
  FileSymlink,
  RefreshCw,
  Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockType } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { EmojiPicker } from '@/components/EmojiPicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Define file extensions for different file types
const fileTypes = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'],
  document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'pages'],
  spreadsheet: ['xls', 'xlsx', 'csv', 'numbers'],
  presentation: ['ppt', 'pptx', 'key'],
  design: ['ai', 'psd', 'sketch', 'fig', 'xd', 'indd', 'eps'],
  video: ['mp4', 'mov', 'avi', 'wmv', 'webm', 'mkv'],
  audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  code: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'py', 'java', 'c', 'cpp'],
  other: []
};



// Simulated design file preview URLs (in a real app, these would be generated from the actual files)
const mockDesignPreviews = {
  'ai': [
    '/design-previews/ai-preview-1.jpg',
    '/design-previews/ai-preview-2.jpg',
    '/design-previews/ai-preview-3.jpg',
  ],
  'psd': [
    '/design-previews/psd-preview-1.jpg',
    '/design-previews/psd-preview-2.jpg',
  ],
  'sketch': [
    '/design-previews/sketch-preview-1.jpg',
  ],
  'fig': [
    '/design-previews/figma-preview-1.jpg',
  ],
  'xd': [
    '/design-previews/xd-preview-1.jpg',
  ]
};

// Helper function to get file type from extension
const getFileType = (filename: string): string => {
  if (!filename) return 'other';
  
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  for (const [type, extensions] of Object.entries(fileTypes)) {
    if (extensions.includes(extension)) {
      return type;
    }
  }
  
  return 'other';
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Define block categories for conversion
const blockCategories = [
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
      { type: 'code', icon: Code, label: 'Code' },
    ]
  },
  {
    name: "Media",
    blocks: [
      { type: 'image', icon: ImageIcon, label: 'Image' },
      { type: 'video', icon: Video, label: 'Video' },
      { type: 'audio', icon: Music, label: 'Audio' },
      { type: 'file', icon: FileIcon, label: 'File' },
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

// Comment interface
interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  replies?: Comment[];
  parentId?: string;
}

interface FileBlockProps {
  block: BlockType;
  onUpdate: (updatedBlock: BlockType) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvert?: (newType: BlockType['type']) => void;
}



const FileBlock = ({ 
  block, 
  onUpdate, 
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert
}: FileBlockProps): JSX.Element => {
  // State for the file
  const [fileUrl, setFileUrl] = useState<string>(block.url || '');
  const [fileName, setFileName] = useState<string>(block.title || '');
  const [fileSize, setFileSize] = useState<number>(block.fileSize || 0);
  const [fileType, setFileType] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(!block.url);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [linkInput, setLinkInput] = useState<string>("");
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(block.comments || []);
  const [newComment, setNewComment] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewSupported, setIsPreviewSupported] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Update parent component when file properties change
  useEffect(() => {
    onUpdate({
      ...block,
      url: fileUrl,
      title: fileName,
      fileSize: fileSize,
      comments: comments
    });
    
    // Determine file type from name
    if (fileName) {
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      const type = getFileType(fileName);
      setFileType(type);
      
      // Special handling for design files that need custom preview
      if ((extension === 'ai' || extension === 'psd' || extension === 'sketch' || 
          extension === 'fig' || extension === 'xd') && type === 'design') {
        setIsPreviewSupported(true);
      } else {
        // Check if file preview is supported for other types
        const supportedPreviewTypes = ['pdf', 'image', 'video', 'audio'];
        setIsPreviewSupported(supportedPreviewTypes.includes(type));
      }
    }
    
    // Determine if the file is embedded (external link) or uploaded
    if (fileUrl) {
      setIsEmbedded(fileUrl.startsWith('http') && !fileUrl.startsWith(window.location.origin));
    }
  }, [fileUrl, fileName, fileSize, comments]);
  
  // Handle drag and drop functionality
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add('border-blue-500', 'bg-blue-50');
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    };
    
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    
    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [dropAreaRef.current]);
  
  // Handle file upload and processing
  const handleFile = (file: File) => {
    if (!file) return;
    
    // Log file information for debugging
    console.info("Uploading file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // Set loading state
    setIsLoading(true);
    
    // Update file metadata
    setFileName(file.name);
    setFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileUrl(result);
      setIsUploadDialogOpen(false);
      setIsLoading(false);
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert('Error reading the file. Please try another file.');
      setIsLoading(false);
    };
    
    // For large files, inform the user this might take a while
    if (file.size > 50 * 1024 * 1024) { // If larger than 50MB
      alert('Large file detected. Upload might take a while.');
    }
    
    reader.readAsDataURL(file);
  };
  
  // Handle file input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };
  
  // Handle link input change
  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkInput(e.target.value);
  };
  
  // Check if URL is a valid file URL
  const isValidFileUrl = (url: string): boolean => {
    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Handle external link submission
  const handleLinkSubmit = () => {
    if (!linkInput) return;
    
    // Validate URL
    if (!isValidFileUrl(linkInput)) {
      alert('Please enter a valid URL');
      return;
    }
    
    // Handle different services
    if (linkInput.includes('drive.google.com')) {
      // Convert Google Drive link to embedded format
      const fileId = linkInput.match(/[-\w]{25,}/) || [''];
      const embedUrl = `https://drive.google.com/file/d/${fileId[0]}/preview`;
      setFileUrl(embedUrl);
      setFileName(`Google Drive: ${fileId[0]}`);
      setIsEmbedded(true);
    } else if (linkInput.includes('dropbox.com')) {
      // Convert Dropbox link to embedded format
      const embedUrl = linkInput.replace('dropbox.com', 'dropbox.com/s');
      setFileUrl(embedUrl);
      const fileName = linkInput.split('/').pop() || 'Dropbox File';
      setFileName(fileName);
      setIsEmbedded(true);
    } else {
      // For other direct file URLs
      setFileUrl(linkInput);
      const fileName = linkInput.split('/').pop() || 'External File';
      setFileName(fileName);
      setIsEmbedded(true);
    }
    
    setIsUploadDialogOpen(false);
  };
  
  // Handle file download
  const handleDownload = () => {
    if (!fileUrl) return;
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || `file-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle file rename
  const handleRename = () => {
    setIsRenaming(true);
    setNewFileName(fileName);
  };
  
  // Save new filename
  const saveNewFileName = () => {
    if (newFileName.trim()) {
      setFileName(newFileName.trim());
    }
    setIsRenaming(false);
  };
  
  // Handle file replacement
  const handleReplace = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Add new comment
  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Current User', // In a real app, this would come from auth
        avatar: '/avatars/user.png', // In a real app, this would come from auth
      },
      content: newComment.trim(),
      timestamp: new Date()
    };
    
    setComments([...comments, comment]);
    setNewComment('');
    
    // Focus back on input
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  
  // Delete comment
  const deleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };
  
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
  
  // Add reply function
  const addReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'User', // You might want to get this from your auth context
      },
      content: replyContent,
      timestamp: new Date(),
      parentId: parentId
    };

    const updatedComments = comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setReplyContent('');
    setReplyingTo(null);
  };

  // Delete reply function
  const deleteReply = (parentId: string, replyId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== replyId)
        };
      }
      return comment;
    });

    setComments(updatedComments);
  };

  // Function to handle emoji selection
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

  // Render comment with replies
  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-8 mt-3' : ''}`}>
      <Avatar className="h-8 w-8 border">
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-accent/5 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
          </div>
          <p className="text-sm text-foreground/90">{comment.content}</p>
        </div>
        <div className="flex gap-2 mt-1">
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-6 px-2"
              onClick={() => setReplyingTo(comment.id)}
            >
              Reply
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive h-6 px-2"
            onClick={() => isReply ? deleteReply(comment.parentId!, comment.id) : deleteComment(comment.id)}
          >
            Delete
          </Button>
        </div>
        
        {replyingTo === comment.id && (
          <div className="flex gap-2 items-start mt-3 ml-8">
            <Avatar className="h-8 w-8 border">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  id="replyComment"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full resize-none text-sm min-h-[60px] focus-visible:ring-primary pr-10"
                  rows={2}
                />
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-1">
                  {["👍", "❤️", "😊", "👏"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.preventDefault();
                        setReplyContent(prev => prev + emoji);
                      }}
                      className="hover:bg-accent/20 rounded p-1 transition-colors"
                    >
                      <span className="text-lg">{emoji}</span>
                    </button>
                  ))}
                </div>
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
          <div className="space-y-3 mt-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
      {fileUrl ? (
        <div className="my-4">
          <div 
            className="relative group w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-start group-hover:bg-accent/5 rounded-md p-4 transition-colors">
              <div className="flex-shrink-0 flex items-center self-stretch opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={2} align="start" className="w-[180px]">
                    <DropdownMenuItem 
                      className="flex items-center gap-2"
                      onClick={handleRename}
                    >
                      <Edit className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    {!isEmbedded && (
                      <DropdownMenuItem 
                        className="flex items-center gap-2"
                        onClick={handleReplace}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Replace
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="flex items-center gap-2"
                      onClick={() => setShowCommentsDialog(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Show Comments
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Convert to
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <div className="flex items-center gap-2 px-2 py-1.5 border-b">
                          <Search className="h-4 w-4 text-muted-foreground/70" />
                          <Input
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
                                    onClick={() => onConvert && onConvert(blockType.type as BlockType['type'])}
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
                    {onMoveUp && (
                      <DropdownMenuItem onClick={onMoveUp} className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4" />
                        Move up
                      </DropdownMenuItem>
                    )}
                    {onMoveDown && (
                      <DropdownMenuItem onClick={onMoveDown} className="flex items-center gap-2">
                        <ArrowDown className="h-4 w-4" />
                        Move down
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={onDelete} className="flex items-center gap-2 text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex-1 ml-2">
                {/* File content area */}
                <div className="w-full relative">
                  {/* Rename input */}
                  {isRenaming ? (
                    <div className="absolute inset-0 flex items-center justify-between p-3 bg-background/95 backdrop-blur-[2px] z-10 rounded-lg border border-accent/10">
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-background rounded-lg border shadow-sm">
                          <Edit className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="Enter file name"
                          className="flex-1 h-9"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveNewFileName();
                            } else if (e.key === 'Escape') {
                              setIsRenaming(false);
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsRenaming(false)}
                          className="h-9 px-3"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={saveNewFileName}
                          className="h-9 px-3"
                          disabled={!newFileName.trim() || newFileName.trim() === fileName}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  
                  {/* File preview */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between p-3 bg-accent/5 hover:bg-accent/10 rounded-lg border border-accent/10 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* File Icon */}
                        <div className="w-10 h-10 flex items-center justify-center bg-background rounded-lg border shadow-sm">
                          {fileType === 'pdf' && (
                            <div className="text-red-500">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          {fileType === 'image' && <ImageIcon className="h-5 w-5 text-blue-500" />}
                          {fileType === 'document' && <FileText className="h-5 w-5 text-blue-500" />}
                          {fileType === 'spreadsheet' && <Table className="h-5 w-5 text-green-500" />}
                          {fileType === 'presentation' && <Layout className="h-5 w-5 text-orange-500" />}
                          {fileType === 'design' && <Figma className="h-5 w-5 text-purple-500" />}
                          {fileType === 'video' && <Video className="h-5 w-5 text-red-500" />}
                          {fileType === 'audio' && <Music className="h-5 w-5 text-indigo-500" />}
                          {fileType === 'archive' && <File className="h-5 w-5 text-yellow-500" />}
                          {fileType === 'code' && <Code className="h-5 w-5 text-gray-500" />}
                          {fileType === 'other' && <FileIcon className="h-5 w-5 text-gray-500" />}
                        </div>
                        
                        {/* File Info */}
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-foreground truncate">{fileName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {fileName.split('.').pop()?.toUpperCase()} · {formatFileSize(fileSize)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={handleDownload}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Download
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowCommentsDialog(true)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Comments
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={handleRename}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Rename
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {isEmbedded ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                Open in new tab
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={handleReplace}
                                >
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                  />
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                Replace
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="flex items-center group-hover:bg-accent/5 rounded-md">
            <div className="flex-shrink-0 flex items-center self-stretch opacity-0 group-hover:opacity-100 transition-opacity duration-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab"
                  >
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
                        <Input
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
                                  onClick={() => onConvert && onConvert(blockType.type as BlockType['type'])}
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
                  {onMoveUp && (
                    <DropdownMenuItem onClick={onMoveUp} className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Move up
                    </DropdownMenuItem>
                  )}
                  {onMoveDown && (
                    <DropdownMenuItem onClick={onMoveDown} className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      Move down
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onDelete} className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1">
              <div 
                ref={dropAreaRef}
                className="flex flex-col items-center justify-center border-2 border-dashed border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/40 rounded-md p-8 min-h-[180px] transition-colors duration-200 cursor-pointer"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <FilePlus className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-base font-medium text-foreground mb-1">Add a file</h4>
                <p className="text-sm text-muted-foreground mb-4">Upload or embed a file</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-background border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Choose File</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments Dialog */}
      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent className="max-w-[600px] w-full h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row justify-between items-center border-b pb-3">
            <DialogTitle className="text-xl font-semibold">File Comments</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => setShowCommentsDialog(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col mt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Comments ({comments.length})</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground h-7"
                onClick={() => commentInputRef.current?.focus()}
              >
                Add comment
              </Button>
            </div>
            
            {/* Comments list */}
            <div className="space-y-4 mb-4 flex-1 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">No comments yet</p>
                  <p className="text-xs text-muted-foreground/70">Start the conversation by adding a comment below</p>
                </div>
              ) : (
                comments.filter(comment => !comment.parentId).map(comment => renderComment(comment))
              )}
            </div>
            
            {/* New comment input */}
            <div className="flex gap-2 items-start mt-auto border-t pt-3">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="relative">
                  <Textarea
                    id="mainComment"
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full resize-none text-sm min-h-[80px] focus-visible:ring-primary pr-10"
                    rows={3}
                  />
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-1">
                    {["👍", "❤️", "😊", "👏"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.preventDefault();
                          setNewComment(prev => prev + emoji);
                        }}
                        className="hover:bg-accent/20 rounded p-1 transition-colors"
                      >
                        <span className="text-lg">{emoji}</span>
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Upload dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl font-semibold">Add File</DialogTitle>
            <DialogClose asChild className="absolute right-4 top-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload" className="flex items-center gap-1.5">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="embed" className="flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4" />
                Embed Link
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="py-4">
              <div className="flex flex-col gap-4">
                <label className="border-2 border-dashed border-primary/20 rounded-md p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors bg-accent/5 relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-base font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-2">Support for all file types</p>
                  <Button variant="link" className="mt-4 text-primary font-medium">
                    Select a file
                  </Button>
                </label>
                {isLoading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-sm font-medium">Uploading file...</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="embed" className="py-4">
              <div className="flex flex-col gap-4">
                <div className="bg-accent/5 border border-accent/10 rounded-md p-6">
                  <h3 className="text-base font-medium mb-4 text-foreground">Paste a link to a file</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <Input
                      placeholder="Paste Google Drive, Dropbox or file URL"
                      value={linkInput}
                      onChange={handleLinkInputChange}
                      className="border-border focus-visible:ring-primary"
                    />
                    <Button 
                      onClick={handleLinkSubmit}
                      disabled={!linkInput}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Embed
                    </Button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 rounded-full p-2">
                        <FilePlus className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Google Drive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 rounded-full p-2">
                        <FileSymlink className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Dropbox</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-accent/20 rounded-full p-2">
                        <LinkIcon className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="text-sm">Direct URL</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileBlock; 