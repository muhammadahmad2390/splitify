import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import MemberStack from '@/components/molecules/MemberStack';
import MoneyText from '@/components/atoms/MoneyText';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

export interface GroupCardData {
  _id: string;
  title: string;
  myLastRelevantActivity?: string;
  net: number;
  members: { name: string; color?: string; avatar?: string }[];
  pendingCount?: number;
  autoAccept: boolean;
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
  const {
    title,
    myLastRelevantActivity,
    net,
    members,
    pendingCount,
    autoAccept,
  } = group;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
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
          <FontAwesome6 name="user-group" />
          <Text style={s.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Text style={s.chevron}>›</Text>
      </View>

      {myLastRelevantActivity && (
        <Text style={s.activity}>Last activity · {myLastRelevantActivity}</Text>
      )}

      {/* ── Bottom row ── */}
      <View style={s.bottomRow}>
        <MemberStack members={members} size={26} />
        <View style={s.netBlock}>
          {net > 0 ? (
            <View style={s.status}>
              <AntDesign name="arrowup" size={13} color={colors.success} />
              <Text style={[s.netLabel, { color: colors.success }]}>
                You are owed
              </Text>
            </View>
          ) : net < 0 ? (
            <View style={s.status}>
              <AntDesign name="arrowdown" size={13} color={colors.danger} />
              <Text style={[s.netLabel, { color: colors.danger }]}>
                You owe
              </Text>
            </View>
          ) : (
            <View style={s.status}>
              <Entypo name="check" />
              <Text style={[s.netLabel, { color: colors.textSecondary }]}>
                Settled
              </Text>
            </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons
              name="receipt"
              size={18}
              color={s.actionBtnGrayText}
            />
            <Text style={s.actionBtnGrayText}>Add expense</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnGreen]}
          onPress={onSettleUp}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={18}
              color={colors.success}
            />
            <Text style={s.actionBtnGreenText}>Settle up</Text>
          </View>
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
  status: {
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
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
