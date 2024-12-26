import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, FacebookAuthProvider } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface GoogleSigninType {
  configure: (config: { webClientId: string }) => void;
  hasPlayServices: () => Promise<boolean>;
  signIn: () => Promise<any>;
  getTokens: () => Promise<{ idToken: string }>;
}

interface LoginManagerType {
  logInWithPermissions: (permissions: string[]) => Promise<{ isCancelled: boolean }>;
}

interface AccessTokenType {
  getCurrentAccessToken: () => Promise<{ accessToken: string } | null>;
}

let GoogleSignin: GoogleSigninType, 
    LoginManager: LoginManagerType, 
    AccessToken: AccessTokenType;

if (Platform.OS !== 'web') {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  const FBSDK = require('react-native-fbsdk-next');
  LoginManager = FBSDK.LoginManager;
  AccessToken = FBSDK.AccessToken;

  GoogleSignin.configure({
    webClientId: '441220624714',
  });
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password === password) {
          setWelcomeMessage(`Hello, ${userData.username || 'User'}!`);
          Alert.alert('Success', `Welcome back, ${userData.username || 'User'}!`);
          router.push('/HomePage');
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

  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();

      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await validateUserEmail(user.email, user.displayName);
        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
        router.push('/HomePage');
      } else {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const { idToken } = await GoogleSignin.getTokens();
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);
        const user = userCredential.user;
        await validateUserEmail(user.email, user.displayName);
        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
        router.push('/HomePage');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', `Google Sign-In failed: ${errorMessage}`);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const auth = getAuth();

      if (Platform.OS === 'web') {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await validateUserEmail(user.email, user.displayName);
        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
        router.push('/HomePage');
      } else {
        const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

        if (result.isCancelled) {
          throw new Error('User cancelled the login process');
        }

        const data = await AccessToken.getCurrentAccessToken();
        if (!data) throw new Error('Something went wrong obtaining access token');

        const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
        const userCredential = await signInWithCredential(auth, facebookCredential);
        const user = userCredential.user;
        await validateUserEmail(user.email, user.displayName);
        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
        router.push('/HomePage');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', `Facebook Sign-In failed: ${errorMessage}`);
    }
  };

  const validateUserEmail = async (email: string | null, displayName: string | null) => {
    if (!email) {
      Alert.alert('Error', 'No email provided');
      return;
    }

    try {
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        setWelcomeMessage(`Hello, ${userData.username || displayName || 'User'}!`);
        Alert.alert('Success', `Welcome back, ${userData.username || displayName || 'User'}!`);
      } else {
        Alert.alert('Error', 'User not found');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while validating the user');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8E8E93"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleEmailLogin}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>or continue with</Text>

            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
              >
                <Ionicons name="logo-google" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleFacebookSignIn}
              >
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.41,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    letterSpacing: -0.41,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
    letterSpacing: -0.41,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  orText: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
