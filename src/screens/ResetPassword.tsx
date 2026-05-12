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

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const ResetPassword = ({ route, navigation }: Props) => {
  const { token } = route.params; // injected automatically by deep link
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  const isFormValid = !!password && !!confirmPassword && !isLoading;

  const handleReset = async () => {
    setLocalError(null);

    if (password.length < 6) {
      return setLocalError('Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      return setLocalError('Passwords do not match.');
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      // Give user a moment to see success then go to login
      setTimeout(() => navigation.replace('Login'), 1500);
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
          <View style={s.walletIcon} />
          <Text style={s.headerTitle}>Reset password</Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Info block ── */}
          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>New password</Text>
            <Text style={s.welcomeSubtitle}>
              Choose a strong password for your account.
            </Text>
          </View>

          {/* ── Form ── */}
          <View>
            <View style={s.fieldGroup}>
              <LabelledInput
                label="New password"
                placeholder="Create a new password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <LabelledInput
                label="Confirm password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* ── Error ── */}
            {localError && (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{localError}</Text>
              </View>
            )}

            {/* ── Success ── */}
            {success && (
              <View style={s.successContainer}>
                <Text style={s.successText}>
                  Password reset successfully. Redirecting to login...
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                s.primaryButton,
                {
                  backgroundColor:
                    !isFormValid || success ? colors.textMuted : colors.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={handleReset}
              disabled={!isFormValid || success}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Text style={s.primaryButtonText}>Reset password</Text>
              )}
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
  successContainer: {
    marginTop: spacing.sm,
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.primary,
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
});

export default ResetPassword;
