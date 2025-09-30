import React, { memo, useCallback, useState } from 'react';
import { useTheme } from '@/theme';
import { TableSettings } from '../types/table.types';
import { 
  Settings, Grid, Eye, EyeOff, Rows, Columns, Hash, 
  ToggleLeft, ToggleRight, Sliders, Palette, Search,
  ChevronDown, ChevronRight, Save, RotateCcw,
  Monitor, Smartphone, Tablet, Maximize2,
  Filter, ArrowUpDown, MousePointer, Edit3
} from 'lucide-react';

export interface TableSettingsPanelProps {
  settings: TableSettings;
  onSettingsChange: (settings: Partial<TableSettings>) => void;
  onClose?: () => void;
  className?: string;
}

export const TableSettingsPanel = memo<TableSettingsPanelProps>(({
  settings,
  onSettingsChange,
  onClose,
  className = ''
}) => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('display');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['display']));

  const handleSettingChange = useCallback((key: keyof TableSettings, value: any) => {
    onSettingsChange({ [key]: value });
  }, [onSettingsChange]);

  const toggleSection = useCallback((section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  }, [expandedSections]);

  const ToggleSwitch = useCallback(({ 
    checked, 
    onChange, 
    label, 
    description 
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
          {label}
        </div>
        {description && (
          <div className="text-xs mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="ml-3 focus:outline-none"
        role="switch"
        aria-checked={checked}
      >
        {checked ? (
          <ToggleRight 
            className="w-6 h-6" 
            style={{ color: theme.colors.semantic.action.primary }} 
          />
        ) : (
          <ToggleLeft 
            className="w-6 h-6" 
            style={{ color: theme.colors.semantic.text.secondary }} 
          />
        )}
      </button>
    </div>
  ), [theme]);

  const NumberInput = useCallback(({ 
    value, 
    onChange, 
    label, 
    min, 
    max, 
    step = 1, 
    unit 
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary,
            color: theme.colors.semantic.text.primary,
            focusRingColor: theme.colors.semantic.action.primary
          }}
        />
        {unit && (
          <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  ), [theme]);

  const SelectInput = useCallback(({ 
    value, 
    onChange, 
    options, 
    label 
  }: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary,
          color: theme.colors.semantic.text.primary
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ), [theme]);

  const SectionHeader = useCallback(({ 
    title, 
    icon: Icon, 
    section, 
    children 
  }: {
    title: string;
    icon: React.ElementType;
    section: string;
    children?: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(section);
    
    return (
      <div className="space-y-3">
        <button
          onClick={() => toggleSection(section)}
          className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
          style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
        >
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5" style={{ color: theme.colors.semantic.action.primary }} />
            <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
              {title}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: theme.colors.semantic.text.secondary }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: theme.colors.semantic.text.secondary }} />
          )}
        </button>
        
        {isExpanded && children && (
          <div className="px-3 pb-3 space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  }, [theme, expandedSections, toggleSection]);

  return (
    <div 
      className={`table-settings-panel w-80 border rounded-lg shadow-lg ${className}`}
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary,
        maxHeight: '80vh',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" style={{ color: theme.colors.semantic.action.primary }} />
          <h3 className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
            Table Settings
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
        <div className="p-4 space-y-4">
          
          {/* Display Settings */}
          <SectionHeader title="Display" icon={Eye} section="display">
            <ToggleSwitch
              checked={settings.showHeaders}
              onChange={(checked) => handleSettingChange('showHeaders', checked)}
              label="Show Headers"
              description="Display column headers at the top of the table"
            />
            
            <ToggleSwitch
              checked={settings.showFooters}
              onChange={(checked) => handleSettingChange('showFooters', checked)}
              label="Show Footers"
              description="Display column footers with aggregations"
            />
            
            <ToggleSwitch
              checked={settings.showRowNumbers}
              onChange={(checked) => handleSettingChange('showRowNumbers', checked)}
              label="Show Row Numbers"
              description="Display row numbers in the first column"
            />
            
            <ToggleSwitch
              checked={settings.showColumnLetters}
              onChange={(checked) => handleSettingChange('showColumnLetters', checked)}
              label="Show Column Letters"
              description="Display column letters (A, B, C...) in headers"
            />
            
            <ToggleSwitch
              checked={settings.showGridLines}
              onChange={(checked) => handleSettingChange('showGridLines', checked)}
              label="Show Grid Lines"
              description="Display borders between cells"
            />
            
            <ToggleSwitch
              checked={settings.alternateRowColors}
              onChange={(checked) => handleSettingChange('alternateRowColors', checked)}
              label="Alternate Row Colors"
              description="Alternate background colors for better readability"
            />
            
            <ToggleSwitch
              checked={settings.showHoverEffects}
              onChange={(checked) => handleSettingChange('showHoverEffects', checked)}
              label="Hover Effects"
              description="Highlight cells and rows on hover"
            />
          </SectionHeader>

          {/* Behavior Settings */}
          <SectionHeader title="Behavior" icon={MousePointer} section="behavior">
            <ToggleSwitch
              checked={settings.editable}
              onChange={(checked) => handleSettingChange('editable', checked)}
              label="Editable"
              description="Allow editing of cell content"
            />
            
            <ToggleSwitch
              checked={settings.sortable}
              onChange={(checked) => handleSettingChange('sortable', checked)}
              label="Sortable"
              description="Enable column sorting"
            />
            
            <ToggleSwitch
              checked={settings.filterable}
              onChange={(checked) => handleSettingChange('filterable', checked)}
              label="Filterable"
              description="Enable column filtering"
            />
            
            <ToggleSwitch
              checked={settings.resizable}
              onChange={(checked) => handleSettingChange('resizable', checked)}
              label="Resizable"
              description="Allow resizing of columns and rows"
            />
            
            <ToggleSwitch
              checked={settings.reorderable}
              onChange={(checked) => handleSettingChange('reorderable', checked)}
              label="Reorderable"
              description="Allow reordering of columns and rows"
            />
            
            <SelectInput
              value={settings.selectable}
              onChange={(value) => handleSettingChange('selectable', value)}
              label="Selection Mode"
              options={[
                { value: 'none', label: 'None' },
                { value: 'single', label: 'Single' },
                { value: 'multiple', label: 'Multiple' },
                { value: 'range', label: 'Range' }
              ]}
            />
          </SectionHeader>

          {/* Size Settings */}
          <SectionHeader title="Dimensions" icon={Maximize2} section="dimensions">
            <NumberInput
              value={settings.defaultRowHeight}
              onChange={(value) => handleSettingChange('defaultRowHeight', value)}
              label="Default Row Height"
              min={20}
              max={200}
              unit="px"
            />
            
            <NumberInput
              value={settings.defaultColumnWidth}
              onChange={(value) => handleSettingChange('defaultColumnWidth', value)}
              label="Default Column Width"
              min={50}
              max={500}
              unit="px"
            />
            
            <NumberInput
              value={settings.minRowHeight}
              onChange={(value) => handleSettingChange('minRowHeight', value)}
              label="Minimum Row Height"
              min={16}
              max={100}
              unit="px"
            />
            
            <NumberInput
              value={settings.minColumnWidth}
              onChange={(value) => handleSettingChange('minColumnWidth', value)}
              label="Minimum Column Width"
              min={30}
              max={200}
              unit="px"
            />
          </SectionHeader>

          {/* Performance Settings */}
          <SectionHeader title="Performance" icon={Monitor} section="performance">
            <ToggleSwitch
              checked={settings.virtualScrolling}
              onChange={(checked) => handleSettingChange('virtualScrolling', checked)}
              label="Virtual Scrolling"
              description="Improve performance for large tables by rendering only visible rows"
            />
            
            <ToggleSwitch
              checked={settings.lazyLoading}
              onChange={(checked) => handleSettingChange('lazyLoading', checked)}
              label="Lazy Loading"
              description="Load content as needed to improve initial load time"
            />
            
            <NumberInput
              value={settings.renderBatchSize}
              onChange={(value) => handleSettingChange('renderBatchSize', value)}
              label="Render Batch Size"
              min={10}
              max={200}
              unit="rows"
            />
            
            <NumberInput
              value={settings.updateDebounce}
              onChange={(value) => handleSettingChange('updateDebounce', value)}
              label="Update Debounce"
              min={0}
              max={1000}
              step={50}
              unit="ms"
            />
          </SectionHeader>

          {/* Pagination Settings */}
          <SectionHeader title="Pagination" icon={Hash} section="pagination">
            <ToggleSwitch
              checked={settings.pagination?.enabled || false}
              onChange={(checked) => handleSettingChange('pagination', { 
                ...settings.pagination, 
                enabled: checked 
              })}
              label="Enable Pagination"
              description="Split table data into pages"
            />
            
            {settings.pagination?.enabled && (
              <>
                <NumberInput
                  value={settings.pagination.pageSize}
                  onChange={(value) => handleSettingChange('pagination', { 
                    ...settings.pagination, 
                    pageSize: value 
                  })}
                  label="Page Size"
                  min={5}
                  max={500}
                  unit="rows"
                />
                
                <ToggleSwitch
                  checked={settings.pagination.showPageSizeSelector || false}
                  onChange={(checked) => handleSettingChange('pagination', { 
                    ...settings.pagination, 
                    showPageSizeSelector: checked 
                  })}
                  label="Show Page Size Selector"
                  description="Allow users to change page size"
                />
                
                <ToggleSwitch
                  checked={settings.pagination.showPageInfo || false}
                  onChange={(checked) => handleSettingChange('pagination', { 
                    ...settings.pagination, 
                    showPageInfo: checked 
                  })}
                  label="Show Page Info"
                  description="Display current page and total pages"
                />
              </>
            )}
          </SectionHeader>

          {/* Accessibility Settings */}
          <SectionHeader title="Accessibility" icon={Eye} section="accessibility">
            <ToggleSwitch
              checked={settings.accessibility?.keyboardNavigation || false}
              onChange={(checked) => handleSettingChange('accessibility', { 
                ...settings.accessibility, 
                keyboardNavigation: checked 
              })}
              label="Keyboard Navigation"
              description="Enable navigation using arrow keys"
            />
            
            <ToggleSwitch
              checked={settings.accessibility?.screenReaderSupport || false}
              onChange={(checked) => handleSettingChange('accessibility', { 
                ...settings.accessibility, 
                screenReaderSupport: checked 
              })}
              label="Screen Reader Support"
              description="Add ARIA labels and descriptions"
            />
            
            <ToggleSwitch
              checked={settings.accessibility?.highContrast || false}
              onChange={(checked) => handleSettingChange('accessibility', { 
                ...settings.accessibility, 
                highContrast: checked 
              })}
              label="High Contrast"
              description="Use high contrast colors for better visibility"
            />
            
            <ToggleSwitch
              checked={settings.accessibility?.focusIndicators || false}
              onChange={(checked) => handleSettingChange('accessibility', { 
                ...settings.accessibility, 
                focusIndicators: checked 
              })}
              label="Focus Indicators"
              description="Show clear focus indicators for keyboard navigation"
            />
          </SectionHeader>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="flex items-center justify-between p-4 border-t"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <button
          onClick={() => {
            // Reset to default settings
            const defaultSettings: Partial<TableSettings> = {
              showHeaders: true,
              showFooters: false,
              showRowNumbers: true,
              showColumnLetters: false,
              showGridLines: true,
              showHoverEffects: true,
              showSelectionIndicators: true,
              alternateRowColors: true,
              sortable: true,
              filterable: true,
              resizable: true,
              reorderable: true,
              selectable: 'multiple',
              editable: true,
              virtualScrolling: false,
              lazyLoading: false,
              defaultRowHeight: 32,
              defaultColumnWidth: 120,
              minRowHeight: 24,
              minColumnWidth: 50,
              maxRowHeight: 200,
              maxColumnWidth: 500,
              renderBatchSize: 50,
              scrollThrottle: 16,
              updateDebounce: 300
            };
            onSettingsChange(defaultSettings);
          }}
          className="flex items-center space-x-2 px-3 py-2 text-sm border rounded hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
          style={{
            borderColor: theme.colors.semantic.border.primary,
            color: theme.colors.semantic.text.secondary
          }}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
        
        <div className="text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
          Settings auto-saved
        </div>
      </div>
    </div>
  );
});

TableSettingsPanel.displayName = 'TableSettingsPanel';