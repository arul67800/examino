'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { HierarchyItemActions, MCQViewIcons, getTypeByLevel } from '@/components/admin/hierarchy';
import { InlineMCQEditor, ModalMCQEditor, MCQData } from '@/components/admin/question-bank-manager/mcq';

export default function MCQEditorDemoPage() {
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEditor, setCurrentEditor] = useState<'none' | 'inline' | 'modal'>('none');

  // Sample hierarchy item
  const sampleItem = {
    id: 'topic-1',
    name: 'Heat Transfer',
    level: 4,
    color: theme.colors.semantic.status.info,
    children: []
  };

  const hierarchyContext = {
    subject: 'Physics',
    chapter: 'Thermodynamics',
    topic: 'Heat Transfer',
    subtopic: 'Conduction'
  };

  const handleSaveMCQ = (mcqData: MCQData) => {
    console.log('MCQ Saved:', mcqData);
    alert(`MCQ saved successfully!\nType: ${mcqData.type}\nQuestion: ${mcqData.question.substring(0, 50)}...`);
    setCurrentEditor('none');
    setModalOpen(false);
  };

  const handleMCQClick = (e: React.MouseEvent, viewMode: 'inline' | 'modal' | 'page') => {
    console.log('MCQ Click:', viewMode);
    
    switch (viewMode) {
      case 'inline':
        setCurrentEditor('inline');
        break;
      case 'modal':
        setModalOpen(true);
        break;
      case 'page':
        // Already handled by the component's router navigation
        break;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '20' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div 
          className="rounded-xl p-6 border-2 text-center"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.semantic.status.success + '20' }}
          >
            <MCQViewIcons.Edit size={32} color={theme.colors.semantic.status.success} />
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🎯 MCQ Editor System
          </h1>
          <p 
            className="text-lg"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Professional MCQ creation interface with inline, modal, and page editors
          </p>
        </div>

        {/* Demo Controls */}
        <div 
          className="rounded-xl p-6 border-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Hierarchy Item with MCQ Actions
          </h2>
          
          <div 
            className="p-4 rounded-lg border flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary + '30',
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: sampleItem.color + '20',
                  color: sampleItem.color 
                }}
              >
                <MCQViewIcons.Question size={20} />
              </div>
              <div>
                <div 
                  className="font-semibold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {sampleItem.name}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Level {sampleItem.level} - {getTypeByLevel(sampleItem.level)}
                </div>
              </div>
            </div>

            <HierarchyItemActions
              item={sampleItem}
              onAddSibling={(e) => console.log('Add sibling')}
              onEdit={(e) => console.log('Edit item')}
              getTypeByLevel={getTypeByLevel}
              mcqEditView="page" // This will navigate to /admin/dashboard/question-bank-manager/mcq/[id]
              onMCQClick={handleMCQClick}
              showDeleteButton={false}
            />
          </div>
        </div>

        {/* Editor Mode Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button
            onClick={() => setCurrentEditor('inline')}
            className="p-4 rounded-xl border-2 text-center hover:shadow-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: currentEditor === 'inline' 
                ? theme.colors.semantic.status.success + '20'
                : theme.colors.semantic.surface.primary,
              borderColor: currentEditor === 'inline'
                ? theme.colors.semantic.status.success + '40'
                : theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.success + '20' }}
            >
              <MCQViewIcons.Inline size={24} color={theme.colors.semantic.status.success} />
            </div>
            <h3 
              className="font-semibold mb-1"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Inline Editor
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Edit MCQs directly in context
            </p>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="p-4 rounded-xl border-2 text-center hover:shadow-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: modalOpen 
                ? theme.colors.semantic.status.info + '20'
                : theme.colors.semantic.surface.primary,
              borderColor: modalOpen
                ? theme.colors.semantic.status.info + '40'
                : theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
            >
              <MCQViewIcons.Modal size={24} color={theme.colors.semantic.status.info} />
            </div>
            <h3 
              className="font-semibold mb-1"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Modal Editor
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Full-featured popup editor
            </p>
          </button>

          <a
            href="/admin/dashboard/question-bank-manager/mcq/demo-question?type=singleChoice"
            target="_blank"
            className="p-4 rounded-xl border-2 text-center hover:shadow-lg transition-all duration-200 hover:scale-105 block"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30',
              textDecoration: 'none'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.warning + '20' }}
            >
              <MCQViewIcons.Page size={24} color={theme.colors.semantic.status.warning} />
            </div>
            <h3 
              className="font-semibold mb-1"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Page Editor
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Dedicated page with all features
            </p>
          </a>
        </div>

        {/* Inline Editor */}
        {currentEditor === 'inline' && (
          <InlineMCQEditor
            onSave={handleSaveMCQ}
            onCancel={() => setCurrentEditor('none')}
            hierarchyContext={hierarchyContext}
            showExpandButton={true}
            onExpand={() => window.open('/admin/dashboard/question-bank-manager/mcq/demo-question?type=singleChoice', '_blank')}
          />
        )}

        {/* Instructions */}
        <div 
          className="rounded-xl p-6 border-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            📋 How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 
                className="font-semibold mb-2 flex items-center space-x-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <MCQViewIcons.Inline size={16} color={theme.colors.semantic.status.success} />
                <span>Inline Editor</span>
              </h3>
              <ul className="space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• Quick editing within hierarchy</li>
                <li>• Collapsible interface</li>
                <li>• Essential fields only</li>
                <li>• Can expand to full page</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-2 flex items-center space-x-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <MCQViewIcons.Modal size={16} color={theme.colors.semantic.status.info} />
                <span>Modal Editor</span>
              </h3>
              <ul className="space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• Popup overlay interface</li>
                <li>• More features than inline</li>
                <li>• Preserves current context</li>
                <li>• Quick save and close</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-2 flex items-center space-x-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <MCQViewIcons.Page size={16} color={theme.colors.semantic.status.warning} />
                <span>Page Editor</span>
              </h3>
              <ul className="space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• Full-featured editor</li>
                <li>• All question types supported</li>
                <li>• Advanced settings</li>
                <li>• Navigation and controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editor */}
      <ModalMCQEditor
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMCQ}
        hierarchyContext={hierarchyContext}
        onExpandToPage={() => {
          setModalOpen(false);
          window.open('/admin/dashboard/question-bank-manager/mcq/demo-question?type=singleChoice', '_blank');
        }}
      />
    </div>
  );
}