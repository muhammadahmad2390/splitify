import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@/screens/Login';
import Signup from '@/screens/Signup';
import VerifyOtp from '@/screens/verifyOtp';
import ForgotPassword from '@/screens/ForgotPassword';
import CheckEmail from '@/screens/CheckEmail';
import ResetPassword from '@/screens/ResetPassword';
import { AuthStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="CheckEmail" component={CheckEmail} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack;
