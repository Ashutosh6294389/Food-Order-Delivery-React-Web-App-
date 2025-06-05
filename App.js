import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './SignInScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import MenuScreen from './MenuScreen';
import React from 'react';
import { CartProvider } from './CartContext';
import CartScreen from './CartScreen';
import PastOrdersScreen from './PastOrdersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <CartProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MenuScreen" component={MenuScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="PastOrders" component={PastOrdersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </CartProvider>
  );
}