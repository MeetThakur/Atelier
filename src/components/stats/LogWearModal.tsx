import React, { useState } from 'react';
import {
  Image,
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
import { categories } from '../../constants';
import type { Category, Item } from '../../types';

type Props = {
  visible: boolean;
  selectedDateKey: string;
  items: Item[];
  initialPieceIds: string[];
  onClose: () => void;
  onSave: (pieceIds: string[]) => void;
};

function formatPrettyDate(dateKey: string): string {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function LogWearModal({
  visible,
  selectedDateKey,
  items,
  initialPieceIds,
  onClose,
  onSave,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [selectedPieceIds, setSelectedPieceIds] = useState<string[]>(initialPieceIds);
  const [modalCategory, setModalCategory] = useState<Category>('All');

  const handleTogglePiece = (pieceId: string) => {
    void Haptics.selectionAsync();
    setSelectedPieceIds((prev) =>
      prev.includes(pieceId) ? prev.filter((id) => id !== pieceId) : [...prev, pieceId]
    );
  };

  const handleSave = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(selectedPieceIds);
    onClose();
  };

  const filteredItems = items.filter(
    (item) => modalCategory === 'All' || item.category === modalCategory
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          accessibilityLabel="Dismiss outfit logger"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Log Worn Outfit</Text>
              <Text style={styles.modalSubtitle}>{formatPrettyDate(selectedDateKey)}</Text>
            </View>
            <Pressable
              accessibilityLabel="Close modal"
              accessibilityRole="button"
              onPress={onClose}
              hitSlop={8}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={c.onSurface} />
            </Pressable>
          </View>

          {/* Category Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {categories.map((cat) => {
              const isSelected = modalCategory === cat;
              return (
                <Pressable
                  key={cat}
                  accessibilityLabel={`Filter by ${cat}`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setModalCategory(cat);
                  }}
                  style={[styles.catChip, isSelected && styles.catChipActive]}
                >
                  <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Pieces Grid */}
          <ScrollView
            style={styles.piecesList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.piecesGrid}
          >
            {filteredItems.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No pieces in this category</Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedPieceIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    accessibilityLabel={`${item.name}${isSelected ? ', selected' : ''}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => handleTogglePiece(item.id)}
                    style={({ pressed }) => [
                      styles.pieceTile,
                      isSelected && styles.pieceTileSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.pieceImg}
                      resizeMode="contain"
                    />
                    <Text style={styles.pieceName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkedBadge}>
                        <Ionicons name="checkmark" size={12} color={c.onPrimary} />
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <Text style={styles.selectedCountText}>
              {selectedPieceIds.length} {selectedPieceIds.length === 1 ? 'piece' : 'pieces'} selected
            </Text>
            <View style={styles.footerBtnRow}>
              <Pressable
                accessibilityLabel="Cancel logging"
                accessibilityRole="button"
                onPress={onClose}
                style={[styles.actionBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Save logged outfit"
                accessibilityRole="button"
                onPress={handleSave}
                style={[styles.actionBtn, styles.saveBtn]}
              >
                <Text style={styles.saveBtnText}>Save Look</Text>
              </Pressable>
            </View>
          </View>
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
    modalCard: {
      backgroundColor: c.surfaceContainer,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 36,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 20,
      color: c.onSurface,
    },
    modalSubtitle: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catRow: {
      gap: 8,
      paddingBottom: 14,
    },
    catChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceVariant,
    },
    catChipActive: {
      backgroundColor: c.primary,
    },
    catChipText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.onSurfaceVariant,
    },
    catChipTextActive: {
      color: c.onPrimary,
      fontFamily: fonts.semiBold,
    },
    piecesList: {
      maxHeight: 320,
    },
    piecesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingBottom: 14,
    },
    emptyWrap: {
      width: '100%',
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      fontStyle: 'italic',
    },
    pieceTile: {
      width: '30.8%',
      aspectRatio: 0.85,
      borderRadius: shapes.md,
      backgroundColor: c.surfaceVariant,
      borderWidth: 1.5,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      position: 'relative',
    },
    pieceTileSelected: {
      borderColor: c.gold,
      backgroundColor: c.goldContainer,
    },
    pieceImg: {
      width: '80%',
      height: '70%',
    },
    pieceName: {
      fontFamily: fonts.regular,
      fontSize: 11,
      color: c.onSurface,
      marginTop: 4,
      textAlign: 'center',
    },
    checkedBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: c.outlineVariant,
    },
    selectedCountText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.onSurfaceVariant,
    },
    footerBtnRow: {
      flexDirection: 'row',
      gap: 10,
    },
    actionBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: shapes.md,
    },
    cancelBtn: {
      backgroundColor: c.surfaceVariant,
    },
    cancelBtnText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.onSurface,
    },
    saveBtn: {
      backgroundColor: c.primary,
    },
    saveBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      color: c.onPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
