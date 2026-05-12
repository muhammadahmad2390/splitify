import { View, StyleSheet } from 'react-native';
import Avatar from '@/components/atoms/Avatar';

interface Member {
  name: string;
  color?: string;
  avatar?: string;
}

interface MemberStackProps {
  members: Member[];
  size?: number;
  max?: number;
}

// Maps member name to a color — in real app use member.color from API
const COLORS = [
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // violet
];

export const getMemberColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const MemberStack = ({ members, size = 28, max = 4 }: MemberStackProps) => {
  const visible = members.slice(0, max);

  return (
    <View style={s.row}>
      {visible.map((m, i) => (
        <View
          key={m.name + i}
          style={[s.avatarWrap, { marginLeft: i === 0 ? 0 : -(size * 0.35) }]}
        >
          <Avatar
            name={m.name}
            color={m.color ?? getMemberColor(m.name)}
            size={size}
          />
        </View>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    zIndex: 1,
  },
});

export default MemberStack;
