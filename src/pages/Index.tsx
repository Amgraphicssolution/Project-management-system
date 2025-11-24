import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Folder,
  Home,
  Image as ImageIcon,
  Smile,
  Share2,
  MoreHorizontal,
  Bot,
  Plus,
  ChevronDown,
  FileText,
  MessageSquare,
  X
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { ProjectType, PageType, OrganizationType } from '@/types/index';
import PageBuilder from '@/components/PageBuilder';
import Header from '@/components/Header';
import CreateNewModal from '@/components/CreateNewModal';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/components/ui/use-toast';
import IconPickerModal from '@/components/IconPickerModal';
import { getIcon } from '@/components/IconPicker';
import CoverPickerModal from '@/components/CoverPickerModal';
import PageEditor from '@/components/PageEditor';
import { dummyProjects, dummyOrganizations } from '@/utils/dummyData';
import { useParams } from "react-router-dom";
import ShareProjectDialog from '@/components/ShareProjectDialog';
import ProjectContextMenu from '@/components/ProjectContextMenu';

const ProjectView = ({
  project,
  onUpdateProject,
  setProjects,
  currentOrganization,
  organizations,
  onOrganizationChange,
  onCreateOrganization,
  onUpdateOrganization,
  onDeleteOrganization,
  onNavigateHome,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject
}: {
  project: ProjectType;
  onUpdateProject: (updated: ProjectType) => void;
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
  currentOrganization?: OrganizationType;
  organizations?: OrganizationType[];
  onOrganizationChange?: (organization: OrganizationType) => void;
  onCreateOrganization?: (name: string, image?: string) => void;
  onUpdateOrganization?: (id: string, name: string, image?: string) => void;
  onDeleteOrganization?: (id: string) => void;
  onNavigateHome: () => void;
  onRenameProject: (id: string, newName: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(project.description || "");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const handleTitleSave = () => {
    onUpdateProject({
      ...project,
      title,
      updatedAt: new Date().toISOString()
    });
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(project.title);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionSave = () => {
    onUpdateProject({
      ...project,
      description,
      updatedAt: new Date().toISOString()
    });
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setDescription(project.description || "");
      setIsEditingDescription(false);
    }
  };

  const handleIconSelect = (icon: string) => {
    const updatedProject = {
      ...project,
      icon,
      updatedAt: new Date().toISOString()
    };
    onUpdateProject(updatedProject);
    setIsIconPickerOpen(false);

    // Update projects list to reflect the icon change
    setProjects(prevProjects =>
      prevProjects.map(p => p.id === project.id ? updatedProject : p)
    );
  };

  const handleCoverSelect = (cover: { type: 'image' | 'color'; value: string }) => {
    onUpdateProject({
      ...project,
      cover,
      updatedAt: new Date().toISOString()
    });
  };

  const handleRemoveIcon = () => {
    onUpdateProject({
      ...project,
      icon: undefined,
      updatedAt: new Date().toISOString()
    });
  };

  const handleRemoveCover = () => {
    onUpdateProject({
      ...project,
      cover: undefined,
      coverHeight: undefined,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Global Header */}
      <Header title={project.title} />

      {/* Project Toolbar (Sticky) */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-secondary/80"
            onClick={onNavigateHome}
          >
            <Home className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium text-foreground truncate max-w-[200px]">{project.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-secondary/80"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {/* Collaborator Avatars */}
          <div className="flex -space-x-2">
            <Avatar className="h-7 w-7 border-2 border-background">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>MB</AvatarFallback>
            </Avatar>
            <Avatar className="h-7 w-7 border-2 border-background">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>

          <ProjectContextMenu
            project={project}
            onRename={onRenameProject}
            onDuplicate={onDuplicateProject}
            onDelete={onDeleteProject}
          />
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover Image */}
        <div className="relative group/cover w-full">
          {project.cover && (
            <>
              <div
                className="relative w-full transition-all"
                style={{
                  height: project.coverHeight || '240px',
                  backgroundImage: project.cover.type === 'image' ? `url(${project.cover.value})` : undefined,
                  backgroundColor: project.cover.type === 'color' ? project.cover.value : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 50%'
                }}
              >
                {/* Cover Actions Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/10 transition-colors flex items-end justify-end p-4 opacity-0 group-hover/cover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs bg-background/80 hover:bg-background shadow-sm backdrop-blur-md"
                      onClick={() => setIsCoverPickerOpen(true)}
                    >
                      Change cover
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs bg-background/80 hover:bg-background shadow-sm backdrop-blur-md text-muted-foreground hover:text-destructive"
                      onClick={handleRemoveCover}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              {/* Resize Handle */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize z-10 hover:bg-primary/20 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const banner = e.currentTarget.previousElementSibling as HTMLElement;
                  const startHeight = banner.offsetHeight;

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    moveEvent.preventDefault();
                    const delta = moveEvent.clientY - startY;
                    const newHeight = Math.max(100, startHeight + delta);
                    banner.style.height = `${newHeight}px`;
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);

                    const banner = e.currentTarget.previousElementSibling as HTMLElement;
                    onUpdateProject({
                      ...project,
                      coverHeight: `${banner.offsetHeight}px`,
                      updatedAt: new Date().toISOString()
                    });
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </>
          )}
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-12 pb-32">
          {/* Header Section */}
          <div className={`group relative mb-8 ${project.cover && project.icon ? '-mt-12' : 'mt-8'}`}>
            {/* Icon */}
            <div className="relative inline-block mb-4 group/icon">
              <div
                className={`
                  flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95
                  ${project.icon ? 'w-24 h-24 text-7xl' : 'w-auto h-auto'}
                `}
                onClick={() => setIsIconPickerOpen(true)}
              >
                {project.icon ? (
                  (() => {
                    const IconComponent = getIcon(project.icon);
                    return IconComponent ? (
                      <div className="bg-background rounded-xl p-2 shadow-sm border">
                        <IconComponent className="h-16 w-16 text-primary" />
                      </div>
                    ) : (
                      <span className="drop-shadow-sm filter">{project.icon}</span>
                    );
                  })()
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity -ml-2"
                  >
                    <Smile className="h-4 w-4 mr-2" />
                    Add icon
                  </Button>
                )}

                {project.icon && (
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover/icon:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-5 w-5 rounded-full shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveIcon();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between group/title">
                <div className="flex-1 mr-4">
                  {isEditingTitle ? (
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={handleKeyDown}
                      className="w-full text-5xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/20"
                      placeholder="Untitled"
                      autoFocus
                    />
                  ) : (
                    <h1
                      className="text-5xl font-bold cursor-text text-foreground break-words outline-none"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {project.title || <span className="text-muted-foreground/20">Untitled</span>}
                    </h1>
                  )}
                </div>
              </div>

              {/* Quick Actions (Add Cover/Desc) */}
              {(!project.cover || !project.description) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity h-6">
                  {!project.cover && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-secondary/50"
                      onClick={() => setIsCoverPickerOpen(true)}
                    >
                      <ImageIcon className="h-3 w-3 mr-1.5" />
                      Add cover
                    </Button>
                  )}
                  {!project.description && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-secondary/50"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      <FileText className="h-3 w-3 mr-1.5" />
                      Add description
                    </Button>
                  )}
                </div>
              )}

              {/* Description */}
              {(project.description || isEditingDescription) && (
                <div className="mt-2">
                  {isEditingDescription ? (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={handleDescriptionSave}
                      onKeyDown={handleDescriptionKeyDown}
                      className="w-full text-lg text-muted-foreground bg-transparent border-none p-0 resize-none focus:outline-none focus:ring-0"
                      placeholder="Add a description..."
                      rows={1}
                      style={{ minHeight: '1.75rem' }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-lg text-muted-foreground cursor-text hover:text-foreground transition-colors"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      {project.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className="mt-8">
            <PageEditor
              page={{
                id: project.id,
                title: project.title,
                blocks: project.pages[0]?.blocks || [],
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                parentId: project.id,
                projectId: project.id
              }}
              onUpdatePage={(updatedPage) => {
                const updatedProject = {
                  ...project,
                  pages: project.pages.map(p =>
                    p.id === project.pages[0]?.id
                      ? { ...p, blocks: updatedPage.blocks }
                      : p
                  )
                };
                onUpdateProject(updatedProject);
              }}
            />
          </div>
        </div>
      </div>

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelect={handleIconSelect}
      />

      <CoverPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={handleCoverSelect}
      />

      <ShareProjectDialog
        project={project}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </div>
  );
};

const Index = () => {
  const { projectId } = useParams();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageType | null>(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrganizationType[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationType | null>(null);

  // Initialize organizations and projects
  useEffect(() => {
    try {
      // For testing purposes, initialize with dummy data
      if (dummyOrganizations && dummyOrganizations.length > 0) {
        setOrganizations(dummyOrganizations);

        // Set the default organization as current
        const defaultOrg = dummyOrganizations.find(org => org.isDefault) || dummyOrganizations[0];
        setCurrentOrganization(defaultOrg);

        // Filter projects for the default organization
        if (dummyProjects && dummyProjects.length > 0) {
          const orgProjects = dummyProjects.filter(
            p => !p.organizationId || p.organizationId === defaultOrg.id
          );
          setProjects(orgProjects);
        }
      } else {
        // Fallback to a default organization if dummy data is not available
        const defaultOrg: OrganizationType = {
          id: 'org-default',
          name: 'Personal Workspace',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: true
        };
        setOrganizations([defaultOrg]);
        setCurrentOrganization(defaultOrg);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      // Create a fallback organization
      const fallbackOrg: OrganizationType = {
        id: 'org-fallback',
        name: 'Workspace',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: true
      };
      setOrganizations([fallbackOrg]);
      setCurrentOrganization(fallbackOrg);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save organizations to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && organizations.length > 0) {
      try {
        localStorage.setItem('organizations', JSON.stringify(organizations));
      } catch (error) {
        console.error('Error saving organizations:', error);
        toast({
          title: "Error",
          description: "Failed to save organization changes.",
          variant: "destructive",
        });
      }
    }
  }, [organizations, isLoading]);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        // Get all projects from localStorage
        const savedProjects = localStorage.getItem('projects');
        let allProjects: ProjectType[] = [];

        if (savedProjects) {
          allProjects = JSON.parse(savedProjects);
          // Remove current organization's projects
          allProjects = allProjects.filter(
            p => currentOrganization && p.organizationId !== currentOrganization.id
          );
        }

        // Add current projects (with organization ID)
        const currentProjects = projects.map(p => ({
          ...p,
          organizationId: currentOrganization?.id
        }));

        localStorage.setItem('projects', JSON.stringify([...allProjects, ...currentProjects]));
      } catch (error) {
        console.error('Error saving projects:', error);
        toast({
          title: "Error",
          description: "Failed to save projects.",
          variant: "destructive",
        });
      }
    }
  }, [projects, isLoading, currentOrganization]);

  // Load project from URL parameter if available
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        setActiveTab("project");
      }
    }
  }, [projectId, projects]);

  const handleCreateOrganization = (name: string, image?: string) => {
    try {
      const newOrg: OrganizationType = {
        id: `org-${Date.now()}`,
        name: name,
        image: image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOrganizations(prev => [...prev, newOrg]);
      setCurrentOrganization(newOrg);

      // Load projects for the new organization (empty initially)
      setProjects([]);
      setSelectedProject(null);
      setActiveTab("projects");

      toast({
        title: "Success",
        description: "Organization created successfully.",
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization.",
        variant: "destructive",
      });
    }
  };

  const handleOrganizationChange = (organization: OrganizationType) => {
    if (currentOrganization?.id === organization.id) return;

    setCurrentOrganization(organization);

    // Load projects for the selected organization
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const allProjects = JSON.parse(savedProjects);
        // Filter projects for the selected organization
        const orgProjects = allProjects.filter(
          (p: ProjectType) => p.organizationId === organization.id
        );
        setProjects(orgProjects);
        setSelectedProject(null);
        setActiveTab("projects");
      } catch (error) {
        console.error('Error loading projects for organization:', error);
        setProjects([]);
      }
    } else {
      setProjects([]);
    }
  };

  const handleUpdateOrganization = (id: string, name: string, image?: string) => {
    try {
      const updatedOrgs = organizations.map(org =>
        org.id === id
          ? {
            ...org,
            name,
            image,
            updatedAt: new Date().toISOString()
          }
          : org
      );

      setOrganizations(updatedOrgs);

      // If the current organization was updated, update it in state
      if (currentOrganization?.id === id) {
        setCurrentOrganization(prev => prev ? {
          ...prev,
          name,
          image,
          updatedAt: new Date().toISOString()
        } : null);
      }

      toast({
        title: "Success",
        description: "Organization updated successfully.",
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = (id: string) => {
    if (organizations.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last organization.",
        variant: "destructive",
      });
      return;
    }

    const newOrgs = organizations.filter(org => org.id !== id);
    setOrganizations(newOrgs);

    if (currentOrganization?.id === id) {
      const defaultOrg = newOrgs.find(org => org.isDefault) || newOrgs[0];
      handleOrganizationChange(defaultOrg);
    }

    toast({
      title: "Success",
      description: "Organization deleted successfully.",
    });
  };

  const handleDirectCreateProject = () => {
    const uniqueTitle = `Project ${projects.length + 1}`;
    // Check if title exists
    let title = uniqueTitle;
    let counter = 1;
    while (projects.some(p => p.title === title)) {
      counter++;
      title = `Project ${projects.length + counter}`;
    }

    const newProject: ProjectType = {
      id: `project-${Date.now()}`,
      title: uniqueTitle,
      pages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: currentOrganization?.id
    };

    setProjects(prevProjects => [...prevProjects, newProject]);
    setSelectedProject(newProject);
    setActiveTab("project");

    toast({
      title: "Success",
      description: "Project created successfully.",
    });
  };

  // Handler for renaming a project
  const handleRenameProject = (projectId: string, newName: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, title: newName, updatedAt: new Date().toISOString() }
          : project
      )
    );

    // If the renamed project is currently selected, update it
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, title: newName } : null);
    }

    toast({
      title: "Project renamed",
      description: "Project has been renamed successfully.",
    });
  };

  // Handler for duplicating a project
  const handleDuplicateProject = (projectId: string) => {
    const projectToDuplicate = projects.find(p => p.id === projectId);
    if (!projectToDuplicate) return;

    const newProjectId = crypto.randomUUID();
    const newProject: ProjectType = {
      ...projectToDuplicate,
      id: newProjectId,
      title: `${projectToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: projectToDuplicate.pages.map(page => ({
        ...page,
        id: crypto.randomUUID(),
        projectId: newProjectId,
        parentId: newProjectId
      }))
    };

    setProjects(prev => [...prev, newProject]);
    toast({
      title: "Project duplicated",
      description: "Project has been duplicated successfully.",
    });
  };

  // Handler for deleting a project
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));

    // If the deleted project was selected, clear the selection
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setActiveTab("projects");
    }

    toast({
      title: "Project deleted",
      description: "Project has been deleted successfully.",
      variant: "destructive",
    });
  };

  const handleCreatePage = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newPage: PageType = {
      id: `page-${Date.now()}`,
      title: "Untitled Page",
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: projectId,
      projectId: projectId
    };

    const updatedProject = {
      ...project,
      pages: [...project.pages, newPage]
    };

    setProjects(prevProjects =>
      prevProjects.map(p => p.id === projectId ? updatedProject : p)
    );
    setSelectedProject(updatedProject);

    toast({
      title: "Success",
      description: "Page created successfully.",
    });
  };

  const handleCreateChat = (projectId: string) => {
    toast({
      title: "Coming Soon",
      description: "Chat functionality will be available soon.",
    });
  };

  // Function to navigate to home/projects view
  const navigateToHome = () => {
    setSelectedProject(null);
    setActiveTab("projects");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar
        projects={projects}
        onCreateProject={handleDirectCreateProject}
        onProjectSelect={(project) => {
          setSelectedProject(project);
          setActiveTab("project");
        }}
        selectedProjectId={selectedProject?.id}
        onCreatePage={handleCreatePage}
        onCreateChat={handleCreateChat}
        onRenameProject={handleRenameProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        currentOrganization={currentOrganization || undefined}
        organizations={organizations}
        onOrganizationChange={handleOrganizationChange}
        onCreateOrganization={handleCreateOrganization}
        onUpdateOrganization={handleUpdateOrganization}
        onDeleteOrganization={handleDeleteOrganization}
        isAdmin={true}
        onNavigateHome={navigateToHome}
      />
      <main className="flex-1 ml-64">
        {activeTab === "projects" && (
          <>
            <Header title="Home" />
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-6">Welcome back!</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Cards */}
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="group relative bg-card hover:bg-accent/50 border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => {
                      setSelectedProject(project);
                      setActiveTab("project");
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {project.icon ? (
                          (() => {
                            const IconComponent = getIcon(project.icon);
                            return IconComponent ? (
                              <IconComponent className="h-6 w-6 text-primary" />
                            ) : (
                              <span className="text-xl">{project.icon}</span>
                            );
                          })()
                        ) : (
                          <Folder className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <ProjectContextMenu
                        project={project}
                        onRename={handleRenameProject}
                        onDuplicate={handleDuplicateProject}
                        onDelete={handleDeleteProject}
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || "No description"}
                    </p>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {/* Create New Project Card */}
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-accent/50 transition-colors gap-4 text-muted-foreground hover:text-primary hover:border-primary/50"
                  onClick={handleDirectCreateProject}
                >
                  <div className="p-4 bg-secondary rounded-full group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-8 w-8" />
                  </div>
                  <span className="font-medium">Create new project</span>
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === "project" && selectedProject && (
          <ProjectView
            project={selectedProject}
            onUpdateProject={(updated) => {
              setProjects(prevProjects =>
                prevProjects.map(p => p.id === updated.id ? updated : p)
              );
              setSelectedProject(updated);
            }}
            setProjects={setProjects}
            currentOrganization={currentOrganization || undefined}
            organizations={organizations}
            onOrganizationChange={handleOrganizationChange}
            onCreateOrganization={handleCreateOrganization}
            onUpdateOrganization={handleUpdateOrganization}
            onDeleteOrganization={handleDeleteOrganization}
            onNavigateHome={navigateToHome}
            onRenameProject={handleRenameProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
        <CreateNewModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateProject={handleDirectCreateProject}
          onCreatePage={() => selectedProject && handleCreatePage(selectedProject.id)}
          onCreateChat={() => selectedProject && handleCreateChat(selectedProject.id)}
        />
      </main>
    </div>
  );
};

export default Index;
