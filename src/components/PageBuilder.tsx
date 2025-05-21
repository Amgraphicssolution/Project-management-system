import { useState } from "react";
import { ProjectType, PageType } from "../types";
import PageEditor from "./PageEditor";
import ConversationWidget from "./ConversationWidget";
import ProjectPage from "./ProjectPage";

interface PageBuilderProps {
  project: ProjectType;
  selectedPage: PageType;
  onUpdatePage?: (updatedPage: PageType) => void;
}

export default function PageBuilder({ project, selectedPage, onUpdatePage }: PageBuilderProps) {
  // Determine if the current page is a chat page or project page
  const isChatPage = selectedPage.path?.includes("chat");
  const isProjectPage = selectedPage.path?.length === 0 || selectedPage.path?.[0] === "projects";
  
  if (isChatPage) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {selectedPage.icon && <span className="mr-2">{selectedPage.icon}</span>}
          {selectedPage.title}
        </h1>
        <ConversationWidget 
          conversations={project.conversations} 
          className="w-full border-none shadow-none"
          onSendMessage={(message) => console.log("Message sent:", message)}
        />
      </div>
    );
  }

  if (isProjectPage && onUpdatePage) {
    return <ProjectPage page={selectedPage} onUpdatePage={onUpdatePage} />;
  }
  
  return (
    <div className="w-full">
      <PageEditor 
        page={selectedPage} 
        onUpdatePage={onUpdatePage}
      />
    </div>
  );
}
