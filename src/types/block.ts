export type BlockType = {
  id: string;
  type: 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6' | 'bullet-list' | 'number-list' | 'to-do' | 'toggle' | 'board' | 'quote' | 'table' | 'divider' | 'code' | 'image' | 'video' | 'audio' | 'file' | 'form' | 'table-of-contents' | 'two-columns' | 'three-columns' | 'four-columns' | 'five-columns' | 'embed' | 'figma' | 'pdf' | 'adobe';
  content?: string;
  checked?: boolean;
  children?: BlockType[];
  url?: string;
  caption?: string;
  width?: string;
  height?: string;
  filename?: string;
  filesize?: number;
  filetype?: string;
  columns?: BlockType[][];
}; 