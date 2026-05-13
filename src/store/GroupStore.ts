import { create } from 'zustand';
import api from '@/config/axios';

// ─── Error helper ─────────────────────────────────────────────────────────────

const extractError = (err: any): string =>
  err.response?.data?.message ||
  (typeof err.response?.data === 'string' ? err.response.data : null) ||
  err.message ||
  'Something went wrong';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GroupMemberUser {
  _id: string;
  name: string;
  avatar?: string;
}

export interface GroupMember {
  _id: string;
  user: GroupMemberUser;
  role: 'admin' | 'member';
  joinedAt?: string;
}

export interface Group {
  _id: string;
  title: string;
  description?: string;
  lastRelevantActivity: string;
  pendingCount: number;
  currency: string;
  myRole: 'admin' | 'member';
  members: GroupMemberUser[]; // list screen — just user objects
  updatedAt: string;
  autoAcceptSettlements: boolean;
}

export interface GroupDetails {
  _id: string;
  title: string;
  description?: string;
  currency: string;
  createdBy?: string;
  updatedAt: string;
  members: GroupMember[]; // detail screen — full member objects with role
}

export interface SimplifiedDebt {
  from: GroupMemberUser;
  to: GroupMemberUser;
  amount: number;
}

export interface GroupExpense {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  paidBy: GroupMemberUser;
  myShare: number; // computed per requesting user by backend
}

export interface GroupSettlement {
  _id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'cancelled';
  receipt?: string;
  createdAt: string;
}

// ─── State interface ──────────────────────────────────────────────────────────

interface GroupState {
  // ── Groups list ────────────────────────────────────────────────────────────
  groups: Group[];
  groupsLoading: boolean;

  // ── Group details ──────────────────────────────────────────────────────────
  // keyed by groupId for caching
  groupDetails: Record<string, GroupDetails>;
  groupDetailsLoading: boolean;

  // ── Group balances ─────────────────────────────────────────────────────────
  groupBalances: Record<string, SimplifiedDebt[]>;
  groupBalancesLoading: boolean;

  // ── Group expenses ─────────────────────────────────────────────────────────
  groupExpenses: Record<string, GroupExpense[]>;
  groupExpensesLoading: boolean;

  // ── Group settlements ──────────────────────────────────────────────────────
  groupSettlements: Record<string, GroupSettlement[]>;
  groupSettlementsLoading: boolean;

  // ── Mutations loading ──────────────────────────────────────────────────────
  isMutating: boolean;

  error: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────

  // List
  fetchGroups: () => Promise<void>;

  // Create
  createGroup: (data: {
    title: string;
    description?: string;
    currency?: string;
    members?: { user: string }[];
  }) => Promise<Group>;

  // Details
  fetchGroupDetails: (groupId: string) => Promise<void>;

  // Update
  updateGroup: (
    groupId: string,
    data: { title?: string; description?: string; currency?: string },
  ) => Promise<void>;

  // Members
  addMembers: (groupId: string, members: { user: string }[]) => Promise<void>;

  removeMember: (groupId: string, memberId: string) => Promise<void>;

  updateMemberRole: (
    groupId: string,
    memberId: string,
    role: 'admin' | 'member',
  ) => Promise<void>;

  leaveGroup: (groupId: string) => Promise<void>;

  // Balances
  fetchGroupBalances: (groupId: string) => Promise<void>;

  // Expenses
  fetchGroupExpenses: (groupId: string) => Promise<void>;

  // Settlements
  fetchGroupSettlements: (groupId: string) => Promise<void>;

