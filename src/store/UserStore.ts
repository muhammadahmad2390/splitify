import { create } from 'zustand';
import api from '@/config/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Account {
  _id: string;
  type: 'bank' | 'wallet';
  // Bank fields
  bank?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
  // Wallet fields
  provider?: string;
  phone?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  accounts: Account[];
}

export interface GroupBalance {
  group: { _id: string; title: string };
  youOwe: number;
  youAreOwed: number;
}

export interface BalanceSummary {
  totalOwed: number; // total others owe you
  totalOwing: number; // total you owe others
  net: number; // totalOwed - totalOwing
  currency: string;
  byGroup: GroupBalance[];
}

export interface SearchedUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ─── Error helper ─────────────────────────────────────────────────────────────

const extractError = (err: any): string =>
  err.response?.data?.message ||
  (typeof err.response?.data === 'string' ? err.response.data : null) ||
  err.message ||
  'Something went wrong';

// ─── State interface ──────────────────────────────────────────────────────────

interface UserState {
  // ── State ──────────────────────────────────────────────────────────────────
  balances: BalanceSummary | null;
  balancesLoading: boolean;

  searchResults: SearchedUser[];
  searchLoading: boolean;

  userAccounts: Record<string, Account[]>; // keyed by userId
  userAccountsLoading: boolean;

  isUpdatingProfile: boolean;
  isManagingAccount: boolean;

  error: string | null;

  // ── Profile ────────────────────────────────────────────────────────────────
  updateProfile: (
    data: Partial<Pick<User, 'name' | 'avatar'>>,
    onSuccess?: (user: User) => void,
  ) => Promise<void>;

  // ── Balances ───────────────────────────────────────────────────────────────
  fetchBalances: () => Promise<void>;

  // ── Account management ─────────────────────────────────────────────────────
  addAccount: (
    account: Omit<Account, '_id'>,
    onSuccess?: (account: Account) => void,
  ) => Promise<void>;

  updateAccount: (
    id: string,
    account: Partial<Omit<Account, '_id'>>,
    onSuccess?: (account: Account) => void,
  ) => Promise<void>;

  deleteAccount: (id: string, onSuccess?: () => void) => Promise<void>;

  // ── Search ─────────────────────────────────────────────────────────────────
  searchUsers: (q: string) => Promise<void>;
  clearSearch: () => void;

  // ── Other user accounts (for settle up) ───────────────────────────────────
  fetchUserAccounts: (userId: string) => Promise<void>;
  clearUserAccounts: (userId: string) => void;

