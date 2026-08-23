import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { Category, Item, SavedOutfit } from '../types';
import { OUTFITS_STORAGE_KEY, categories } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CanvasBackdrop = 'silk' | 'linen' | 'sage' | 'terracotta' | 'plum' | 'azure' | 'noir' | 'grid';

const BACKDROPS: {
  id: CanvasBackdrop;
  label: string;
  sublabel: string;
  bgLight: string;
  bgDark: string;
  swatch: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
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
const nextInstanceId = (prefix: string) => `${prefix}-${++instanceSeq}`;

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

const pickRandom = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const formatToday = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const fileExists = (uri: string): boolean => {
  if (!uri.startsWith('file://')) return true;
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
};

const resolvePieceImage = (
  piece: SavedOutfit['pieces'][number],
  items: Item[]
): string | null => {
  if (fileExists(piece.image)) return piece.image;
  const live = items.find((i) => i.id === piece.itemId);
  if (live && fileExists(live.image)) return live.image;
  return null;
};

function useConst<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

type CanvasPieceData = {
  instanceId: string;
  item: Item;
  scale: number;
  zIndex: number;
  x: number;
  y: number;
};

type DraggablePieceProps = {
  data: CanvasPieceData;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onBringToFront: () => void;
  onUpdateScale: (newScale: number) => void;
  onMoveEnd: (x: number, y: number) => void;
  palette: Palette;
};

function DraggablePiece({
  data,
  isSelected,
  onSelect,
  onRemove,
  onBringToFront,
  onUpdateScale,
  onMoveEnd,
  palette,
}: DraggablePieceProps) {
  const callbacksRef = useRef({ onSelect, onRemove, onBringToFront, onUpdateScale, onMoveEnd });
  callbacksRef.current = { onSelect, onRemove, onBringToFront, onUpdateScale, onMoveEnd };

  const pan = useConst(() => new Animated.ValueXY({ x: data.x, y: data.y }));
  const lastOffset = useRef({ x: data.x, y: data.y });

  const scaleAnim = useConst(() => new Animated.Value(data.scale));
  const currentScaleRef = useRef<number>(data.scale);

  useEffect(() => {
    scaleAnim.setValue(data.scale);
    currentScaleRef.current = data.scale;
  }, [data.scale, scaleAnim]);

  // Two-finger pinch state tracking on the piece
  const initialPinchDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(data.scale);
  const isPinchingRef = useRef<boolean>(false);

  const mainPanResponder = useConst(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) return true;
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) return true;
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: (evt) => {
        callbacksRef.current.onSelect();

        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          isPinchingRef.current = true;
          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          initialPinchDistRef.current = Math.max(dist, 1);
          pinchStartScaleRef.current = currentScaleRef.current;
        } else {
          isPinchingRef.current = false;
          initialPinchDistRef.current = null;
          pan.setOffset({
            x: lastOffset.current.x,
            y: lastOffset.current.y,
          });
          pan.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches && touches.length >= 2) {
          // 2-finger expand and shrink pinch!
          const currentDist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );

          if (!isPinchingRef.current || !initialPinchDistRef.current) {
            isPinchingRef.current = true;
            initialPinchDistRef.current = Math.max(currentDist, 1);
            pinchStartScaleRef.current = currentScaleRef.current;
          } else {
            const factor = currentDist / initialPinchDistRef.current;
            const newScale = Math.min(Math.max(pinchStartScaleRef.current * factor, 0.4), 3.0);
            scaleAnim.setValue(newScale);
            currentScaleRef.current = newScale;
            callbacksRef.current.onUpdateScale(newScale);
          }
        } else if (!isPinchingRef.current) {
          // 1-finger drag
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isPinchingRef.current) {
          callbacksRef.current.onUpdateScale(currentScaleRef.current);
          isPinchingRef.current = false;
          initialPinchDistRef.current = null;
        } else {
          pan.flattenOffset();
          lastOffset.current = {
            x: lastOffset.current.x + gestureState.dx,
            y: lastOffset.current.y + gestureState.dy,
          };
          callbacksRef.current.onMoveEnd(lastOffset.current.x, lastOffset.current.y);
        }
      },
      onPanResponderTerminate: () => {
        if (isPinchingRef.current) {
          callbacksRef.current.onUpdateScale(currentScaleRef.current);
          isPinchingRef.current = false;
          initialPinchDistRef.current = null;
        }
      },
    })
  );

  const baseWidth = 145;
  const baseHeight = 180;

  return (
    <Animated.View
      style={[
        styles.pieceContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scaleAnim },
          ],
          zIndex: data.zIndex,
        },
      ]}
      {...mainPanResponder.panHandlers}
    >
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          onSelect();
        }}
        style={[
          styles.pieceFrame,
          {
            width: baseWidth,
            height: baseHeight,
            borderColor: isSelected ? palette.gold : 'transparent',
            borderWidth: isSelected ? 1.5 : 0,
          },
        ]}
      >
        <Image
          source={{ uri: data.item.image }}
          style={styles.pieceImage}
          resizeMode="contain"
        />

        {/* Selected Controls Bar */}
        {isSelected && (
          <View style={styles.floatingControlsWrap} pointerEvents="box-none">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onBringToFront();
              }}
              hitSlop={14}
              style={[styles.miniControlBtn, { backgroundColor: palette.primary }]}
            >
              <Ionicons name="arrow-up" size={12} color={palette.onPrimary} />
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onRemove();
              }}
              hitSlop={14}
              style={[styles.miniControlBtn, { backgroundColor: palette.error }]}
            >
              <Ionicons name="close" size={12} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

