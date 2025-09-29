'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import {
  Type, Image, Table, List, Quote, Code, Video, File,
  Plus, Grip, Trash2, Copy, Edit3, Move, ChevronDown,
  Columns, Layout, Calendar, Map, BarChart, Zap, Star
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: ContentBlockType;
  data: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: React.CSSProperties;
  isNested?: boolean;
  children?: ContentBlock[];
  metadata?: {
    created: Date;
    updated: Date;
    version: number;
    author?: string;
  };
}

type ContentBlockType = 
  | 'text' | 'heading' | 'image' | 'video' | 'table' | 'list' 
  | 'quote' | 'code' | 'separator' | 'button' | 'embed'
  | 'columns' | 'accordion' | 'tabs' | 'card' | 'callout'
  | 'chart' | 'map' | 'calendar' | 'form' | 'gallery';

interface BlockTemplate {
  id: string;
  name: string;
  type: ContentBlockType;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'media' | 'layout' | 'interactive' | 'advanced';
  description: string;
  defaultData: any;
  defaultStyle?: React.CSSProperties;
  previewComponent?: React.ComponentType<{ data: any }>;
}

interface SmartContentBlocksProps {
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
  onBlockSelect: (block: ContentBlock) => void;
  selectedBlockId?: string;
  editorRef: React.RefObject<HTMLDivElement>;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const BLOCK_TEMPLATES: BlockTemplate[] = [
  // Basic Content
  {
    id: 'text',
    name: 'Text Block',
    type: 'text',
    icon: Type,
    category: 'basic',
    description: 'Rich text paragraph with formatting options',
    defaultData: { content: 'Enter your text here...', formatting: {} }
  },
  {
    id: 'heading',
    name: 'Heading',
    type: 'heading',
    icon: Type,
    category: 'basic',
    description: 'Section heading (H1-H6)',
    defaultData: { content: 'Heading Text', level: 2 }
  },
  {
    id: 'list',
    name: 'List',
    type: 'list',
    icon: List,
    category: 'basic',
    description: 'Bulleted or numbered list',
    defaultData: { 
      items: ['List item 1', 'List item 2', 'List item 3'], 
      ordered: false,
      style: 'default'
    }
  },
  {
    id: 'quote',
    name: 'Quote',
    type: 'quote',
    icon: Quote,
    category: 'basic',
    description: 'Blockquote with optional attribution',
    defaultData: { 
      content: 'Insert your quote here', 
      author: '', 
      source: '',
      style: 'default'
    }
  },

  // Media Blocks
  {
    id: 'image',
    name: 'Image',
    type: 'image',
    icon: Image,
    category: 'media',
    description: 'Image with caption and styling options',
    defaultData: { 
      src: '', 
      alt: '', 
      caption: '', 
      alignment: 'center',
      size: 'medium'
    }
  },
  {
    id: 'video',
    name: 'Video',
    type: 'video',
    icon: Video,
    category: 'media',
    description: 'Video embed or upload',
    defaultData: { 
      src: '', 
      poster: '', 
      controls: true, 
      autoplay: false,
      caption: ''
    }
  },
  {
    id: 'gallery',
    name: 'Gallery',
    type: 'gallery',
    icon: Image,
    category: 'media',
    description: 'Image gallery with lightbox',
    defaultData: { 
      images: [], 
      layout: 'grid', 
      columns: 3,
      spacing: 'medium'
    }
  },

  // Layout Blocks
  {
    id: 'columns',
    name: 'Columns',
    type: 'columns',
    icon: Columns,
    category: 'layout',
    description: 'Multi-column layout container',
    defaultData: { 
      columnCount: 2, 
      gap: 'medium',
      alignment: 'top'
    }
  },
  {
    id: 'card',
    name: 'Card',
    type: 'card',
    icon: Layout,
    category: 'layout',
    description: 'Card container with header and content',
    defaultData: { 
      title: '', 
      content: '', 
      image: '', 
      actions: [],
      style: 'default'
    }
  },
  {
    id: 'accordion',
    name: 'Accordion',
    type: 'accordion',
    icon: ChevronDown,
    category: 'layout',
    description: 'Collapsible content sections',
    defaultData: { 
      sections: [
        { title: 'Section 1', content: 'Content 1', isOpen: false }
      ]
    }
  },

  // Interactive Blocks
  {
    id: 'table',
    name: 'Table',
    type: 'table',
    icon: Table,
    category: 'interactive',
    description: 'Interactive data table',
    defaultData: { 
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
        ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
      ],
      sortable: true,
      filterable: false
    }
  },
  {
    id: 'code',
    name: 'Code Block',
    type: 'code',
    icon: Code,
    category: 'interactive',
    description: 'Syntax-highlighted code',
    defaultData: { 
      content: '// Your code here\nconsole.log("Hello, World!");', 
      language: 'javascript',
      theme: 'dark',
      showLineNumbers: true
    }
  },

