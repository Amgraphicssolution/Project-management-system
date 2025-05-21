import AIAssistant from "@/components/AIAssistant";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { ProjectType, PageType } from "@/types";

export default function AIAssistantPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

  // Initialize with empty projects array
  useEffect(() => {
    setProjects([]);
  }, []);

  const handleCreateProject = () => {
    const newProject: ProjectType = {
      id: `project-${Date.now()}`,
      title: "New Project",
      description: "",
      pages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
  };

  const handleCreatePage = (projectId: string) => {
    if (!selectedProject) return;
    
    const newPage: PageType = {
      id: `page-${Date.now()}`,
      title: "New Page",
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: projectId
    };
    
    const updatedProject = {
      ...selectedProject,
      pages: [...selectedProject.pages, newPage]
    };
    
    setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  const handleCreateChat = (projectId: string) => {
    if (!selectedProject) return;
    
    const newPage: PageType = {
      id: `chat-${Date.now()}`,
      title: "New Chat",
      icon: "💬",
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: ["chat"],
      parentId: projectId
    };
    
    const updatedProject = {
      ...selectedProject,
      pages: [...selectedProject.pages, newPage]
    };
    
    setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar 
        projects={projects}
        onCreateProject={handleCreateProject}
        onProjectSelect={setSelectedProject}
        selectedProjectId={selectedProject?.id}
        onCreatePage={handleCreatePage}
        onCreateChat={handleCreateChat}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <Header title="AI Assistant" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <AIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
} 