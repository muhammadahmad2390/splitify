import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '@/theme';
import GroupCard, { GroupCardData } from '@/components/molecules/GroupCard';
import FilterTabs, { FilterOption } from '@/components/atoms/FilterTabs';
import { useGroupStore } from '@/store/GroupStore';
import { useUserStore } from '@/store/UserStore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

// ─── Filter type ──────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'you_owe' | 'you_are_owed' | 'settled';

const FILTER_OPTIONS: FilterOption<FilterKey>[] = [
  { key: 'all', label: 'All' },
  { key: 'you_owe', label: 'You owe' },
  { key: 'you_are_owed', label: 'You are owed' },
  { key: 'settled', label: 'Settled' },
];

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({
  filter,
  search,
  onCreateGroup,
}: {
  filter: FilterKey;
  search: string;
  onCreateGroup: () => void;
}) {
  if (search) {
    return (
      <View style={s.emptyWrap}>
        <Ionicons name="search-outline" size={36} color={colors.textMuted} />
        <Text style={s.emptyTitle}>No groups found</Text>
        <Text style={s.emptySub}>No results for "{search}"</Text>
      </View>
    );
  }

  if (filter !== 'all') {
    const messages: Record<FilterKey, string> = {
      all: '',
      you_owe: "You don't owe anyone right now",
      you_are_owed: "Nobody owes you right now",
      settled: "No fully settled groups yet",
    };
    return (
      <View style={s.emptyWrap}>
        <Ionicons
          name="checkmark-circle-outline"
          size={36}
          color={colors.textMuted}
        />
        <Text style={s.emptyTitle}>{messages[filter]}</Text>
        <Text style={s.emptySub}>
          Try a different filter to see your groups
        </Text>
      </View>
    );
  }

  return (
    <View style={s.emptyWrap}>
      <Ionicons name="people-outline" size={42} color={colors.textMuted} />
      <Text style={s.emptyTitle}>No groups yet</Text>
      <Text style={s.emptySub}>
        Create a group to start splitting expenses with friends
      </Text>
      <TouchableOpacity
        style={s.emptyCreateBtn}
        onPress={onCreateGroup}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={s.emptyCreateText}>Create first group</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={s.emptyWrap}>
      <Ionicons name="wifi-outline" size={36} color={colors.textMuted} />
      <Text style={s.emptyTitle}>Failed to load groups</Text>
      <Text style={s.emptySub}>{message}</Text>
      <TouchableOpacity
        style={s.retryBtn}
        onPress={onRetry}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh-outline" size={14} color={colors.primary} />
        <Text style={s.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Groups Screen ────────────────────────────────────────────────────────────
const GroupsScreen = ({ navigation }: { navigation: any }) => {
  const { groups, groupsLoading, error, fetchGroups } = useGroupStore();
  const { balances, fetchBalances } = useUserStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch on focus ──────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
      fetchBalances();
    }, []),
  );

  // ── Pull to refresh ─────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchGroups(), fetchBalances()]);
    } finally {
      setRefreshing(false);
    }
  };

  // ── Merge groups with balances ──────────────────────────────────────────────
  const groupsWithBalances: GroupCardData[] = groups.map(g => {
    const balanceEntry = balances?.byGroup?.find(b => b.group._id === g._id);
    const youAreOwed = balanceEntry?.youAreOwed ?? 0;
    const youOwe = balanceEntry?.youOwe ?? 0;
    const net = youAreOwed - youOwe;

    return {
      _id: g._id,
      title: g.title,
      lastActivity: g.updatedAt,
      net,
      autoAccept: g.autoAcceptSettlements,
      pendingCount: g.pendingCount,
      members: g.members.map(m => ({
        name: m.name,
        avatar: m.avatar,
      })),
    };
  });

  // ── Filter logic ────────────────────────────────────────────────────────────
  const applyFilter = (g: GroupCardData): boolean => {
    switch (filter) {
      case 'you_owe':
        return g.net < 0;
      case 'you_are_owed':
        return g.net > 0;
      case 'settled':
        return g.net === 0;
      default:
        return true;
    }
  };

  // ── Search logic ────────────────────────────────────────────────────────────
  // Searches title + member names
  const applySearch = (g: GroupCardData): boolean => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchesTitle = g.title.toLowerCase().includes(q);
    const matchesMember = g.members.some(m =>
      m.name.toLowerCase().includes(q),
    );
    return matchesTitle || matchesMember;
  };

  const filtered = groupsWithBalances.filter(
    g => applyFilter(g) && applySearch(g),
  );

  // ── Summary counts for filter tabs ─────────────────────────────────────────
  const oweCount = groupsWithBalances.filter(g => g.net < 0).length;
  const owedCount = groupsWithBalances.filter(g => g.net > 0).length;

  const goToCreateGroup = () => navigation.navigate('CreateGroup');

  // ── Render group item ───────────────────────────────────────────────────────
  const renderGroup = ({ item }: { item: GroupCardData }) => (
    <GroupCard
      group={item}
      onPress={() =>
        navigation.navigate('GroupDetails', { groupId: item._id })
      }
      onAddExpense={() =>
        navigation.navigate('AddExpense', { groupId: item._id })
      }
      onSettleUp={() => {}}
    />
  );

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Groups</Text>
        <TouchableOpacity
          style={s.newBtn}
          activeOpacity={0.85}
          onPress={goToCreateGroup}
        >
            <MaterialIcons
            name="group-add"
            color={colors.textOnPrimary}
            size={24}
          />
        </TouchableOpacity>
      </View>
      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <EvilIcons name="search" size={22} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, group or description"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {!!search && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <EvilIcons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter tabs ── */}
      <View style={s.filterWrap}>
        <FilterTabs
          options={FILTER_OPTIONS}
          selected={filter}
          onSelect={f => setFilter(f)}
        />

        {/* Live count pill next to filter */}
        {filter !== 'all' && (
          <View style={s.countPill}>
            <Text style={s.countPillText}>{filtered.length}</Text>
          </View>
        )}
      </View>

      {/* ── Divider ── */}
      <View style={s.divider} />

      {/* ── Content ── */}
      {groupsLoading && !refreshing ? (
        <View style={s.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loaderText}>Loading groups...</Text>
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchGroups} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderGroup}
          contentContainerStyle={[
            s.list,
            filtered.length === 0 && s.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          ListEmptyComponent={
            <EmptyState
              filter={filter}
              search={search}
              onCreateGroup={goToCreateGroup}
            />
          }
   
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.bgPage,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  newBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical:spacing.xs,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  newBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },

  // Search
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },

  // Filter
  filterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countPill: {
    marginRight: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countPillText: {
    fontSize: fontSize.xs,
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },

  divider: {
    height: 1,
    backgroundColor: colors.bgCardBorder,
  },

  // Loader
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loaderText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // List
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: spacing.sm,
  },

  // Create inline button (at bottom of list)
  createInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.bgCard,
  },
  createInlineText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.5,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  emptyCreateText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },

  // Retry button
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    backgroundColor: colors.bgCard,
  },
  retryText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});

export default GroupsScreen;
