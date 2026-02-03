import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   
import { BlurView } from 'expo-blur';

import * as ImagePicker from 'expo-image-picker';

export default function SettingsPage() {

    const ns = useNavigation();

    const route = useRoute();
    const isActive = route.name === 'Settings';

    const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  return (
      <View style={homeStyle.biContainer}>

      {/* NAVBAR */}
        
      <View style={homeStyle.navbarContainer}>
        <LinearGradient
          colors={['#3d67ee', '#0738D9', '#041E76']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={homeStyle.navBody}
        >
          {/* LOGO AND BRAND NAME */}
          <View style={[homeStyle.navTitle, {gap: 10}]}>
            <Image 
              source={require('../assets/AgsikapLogo-Temp.png')} 
              style={{width: 25, height: 25, marginTop: 1}} 
              resizeMode="contain"
            />
            <Text style={[homeStyle.brandFont]}>Agsikap</Text>
          </View>

          {/* ACCOUNT LOGGED IN */}

          <View style={[homeStyle.glassContainer, {paddingLeft: 8}]}>
            <View style={[homeStyle.navAccount, {gap: 8}]}>
              <Image 
                source={require('../assets/userImg.jpg')} 
                style={{ width: 35, height: 35, borderRadius: 25, marginTop: 2 }}
              />
              <View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Queen Elsa</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>Project Manager (Admin)</Text>
              </View>
            </View>
          </View>

          <Text style={{ color: 'rgba(255, 255, 255, 0.83)', fontSize: 11, fontStyle: 'italic', marginLeft: 5, marginTop: 20 }}>Overview</Text>

          {/* NAVIGATION MENU */}
          <View style={[homeStyle.glassContainer]}>
            <View style={{marginTop: 8}}>
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Home')}}>
                <Ionicons name="home-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Home</Text>
              </TouchableOpacity>
            </View>

            <View>
              {/* Parent Button */}
              <TouchableOpacity 
                style={homeStyle.navBtn} 
                onPress={() => setShowAccountDropdown(!showAccountDropdown)}
              >
                <Ionicons name={"people-outline"} size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Account Overview</Text>
                <Ionicons 
                  name={showAccountDropdown ? "chevron-up-outline" : "chevron-down-outline"} 
                  size={14} 
                  color={"#fffefe"} 
                  style={{marginLeft: 5, marginTop: 2}} 
                />
              </TouchableOpacity>

              {/* Dropdown Subcategories */}
                {showAccountDropdown && (
                <View style={{ marginLeft: 25, marginTop: 5 }}>
                    <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Accounts')}}>
                        <Ionicons name="person-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Employees</Text>
                    </TouchableOpacity>
                    </View>

                    <View >
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('UserAccounts')}}>
                        <Ionicons name="medkit-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Users / Patients</Text>
                    </TouchableOpacity>
                    </View>
                </View>
                )}
            </View>

            <View >
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Audit')}}>
                <Ionicons name="document-text-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>System Audit</Text>
              </TouchableOpacity>
            </View>

            <View style={[isActive ? homeStyle.selectedGlass : null]}> 
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Settings')}}>
                <Ionicons name="settings-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Settings</Text>
              </TouchableOpacity>
            </View>

          </View>

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={[homeStyle.glassContainer, {paddingTop: 12, paddingBottom: 3}]}>
            <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Login')}}>
              <Ionicons name="log-out-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
              <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>


        </LinearGradient>
      </View>

      <View style={homeStyle.bodyContainer}>
        <View style={homeStyle.topContainer}>
            <View style={[homeStyle.subTopContainer]}>
            <Ionicons name="settings-outline" size={20} color="#3d67ee" style={{ marginTop: 2 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Settings</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'center', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity>
              <Ionicons name="notifications" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TABLE CONTAINER */}

        <View style={homeStyle.tableContainer}>
          

        </View>
      </View>
    </View>
  )
}