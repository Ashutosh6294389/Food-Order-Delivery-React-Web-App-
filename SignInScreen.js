import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image } from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';

const images = [
  require('./assets/img.png'),
  require('./assets/img1.png'),
  require('./assets/img2.png'),
  require('./assets/img4.png'),
  require('./assets/img5.png'),
];

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Home');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 2000); // Change image every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigation.navigate('Home'); // Navigate to Home after successful login
  } catch (err) {
    if (err.code === 'auth/invalid-credential') {
      setError('Email has not been registered or incorrect password.');
    } else if (err.code === 'auth/wrong-password') {
      setError('Incorrect password.');
    } else if (err.code === 'auth/invalid-email') {
      setError('Invalid email address.');
    } else {
      setError(err.message);
    }
  }
};

  return (
    <View style={styles.container}>
      <Image source={images[imageIndex]} style={styles.carouselImage} />
      <Text style={styles.title}>Sign In</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} color="#2196F3" />
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
        color="#4CAF50"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', padding: 20, paddingTop: 40 },
  carouselImage: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    borderRadius: 10,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5 },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});