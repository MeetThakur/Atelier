import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SEASON_ICONS, seasons } from '../constants';
import type { Season } from '../types';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedSeason: Season | 'All';
  onSeasonChange: (season: Season | 'All') => void;
  onClearAll: () => void;
  resultCount: number;
};

export function FilterModal({
  visible,
  onClose,
  selectedSeason,
  onSeasonChange,
  onClearAll,
  resultCount,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const hasActiveFilters = selectedSeason !== 'All';

  const handleSeasonSelect = (season: Season | 'All') => {
    void Haptics.selectionAsync();
    onSeasonChange(season);
  };

  const handleClear = () => {
    void Haptics.selectionAsync();
    onClearAll();
  };

  const handleApply = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filter Archive</Text>
            <View style={styles.headerActions}>
              {hasActiveFilters && (
                <Pressable onPress={handleClear} hitSlop={8} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Reset</Text>
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={20} color={c.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Season Filter Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SEASON</Text>
              <View style={styles.seasonGrid}>
                <Pressable
                  onPress={() => handleSeasonSelect('All')}
                  style={({ pressed }) => [
                    styles.seasonTile,
                    selectedSeason === 'All'
                      ? styles.seasonTileSelected
                      : styles.seasonTileUnselected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="grid-outline"
                    size={16}
                    color={
                      selectedSeason === 'All' ? c.onPrimaryContainer : c.onSurfaceVariant
                    }
                  />
                  <Text
                    style={[
                      styles.seasonTileText,
                      selectedSeason === 'All'
                        ? styles.seasonTileTextSelected
                        : styles.seasonTileTextUnselected,
                    ]}
                  >
                    All Seasons
                  </Text>
                </Pressable>

                {seasons.map((s) => {
                  const isSelected = selectedSeason === s;
                  const iconName = SEASON_ICONS[s];

                  return (
                    <Pressable
                      key={s}
                      onPress={() => handleSeasonSelect(s)}
                      style={({ pressed }) => [
                        styles.seasonTile,
                        isSelected ? styles.seasonTileSelected : styles.seasonTileUnselected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name={iconName}
                        size={16}
                        color={isSelected ? c.onPrimaryContainer : c.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.seasonTileText,
                          isSelected
                            ? styles.seasonTileTextSelected
                            : styles.seasonTileTextUnselected,
                        ]}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [styles.applyBtn, pressed && styles.pressed]}
            >
              <Text style={styles.applyBtnText}>
                {resultCount === 1 ? 'Show 1 piece' : `Show ${resultCount} pieces`}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: c.scrim,
    },
    scrim: {
      flex: 1,
    },
    sheet: {
      backgroundColor: c.surfaceContainerLow,
      borderTopLeftRadius: shapes.xxl,
      borderTopRightRadius: shapes.xxl,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 36 : 24,
      maxHeight: '70%',
    },
    handle: {
      alignSelf: 'center',
      width: 32,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outlineVariant,
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 22,
      letterSpacing: 0.2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    clearBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHighest,
    },
    clearBtnText: {
      fontFamily: fonts.bold,
      color: c.primary,
      fontSize: 12,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      paddingBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontFamily: fonts.extraBold,
      color: c.onSurfaceVariant,
      fontSize: 11,
      letterSpacing: 1.1,
      marginBottom: 10,
    },
    seasonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    seasonTile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: shapes.md,
      borderWidth: 1,
      minWidth: '47%',
      flex: 1,
      justifyContent: 'center',
    },
    seasonTileSelected: {
      backgroundColor: c.primaryContainer,
      borderColor: 'transparent',
    },
    seasonTileUnselected: {
      backgroundColor: c.surfaceContainerHigh,
      borderColor: c.outlineVariant,
    },
    seasonTileText: {
      fontSize: 13,
    },
    seasonTileTextSelected: {
      fontFamily: fonts.bold,
      color: c.onPrimaryContainer,
    },
    seasonTileTextUnselected: {
      fontFamily: fonts.semiBold,
      color: c.onSurfaceVariant,
    },
    footer: {
      marginTop: 8,
    },
    applyBtn: {
      height: 48,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyBtnText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 15,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },
  });
