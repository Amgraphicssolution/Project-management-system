export interface ProjectType {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  cover?: {
    type: 'color' | 'image';
    value: string;
  };
  coverHeight?: string;
  pages: PageType[];
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  path?: string[];
}

export interface PageType {
  id: string;
  title: string;
  projectId: string;
  icon?: string;
  path?: string[];
  parentId?: string;
  type?: 'page' | 'conversation';
  createdAt: string;
  updatedAt: string;
} 