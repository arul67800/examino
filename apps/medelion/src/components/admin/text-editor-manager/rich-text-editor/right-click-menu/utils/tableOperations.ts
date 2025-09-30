import { TableOperations } from '../types';

export const createTableOperations = (selectedCell: HTMLTableCellElement | null): TableOperations => {
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
    if (!selectedCell) return;
    const row = selectedCell.closest('tr');
    if (!row) return;
    
    const cells = Array.from(row.cells);
    cells.forEach(cell => applyColorToElement(cell, color, 'background'));
  };

  const colorAlternativeRows = (color: string): void => {
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach((row, index) => {
      if (index % 2 === 1) { // Odd rows (0-indexed)
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
    
    for (let col = 1; col < maxCols; col += 2) { // Odd columns (0-indexed)
      rows.forEach(row => {
        if (row.cells[col]) {
          applyColorToElement(row.cells[col], color, 'background');
        }
      });
    }
  };

  const deleteRowAbove = (): void => {
    if (!selectedCell) return;
    const { row } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table || row <= 0) return; // Don't delete if it's the first row or invalid
    
    table.deleteRow(row - 1);
  };

  const deleteRowBelow = (): void => {
    if (!selectedCell) return;
    const { row } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table || row >= table.rows.length - 1) return; // Don't delete if it's the last row
    
    table.deleteRow(row + 1);
  };

  const deleteColumnLeft = (): void => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table || col <= 0) return; // Don't delete if it's the first column
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      if (row.cells[col - 1]) {
        row.deleteCell(col - 1);
      }
    });
  };

  const deleteColumnRight = (): void => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    const maxCols = Math.max(...rows.map(row => row.cells.length));
    if (col >= maxCols - 1) return; // Don't delete if it's the last column
    
    rows.forEach(row => {
      if (row.cells[col + 1]) {
        row.deleteCell(col + 1);
      }
    });
  };

  const createNewCell = (): HTMLTableCellElement => {
    const cell = document.createElement('td');
    cell.contentEditable = 'true';
    cell.style.border = '1px solid #ddd';
    cell.style.padding = '8px';
    cell.style.minHeight = '20px';
    return cell;
  };

  const addRowAbove = (): void => {
    if (!selectedCell) return;
    const { row } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const newRow = table.insertRow(row);
    const colCount = table.rows[row + 1]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell();
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    }
  };

  const addRowBelow = (): void => {
    if (!selectedCell) return;
    const { row } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const newRow = table.insertRow(row + 1);
    const colCount = table.rows[row]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell();
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    }
  };

  const addColumnLeft = (): void => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      const cell = row.insertCell(col);
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    });
  };

  const addColumnRight = (): void => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      const cell = row.insertCell(col + 1);
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    });
  };

  return {
    findTable,
    findCellPosition,
    applyColorToElement,
    colorEntireHeader,
    colorEntireRow,
    colorAlternativeRows,
    colorAlternativeColumns,
    deleteRowAbove,
    deleteRowBelow,
    deleteColumnLeft,
    deleteColumnRight,
    addRowAbove,
    addRowBelow,
    addColumnLeft,
    addColumnRight,
  };
};