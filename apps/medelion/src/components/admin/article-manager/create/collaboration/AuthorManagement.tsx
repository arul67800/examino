'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import {
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Edit,
  Eye,
  Clock,
  Mail,
  Bell,
  Settings,
  X,
  Check,
  AlertCircle,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Author, CollaboratorPermissions, CollaboratorPermission } from '../../types';

interface AuthorManagementProps {
  primaryAuthor: Author;
  onPrimaryAuthorChange: (author: Author) => void;
  coAuthors: Author[];
  onCoAuthorsChange: (authors: Author[]) => void;
  collaborators: Author[];
  onCollaboratorsChange: (collaborators: Author[]) => void;
  permissions: CollaboratorPermissions;
  onPermissionsChange: (permissions: CollaboratorPermissions) => void;
}

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: 'coAuthor' | 'collaborator', permissions: string[]) => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, onInvite }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'coAuthor' | 'collaborator'>('collaborator');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);
  const [message, setMessage] = useState('');

  const availablePermissions = [
    { id: 'read', label: 'View article', description: 'Can view the article content' },
    { id: 'comment', label: 'Add comments', description: 'Can add comments and suggestions' },
    { id: 'edit', label: 'Edit content', description: 'Can edit article content' },
    { id: 'media', label: 'Manage media', description: 'Can upload and manage media files' },
    { id: 'publish', label: 'Publish article', description: 'Can publish or unpublish the article' }
  ];

  const handleInvite = () => {
    if (email.trim()) {
      onInvite(email.trim(), role, selectedPermissions);
      setEmail('');
      setRole('collaborator');
      setSelectedPermissions(['read']);
      setMessage('');
      onClose();
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <div 
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          <h3 
            className="text-xl font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Invite Collaborator
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:opacity-70"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Email Input */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborator@example.com"
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Role
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="role"
                  value="coAuthor"
                  checked={role === 'coAuthor'}
                  onChange={(e) => setRole(e.target.value as 'coAuthor')}
                  className="text-blue-600"
                />
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Co-Author
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Full editing rights and appears as author
                  </div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="role"
                  value="collaborator"
                  checked={role === 'collaborator'}
                  onChange={(e) => setRole(e.target.value as 'collaborator')}
                  className="text-blue-600"
                />
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Collaborator
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Custom permissions, not listed as author
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Permissions */}
          {role === 'collaborator' && (
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Permissions
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <label 
                    key={permission.id}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <div 
                        className="font-medium text-sm"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {permission.label}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: theme.colors.semantic.text.secondary }}
                      >
                        {permission.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Personal Message */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={!email.trim()}
              className="flex-1 px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse
              }}
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuthorManagement: React.FC<AuthorManagementProps> = ({
  primaryAuthor,
  onPrimaryAuthorChange,
  coAuthors,
  onCoAuthorsChange,
  collaborators,
  onCollaboratorsChange,
  permissions,
  onPermissionsChange
}) => {
  const { theme } = useTheme();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'coAuthor' | 'collaborator'>('all');
  const [activeTab, setActiveTab] = useState<'authors' | 'collaborators' | 'permissions'>('authors');

  // Combine all users for search and filtering
  const allUsers = [
    { ...primaryAuthor, role: 'primary' as const },
    ...coAuthors.map(author => ({ ...author, role: 'coAuthor' as const })),
    ...collaborators.map(collab => ({ ...collab, role: 'collaborator' as const }))
  ].filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || 
                         (filterRole === 'coAuthor' && (user.role === 'primary' || user.role === 'coAuthor')) ||
                         (filterRole === 'collaborator' && user.role === 'collaborator');
    return matchesSearch && matchesFilter;
  });

  const handleInvite = (email: string, role: 'coAuthor' | 'collaborator', permissionsList: string[]) => {
    const newUser: Author = {
      id: Date.now().toString(),
      name: email.split('@')[0], // Temporary name until user accepts
      email,
      avatar: '',
      bio: '',
      isVerified: false
    };

    if (role === 'coAuthor') {
      onCoAuthorsChange([...coAuthors, newUser]);
    } else {
      onCollaboratorsChange([...collaborators, newUser]);
      // Update permissions for the new collaborator
      onPermissionsChange({
        ...permissions,
        [newUser.id]: {
          canEdit: permissionsList.includes('edit'),
          canComment: permissionsList.includes('comment'),
          canPublish: permissionsList.includes('publish'),
          canManageMedia: permissionsList.includes('media'),
          canInviteOthers: false
        }
      });
    }
  };

  const removeCoAuthor = (authorId: string) => {
    onCoAuthorsChange(coAuthors.filter(author => author.id !== authorId));
  };

  const removeCollaborator = (collabId: string) => {
    onCollaboratorsChange(collaborators.filter(collab => collab.id !== collabId));
    const newPermissions = { ...permissions };
    delete newPermissions[collabId];
    onPermissionsChange(newPermissions);
  };

  const updateCollaboratorPermissions = (collabId: string, newPermissions: any) => {
    onPermissionsChange({
      ...permissions,
      [collabId]: newPermissions
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'primary':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'coAuthor':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'collaborator':
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'primary':
        return 'Primary Author';
      case 'coAuthor':
        return 'Co-Author';
      case 'collaborator':
        return 'Collaborator';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Manage Authors & Collaborators
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Control who can access and edit this article
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          style={{
            backgroundColor: theme.colors.semantic.action.primary,
            color: theme.colors.semantic.text.inverse
          }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1">
        {[
          { id: 'authors', label: 'Authors', count: coAuthors.length + 1 },
          { id: 'collaborators', label: 'Collaborators', count: collaborators.length },
          { id: 'permissions', label: 'Permissions', count: Object.keys(permissions).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
              activeTab === tab.id ? 'bg-blue-500 text-white' : ''
            }`}
            style={{ 
              backgroundColor: activeTab === tab.id ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.secondary,
              color: activeTab === tab.id ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search 
            className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: theme.colors.semantic.text.secondary }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-3 py-2 rounded-lg border focus:outline-none"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary,
            color: theme.colors.semantic.text.primary
          }}
        >
          <option value="all">All Roles</option>
          <option value="coAuthor">Authors</option>
          <option value="collaborator">Collaborators</option>
        </select>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'authors' && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="p-4 border-b"
            style={{ borderColor: theme.colors.semantic.border.secondary }}
          >
            <h4 
              className="font-medium"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Article Authors
            </h4>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              People who will be credited as authors of this article
            </p>
          </div>

          <div className="p-4 space-y-3">
            {/* Primary Author */}
            <div 
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{ 
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.secondary 
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: theme.colors.semantic.action.primary }}
                >
                  {primaryAuthor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="font-medium"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {primaryAuthor.name}
                    </span>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    {primaryAuthor.isVerified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {primaryAuthor.email} • Primary Author
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Co-Authors */}
            {coAuthors.map((author) => (
              <div 
                key={author.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.secondary 
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: theme.colors.semantic.action.primary }}
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {author.name}
                      </span>
                      <Edit className="w-4 h-4 text-blue-500" />
                      {author.isVerified && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {author.email} • Co-Author
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeCoAuthor(author.id)}
                    className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-500"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {coAuthors.length === 0 && (
              <div 
                className="text-center py-6"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No co-authors added yet</p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-sm mt-2 hover:underline"
                  style={{ color: theme.colors.semantic.action.primary }}
                >
                  Invite a co-author
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'collaborators' && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="p-4 border-b"
            style={{ borderColor: theme.colors.semantic.border.secondary }}
          >
            <h4 
              className="font-medium"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Collaborators
            </h4>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              People with specific permissions to help with this article
            </p>
          </div>

          <div className="p-4 space-y-3">
            {collaborators.map((collaborator) => (
              <div 
                key={collaborator.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.secondary 
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: theme.colors.semantic.action.primary }}
                  >
                    {collaborator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {collaborator.name}
                      </span>
                      <Users className="w-4 h-4 text-green-500" />
                      {collaborator.isVerified && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {collaborator.email} • Collaborator
                    </div>
                    {permissions[collaborator.id] && (
                      <div className="flex items-center space-x-2 mt-1">
                        {permissions[collaborator.id].canEdit && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">Edit</span>
                        )}
                        {permissions[collaborator.id].canComment && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Comment</span>
                        )}
                        {permissions[collaborator.id].canPublish && (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">Publish</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeCollaborator(collaborator.id)}
                    className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-500"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {collaborators.length === 0 && (
              <div 
                className="text-center py-6"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No collaborators added yet</p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-sm mt-2 hover:underline"
                  style={{ color: theme.colors.semantic.action.primary }}
                >
                  Invite a collaborator
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="p-4 border-b"
            style={{ borderColor: theme.colors.semantic.border.secondary }}
          >
            <h4 
              className="font-medium"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Permission Settings
            </h4>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Configure what each collaborator can do
            </p>
          </div>

          <div className="p-4 space-y-4">
            {Object.keys(permissions).length === 0 ? (
              <div 
                className="text-center py-6"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No permission settings configured</p>
                <p className="text-sm">Invite collaborators to manage their permissions</p>
              </div>
            ) : (
              Object.entries(permissions).map(([userId, userPermissions]) => {
                const user = collaborators.find(c => c.id === userId);
                if (!user) return null;

                return (
                  <div 
                    key={userId}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      borderColor: theme.colors.semantic.border.secondary 
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                          style={{ backgroundColor: theme.colors.semantic.action.primary }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div 
                            className="font-medium"
                            style={{ color: theme.colors.semantic.text.primary }}
                          >
                            {user.name}
                          </div>
                          <div 
                            className="text-sm"
                            style={{ color: theme.colors.semantic.text.secondary }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'canEdit', label: 'Edit Content', icon: Edit },
                        { key: 'canComment', label: 'Add Comments', icon: Bell },
                        { key: 'canPublish', label: 'Publish Article', icon: Crown },
                        { key: 'canManageMedia', label: 'Manage Media', icon: Users },
                        { key: 'canInviteOthers', label: 'Invite Others', icon: UserPlus }
                      ].map(({ key, label, icon: Icon }) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(userPermissions as CollaboratorPermission)[key as keyof CollaboratorPermission] || false}
                            onChange={(e) => updateCollaboratorPermissions(userId, {
                              ...(userPermissions as CollaboratorPermission),
                              [key]: e.target.checked
                            })}
                            className="text-blue-600"
                          />
                          <Icon className="w-4 h-4" style={{ color: theme.colors.semantic.text.secondary }} />
                          <span 
                            className="text-sm"
                            style={{ color: theme.colors.semantic.text.primary }}
                          >
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />
    </div>
  );
};