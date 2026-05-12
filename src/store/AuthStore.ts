import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/config/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Account {
  _id: string;
  type: 'bank' | 'wallet';
  bank?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
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

interface AuthState {
  // ── State ──────────────────────────────────────────────────────────────────
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // ── Auth Actions ───────────────────────────────────────────────────────────
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // ── OTP Actions ────────────────────────────────────────────────────────────
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;

  // ── Password Reset ─────────────────────────────────────────────────────────
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // ── Profile ────────────────────────────────────────────────────────────────
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (
    data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>,
  ) => Promise<void>;

  // ── Account Management ─────────────────────────────────────────────────────
  addAccount: (account: Omit<Account, '_id'>) => Promise<void>;
  updateAccount: (
    id: string,
    account: Partial<Omit<Account, '_id'>>,
  ) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // ── Helpers ────────────────────────────────────────────────────────────────
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ── Initial State ───────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Login ───────────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', {
            email,
            password,
          });
          const token = response.headers?.authorization ?? null;
          console.log('token.........', token);

          if (!token) {
            throw new Error('No auth token received from login response');
          }
          set({
            token: token,
            user: response.data.user ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error:
              err.response?.data?.message ||
              err.response?.data ||
              err.message ||
              'Something went wrong',
            isLoading: false,
          });

          throw err;
        }
      },

      // ── Register ────────────────────────────────────────────────────────────
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/users', {
            name,
            email,
            password,
          });
          // After register, user likely needs to verify OTP before token is issued
          set({ isLoading: false, user: data.user ?? null });
        } catch (err: any) {
          set({
            error:
              err.response?.data?.message ||
              err.response?.data ||
              err.message ||
              'Something went wrong',
            isLoading: false,
          });
          throw err;
        }
      },

      // ── Logout ──────────────────────────────────────────────────────────────
      logout: async () => {
        await AsyncStorage.removeItem('auth-storage');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // ── Verify OTP ──────────────────────────────────────────────────────────
      verifyOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/verify-otp', {
            email,
            otp,
          });
          set({
            token: data.token,
            user: data.user ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error:
              err.response?.data?.message ||
              err.response?.data ||
              err.message ||
              'Something went wrong',
            isLoading: false,
          });
          throw err;
        }
      },

      // ── Resend OTP ──────────────────────────────────────────────────────────
      resendOtp: async email => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/resend-otp', {
            email,
          });
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error:
              err.response?.data?.message ||
              err.response?.data ||
              err.message ||
              'Something went wrong',
            isLoading: false,
          });
          throw err;
        }
      },

      // ── Forgot Password ─────────────────────────────────────────────────────
      forgotPassword: async email => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/forgot-password', {
            email,
          });
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error:
              err.response?.data?.message ||
              err.response?.data ||
              err.message ||
              'Something went wrong',
            isLoading: false,
          });
          throw err;
        }
      },

      // ── Reset Password ──────────────────────────────────────────────────────
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/reset-password', {
            token,
            password: newPassword,
          });
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error:
              err.response?.data?.message ||
              err.response?.data ||
              err.message ||
              'Something went wrong',
            isLoading: false,
          });
          throw err;
        }
      },

      // ── Fetch Current User ──────────────────────────────────────────────────
      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get('/users/me');
          set({ user: data.user, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // ── Update Profile ──────────────────────────────────────────────────────
      updateProfile: async profileData => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.put('/users/me', profileData);
          set({ user: data.user, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // ── Add Account ─────────────────────────────────────────────────────────
      addAccount: async account => {
        const { user } = get();
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/users/me/accounts', account);
          // Append the new account to user's accounts locally
          if (user) {
            set({
              user: { ...user, accounts: [...user.accounts, data.account] },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // ── Update Account ──────────────────────────────────────────────────────
      updateAccount: async (id, accountData) => {
        const { user } = get();
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.put(
            `/users/me/accounts/${id}`,
            accountData,
          );
          if (user) {
            set({
              user: {
                ...user,
                accounts: user.accounts.map(a =>
                  a._id === id ? data.account : a,
                ),
              },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // ── Delete Account ──────────────────────────────────────────────────────
      deleteAccount: async id => {
        const { user } = get();
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.delete(`/users/me/accounts/${id}`);
          if (user) {
            set({
              user: {
                ...user,
                accounts: user.accounts.filter(a => a._id !== id),
              },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // ── Clear Error ─────────────────────────────────────────────────────────
      clearError: () => set({ error: null }),
    }),

    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist token + user — no need to persist loading/error state
      partialize: state => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
