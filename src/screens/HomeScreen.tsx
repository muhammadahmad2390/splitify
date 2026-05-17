import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import SummaryCards from '@/components/molecules/SummaryCards';
import GroupCard, { GroupCardData } from '@/components/molecules/GroupCard';
import ActivityItem, {
  ActivityItemData,
} from '@/components/molecules/ActivityItem';
import SectionHeader from '@/components/atoms/SectionHeader';
import Avatar from '@/components/atoms/Avatar';
import { useAuthStore } from '@/store/AuthStore';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useUserStore } from '@/store/UserStore';
import { useGroupStore } from '@/store/GroupStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { colors, spacing, radius, fontSize, fontWeight } = theme;

const MOCK_ACTIVITY: ActivityItemData[] = [
  {
    _id: 'a1',
    type: 'expense',
    actor: { name: 'Ali' },
    description: 'Dinner',
    amount: 4200,
    group: { title: 'Trip to Hunza' },
    createdAt: '2h ago',
  },
  {
    _id: 'a2',
    type: 'settlement',
    actor: { name: 'Ali' },
    to: { name: 'You' },
    amount: 700,
    group: { title: 'Trip to Hunza' },
    status: 'completed',
    receipt: 'https://via.placeholder.com/400x600',
    createdAt: '2h ago',
  },
  {
    _id: 'a3',
    type: 'expense',
    actor: { name: 'You' },
    description: 'Internet bill',
    amount: 3500,
    group: { title: 'Roommates' },
    createdAt: 'Yesterday',
  },
  {
    _id: 'a4',
    type: 'settlement',
    actor: { name: 'Sara' },
    to: { name: 'You' },
    amount: 1200,
    group: { title: 'Office Lunch Club' },
    status: 'pending',
    createdAt: 'Tue',
  },
];

