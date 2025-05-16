
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Folder, 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Search,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
  hasBadge?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  collapsed, 
  onClick, 
  hasBadge,
  hasChildren,
  children 
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-center mb-1 px-2",
          active ? "bg-secondary text-primary" : ""
        )}
        onClick={onClick}
      >
        <div className="relative">
          <Icon className={cn("h-5 w-5", active ? "text-primary" : "")} />
          {hasBadge && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
          )}
        </div>
      </Button>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1 px-3",
          active ? "bg-secondary text-primary" : ""
        )}
        onClick={hasChildren ? () => setIsOpen(!isOpen) : onClick}
      >
        <div className="relative mr-2">
          <Icon className={cn("h-5 w-5", active ? "text-primary" : "")} />
          {hasBadge && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
          )}
        </div>
        <span className="flex-1 text-left">{label}</span>
        {hasChildren && (
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
        )}
      </Button>
      
      {hasChildren && isOpen && (
        <div className="ml-8 space-y-1 mb-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  const handleItemClick = (label: string) => {
    setActiveItem(label);
  };

  const folderItems = [
    { label: 'Designs', count: 5 },
    { label: 'Documents', count: 3 },
    { label: 'Projects', count: 8 },
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-background border-r border-border flex flex-col p-3 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between mb-6 pt-2">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center font-bold mr-2">W</div>
            <h2 className="text-lg font-medium">Workspace</h2>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center font-bold mx-auto">
            W
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="relative mb-3">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/50 border-0 focus:ring-1 focus:ring-primary text-sm" 
          />
        </div>
      )}

      <div className="space-y-1">
        <SidebarItem
          icon={Home}
          label="Home"
          active={activeItem === 'Home'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Home')}
        />
        
        <SidebarItem
          icon={Folder}
          label="Favourites"
          active={activeItem === 'Favourites'}
          collapsed={collapsed}
          hasChildren={!collapsed}
          onClick={() => handleItemClick('Favourites')}
        >
          {folderItems.map((item) => (
            <Button 
              key={item.label} 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-sm h-8"
              onClick={() => handleItemClick(item.label)}
            >
              <Folder className="h-4 w-4 mr-2" />
              {item.label}
              <span className="ml-auto text-xs text-muted-foreground">{item.count}</span>
            </Button>
          ))}
        </SidebarItem>
        
        <SidebarItem
          icon={Folder}
          label="Projects"
          active={activeItem === 'Projects'}
          collapsed={collapsed}
          hasBadge={true}
          hasChildren={!collapsed}
          onClick={() => handleItemClick('Projects')}
        >
          {folderItems.map((item) => (
            <Button 
              key={item.label} 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-sm h-8"
              onClick={() => handleItemClick(item.label)}
            >
              <Folder className="h-4 w-4 mr-2" />
              {item.label}
              <span className="ml-auto text-xs text-muted-foreground">{item.count}</span>
            </Button>
          ))}
        </SidebarItem>
        
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
        <SidebarItem
          icon={LogOut}
          label="Logout"
          active={activeItem === 'Logout'}
          collapsed={collapsed}
          onClick={() => handleItemClick('Logout')}
        />
      </div>

      {!collapsed && (
        <div className="mt-4">
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </div>
      )}
      
      {collapsed && (
        <div className="mt-4 flex justify-center">
          <Button size="icon" className="h-10 w-10 rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
