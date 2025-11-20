import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import RootNavigation from './navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<
    boolean | undefined
  >(undefined);
  const isDarkMode = useColorScheme() === 'dark';

  const checkOnboarding = async () => {
    const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding != null) {
      setHasSeenOnboarding(true);
    } else {
      setHasSeenOnboarding(false);
    }
  };

  useEffect(() => {
    checkOnboarding();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'light-content'} />
      <RootNavigation hasSeenOnboarding={hasSeenOnboarding} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
