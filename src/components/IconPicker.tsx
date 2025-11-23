import {
  AlertCircle,
  Archive,
  BarChart,
  Bell,
  Book,
  Bookmark,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Flag,
  Folder,
  Heart,
  Home,
  Image,
  Inbox,
  Link,
  Mail,
  Map,
  MessageCircle,
  Music,
  PenTool,
  Settings,
  Star,
  Tag,
  Target,
  Terminal,
  User,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface IconPickerProps {
  onSelect: (icon: string) => void;
}

const icons = [
  { icon: Home, name: 'home' },
  { icon: FileText, name: 'file-text' },
  { icon: Folder, name: 'folder' },
  { icon: Calendar, name: 'calendar' },
  { icon: MessageCircle, name: 'message-circle' },
  { icon: User, name: 'user' },
  { icon: Settings, name: 'settings' },
  { icon: Bell, name: 'bell' },
  { icon: Star, name: 'star' },
  { icon: Heart, name: 'heart' },
  { icon: Bookmark, name: 'bookmark' },
  { icon: Archive, name: 'archive' },
  { icon: Mail, name: 'mail' },
  { icon: Inbox, name: 'inbox' },
  { icon: CheckCircle, name: 'check-circle' },
  { icon: AlertCircle, name: 'alert-circle' },
  { icon: Clock, name: 'clock' },
  { icon: Tag, name: 'tag' },
  { icon: Flag, name: 'flag' },
  { icon: Image, name: 'image' },
  { icon: Video, name: 'video' },
  { icon: Music, name: 'music' },
  { icon: Code, name: 'code' },
  { icon: Terminal, name: 'terminal' },
  { icon: Map, name: 'map' },
  { icon: Link, name: 'link' },
  { icon: BarChart, name: 'bar-chart' },
  { icon: Target, name: 'target' },
  { icon: Book, name: 'book' },
  { icon: PenTool, name: 'pen-tool' },
];

export function IconPicker({ onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-2">
      {icons.map(({ icon: Icon, name }) => (
        <Button
          key={name}
          variant="ghost"
          size="icon"
          className="h-10 w-10 p-0 hover:bg-muted"
          onClick={() => onSelect(name)}
        >
          <Icon className="h-5 w-5" />
        </Button>
      ))}
    </div>
  );
}

export function getIcon(name: string | undefined) {
  if (!name) return null;
  const iconData = icons.find(i => i.name === name);
  return iconData ? iconData.icon : null;
}