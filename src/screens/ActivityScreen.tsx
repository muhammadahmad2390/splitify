import { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import {
  useActivityStore,
  filterActivity,
  ActivityFilter,
} from '@/store/ActivityStore';
import type { ActivityItem as ActivityItemType } from '@/store/ActivityStore';
import ActivityItem from '@/components/molecules/ActivityItem';
import { useAuthStore } from '@/store/AuthStore';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const { colors, spacing, radius, fontSize, fontWeight } = theme;

// ─── Types ────────────────────────────────────────────────────────────────────

type ListRow =
  | { kind: 'header'; date: string; key: string }
  | { kind: 'item'; data: ActivityItemType; key: string };

// ─── Filter tab config ────────────────────────────────────────────────────────

const FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'settlements', label: 'Settlements' },
  { key: 'my_requests', label: 'My Requests' },
];

const EMPTY_MESSAGES: Record<ActivityFilter, string> = {
  all: 'Nothing here yet',
  expenses: 'No expenses yet',
  settlements: 'No settlements yet',
  my_requests: 'No requests sent yet',
};

const EMPTY_SUBTITLES: Record<ActivityFilter, string> = {
  all: 'Activity from your groups will appear here',
  expenses: 'Expenses added across your groups will show here',
  settlements: 'Settlements sent to you will show here',
  my_requests: 'Settlements you send will show here',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateHeader(dateStr: string): string {
  const d = dayjs(dateStr);
  if (d.isToday()) return 'Today';
  if (d.isYesterday()) return 'Yesterday';
  return d.format('ddd, D MMM');
}

function groupByDate(items: ActivityItemType[]): ListRow[] {
  const rows: ListRow[] = [];
  let lastDate = '';
  for (const item of items) {
    const dateKey = dayjs(item.createdAt).format('YYYY-MM-DD');
    if (dateKey !== lastDate) {
      lastDate = dateKey;
      rows.push({
        kind: 'header',
        date: formatDateHeader(item.createdAt),
        key: `header-${dateKey}`,
      });
    }
    rows.push({ kind: 'item', data: item, key: item._id });
  }
  return rows;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const ActivityScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthStore();
  const {
    activity,
    pagination,
    loading,
    loadingMore,
    error,
    fetchActivity,
    loadMore,
  } = useActivityStore();

  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchActivity('');
  }, []);

  // ── Debounced search ───────────────────────────────────────────────────────
  const onSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchActivity(text);
      }, 400);
    },
    [fetchActivity],
  );

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Pull to refresh ────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivity(searchText);
    setRefreshing(false);
  }, [fetchActivity, searchText]);

  // ── Auto load more ─────────────────────────────────────────────────────────
  const onEndReached = useCallback(() => {
    if (pagination.hasMore && !loadingMore) loadMore();
  }, [pagination.hasMore, loadingMore, loadMore]);

  // ── Filtered + date-grouped rows ───────────────────────────────────────────
  const filtered = filterActivity(activity, activeFilter, user?._id ?? '');
  const rows = groupByDate(filtered);

  // ── Render row ─────────────────────────────────────────────────────────────
  const renderRow = ({ item }: { item: ListRow }) => {
    if (item.kind === 'header') {
      return (
        <View style={s.dateHeader}>
          <Text style={s.dateHeaderText}>{item.date}</Text>
        </View>
      );
    }
    return (
      <ActivityItem
        item={item.data}
        onPress={() =>
          navigation.navigate('GroupDetails', {
            groupId: item.data.group._id,
          })
        }
        onViewReceipt={url => setViewingReceipt(url)}
      />
    );
  };

  // ── Footer ─────────────────────────────────────────────────────────────────
  const ListFooter = () => {
    if (loadingMore) {
      return (
        <View style={s.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    if (!pagination.hasMore && activity.length > 0) {
      return (
        <View style={s.footerEnd}>
          <Text style={s.footerEndText}>You're all caught up</Text>
        </View>
      );
    }
    return null;
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  const ListEmpty = () => {
    if (loading) return null;
    if (searchText.trim()) {
      return (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTitle}>No results found</Text>
          <Text style={s.emptySubtitle}>
            Try searching for a different name, group, or description
          </Text>
        </View>
      );
    }
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyIcon}>
          {activeFilter === 'expenses'
            ? '🧾'
            : activeFilter === 'settlements' || activeFilter === 'my_requests'
            ? '💸'
            : '📭'}
        </Text>
        <Text style={s.emptyTitle}>{EMPTY_MESSAGES[activeFilter]}</Text>
        <Text style={s.emptySubtitle}>{EMPTY_SUBTITLES[activeFilter]}</Text>
      </View>
    );
  };

  // ── Error state ────────────────────────────────────────────────────────────
  if (error && activity.length === 0 && !loading) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Activity</Text>
        </View>
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>⚠️</Text>
          <Text style={s.emptyTitle}>Failed to load activity</Text>
          <Text style={s.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={s.retryBtn}
            onPress={() => fetchActivity(searchText)}
          >
            <Text style={s.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Activity</Text>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <EvilIcons name="search" size={22} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, group or description"
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <EvilIcons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={s.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterScroll}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                s.filterTab,
                activeFilter === f.key && s.filterTabActive,
              ]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.filterTabText,
                  activeFilter === f.key && s.filterTabTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={s.loaderWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={s.loaderText}>
            {searchText ? 'Searching...' : 'Loading activity...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={item => item.key}
          renderItem={renderRow}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={
            rows.length === 0 ? s.flatListEmpty : s.flatListContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Receipt modal */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 5,
    backgroundColor: colors.bgPage,
  
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },

  // Search
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bgPage,
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
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },

  // Filter tabs
  filterWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
    backgroundColor: colors.bgPage,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 99,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.textOnPrimary,
  },

  // List
  flatListContent: {
    paddingBottom: spacing.xl,
  },
  flatListEmpty: {
    flexGrow: 1,
  },

  // Date header
  dateHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  dateHeaderText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // Footer
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerEnd: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerEndText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  // Loading
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

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.5,
  },

  // Retry
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
  },
  retryText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },

  // Receipt modal
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
});

export default ActivityScreen;