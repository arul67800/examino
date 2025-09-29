export type TextWrapMode = 'inline' | 'square' | 'topBottom' | 'behindText' | 'inFrontOfText' | 'tight' | 'through';

export type TextAlignment = 'left' | 'right' | 'center' | 'inline';

export interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextWrapSettings {
  mode: TextWrapMode;
  alignment: TextAlignment;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  distanceFromText?: number;
}

export interface MovableImageData {
  id: string;
  src: string;
  alt: string;
  position: ImagePosition;
  wrapSettings: TextWrapSettings;
  zIndex: number;
  rotation?: number;
}

export interface TextFlow {
  beforeImage: string;
  afterImage: string;
  wrappedLines: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
  }>;
}