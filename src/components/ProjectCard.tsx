
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ProjectType } from "../types";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: ProjectType;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { title, description, coverImage, lastUpdated, team, progress } = project;
  
  // Format the date as "X days/hours/minutes ago"
  const timeAgo = formatDistanceToNow(new Date(lastUpdated), { addSuffix: true });

  return (
    <Card 
      onClick={onClick}
      className="overflow-hidden hover-scale card-shadow cursor-pointer animate-fade-in"
    >
      {coverImage && (
        <div className="w-full h-40 overflow-hidden">
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{description}</p>
        <Progress value={progress} className="h-1.5 mb-4" />
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {team.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="w-7 h-7 border-2 border-background">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {team.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +{team.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
