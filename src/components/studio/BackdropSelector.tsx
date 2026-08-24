import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts, shapes, type Palette } from '../../theme';
import type { CanvasBackdrop } from './canvasTypes';
import { BACKDROPS } from './canvasUtils';

type Props = {
  visible: boolean;
  selectedBackdrop: CanvasBackdrop;
  onSelect: (backdrop: CanvasBackdrop) => void;
  onClose: () => void;
};

export function BackdropSelector({
  visible,
  selectedBackdrop,
  onSelect,
  onClose,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          accessibilityLabel="Dismiss backdrop selector"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={styles.backdropModalCard}>
          <View style={styles.savedModalHeader}>
            <View>
              <Text style={styles.savedModalTitle}>Studio Backdrops</Text>
              <Text style={styles.backdropModalSubtitle}>
                Choose canvas lighting & atmosphere
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close backdrop selector"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeSavedBtn}
            >
              <Ionicons name="close" size={20} color={c.onSurface} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.backdropGridList}
          >
            {BACKDROPS.map((b) => {
              const isSelected = b.id === selectedBackdrop;
              const previewBg = c.surface === '#0E0E12' ? b.bgDark : b.bgLight;
              return (
                <Pressable
                  key={b.id}
                  accessibilityLabel={`Backdrop: ${b.label}, ${b.sublabel}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    onSelect(b.id);
                    onClose();
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
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: c.scrim,
      justifyContent: 'flex-end',
    },
    backdropModalCard: {
      backgroundColor: c.surfaceContainer,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 36,
      maxHeight: '75%',
    },
    savedModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
    },
    savedModalTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 20,
      color: c.onSurface,
    },
    backdropModalSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    closeSavedBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backdropGridList: {
      gap: 10,
      paddingBottom: 12,
    },
    backdropOptionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: shapes.md,
      backgroundColor: c.surfaceVariant,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    backdropOptionCardSelected: {
      borderColor: c.gold,
      backgroundColor: c.goldContainer,
    },
    backdropOptionPreview: {
      width: 44,
      height: 44,
      borderRadius: shapes.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    backdropOptionInfo: {
      flex: 1,
    },
    backdropOptionName: {
      fontFamily: fonts.semiBold,
      fontSize: 15,
      color: c.onSurface,
    },
    backdropOptionSub: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
