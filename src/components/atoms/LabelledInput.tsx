import { View, StyleSheet, TextInput, Pressable, Text } from 'react-native';
import EyeSVG from '@/assets/SVG/Eye';
import EyeOffSVG from '@/assets/SVG/EyeOff';
import { useState } from 'react';
import { theme } from '@/theme';
import { fontWeight } from '@/theme/typography';

type InputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
};

const LabelledInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.labelContainer}>

      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          // If it's a password field, hide text UNLESS the user toggled show
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* Only render the eye toggle if this is a password field */}
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(s => !s)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {/* Switch icon based on showPassword state, NOT the secureTextEntry prop */}
            {showPassword
              ? <EyeOffSVG height={20} width={20} />
              : <EyeSVG height={20} width={20} />
            }
          </Pressable>
        )}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    gap: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.bgInputBorder,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgInput,
    paddingHorizontal: theme.spacing.md,
    height: theme.inputHeight,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primaryLight,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
});

export default LabelledInput;