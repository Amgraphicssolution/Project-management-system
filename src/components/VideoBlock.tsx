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
  Video as VideoIcon,
  Music,
  FileIcon,
  Code,
  FormInput,
  ListTree,
  Figma,
  FileDigit,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Slider } from "@/components/ui/slider";

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
      { type: 'video', icon: VideoIcon, label: 'Video' },
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

interface VideoBlockProps {
  block: BlockType;
  onUpdate: (updatedBlock: BlockType) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvert?: (newType: BlockType['type']) => void;
}

const VideoBlock: React.FC<VideoBlockProps> = ({ 
  block, 
  onUpdate, 
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert
}) => {
  // State for the video
  const [videoUrl, setVideoUrl] = useState<string>(block.url || '');
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
  const [videoError, setVideoError] = useState<boolean>(false);
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(false);
  const [isYoutubeVideo, setIsYoutubeVideo] = useState<boolean>(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>("");
  
  // Constants for video sizing
  const MAX_WIDTH_PERCENTAGE = 100;
  const MIN_WIDTH_PERCENTAGE = 40;
  const DEFAULT_WIDTH_PERCENTAGE = 100;
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const parentWidthRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update parent component when video or caption changes
  useEffect(() => {
    onUpdate({
      ...block,
      url: videoUrl,
      content: caption,
      width
    });
    
    // Determine if the video is embedded (external link) or uploaded
    if (videoUrl) {
      setIsEmbedded(videoUrl.startsWith('http') && !videoUrl.startsWith(window.location.origin));
      
      // Check if YouTube video
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = videoUrl.match(youtubeRegex);
      
      if (match && match[1]) {
        setIsYoutubeVideo(true);
        setYoutubeVideoId(match[1]);
      } else {
        setIsYoutubeVideo(false);
        setYoutubeVideoId("");
      }
    }
  }, [videoUrl, caption, width]);
  
  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [videoRef.current]);
  
  // Control playback
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Handle controls visibility timeout
  useEffect(() => {
    if (isControlsVisible && !isHovered) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isControlsVisible, isHovered]);
  
  // Format time for display (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Log file information for debugging
      console.info("Uploading video file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Remove strict video/* MIME type validation since some browsers may not correctly identify all formats
      // Instead, check the file extension
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.m4v', '.3gp', '.ts'];
      const isValidVideoFile = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidVideoFile) {
        alert('Please upload a valid video file (MP4, WEBM, OGG, MKV, etc.)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setVideoUrl(result);
        setIsUploadDialogOpen(false);
        
        // Test if the video is playable - show placeholder if not
        const testVideo = document.createElement('video');
        testVideo.muted = true;
        testVideo.preload = 'metadata';
        
        testVideo.onloadedmetadata = () => {
          console.info("Video loaded successfully");
          setShowPlaceholder(false);
        };
        
        testVideo.onerror = () => {
          console.warn("Browser cannot play this video format directly");
          setShowPlaceholder(true);
        };
        
        // Test the video
        testVideo.src = result;
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert('Error reading the video file. Please try another file.');
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Handle link input change
  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkInput(url);
    
    // Check if it's a YouTube URL
    const youtubeId = getYouTubeVideoId(url);
    
    if (youtubeId) {
      setPreviewUrl(`https://img.youtube.com/vi/${youtubeId}/0.jpg`);
      setVideoError(false);
    } else if (isValidVideoUrl(url)) {
      setPreviewUrl(url);
      setVideoError(false);
    } else {
      setPreviewUrl("");
    }
  };
  
  // Check if URL is likely a video
  const isValidVideoUrl = (url: string): boolean => {
    // Simple check for common video extensions or video-related terms
    const extensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.m4v', '.3gp', '.ts'];
    return (
      extensions.some(ext => url.toLowerCase().includes(ext)) || 
      url.toLowerCase().includes('video') ||
      url.startsWith('data:video/') ||
      /\.(com|net|org|io)\/.*\.(mp4|webm|ogg|mov|avi|mkv|m4v)/i.test(url) ||
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com')
    );
  };

  // Handle link submit
  const handleLinkSubmit = () => {
    if (linkInput) {
      const youtubeId = getYouTubeVideoId(linkInput);
      
      if (youtubeId) {
        // It's a YouTube video
        const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
        setVideoUrl(embedUrl);
        setIsYoutubeVideo(true);
        setYoutubeVideoId(youtubeId);
        setShowPlaceholder(false);
        setIsEmbedded(true);
        setIsUploadDialogOpen(false);
      } else {
        // Try as a direct video URL
        const video = document.createElement('video');
        video.onloadeddata = () => {
          setVideoUrl(linkInput);
          setShowPlaceholder(false);
          setIsEmbedded(true);
          setIsUploadDialogOpen(false);
        };
        video.onerror = () => {
          setVideoUrl(linkInput);
          setShowPlaceholder(true);
          setIsEmbedded(true);
          setIsUploadDialogOpen(false);
        };
        video.src = linkInput;
      }
    }
  };
  
  // Handle video load error
  const handleVideoError = () => {
    console.error("Error loading video:", videoUrl);
    setVideoError(true);
    setShowPlaceholder(true);

    // Log more details about supported video formats
    if (videoRef.current) {
      console.info("Browser video support info:", {
        canPlayMp4: videoRef.current.canPlayType('video/mp4'),
        canPlayWebm: videoRef.current.canPlayType('video/webm'),
        canPlayOgg: videoRef.current.canPlayType('video/ogg'),
        // Check for MKV - most browsers won't support this natively
        canPlayMkv: videoRef.current.canPlayType('video/x-matroska')
      });
    }
  };
  
  // Handle download (only for direct video links, not YouTube)
  const handleDownload = () => {
    if (!isYoutubeVideo && videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
  
  // Handle playback controls
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
    if (newValue[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleTimelineChange = (newValue: number[]) => {
    if (videoRef.current && !isNaN(duration) && duration > 0) {
      const newTime = (newValue[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // If no video is set, show upload dialog
  if (!videoUrl) {
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
                Add Video
              </Button>
            </div>
          </div>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Video</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="embed">Embed Link</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="py-4">
                <div className="flex flex-col gap-4">
                  <label className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="video/*,.mkv,.mp4,.webm,.ogg,.mov,.avi,.wmv,.flv,.m4v,.3gp,.ts"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">MP4, WEBM, MKV, OGG and other formats supported</p>
                  </label>
                </div>
              </TabsContent>
              <TabsContent value="embed" className="py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Paste video URL here"
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
                  <p className="text-xs text-gray-400 mb-2">
                    Embed videos from YouTube, Vimeo, or any direct video URL
                  </p>
                  
                  {/* Video Preview */}
                  {previewUrl && (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain"
                          onError={handleVideoError}
                        />
                        {videoError && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                            <VideoIcon className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">Unable to load video preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <DialogClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
          <div 
            className="relative flex flex-col items-center"
            onMouseEnter={() => {
              setIsHovered(true);
              setIsControlsVisible(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
            }}
            onMouseMove={() => {
              setIsControlsVisible(true);
            }}
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
              
              {/* Video with potential placeholder fallback */}
              {showPlaceholder ? (
                <div className="w-full aspect-video bg-gray-800 rounded-md flex flex-col items-center justify-center p-8">
                  <VideoIcon className="h-24 w-24 text-gray-400 mb-4" />
                  <p className="text-lg text-white">Video could not be played in browser</p>
                  <p className="text-sm text-gray-300 mt-1 mb-4">This video format is not supported for in-browser playback</p>
                  {isEmbedded && (
                    <Button 
                      variant="outline" 
                      className="mt-4 text-white border-white hover:bg-white/10"
                      onClick={() => window.open(videoUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View original video
                    </Button>
                  )}
                </div>
              ) : isYoutubeVideo ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={videoUrl}
                    title={caption || "Video"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="w-full aspect-video bg-black rounded-md relative">
                  <video 
                    ref={videoRef}
                    src={videoUrl} 
                    className="w-full h-full rounded-md"
                    onError={handleVideoError}
                    onClick={togglePlayPause}
                    controls={false}
                    playsInline
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/webm" />
                    <source src={videoUrl} type="video/ogg" />
                    <p>Your browser doesn't support HTML5 video.</p>
                  </video>
                  
                  {/* Custom controls */}
                  <div 
                    className={cn(
                      "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 transition-opacity duration-200",
                      isControlsVisible ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {/* Progress bar */}
                    <div className="mb-2">
                      <Slider
                        value={[!isNaN(duration) && duration > 0 ? (currentTime / duration) * 100 : 0]}
                        min={0}
                        max={100}
                        step={0.1}
                        onValueChange={handleTimelineChange}
                        className="h-1.5"
                      />
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      {/* Play/Pause button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {/* Time display */}
                      <div className="text-xs text-white">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                      
                      {/* Spacer */}
                      <div className="flex-1"></div>
                      
                      {/* Volume control */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={toggleMute}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="w-20">
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                      
                      {/* Fullscreen button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => setIsFullscreen(true)}
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Center play button (when paused) */}
                  {!isPlaying && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={togglePlayPause}
                    >
                      <div className="bg-black/50 rounded-full p-4">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Hover actions (only for top-right corner) */}
              <div 
                className={cn(
                  "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                {!isYoutubeVideo && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                
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
                    onClick={() => window.open(videoUrl, '_blank')}
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
                <VideoIcon className="h-24 w-24 text-gray-400 mb-4" />
                <p className="text-lg text-white">Video could not be played in browser</p>
                <p className="text-sm text-gray-300 mt-1 mb-4">This video format is not supported for in-browser playback</p>
                {isEmbedded && (
                  <Button 
                    variant="outline" 
                    className="mt-4 text-white border-white hover:bg-white/10"
                    onClick={() => window.open(videoUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View original video
                  </Button>
                )}
              </div>
            ) : isYoutubeVideo ? (
              <div className="w-full h-full max-w-5xl max-h-[80vh]">
                <iframe
                  src={videoUrl}
                  title={caption || "Video"}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="relative w-full h-full max-w-5xl max-h-[80vh] bg-black">
                <video 
                  src={videoUrl} 
                  className="w-full h-full object-contain"
                  onError={() => setShowPlaceholder(true)}
                  controls
                  autoPlay
                />
              </div>
            )}
          </div>
          {caption && !showPlaceholder && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2">
              {caption}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Upload dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="embed">Embed Link</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="py-4">
              <div className="flex flex-col gap-4">
                <label className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="video/*,.mkv,.mp4,.webm,.ogg,.mov,.avi,.wmv,.flv,.m4v,.3gp,.ts"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, WEBM, MKV, OGG and other formats supported</p>
                </label>
              </div>
            </TabsContent>
            <TabsContent value="embed" className="py-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Paste video URL or YouTube link"
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
                <p className="text-xs text-gray-400 mb-2">
                  Embed videos from YouTube, Vimeo, or any direct video URL
                </p>
                
                {/* Video Preview */}
                {previewUrl && (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                        onError={handleVideoError}
                      />
                      {videoError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                          <VideoIcon className="h-10 w-10 mb-2 opacity-30" />
                          <p className="text-sm">Unable to load video preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoBlock; 