import React, { useState, useRef } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
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

// Helper for default cell
const defaultCell = () => ({ value: '', textColor: '#222', bgColor: 'transparent' });

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

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

  // Basic handlers
  const handleCellChange = (rowIdx, colIdx, value) => {
    const newRows = [...rows];
    newRows[rowIdx][colIdx] = { ...newRows[rowIdx][colIdx], value };
    setRows(newRows);
    onUpdate && onUpdate({ ...block, rows: newRows });
  };

  const handleAddRow = () => {
    const newRow = Array.from({ length: rows[0].length }, defaultCell);
    setRows([...rows, newRow]);
    onUpdate && onUpdate({ ...block, rows: [...rows, newRow] });
  };

  const handleAddColumn = () => {
    const newRows = rows.map(row => [...row, defaultCell()]);
    setRows(newRows);
    onUpdate && onUpdate({ ...block, rows: newRows });
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

  return (
    <div className={cn("relative my-4", className)}>
      {/* Table Options Button - Always visible outside the table */}
      <div 
        className="absolute right-0 top-0 z-10 transform -translate-y-full translate-x-0"
        onClick={handleMenuClick}
        onMouseEnter={() => setIsMenuButtonHovered(true)}
        onMouseLeave={() => !isMenuOpen && setIsMenuButtonHovered(false)}
      >
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
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
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                className={headerRow && rowIdx === 0 ? "bg-gray-100 font-medium" : ""}
              >
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      "border border-gray-200 p-0 min-w-[60px]",
                      headerCol && colIdx === 0 ? "bg-gray-100 font-medium" : ""
                    )}
                  >
                    <input
                      type="text"
                      value={cell.value}
                      onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                      className="w-full p-2 outline-none bg-transparent"
                    />
                  </td>
                ))}
              </tr>
            ))}
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