type Props = {
  items: Item[];
};

export function OutfitCanvas({ items }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [canvasPieces, setCanvasPieces] = useState<CanvasPieceData[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [drawerCategory, setDrawerCategory] = useState<Category>('All');
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [lastRemovedPiece, setLastRemovedPiece] = useState<CanvasPieceData | null>(null);
  const [backdrop, setBackdrop] = useState<CanvasBackdrop>('silk');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const canvasRef = useRef<View>(null);
  const nextZIndex = useRef(10);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global 2-finger pinch tracker for the entire canvas board
  const canvasPinchDistRef = useRef<number | null>(null);
  const canvasPinchStartScaleRef = useRef<number>(1);
  const selectedInstanceIdRef = useRef<string | null>(selectedInstanceId);
  selectedInstanceIdRef.current = selectedInstanceId;

  const canvasPiecesRef = useRef<CanvasPieceData[]>(canvasPieces);
  canvasPiecesRef.current = canvasPieces;

  useEffect(() => {
    AsyncStorage.getItem(OUTFITS_STORAGE_KEY)
      .then((data) => {
        if (data) {
          setSavedOutfits(JSON.parse(data));
        }
      })
      .catch(() => {});
  }, []);

  const saveOutfitsToStorage = (outfits: SavedOutfit[]) => {
    setSavedOutfits(outfits);
    AsyncStorage.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(outfits)).catch(() => {});
  };

  const handleAddPiece = (item: Item) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const instanceId = nextInstanceId(item.id);
    const x = SCREEN_WIDTH / 2 - 72 + randomRange(-15, 15);
    const y = 100 + randomRange(-15, 15);

    const newPiece: CanvasPieceData = {
      instanceId,
      item,
      scale: 1,
      zIndex: nextZIndex.current++,
      x,
      y,
    };

    setCanvasPieces((prev) => [...prev, newPiece]);
    setSelectedInstanceId(instanceId);
  };

  const handleRemovePiece = (instanceId: string) => {
    const piece = canvasPieces.find((p) => p.instanceId === instanceId);
    if (piece) {
      setLastRemovedPiece(piece);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setLastRemovedPiece(null);
      }, 4000);
    }
    setCanvasPieces((prev) => prev.filter((p) => p.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  };

  const handleUndoRemove = () => {
    if (!lastRemovedPiece) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCanvasPieces((prev) => [...prev, lastRemovedPiece]);
    setSelectedInstanceId(lastRemovedPiece.instanceId);
    setLastRemovedPiece(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  };

  // Instant 1st-tap Bring to Front (reorders array to render on top in DOM order)
  const handleBringToFront = (instanceId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newZ = nextZIndex.current++;
    setCanvasPieces((prev) => {
      const target = prev.find((p) => p.instanceId === instanceId);
      if (!target) return prev;
      const remaining = prev.filter((p) => p.instanceId !== instanceId);
      return [...remaining, { ...target, zIndex: newZ }];
    });
  };

  const handleUpdateScale = (instanceId: string, newScale: number) => {
    setCanvasPieces((prev) =>
      prev.map((p) => (p.instanceId === instanceId ? { ...p, scale: newScale } : p))
    );
  };

  const handleUpdatePosition = (instanceId: string, x: number, y: number) => {
    setCanvasPieces((prev) =>
      prev.map((p) => (p.instanceId === instanceId ? { ...p, x, y } : p))
    );
  };

  // Canvas Board Multi-Touch Responder for 2-finger expand/shrink
  const canvasBoardResponder = useConst(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2;
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        return evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          canvasPinchDistRef.current = Math.max(dist, 1);

          const targetId = selectedInstanceIdRef.current || (canvasPiecesRef.current.length > 0 ? canvasPiecesRef.current[canvasPiecesRef.current.length - 1].instanceId : null);
          if (targetId) {
            const piece = canvasPiecesRef.current.find((p) => p.instanceId === targetId);
            canvasPinchStartScaleRef.current = piece ? piece.scale : 1;
          }
        }
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2 && canvasPinchDistRef.current) {
          const currentDist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          const factor = currentDist / canvasPinchDistRef.current;
          const newScale = Math.min(Math.max(canvasPinchStartScaleRef.current * factor, 0.4), 3.0);

          const targetId = selectedInstanceIdRef.current || (canvasPiecesRef.current.length > 0 ? canvasPiecesRef.current[canvasPiecesRef.current.length - 1].instanceId : null);
          if (targetId) {
            handleUpdateScale(targetId, newScale);
          }
        }
      },
      onPanResponderRelease: () => {
        canvasPinchDistRef.current = null;
      },
      onPanResponderTerminate: () => {
        canvasPinchDistRef.current = null;
      },
    })
  );

  const handleClear = () => {
    if (canvasPieces.length === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Clear Studio', 'Remove all pieces from the styling board?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          setCanvasPieces([]);
          setSelectedInstanceId(null);
          setLastRemovedPiece(null);
        },
      },
    ]);
  };

  const [showBackdropModal, setShowBackdropModal] = useState(false);

  const activeBackdrop = BACKDROPS.find((b) => b.id === backdrop) || BACKDROPS[0];

  const handleCycleBackdrop = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBackdrop((current) => {
      const idx = BACKDROPS.findIndex((b) => b.id === current);
      const nextIdx = (idx + 1) % BACKDROPS.length;
      return BACKDROPS[nextIdx].id;
    });
  };

  const handleExportAndShare = async () => {
    if (canvasPieces.length === 0 || isExporting) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedInstanceId(null);
    setIsExporting(true);

    try {
      // Wait for React to render clean canvas without UI toolbars or selection borders
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (!canvasRef.current) throw new Error('Canvas ref unattached');
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1.0,
      });

      setExportedImageUri(uri);
      setShowExportModal(true);
    } catch {
      Alert.alert('Export Error', 'Could not render high-res lookbook. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    if (!exportedImageUri) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(exportedImageUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Lookbook Flatlay',
          UTI: 'public.png',
        });
      } else {
        await Share.share({
          url: exportedImageUri,
          title: 'Atelier Lookbook Styling',
          message: 'Styled in Atelier Studio',
        });
      }
    } catch {
      Alert.alert('Share Error', 'Could not share lookbook photo. Please try again.');
    }
  };

  const handleShuffle = () => {
    if (items.length === 0) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const tops = items.filter((i) => i.category === 'Tops');
    const bottoms = items.filter((i) => i.category === 'Bottoms');
    const shoes = items.filter((i) => i.category === 'Shoes');
    const dresses = items.filter((i) => i.category === 'Dresses');
    const accessories = items.filter((i) => i.category === 'Accessories');

    const newPieces: CanvasPieceData[] = [];
    nextZIndex.current = 10;

    const useDress = dresses.length > 0 && Math.random() > 0.5;

    if (useDress) {
      const dress = pickRandom(dresses);
      newPieces.push({
        instanceId: nextInstanceId(dress.id),
        item: dress,
        scale: 1.1,
        zIndex: 10,
        x: SCREEN_WIDTH / 2 - 75,
        y: 60,
      });
    } else {
      if (tops.length > 0) {
        const top = pickRandom(tops);
        newPieces.push({
          instanceId: nextInstanceId(top.id),
          item: top,
          scale: 1,
          zIndex: 10,
          x: SCREEN_WIDTH / 2 - 72,
          y: 40,
        });
      }
      if (bottoms.length > 0) {
        const bottom = pickRandom(bottoms);
        newPieces.push({
          instanceId: nextInstanceId(bottom.id),
          item: bottom,
          scale: 1,
          zIndex: 11,
          x: SCREEN_WIDTH / 2 - 72,
          y: 155,
        });
      }
    }

    if (shoes.length > 0) {
      const shoe = pickRandom(shoes);
      newPieces.push({
        instanceId: nextInstanceId(shoe.id),
        item: shoe,
        scale: 0.85,
        zIndex: 12,
        x: SCREEN_WIDTH / 2 - 62,
        y: 280,
      });
    }

    if (accessories.length > 0 && Math.random() > 0.35) {
      const acc = pickRandom(accessories);
      newPieces.push({
        instanceId: nextInstanceId(acc.id),
        item: acc,
        scale: 0.8,
        zIndex: 13,
        x: SCREEN_WIDTH / 2 + 15,
        y: 45,
      });
    }

    setCanvasPieces(newPieces);
    setSelectedInstanceId(null);
  };

  const handleSaveLookConfirm = () => {
    if (canvasPieces.length === 0) return;
    const nameToSave = outfitName.trim() || `Look ${savedOutfits.length + 1}`;
    const newOutfit: SavedOutfit = {
      id: nextInstanceId('outfit'),
      name: nameToSave,
      createdAt: formatToday(),
      pieces: canvasPieces.map((p) => ({
        itemId: p.item.id,
        image: p.item.image,
        name: p.item.name,
        category: p.item.category,
        x: p.x,
        y: p.y,
        scale: p.scale,
      })),
    };

    saveOutfitsToStorage([newOutfit, ...savedOutfits]);
    setShowSavePrompt(false);
    setOutfitName('');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLoadOutfit = (outfit: SavedOutfit) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const loaded: CanvasPieceData[] = [];
    outfit.pieces.forEach((p, index) => {
      const image = resolvePieceImage(p, items);
      if (!image) return;
      loaded.push({
        instanceId: nextInstanceId(p.itemId),
        item: {
          id: p.itemId,
          image,
          name: p.name,
          category: p.category,
        },
        scale: p.scale || 1,
        zIndex: 10 + index,
        x: p.x || SCREEN_WIDTH / 2 - 72,
        y: p.y || 80 + index * 80,
      });
    });

    if (loaded.length === 0) {
      Alert.alert(
        'Look unavailable',
        'The photos in this look are no longer in your archive.',
        [{ text: 'OK', onPress: () => setShowSavedModal(false) }]
      );
      return;
    }

    setCanvasPieces(loaded);
    setShowSavedModal(false);
  };

  const handleDeleteSavedOutfit = (id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = savedOutfits.filter((o) => o.id !== id);
    saveOutfitsToStorage(updated);
  };

  const filteredDrawerItems = items.filter(
    (item) => drawerCategory === 'All' || item.category === drawerCategory
  );

  return (
    <View style={styles.container}>
      {/* Top Header: Clean, Uncluttered Editorial Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.canvasTitle}>Studio</Text>
          {canvasPieces.length > 0 && (
            <Text style={styles.canvasSubtitle}>
              {canvasPieces.length} {canvasPieces.length === 1 ? 'piece' : 'pieces'} styled
            </Text>
          )}
        </View>

        <View style={styles.headerRight}>
          {/* Shuffle Tool */}
          <Pressable
            onPress={handleShuffle}
            hitSlop={6}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="shuffle-outline" size={17} color={c.onSurface} />
          </Pressable>

          {/* Backdrop Atmosphere Selector */}
          <Pressable
            onPress={() => setShowBackdropModal(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
          >
            <View
              style={[
                styles.headerBackdropDot,
                {
                  backgroundColor: activeBackdrop.swatch,
                  borderColor: backdrop === 'silk' ? c.outlineVariant : 'transparent',
                },
              ]}
            />
          </Pressable>

          {/* Saved Looks Collection */}
          <Pressable
            onPress={() => setShowSavedModal(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="bookmark-outline" size={16} color={c.onSurface} />
            {savedOutfits.length > 0 && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>{savedOutfits.length}</Text>
              </View>
            )}
          </Pressable>

          {/* Share / Export Action */}
          <Pressable
            onPress={handleExportAndShare}
            hitSlop={6}
            style={({ pressed }) => [
              styles.headerShareBtn,
              canvasPieces.length === 0 && styles.headerShareBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={c.onPrimary} />
            ) : (
              <>
                <Ionicons name="share-social" size={14} color={c.onPrimary} />
                <Text style={styles.headerShareBtnText}>Export</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Main Interactive Canvas Board */}
      <View
        ref={canvasRef}
        collapsable={false}
        style={[
          styles.canvasBoard,
          {
            backgroundColor: c.surface === '#0E0E12' ? activeBackdrop.bgDark : activeBackdrop.bgLight,
          },
        ]}
        {...canvasBoardResponder.panHandlers}
      >
        {/* Architectural Grid Overlay */}
        {backdrop === 'grid' && (
          <View style={styles.gridOverlay} pointerEvents="none">
            <View style={styles.gridLineVertical} />
            <View style={styles.gridLineHorizontal} />
            <View style={styles.gridCornerTopLeft} />
            <View style={styles.gridCornerTopRight} />
            <View style={styles.gridCornerBottomLeft} />
            <View style={styles.gridCornerBottomRight} />
          </View>
        )}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setSelectedInstanceId(null)}
        >
          {canvasPieces.length === 0 ? (
            <View style={styles.emptyCanvasHint}>
              <View style={styles.hintIconCircle}>
                <Ionicons name="sparkles-outline" size={24} color={c.gold} />
              </View>
              <Text style={styles.hintTitle}>Atelier Lookbook Studio</Text>
              <Text style={styles.hintText}>
                Select pieces from the wardrobe tray below. Drag anywhere & pinch with 2 fingers to resize.
              </Text>
            </View>
          ) : (
            canvasPieces.map((piece) => (
              <DraggablePiece
                key={piece.instanceId}
                data={piece}
                isSelected={!isExporting && selectedInstanceId === piece.instanceId}
                onSelect={() => setSelectedInstanceId(piece.instanceId)}
                onRemove={() => handleRemovePiece(piece.instanceId)}
                onBringToFront={() => handleBringToFront(piece.instanceId)}
                onUpdateScale={(newScale) => handleUpdateScale(piece.instanceId, newScale)}
                onMoveEnd={(x, y) => handleUpdatePosition(piece.instanceId, x, y)}
                palette={c}
              />
            ))
          )}
        </Pressable>

        {/* Undo Floating Banner (Hidden when exporting/sharing) */}
        {!isExporting && lastRemovedPiece && (
          <View style={styles.undoBanner}>
            <Text style={styles.undoText}>Piece removed</Text>
            <Pressable onPress={handleUndoRemove} hitSlop={8} style={styles.undoBtn}>
              <Text style={styles.undoBtnText}>Undo</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Wardrobe Tray / Drawer */}
      <View style={[styles.drawerContainer, !drawerExpanded && styles.drawerCollapsed]}>
        <View style={styles.drawerHeader}>
          <Pressable
            onPress={() => setDrawerExpanded((prev) => !prev)}
            style={styles.drawerToggle}
            hitSlop={8}
          >
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>Pieces ({filteredDrawerItems.length})</Text>
          </Pressable>

          {canvasPieces.length > 0 && (
            <View style={styles.drawerActions}>
              <Pressable
                onPress={() => setShowSavePrompt(true)}
                hitSlop={6}
                style={({ pressed }) => [styles.drawerSaveBtn, pressed && styles.pressed]}
              >
                <Ionicons name="bookmark" size={13} color={c.gold} />
                <Text style={styles.drawerSaveText}>Save Look</Text>
              </Pressable>

              <Pressable
                onPress={handleClear}
                hitSlop={6}
                style={({ pressed }) => [styles.drawerClearBtn, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={14} color={c.error} />
              </Pressable>
            </View>
          )}
        </View>

        {drawerExpanded && (
          <>
            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.drawerCategoryRow}
            >
              {categories.map((cat) => {
                const isSelected = drawerCategory === cat;
                const dotColor = {
                  All: c.gold,
                  Tops: c.catTops,
                  Bottoms: c.catBottoms,
                  Dresses: c.catDresses,
                  Shoes: c.catShoes,
                  Accessories: c.catAccessories,
                }[cat];

                return (
                  <Pressable
                    key={cat}
                    onPress={() => setDrawerCategory(cat)}
                    hitSlop={4}
                    style={[
                      styles.drawerCatChip,
                      isSelected && styles.drawerCatChipActive,
                    ]}
                  >
                    <View style={[styles.drawerDot, { backgroundColor: dotColor }]} />
                    <Text
                      style={[
                        styles.drawerCatText,
                        isSelected && styles.drawerCatTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Pieces Horizontal Tray */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.piecesTray}
            >
              {filteredDrawerItems.length === 0 ? (
                <Text style={styles.emptyTrayText}>No pieces in this category</Text>
              ) : (
                filteredDrawerItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleAddPiece(item)}
                    hitSlop={4}
                    style={({ pressed }) => [styles.trayCard, pressed && styles.pressed]}
                  >
                    <Image source={{ uri: item.image }} style={styles.trayImage} resizeMode="contain" />
                    <View style={styles.trayPlusBadge}>
                      <Ionicons name="add" size={12} color={c.onPrimary} />
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* Lookbook Export & Share Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.exportModalCard}>
            <View style={styles.exportModalHeader}>
              <Text style={styles.exportModalTitle}>Lookbook Flatlay</Text>
              <Pressable onPress={() => setShowExportModal(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={c.onSurface} />
              </Pressable>
            </View>

            {exportedImageUri && (
              <View style={styles.exportPreviewWrap}>
                <Image source={{ uri: exportedImageUri }} style={styles.exportPreviewImg} resizeMode="contain" />
              </View>
            )}

            <View style={styles.exportActionsRow}>
              <Pressable
                onPress={() => setShowExportModal(false)}
                style={[styles.exportActionBtn, styles.exportDoneBtn]}
              >
                <Text style={styles.exportDoneBtnText}>Done</Text>
              </Pressable>

              <Pressable onPress={handleNativeShare} style={[styles.exportActionBtn, styles.exportShareBtn]}>
                <Ionicons name="share-social" size={18} color={c.onPrimary} />
                <Text style={styles.exportShareBtnText}>Share Lookbook</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Look Prompt Modal */}
      <Modal
        visible={showSavePrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSavePrompt(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.promptModal}>
            <Text style={styles.promptTitle}>Save Styled Look</Text>
            <Text style={styles.promptSubtitle}>Give your outfit combination a name:</Text>

            <TextInput
              value={outfitName}
              onChangeText={setOutfitName}
              placeholder="e.g. Summer Date Look"
              placeholderTextColor={c.onSurfaceVariant}
              style={styles.promptInput}
              autoFocus
            />

            <View style={styles.promptActions}>
              <Pressable
                onPress={() => setShowSavePrompt(false)}
                style={[styles.promptBtn, styles.promptCancelBtn]}
              >
                <Text style={styles.promptCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveLookConfirm}
                style={[styles.promptBtn, styles.promptSaveBtn]}
              >
                <Text style={styles.promptSaveText}>Save Look</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Saved Looks Collection Modal */}
      <Modal
        visible={showSavedModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSavedModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.savedModalCard}>
            <View style={styles.savedModalHeader}>
              <Text style={styles.savedModalTitle}>Saved Outfits</Text>
              <Pressable onPress={() => setShowSavedModal(false)} style={styles.closeSavedBtn}>
                <Ionicons name="close" size={20} color={c.onSurface} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.savedOutfitsList}>
              {savedOutfits.length === 0 ? (
                <View style={styles.emptySavedWrap}>
                  <Ionicons name="bookmark-outline" size={36} color={c.onSurfaceVariant} />
                  <Text style={styles.emptySavedText}>No saved outfits yet.</Text>
                </View>
              ) : (
                savedOutfits.map((outfit) => {
                  const validPieces = outfit.pieces.filter(
                    (p) => resolvePieceImage(p, items) !== null
                  );
                  return (
                    <View key={outfit.id} style={styles.savedOutfitCard}>
                      <View style={styles.savedOutfitInfo}>
                        <Text style={styles.savedOutfitName}>{outfit.name}</Text>
                        <Text style={styles.savedOutfitDate}>
                          {outfit.createdAt} • {validPieces.length} pieces
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedThumbsRow}>
                          {validPieces.map((p, i) => (
                            <Image key={i} source={{ uri: p.image }} style={styles.savedMiniThumb} resizeMode="contain" />
                          ))}
                        </ScrollView>
                      </View>

                      <View style={styles.savedOutfitActions}>
                        <Pressable
                          onPress={() => handleLoadOutfit(outfit)}
                          style={[styles.loadOutfitBtn, validPieces.length === 0 && styles.headerShareBtnDisabled]}
                        >
                          <Text style={styles.loadOutfitBtnText}>Load</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteSavedOutfit(outfit.id)}
                          style={styles.deleteOutfitBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color={c.error} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Backdrop Atmosphere Picker Modal */}
      <Modal
        visible={showBackdropModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBackdropModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBackdropModal(false)} />
          <View style={styles.backdropModalCard}>
            <View style={styles.savedModalHeader}>
              <View>
                <Text style={styles.savedModalTitle}>Studio Backdrops</Text>
                <Text style={styles.backdropModalSubtitle}>Choose canvas lighting & atmosphere</Text>
              </View>
              <Pressable onPress={() => setShowBackdropModal(false)} style={styles.closeSavedBtn}>
                <Ionicons name="close" size={20} color={c.onSurface} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.backdropGridList}>
              {BACKDROPS.map((b) => {
                const isSelected = b.id === backdrop;
                const previewBg = c.surface === '#0E0E12' ? b.bgDark : b.bgLight;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setBackdrop(b.id);
                      setShowBackdropModal(false);
                    }}
                    style={({ pressed }) => [
                      styles.backdropOptionCard,
                      isSelected && styles.backdropOptionCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.backdropOptionPreview,
                        { backgroundColor: previewBg },
                        b.id === 'silk' && { borderWidth: 1, borderColor: c.outlineVariant },
                      ]}
                    >
                      <Ionicons
                        name={b.icon}
                        size={20}
                        color={isSelected ? c.gold : c.onSurfaceVariant}
                      />
                    </View>
                    <View style={styles.backdropOptionInfo}>
                      <Text style={styles.backdropOptionName}>{b.label}</Text>
                      <Text style={styles.backdropOptionSub}>{b.sublabel}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={c.gold} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pieceContainer: {
    position: 'absolute',
  },
  pieceFrame: {
    borderRadius: shapes.lg,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  pieceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  floatingControlsWrap: {
    position: 'absolute',
    top: -18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 999,
  },
  miniControlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.surface,
    },
    topHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
      backgroundColor: c.surface,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    canvasTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 22,
      letterSpacing: -0.3,
    },
    canvasSubtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
      includeFontPadding: false,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerIconBtn: {
      width: 34,
      height: 34,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    headerBackdropDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
    },
    savedBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: c.gold,
      borderRadius: 7,
      minWidth: 14,
      height: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    savedBadgeText: {
      fontFamily: fonts.extraBold,
      color: '#FFFFFF',
      fontSize: 8.5,
    },
    headerShareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      height: 34,
      paddingHorizontal: 13,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
    },
    headerShareBtnDisabled: {
      opacity: 0.4,
    },
    headerShareBtnText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 12,
    },
    canvasBoard: {
      flex: 1,
      position: 'relative',
      backgroundColor: c.surface,
      overflow: 'hidden',
    },
    canvasBoardLinen: {
      backgroundColor: '#EFE6D8',
    },
    canvasBoardNoir: {
      backgroundColor: '#181716',
    },
    canvasBoardGrid: {
      backgroundColor: c.surface,
    },
    floatingDock: {
      position: 'absolute',
      bottom: 14,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.cardBg,
      borderRadius: shapes.full,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      zIndex: 100,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    dockActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: shapes.full,
    },
    dockBackdropSwatch: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1,
    },
    dockActionBtnPressed: {
      backgroundColor: c.surfaceContainerHigh,
    },
    dockActionText: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 12,
    },
    dockDivider: {
      width: 1,
      height: 14,
      backgroundColor: c.outlineVariant,
      marginHorizontal: 4,
    },
    dockSaveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.gold,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: shapes.full,
    },
    dockSaveBtnText: {
      fontFamily: fonts.bold,
      color: '#FFFFFF',
      fontSize: 11.5,
    },
    dockClearBtn: {
      paddingHorizontal: 6,
      paddingVertical: 5,
    },
    gridOverlay: {
      ...StyleSheet.absoluteFill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gridLineVertical: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 1,
      borderLeftWidth: 1,
      borderLeftColor: c.outlineVariant,
      borderStyle: 'dashed',
    },
    gridLineHorizontal: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      borderTopWidth: 1,
      borderTopColor: c.outlineVariant,
      borderStyle: 'dashed',
    },
    gridCornerTopLeft: {
      position: 'absolute',
      top: 18,
      left: 18,
      width: 12,
      height: 12,
      borderTopWidth: 1.5,
      borderLeftWidth: 1.5,
      borderColor: c.gold,
    },
    gridCornerTopRight: {
      position: 'absolute',
      top: 18,
      right: 18,
      width: 12,
      height: 12,
      borderTopWidth: 1.5,
      borderRightWidth: 1.5,
      borderColor: c.gold,
    },
    gridCornerBottomLeft: {
      position: 'absolute',
      bottom: 18,
      left: 18,
      width: 12,
      height: 12,
      borderBottomWidth: 1.5,
      borderLeftWidth: 1.5,
      borderColor: c.gold,
    },
    gridCornerBottomRight: {
      position: 'absolute',
      bottom: 18,
      right: 18,
      width: 12,
      height: 12,
      borderBottomWidth: 1.5,
      borderRightWidth: 1.5,
      borderColor: c.gold,
    },
    emptyCanvasHint: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    hintIconCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: c.goldContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    hintTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 18,
      letterSpacing: -0.2,
      marginBottom: 6,
      textAlign: 'center',
    },
    hintText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
    },
    undoBanner: {
      position: 'absolute',
      bottom: 58,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primary,
      borderRadius: shapes.full,
      paddingVertical: 8,
      paddingHorizontal: 16,
      gap: 12,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
      zIndex: 1000,
    },
    undoText: {
      fontFamily: fonts.medium,
      color: c.onPrimary,
      fontSize: 12.5,
    },
    undoBtn: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: shapes.full,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    undoBtnText: {
      fontFamily: fonts.bold,
      color: c.gold,
      fontSize: 12,
    },
    drawerContainer: {
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingTop: 10,
      paddingBottom: 16,
    },
    drawerCollapsed: {
      paddingBottom: 10,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    drawerToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    drawerHandle: {
      width: 24,
      height: 3.5,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
    },
    drawerTitle: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 13,
      letterSpacing: 0.2,
    },
    drawerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    drawerSaveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.goldContainer,
      paddingHorizontal: 10,
      paddingVertical: 4.5,
      borderRadius: shapes.full,
      borderWidth: 1,
      borderColor: c.gold,
    },
    drawerSaveText: {
      fontFamily: fonts.bold,
      color: c.gold,
      fontSize: 11.5,
    },
    drawerClearBtn: {
      width: 28,
      height: 28,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    drawerCategoryRow: {
      paddingHorizontal: 16,
      gap: 6,
      paddingVertical: 6,
    },
    drawerCatChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: shapes.full,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    drawerCatChipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    drawerDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    drawerCatText: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
    },
    drawerCatTextActive: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
    },
    piecesTray: {
      paddingHorizontal: 16,
      gap: 12,
      paddingTop: 8,
      paddingBottom: 4,
    },
    trayCard: {
      width: 76,
      height: 96,
      borderRadius: shapes.lg,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 6,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    trayImage: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
    },
    trayPlusBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTrayText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12.5,
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: c.scrim,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    exportModalCard: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: c.cardBg,
      borderRadius: shapes.xxl,
      padding: 20,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    exportModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    exportModalTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 20,
    },
    exportPreviewWrap: {
      width: '100%',
      height: 280,
      borderRadius: shapes.lg,
      backgroundColor: c.surfaceContainerLow,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    exportPreviewImg: {
      width: '100%',
      height: '100%',
    },
    exportActionsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    exportActionBtn: {
      flex: 1,
      height: 48,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    exportDoneBtn: {
      backgroundColor: c.surfaceContainerHigh,
      borderColor: c.outlineVariant,
    },
    exportDoneBtnText: {
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 13.5,
    },
    exportShareBtn: {
      backgroundColor: c.primary,
      borderColor: c.primary,
      flex: 1.4,
    },
    exportShareBtnText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 13.5,
    },
    promptModal: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: c.cardBg,
      borderRadius: shapes.xl,
      padding: 22,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    promptTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 19,
      marginBottom: 4,
    },
    promptSubtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 13,
      marginBottom: 16,
    },
    promptInput: {
      height: 46,
      borderRadius: shapes.md,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingHorizontal: 14,
      fontFamily: fonts.medium,
      color: c.onSurface,
      fontSize: 14.5,
      marginBottom: 18,
    },
    promptActions: {
      flexDirection: 'row',
      gap: 10,
    },
    promptBtn: {
      flex: 1,
      height: 44,
      borderRadius: shapes.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    promptCancelBtn: {
      backgroundColor: c.surfaceContainerHigh,
    },
    promptCancelText: {
      fontFamily: fonts.bold,
      color: c.onSurfaceVariant,
      fontSize: 13.5,
    },
    promptSaveBtn: {
      backgroundColor: c.primary,
    },
    promptSaveText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 13.5,
    },
    savedModalCard: {
      width: '100%',
      maxWidth: 380,
      maxHeight: '80%',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: shapes.xxl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    savedModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
    },
    savedModalTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 20,
    },
    closeSavedBtn: {
      padding: 4,
    },
    savedOutfitsList: {
      padding: 16,
      gap: 12,
    },
    emptySavedWrap: {
      alignItems: 'center',
      paddingVertical: 36,
      gap: 10,
    },
    emptySavedText: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 14,
    },
    savedOutfitCard: {
      backgroundColor: c.cardBg,
      borderRadius: shapes.lg,
      padding: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    savedOutfitInfo: {
      flex: 1,
    },
    savedOutfitName: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 15,
      marginBottom: 2,
    },
    savedOutfitDate: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
      marginBottom: 8,
    },
    savedThumbsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    savedMiniThumb: {
      width: 38,
      height: 48,
      borderRadius: shapes.xs,
      backgroundColor: c.imageBg,
    },
    savedOutfitActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginLeft: 12,
    },
    loadOutfitBtn: {
      backgroundColor: c.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: shapes.full,
    },
    loadOutfitBtnText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 12.5,
    },
    deleteOutfitBtn: {
      padding: 6,
    },
    backdropModalCard: {
      width: '100%',
      maxWidth: 380,
      maxHeight: '75%',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: shapes.xxl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    backdropModalSubtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
      marginTop: 2,
    },
    backdropGridList: {
      padding: 16,
      gap: 10,
    },
    backdropOptionCard: {
      backgroundColor: c.cardBg,
      borderRadius: shapes.xl,
      padding: 12,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backdropOptionCardSelected: {
      borderColor: c.gold,
      backgroundColor: c.surfaceContainerHigh,
    },
    backdropOptionPreview: {
      width: 44,
      height: 44,
      borderRadius: shapes.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backdropOptionInfo: {
      flex: 1,
    },
    backdropOptionName: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 14.5,
      marginBottom: 1,
    },
    backdropOptionSub: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
  });
