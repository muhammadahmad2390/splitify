import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity } from 'react-native';
const Login = () => {
  return (
    <View>
      <Text>Login</Text>
      <TouchableOpacity
        style={{ backgroundColor: 'green', height: 100, width: 100 }}
        onPress={() => {
          AsyncStorage.setItem('hasSeenOnboarding', 'false');
          console.log(
            'async value',
            AsyncStorage.removeItem('hasSeenOnboarding'),
          );
        }}
      >
        <Text>reset</Text>
      </TouchableOpacity>
    </View>
  );
};
export default Login;
