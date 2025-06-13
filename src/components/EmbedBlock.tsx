import React, { useState, useRef, useEffect } from 'react';
import { BlockType } from '@/types/block';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, GripVertical, MoreHorizontal, ArrowUp, ArrowDown, 
  Trash2, LayoutGrid, Search, Music, FileIcon, Image as ImageIcon, 
  Video as VideoIcon, Maximize, X, Figma, FileDigit, FileText,
  Type, List, ListOrdered, CheckSquare, Quote, Table, Minus, Code,
  Layout, FormInput, ListTree
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, 
  DropdownMenuSubTrigger, DropdownMenuSubContent 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmbedBlockProps {
  block: BlockType;
  onUpdate: (updatedBlock: BlockType) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvert?: (newType: BlockType['type']) => void;
}

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
      { type: 'image', icon: ImageIcon, label: 'Image' },
      { type: 'video', icon: VideoIcon, label: 'Video' },
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

const EmbedBlock: React.FC<EmbedBlockProps> = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert
}) => {
  // State for the embed
  const [embedUrl, setEmbedUrl] = useState<string>(block.url || '');
  const [caption, setCaption] = useState<string>(block.content || '');
  const [showCaption, setShowCaption] = useState<boolean>(!!block.content);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(!block.url);
  const [linkInput, setLinkInput] = useState<string>("");
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(block.width || 100); // Width in percentage
  const [embedType, setEmbedType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [embedError, setEmbedError] = useState<boolean>(false);
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  
  // Constants for embed sizing
  const MAX_WIDTH_PERCENTAGE = 100;
  const MIN_WIDTH_PERCENTAGE = 40;
  const DEFAULT_WIDTH_PERCENTAGE = 100;
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const parentWidthRef = useRef<number>(0);
  
  // Update parent component when embed or caption changes
  useEffect(() => {
    onUpdate({
      ...block,
      url: embedUrl,
      content: caption,
      width
    });
    
    // Determine embed type based on URL
    if (embedUrl) {
      detectEmbedType(embedUrl);
    }
  }, [embedUrl, caption, width]);
  
  // Detect the type of embed from the URL
  const detectEmbedType = (url: string) => {
    if (url.includes('spotify.com')) {
      setEmbedType('spotify');
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setEmbedType('youtube');
    } else if (url.includes('vimeo.com')) {
      setEmbedType('vimeo');
    } else if (url.includes('codepen.io')) {
      setEmbedType('codepen');
    } else if (url.includes('drive.google.com')) {
      setEmbedType('gdrive');
    } else if (url.includes('maps.google.com') || url.includes('google.com/maps')) {
      setEmbedType('gmaps');
    } else if (url.includes('figma.com')) {
      setEmbedType('figma');
    } else if (url.endsWith('.pdf') || url.includes('/pdf/')) {
      setEmbedType('pdf');
    } else {
      setEmbedType('generic');
    }
  };
  
  // Handle link input change
  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkInput(e.target.value);
  };
  
  // Handle link submit
  const handleLinkSubmit = () => {
    if (!linkInput) return;
    
    // Process the URL based on the service
    let processedUrl = linkInput;
    
    // Spotify
    if (linkInput.includes('spotify.com')) {
      if (linkInput.includes('spotify.com/track/')) {
        // Convert Spotify track URL to embed URL
        processedUrl = linkInput.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/');
      } else if (linkInput.includes('spotify.com/album/')) {
        processedUrl = linkInput.replace('open.spotify.com/album/', 'open.spotify.com/embed/album/');
      } else if (linkInput.includes('spotify.com/playlist/')) {
        processedUrl = linkInput.replace('open.spotify.com/playlist/', 'open.spotify.com/embed/playlist/');
      }
    }
    // YouTube
    else if (linkInput.includes('youtube.com/watch') || linkInput.includes('youtu.be/')) {
      const videoId = getYouTubeVideoId(linkInput);
      if (videoId) {
        processedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    // Vimeo
    else if (linkInput.includes('vimeo.com/')) {
      const vimeoId = linkInput.match(/vimeo\.com\/([0-9]+)/);
      if (vimeoId && vimeoId[1]) {
        processedUrl = `https://player.vimeo.com/video/${vimeoId[1]}`;
      }
    }
    // CodePen
    else if (linkInput.includes('codepen.io/')) {
      if (linkInput.includes('/pen/')) {
        processedUrl = linkInput.replace('/pen/', '/embed/');
      }
    }
    // Google Drive
    else if (linkInput.includes('drive.google.com/file/d/')) {
      const fileId = linkInput.match(/file\/d\/([^\/]+)/) || ['', ''];
      processedUrl = `https://drive.google.com/file/d/${fileId[1]}/preview`;
    }
    // Google Maps
    else if (linkInput.includes('maps.google.com') || linkInput.includes('google.com/maps')) {
      if (linkInput.includes('@')) {
        const coords = linkInput.match(/@([^,]+),([^,]+),([^z]+)z/);
        if (coords) {
          processedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${coords[2]}!3d${coords[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1624451234567!5m2!1sen!2sus`;
        }
      }
    }
    
    setEmbedUrl(processedUrl);
    detectEmbedType(processedUrl);
    setIsUploadDialogOpen(false);
  };
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Handle caption toggle
  const handleCaptionToggle = () => {
    setShowCaption(!showCaption);
    if (!showCaption && !caption) {
      setTimeout(() => {
        const captionInput = document.getElementById(`caption-${block.id}`);
        if (captionInput) {
          captionInput.focus();
        }
      }, 0);
    }
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current || !containerRef.current.parentElement) return;
    
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = containerRef.current.offsetWidth;
    parentWidthRef.current = containerRef.current.parentElement.offsetWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current || !containerRef.current.parentElement) return;
      
      const delta = moveEvent.clientX - startXRef.current;
      
      // Calculate new width based on the delta (same formula for both sides)
      const deltaWidth = direction === 'right' ? delta : -delta;
      const newWidth = startWidthRef.current + deltaWidth * 2; // Multiply by 2 to expand equally from both sides
      
      // Calculate width as percentage of parent, with min/max constraints
      const widthPercentage = Math.max(
        MIN_WIDTH_PERCENTAGE, 
        Math.min(MAX_WIDTH_PERCENTAGE, (newWidth / parentWidthRef.current) * 100)
      );
      
      setWidth(widthPercentage);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle replace
  const handleReplace = () => {
    setIsUploadDialogOpen(true);
  };
  
  // Get icon based on embed type
  const getEmbedIcon = () => {
    switch (embedType) {
      case 'spotify':
        return <Music className="h-8 w-8 text-green-500" />;
      case 'youtube':
      case 'vimeo':
        return <VideoIcon className="h-8 w-8 text-red-500" />;
      case 'codepen':
        return <FileIcon className="h-8 w-8 text-blue-500" />;
      case 'gdrive':
        return <FileIcon className="h-8 w-8 text-blue-500" />;
      case 'gmaps':
        return <FileIcon className="h-8 w-8 text-green-500" />;
      case 'figma':
        return <Figma className="h-8 w-8 text-purple-500" />;
      case 'pdf':
        return <FileDigit className="h-8 w-8 text-red-500" />;
      default:
        return <ExternalLink className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // If no embed is set, show upload dialog
  if (!embedUrl) {
    return (
      <div className="relative group">
        <div className="flex items-center group-hover:bg-accent/5 rounded-sm">
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
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 h-5 bg-transparent border-0 outline-none text-sm focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
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
              className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <ExternalLink className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center">
                Add an embed from Spotify, YouTube, Google Drive, CodePen, and more.
              </p>
              <Button
                variant="link"
                className="mt-2 text-blue-500"
              >
                Add embed
              </Button>
            </div>
          </div>
        </div>
        
        {/* Upload dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Add an embed</h2>
              <p className="text-sm text-muted-foreground">
                Paste a link from Spotify, YouTube, Google Drive, CodePen, Google Maps, and more.
              </p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Paste embed URL here"
                    value={linkInput}
                    onChange={handleLinkInputChange}
                  />
                  <Button 
                    onClick={handleLinkSubmit}
                    disabled={!linkInput}
                  >
                    Embed
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Supported platforms: Spotify, YouTube, Vimeo, Google Drive, Google Maps, CodePen, and more
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Add drag handle */}
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
        
        {/* Main embed block content */}
        <div className="flex-1">
          <div 
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              ref={containerRef}
              className="relative overflow-hidden rounded-md"
              style={{ width: `${width}%`, maxWidth: "900px" }}
            >
              {/* Resize handles */}
              <div 
                className={cn(
                  "absolute top-0 left-0 w-1 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:opacity-100 z-10",
                  isResizing && "opacity-100 bg-blue-500"
                )}
                onMouseDown={(e) => handleResizeStart(e, 'left')}
              />
              <div 
                className={cn(
                  "absolute top-0 right-0 w-1 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:opacity-100 z-10",
                  isResizing && "opacity-100 bg-blue-500"
                )}
                onMouseDown={(e) => handleResizeStart(e, 'right')}
              />
              
              {/* Embed content */}
              {showPlaceholder ? (
                <div className="w-full aspect-video bg-gray-100 rounded-md flex flex-col items-center justify-center">
                  <ExternalLink className="h-16 w-16 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Embed could not be loaded</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-blue-500"
                    onClick={() => window.open(embedUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View original
                  </Button>
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-50 rounded-md overflow-hidden">
                  <iframe
                    src={embedUrl}
                    title={caption || "Embedded content"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    onError={() => setShowPlaceholder(true)}
                  ></iframe>
                </div>
              )}
              
              {/* Hover actions */}
              <div
                className={cn(
                  "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                  onClick={handleCaptionToggle}
                >
                  <span className="text-xs font-medium">Aa</span>
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                  onClick={() => window.open(embedUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                  onClick={handleReplace}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Caption */}
            {showCaption && (
              <div className="mt-2 w-full" style={{ width: `${width}%`, maxWidth: "90%" }}>
                <Input
                  id={`caption-${block.id}`}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="text-sm text-center border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex items-center justify-center bg-transparent">
          <DialogClose className="absolute right-4 top-4 z-10">
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/80 hover:bg-white">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
          
          <div className="w-full max-w-4xl h-full max-h-[80vh] bg-white rounded-lg overflow-hidden shadow-xl">
            <iframe
              src={embedUrl}
              title={caption || "Embedded content"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          
          {caption && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2">
              {caption}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Upload dialog for replacement */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Replace embed</h2>
            <p className="text-sm text-muted-foreground">
              Paste a link from Spotify, YouTube, Google Drive, CodePen, Google Maps, and more.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Paste embed URL here"
                  value={linkInput}
                  onChange={handleLinkInputChange}
                />
                <Button 
                  onClick={handleLinkSubmit}
                  disabled={!linkInput}
                >
                  Embed
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Supported platforms: Spotify, YouTube, Vimeo, Google Drive, Google Maps, CodePen, and more
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmbedBlock; 