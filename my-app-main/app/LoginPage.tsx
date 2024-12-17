import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from './firebaseConfig'; // ייבוא ההגדרות של Firestore
import { collection, query, where, getDocs } from 'firebase/firestore';


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // יצירת שאילתה לקולקציית `users` עם שם משתמש תואם
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('username', '==', username));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        // קבלת המסמך הראשון מהתוצאה
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // בדיקת סיסמה
        if (userData.password === password) {
          setWelcomeMessage(`Hello, ${username}!`);
          Alert.alert('Success', `Welcome back, ${username}!`);
        } else {
          setWelcomeMessage('');
          Alert.alert('Error', 'Incorrect password');
        }
      } else {
        setWelcomeMessage('');
        Alert.alert('Error', 'User not found');
      }
    } catch (error) {
      setWelcomeMessage('');
      Alert.alert('Error', 'An error occurred while logging in');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {welcomeMessage ? <Text style={styles.welcomeText}>{welcomeMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    marginTop: 20,
    fontSize: 18,
    color: 'green',
  },
});