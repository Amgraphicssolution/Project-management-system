
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Maximize2, 
  Minimize2,
  MessageCircle
} from "lucide-react";

interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export default function FilePreview({ fileUrl, fileName, fileType }: FilePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // Determine icon and preview based on file type
  const getPreviewComponent = () => {
    // This is a simple implementation. In a real app, we'd need proper previews for different file types
    if (fileType.includes('image')) {
      return (
        <img 
          src={fileUrl}
          alt={fileName}
          className="max-w-full h-auto"
        />
      );
    } else if (fileType.includes('pdf')) {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0`}
          title={fileName}
          className="w-full h-[500px] border-0"
        />
      );
    } else {
      // Generic file preview placeholder
      return (
        <div className="flex flex-col items-center justify-center p-10 bg-muted">
          <div className="text-4xl mb-4">📄</div>
          <p className="font-medium">{fileName}</p>
          <p className="text-sm text-muted-foreground">{fileType}</p>
          <Button variant="outline" className="mt-4">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      );
    }
  };

  return (
    <div className={`border rounded-lg bg-card ${isExpanded ? "fixed inset-4 z-50" : ""}`}>
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-medium">{fileName}</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {getPreviewComponent()}
      </div>
      
      {showComments && (
        <div className="border-t p-4">
          <h4 className="text-sm font-medium mb-3">Comments</h4>
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment on this file!</p>
        </div>
      )}
    </div>
  );
}
