import React, { useState, useRef, useEffect } from 'react';

import { MoreHorizontal, Plus, Trash, Copy, Type, Square, GripVertical, GripHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { HexColorPicker } from "react-colorful";

// Helper for default cell
const defaultCell = () => ({ value: '', textColor: '#222', bgColor: 'transparent' });

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;
const MIN_COLUMN_WIDTH = 60; // Minimum width in pixels

// Six-dot handle component
const SixDotHandle = ({ onClick, className, visible = false, horizontal = false }: {
  onClick?: React.MouseEventHandler,
  className?: string,
  visible?: boolean,
  horizontal?: boolean
}) => (
  <div
    className={cn(
      "transition-opacity",
      visible ? "opacity-80" : "opacity-0",
      className
    )}
    onClick={onClick}
  >
    {horizontal ? (
      <GripHorizontal className="h-4 w-4 text-muted-foreground/50" />
    ) : (
      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
    )}
  </div>
);

// Color picker submenu component
const ColorPickerSubmenu = ({ value, onChange, isOpen, onClose }) => {
  const [tempColor, setTempColor] = useState(value);

  // Update tempColor when value changes or component opens
  useEffect(() => {
    if (isOpen) {
      setTempColor(value);
    }
  }, [value, isOpen]);

  // Get default color based on the current value type
  const getDefaultColor = () => {
    if (value === 'transparent' || value.includes('rgba') || value.includes('rgb')) {
      return 'transparent';
    }
    return '#222'; // Default text color
  };

  // Handle reset to default color
  const handleReset = () => {
    const defaultColor = getDefaultColor();
    setTempColor(defaultColor);
    onChange(defaultColor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <div
        className="absolute bg-white rounded-md border shadow-md p-3 w-[220px]"
        style={{
          top: '0',
          left: '100%',
          transform: 'translateX(10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Color Picker</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleReset}
              title="Reset to default"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <HexColorPicker color={tempColor} onChange={setTempColor} />
          <div className="flex items-center gap-2 mt-2">
            <Label className="text-xs">Hex</Label>
            <Input
              type="text"
              value={tempColor}
              onChange={(e) => setTempColor(e.target.value)}
              className="h-7 text-xs"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onChange(tempColor);
                onClose();
              }}
              className="h-8 text-xs"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Row and column option popup content
const RowColumnPopupContent = ({
  type, // 'row' or 'column'
  index,
  styles,
  onTextColorChange,
  onBgColorChange,
  onDuplicate,
  onDelete
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Close submenu handler
  const handleCloseSubmenu = () => {
    setActiveSubmenu(null);
  };

  return (
    <div className="relative py-1">
      <div className="flex flex-col gap-1">
        {/* Text Color Option */}
        <div
          className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
          onClick={() => setActiveSubmenu('textColor')}
        >
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Text Color</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                onTextColorChange(index, '#222'); // Reset to default text color
              }}
              title="Reset to default"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: styles?.textColor || '#222' }}
            />
          </div>
        </div>

        {/* Cell Color Option */}
        <div
          className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
          onClick={() => setActiveSubmenu('bgColor')}
        >
          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Cell Color</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                onBgColorChange(index, 'transparent'); // Reset to transparent background
              }}
              title="Reset to default"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: styles?.bgColor || 'transparent' }}
            />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-200 my-1" />

        {/* Duplicate Option */}
        <div
          className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
          onClick={onDuplicate}
        >
          <div className="flex items-center gap-2">
            <Copy className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Duplicate</span>
          </div>
        </div>

        {/* Delete Option */}
        <div
          className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-red-500"
          onClick={onDelete}
        >
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4" />
            <span className="text-sm">Delete</span>
          </div>
        </div>
      </div>

      {/* Color Picker Submenus */}
      <ColorPickerSubmenu
        value={styles?.textColor || '#222'}
        onChange={(color) => onTextColorChange(index, color)}
        isOpen={activeSubmenu === 'textColor'}
        onClose={handleCloseSubmenu}
      />

      <ColorPickerSubmenu
        value={styles?.bgColor || 'transparent'}
        onChange={(color) => onBgColorChange(index, color)}
        isOpen={activeSubmenu === 'bgColor'}
        onClose={handleCloseSubmenu}
      />
    </div>
  );
};

