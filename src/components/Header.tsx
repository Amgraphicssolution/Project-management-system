import { ChevronDown, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export default function Header({ 
  title
}: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-40 bg-background border-b flex items-center py-2.5 shadow-sm">
      <div className="flex items-center justify-between w-full px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium leading-none">{title}</h1>
        </div>
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-auto px-2 py-1.5 flex items-center gap-2 hover:bg-secondary/50">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>MB</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">Mavis Barry</span>
                  <span className="text-xs text-muted-foreground leading-none mt-1">Designer</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">Mavis Barry</p>
                  <p className="text-xs text-muted-foreground">mavis@example.com</p>
                </div>
                <Separator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 py-1.5 h-auto text-sm"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 py-1.5 h-auto text-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
} 