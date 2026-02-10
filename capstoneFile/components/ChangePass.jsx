import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePass() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp } = route.params || {};
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePasswords = () => {
    const newErrors = { newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (newPassword.length < 8 || newPassword.length > 30) {
      newErrors.newPassword = 'Password must be 8-30 characters';
      isValid = false;
    }

    if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

const handleResetPassword = async () => {
  if (!validatePasswords()) return;

  setLoading(true);
  try {
    const API_URL = 'http://localhost:3000';
    
    console.log('🔄 STEP 1: Attempting password reset');
    console.log('📧 Email:', email);
    console.log('🔑 OTP being used:', otp);
    console.log('🔐 New password length:', newPassword.length);
    
    // Now attempt reset
    console.log('🔄 STEP 2: Calling reset-password endpoint');
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        otp, 
        newPassword
      }),
    });

    console.log('🔄 STEP 3: Got reset response');
    console.log('📊 Status:', response.status);
    
    const data = await response.json();
    console.log('📦 Reset response data:', data);

 if (response.ok) {
  console.log('✅ Password reset successful!');
  
  // Navigate to Login with a flag indicating this is a password reset
  navigation.navigate('Login', { 
    fromPasswordReset: true,
    resetMessage: 'Password reset successfully! Please login with your new password.'
  });
} else {
      console.log('❌ Password reset failed:', data.error);
      
      // Show detailed error
      Alert.alert(
        'Reset Failed',
        `${data.error}\n\nPossible reasons:\n1. OTP expired\n2. OTP already used\n3. Wrong OTP\n4. Database issue\n\nCheck console for details.`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    Alert.alert(
      'Network Error',
      'Cannot connect to server.\n\nMake sure:\n1. Server is running\n2. URL is correct\n3. Network is working'
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
              Back
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
                <Ionicons name="lock-closed-outline" size={30} color="#3d67ee" />
              </View>
              
              <Text style={{
                fontSize: 28,
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: 12,
                textAlign: 'center'
              }}>
                Create New Password
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
                lineHeight: 24,
                maxWidth: 300
              }}>
                Enter your new password below
              </Text>
            </View>

            {/* Email Display */}
            <View style={{ 
              backgroundColor: '#f0f7ff', 
              padding: 16, 
              borderRadius: 12, 
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#d0e0ff'
            }}>
              <Text style={{ 
                textAlign: 'center', 
                color: '#3d67ee', 
                fontWeight: '600',
                fontSize: 15
              }}>
                {email}
              </Text>
            </View>

            {/* New Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#555',
                marginBottom: 8,
                paddingLeft: 4
              }}>
                New Password
              </Text>
              
              <View style={{
                borderWidth: 1,
                borderColor: errors.newPassword ? '#ff4444' : '#ddd',
                borderRadius: 12,
                backgroundColor: '#f8f9fa',
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: '#333'
                  }}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) setErrors({...errors, newPassword: ''});
                  }}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons 
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
              
              {errors.newPassword ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 4 }}>
                  <Ionicons name="alert-circle" size={16} color="#ff4444" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#ff4444', fontSize: 14 }}>{errors.newPassword}</Text>
                </View>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 30 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#555',
                marginBottom: 8,
                paddingLeft: 4
              }}>
                Confirm New Password
              </Text>
              
              <View style={{
                borderWidth: 1,
                borderColor: errors.confirmPassword ? '#ff4444' : '#ddd',
                borderRadius: 12,
                backgroundColor: '#f8f9fa',
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: '#333'
                  }}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
              
              {errors.confirmPassword ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 4 }}>
                  <Ionicons name="alert-circle" size={16} color="#ff4444" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#ff4444', fontSize: 14 }}>{errors.confirmPassword}</Text>
                </View>
              ) : null}
            </View>

            {/* Password Requirements */}
            <View style={{
              backgroundColor: '#fff8e1',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#ffd54f',
              marginBottom: 20
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#ff9800" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#ff9800',
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    Password Requirements
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: '#666',
                    lineHeight: 20
                  }}>
                    • Must be 8-30 characters long
                    {'\n'}• Both passwords must match exactly
                    {'\n'}• Avoid using common passwords
                  </Text>
                </View>
              </View>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3d67ee',
                borderRadius: 12,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 16,
                opacity: (loading || !newPassword || !confirmPassword) ? 0.7 : 1
              }}
              onPress={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>

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
                    Important Information
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: '#555',
                    lineHeight: 20
                  }}>
                    • Your password will be updated immediately
                    {'\n'}• You'll be redirected to login page
                    {'\n'}• Use your new password for all future logins
                    {'\n'}• For security, don't share your password with anyone
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