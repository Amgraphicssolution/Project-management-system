
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConversationType, UserType } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationWidgetProps {
  conversations: ConversationType[];
  onSendMessage?: (message: string) => void;
  className?: string;
}

export default function ConversationWidget({ 
  conversations, 
  onSendMessage,
  className
}: ConversationWidgetProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const currentUser: UserType = {
    id: "current-user",
    name: "You",
    avatar: "https://i.pravatar.cc/150?img=8"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className={cn(
      "border rounded-lg bg-card animate-scale-in",
      className
    )}>
      <div 
        className="px-4 py-3 border-b flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium">Conversations</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <>
          <div className="p-4 max-h-[300px] overflow-y-auto space-y-4">
            {conversations.length > 0 ? (
              conversations.map((convo) => (
                <div key={convo.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={convo.user.avatar} alt={convo.user.name} />
                    <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-sm">{convo.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(convo.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{convo.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No conversations yet. Start the discussion!
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2 items-start">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[60px] resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
