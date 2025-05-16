
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Files, 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: SidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start mb-1 px-3",
        collapsed ? "justify-center px-2" : "",
        active ? "bg-secondary text-primary" : ""
      )}
      onClick={onClick}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "")} />
      {!collapsed && <span className="ml-2">{label}</span>}
    </Button>
  );
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  const handleItemClick = (label: string) => {
    setActiveItem(label);
  };

  return (
    <div 
      className={cn(
        "h-screen bg-background border-r border-border flex flex-col p-3 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between mb-6 pt-2">
        {!collapsed && (
          <h2 className="text-lg font-display font-medium">Workspace</h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8", 
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-1">
        <SidebarItem
          icon={Home}
          label="Home"
          active={activeItem === 'Home'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Home')}
        />
        <SidebarItem
          icon={Files}
          label="Projects"
          active={activeItem === 'Projects'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Projects')}
        />
        <SidebarItem
          icon={MessageCircle}
          label="Messages"
          active={activeItem === 'Messages'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Messages')}
        />
        <SidebarItem
          icon={Users}
          label="Team"
          active={activeItem === 'Team'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Team')}
        />
        <SidebarItem
          icon={Calendar}
          label="Calendar"
          active={activeItem === 'Calendar'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Calendar')}
        />
      </div>

      <div className="mt-auto">
        <SidebarItem
          icon={Settings}
          label="Settings"
          active={activeItem === 'Settings'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Settings')}
        />
      </div>

      <div className="mt-4">
        <Button 
          className={cn(
            "w-full", 
            collapsed ? "px-2" : ""
          )}
        >
          <Plus className="h-4 w-4 mr-1" />
          {!collapsed && "New Project"}
        </Button>
      </div>
    </div>
  );
}
