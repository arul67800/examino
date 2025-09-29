// Types for the modular ImageOverlay system

export type TextWrapMode = 'inline' | 'square' | 'topBottom' | 'behindText' | 'inFrontOfText';
export type TextAlignment = 'left' | 'right' | 'center' | 'inline';

export interface TextWrapSettings {
  mode: TextWrapMode;
  alignment: TextAlignment;
  distanceFromText: number;
}

export interface ImageOverlayProps {
  editorElement: HTMLElement;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

// DragState moved to hooks.ts to avoid circular dependencies

export interface InsertionPoint {
  element: Element;
  insertBefore: boolean;
  isLineBoundary?: boolean;
}

export interface ImageOverlayState {
  selectedImage: HTMLImageElement | null;
  updateTrigger: number;
  showWrapOptions: boolean;
  wrapSettings: TextWrapSettings;
}