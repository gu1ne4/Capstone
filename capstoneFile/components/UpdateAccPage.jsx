import { View, Text, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator, ImageBackground, Dimensions, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const UpdateAccPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {};

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = Platform.OS === 'web' 
    ? 'http://localhost:3000' 
    : 'http://10.0.2.2:3000';

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!newUsername.trim()) {
      newErrors.username = 'Username is required';
    } else if (newUsername.length < 3 || newUsername.length > 20) {
      newErrors.username = 'Username must be 3-20 characters';
    } else if (!/^[a-zA-Z0-9._]+$/.test(newUsername)) {
      newErrors.username = 'Only letters, numbers, dots, and underscores allowed';
    }

    // Password validation
    if (!newPassword) {
      newErrors.password = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (newPassword.length > 30) {
      newErrors.password = 'Password must be less than 30 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateCredentials = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Get user ID from AsyncStorage if not in params
      let currentUserId = userId;
      if (!currentUserId) {
        const session = await AsyncStorage.getItem('userSession');
        if (session) {
          const userData = JSON.parse(session);
          currentUserId = userData.id;
        }
      }

      if (!currentUserId) {
        throw new Error('User session not found');
      }

      const res = await fetch(`${API_URL}/update-credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          newUsername: newUsername.trim(),
          newPassword: newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Clear session and redirect to logins
        await AsyncStorage.removeItem('userSession');
        
        const successMsg = 'Credentials updated! Please login with your new credentials.';
        if (Platform.OS === 'web') {
          window.alert(successMsg);
          window.location.href = '/login';
        } else {
          Alert.alert('Success', successMsg, [
            { text: 'OK', onPress: () => navigation.replace('Login') }
          ]);
        }
      } else {
        const errorMsg = data.error || 'Update failed';
        if (Platform.OS === 'web') window.alert(errorMsg);
        else Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Update error:', error);
      const msg = 'Network Error: Make sure server is running!';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const { width, height } = Dimensions.get('window');

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#667eea']}
        style={{ flex: 1, minHeight: height }}
      >
        {/* Background Pattern */}
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          opacity: 0.1,
          backgroundColor: '#000'
        }} />

        {/* Main Container */}
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20
        }}>
          {/* Glass Effect Card */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: 40,
            width: '100%',
            maxWidth: 480,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.25,
            shadowRadius: 40,
            elevation: 10,
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="key-outline" size={30} color="#fff" />
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: 8
              }}>
                Update Credentials
              </Text>
              <Text style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                lineHeight: 24
              }}>
                This is your first login. Please set your permanent username and password.
              </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 32 }}>
              {/* Username Input */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="person-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={{ 
                    marginLeft: 8, 
                    color: '#fff', 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    New Username
                  </Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: 16,
                    color: '#fff',
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: errors.username ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  placeholder="Choose a username (3-20 chars)"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newUsername}
                  onChangeText={(text) => {
                    setNewUsername(text);
                    if (errors.username) setErrors({...errors, username: ''});
                  }}
                  autoCapitalize="none"
                />
                {errors.username && (
                  <Text style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>
                    {errors.username}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={{ 
                    marginLeft: 8, 
                    color: '#fff', 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    New Password
                  </Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: 16,
                    color: '#fff',
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: errors.password ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  placeholder="Choose a password (min 6 chars)"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.password) setErrors({...errors, password: ''});
                  }}
                  secureTextEntry
                />
                {errors.password && (
                  <Text style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={{ marginBottom: 32 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={{ 
                    marginLeft: 8, 
                    color: '#fff', 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    Confirm Password
                  </Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: 16,
                    color: '#fff',
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: errors.confirmPassword ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                  }}
                  secureTextEntry
                />
                {errors.confirmPassword && (
                  <Text style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Update Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 18,
                  alignItems: 'center',
                  opacity: loading ? 0.7 : 1
                }}
                onPress={handleUpdateCredentials}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#667eea" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#667eea" />
                    <Text style={{ 
                      color: '#667eea', 
                      fontSize: 18, 
                      fontWeight: 'bold',
                      marginLeft: 8
                    }}>
                      Update Credentials
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Security Info */}
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#4ade80'
            }}>
              <Text style={{ 
                color: '#fff', 
                fontSize: 14, 
                fontWeight: '600',
                marginBottom: 8
              }}>
                🔒 Security Tips
              </Text>
              <Text style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: 12,
                lineHeight: 18
              }}>
                • Choose a strong, unique password{"\n"}
                • Don't reuse passwords from other sites{"\n"}
                • You'll be logged out after updating
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

export default UpdateAccPage;