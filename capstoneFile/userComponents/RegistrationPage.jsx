import { View, Text, TextInput, TouchableOpacity, ImageBackground, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import styles from '../styles/StyleSheet'   
import { useNavigation } from '@react-navigation/native'

export default function RegistrationPage() {
  const navigation = useNavigation();
  
  // State variables
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Validation states
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    email: ''
  });
  
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    password: false,
    confirmPassword: false,
    contactNumber: false,
    email: false
  });

  // Validation rules
  const validationRules = {
    fullName: { 
      regex: /^[a-zA-Z\s.'-]+$/, 
      message: 'Only letters, spaces, hyphens, apostrophes, and periods allowed',
      required: true 
    },
    username: { 
      minLength: 4, 
      maxLength: 20, 
      regex: /^[a-zA-Z0-9._]+$/,
      message: '4-20 characters, letters, numbers, dots, and underscores only',
      required: true 
    },
    password: { 
      minLength: 8, 
      maxLength: 30, 
      required: true 
    },
    confirmPassword: { 
      required: true 
    },
    contactNumber: { 
      regex: /^\d+$/, 
      minLength: 11, // Ensure full 11 digits (09XX...)
      maxLength: 11,
      message: 'Must be a valid 11-digit number',
      required: true 
    },
    email: { 
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: 'Invalid email format',
      required: true 
    }
  };

  // Helper function for validation
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    
    if (!rules) return '';
    
    if (rules.required && !value.trim()) {
      return `${fieldName === 'confirmPassword' ? 'Confirm Password' : fieldName} is required`;
    }
    
    switch(fieldName) {
      case 'fullName':
        if (!rules.regex.test(value)) {
          return rules.message;
        }
        break;
        
      case 'username':
        if (value.length < rules.minLength) return `At least ${rules.minLength} characters`;
        if (value.length > rules.maxLength) return `Max ${rules.maxLength} characters`;
        if (!rules.regex.test(value)) return rules.message;
        break;
        
      case 'password':
        if (value.length < rules.minLength) return `At least ${rules.minLength} characters`;
        if (value.length > rules.maxLength) return `Max ${rules.maxLength} characters`;
        break;
        
      case 'confirmPassword':
        if (value !== password) return 'Passwords do not match';
        break;
        
      case 'contactNumber':
        // Clean dashes to validate strictly the digits
        const cleanContact = value.replace(/\D/g, '');
        if (cleanContact.length !== 11) {
          return 'Must be 11 digits (e.g. 0912-345-6789)';
        }
        break;
        
      case 'email':
        if (!rules.regex.test(value)) return rules.message;
        break;
    }
    
    return '';
  };

  // Handle field changes with validation AND FORMATTING
  const handleFieldChange = (fieldName, value) => {
    let finalValue = value;

    switch(fieldName) {
      case 'fullName':
        finalValue = value.replace(/[^a-zA-Z\s.'-]/g, '');
        setFullName(finalValue);
        break;
        
      case 'username':
        finalValue = value.replace(/[^a-zA-Z0-9._]/g, '');
        setUsername(finalValue);
        break;
        
      case 'password':
        setPassword(value);
        break;
        
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
        
      // ============================================================
      //  CONTACT NUMBER FORMATTING (XXXX-XXX-XXXX)
      // ============================================================
      case 'contactNumber':
        // 1. Remove non-numeric characters
        let cleaned = value.replace(/\D/g, '');

        // 2. Limit to 11 digits
        if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);

        // 3. Apply Format: XXXX-XXX-XXXX
        let formatted = cleaned;
        if (cleaned.length > 4) {
          formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        }
        if (cleaned.length > 7) {
          formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        
        finalValue = formatted;
        setContactNumber(finalValue);
        break;
        
      case 'email':
        finalValue = value.toLowerCase();
        setEmail(finalValue);
        break;
    }
    
    if (touched[fieldName]) {
      const error = validateField(fieldName, finalValue);
      setErrors(prev => ({...prev, [fieldName]: error}));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({...prev, [fieldName]: true}));
    const value = fieldName === 'fullName' ? fullName :
                  fieldName === 'username' ? username :
                  fieldName === 'password' ? password :
                  fieldName === 'confirmPassword' ? confirmPassword :
                  fieldName === 'contactNumber' ? contactNumber : email;
    const error = validateField(fieldName, value);
    setErrors(prev => ({...prev, [fieldName]: error}));
  };

  const getFieldStatus = (fieldName) => {
    if (!touched[fieldName]) return 'neutral';
    const error = errors[fieldName];
    if (error) return 'invalid';
    return 'valid';
  };

  const isFormValid = () => {
    const requiredFields = ['fullName', 'username', 'password', 'confirmPassword', 'contactNumber', 'email'];
    return requiredFields.every(field => !errors[field]);
  };

  const handleRegister = async () => {
    // Mark all fields as touched
    const newTouched = {
      fullName: true,
      username: true,
      password: true,
      confirmPassword: true,
      contactNumber: true,
      email: true
    };
    setTouched(newTouched);
    
    // Validate all fields
    const newErrors = {
      fullName: validateField('fullName', fullName),
      username: validateField('username', username),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
      contactNumber: validateField('contactNumber', contactNumber),
      email: validateField('email', email)
    };
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      Alert.alert("Validation Error", "Please fix all errors before submitting.");
      return;
    }
    
    setLoading(true);
    try {
      const API_URL = 'http://localhost:3000';
      const today = new Date();
      const dateCreated = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

      // Backend expects lowercase keys mostly
      const requestData = { 
        fullname: fullName, 
        username: username,
        password: password,
        contactnumber: contactNumber, // Sending formatted (e.g. 0912-345-6789)
        email: email,
        datecreated: dateCreated,  
        userimage: null, 
        status: 'Active' 
      };
      
      console.log('Sending to backend:', requestData);

      const res = await fetch(`${API_URL}/patient-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert(
          "Success", 
          "Account created successfully! You can now log in.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login")
            }
          ]
        );
        
        // Clear form
        setFullName('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setContactNumber('');
        setEmail('');
        setErrors({});
        setTouched({});
        
      } else {
        // ============================================================
        //  UNIQUE EMAIL / DUPLICATE HANDLING
        // ============================================================
        // If backend returns a duplicate email error, show specific message
        let errorMessage = data.error || "Registration failed. Please try again.";
        
        if (errorMessage.toLowerCase().includes('email')) {
          errorMessage = "This email is already in use.";
        } else if (errorMessage.toLowerCase().includes('username')) {
          errorMessage = "This username is already taken.";
        }

        Alert.alert("Registration Failed", errorMessage);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert("Network Error", "Could not connect to server. Please try again.");
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
                style={{width: 80, height: 80, marginBottom: 5}} 
                resizeMode="contain"
              />
              <View style={{marginTop: 50}}>
                <Text style={styles.whiteFont}>Join Us,</Text>
                <Text style={[styles.whiteFont, {fontStyle: "italic", fontWeight: '600'}]}>create your account!</Text>
                <Text style={{color: '#e0e0e0', marginTop: 50, fontSize: 20, lineHeight: 22, maxWidth: 400}}>
                  Register now to access Furtopia's veterinary management system.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.loginSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserHome')}
            style={{ 
              alignSelf: 'flex-start',
              marginBottom: 30,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#3d67ee" />
            <Text style={{ color: '#3d67ee', fontSize: 14, fontWeight: '500' }}>
              Back to Home
            </Text>
          </TouchableOpacity>

          <Text style={styles.agsikapTitle}>Furtopia</Text>
          <Text style={[styles.loginHeader, {marginTop: 5}]}>Create Your Patient Account</Text>
          <Text style={styles.loginSubtext}>
            Fill in your details to create your account.
          </Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.inputField,
                getFieldStatus('fullName') === 'invalid' && styles.inputError,
                getFieldStatus('fullName') === 'valid' && styles.inputValid
              ]}
              placeholder="Full Name *"
              placeholderTextColor="#aaa"
              value={fullName}
              onChangeText={(text) => handleFieldChange('fullName', text)}
              onBlur={() => handleBlur('fullName')}
              maxLength={50}
            />
            <View style={styles.fieldFeedbackContainer}>
              <View style={styles.errorContainer}>
                {touched.fullName && errors.fullName ? (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                ) : null}
              </View>
              <Text style={[
                styles.charCount,
                getFieldStatus('fullName') === 'invalid' && styles.charCountError,
                getFieldStatus('fullName') === 'valid' && styles.charCountValid
              ]}>
                {fullName.length}/50
              </Text>
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Ionicons name="at-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.inputField,
                getFieldStatus('username') === 'invalid' && styles.inputError,
                getFieldStatus('username') === 'valid' && styles.inputValid
              ]}
              placeholder="Username *"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={(text) => handleFieldChange('username', text)}
              onBlur={() => handleBlur('username')}
              maxLength={20}
              autoCapitalize="none"
            />
            <View style={styles.fieldFeedbackContainer}>
              <View style={styles.errorContainer}>
                {touched.username && errors.username ? (
                  <Text style={styles.errorText}>{errors.username}</Text>
                ) : null}
              </View>
              <Text style={[
                styles.charCount,
                getFieldStatus('username') === 'invalid' && styles.charCountError,
                getFieldStatus('username') === 'valid' && styles.charCountValid
              ]}>
                {username.length}/20
              </Text>
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.inputField,
                getFieldStatus('password') === 'invalid' && styles.inputError,
                getFieldStatus('password') === 'valid' && styles.inputValid
              ]}
              placeholder="Password (8-30 chars) *"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={(text) => handleFieldChange('password', text)}
              onBlur={() => handleBlur('password')}
              maxLength={30}
            />
            <View style={styles.fieldFeedbackContainer}>
              <View style={styles.errorContainer}>
                {touched.password && errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>
              <Text style={[
                styles.charCount,
                getFieldStatus('password') === 'invalid' && styles.charCountError,
                getFieldStatus('password') === 'valid' && styles.charCountValid
              ]}>
                {password.length}/30
              </Text>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.inputField,
                getFieldStatus('confirmPassword') === 'invalid' && styles.inputError,
                getFieldStatus('confirmPassword') === 'valid' && styles.inputValid
              ]}
              placeholder="Confirm Password *"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => handleFieldChange('confirmPassword', text)}
              onBlur={() => handleBlur('confirmPassword')}
              maxLength={30}
            />
            <View style={styles.fieldFeedbackContainer}>
              <View style={styles.errorContainer}>
                {touched.confirmPassword && errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>
              <Text style={[
                styles.charCount,
                getFieldStatus('confirmPassword') === 'invalid' && styles.charCountError,
                getFieldStatus('confirmPassword') === 'valid' && styles.charCountValid
              ]}>
                {confirmPassword.length}/30
              </Text>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.inputField,
                getFieldStatus('email') === 'invalid' && styles.inputError,
                getFieldStatus('email') === 'valid' && styles.inputValid
              ]}
              placeholder="Email *"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => handleFieldChange('email', text)}
              onBlur={() => handleBlur('email')}
              maxLength={100}
            />
            <View style={styles.fieldFeedbackContainer}>
              <View style={styles.errorContainer}>
                {touched.email && errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>
              <Text style={[
                styles.charCount,
                getFieldStatus('email') === 'invalid' && styles.charCountError,
                getFieldStatus('email') === 'valid' && styles.charCountValid
              ]}>
                {email.length}/100
              </Text>
            </View>
          </View>

          {/* Contact Number (Formatted) */}
          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.inputField,
                getFieldStatus('contactNumber') === 'invalid' && styles.inputError,
                getFieldStatus('contactNumber') === 'valid' && styles.inputValid
              ]}
              placeholder="0000-000-0000 *"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={(text) => handleFieldChange('contactNumber', text)}
              onBlur={() => handleBlur('contactNumber')}
              maxLength={13} // 11 digits + 2 dashes
            />
            <View style={styles.fieldFeedbackContainer}>
              <View style={styles.errorContainer}>
                {touched.contactNumber && errors.contactNumber ? (
                  <Text style={styles.errorText}>{errors.contactNumber}</Text>
                ) : null}
              </View>
              <Text style={[
                styles.charCount,
                getFieldStatus('contactNumber') === 'invalid' && styles.charCountError,
                getFieldStatus('contactNumber') === 'valid' && styles.charCountValid
              ]}>
                {contactNumber.length}/13
              </Text>
            </View>
          </View>

          {/* Information Text */}
          <View style={{ marginTop: 10, marginBottom: 20 }}>
            <Text style={{ fontSize: 12, color: '#666', lineHeight: 16 }}>
              * Required fields. Choose a username and password you'll remember.
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.loginButton, 
              {opacity: loading ? 0.7 : 1, marginTop: 10},
              !isFormValid() && styles.loginButtonDisabled
            ]} 
            onPress={handleRegister}
            disabled={loading || !isFormValid()}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Register</Text>}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{
              marginTop: 25,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: '#555' }}>
              Already have an account?
              <Text style={{ color: '#3d67ee', fontWeight: '600' }}> Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}