import { View, Text, TouchableOpacity, Image, TextInput, Platform, ImageBackground, ActivityIndicator, Modal, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; 

// Import your Login Styles
import styles from '../styles/StyleSheet';

export default function LoginPage() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NEW: Custom Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'error', // 'success' or 'error'
    onDismiss: null // Action to run when closing the modal
  });

  // Validation states
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });

  // Validation rules
  const validationRules = {
    username: { minLength: 3, maxLength: 20, required: true },
    password: { minLength: 6, maxLength: 30, required: true }
  };

  // Helper function to trigger the Custom Popup
  const showPopup = (title, message, type = 'error', onDismiss = null) => {
    setModalConfig({ title, message, type, onDismiss });
    setModalVisible(true);
  };

  // Handle closing the popup
  const handleClosePopup = () => {
    setModalVisible(false);
    if (modalConfig.onDismiss) {
      modalConfig.onDismiss();
    }
  };

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

  const getFieldStatus = (fieldName, value) => {
    if (!touched[fieldName]) return 'neutral';
    const error = validateField(fieldName, value);
    if (error) return 'invalid';
    return 'valid';
  };

  const usernameStatus = getFieldStatus('username', username);
  const passwordStatus = getFieldStatus('password', password);

  const isFormValid = () => {
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    return !usernameError && !passwordError;
  };

  const handleUsernameChange = (text) => {
    setUsername(text);
    if (!touched.username) setTouched(prev => ({...prev, username: true}));
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!touched.password) setTouched(prev => ({...prev, password: true}));
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({...prev, [fieldName]: true}));
    const value = fieldName === 'username' ? username : password;
    const error = validateField(fieldName, value);
    setErrors(prev => ({...prev, [fieldName]: error}));
  };

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    if (usernameError || passwordError) {
      setErrors({ username: usernameError, password: passwordError });
      const firstError = usernameError || passwordError;
      
      // REPLACED: Alert with Custom Popup
      showPopup('Validation Error', firstError, 'error');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = Platform.OS === 'web' 
        ? 'http://localhost:3000/login' 
        : 'http://10.0.2.2:3000/login';

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('userSession', JSON.stringify(data.user));
        
        // REPLACED: Alert with Custom Popup (Success)
        showPopup('Success', `Welcome back, ${data.user.username}!`, 'success', () => {
            // Navigate only after user closes the popup
            navigation.replace("Accounts"); 
        });

      } else {
        // --- ERROR HANDLING SEQUENCE ---
        const serverError = data.error ? data.error.toLowerCase() : '';

        // Condition 1: Check if account does not exist
        // (Assumes backend sends "User not found" or "No user found")
        if (serverError.includes('found') || serverError.includes('exist')) {
           showPopup('Login Failed', "Account not found.", 'error');
        } 
        // Condition 2: Password mismatch or generic error
        else {
           showPopup('Login Failed', 'Invalid Username or Password', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      const msg = 'Network Error: Make sure server.js is running!';
      showPopup('Connection Error', msg, 'error');
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
                style={{width: '100%', height: '100%'}}
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
            <Text style={styles.agsikapTitle}>Agsikap</Text>
            <Text style={styles.loginHeader}>Log in to your Account</Text>
            <Text style={styles.loginSubtext}>
                Please enter your credentials to access the dashboard.
            </Text>

            {/* Username Field */}
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
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

            {/* Login Button */}
            <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  {opacity: loading ? 0.7 : 1},
                  !isFormValid() && styles.loginButtonDisabled
                ]} 
                onPress={handleLogin}
                disabled={loading || !isFormValid()}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
            </TouchableOpacity>

        </View>
      </View>

      {/* --- CUSTOM POPUP MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClosePopup}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            
            {/* Icon */}
            <Ionicons 
                name={modalConfig.type === 'success' ? "checkmark-circle" : "alert-circle"} 
                size={50} 
                color={modalConfig.type === 'success' ? "#4CAF50" : "#F44336"} 
                style={{marginBottom: 10}}
            />

            {/* Title */}
            <Text style={modalStyles.modalTitle}>{modalConfig.title}</Text>
            
            {/* Message */}
            <Text style={modalStyles.modalText}>{modalConfig.message}</Text>

            {/* Button */}
            <TouchableOpacity
              style={[
                  modalStyles.button, 
                  modalConfig.type === 'success' ? modalStyles.buttonSuccess : modalStyles.buttonError
              ]}
              onPress={handleClosePopup}
            >
              <Text style={modalStyles.textStyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  )
}

// Internal Styles for the Modal to ensure it looks good immediately
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 300,
    maxWidth: '85%'
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    paddingHorizontal: 30,
    marginTop: 15
  },
  buttonSuccess: {
    backgroundColor: "#4CAF50",
  },
  buttonError: {
    backgroundColor: "#F44336",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: '#333'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  }
});