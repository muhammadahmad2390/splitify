import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import Avatar from '@/components/atoms/Avatar';
import { getMemberColor } from '@/components/molecules/MemberStack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useExpenseStore,
  ExpenseCategory,
  SplitType,
} from '@/store/ExpenseStore';
import { useGroupStore, GroupMember } from '@/store/GroupStore';
import { useAuthStore } from '@/store/AuthStore';
import dayjs from 'dayjs';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'food', label: 'Food', icon: 'fast-food-outline' },
  { value: 'transport', label: 'Transport', icon: 'car-sport-outline' },
  { value: 'accommodation', label: 'Stay', icon: 'home-outline' },
  { value: 'entertainment', label: 'Fun', icon: 'wine-outline' },
  { value: 'other', label: 'Other', icon: '' },
];

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equal' },
  { value: 'exact', label: 'Exact' },
  { value: 'percentage', label: '%' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SplitEntry {
  userId: string;
  name: string;
  avatar?: string;
  amount: string; // exact or percentage input (string for controlled input)
  included: boolean; // for equal split
}

interface Props {
  navigation: any;
  route: {
    params?: {
      groupId?: string;
    };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSplitsPayload(
  entries: SplitEntry[],
  splitType: SplitType,
  totalAmount: number,
) {
  const included = entries.filter(e => e.included);
  if (splitType === 'equal') {
    const share = totalAmount / included.length;
    return included.map(e => ({
      user: e.userId,
      amount: parseFloat(share.toFixed(2)),
    }));
  }
  if (splitType === 'exact') {
    return included.map(e => ({
      user: e.userId,
      amount: parseFloat(e.amount) || 0,
    }));
  }
  // percentage
  return included.map(e => ({
    user: e.userId,
    amount: parseFloat(
      (((parseFloat(e.amount) || 0) / 100) * totalAmount).toFixed(2),
    ),
    percentage: parseFloat(e.amount) || 0,
  }));
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const AddExpenseScreen = ({ navigation, route }: Props) => {
  const preselectedGroupId = route.params?.groupId;

  const { user } = useAuthStore();
  const { groups, groupDetails, fetchGroupDetails } = useGroupStore();
  const { createExpense, creating } = useExpenseStore();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Group selection ────────────────────────────────────────────────────────
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    preselectedGroupId ?? '',
  );
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);

  const selectedGroup = groups.find(g => g._id === selectedGroupId);
  const groupMembers: GroupMember[] = selectedGroupId
    ? groupDetails[selectedGroupId]?.members ?? []
    : [];

  // ── Paid by ────────────────────────────────────────────────────────────────
  const [paidBy, setPaidBy] = useState<string>(user?._id ?? '');
  const [paidByOpen, setPaidByOpen] = useState(false);
  const paidByMember = groupMembers.find(m => m.user._id === paidBy);

  // ── Splits ─────────────────────────────────────────────────────────────────
  const [splits, setSplits] = useState<SplitEntry[]>([]);

  // ── Snackbar ───────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState(false);
  const snackbarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load group details + init splits when group selected ───────────────────
  useEffect(() => {
    if (!selectedGroupId) return;
    if (!groupDetails[selectedGroupId]) {
      fetchGroupDetails(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (groupMembers.length === 0) return;
    setSplits(
      groupMembers.map(m => ({
        userId: m.user._id,
        name: m.user.name,
        avatar: m.user.avatar,
        amount: '',
        included: true,
      })),
    );
    // Default paidBy to current user if they're in the group
    const selfInGroup = groupMembers.find(m => m.user._id === user?._id);
    if (selfInGroup) setPaidBy(selfInGroup.user._id);
    else setPaidBy(groupMembers[0]?.user._id ?? '');
  }, [groupMembers.length]);

  // ── Split helpers ──────────────────────────────────────────────────────────

  const totalAmount = parseFloat(amount) || 0;

  const includedSplits = splits.filter(s => s.included);

  const equalShare =
    splitType === 'equal' && includedSplits.length > 0
      ? (totalAmount / includedSplits.length).toFixed(2)
      : '0.00';

  const exactAllocated = splits.reduce(
    (sum, s) => sum + (s.included ? parseFloat(s.amount) || 0 : 0),
    0,
  );
  const exactRemaining = parseFloat((totalAmount - exactAllocated).toFixed(2));

  const percentAllocated = splits.reduce(
    (sum, s) => sum + (s.included ? parseFloat(s.amount) || 0 : 0),
    0,
  );
  const percentRemaining = parseFloat((100 - percentAllocated).toFixed(2));

  const toggleIncluded = (userId: string) => {
    setSplits(prev =>
      prev.map(s =>
        s.userId === userId ? { ...s, included: !s.included } : s,
      ),
    );
  };

  const updateSplitAmount = (userId: string, val: string) => {
    setSplits(prev =>
      prev.map(s => (s.userId === userId ? { ...s, amount: val } : s)),
    );
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedGroupId) e.group = 'Please select a group';
    if (!title.trim()) e.title = 'Title is required';
    else if (title.trim().length < 3) e.title = 'At least 3 characters';
    if (!amount || totalAmount <= 0) e.amount = 'Enter a valid amount';
    if (includedSplits.length === 0)
      e.splits = 'Select at least one participant';
    if (splitType === 'exact') {
      if (Math.abs(exactRemaining) > 0.01)
        e.splits = `Rs ${Math.abs(exactRemaining).toFixed(2)} ${
          exactRemaining > 0 ? 'remaining' : 'over-allocated'
        }`;
    }
    if (splitType === 'percentage') {
      if (Math.abs(percentRemaining) > 0.01)
        e.splits = `${Math.abs(percentRemaining).toFixed(0)}% ${
          percentRemaining > 0 ? 'remaining' : 'over-allocated'
        }`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const splitsPayload = buildSplitsPayload(splits, splitType, totalAmount);
      await createExpense({
        title: title.trim(),
        notes: notes.trim() || undefined,
        amount: totalAmount,
        currency: selectedGroup?.currency ?? 'PKR',
        paidBy,
        group: selectedGroupId,
        category,
        splitType,
        splits: splitsPayload,
        date,
      });
      navigation.goBack();
      // Show snackbar then go back
      setSnackbar(true);
      snackbarTimer.current = setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } catch (err: any) {
      setErrors({ general: err.message });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Add Expense</Text>
        <TouchableOpacity
          style={[s.saveBtn, creating && s.saveBtnDisabled]}
          onPress={handleSubmit}
          disabled={creating}
          activeOpacity={0.85}
        >
          {creating ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <Text style={s.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* General error */}
          {errors.general && (
            <View style={s.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.danger}
              />
              <Text style={s.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          {/* ── Group picker (only if no preselected group) ── */}
          {!preselectedGroupId && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>
                Group <Text style={s.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[s.dropdownBtn, errors.group && s.dropdownBtnError]}
                onPress={() => setGroupPickerOpen(true)}
                activeOpacity={0.8}
              >
                <View style={s.dropdownLeft}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      s.dropdownValue,
                      !selectedGroup && { color: colors.textMuted },
                    ]}
                  >
                    {selectedGroup ? selectedGroup.title : 'Select a group'}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {errors.group && <Text style={s.fieldError}>{errors.group}</Text>}
            </View>
          )}

          {/* ── Title ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>
              Title <Text style={s.required}>*</Text>
            </Text>
            <View style={[s.inputCard, errors.title && s.inputCardError]}>
              <TextInput
                style={s.mainInput}
                placeholder="e.g. Dinner at Salt"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={t => {
                  setTitle(t);
                  if (errors.title) setErrors(e => ({ ...e, title: '' }));
                }}
                maxLength={255}
                returnKeyType="next"
              />
            </View>
            {errors.title && <Text style={s.fieldError}>{errors.title}</Text>}
          </View>

          {/* ── Amount ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>
              Amount <Text style={s.required}>*</Text>
            </Text>
            <View style={[s.amountCard, errors.amount && s.inputCardError]}>
              <Text style={s.currencyLabel}>
                {selectedGroup?.currency ?? 'PKR'}
              </Text>
              <View style={s.amountDivider} />
              <TextInput
                style={s.amountInput}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={v => {
                  setAmount(v);
                  if (errors.amount) setErrors(e => ({ ...e, amount: '' }));
                }}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
            {errors.amount && <Text style={s.fieldError}>{errors.amount}</Text>}
          </View>

          {/* ── Category ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categoryRow}
            >
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    s.categoryChip,
                    category === c.value && s.categoryChipActive,
                  ]}
                  onPress={() => setCategory(c.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={c.icon}
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      s.categoryLabel,
                      category === c.value && s.categoryLabelActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Date ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Date</Text>
            <TouchableOpacity
              style={s.dropdownBtn}
              onPress={() => {
                // TODO: open date picker — for now shows alert
                Alert.alert(
                  'Date Picker',
                  'Wire your preferred DatePicker here',
                );
              }}
              activeOpacity={0.8}
            >
              <View style={s.dropdownLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={s.dropdownValue}>
                  {date === dayjs().format('YYYY-MM-DD')
                    ? `Today, ${dayjs(date).format('D MMM YYYY')}`
                    : dayjs(date).format('ddd, D MMM YYYY')}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* ── Paid by ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Paid by</Text>
            <TouchableOpacity
              style={s.dropdownBtn}
              onPress={() => setPaidByOpen(true)}
              activeOpacity={0.8}
            >
              <View style={s.dropdownLeft}>
                {paidByMember ? (
                  <>
                    <Avatar
                      name={paidByMember.user.name}
                      color={getMemberColor(paidByMember.user.name)}
                      size={28}
                    />
                    <Text style={s.dropdownValue}>
                      {paidByMember.user._id === user?._id
                        ? 'You'
                        : paidByMember.user.name}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[s.dropdownValue, { color: colors.textMuted }]}
                    >
                      Select payer
                    </Text>
                  </>
                )}
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* ── Split ── */}
          {selectedGroupId && splits.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>Split</Text>

              {/* Split type tabs */}
              <View style={s.splitTabRow}>
                {SPLIT_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      s.splitTab,
                      splitType === t.value && s.splitTabActive,
                    ]}
                    onPress={() => setSplitType(t.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        s.splitTabText,
                        splitType === t.value && s.splitTabTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Remaining indicator */}
              {splitType === 'exact' && totalAmount > 0 && (
                <View
                  style={[
                    s.remainingBar,
                    Math.abs(exactRemaining) <= 0.01 && s.remainingBarDone,
                  ]}
                >
                  <Ionicons
                    name={
                      Math.abs(exactRemaining) <= 0.01
                        ? 'checkmark-circle-outline'
                        : 'information-circle-outline'
                    }
                    size={15}
                    color={
                      Math.abs(exactRemaining) <= 0.01
                        ? colors.success
                        : colors.warning
                    }
                  />
                  <Text
                    style={[
                      s.remainingText,
                      Math.abs(exactRemaining) <= 0.01 && {
                        color: colors.success,
                      },
                    ]}
                  >
                    {Math.abs(exactRemaining) <= 0.01
                      ? 'Splits add up perfectly'
                      : exactRemaining > 0
                      ? `${
                          selectedGroup?.currency ?? 'PKR'
                        } ${exactRemaining.toFixed(2)} remaining`
                      : `${selectedGroup?.currency ?? 'PKR'} ${Math.abs(
                          exactRemaining,
                        ).toFixed(2)} over-allocated`}
                  </Text>
                </View>
              )}

              {splitType === 'percentage' && (
                <View
                  style={[
                    s.remainingBar,
                    Math.abs(percentRemaining) <= 0.01 && s.remainingBarDone,
                  ]}
                >
                  <Ionicons
                    name={
                      Math.abs(percentRemaining) <= 0.01
                        ? 'checkmark-circle-outline'
                        : 'information-circle-outline'
                    }
                    size={15}
                    color={
                      Math.abs(percentRemaining) <= 0.01
                        ? colors.success
                        : colors.warning
                    }
                  />
                  <Text
                    style={[
                      s.remainingText,
                      Math.abs(percentRemaining) <= 0.01 && {
                        color: colors.success,
                      },
                    ]}
                  >
                    {Math.abs(percentRemaining) <= 0.01
                      ? 'Splits add up to 100%'
                      : percentRemaining > 0
                      ? `${percentRemaining.toFixed(0)}% remaining`
                      : `${Math.abs(percentRemaining).toFixed(
                          0,
                        )}% over-allocated`}
                  </Text>
                </View>
              )}

              {errors.splits && (
                <Text style={[s.fieldError, { marginBottom: spacing.xs }]}>
                  {errors.splits}
                </Text>
              )}

              {/* Participants */}
              <View style={s.card}>
                {splits.map((entry, i) => (
                  <View key={entry.userId}>
                    <View style={s.participantRow}>
                      {/* Checkbox (equal) or include toggle */}
                      <TouchableOpacity
                        style={[
                          s.checkbox,
                          entry.included && s.checkboxChecked,
                        ]}
                        onPress={() => toggleIncluded(entry.userId)}
                        activeOpacity={0.7}
                      >
                        {entry.included && (
                          <Ionicons
                            name="checkmark"
                            size={13}
                            color={colors.textOnPrimary}
                          />
                        )}
                      </TouchableOpacity>

                      {/* Avatar + name */}
                      <Avatar
                        name={entry.name}
                        color={getMemberColor(entry.name)}
                        size={34}
                      />
                      <Text style={s.participantName}>
                        {entry.userId === user?._id ? 'You' : entry.name}
                      </Text>

                      {/* Right side */}
                      {splitType === 'equal' ? (
                        <Text style={s.equalShare}>
                          {entry.included && totalAmount > 0
                            ? `${
                                selectedGroup?.currency ?? 'PKR'
                              } ${equalShare}`
                            : '—'}
                        </Text>
                      ) : (
                        <View
                          style={[
                            s.splitInputWrap,
                            !entry.included && s.splitInputDisabled,
                          ]}
                        >
                          <TextInput
                            style={s.splitInput}
                            placeholder="0"
                            placeholderTextColor={colors.textMuted}
                            value={entry.amount}
                            onChangeText={v =>
                              updateSplitAmount(entry.userId, v)
                            }
                            keyboardType="decimal-pad"
                            editable={entry.included}
                          />
                          <Text style={s.splitInputSuffix}>
                            {splitType === 'percentage'
                              ? '%'
                              : selectedGroup?.currency ?? 'PKR'}
                          </Text>
                        </View>
                      )}
                    </View>
                    {i < splits.length - 1 && <View style={s.divider} />}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Notes ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>
              Notes <Text style={s.optional}>optional</Text>
            </Text>
            <View style={s.inputCard}>
              <TextInput
                style={[s.mainInput, s.textArea]}
                placeholder="Any additional notes..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                maxLength={1000}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Receipt placeholder ── */}
          <View style={s.section}>
            <TouchableOpacity
              style={s.receiptBtn}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={s.receiptBtnText}>Add Receipt</Text>
              <Text style={s.receiptBtnSub}>Coming soon</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: spacing.xl * 2 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Group picker modal ── */}
      <Modal
        visible={groupPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setGroupPickerOpen(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setGroupPickerOpen(false)}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Group</Text>
              <TouchableOpacity onPress={() => setGroupPickerOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {groups.map((g, i) => (
                <TouchableOpacity
                  key={g._id}
                  style={[
                    s.modalOption,
                    i < groups.length - 1 && s.modalOptionBorder,
                  ]}
                  onPress={() => {
                    setSelectedGroupId(g._id);
                    setGroupPickerOpen(false);
                    setSplits([]);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={s.modalOptionLeft}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <View>
                      <Text style={s.modalOptionLabel}>{g.title}</Text>
                      <Text style={s.modalOptionSub}>
                        {g.currency} · {g.members.length} members
                      </Text>
                    </View>
                  </View>
                  {selectedGroupId === g._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Paid by modal ── */}
      <Modal
        visible={paidByOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPaidByOpen(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setPaidByOpen(false)}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Who Paid?</Text>
              <TouchableOpacity onPress={() => setPaidByOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {groupMembers.map((m, i) => (
                <TouchableOpacity
                  key={m.user._id}
                  style={[
                    s.modalOption,
                    i < groupMembers.length - 1 && s.modalOptionBorder,
                  ]}
                  onPress={() => {
                    setPaidBy(m.user._id);
                    setPaidByOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={s.modalOptionLeft}>
                    <Avatar
                      name={m.user.name}
                      color={getMemberColor(m.user.name)}
                      size={36}
                    />
                    <Text style={s.modalOptionLabel}>
                      {m.user._id === user?._id ? 'You' : m.user.name}
                    </Text>
                  </View>
                  {paidBy === m.user._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Snackbar ── */}
      {snackbar && (
        <View style={s.snackbar}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={colors.textOnPrimary}
          />
          <Text style={s.snackbarText}>Expense added</Text>
          <TouchableOpacity
            onPress={() => {
              if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
              setSnackbar(false);
              navigation.goBack();
            }}
          >
            <Text style={s.snackbarAction}>View</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgPage },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
    backgroundColor: colors.bgPage,
  },
  closeBtn: { padding: spacing.xs, marginLeft: -spacing.xs },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 68,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textOnPrimary,
  },

  // Scroll
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },

  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger + '15',
    borderWidth: 1,
    borderColor: colors.danger + '35',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: { flex: 1, fontSize: fontSize.sm, color: colors.danger },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  required: { color: colors.danger },
  optional: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.textMuted,
  },
  fieldError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: 2,
  },

  // Input card
  inputCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputCardError: { borderColor: colors.danger },
  mainInput: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  textArea: { minHeight: 72 },

  // Amount card
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    overflow: 'hidden',
  },
  currencyLabel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    backgroundColor: colors.bgPage,
  },
  amountDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.bgCardBorder,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },

  // Category
  categoryRow: { gap: spacing.sm, paddingVertical: 2 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
  },
  categoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  categoryIcon: { fontSize: 16 },
  categoryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  categoryLabelActive: { color: colors.primary },

  // Dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownBtnError: { borderColor: colors.danger },
  dropdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dropdownValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },

  // Split tabs
  splitTabRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  splitTab: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  splitTabActive: { backgroundColor: colors.primary },
  splitTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  splitTabTextActive: { color: colors.textOnPrimary },

  // Remaining bar
  remainingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    backgroundColor: colors.warning + '15',
    marginBottom: spacing.sm,
  },
  remainingBarDone: { backgroundColor: colors.success + '15' },
  remainingText: {
    fontSize: fontSize.xs,
    color: colors.warning,
    fontWeight: fontWeight.medium,
  },

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: colors.bgCardBorder },

  // Participants
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.bgInputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  participantName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  equalShare: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  splitInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    minWidth: 90,
  },
  splitInputDisabled: { opacity: 0.4 },
  splitInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
    textAlign: 'right',
  },
  splitInputSuffix: { fontSize: fontSize.xs, color: colors.textSecondary },

  // Receipt
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderStyle: 'dashed',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  receiptBtnText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  receiptBtnSub: { fontSize: fontSize.xs, color: colors.textMuted },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl ?? 24,
    borderTopRightRadius: radius.xl ?? 24,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  modalOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  modalOptionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  modalOptionSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Snackbar
  snackbar: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  snackbarText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.bgPage,
    fontWeight: fontWeight.medium,
  },
  snackbarAction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});

export default AddExpenseScreen;
