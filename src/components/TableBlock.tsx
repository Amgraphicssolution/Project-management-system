import React, { useState, useRef } from 'react';
import { MoreHorizontal, Plus, Trash, Copy, Type, Square } from 'lucide-react';
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

// Helper for default cell
const defaultCell = () => ({ value: '', textColor: '#222', bgColor: 'transparent' });

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

// Six-dot handle component
const SixDotHandle = ({ onClick, className, visible = false }: { onClick?: React.MouseEventHandler, className?: string, visible?: boolean }) => (
  <div 
    className={cn(
      "flex flex-wrap w-4 h-4 cursor-pointer transition-opacity", 
      visible ? "opacity-80" : "opacity-0",
      className
    )} 
    onClick={onClick}
  >
    {[...Array(6)].map((_, i) => (
      <div key={i} className="w-1 h-1 m-[1px] rounded-full bg-gray-400" />
    ))}
  </div>
);

// Color picker component
const ColorPicker = ({ value, onChange, label }) => (
  <div className="flex flex-col gap-2 py-1">
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded border border-gray-300" 
          style={{ backgroundColor: value }}
        />
        <Input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-6 h-6 p-0 border-0"
        />
        <Input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-16 h-6 text-xs px-1"
        />
      </div>
    </div>
  </div>
);

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

  // Row/column style state
  const [rowStyles, setRowStyles] = useState(
    block.rowStyles || Array.from({ length: DEFAULT_ROWS }, () => ({ textColor: '#222', bgColor: 'transparent' }))
  );
  const [colStyles, setColStyles] = useState(
    block.colStyles || Array.from({ length: DEFAULT_COLS }, () => ({ textColor: '#222', bgColor: 'transparent' }))
  );

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
    
    setRows(newRows);
    setColStyles(newColStyles);
    onUpdate && onUpdate({ 
      ...block, 
      rows: newRows,
      colStyles: newColStyles
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
    
    setRows(newRows);
    setColStyles(newColStyles);
    onUpdate && onUpdate({ 
      ...block, 
      rows: newRows,
      colStyles: newColStyles
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
    
    setRows(newRows);
    setColStyles(newColStyles);
    onUpdate && onUpdate({ 
      ...block, 
      rows: newRows,
      colStyles: newColStyles
    });
  };

  // Helper to determine if a cell is in a header position
  const isHeaderCell = (rowIdx, colIdx) => {
    return (headerRow && rowIdx === 0) || (headerCol && colIdx === 0);
  };

  return (
    <div className={cn("relative my-4", className)}>
      {/* Table Options Button - Always visible outside the table */}
      <div 
        className="absolute right-0 top-0 z-10 transform -translate-y-full translate-x-0"
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
      
      <div className="table-container relative">
        {/* Table */}
        <table className="w-full border-collapse table-fixed">
          <tbody>
            {rows.map((row, rowIdx) => {
              const isHeaderRowCell = headerRow && rowIdx === 0;
              
              return (
                <tr 
                  key={rowIdx}
                  className={cn(
                    "relative",
                    isHeaderRowCell ? "bg-gray-100 font-medium" : ""
                  )}
                  style={{ 
                    backgroundColor: isHeaderRowCell ? '#f3f4f6' : rowStyles[rowIdx]?.bgColor || 'transparent',
                    color: rowStyles[rowIdx]?.textColor || '#222'
                  }}
                >
                  {row.map((cell, colIdx) => {
                    const isHeaderColCell = headerCol && colIdx === 0;
                    const isHeader = isHeaderRowCell || isHeaderColCell;
                    
                    // Determine the cell background color with priority
                    let bgColor = 'transparent';
                    if (isHeaderRowCell) {
                      bgColor = '#f3f4f6'; // Header row takes precedence
                    } else if (isHeaderColCell) {
                      bgColor = '#f3f4f6'; // Header column
                    } else if (colStyles[colIdx]?.bgColor) {
                      bgColor = colStyles[colIdx]?.bgColor; // Column style
                    } else if (rowStyles[rowIdx]?.bgColor) {
                      bgColor = rowStyles[rowIdx]?.bgColor; // Row style
                    }

                    // Determine text color with priority
                    let textColor = '#222';
                    if (isHeaderRowCell || isHeaderColCell) {
                      textColor = '#000'; // Headers get darker text
                    } else if (colStyles[colIdx]?.textColor) {
                      textColor = colStyles[colIdx]?.textColor;
                    } else if (rowStyles[rowIdx]?.textColor) {
                      textColor = rowStyles[rowIdx]?.textColor;
                    }
                    
                    return (
                      <td
                        key={colIdx}
                        className={cn(
                          "border border-gray-200 p-0 min-w-[60px] w-[80px] relative",
                          isHeader && "font-medium"
                        )}
                        style={{ 
                          backgroundColor: bgColor,
                          color: textColor
                        }}
                        onMouseEnter={() => handleCellHover(rowIdx, colIdx)}
                        onMouseLeave={handleCellLeave}
                      >
                        {/* Row Handle - First Cell */}
                        {colIdx === 0 && (
                          <Popover onOpenChange={(open) => {
                            if (open) {
                              setHoveredRow(rowIdx);
                              setHoveredCol(null);
                            } else if (!isMenuOpen) {
                              setHoveredRow(null);
                            }
                          }}>
                            <PopoverTrigger asChild>
                              <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10">
                                <SixDotHandle visible={hoveredRow === rowIdx} />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-2" align="start">
                              <div className="flex flex-col gap-2">
                                <ColorPicker 
                                  label="Text Color" 
                                  value={rowStyles[rowIdx]?.textColor || '#222'} 
                                  onChange={(color) => handleRowTextColorChange(rowIdx, color)}
                                />
                                <ColorPicker 
                                  label="Cell Color" 
                                  value={rowStyles[rowIdx]?.bgColor || 'transparent'} 
                                  onChange={(color) => handleRowBgColorChange(rowIdx, color)}
                                />
                                <div className="flex mt-2 justify-between">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => handleDuplicateRow(rowIdx)}
                                  >
                                    <Copy className="h-3 w-3 mr-1" /> Duplicate
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs text-destructive"
                                    onClick={() => handleDeleteRow(rowIdx)}
                                  >
                                    <Trash className="h-3 w-3 mr-1" /> Delete
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}

                        {/* Column Handle - First Row */}
                        {rowIdx === 0 && (
                          <Popover onOpenChange={(open) => {
                            if (open) {
                              setHoveredCol(colIdx);
                              setHoveredRow(null);
                            } else if (!isMenuOpen) {
                              setHoveredCol(null);
                            }
                          }}>
                            <PopoverTrigger asChild>
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                                <SixDotHandle visible={hoveredCol === colIdx} />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-2" align="start">
                              <div className="flex flex-col gap-2">
                                <ColorPicker 
                                  label="Text Color" 
                                  value={colStyles[colIdx]?.textColor || '#222'} 
                                  onChange={(color) => handleColTextColorChange(colIdx, color)}
                                />
                                <ColorPicker 
                                  label="Cell Color" 
                                  value={colStyles[colIdx]?.bgColor || 'transparent'} 
                                  onChange={(color) => handleColBgColorChange(colIdx, color)}
                                />
                                <div className="flex mt-2 justify-between">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => handleDuplicateCol(colIdx)}
                                  >
                                    <Copy className="h-3 w-3 mr-1" /> Duplicate
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs text-destructive"
                                    onClick={() => handleDeleteCol(colIdx)}
                                  >
                                    <Trash className="h-3 w-3 mr-1" /> Delete
                                  </Button>
                                </div>
                              </div>
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
                            fontWeight: isHeader ? 500 : 400
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add Row Button - Inside the table's bottom edge */}
        <div 
          className={cn(
            "absolute left-0 right-0 bottom-0 h-6 opacity-0 transition-opacity cursor-pointer",
            isBottomHovered ? "opacity-100" : ""
          )}
          onMouseEnter={() => setIsBottomHovered(true)}
          onMouseLeave={() => setIsBottomHovered(false)}
          onClick={handleAddRow}
        >
          <div className="bg-gray-100 h-full w-full flex items-center justify-center hover:bg-gray-200">
            <Plus className="h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Add Column Button - Full Height */}
        <div 
          className={cn(
            "absolute top-0 bottom-0 right-0 w-8 transform translate-x-full opacity-0 transition-opacity cursor-pointer",
            isRightHovered ? "opacity-100" : ""
          )}
          onMouseEnter={() => setIsRightHovered(true)}
          onMouseLeave={() => setIsRightHovered(false)}
          onClick={handleAddColumn}
        >
          <div className="bg-gray-100 h-full w-full flex items-center justify-center hover:bg-gray-200 rounded-r-md">
            <Plus className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableBlock; 