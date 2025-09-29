// Modular ImageOverlay System
// Due to TypeScript module resolution issues in index files with .tsx imports,
// we export the main component path directly for manual imports

export * from './types';
export * from './utils';
export * from './insertion-detection';
export * from './text-wrap';
export * from './positioning';
export * from './drag-handler';
export * from './hooks';
export * from './ui-components';

// For importing the main component, use:
// import { ImageOverlay } from './ImageOverlay';
// This avoids TS module resolution issues with re-exports of .tsx files