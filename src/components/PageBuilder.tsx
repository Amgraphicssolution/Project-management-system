
import { useState } from "react";
import { ProjectType, PageType } from "../types";
import PageEditor from "./PageEditor";
import ConversationWidget from "./ConversationWidget";
import AIAssistant from "./AIAssistant";

interface PageBuilderProps {
  project: ProjectType;
  selectedPage: PageType;
  onUpdatePage?: (updatedPage: PageType) => void;
}

export default function PageBuilder({ project, selectedPage, onUpdatePage }: PageBuilderProps) {
  // Determine if the current page is a chat page (could be indicated by a property or path)
  const isChatPage = selectedPage.path?.includes("chat");
  
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
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <PageEditor 
          page={selectedPage} 
          onUpdatePage={onUpdatePage}
        />
      </div>
      
      <div className="w-full lg:w-[320px] space-y-6">
        <AIAssistant />
      </div>
    </div>
  );
}
