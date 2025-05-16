
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ProjectCard from '@/components/ProjectCard';
import ActivityFeed from '@/components/ActivityFeed';
import PageBuilder from '@/components/PageBuilder';
import { dummyProjects, recentActivities } from '@/utils/dummyData';
import { ProjectType } from '@/types';

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("projects");

  const handleProjectSelect = (project: ProjectType) => {
    setSelectedProject(project);
    setActiveTab("project");
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveTab("projects");
  };

  const MainContent = () => (
    <div className="flex-1 p-6">
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
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        
        <TabsContent value="projects" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onClick={() => handleProjectSelect(project)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="project" className="animate-fade-in">
          {selectedProject && (
            <>
              <div className="mb-6">
                <Button variant="ghost" onClick={handleBackToProjects}>
                  ← Back to projects
                </Button>
              </div>
              
              <PageBuilder project={selectedProject} />
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
