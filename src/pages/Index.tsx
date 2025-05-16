
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronLeft, Folder } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ProjectCard from '@/components/ProjectCard';
import { dummyProjects } from '@/utils/dummyData';
import { ProjectType, PageType } from '@/types';
import PageBuilder from '@/components/PageBuilder';
import ProjectSidebar from '@/components/ProjectSidebar';

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("projects");

  const handleProjectSelect = (project: ProjectType) => {
    setSelectedProject(project);
    
    // Select first page by default
    if (project.pages && project.pages.length > 0) {
      setSelectedPage(project.pages[0]);
    }
    
    setActiveTab("project");
  };

  const handlePageSelect = (page: PageType) => {
    setSelectedPage(page);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedPage(null);
    setActiveTab("projects");
  };

  const handleCreatePage = () => {
    if (!selectedProject) return;
    
    const newPage: PageType = {
      id: `page-${Date.now()}`,
      title: "Untitled",
      blocks: [{
        id: `block-${Date.now()}`,
        type: "paragraph",
        content: ""
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: []
    };
    
    // Update project with new page
    const updatedProject = {
      ...selectedProject,
      pages: [...(selectedProject.pages || []), newPage]
    };
    
    setSelectedProject(updatedProject);
    setSelectedPage(newPage);
  };

  const handleCreateChat = () => {
    if (!selectedProject) return;
    
    const newFolder = 'New Folder';
    const newFolderId = `folder-${Date.now()}`;
    
    const newPage: PageType = {
      id: newFolderId,
      title: "New Folder",
      icon: "📁",
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: [newFolder]
    };
    
    // Update project with new folder page
    const updatedProject = {
      ...selectedProject,
      pages: [...(selectedProject.pages || []), newPage]
    };
    
    setSelectedProject(updatedProject);
    setSelectedPage(newPage);
  };

  const handleUpdatePage = (updatedPage: PageType) => {
    if (!selectedProject) return;
    
    const updatedPages = selectedProject.pages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    );
    
    setSelectedProject({
      ...selectedProject,
      pages: updatedPages
    });
    
    setSelectedPage(updatedPage);
  };

  const WelcomeView = () => (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dummyProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project}
            onClick={() => handleProjectSelect(project)}
          />
        ))}
        <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/10 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Create New Project</h3>
          <p className="text-sm text-muted-foreground">Start a fresh workspace update</p>
        </div>
      </div>
    </div>
  );

  const MainContent = () => (
    <div className="flex-1 overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="projects" className="animate-fade-in">
          <WelcomeView />
        </TabsContent>
        
        <TabsContent value="project" className="animate-fade-in h-[calc(100vh-100px)]">
          {selectedProject && (
            <>
              <div className="mb-2 p-2 border-b">
                <Button variant="ghost" onClick={handleBackToProjects} className="text-sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to projects
                </Button>
              </div>
              
              <div className="flex h-full">
                <ProjectSidebar 
                  project={selectedProject}
                  onPageSelect={handlePageSelect}
                  onCreatePage={handleCreatePage}
                  onCreateChat={handleCreateChat}
                  selectedPageId={selectedPage?.id}
                />
                
                <div className="flex-1 overflow-auto p-6">
                  {selectedPage && (
                    <PageBuilder 
                      project={selectedProject} 
                      selectedPage={selectedPage}
                      onUpdatePage={handleUpdatePage}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 overflow-auto flex">
        <MainContent />
      </div>
    </div>
  );
};

export default Index;
