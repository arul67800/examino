'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/theme';
import {
  Users,
  Eye,
  Edit,
  Save,
  Clock,
  Bell,
  Wifi,
  WifiOff,
  Circle,
  Activity,
  Mouse,
  Keyboard,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Author } from '../../types';

interface CollaborationSession {
  id: string;
  articleId: string;
  isActive: boolean;
  participants: CollaborationParticipant[];
  lastActivity: Date;
  conflictResolution?: 'last-writer-wins' | 'collaborative-merge' | 'manual-review';
}

interface CollaborationParticipant {
  user: Author;
  status: 'active' | 'idle' | 'away' | 'offline';
  lastSeen: Date;
  currentSection?: string; // which section they're viewing/editing
  cursorPosition?: { line: number; column: number };
  isTyping: boolean;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canView: boolean;
  };
  connectionQuality: 'good' | 'poor' | 'disconnected';
}

interface DocumentChange {
  id: string;
  timestamp: Date;
  authorId: string;
  type: 'insert' | 'delete' | 'update' | 'format';
  section: string;
  position: { start: number; end: number };
  content: string;
  previousContent?: string;
  isConflict: boolean;
  isResolved: boolean;
}

interface RealtimeCollaborationProps {
  session: CollaborationSession;
  currentUser: Author;
  onSessionUpdate: (session: CollaborationSession) => void;
  documentChanges: DocumentChange[];
  onDocumentChanges: (changes: DocumentChange[]) => void;
  enableConflictDetection?: boolean;
  enablePresenceIndicators?: boolean;
  enableRealtimeSync?: boolean;
}

interface PresenceIndicatorProps {
  participant: CollaborationParticipant;
  position: { x: number; y: number };
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ participant, position }) => {
  const { theme } = useTheme();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'away': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div 
      className="absolute pointer-events-none z-50"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div 
        className="flex items-center space-x-2 px-2 py-1 rounded-lg shadow-lg text-xs"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `2px solid ${getStatusColor(participant.status)}`
        }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getStatusColor(participant.status) }}
        />
        <span style={{ color: theme.colors.semantic.text.primary }}>
          {participant.user.name}
        </span>
        {participant.isTyping && (
          <Keyboard className="w-3 h-3" style={{ color: theme.colors.semantic.text.secondary }} />
        )}
      </div>
      
      {/* Cursor indicator */}
      <div 
        className="w-0.5 h-4 mt-1 mx-auto"
        style={{ backgroundColor: getStatusColor(participant.status) }}
      />
    </div>
  );
};

