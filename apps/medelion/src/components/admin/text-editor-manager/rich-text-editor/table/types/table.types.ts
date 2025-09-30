import { CellValidation } from './validation.types';
import { CellFormat } from './format.types';

export type CellDataType = 'text' | 'number' | 'date' | 'boolean' | 'formula' | 'image' | 'link' | 'currency' | 'percentage' | 'email' | 'phone' | 'color' | 'rich-text';

export type CellAlignmentType = 'left' | 'center' | 'right' | 'justify';
export type CellVerticalAlignmentType = 'top' | 'middle' | 'bottom';
export type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
export type SortDirectionType = 'asc' | 'desc' | 'none';
export type SelectionModeType = 'none' | 'single' | 'multiple' | 'range';
export type ResizeModeType = 'column' | 'row' | 'both' | 'none';

export interface TableDimensions {
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface TablePosition {
  x: number;
  y: number;
  z?: number;
}

export interface CellBorder {
  width: number;
  style: BorderStyleType;
  color: string;
}

export interface CellBorders {
  top?: CellBorder;
  right?: CellBorder;
  bottom?: CellBorder;
  left?: CellBorder;
  inner?: CellBorder;
  outer?: CellBorder;
}

export interface CellPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CellMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CellStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: {
    type: 'linear' | 'radial';
    direction?: string;
    stops: Array<{ color: string; position: number }>;
  };
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textAlign?: CellAlignmentType;
  verticalAlign?: CellVerticalAlignmentType;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textShadow?: string;
  borders?: CellBorders;
  padding?: CellPadding;
  margin?: CellMargin;
  borderRadius?: number;
  boxShadow?: string;
  opacity?: number;
  rotation?: number;
  scale?: number;
  transform?: string;
}

export interface CellMetadata {
  id: string;
  created: Date;
  updated: Date;
  createdBy?: string;
  updatedBy?: string;
  comment?: string;
  tags?: string[];
  locked?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  formula?: string;
  originalValue?: string;
  calculatedValue?: string;
  dependencies?: string[];
  version?: number;
  history?: Array<{
    value: string;
    timestamp: Date;
    user?: string;
    action: 'edit' | 'format' | 'delete' | 'create';
  }>;
}

export interface TableCell {
  id: string;
  content: string;
  type: CellDataType;
  style?: CellStyle;
  metadata?: CellMetadata;
  validation?: CellValidation;
  formula?: string;
  displayValue?: string;
  rawValue?: any;
  error?: string;
  warning?: string;
  tooltip?: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  masked?: boolean;
  encrypted?: boolean;
  hyperlink?: {
    url: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    title?: string;
  };
  image?: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  };
  dropdown?: {
    options: Array<{ value: string; label: string; color?: string }>;
    multiple?: boolean;
    searchable?: boolean;
  };
  richText?: {
    html: string;
    text: string;
    markdown?: string;
  };
}

export interface TableColumn {
  id: string;
  name: string;
  type: CellDataType;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  sortable: boolean;
  filterable: boolean;
  resizable: boolean;
  reorderable: boolean;
  hideable: boolean;
  pinnable: boolean;
  style?: CellStyle;
  headerStyle?: CellStyle;
  footerStyle?: CellStyle;
  format?: CellFormat;
  validation?: CellValidation;
  defaultValue?: any;
  autoIncrement?: boolean;
  unique?: boolean;
  indexed?: boolean;
  frozen?: boolean;
  hidden?: boolean;
  position?: number;
  group?: string;
  description?: string;
  tooltip?: string;
  icon?: string;
  color?: string;
  aggregation?: {
    type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'mode' | 'custom';
    formula?: string;
    format?: string;
  };
  filter?: {
    type: 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'range' | 'custom';
    options?: any[];
    customFilter?: (value: any, filterValue: any) => boolean;
  };
  sort?: {
    direction: SortDirectionType;
    priority: number;
    customSort?: (a: any, b: any) => number;
  };
}

export interface TableRow {
  id: string;
  cells: { [columnId: string]: TableCell };
  height?: number;
  style?: CellStyle;
  metadata?: {
    created: Date;
    updated: Date;
    createdBy?: string;
    updatedBy?: string;
    version?: number;
    tags?: string[];
    locked?: boolean;
    hidden?: boolean;
    selected?: boolean;
    expanded?: boolean;
    level?: number;
    parentId?: string;
    childIds?: string[];
  };
  isHeader?: boolean;
  isFooter?: boolean;
  isSubHeader?: boolean;
  isGroupHeader?: boolean;
  groupId?: string;
  position?: number;
  readonly?: boolean;
  selectable?: boolean;
}

