import { View, Text, TouchableOpacity, Image, TextInput, Platform, Alert, ImageBackground, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react' // ← Added useEffect
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; 

// Import your Login Styles
import styles from '../styles/StyleSheet';

export default function LoginPage() {
  const eme = null;
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NEW: Validation states
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });

  // NEW: Validation rules
  const validationRules = {
    username: { minLength: 3, maxLength: 20, required: true },
    password: { minLength: 6, maxLength: 30, required: true }
  };

  // NEW: Validate field function
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    
    if (rules.required && !value.trim()) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    } else if (value.length > 0 && value.length < rules.minLength) {
      return `At least ${rules.minLength} characters`;
    } else if (value.length > rules.maxLength) {
      return `Max ${rules.maxLength} characters`;
    }
    return '';
  };

  // NEW: Real-time validation effects
  useEffect(() => {
    if (touched.username) {
      const error = validateField('username', username);
      setErrors(prev => ({...prev, username: error}));
    }
  }, [username, touched.username]);

  useEffect(() => {
    if (touched.password) {
      const error = validateField('password', password);
      setErrors(prev => ({...prev, password: error}));
    }
  }, [password, touched.password]);

  // NEW: Field status helper
  const getFieldStatus = (fieldName, value) => {
    if (!touched[fieldName]) return 'neutral';
    const error = validateField(fieldName, value);
    if (error) return 'invalid';
    return 'valid';
  };

  const usernameStatus = getFieldStatus('username', username);
  const passwordStatus = getFieldStatus('password', password);

  // NEW: Form validation check
  const isFormValid = () => {
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    return !usernameError && !passwordError;
  };

  // UPDATED: Handle text changes with validation
  const handleUsernameChange = (text) => {
    setUsername(text);
    if (!touched.username) setTouched(prev => ({...prev, username: true}));
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!touched.password) setTouched(prev => ({...prev, password: true}));
  };

  // NEW: Handle blur
  const handleBlur = (fieldName) => {
    setTouched(prev => ({...prev, [fieldName]: true}));
    const value = fieldName === 'username' ? username : password;
    const error = validateField(fieldName, value);
    setErrors(prev => ({...prev, [fieldName]: error}));
  };

  // UPDATED: handleLogin function with validation
  const handleLogin = async () => {
    // NEW: Mark all fields as touched to show errors
    setTouched({ username: true, password: true });
    
    // NEW: Check validation before proceeding
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    if (usernameError || passwordError) {
      setErrors({ username: usernameError, password: passwordError });
      
      // Show first error in alert
      const firstError = usernameError || passwordError;
      if (Platform.OS === 'web') window.alert(`Validation Error: ${firstError}`);
      else Alert.alert('Validation Error', firstError);
      return;
    }

    // Original login logic continues...
    setLoading(true);
    try {
      // 1. Determine Backend URL
      const apiUrl = Platform.OS === 'web' 
        ? 'http://localhost:3000/login' 
        : 'http://10.0.2.2:3000/login';

      // 2. Send POST request
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // 3. Save Session & Navigate
        await AsyncStorage.setItem('userSession', JSON.stringify(data.user));
        
        if (Platform.OS === 'web') window.alert('Welcome back ' + data.user.username);
        else Alert.alert('Success', 'Welcome back!');

        // "Accounts" is the name defined in your App.js for HomePage
        navigation.replace("Accounts"); 
      } else {
        const errorMsg = data.error || 'Login failed';
        if(Platform.OS === 'web') window.alert(errorMsg);
        else Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error(error);
      const msg = 'Network Error: Make sure server.js is running!';
      if(Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        
        {/* LEFT SIDE */}
        <View style={styles.gifContainer}>
            <ImageBackground 
                source={require('../assets/AgsikapBG-Gif.gif')} 
                style={{width: '100%', height: '100%', borderRadius: 30}}
                resizeMode="cover"
            >
                <View style={styles.gifOverlay}>
                    <Image 
                        source={require('../assets/AgsikapLogo-Temp.png')} 
                        style={{width: 80, height: 80, marginBottom: 20}} 
                        resizeMode="contain"
                    />
                    <View style={{marginTop: 50}}>
                      <Text style={styles.whiteFont}>Hello,</Text>
                      <Text style={[styles.whiteFont, {fontStyle: "italic", fontWeight: '600'}]}>welcome!</Text>
                      <Text style={{color: '#e0e0e0', marginTop: 30, fontSize: 14, lineHeight: 22, maxWidth: 400}}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </Text>
                    </View>
                </View>
            </ImageBackground>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.loginSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{ 
              alignSelf: 'flex-start',
              marginBottom: 50,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#3d67ee" />
            <Text style={{ color: '#3d67ee', fontSize: 14, fontWeight: '500' }}>
              Return to Home
            </Text>
          </TouchableOpacity>

            <Text style={styles.agsikapTitle}>Furtopia</Text>
            <Text style={styles.loginHeader}>Log in to your Account</Text>
            <Text style={styles.loginSubtext}>
                Sign in to check appointments, receive updates, and take care of your pets with ease!
            </Text>

                        {/* UPDATED: Username Field with Validation */}
            <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={[
                      styles.inputField,
                      usernameStatus === 'invalid' && styles.inputError,
                      usernameStatus === 'valid' && styles.inputValid
                    ]}
                    placeholder="Username"
                    placeholderTextColor="#aaa"
                    value={username}
                    onChangeText={handleUsernameChange}
                    onBlur={() => handleBlur('username')}
                    maxLength={validationRules.username.maxLength}
                />
                {/* UPDATED: Validation Feedback - FIXED POSITION */}
                <View style={styles.fieldFeedbackContainer}>
                    <View style={styles.errorContainer}>
                        {usernameStatus === 'invalid' && touched.username && (
                            <Text style={styles.errorText}>{errors.username}</Text>
                        )}
                    </View>
                    <Text style={[
                        styles.charCount,
                        usernameStatus === 'invalid' && styles.charCountError,
                        usernameStatus === 'valid' && styles.charCountValid
                    ]}>
                        {username.length}/{validationRules.username.maxLength}
                    </Text>
                </View>
            </View>

                        {/* UPDATED: Password Field with Validation */}
            <View style={[styles.inputGroup, {marginBottom: 40}]}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={[styles.inputIcon]} />
                <TextInput
                    style={[
                      styles.inputField,
                      passwordStatus === 'invalid' && styles.inputError,
                      passwordStatus === 'valid' && styles.inputValid
                    ]}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    maxLength={validationRules.password.maxLength}
                />
                {/* UPDATED: Validation Feedback - FIXED POSITION */}
                <View style={styles.fieldFeedbackContainer}>
                    <View style={styles.errorContainer}>
                        {passwordStatus === 'invalid' && touched.password && (
                            <Text style={styles.errorText}>{errors.password}</Text>
                        )}
                    </View>
                    <Text style={[
                        styles.charCount,
                        passwordStatus === 'invalid' && styles.charCountError,
                        passwordStatus === 'valid' && styles.charCountValid
                    ]}>
                        {password.length}/{validationRules.password.maxLength}
                    </Text>
                </View>
            </View>


            
            {/* UPDATED: Login Button with Validation */}
            <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  {opacity: loading ? 0.7 : 1},
                  !isFormValid() && styles.loginButtonDisabled
                ]} 
                onPress={handleLogin}
                disabled={loading || !isFormValid()} // Disable if loading OR form invalid
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Registration')}
              style={{
                marginTop: 25,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: '#555' }}>
                Don’t have an account?
                <Text style={{ color: '#3d67ee', fontWeight: '600' }}> Sign up</Text>
              </Text>
            </TouchableOpacity>

        </View>
      </View>
    </View>
  )
}