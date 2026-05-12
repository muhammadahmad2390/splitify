import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

const { fontSize, fontWeight } = theme;

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
}

const Avatar = ({ name, color = '#6366f1', size = 32 }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        s.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[s.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initials: {
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },
});

export default Avatar;
