import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/StyleSheet';

export default function ForgetPassPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleRequestOTP = async () => {
  if (!validateEmail()) return;

  setLoading(true);
  
  console.log('🔄 STEP 1: Starting password reset process');
  console.log('📧 Email entered:', email);
  
  try {
    const API_URL = 'http://localhost:3000';
    
    console.log('🔄 STEP 2: Sending request to server');
    console.log('🌐 URL:', `${API_URL}/request-password-reset`);
    
    const response = await fetch(`${API_URL}/request-password-reset`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
    });

    console.log('🔄 STEP 3: Got response from server');
    console.log('📊 Status:', response.status);
    console.log('📊 OK?', response.ok);
    
    const data = await response.json();
    console.log('📦 Response data:', data);

    if (response.ok) {
      console.log('✅ STEP 4: Request successful!');
      console.log('👤 User type:', data.userType);
      console.log('🔑 OTP:', data.otp);
      
      // REMOVE the blocking Alert and navigate directly
      // Navigate to OTP verification page
      navigation.navigate('ChangePassOTP', { 
        email, 
        userType: data.userType,
        otp: data.otp
      });
    } else {
      console.log('❌ STEP 4: Request failed');
      console.log('❌ Error:', data.error);
      Alert.alert('Request Failed', data.error || 'Failed to send OTP. Please try again.');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    Alert.alert(
      'Network Error', 
      'Cannot connect to server. Please check:\n\n1. Server is running (node server.js)\n2. Correct URL (http://localhost:3000)\n3. Your internet connection'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ 
          flex: 1, 
          paddingHorizontal: 24,
          paddingTop: 20,
          backgroundColor: '#ffffff'
        }}>
          
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ 
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 40,
              paddingVertical: 8,
              paddingRight: 12
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#3d67ee" />
            <Text style={{ color: '#3d67ee', fontSize: 16, fontWeight: '500' }}>
              Back to Login
            </Text>
          </TouchableOpacity>

          {/* Main Content */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {/* Header */}
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 30, 
                backgroundColor: '#eef2ff',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Ionicons name="key-outline" size={30} color="#3d67ee" />
              </View>
              
              <Text style={{
                fontSize: 28,
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: 12,
                textAlign: 'center'
              }}>
                Reset Password
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
                lineHeight: 24,
                maxWidth: 300
              }}>
                Enter your email address and we'll send you an OTP to reset your password.
              </Text>
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: 30 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#555',
                marginBottom: 8,
                paddingLeft: 4
              }}>
                Email Address
              </Text>
              
              <View style={{
                borderWidth: 1,
                borderColor: emailError ? '#ff4444' : '#ddd',
                borderRadius: 12,
                backgroundColor: '#f8f9fa',
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: '#333'
                  }}
                  placeholder="Enter your registered email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              {emailError ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 4 }}>
                  <Ionicons name="alert-circle" size={16} color="#ff4444" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#ff4444', fontSize: 14 }}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3d67ee',
                borderRadius: 12,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 24,
                opacity: loading ? 0.7 : 1
              }}
              onPress={handleRequestOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Send OTP
                </Text>
              )}
            </TouchableOpacity>

            {/* Development Testing Info */}
            {__DEV__ && (
              <View style={{
                backgroundColor: '#fff8e1',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#ffd54f',
                marginBottom: 20
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons name="bug-outline" size={20} color="#ff9800" style={{ marginRight: 10, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#ff9800',
                      fontWeight: '600',
                      marginBottom: 4
                    }}>
                      Development Testing
                    </Text>
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#666',
                      lineHeight: 18
                    }}>
                      • Check server console for logs\n• Use real email from database\n• OTP will show in alert\n• Check browser console for network logs
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Info Section */}
            <View style={{
              backgroundColor: '#f0f7ff',
              borderRadius: 12,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#3d67ee'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="information-circle" size={20} color="#3d67ee" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#3d67ee',
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    What to expect
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: '#555',
                    lineHeight: 20
                  }}>
                    • Check your email inbox (and spam folder) for the OTP
                    {'\n'}• OTP will expire in 15 minutes
                    {'\n'}• Can't find the email? Click resend in the next step
                    {'\n'}• System will automatically detect your account type
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              Having trouble? Contact support@furtopia.com
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}