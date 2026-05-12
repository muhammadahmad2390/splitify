import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import Avatar from '@/components/atoms/Avatar';
import { getMemberColor } from '@/components/molecules/MemberStack';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

export interface ActivityItemData {
  _id: string;
  type: 'expense' | 'settlement';
  actor: { name: string; avatar?: string };
  to?: { name: string };
  description?: string;
  amount: number;
  group: { title: string };
  status?: 'pending' | 'completed' | 'cancelled';
  receipt?: string;
  createdAt: string;
}

interface ActivityItemProps {
  item: ActivityItemData;
  onViewReceipt?: (url: string) => void;
}

const ActivityItem = ({ item, onViewReceipt }: ActivityItemProps) => {
  const { type, actor, to, description, amount, group, status, receipt } = item;

  const label =
    type === 'expense'
      ? `paid ${description}`
      : `settled Rs ${amount.toLocaleString()} with ${to?.name ?? ''}`;

  return (
    <View style={s.row}>
      <Avatar
        name={actor.name}
        color={getMemberColor(actor.name)}
        size={34}
      />
      <View style={s.content}>
        <Text style={s.text} numberOfLines={2}>
          <Text style={s.bold}>{actor.name}</Text> {label} ·{' '}
          <Text style={s.groupName}>{group.title}</Text>
        </Text>
        <Text style={s.time}>{item.createdAt}</Text>

        {/* Receipt button for settlements */}
        {type === 'settlement' && receipt && (
          <TouchableOpacity
            style={s.receiptBtn}
            onPress={() => onViewReceipt?.(receipt)}
            activeOpacity={0.7}
          >
            <Text style={s.receiptBtnText}>🖼 View receipt</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Amount — only show for expenses */}
      {type === 'expense' && (
        <Text style={s.amount}>Rs {amount.toLocaleString()}</Text>
      )}

      {/* Status badge — only for settlements */}
      {type === 'settlement' && status && (
        <View
          style={[
            s.statusBadge,
            status === 'completed'
              ? s.badgeGreen
              : status === 'cancelled'
              ? s.badgeRed
              : s.badgeAmber,
          ]}
        >
          <Text
            style={[
              s.statusText,
              {
                color:
                  status === 'completed'
                    ? colors.success
                    : status === 'cancelled'
                    ? colors.danger
                    : '#b45309',
              },
            ]}
          >
            {status === 'completed'
              ? 'Accepted'
              : status === 'cancelled'
              ? 'Declined'
              : 'Pending'}
          </Text>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: fontSize.sm * 1.4,
  },
  bold: {
    fontWeight: fontWeight.semibold,
  },
  groupName: {
    color: colors.textSecondary,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  receiptBtn: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    alignSelf: 'flex-start',
  },
  receiptBtnText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  badgeRed: {
    backgroundColor: '#fff1f2',
    borderColor: '#fda4af',
  },
  badgeAmber: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});

export default ActivityItem;
