
import { ActivityType } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  activities: ActivityType[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-medium mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors duration-200 animate-fade-in"
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
