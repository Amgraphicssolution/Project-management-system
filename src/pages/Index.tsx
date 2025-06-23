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
import CoverPickerModal from '@/components/CoverPickerModal';
import PageEditor from '@/components/PageEditor';
import { dummyProjects, dummyOrganizations } from '@/utils/dummyData';
import { useParams } from "react-router-dom";

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
  onNavigateHome
}: { 
  project: ProjectType; 
  onUpdateProject: (updated: ProjectType) => void;
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
  currentOrganization?: OrganizationType;
  organizations?: OrganizationType[];
  onOrganizationChange?: (organization: OrganizationType) => void;
  onCreateOrganization?: () => void;
  onUpdateOrganization?: (id: string, name: string, image?: string) => void;
  onDeleteOrganization?: (id: string) => void;
  onNavigateHome: () => void;
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(project.description || "");

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
    <>
      {/* Header */}
      <Header title={project.title} />

      {/* Breadcrumb and Actions */}
      <div className="px-6 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2"
            onClick={onNavigateHome}
          >
            <Home className="h-4 w-4" />
          </Button>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">{project.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Share2 className="h-4 w-4" />
          </Button>
          <div className="flex -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>MB</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Content */}
      <div className="relative group px-4 pt-4">
        {project.cover ? (
          <div 
            className="min-h-[200px] transition-all rounded-lg cursor-pointer group/cover relative"
            style={{
              height: project.coverHeight || '200px',
              backgroundImage: project.cover?.type === 'image' ? `url(${project.cover.value})` : undefined,
              backgroundColor: project.cover?.type === 'color' ? project.cover.value : '#E5F3FF',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => setIsCoverPickerOpen(true)}
          >
            {/* Hover overlay for cover */}
            <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/5 transition-colors">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-background/80 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCoverPickerOpen(true);
                  }}
                >
                  Change cover
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-background/80 hover:bg-background text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCover();
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {project.cover && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-4 cursor-row-resize opacity-0 group-hover:opacity-100 transition-opacity"
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
          >
            <div className="h-1 bg-secondary/50 hover:bg-secondary rounded-full mx-auto w-12"></div>
          </div>
        )}
      </div>

      <div className="py-6 px-4">
        <div className="group relative max-w-3xl mx-auto">
          {/* Title Section with Action Buttons */}
          <div>
            {/* Icon aligned with title */}
            {project.icon && (
              <div className="mb-4">
                <div className="group/icon">
                  <div 
                    className="w-24 h-24 flex items-center justify-center cursor-pointer text-5xl relative"
                    onClick={() => setIsIconPickerOpen(true)}
                  >
                    {project.icon}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover/icon:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveIcon();
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Title and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isEditingTitle ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleKeyDown}
                    className="text-4xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-[300px] px-2"
                    autoFocus
                  />
                ) : (
                  <h1 
                    className="text-4xl font-semibold cursor-pointer hover:bg-secondary/50 px-2 rounded"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {project.title}
                  </h1>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {!project.icon && (
                  <button
                    onClick={() => setIsIconPickerOpen(true)}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <Smile className="h-4 w-4" />
                    Add icon
                  </button>
                )}
                {!project.cover && (
                  <button
                    onClick={() => setIsCoverPickerOpen(true)}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Add cover
                  </button>
                )}
                {!project.description && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Add description
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            {isEditingDescription ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={handleDescriptionKeyDown}
                className="w-full text-muted-foreground bg-transparent border-none p-2 resize-none focus:outline-none focus:ring-0"
                placeholder="Add a description..."
                rows={3}
                autoFocus
              />
            ) : description ? (
              <p 
                className="text-muted-foreground cursor-pointer hover:bg-secondary/30 p-2 rounded"
                onClick={() => setIsEditingDescription(true)}
              >
                {project.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Project Pages List */}
        <div className="mt-6">
          <PageEditor 
            page={{
              id: project.id,
              title: project.title,
              blocks: project.pages[0]?.blocks || [],
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              parentId: project.id
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

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelect={(icon) => {
          onUpdateProject({
            ...project,
            icon,
            updatedAt: new Date().toISOString()
          });
          setIsIconPickerOpen(false);
        }}
      />

      <CoverPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={(cover) => {
          onUpdateProject({
            ...project,
            cover,
            updatedAt: new Date().toISOString()
          });
          setIsCoverPickerOpen(false);
        }}
      />
    </>
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
          description: "Failed to save changes.",
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
    try {
      // Don't allow deleting the default organization
      const orgToDelete = organizations.find(org => org.id === id);
      if (orgToDelete?.isDefault) {
        toast({
          title: "Error",
          description: "Cannot delete the default organization.",
          variant: "destructive",
        });
        return;
      }
      
      // Remove the organization
      const updatedOrgs = organizations.filter(org => org.id !== id);
      setOrganizations(updatedOrgs);
      
      // If the current organization was deleted, switch to the default organization
      if (currentOrganization?.id === id) {
        const defaultOrg = updatedOrgs.find(org => org.isDefault) || updatedOrgs[0];
        setCurrentOrganization(defaultOrg);
        
        // Load projects for the default organization
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          try {
            const allProjects = JSON.parse(savedProjects);
            // Filter projects for the default organization
            const orgProjects = allProjects.filter(
              (p: ProjectType) => p.organizationId === defaultOrg.id
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
      }
      
      // Delete all projects associated with the deleted organization
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        try {
          const allProjects = JSON.parse(savedProjects);
          // Filter out projects for the deleted organization
          const remainingProjects = allProjects.filter(
            (p: ProjectType) => p.organizationId !== id
          );
          localStorage.setItem('projects', JSON.stringify(remainingProjects));
        } catch (error) {
          console.error('Error updating projects after organization deletion:', error);
        }
      }
      
      toast({
        title: "Success",
        description: "Organization deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization.",
        variant: "destructive",
      });
    }
  };

  const handleCreateProject = () => {
    try {
      // Validate project title uniqueness
      const projectTitle = "New Project";
      let uniqueTitle = projectTitle;
      let counter = 1;
      
      while (projects.some(p => p.title === uniqueTitle)) {
        uniqueTitle = `${projectTitle} ${counter}`;
        counter++;
      }

      const newProject: ProjectType = {
        id: `project-${Date.now()}`,
        title: uniqueTitle,
        pages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: currentOrganization?.id
      };

      const newPage: PageType = {
        id: `page-${Date.now()}`,
        title: uniqueTitle,
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        path: ["projects"],
        parentId: newProject.id
      };

      newProject.pages = [newPage];

      setProjects(prevProjects => [...prevProjects, newProject]);
      setSelectedProject(newProject);
      setSelectedPage(newPage);
      setActiveTab("project");

      toast({
        title: "Success",
        description: "Project created successfully.",
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreatePage = () => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let pageTitle = "Untitled";
      let counter = 1;
      
      while (selectedProject.pages.some(p => p.title === pageTitle)) {
        pageTitle = `Untitled ${counter}`;
        counter++;
      }

      const newPage: PageType = {
        id: `page-${Date.now()}`,
        title: pageTitle,
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        path: ["projects"],
        parentId: selectedProject.id
      };
      
      const updatedProject = {
        ...selectedProject,
        pages: [...selectedProject.pages, newPage],
        updatedAt: new Date().toISOString(),
      };
      
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === selectedProject.id ? updatedProject : p)
      );
      setSelectedProject(updatedProject);
      setSelectedPage(newPage);

      toast({
        title: "Success",
        description: "Page created successfully.",
      });
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: "Error",
        description: "Failed to create page. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateChat = () => {
    if (!selectedProject) return;
    
    const newPage: PageType = {
      id: `chat-${Date.now()}`,
      title: "New Chat",
      icon: "💬",
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: ["chat"],
      parentId: selectedProject.id
    };
    
    const updatedProject = {
      ...selectedProject,
      pages: [...selectedProject.pages, newPage]
    };
    
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    setSelectedPage(newPage);
  };

  const handleUpdatePage = (updatedPage: PageType) => {
    if (!selectedProject) return;
    
    const updatedPages = selectedProject.pages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    );
    
    const updatedProject = {
      ...selectedProject,
      pages: updatedPages
    };
    
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    setSelectedPage(updatedPage);
  };

  const WelcomeView = () => (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">👋 Welcome, Mavis Barry</h2>
        <p className="text-muted-foreground">
          Get started by creating a new project using the sidebar.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Projects</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedProject(project);
                  setActiveTab("project");
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {project.icon ? (
                    <span className="text-2xl">{project.icon}</span>
                  ) : (
                    <Folder className="h-10 w-10 text-blue-500" />
                  )}
                </div>
                <h4 className="font-medium">{project.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {project.pages.length} {project.pages.length === 1 ? 'page' : 'pages'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const MainContent = () => (
    <div className="flex-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="project">Project</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <Header title="Home" />
          <WelcomeView />
        </TabsContent>
        
        <TabsContent value="project">
          {selectedProject && (
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
              onNavigateHome={() => {
                setSelectedProject(null);
                setActiveTab("projects");
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateNewModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
        onCreatePage={handleCreatePage}
        onCreateChat={handleCreateChat}
      />
    </div>
  );

  const handleDirectCreateProject = () => {
    try {
      const projectTitle = "New Project";
      let uniqueTitle = projectTitle;
      let counter = 1;
      
      while (projects.some(p => p.title === uniqueTitle)) {
        uniqueTitle = `${projectTitle} ${counter}`;
        counter++;
      }

      const newProject: ProjectType = {
        id: `project-${Date.now()}`,
        title: uniqueTitle,
        pages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProjects(prevProjects => [...prevProjects, newProject]);
      setSelectedProject(newProject);
      setActiveTab("project");

      toast({
        title: "Success",
        description: "Project created successfully.",
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
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
            <WelcomeView />
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
          />
        )}
        <CreateNewModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateProject={handleCreateProject}
          onCreatePage={handleCreatePage}
          onCreateChat={handleCreateChat}
        />
      </main>
    </div>
  );
};

export default Index;
