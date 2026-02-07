import { View, Text, TouchableOpacity, Image, TextInput, Platform, Alert, ImageBackground, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState } from 'react'
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

  const handleLogin = async () => {
    if(!username || !password) {
        Alert.alert("Error", "Please enter both username and password");
        return;
    }

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

            <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.inputField}
                    placeholder="Username"
                    placeholderTextColor="#aaa"
                    value={username}
                    onChangeText={setUsername}
                />
            </View>

            <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.inputField}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={() => Alert.alert("Info", "Contact Admin")}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={[styles.loginButton, {opacity: loading ? 0.7 : 1}]} 
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
            </TouchableOpacity>

        </View>
      </View>
    </View>
  )
}