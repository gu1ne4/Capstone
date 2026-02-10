import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native'
import React from 'react'
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import homeStyle from '../styles/HomeStyle'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'

// meow
export default function UserHome() {

  const ns = useNavigation();
  
  return (
    <View style={{backgroundColor: '#fff', height: '100%', padding: 10}}>
      <View style={userStyle.navbar}>
        {/* Logo */}
        <View style={userStyle.navSections}>
          <Text style={[homeStyle.brandFont, {color: '#0032f9'}]}>Agsikap</Text>
        </View>

        {/* Profile */}
        <TouchableOpacity onPress={()=>{ns.navigate('Login')}}>
          <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
            <Ionicons name="person-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            <View style={{flexDirection: 'column', marginRight: 5}}>
              <Text style={[userStyle.smallText, {fontSize: 16, color: "#3d67ee", fontWeight: 600}]}>Login or Sign-up</Text>
            </View>
          </View>
        </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[userStyle.navSections, { flexDirection: 'row', alignItems: 'center', gap: 60 }]}>
              <TouchableOpacity style={[userStyle.glassContainer]}>
                <Text style={[userStyle.navText, {color: '#3d67ee', fontWeight: '600'}]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity >
                <Text style={userStyle.navText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>Our Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={userStyle.appointmentBtn}>
                <Text style={userStyle.appointmentText}>Book an Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>

        {/* Right-side icons */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
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

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <View style={{alignItems: 'center', marginTop: 100}}>
          <View style={{ marginVertical: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 90, fontWeight: 'bold', lineHeight: 40,}}>Welcome to,</Text>
          <Text style={{ fontSize: 90, fontWeight: 'bold'}}>Furtopia!</Text>
          <Text style={{ fontSize: 20, color: '#5b5a5a', textAlign: 'center', marginTop: 50 }}>
            Your trusted partner in veterinary management and client care, empowering 
          </Text>
          <Text style={{ fontSize: 20, color: '#5b5a5a', textAlign: 'center', marginTop: 5 }}> clinics with modern solutions, seamless workflows, and compassionate service.</Text>
        </View>
        </View>

      </ScrollView>
    </View>
  )
}
