import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithCredential, createUserWithEmailAndPassword, FacebookAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface IGoogleSignin {
  hasPlayServices: () => Promise<void>;
  signIn: () => Promise<any>;
  getTokens: () => Promise<{ idToken: string }>;
  configure: (config: { webClientId: string }) => void;
}

interface ILoginManager {
  logInWithPermissions: (permissions: string[]) => Promise<{ isCancelled: boolean }>;
}

interface IAccessToken {
  getCurrentAccessToken: () => Promise<{ accessToken: string } | null>;
}

let GoogleSignin: IGoogleSignin, 
    LoginManager: ILoginManager, 
    AccessToken: IAccessToken;

// Conditionally require native-only modules
if (Platform.OS !== 'web') {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  const FBSDK = require('react-native-fbsdk-next');
  LoginManager = FBSDK.LoginManager;
  AccessToken = FBSDK.AccessToken;

  // Configure Google Sign-In for native platforms
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });
}

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Google Sign-In for Web
  const handleWebGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', `Welcome, ${user.displayName || 'User'}!`);
    } catch (error: any) {
      Alert.alert('Error', `Google Sign-In failed: ${error.message}`);
    }
  };

  // Google Sign-In for Native
  const handleNativeGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      const auth = getAuth();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);

      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', `Welcome, ${user.displayName || 'User'}!`);
    } catch (error: any) {
      Alert.alert('Error', `Google Sign-In failed: ${error.message}`);
    }
  };

  // Unified Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      await handleWebGoogleSignIn();
    } else {
      await handleNativeGoogleSignIn();
    }
  };

  // Facebook Sign-In for Web
  const handleWebFacebookSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', `Welcome, ${user.displayName || 'User'}!`);
    } catch (error: any) {
      Alert.alert('Error', `Facebook Sign-In failed: ${error.message}`);
    }
  };

  // Facebook Sign-In for Native
  const handleNativeFacebookSignIn = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) throw new Error('User cancelled the login process');

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) throw new Error('Something went wrong obtaining access token');

      const auth = getAuth();
      const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
      const userCredential = await signInWithCredential(auth, facebookCredential);

      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', `Welcome, ${user.displayName || 'User'}!`);
    } catch (error: any) {
      Alert.alert('Error', `Facebook Sign-In failed: ${error.message}`);
    }
  };

  // Unified Facebook Sign-In Handler
  const handleFacebookSignIn = async () => {
    if (Platform.OS === 'web') {
      await handleWebFacebookSignIn();
    } else {
      await handleNativeFacebookSignIn();
    }
  };

  // Handle Email/Password Sign-Up
  const handleSignUp = async () => {
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the terms first');
      return;
    }
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Error', `Sign-Up failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={() => setAgreed(!agreed)}>
        <Text style={styles.buttonText}>{agreed ? 'Agreed' : 'Agree to Terms'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#DB4437' }]} onPress={handleGoogleSignIn}>
        <Text style={styles.buttonText}>Sign In with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#1877F2' }]} onPress={handleFacebookSignIn}>
        <Text style={styles.buttonText}>Sign In with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
});
