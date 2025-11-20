import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboardings from '@/screens/Onboardings';
import Splash from '@/screens/Splash';
import AuthStack from '@/navigation/AuthStack';

const RootNavigation = ({
  hasSeenOnboarding,
}: {
  hasSeenOnboarding: boolean | undefined;
}) => {
  const RootNavigator = createNativeStackNavigator();

  if (hasSeenOnboarding == undefined) {
    return <Splash />;
  }

  return (
    <NavigationContainer>
      <RootNavigator.Navigator
        initialRouteName={hasSeenOnboarding ? 'Auth' : 'Onboarding'}
      >
        <RootNavigator.Screen
          name="Onboarding"
          component={Onboardings}
          options={{ headerShown: false }}
        />

        <RootNavigator.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      </RootNavigator.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
