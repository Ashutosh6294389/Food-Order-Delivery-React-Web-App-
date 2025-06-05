import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './SignInScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import MenuScreen from './MenuScreen';
import React, { useEffect, useState } from 'react';
import { CartProvider } from './CartContext';
import CartScreen from './CartScreen';
import PastOrdersScreen from './PastOrdersScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import HelpSupportScreen from './HelpSupportScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
  const start = Date.now();
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);
    const elapsed = Date.now() - start;
    const minSplash = 1000; // 1 second
    setTimeout(() => setAuthLoading(false), Math.max(0, minSplash - elapsed));
  });
  return unsubscribe;
}, []);

  if (authLoading) {
    // Show splash screen with logo and app name
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Image source={require('./assets/icon.png')} style={{ width: 100, height: 100, marginBottom: 20 }} />
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ff7043', marginBottom: 10 }}>QuickBite</Text>
        <ActivityIndicator size="large" color="#ff7043" />
      </View>
    );
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={user ? "Home" : "SignIn"}>
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ title: 'Menu'}} />
          <Stack.Screen name="CartScreen" component={CartScreen} options={{ title: 'Cart'}}/>
          <Stack.Screen name="PastOrders" component={PastOrdersScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}