import React from 'react';
import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="LoginPage" options={{ title: 'Login' }} />
      <Stack.Screen name="SignPage" options={{ title: 'Sign Up' }} />
    </Stack>
  );
};

export default RootLayout;