  // ── Helpers ────────────────────────────────────────────────────────────────
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()((set, get) => ({
  // ── Initial state ───────────────────────────────────────────────────────────
  balances: null,
  balancesLoading: false,

  searchResults: [],
  searchLoading: false,

  userAccounts: {},
  userAccountsLoading: false,

  isUpdatingProfile: false,
  isManagingAccount: false,

  error: null,

  // ── Update profile ──────────────────────────────────────────────────────────
  // PUT /api/users/me
  // Only name and avatar are allowed (backend uses _.pick)
  updateProfile: async (data, onSuccess) => {
    set({ isUpdatingProfile: true, error: null });
    try {
      const { data: res } = await api.put('/users/me', data);
      // Update auth store user in place so header avatar updates too
      // Import lazily to avoid circular dependency
      const { useAuthStore } = await import('@/store/AuthStore');
      useAuthStore.setState({ user: res.user });
      onSuccess?.(res.user);
      set({ isUpdatingProfile: false });
    } catch (err: any) {
      set({ error: extractError(err), isUpdatingProfile: false });
      throw err;
    }
  },

  // ── Fetch balances ──────────────────────────────────────────────────────────
  // GET /api/users/me/balances
  // Returns totalOwed, totalOwing, net, byGroup[]
  fetchBalances: async () => {
    set({ balancesLoading: true, error: null });
    try {
      const { data } = await api.get('/users/me/balances');
      set({
        balances: {
          totalOwed: data.totalOwed,
          totalOwing: data.totalOwing,
          net: data.net,
          currency: data.currency,
          byGroup: data.byGroup,
        },
        balancesLoading: false,
      });
      console.log('balances.........', get().balances);
    } catch (err: any) {
      set({ error: extractError(err), balancesLoading: false });
      throw err;
    }
  },

  // ── Add account ─────────────────────────────────────────────────────────────
  // POST /api/users/me/accounts
  // Max 2 accounts enforced by backend
  addAccount: async (account, onSuccess) => {
    set({ isManagingAccount: true, error: null });
    try {
      const { data } = await api.post('/users/me/accounts', account);
      // Sync into auth store user.accounts
      const { useAuthStore } = await import('@/store/AuthStore');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({
          user: {
            ...currentUser,
            accounts: [...currentUser.accounts, data.account],
          },
        });
      }
      onSuccess?.(data.account);
      set({ isManagingAccount: false });
    } catch (err: any) {
      set({ error: extractError(err), isManagingAccount: false });
      throw err;
    }
  },

  // ── Update account ──────────────────────────────────────────────────────────
  // PUT /api/users/me/accounts/:id
  updateAccount: async (id, accountData, onSuccess) => {
    set({ isManagingAccount: true, error: null });
    try {
      const { data } = await api.put(`/users/me/accounts/${id}`, accountData);
      // Sync into auth store user.accounts
      const { useAuthStore } = await import('@/store/AuthStore');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({
          user: {
            ...currentUser,
            accounts: currentUser.accounts.map(a =>
              a._id === id ? data.account : a,
            ),
          },
        });
      }
      onSuccess?.(data.account);
      set({ isManagingAccount: false });
    } catch (err: any) {
      set({ error: extractError(err), isManagingAccount: false });
      throw err;
    }
  },

  // ── Delete account ──────────────────────────────────────────────────────────
  // DELETE /api/users/me/accounts/:id
  deleteAccount: async (id, onSuccess) => {
    set({ isManagingAccount: true, error: null });
    try {
      await api.delete(`/users/me/accounts/${id}`);
      // Sync into auth store user.accounts
      const { useAuthStore } = await import('@/store/AuthStore');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({
          user: {
            ...currentUser,
            accounts: currentUser.accounts.filter(a => a._id !== id),
          },
        });
      }
      onSuccess?.();
      set({ isManagingAccount: false });
    } catch (err: any) {
      set({ error: extractError(err), isManagingAccount: false });
      throw err;
    }
  },

  // ── Search users ────────────────────────────────────────────────────────────
  // GET /api/users/search?q=
  // Min 2 chars enforced by backend
  // Only returns verified users, excludes self
  searchUsers: async q => {
    if (q.trim().length < 2) {
      set({ searchResults: [] });
      return;
    }
    set({ searchLoading: true, error: null });
    try {
      const { data } = await api.get('/users/search', { params: { q } });
      set({ searchResults: data.users, searchLoading: false });
    } catch (err: any) {
      set({ error: extractError(err), searchLoading: false });
      throw err;
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  // ── Fetch other user's accounts ─────────────────────────────────────────────
  // GET /api/users/:id/accounts
  // Only works if you share a group with the target user
  // Used in settle up sheet to show receiver's bank details
  fetchUserAccounts: async userId => {
    // Return early if already fetched
    if (get().userAccounts[userId]) return;

    set({ userAccountsLoading: true, error: null });
    try {
      const { data } = await api.get(`/users/${userId}/accounts`);
      set(state => ({
        userAccounts: { ...state.userAccounts, [userId]: data.accounts },
        userAccountsLoading: false,
      }));
    } catch (err: any) {
      set({ error: extractError(err), userAccountsLoading: false });
      throw err;
    }
  },

  clearUserAccounts: userId => {
    set(state => {
      const updated = { ...state.userAccounts };
      delete updated[userId];
      return { userAccounts: updated };
    });
  },

  // ── Clear error ─────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
