import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, FacebookAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';

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

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Validation states
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [agreedError, setAgreedError] = useState('');

  // Real-time validation functions
  const validateUsername = (value: string) => {
    if (value.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    if (!/[!@#$%^&*]/.test(value)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }
    setPasswordError('');
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const validateAgreement = (value: boolean) => {
    if (!value) {
      setAgreedError('You must agree to the terms and conditions');
      return false;
    }
    setAgreedError('');
    return true;
  };

  const handleSignUp = async () => {
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isAgreedValid = validateAgreement(agreed);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isAgreedValid) {
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        username,
        email,
        createdAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();

      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString()
        });

        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
      } else {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const { idToken } = await GoogleSignin.getTokens();
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);
        const user = userCredential.user;

        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString()
        });

        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Google sign-in failed');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const auth = getAuth();

      if (Platform.OS === 'web') {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString()
        });

        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
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

        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString()
        });

        Alert.alert('Success', `Welcome ${user.displayName || 'User'}!`);
      }
    } catch (error) {
      console.error('Facebook Sign-In Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Facebook sign-in failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, usernameError ? styles.inputError : null]}
          placeholder="Username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            validateUsername(text);
          }}
        />
        {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            validateEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text);
          }}
          secureTextEntry
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TextInput
          style={[styles.input, confirmPasswordError ? styles.inputError : null]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            validateConfirmPassword(text);
          }}
          secureTextEntry
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox, 
              agreed && styles.checked,
              agreedError && styles.checkboxError
            ]}
            onPress={() => {
              const newValue = !agreed;
              setAgreed(newValue);
              validateAgreement(newValue);
            }}
          />
          <Text style={styles.checkboxLabel}>I agree to the terms and conditions</Text>
        </View>
        {agreedError ? <Text style={styles.errorText}>{agreedError}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#DB4437' }]} 
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.buttonText}>Sign In with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#1877F2' }]} 
            onPress={handleFacebookSignIn}
          >
            <Text style={styles.buttonText}>Sign In with Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    borderRadius: 3,
  },
  checkboxError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  checked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxLabel: {
    flex: 1,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  socialButtonsContainer: {
    width: '100%',
  },
  socialButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
});
