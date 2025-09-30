import { TableOperations, TableBorderStyle, TableStyle, CellRange, TableTheme } from '../types';

export const createAdvancedTableOperations = (selectedCell: HTMLTableCellElement | null): TableOperations => {
  const findTable = (): HTMLTableElement | null => {
    if (!selectedCell) return null;
    return selectedCell.closest('table');
  };

  const findCellPosition = (cell: HTMLTableCellElement): { row: number; col: number } => {
    const table = findTable();
    if (!table) return { row: -1, col: -1 };
    
    const rows = Array.from(table.rows);
    for (let i = 0; i < rows.length; i++) {
      const cells = Array.from(rows[i].cells);
      const colIndex = cells.indexOf(cell);
      if (colIndex !== -1) {
        return { row: i, col: colIndex };
      }
    }
    return { row: -1, col: -1 };
  };

  const getCurrentCell = (): HTMLTableCellElement | null => {
    const table = findTable();
    if (!table) return null;
    return selectedCell || table.querySelector('td:focus, th:focus') as HTMLTableCellElement;
  };

  const createNewCell = (tagName: 'td' | 'th' = 'td'): HTMLTableCellElement => {
    const cell = document.createElement(tagName) as HTMLTableCellElement;
    cell.contentEditable = 'true';
    cell.style.border = '1px solid #ddd';
    cell.style.padding = '8px';
    cell.style.minHeight = '20px';
    cell.textContent = '';
    return cell;
  };

  // Color Operations
  const applyColorToElement = (element: HTMLElement, color: string, type: 'background' | 'text'): void => {
    if (type === 'background') {
      element.style.backgroundColor = color;
    } else {
      element.style.color = color;
    }
  };

  const colorEntireHeader = (color: string): void => {
    const table = findTable();
    if (!table || !table.rows[0]) return;
    
    const headerCells = Array.from(table.rows[0].cells);
    headerCells.forEach(cell => applyColorToElement(cell, color, 'background'));
  };

  const colorEntireRow = (color: string): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    
    const cells = Array.from(row.cells);
    cells.forEach(cell => applyColorToElement(cell, color, 'background'));
  };

  const colorAlternativeRows = (color: string): void => {
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach((row, index) => {
      if (index % 2 === 1) {
        const cells = Array.from(row.cells);
        cells.forEach(cell => applyColorToElement(cell, color, 'background'));
      }
    });
  };

  const colorAlternativeColumns = (color: string): void => {
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    if (rows.length === 0) return;
    
    const maxCols = Math.max(...rows.map(row => row.cells.length));
    
    for (let col = 1; col < maxCols; col += 2) {
      rows.forEach(row => {
        if (row.cells[col]) {
          applyColorToElement(row.cells[col], color, 'background');
        }
      });
    }
  };

  const colorSelectedCells = (color: string, type: 'background' | 'text'): void => {
    const table = findTable();
    if (!table) return;
    
    const selectedCells = table.querySelectorAll('td.selected, th.selected');
    selectedCells.forEach(cell => applyColorToElement(cell as HTMLElement, color, type));
  };

  // Row Operations
  const deleteRowAbove = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { row } = findCellPosition(cell);
    const table = findTable();
    if (!table || row <= 0) return;
    
    table.deleteRow(row - 1);
  };

  const deleteRowBelow = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { row } = findCellPosition(cell);
    const table = findTable();
    if (!table || row >= table.rows.length - 1) return;
    
    table.deleteRow(row + 1);
  };

  const deleteCurrentRow = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (row) row.remove();
  };

  const deleteSelectedRows = (): void => {
    const table = findTable();
    if (!table) return;
    
    const selectedRows = table.querySelectorAll('tr.selected');
    selectedRows.forEach(row => row.remove());
  };

  const addRowAbove = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { row } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const newRow = table.insertRow(row);
    const colCount = table.rows[row + 1]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      newRow.appendChild(createNewCell());
    }
  };

  const addRowBelow = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { row } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const newRow = table.insertRow(row + 1);
    const colCount = table.rows[row]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      newRow.appendChild(createNewCell());
    }
  };

  const addMultipleRows = (count: number, position: 'above' | 'below'): void => {
    for (let i = 0; i < count; i++) {
      if (position === 'above') {
        addRowAbove();
      } else {
        addRowBelow();
      }
    }
  };

  const duplicateRow = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    
    const newRow = row.cloneNode(true) as HTMLTableRowElement;
    row.parentNode?.insertBefore(newRow, row.nextSibling);
  };

  const moveRowUp = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row || !row.previousElementSibling) return;
    
    row.parentNode?.insertBefore(row, row.previousElementSibling);
  };

  const moveRowDown = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row || !row.nextElementSibling) return;
    
    row.parentNode?.insertBefore(row.nextElementSibling, row);
  };

  // Column Operations
  const deleteColumnLeft = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table || col <= 0) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      if (row.cells[col - 1]) {
        row.deleteCell(col - 1);
      }
    });
  };

  const deleteColumnRight = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    const maxCols = Math.max(...rows.map(row => row.cells.length));
    if (col >= maxCols - 1) return;
    
    rows.forEach(row => {
      if (row.cells[col + 1]) {
        row.deleteCell(col + 1);
      }
    });
  };

  const deleteCurrentColumn = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      if (row.cells[col]) {
        row.deleteCell(col);
      }
    });
  };

  const deleteSelectedColumns = (): void => {
    const table = findTable();
    if (!table) return;
    
    const selectedCells = table.querySelectorAll('td.selected, th.selected');
    const columnIndices = new Set<number>();
    
    selectedCells.forEach(cell => {
      const { col } = findCellPosition(cell as HTMLTableCellElement);
      columnIndices.add(col);
    });
    
    Array.from(columnIndices).sort((a, b) => b - a).forEach(col => {
      const rows = Array.from(table.rows);
      rows.forEach(row => {
        if (row.cells[col]) {
          row.deleteCell(col);
        }
      });
    });
  };

  const addColumnLeft = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      const newCell = createNewCell();
      if (row.cells[col]) {
        row.insertBefore(newCell, row.cells[col]);
      } else {
        row.appendChild(newCell);
      }
    });
  };

  const addColumnRight = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      const newCell = createNewCell();
      if (row.cells[col + 1]) {
        row.insertBefore(newCell, row.cells[col + 1]);
      } else {
        row.appendChild(newCell);
      }
    });
  };

  const addMultipleColumns = (count: number, position: 'left' | 'right'): void => {
    for (let i = 0; i < count; i++) {
      if (position === 'left') {
        addColumnLeft();
      } else {
        addColumnRight();
      }
    }
  };

  const duplicateColumn = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      if (row.cells[col]) {
        const newCell = row.cells[col].cloneNode(true) as HTMLTableCellElement;
        if (row.cells[col + 1]) {
          row.insertBefore(newCell, row.cells[col + 1]);
        } else {
          row.appendChild(newCell);
        }
      }
    });
  };

  const moveColumnLeft = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table || col <= 0) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      if (row.cells[col] && row.cells[col - 1]) {
        row.insertBefore(row.cells[col], row.cells[col - 1]);
      }
    });
  };

  const moveColumnRight = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    const maxCols = Math.max(...rows.map(row => row.cells.length));
    if (col >= maxCols - 1) return;
    
    rows.forEach(row => {
      if (row.cells[col] && row.cells[col + 2]) {
        row.insertBefore(row.cells[col], row.cells[col + 2]);
      } else if (row.cells[col]) {
        row.appendChild(row.cells[col]);
      }
    });
  };

  // Cell Operations
  const mergeCells = (): void => {
    const table = findTable();
    if (!table) return;
    
    const selectedCells = table.querySelectorAll('td.selected, th.selected');
    if (selectedCells.length < 2) return;
    
    const firstCell = selectedCells[0] as HTMLTableCellElement;
    let content = '';
    
    selectedCells.forEach((cell, index) => {
      if (index > 0) {
        content += ' ' + (cell.textContent || '');
        cell.remove();
      } else {
        content = cell.textContent || '';
      }
    });
    
    firstCell.textContent = content;
    firstCell.colSpan = selectedCells.length;
  };

  const splitCell = (rows: number, cols: number): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    
    // Reset any existing spans
    cell.rowSpan = 1;
    cell.colSpan = 1;
    
    // Add new cells to the right
    for (let i = 1; i < cols; i++) {
      const newCell = createNewCell();
      if (cell.nextElementSibling) {
        cell.parentNode?.insertBefore(newCell, cell.nextElementSibling);
      } else {
        cell.parentNode?.appendChild(newCell);
      }
    }
  };

  const mergeRight = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const nextCell = cell.nextElementSibling as HTMLTableCellElement;
    if (!nextCell) return;
    
    cell.textContent = (cell.textContent || '') + ' ' + (nextCell.textContent || '');
    cell.colSpan = (cell.colSpan || 1) + (nextCell.colSpan || 1);
    nextCell.remove();
  };

  const mergeDown = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { row, col } = findCellPosition(cell);
    const table = findTable();
    if (!table || !table.rows[row + 1]) return;
    
    const belowCell = table.rows[row + 1].cells[col];
    if (!belowCell) return;
    
    cell.textContent = (cell.textContent || '') + ' ' + (belowCell.textContent || '');
    cell.rowSpan = (cell.rowSpan || 1) + (belowCell.rowSpan || 1);
    belowCell.remove();
  };

  const clearCellContent = (): void => {
    const cell = getCurrentCell();
    if (cell) {
      cell.textContent = '';
    }
  };

  const clearCellFormatting = (): void => {
    const cell = getCurrentCell();
    if (cell) {
      cell.removeAttribute('style');
      cell.className = '';
    }
  };

  // Selection Operations
  const selectRow = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    
    Array.from(row.cells).forEach(cell => cell.classList.add('selected'));
  };

  const selectColumn = (): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    Array.from(table.rows).forEach(row => {
      if (row.cells[col]) {
        row.cells[col].classList.add('selected');
      }
    });
  };

  const selectTable = (): void => {
    const table = findTable();
    if (!table) return;
    
    Array.from(table.rows).forEach(row => {
      Array.from(row.cells).forEach(cell => cell.classList.add('selected'));
    });
  };

  const selectCellRange = (range: CellRange): void => {
    const table = findTable();
    if (!table) return;
    
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        if (table.rows[row] && table.rows[row].cells[col]) {
          table.rows[row].cells[col].classList.add('selected');
        }
      }
    }
  };

  // Table Structure Operations
  const addHeaderRow = (): void => {
    const table = findTable();
    if (!table) return;
    
    const thead = table.querySelector('thead') || document.createElement('thead');
    if (!table.querySelector('thead')) {
      table.insertBefore(thead, table.firstChild);
    }
    
    const headerRow = document.createElement('tr');
    const colCount = table.rows[0]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      const th = createNewCell('th');
      th.textContent = `Header ${i + 1}`;
      headerRow.appendChild(th);
    }
    
    thead.appendChild(headerRow);
  };

  const removeHeaderRow = (): void => {
    const table = findTable();
    if (!table) return;
    
    const thead = table.querySelector('thead');
    if (thead) {
      thead.remove();
    }
  };

  const addFooterRow = (): void => {
    const table = findTable();
    if (!table) return;
    
    const tfoot = table.querySelector('tfoot') || document.createElement('tfoot');
    if (!table.querySelector('tfoot')) {
      table.appendChild(tfoot);
    }
    
    const footerRow = document.createElement('tr');
    const colCount = table.rows[0]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      const td = createNewCell();
      td.textContent = `Footer ${i + 1}`;
      footerRow.appendChild(td);
    }
    
    tfoot.appendChild(footerRow);
  };

  const removeFooterRow = (): void => {
    const table = findTable();
    if (!table) return;
    
    const tfoot = table.querySelector('tfoot');
    if (tfoot) {
      tfoot.remove();
    }
  };

  const convertFirstRowToHeader = (): void => {
    const table = findTable();
    if (!table || !table.rows[0]) return;
    
    const firstRow = table.rows[0];
    const thead = document.createElement('thead');
    const newRow = document.createElement('tr');
    
    Array.from(firstRow.cells).forEach(cell => {
      const th = document.createElement('th');
      th.innerHTML = cell.innerHTML;
      th.style.cssText = cell.style.cssText;
      th.className = cell.className;
      newRow.appendChild(th);
    });
    
    thead.appendChild(newRow);
    table.insertBefore(thead, table.firstChild);
    firstRow.remove();
  };

  const convertHeaderToRow = (): void => {
    const table = findTable();
    if (!table) return;
    
    const thead = table.querySelector('thead');
    if (!thead) return;
    
    const tbody = table.querySelector('tbody') || table;
    Array.from(thead.rows).forEach(row => {
      const newRow = document.createElement('tr');
      Array.from(row.cells).forEach(cell => {
        const td = document.createElement('td');
        td.innerHTML = cell.innerHTML;
        td.style.cssText = cell.style.cssText;
        td.className = cell.className;
        newRow.appendChild(td);
      });
      tbody.insertBefore(newRow, tbody.firstChild);
    });
    
    thead.remove();
  };

  // Formatting Operations
  const applyTableStyle = (style: TableStyle): void => {
    const table = findTable();
    if (!table) return;
    
    if (style.backgroundColor) table.style.backgroundColor = style.backgroundColor;
    // Apply other styles as needed
  };

  const setBorders = (style: TableBorderStyle, sides: ('top' | 'right' | 'bottom' | 'left')[]): void => {
    const table = findTable();
    if (!table) return;
    
    const borderStyle = `${style.width}px ${style.style} ${style.color}`;
    
    Array.from(table.rows).forEach(row => {
      Array.from(row.cells).forEach(cell => {
        sides.forEach(side => {
          (cell.style as any)[`border${side.charAt(0).toUpperCase()}${side.slice(1)}`] = borderStyle;
        });
      });
    });
  };

  const removeBorders = (): void => {
    const table = findTable();
    if (!table) return;
    
    Array.from(table.rows).forEach(row => {
      Array.from(row.cells).forEach(cell => {
        cell.style.border = 'none';
      });
    });
  };

  const setTableAlignment = (alignment: 'left' | 'center' | 'right'): void => {
    const table = findTable();
    if (!table) return;
    
    table.style.marginLeft = alignment === 'left' ? '0' : alignment === 'center' ? 'auto' : 'auto';
    table.style.marginRight = alignment === 'right' ? '0' : alignment === 'center' ? 'auto' : 'auto';
  };

  const setCellAlignment = (horizontal: 'left' | 'center' | 'right', vertical: 'top' | 'middle' | 'bottom'): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    
    cell.style.textAlign = horizontal;
    cell.style.verticalAlign = vertical;
  };

  const setCellPadding = (padding: number): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    
    cell.style.padding = `${padding}px`;
  };

  const setColumnWidth = (width: number | 'auto'): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const { col } = findCellPosition(cell);
    const table = findTable();
    if (!table) return;
    
    Array.from(table.rows).forEach(row => {
      if (row.cells[col]) {
        row.cells[col].style.width = width === 'auto' ? 'auto' : `${width}px`;
      }
    });
  };

  const setRowHeight = (height: number | 'auto'): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    
    row.style.height = height === 'auto' ? 'auto' : `${height}px`;
  };

  // Table Properties
  const setTableWidth = (width: number | 'auto' | string): void => {
    const table = findTable();
    if (!table) return;
    
    if (typeof width === 'number') {
      table.style.width = `${width}px`;
    } else {
      table.style.width = width;
    }
  };

  const setTableCaption = (caption: string): void => {
    const table = findTable();
    if (!table) return;
    
    let captionElement = table.querySelector('caption');
    if (!captionElement) {
      captionElement = document.createElement('caption');
      table.insertBefore(captionElement, table.firstChild);
    }
    captionElement.textContent = caption;
  };

  const removeTableCaption = (): void => {
    const table = findTable();
    if (!table) return;
    
    const caption = table.querySelector('caption');
    if (caption) {
      caption.remove();
    }
  };

  const setTableSummary = (summary: string): void => {
    const table = findTable();
    if (!table) return;
    
    table.setAttribute('summary', summary);
  };

  // Data Operations
  const sortTableByColumn = (columnIndex: number, ascending: boolean): void => {
    const table = findTable();
    if (!table) return;
    
    const tbody = table.querySelector('tbody') || table;
    const rows = Array.from(tbody.rows);
    
    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex]?.textContent || '';
      const bValue = b.cells[columnIndex]?.textContent || '';
      
      const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
      return ascending ? comparison : -comparison;
    });
    
    rows.forEach(row => tbody.appendChild(row));
  };

  const filterTable = (columnIndex: number, filterValue: string): void => {
    const table = findTable();
    if (!table) return;
    
    Array.from(table.rows).forEach((row, index) => {
      if (index === 0) return; // Skip header
      
      const cellValue = row.cells[columnIndex]?.textContent || '';
      const shouldShow = cellValue.toLowerCase().includes(filterValue.toLowerCase());
      row.style.display = shouldShow ? '' : 'none';
    });
  };

  const clearFilter = (): void => {
    const table = findTable();
    if (!table) return;
    
    Array.from(table.rows).forEach(row => {
      row.style.display = '';
    });
  };

  // Conversion Operations
  const convertTableToText = (delimiter: string): string => {
    const table = findTable();
    if (!table) return '';
    
    const rows = Array.from(table.rows);
    return rows.map(row => 
      Array.from(row.cells).map(cell => cell.textContent || '').join(delimiter)
    ).join('\n');
  };

  const convertTextToTable = (text: string, delimiter: string, rows: number, cols: number): void => {
    const table = findTable();
    if (!table) return;
    
    // Clear existing content
    table.innerHTML = '';
    
    const lines = text.split('\n');
    lines.slice(0, rows).forEach(line => {
      const row = document.createElement('tr');
      const cells = line.split(delimiter);
      
      cells.slice(0, cols).forEach(cellText => {
        const cell = createNewCell();
        cell.textContent = cellText.trim();
        row.appendChild(cell);
      });
      
      table.appendChild(row);
    });
  };

  // Advanced Features
  const insertFormula = (formula: string): void => {
    const cell = getCurrentCell();
    if (!cell) return;
    
    cell.setAttribute('data-formula', formula);
    cell.textContent = formula;
  };

  const calculateSum = (range: CellRange): number => {
    const table = findTable();
    if (!table) return 0;
    
    let sum = 0;
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        const cell = table.rows[row]?.cells[col];
        if (cell) {
          const value = parseFloat(cell.textContent || '0');
          if (!isNaN(value)) sum += value;
        }
      }
    }
    return sum;
  };

  const calculateAverage = (range: CellRange): number => {
    const sum = calculateSum(range);
    const cellCount = (range.endRow - range.startRow + 1) * (range.endCol - range.startCol + 1);
    return cellCount > 0 ? sum / cellCount : 0;
  };

  const autoFitColumns = (): void => {
    const table = findTable();
    if (!table) return;
    
    const colCount = table.rows[0]?.cells.length || 0;
    for (let col = 0; col < colCount; col++) {
      let maxWidth = 0;
      Array.from(table.rows).forEach(row => {
        if (row.cells[col]) {
          const cellWidth = row.cells[col].textContent?.length || 0;
          maxWidth = Math.max(maxWidth, cellWidth);
        }
      });
      
      Array.from(table.rows).forEach(row => {
        if (row.cells[col]) {
          row.cells[col].style.width = `${Math.max(50, maxWidth * 8)}px`;
        }
      });
    }
  };

  const autoFitTable = (): void => {
    const table = findTable();
    if (!table) return;
    
    table.style.width = 'auto';
    autoFitColumns();
  };

  const distributeRowsEvenly = (): void => {
    const table = findTable();
    if (!table) return;
    
    const tableHeight = table.offsetHeight;
    const rowHeight = tableHeight / table.rows.length;
    
    Array.from(table.rows).forEach(row => {
      row.style.height = `${rowHeight}px`;
    });
  };

  const distributeColumnsEvenly = (): void => {
    const table = findTable();
    if (!table) return;
    
    const tableWidth = table.offsetWidth;
    const colCount = table.rows[0]?.cells.length || 1;
    const colWidth = tableWidth / colCount;
    
    Array.from(table.rows).forEach(row => {
      Array.from(row.cells).forEach(cell => {
        cell.style.width = `${colWidth}px`;
      });
    });
  };

  // Table Themes
  const applyTableTheme = (theme: TableTheme): void => {
    const table = findTable();
    if (!table) return;
    
    // Remove existing theme classes
    table.classList.remove('theme-light', 'theme-dark', 'theme-colorful', 'theme-minimal', 'theme-professional');
    
    // Apply new theme
    table.classList.add(`theme-${theme}`);
    
    switch (theme) {
      case 'light':
        table.style.backgroundColor = '#ffffff';
        table.style.border = '1px solid #e5e7eb';
        break;
      case 'dark':
        table.style.backgroundColor = '#1f2937';
        table.style.color = '#ffffff';
        table.style.border = '1px solid #374151';
        break;
      case 'colorful':
        table.style.backgroundColor = '#f3f4f6';
        table.style.border = '2px solid #3b82f6';
        break;
      case 'minimal':
        table.style.backgroundColor = 'transparent';
        table.style.border = 'none';
        break;
      case 'professional':
        table.style.backgroundColor = '#ffffff';
        table.style.border = '1px solid #d1d5db';
        break;
    }
  };

  const toggleAlternatingRowColors = (): void => {
    const table = findTable();
    if (!table) return;
    
    Array.from(table.rows).forEach((row, index) => {
      if (index % 2 === 1) {
        row.style.backgroundColor = row.style.backgroundColor ? '' : '#f9fafb';
      }
    });
  };

  const toggleAlternatingColumnColors = (): void => {
    const table = findTable();
    if (!table) return;
    
    const colCount = table.rows[0]?.cells.length || 0;
    for (let col = 1; col < colCount; col += 2) {
      Array.from(table.rows).forEach(row => {
        if (row.cells[col]) {
          row.cells[col].style.backgroundColor = row.cells[col].style.backgroundColor ? '' : '#f9fafb';
        }
      });
    }
  };

  // Import/Export
  const exportTableAsCSV = (): string => {
    return convertTableToText(',');
  };

  const exportTableAsJSON = (): string => {
    const table = findTable();
    if (!table) return '[]';
    
    const headers = Array.from(table.rows[0]?.cells || []).map(cell => cell.textContent || '');
    const data = Array.from(table.rows).slice(1).map(row => {
      const obj: any = {};
      Array.from(row.cells).forEach((cell, index) => {
        obj[headers[index] || `Column${index + 1}`] = cell.textContent || '';
      });
      return obj;
    });
    
    return JSON.stringify(data, null, 2);
  };

  const importFromCSV = (csvData: string): void => {
    const lines = csvData.split('\n');
    const table = findTable();
    if (!table) return;
    
    table.innerHTML = '';
    
    lines.forEach(line => {
      const row = document.createElement('tr');
      const cells = line.split(',');
      
      cells.forEach(cellText => {
        const cell = createNewCell();
        cell.textContent = cellText.trim();
        row.appendChild(cell);
      });
      
      table.appendChild(row);
    });
  };

  // Accessibility
  const setTableHeaders = (type: 'row' | 'column' | 'both'): void => {
    const table = findTable();
    if (!table) return;
    
    if (type === 'column' || type === 'both') {
      Array.from(table.rows[0]?.cells || []).forEach(cell => {
        cell.setAttribute('scope', 'col');
      });
    }
    
    if (type === 'row' || type === 'both') {
      Array.from(table.rows).slice(1).forEach(row => {
        if (row.cells[0]) {
          row.cells[0].setAttribute('scope', 'row');
        }
      });
    }
  };

  const addTableScope = (): void => {
    const table = findTable();
    if (!table) return;
    
    table.setAttribute('role', 'table');
  };

  const setTableRole = (role: string): void => {
    const table = findTable();
    if (!table) return;
    
    table.setAttribute('role', role);
  };

  return {
    findTable,
    findCellPosition,
    applyColorToElement,
    colorEntireHeader,
    colorEntireRow,
    colorAlternativeRows,
    colorAlternativeColumns,
    colorSelectedCells,
    deleteRowAbove,
    deleteRowBelow,
    deleteCurrentRow,
    deleteSelectedRows,
    addRowAbove,
    addRowBelow,
    addMultipleRows,
    duplicateRow,
    moveRowUp,
    moveRowDown,
    deleteColumnLeft,
    deleteColumnRight,
    deleteCurrentColumn,
    deleteSelectedColumns,
    addColumnLeft,
    addColumnRight,
    addMultipleColumns,
    duplicateColumn,
    moveColumnLeft,
    moveColumnRight,
    mergeCells,
    splitCell,
    mergeRight,
    mergeDown,
    clearCellContent,
    clearCellFormatting,
    selectRow,
    selectColumn,
    selectTable,
    selectCellRange,
    addHeaderRow,
    removeHeaderRow,
    addFooterRow,
    removeFooterRow,
    convertFirstRowToHeader,
    convertHeaderToRow,
    applyTableStyle,
    setBorders,
    removeBorders,
    setTableAlignment,
    setCellAlignment,
    setCellPadding,
    setColumnWidth,
    setRowHeight,
    setTableWidth,
    setTableCaption,
    removeTableCaption,
    setTableSummary,
    sortTableByColumn,
    filterTable,
    clearFilter,
    convertTableToText,
    convertTextToTable,
    insertFormula,
    calculateSum,
    calculateAverage,
    autoFitColumns,
    autoFitTable,
    distributeRowsEvenly,
    distributeColumnsEvenly,
    applyTableTheme,
    toggleAlternatingRowColors,
    toggleAlternatingColumnColors,
    exportTableAsCSV,
    exportTableAsJSON,
    importFromCSV,
    setTableHeaders,
    addTableScope,
    setTableRole
  };
};