  // Helpers
  clearGroupCache: (groupId: string) => void;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGroupStore = create<GroupState>()((set, get) => ({
  // ── Initial state ───────────────────────────────────────────────────────────
  groups: [],
  groupsLoading: false,

  groupDetails: {},
  groupDetailsLoading: false,

  groupBalances: {},
  groupBalancesLoading: false,

  groupExpenses: {},
  groupExpensesLoading: false,

  groupSettlements: {},
  groupSettlementsLoading: false,

  isMutating: false,
  error: null,

  // ── Fetch groups list ───────────────────────────────────────────────────────
  // GET /api/groups
  // Returns _id, title, currency, myRole, members[], updatedAt
  fetchGroups: async () => {
    set({ groupsLoading: true, error: null });
    try {
      const { data } = await api.get('/groups');
      console.log('groupppppp ', data.groups);
      set({ groups: data.groups, groupsLoading: false });
    } catch (err: any) {
      console.log('error.........', err);
      set({ error: extractError(err), groupsLoading: false });
      throw err;
    }
  },

  // ── Create group ────────────────────────────────────────────────────────────
  // POST /api/groups
  // Creator is automatically added as admin by backend
  // members array is optional — extra members at creation time
  createGroup: async groupData => {
    set({ isMutating: true, error: null });
    try {
      const { data } = await api.post('/groups', groupData);
      // Optimistically add to list — backend returns full group in data.body

      set(state => ({
        groups: [
          {
            _id: data.body._id,
            title: data.body.title,
            description: data.body.description,
            currency: data.body.currency,
            pendingCount: data.body.pendingCount,
            lastRelevantActivity: data.body.lastRelevantActivity,
            myRole: 'admin',
            autoAcceptSettlements:
              data.body.members?.[0]?.preferences?.autoAcceptSettlements ??
              false,
            members: data.body.members,
            updatedAt: data.body.updatedAt,
          },
          ...state.groups,
        ],
        isMutating: false,
      }));
      return data.body;
    } catch (err: any) {
      set({ error: extractError(err), isMutating: false });
      throw err;
    }
  },

  // ── Fetch group details ─────────────────────────────────────────────────────
  // GET /api/groups/:id
  // Returns full group with members[].role and preferences
  // member middleware ensures only group members can access
  fetchGroupDetails: async groupId => {
    set({ groupDetailsLoading: true, error: null });
    try {
      const { data } = await api.get(`/groups/${groupId}`);
      set(state => ({
        groupDetails: { ...state.groupDetails, [groupId]: data.data },
        groupDetailsLoading: false,
      }));
    } catch (err: any) {
      set({ error: extractError(err), groupDetailsLoading: false });
      throw err;
    }
  },

  // ── Update group ────────────────────────────────────────────────────────────
  // PUT /api/groups/:id
  // admin only — title, description, currency
  updateGroup: async (groupId, updateData) => {
    set({ isMutating: true, error: null });
    try {
      const { data } = await api.put(`/groups/${groupId}`, updateData);
      // Update in groups list
      set(state => ({
        groups: state.groups.map(g =>
          g._id === groupId ? { ...g, ...data.group } : g,
        ),
        // Update cached details if present
        groupDetails: state.groupDetails[groupId]
          ? {
              ...state.groupDetails,
              [groupId]: { ...state.groupDetails[groupId], ...data.group },
            }
          : state.groupDetails,
        isMutating: false,
      }));
    } catch (err: any) {
      set({ error: extractError(err), isMutating: false });
      throw err;
    }
  },

  // ── Add members ─────────────────────────────────────────────────────────────
  // POST /api/groups/:id/members
  // admin only
  // members: [{ user: userId }]
  // Use searchUsers from userStore to find user _id first
  addMembers: async (groupId, members) => {
    set({ isMutating: true, error: null });
    try {
      const { data } = await api.post(`/groups/${groupId}/members`, {
        members,
      });
      // Append new members to cached group details
      set(state => {
        const details = state.groupDetails[groupId];
        if (!details) return { isMutating: false };
        return {
          groupDetails: {
            ...state.groupDetails,
            [groupId]: {
              ...details,
              members: [...details.members, ...data.members],
            },
          },
          isMutating: false,
        };
      });
    } catch (err: any) {
      set({ error: extractError(err), isMutating: false });
      throw err;
    }
  },

  // ── Remove member ───────────────────────────────────────────────────────────
  // DELETE /api/groups/:id/members/:memberid
  // admin only
  // memberId is the members subdocument _id (not user _id)
  // Backend blocks removal if member has unsettled balances
  removeMember: async (groupId, memberId) => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      set(state => {
        const details = state.groupDetails[groupId];
        if (!details) return { isMutating: false };
        return {
          groupDetails: {
            ...state.groupDetails,
            [groupId]: {
              ...details,
              members: details.members.filter(m => m._id !== memberId),
            },
          },
          isMutating: false,
        };
      });
    } catch (err: any) {
      set({ error: extractError(err), isMutating: false });
      throw err;
    }
  },

  // ── Update member role ──────────────────────────────────────────────────────
  // PATCH /api/groups/:id/members/:memberid/role
  // admin only
  // Cannot change own role or creator's role
  updateMemberRole: async (groupId, memberId, role) => {
    set({ isMutating: true, error: null });
    try {
      await api.patch(`/groups/${groupId}/members/${memberId}/role`, { role });
      set(state => {
        const details = state.groupDetails[groupId];
        if (!details) return { isMutating: false };
        return {
          groupDetails: {
            ...state.groupDetails,
            [groupId]: {
              ...details,
              members: details.members.map(m =>
                m._id === memberId ? { ...m, role } : m,
              ),
            },
          },
          isMutating: false,
        };
      });
    } catch (err: any) {
      set({ error: extractError(err), isMutating: false });
      throw err;
    }
  },

  // ── Leave group ─────────────────────────────────────────────────────────────
  // DELETE /api/groups/:id/leave
  // Backend blocks if user has unsettled balances (both directions)
  // If last member — group gets deleted automatically
  // If leaving user was only admin — earliest member gets promoted
  leaveGroup: async groupId => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/groups/${groupId}/leave`);
      // Remove from groups list
      set(state => ({
        groups: state.groups.filter(g => g._id !== groupId),
        // Clean up all cached data for this group
        groupDetails: Object.fromEntries(
          Object.entries(state.groupDetails).filter(([k]) => k !== groupId),
        ),
        groupBalances: Object.fromEntries(
          Object.entries(state.groupBalances).filter(([k]) => k !== groupId),
        ),
        groupExpenses: Object.fromEntries(
          Object.entries(state.groupExpenses).filter(([k]) => k !== groupId),
        ),
        groupSettlements: Object.fromEntries(
          Object.entries(state.groupSettlements).filter(([k]) => k !== groupId),
        ),
        isMutating: false,
      }));
    } catch (err: any) {
      set({ error: extractError(err), isMutating: false });
      throw err;
    }
  },

  // ── Fetch group balances ────────────────────────────────────────────────────
  // GET /api/groups/:id/balances
  // Returns simplifiedDebts[] — who owes whom with amounts
  // Powers the "Who owes whom" section in GroupDetailsScreen
  fetchGroupBalances: async groupId => {
    set({ groupBalancesLoading: true, error: null });
    try {
      const { data } = await api.get(`/groups/${groupId}/balances`);
      set(state => ({
        groupBalances: {
          ...state.groupBalances,
          [groupId]: data.simplifiedDebts,
        },
        groupBalancesLoading: false,
      }));
    } catch (err: any) {
      set({ error: extractError(err), groupBalancesLoading: false });
      throw err;
    }
  },

  // ── Fetch group expenses ────────────────────────────────────────────────────
  // GET /api/groups/:id/expenses
  // Returns expenses with myShare computed per requesting user
  // member middleware ensures only group members can access
  fetchGroupExpenses: async groupId => {
    set({ groupExpensesLoading: true, error: null });
    try {
      const { data } = await api.get(`/groups/${groupId}/expenses`);
      set(state => ({
        groupExpenses: {
          ...state.groupExpenses,
          [groupId]: data.expenses,
        },
        groupExpensesLoading: false,
      }));
    } catch (err: any) {
      set({ error: extractError(err), groupExpensesLoading: false });
      throw err;
    }
  },

  // ── Fetch group settlements ─────────────────────────────────────────────────
  // GET /api/groups/:id/settlements
  // Returns settlements where fromUser or toUser is the requesting user
  // Used for settlement history + pending approvals in GroupDetailsScreen
  fetchGroupSettlements: async groupId => {
    set({ groupSettlementsLoading: true, error: null });
    try {
      const { data } = await api.get(`/groups/${groupId}/settlements`);
      set(state => ({
        groupSettlements: {
          ...state.groupSettlements,
          [groupId]: data.settlements,
        },
        groupSettlementsLoading: false,
      }));
    } catch (err: any) {
      set({ error: extractError(err), groupSettlementsLoading: false });
      throw err;
    }
  },

  // ── Clear group cache ───────────────────────────────────────────────────────
  // Call this when navigating away from a group screen
  // to force a fresh fetch next time
  clearGroupCache: groupId => {
    set(state => ({
      groupDetails: Object.fromEntries(
        Object.entries(state.groupDetails).filter(([k]) => k !== groupId),
      ),
      groupBalances: Object.fromEntries(
        Object.entries(state.groupBalances).filter(([k]) => k !== groupId),
      ),
      groupExpenses: Object.fromEntries(
        Object.entries(state.groupExpenses).filter(([k]) => k !== groupId),
      ),
      groupSettlements: Object.fromEntries(
        Object.entries(state.groupSettlements).filter(([k]) => k !== groupId),
      ),
    }));
  },

  // ── Clear error ─────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
