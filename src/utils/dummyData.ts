
import { ProjectType, BlockType } from '../types';

export const dummyProjects: ProjectType[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description: 'Revamp the company website with a modern look and improved UX',
    coverImage: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
    lastUpdated: '2023-05-12T10:30:00Z',
    team: [
      { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: '3', name: 'Jordan Lee', avatar: 'https://i.pravatar.cc/150?img=3' },
    ],
    progress: 60,
    blocks: [
      {
        id: 'block-1',
        type: 'heading',
        content: 'Project Overview',
        level: 1,
      },
      {
        id: 'block-2',
        type: 'paragraph',
        content: 'This project aims to completely redesign our website to better reflect our brand identity and improve user experience. We will focus on a minimalist design with enhanced accessibility.',
      },
      {
        id: 'block-3', 
        type: 'heading',
        content: 'Goals',
        level: 2,
      },
      {
        id: 'block-4',
        type: 'paragraph',
        content: 'Increase conversion rate by 30%, improve mobile experience, and ensure ADA compliance.',
      },
    ],
    pages: [
      {
        id: 'page-1',
        title: 'Project Overview',
        blocks: [
          {
            id: 'block-1',
            type: 'heading',
            content: 'Project Overview',
            level: 1,
          },
          {
            id: 'block-2',
            type: 'paragraph',
            content: 'This project aims to completely redesign our website to better reflect our brand identity and improve user experience. We will focus on a minimalist design with enhanced accessibility.',
          }
        ],
        createdAt: '2023-05-12T10:30:00Z',
        updatedAt: '2023-05-12T10:30:00Z',
        path: []
      }
    ],
    conversations: [
      {
        id: 'msg-1',
        user: { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
        content: 'I\'ve just uploaded the initial wireframes. Can everyone review them by tomorrow?',
        timestamp: '2023-05-10T14:23:00Z',
      },
      {
        id: 'msg-2',
        user: { id: '2', name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=2' },
        content: 'Looks great! I especially like the new navigation structure.',
        timestamp: '2023-05-10T16:45:00Z',
      },
      {
        id: 'msg-3',
        user: { id: '3', name: 'Jordan Lee', avatar: 'https://i.pravatar.cc/150?img=3' },
        content: 'Have we considered how this will look on tablets? The sidebar might be too crowded.',
        timestamp: '2023-05-11T09:12:00Z',
      },
    ],
  },
  {
    id: '2',
    title: 'Brand Identity',
    description: 'Develop a new brand identity including logo, color palette, and typography',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    lastUpdated: '2023-05-15T14:20:00Z',
    team: [
      { id: '2', name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: '4', name: 'Riley Chen', avatar: 'https://i.pravatar.cc/150?img=4' },
    ],
    progress: 25,
    blocks: [
      {
        id: 'block-1',
        type: 'heading',
        content: 'Brand Identity Project',
        level: 1,
      },
      {
        id: 'block-2',
        type: 'paragraph',
        content: 'Creating a cohesive brand identity system including logo design, color palette, typography, and usage guidelines.',
      },
    ],
    pages: [
      {
        id: 'page-1',
        title: 'Brand Identity Project',
        blocks: [
          {
            id: 'block-1',
            type: 'heading',
            content: 'Brand Identity Project',
            level: 1,
          },
          {
            id: 'block-2',
            type: 'paragraph',
            content: 'Creating a cohesive brand identity system including logo design, color palette, typography, and usage guidelines.',
          }
        ],
        createdAt: '2023-05-15T14:20:00Z',
        updatedAt: '2023-05-15T14:20:00Z',
        path: []
      }
    ],
    conversations: [
      {
        id: 'msg-1',
        user: { id: '2', name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=2' },
        content: 'I\'ve started working on some color palette options. Should we go vibrant or more subdued?',
        timestamp: '2023-05-14T11:30:00Z',
      },
      {
        id: 'msg-2',
        user: { id: '4', name: 'Riley Chen', avatar: 'https://i.pravatar.cc/150?img=4' },
        content: 'The brief mentions "bold but professional" - maybe we can use vibrant colors as accents?',
        timestamp: '2023-05-14T13:42:00Z',
      },
    ],
  },
  {
    id: '3',
    title: 'Marketing Campaign',
    description: 'Q3 marketing campaign for product launch',
    coverImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
    lastUpdated: '2023-05-14T09:15:00Z',
    team: [
      { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: '3', name: 'Jordan Lee', avatar: 'https://i.pravatar.cc/150?img=3' },
      { id: '5', name: 'Morgan Smith', avatar: 'https://i.pravatar.cc/150?img=5' },
    ],
    progress: 15,
    blocks: [
      {
        id: 'block-1',
        type: 'heading',
        content: 'Q3 Marketing Campaign',
        level: 1,
      },
      {
        id: 'block-2',
        type: 'paragraph',
        content: 'Planning and executing our Q3 marketing campaign for the new product launch.',
      },
    ],
    pages: [
      {
        id: 'page-1',
        title: 'Q3 Marketing Campaign',
        blocks: [
          {
            id: 'block-1',
            type: 'heading',
            content: 'Q3 Marketing Campaign',
            level: 1,
          },
          {
            id: 'block-2',
            type: 'paragraph',
            content: 'Planning and executing our Q3 marketing campaign for the new product launch.',
          }
        ],
        createdAt: '2023-05-14T09:15:00Z',
        updatedAt: '2023-05-14T09:15:00Z',
        path: []
      }
    ],
    conversations: [
      {
        id: 'msg-1',
        user: { id: '5', name: 'Morgan Smith', avatar: 'https://i.pravatar.cc/150?img=5' },
        content: 'Does anyone have access to last quarter\'s campaign results? I want to compare our strategies.',
        timestamp: '2023-05-13T15:27:00Z',
      },
      {
        id: 'msg-2',
        user: { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
        content: 'I\'ll share them with you right away. The social media campaign performed particularly well.',
        timestamp: '2023-05-13T15:45:00Z',
      },
    ],
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
