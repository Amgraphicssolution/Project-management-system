import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BlockType } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Determine if a block should have a top-aligned grip handle
// For consistency, we'll use center alignment for most blocks except large ones
export function shouldUseTopAlignedGrip(blockType: BlockType['type']): boolean {
  // These block types are typically large in height and should use top alignment
  const largeHeightBlocks = [
    'table',
    'image',
    'video',
    'audio',
    'file',
    'code',
    'form',
    'embed',
    'pdf',
    'figma',
    'adobe',
    'board'
  ];
  
  return largeHeightBlocks.includes(blockType);
}