// ─── Home Screen ──────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthStore();
  const { balances, fetchBalances } = useUserStore();
  const { groups, groupsLoading, fetchGroups, error } = useGroupStore();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);


  const groupsWithBalances: GroupCardData[] = groups.map(g => {
    const balanceEntry = balances?.byGroup?.find(b => b.group._id === g._id);
    const youAreOwed = balanceEntry?.youAreOwed ?? 0;
    const youOwe = balanceEntry?.youOwe ?? 0;
    const net = youAreOwed - youOwe;

    return {
      _id: g._id,
      title: g.title,
      myLastRelevantActivity: dayjs(g.lastRelevantActivity).fromNow(),
      net,
      autoAccept: g.autoAcceptSettlements,
      pendingCount: g.pendingCount,
      members: g.members.map(m => ({
        name: m.name,
        avatar: m.avatar,
      })),
    };
  });

  // Total pending settlements across all groups where you are the recipient
  const totalPendingSettlements = groups.reduce(
    (sum, g) => sum + (g.pendingCount ?? 0),
    0,
  );
  
  const loadData = async () => {
    await Promise.all([
      fetchBalances().catch(() => {}),
      fetchGroups().catch(() => {}),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchGroups(), fetchBalances()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const filteredGroups = groupsWithBalances.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <Text style={s.appName}>Splitify</Text>
        </View>
        <TouchableOpacity
          style={s.avatarBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Avatar name={user?.name ?? 'You'} size={34} />
        </TouchableOpacity>
      </View>

      {/* ── Search + New group ── */}
      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <EvilIcons name="search" size={22} />
          <TextInput
            style={s.searchInput}
            placeholder="Search groups or friends"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={s.newGroupBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <MaterialIcons
            name="group-add"
            color={colors.textOnPrimary}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* ── Pending settlements banner ── */}
      {!search && totalPendingSettlements > 0 && (
        <TouchableOpacity
          style={s.pendingBanner}
          activeOpacity={0.85}
          onPress={() => {}} // wire to settlements screen
        >
          <View style={s.pendingBannerLeft}>
            <Ionicons name="time-outline" size={16} color={colors.warning} />
            <Text style={s.pendingBannerText}>
              {totalPendingSettlements === 1
                ? '1 settlement needs your approval'
                : `${totalPendingSettlements} settlements need your approval`}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Summary cards ── */}
        {!search && (
        <SummaryCards
          youAreOwed={balances?.totalOwed ?? 0}
          youOwe={balances?.totalOwing ?? 0}
          net={balances?.net ?? 0}
        />
      )}

        {/* ── Groups ── */}
        <View style={[s.section, search && s.sectionSearching]}>
        {!search && (
          <SectionHeader
            title="Your groups"
            actionLabel="Manage"
            onAction={() => navigation.navigate('Groups')}
          />
        )}

          {/* Loading state */}
          {groupsLoading && !refreshing ? (
            <View style={s.loaderCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={s.loaderText}>Loading groups...</Text>
            </View>
          ) : error ? (
            /* Error state */
            <View style={s.emptyCard}>
              <Ionicons
                name="wifi-outline"
                size={28}
                color={colors.textMuted}
              />
              <Text style={s.emptyTitle}>Failed to load groups</Text>
              <Text style={s.emptySubtitle}>{error}</Text>
              <TouchableOpacity
                style={s.retryBtn}
                onPress={() => loadData().catch(() => {})}
                activeOpacity={0.7}
              >
                <Text style={s.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredGroups.length === 0 ? (
            /* Empty state */
            <View style={s.emptyCard}>
              <Ionicons
                name="people-outline"
                size={28}
                color={colors.textMuted}
              />
              <Text style={s.emptyTitle}>
                {search ? 'No groups found' : 'No groups yet'}
              </Text>
              <Text style={s.emptySubtitle}>
                {search
                  ? 'Try a different search term'
                  : 'Create a group to start splitting expenses'}
              </Text>
              {!search && (
                <TouchableOpacity
                  onPress={() => {}}
                  style={s.emptyButton}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={16} color={colors.textOnPrimary} />
                  <Text style={s.emptyButtonText}>Create Group</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* Groups list — max 3 */
            <View style={s.groupList}>
              {filteredGroups.map(g => (
                <GroupCard
                  key={g._id}
                  group={g}
                  onPress={() =>
                    navigation.navigate('GroupDetails', { groupId: g._id })
                  }
                  onAddExpense={() =>
                    navigation.navigate('AddExpense', { groupId: g._id })
                  }
                  onSettleUp={() => {}}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Text style={s.fabIcon}>＋</Text>
      </TouchableOpacity>

      {/* ── Receipt Modal ── */}
      <Modal
        visible={!!viewingReceipt}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingReceipt(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Payment Receipt</Text>
              <TouchableOpacity
                onPress={() => setViewingReceipt(null)}
                style={s.modalClose}
              >
                <Text style={s.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            {viewingReceipt && (
              <Image
                source={{ uri: viewingReceipt }}
                style={s.receiptImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
    backgroundColor: colors.bgPage,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  avatarBtn: {
    padding: 2,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgPage,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  newGroupBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  newGroupText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  // Pending settlements banner
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    backgroundColor: "#fffbeb", // ~8% opacity of your warning color
    borderBottomColor: colors.warning + '30', // subtle warm border

  },
  pendingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pendingBannerText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },

  // Scroll
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  // Sections
  section: {
    marginTop: spacing.lg,
  },
  sectionSearching: {
    marginTop: spacing.sm,
  },
  groupList: {
    gap: spacing.sm,
  },
  activityCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    overflow: 'hidden',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: spacing.md + 5,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    opacity: 0.8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
  },

  // Receipt Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalCloseText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  receiptImage: {
    width: '100%',
    height: 400,
  },
  loaderCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loaderText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.4,
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
  },
  retryText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  createGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.bgCard,
  },
  createGroupText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  emptyButtonText: {
    fontSize: fontSize.sm,
    color: colors.textOnPrimary,
    fontWeight: fontWeight.medium,
  },
});

export default HomeScreen;