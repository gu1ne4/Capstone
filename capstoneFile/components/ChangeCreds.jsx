import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import userStyle from '../styles/UserStyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/StyleSheet';
import homeStyle from '../styles/HomeStyle';

export default function ChangeCreds() {


  return (
    <LinearGradient
      colors={['#ffffff', '#3d67ee']}   // white → blue
      start={{ x: 0.5, y: 0 }}          // top center
      end={{ x: 0.5, y: 1 }}            // bottom center
      style={{ flex: 1 }}
    >

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={[userStyle.glassContainer, {padding: 80, borderRadius: 20}]}>
            <Text style={{fontWeight: '600', fontSize: 30}}>Set Your New Credentials</Text>
            <Text style={{fontSize: 16, marginTop: 8}}>Create a new Username and Password to replace your temporary ones.</Text>
            <Text style={{fontSize: 13, marginTop: 20, color: '#00000085'}}>This will be your new username and password for future access. Make sure  </Text>
            <Text style={{fontSize: 13, marginTop: 2,  color: '#00000085'}}>they meet the security requirements and are easy for you to remember.</Text>

            <View style={[styles.inputGroup, {marginTop: 30, borderColor: '#5f5f5f', backgroundColor: '#5f5f5f2b'}]}>
                <Ionicons name="at-outline" size={20} color="#5f5f5f" style={styles.inputIcon} />
                <TextInput style={[styles.inputField, {padding: 5, width: 350}]} placeholder="Username" placeholderTextColor="#5f5f5f"/>
            </View>

            <View style={[styles.inputGroup, {borderColor: '#5f5f5f', backgroundColor: '#5f5f5f2b'}]}>
                <Ionicons name="lock-closed-outline" size={20} color="#5f5f5f" style={[styles.inputIcon]} />
                <TextInput style={[styles.inputField, {padding: 5, width: 350}]} placeholder="Password" placeholderTextColor="#5f5f5f"/>
            </View>


            <TouchableOpacity style={{ width: "50%", marginTop: 25 }}>
            <LinearGradient
                colors={['#3d67ee', '#0738D9', '#041E76']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[homeStyle.blackBtn, { 
                width: "100%", 
                alignItems: "center", 
                gap: 10, 
                padding: 20, 
                borderRadius: 8 
                }]}
            >
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "semibold" }}>
                Update Credentials
                </Text>
            </LinearGradient>
            </TouchableOpacity>

        </View>
    </View>
        </LinearGradient>
  );
}
