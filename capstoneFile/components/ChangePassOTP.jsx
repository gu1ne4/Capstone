import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/StyleSheet';

export default function ChangePassOTP() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp: devOtp } = route.params || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

 const handleVerifyOTP = async () => {
  const otpString = otp.join('');
  
  if (otpString.length !== 6) {
    setError('Please enter the complete 6-digit OTP');
    return;
  }

  setLoading(true);
  try {
    const API_URL = 'http://localhost:3000';
    
    console.log('🔄 STEP 1: Verifying OTP');
    console.log('📧 Email:', email);
    console.log('🔑 Entered OTP:', otpString);
    
    // First, debug what's in database
    console.log('🔍 Checking OTP status in database...');
    const debugResponse = await fetch(`${API_URL}/debug-otp-status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
    });
    
    const debugData = await debugResponse.json();
    console.log('🔍 Debug OTP status:', debugData);
    
    // Now verify OTP
    console.log('🔄 STEP 2: Calling verify-otp endpoint');
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        otp: otpString
      }),
    });

    console.log('🔄 STEP 3: Got verify response');
    console.log('📊 Status:', response.status);
    const data = await response.json();
    console.log('📦 Verify response data:', data);

   if (response.ok) {
  console.log('✅ OTP verified successfully!');
  console.log('🔄 Navigating to ChangePass page...');
  
  // Navigate to reset password page
  navigation.navigate('ChangePass', { 
    email, 
    otp: otpString,
    fromOTP: true  // Optional flag
  });
}else {
      console.log('❌ OTP verification failed:', data.error);
      setError(data.error || 'Invalid OTP');
      
      // Show detailed error in alert
      Alert.alert(
        'OTP Verification Failed',
        `${data.error}\n\nCheck console logs for details.`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    setError('Network error. Please check your connection.');
    Alert.alert('Error', 'Network error. Please check your connection.');
  } finally {
    setLoading(false);
  }
};

  const handleResendOTP = async () => {
    if (!canResend && timer > 0) {
      Alert.alert('Please wait', `You can resend OTP in ${formatTime(timer)}`);
      return;
    }

    setLoading(true);
    try {
      const API_URL = 'http://localhost:3000';
      
      console.log('Resending OTP for email:', email);
      
      const response = await fetch(`${API_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Resend response:', data);

      if (response.ok) {
        Alert.alert('Success', 'New OTP sent to your email');
        setTimer(300); // Reset timer to 5 minutes
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Clear OTP inputs
        setError('');
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
                <Ionicons name="key-outline" size={30} color="#3d67ee" />
              </View>
              
              <Text style={{
                fontSize: 28,
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: 12,
                textAlign: 'center'
              }}>
                Verify OTP
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
                lineHeight: 24,
                maxWidth: 300
              }}>
                Enter the 6-digit OTP sent to your email address
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

            {/* OTP Inputs */}
            <View style={{ marginBottom: 30 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#555',
                marginBottom: 12,
                paddingLeft: 4,
                textAlign: 'center'
              }}>
                6-digit OTP Code
              </Text>
              
              <View style={{
                flexDirection: 'row', 
                justifyContent: 'center', 
                gap: 10,
                marginBottom: 15
              }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    ref={ref => inputRefs.current[index] = ref}
                    style={{
                      width: 50,
                      height: 50,
                      borderWidth: 2,
                      borderColor: error ? '#ff4444' : (otp[index] ? '#3d67ee' : '#ddd'),
                      borderRadius: 10,
                      textAlign: 'center',
                      fontSize: 20,
                      fontWeight: '700',
                      backgroundColor: '#fff',
                      color: '#1a237e'
                    }}
                    value={otp[index]}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    editable={!loading}
                    selectTextOnFocus
                  />
                ))}
              </View>
              
              {error ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                  <Ionicons name="alert-circle" size={16} color="#ff4444" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#ff4444', fontSize: 14 }}>{error}</Text>
                </View>
              ) : null}
            </View>

            {/* Timer Display */}
            <View style={{ 
              backgroundColor: timer < 60 ? '#fff3e0' : '#f5f5f5',
              padding: 12,
              borderRadius: 10,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: timer < 60 ? '#ffb74d' : '#e0e0e0'
            }}>
              <Text style={{ 
                textAlign: 'center', 
                color: timer < 60 ? '#e65100' : '#666',
                fontWeight: '600',
                fontSize: 14
              }}>
                {timer > 0 ? (
                  `⏰ OTP expires in: ${formatTime(timer)}`
                ) : (
                  '⌛ OTP has expired'
                )}
              </Text>
            </View>

            {/* Development OTP Display */}
            {devOtp && __DEV__ && (
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
                      Development OTP
                    </Text>
                    <Text style={{ 
                      fontSize: 16, 
                      color: '#333',
                      fontWeight: '700',
                      textAlign: 'center',
                      marginBottom: 4
                    }}>
                      {devOtp}
                    </Text>
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#666',
                      lineHeight: 18,
                      textAlign: 'center'
                    }}>
                      Use this OTP for testing
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Verify Button */}
            <TouchableOpacity
              style={{
                backgroundColor: otp.join('').length === 6 ? '#3d67ee' : '#cccccc',
                borderRadius: 12,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 16,
                opacity: loading ? 0.7 : 1
              }}
              onPress={handleVerifyOTP}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Verify OTP
                </Text>
              )}
            </TouchableOpacity>

            {/* Resend OTP Button */}
            <TouchableOpacity
              style={{
                backgroundColor: (canResend || timer <= 0) ? '#f0f7ff' : '#f5f5f5',
                borderRadius: 12,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 24,
                borderWidth: 1,
                borderColor: (canResend || timer <= 0) ? '#3d67ee' : '#ddd',
                opacity: loading ? 0.7 : 1
              }}
              onPress={handleResendOTP}
              disabled={loading || (!canResend && timer > 0)}
            >
              <Text style={{
                color: (canResend || timer <= 0) ? '#3d67ee' : '#999',
                fontSize: 16,
                fontWeight: '600'
              }}>
                {loading ? 'Sending...' : 'Resend OTP'}
              </Text>
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
                    OTP Instructions
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: '#555',
                    lineHeight: 20
                  }}>
                    • Check your email inbox (and spam folder) for the OTP
                    {'\n'}• Enter the 6-digit code exactly as shown
                    {'\n'}• OTP will expire in 5 minutes
                    {'\n'}• Can't find the email? Click "Resend OTP" above
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