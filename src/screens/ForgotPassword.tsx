import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@/theme';
import LabelledInput from '@/components/atoms/LabelledInput';
import { useAuthStore } from '@/store/AuthStore';
import { AuthStackParamList } from '@/types/navigation';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPassword = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSubmit = async () => {
    setLocalError(null);
    try {
      await forgotPassword(email);
      navigation.replace('CheckEmail', { email });
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backButton}
            activeOpacity={0.7}
          >
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.walletIcon} />
          <Text style={s.headerTitle}>Forgot password</Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Info block ── */}
          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>Reset password</Text>
            <Text style={s.welcomeSubtitle}>
              Enter the email associated with your account and we'll send you a
              reset link.
            </Text>
          </View>

          {/* ── Form ── */}
          <View>
            <View style={s.fieldGroup}>
              <LabelledInput
                label="Email"
                placeholder="you@email.com"
                value={email}
                onChangeText={setEmail}
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
                  backgroundColor:
                    !email || isLoading ? colors.textMuted : colors.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={!email || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Text style={s.primaryButtonText}>Send reset link</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Back to login ── */}
          <View style={s.loginRow}>
            <Text style={s.loginPrompt}>Remembered your password?</Text>
            <TouchableOpacity
              onPress={() => navigation.replace('Login')}
              activeOpacity={0.6}
            >
              <Text style={s.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
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
  fieldGroup: {
    gap: spacing.md + 4,
    marginBottom: spacing.xs,
  },
  errorContainer: {
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  primaryButton: {
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
});

export default ForgotPassword;
