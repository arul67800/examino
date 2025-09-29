'use client';

import React from 'react';
import DeleteConfirmationModal from './delete-confirmation-modal';

interface CascadeDeleteModalProps {
  isOpen: boolean;
  item: any | null;
  type: 'cascade' | 'promote' | null;
  isLoading: boolean;
  onClose: () => void;
  onCascadeDelete: (item: any) => void;
  onPromoteDelete: (item: any) => void;
  onShowChoices: () => void;
}

export default function CascadeDeleteModal({
  isOpen,
  item,
  type,
  isLoading,
  onClose,
  onCascadeDelete,
  onPromoteDelete,
  onShowChoices
}: CascadeDeleteModalProps) {
  if (!item) return null;

  // Initial cascade warning modal
  if (type === 'cascade') {
    return (
      <DeleteConfirmationModal
        isOpen={isOpen}
        title="Delete Item with Children"
        message={`"${item.name}" has ${item.children?.length || 0} child item${(item.children?.length || 0) > 1 ? 's' : ''}.\n\nWhat would you like to do?`}
        confirmText="Choose Delete Options"
        cancelText="Cancel"
        onConfirm={onShowChoices}
        onClose={onClose}
        isDestructive={false}
      />
    );
  }

  // Choice modal for cascade vs promote
  if (type === 'promote') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Choose Delete Option</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              "{item.name}" has {item.children?.length || 0} child item{(item.children?.length || 0) > 1 ? 's' : ''}. 
              How would you like to proceed?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => onCascadeDelete(item)}
                disabled={isLoading}
                className="w-full p-4 text-left border rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-red-700">Delete Everything (Cascade)</div>
                    <div className="text-sm text-red-600">Delete this item AND all its children permanently</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => onPromoteDelete(item)}
                disabled={isLoading}
                className="w-full p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">Delete Only This Item</div>
                    <div className="text-sm text-blue-600">Delete this item only (children will be moved up)</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}