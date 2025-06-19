import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Copy, Trash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface FigmaBlockProps {
  initialUrl?: string;
  onUpdate?: (url: string) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export default function FigmaBlock({
  initialUrl = "",
  onUpdate,
  onDelete,
  readOnly = false,
}: FigmaBlockProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isEditing, setIsEditing] = useState(!initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Extract Figma file ID from URL
  const extractFigmaId = (figmaUrl: string) => {
    try {
      // Match URLs like https://www.figma.com/file/abcdefg12345/FileName
      const fileMatch = figmaUrl.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
      if (fileMatch && fileMatch[1]) {
        return fileMatch[1];
      }
      
      // Match URLs like https://www.figma.com/proto/abcdefg12345/FileName
      const protoMatch = figmaUrl.match(/figma\.com\/proto\/([a-zA-Z0-9]+)/);
      if (protoMatch && protoMatch[1]) {
        return protoMatch[1];
      }
      
      // Match URLs like https://www.figma.com/design/abcdefg12345/FileName
      const designMatch = figmaUrl.match(/figma\.com\/design\/([a-zA-Z0-9]+)/);
      if (designMatch && designMatch[1]) {
        return designMatch[1];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Validate the Figma URL
  const validateUrl = (inputUrl: string) => {
    if (!inputUrl) return false;
    
    // Simple check - just make sure it contains figma.com and one of the expected path types
    if (inputUrl.includes('figma.com/') && 
       (inputUrl.includes('/file/') || 
        inputUrl.includes('/proto/') || 
        inputUrl.includes('/design/'))) {
      return true;
    }
    
    return false;
  };

  // Handle URL save
  const handleSave = () => {
    if (!validateUrl(url)) {
      setError("Please enter a valid Figma URL");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      if (onUpdate) onUpdate(url);
      toast({
        title: "Figma link saved",
        description: "The Figma preview has been updated.",
      });
    }, 500);
  };

  // Handle URL copy
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard",
      description: "The Figma link has been copied to your clipboard.",
    });
  };

  // Create the embed URL for the iframe
  const getEmbedUrl = () => {
    // For Figma embeds, we can use the original URL directly in most cases
    // The embed API will handle the different URL formats
    if (!url) return null;
    
    try {
      // Parse the URL to extract node-id and other parameters
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const nodeId = urlObj.searchParams.get('node-id');
      
      // Convert design URLs to file URLs for better embedding
      let embedUrl = url;
      if (url.includes('figma.com/design/')) {
        // Extract the design ID and convert to a file URL format for embedding
        const designMatch = url.match(/figma\.com\/design\/([a-zA-Z0-9]+)\/([^?]+)/);
        if (designMatch && designMatch[1] && designMatch[2]) {
          const designId = designMatch[1];
          const designName = designMatch[2];
          embedUrl = `https://www.figma.com/file/${designId}/${designName}`;
          
          // Add node-id if it exists in the original URL
          if (nodeId) {
            embedUrl += `?node-id=${nodeId}`;
          }
        }
      }
      
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(embedUrl)}`;
    } catch (error) {
      console.error("Error processing Figma URL:", error);
      // Fallback to direct embed if URL parsing fails
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    }
  };

  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white">
      {isEditing ? (
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Add Figma Link</h3>
          <div className="space-y-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Figma URL (e.g., https://www.figma.com/file/...)"
              className="w-full"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!url || isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Loading..." : "Save"}
              </Button>
              {initialUrl && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setUrl(initialUrl);
                    setIsEditing(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full" style={{ height: "400px" }}>
            {url ? (
              <iframe
                src={getEmbedUrl()}
                className="w-full h-full border-0"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100">
                <p className="text-gray-500">No Figma URL provided</p>
              </div>
            )}
          </div>
          {!readOnly && (
            <div className="p-3 border-t flex items-center justify-between bg-gray-50">
              <div className="flex items-center">
                <p className="text-sm font-medium truncate max-w-[300px]">
                  {url}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(url, "_blank")}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    title="Delete"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 