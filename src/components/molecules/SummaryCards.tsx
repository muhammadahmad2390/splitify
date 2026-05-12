import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

interface SummaryCardsProps {
  youAreOwed: number;
  youOwe: number;
  net: number;
}

const SummaryCards = ({ youAreOwed, youOwe, net }: SummaryCardsProps) => {
  const icon =
    net > 0
      ? 'emoticon-cool-outline'
      : net < 0
      ? 'emoticon-sad-outline'
      : 'emoticon-happy-outline';

  return (
    <View style={s.wrapper}>
      {/* Owed + Owe row */}
      <View style={s.row}>
        <View style={[s.card, s.halfCard]}>
          <Text style={s.label}>You are owed</Text>

          <Text style={[s.amount, { color: colors.success }]}>
            Rs {youAreOwed.toLocaleString()}
          </Text>
        </View>

        <View style={[s.card, s.halfCard]}>
          <Text style={s.label}>You owe</Text>

          <Text style={[s.amount, { color: colors.danger }]}>
            Rs {youOwe.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Net position */}
      <View style={s.netCard}>
        <View style={s.netHeader}>
          <Text style={s.netLabel}>Net position</Text>

          <MaterialDesignIcons
            name={icon}
            size={22}
            color={colors.textOnPrimary}
          />
        </View>

        <Text style={s.netAmount}>
          {net >= 0 ? '+' : '-'} Rs {Math.abs(net).toLocaleString()}
        </Text>

        <Text style={s.netSub}>
          Based on all your groups and direct splits.
        </Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
  },

  halfCard: {
    flex: 1,
  },

  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  amount: {
    fontSize: fontSize.xl ?? 20,
    fontWeight: fontWeight.bold,
  },

  netCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.primary,
  },

  netHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  netLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },

  netAmount: {
    fontSize: fontSize.xxl ?? 28,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },

  netSub: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
});

export default SummaryCards;
