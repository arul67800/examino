export { ResizableImage } from './components/ResizableImage';
export { ImageCanvas } from './components/ImageCanvas';
export { useImageInteraction } from './hooks/useImageInteraction';

// Types
export interface ImageElement {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  x: number;
  y: number;
  textWrap: 'none' | 'left' | 'right' | 'both';
  rotation: number;
  zIndex: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}