
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Folder, File, Plus, Search, MoreHorizontal } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState('');

  // Add safety check for project.pages
  const pages = project.pages || [];
  
  // Create folder structure
  const getFolderStructure = () => {
    // Group pages by their paths (first element in path array will be the folder)
    const folderMap: {[key: string]: PageType[]} = {};
    
    // Root level pages (no path or empty path)
    const rootPages = pages.filter(page => !page.path || page.path.length === 0 || !page.parentId);
    
    // Pages with paths
    pages.forEach(page => {
      if (page.path && page.path.length > 0) {
        const folder = page.path[0];
        if (!folderMap[folder]) {
          folderMap[folder] = [];
        }
        folderMap[folder].push(page);
      }
    });
    
    return { rootPages, folderMap };
  };
  
  const { rootPages, folderMap } = getFolderStructure();
  
  // Create a nested structure for parent-child pages
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
    
    // Skip if doesn't match search
    if (searchTerm && !page.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }
    
    return (
      <div key={page.id}>
        <div className="flex items-center group">
          <Button
            variant={isSelected ? "secondary" : "ghost"}
            size="sm"
            className={`w-full justify-start rounded-md ${depth > 0 ? `pl-${depth * 2 + 4}` : ''}`}
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
        
        {hasChildren && !isCollapsed && (
          <div className="ml-2">
            {childrenMap[page.id].map(childPage => renderPageItem(childPage, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFolderSection = (title: string, items: PageType[]) => {
    // Skip if doesn't match search and no children match
    if (searchTerm && !items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return null;
    }
    
    const isCollapsed = collapsedGroups[title] === true;
    
    return (
      <div key={title} className="mb-2">
        <div className="flex items-center group">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start font-medium text-sm"
            onClick={() => toggleGroup(title)}
          >
            {isCollapsed ? 
              <ChevronRight className="h-4 w-4 mr-2" /> : 
              <ChevronDown className="h-4 w-4 mr-2" />
            }
            <span>{title}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
        
        {!isCollapsed && (
          <div className="space-y-1 mt-1">
            {items.map(page => renderPageItem(page, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r h-full flex flex-col bg-background">
      <div className="p-3 border-b flex items-center">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-8 h-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Pages section */}
          {renderFolderSection("Pages", rootPages)}
          
          {/* Folder sections */}
          {Object.entries(folderMap).map(([folder, pages]) => 
            renderFolderSection(folder, pages)
          )}
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
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>
    </div>
  );
}
