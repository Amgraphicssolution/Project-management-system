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
  MessageSquareText,
  Terminal,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  
  // Constants
  const LINE_HEIGHT = 24.5; // Approximate line height in pixels
  const MAX_VISIBLE_LINES = 20; // Maximum number of lines before showing expand button
  
  // Refs
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate number of lines in the code
  const lineCount = code.split('\n').length;
  const shouldShowExpandButton = lineCount > MAX_VISIBLE_LINES;
  
  // Update parent component when code, language or caption changes
  useEffect(() => {
    onUpdate({
      ...block,
      content: code,
      language: language,
      title: caption
    });
  }, [code, language, caption]);
  
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCaptionToggle} 
                  className="h-9 px-3 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <MessageSquareText className="h-4 w-4 mr-1" />
                  {showCaption ? "Hide caption" : "Add caption"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy} 
                  className="h-9 px-3 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {isCopied ? "Copied" : "Copy"}
                </Button>
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
    </div>
  );
};

export default CodeBlock; 