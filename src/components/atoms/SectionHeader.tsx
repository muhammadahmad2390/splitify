import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/theme';

const { colors, spacing, fontSize, fontWeight } = theme;

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  count?: number;
}

const SectionHeader = ({
  title,
  actionLabel,
  onAction,
  count,
}: SectionHeaderProps) => {
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      {count !== undefined && (
        <Text style={s.count}>{count}</Text>
      )}
      {actionLabel && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.6}>
          <Text style={s.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  count: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  action: {
    fontSize: fontSize.xs,
    color: colors.primaryDark,
  },
});

export default SectionHeader;