const ConflictResolutionModal: React.FC<{
  conflicts: DocumentChange[];
  onResolve: (resolutions: { changeId: string; action: 'accept' | 'reject' }[]) => void;
  onClose: () => void;
}> = ({ conflicts, onResolve, onClose }) => {
  const { theme } = useTheme();
  const [resolutions, setResolutions] = useState<{ [changeId: string]: 'accept' | 'reject' }>({});

  const handleResolve = () => {
    const resolutionArray = conflicts.map(conflict => ({
      changeId: conflict.id,
      action: resolutions[conflict.id] || 'accept'
    }));
    onResolve(resolutionArray);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <div 
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <div>
              <h3 
                className="text-xl font-semibold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Resolve Conflicts
              </h3>
              <p 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                {conflicts.length} conflicting changes detected
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {conflicts.map((conflict, index) => {
              const author = conflict.authorId; // In real app, you'd look up the author
              
              return (
                <div 
                  key={conflict.id}
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary 
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        Conflict #{index + 1} in {conflict.section}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.secondary }}
                      >
                        by {author} • {conflict.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setResolutions(prev => ({ ...prev, [conflict.id]: 'accept' }))}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          resolutions[conflict.id] === 'accept' ? 'bg-green-500 text-white' : 'bg-gray-100'
                        }`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setResolutions(prev => ({ ...prev, [conflict.id]: 'reject' }))}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          resolutions[conflict.id] === 'reject' ? 'bg-red-500 text-white' : 'bg-gray-100'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {conflict.previousContent && (
                      <div>
                        <div 
                          className="text-xs font-medium mb-1"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          Previous:
                        </div>
                        <div 
                          className="p-2 rounded bg-red-50 text-sm"
                          style={{ color: '#dc2626' }}
                        >
                          {conflict.previousContent}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div 
                        className="text-xs font-medium mb-1"
                        style={{ color: theme.colors.semantic.text.secondary }}
                      >
                        New change:
                      </div>
                      <div 
                        className="p-2 rounded bg-green-50 text-sm"
                        style={{ color: '#059669' }}
                      >
                        {conflict.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div 
          className="p-6 border-t flex items-center justify-between"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Choose how to handle each conflict
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              className="px-4 py-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse
              }}
            >
              Apply Resolutions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  session,
  currentUser,
  onSessionUpdate,
  documentChanges,
  onDocumentChanges,
  enableConflictDetection = true,
  enablePresenceIndicators = true,
  enableRealtimeSync = true
}) => {
  const { theme } = useTheme();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [showConflicts, setShowConflicts] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [cursorPositions, setCursorPositions] = useState<{ [userId: string]: { x: number; y: number } }>({});
  const wsRef = useRef<WebSocket | null>(null);

  // Simulate real-time connection (replace with actual WebSocket implementation)
  useEffect(() => {
    if (enableRealtimeSync) {
      // Simulate connection establishment
      setConnectionStatus('connecting');
      
      const timer = setTimeout(() => {
        setConnectionStatus('connected');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [enableRealtimeSync]);

  // Handle conflict detection
  const conflicts = documentChanges.filter(change => change.isConflict && !change.isResolved);
  
  useEffect(() => {
    if (enableConflictDetection && conflicts.length > 0) {
      setShowConflicts(true);
    }
  }, [conflicts.length, enableConflictDetection]);

  // Simulate typing indicators and presence
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Simulate random typing activity
    const interval = setInterval(() => {
      const activeParticipants = session.participants.filter(p => p.status === 'active' && p.user.id !== currentUser.id);
      if (activeParticipants.length > 0) {
        const randomUser = activeParticipants[Math.floor(Math.random() * activeParticipants.length)];
        
        if (Math.random() > 0.7) { // 30% chance to start/stop typing
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(randomUser.user.id)) {
              newSet.delete(randomUser.user.id);
            } else {
              newSet.add(randomUser.user.id);
            }
            return newSet;
          });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [session.participants, currentUser.id]);

  const handleConflictResolve = (resolutions: { changeId: string; action: 'accept' | 'reject' }[]) => {
    const updatedChanges = documentChanges.map(change => {
      const resolution = resolutions.find(r => r.changeId === change.id);
      if (resolution) {
        return {
          ...change,
          isResolved: true,
          // In real implementation, apply or reject the change based on resolution.action
        };
      }
      return change;
    });
    
    onDocumentChanges(updatedChanges);
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Collaboration Status Bar */}
      <div 
        className="flex items-center justify-between p-3 rounded-lg border"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.primary 
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span 
              className="text-sm capitalize"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {connectionStatus}
            </span>
          </div>

          {/* Sync Status */}
          <div className="flex items-center space-x-2">
            {getSyncIcon()}
            <span 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {syncStatus === 'synced' ? 'All changes saved' : 
               syncStatus === 'syncing' ? 'Saving...' : 'Sync error'}
            </span>
          </div>

          {/* Conflict Indicator */}
          {conflicts.length > 0 && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <button
                onClick={() => setShowConflicts(true)}
                className="text-sm text-orange-600 hover:underline"
              >
                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} to resolve
              </button>
            </div>
          )}
        </div>

        {/* Last Activity */}
        <div className="flex items-center space-x-2 text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
          <Clock className="w-4 h-4" />
          <span>
            Last activity: {session.lastActivity.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Active Participants */}
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary 
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 
            className="font-medium flex items-center space-x-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            <Users className="w-4 h-4" />
            <span>Active Collaborators ({session.participants.length})</span>
          </h4>
        </div>

        <div className="space-y-2">
          {session.participants.map((participant) => (
            <div 
              key={participant.user.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: theme.colors.semantic.action.primary }}
                  >
                    {participant.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div 
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`}
                  />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="font-medium text-sm"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {participant.user.name}
                      {participant.user.id === currentUser.id && ' (You)'}
                    </span>
                    
                    {typingUsers.has(participant.user.id) && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Keyboard className="w-3 h-3" />
                        <span>typing...</span>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="text-xs flex items-center space-x-2"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    <span className="capitalize">{participant.status}</span>
                    {participant.currentSection && (
                      <>
                        <span>•</span>
                        <span>Editing: {participant.currentSection}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Permission Icons */}
                <div className="flex items-center space-x-1">
                  {participant.permissions.canEdit && (
                    <div title="Can edit">
                      <Edit className="w-3 h-3 text-blue-500" />
                    </div>
                  )}
                  {participant.permissions.canComment && (
                    <div title="Can comment">
                      <Bell className="w-3 h-3 text-green-500" />
                    </div>
                  )}
                  {!participant.permissions.canEdit && participant.permissions.canView && (
                    <div title="View only">
                      <Eye className="w-3 h-3 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Connection Quality */}
                <div className="flex items-center space-x-1">
                  <Circle 
                    className={`w-2 h-2 ${
                      participant.connectionQuality === 'good' ? 'text-green-500' :
                      participant.connectionQuality === 'poor' ? 'text-yellow-500' : 'text-red-500'
                    }`} 
                    fill="currentColor"
                  />
                </div>

                <span 
                  className="text-xs"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {participant.lastSeen.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary 
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 
            className="font-medium flex items-center space-x-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            <Activity className="w-4 h-4" />
            <span>Recent Activity</span>
          </h4>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {documentChanges
            .filter(change => !change.isConflict)
            .slice(0, 10)
            .map((change) => (
              <div 
                key={change.id}
                className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50"
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-xs mt-0.5"
                  style={{ backgroundColor: theme.colors.semantic.action.primary }}
                >
                  {change.authorId.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    <span className="font-medium">{change.authorId}</span>
                    {' '}
                    {change.type === 'insert' && 'added content to'}
                    {change.type === 'delete' && 'removed content from'}
                    {change.type === 'update' && 'updated'}
                    {change.type === 'format' && 'formatted'}
                    {' '}
                    <span className="font-medium">{change.section}</span>
                  </div>
                  
                  <div 
                    className="text-xs mt-1"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {change.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {change.type === 'insert' && <FileText className="w-4 h-4 text-green-500" />}
                {change.type === 'delete' && <XCircle className="w-4 h-4 text-red-500" />}
                {change.type === 'update' && <Edit className="w-4 h-4 text-blue-500" />}
                {change.type === 'format' && <Save className="w-4 h-4 text-purple-500" />}
              </div>
            ))}

          {documentChanges.length === 0 && (
            <div 
              className="text-center py-4 text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Presence Indicators */}
      {enablePresenceIndicators && Object.entries(cursorPositions).map(([userId, position]) => {
        const participant = session.participants.find(p => p.user.id === userId);
        if (!participant || participant.user.id === currentUser.id) return null;
        
        return (
          <PresenceIndicator
            key={userId}
            participant={participant}
            position={position}
          />
        );
      })}

      {/* Conflict Resolution Modal */}
      {showConflicts && conflicts.length > 0 && (
        <ConflictResolutionModal
          conflicts={conflicts}
          onResolve={handleConflictResolve}
          onClose={() => setShowConflicts(false)}
        />
      )}
    </div>
  );
};