  // Advanced Blocks
  {
    id: 'chart',
    name: 'Chart',
    type: 'chart',
    icon: BarChart,
    category: 'advanced',
    description: 'Data visualization chart',
    defaultData: { 
      type: 'bar', 
      data: [], 
      options: {},
      title: ''
    }
  },
  {
    id: 'map',
    name: 'Map',
    type: 'map',
    icon: Map,
    category: 'advanced',
    description: 'Interactive map with markers',
    defaultData: { 
      center: { lat: 0, lng: 0 }, 
      zoom: 10, 
      markers: []
    }
  },
  {
    id: 'calendar',
    name: 'Calendar',
    type: 'calendar',
    icon: Calendar,
    category: 'advanced',
    description: 'Calendar widget with events',
    defaultData: { 
      view: 'month', 
      events: [],
      theme: 'default'
    }
  }
];

export const SmartContentBlocks: React.FC<SmartContentBlocksProps> = ({
  blocks,
  onBlocksChange,
  onBlockSelect,
  selectedBlockId,
  editorRef,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { theme } = useTheme();
  
  // State management
  const [draggedBlock, setDraggedBlock] = useState<ContentBlock | null>(null);
  const [draggedTemplate, setDraggedTemplate] = useState<BlockTemplate | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ x: number; y: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplatePreview, setShowTemplatePreview] = useState<string | null>(null);
  
  // Refs
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Filter templates
  const filteredTemplates = BLOCK_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All Blocks', count: BLOCK_TEMPLATES.length },
    { id: 'basic', name: 'Basic', count: BLOCK_TEMPLATES.filter(t => t.category === 'basic').length },
    { id: 'media', name: 'Media', count: BLOCK_TEMPLATES.filter(t => t.category === 'media').length },
    { id: 'layout', name: 'Layout', count: BLOCK_TEMPLATES.filter(t => t.category === 'layout').length },
    { id: 'interactive', name: 'Interactive', count: BLOCK_TEMPLATES.filter(t => t.category === 'interactive').length },
    { id: 'advanced', name: 'Advanced', count: BLOCK_TEMPLATES.filter(t => t.category === 'advanced').length }
  ];

  // Create new block from template
  const createBlock = useCallback((template: BlockTemplate, position: { x: number; y: number }): ContentBlock => {
    return {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      data: { ...template.defaultData },
      position,
      size: { width: 300, height: 200 },
      style: template.defaultStyle || {},
      metadata: {
        created: new Date(),
        updated: new Date(),
        version: 1
      }
    };
  }, []);

  // Handle template drag start
  const handleTemplateDragStart = useCallback((template: BlockTemplate, e: React.DragEvent) => {
    setDraggedTemplate(template);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', template.id);
  }, []);

  // Handle block drag start
  const handleBlockDragStart = useCallback((block: ContentBlock, e: React.DragEvent) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', block.id);
  }, []);

  // Handle drop on editor
  const handleEditorDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!editorRef.current) return;
    
    const editorRect = editorRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - editorRect.left,
      y: e.clientY - editorRect.top
    };

    if (draggedTemplate) {
      // Create new block from template
      const newBlock = createBlock(draggedTemplate, position);
      const updatedBlocks = [...blocks, newBlock];
      onBlocksChange(updatedBlocks);
      onBlockSelect(newBlock);
    } else if (draggedBlock) {
      // Move existing block
      const updatedBlocks = blocks.map(block =>
        block.id === draggedBlock.id
          ? { ...block, position }
          : block
      );
      onBlocksChange(updatedBlocks);
    }

    setDraggedTemplate(null);
    setDraggedBlock(null);
    setDropIndicator(null);
  }, [blocks, draggedTemplate, draggedBlock, createBlock, onBlocksChange, onBlockSelect, editorRef]);

  // Handle drag over editor
  const handleEditorDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedTemplate ? 'copy' : 'move';
    
    if (editorRef.current) {
      const editorRect = editorRef.current.getBoundingClientRect();
      setDropIndicator({
        x: e.clientX - editorRect.left,
        y: e.clientY - editorRect.top
      });
    }
  }, [draggedTemplate, editorRef]);

  // Setup editor drop listeners
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.addEventListener('drop', handleEditorDrop as any);
    editor.addEventListener('dragover', handleEditorDragOver as any);
    
    return () => {
      editor.removeEventListener('drop', handleEditorDrop as any);
      editor.removeEventListener('dragover', handleEditorDragOver as any);
    };
  }, [handleEditorDrop, handleEditorDragOver]);

  // Duplicate block
  const duplicateBlock = useCallback((block: ContentBlock) => {
    const newBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: block.position.x + 20,
        y: block.position.y + 20
      },
      metadata: {
        ...block.metadata,
        created: new Date(),
        updated: new Date(),
        version: 1
      }
    };
    onBlocksChange([...blocks, newBlock]);
  }, [blocks, onBlocksChange]);

  // Delete block
  const deleteBlock = useCallback((blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  if (isCollapsed) {
    return (
      <div 
        className={`border rounded-lg p-2 ${className}`}
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full p-2 rounded transition-colors"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Plus className="w-5 h-5" />
          <span className="ml-2 text-sm">Blocks</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`border rounded-lg overflow-hidden ${className}`}
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary,
        maxHeight: '80vh'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <div className="flex items-center space-x-2">
          <Plus className="w-5 h-5" style={{ color: theme.colors.semantic.action.primary }} />
          <h3 className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
            Content Blocks
          </h3>
          <span 
            className="px-2 py-1 text-xs rounded"
            style={{ 
              backgroundColor: theme.colors.semantic.action.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            {blocks.length} active
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded transition-colors"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b" style={{ borderColor: theme.colors.semantic.border.secondary }}>
        <input
          type="text"
          placeholder="Search blocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-md"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary,
            color: theme.colors.semantic.text.primary
          }}
        />
      </div>

      {/* Categories */}
      <div 
        className="flex overflow-x-auto p-4 space-x-2 border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category.id ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: selectedCategory === category.id 
                ? theme.colors.semantic.action.primary 
                : theme.colors.semantic.surface.secondary,
              color: selectedCategory === category.id 
                ? theme.colors.semantic.text.inverse 
                : theme.colors.semantic.text.primary
            }}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div 
        ref={templatesRef}
        className="p-4 overflow-y-auto max-h-96"
      >
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              draggable
              onDragStart={(e) => handleTemplateDragStart(template, e)}
              onMouseEnter={() => setShowTemplatePreview(template.id)}
              onMouseLeave={() => setShowTemplatePreview(null)}
              className="p-3 border rounded-lg cursor-move transition-all hover:shadow-md"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: showTemplatePreview === template.id 
                  ? theme.colors.semantic.action.primary
                  : theme.colors.semantic.border.primary
              }}
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="p-2 rounded-md flex-shrink-0"
                  style={{ backgroundColor: theme.colors.semantic.action.secondary }}
                >
                  <template.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate" style={{ color: theme.colors.semantic.text.primary }}>
                    {template.name}
                  </h4>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: theme.colors.semantic.text.secondary }}>
                    {template.description}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ 
                        backgroundColor: theme.colors.semantic.surface.primary,
                        color: theme.colors.semantic.text.secondary
                      }}
                    >
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Blocks List */}
      {blocks.length > 0 && (
        <div>
          <div 
            className="px-4 py-2 border-t font-medium text-sm"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            Active Blocks ({blocks.length})
          </div>
          <div className="max-h-48 overflow-y-auto">
            {blocks.map(block => (
              <div
                key={block.id}
                className={`flex items-center justify-between p-3 border-b cursor-pointer transition-colors ${
                  selectedBlockId === block.id ? 'ring-2 ring-inset' : ''
                }`}
                style={{
                  borderColor: theme.colors.semantic.border.secondary,
                  backgroundColor: selectedBlockId === block.id 
                    ? theme.colors.semantic.action.primary + '10' 
                    : 'transparent'
                }}
                onClick={() => onBlockSelect(block)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div 
                    className="p-1 rounded"
                    style={{ backgroundColor: theme.colors.semantic.action.secondary }}
                  >
                    {(() => {
                      const template = BLOCK_TEMPLATES.find(t => t.type === block.type);
                      const IconComponent = template?.icon || Type;
                      return <IconComponent className="w-3 h-3" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium truncate" style={{ color: theme.colors.semantic.text.primary }}>
                        {BLOCK_TEMPLATES.find(t => t.type === block.type)?.name || block.type}
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
                      {block.position.x}, {block.position.y}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateBlock(block);
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: theme.colors.semantic.text.secondary }}
                    title="Duplicate block"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: theme.colors.semantic.status.error }}
                    title="Delete block"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop Indicator */}
      {dropIndicator && (
        <div
          className="fixed pointer-events-none z-50 w-4 h-4 rounded-full border-2"
          style={{
            left: dropIndicator.x - 8,
            top: dropIndicator.y - 8,
            backgroundColor: theme.colors.semantic.action.primary,
            borderColor: theme.colors.semantic.text.inverse
          }}
        />
      )}
    </div>
  );
};