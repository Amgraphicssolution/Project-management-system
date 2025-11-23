import { useState, useEffect, useRef } from 'react';
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
  LogOut,
  MoreHorizontal,
  FileText,
  MessageSquare,
  X,
  ChevronUp,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'react-router-dom';
import { ProjectType, PageType, OrganizationType } from '@/types';
import CreatePageModal from '@/components/CreatePageModal';
import PageContextMenu from '@/components/PageContextMenu';
import ProjectContextMenu from '@/components/ProjectContextMenu';
import { useDebounce } from '@/hooks/useDebounce';
import OrganizationSwitcher from './OrganizationSwitcher';
import { getIcon } from './IconPicker';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string | React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  isFolder?: boolean;
  onCreateNew?: () => void;
  type?: 'page' | 'conversation';
  to?: string;
  showActions?: boolean;
  project?: ProjectType;
  onSelect?: () => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onDuplicateProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

const SidebarItem = ({
  icon: Icon,
  label,
  isExpanded,
  onToggle,
  isFolder,
  onCreateNew,
  type,
  to,
  showActions = true,
  project,
  onSelect,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject
}: SidebarItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const hasChildren = project?.pages && project.pages.length > 0;

  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreateModalOpen(true);
  };

  const content = (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex items-center px-2 py-1.5 rounded-md cursor-pointer",
          "hover:bg-secondary/50 transition-colors",
          isExpanded && "bg-secondary/30"
        )}
        onClick={onSelect}
      >
        <div className="flex-1 flex items-center gap-2">
          {project ? (
            // Project item with folder/arrow transition
            <div className="w-4 h-4 relative flex items-center justify-center">
              {project.icon ? (
                <span className="text-base flex items-center justify-center">
                  {(() => {
                    const IconComponent = getIcon(project.icon);
                    return IconComponent ? <IconComponent className="h-4 w-4 text-primary" /> : project.icon;
                  })()}
                </span>
              ) : hasChildren ? (
                <>
                  <Folder className={cn(
                    "h-4 w-4 text-primary absolute transition-opacity",
                    (isHovered || isExpanded) ? "opacity-0" : "opacity-100"
                  )} />
                  <ChevronRight className={cn(
                    "h-4 w-4 text-primary absolute transition-all",
                    (isHovered || isExpanded) ? "opacity-100" : "opacity-0",
                    isExpanded && "rotate-90"
                  )} />
                </>
              ) : (
                <Folder className="h-4 w-4 text-primary" />
              )}
            </div>
          ) : (
            // Regular navigation item
            <Icon className={cn(
              "h-4 w-4",
              type === 'conversation' ? "text-primary" : ""
            )} />
          )}
          <span className="text-sm truncate">{label}</span>
        </div>
        {showActions && !project && (
          <div className={cn(
            "flex items-center gap-1"
          )}>
            <CreatePageModal
              onCreatePage={onCreateNew || (() => { })}
              onCreateConversation={onCreateNew || (() => { })}
            />
            <PageContextMenu
              itemName={label as string}
              onRename={() => { }}
              onDelete={() => { }}
            />
          </div>
        )}
        {showActions && project && (
          <div className={cn(
            "flex items-center gap-1"
          )}>
            <CreatePageModal
              onCreatePage={onCreateNew || (() => { })}
              onCreateConversation={onCreateNew || (() => { })}
            />
            <ProjectContextMenu
              project={project}
              onRename={onRenameProject || (() => { })}
              onDuplicate={onDuplicateProject || (() => { })}
              onDelete={onDeleteProject || (() => { })}
            />
          </div>
        )}
      </div>

      {isExpanded && project && project.pages.length > 0 && (
        <div className="ml-4 space-y-1 mt-1">
          {project.pages.map((page) => (
            <SidebarItem
              key={page.id}
              icon={page.path?.[0] === 'chat' ? MessageSquare : FileText}
              label={page.title}
              type={page.path?.[0] === 'chat' ? 'conversation' : 'page'}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
};

interface SidebarProps {
  projects: ProjectType[];
  onCreateProject: () => void;
  onProjectSelect: (project: ProjectType) => void;
  selectedProjectId?: string;
  onCreatePage: (projectId: string) => void;
  onCreateChat: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  // Organization props
  currentOrganization?: OrganizationType;
  organizations?: OrganizationType[];
  onOrganizationChange?: (organization: OrganizationType) => void;
  onCreateOrganization?: (name: string, image?: string) => void;
  onUpdateOrganization?: (id: string, name: string, image?: string) => void;
  onDeleteOrganization?: (id: string) => void;
  isAdmin?: boolean;
  // Navigation
  onNavigateHome?: () => void;
}

// Highlight matching text in a string
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="font-semibold bg-accent text-accent-foreground">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default function Sidebar({
  projects,
  onCreateProject,
  onProjectSelect,
  selectedProjectId,
  onCreatePage,
  onCreateChat,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  // Organization props
  currentOrganization,
  organizations = [],
  onOrganizationChange = () => { },
  onCreateOrganization = () => { },
  onUpdateOrganization,
  onDeleteOrganization,
  isAdmin = true,
  // Navigation
  onNavigateHome = () => { }
}: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});
  const [searchActive, setSearchActive] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchInputValue, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const originalProjectsOrder = useRef<string[]>([]);
  const location = useLocation();

  // For pagination
  const PROJECTS_PER_PAGE = 10;
  const [showAllProjects, setShowAllProjects] = useState(false);
  const projectsContainerRef = useRef<HTMLDivElement>(null);

  // Store the original project order when projects change
  useEffect(() => {
    if (projects.length > 0 && originalProjectsOrder.current.length === 0) {
      originalProjectsOrder.current = projects.map(project => project.id);
    }
  }, [projects]);

  // Focus the search input when it becomes active
  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  // Reset visible projects count when search changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Show all results when searching
      setShowAllProjects(true);
    } else if (!debouncedSearchTerm && searchInputValue === '') {
      // Reset to initial count when search is cleared
      setShowAllProjects(false);
    }
  }, [debouncedSearchTerm, searchInputValue]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const toggleSearch = () => {
    setSearchActive(prev => !prev);
    if (searchActive) {
      setSearchInputValue('');
    }
  };

  const clearSearch = () => {
    setSearchInputValue('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleShowAllProjects = () => {
    setShowAllProjects(prev => !prev);

    // If showing all projects, scroll to top with smooth animation
    if (!showAllProjects && projectsContainerRef.current) {
      setTimeout(() => {
        projectsContainerRef.current?.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 50);
    }
  };

  // Filter and sort projects based on search
  const getFilteredAndSortedProjects = () => {
    if (!debouncedSearchTerm) {
      // If no search term, return projects in original order
      return [...projects].sort((a, b) => {
        const indexA = originalProjectsOrder.current.indexOf(a.id);
        const indexB = originalProjectsOrder.current.indexOf(b.id);
        return indexA - indexB;
      });
    }

    // Filter projects that match the search term
    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    // Sort filtered projects to put best matches at the top
    return filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const searchTerm = debouncedSearchTerm.toLowerCase();

      // If one title starts with the search term but the other doesn't, prioritize the one that starts with it
      const aStartsWith = aTitle.startsWith(searchTerm);
      const bStartsWith = bTitle.startsWith(searchTerm);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // If both or neither start with the search term, prioritize by index of the match
      const aIndex = aTitle.indexOf(searchTerm);
      const bIndex = bTitle.indexOf(searchTerm);
      return aIndex - bIndex;
    });
  };

  const filteredAndSortedProjects = getFilteredAndSortedProjects();
  // Get visible projects (either all when searching/expanded, or limited when collapsed)
  const visibleProjects = showAllProjects
    ? filteredAndSortedProjects
    : filteredAndSortedProjects.slice(0, PROJECTS_PER_PAGE);
  const hasMoreProjects = filteredAndSortedProjects.length > PROJECTS_PER_PAGE;

  // Generate the custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: hsl(var(--muted-foreground) / 0.3);
      border-radius: 10px;
      transition: background-color 0.3s ease;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: hsl(var(--muted-foreground) / 0.5);
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: hsl(var(--muted-foreground) / 0.3);
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: hsl(var(--muted-foreground) / 0.5);
    }
    
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
    }
    
    .dark .custom-scrollbar {
      scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
    }
  `;

  return (
    <div className="w-64 h-screen fixed top-0 left-0 bg-background border-r flex flex-col p-4 z-30">
      <style>{scrollbarStyles}</style>

      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <img
          src="/logo horizontal.webp"
          alt="AM GRAPHICS"
          className="h-7 max-w-[180px] object-contain dark:hidden"
        />
        <img
          src="/logo-horizontal-white.png"
          alt="AM GRAPHICS"
          className="h-7 max-w-[180px] object-contain hidden dark:block"
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Main Navigation */}
        <div className="space-y-1">
          <SidebarItem
            icon={Home}
            label="Home"
            showActions={false}
            onSelect={onNavigateHome}
          />
        </div>

        <Separator className="my-3" />

        {/* Projects Section - Header (Fixed) */}
        <div className="sticky top-0 bg-background z-10 pb-2">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Projects</span>
            <div className="flex items-center gap-1">
              {searchActive ? (
                <div className="relative flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search projects..."
                    className="w-32 h-7 px-2 py-1 pr-6 text-xs bg-secondary/50 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    onBlur={() => {
                      if (!searchInputValue) {
                        setSearchActive(false);
                      }
                    }}
                  />
                  {searchInputValue && (
                    <button
                      className="absolute right-1 text-muted-foreground hover:text-foreground"
                      onClick={clearSearch}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={toggleSearch}
                >
                  <Search className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onCreateProject}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Project List (Scrollable) */}
        <div
          ref={projectsContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar space-y-1 px-0.5 pb-2 -mx-0.5 scroll-smooth"
        >
          {visibleProjects.map((project) => (
            <SidebarItem
              key={project.id}
              icon={Folder}
              label={
                debouncedSearchTerm ? (
                  <HighlightedText
                    text={project.title}
                    highlight={debouncedSearchTerm}
                  />
                ) : project.title
              }
              isFolder
              project={project}
              isExpanded={expandedProjects[project.id] || project.id === selectedProjectId}
              onToggle={() => toggleProject(project.id)}
              onSelect={() => onProjectSelect(project)}
              onCreateNew={() => {
                if (project.id) {
                  onCreatePage(project.id);
                  onCreateChat(project.id);
                }
              }}
              onRenameProject={onRenameProject}
              onDuplicateProject={onDuplicateProject}
              onDeleteProject={onDeleteProject}
            />
          ))}

          {filteredAndSortedProjects.length === 0 && debouncedSearchTerm && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No projects found
            </div>
          )}

          {hasMoreProjects && (
            <div className="flex justify-center mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 w-full text-muted-foreground hover:text-foreground border border-dashed border-muted flex items-center justify-center gap-1 group transition-all duration-200"
                onClick={toggleShowAllProjects}
              >
                {showAllProjects ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="h-3 w-3 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    <span>Show More</span>
                    <ChevronDown className="h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4">
        <Separator className="mb-2" />

        {/* Organization Switcher */}
        {currentOrganization && (
          <div>
            <OrganizationSwitcher
              currentOrganization={currentOrganization}
              organizations={organizations}
              onOrganizationChange={onOrganizationChange}
              onCreateOrganization={onCreateOrganization}
              onUpdateOrganization={onUpdateOrganization}
              onDeleteOrganization={onDeleteOrganization}
              isAdmin={isAdmin}
              className="mb-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
