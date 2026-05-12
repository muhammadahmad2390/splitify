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
import ForgotPassword from './ForgotPassword';

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
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Remove error and clearError from store destructure
  const { login, isLoading } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    setLocalError(null);
    try {
      await login(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch {
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
          {/* Swap the View below with <WalletSVG width={22} height={22} color={colors.primary} /> */}
          <View style={s.walletIcon} />
          <Text style={s.headerTitle}>Sign in</Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Welcome block ── */}
          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>Welcome back</Text>
            <Text style={s.welcomeSubtitle}>
              Enter your details to continue.
            </Text>
          </View>

          {/* ── Form card ── */}
          <View>
            <View style={s.fieldGroup}>
              <LabelledInput
                placeholder="you@email.com"
                value={email}
                onChangeText={e => {
                  setEmail(e);
                }}
                label="Email"
              />
              <LabelledInput
                placeholder="••••••••"
                value={password}
                onChangeText={(e: string) => {
                  setPassword(e);
                }}
                label="Password"
                secureTextEntry={true}
              />

              <TouchableOpacity
                style={s.forgotRow}
                activeOpacity={0.6}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
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
                  backgroundColor:
                    isLoading || !email || !password
                      ? colors.textMuted
                      : colors.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Text style={s.primaryButtonText}>Log in</Text>
              )}
            </TouchableOpacity>

            <OrDivider />

            <View style={s.ssoRow}>
              <SSOButton label="Google" />
              <SSOButton label="Apple" />
            </View>
          </View>

          {/* ── Sign-up nudge ── */}
          <View style={s.signupRow}>
            <Text style={s.signupPrompt}>Don't have an account?</Text>
            <Pressable onPress={() => navigation.replace('Signup')}>
              <Text style={s.signupLink}>Create account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles — every value comes from theme tokens, nothing hardcoded
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

  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: fontWeight.medium,
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

  // Sign-up row
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.xl,
  },
  signupPrompt: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: fontWeight.semibold,
  },
  errorContainer: {
    marginTop: spacing.sm,
  },

  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});

export default Login;
