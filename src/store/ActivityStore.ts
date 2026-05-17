import { create } from 'zustand';
import api from '@/config/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'expense_added'
  | 'expense_updated'
  | 'expense_deleted'
  | 'settlement_created'
  | 'settlement_accepted'
  | 'settlement_declined';

export interface ActivityActor {
  _id: string;
  name: string;
  avatar?: string;
}

export interface ActivitySnapshot {
  description?: string;
  amount?: number;
  toUser?: ActivityActor;
  method?: string;
  receipt?: string;
  status?: string;
}

export interface ActivityItem {
  _id: string;
  type: ActivityType;
  actor: ActivityActor;
  group: { _id: string; title: string };
  snapshot: ActivitySnapshot;
  refModel: 'Expense' | 'Settlement' | null;
  refId: string | null;
  createdAt: string;
}

export type ActivityFilter = 'all' | 'expenses' | 'settlements' | 'my_requests';

interface Pagination {
  page: number;
  hasMore: boolean;
  total: number;
}

interface ActivityState {
  // Data
  activity: ActivityItem[];
  pagination: Pagination;
  search: string;

  // UI state
  loading: boolean;
  loadingMore: boolean;
  error: string | null;

  // Actions
  fetchActivity: (search?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

const EXPENSE_TYPES: ActivityType[] = [
  'expense_added',
  'expense_updated',
  'expense_deleted',
];

const SETTLEMENT_TYPES: ActivityType[] = [
  'settlement_created',
  'settlement_accepted',
  'settlement_declined',
];

export function filterActivity(
  activity: ActivityItem[],
  filter: ActivityFilter,
  currentUserId: string,
): ActivityItem[] {
  switch (filter) {
    case 'expenses':
      return activity.filter(a => EXPENSE_TYPES.includes(a.type));
    case 'settlements':
      return activity.filter(a => SETTLEMENT_TYPES.includes(a.type));
    case 'my_requests':
      return activity.filter(
        a => a.type === 'settlement_created' && a.actor._id === currentUserId,
      );
    case 'all':
    default:
      return activity;
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

const LIMIT = 20;

const initialPagination: Pagination = {
  page: 1,
  hasMore: false,
  total: 0,
};

function buildUrl(page: number, search: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(LIMIT),
  });
  if (search.trim()) params.set('search', search.trim());
  return `/users/me/activity?${params.toString()}`;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activity: [],
  pagination: initialPagination,
  search: '',
  loading: false,
  loadingMore: false,
  error: null,

  // Resets to page 1 — optionally accepts a new search term
  fetchActivity: async (search?: string) => {
    const resolvedSearch = search !== undefined ? search : get().search;
    set({
      loading: true,
      error: null,
      activity: [],
      pagination: initialPagination,
      search: resolvedSearch,
    });
    try {
      const res = await api.get(buildUrl(1, resolvedSearch));
      const { activity, pagination } = res.data;
      set({
        activity,
        pagination: {
          page: pagination.page,
          hasMore: pagination.hasMore,
          total: pagination.total,
        },
        loading: false,
      });
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong.',
        loading: false,
      });
    }
  },

  // Appends next page — uses current search from store
  loadMore: async () => {
    const { pagination, loadingMore, activity, search } = get();
    if (!pagination.hasMore || loadingMore) return;

    const nextPage = pagination.page + 1;
    set({ loadingMore: true });
    try {
      const res = await api.get(buildUrl(nextPage, search));
      const { activity: newItems, pagination: newPagination } = res.data;
      set({
        activity: [...activity, ...newItems],
        pagination: {
          page: newPagination.page,
          hasMore: newPagination.hasMore,
          total: newPagination.total,
        },
        loadingMore: false,
      });
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong.',
        loadingMore: false,
      });
    }
  },

  reset: () =>
    set({
      activity: [],
      pagination: initialPagination,
      search: '',
      loading: false,
      loadingMore: false,
      error: null,
    }),
}));