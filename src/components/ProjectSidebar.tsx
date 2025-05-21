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
      <div key={page.id} style={{ paddingLeft: `${depth * 12}px` }}>
        <div 
          className="group flex items-center w-full rounded-md bg-white border border-transparent hover:border-border transition-all cursor-pointer p-1.5"
          onClick={() => {
            if (hasChildren) {
              toggleGroup(page.id);
            }
            onPageSelect(page);
          }}
        >
          {/* Left section with icon and title */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="w-4 h-4 shrink-0 relative">
              {hasChildren ? (
                <>
                  <Folder className={`h-4 w-4 text-[#0E8CFF] absolute transition-opacity ${
                    isSelected ? 'opacity-0' : 'group-hover:opacity-0'
                  }`} />
                  <ChevronRight className={`h-4 w-4 text-[#0E8CFF] absolute transition-opacity ${
                    isCollapsed ? '' : 'rotate-90'
                  } ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </>
              ) : (
                <Folder className="h-4 w-4 text-[#0E8CFF]" />
              )}
            </div>
            <span className="truncate text-sm">{page.title || "Untitled"}</span>
          </div>

          {/* Right section with action buttons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {hasChildren && !isCollapsed && (
          <div className="mt-1 space-y-1">
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
        <div 
          className="group flex items-center w-full rounded-md bg-white border border-transparent hover:border-border transition-all cursor-pointer p-1.5"
          onClick={() => toggleGroup(title)}
        >
          <div className="flex-1 flex items-center gap-2">
            <div className="w-4 h-4 shrink-0 relative">
              <Folder className="h-4 w-4 text-[#0E8CFF] absolute transition-opacity group-hover:opacity-0" />
              <ChevronRight className={`h-4 w-4 text-[#0E8CFF] absolute transition-opacity opacity-0 group-hover:opacity-100 ${
                isCollapsed ? '' : 'rotate-90'
              }`} />
            </div>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="mt-1 space-y-1">
            {items.map(page => renderPageItem(page, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r h-full flex flex-col bg-[#fafafa]">
      {/* Header */}
      <div className="p-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">Projects</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-1">
        {/* Project Items */}
        {pages.map((page) => {
          const hasChildren = childrenMap[page.id]?.length > 0;
          const isCollapsed = collapsedGroups[page.id];
          const isSelected = selectedPageId === page.id;

          return (
            <div key={page.id}>
              <div 
                className="group flex items-center w-full rounded-md hover:bg-secondary/5 transition-colors cursor-pointer py-1 px-2"
                onClick={() => onPageSelect(page)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {hasChildren ? (
                    <ChevronRight 
                      className={`h-4 w-4 text-muted-foreground transition-transform ${!isCollapsed ? 'rotate-90' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(page.id);
                      }}
                    />
                  ) : (
                    <div className="w-4" />
                  )}
                  <div className="flex items-center gap-2 flex-1">
                    <Folder className="h-4 w-4 text-[#0E8CFF]" />
                    <span className="text-sm truncate">{page.title || "New Project"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {hasChildren && !isCollapsed && (
                <div className="ml-4 mt-1">
                  {childrenMap[page.id].map(childPage => (
                    <div 
                      key={childPage.id}
                      className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-secondary/5 transition-colors cursor-pointer"
                      onClick={() => onPageSelect(childPage)}
                    >
                      <Folder className="h-4 w-4 text-[#0E8CFF]" />
                      <span className="text-sm truncate">{childPage.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={onCreatePage}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
    </div>
  );
}
