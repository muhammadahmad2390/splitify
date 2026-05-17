import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '@/theme';
import HomeScreen from '@/screens/HomeScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GroupsScreen from '@/screens/GroupsScreen';
import ActivityScreen from "@/screens/ActivityScreen";

// ─── Placeholder screens — replace with real screens as you build them ────────
import { SafeAreaView } from 'react-native-safe-area-context';

const Placeholder = ({ label }: { label: string }) => (
  <SafeAreaView
    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
  >
    <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
      {label} — coming soon
    </Text>
  </SafeAreaView>
);



const SettingsScreen = () => <Placeholder label="Settings" />;

// ─── Tab icons ────────────────────────────────────────────────────────────────
const TABS = [
  { name: 'Home',     icon: 'wallet-outline',   iconActive: 'wallet' },
  { name: 'Groups',   icon: 'people-outline',   iconActive: 'people' },
  { name: 'Activity', icon: 'receipt-outline',  iconActive: 'receipt' },
  { name: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
] as const;

const { colors, spacing, fontSize, fontWeight } = theme;

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={s.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = TABS[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={s.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
          <Ionicons
  name={isFocused ? tab.iconActive : tab.icon}
  size={22}
  color={isFocused ? colors.primary : colors.textMuted}
/>
            <Text
              style={[s.tabLabel, isFocused && s.tabLabelActive]}
            >
              {tab.name}
            </Text>
            {isFocused && <View style={s.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const s = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.bgCardBorder,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -spacing.sm,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});

export default AppTabs;
