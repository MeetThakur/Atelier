import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { AppTab } from '../types';
import { useTheme, fonts, shapes, type Palette } from '../theme';

type Props = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export function BottomNavBar({ activeTab, onTabChange }: Props) {
  const c = useTheme();
  const styles = makeStyles(c);

  const handleTab = (tab: AppTab) => {
    if (tab !== activeTab) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabChange(tab);
    }
  };

  return (
    <View style={styles.navContainer}>
      <View style={styles.navPill}>
        <Pressable
          onPress={() => handleTab('archive')}
          style={({ pressed }) => [
            styles.tabItem,
            activeTab === 'archive' && styles.tabItemActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={activeTab === 'archive' ? 'grid' : 'grid-outline'}
            size={16}
            color={activeTab === 'archive' ? c.onPrimary : c.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'archive' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Archive
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTab('canvas')}
          style={({ pressed }) => [
            styles.tabItem,
            activeTab === 'canvas' && styles.tabItemActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={activeTab === 'canvas' ? 'color-palette' : 'color-palette-outline'}
            size={16}
            color={activeTab === 'canvas' ? c.onPrimary : c.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'canvas' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Studio
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTab('stats')}
          style={({ pressed }) => [
            styles.tabItem,
            activeTab === 'stats' && styles.tabItemActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={activeTab === 'stats' ? 'stats-chart' : 'stats-chart-outline'}
            size={16}
            color={activeTab === 'stats' ? c.onPrimary : c.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'stats' ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}
          >
            Stats
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    navContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      pointerEvents: 'box-none',
    },
    navPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.cardBg,
      borderRadius: shapes.full,
      padding: 4,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
      gap: 3,
    },
    tabItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 15,
      paddingVertical: 8.5,
      borderRadius: shapes.full,
    },
    tabItemActive: {
      backgroundColor: c.primary,
    },
    tabLabel: {
      fontSize: 12.5,
      includeFontPadding: false,
    },
    tabLabelActive: {
      fontFamily: fonts.bold,
      color: c.onPrimary,
      letterSpacing: 0.2,
    },
    tabLabelInactive: {
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
  });
