import { useState, useRef, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import Avatar from '@/components/atoms/Avatar';
import { getMemberColor } from '@/components/molecules/MemberStack';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '@/config/axios';
import { useGroupStore } from '@/store/GroupStore';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchedUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

type Currency = 'PKR' | 'USD';

const CURRENCY_OPTIONS: { value: Currency; label: string; flag: string; sub: string }[] = [
  { value: 'PKR', label: 'Pakistani Rupee', flag: '🇵🇰', sub: 'PKR' },
  { value: 'USD', label: 'US Dollar', flag: '🇺🇸', sub: 'USD' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

const CreateGroupScreen = ({ navigation }: { navigation: any }) => {
  const { fetchGroups } = useGroupStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<Currency>('PKR');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<SearchedUser[]>([]);

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searching, setSearching] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; general?: string }>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.value === currency)!;

  // ── Member search ──────────────────────────────────────────────────────────
  const onSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      setSearchResults([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!text.trim() || text.trim().length < 2) return;
      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await api.get(`/users/search?q=${encodeURIComponent(text.trim())}`);
          const users: SearchedUser[] = res.data.users ?? [];
          setSearchResults(users.filter(u => !selectedMembers.find(m => m._id === u._id)));
        } catch {
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 400);
    },
    [selectedMembers],
  );

  const addMember = useCallback((user: SearchedUser) => {
    setSelectedMembers(prev => [...prev, user]);
    setSearchText('');
    setSearchResults([]);
  }, []);

  const removeMember = useCallback((userId: string) => {
    setSelectedMembers(prev => prev.filter(m => m._id !== userId));
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = 'Group name is required';
    else if (title.trim().length < 2) newErrors.title = 'Must be at least 2 characters';
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        currency,
        members: selectedMembers.map(m => ({ user: m._id })),
      };
      const res = await api.post('/groups', payload);
      const groupId = res.data.body._id;
      await fetchGroups();
      // navigation.replace('GroupDetails', { groupId }); fix later when GroupDetails screen is ready
    } catch (err: any) {
      setErrors({
        general:
          err?.response?.data?.message || err?.message || 'Something went wrong.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.screen} edges={['top']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Group</Text>
        <TouchableOpacity
          style={[s.createBtn, submitting && s.createBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator size="small" color={colors.textOnPrimary} />
            : <Text style={s.createBtnText}>Create</Text>
          }
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* General error */}
          {errors.general && (
            <View style={s.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text style={s.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          {/* ── Group name ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Group Name <Text style={s.required}>*</Text></Text>
            <View style={[s.inputCard, errors.title && s.inputCardError]}>
              <TextInput
                style={s.mainInput}
                placeholder="e.g. Trip to Hunza"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={t => {
                  setTitle(t);
                  if (errors.title) setErrors(e => ({ ...e, title: undefined }));
                }}
                maxLength={100}
                returnKeyType="next"
              />
            </View>
            {errors.title && <Text style={s.fieldError}>{errors.title}</Text>}
          </View>

          {/* ── Description ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>
              Description{'  '}
              <Text style={s.optional}>optional</Text>
            </Text>
            <View style={s.inputCard}>
              <TextInput
                style={[s.mainInput, s.textArea]}
                placeholder="What's this group for?"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                maxLength={255}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Currency ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Currency</Text>
            <TouchableOpacity
              style={s.dropdownBtn}
              onPress={() => setCurrencyOpen(true)}
              activeOpacity={0.8}
            >
              <View style={s.dropdownLeft}>
                <Text style={s.dropdownFlag}>{selectedCurrency.flag}</Text>
                <View>
                  <Text style={s.dropdownValue}>{selectedCurrency.sub}</Text>
                  <Text style={s.dropdownSub}>{selectedCurrency.label}</Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── Members ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Add Members</Text>

            {/* Selected bubbles */}
            {selectedMembers.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.bubblesRow}
              >
                {selectedMembers.map(m => (
                  <View key={m._id} style={s.bubble}>
                    <View style={s.bubbleAvatarWrap}>
                      <Avatar name={m.name} color={getMemberColor(m.name)} size={52} />
                      <TouchableOpacity
                        style={s.bubbleRemove}
                        onPress={() => removeMember(m._id)}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      >
                        <Ionicons name="close-circle" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                    <Text style={s.bubbleName} numberOfLines={1}>
                      {m.name.split(' ')[0]}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Search card */}
            <View style={s.card}>
              <View style={s.searchWrap}>
                <EvilIcons name="search" size={24} color={colors.textMuted} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search by name or email"
                  placeholderTextColor={colors.textMuted}
                  value={searchText}
                  onChangeText={onSearchChange}
                  returnKeyType="search"
                />
                {searching
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : searchText.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchText(''); setSearchResults([]); }}>
                      <Ionicons name="close" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )
                }
              </View>

              {/* Results */}
              {searchResults.length > 0 && (
                <>
                  <View style={s.divider} />
                  {searchResults.map(u => (
                    <TouchableOpacity
                      key={u._id}
                      style={s.resultRow}
                      onPress={() => addMember(u)}
                      activeOpacity={0.7}
                    >
                      <Avatar name={u.name} color={getMemberColor(u.name)} size={42} />
                      <View style={s.resultInfo}>
                        <Text style={s.resultName}>{u.name}</Text>
                        <Text style={s.resultEmail}>{u.email}</Text>
                      </View>
                      <View style={s.addBadge}>
                        <Ionicons name="add" size={18} color={colors.textOnPrimary} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* No results */}
              {!searching && searchText.trim().length >= 2 && searchResults.length === 0 && (
                <>
                  <View style={s.divider} />
                  <View style={s.noResults}>
                    <Text style={s.noResultsText}>No users found</Text>
                  </View>
                </>
              )}

              {/* Hint */}
              {!searchText && selectedMembers.length === 0 && (
                <View style={s.hint}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                  <Text style={s.hintText}>You can also add members later</Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ height: spacing.xl * 2 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Currency dropdown modal ── */}
      <Modal
        visible={currencyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyOpen(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setCurrencyOpen(false)}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {CURRENCY_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  s.currencyOption,
                  i < CURRENCY_OPTIONS.length - 1 && s.currencyOptionBorder,
                ]}
                onPress={() => { setCurrency(opt.value); setCurrencyOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={s.currencyOptionFlag}>{opt.flag}</Text>
                <View style={s.currencyOptionInfo}>
                  <Text style={s.currencyOptionLabel}>{opt.label}</Text>
                  <Text style={s.currencyOptionSub}>{opt.sub}</Text>
                </View>
                {currency === opt.value && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
  backBtn: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  createBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 76,
    alignItems: 'center',
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textOnPrimary,
  },

  // Scroll
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },

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
  errorBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.danger,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.danger,
  },
  optional: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.textMuted,
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
  inputCardError: {
    borderColor: colors.danger,
  },
  mainInput: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  textArea: {
    minHeight: 80,
  },
  fieldError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // Currency dropdown button
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
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dropdownFlag: {
    fontSize: 28,
  },
  dropdownValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  dropdownSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // General card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.bgCardBorder,
  },

  // Member bubbles
  bubblesRow: {
    paddingBottom: spacing.md,
    paddingHorizontal: 2,
    paddingVertical:10,
    gap: spacing.lg,
  },
  bubble: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 60,
  },
  bubbleAvatarWrap: {
    position: 'relative',
  },
  bubbleRemove: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.bgPage,
    borderRadius: 99,
  },
  bubbleName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },

  // Results
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  resultInfo: { flex: 1 },
  resultName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  resultEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBadge: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // No results / hint
  noResults: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  hintText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Currency modal
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
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  currencyOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  currencyOptionFlag: {
    fontSize: 32,
  },
  currencyOptionInfo: { flex: 1 },
  currencyOptionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  currencyOptionSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default CreateGroupScreen;