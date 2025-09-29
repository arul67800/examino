/**
 * Development-only diagnostic component for debugging data fetching issues
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_HIERARCHY_ITEMS } from '@/lib/graphql/hierarchy.graphql';
import { checkApiHealth } from '@/utils/api-health-check';

interface ApiDiagnosticsProps {
  isVisible?: boolean;
}

interface HierarchyData {
  hierarchyItems?: Array<{
    id: string;
    name: string;
    level: number;
    type: string;
  }>;
}

export default function ApiDiagnostics({ isVisible = process.env.NODE_ENV === 'development' }: ApiDiagnosticsProps) {
  const [apiHealth, setApiHealth] = useState<{
    isReachable: boolean;
    error?: string;
    responseTime?: number;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const { data, loading, error } = useQuery<HierarchyData>(GET_HIERARCHY_ITEMS, {
    errorPolicy: 'all',
  });

  useEffect(() => {
    checkApiHealth().then(setApiHealth);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border rounded-lg shadow-lg max-w-sm">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">API Diagnostics</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>
      
      <div className="p-3 space-y-2 text-xs">
        {/* API Health */}
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${apiHealth?.isReachable ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="font-medium">API Server:</span>
          <span className={apiHealth?.isReachable ? 'text-green-600' : 'text-red-600'}>
            {apiHealth?.isReachable ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* GraphQL Query Status */}
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${!loading && !error && data ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
          <span className="font-medium">GraphQL Query:</span>
          <span className={!loading && !error && data ? 'text-green-600' : error ? 'text-red-600' : 'text-yellow-600'}>
            {loading ? 'Loading...' : error ? 'Failed' : data ? 'Success' : 'Pending'}
          </span>
        </div>

        {/* Data Count */}
        {data && (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-medium">Data Items:</span>
            <span className="text-blue-600">
              {data.hierarchyItems?.length || 0}
            </span>
          </div>
        )}

        {showDetails && (
          <div className="mt-3 pt-2 border-t space-y-2">
            <div>
              <div className="font-medium text-gray-700">API URL:</div>
              <div className="text-gray-500 text-xs font-mono break-all">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/graphql'}
              </div>
            </div>
            
            {apiHealth && !apiHealth.isReachable && (
              <div>
                <div className="font-medium text-red-700">Error:</div>
                <div className="text-red-600 text-xs">{apiHealth.error}</div>
              </div>
            )}
            
            {error && (
              <div>
                <div className="font-medium text-red-700">GraphQL Error:</div>
                <div className="text-red-600 text-xs">{error.message}</div>
              </div>
            )}
            
            {data && data.hierarchyItems && data.hierarchyItems.length > 0 && (
              <div>
                <div className="font-medium text-green-700">Sample Data:</div>
                <div className="text-green-600 text-xs font-mono bg-gray-50 p-2 rounded max-h-20 overflow-auto">
                  {JSON.stringify(data.hierarchyItems[0], null, 1)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}