import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import styles from '../styles/StyleSheet'
import { useNavigation } from '@react-navigation/native'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const navigation = useNavigation();
  
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  
  
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  
  const validationRules = {
    username: {
      minLength: 3,
      maxLength: 20,
      required: true
    },
    password: {
      minLength: 6,
      maxLength: 30,
      required: true
    }
  };

  
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    
    if (rules.required && !value.trim()) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    } else if (value.length > 0 && value.length < rules.minLength) {
      return `Minimum of ${rules.minLength} characters`;
    } else if (value.length > rules.maxLength) {
      return `Max ${rules.maxLength} characters`;
    }
    
    return '';
  };

  // Real-time validation effect
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

  
  const handleUsernameChange = (text) => {
    setUsername(text);
    if (!touched.username) {
      setTouched(prev => ({...prev, username: true}));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!touched.password) {
      setTouched(prev => ({...prev, password: true}));
    }
  };

  // Handle blur
  const handleBlur = (fieldName) => {
    setTouched(prev => ({...prev, [fieldName]: true}));
    const value = fieldName === 'username' ? username : password;
    const error = validateField(fieldName, value);
    setErrors(prev => ({...prev, [fieldName]: error}));
  };

  
  const handleLogin = () => {
    setTouched({
      username: true,
      password: true
    });
    
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    setErrors({
      username: usernameError,
      password: passwordError
    });
    
    if (!usernameError && !passwordError) {
      navigation.replace("Accounts");
    }
  };

  
  const isFormValid = () => {
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    return !usernameError && !passwordError;
  };

  // Helper to get field status
  const getFieldStatus = (fieldName, value) => {
    if (!touched[fieldName]) return 'neutral';
    const error = validateField(fieldName, value);
    if (error) return 'invalid';
    return 'valid';
  };

  const usernameStatus = getFieldStatus('username', username);
  const passwordStatus = getFieldStatus('password', password);

  return (
    <View style={styles.loginContainer}>
      <View style={styles.gifContainer}>
        <Image source={require('../assets/AgsikapBG-Gif.gif')} style={{width: '100%', height: '100%'}} />
        
        <View style={styles.gifOverlay}>
          <Image source={require('../assets/AgsikapLogo-Temp.png')} style={{width: '18%', height: '18%', right: 15, marginTop: 40}} resizeMode="contain"/>
          
          <View style={{marginTop: 50}}>
            <Text style={styles.whiteFont}>Hello,</Text>
            <Text style={[styles.whiteFont, {fontStyle: "italic", fontWeight: '600'}]}>welcome!</Text>
            <Text style={[styles.whiteFont, {fontSize: 18, lineHeight: 25, marginTop: 60, paddingRight: 30}]}>Lorem ipsum dolor sit amesdasast, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </Text>
          </View>
        </View>
      </View>

      <View style={styles.loginSection}>
        <Text style={styles.agsikapTitle}>Agsikap</Text>
        <Text style={styles.loginHeader}>Log in to your Account</Text>
        <Text style={styles.loginSubtext}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        </Text>

        {/* Username Field */}
        <View style={styles.inputGroup}>
          <TextInput 
            style={[
              styles.inputField, 
              {paddingHorizontal: 15}, // More horizontal padding
              usernameStatus === 'invalid' && styles.inputError,
              usernameStatus === 'valid' && styles.inputValid
            ]} 
            placeholder="Username" 
            placeholderTextColor="#999" 
            value={username}
            onChangeText={handleUsernameChange}
            onBlur={() => handleBlur('username')}
            maxLength={validationRules.username.maxLength}
          />
          
          <View style={styles.fieldFeedbackContainer}>
              {usernameStatus === 'invalid' && touched.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
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
        <View style={[styles.inputGroup, {marginBottom: 15}]}>
          <TextInput 
            style={[
              styles.inputField, 
              {paddingHorizontal: 15}, // More horizontal padding
              passwordStatus === 'invalid' && styles.inputError,
              passwordStatus === 'valid' && styles.inputValid
            ]} 
            placeholder="Password" 
            placeholderTextColor="#999" 
            secureTextEntry 
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            maxLength={validationRules.password.maxLength}
          />
          <View style={styles.fieldFeedbackContainer}>
              {passwordStatus === 'invalid' && touched.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Text style={[
                styles.charCount,
                passwordStatus === 'invalid' && styles.charCountError,
                passwordStatus === 'valid' && styles.charCountValid
              ]}>
                {password.length}/{validationRules.password.maxLength}
              </Text>
          </View>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity>
            <Text style={[styles.forgotPassword, {fontStyle: "italic"}]}>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, !isFormValid() && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={!isFormValid()}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}