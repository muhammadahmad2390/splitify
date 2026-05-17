import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinkingOptions } from '@react-navigation/native';
import Onboardings from '@/screens/Onboardings';
import Splash from '@/screens/Splash';
import AuthStack from '@/navigation/AuthStack';
import { RootStackParamList } from '@/types/navigation';
import MainStack from './MainStack';
import { useAuthStore } from '@/store/AuthStore';

const RootNavigator = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['splitify://', 'https://splitify-kappa.vercel.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: {
            path: 'reset-password',
            parse: {
              token: (token: string) => token,
            },
          },
        },
      },
    },
  },
};
const RootNavigation = ({
  hasSeenOnboarding,
}: {
  hasSeenOnboarding: boolean | undefined;
}) => {
  const { isAuthenticated } = useAuthStore();

  if (hasSeenOnboarding == undefined) {
    return <Splash />;
  }

  const initialRoute = isAuthenticated
    ? 'Main'
    : hasSeenOnboarding
    ? 'Auth'
    : 'Onboarding';

  return (
    <NavigationContainer linking={linking}>
      <RootNavigator.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <RootNavigator.Screen name="Onboarding" component={Onboardings} />
        <RootNavigator.Screen name="Auth" component={AuthStack} />
        <RootNavigator.Screen name="Main" component={MainStack} />
      </RootNavigator.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
