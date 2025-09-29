import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { MediaContent } from '../types';

interface QuestionMediaProps {
  media: MediaContent;
  className?: string;
}

export const QuestionMedia: React.FC<QuestionMediaProps> = ({
  media,
  className = ''
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const renderMedia = () => {
    if (hasError) {
      return (
        <div 
          className="flex items-center justify-center p-8 rounded-lg"
          style={{
            backgroundColor: `${theme.colors.semantic.status.error}10`,
            border: `2px dashed ${theme.colors.semantic.status.error}30`
          }}
        >
          <div className="text-center">
            <svg 
              className="w-12 h-12 mx-auto mb-2" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              style={{ color: theme.colors.semantic.status.error }}
            >
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p 
              className="text-sm font-medium"
              style={{ color: theme.colors.semantic.status.error }}
            >
              Failed to load media
            </p>
          </div>
        </div>
      );
    }

    switch (media.type) {
      case 'image':
        return (
          <div className="relative">
            {isLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: theme.colors.semantic.action.primary }}
                />
              </div>
            )}
            <img
              src={media.url}
              alt={media.alt || 'Question image'}
              className="w-full rounded-lg shadow-md"
              onLoad={handleLoad}
              onError={handleError}
              style={{
                maxHeight: '400px',
                objectFit: 'contain',
                backgroundColor: theme.colors.semantic.surface.primary
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            {isLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-lg z-10"
                style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
              >
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: theme.colors.semantic.action.primary }}
                />
              </div>
            )}
            <video
              src={media.url}
              controls
              className="w-full rounded-lg shadow-md"
              onLoadedData={handleLoad}
              onError={handleError}
              style={{
                maxHeight: '400px',
                backgroundColor: theme.colors.semantic.surface.primary
              }}
            >
              Your browser does not support the video tag.
            </video>
            {media.duration && (
              <div 
                className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff'
                }}
              >
                {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div 
            className="p-6 rounded-lg"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              border: `1px solid ${theme.colors.semantic.border.primary}20`
            }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div 
                className="p-3 rounded-full"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.82L6.46 15H4a1 1 0 01-1-1V8a1 1 0 011-1h2.46l1.923-1.82a1 1 0 011.617.82zm2.629 4.924A4 4 0 0114 12s0 1-.706 1.707c-.707.707-1.707.707-1.707.707L10.99 12.99l-.99.99s1 0 1.414-1.414S12 10 12 10s-1.003-.017-1.414 1.414L9.58 10.41l.99-.99L12 10c0-.262.017-.525.08-.783.055-.224.145-.44.276-.639a4.002 4.002 0 00-.344-.578z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p 
                  className="font-medium"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Audio Content
                </p>
                {media.duration && (
                  <p 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Duration: {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
            <audio
              src={media.url}
              controls
              className="w-full"
              onLoadedData={handleLoad}
              onError={handleError}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'document':
        return (
          <div 
            className="p-6 rounded-lg border-2 border-dashed"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: `${theme.colors.semantic.border.primary}40`
            }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="p-3 rounded-full"
                style={{
                  backgroundColor: theme.colors.semantic.action.secondary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p 
                  className="font-medium mb-1"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Document Attachment
                </p>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.colors.semantic.action.primary }}
                >
                  View Document →
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      {renderMedia()}
      {media.caption && (
        <p 
          className="text-sm text-center mt-2 italic"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          {media.caption}
        </p>
      )}
    </div>
  );
};