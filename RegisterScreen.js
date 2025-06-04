import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { setDoc, doc } from 'firebase/firestore';

const images = [
  require('./assets/img.png'),
  require('./assets/img1.png'),
  require('./assets/img2.png'),
  require('./assets/img4.png'),
  require('./assets/img5.png'),
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  
  useEffect(() => {
      const interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % images.length);
      }, 2000); // Change image every 2 seconds
      return () => clearInterval(interval);
    }, []);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        phone,
        email,
      });
      navigation.navigate('SignIn');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={images[imageIndex]} style={styles.carouselImage} />
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
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
      <Button title="Register" onPress={handleRegister} color="#4CAF50" />
      <Button
        title="Back to Sign In"
        onPress={() => navigation.navigate('SignIn')}
        color="#2196F3"
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