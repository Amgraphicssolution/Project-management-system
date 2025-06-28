import { Button } from "@/components/ui/button";
import { PageType, ProjectType } from "@/types";
import { ImagePlus, Plus, Home, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import ShareProjectDialog from "./ShareProjectDialog";

interface ProjectPageProps {
  page: PageType;
  project: ProjectType;
  onUpdatePage: (updatedPage: PageType) => void;
}

export default function ProjectPage({ page, project, onUpdatePage }: ProjectPageProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const handleIconAdd = () => {
    // TODO: Implement icon picker
    const newIcon = "📁"; // This would come from an icon picker
    onUpdatePage({
      ...page,
      icon: newIcon
    });
  };

  const handleCoverAdd = () => {
    // TODO: Implement image upload
    const newCover = "https://picsum.photos/1200/400"; // This would come from file upload
    onUpdatePage({
      ...page,
      cover: newCover
    });
  };

  const handleDescriptionAdd = () => {
    // TODO: Implement description editor
    const newDescription = "Project Description"; // This would come from a text editor
    onUpdatePage({
      ...page,
      description: newDescription
    });
  };

  const handleShareClick = () => {
    console.log("Share button clicked, opening dialog");
    setIsShareDialogOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image Section */}
      {page.cover ? (
        <div 
          className="w-full h-48 rounded-lg mb-6 bg-cover bg-center relative group"
          style={{ backgroundImage: `url(${page.cover})` }}
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button variant="secondary" className="bg-background/80 hover:bg-background" onClick={handleCoverAdd}>
              Change Cover
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-48 rounded-lg mb-6 flex flex-col items-center justify-center gap-2"
          onClick={handleCoverAdd}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <span className="text-muted-foreground">Add Cover</span>
        </Button>
      )}

      {/* Project Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex-shrink-0">
          {page.icon ? (
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 text-2xl"
              onClick={handleIconAdd}
            >
              {page.icon}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16"
              onClick={handleIconAdd}
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
            </Button>
          )}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={page.title}
            onChange={(e) => onUpdatePage({ ...page, title: e.target.value })}
            placeholder="Project Name"
            className="text-3xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0"
          />
        </div>
      </div>

      {/* Breadcrumb and Share Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="h-4 w-4" />
          <span>/</span>
          <span>{project.title}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleShareClick}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" onClick={handleIconAdd}>Add Icon</Button>
        <Button variant="outline" onClick={handleCoverAdd}>Add Cover</Button>
        <Button variant="outline" onClick={handleDescriptionAdd}>Add Description</Button>
      </div>

      {/* Description */}
      {page.description ? (
        <div className="prose max-w-none">
          <p>{page.description}</p>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
          onClick={handleDescriptionAdd}
        >
          <p className="text-muted-foreground">Add a description to your project</p>
        </div>
      )}

      {/* Shared With */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Shared with</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShareClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>MB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareProjectDialog 
        project={project}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </div>
  );
} 