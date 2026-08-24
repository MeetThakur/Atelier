import { File } from 'expo-file-system';
import type { Item, SavedOutfit } from '../../types';
import type { BackdropOption, CanvasPieceData } from './canvasTypes';

export const BACKDROPS: BackdropOption[] = [
  { id: 'silk', label: 'Silk Cream', sublabel: 'Neutral Warm Canvas', bgLight: '#FAF7F2', bgDark: '#0E0E12', swatch: '#FAF7F2', icon: 'color-wand-outline' },
  { id: 'linen', label: 'Warm Linen', sublabel: 'Natural Organic Weave', bgLight: '#EFE6D8', bgDark: '#201D19', swatch: '#EFE6D8', icon: 'color-filter-outline' },
  { id: 'sage', label: 'French Sage', sublabel: 'Botanical Eucalyptus', bgLight: '#E5EDE7', bgDark: '#13241A', swatch: '#D0E0D4', icon: 'leaf-outline' },
  { id: 'terracotta', label: 'Tuscan Clay', sublabel: 'Sunbaked Adobe Rust', bgLight: '#F3E4DF', bgDark: '#2B1612', swatch: '#E6CEC6', icon: 'flame-outline' },
  { id: 'plum', label: 'Mulberry Velvet', sublabel: 'Parisian Haute Mauve', bgLight: '#F1E6F3', bgDark: '#241427', swatch: '#E0CEE4', icon: 'sparkles-outline' },
  { id: 'azure', label: 'Chambray Sky', sublabel: 'Coastal Frost Azure', bgLight: '#E4EDF5', bgDark: '#13212E', swatch: '#C8DCEE', icon: 'water-outline' },
  { id: 'noir', label: 'Editorial Noir', sublabel: 'High-Contrast Obsidian', bgLight: '#181716', bgDark: '#070708', swatch: '#181716', icon: 'contrast-outline' },
  { id: 'grid', label: 'Drafting Grid', sublabel: 'Architectural Crosshairs', bgLight: '#FAF7F2', bgDark: '#0E0E12', swatch: '#D8D2C5', icon: 'grid-outline' },
];

let instanceSeq = 0;
export const nextInstanceId = (prefix = 'piece'): string => `${prefix}-${++instanceSeq}`;

export const randomRange = (min: number, max: number): number => min + Math.random() * (max - min);

export const pickRandom = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const fileExists = (uri: string): boolean => {
  if (!uri.startsWith('file://')) return true;
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
};

export const resolvePieceImage = (
  piece: SavedOutfit['pieces'][number],
  items: Item[]
): string | null => {
  if (fileExists(piece.image)) return piece.image;
  const live = items.find((i) => i.id === piece.itemId);
  if (live && fileExists(live.image)) return live.image;
  return null;
};

export function generateSmartOutfit(
  items: Item[],
  canvasWidth: number,
  canvasHeight: number
): CanvasPieceData[] {
  if (items.length === 0) return [];

  const tops = items.filter((i) => i.category === 'Tops');
  const bottoms = items.filter((i) => i.category === 'Bottoms');
  const dresses = items.filter((i) => i.category === 'Dresses');
  const shoes = items.filter((i) => i.category === 'Shoes');
  const accessories = items.filter((i) => i.category === 'Accessories');

  const chosenPieces: Item[] = [];

  // Decide outfit strategy: Dress-based vs Top+Bottom based
  const useDress = dresses.length > 0 && (tops.length === 0 || bottoms.length === 0 || Math.random() > 0.5);

  if (useDress) {
    chosenPieces.push(pickRandom(dresses));
  } else {
    if (tops.length > 0) chosenPieces.push(pickRandom(tops));
    if (bottoms.length > 0) chosenPieces.push(pickRandom(bottoms));
  }

  if (shoes.length > 0) chosenPieces.push(pickRandom(shoes));
  if (accessories.length > 0) chosenPieces.push(pickRandom(accessories));

  if (chosenPieces.length === 0) {
    chosenPieces.push(pickRandom(items));
  }

  const cx = canvasWidth / 2 - 90;
  const cy = canvasHeight / 2 - 110;

  return chosenPieces.map((item, idx) => {
    let xOffset = 0;
    let yOffset = 0;
    let scale = 1.0;

    if (item.category === 'Tops') {
      xOffset = randomRange(-30, 20);
      yOffset = -120;
      scale = 1.05;
    } else if (item.category === 'Bottoms') {
      xOffset = randomRange(-20, 30);
      yOffset = 40;
      scale = 1.0;
    } else if (item.category === 'Dresses') {
      xOffset = 0;
      yOffset = -50;
      scale = 1.15;
    } else if (item.category === 'Shoes') {
      xOffset = randomRange(-40, 40);
      yOffset = 180;
      scale = 0.85;
    } else if (item.category === 'Accessories') {
      xOffset = randomRange(70, 110);
      yOffset = randomRange(-130, -30);
      scale = 0.75;
    } else {
      xOffset = randomRange(-50, 50);
      yOffset = randomRange(-60, 60);
    }

    return {
      instanceId: nextInstanceId('smart'),
      item,
      scale,
      zIndex: idx + 1,
      x: Math.max(10, Math.min(canvasWidth - 190, cx + xOffset)),
      y: Math.max(10, Math.min(canvasHeight - 230, cy + yOffset)),
    };
  });
}
