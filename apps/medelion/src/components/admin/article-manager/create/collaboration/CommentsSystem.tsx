'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import {
  MessageCircle,
  Send,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Search,
  Pin,
  Archive
} from 'lucide-react';
import { Author } from '../../types';

interface Comment {
  id: string;
  author: Author;
  content: string;
  timestamp: Date;
  isResolved: boolean;
  isPinned: boolean;
  isArchived: boolean;
  parentId?: string; // For threaded replies
  reactions: {
    likes: string[]; // user IDs
    dislikes: string[]; // user IDs
  };
  mentions: string[]; // user IDs mentioned in the comment
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  editHistory?: {
    timestamp: Date;
    content: string;
    editedBy: string;
  }[];
}

interface CommentsSystemProps {
  comments: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
  currentUser: Author;
  collaborators: Author[];
  canModerate?: boolean;
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowMentions?: boolean;
}

interface CommentComposerProps {
  onSubmit: (content: string, parentId?: string, mentions?: string[]) => void;
  currentUser: Author;
  collaborators: Author[];
  parentId?: string;
  placeholder?: string;
  allowMentions?: boolean;
}

const CommentComposer: React.FC<CommentComposerProps> = ({
  onSubmit,
  currentUser,
  collaborators,
  parentId,
  placeholder = "Add a comment...",
  allowMentions = true
}) => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), parentId, mentions);
      setContent('');
      setMentions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === '@' && allowMentions) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  const insertMention = (user: Author) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const newContent = beforeCursor + `@${user.name} ` + afterCursor;
    
    setContent(newContent);
    setMentions(prev => [...prev, user.id]);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const filteredCollaborators = collaborators.filter(collab =>
    collab.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="relative">
      <div 
        className="border rounded-lg p-3 space-y-3"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.primary 
        }}
      >
        <div className="flex items-start space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
            style={{ backgroundColor: theme.colors.semantic.action.primary }}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={3}
              className="w-full border-none resize-none focus:outline-none bg-transparent"
              style={{ color: theme.colors.semantic.text.primary }}
            />
            
            {mentions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {mentions.map(userId => {
                  const user = collaborators.find(c => c.id === userId);
                  if (!user) return null;
                  return (
                    <span 
                      key={userId}
                      className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600"
                    >
                      @{user.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
            <span>Press ⌘+Enter to send</span>
            {allowMentions && (
              <span>• @ to mention</span>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Mentions Dropdown */}
      {showMentions && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div className="p-3">
            <input
              type="text"
              value={mentionSearch}
              onChange={(e) => setMentionSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary
              }}
              autoFocus
            />
          </div>
          
          <div className="max-h-32 overflow-y-auto">
            {filteredCollaborators.map(collab => (
              <button
                key={collab.id}
                onClick={() => insertMention(collab)}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 text-left"
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-xs"
                  style={{ backgroundColor: theme.colors.semantic.action.primary }}
                >
                  {collab.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {collab.name}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {collab.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CommentItem: React.FC<{
  comment: Comment;
  currentUser: Author;
  collaborators: Author[];
  onReply?: (content: string, parentId: string) => void;
  onReact?: (commentId: string, reaction: 'like' | 'dislike') => void;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  onResolve?: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  onArchive?: (commentId: string) => void;
  canModerate?: boolean;
  allowReplies?: boolean;
  allowReactions?: boolean;
  depth?: number;
}> = ({
  comment,
  currentUser,
  collaborators,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onResolve,
  onPin,
  onArchive,
  canModerate = false,
  allowReplies = true,
  allowReactions = true,
  depth = 0
}) => {
  const { theme } = useTheme();
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);

  const isOwner = comment.author.id === currentUser.id;
  const hasLiked = comment.reactions.likes.includes(currentUser.id);
  const hasDisliked = comment.reactions.dislikes.includes(currentUser.id);

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div 
      className={`${depth > 0 ? 'ml-8 pt-3' : ''}`}
      style={{ 
        borderLeft: depth > 0 ? `2px solid ${theme.colors.semantic.border.secondary}` : 'none',
        paddingLeft: depth > 0 ? '16px' : '0'
      }}
    >
      <div 
        className={`p-4 rounded-lg ${comment.isPinned ? 'ring-2 ring-yellow-200' : ''}`}
        style={{ 
          backgroundColor: comment.isResolved 
            ? theme.colors.semantic.surface.tertiary 
            : theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.primary
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              style={{ backgroundColor: theme.colors.semantic.action.primary }}
            >
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  className="font-medium text-sm"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {comment.author.name}
                </span>
                {comment.isPinned && (
                  <Pin className="w-3 h-3 text-yellow-500" />
                )}
                {comment.isResolved && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
              </div>
              <div 
                className="text-xs flex items-center space-x-2"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(comment.timestamp)}</span>
                {comment.editHistory && comment.editHistory.length > 0 && (
                  <span>• Edited</span>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:opacity-70"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <div 
                className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-32"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.primary 
                }}
              >
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(comment.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 text-left text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                
                {canModerate && (
                  <>
                    <button
                      onClick={() => {
                        onPin?.(comment.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                    >
                      <Pin className="w-3 h-3" />
                      <span>{comment.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onResolve?.(comment.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>{comment.isResolved ? 'Unresolve' : 'Resolve'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onArchive?.(comment.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                    >
                      <Archive className="w-3 h-3" />
                      <span>{comment.isArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                  </>
                )}
                
                <button
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 text-left text-red-600"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.semantic.action.primary,
                    color: theme.colors.semantic.text.inverse
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p 
              className="text-sm whitespace-pre-wrap"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {comment.content}
            </p>
          )}
        </div>

        {/* Attachments */}
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {comment.attachments.map(attachment => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-2 py-1 rounded border text-sm hover:bg-gray-50"
                  style={{ borderColor: theme.colors.semantic.border.primary }}
                >
                  <User className="w-3 h-3" />
                  <span>{attachment.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {allowReactions && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onReact?.(comment.id, 'like')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-sm ${
                    hasLiked ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{comment.reactions.likes.length}</span>
                </button>
                
                <button
                  onClick={() => onReact?.(comment.id, 'dislike')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-sm ${
                    hasDisliked ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>{comment.reactions.dislikes.length}</span>
                </button>
              </div>
            )}

            {allowReplies && depth < 3 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Reply Composer */}
        {showReply && onReply && (
          <div className="mt-3">
            <CommentComposer
              onSubmit={(content) => {
                onReply(content, comment.id);
                setShowReply(false);
              }}
              currentUser={currentUser}
              collaborators={collaborators}
              parentId={comment.id}
              placeholder="Reply to this comment..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const CommentsSystem: React.FC<CommentsSystemProps> = ({
  comments,
  onCommentsChange,
  currentUser,
  collaborators,
  canModerate = false,
  allowReplies = true,
  allowReactions = true,
  allowMentions = true
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'unresolved' | 'pinned' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');

  // Filter and sort comments
  const processedComments = comments
    .filter(comment => {
      const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comment.author.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'unresolved' && !comment.isResolved) ||
        (filterBy === 'pinned' && comment.isPinned) ||
        (filterBy === 'mine' && comment.author.id === currentUser.id);
      
      return matchesSearch && matchesFilter && !comment.isArchived;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'mostLiked':
          return b.reactions.likes.length - a.reactions.likes.length;
        default:
          return 0;
      }
    });

  // Organize comments into threads (parent -> replies)
  const threadedComments = processedComments.filter(comment => !comment.parentId);
  const getReplies = (parentId: string): Comment[] => {
    return processedComments
      .filter(comment => comment.parentId === parentId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const handleAddComment = (content: string, parentId?: string, mentions?: string[]) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: currentUser,
      content,
      timestamp: new Date(),
      isResolved: false,
      isPinned: false,
      isArchived: false,
      parentId,
      reactions: { likes: [], dislikes: [] },
      mentions: mentions || []
    };

    onCommentsChange([...comments, newComment]);
  };

  const handleReact = (commentId: string, reaction: 'like' | 'dislike') => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const likes = comment.reactions.likes.filter(id => id !== currentUser.id);
        const dislikes = comment.reactions.dislikes.filter(id => id !== currentUser.id);

        if (reaction === 'like') {
          likes.push(currentUser.id);
        } else {
          dislikes.push(currentUser.id);
        }

        return {
          ...comment,
          reactions: { likes, dislikes }
        };
      }
      return comment;
    });

    onCommentsChange(updatedComments);
  };

  const handleEdit = (commentId: string, newContent: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const editHistory = comment.editHistory || [];
        editHistory.push({
          timestamp: new Date(),
          content: comment.content,
          editedBy: currentUser.id
        });

        return {
          ...comment,
          content: newContent,
          editHistory
        };
      }
      return comment;
    });

    onCommentsChange(updatedComments);
  };

  const handleDelete = (commentId: string) => {
    const updatedComments = comments.filter(comment => 
      comment.id !== commentId && comment.parentId !== commentId
    );
    onCommentsChange(updatedComments);
  };

  const handleResolve = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isResolved: !comment.isResolved };
      }
      return comment;
    });

    onCommentsChange(updatedComments);
  };

  const handlePin = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isPinned: !comment.isPinned };
      }
      return comment;
    });

    onCommentsChange(updatedComments);
  };

  const handleArchive = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId || comment.parentId === commentId) {
        return { ...comment, isArchived: !comment.isArchived };
      }
      return comment;
    });

    onCommentsChange(updatedComments);
  };

  const commentCounts = {
    total: comments.length,
    unresolved: comments.filter(c => !c.isResolved && !c.isArchived).length,
    pinned: comments.filter(c => c.isPinned && !c.isArchived).length,
    mine: comments.filter(c => c.author.id === currentUser.id && !c.isArchived).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Comments & Discussion
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Collaborate and provide feedback on this article
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <MessageCircle 
              className="w-4 h-4"
              style={{ color: theme.colors.semantic.text.secondary }}
            />
            <span style={{ color: theme.colors.semantic.text.secondary }}>
              {commentCounts.total} comments
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search 
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: theme.colors.semantic.text.secondary }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border focus:outline-none"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="all">All ({commentCounts.total})</option>
              <option value="unresolved">Unresolved ({commentCounts.unresolved})</option>
              <option value="pinned">Pinned ({commentCounts.pinned})</option>
              <option value="mine">Mine ({commentCounts.mine})</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border focus:outline-none"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostLiked">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comment Composer */}
      <CommentComposer
        onSubmit={handleAddComment}
        currentUser={currentUser}
        collaborators={collaborators}
        allowMentions={allowMentions}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {processedComments.length === 0 ? (
          <div 
            className="text-center py-12"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No comments yet</p>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search or filters' : 'Start the conversation by adding the first comment'}
            </p>
          </div>
        ) : (
          threadedComments.map(comment => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                collaborators={collaborators}
                onReply={handleAddComment}
                onReact={handleReact}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResolve={handleResolve}
                onPin={handlePin}
                onArchive={handleArchive}
                canModerate={canModerate}
                allowReplies={allowReplies}
                allowReactions={allowReactions}
              />
              
              {/* Replies */}
              {getReplies(comment.id).map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  collaborators={collaborators}
                  onReply={handleAddComment}
                  onReact={handleReact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onResolve={handleResolve}
                  onPin={handlePin}
                  onArchive={handleArchive}
                  canModerate={canModerate}
                  allowReplies={allowReplies}
                  allowReactions={allowReactions}
                  depth={1}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};