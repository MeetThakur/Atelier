import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, ClothingCategory, Item, SavedOutfit } from '../types';
import { categories } from '../constants';
import { useTheme, fonts, shapes, type Palette } from '../theme';

const OUTFITS_STORAGE_KEY = '@atelier_saved_outfits_v1';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CanvasPieceData = {
  instanceId: string;
  item: Item;
  scale: number;
  zIndex: number;
  initialX: number;
  initialY: number;
};

type DraggablePieceProps = {
  data: CanvasPieceData;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onBringToFront: () => void;
  onToggleScale: () => void;
  palette: Palette;
};

function DraggablePiece({
  data,
  isSelected,
  onSelect,
  onRemove,
  onBringToFront,
  onToggleScale,
  palette,
}: DraggablePieceProps) {
  const pan = useRef(new Animated.ValueXY({ x: data.initialX, y: data.initialY })).current;
  const lastOffset = useRef({ x: data.initialX, y: data.initialY });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: () => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
        pan.setOffset({
          x: lastOffset.current.x,
          y: lastOffset.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        lastOffset.current = {
          x: lastOffset.current.x + gestureState.dx,
          y: lastOffset.current.y + gestureState.dy,
        };
      },
    })
  ).current;

  const baseSize = 145 * data.scale;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          zIndex: data.zIndex,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          onSelect();
        }}
        style={[
          styles.pieceFrame,
          {
            width: baseSize,
            height: baseSize * 1.25,
            borderColor: isSelected ? palette.gold : 'transparent',
            backgroundColor: 'transparent',
          },
        ]}
      >
        <Image
          source={{ uri: data.item.image }}
          style={styles.pieceImage}
          resizeMode="contain"
        />

        {/* Selected Controls Header Bar */}
        {isSelected && (
          <View style={styles.floatingControlsWrap} pointerEvents="box-none">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onBringToFront();
              }}
              hitSlop={10}
              style={[styles.miniControlBtn, { backgroundColor: palette.primary }]}
            >
              <Ionicons name="arrow-up" size={11} color={palette.onPrimary} />
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                void Haptics.selectionAsync();
                onToggleScale();
              }}
              hitSlop={10}
              style={[styles.miniControlBtn, { backgroundColor: palette.primary }]}
            >
              <Ionicons name="resize-outline" size={11} color={palette.onPrimary} />
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onRemove();
              }}
              hitSlop={10}
              style={[styles.miniControlBtn, { backgroundColor: palette.error }]}
            >
              <Ionicons name="close" size={11} color="#FFFFFF" />
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

  const nextZIndex = useRef(10);

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
    const instanceId = `${item.id}-${Date.now()}`;
    const initialX = SCREEN_WIDTH / 2 - 72 + (Math.random() * 30 - 15);
    const initialY = 100 + (Math.random() * 30 - 15);

    const newPiece: CanvasPieceData = {
      instanceId,
      item,
      scale: 1,
      zIndex: nextZIndex.current++,
      initialX,
      initialY,
    };

    setCanvasPieces((prev) => [...prev, newPiece]);
    setSelectedInstanceId(instanceId);
  };

  const handleRemovePiece = (instanceId: string) => {
    setCanvasPieces((prev) => prev.filter((p) => p.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  };

  const handleBringToFront = (instanceId: string) => {
    const newZ = nextZIndex.current++;
    setCanvasPieces((prev) =>
      prev.map((p) => (p.instanceId === instanceId ? { ...p, zIndex: newZ } : p))
    );
  };

  const handleToggleScale = (instanceId: string) => {
    setCanvasPieces((prev) =>
      prev.map((p) => {
        if (p.instanceId !== instanceId) return p;
        const nextScale = p.scale === 1 ? 1.25 : p.scale === 1.25 ? 0.8 : 1;
        return { ...p, scale: nextScale };
      })
    );
  };

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
        },
      },
    ]);
  };

  const handleShuffle = () => {
    if (items.length === 0) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const tops = items.filter((i) => i.category === 'Tops');
    const bottoms = items.filter((i) => i.category === 'Bottoms');
    const shoes = items.filter((i) => i.category === 'Shoes');
    const dresses = items.filter((i) => i.category === 'Dresses');

    const newPieces: CanvasPieceData[] = [];
    nextZIndex.current = 10;

    const useDress = dresses.length > 0 && Math.random() > 0.5;

    if (useDress) {
      const dress = dresses[Math.floor(Math.random() * dresses.length)];
      newPieces.push({
        instanceId: `${dress.id}-${Date.now()}-1`,
        item: dress,
        scale: 1.1,
        zIndex: 10,
        initialX: SCREEN_WIDTH / 2 - 75,
        initialY: 60,
      });
    } else {
      if (tops.length > 0) {
        const top = tops[Math.floor(Math.random() * tops.length)];
        newPieces.push({
          instanceId: `${top.id}-${Date.now()}-1`,
          item: top,
          scale: 1,
          zIndex: 10,
          initialX: SCREEN_WIDTH / 2 - 72,
          initialY: 40,
        });
      }
      if (bottoms.length > 0) {
        const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        newPieces.push({
          instanceId: `${bottom.id}-${Date.now()}-2`,
          item: bottom,
          scale: 1,
          zIndex: 11,
          initialX: SCREEN_WIDTH / 2 - 72,
          initialY: 155,
        });
      }
    }

    if (shoes.length > 0) {
      const shoe = shoes[Math.floor(Math.random() * shoes.length)];
      newPieces.push({
        instanceId: `${shoe.id}-${Date.now()}-3`,
        item: shoe,
        scale: 0.85,
        zIndex: 12,
        initialX: SCREEN_WIDTH / 2 - 62,
        initialY: 280,
      });
    }

    setCanvasPieces(newPieces);
    setSelectedInstanceId(null);
  };

  const handleSaveLookConfirm = () => {
    if (canvasPieces.length === 0) return;
    const nameToSave = outfitName.trim() || `Look ${savedOutfits.length + 1}`;
    const newOutfit: SavedOutfit = {
      id: `${Date.now()}`,
      name: nameToSave,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pieces: canvasPieces.map((p) => ({
        itemId: p.item.id,
        image: p.item.image,
        name: p.item.name,
        category: p.item.category,
        x: p.initialX,
        y: p.initialY,
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
    const loaded: CanvasPieceData[] = outfit.pieces.map((p, index) => ({
      instanceId: `${p.itemId}-${Date.now()}-${index}`,
      item: {
        id: p.itemId,
        image: p.image,
        name: p.name,
        category: p.category,
      },
      scale: p.scale || 1,
      zIndex: 10 + index,
      initialX: p.x || SCREEN_WIDTH / 2 - 72,
      initialY: p.y || 80 + index * 80,
    }));

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
      {/* Top Studio Toolbar */}
      <View style={styles.topToolbar}>
        <View style={styles.toolbarLeft}>
          <Text style={styles.canvasTitle}>Studio Canvas</Text>
          <Text style={styles.canvasSubtitle}>
            {canvasPieces.length} {canvasPieces.length === 1 ? 'piece' : 'pieces'} floating
          </Text>
        </View>

        <View style={styles.toolbarRight}>
          <Pressable
            onPress={handleShuffle}
            hitSlop={6}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Ionicons name="shuffle-outline" size={17} color={c.onSurface} />
          </Pressable>

          <Pressable
            onPress={() => setShowSavedModal(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Ionicons name="bookmark-outline" size={17} color={c.onSurface} />
            {savedOutfits.length > 0 && (
              <View style={styles.savedCountDot}>
                <Text style={styles.savedCountText}>{savedOutfits.length}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (canvasPieces.length > 0) {
                setShowSavePrompt(true);
              }
            }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.toolBtn,
              canvasPieces.length === 0 && styles.toolBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="checkmark-done" size={17} color={c.gold} />
          </Pressable>

          <Pressable
            onPress={handleClear}
            hitSlop={6}
            style={({ pressed }) => [
              styles.toolBtn,
              canvasPieces.length === 0 && styles.toolBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="trash-outline" size={17} color={c.error} />
          </Pressable>
        </View>
      </View>

      {/* Main Interactive Canvas Board */}
      <Pressable style={styles.canvasBoard} onPress={() => setSelectedInstanceId(null)}>
        {canvasPieces.length === 0 ? (
          <View style={styles.emptyCanvasHint}>
            <View style={styles.hintIconCircle}>
              <Ionicons name="finger-print-outline" size={28} color={c.gold} />
            </View>
            <Text style={styles.hintTitle}>Interactive Lookbook Studio</Text>
            <Text style={styles.hintText}>
              Tap pieces from your wardrobe tray below to float cutouts freely on the canvas board.
            </Text>
          </View>
        ) : (
          canvasPieces.map((piece) => (
            <DraggablePiece
              key={piece.instanceId}
              data={piece}
              isSelected={selectedInstanceId === piece.instanceId}
              onSelect={() => setSelectedInstanceId(piece.instanceId)}
              onRemove={() => handleRemovePiece(piece.instanceId)}
              onBringToFront={() => handleBringToFront(piece.instanceId)}
              onToggleScale={() => handleToggleScale(piece.instanceId)}
              palette={c}
            />
          ))
        )}
      </Pressable>

      {/* Wardrobe Tray / Drawer */}
      <View style={[styles.drawerContainer, !drawerExpanded && styles.drawerCollapsed]}>
        <View style={styles.drawerHeader}>
          <Pressable
            onPress={() => setDrawerExpanded((prev) => !prev)}
            style={styles.drawerToggle}
            hitSlop={8}
          >
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>Wardrobe Pieces ({filteredDrawerItems.length})</Text>
          </Pressable>
        </View>

        {drawerExpanded && (
          <>
            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.drawerCategoryRow}
            >
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setDrawerCategory(cat)}
                  hitSlop={4}
                  style={[
                    styles.drawerCatChip,
                    drawerCategory === cat && styles.drawerCatChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.drawerCatText,
                      drawerCategory === cat && styles.drawerCatTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
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

      {/* Save Look Prompt Modal */}
      <Modal visible={showSavePrompt} transparent animationType="fade">
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
      <Modal visible={showSavedModal} transparent animationType="slide">
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
                savedOutfits.map((outfit) => (
                  <View key={outfit.id} style={styles.savedOutfitCard}>
                    <View style={styles.savedOutfitInfo}>
                      <Text style={styles.savedOutfitName}>{outfit.name}</Text>
                      <Text style={styles.savedOutfitDate}>
                        {outfit.createdAt} • {outfit.pieces.length} pieces
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedThumbsRow}>
                        {outfit.pieces.map((p, i) => (
                          <Image key={i} source={{ uri: p.image }} style={styles.savedMiniThumb} resizeMode="contain" />
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.savedOutfitActions}>
                      <Pressable
                        onPress={() => handleLoadOutfit(outfit)}
                        style={styles.loadOutfitBtn}
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
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pieceFrame: {
    borderRadius: shapes.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  pieceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  floatingControlsWrap: {
    position: 'absolute',
    top: -16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 999,
  },
  miniControlBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    topToolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
    },
    toolbarLeft: {},
    canvasTitle: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 22,
      letterSpacing: -0.3,
    },
    canvasSubtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
    },
    toolbarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toolBtn: {
      width: 38,
      height: 38,
      borderRadius: shapes.full,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    toolBtnDisabled: {
      opacity: 0.35,
    },
    savedCountDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: c.gold,
      borderRadius: 7,
      minWidth: 14,
      height: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    savedCountText: {
      fontFamily: fonts.extraBold,
      color: '#FFFFFF',
      fontSize: 8.5,
    },
    canvasBoard: {
      flex: 1,
      position: 'relative',
      backgroundColor: c.surface,
      overflow: 'hidden',
    },
    emptyCanvasHint: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    hintIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.goldContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
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
    drawerContainer: {
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingTop: 10,
      paddingBottom: 85,
    },
    drawerCollapsed: {
      paddingBottom: 85,
    },
    drawerHeader: {
      alignItems: 'center',
      paddingBottom: 8,
    },
    drawerToggle: {
      alignItems: 'center',
      width: '100%',
    },
    drawerHandle: {
      width: 32,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
      marginBottom: 6,
    },
    drawerTitle: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 13,
      letterSpacing: 0.3,
    },
    drawerCategoryRow: {
      paddingHorizontal: 16,
      gap: 6,
      paddingVertical: 6,
    },
    drawerCatChip: {
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
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
  });
