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
  MessageSquare
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { ProjectType, PageType } from '@/types';
import PageBuilder from '@/components/PageBuilder';
import ProjectSidebar from '@/components/ProjectSidebar';
import Header from '@/components/Header';
import CreateNewModal from '@/components/CreateNewModal';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/components/ui/use-toast';
import IconPickerModal from '@/components/IconPickerModal';
import CoverPickerModal from '@/components/CoverPickerModal';
import PageEditor from '@/components/PageEditor';

const ProjectView = ({ 
  project, 
  onUpdateProject 
}: { 
  project: ProjectType; 
  onUpdateProject: (updated: ProjectType) => void;
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
    onUpdateProject({
      ...project,
      icon,
      updatedAt: new Date().toISOString()
    });
  };

  const handleCoverSelect = (cover: { type: 'image' | 'color'; value: string }) => {
    onUpdateProject({
      ...project,
      cover,
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
          <Button variant="ghost" size="sm" className="h-7 px-2">
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
      <div>
        {/* Project Cover */}
        <div className="relative group px-4 pt-4">
          {project.cover ? (
            <div 
              className="min-h-[200px] transition-all rounded-lg cursor-pointer group/cover"
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
              <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/5 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover/cover:opacity-100 transition-opacity">
                  Change cover
                </span>
              </div>

              {project.icon && (
                <div className="absolute left-9 bottom-6">
                  <div 
                    className="w-16 h-16 bg-white rounded-xl flex items-center justify-center cursor-pointer text-3xl shadow-sm group/icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsIconPickerOpen(true);
                    }}
                  >
                    {project.icon}
                    <div className="absolute inset-0 bg-black/0 group-hover/icon:bg-black/5 rounded-xl transition-colors flex items-center justify-center">
                      <span className="text-black text-sm opacity-0 group-hover/icon:opacity-100 transition-opacity">
                        Change
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : project.icon ? (
            <div 
              className="py-6 group/icon"
            >
              <div 
                className="w-16 h-16 bg-white rounded-xl flex items-center justify-center cursor-pointer text-3xl shadow-sm relative"
                onClick={() => setIsIconPickerOpen(true)}
              >
                {project.icon}
                <div className="absolute inset-0 bg-black/0 group-hover/icon:bg-black/5 rounded-xl transition-colors flex items-center justify-center">
                  <span className="text-black text-sm opacity-0 group-hover/icon:opacity-100 transition-opacity">
                    Change
                  </span>
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
          <div className="group relative">
            {/* Title Section with Action Buttons */}
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
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageType | null>(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Clear any existing projects and initialize with empty array
  useEffect(() => {
    localStorage.removeItem('projects'); // Clear existing projects
    setProjects([]);
    setIsLoading(false);
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('projects', JSON.stringify(projects));
      } catch (error) {
        console.error('Error saving projects:', error);
        toast({
          title: "Error",
          description: "Failed to save changes.",
          variant: "destructive",
        });
      }
    }
  }, [projects, isLoading]);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex">
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
      />
      <main className="flex-1">
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
