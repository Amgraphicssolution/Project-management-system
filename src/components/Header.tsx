import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b flex items-center py-2.5 shadow-sm">
      <div className="flex items-center justify-between w-full px-6">
        <h1 className="text-lg font-medium leading-none">{title}</h1>
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>MB</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Mavis Barry</span>
              <span className="text-xs text-muted-foreground leading-none mt-1">Designer</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
} 