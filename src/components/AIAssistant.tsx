
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you with your project today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message to conversation
    setConversation([
      ...conversation,
      { role: "user", content: query }
    ]);
    
    // Clear input
    setQuery("");
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses = [
        "I can help you organize your tasks for this project. Would you like me to create a to-do list?",
        "Based on your project timeline, you should focus on the design phase this week.",
        "I've analyzed similar projects and found that breaking this task into smaller components could improve productivity.",
        "Would you like me to draft an outline for your project documentation?",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      setConversation(prev => [
        ...prev,
        { role: "assistant", content: randomResponse }
      ]);
      
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="border rounded-lg bg-card animate-scale-in">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src="" />
          <AvatarFallback className="bg-purple-500 text-white">
            <Bot className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
        <h3 className="font-medium">AI Assistant</h3>
      </div>
      
      <div className="p-4 max-h-[300px] overflow-y-auto space-y-4">
        {conversation.map((message, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-start gap-3",
              message.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            {message.role === "assistant" ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-purple-500 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://i.pravatar.cc/150?img=8" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
            
            <div 
              className={cn(
                "py-2 px-3 rounded-lg text-sm",
                message.role === "assistant" 
                  ? "bg-secondary" 
                  : "bg-primary text-primary-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-purple-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-secondary py-2 px-3 rounded-lg">
              <span className="flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>·</span>
              </span>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your AI assistant..."
            className="flex-1"
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