const TableBlock = ({
  block,
  onUpdate,
  onDelete,
  className = '',
}) => {
  // Basic state
  const [rows, setRows] = useState(
    block.rows || Array.from({ length: DEFAULT_ROWS }, () => Array.from({ length: DEFAULT_COLS }, defaultCell))
  );
  const [headerRow, setHeaderRow] = useState(block.headerRow || false);
  const [headerCol, setHeaderCol] = useState(block.headerCol || false);

  // Hover states for specific areas
  const [isBottomHovered, setIsBottomHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuButtonHovered, setIsMenuButtonHovered] = useState(false);

  // Hover state for rows and columns
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);

  // Selection states
  const [selectedCell, setSelectedCell] = useState(null); // {rowIdx, colIdx}
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);

  // Resizing state
  const [columnWidths, setColumnWidths] = useState(block.columnWidths || Array(DEFAULT_COLS).fill(null));
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumnIndex, setResizingColumnIndex] = useState(null);

  // Dragging state
  const [dragState, setDragState] = useState(null); // { type, source, destination }

  // Refs
  const tableRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Row/column style state
  const [rowStyles, setRowStyles] = useState(
    block.rowStyles || Array.from({ length: DEFAULT_ROWS }, () => ({ textColor: '#222', bgColor: 'transparent' }))
  );
  const [colStyles, setColStyles] = useState(
    block.colStyles || Array.from({ length: DEFAULT_COLS }, () => ({ textColor: '#222', bgColor: 'transparent' }))
  );

  // Effect to handle clicks outside the table
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        // Clear selections when clicking outside the table
        setSelectedCell(null);
        setSelectedRow(null);
        setSelectedCol(null);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle drag end for rows or columns
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    // Drop outside the list or no movement
    if (!destination || (source.index === destination.index)) {
      return;
    }

    // Handle row reordering
    if (type === 'row') {
      // Create new arrays
      const newRows = Array.from(rows);
      const newRowStyles = Array.from(rowStyles);

      // Remove the dragged item
      const [removedRow] = newRows.splice(source.index, 1);
      const [removedStyle] = newRowStyles.splice(source.index, 1);

      // Insert at the new position
      newRows.splice(destination.index, 0, removedRow);
      newRowStyles.splice(destination.index, 0, removedStyle);

      // Update state
      setRows(newRows);
      setRowStyles(newRowStyles);
      onUpdate && onUpdate({
        ...block,
        rows: newRows,
        rowStyles: newRowStyles
      });
    }

    // Handle column reordering
    if (type === 'column') {
      // Create new arrays
      const newRows = rows.map(row => Array.from(row));
      const newColStyles = Array.from(colStyles);
      const newColumnWidths = Array.from(columnWidths);

      // For each row, move the cell from source to destination
      newRows.forEach(row => {
        const [removedCell] = row.splice(source.index, 1);
        row.splice(destination.index, 0, removedCell);
      });

      // Move the column style
      const [removedStyle] = newColStyles.splice(source.index, 1);
      newColStyles.splice(destination.index, 0, removedStyle);

      // Move the column width
      const [removedWidth] = newColumnWidths.splice(source.index, 1);
      newColumnWidths.splice(destination.index, 0, removedWidth);

      // Update state
      setRows(newRows);
      setColStyles(newColStyles);
      setColumnWidths(newColumnWidths);
      onUpdate && onUpdate({
        ...block,
        rows: newRows,
        colStyles: newColStyles,
        columnWidths: newColumnWidths
      });
    }
  };

  // Handle cell hover to show relevant row/column controls
  const handleCellHover = (rowIdx, colIdx) => {
    setHoveredRow(rowIdx);
    setHoveredCol(colIdx);
  };

  const handleCellLeave = () => {
    // Only clear if not interacting with a menu
    if (!isMenuOpen) {
      setHoveredRow(null);
      setHoveredCol(null);
    }
  };

  // Handle cell selection
  const handleCellClick = (rowIdx, colIdx) => {
    setSelectedCell({ rowIdx, colIdx });
    setSelectedRow(null);
    setSelectedCol(null);
  };

  // Handle row selection
  const handleRowSelect = (rowIdx) => {
    setSelectedRow(rowIdx);
    setSelectedCell(null);
    setSelectedCol(null);
  };

  // Handle column selection
  const handleColSelect = (colIdx) => {
    setSelectedCol(colIdx);
    setSelectedCell(null);
    setSelectedRow(null);
  };

  // Basic handlers
  const handleCellChange = (rowIdx, colIdx, value) => {
    const newRows = [...rows];
    newRows[rowIdx][colIdx] = { ...newRows[rowIdx][colIdx], value };
    setRows(newRows);
    onUpdate && onUpdate({ ...block, rows: newRows });
  };

  const handleAddRow = () => {
    const newRow = Array.from({ length: rows[0].length }, defaultCell);
    const newRows = [...rows, newRow];
    const newRowStyles = [...rowStyles, { textColor: '#222', bgColor: 'transparent' }];

    setRows(newRows);
    setRowStyles(newRowStyles);
    onUpdate && onUpdate({
      ...block,
      rows: newRows,
      rowStyles: newRowStyles
    });
  };

  const handleAddColumn = () => {
    const newRows = rows.map(row => [...row, defaultCell()]);
    const newColStyles = [...colStyles, { textColor: '#222', bgColor: 'transparent' }];
    const newColumnWidths = [...columnWidths, null]; // Add with auto width

    setRows(newRows);
    setColStyles(newColStyles);
    setColumnWidths(newColumnWidths);
    onUpdate && onUpdate({
      ...block,
      rows: newRows,
      colStyles: newColStyles,
      columnWidths: newColumnWidths
    });
  };

  const handleToggleHeaderRow = (checked) => {
    setHeaderRow(checked);
    onUpdate && onUpdate({ ...block, headerRow: checked });
  };

  const handleToggleHeaderCol = (checked) => {
    setHeaderCol(checked);
    onUpdate && onUpdate({ ...block, headerCol: checked });
  };

  const handleMenuClick = (e) => {
    // Prevent the click from reaching the table container
    e.stopPropagation();
  };

  // Row operations
  const handleRowTextColorChange = (rowIdx, color) => {
    const newRowStyles = [...rowStyles];
    newRowStyles[rowIdx] = { ...newRowStyles[rowIdx], textColor: color };
    setRowStyles(newRowStyles);
    onUpdate && onUpdate({ ...block, rowStyles: newRowStyles });
  };

  const handleRowBgColorChange = (rowIdx, color) => {
    const newRowStyles = [...rowStyles];
    newRowStyles[rowIdx] = { ...newRowStyles[rowIdx], bgColor: color };
    setRowStyles(newRowStyles);
    onUpdate && onUpdate({ ...block, rowStyles: newRowStyles });
  };

  const handleDuplicateRow = (rowIdx) => {
    const newRows = [...rows];
    const newRow = [...rows[rowIdx]];
    newRows.splice(rowIdx + 1, 0, newRow);

    const newRowStyles = [...rowStyles];
    const newStyle = { ...rowStyles[rowIdx] };
    newRowStyles.splice(rowIdx + 1, 0, newStyle);

    setRows(newRows);
    setRowStyles(newRowStyles);
    onUpdate && onUpdate({
      ...block,
      rows: newRows,
      rowStyles: newRowStyles
    });
  };

  const handleDeleteRow = (rowIdx) => {
    if (rows.length <= 1) return; // Prevent deleting the last row

    const newRows = [...rows];
    newRows.splice(rowIdx, 1);

    const newRowStyles = [...rowStyles];
    newRowStyles.splice(rowIdx, 1);

    setRows(newRows);
    setRowStyles(newRowStyles);
    onUpdate && onUpdate({
      ...block,
      rows: newRows,
      rowStyles: newRowStyles
    });
  };

  // Column operations
  const handleColTextColorChange = (colIdx, color) => {
    const newColStyles = [...colStyles];
    newColStyles[colIdx] = { ...newColStyles[colIdx], textColor: color };
    setColStyles(newColStyles);
    onUpdate && onUpdate({ ...block, colStyles: newColStyles });
  };

  const handleColBgColorChange = (colIdx, color) => {
    const newColStyles = [...colStyles];
    newColStyles[colIdx] = { ...newColStyles[colIdx], bgColor: color };
    setColStyles(newColStyles);
    onUpdate && onUpdate({ ...block, colStyles: newColStyles });
  };

  const handleDuplicateCol = (colIdx) => {
    const newRows = rows.map(row => {
      const newRow = [...row];
      newRow.splice(colIdx + 1, 0, { ...row[colIdx] });
      return newRow;
    });

    const newColStyles = [...colStyles];
    const newStyle = { ...colStyles[colIdx] };
    newColStyles.splice(colIdx + 1, 0, newStyle);

    const newColumnWidths = [...columnWidths];
    newColumnWidths.splice(colIdx + 1, 0, columnWidths[colIdx]);

    setRows(newRows);
    setColStyles(newColStyles);
    setColumnWidths(newColumnWidths);
    onUpdate && onUpdate({
      ...block,
      rows: newRows,
      colStyles: newColStyles,
      columnWidths: newColumnWidths
    });
  };

  const handleDeleteCol = (colIdx) => {
    if (rows[0].length <= 1) return; // Prevent deleting the last column

    const newRows = rows.map(row => {
      const newRow = [...row];
      newRow.splice(colIdx, 1);
      return newRow;
    });

    const newColStyles = [...colStyles];
    newColStyles.splice(colIdx, 1);

    const newColumnWidths = [...columnWidths];
    newColumnWidths.splice(colIdx, 1);

    setRows(newRows);
    setColStyles(newColStyles);
    setColumnWidths(newColumnWidths);
    onUpdate && onUpdate({
      ...block,
      rows: newRows,
      colStyles: newColStyles,
      columnWidths: newColumnWidths
    });
  };

  // Helper to determine if a cell is in a header position
  const isHeaderCell = (rowIdx, colIdx) => {
    return (headerRow && rowIdx === 0) || (headerCol && colIdx === 0);
  };

  // Generate row and column IDs for drag and drop
  const rowIds = Array.from({ length: rows.length }, (_, i) => `row-${i}`);
  const colIds = Array.from({ length: rows[0]?.length || 0 }, (_, i) => `col-${i}`);

  // Calculate the column width 
  const getColWidth = (colIdx) => {
    if (columnWidths[colIdx]) {
      return `${columnWidths[colIdx]}px`;
    }
    return undefined; // Let the table layout handle it automatically
  };

  // Resizing handlers
  const handleResizeStart = (e, colIdx) => {
    e.preventDefault();
    e.stopPropagation();

    // Store initial mouse position
    const initialX = e.clientX;

    // Get direct reference to the table and cells
    const tableElement = tableRef.current;
    if (!tableElement) return;

    // Get all cells in this column
    const cells = tableElement.querySelectorAll(`td:nth-child(${colIdx + 1})`);
    if (cells.length === 0) return;

    // Get initial width from first cell
    const firstCell = cells[0];
    const initialWidth = firstCell.offsetWidth;
    console.log('Initial width:', initialWidth); // Debug

    // Setup UI for resize
    setIsResizing(true);
    setResizingColumnIndex(colIdx);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    // Create mousemove handler
    function onMouseMove(moveEvent) {
      // Calculate width change
      const deltaX = moveEvent.clientX - initialX;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, initialWidth + deltaX);

      console.log('Resizing to width:', newWidth); // Debug

      // Apply width to all cells in this column
      cells.forEach(cell => {
        cell.style.width = `${newWidth}px`;
        cell.style.minWidth = `${newWidth}px`;
      });

      // Also update the colgroup
      const colElement = tableElement.querySelector(`colgroup col:nth-child(${colIdx + 1})`);
      if (colElement) {
        colElement.style.width = `${newWidth}px`;
      }

      // Update state
      const newColumnWidths = [...columnWidths];
      newColumnWidths[colIdx] = newWidth;
      setColumnWidths(newColumnWidths);
    }

    // Create mouseup handler
    function onMouseUp(upEvent) {
      // Clean up
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Update final state
      setIsResizing(false);
      setResizingColumnIndex(null);

      // Measure final width
      const finalWidth = firstCell.offsetWidth;
      console.log('Final width:', finalWidth); // Debug

      // Create new column widths array with the updated width
      const finalColumnWidths = [...columnWidths];
      finalColumnWidths[colIdx] = finalWidth;

      // Update the state and notify parent
      setColumnWidths(finalColumnWidths);
      onUpdate && onUpdate({
        ...block,
        columnWidths: finalColumnWidths
      });
    }

    // Add listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Placeholder for unused functions
  const handleResizeMove = () => { };
  const handleResizeEnd = () => { };

  // Effect to clean up when component unmounts during resize
  useEffect(() => {
    return () => {
      // Make sure we clean up if component unmounts during resize
      if (isResizing) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isResizing]);

  // Update table style to allow resizable columns
  useEffect(() => {
    if (tableRef.current) {
      // Force the table to use the colgroup for column widths
      tableRef.current.style.tableLayout = 'fixed';
    }
  }, []);

  return (
    <div className={cn("relative my-4", className)}>
      {/* Table Options Button - Always visible outside the table */}
      <div
        className="absolute right-0 top-4 z-100 transform -translate-y-full translate-x-0"
        onClick={handleMenuClick}
        onMouseEnter={() => setIsMenuButtonHovered(true)}
        onMouseLeave={() => !isMenuOpen && setIsMenuButtonHovered(false)}
      >
        <DropdownMenu
          open={isMenuOpen}
          onOpenChange={(open) => {
            setIsMenuOpen(open);
            if (!open) {
              setHoveredRow(null);
              setHoveredCol(null);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 p-0 opacity-30 transition-opacity",
                (isMenuButtonHovered || isMenuOpen) && "opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40"
            onInteractOutside={(e) => {
              setIsMenuOpen(false);
              setIsMenuButtonHovered(false);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              className="px-2 py-1 cursor-default"
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Header row</span>
                </div>
                <Switch
                  checked={headerRow}
                  onCheckedChange={handleToggleHeaderRow}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-2 py-1 cursor-default"
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Header column</span>
                </div>
                <Switch
                  checked={headerCol}
                  onCheckedChange={handleToggleHeaderCol}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => {
                setIsMenuOpen(false);
                setIsMenuButtonHovered(false);
                onDelete();
              }}
            >
              Delete Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DragDropContext
        onDragEnd={(result) => {
          // Clear drag state
          setDragState(null);
          handleDragEnd(result);
        }}
        onDragStart={(start) => {
          // Clear any existing selections when starting a new drag
          setSelectedCell(null);

          // Set initial drag state
          setDragState({
            type: start.type,
            source: start.source.index,
            destination: start.source.index
          });
        }}
        onDragUpdate={(update) => {
          // Show visual feedback based on the current drag position
          const { destination, source, draggableId, type } = update;

          // If no valid destination, maintain last known destination
          if (!destination) return;

          // Update drag state with new destination
          setDragState({
            type,
            source: source.index,
            destination: destination.index
          });
        }}
      >
        <div className="table-container relative" ref={tableContainerRef}>
          {/* Resize overlay - only visible during resizing */}
          {isResizing && (
            <div className="absolute inset-0 bg-transparent z-30" />
          )}

          {/* Column Headers with Drag Handles */}
          <div className="relative h-4 mb-1">
            <Droppable droppableId="columns" direction="horizontal" type="column">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex absolute left-0 right-0 h-4",
                    snapshot.isDraggingOver && "bg-blue-100"
                  )}
                >
                  {colIds.map((colId, colIdx) => {
                    const colWidth = 100 / colIds.length;
                    return (
                      <Draggable key={colId} draggableId={colId} index={colIdx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              width: `${colWidth}%`,
                              height: '100%',
                              boxSizing: 'border-box',
                              position: 'relative',
                              border: snapshot.isDragging ? '2px solid #3b82f6' : 'none',
                              borderRadius: snapshot.isDragging ? '4px' : 0,
                              boxShadow: snapshot.isDragging ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
                              opacity: snapshot.isDragging ? 0.9 : 1,
                              backgroundColor: snapshot.isDragging ? '#f0f9ff' : 'transparent',
                              zIndex: snapshot.isDragging ? 50 : 10
                            }}
                          >
                            <Popover onOpenChange={(open) => {
                              if (open) {
                                setHoveredCol(colIdx);
                                setHoveredRow(null);
                                handleColSelect(colIdx);
                              } else if (!isMenuOpen) {
                                setHoveredCol(null);
                              }
                            }}>
                              <PopoverTrigger asChild>
                                <div
                                  className="absolute top-1.5 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                  {...provided.dragHandleProps}
                                >
                                  <SixDotHandle
                                    visible={hoveredCol === colIdx || snapshot.isDragging || selectedCol === colIdx}
                                    horizontal={true}
                                  />
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-60 p-2" align="start">
                                <RowColumnPopupContent
                                  type="column"
                                  index={colIdx}
                                  styles={colStyles[colIdx]}
                                  onTextColorChange={handleColTextColorChange}
                                  onBgColorChange={handleColBgColorChange}
                                  onDuplicate={() => handleDuplicateCol(colIdx)}
                                  onDelete={() => handleDeleteCol(colIdx)}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Column Drag Guide - Only visible during column dragging */}
          {dragState && dragState.type === 'column' && (
            <div
              className="absolute top-0 bottom-0 bg-blue-500/20 border-2 border-blue-500 transition-all duration-150 pointer-events-none"
              style={{
                width: '6px',
                left: (() => {
                  // Calculate position based on destination index
                  if (!tableRef.current) return 0;

                  const table = tableRef.current;
                  const cells = table.rows[0]?.cells || [];

                  if (dragState.destination >= cells.length) {
                    // If dragging to the end, position after the last column
                    const lastCell = cells[cells.length - 1];
                    return lastCell.offsetLeft + lastCell.offsetWidth;
                  }

                  // Position at the left of the destination column
                  return cells[dragState.destination].offsetLeft;
                })(),
                transform: 'translateX(-3px)',
                zIndex: 100
              }}
            />
          )}

          {/* Row Drag Guide - Only visible during row dragging */}
          {dragState && dragState.type === 'row' && (
            <div
              className="absolute left-0 right-0 bg-blue-500/20 border-2 border-blue-500 transition-all duration-150 pointer-events-none"
              style={{
                height: '6px',
                top: (() => {
                  // Calculate position based on destination index
                  if (!tableRef.current) return 0;

                  const rows = tableRef.current.rows;
                  if (dragState.destination >= rows.length) {
                    // If dragging to the end, position after the last row
                    const lastRow = rows[rows.length - 1];
                    return lastRow.offsetTop + lastRow.offsetHeight;
                  }

                  // Position at the top of the destination row
                  return rows[dragState.destination].offsetTop;
                })(),
                transform: 'translateY(-3px)',
                zIndex: 100
              }}
            />
          )}

          {/* Table with Draggable Rows */}
          <table className="w-full border-collapse table-fixed" ref={tableRef}>
            {/* Column group for width definitions */}
            <colgroup>
              {colIds.map((colId, colIdx) => {
                const width = columnWidths[colIdx];
                return (
                  <col
                    key={colId}
                    className="resize-col"
                    data-col-index={colIdx}
                    style={{
                      width: width ? `${width}px` : undefined,
                      minWidth: `${MIN_COLUMN_WIDTH}px`
                    }}
                  />
                );
              })}
            </colgroup>

            <Droppable droppableId="rows" type="row">
              {(provided, snapshot) => (
                <tbody
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    snapshot.isDraggingOver && "bg-blue-100"
                  )}
                >
                  {rowIds.map((rowId, rowIdx) => {
                    const row = rows[rowIdx];
                    const isHeaderRowCell = headerRow && rowIdx === 0;

                    return (
                      <Draggable key={rowId} draggableId={rowId} index={rowIdx}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "relative",
                              isHeaderRowCell && !rowStyles[rowIdx]?.bgColor ? "bg-gray-50 font-semibold" : ""
                            )}
                            style={{
                              backgroundColor: snapshot.isDragging
                                ? '#f0f9ff'
                                : (rowStyles[rowIdx]?.bgColor || (isHeaderRowCell ? '#f9fafb' : 'transparent')),
                              color: rowStyles[rowIdx]?.textColor || '#222',
                              border: snapshot.isDragging ? '2px solid #3b82f6' : null,
                              borderRadius: snapshot.isDragging ? '4px' : null,
                              boxShadow: snapshot.isDragging ? '0 0 10px rgba(59, 130, 246, 0.5)' : null,
                              opacity: snapshot.isDragging ? 0.9 : 1,
                              zIndex: snapshot.isDragging ? 50 : 'auto',
                              ...provided.draggableProps.style
                            }}
                          >
                            {row.map((cell, colIdx) => {
                              const isHeaderColCell = headerCol && colIdx === 0;
                              const isHeader = isHeaderRowCell || isHeaderColCell;

                              // Determine the cell background color with priority
                              let bgColor = 'transparent';

                              // First check for custom colors on the cell's row or column
                              if (rowStyles[rowIdx]?.bgColor && rowStyles[rowIdx]?.bgColor !== 'transparent') {
                                bgColor = rowStyles[rowIdx]?.bgColor; // Row style takes precedence
                              } else if (colStyles[colIdx]?.bgColor && colStyles[colIdx]?.bgColor !== 'transparent') {
                                bgColor = colStyles[colIdx]?.bgColor; // Column style
                              } else if (isHeaderRowCell || isHeaderColCell) {
                                // Only apply default header styling if no custom color is set
                                bgColor = '#f9fafb';
                              }

                              // Determine text color with priority
                              let textColor = '#222';

                              // First check for custom colors on the cell's row or column
                              if (rowStyles[rowIdx]?.textColor && rowStyles[rowIdx]?.textColor !== '#222') {
                                textColor = rowStyles[rowIdx]?.textColor; // Row style takes precedence
                              } else if (colStyles[colIdx]?.textColor && colStyles[colIdx]?.textColor !== '#222') {
                                textColor = colStyles[colIdx]?.textColor; // Column style
                              } else if (isHeaderRowCell || isHeaderColCell) {
                                // Only apply default header styling if no custom color is set
                                textColor = '#111';
                              }

                              return (
                                <td
                                  key={colIdx}
                                  className={cn(
                                    "border border-gray-200 p-0 min-w-[60px] relative box-border",
                                    isHeader && !rowStyles[rowIdx]?.bgColor && !colStyles[colIdx]?.bgColor && "bg-gray-50",
                                    isHeader && "font-medium",
                                    selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === colIdx && "ring-2 ring-blue-500 ring-inset",
                                    selectedRow === rowIdx && "border-blue-500 border-2",
                                    selectedCol === colIdx && "border-blue-500 border-2"
                                  )}
                                  style={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    width: columnWidths[colIdx] ? `${columnWidths[colIdx]}px` : undefined,
                                    minWidth: columnWidths[colIdx] ? `${columnWidths[colIdx]}px` : `${MIN_COLUMN_WIDTH}px`,
                                  }}
                                  onMouseEnter={() => handleCellHover(rowIdx, colIdx)}
                                  onMouseLeave={handleCellLeave}
                                  onClick={() => handleCellClick(rowIdx, colIdx)}
                                >
                                  {/* Row Handle - First Cell */}
                                  {colIdx === 0 && (
                                    <Popover onOpenChange={(open) => {
                                      if (open) {
                                        setHoveredRow(rowIdx);
                                        setHoveredCol(null);
                                        handleRowSelect(rowIdx);
                                      } else if (!isMenuOpen) {
                                        setHoveredRow(null);
                                      }
                                    }}>
                                      <PopoverTrigger asChild>
                                        <div
                                          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 cursor-grab"
                                          {...provided.dragHandleProps}
                                          onMouseEnter={() => setHoveredRow(rowIdx)}
                                        >
                                          <SixDotHandle
                                            visible={hoveredRow === rowIdx || snapshot.isDragging || selectedRow === rowIdx}
                                          />
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-60 p-2" align="start">
                                        <RowColumnPopupContent
                                          type="row"
                                          index={rowIdx}
                                          styles={rowStyles[rowIdx]}
                                          onTextColorChange={handleRowTextColorChange}
                                          onBgColorChange={handleRowBgColorChange}
                                          onDuplicate={() => handleDuplicateRow(rowIdx)}
                                          onDelete={() => handleDeleteRow(rowIdx)}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  )}

                                  <input
                                    type="text"
                                    value={cell.value}
                                    onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                    className="w-full outline-none bg-transparent"
                                    style={{
                                      padding: '6px',
                                      fontWeight: isHeader ? 600 : 400,
                                      color: 'inherit' // Inherit from the parent td
                                    }}
                                  />

                                  {/* Column resize handle - Only show on column border hover */}
                                  {(colIdx < row.length - 1) && (
                                    <div
                                      className={cn(
                                        "absolute top-0 right-[-3px] w-[6px] h-full cursor-col-resize z-20"
                                      )}
                                      style={{
                                        // Ensure the handle is centered on the border
                                        transform: "translateX(50%)"
                                      }}
                                      onMouseDown={(e) => handleResizeStart(e, colIdx)}
                                    >
                                      {/* Visible line indicator that shows on hover */}
                                      <div
                                        className={cn(
                                          "absolute inset-0 pointer-events-none",
                                          "before:absolute before:top-0 before:bottom-0 before:left-[2px] before:w-[2px]",
                                          "before:transition-opacity before:duration-150",
                                          isResizing && resizingColumnIndex === colIdx
                                            ? "before:bg-blue-600 before:opacity-100"
                                            : "before:bg-blue-400 before:opacity-0 hover:before:opacity-100"
                                        )}
                                      />
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        )
                        }
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </tbody>
              )
              }
            </Droppable>
          </table>

          {/* Add Row Button - Below the table, centered */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -bottom-10 opacity-0 transition-opacity",
              isBottomHovered ? "opacity-100" : ""
            )}
            onMouseEnter={() => setIsBottomHovered(true)}
            onMouseLeave={() => setIsBottomHovered(false)}
            onClick={handleAddRow}
          >
            <div className="bg-gray-100 hover:bg-gray-200 w-7 h-7 rounded-md flex items-center justify-center cursor-pointer shadow-sm">
              <Plus className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Add Column Button - Right of the table, centered */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -right-10 opacity-0 transition-opacity",
              isRightHovered ? "opacity-100" : ""
            )}
            onMouseEnter={() => setIsRightHovered(true)}
            onMouseLeave={() => setIsRightHovered(false)}
            onClick={handleAddColumn}
          >
            <div className="bg-gray-100 hover:bg-gray-200 w-7 h-7 rounded-md flex items-center justify-center cursor-pointer shadow-sm">
              <Plus className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </DragDropContext >
    </div >
  );
};

export default TableBlock; 