import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Palette } from '../../theme';
import type { CanvasPieceData } from './canvasTypes';

function useConst<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

export type DraggablePieceProps = {
  data: CanvasPieceData;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onUpdateScale: (newScale: number) => void;
  onMoveEnd: (x: number, y: number) => void;
  palette: Palette;
};

export function DraggablePiece({
  data,
  isSelected,
  onSelect,
  onRemove,
  onBringToFront,
  onSendToBack,
  onUpdateScale,
  onMoveEnd,
  palette,
}: DraggablePieceProps) {
  const callbacksRef = useRef({ onSelect, onRemove, onBringToFront, onSendToBack, onUpdateScale, onMoveEnd });

  useEffect(() => {
    callbacksRef.current = { onSelect, onRemove, onBringToFront, onSendToBack, onUpdateScale, onMoveEnd };
  }, [onSelect, onRemove, onBringToFront, onSendToBack, onUpdateScale, onMoveEnd]);

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
        accessibilityLabel={`Styling piece: ${data.item.name}`}
        accessibilityRole="imagebutton"
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
              accessibilityLabel="Bring piece to front"
              accessibilityRole="button"
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
              accessibilityLabel="Send piece to back"
              accessibilityRole="button"
              onPress={(e) => {
                e.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSendToBack();
              }}
              hitSlop={14}
              style={[styles.miniControlBtn, { backgroundColor: palette.secondary }]}
            >
              <Ionicons name="arrow-down" size={12} color="#FFFFFF" />
            </Pressable>

            <Pressable
              accessibilityLabel="Remove piece from canvas"
              accessibilityRole="button"
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

const styles = StyleSheet.create({
  pieceContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pieceFrame: {
    position: 'relative',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceImage: {
    width: '100%',
    height: '100%',
  },
  floatingControlsWrap: {
    position: 'absolute',
    top: -18,
    right: -14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 9999,
  },
  miniControlBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
});
