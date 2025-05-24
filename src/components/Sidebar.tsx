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
  LogOut,
  Bot,
  MoreHorizontal,
  FileText,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'react-router-dom';
import { ProjectType, PageType } from '@/types';
import CreatePageModal from '@/components/CreatePageModal';
import PageContextMenu from '@/components/PageContextMenu';
import ProjectContextMenu from '@/components/ProjectContextMenu';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
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
                <span className="text-base flex items-center justify-center">{project.icon}</span>
              ) : hasChildren ? (
                <>
                  <Folder className={cn(
                    "h-4 w-4 text-blue-500 absolute transition-opacity",
                    (isHovered || isExpanded) ? "opacity-0" : "opacity-100"
                  )} />
                  <ChevronRight className={cn(
                    "h-4 w-4 text-blue-500 absolute transition-all",
                    (isHovered || isExpanded) ? "opacity-100" : "opacity-0",
                    isExpanded && "rotate-90"
                  )} />
                </>
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )}
            </div>
          ) : (
            // Regular navigation item
            <Icon className={cn(
              "h-4 w-4",
              type === 'conversation' ? "text-blue-500" : ""
            )} />
          )}
          <span className="text-sm truncate">{label}</span>
        </div>
        {showActions && !project && (
          <div className={cn(
            "flex items-center gap-1"
          )}>
            <CreatePageModal
              onCreatePage={onCreateNew || (() => {})}
              onCreateConversation={onCreateNew || (() => {})}
            />
            <PageContextMenu
              itemName={label}
              onRename={onRenameProject || (() => {})}
              onDelete={onDeleteProject || (() => {})}
            />
          </div>
        )}
        {showActions && project && (
          <div className={cn(
            "flex items-center gap-1"
          )}>
            <CreatePageModal
              onCreatePage={onCreateNew || (() => {})}
              onCreateConversation={onCreateNew || (() => {})}
            />
            <ProjectContextMenu
              project={project}
              onRename={onRenameProject || (() => {})}
              onDuplicate={onDuplicateProject || (() => {})}
              onDelete={onDeleteProject || (() => {})}
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
}

export default function Sidebar({ 
  projects, 
  onCreateProject,
  onProjectSelect,
  selectedProjectId,
  onCreatePage,
  onCreateChat,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject
}: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white font-bold">AM</span>
        </div>
        <span className="font-semibold">AM GRAPHICS</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto space-y-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          <SidebarItem
            icon={Home}
            label="Home"
            to="/"
            showActions={false}
          />
          <SidebarItem
            icon={Bot}
            label="AI Assistant"
            to="/ai-assistant"
            showActions={false}
          />
        </div>

        {/* Projects Section */}
        <div>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Projects</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <Search className="h-3 w-3" />
              </Button>
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
          <div className="space-y-1">
            {searchQuery && (
              <div className="px-3 mb-2">
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full px-2 py-1 text-sm bg-secondary/50 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            {filteredProjects.map((project) => (
              <SidebarItem
                key={project.id}
                icon={Folder}
                label={project.title}
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
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
