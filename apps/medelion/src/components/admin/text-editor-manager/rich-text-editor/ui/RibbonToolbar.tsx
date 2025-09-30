'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/theme';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Palette, List, ListOrdered, Quote, Link, Image, Video, Table,
  Code, Undo2, Redo2, Copy, Clipboard, Scissors, Highlighter,
  ChevronDown, MoreHorizontal, FileText, Plus, Layout, 
  PaintBucket, Settings, Download, Share2, Save
} from 'lucide-react';
import { ImageModal } from '../image-upload';
import { ImageFile, ImageInsertOptions } from '../image-upload/types';
import { EditorUtils } from '../utils/EditorUtils';
import { fileToBase64, validateImageUrl } from '../utils/imageUtils';
import { HeadingDropdown, ColorPicker } from '../components/bubble-menu';
import { InsertMenu } from '../table/components/InsertMenu';
import { TableProvider } from '../table/context/TableContext';
import { WordTableIntegration } from '../table/WordTableIntegration';

// Advanced table creation with proper styling and structure
const createAdvancedTable = (rows: number, cols: number, template?: any): string => {
  const tableId = `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create header row
  const headerCells = Array(cols).fill(0).map((_, i) => 
    `<th style="
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-weight: 600;
      text-align: left;
      color: #334155;
      font-size: 14px;
      position: relative;
      cursor: text;
    " 
    data-column-id="col-${i}"
    contenteditable="true"
    ondblclick="this.focus(); const range = document.createRange(); range.selectNodeContents(this); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);"
    onfocus="this.style.background='white'; this.style.boxShadow='inset 0 0 0 2px #3b82f6';"
    onblur="this.style.background='linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'; this.style.boxShadow='none';"
    onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}"
    title="Double-click to edit header">
      ${template?.columns?.[i]?.name || `Column ${String.fromCharCode(65 + i)}`}
      <div style="position: absolute; right: 0; top: 0; width: 4px; height: 100%; cursor: col-resize; opacity: 0; transition: opacity 0.2s;" class="resize-handle"></div>
    </th>`
  ).join('');
  
  // Create data rows
  const dataRows = Array(rows - 1).fill(0).map((_, rowIndex) => {
    const cells = Array(cols).fill(0).map((_, colIndex) => 
      `<td style="
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        transition: all 0.15s ease;
        min-height: 40px;
        vertical-align: top;
        position: relative;
        color: #374151;
        font-size: 14px;
        line-height: 1.5;
        cursor: text;
      " 
      contenteditable="true"
      data-cell-id="cell-${rowIndex}-${colIndex}"
      data-row="${rowIndex}"
      data-col="${colIndex}"
      onmouseover="this.style.backgroundColor='#f8fafc'; this.style.borderColor='#cbd5e1'"
      onmouseout="this.style.backgroundColor='#ffffff'; this.style.borderColor='#e2e8f0'"
      onfocus="this.style.boxShadow='inset 0 0 0 2px #3b82f6'; this.style.backgroundColor='#ffffff'; this.style.outline='none'"
      onblur="this.style.boxShadow='none'; this.style.backgroundColor='#ffffff'"
      onclick="this.focus()">>
        ${template?.sampleData?.[rowIndex]?.[colIndex] || (rowIndex === 0 && colIndex === 0 ? 'Click to edit' : '')}
      </td>`
    ).join('');
    return `<tr data-row-id="row-${rowIndex}">${cells}</tr>`;
  }).join('');
  
  return `
    <div class="advanced-table-container" style="
      margin: 20px 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      background: #ffffff;
    " data-table-id="${tableId}">
      <table style="
        width: 100%;
        border-collapse: collapse;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        background: #ffffff;
      " 
      class="advanced-table"
      data-table-type="advanced"
      data-rows="${rows}"
      data-cols="${cols}">
        <thead style="position: sticky; top: 0; z-index: 10;">
          <tr data-header-row="true">${headerCells}</tr>
        </thead>
        <tbody>
          ${dataRows}
        </tbody>
      </table>
      <div class="table-footer" style="
        padding: 8px 16px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        font-size: 12px;
        color: #64748b;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span>${template?.name || 'Custom Table'} (${rows}×${cols})</span>
        <div class="table-actions" style="display: flex; gap: 8px;">
          <button onclick="addTableRow(this)" style="
            padding: 4px 8px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
          ">+ Row</button>
          <button onclick="addTableColumn(this)" style="
            padding: 4px 8px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
          ">+ Column</button>
        </div>
      </div>
    </div>
  `;
};

const createTableFromTemplate = (template: any): string => {
  const rows = template.dimensions?.rows || 3;
  const cols = template.dimensions?.columns || 3;
  return createAdvancedTable(rows, cols, template);
};

const createSimpleTable = (rows: number, cols: number): string => {
  return createAdvancedTable(rows, cols);
};

// Add interactive table functionality
const addTableInteractivity = () => {
  // Add global functions for table manipulation
  if (typeof window !== 'undefined') {
    // Store currently selected cell for formatting
    let selectedCell: HTMLElement | null = null;
    
    // Track cell selection
    const trackCellSelection = () => {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TD' && target.closest('.advanced-table-container')) {
          // Remove previous selection
          document.querySelectorAll('.selected-table-cell').forEach(cell => {
            cell.classList.remove('selected-table-cell');
          });
          
          // Add selection to current cell
          target.classList.add('selected-table-cell');
          selectedCell = target;
          
          // Don't show cell formatting menu when in table - bubble menu handles it
          // showCellFormattingMenu(target, e);
        } else if (!target.closest('.cell-formatting-menu') && !target.closest('.bubble-menu-root')) {
          // Hide formatting menu if clicking outside
          hideCellFormattingMenu();
          selectedCell = null;
        }
      });
    };
    
    // Cell formatting menu
    const showCellFormattingMenu = (cell: HTMLElement, event: MouseEvent) => {
      // Remove existing menu
      hideCellFormattingMenu();
      
      const menu = document.createElement('div');
      menu.className = 'cell-formatting-menu';
      menu.style.cssText = `
        position: absolute;
        top: ${event.pageY + 10}px;
        left: ${event.pageX + 10}px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 8px;
        z-index: 1000;
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 12px;
      `;
      
      // Background color label
      const label = document.createElement('span');
      label.textContent = 'Background:';
      label.style.color = '#6b7280';
      menu.appendChild(label);
      
      // Predefined color buttons
      const colors = [
        { name: 'Default', color: '#ffffff' },
        { name: 'Light Gray', color: '#f8fafc' },
        { name: 'Light Blue', color: '#dbeafe' },
        { name: 'Light Green', color: '#dcfce7' },
        { name: 'Light Yellow', color: '#fefce8' },
        { name: 'Light Red', color: '#fef2f2' },
        { name: 'Light Purple', color: '#f3e8ff' },
        { name: 'Light Orange', color: '#fff7ed' }
      ];
      
      colors.forEach(({ name, color }) => {
        const colorBtn = document.createElement('button');
        colorBtn.style.cssText = `
          width: 20px;
          height: 20px;
          background: ${color};
          border: 1px solid #d1d5db;
          border-radius: 3px;
          cursor: pointer;
          transition: transform 0.1s;
        `;
        colorBtn.title = name;
        colorBtn.addEventListener('click', () => {
          cell.style.backgroundColor = color;
          hideCellFormattingMenu();
        });
        colorBtn.addEventListener('mouseover', () => {
          colorBtn.style.transform = 'scale(1.1)';
        });
        colorBtn.addEventListener('mouseout', () => {
          colorBtn.style.transform = 'scale(1)';
        });
        menu.appendChild(colorBtn);
      });
      
      // Custom color picker
      const customColorInput = document.createElement('input');
      customColorInput.type = 'color';
      customColorInput.style.cssText = `
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      `;
      customColorInput.title = 'Custom Color';
      customColorInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        cell.style.backgroundColor = target.value;
        hideCellFormattingMenu();
      });
      menu.appendChild(customColorInput);
      
      document.body.appendChild(menu);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        hideCellFormattingMenu();
      }, 5000);
    };
    
    const hideCellFormattingMenu = () => {
      const existingMenu = document.querySelector('.cell-formatting-menu');
      if (existingMenu) {
        existingMenu.remove();
      }
      // Remove cell selection highlighting
      document.querySelectorAll('.selected-table-cell').forEach(cell => {
        cell.classList.remove('selected-table-cell');
      });
    };
    
    // Add CSS for selected cell
    const addCellSelectionStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        .selected-table-cell {
          box-shadow: inset 0 0 0 2px #3b82f6 !important;
          position: relative;
        }
        .selected-table-cell::after {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Initialize cell selection tracking
    trackCellSelection();
    addCellSelectionStyles();
    
    // Global function for context menu - disabled (using AdvancedRichTextEditor context menu)
    (window as any).showCellContextMenu = (cell: HTMLElement, event: MouseEvent) => {
      // Disabled - context menu is now handled by AdvancedRichTextEditor
      return;
    };
    
    // Global function to show color palette for selected cells
    (window as any).showColorPalette = (button?: HTMLElement) => {
      let selectedCells = document.querySelectorAll('.selected-table-cell');
      if (selectedCells.length === 0) {
        // If called from bubble menu in table context, just select first cell and apply color
        const tableContainer = document.querySelector('.advanced-table-container');
        if (tableContainer) {
          const firstCell = tableContainer.querySelector('td') as HTMLElement;
          if (firstCell) {
            firstCell.classList.add('selected-table-cell');
            selectedCells = document.querySelectorAll('.selected-table-cell');
          }
        }
        
        if (selectedCells.length === 0) {
          alert('Please click on a table cell first to select it, then use this color tool.');
          return;
        }
      }
      
      // Check if we're in table context - if so, don't show modal, let bubble menu handle it
      const isInTable = document.querySelector('.bubble-menu-root .advanced-table-container, .bubble-menu-root [style*="Table:"]');
      if (isInTable) {
        // Let the bubble menu's color picker handle this
        return;
      }
      
      // Create a simple color picker modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      const colorPalette = document.createElement('div');
      colorPalette.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        max-width: 400px;
      `;
      
      colorPalette.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #374151;">Cell Background Color</h3>
        <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 15px;">
          ${[
            '#ffffff', '#f8fafc', '#dbeafe', '#dcfce7', 
            '#fefce8', '#fef2f2', '#f3e8ff', '#fff7ed',
            '#e2e8f0', '#cbd5e1', '#93c5fd', '#86efac',
            '#fde047', '#fca5a5', '#c084fc', '#fdba74'
          ].map(color => `
            <button onclick="applyColorToSelected('${color}')" 
                    style="width: 40px; height: 40px; background: ${color}; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;"
                    title="${color}"></button>
          `).join('')}
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #6b7280; font-size: 14px;">Custom Color:</label>
          <input type="color" id="customColorPicker" style="width: 100%; height: 40px; border: none; border-radius: 4px; cursor: pointer;">
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button onclick="closeColorModal()" style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button onclick="applyCustomColor()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply Custom</button>
        </div>
      `;
      
      modal.appendChild(colorPalette);
      document.body.appendChild(modal);
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    };
    
    // Helper functions for color modal
    (window as any).applyColorToSelected = (color: string) => {
      document.querySelectorAll('.selected-table-cell').forEach(cell => {
        (cell as HTMLElement).style.backgroundColor = color;
      });
      (window as any).closeColorModal();
    };
    
    (window as any).applyCustomColor = () => {
      const customColor = (document.getElementById('customColorPicker') as HTMLInputElement).value;
      document.querySelectorAll('.selected-table-cell').forEach(cell => {
        (cell as HTMLElement).style.backgroundColor = customColor;
      });
      (window as any).closeColorModal();
    };
    
    (window as any).closeColorModal = () => {
      const modal = document.querySelector('[style*="position: fixed"][style*="rgba(0, 0, 0, 0.5)"]');
      if (modal) {
        document.body.removeChild(modal);
      }
    };
    
    // Enhanced table manipulation functions for bubble menu integration
    (window as any).deleteTableRow = (cell: HTMLElement) => {
      const row = cell.closest('tr');
      const table = cell.closest('table');
      if (row && table) {
        const tbody = table.querySelector('tbody');
        if (tbody && tbody.children.length > 1) {
          row.remove();
        } else {
          alert('Cannot delete the last row of a table.');
        }
      }
    };
    
    (window as any).deleteTableColumn = (cell: HTMLElement) => {
      const table = cell.closest('table');
      if (table) {
        const cellIndex = Array.from(cell.parentElement?.children || []).indexOf(cell);
        
        // Check if there's more than one column
        const headerRow = table.querySelector('thead tr');
        if (headerRow && headerRow.children.length <= 1) {
          alert('Cannot delete the last column of a table.');
          return;
        }
        
        // Remove header cell
        if (headerRow && headerRow.children[cellIndex]) {
          headerRow.children[cellIndex].remove();
        }
        
        // Remove data cells from all rows
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          if (row.children[cellIndex]) {
            row.children[cellIndex].remove();
          }
        });
      }
    };
    (window as any).addTableRow = (tableOrButton: HTMLElement | HTMLTableElement, direction?: string, referenceRow?: HTMLElement) => {
      let table: HTMLElement | null = null;
      let targetRow: HTMLElement | null = referenceRow || null;
      
      if (tableOrButton.tagName === 'TABLE' || tableOrButton.classList.contains('advanced-table')) {
        // Called from bubble menu with table element
        table = tableOrButton.querySelector('table tbody') || tableOrButton.querySelector('tbody');
        // If no reference row provided, find currently selected cell's row
        if (!targetRow) {
          const selectedCell = document.querySelector('.selected-table-cell') as HTMLElement;
          if (selectedCell) {
            targetRow = selectedCell.closest('tr');
          }
        }
      } else {
        // Called from toolbar button
        const container = tableOrButton.closest('.advanced-table-container');
        table = container?.querySelector('table tbody') || null;
      }
      
      if (table) {
        const cols = table.querySelectorAll('tr:first-child td').length;
        const newRow = document.createElement('tr');
        newRow.innerHTML = Array(cols).fill(0).map((_, i) => 
          `<td style="
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            transition: all 0.15s ease;
            min-height: 40px;
            vertical-align: top;
            position: relative;
            color: #374151;
            font-size: 14px;
            line-height: 1.5;
            cursor: text;
          " 
          contenteditable="true"
          onmouseover="this.style.backgroundColor='#f8fafc'; this.style.borderColor='#cbd5e1'"
          onmouseout="this.style.backgroundColor='#ffffff'; this.style.borderColor='#e2e8f0'"
          onfocus="this.style.boxShadow='inset 0 0 0 2px #3b82f6'; this.style.backgroundColor='#ffffff'; this.style.outline='none'"
          onblur="this.style.boxShadow='none'; this.style.backgroundColor='#ffffff'"
          onclick="this.focus()"
          oncontextmenu="">
          </td>`
        ).join('');
        
        if (direction === 'above' && targetRow) {
          targetRow.parentNode?.insertBefore(newRow, targetRow);
        } else {
          // Default: add below or at the end
          if (direction === 'below' && targetRow && targetRow.nextSibling) {
            targetRow.parentNode?.insertBefore(newRow, targetRow.nextSibling);
          } else {
            table.appendChild(newRow);
          }
        }
      }
    };

    (window as any).addTableColumn = (tableOrButton: HTMLElement | HTMLTableElement, direction?: string, referenceCell?: HTMLElement) => {
      let table: HTMLTableElement | null = null;
      let referenceIndex = -1;
      
      if (tableOrButton.tagName === 'TABLE' || tableOrButton.classList.contains('advanced-table')) {
        // Called from bubble menu with table element
        table = tableOrButton.tagName === 'TABLE' ? tableOrButton as HTMLTableElement : tableOrButton.querySelector('table');
        // Use provided reference cell or find currently selected cell's column index
        const targetCell = referenceCell || document.querySelector('.selected-table-cell') as HTMLElement;
        if (targetCell) {
          referenceIndex = Array.from(targetCell.parentElement?.children || []).indexOf(targetCell);
        }
      } else {
        // Called from toolbar button
        const container = tableOrButton.closest('.advanced-table-container');
        table = container?.querySelector('table') || null;
      }
      
      if (table) {
        // Calculate insert index
        const headerRow = table.querySelector('thead tr');
        const insertIndex = direction === 'left' && referenceIndex >= 0 
          ? referenceIndex 
          : direction === 'right' && referenceIndex >= 0 
          ? referenceIndex + 1 
          : headerRow?.children.length || 0;
        
        // Add header cell
        if (headerRow) {
          const newHeader = document.createElement('th');
          newHeader.innerHTML = `Column ${String.fromCharCode(65 + insertIndex)}<div style="position: absolute; right: 0; top: 0; width: 4px; height: 100%; cursor: col-resize; opacity: 0; transition: opacity 0.2s;" class="resize-handle"></div>`;
          newHeader.style.cssText = `
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            font-weight: 600;
            text-align: left;
            color: #334155;
            position: relative;
            cursor: text;
          `;
          // Make the new header editable
          newHeader.contentEditable = 'true';
          newHeader.title = 'Double-click to edit header';
          newHeader.addEventListener('dblclick', function() { 
            (this as HTMLElement).focus(); 
            const range = document.createRange();
            range.selectNodeContents(this as HTMLElement);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          });
          newHeader.addEventListener('focus', function() { 
            (this as HTMLElement).style.background = '#f8fafc'; 
            (this as HTMLElement).style.boxShadow = 'inset 0 0 0 2px #3b82f6'; 
          });
          newHeader.addEventListener('blur', function() { 
            (this as HTMLElement).style.background = '#ffffff'; 
            (this as HTMLElement).style.boxShadow = 'none'; 
          });
          newHeader.addEventListener('keydown', function(e) { 
            if(e.key === 'Enter') { 
              e.preventDefault(); 
              (this as HTMLElement).blur(); 
            } 
          });
          
          // Insert header at the correct position
          if (insertIndex < headerRow.children.length) {
            headerRow.insertBefore(newHeader, headerRow.children[insertIndex]);
          } else {
            headerRow.appendChild(newHeader);
          }
          
          // Add resize functionality to the new column
          setupColumnResize(newHeader);
        }
        
        // Add cells to each row
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const newCell = document.createElement('td');
          newCell.contentEditable = 'true';
          newCell.style.cssText = `
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            transition: all 0.15s ease;
            min-height: 40px;
            vertical-align: top;
            position: relative;
            color: #374151;
            font-size: 14px;
            line-height: 1.5;
            cursor: text;
          `;
          // Add hover and focus effects
          newCell.addEventListener('mouseover', function() { 
            (this as HTMLElement).style.backgroundColor = '#f8fafc'; 
            (this as HTMLElement).style.borderColor = '#cbd5e1'; 
          });
          newCell.addEventListener('mouseout', function() { 
            (this as HTMLElement).style.backgroundColor = '#ffffff'; 
            (this as HTMLElement).style.borderColor = '#e2e8f0'; 
          });
          newCell.addEventListener('focus', function() { 
            (this as HTMLElement).style.boxShadow = 'inset 0 0 0 2px #3b82f6'; 
            (this as HTMLElement).style.backgroundColor = '#ffffff'; 
            (this as HTMLElement).style.outline = 'none'; 
          });
          newCell.addEventListener('blur', function() { 
            (this as HTMLElement).style.boxShadow = 'none'; 
            (this as HTMLElement).style.backgroundColor = '#ffffff'; 
          });
          newCell.addEventListener('click', function() { 
            (this as HTMLElement).focus(); 
          });
          // Context menu handler removed - handled by AdvancedRichTextEditor
          
          // Insert cell at the correct position
          if (insertIndex < row.children.length) {
            row.insertBefore(newCell, row.children[insertIndex]);
          } else {
            row.appendChild(newCell);
          }
        });
      }
    };

    // Column resize functionality
    const setupColumnResize = (headerCell: HTMLElement) => {
      const resizeHandle = headerCell.querySelector('.resize-handle') as HTMLElement;
      if (!resizeHandle) return;

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;
      let columnIndex = 0;

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        isResizing = true;
        startX = e.clientX;
        startWidth = headerCell.offsetWidth;
        
        // Find column index
        const headerRow = headerCell.parentElement;
        if (headerRow) {
          columnIndex = Array.from(headerRow.children).indexOf(headerCell);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(80, startWidth + deltaX); // Min width 80px
        
        // Update header cell width
        headerCell.style.width = `${newWidth}px`;
        headerCell.style.minWidth = `${newWidth}px`;
        
        // Update all cells in this column
        const table = headerCell.closest('table');
        if (table) {
          const rows = table.querySelectorAll('tbody tr');
          rows.forEach(row => {
            const cell = row.children[columnIndex] as HTMLElement;
            if (cell) {
              cell.style.width = `${newWidth}px`;
              cell.style.minWidth = `${newWidth}px`;
            }
          });
        }
      };

      const onMouseUp = () => {
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      resizeHandle.addEventListener('mousedown', onMouseDown);
      
      // Show/hide resize handle on hover
      headerCell.addEventListener('mouseenter', () => {
        resizeHandle.style.opacity = '1';
        resizeHandle.style.backgroundColor = '#3b82f6';
      });
      
      headerCell.addEventListener('mouseleave', () => {
        if (!isResizing) {
          resizeHandle.style.opacity = '0';
          resizeHandle.style.backgroundColor = '';
        }
      });
    };

    // Setup resize for all existing tables
    const setupAllTableResize = () => {
      const tables = document.querySelectorAll('.advanced-table');
      tables.forEach(table => {
        const headers = table.querySelectorAll('thead th');
        headers.forEach(header => {
          setupColumnResize(header as HTMLElement);
        });
      });
    };

    // Auto-setup after a short delay to ensure DOM is ready
    setTimeout(setupAllTableResize, 100);
    
    // Store function globally for manual setup
    (window as any).setupTableResize = setupAllTableResize;
  }
};

type RibbonTab = 'home' | 'insert' | 'design' | 'layout' | 'review';

interface RibbonToolbarProps {
  onCommand: (command: string, value?: any) => void;
  activeTab?: RibbonTab;
  onTabChange?: (tab: RibbonTab) => void;
  onImageInsert?: (image: ImageFile, options: ImageInsertOptions) => void;
  onTableInsert?: (tableData: any) => void;
}

export function RibbonToolbar({ onCommand, activeTab = 'home', onTabChange, onImageInsert, onTableInsert }: RibbonToolbarProps) {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<RibbonTab>(activeTab);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showAdvancedTableEditor, setShowAdvancedTableEditor] = useState(false);

  const handleTabClick = (tab: RibbonTab) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

    const handleImageInsert = useCallback(async (image: ImageFile, options: ImageInsertOptions) => {
    console.log('🖼️ RibbonToolbar: Inserting image:', image);
    
    try {
      let imageUrl = image.url;
      
      // If no URL, convert file to base64
      if (!imageUrl && image.file) {
        imageUrl = await fileToBase64(image.file);
      }
      
      if (!imageUrl) {
        console.error('❌ No image URL available');
        return;
      }
      
      const imageHtml = `<img src="${imageUrl}" alt="${image.name || 'Inserted Image'}" style="max-width: 100%; height: auto; cursor: move;" />`;
      EditorUtils.insertImageAtCursor(imageHtml);
      console.log('✅ Successfully inserted image');
    } catch (error) {
      console.error('❌ Failed to insert image:', error);
    }
  }, []);

  const generateImageHtml = (image: ImageFile, options: ImageInsertOptions): string => {
    const { alignment, size, customWidth, customHeight, altText, caption, borderRadius, shadow, margin } = options;
    
    console.log('Generating image HTML for:', { 
      url: image.url, 
      name: image.name, 
      type: image.type,
      size: image.size 
    });
    
    // Use the URL from the validated image object
    const imageUrl = image.url;
    console.log('Using validated image URL for HTML generation:', imageUrl ? imageUrl.substring(0, 50) + '...' : 'No URL');
    
    // Determine container class based on alignment
    let containerClass = 'image-container';
    if (alignment === 'left') containerClass += ' float-left';
    else if (alignment === 'right') containerClass += ' float-right';
    else containerClass += ' align-center';

    // Build image styles
    let width = '';
    let height = '';
    
    switch (size) {
      case 'small':
        width = '200px';
        break;
      case 'medium':
        width = '400px';
        break;
      case 'large':
        width = '600px';
        break;
      case 'custom':
        if (customWidth) width = `${customWidth}px`;
        if (customHeight) height = `${customHeight}px`;
        break;
    }

    const imageStyles = [
      width && `width: ${width}`,
      height && `height: ${height}`,
      `border-radius: ${borderRadius}px`,
      shadow && 'box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)',
      `margin: ${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
      'display: block' // Ensure image is displayed
    ].filter(Boolean).join('; ');

    // Add data attributes for enhancement
    const dataAttributes = [
      `data-image-id="${image.id}"`,
      caption ? `data-caption="${caption.replace(/"/g, '&quot;')}"` : '',
      `data-original-width="${image.dimensions?.width || ''}"`,
      `data-original-height="${image.dimensions?.height || ''}"`,
      `data-debug-name="${image.name || 'unknown'}"`
    ].filter(Boolean).join(' ');

    // Generate clean image HTML
    const imageHtml = `<img 
      src="${imageUrl}" 
      alt="${altText}" 
      style="${imageStyles}" 
      ${dataAttributes} 
      onload="console.log('✅ Image loaded:', this.naturalWidth + 'x' + this.naturalHeight)" 
      onerror="console.error('❌ Image failed to load:', this.src)"
    />`;
    
    if (caption) {
      return `
        <div class="${containerClass}">
          ${imageHtml}
          <div class="image-caption">${caption}</div>
        </div>
      `;
    } else {
      return `<div class="${containerClass}">${imageHtml}</div>`;
    }
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.semantic.text.primary,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme.colors.semantic.surface.tertiary,
    color: theme.colors.semantic.action.primary,
  };

  const toolGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    borderRight: `1px solid ${theme.colors.semantic.border.secondary}`,
  };

  const renderHomeTab = () => (
    <div className="flex items-center gap-1">
      {/* Clipboard Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col items-center gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('paste')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Clipboard className="w-6 h-6" />
            <span className="text-xs">Paste</span>
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('cut')}
            className="hover:bg-opacity-80 flex items-center gap-1 p-1"
          >
            <Scissors className="w-4 h-4" />
            <span className="text-xs">Cut</span>
          </button>
          <button
            style={buttonStyle}
            onClick={() => onCommand('copy')}
            className="hover:bg-opacity-80 flex items-center gap-1 p-1"
          >
            <Copy className="w-4 h-4" />
            <span className="text-xs">Copy</span>
          </button>
        </div>
      </div>

      {/* Font Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 rounded border text-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary,
              }}
              onChange={(e) => onCommand('fontFamily', e.target.value)}
            >
              <option value="Inter">Inter</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
            </select>
            <select
              className="px-2 py-1 rounded border text-sm w-16"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary,
              }}
              onChange={(e) => onCommand('fontSize', e.target.value)}
            >
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="28">28</option>
              <option value="32">32</option>
            </select>
            {/* Heading Dropdown from bubble-menu */}
            <HeadingDropdown
              onHeadingChange={(level) => onCommand('formatBlock', level === 0 ? 'p' : `h${level}`)}
              tooltip="Heading Level"
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              style={buttonStyle}
              onClick={() => onCommand('bold')}
              className="hover:bg-opacity-80 p-1"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('italic')}
              className="hover:bg-opacity-80 p-1"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('underline')}
              className="hover:bg-opacity-80 p-1"
            >
              <Underline className="w-4 h-4" />
            </button>
            {/* Text Color */}
            <ColorPicker
              type="text"
              onColorChange={(color: string) => onCommand('foreColor', color)}
              tooltip="Text Color"
            />
            {/* Background Color */}
            <ColorPicker
              type="background"
              onColorChange={(color: string) => onCommand('backColor', color)}
              tooltip="Background Color"
            />
          </div>
        </div>
      </div>

      {/* Paragraph Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignLeft')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignCenter')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignRight')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignJustify')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              style={buttonStyle}
              onClick={() => onCommand('bulletList')}
              className="hover:bg-opacity-80 p-1"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('orderedList')}
              className="hover:bg-opacity-80 p-1"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('quote')}
              className="hover:bg-opacity-80 p-1"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editing Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col items-center gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('find')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">🔍</div>
            <span className="text-xs">Find</span>
          </button>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('replace')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">🔄</div>
            <span className="text-xs">Replace</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="flex items-center gap-1">
      {/* Pages Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('pageBreak')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs">Page Break</span>
        </button>
      </div>

      {/* Tables Group */}
      <div style={toolGroupStyle}>
        <div className="relative">
          <button
            style={buttonStyle}
            onClick={() => {
              EditorUtils.saveCursorPosition();
              setShowTableMenu(!showTableMenu);
            }}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Table className="w-6 h-6" />
            <span className="text-xs">Table</span>
          </button>
          
          {/* Advanced Table Insert Menu */}
          {showTableMenu && (
            <div className="absolute top-full left-0 z-50 mt-1">
              <InsertMenu
                onTemplateSelect={(template: any) => {
                  console.log('📊 Advanced table template selected:', template);
                  const tableHtml = createTableFromTemplate(template);
                  EditorUtils.restoreCursorPosition();
                  onCommand('insertHTML', tableHtml);
                  onTableInsert?.(template);
                  setShowTableMenu(false);
                  
                  // Add interactive table features
                  setTimeout(() => {
                    addTableInteractivity();
                  }, 100);
                }}
                onQuickCreate={(rows: number, cols: number) => {
                  console.log('⚡ Quick table create:', rows, cols);
                  const tableHtml = createSimpleTable(rows, cols);
                  EditorUtils.restoreCursorPosition();
                  onCommand('insertHTML', tableHtml);
                  setShowTableMenu(false);
                  
                  // Add interactive table features
                  setTimeout(() => {
                    addTableInteractivity();
                  }, 100);
                }}
                onClose={() => {
                  setShowTableMenu(false);
                  EditorUtils.clearSavedCursorPosition();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Illustrations Group */}
      <div style={toolGroupStyle}>
        <div className="flex items-center gap-2">
          <button
            style={buttonStyle}
            onClick={() => {
              // Save cursor position before opening modal
              EditorUtils.saveCursorPosition();
              setShowImageModal(true);
            }}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Image className="w-6 h-6" />
            <span className="text-xs">Image</span>
          </button>

          <button
            style={buttonStyle}
            onClick={() => onCommand('insertVideo')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Video className="w-6 h-6" />
            <span className="text-xs">Video</span>
          </button>
        </div>
      </div>

      {/* Links Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('insertLink')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <Link className="w-6 h-6" />
          <span className="text-xs">Link</span>
        </button>
      </div>

      {/* Text Group */}
      <div style={toolGroupStyle}>
        <div className="flex items-center gap-2">
          <button
            style={buttonStyle}
            onClick={() => onCommand('insertCode')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Code className="w-6 h-6" />
            <span className="text-xs">Code Block</span>
          </button>
          <button
            style={buttonStyle}
            onClick={() => onCommand('insertQuote')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Quote className="w-6 h-6" />
            <span className="text-xs">Quote</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="flex items-center gap-1">
      {/* Themes Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('documentThemes')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <PaintBucket className="w-6 h-6" />
          <span className="text-xs">Themes</span>
        </button>
      </div>

      {/* Page Color Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('pageColor')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <Palette className="w-6 h-6" />
          <span className="text-xs">Page Color</span>
        </button>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="flex items-center gap-1">
      {/* Page Setup Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('margins')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <Layout className="w-6 h-6" />
          <span className="text-xs">Margins</span>
        </button>
      </div>

      {/* Paragraph Group */}
      <div style={toolGroupStyle}>
        <div className="flex items-center gap-2">
          <button
            style={buttonStyle}
            onClick={() => onCommand('indent')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">→</div>
            <span className="text-xs">Indent</span>
          </button>
          <button
            style={buttonStyle}
            onClick={() => onCommand('outdent')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">←</div>
            <span className="text-xs">Outdent</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewTab = () => (
    <div className="flex items-center gap-1">
      {/* Proofing Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('spellCheck')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <div className="text-lg">✓</div>
          <span className="text-xs">Spelling</span>
        </button>
      </div>

      {/* Comments Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('newComment')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <div className="text-lg">💬</div>
          <span className="text-xs">New Comment</span>
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'home', label: 'Home', content: renderHomeTab },
    { id: 'insert', label: 'Insert', content: renderInsertTab },
    { id: 'design', label: 'Design', content: renderDesignTab },
    { id: 'layout', label: 'Layout', content: renderLayoutTab },
    { id: 'review', label: 'Review', content: renderReviewTab },
  ] as const;

  return (
    <div
      className="border-b"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary,
      }}
    >
      {/* Tab Headers */}
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id as RibbonTab)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentTab === tab.id 
                ? theme.colors.semantic.surface.secondary 
                : 'transparent',
              color: currentTab === tab.id 
                ? theme.colors.semantic.action.primary 
                : theme.colors.semantic.text.primary,
              borderBottom: currentTab === tab.id 
                ? `2px solid ${theme.colors.semantic.action.primary}` 
                : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="p-2"
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          minHeight: '80px',
        }}
      >
        {tabs.find(tab => tab.id === currentTab)?.content()}
      </div>

      {/* Image Upload Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          // Clear saved cursor position if modal is closed without inserting
          EditorUtils.clearSavedCursorPosition();
        }}
        onImageInsert={handleImageInsert}
        defaultTab="upload"
      />
    </div>
  );
}