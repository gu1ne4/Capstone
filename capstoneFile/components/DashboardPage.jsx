import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, Platform } from 'react-native';
import React, { useState, useEffect } from 'react'; 
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   
import { BlurView } from 'expo-blur';

import * as ImagePicker from 'expo-image-picker';

export default function DashboardPage() {

    const ns = useNavigation();
    const route = useRoute();
    const isActive = route.name === 'Home';

    const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

    const [currentUser, setCurrentUser] = useState(null);
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);

    // 1. ADDED MODAL STATE FOR CUSTOM ALERT
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
      type: 'info', 
      title: '',
      message: '', 
      onConfirm: null, 
      showCancel: false 
    });

    // 2. ADDED SHOW ALERT HELPER
    const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
      setModalConfig({ type, title, message, onConfirm, showCancel });
      setModalVisible(true);
    };

    // 3. UPDATED LOGOUT TO USE POPUP & AUDIT LOG
    const handleLogoutPress = () => {
      showAlert('confirm', 'Log Out', 'Are you sure you want to log out?', async () => {
        try {
          if (currentUser) {
            console.log("Sending logout audit for:", currentUser.username);
            await fetch(`${API_URL}/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id || currentUser.pk, 
                userType: 'EMPLOYEE', 
                username: currentUser.username || currentUser.fullName,
                role: currentUser.role
              })
            });
          }
        } catch (error) {
          console.error("Logout audit failed:", error);
        }

        await AsyncStorage.removeItem('userSession'); 
        setCurrentUser(null);
        ns.navigate('Login'); 
      }, true); 
    };

    useEffect(() => {
      const loadUser = async () => {
        try {
          const session = await AsyncStorage.getItem('userSession');
          if (session) {
            setCurrentUser(JSON.parse(session));
          }
        } catch (error) {
          console.error("Failed to load user session", error);
        }
      };
      loadUser();
    }, []);

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

          <View style={[homeStyle.glassContainer, {paddingLeft: 8}]}>
            <View style={[homeStyle.navAccount, {gap: 8}]}>
              <Image 
                source={(currentUser && currentUser.userImage) 
                  ? { uri: currentUser.userImage } 
                  : require('../assets/userImg.jpg')} 
                style={{ width: 35, height: 35, borderRadius: 25, marginTop: 2 }}
              />
              <View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                  {currentUser ? currentUser.username : "Loading..."}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>
                  {currentUser ? currentUser.role : "..."}
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ color: 'rgba(255, 255, 255, 0.83)', fontSize: 11, fontStyle: 'italic', marginLeft: 5, marginTop: 20 }}>Overview</Text>

          {/* NAVIGATION MENU */}
          <View style={[homeStyle.glassContainer]}>
            <View style={[isActive ? homeStyle.selectedGlass : null, {marginTop: 8}]}>
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

            <View>
              {/* Parent Button */}
              <TouchableOpacity 
                style={homeStyle.navBtn} 
                onPress={() => setShowAppointmentsDropdown(!showAppointmentsDropdown)}
              >
                <Ionicons name={"calendar-clear-outline"} size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Appointments</Text>
                <Ionicons 
                  name={showAppointmentsDropdown ? "chevron-up-outline" : "chevron-down-outline"} 
                  size={14} 
                  color={"#fffefe"} 
                  style={{marginLeft: 5, marginTop: 2}} 
                />
              </TouchableOpacity>

              {/* Dropdown Subcategories */}
                {showAppointmentsDropdown && (
                <View style={{ marginLeft: 25, marginTop: 5 }}>
                    <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Schedule')}}>
                        <Ionicons name="calendar-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Schedule</Text>
                    </TouchableOpacity>
                    </View>

                    <View >
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('AvailSettings')}}>
                        <Ionicons name="today-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Availability Settings</Text>
                    </TouchableOpacity>
                    </View>

                    <View >
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('History')}}>
                        <Ionicons name="time-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>History</Text>
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

            <View>
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Settings')}}>
                <Ionicons name="settings-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Settings</Text>
              </TouchableOpacity>
            </View>

          </View>

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={[homeStyle.glassContainer, {paddingTop: 12, paddingBottom: 3}]}>
            <TouchableOpacity style={homeStyle.navBtn} onPress={handleLogoutPress}>
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
            <Ionicons name="home-outline" size={20} color="#3d67ee" style={{ marginTop: 2 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Home</Text>
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

      {/* 4. CUSTOM ALERT MODAL COMPONENT */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={{backgroundColor: 'white', padding: 25, borderRadius: 12, width: '80%', maxWidth: 350, alignItems: 'center', elevation: 5}}>
            <Ionicons 
              name={
                modalConfig.type === 'success' ? "checkmark-circle-outline" :
                modalConfig.type === 'error' ? "close-circle-outline" :
                "alert-circle-outline"
              } 
              size={55} 
              color={
                modalConfig.type === 'success' ? "#2e9e0c" :
                modalConfig.type === 'error' ? "#d93025" :
                "#3d67ee"
              } 
            />
            
            <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily: 'Segoe UI', color: 'black'}}>
              {modalConfig.title}
            </Text>
            
            {typeof modalConfig.message === 'string' ? (
              <Text style={{textAlign: 'center', color: '#666', marginBottom: 25, fontSize: 14}}>
                {modalConfig.message}
              </Text>
            ) : (
              <View style={{marginBottom: 25}}>
                {modalConfig.message}
              </View>
            )}
            
            <View style={{flexDirection: 'row', gap: 15, width: '100%', justifyContent: 'center'}}>
              {modalConfig.showCancel && (
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  style={{paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 100, alignItems: 'center'}}
                >
                  <Text style={{color: '#333', fontWeight: '600'}}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                }} 
                style={{
                  paddingVertical: 10, 
                  paddingHorizontal: 20, 
                  backgroundColor: modalConfig.type === 'error' ? '#d93025' : '#3d67ee', 
                  borderRadius: 8, 
                  minWidth: 100, 
                  alignItems: 'center'
                }}
              >
                <Text style={{color: 'white', fontWeight: '600'}}>
                  {modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
}