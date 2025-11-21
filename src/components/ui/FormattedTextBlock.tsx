import React, { useRef, useEffect, useState } from 'react';
import TextFormatToolbar from './TextFormatToolbar';

interface FormattedTextBlockProps {
  content: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  blockId?: string;
  onChange: (content: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const FormattedTextBlock: React.FC<FormattedTextBlockProps> = ({
  content,
  placeholder,
  className,
  autoFocus,
  blockId,
  onChange,
  onKeyDown
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const uniqueId = blockId || `formatted-text-${Math.random().toString(36).substring(2, 9)}`;
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Enable styleWithCSS for proper color formatting
  useEffect(() => {
    document.execCommand('styleWithCSS', false, 'true');
  }, []);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
      // Place cursor at the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [autoFocus]);

  // Update content when it changes from props
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle Enter key to create new block
    // Do not prevent default behavior for Space or other keys
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onKeyDown) {
        onKeyDown(e);
      }
      return;
    }
    
    // For any other keys (including Space), only call the parent handler if provided
    // but don't prevent the default behavior
    if (onKeyDown && e.key !== ' ') {
      onKeyDown(e);
    }
  };

  const handleBold = () => {
    document.execCommand('bold', false);
    handleInput();
    editorRef.current?.focus();
  };

  const handleItalic = () => {
    document.execCommand('italic', false);
    handleInput();
    editorRef.current?.focus();
  };

  const handleUnderline = () => {
    document.execCommand('underline', false);
    handleInput();
    editorRef.current?.focus();
  };

  const handleColorChange = (color: string) => {
    try {
      // Focus the editor to ensure commands apply to it
      editorRef.current?.focus();
      
      // Apply the color formatting
      if (color === 'inherit') {
        // Remove formatting for default color
        document.execCommand('removeFormat', false);
      } else {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('foreColor', false, color);
      }
      
      // Update the content state
      setTimeout(() => {
        handleInput();
        editorRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Error applying text color:', error);
    }
  };

  const handleLinkClick = () => {
    // Check if there's already a link at the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const parentElement = selection.anchorNode?.parentElement;
      if (parentElement?.tagName === 'A') {
        // Pre-fill the dialog with the existing link URL
        setLinkUrl(parentElement.getAttribute('href') || '');
      } else {
        setLinkUrl('https://');
      }
    } else {
      setLinkUrl('https://');
    }
    
    setShowLinkDialog(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl) {
      setShowLinkDialog(false);
      return;
    }

    try {
      // Focus the editor
      editorRef.current?.focus();
      
      // Create the link
      document.execCommand('createLink', false, linkUrl);
      
      // Update content
      handleInput();
      
      // Close the dialog
      setShowLinkDialog(false);
    } catch (error) {
      console.error('Error inserting link:', error);
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        className={`outline-none focus:outline-none ${className}`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: content || '' }}
        data-placeholder={placeholder}
        data-block-id={uniqueId}
      />
      <TextFormatToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onColorChange={handleColorChange}
        onLink={handleLinkClick}
      />
      
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-md p-4 shadow-lg w-80">
            <h3 className="text-lg font-medium mb-4">Insert Link</h3>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border rounded-md px-3 py-2 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInsertLink();
                } else if (e.key === 'Escape') {
                  setShowLinkDialog(false);
                }
                // Stop event propagation to prevent it from reaching the contentEditable
                e.stopPropagation();
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                className="px-3 py-1 border rounded-md hover:bg-gray-100"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 bg-btn-primary text-btn-primary-foreground rounded-md hover:bg-btn-primary-hover"
                onClick={handleInsertLink}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormattedTextBlock; 
