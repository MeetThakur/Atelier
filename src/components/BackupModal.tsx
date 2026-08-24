import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportFullBackup, importFullBackup } from '../lib/storage';
import { useTheme, fonts, shapes, type Palette } from '../theme';
import type { Item } from '../types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRestoreSuccess: (items: Item[]) => void;
};

export function BackupModal({ visible, onClose, onRestoreSuccess }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showRestoreInput, setShowRestoreInput] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const backupJson = await exportFullBackup();
      const filename = `atelier_wardrobe_backup_${Date.now()}.json`;
      const tempFile = new File(Paths.cache, filename);
      if (tempFile.exists) tempFile.delete();
      tempFile.create();
      tempFile.write(backupJson);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFile.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Atelier Wardrobe Backup',
        });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Sharing Unavailable', 'File sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Export Failed', 'Could not generate wardrobe backup file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!importJsonText.trim()) {
      Alert.alert('Empty Backup', 'Please paste the backup JSON data to restore.');
      return;
    }

    try {
      setIsImporting(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await importFullBackup(importJsonText.trim());
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Restore Complete',
        `Successfully restored ${result.items.length} wardrobe pieces and ${result.outfits.length} saved looks.`
      );
      onRestoreSuccess(result.items);
      setShowRestoreInput(false);
      setImportJsonText('');
      onClose();
    } catch (err: any) {
      Alert.alert('Restore Failed', err.message || 'Invalid or corrupted backup JSON data.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          accessibilityLabel="Dismiss backup modal"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Wardrobe Backup & Sync</Text>
              <Text style={styles.modalSubtitle}>Export or restore your offline atelier data</Text>
            </View>
            <Pressable
              accessibilityLabel="Close backup modal"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={c.onSurface} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyScroll}
          >
            {/* Export Card */}
            <View style={styles.actionSectionCard}>
              <View style={styles.sectionIconRow}>
                <View style={[styles.sectionIconWrap, { backgroundColor: c.goldContainer }]}>
                  <Ionicons name="cloud-upload-outline" size={20} color={c.gold} />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionTitle}>Export Wardrobe</Text>
                  <Text style={styles.sectionDesc}>
                    Save your entire clothing catalogue, saved lookbook flatlays, and wear history as a single JSON file.
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityLabel="Export wardrobe backup"
                accessibilityRole="button"
                onPress={handleExport}
                disabled={isExporting}
                style={({ pressed }) => [styles.primaryActionBtn, pressed && styles.pressed]}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={c.onPrimary} />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={16} color={c.onPrimary} />
                    <Text style={styles.primaryActionBtnText}>Export JSON Backup</Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Restore Card */}
            <View style={styles.actionSectionCard}>
              <View style={styles.sectionIconRow}>
                <View style={[styles.sectionIconWrap, { backgroundColor: c.catTopsBg }]}>
                  <Ionicons name="cloud-download-outline" size={20} color={c.catTops} />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionTitle}>Restore Wardrobe</Text>
                  <Text style={styles.sectionDesc}>
                    Restore your wardrobe catalogue from a previously exported backup file.
                  </Text>
                </View>
              </View>

              {!showRestoreInput ? (
                <Pressable
                  accessibilityLabel="Enter restore data"
                  accessibilityRole="button"
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowRestoreInput(true);
                  }}
                  style={({ pressed }) => [styles.secondaryActionBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="document-text-outline" size={16} color={c.onSurface} />
                  <Text style={styles.secondaryActionBtnText}>Paste Backup Data</Text>
                </Pressable>
              ) : (
                <View style={styles.restoreInputBox}>
                  <TextInput
                    value={importJsonText}
                    onChangeText={setImportJsonText}
                    placeholder="Paste exported JSON content here..."
                    placeholderTextColor={c.onSurfaceVariant}
                    multiline
                    numberOfLines={4}
                    style={styles.jsonInput}
                  />

                  <View style={styles.restoreActionsRow}>
                    <Pressable
                      accessibilityLabel="Cancel restore"
                      accessibilityRole="button"
                      onPress={() => setShowRestoreInput(false)}
                      style={[styles.smallBtn, styles.cancelRestoreBtn]}
                    >
                      <Text style={styles.cancelRestoreBtnText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      accessibilityLabel="Confirm restore"
                      accessibilityRole="button"
                      onPress={handleConfirmRestore}
                      disabled={isImporting}
                      style={[styles.smallBtn, styles.confirmRestoreBtn]}
                    >
                      {isImporting ? (
                        <ActivityIndicator size="small" color={c.onPrimary} />
                      ) : (
                        <Text style={styles.confirmRestoreBtnText}>Restore Data</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
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
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
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
    bodyScroll: {
      gap: 16,
      paddingBottom: 12,
    },
    actionSectionCard: {
      backgroundColor: c.surfaceVariant,
      borderRadius: shapes.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    sectionIconRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },
    sectionIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionInfo: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: 16,
      color: c.onSurface,
      marginBottom: 3,
    },
    sectionDesc: {
      fontFamily: fonts.regular,
      fontSize: 12.5,
      color: c.onSurfaceVariant,
      lineHeight: 17,
    },
    primaryActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.primary,
      paddingVertical: 12,
      borderRadius: shapes.md,
    },
    primaryActionBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: c.onPrimary,
    },
    secondaryActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.surfaceContainer,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingVertical: 12,
      borderRadius: shapes.md,
    },
    secondaryActionBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: c.onSurface,
    },
    restoreInputBox: {
      marginTop: 8,
      gap: 10,
    },
    jsonInput: {
      backgroundColor: c.surfaceContainer,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: shapes.md,
      padding: 12,
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurface,
      minHeight: 90,
      textAlignVertical: 'top',
    },
    restoreActionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    smallBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: shapes.sm,
    },
    cancelRestoreBtn: {
      backgroundColor: c.surfaceContainer,
    },
    cancelRestoreBtnText: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: c.onSurface,
    },
    confirmRestoreBtn: {
      backgroundColor: c.primary,
    },
    confirmRestoreBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: c.onPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
