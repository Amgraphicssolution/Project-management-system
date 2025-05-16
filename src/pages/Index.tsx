
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ProjectCard from '@/components/ProjectCard';
import ActivityFeed from '@/components/ActivityFeed';
import { dummyProjects, recentActivities } from '@/utils/dummyData';
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
    
    const newChatPage: PageType = {
      id: `chat-${Date.now()}`,
      title: "Chat",
      icon: "💬",
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: ["chat"]
    };
    
    // Update project with new chat page
    const updatedProject = {
      ...selectedProject,
      pages: [...(selectedProject.pages || []), newChatPage]
    };
    
    setSelectedProject(updatedProject);
    setSelectedPage(newChatPage);
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

  const MainContent = () => (
    <div className="flex-1 p-6 overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-8">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            {selectedProject && (
              <TabsTrigger value="project">
                {selectedProject.title}
              </TabsTrigger>
            )}
          </TabsList>
          
          {activeTab === "projects" && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
        
        <TabsContent value="projects" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={{
                  ...project,
                  // Add pages array if it doesn't exist on dummy projects
                  pages: project.pages || project.blocks?.map((block, index) => ({
                    id: `page-${index}`,
                    title: index === 0 ? project.title : `Page ${index + 1}`,
                    blocks: [block],
                    createdAt: project.lastUpdated,
                    updatedAt: project.lastUpdated,
                    path: []
                  })) || []
                }}
                onClick={() => handleProjectSelect(project)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="project" className="animate-fade-in h-[calc(100vh-200px)]">
          {selectedProject && (
            <>
              <div className="mb-6">
                <Button variant="ghost" onClick={handleBackToProjects}>
                  ← Back to projects
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

  const SidePanel = () => (
    <div className="w-full md:w-[320px] p-6 border-l">
      <ActivityFeed activities={recentActivities} />
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 overflow-auto flex flex-col md:flex-row">
        <MainContent />
        <SidePanel />
      </div>
    </div>
  );
};

export default Index;
