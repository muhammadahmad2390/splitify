import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/AuthStore';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60; // seconds

// ─── Single OTP cell ──────────────────────────────────────────────────────────
function OtpCell({
  value,
  isFocused,
  onPress,
}: {
  value: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.cell, isFocused && s.cellFocused, !!value && s.cellFilled]}
    >
      <Text style={s.cellText}>{value || ''}</Text>
      {isFocused && !value && <View style={s.cursor} />}
    </TouchableOpacity>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
type Props = {
  route: { params: { email: string } };
  navigation: any;
};

const VerifyOtp = ({ route, navigation }: Props) => {
  const { email } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(RESEND_COUNTDOWN);
  const [localError, setLocalError] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Auto-focus input on mount ───────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Handle digit input ──────────────────────────────────────────────────────
  const handleChange = (text: string) => {
    // Allow paste of full OTP
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (cleaned.length > 1) {
      // Paste scenario — fill all cells
      const next = Array(OTP_LENGTH).fill('');
      cleaned.split('').forEach((char, i) => {
        next[i] = char;
      });
      setOtp(next);
      setFocusedIndex(Math.min(cleaned.length, OTP_LENGTH - 1));
      return;
    }

    const next = [...otp];

    if (cleaned === '') {
      // Backspace
      if (focusedIndex > 0) {
        next[focusedIndex] = '';
        // If current cell was empty, go back and clear previous
        if (!next[focusedIndex]) {
          next[focusedIndex - 1] = '';
          setFocusedIndex(focusedIndex - 1);
        }
      } else {
        next[0] = '';
      }
    } else {
      next[focusedIndex] = cleaned;
      if (focusedIndex < OTP_LENGTH - 1) {
        setFocusedIndex(focusedIndex + 1);
      }
    }

    setOtp(next);
    setLocalError(null);
  };

  const handleKeyPress = ({
    nativeEvent,
  }: {
    nativeEvent: { key: string };
  }) => {
    if (nativeEvent.key === 'Backspace') {
      const next = [...otp];
      if (otp[focusedIndex]) {
        next[focusedIndex] = '';
        setOtp(next);
      } else if (focusedIndex > 0) {
        next[focusedIndex - 1] = '';
        setOtp(next);
        setFocusedIndex(focusedIndex - 1);
      }
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const otpValue = otp.join('');
  const isComplete = otpValue.length === OTP_LENGTH;

  const handleVerify = async () => {
    if (!isComplete) return;
    setLocalError(null);
    try {
      await verifyOtp(email, otpValue);
      // Store sets isAuthenticated → true, navigator will redirect automatically
    } catch {
      setLocalError(
        useAuthStore.getState().error ?? 'Invalid OTP. Please try again.',
      );
      setOtp(Array(OTP_LENGTH).fill(''));
      setFocusedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // ── Resend ──────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLocalError(null);
    setOtp(Array(OTP_LENGTH).fill(''));
    setFocusedIndex(0);
    try {
      await resendOtp(email);
      setCountdown(RESEND_COUNTDOWN);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      setLocalError(useAuthStore.getState().error ?? 'Failed to resend OTP.');
    }
  };

  // Mask email: ab****@gmail.com
  const maskedEmail = email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => `${a}${'*'.repeat(Math.min(b.length, 4))}${c}`,
  );

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backButton}
            activeOpacity={0.7}
          >
            {/* Swap with <ArrowLeftSVG /> */}
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.walletIcon} />
          <Text style={s.headerTitle}>Verify email</Text>
        </View>

        <View style={s.content}>
          {/* ── Info block ── */}
          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>Check your email</Text>
            <Text style={s.welcomeSubtitle}>
              We sent a 6-digit code to{' '}
              <Text style={s.emailHighlight}>{maskedEmail}</Text>. Enter it
              below to verify your account.
            </Text>
          </View>

          {/* ── OTP cells ── */}
          <View style={s.otpRow}>
            {otp.map((digit, i) => (
              <OtpCell
                key={i}
                value={digit}
                isFocused={focusedIndex === i}
                onPress={() => {
                  setFocusedIndex(i);
                  inputRef.current?.focus();
                }}
              />
            ))}
          </View>

          {/* Hidden real input that drives the cells */}
          <TextInput
            ref={inputRef}
            value={otp[focusedIndex] ?? ''}
            onChangeText={handleChange}
            onKeyPress={handleKeyPress}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={s.hiddenInput}
            caretHidden
            autoComplete="one-time-code" // Android SMS autofill
            textContentType="oneTimeCode" // iOS autofill
          />

          {/* ── Error ── */}
          {localError && (
            <View style={s.errorContainer}>
              <Text style={s.errorText}>{localError}</Text>
            </View>
          )}

          {/* ── Verify button ── */}
          <TouchableOpacity
            style={[
              s.primaryButton,
              {
                backgroundColor:
                  !isComplete || isLoading ? colors.textMuted : colors.primary,
              },
            ]}
            activeOpacity={0.85}
            onPress={handleVerify}
            disabled={!isComplete || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={s.primaryButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          {/* ── Resend ── */}
          <View style={s.resendRow}>
            <Text style={s.resendPrompt}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={countdown > 0}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  s.resendLink,
                  countdown > 0 && { color: colors.textMuted },
                ]}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },

  // Welcome block
  welcomeBlock: {
    marginBottom: spacing.xl + 4,
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
  emailHighlight: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },

  // OTP cells
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: colors.bgInputBorder,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.bgPage,
  },
  cellFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.bgCard,
  },
  cellText: {
    fontSize: fontSize.xl ?? 22,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  cursor: {
    width: 2,
    height: fontSize.lg,
    backgroundColor: colors.primary,
    borderRadius: 1,
    position: 'absolute',
  },

  // Hidden input
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  // Error
  errorContainer: {
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },

  // Primary button
  primaryButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.md + 1,
    alignItems: 'center',
    marginTop: spacing.xs,
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

  // Resend row
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.lg,
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
});

export default VerifyOtp;
