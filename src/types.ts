export interface UserType {
  id: string;
  name: string;
  avatar?: string;
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
  type: 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6' | 
        'bullet-list' | 'number-list' | 'to-do' | 'toggle' | 'board' | 'quote' | 'table' | 'divider' |
        'image' | 'video' | 'audio' | 'file' | 'code' | 'form' | 'table-of-contents' | 
        'two-columns' | 'three-columns' | 'four-columns' | 'five-columns' |
        'embed' | 'figma' | 'pdf' | 'adobe';
  content: string;
  url?: string;
  language?: string;
  checked?: boolean;
  items?: string[];
  listItems?: Array<{
    id: string;
    content: string;
    checked?: boolean;
  }>;
  children?: BlockType[];
  icon?: string;
  parentId?: string;
  width?: number;
}

export interface PageType {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  description?: string;
  blocks: BlockType[];
  createdAt: string;
  updatedAt: string;
  path?: string[];
  parentId?: string;
}

export interface ProjectType {
  id: string;
  title: string;
  pages: PageType[];
  createdAt: string;
  updatedAt: string;
  icon?: string;
  cover?: {
    type: 'image' | 'color';
    value: string;
  };
  coverHeight?: string;
  description?: string;
}

export interface ActivityType {
  id: string;
  user: UserType;
  action: string;
  target: string;
  targetType: string;
  timestamp: string;
}
