import { createNativeStackNavigator } from '@react-navigation/native-stack';

const AuthStack = ()=>{
    const stack = createNativeStackNavigator();
    return(
      <stack.Navigator>
        <stack.Screen name='Login' component={}
      </stack.Navigator>
    );
}