import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground, Modal } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import homeStyle from '../styles/HomeStyle'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function UserHome() {

  const ns = useNavigation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);

  // 1. ADDED MODAL STATE FOR CUSTOM ALERT
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'info', 
    title: '',
    message: '', 
    onConfirm: null, 
    showCancel: false,
    confirmText: 'OK'
  });

  // 2. ADDED SHOW ALERT HELPER
  const showAlert = (type, title, message, onConfirm = null, showCancel = false, confirmText = 'OK') => {
    setModalConfig({ type, title, message, onConfirm, showCancel, confirmText });
    setModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const session = await AsyncStorage.getItem('userSession');
          if (session) {
            setCurrentUser(JSON.parse(session));
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Failed to load user session", error);
        }
      };
      loadUser();
    }, [])
  );

  // 3. ADDED PROTECTION HELPER FUNCTION
  // If no user is logged in, it shows the popup instead of navigating
  const handleProtectedAction = (action) => {
    if (currentUser) {
      action(); // Run the navigation or function
    } else {
      showAlert(
        'info', 
        'Account Required', 
        'You need to log in or sign up to access this feature.', 
        () => ns.navigate('Login'), // On confirm, redirect to Login
        true, // Show cancel button
        'Go to Login' // Custom confirm button text
      );
    }
  };

  // 4. UPDATED LOGOUT TO USE POPUP
  const handleLogout = () => {
    setDropdownVisible(false);
    showAlert('confirm', 'Log Out', 'Are you sure you want to log out?', async () => {
      await AsyncStorage.removeItem('userSession'); 
      setCurrentUser(null);
      ns.navigate('Login');
    }, true, 'Log Out');
  };

  const handleViewProfile = () => {
    setDropdownVisible(false);
    ns.navigate('UserProfile');
  };

  const handleMyPets = () => {
    setDropdownVisible(false);
    ns.navigate('UserPetProfile');
  };

  const displayName = currentUser ? (currentUser.fullname || currentUser.fullName || currentUser.username || "User") : "";

  return (
    <View style={{backgroundColor: '#fff', height: '100%', padding: 10}}>
      {/* Sticky Navigation Bar */}
      <View style={{
        zIndex: 1000,
      }}>
        <View style={userStyle.navbar}>
          {/* Profile Section with Dropdown */}
          <View style={{position: 'relative', zIndex: 2}}>
            
            {currentUser ? (
              <TouchableOpacity 
                onPress={() => setDropdownVisible(!dropdownVisible)}
                activeOpacity={0.7}
                style={{zIndex: 3}} 
              >
                <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
                  
                  {currentUser.userImage || currentUser.userimage ? (
                    <Image 
                      source={{ uri: currentUser.userImage || currentUser.userimage }} 
                      style={{width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#3d67ee'}}
                    />
                  ) : (
                    <View style={{
                      width: 30, 
                      height: 30, 
                      borderRadius: 15, 
                      backgroundColor: '#3d67ee20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#3d67ee'
                    }}>
                      <Text style={{color: '#3d67ee', fontWeight: 'bold', fontSize: 14}}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{flexDirection: 'column', marginRight: 5}}>
                    <Text style={[userStyle.smallText, {fontSize: 14, color: "#3d67ee", fontWeight: 600}]}>
                      {displayName}
                    </Text>
                  </View>
                  <Ionicons 
                    name={dropdownVisible ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#3d67ee" 
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={()=>{ns.navigate('Login')}}>
                <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
                  <Ionicons name="person-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
                  <View style={{flexDirection: 'column', marginRight: 5}}>
                    <Text style={[userStyle.smallText, {fontSize: 16, color: "#3d67ee", fontWeight: 600}]}>Login or Sign-up</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {dropdownVisible && currentUser && (
              <View style={{
                position: 'absolute',
                top: 48,
                left: 13,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.10,
                shadowRadius: 8,
                elevation: 5,
                width: 240,
                zIndex: 1, 
              }}>
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                    marginTop: 5,
                    gap: 10,
                  }}
                  onPress={handleViewProfile}
                >
                  <Ionicons name="person-outline" size={18} color="#3d67ee" />
                  <Text style={{fontSize: 14, color: '#333'}}>View Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                    gap: 10,
                  }}
                  onPress={handleMyPets}
                >
                  <Ionicons name="paw-outline" size={18} color="#3d67ee" />
                  <Text style={{fontSize: 14, color: '#333'}}>My Pets</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    gap: 10,
                  }}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={18} color="#ee3d5a" />
                  <Text style={{fontSize: 14, color: '#ee3d5a'}}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[userStyle.navSections, { flexDirection: 'row',  alignItems: 'center', gap: 60, width: '70%'}]}>
              <TouchableOpacity style={[userStyle.glassContainer]} onPress={()=>{ns.navigate('UserHome')}}>
                <Text style={[userStyle.navText, {color: '#3d67ee', fontWeight: '600'}]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>Our Services</Text>
              </TouchableOpacity>
              
              {/* WRAPPED IN PROTECTED ACTION */}
              <TouchableOpacity onPress={() => handleProtectedAction(() => ns.navigate('UserAppointment'))}>
                <Text style={userStyle.navText}>Book an Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right-side icons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Paw Icon Button - WRAPPED IN PROTECTED ACTION */}
            <TouchableOpacity onPress={() => handleProtectedAction(() => ns.navigate('UserPetProfile'))}>
              <View style={[userStyle.navSections, { }]}>
                <Ionicons name="paw" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
              </View>
            </TouchableOpacity>
            
            {/* Calendar Icon Button - WRAPPED IN PROTECTED ACTION */}
            <TouchableOpacity onPress={() => handleProtectedAction(() => ns.navigate('UserAppointmentView'))}>
              <View style={userStyle.navSections}>
                <Ionicons name="calendar-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
              </View>
            </TouchableOpacity>

            {/* Notification Icon Button - WRAPPED IN PROTECTED ACTION */}
            <TouchableOpacity onPress={() => handleProtectedAction(() => console.log('Notifications clicked'))}>
              <View style={userStyle.navSections}>
                <Ionicons name="notifications-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
              </View>
            </TouchableOpacity>
          </View>
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

      {/* 5. CUSTOM ALERT MODAL COMPONENT */}
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
            
            <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily: 'Segoe UI', color: 'black', textAlign: 'center'}}>
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
                  {modalConfig.confirmText || 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
}