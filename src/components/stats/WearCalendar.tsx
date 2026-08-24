import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts, shapes, type Palette } from '../../theme';
import type { DailyLogEntry, Item } from '../../types';
import type { MonthDayCell } from './statsTypes';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = {
  viewDate: Date;
  selectedDateKey: string;
  mergedDailyLogs: Record<string, DailyLogEntry>;
  items: Item[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onSelectDate: (dateKey: string) => void;
  onOpenLogModal: () => void;
  onRemoveLog: () => void;
};

function formatMonthHeader(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatPrettyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function WearCalendar({
  viewDate,
  selectedDateKey,
  mergedDailyLogs,
  items,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onSelectDate,
  onOpenLogModal,
  onRemoveLog,
}: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayKey = formatDateKey(new Date());

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Monday-based week index (0 = Monday, 6 = Sunday)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const days: MonthDayCell[] = [];

    // Empty lead days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dateKey: `pad-${i}`, dayNum: 0, isCurrentMonth: false });
    }

    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateKey: key, dayNum: d, isCurrentMonth: true });
    }

    return days;
  }, [year, month]);

  const selectedLog = mergedDailyLogs[selectedDateKey];
  const selectedLoggedPieces = useMemo(() => {
    if (!selectedLog || !selectedLog.pieceIds) return [];
    return selectedLog.pieceIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is Item => Boolean(i));
  }, [selectedLog, items]);

  return (
    <View style={styles.calendarCard}>
      {/* Month Navigator Header */}
      <View style={styles.monthHeaderRow}>
        <View>
          <Text style={styles.monthTitle}>{formatMonthHeader(viewDate)}</Text>
          <Text style={styles.monthSub}>Daily Wear History</Text>
        </View>

        <View style={styles.navControls}>
          <Pressable
            accessibilityLabel="Go to current date"
            accessibilityRole="button"
            onPress={onGoToToday}
            style={({ pressed }) => [styles.todayPill, pressed && styles.pressed]}
          >
            <Text style={styles.todayPillText}>Today</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Previous month"
            accessibilityRole="button"
            onPress={onPrevMonth}
            style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={16} color={c.onSurface} />
          </Pressable>

          <Pressable
            accessibilityLabel="Next month"
            accessibilityRole="button"
            onPress={onNextMonth}
            style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-forward" size={16} color={c.onSurface} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Row */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w, idx) => (
          <Text key={idx} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      {/* Calendar Days Matrix */}
      <View style={styles.daysGrid}>
        {daysInMonth.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <View key={idx} style={styles.padDayCell} />;
          }

          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayKey;
          const log = mergedDailyLogs[cell.dateKey];
          const hasLog = Boolean(log && log.pieceIds && log.pieceIds.length > 0);

          return (
            <Pressable
              key={cell.dateKey}
              accessibilityLabel={`Date: ${cell.dateKey}${hasLog ? ', outfit logged' : ''}`}
              accessibilityRole="button"
              onPress={() => {
                void Haptics.selectionAsync();
                onSelectDate(cell.dateKey);
              }}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
              ]}
            >
              <Text
                style={[
                  styles.dayNumText,
                  isSelected && styles.dayNumTextSelected,
                  isToday && !isSelected && styles.dayNumTextToday,
                ]}
              >
                {cell.dayNum}
              </Text>

              {hasLog && (
                <View
                  style={[
                    styles.wearDot,
                    isSelected ? styles.wearDotSelected : { backgroundColor: c.gold },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Selected Day Details Section */}
      <View style={styles.selectedDayBox}>
        <View style={styles.selectedDayHeader}>
          <View>
            <Text style={styles.selectedDayTitle}>
              {formatPrettyDate(selectedDateKey)}
            </Text>
            <Text style={styles.selectedDaySubtitle}>
              {selectedLoggedPieces.length > 0
                ? `${selectedLoggedPieces.length} pieces worn`
                : 'No outfit logged for this day'}
            </Text>
          </View>

          <View style={styles.dayActionRow}>
            {selectedLoggedPieces.length > 0 && (
              <Pressable
                accessibilityLabel="Clear day log"
                accessibilityRole="button"
                onPress={onRemoveLog}
                style={({ pressed }) => [styles.clearDayBtn, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={15} color={c.error} />
              </Pressable>
            )}

            <Pressable
              accessibilityLabel="Log pieces worn on this day"
              accessibilityRole="button"
              onPress={onOpenLogModal}
              style={({ pressed }) => [styles.logOutfitBtn, pressed && styles.pressed]}
            >
              <Ionicons
                name={selectedLoggedPieces.length > 0 ? 'pencil' : 'add'}
                size={14}
                color={c.onPrimary}
              />
              <Text style={styles.logOutfitBtnText}>
                {selectedLoggedPieces.length > 0 ? 'Edit' : 'Log Outfit'}
              </Text>
            </Pressable>
          </View>
        </View>

        {selectedLoggedPieces.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.loggedPiecesRow}
          >
            {selectedLoggedPieces.map((piece) => (
              <View key={piece.id} style={styles.loggedPieceCard}>
                <Image
                  source={{ uri: piece.image }}
                  style={styles.loggedPieceImg}
                  resizeMode="contain"
                />
                <Text style={styles.loggedPieceName} numberOfLines={1}>
                  {piece.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    calendarCard: {
      backgroundColor: c.surfaceContainer,
      borderRadius: shapes.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginBottom: 20,
    },
    monthHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    monthTitle: {
      fontFamily: fonts.displaySemiBold,
      fontSize: 18,
      color: c.onSurface,
    },
    monthSub: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    navControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    todayPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: shapes.full,
      backgroundColor: c.surfaceVariant,
      marginRight: 4,
    },
    todayPillText: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      color: c.onSurface,
    },
    arrowBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: c.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekdayRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
      marginBottom: 8,
    },
    weekdayText: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      color: c.onSurfaceVariant,
      width: 38,
      textAlign: 'center',
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    padDayCell: {
      width: '14.28%',
      height: 42,
    },
    dayCell: {
      width: '14.28%',
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: shapes.sm,
      position: 'relative',
    },
    dayCellSelected: {
      backgroundColor: c.primary,
    },
    dayCellToday: {
      borderWidth: 1,
      borderColor: c.gold,
    },
    dayNumText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.onSurface,
    },
    dayNumTextSelected: {
      color: c.onPrimary,
      fontFamily: fonts.bold,
    },
    dayNumTextToday: {
      color: c.gold,
      fontFamily: fonts.bold,
    },
    wearDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      position: 'absolute',
      bottom: 4,
    },
    wearDotSelected: {
      backgroundColor: c.onPrimary,
    },
    selectedDayBox: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: c.outlineVariant,
    },
    selectedDayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedDayTitle: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: c.onSurface,
    },
    selectedDaySubtitle: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    dayActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    clearDayBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.errorContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logOutfitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: shapes.full,
      backgroundColor: c.primary,
    },
    logOutfitBtnText: {
      fontFamily: fonts.semiBold,
      fontSize: 12,
      color: c.onPrimary,
    },
    loggedPiecesRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
      paddingBottom: 4,
    },
    loggedPieceCard: {
      width: 64,
      alignItems: 'center',
      padding: 4,
      borderRadius: shapes.sm,
      backgroundColor: c.surfaceVariant,
    },
    loggedPieceImg: {
      width: 52,
      height: 52,
      borderRadius: shapes.xs,
    },
    loggedPieceName: {
      fontFamily: fonts.regular,
      fontSize: 10,
      color: c.onSurface,
      marginTop: 4,
      textAlign: 'center',
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
