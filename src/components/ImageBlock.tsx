import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Maximize, 
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
  FileDigit
} from 'lucide-react';
import { cn, shouldUseTopAlignedGrip } from '@/lib/utils';
import { BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ImageBlockProps {
  block: BlockType;
  onUpdate: (updatedBlock: BlockType) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvert?: (newType: BlockType['type']) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ 
  block, 
  onUpdate, 
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert
}) => {
  // State for the image
  const [imageUrl, setImageUrl] = useState<string>(block.url || '');
  const [caption, setCaption] = useState<string>(block.content || '');
  const [showCaption, setShowCaption] = useState<boolean>(!!block.content);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(!block.url);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [linkInput, setLinkInput] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(block.width || 100); // Width in percentage
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageError, setImageError] = useState<boolean>(false);
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  
  // Constants for image sizing
  const MAX_WIDTH_PERCENTAGE = 100; // Reduced from 150% to 90% to prevent controls from being hidden
  const MIN_WIDTH_PERCENTAGE = 40;  // Minimum width as percentage of parent container
  const DEFAULT_WIDTH_PERCENTAGE = 100; // Default width when resizing from center
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const parentWidthRef = useRef<number>(0);
  
  // Update parent component when image or caption changes
  useEffect(() => {
    onUpdate({
      ...block,
      url: imageUrl,
      content: caption,
      width
    });
    
    // Determine if the image is embedded (external link) or uploaded
    if (imageUrl) {
      setIsEmbedded(imageUrl.startsWith('http') && !imageUrl.startsWith(window.location.origin));
    }
  }, [imageUrl, caption, width]);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        setShowPlaceholder(false);
        setIsUploadDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle link input change
  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkInput(url);
    
    // Set preview URL if it's a valid image URL
    if (url && isValidImageUrl(url)) {
      setPreviewUrl(url);
      setImageError(false);
    } else {
      setPreviewUrl("");
    }
  };
  
  // Check if URL is likely an image
  const isValidImageUrl = (url: string): boolean => {
    // Simple check for common image extensions or image-related terms
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
    return (
      extensions.some(ext => url.toLowerCase().includes(ext)) || 
      url.toLowerCase().includes('image') ||
      url.startsWith('data:image/') ||
      /\.(com|net|org|io)\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)/i.test(url)
    );
  };
  
  // Handle link submit
  const handleLinkSubmit = () => {
    if (linkInput) {
      // Create a new Image to test loading
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully
        setImageUrl(linkInput);
        setShowPlaceholder(false);
        setIsEmbedded(true);
        setIsUploadDialogOpen(false);
      };
      img.onerror = () => {
        // Image failed to load, but still set the URL and show placeholder
        setImageUrl(linkInput);
        setShowPlaceholder(true);
        setIsEmbedded(true);
        setIsUploadDialogOpen(false);
      };
      img.src = linkInput;
    }
  };
  
  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setShowPlaceholder(true);
  };
  
  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle caption toggle
  const handleCaptionToggle = () => {
    setShowCaption(!showCaption);
    if (!showCaption && !caption) {
      // Focus the caption input when enabling caption
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

  // Function to check if an image URL is from a common image hosting service
  const isImageHostingService = (url: string): boolean => {
    const services = [
      'pexels.com', 'unsplash.com', 'pixabay.com', 'imgur.com', 
      'cloudinary.com', 'imgbb.com', 'flickr.com', 'photobucket.com',
      'googleusercontent.com', 'ggpht.com', 'ytimg.com', 'twimg.com',
      'fbcdn.net', 'pinimg.com', 'giphy.com'
    ];
    return services.some(service => url.includes(service));
  };
  
  // If no image is set, show upload dialog
  if (!imageUrl) {
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
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 min-h-[200px]">
              <Button 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Image
              </Button>
            </div>
          </div>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-xl font-semibold">Add Image</DialogTitle>
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
                  <div className="bg-accent/5 border-2 border-dashed border-accent/20 rounded-md p-8 text-center cursor-pointer hover:bg-accent/10 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF supported</p>
                    </label>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="embed" className="py-4">
                <div className="flex flex-col gap-4">
                  <div className="bg-accent/5 border border-accent/10 rounded-md p-6">
                    <h3 className="text-base font-medium mb-4 text-foreground">Paste a link to an image</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        placeholder="Paste image URL here"
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
                    <p className="text-xs text-muted-foreground">
                      Embed images from services like Pexels, Unsplash, or any direct image URL
                    </p>
                    
                    {/* Image Preview */}
                    {previewUrl && (
                      <div className="mt-4 border rounded-md overflow-hidden">
                        <div className="relative aspect-video bg-background flex items-center justify-center">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain"
                            onError={handleImageError}
                            crossOrigin={isImageHostingService(previewUrl) ? "anonymous" : undefined}
                          />
                          {imageError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/5 text-muted-foreground">
                              <ImageIcon className="h-10 w-10 mb-2 opacity-30" />
                              <p className="text-sm">Unable to load image preview</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return (
    <div className="relative group">
      <div className="flex items-center group-hover:bg-accent/5 rounded-sm">
        <div className={cn(
          "flex-shrink-0 flex self-stretch opacity-0 group-hover:opacity-100 transition-opacity duration-100",
          shouldUseTopAlignedGrip(block.type) ? "items-start pt-4" : "items-center"
        )}>
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
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              ref={containerRef}
              className="relative overflow-hidden"
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
              
              {/* Image with potential placeholder fallback */}
              {showPlaceholder ? (
                <div className="w-full aspect-video bg-gray-100 rounded-md flex flex-col items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Image could not be loaded</p>
                  {isEmbedded && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-blue-500"
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View original
                    </Button>
                  )}
                </div>
              ) : (
                <img 
                  ref={imageRef}
                  src={imageUrl} 
                  alt={caption || "Image"} 
                  className="w-full h-auto rounded-md"
                  onError={() => {
                    setShowPlaceholder(true);
                  }}
                  crossOrigin={isImageHostingService(imageUrl) ? "anonymous" : undefined}
                />
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
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
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
                
                {isEmbedded && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                    onClick={() => window.open(imageUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
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
          <div className="w-full h-full flex items-center justify-center p-8">
            {showPlaceholder ? (
              <div className="bg-gray-800 p-8 rounded-md flex flex-col items-center justify-center">
                <ImageIcon className="h-24 w-24 text-gray-400 mb-4" />
                <p className="text-lg text-white">Image could not be loaded</p>
                {isEmbedded && (
                  <Button 
                    variant="outline" 
                    className="mt-4 text-white border-white hover:bg-white/10"
                    onClick={() => window.open(imageUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View original image
                  </Button>
                )}
              </div>
            ) : (
              <img 
                src={imageUrl} 
                alt={caption || "Image"} 
                className="max-w-full max-h-full object-contain"
                onError={() => setShowPlaceholder(true)}
                crossOrigin={isImageHostingService(imageUrl) ? "anonymous" : undefined}
              />
            )}
          </div>
          {caption && !showPlaceholder && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2">
              {caption}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageBlock; 