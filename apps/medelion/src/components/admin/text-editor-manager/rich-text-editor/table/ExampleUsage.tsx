import React from 'react';
import { 
  TableProvider, 
  TableGrid, 
  useTableIntegration,
  WordTableIntegration
} from './index';

/**
 * Example: How to integrate the advanced table system into your word-like editor
 * 
 * This shows the complete, sophisticated table implementation you requested.
 * The system includes Google Docs-like functionality with advanced features.
 */

// Option 1: Simple Integration - Just the table grid
export const SimpleTableExample = () => {
  return (
    <TableProvider>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Advanced Table Grid</h2>
        <TableGrid 
          maxHeight={400}
          enableVirtualScrolling={true}
          showMinimap={true}
        />
      </div>
    </TableProvider>
  );
};

// Option 2: Full Integration - Complete table system
export const FullTableExample = () => {
  const handleTableInsert = (tableData: any) => {
    console.log('Table inserted into editor:', tableData);
    // Here you would integrate with your rich text editor
    // For example, insert a table placeholder or embed the table data
  };

  const handleTableUpdate = (tableData: any) => {
    console.log('Table updated:', tableData);
    // Update the table in your editor's content
  };

  const handleTableDelete = (tableId: string) => {
    console.log('Table deleted:', tableId);
    // Remove table from your editor's content
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Word-Like Editor with Advanced Tables</h1>
      
      <WordTableIntegration
        onTableInsert={handleTableInsert}
        onTableUpdate={handleTableUpdate}
        onTableDelete={handleTableDelete}
        className="mb-6"
      />
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Advanced Features Included:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600">Selection & Navigation</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Multi-cell selection (Ctrl+Click, Shift+Click)</li>
              <li>Range selection with drag</li>
              <li>Column/row selection by clicking headers</li>
              <li>Keyboard navigation (arrows, tab, enter)</li>
              <li>Excel-like cell editing (F2, double-click)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-green-600">Data Operations</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Copy/paste cells (Ctrl+C, Ctrl+V)</li>
              <li>Cut operations (Ctrl+X)</li>
              <li>Delete cell contents (Delete/Backspace)</li>
              <li>Undo/redo support</li>
              <li>Auto-type detection (text, number, date)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-purple-600">Table Structure</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Insert/delete rows and columns</li>
              <li>Resize columns by dragging</li>
              <li>Merge and split cells</li>
              <li>Freeze rows/columns</li>
              <li>Sort and filter data</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-600">Advanced Features</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Rich formatting (bold, italic, colors)</li>
              <li>Data validation and formulas</li>
              <li>Context menus for quick actions</li>
              <li>Export to CSV, JSON, HTML</li>
              <li>Virtual scrolling for large tables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Option 3: Custom Hook Integration
export const CustomHookExample = () => {
  const {
    editorState,
    createQuickTable,
    tables,
    exportTable
  } = useTableIntegration({
    onTableCreate: (table: any) => console.log('Created:', table),
    onTableUpdate: (table: any) => console.log('Updated:', table),
    maxTables: 5,
    autoSave: true
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Custom Table Integration</h2>
      
      <button
        onClick={() => createQuickTable(5, 4)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create 5×4 Table
      </button>
      
      <div className="mt-4">
        <p>Tables created: {tables.length}</p>
        <p>Editor open: {editorState.isOpen ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default FullTableExample;