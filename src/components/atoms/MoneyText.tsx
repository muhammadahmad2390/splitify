import { Text, TextStyle } from 'react-native';
import { theme } from '@/theme';

const { colors, fontSize, fontWeight } = theme;

interface MoneyTextProps {
  amount: number;
  size?: number;
  style?: TextStyle;
  showSign?: boolean;
}

const MoneyText = ({
  amount,
  size,
  style,
  showSign = true,
}: MoneyTextProps) => {
  const sign = amount < 0 ? '-' : amount > 0 && showSign ? '+' : '';
  const abs = Math.abs(amount).toLocaleString();
  const color =
    amount < 0
      ? colors.danger
      : amount > 0
      ? colors.success
      : colors.textSecondary;

  return (
    <Text
      style={[
        {
          color,
          fontSize: size ?? fontSize.md,
          fontWeight: fontWeight.semibold,
        },
        style,
      ]}
    >
      {sign} Rs {abs}
    </Text>
  );
};

export default MoneyText;
