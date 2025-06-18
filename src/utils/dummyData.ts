import { ProjectType, OrganizationType } from '../types/index';

export const dummyOrganizations: OrganizationType[] = [
  {
    id: 'org-1',
    name: 'Personal Workspace',
    createdAt: '2023-05-10T09:00:00Z',
    updatedAt: '2023-05-10T09:00:00Z',
    isDefault: true
  },
  {
    id: 'org-2',
    name: 'Design Team',
    image: 'https://github.com/shadcn.png',
    createdAt: '2023-05-11T10:00:00Z',
    updatedAt: '2023-05-11T10:00:00Z'
  },
  {
    id: 'org-3',
    name: 'Marketing',
    createdAt: '2023-05-12T11:00:00Z',
    updatedAt: '2023-05-12T11:00:00Z'
  }
];

export const dummyProjects: ProjectType[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description: 'Revamp the company website with a modern look and improved UX',
    cover: {
      type: 'image',
      value: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7'
    },
    icon: '🎨',
    pages: [
      {
        id: 'page-1',
        title: 'Project Overview',
        icon: '📄',
        blocks: [],
        createdAt: '2023-05-12T10:30:00Z',
        updatedAt: '2023-05-12T10:30:00Z',
        path: ['projects'],
        parentId: '1'
      },
      {
        id: 'page-2',
        title: 'Design System',
        icon: '🎯',
        blocks: [],
        createdAt: '2023-05-12T10:30:00Z',
        updatedAt: '2023-05-12T10:30:00Z',
        path: ['projects'],
        parentId: '1'
      }
    ],
    createdAt: '2023-05-12T10:30:00Z',
    updatedAt: '2023-05-12T10:30:00Z',
    organizationId: 'org-1'
  },
  {
    id: '2',
    title: 'Brand Identity',
    description: 'Develop a new brand identity including logo, color palette, and typography',
    cover: {
      type: 'color',
      value: '#2563eb'
    },
    icon: '✨',
    pages: [
      {
        id: 'page-3',
        title: 'Brand Guidelines',
        icon: '📚',
        blocks: [],
        createdAt: '2023-05-15T14:20:00Z',
        updatedAt: '2023-05-15T14:20:00Z',
        path: ['projects'],
        parentId: '2'
      }
    ],
    createdAt: '2023-05-15T14:20:00Z',
    updatedAt: '2023-05-15T14:20:00Z',
    organizationId: 'org-1'
  },
  {
    id: '3',
    title: 'Marketing Campaign',
    description: 'Q3 marketing campaign for product launch',
    cover: {
      type: 'image',
      value: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1'
    },
    icon: '📢',
    pages: [
      {
        id: 'page-4',
        title: 'Campaign Strategy',
        icon: '📋',
        blocks: [],
        createdAt: '2023-05-14T09:15:00Z',
        updatedAt: '2023-05-14T09:15:00Z',
        path: ['projects'],
        parentId: '3'
      },
      {
        id: 'chat-1',
        title: 'Team Discussion',
        icon: '💬',
        blocks: [],
        createdAt: '2023-05-14T09:15:00Z',
        updatedAt: '2023-05-14T09:15:00Z',
        path: ['chat'],
        parentId: '3'
      }
    ],
    createdAt: '2023-05-14T09:15:00Z',
    updatedAt: '2023-05-14T09:15:00Z',
    organizationId: 'org-2'
  }
];

export const recentActivities = [
  {
    id: '1',
    user: { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
    action: 'created',
    target: 'Website Redesign',
    targetType: 'project',
    timestamp: '2023-05-12T10:30:00Z',
  },
  {
    id: '2',
    user: { id: '2', name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=2' },
    action: 'commented on',
    target: 'Brand Identity',
    targetType: 'project',
    timestamp: '2023-05-14T13:42:00Z',
  },
  {
    id: '3',
    user: { id: '3', name: 'Jordan Lee', avatar: 'https://i.pravatar.cc/150?img=3' },
    action: 'uploaded',
    target: 'wireframes.fig',
    targetType: 'file',
    timestamp: '2023-05-11T09:12:00Z',
  },
  {
    id: '4',
    user: { id: '5', name: 'Morgan Smith', avatar: 'https://i.pravatar.cc/150?img=5' },
    action: 'created',
    target: 'Marketing Campaign',
    targetType: 'project',
    timestamp: '2023-05-14T09:15:00Z',
  },
];
