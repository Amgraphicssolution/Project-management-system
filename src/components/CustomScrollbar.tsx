import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CustomScrollbarProps {
    children: React.ReactNode;
    className?: string;
}

export const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ children, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showScrollbar, setShowScrollbar] = useState(false);
    const [thumbWidth, setThumbWidth] = useState(0);
    const [thumbLeft, setThumbLeft] = useState(0);

    const updateScrollbar = useCallback(() => {
        if (!containerRef.current || !contentRef.current) return;

        const container = containerRef.current;
        const content = contentRef.current;

        const containerWidth = container.clientWidth;
        const contentWidth = content.scrollWidth;
        const scrollLeft = content.scrollLeft;

        // Show scrollbar only if content overflows
        const hasOverflow = contentWidth > containerWidth;
        setShowScrollbar(hasOverflow);

        if (hasOverflow) {
            // Calculate thumb width (proportional to visible area)
            const ratio = containerWidth / contentWidth;
            const calculatedThumbWidth = Math.max(containerWidth * ratio, 40); // Minimum 40px
            setThumbWidth(calculatedThumbWidth);

            // Calculate thumb position
            const maxScroll = contentWidth - containerWidth;
            const scrollPercentage = scrollLeft / maxScroll;
            const maxThumbLeft = containerWidth - calculatedThumbWidth;
            setThumbLeft(scrollPercentage * maxThumbLeft);
        }
    }, []);

    const handleScroll = useCallback(() => {
        updateScrollbar();
    }, [updateScrollbar]);

    const handleThumbMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current || !contentRef.current) return;

        const container = containerRef.current;
        const content = contentRef.current;
        const containerRect = container.getBoundingClientRect();

        const mouseX = e.clientX - containerRect.left;
        const maxThumbLeft = container.clientWidth - thumbWidth;
        const newThumbLeft = Math.max(0, Math.min(mouseX - thumbWidth / 2, maxThumbLeft));

        const scrollPercentage = newThumbLeft / maxThumbLeft;
        const maxScroll = content.scrollWidth - content.clientWidth;
        content.scrollLeft = scrollPercentage * maxScroll;
    }, [isDragging, thumbWidth]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const resizeObserver = new ResizeObserver(updateScrollbar);
        resizeObserver.observe(content);

        updateScrollbar();

        return () => {
            resizeObserver.disconnect();
        };
    }, [updateScrollbar]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Content with hidden native scrollbar */}
            <div
                ref={contentRef}
                onScroll={handleScroll}
                className="overflow-x-auto overflow-y-hidden"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <style>
                    {`
            .custom-scrollbar-content::-webkit-scrollbar {
              display: none;
            }
          `}
                </style>
                <div className="custom-scrollbar-content">
                    {children}
                </div>
            </div>

            {/* Custom scrollbar track */}
            {showScrollbar && (
                <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-transparent">
                    {/* Custom scrollbar thumb */}
                    <div
                        ref={thumbRef}
                        onMouseDown={handleThumbMouseDown}
                        className="absolute top-0 h-full bg-[#3853EA] rounded-full cursor-pointer transition-colors hover:bg-[#2a3fbd]"
                        style={{
                            width: `${thumbWidth}px`,
                            left: `${thumbLeft}px`,
                        }}
                    />
                </div>
            )}
        </div>
    );
};
