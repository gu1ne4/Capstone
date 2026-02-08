import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import homeStyle from '../styles/HomeStyle'
import { LinearGradient } from 'expo-linear-gradient'

export default function UserHome() {
  return (
    <LinearGradient
    colors={[ 
        '#b5c5ff',  
        '#dce3fb',   
        '#f5f7ff',   
        '#ffffff',   
    ]}
    locations={[0, 0.25, 0.45, 0.7, 1]} 
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={{ flex: 1 }}
    >

      {/* Navbar */}
      <View style={userStyle.navbar}>
        {/* Logo */}
        <View style={userStyle.navSections}>
          <Text style={[homeStyle.brandFont, {color: '#0032f9'}]}>Agsikap</Text>
        </View>

        {/* Profile */}
        <TouchableOpacity>
          <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
            <Image source={require('../assets/userImg.jpg')} style={{ width: 40, height: 40, borderRadius: 12, marginLeft: 3}}/>
            <View style={{flexDirection: 'column', marginRight: 5}}>
              <Text style={[userStyle.smallText, {fontWeight: '600', fontSize: 13}]}>Jarvan the Fourth</Text>
              <Text style={[userStyle.smallText, {fontSize: 11, opacity: 0.5}]}>View Profile</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Nav Menu */}
        <View style={[userStyle.navSections, {paddingHorizontal: 55, marginLeft: 70, flexDirection: 'row', alignItems: 'center', gap: 80}]}>
          <TouchableOpacity>
            <Text style={userStyle.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={userStyle.glassContainer}>
            <Text style={[userStyle.navText, {color: '#3d67ee', fontWeight: '600'}]}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={userStyle.navText}>Our Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={userStyle.appointmentBtn}>
            <Text style={userStyle.appointmentText}>Book an Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Right-side icons */}
        <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 10 }}>
          <TouchableOpacity>
            <View style={userStyle.navSections}>
              <Ionicons name="calendar-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={userStyle.navSections}>
              <Ionicons name="notifications-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Home Page Content */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <View style={{ marginVertical: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '600'}}>
            Welcome to Furtopia
          </Text>
          <Text style={{ fontSize: 16, color: '#333', textAlign: 'center', marginTop: 10 }}>
            Your trusted partner in veterinary management and client care.
          </Text>
        </View>

      </ScrollView>
    </LinearGradient>
  )
}
