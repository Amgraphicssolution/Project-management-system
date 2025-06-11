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
  FileDigit,
  Play,
  Pause,
  Volume2,
  VolumeX
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
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

interface AudioBlockProps {
  block: BlockType;
  onUpdate: (updatedBlock: BlockType) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvert?: (newType: BlockType['type']) => void;
}

const AudioBlock: React.FC<AudioBlockProps> = ({ 
  block, 
  onUpdate, 
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert
}) => {
  // State for the audio
  const [audioUrl, setAudioUrl] = useState<string>(block.url || '');
  const [caption, setCaption] = useState<string>(block.content || '');
  const [showCaption, setShowCaption] = useState<boolean>(!!block.content);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(!block.url);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [linkInput, setLinkInput] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [audioError, setAudioError] = useState<boolean>(false);
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update parent component when audio or caption changes
  useEffect(() => {
    onUpdate({
      ...block,
      url: audioUrl,
      content: caption,
    });
    
    // Determine if the audio is embedded (external link) or uploaded
    if (audioUrl) {
      setIsEmbedded(audioUrl.startsWith('http') && !audioUrl.startsWith(window.location.origin));
    }
  }, [audioUrl, caption]);
  
  // Handle audio events
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(audioElement.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('durationchange', handleDurationChange);
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('durationchange', handleDurationChange);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioRef.current]);
  
  // Control playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
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
      console.info("Uploading audio file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Check file extension
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma'];
      const isValidAudioFile = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidAudioFile) {
        alert('Please upload a valid audio file (MP3, WAV, OGG, etc.)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAudioUrl(result);
        setIsUploadDialogOpen(false);
        
        // Test if the audio is playable
        const testAudio = document.createElement('audio');
        testAudio.muted = true;
        testAudio.preload = 'metadata';
        
        testAudio.onloadedmetadata = () => {
          console.info("Audio loaded successfully");
          setShowPlaceholder(false);
        };
        
        testAudio.onerror = () => {
          console.warn("Browser cannot play this audio format directly");
          setShowPlaceholder(true);
        };
        
        // Test the audio
        testAudio.src = result;
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert('Error reading the audio file. Please try another file.');
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle link input change
  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkInput(url);
    
    // Try to get a preview image for the audio (from services like SoundCloud, Spotify, etc.)
    if (url.includes('soundcloud.com')) {
      setPreviewUrl('/images/soundcloud-preview.png'); // Placeholder - replace with actual preview if available
    } else if (url.includes('spotify.com')) {
      setPreviewUrl('/images/spotify-preview.png'); // Placeholder - replace with actual preview if available
    } else {
      setPreviewUrl(''); // No preview available for generic audio links
    }
  };
  
  // Check if URL is a valid audio URL
  const isValidAudioUrl = (url: string): boolean => {
    // Check if it's a direct audio file
    if (/\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(url)) {
      return true;
    }
    
    // Check if it's from a common audio service
    if (url.includes('soundcloud.com') || 
        url.includes('spotify.com') || 
        url.includes('apple.music.com')) {
      return true;
    }
    
    return false;
  };
  
  // Handle link submission
  const handleLinkSubmit = () => {
    if (!linkInput) return;
    
    // Validate URL
    if (!isValidAudioUrl(linkInput)) {
      alert('Please enter a valid audio URL or embed link from SoundCloud, Spotify, etc.');
      return;
    }
    
    // Handle different services
    if (linkInput.includes('spotify.com')) {
      // Convert Spotify track URL to embed URL
      const spotifyEmbedUrl = linkInput.replace('open.spotify.com', 'open.spotify.com/embed');
      setAudioUrl(spotifyEmbedUrl);
      setIsEmbedded(true);
    } else if (linkInput.includes('soundcloud.com')) {
      // For SoundCloud, we'd typically use their oEmbed API to get the iframe
      // For simplicity, we'll just use the direct URL
      setAudioUrl(linkInput);
      setIsEmbedded(true);
    } else {
      // For direct audio files
      setAudioUrl(linkInput);
      setIsEmbedded(true);
    }
    
    setIsUploadDialogOpen(false);
  };
  
  // Handle audio playback error
  const handleAudioError = () => {
    console.error("Error loading audio");
    setShowPlaceholder(true);
    setAudioError(true);
  };
  
  // Handle audio download
  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `audio-${Date.now()}.${audioUrl.split('.').pop() || 'mp3'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Toggle caption visibility
  const handleCaptionToggle = () => {
    setShowCaption(!showCaption);
    if (!showCaption && !caption) {
      setCaption("Add caption here...");
    }
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle volume slider change
  const handleVolumeChange = (newValue: number[]) => {
    const volumeValue = newValue[0];
    setVolume(volumeValue);
    if (volumeValue > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  // Handle timeline slider change
  const handleTimelineChange = (newValue: number[]) => {
    if (!audioRef.current || !duration) return;
    
    const percentage = newValue[0];
    const newTime = (percentage / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="relative">
      {audioUrl ? (
        <div className="flex justify-center my-4">
          <div 
            className="relative group w-full"
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
                {/* Audio with potential placeholder fallback */}
                {showPlaceholder ? (
                  <div className="w-full bg-gray-800 rounded-md flex flex-col items-center justify-center p-8" style={{ minHeight: '100px' }}>
                    <Music className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-lg text-white">Audio could not be played in browser</p>
                    <p className="text-sm text-gray-300 mt-1 mb-4">This audio format is not supported for in-browser playback</p>
                    {isEmbedded && (
                      <Button 
                        variant="outline" 
                        className="mt-4 text-white border-white hover:bg-white/10"
                        onClick={() => window.open(audioUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View original audio
                      </Button>
                    )}
                  </div>
                ) : isEmbedded && (audioUrl.includes('spotify.com') || audioUrl.includes('soundcloud.com')) ? (
                  <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md shadow-sm" style={{ minHeight: '100px' }}>
                    <div className="p-3">
                      <div className="flex items-center mb-2">
                        <Music className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Embedded Audio</span>
                      </div>
                      <iframe
                        src={audioUrl}
                        title={caption || "Audio"}
                        className="w-full border-0 rounded-md shadow-sm"
                        height="80"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-gray-100 rounded-md relative" style={{ minHeight: '80px' }}>
                    <div className="flex items-center p-3 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
                      {/* Play/pause button - larger and more prominent */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 text-blue-600 hover:bg-blue-100/80 rounded-full mr-3 shadow-sm flex-shrink-0"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>
                      
                      <div className="flex-grow flex flex-col">
                        {/* Waveform visualization with gradient */}
                        <div className="h-14 bg-white rounded-lg overflow-hidden flex items-end p-1 shadow-inner">
                          {/* Create a better-looking waveform with gradient coloring */}
                          {Array.from({ length: 60 }).map((_, i) => {
                            // Calculate a more natural looking waveform with some patterns
                            const baseHeight = Math.sin(i * 0.2) * 0.3 + 0.5;
                            const randomFactor = Math.random() * 0.4;
                            const heightPercentage = Math.max(15, Math.min(95, (baseHeight + randomFactor) * 100));
                            
                            // Determine if this bar should be highlighted (played portion)
                            const isPlayed = currentTime / duration > i / 60;
                            
                            return (
                              <div 
                                key={i} 
                                className={`w-1 mx-0.5 rounded-t-sm transition-all duration-150 ${
                                  isPlayed ? 'bg-gradient-to-t from-blue-500 to-indigo-400' : 'bg-gray-300'
                                }`}
                                style={{ 
                                  height: `${heightPercentage}%`,
                                  opacity: isPlayed ? 1 : 0.7
                                }}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Progress and time info */}
                        <div className="flex items-center mt-1.5 px-1">
                          <span className="text-xs font-medium text-gray-700">{formatTime(currentTime)}</span>
                          <div className="flex-grow mx-2">
                            <Slider
                              value={[!isNaN(duration) && duration > 0 ? (currentTime / duration) * 100 : 0]}
                              min={0}
                              max={100}
                              step={0.1}
                              onValueChange={handleTimelineChange}
                              className="h-1.5"
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{formatTime(duration)}</span>
                        </div>
                      </div>
                      
                      {/* Volume control */}
                      <div className="ml-3 flex items-center gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-700 hover:bg-gray-200/80 rounded-full"
                          onClick={toggleMute}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="w-16 mr-1">
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
                    </div>
                    
                    <audio 
                      ref={audioRef}
                      src={audioUrl} 
                      className="hidden"
                      onError={handleAudioError}
                      controls={false}
                    >
                      <source src={audioUrl} type="audio/mp3" />
                      <source src={audioUrl} type="audio/wav" />
                      <source src={audioUrl} type="audio/ogg" />
                      <p>Your browser doesn't support HTML5 audio.</p>
                    </audio>
                  </div>
                )}
                
                {/* Hover actions (only for top-right corner) */}
                <div 
                  className={cn(
                    "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}
                >
                  {!isEmbedded && (
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
                  
                  {isEmbedded && (
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                      onClick={() => window.open(audioUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Caption */}
            {showCaption && (
              <div className="mt-2 w-full">
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
      ) : (
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
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 min-h-[150px]">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Audio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                <Music className="h-24 w-24 text-gray-400 mb-4" />
                <p className="text-lg text-white">Audio could not be played in browser</p>
                <p className="text-sm text-gray-300 mt-1 mb-4">This audio format is not supported for in-browser playback</p>
                {isEmbedded && (
                  <Button 
                    variant="outline" 
                    className="mt-4 text-white border-white hover:bg-white/10"
                    onClick={() => window.open(audioUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View original audio
                  </Button>
                )}
              </div>
            ) : isEmbedded && (audioUrl.includes('spotify.com') || audioUrl.includes('soundcloud.com')) ? (
              <div className="w-full max-w-2xl bg-white rounded-md p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{caption || "Embedded Audio"}</h3>
                    <iframe
                      src={audioUrl}
                      title={caption || "Audio"}
                      className="w-full border-0 rounded-md"
                      height="160"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white rounded-md p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5">
                    {/* Large play button in center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`rounded-full bg-white/90 p-4 shadow-md transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                        <Play className="h-10 w-10 text-blue-600" />
                      </div>
                    </div>
                    
                    {/* Title and metadata */}
                    <div className="mb-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{caption || "Audio"}</h3>
                        <p className="text-sm text-gray-500">Duration: {formatTime(duration)}</p>
                      </div>
                      {!isEmbedded && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    
                    {/* Enhanced waveform visualization */}
                    <div className="h-28 bg-white rounded-lg overflow-hidden flex items-end p-2 shadow-inner mb-4">
                      {/* Create a better-looking waveform with gradient coloring */}
                      {Array.from({ length: 100 }).map((_, i) => {
                        // Calculate a more natural looking waveform with some patterns
                        const baseHeight = Math.sin(i * 0.1) * 0.3 + 0.5;
                        const randomFactor = Math.random() * 0.4;
                        const heightPercentage = Math.max(15, Math.min(95, (baseHeight + randomFactor) * 100));
                        
                        // Determine if this bar should be highlighted (played portion)
                        const isPlayed = currentTime / duration > i / 100;
                        
                        return (
                          <div 
                            key={i} 
                            className={`w-1.5 mx-0.5 rounded-t-sm transition-all duration-150 ${
                              isPlayed ? 'bg-gradient-to-t from-blue-500 to-indigo-400' : 'bg-gray-300'
                            }`}
                            style={{ 
                              height: `${heightPercentage}%`,
                              opacity: isPlayed ? 1 : 0.7
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Advanced controls */}
                    <div className="flex flex-col gap-2">
                      {/* Time and progress bar */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{formatTime(currentTime)}</span>
                        <span className="text-sm font-medium text-gray-700">{formatTime(duration)}</span>
                      </div>
                      
                      <Slider
                        value={[!isNaN(duration) && duration > 0 ? (currentTime / duration) * 100 : 0]}
                        min={0}
                        max={100}
                        step={0.1}
                        onValueChange={handleTimelineChange}
                        className="h-2"
                      />
                      
                      {/* Playback controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 text-blue-600 hover:bg-blue-100/80 rounded-full shadow-sm"
                            onClick={togglePlayPause}
                          >
                            {isPlaying ? (
                              <Pause className="h-6 w-6" />
                            ) : (
                              <Play className="h-6 w-6" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-gray-700 hover:bg-gray-100 rounded-full"
                            onClick={toggleMute}
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                          </Button>
                          <div className="w-32">
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
                      </div>
                    </div>
                  </div>
                </div>
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
            <DialogTitle className="text-center text-xl font-semibold">Add Audio</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
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
                <label className="border-2 border-dashed border-blue-200 rounded-md p-8 text-center cursor-pointer hover:bg-blue-50/50 transition-colors bg-blue-50/20">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.aac,.flac,.m4a,.wma"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-2">MP3, WAV, OGG, AAC, FLAC and other formats supported</p>
                  <p className="text-xs text-blue-600 mt-4 font-medium">Select an audio file</p>
                </label>
              </div>
            </TabsContent>
            <TabsContent value="embed" className="py-4">
              <div className="flex flex-col gap-4">
                <div className="bg-blue-50/20 border border-blue-100 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3 text-gray-700">Paste a link from supported services</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Paste audio URL or SoundCloud/Spotify link"
                      value={linkInput}
                      onChange={handleLinkInputChange}
                      className="border-blue-200 focus-visible:ring-blue-400"
                    />
                    <Button 
                      onClick={handleLinkSubmit}
                      disabled={!linkInput}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Embed
                    </Button>
                  </div>
                  <div className="flex items-center mt-4 gap-2">
                    <div className="flex-1 flex items-center justify-center gap-3">
                      <div className="bg-blue-100/50 rounded-full p-1.5">
                        <Music className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500">SoundCloud</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-3">
                      <div className="bg-green-100/50 rounded-full p-1.5">
                        <Music className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-500">Spotify</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-3">
                      <div className="bg-gray-100 rounded-full p-1.5">
                        <LinkIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-xs text-gray-500">Direct URL</span>
                    </div>
                  </div>
                </div>
                
                {/* Audio Preview */}
                {previewUrl && (
                  <div className="mt-2 border rounded-md overflow-hidden shadow-sm">
                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                        onError={() => setAudioError(true)}
                      />
                      {audioError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                          <Music className="h-10 w-10 mb-2 opacity-30" />
                          <p className="text-sm">Unable to load audio preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogClose asChild>
            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AudioBlock; 