
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, File, MessageSquare, Plus } from "lucide-react";
import { PageType, ProjectType } from '@/types';

interface ProjectSidebarProps {
  project: ProjectType;
  onPageSelect: (page: PageType) => void;
  onCreatePage: () => void;
  onCreateChat: () => void;
  selectedPageId?: string;
}

export default function ProjectSidebar({ 
  project, 
  onPageSelect, 
  onCreatePage,
  onCreateChat,
  selectedPageId 
}: ProjectSidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<{[key: string]: boolean}>({});

  // Add safety check for project.pages
  const pages = project.pages || [];
  
  // Root level pages (no parent)
  const rootPages = pages.filter(page => !page.parentId);
  
  // Group pages by parentId
  const childrenMap: {[key: string]: PageType[]} = {};
  pages.forEach(page => {
    if (page.parentId) {
      if (!childrenMap[page.parentId]) {
        childrenMap[page.parentId] = [];
      }
      childrenMap[page.parentId].push(page);
    }
  });
  
  const toggleGroup = (id: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const renderPageItem = (page: PageType, depth = 0) => {
    const hasChildren = childrenMap[page.id] && childrenMap[page.id].length > 0;
    const isCollapsed = collapsedGroups[page.id] === true;
    const isSelected = selectedPageId === page.id;
    
    return (
      <div key={page.id}>
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          size="sm"
          className={`w-full justify-start ${depth > 0 ? `pl-${depth * 2 + 4}` : ''}`}
          onClick={() => onPageSelect(page)}
        >
          {hasChildren && (
            <span onClick={(e) => {
              e.stopPropagation();
              toggleGroup(page.id);
            }} className="mr-1">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          )}
          {!hasChildren && <File className="h-4 w-4 mr-2" />}
          {page.icon && <span className="mr-2">{page.icon}</span>}
          {page.emoji && <span className="mr-2">{page.emoji}</span>}
          <span className="truncate">{page.title || "Untitled"}</span>
        </Button>
        
        {hasChildren && !isCollapsed && (
          <div className="ml-2">
            {childrenMap[page.id].map(childPage => renderPageItem(childPage, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold truncate">{project.title}</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {rootPages.map(page => renderPageItem(page))}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={onCreatePage}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={onCreateChat}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
