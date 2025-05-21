import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, FolderPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from "lucide-react";

interface CreatePageModalProps {
  onCreatePage: () => void;
  onCreateConversation: () => void;
  isProjectSection?: boolean;
}

export default function CreatePageModal({
  onCreatePage,
  onCreateConversation,
  isProjectSection = false
}: CreatePageModalProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2" align="start">
        <div className="text-sm font-medium mb-2">Create</div>
        <div className="text-xs text-muted-foreground mb-3">
          Choose what you want to create
        </div>
        <div className="space-y-2">
          {isProjectSection ? (
            <Button
              variant="ghost"
              className="w-full justify-start h-auto py-2 px-2"
              onClick={onCreatePage}
            >
              <div className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">New Project</span>
                  <span className="text-xs text-muted-foreground">
                    Create a new project
                  </span>
                </div>
              </div>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-2 px-2"
                onClick={onCreatePage}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">Page</span>
                    <span className="text-xs text-muted-foreground">
                      add any widgets
                    </span>
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-2 px-2"
                onClick={onCreateConversation}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">Conversation</span>
                    <span className="text-xs text-muted-foreground">
                      Discuss anything with client & Team
                    </span>
                  </div>
                </div>
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 