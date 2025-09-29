/**
 * Hierarchy Distribution Analytics Component
 * Shows questions distribution divided between Question Bank and Previous Papers
 * with dynamic counts for each hierarchy level
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme';
import { useQuery } from '@apollo/client/react';
import { QuestionBankStats, HierarchyStats } from '../../types';
import { GET_QUESTION_BANK_HIERARCHY_ITEMS } from '@/lib/graphql/question-bank-hierarchy';
import { GET_PREVIOUS_PAPERS_HIERARCHY_ITEMS } from '@/lib/graphql/previous-papers-hierarchy';

// Real hierarchy item type from GraphQL
interface HierarchyItem {
  id: string;
  name: string;
  level: number;
  type: string;
  color?: string;
  order: number;
  parentId?: string;
  questionCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  children?: HierarchyItem[];
}

interface HierarchyDistributionProps {
  stats: QuestionBankStats;
  className?: string;
}

export const HierarchyDistribution: React.FC<HierarchyDistributionProps> = ({
  stats,
  className = ''
}) => {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<'all' | 'question-bank' | 'previous-papers'>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Fetch Question Bank hierarchy
  const { data: questionBankData, loading: qbLoading } = useQuery<{questionBankHierarchyItems: HierarchyItem[]}>(
    GET_QUESTION_BANK_HIERARCHY_ITEMS
  );

  // Fetch Previous Papers hierarchy
  const { data: previousPapersData, loading: ppLoading } = useQuery<{previousPapersHierarchyItems: HierarchyItem[]}>(
    GET_PREVIOUS_PAPERS_HIERARCHY_ITEMS
  );

  const isLoading = qbLoading || ppLoading;

  // Process hierarchy data
  const processedData = useMemo(() => {
    const questionBankItems = questionBankData?.questionBankHierarchyItems || [];
    const previousPapersItems = previousPapersData?.previousPapersHierarchyItems || [];
    
    const totalQuestionBank = questionBankItems.reduce((sum: number, item: HierarchyItem) => sum + item.questionCount, 0);
    const totalPreviousPapers = previousPapersItems.reduce((sum: number, item: HierarchyItem) => sum + item.questionCount, 0);
    const grandTotal = totalQuestionBank + totalPreviousPapers;

    return {
      questionBank: {
        data: questionBankItems,
        total: totalQuestionBank,
        percentage: grandTotal > 0 ? (totalQuestionBank / grandTotal) * 100 : 0
      },
      previousPapers: {
        data: previousPapersItems,
        total: totalPreviousPapers,
        percentage: grandTotal > 0 ? (totalPreviousPapers / grandTotal) * 100 : 0
      },
      grandTotal
    };
  }, [questionBankData, previousPapersData]);

  // Get filtered data based on selected type
  const filteredData = useMemo(() => {
    switch (selectedType) {
      case 'question-bank':
        return processedData.questionBank.data;
      case 'previous-papers':
        return processedData.previousPapers.data;
      default:
        return [...processedData.questionBank.data, ...processedData.previousPapers.data];
    }
  }, [selectedType, processedData]);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Create breadcrumb path for hierarchy node
  const createNodePath = (node: HierarchyItem): string[] => {
    // For now, we'll use the node name and type as basic path
    // This could be enhanced to build actual breadcrumb trail from hierarchy
    return [node.name];
  };

  // Determine if node is question bank or previous papers based on selectedType filter
  const getNodeSourceType = (node: HierarchyItem): 'question-bank' | 'previous-papers' => {
    // If we're filtering by type, use that
    if (selectedType === 'question-bank' || selectedType === 'previous-papers') {
      return selectedType;
    }
    
    // Otherwise, determine from data source
    const isQuestionBank = processedData.questionBank.data.some((item: HierarchyItem) => item.id === node.id);
    return isQuestionBank ? 'question-bank' : 'previous-papers';
  };

  // Render hierarchy tree
  const renderHierarchyNode = (node: HierarchyItem, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indentLevel = depth * 20;
    const nodeSourceType = getNodeSourceType(node);
    const nodePath = createNodePath(node);

    return (
      <div key={node.id} className="hierarchy-node">
        {/* Node Header */}
        <div
          className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-sm cursor-pointer"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            marginLeft: `${indentLevel}px`,
            border: `1px solid ${theme.colors.semantic.border.secondary}`,
            borderLeft: `4px solid ${nodeSourceType === 'question-bank' 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.action.secondary}`
          }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {/* Type Icon */}
            <div
              className="p-1.5 rounded"
              style={{
                backgroundColor: nodeSourceType === 'question-bank' 
                  ? theme.colors.semantic.action.primary + '15' 
                  : theme.colors.semantic.action.secondary + '15'
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  color: nodeSourceType === 'question-bank' 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.action.secondary
                }}
              >
                {nodeSourceType === 'question-bank' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                )}
              </svg>
            </div>

            {/* Node Info */}
            <div className="flex flex-col">
              <span
                className="font-medium text-sm"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {node.name}
              </span>
              <span
                className="text-xs"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Level {node.level} • Type: {node.type} • {nodePath.join(' › ')}
              </span>
            </div>
          </div>

          {/* Question Count Badge */}
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: theme.colors.semantic.action.primary + '15',
              color: theme.colors.semantic.action.primary
            }}
          >
            {node.questionCount.toLocaleString()} questions
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children!.map((child: HierarchyItem) => renderHierarchyNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`rounded-xl p-6 ${className}`}
      style={{ backgroundColor: theme.colors.semantic.surface.primary }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 
            className="text-lg font-semibold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Hierarchy Distribution
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Questions organized by Question Bank and Previous Papers with dynamic counts
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          {(['all', 'question-bank', 'previous-papers'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedType === type ? 'shadow-md' : 'hover:shadow-sm'
              }`}
              style={{
                backgroundColor: selectedType === type 
                  ? theme.colors.semantic.action.primary + '15' 
                  : theme.colors.semantic.surface.secondary,
                color: selectedType === type 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.text.secondary,
                border: `1px solid ${selectedType === type 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.border.secondary}`
              }}
            >
              {type === 'all' ? 'All' : 
               type === 'question-bank' ? 'Question Bank' : 'Previous Papers'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Question Bank Summary */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: `4px solid ${theme.colors.semantic.action.primary}`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Question Bank
              </p>
              <p 
                className="text-2xl font-bold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {processedData.questionBank.total.toLocaleString()}
              </p>
            </div>
            <div 
              className="text-right text-sm"
              style={{ color: theme.colors.semantic.action.primary }}
            >
              {processedData.questionBank.percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Previous Papers Summary */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: `4px solid ${theme.colors.semantic.action.secondary}`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Previous Papers
              </p>
              <p 
                className="text-2xl font-bold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {processedData.previousPapers.total.toLocaleString()}
              </p>
            </div>
            <div 
              className="text-right text-sm"
              style={{ color: theme.colors.semantic.action.secondary }}
            >
              {processedData.previousPapers.percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: `4px solid ${theme.colors.semantic.text.primary}`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Total Questions
              </p>
              <p 
                className="text-2xl font-bold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {processedData.grandTotal.toLocaleString()}
              </p>
            </div>
            <div 
              className="text-right text-sm"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              100%
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div 
            className="text-center py-8"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <div className="animate-spin w-8 h-8 mx-auto mb-4 border-2 border-current border-t-transparent rounded-full"></div>
            <p>Loading hierarchy data...</p>
          </div>
        ) : filteredData.length > 0 ? (
          filteredData.map((node: HierarchyItem) => renderHierarchyNode(node))
        ) : (
          <div 
            className="text-center py-8"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <svg
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
            </svg>
            <p>No hierarchy data available for the selected filter</p>
          </div>
        )}
      </div>

      {/* Expand All / Collapse All */}
      {filteredData.length > 0 && (
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => setExpandedNodes(new Set(filteredData.flatMap((node: HierarchyItem) =>
              node.children ? [node.id, ...node.children.map((child: HierarchyItem) => child.id)] : [node.id]
            )))}
            className="px-3 py-1 text-xs rounded transition-all duration-200"
            style={{
              color: theme.colors.semantic.action.primary,
              backgroundColor: theme.colors.semantic.action.primary + '10'
            }}
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedNodes(new Set())}
            className="px-3 py-1 text-xs rounded transition-all duration-200"
            style={{
              color: theme.colors.semantic.text.secondary,
              backgroundColor: theme.colors.semantic.surface.secondary
            }}
          >
            Collapse All
          </button>
        </div>
      )}
    </div>
  );
};