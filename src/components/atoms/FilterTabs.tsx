import { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '@/theme';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

export type FilterOption<T extends string> = {
  key: T;
  label: string;
};

interface FilterTabsProps<T extends string> {
  options: FilterOption<T>[];
  selected: T;
  onSelect: (key: T) => void;
}

function FilterTabs<T extends string>({
  options,
  selected,
  onSelect,
}: FilterTabsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
    >
      {options.map(opt => {
        const isActive = opt.key === selected;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[s.tab, isActive && s.tabActive]}
            onPress={() => onSelect(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[s.label, isActive && s.labelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    backgroundColor: colors.bgCard,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  labelActive: {
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },
});

export default FilterTabs;
