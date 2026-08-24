import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { Item, SavedOutfit } from '../types';
import { loadOutfits, saveOutfits } from '../lib/storage';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import type { CanvasBackdrop, CanvasPieceData } from './studio/canvasTypes';
import {
  BACKDROPS,
  formatToday,
  generateSmartOutfit,
  nextInstanceId,
  randomRange,
} from './studio/canvasUtils';
import { DraggablePiece } from './studio/DraggablePiece';
import { BackdropSelector } from './studio/BackdropSelector';
import { SavedLooksModal } from './studio/SavedLooksModal';
import { PieceDrawer } from './studio/PieceDrawer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function useConst<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

type Props = {
  items: Item[];
};

export function OutfitCanvas({ items }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [canvasPieces, setCanvasPieces] = useState<CanvasPieceData[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showBackdropModal, setShowBackdropModal] = useState(false);
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

  // Load saved outfits from storage
  useEffect(() => {
    loadOutfits()
      .then(setSavedOutfits)
      .catch(() => {});
  }, []);

  const handleUpdatePosition = (instanceId: string, x: number, y: number) => {
    setCanvasPieces((prev) =>
      prev.map((p) => (p.instanceId === instanceId ? { ...p, x, y } : p))
    );
  };

  const handleUpdateScale = useCallback((instanceId: string, scale: number) => {
    setCanvasPieces((prev) =>
      prev.map((p) => (p.instanceId === instanceId ? { ...p, scale } : p))
    );
  }, []);

  const handleBringToFront = (instanceId: string) => {
    const newZ = ++nextZIndex.current;
    setCanvasPieces((prev) =>
      prev.map((p) => (p.instanceId === instanceId ? { ...p, zIndex: newZ } : p))
    );
  };

  const handleSendToBack = (instanceId: string) => {
    const minZ = Math.min(...canvasPieces.map((p) => p.zIndex), 1);
    const newZ = Math.max(0, minZ - 1);
    setCanvasPieces((prev) =>
      prev.map((p) => (p.instanceId === instanceId ? { ...p, zIndex: newZ } : p))
    );
  };

  const handleRemovePiece = (instanceId: string) => {
    const pieceToRemove = canvasPieces.find((p) => p.instanceId === instanceId);
    if (pieceToRemove) {
      setLastRemovedPiece(pieceToRemove);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setLastRemovedPiece(null);
      }, 5000);
    }
    setCanvasPieces((prev) => prev.filter((p) => p.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  };

  const handleUndoRemove = () => {
    if (!lastRemovedPiece) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCanvasPieces((prev) => [...prev, lastRemovedPiece]);
    setSelectedInstanceId(lastRemovedPiece.instanceId);
    setLastRemovedPiece(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  };

  const handleAddPiece = (item: Item) => {
    const newZ = ++nextZIndex.current;
    const canvasWidth = SCREEN_WIDTH;
    const canvasHeight = 380;
    const randomX = Math.max(20, Math.min(canvasWidth - 165, canvasWidth / 2 - 70 + randomRange(-40, 40)));
    const randomY = Math.max(20, Math.min(canvasHeight - 200, canvasHeight / 2 - 90 + randomRange(-40, 40)));

    const newPiece: CanvasPieceData = {
      instanceId: nextInstanceId(),
      item,
      scale: 1,
      zIndex: newZ,
      x: randomX,
      y: randomY,
    };

    setCanvasPieces((prev) => [...prev, newPiece]);
    setSelectedInstanceId(newPiece.instanceId);
  };

  const handleShuffle = () => {
    if (items.length === 0) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newPieces = generateSmartOutfit(items, SCREEN_WIDTH, 380);
    setCanvasPieces(newPieces);
    setSelectedInstanceId(null);
    nextZIndex.current = newPieces.length + 5;
  };

  const handleClear = () => {
    if (canvasPieces.length === 0) return;
    Alert.alert(
      'Clear Canvas',
      'Are you sure you want to remove all pieces from the styling board?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setCanvasPieces([]);
            setSelectedInstanceId(null);
          },
        },
      ]
    );
  };

  const handleSaveLookConfirm = () => {
    if (canvasPieces.length === 0) return;
    const finalName = outfitName.trim() || `Look ${formatToday()}`;
    const newOutfit: SavedOutfit = {
      id: `outfit-${Date.now()}`,
      name: finalName,
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

    const updated = [newOutfit, ...savedOutfits];
    setSavedOutfits(updated);
    void saveOutfits(updated);
    setShowSavePrompt(false);
    setOutfitName('');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLoadOutfit = (outfit: SavedOutfit) => {
    const loadedPieces: CanvasPieceData[] = outfit.pieces.map((p, idx) => {
      const liveItem = items.find((i) => i.id === p.itemId) || {
        id: p.itemId,
        name: p.name,
        category: p.category,
        image: p.image,
      };
      return {
        instanceId: nextInstanceId('loaded'),
        item: liveItem,
        scale: p.scale || 1,
        zIndex: idx + 1,
        x: p.x || 50,
        y: p.y || 50,
      };
    });

    setCanvasPieces(loadedPieces);
    setSelectedInstanceId(null);
    setShowSavedModal(false);
    nextZIndex.current = loadedPieces.length + 5;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteSavedOutfit = (id: string) => {
    const updated = savedOutfits.filter((o) => o.id !== id);
    setSavedOutfits(updated);
    void saveOutfits(updated);
  };

  const handleExport = async () => {
    if (!canvasRef.current || canvasPieces.length === 0) return;
    try {
      setSelectedInstanceId(null);
      setIsExporting(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await new Promise((res) => setTimeout(res, 200));

      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      setExportedImageUri(uri);
      setShowExportModal(true);
    } catch {
      Alert.alert('Export Failed', 'Could not render lookbook flatlay. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    if (!exportedImageUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(exportedImageUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Atelier Lookbook',
      });
    }
  };

  const boardStateRef = useRef({ canvasPieces, selectedInstanceId, handleUpdateScale });
  useEffect(() => {
    boardStateRef.current = { canvasPieces, selectedInstanceId, handleUpdateScale };
  }, [canvasPieces, selectedInstanceId, handleUpdateScale]);

  // Canvas board multi-touch pan responder for whole-board 2-finger pinch
  const canvasBoardResponder = useConst(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt) => {
        const touches = evt.nativeEvent.touches;
        return Boolean(touches && touches.length >= 2 && boardStateRef.current.selectedInstanceId !== null);
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        const currentSelected = boardStateRef.current.selectedInstanceId;
        if (touches && touches.length >= 2 && currentSelected) {
          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          canvasPinchDistRef.current = Math.max(dist, 1);
          const sel = boardStateRef.current.canvasPieces.find((p) => p.instanceId === currentSelected);
          canvasPinchStartScaleRef.current = sel ? sel.scale : 1;
        }
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        const currentSelected = boardStateRef.current.selectedInstanceId;
        if (touches && touches.length >= 2 && currentSelected && canvasPinchDistRef.current) {
          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          const factor = dist / canvasPinchDistRef.current;
          const newScale = Math.min(Math.max(canvasPinchStartScaleRef.current * factor, 0.4), 3.0);
          boardStateRef.current.handleUpdateScale(currentSelected, newScale);
        }
      },
      onPanResponderRelease: () => {
        canvasPinchDistRef.current = null;
      },
    })
  );

  const activeBackdrop = BACKDROPS.find((b) => b.id === backdrop) || BACKDROPS[0];
  const activeBackdropBg = c.surface === '#0E0E12' ? activeBackdrop.bgDark : activeBackdrop.bgLight;

  return (
    <View style={styles.container}>
      {/* Top Header & Controls */}
      <View style={styles.topControlBar}>
        <View style={styles.barLeft}>
          <Text style={styles.headerTitle}>Studio Canvas</Text>
          <Text style={styles.headerSubtitle}>
            {canvasPieces.length} {canvasPieces.length === 1 ? 'piece' : 'pieces'} styled
          </Text>
        </View>

        <View style={styles.barRight}>
          {/* Backdrop Button */}
          <Pressable
            accessibilityLabel="Select backdrop atmosphere"
            accessibilityRole="button"
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowBackdropModal(true);
            }}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Ionicons name="color-filter-outline" size={17} color={c.onSurface} />
          </Pressable>

          {/* Smart Shuffle Stylist */}
          <Pressable
            accessibilityLabel="Generate smart styling look"
            accessibilityRole="button"
            onPress={handleShuffle}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Ionicons name="sparkles" size={16} color={c.gold} />
          </Pressable>

          {/* Saved Looks Modal Trigger */}
          <Pressable
            accessibilityLabel="Open saved outfits"
            accessibilityRole="button"
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSavedModal(true);
            }}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Ionicons name="bookmark-outline" size={17} color={c.onSurface} />
          </Pressable>

          {/* Save Current Look */}
          {canvasPieces.length > 0 && (
            <Pressable
              accessibilityLabel="Save styled look"
              accessibilityRole="button"
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSavePrompt(true);
              }}
              style={({ pressed }) => [styles.toolBtn, styles.saveBtnActive, pressed && styles.pressed]}
            >
              <Ionicons name="heart" size={16} color={c.gold} />
            </Pressable>
          )}

          {/* Export Lookbook Flatlay */}
          {canvasPieces.length > 0 && (
            <Pressable
              accessibilityLabel="Export lookbook flatlay"
              accessibilityRole="button"
              onPress={handleExport}
              disabled={isExporting}
              style={({ pressed }) => [
                styles.toolBtn,
                styles.exportBtnActive,
                pressed && styles.pressed,
              ]}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={c.onPrimary} />
              ) : (
                <Ionicons name="share-outline" size={17} color={c.onPrimary} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Interactive Canvas Board */}
      <View
        ref={canvasRef}
        collapsable={false}
        style={[
          styles.canvasBoard,
          { backgroundColor: activeBackdropBg },
          backdrop === 'grid' && styles.gridBorder,
        ]}
        {...canvasBoardResponder.panHandlers}
      >
        <Pressable
          accessibilityLabel="Canvas surface"
          style={StyleSheet.absoluteFill}
          onPress={() => setSelectedInstanceId(null)}
        >
          {canvasPieces.length === 0 ? (
            <View style={styles.emptyCanvasNotice} pointerEvents="none">
              <Ionicons name="shirt-outline" size={38} color={c.onSurfaceVariant} />
              <Text style={styles.emptyCanvasTitle}>An empty canvas awaits</Text>
              <Text style={styles.emptyCanvasSubtitle}>
                Add pieces from the tray below or tap the sparkle icon to generate a styled look.
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
                onSendToBack={() => handleSendToBack(piece.instanceId)}
                onUpdateScale={(newScale) => handleUpdateScale(piece.instanceId, newScale)}
                onMoveEnd={(x, y) => handleUpdatePosition(piece.instanceId, x, y)}
                palette={c}
              />
            ))
          )}
        </Pressable>

        {/* Floating Quick Action Dock */}
        {!isExporting && (
          <View style={styles.canvasCornerDock}>
            <Pressable
              accessibilityLabel="Shuffle styling look"
              accessibilityRole="button"
              onPress={handleShuffle}
              hitSlop={6}
              style={({ pressed }) => [styles.cornerDockBtn, pressed && styles.pressed]}
            >
              <Ionicons name="shuffle" size={15} color={c.onSurface} />
            </Pressable>

            {canvasPieces.length > 0 && (
              <Pressable
                accessibilityLabel="Clear canvas"
                accessibilityRole="button"
                onPress={handleClear}
                hitSlop={6}
                style={({ pressed }) => [styles.cornerDockBtn, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={15} color={c.error} />
              </Pressable>
            )}
          </View>
        )}

        {/* Undo Floating Banner */}
        {!isExporting && lastRemovedPiece && (
          <View style={styles.undoBanner}>
            <Text style={styles.undoText}>Piece removed</Text>
            <Pressable
              accessibilityLabel="Undo piece removal"
              accessibilityRole="button"
              onPress={handleUndoRemove}
              hitSlop={8}
              style={styles.undoBtn}
            >
              <Text style={styles.undoBtnText}>Undo</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Wardrobe Tray / Drawer */}
      <PieceDrawer items={items} onAddPiece={handleAddPiece} />

      {/* Backdrop Selector Modal */}
      <BackdropSelector
        visible={showBackdropModal}
        selectedBackdrop={backdrop}
        onSelect={setBackdrop}
        onClose={() => setShowBackdropModal(false)}
      />

      {/* Saved Looks Modal */}
      <SavedLooksModal
        visible={showSavedModal}
        savedOutfits={savedOutfits}
        items={items}
        onClose={() => setShowSavedModal(false)}
        onLoadOutfit={handleLoadOutfit}
        onDeleteOutfit={handleDeleteSavedOutfit}
      />

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
              placeholder="e.g. Silk Minimal Ensemble"
              placeholderTextColor={c.onSurfaceVariant}
              style={styles.promptInput}
              autoFocus
            />

            <View style={styles.promptActions}>
              <Pressable
                accessibilityLabel="Cancel saving look"
                accessibilityRole="button"
                onPress={() => setShowSavePrompt(false)}
                style={[styles.promptBtn, styles.promptCancelBtn]}
              >
                <Text style={styles.promptCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Confirm save look"
                accessibilityRole="button"
                onPress={handleSaveLookConfirm}
                style={[styles.promptBtn, styles.promptSaveBtn]}
              >
                <Text style={styles.promptSaveText}>Save Look</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
              <Pressable
                accessibilityLabel="Close export modal"
                accessibilityRole="button"
                onPress={() => setShowExportModal(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color={c.onSurface} />
              </Pressable>
            </View>

            {exportedImageUri && (
              <View style={styles.exportPreviewWrap}>
                <Image
                  source={{ uri: exportedImageUri }}
                  style={styles.exportPreviewImg}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.exportActionsRow}>
              <Pressable
                accessibilityLabel="Done viewing export"
                accessibilityRole="button"
                onPress={() => setShowExportModal(false)}
                style={[styles.exportActionBtn, styles.exportDoneBtn]}
              >
                <Text style={styles.exportDoneBtnText}>Done</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Share lookbook to apps"
                accessibilityRole="button"
                onPress={handleNativeShare}
                style={[styles.exportActionBtn, styles.exportShareBtn]}
              >
                <Ionicons name="share-social" size={17} color={c.onPrimary} />
                <Text style={styles.exportShareBtnText}>Share Lookbook</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.surface,
    },
    topControlBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
      backgroundColor: c.surface,
    },
    barLeft: {
      flex: 1,
    },
    headerTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 20,
      color: c.onSurface,
    },
    headerSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 1,
    },
    barRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toolBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    saveBtnActive: {
      borderColor: c.gold,
      backgroundColor: c.goldContainer,
    },
    exportBtnActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    canvasBoard: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    },
    gridBorder: {
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    emptyCanvasNotice: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 8,
    },
    emptyCanvasTitle: {
      fontFamily: fonts.displayMedium,
      fontSize: 17,
      color: c.onSurface,
      marginTop: 6,
    },
    emptyCanvasSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 18,
    },
    canvasCornerDock: {
      position: 'absolute',
      top: 14,
      right: 14,
      gap: 8,
      zIndex: 999,
    },
    cornerDockBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    undoBanner: {
      position: 'absolute',
      bottom: 16,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: shapes.full,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 1000,
    },
    undoText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.onPrimary,
    },
    undoBtn: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      backgroundColor: c.gold,
      borderRadius: shapes.full,
    },
    undoBtnText: {
      fontFamily: fonts.bold,
      fontSize: 12,
      color: '#FFFFFF',
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
      backgroundColor: c.surfaceContainer,
      borderRadius: shapes.lg,
      padding: 20,
      gap: 12,
    },
    promptTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 18,
      color: c.onSurface,
    },
    promptSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
    },
    promptInput: {
      fontFamily: fonts.medium,
      fontSize: 14,
      color: c.onSurface,
      backgroundColor: c.surfaceVariant,
      borderRadius: shapes.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    promptActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 4,
    },
    promptBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: shapes.sm,
    },
    promptCancelBtn: {
      backgroundColor: c.surfaceVariant,
    },
    promptCancelText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.onSurface,
    },
    promptSaveBtn: {
      backgroundColor: c.primary,
    },
    promptSaveText: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      color: c.onPrimary,
    },
    exportModalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: c.surfaceContainer,
      borderRadius: shapes.xl,
      padding: 20,
    },
    exportModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    exportModalTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 18,
      color: c.onSurface,
    },
    exportPreviewWrap: {
      width: '100%',
      height: 280,
      borderRadius: shapes.md,
      overflow: 'hidden',
      backgroundColor: c.imageBg,
      marginBottom: 18,
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: shapes.md,
      gap: 8,
    },
    exportDoneBtn: {
      backgroundColor: c.surfaceVariant,
    },
    exportDoneBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: c.onSurface,
    },
    exportShareBtn: {
      backgroundColor: c.primary,
    },
    exportShareBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: c.onPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
