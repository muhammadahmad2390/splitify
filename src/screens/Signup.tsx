import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import LabelledInput from '@/components/atoms/LabelledInput';
import { useAuthStore } from '@/store/AuthStore';
import { useNavigation } from '@react-navigation/native';
const { colors, spacing, radius, fontSize, fontWeight } = theme;

// ─── Or divider ────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <View style={s.orRow}>
      <View style={s.orLine} />
      <Text style={s.orText}>or continue with</Text>
      <View style={s.orLine} />
    </View>
  );
}

// ─── SSO button ────────────────────────────────────────────────────────────────
function SSOButton({ label }: { label: string }) {
  return (
    <TouchableOpacity style={s.ssoButton} activeOpacity={0.7}>
      <Text style={s.ssoLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const navigation = useNavigation<any>();

  const { register, isLoading } = useAuthStore();

  const isFormValid =
    !!name && !!email && !!password && !!confirmPassword && !isLoading;

  const handleSignup = async () => {
    setLocalError(null);
    if (password !== confirmPassword)
      return setLocalError('Passwords do not match.');
    if (password.length < 6)
      return setLocalError('Password must be at least 6 characters.');

    try {
      await register(name, email, password);
      navigation.navigate('VerifyOtp', { email }); // fresh register
    } catch (err: any) {
      const response = err?.response?.data;

      if (response?.status === 'unverified') {
        // User exists but never verified — backend already resent OTP
        navigation.navigate('VerifyOtp', { email }); // just go to OTP
        return;
      }

      if (response?.status === 'already_registered') {
        setLocalError(response.message);

        return;
      }

      setLocalError(useAuthStore.getState().error ?? 'Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          {/* Swap with <WalletSVG width={22} height={22} color={colors.primary} /> */}
          <View style={s.walletIcon} />
          <Text style={s.headerTitle}>Create account</Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Welcome block ── */}
          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>Get started</Text>
            <Text style={s.welcomeSubtitle}>
              Create an account to track and split expenses.
            </Text>
          </View>

          {/* ── Form ── */}
          <View>
            <View style={s.fieldGroup}>
              <LabelledInput
                label="Full name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
              />
              <LabelledInput
                label="Email"
                placeholder="you@email.com"
                value={email}
                onChangeText={setEmail}
              />
              <LabelledInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <LabelledInput
                label="Confirm password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {localError && (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{localError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                s.primaryButton,
                {
                  backgroundColor: !isFormValid
                    ? colors.textMuted
                    : colors.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={handleSignup}
              disabled={!isFormValid}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Text style={s.primaryButtonText}>Create account</Text>
              )}
            </TouchableOpacity>

            <OrDivider />

            <View style={s.ssoRow}>
              <SSOButton label="Google" />
              <SSOButton label="Apple" />
            </View>
          </View>

          {/* ── Login nudge ── */}
          <View style={s.loginRow}>
            <Text style={s.loginPrompt}>Already have an account?</Text>
            <Pressable onPress={() => navigation.replace('Login')}>
              <Text style={s.loginLink}>Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles — all values from theme tokens, nothing hardcoded
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
    backgroundColor: colors.bgPage,
  },
  walletIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },

  // Scroll
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },

  // Welcome block
  welcomeBlock: {
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: fontSize.md * 1.5,
  },

  // Field group
  fieldGroup: {
    gap: spacing.md + 4,
    marginBottom: spacing.xs,
  },

  // Primary button
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 1,
    alignItems: 'center',
    marginTop: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },

  // Or divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm + 4,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  orText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },

  // SSO
  ssoRow: {
    flexDirection: 'row',
    gap: spacing.sm + 6,
  },
  ssoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    backgroundColor: colors.bgCard,
  },
  ssoLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },

  // Login row
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.xl,
  },
  loginPrompt: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: fontWeight.semibold,
  },

  // Error
  errorContainer: {
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});

export default Signup;
