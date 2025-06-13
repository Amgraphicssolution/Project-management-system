import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Maximize,
  Minimize,
  GripVertical,
  Code,
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
  Image,
  FormInput,
  ListTree,
  ExternalLink,
  Figma,
  FileDigit,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MessageSquareText,
  Terminal,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Trash2,
  Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmojiPicker } from '@/components/EmojiPicker';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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
      { type: 'quote', icon: Quote, label: 'Quote' },
      { type: 'table', icon: Table, label: 'Table' },
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
    name: "Advanced Blocks",
    blocks: [
      { type: 'board', icon: Layout, label: 'Board' },
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

// Programming languages for the code block
const programmingLanguages = [
  // JavaScript & Related
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'deno', label: 'Deno' },
  { value: 'jquery', label: 'jQuery' },
  
  // Web Related
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'LESS' },
  { value: 'tailwindcss', label: 'Tailwind CSS' },
  { value: 'bootstrap', label: 'Bootstrap' },
  
  // Backend Languages
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'objectivec', label: 'Objective-C' },
  
  // Database & Query Languages
  { value: 'sql', label: 'SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'graphql', label: 'GraphQL' },
  
  // Markup & Data
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'latex', label: 'LaTeX' },
  
  // Shell & Scripting
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'shell', label: 'Shell' },
  { value: 'perl', label: 'Perl' },
  { value: 'lua', label: 'Lua' },
  
  // Functional Languages
  { value: 'haskell', label: 'Haskell' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'erlang', label: 'Erlang' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'scala', label: 'Scala' },
  { value: 'fsharp', label: 'F#' },
  
  // Mobile Development
  { value: 'dart', label: 'Dart' },
  { value: 'flutter', label: 'Flutter' },
  { value: 'reactnative', label: 'React Native' },
  
  // Game Development
  { value: 'unity', label: 'Unity C#' },
  { value: 'unreal', label: 'Unreal C++' },
  { value: 'godot', label: 'Godot' },
  
  // Legacy Languages
  { value: 'cobol', label: 'COBOL' },
  { value: 'fortran', label: 'Fortran' },
  { value: 'basic', label: 'BASIC' },
  { value: 'pascal', label: 'Pascal' },
  { value: 'vb', label: 'Visual Basic' },
  
  // Other
  { value: 'r', label: 'R' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'solidity', label: 'Solidity' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'prolog', label: 'Prolog' },
  { value: 'plaintext', label: 'Plain Text' },
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

