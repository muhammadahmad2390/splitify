import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { theme } from '@/theme';
import MemberStack from '@/components/molecules/MemberStack';
import MoneyText from '@/components/atoms/MoneyText';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

export interface GroupCardData {
  _id: string;
  title: string;
  lastActivity?: string;
  net: number;
  members: { name: string; color?: string; avatar?: string }[];
  pendingCount?: number;
  autoAccept?: boolean;
}

interface GroupCardProps {
  group: GroupCardData;
  onPress: () => void;
  onAddExpense?: () => void;
  onSettleUp?: () => void;
}

const GroupCard = ({
  group,
  onPress,
  onAddExpense,
  onSettleUp,
}: GroupCardProps) => {
  const { title, lastActivity, net, members, pendingCount, autoAccept } = group;

  return (
    <TouchableOpacity
      style={s.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* ── Badges ── */}
      <View style={s.badgeRow}>
        {autoAccept && (
          <View style={[s.badge, s.badgeGreen]}>
            <Text style={[s.badgeText, { color: colors.success }]}>
              ✓ Auto-accept
            </Text>
          </View>
        )}
        {!!pendingCount && (
          <View style={[s.badge, s.badgeAmber]}>
            <Text style={[s.badgeText, { color: '#b45309' }]}>
              {pendingCount} pending
            </Text>
          </View>
        )}
      </View>

      {/* ── Top row ── */}
      <View style={s.topRow}>
        <View style={s.titleRow}>
          <Text style={s.groupIcon}>👥</Text>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
        </View>
        <Text style={s.chevron}>›</Text>
      </View>

      {lastActivity && (
        <Text style={s.activity}>Last activity · {lastActivity}</Text>
      )}

      {/* ── Bottom row ── */}
      <View style={s.bottomRow}>
        <MemberStack members={members} size={26} />
        <View style={s.netBlock}>
          {net > 0 ? (
            <Text style={[s.netLabel, { color: colors.success }]}>
              ↑ You are owed
            </Text>
          ) : net < 0 ? (
            <Text style={[s.netLabel, { color: colors.danger }]}>
              ↓ You owe
            </Text>
          ) : (
            <Text style={[s.netLabel, { color: colors.textSecondary }]}>
              ✓ Settled
            </Text>
          )}
          <MoneyText amount={net} size={fontSize.md} />
        </View>
      </View>

      {/* ── Action buttons ── */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnGray]}
          onPress={onAddExpense}
          activeOpacity={0.7}
        >
          <Text style={s.actionBtnGrayText}>🧾 Add expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnGreen]}
          onPress={onSettleUp}
          activeOpacity={0.7}
        >
          <Text style={s.actionBtnGreenText}>⇄ Settle up</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  badgeAmber: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  groupIcon: {
    fontSize: 14,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
  },
  activity: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  netBlock: {
    alignItems: 'flex-end',
  },
  netLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionBtnGray: {
    backgroundColor: colors.bgPage,
  },
  actionBtnGrayText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  actionBtnGreen: {
    backgroundColor: '#ecfdf5',
  },
  actionBtnGreenText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
});

export default GroupCard;
