import { create } from 'zustand';
import api from '@/config/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SplitType = 'equal' | 'exact' | 'percentage';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'other';

export interface ExpenseSplit {
  user: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  _id: string;
  title: string;
  notes?: string;
  amount: number;
  currency: string;
  paidBy: { _id: string; name: string; avatar?: string } | string;
  group: { _id: string; title: string; currency: string } | string;
  category: ExpenseCategory;
  receipt?: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  title: string;
  notes?: string;
  amount: number;
  currency: string;
  paidBy: string;
  group: string;
  category: ExpenseCategory;
  splitType: SplitType;
  splits: ExpenseSplit[];
  date?: string;
}

export interface UpdateExpensePayload extends Partial<CreateExpensePayload> {
  group: string; // required by backend even on update
  receipt?: string;
}

interface ExpenseState {
  // Single expense (for detail view)
  expense: Expense | null;
  expenseLoading: boolean;

  // Operation loading states
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  error: string | null;

  // Actions
  fetchExpense: (id: string) => Promise<void>;
  createExpense: (payload: CreateExpensePayload) => Promise<Expense>;
  updateExpense: (id: string, payload: UpdateExpensePayload) => Promise<Expense>;
  deleteExpense: (id: string, groupId: string) => Promise<void>;
  clearExpense: () => void;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useExpenseStore = create<ExpenseState>((set) => ({
  expense: null,
  expenseLoading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,

  fetchExpense: async (id) => {
    set({ expenseLoading: true, error: null });
    try {
      const res = await api.get(`/expenses/${id}`);
      set({ expense: res.data.expense, expenseLoading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || err?.message || 'Something went wrong.',
        expenseLoading: false,
      });
    }
  },

  createExpense: async (payload) => {
    set({ creating: true, error: null });
    try {
      const res = await api.post('/expenses', payload);
      set({ creating: false });
      return res.data as Expense;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Something went wrong.';
      set({ creating: false, error: message });
      throw new Error(message);
    }
  },

  updateExpense: async (id, payload) => {
    set({ updating: true, error: null });
    try {
      const res = await api.put(`/expenses/${id}`, payload);
      set({ expense: res.data.expense, updating: false });
      return res.data.expense as Expense;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Something went wrong.';
      set({ updating: false, error: message });
      throw new Error(message);
    }
  },

  deleteExpense: async (id, groupId) => {
    set({ deleting: true, error: null });
    try {
      await api.delete(`/expenses/${id}`, { data: { group: groupId } });
      set({ deleting: false, expense: null });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Something went wrong.';
      set({ deleting: false, error: message });
      throw new Error(message);
    }
  },

  clearExpense: () => set({ expense: null, error: null }),
  clearError: () => set({ error: null }),
}));
