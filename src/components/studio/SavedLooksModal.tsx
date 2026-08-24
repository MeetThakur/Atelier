import React from 'react';
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
import type { Item, SavedOutfit } from '../../types';
import { resolvePieceImage } from './canvasUtils';

type Props = {
  visible: boolean;
  savedOutfits: SavedOutfit[];
  items: Item[];
  onClose: () => void;
  onLoadOutfit: (outfit: SavedOutfit) => void;
  onDeleteOutfit: (id: string) => void;
};

export function SavedLooksModal({
  visible,
  savedOutfits,
  items,
  onClose,
  onLoadOutfit,
  onDeleteOutfit,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          accessibilityLabel="Dismiss saved outfits"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={styles.savedModalCard}>
          <View style={styles.savedModalHeader}>
            <View>
              <Text style={styles.savedModalTitle}>Saved Outfits</Text>
              <Text style={styles.savedModalSubtitle}>
                {savedOutfits.length} curated styling {savedOutfits.length === 1 ? 'look' : 'looks'}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close saved outfits modal"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeSavedBtn}
            >
              <Ionicons name="close" size={20} color={c.onSurface} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.savedOutfitsList}
          >
            {savedOutfits.length === 0 ? (
              <View style={styles.emptySavedWrap}>
                <Ionicons name="bookmark-outline" size={38} color={c.onSurfaceVariant} />
                <Text style={styles.emptySavedTitle}>No saved looks yet</Text>
                <Text style={styles.emptySavedText}>
                  Style an outfit on the canvas and tap Save Look to build your lookbook.
                </Text>
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
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.savedThumbsRow}
                      >
                        {validPieces.map((p, i) => (
                          <Image
                            key={i}
                            source={{ uri: p.image }}
                            style={styles.savedMiniThumb}
                            resizeMode="contain"
                          />
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.savedOutfitActions}>
                      <Pressable
                        accessibilityLabel={`Load look: ${outfit.name}`}
                        accessibilityRole="button"
                        onPress={() => {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          onLoadOutfit(outfit);
                        }}
                        style={[
                          styles.loadOutfitBtn,
                          validPieces.length === 0 && styles.btnDisabled,
                        ]}
                      >
                        <Text style={styles.loadOutfitBtnText}>Load</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Delete saved look: ${outfit.name}`}
                        accessibilityRole="button"
                        onPress={() => {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          onDeleteOutfit(outfit.id);
                        }}
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
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: c.scrim,
      justifyContent: 'flex-end',
    },
    savedModalCard: {
      backgroundColor: c.surfaceContainer,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 36,
      maxHeight: '80%',
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
    savedModalSubtitle: {
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
    savedOutfitsList: {
      gap: 12,
      paddingBottom: 16,
    },
    emptySavedWrap: {
      alignItems: 'center',
      paddingVertical: 36,
      gap: 8,
    },
    emptySavedTitle: {
      fontFamily: fonts.semiBold,
      fontSize: 16,
      color: c.onSurface,
      marginTop: 4,
    },
    emptySavedText: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    savedOutfitCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: shapes.md,
      backgroundColor: c.surfaceVariant,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    savedOutfitInfo: {
      flex: 1,
      marginRight: 12,
    },
    savedOutfitName: {
      fontFamily: fonts.semiBold,
      fontSize: 15,
      color: c.onSurface,
    },
    savedOutfitDate: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    savedThumbsRow: {
      flexDirection: 'row',
      marginTop: 8,
    },
    savedMiniThumb: {
      width: 40,
      height: 40,
      borderRadius: shapes.xs,
      marginRight: 6,
      backgroundColor: c.imageBg,
    },
    savedOutfitActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadOutfitBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: shapes.sm,
      backgroundColor: c.primary,
    },
    loadOutfitBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      color: c.onPrimary,
    },
    deleteOutfitBtn: {
      padding: 8,
      borderRadius: shapes.sm,
      backgroundColor: c.errorContainer,
    },
    btnDisabled: {
      opacity: 0.4,
    },
  });
}
