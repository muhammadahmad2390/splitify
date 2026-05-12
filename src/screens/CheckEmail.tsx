import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/AuthStore';
import { AuthStackParamList } from '@/types/navigation';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

const RESEND_COUNTDOWN = 60;

type Props = NativeStackScreenProps<AuthStackParamList, 'CheckEmail'>;

const CheckEmail = ({ route, navigation }: Props) => {
  const { email } = route.params;
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { forgotPassword, isLoading } = useAuthStore();

  // ── Countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Resend ──────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLocalError(null);
    setResendSuccess(false);
    try {
      await forgotPassword(email);
      setCountdown(RESEND_COUNTDOWN);
      setResendSuccess(true);
    } catch {
      setLocalError(
        useAuthStore.getState().error ?? 'Failed to resend. Try again.',
      );
    }
  };

  // ── Open mail app ───────────────────────────────────────────────────────────
  const handleOpenMail = () => {
    Linking.openURL('mailto:').catch(() =>
      setLocalError('Could not open mail app.'),
    );
  };

  // Mask email: ab****@gmail.com
  const maskedEmail = email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => `${a}${'*'.repeat(Math.min(b.length, 4))}${c}`,
  );

  return (
    <SafeAreaView style={s.screen}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backButton}
          activeOpacity={0.7}
        >
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.walletIcon} />
        <Text style={s.headerTitle}>Check your email</Text>
      </View>

      <View style={s.content}>
        {/* ── Icon ── */}
        <View style={s.iconCircle}>
          {/* Swap with an email SVG icon */}
          <Text style={s.iconEmoji}>✉️</Text>
        </View>

        {/* ── Info ── */}
        <Text style={s.title}>Check your inbox</Text>
        <Text style={s.subtitle}>
          We sent a password reset link to{' '}
          <Text style={s.emailHighlight}>{maskedEmail}</Text>. Tap the link in
          the email to reset your password.
        </Text>

        <Text style={s.expiry}>The link expires in 10 minutes.</Text>

        {/* ── Open mail button ── */}
        <TouchableOpacity
          style={s.primaryButton}
          activeOpacity={0.85}
          onPress={handleOpenMail}
        >
          <Text style={s.primaryButtonText}>Open email app</Text>
        </TouchableOpacity>

        {/* ── Error / success ── */}
        {localError && (
          <Text style={s.errorText}>{localError}</Text>
        )}
        {resendSuccess && (
          <Text style={s.successText}>Reset link resent successfully.</Text>
        )}

        {/* ── Resend ── */}
        <View style={s.resendRow}>
          <Text style={s.resendPrompt}>Didn't receive the email?</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={countdown > 0 || isLoading}
            activeOpacity={0.6}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginLeft: spacing.xs }}
              />
            ) : (
              <Text
                style={[
                  s.resendLink,
                  (countdown > 0) && { color: colors.textMuted },
                ]}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Back to login ── */}
        <TouchableOpacity
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.6}
          style={s.backToLogin}
        >
          <Text style={s.backToLoginText}>← Back to login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
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
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  backArrow: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl * 2,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: fontSize.md * 1.5,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailHighlight: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  expiry: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 1,
    alignItems: 'center',
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
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.xl,
  },
  resendPrompt: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: fontWeight.semibold,
  },
  backToLogin: {
    marginTop: spacing.lg,
  },
  backToLoginText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default CheckEmail;
