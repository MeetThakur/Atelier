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

  const SEASON_COLORS: Record<string, { color: string; bg: string }> = {
    Spring: { color: c.seasonSpring, bg: c.seasonSpringBg },
    Summer: { color: c.seasonSummer, bg: c.seasonSummerBg },
    Fall: { color: c.seasonFall, bg: c.seasonFallBg },
    Winter: { color: c.seasonWinter, bg: c.seasonWinterBg },
    All: { color: c.gold, bg: c.goldContainer },
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
            <View>
              <Text style={styles.title}>Season Filter</Text>
              <Text style={styles.subtitle}>Refine wardrobe collection</Text>
            </View>
            <View style={styles.headerActions}>
              {hasActiveFilters && (
                <Pressable onPress={handleClear} hitSlop={8} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Reset</Text>
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={19} color={c.onSurface} />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            <View style={styles.seasonGrid}>
              <Pressable
                onPress={() => handleSeasonSelect('All')}
                style={({ pressed }) => [
                  styles.seasonTile,
                  selectedSeason === 'All' && styles.seasonTileSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.seasonIconWrap,
                    {
                      backgroundColor:
                        selectedSeason === 'All' ? SEASON_COLORS.All.bg : c.surfaceContainerHigh,
                    },
                  ]}
                >
                  <Ionicons
                    name="grid-outline"
                    size={17}
                    color={selectedSeason === 'All' ? c.gold : c.onSurfaceVariant}
                  />
                </View>
                <View style={styles.seasonTileInfo}>
                  <Text
                    style={[
                      styles.seasonTileText,
                      selectedSeason === 'All' && styles.seasonTileTextSelected,
                    ]}
                  >
                    All Seasons
                  </Text>
                  <Text style={styles.seasonTileSub}>Complete wardrobe</Text>
                </View>
                {selectedSeason === 'All' && (
                  <Ionicons name="checkmark-circle" size={18} color={c.gold} />
                )}
              </Pressable>

              {seasons.map((s) => {
                const isSelected = selectedSeason === s;
                const iconName = SEASON_ICONS[s];
                const sc = SEASON_COLORS[s];

                return (
                  <Pressable
                    key={s}
                    onPress={() => handleSeasonSelect(s)}
                    style={({ pressed }) => [
                      styles.seasonTile,
                      isSelected && styles.seasonTileSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.seasonIconWrap,
                        {
                          backgroundColor: isSelected ? sc.bg : c.surfaceContainerHigh,
                        },
                      ]}
                    >
                      <Ionicons
                        name={iconName}
                        size={17}
                        color={isSelected ? sc.color : c.onSurfaceVariant}
                      />
                    </View>
                    <View style={styles.seasonTileInfo}>
                      <Text
                        style={[
                          styles.seasonTileText,
                          isSelected && styles.seasonTileTextSelected,
                        ]}
                      >
                        {s}
                      </Text>
                      <Text style={styles.seasonTileSub}>{s} edits</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={sc.color} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [styles.applyBtn, pressed && styles.pressed]}
            >
              <Text style={styles.applyBtnText}>
                {resultCount === 1 ? 'Show 1 Piece' : `Show ${resultCount} Pieces`}
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
      maxHeight: '75%',
      borderWidth: 1,
      borderColor: c.outlineVariant,
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
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    title: {
      fontFamily: fonts.displayBold,
      color: c.onSurface,
      fontSize: 22,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 12,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    clearBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
    },
    clearBtnText: {
      fontFamily: fonts.bold,
      color: c.gold,
      fontSize: 12,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      paddingBottom: 16,
    },
    seasonGrid: {
      gap: 8,
    },
    seasonTile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: shapes.xl,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.cardBg,
    },
    seasonTileSelected: {
      borderColor: c.gold,
      backgroundColor: c.surfaceContainerHigh,
    },
    seasonIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seasonTileInfo: {
      flex: 1,
    },
    seasonTileText: {
      fontFamily: fonts.bold,
      color: c.onSurface,
      fontSize: 14.5,
    },
    seasonTileTextSelected: {
      color: c.onSurface,
    },
    seasonTileSub: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      fontSize: 11.5,
      marginTop: 1,
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
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 2,
    },
    applyBtnText: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      fontSize: 15,
      letterSpacing: 0.2,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },
  });