export interface TableSelection {
  type: 'cell' | 'row' | 'column' | 'range' | 'all';
  cells: string[];
  rows: string[];
  columns: string[];
  ranges: Array<{
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
  }>;
  primary?: string; // Primary selected cell
  anchor?: string; // Anchor cell for range selection
  focus?: string; // Focus cell for range selection
}

export interface TableSettings {
  // Display settings
  showHeaders: boolean;
  showFooters: boolean;
  showRowNumbers: boolean;
  showColumnLetters: boolean;
  showGridLines: boolean;
  showHoverEffects: boolean;
  showSelectionIndicators: boolean;
  
  // Behavior settings
  alternateRowColors: boolean;
  sortable: boolean;
  filterable: boolean;
  resizable: boolean;
  reorderable: boolean;
  selectable: SelectionModeType;
  editable: boolean;
  virtualScrolling: boolean;
  lazyLoading: boolean;
  
  // Size settings
  defaultRowHeight: number;
  defaultColumnWidth: number;
  minRowHeight: number;
  minColumnWidth: number;
  maxRowHeight: number;
  maxColumnWidth: number;
  
  // Performance settings
  renderBatchSize: number;
  scrollThrottle: number;
  updateDebounce: number;
  
  // Pagination
  pagination?: {
    enabled: boolean;
    pageSize: number;
    showPageSizeSelector: boolean;
    showPageInfo: boolean;
    showFirstLast: boolean;
    showPrevNext: boolean;
    showQuickJumper: boolean;
    pageSizeOptions: number[];
  };
  
  // Grouping
  grouping?: {
    enabled: boolean;
    expandedGroups: string[];
    defaultExpanded: boolean;
    showGroupSummary: boolean;
    groupSummaryPosition: 'top' | 'bottom';
  };
  
  // Export/Import
  export?: {
    formats: Array<'csv' | 'xlsx' | 'json' | 'pdf' | 'html'>;
    includeHeaders: boolean;
    includeFooters: boolean;
    includeFormatting: boolean;
    includeFormulas: boolean;
  };
  
  // Security
  security?: {
    readOnly: boolean;
    allowedOperations: Array<'create' | 'read' | 'update' | 'delete' | 'import' | 'export'>;
    encryptSensitiveData: boolean;
    auditTrail: boolean;
  };
  
  // Accessibility
  accessibility?: {
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    highContrast: boolean;
    focusIndicators: boolean;
    ariaLabels: boolean;
  };
  
  // Theme
  theme?: {
    name: string;
    colorScheme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontSize: number;
    fontFamily: string;
    borderRadius: number;
    spacing: number;
  };
}

export interface TableMetadata {
  id: string;
  title: string;
  description?: string;
  created: Date;
  updated: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
  tags?: string[];
  category?: string;
  template?: string;
  schema?: string;
  permissions?: {
    read: string[];
    write: string[];
    admin: string[];
  };
  statistics?: {
    rowCount: number;
    columnCount: number;
    cellCount: number;
    filledCellCount: number;
    formulaCellCount: number;
    lastAccessed: Date;
    accessCount: number;
    size: number;
  };
  backup?: {
    enabled: boolean;
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    retention: number;
    lastBackup?: Date;
  };
}

export interface AdvancedTableData {
  id: string;
  columns: TableColumn[];
  rows: TableRow[];
  metadata: TableMetadata;
  settings: TableSettings;
  selection?: TableSelection;
  filters?: { [columnId: string]: any };
  sorting?: Array<{ columnId: string; direction: SortDirectionType; priority: number }>;
  grouping?: { [columnId: string]: any };
  formulas?: { [cellId: string]: string };
  dependencies?: { [cellId: string]: string[] };
  validationErrors?: { [cellId: string]: string[] };
  changeLog?: Array<{
    id: string;
    timestamp: Date;
    user?: string;
    action: string;
    target: string;
    oldValue?: any;
    newValue?: any;
    metadata?: any;
  }>;
}