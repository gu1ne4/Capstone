import { View, Text, TextInput, TouchableOpacity, ImageBackground, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import styles from '../styles/StyleSheet'   // reuse your stylesheet

export default function RegistrationPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullName || !username || !password || !email || !contactNumber) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      // Replace with your backend endpoint
      const res = await fetch('http://10.0.2.2:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, password, email, contactNumber }),
      })
      const data = await res.json()
      if (res.ok) {
        Alert.alert("Success", "Account created successfully!")
      } else {
        Alert.alert("Error", data.error || "Registration failed")
      }
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "Network error, please try again")
    } finally {
      setLoading(false)
    }
  }

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
                  Register now to access Agsikap’s veterinary management system.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.loginSection}>
          <Text style={styles.agsikapTitle}>Agsikap</Text>
          <Text style={[styles.loginHeader, {marginTop: 5}]}>Create Your Account</Text>
          <Text style={styles.loginSubtext}>
            Fill in your details to get started.
          </Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#888" style={[styles.inputIcon]} />
            <TextInput
              style={styles.inputField}
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Ionicons name="at-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="Username"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Password */}
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

          {/* Email */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Contact Number */}
          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="Contact Number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.loginButton, {opacity: loading ? 0.7 : 1, marginTop: 20}]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Register</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
