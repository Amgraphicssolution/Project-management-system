import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, FolderPlus, Loader2 } from "lucide-react";
import { useState } from "react";

interface CreateNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePage: () => void;
  onCreateChat: () => void;
  onCreateProject?: () => void;
  showProjectOption?: boolean;
}

export default function CreateNewModal({
  isOpen,
  onClose,
  onCreatePage,
  onCreateChat,
  onCreateProject,
  showProjectOption = true
}: CreateNewModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (
    action: () => void,
    type: string
  ) => {
    try {
      setIsLoading(type);
      await action();
      onClose();
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
        </DialogHeader>
        <div className={`grid ${showProjectOption ? 'grid-cols-2' : 'grid-cols-1'} gap-4 py-4`}>
          {showProjectOption && onCreateProject && (
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              onClick={() => handleAction(onCreateProject, 'project')}
              disabled={!!isLoading}
            >
              {isLoading === 'project' ? (
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              ) : (
                <FolderPlus className="h-8 w-8 text-blue-500" />
              )}
              <span className="font-medium">New Project</span>
              <span className="text-xs text-muted-foreground">Create a new project folder</span>
            </Button>
          )}
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-32 gap-2"
            onClick={() => handleAction(onCreatePage, 'page')}
            disabled={!!isLoading}
          >
            {isLoading === 'page' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <FileText className="h-8 w-8" />
            )}
            <span className="font-medium">New Page</span>
            <span className="text-xs text-muted-foreground">Create an empty page</span>
          </Button>
          <Button
            variant="outline"
            className={`flex flex-col items-center justify-center h-32 gap-2 ${showProjectOption ? 'col-span-2' : ''}`}
            onClick={() => handleAction(onCreateChat, 'chat')}
            disabled={!!isLoading}
          >
            {isLoading === 'chat' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <MessageSquare className="h-8 w-8" />
            )}
            <span className="font-medium">Chat</span>
            <span className="text-xs text-muted-foreground">Start a conversation</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 