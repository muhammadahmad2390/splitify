import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import Avatar from '@/components/atoms/Avatar';
import { getMemberColor } from '@/components/molecules/MemberStack';
import type { ActivityItem as ActivityItemType } from '@/store/ActivityStore';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

interface ActivityItemProps {
  item: ActivityItemType;
  onPress?: () => void;
  onViewReceipt?: (url: string) => void;
}

// ─── Label builder ────────────────────────────────────────────────────────────

function buildLabel(item: ActivityItemType): {
  action: string;
  detail?: string;
} {
  const { type, snapshot } = item;
  const toName = snapshot.toUser?.name ?? 'someone';
  const amount = snapshot.amount
    ? `Rs ${snapshot.amount.toLocaleString()}`
    : '';

  switch (type) {
    case 'expense_added':
      return { action: 'paid', detail: snapshot.description ?? '' };

    case 'expense_updated':
      return { action: 'updated', detail: snapshot.description ?? '' };

    case 'expense_deleted':
      return { action: 'deleted', detail: snapshot.description ?? '' };

    case 'settlement_created':
      return { action: `sent ${amount} to`, detail: toName };

    case 'settlement_accepted':
      return { action: `accepted ${amount} from`, detail: toName };

    case 'settlement_declined':
      return { action: `declined ${amount} from`, detail: toName };

    default:
      return { action: 'did something' };
  }
}

// ─── Icon per type ────────────────────────────────────────────────────────────

function getTypeIcon(type: ActivityItemType['type']): string {
  switch (type) {
    case 'expense_added':    return '＋';
    case 'expense_updated':  return '✎';
    case 'expense_deleted':  return '✕';
    case 'settlement_created':  return '↗';
    case 'settlement_accepted': return '✓';
    case 'settlement_declined': return '✕';
    default: return '•';
  }
}

function getIconStyle(type: ActivityItemType['type']) {
  switch (type) {
    case 'expense_added':
    case 'expense_updated':
      return { backgroundColor: colors.primary + '18', color: colors.primary };
    case 'expense_deleted':
    case 'settlement_declined':
      return { backgroundColor: colors.danger + '18', color: colors.danger };
    case 'settlement_created':
      return { backgroundColor: colors.warning + '18', color: colors.warning };
    case 'settlement_accepted':
      return { backgroundColor: colors.success + '18', color: colors.success };
    default:
      return { backgroundColor: colors.bgCard, color: colors.textMuted };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const ActivityItem = ({ item, onPress, onViewReceipt }: ActivityItemProps) => {
  const { actor, group, snapshot, type, createdAt } = item;
  const { action, detail } = buildLabel(item);
  const icon = getTypeIcon(type);
  const iconStyle = getIconStyle(type);
  const isExpense = type.startsWith('expense');

  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Avatar with type icon overlay */}
      <View style={s.avatarWrap}>
        <Avatar
          name={actor.name}
          color={getMemberColor(actor.name)}
          size={36}
        />
        <View style={[s.iconBadge, { backgroundColor: iconStyle.backgroundColor }]}>
          <Text style={[s.iconBadgeText, { color: iconStyle.color }]}>
            {icon}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={s.content}>
        <Text style={s.text} numberOfLines={2}>
          <Text style={s.bold}>{actor.name}</Text>
          {' '}{action}{' '}
          {detail ? <Text style={s.detail}>{detail}</Text> : null}
          {'  ·  '}
          <Text style={s.groupName}>{group.title}</Text>
        </Text>
        <Text style={s.time}>{createdAt}</Text>

        {/* Receipt button — settlement_created only */}
        {type === 'settlement_created' && snapshot.receipt && (
          <TouchableOpacity
            style={s.receiptBtn}
            onPress={() => onViewReceipt?.(snapshot.receipt!)}
            activeOpacity={0.7}
          >
            <Text style={s.receiptBtnText}>🖼 View receipt</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Amount — right side for expenses only */}
      {isExpense && snapshot.amount != null && (
        <Text style={s.amount}>
          Rs {snapshot.amount.toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  avatarWrap: {
    position: 'relative',
    width: 36,
    height: 36,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bgCard,
  },
  iconBadgeText: {
    fontSize: 8,
    fontWeight: fontWeight.bold,
    lineHeight: 10,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: fontSize.sm * 1.45,
  },
  bold: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  detail: {
    color: colors.textPrimary,
  },
  groupName: {
    color: colors.textSecondary,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 3,
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
    marginTop: 1,
  },
});

export default ActivityItem;