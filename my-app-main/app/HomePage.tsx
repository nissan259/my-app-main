import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const HomePage = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/LoginPage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="person-outline" size={24} color="#007AFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Profile</Text>
            <Text style={styles.cardText}>View and update your account details</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="time-outline" size={24} color="#007AFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Activity History</Text>
            <Text style={styles.cardText}>View your recent activities</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Settings</Text>
            <Text style={styles.cardText}>Customize your app preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.35,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  cardText: {
    fontSize: 15,
    color: '#8E8E93',
    letterSpacing: -0.24,
  },
});

export default HomePage;
