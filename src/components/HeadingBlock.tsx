
import { HeadingLevel } from "../types";
import { cn } from "@/lib/utils";
import React from "react";

interface HeadingBlockProps {
  content: string;
  level: HeadingLevel;
  className?: string;
  editable?: boolean;
  onChange?: (content: string) => void;
}

export default function HeadingBlock({
  content,
  level,
  className,
  editable = false,
  onChange,
}: HeadingBlockProps) {
  const getHeadingClass = () => {
    switch (level) {
      case 1:
        return "text-3xl md:text-4xl font-semibold mb-4";
      case 2:
        return "text-2xl md:text-3xl font-semibold mb-3";
      case 3:
        return "text-xl md:text-2xl font-medium mb-3";
      case 4:
        return "text-lg md:text-xl font-medium mb-2";
      case 5:
        return "text-base md:text-lg font-medium mb-2";
      case 6:
        return "text-sm md:text-base font-medium text-muted-foreground mb-2";
      default:
        return "text-3xl font-semibold mb-4";
    }
  };

  const HeadingComponent = `h${level}` as keyof JSX.IntrinsicElements;

  // Fix the type for the handleChange function to use a more specific element type
  const handleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onChange) {
      onChange(e.currentTarget.textContent || "");
    }
  };

  return (
    <HeadingComponent
      className={cn(
        getHeadingClass(),
        editable ? "outline-none focus:border-b focus:border-primary" : "",
        className
      )}
      contentEditable={editable}
      suppressContentEditableWarning={editable}
      onBlur={handleChange}
    >
      {content}
    </HeadingComponent>
  );
}
