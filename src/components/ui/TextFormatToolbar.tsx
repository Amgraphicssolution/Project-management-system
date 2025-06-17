import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Palette, Link } from 'lucide-react';

interface TextFormatToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onColorChange: (color: string) => void;
  onLink?: () => void;
}

const TextFormatToolbar: React.FC<TextFormatToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onColorChange,
  onLink
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  const colors = [
    { name: 'Default', value: 'inherit' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ];

  // Save the current selection when opening color picker
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0).cloneRange());
    }
  };

  // Restore selection when applying color
  const restoreSelection = () => {
    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node) && colorPickerOpen) {
        setColorPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [colorPickerOpen]);

  // Check for text selection
  const checkSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        if (rect.width > 0) {
          setPosition({
            top: window.scrollY + rect.top,
            left: window.scrollX + rect.left + (rect.width / 2)
          });
          setIsVisible(true);
          setSavedSelection(range.cloneRange());
        }
      } else if (!colorPickerOpen) {
        setIsVisible(false);
      }
    }, 0);
  };

  // Add event listeners
  useEffect(() => {
    document.addEventListener('mouseup', checkSelection);
    document.addEventListener('keyup', checkSelection);
    document.addEventListener('selectionchange', checkSelection);
    
    return () => {
      document.removeEventListener('mouseup', checkSelection);
      document.removeEventListener('keyup', checkSelection);
      document.removeEventListener('selectionchange', checkSelection);
    };
  }, [colorPickerOpen]);

  const handleColorButtonClick = (color: string) => {
    restoreSelection();
    onColorChange(color);
    setColorPickerOpen(false);
  };

  const handleLinkButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLink) {
      restoreSelection();
      onLink();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-[100] bg-white shadow-lg rounded-md p-1.5 flex items-center gap-1.5 border border-gray-200"
      style={{ 
        top: `${position.top - 45}px`, 
        left: `${position.left}px`,
        transform: 'translateX(-50%)'
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button 
        className="p-1.5 hover:bg-gray-100 rounded-sm"
        onClick={(e) => {
          e.preventDefault();
          onBold();
        }}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button 
        className="p-1.5 hover:bg-gray-100 rounded-sm"
        onClick={(e) => {
          e.preventDefault();
          onItalic();
        }}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button 
        className="p-1.5 hover:bg-gray-100 rounded-sm"
        onClick={(e) => {
          e.preventDefault();
          onUnderline();
        }}
      >
        <Underline className="h-4 w-4" />
      </button>
      <div ref={colorPickerRef} className="relative">
        <button 
          className="p-1.5 hover:bg-gray-100 rounded-sm"
          onClick={(e) => {
            e.preventDefault();
            saveSelection();
            setColorPickerOpen(!colorPickerOpen);
          }}
        >
          <Palette className="h-4 w-4" />
        </button>
        {colorPickerOpen && (
          <div 
            className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md p-2 border border-gray-200 z-[101]"
            style={{ width: '120px' }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-3 gap-1">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorButtonClick(color.value);
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: color.value === 'inherit' ? 'currentColor' : color.value }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {onLink && (
        <button 
          className="p-1.5 hover:bg-gray-100 rounded-sm"
          onClick={handleLinkButtonClick}
        >
          <Link className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default TextFormatToolbar; 