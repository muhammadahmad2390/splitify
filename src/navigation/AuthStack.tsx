import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@/screens/Login';
import Signup from '@/screens/Signup';
import Splash from '@/screens/Splash';
const AuthStack = () => {
  const AuthStack = createNativeStackNavigator();
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Signup"
        component={Signup}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
};
export default AuthStack;