interface CodeBlockProps {
  block: BlockType;
  onUpdate: (updatedBlock: BlockType) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvert?: (newType: BlockType['type']) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert
}) => {
  // State for the code block
  const [code, setCode] = useState<string>(block.content || '');
  const [language, setLanguage] = useState<string>(block.language || 'javascript');
  const [caption, setCaption] = useState<string>(block.title || '');
  const [showCaption, setShowCaption] = useState<boolean>(!!block.title);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLanguages, setFilteredLanguages] = useState(programmingLanguages);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(block.comments || []);
  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  
  // Constants
  const LINE_HEIGHT = 24.5; // Approximate line height in pixels
  const MAX_VISIBLE_LINES = 20; // Maximum number of lines before showing expand button
  
  // Refs
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Calculate number of lines in the code
  const lineCount = code.split('\n').length;
  const shouldShowExpandButton = lineCount > MAX_VISIBLE_LINES;
  
  // Update parent component when code, language or caption changes
  useEffect(() => {
    onUpdate({
      ...block,
      content: code,
      language: language,
      title: caption,
      comments: comments
    });
  }, [code, language, caption, comments]);
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };
  
  // Handle code change
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  // Handle caption toggle
  const handleCaptionToggle = () => {
    if (showCaption) {
      setShowCaption(false);
      setCaption('');
    } else {
      setShowCaption(true);
    }
  };
  
  // Handle language search
  const handleLanguageSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      // Filter languages but keep the full array structure
      setFilteredLanguages(
        programmingLanguages.filter(lang => 
          lang.label.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredLanguages(programmingLanguages);
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
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
        
        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-2 ml-8">
            <div className="flex gap-2">
              <Avatar className="h-6 w-6 border">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="relative">
                  <Textarea
                    id="replyComment"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px] resize-none pr-10"
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
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => addReply(comment.id)}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div 
      ref={containerRef}
      className="group relative w-full my-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block controls */}
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
                              onClick={() => onConvert && onConvert(blockType.type)}
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
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => setShowCommentsDialog(true)}
              >
                <MessageSquare className="h-4 w-4" />
                Show Comments
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1">
          {/* Code block container */}
          <div className="border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-sm">
            {/* Code block header */}
            <div className="flex items-center justify-between p-3 border-b bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center gap-2 w-1/2">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-9 w-full border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="flex items-center border rounded-sm px-2 mb-2 sticky top-0 bg-background z-10">
                      <Search className="h-4 w-4 text-muted-foreground mr-2" />
                      <Input 
                        placeholder="Search languages..." 
                        className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        value={searchQuery}
                        onChange={(e) => handleLanguageSearch(e.target.value)}
                      />
                    </div>
                    
                    {/* JavaScript & Related */}
                    <SelectGroup>
                      <SelectLabel>JavaScript & Related</SelectLabel>
                      {filteredLanguages
                        .filter(lang => ['javascript', 'typescript', 'jsx', 'tsx', 'react', 'nextjs', 'vue', 'angular', 'svelte', 'nodejs', 'deno', 'jquery'].includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    
                    {/* Web Related */}
                    <SelectGroup>
                      <SelectLabel>Web Related</SelectLabel>
                      {filteredLanguages
                        .filter(lang => ['html', 'css', 'scss', 'less', 'tailwindcss', 'bootstrap'].includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    
                    {/* Backend Languages */}
                    <SelectGroup>
                      <SelectLabel>Backend Languages</SelectLabel>
                      {filteredLanguages
                        .filter(lang => ['python', 'java', 'csharp', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift'].includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    
                    {/* Systems & Low-level */}
                    <SelectGroup>
                      <SelectLabel>Systems & Low-level</SelectLabel>
                      {filteredLanguages
                        .filter(lang => ['c', 'cpp', 'objectivec', 'assembly'].includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    
                    {/* Database & Query */}
                    <SelectGroup>
                      <SelectLabel>Database & Query</SelectLabel>
                      {filteredLanguages
                        .filter(lang => ['sql', 'mysql', 'postgresql', 'mongodb', 'graphql'].includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    
                    {/* Markup & Data */}
                    <SelectGroup>
                      <SelectLabel>Markup & Data</SelectLabel>
                      {filteredLanguages
                        .filter(lang => ['json', 'yaml', 'xml', 'markdown', 'latex'].includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    
                    {/* Shell & Scripting */}
                    <SelectGroup>
                      <SelectLabel>Shell & Scripting</SelectLabel>
                      {filteredLanguages
                        .filter(lang => ['bash', 'powershell', 'shell', 'perl', 'lua'].includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    
                    {/* Other Languages */}
                    <SelectGroup>
                      <SelectLabel>Other Languages</SelectLabel>
                      {filteredLanguages
                        .filter(lang => 
                          !['javascript', 'typescript', 'jsx', 'tsx', 'react', 'nextjs', 'vue', 'angular', 'svelte', 'nodejs', 'deno', 'jquery',
                            'html', 'css', 'scss', 'less', 'tailwindcss', 'bootstrap',
                            'python', 'java', 'csharp', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift',
                            'c', 'cpp', 'objectivec', 'assembly',
                            'sql', 'mysql', 'postgresql', 'mongodb', 'graphql',
                            'json', 'yaml', 'xml', 'markdown', 'latex',
                            'bash', 'powershell', 'shell', 'perl', 'lua'].includes(lang.value)
                        )
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
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
                        onClick={handleCaptionToggle}
                      >
                        <MessageSquareText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {showCaption ? "Hide caption" : "Add caption"}
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
                        onClick={handleCopy}
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {isCopied ? "Copied" : "Copy"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Code content */}
            <div className={cn(
              "relative",
              !isExpanded && shouldShowExpandButton ? "max-h-[480px] overflow-hidden" : ""
            )}>
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute top-0 left-0 bottom-0 w-10 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 text-right pr-2 pt-4 select-none">
                  {Array.from({ length: lineCount }).map((_, i) => (
                    <div key={i} className="text-xs text-slate-500 leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  ref={codeRef}
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full font-mono text-sm p-4 pl-12 bg-slate-50 dark:bg-slate-900 min-h-[200px] outline-none resize-none"
                  style={{
                    height: isExpanded || !shouldShowExpandButton 
                      ? `${Math.max(lineCount * LINE_HEIGHT, 100)}px` 
                      : `${Math.min(MAX_VISIBLE_LINES * LINE_HEIGHT, lineCount * LINE_HEIGHT)}px`
                  }}
                  placeholder="Enter your code here..."
                  spellCheck={false}
                />
              </div>
            </div>
            
            {/* Expand/Collapse button */}
            {shouldShowExpandButton && (
              <div className="flex justify-center border-t p-2 bg-slate-100 dark:bg-slate-800">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 text-xs text-muted-foreground border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {isExpanded ? (
                    <>
                      <Minimize className="h-3 w-3 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <Maximize className="h-3 w-3 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Caption */}
          {showCaption && (
            <div className="mt-3">
              <div className="flex items-center gap-2 px-1">
                <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="text-sm text-muted-foreground border-none p-0 focus-visible:ring-0 focus-visible:border-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent className="max-w-[600px] w-full h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row justify-between items-center border-b pb-3">
            <DialogTitle className="text-xl font-semibold">Code Comments</DialogTitle>
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
            <div className="border-t pt-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="relative">
                    <Textarea
                      ref={commentInputRef}
                      id="mainComment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full text-sm p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] resize-none pr-10"
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
                      onClick={addComment} 
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeBlock; 