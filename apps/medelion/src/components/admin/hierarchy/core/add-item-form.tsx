'use client';

import { useTheme } from '@/theme';

interface AddItemFormProps {
  itemName: string;
  itemType: string;
  onNameChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  depth: number;
}

export default function AddItemForm({ 
  itemName, 
  itemType, 
  onNameChange, 
  onSave, 
  onCancel, 
  depth 
}: AddItemFormProps) {
  const { theme } = useTheme();

  return (
    <div 
      className="p-4 rounded-lg border-2 border-dashed"
      style={{ 
        backgroundColor: `${theme.colors.semantic.status.success}08`,
        border: `2px dashed ${theme.colors.semantic.status.success}40`,
        marginLeft: `${depth * 24}px`
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span 
            className="text-sm font-medium"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Add new {itemType}:
          </span>
        </div>
        <input
          type="text"
          value={itemName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`Enter ${itemType.toLowerCase()} name`}
          className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`,
            color: theme.colors.semantic.text.primary,
            '--tw-ring-color': theme.colors.semantic.status.success
          } as any}
          autoFocus
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <button
          onClick={onSave}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.colors.semantic.status.success,
            color: theme.colors.semantic.text.inverse
          }}
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.colors.semantic.surface.tertiary,
            color: theme.colors.semantic.text.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}