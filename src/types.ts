
export interface UserType {
  id: string;
  name: string;
  avatar: string;
}

export interface ConversationType {
  id: string;
  user: UserType;
  content: string;
  timestamp: string;
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface BlockType {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'file' | 'code' | 'callout' | 'todo' | 'quote' | 'divider' | 'toggle' | 'table';
  content: string;
  level?: HeadingLevel;
  url?: string;
  language?: string;
  checked?: boolean;
  items?: string[];
  children?: BlockType[];
  icon?: string;
}

export interface PageType {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  emoji?: string;
  blocks: BlockType[];
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  path: string[];
}

export interface ProjectType {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  icon?: string;
  lastUpdated: string;
  team: UserType[];
  progress: number;
  pages: PageType[];
  conversations: ConversationType[];
}

export interface ActivityType {
  id: string;
  user: UserType;
  action: string;
  target: string;
  targetType: string;
  timestamp: string;
}
