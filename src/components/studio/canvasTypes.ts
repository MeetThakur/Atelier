import type { Item } from '../../types';
import type { Ionicons } from '@expo/vector-icons';

export type CanvasBackdrop =
  | 'silk'
  | 'linen'
  | 'sage'
  | 'terracotta'
  | 'plum'
  | 'azure'
  | 'noir'
  | 'grid';

export type BackdropOption = {
  id: CanvasBackdrop;
  label: string;
  sublabel: string;
  bgLight: string;
  bgDark: string;
  swatch: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type CanvasPieceData = {
  instanceId: string;
  item: Item;
  scale: number;
  zIndex: number;
  x: number;
  y: number;
};
