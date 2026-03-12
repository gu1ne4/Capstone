import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, ScrollView, Alert, Platform } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'; // Added useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import homeStyle from '../styles/HomeStyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { availabilityService } from './availabilityService';

export default function History() {
  const ns = useNavigation();
  const route = useRoute();
  const isActive = route.name === 'History';

  const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

  const [currentUser, setCurrentUser] = useState(null);

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
  const [filterHovered, setFilterHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [historyAppointments, setHistoryAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // LOGOUT POPUP STATE
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'info', title: '', message: '', onConfirm: null, showCancel: false });

  // SHOW ALERT HELPER
  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setModalConfig({ type, title, message, onConfirm, showCancel });
    setLogoutModalVisible(true);
  };

  // LOGOUT FUNCTION WITH AUDIT
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

  // SESSION LOADING EFFECT (Prevents ghost sessions)
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

  // Load history appointments on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const appointments = await availabilityService.getAppointmentHistory();
      setHistoryAppointments(appointments);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load appointment history');
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on search and filters
  const filteredAppointments = historyAppointments.filter(app => {
    // Search filter
    if (searchQuery && !app.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !app.pet_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }
    
    // Service filter
    if (serviceFilter !== 'all' && app.service !== serviceFilter) {
      return false;
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#2e7d32';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

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

          {/* DYNAMIC DATA */}
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
          <View style={[homeStyle.glassContainer]} >
            <View style={{marginTop: 8}}>
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Home')}}>
                <Ionicons name="home-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Home</Text>
              </TouchableOpacity>
            </View>

            <View>
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

              {showAccountDropdown && (
                <View style={{ marginLeft: 25, marginTop: 5 }}>
                  <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Accounts')}}>
                      <Ionicons name="person-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Employees</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('UserAccounts')}}>
                      <Ionicons name="medkit-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Users / Patients</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View>
              <View style={[isActive ? homeStyle.selectedGlass : null]}>
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
              </View>

              {showAppointmentsDropdown && (
                <View style={{ marginLeft: 25, marginTop: 5 }}>
                  <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Schedule')}}>
                      <Ionicons name="calendar-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Schedule</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('AvailSettings')}}>
                      <Ionicons name="today-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Availability</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[isActive ? homeStyle.subSelectedGlass : null, {width: '100%'}]}>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('History')}}>
                      <Ionicons name="time-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>History</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View>
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
            <Ionicons name="document-text-outline" size={20} color="#3d67ee" style={{ marginTop: 2 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Appointments / History</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'center', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity>
              <Ionicons name="notifications" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TABLE CONTAINER */}
        <View style={homeStyle.tableContainer}>
          {/* Top bar with search and filter */}
          <View style={homeStyle.tableLayer1}>
            <View style={[homeStyle.subTable1, { flexDirection: 'row', alignItems: 'center' }]}>
              {/* Search Icon */}
              <View style={{ position: 'relative' }}>
                <Pressable
                  onHoverIn={() => setSearchHovered(true)}
                  onHoverOut={() => setSearchHovered(false)}
                  onPress={() => setSearchVisible(!searchVisible)}
                >
                  <Ionicons name="search-sharp" size={25} color={searchVisible ? "#afccf8" : "#3d67ee"} />
                </Pressable>

                {searchHovered && (
                  <View style={{ position: 'absolute', top: -30, left: -15, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 12 }}>Search</Text>
                  </View>
                )}
              </View>

              {searchVisible && (
                <TextInput
                  placeholder="Search by patient or pet name..."
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                  style={homeStyle.searchVisible}
                  maxLength={60}
                />
              )}

              {/* Filter Icon */}
              <View style={{ position: 'relative', marginLeft: 15 }}>
                <Pressable
                  onHoverIn={() => setFilterHovered(true)}
                  onHoverOut={() => setFilterHovered(false)}
                  onPress={() => setFilterVisible(!filterVisible)}
                >
                  <Ionicons name="filter-sharp" size={25} color={filterVisible ? "#afccf8" : "#3d67ee"} />
                </Pressable>

                {filterHovered && (
                  <View style={{ position: 'absolute', top: -30, left: -10, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 12 }}>Filter</Text>
                  </View>
                )}
              </View>

              {filterVisible && (
                <View style={{ flexDirection: 'row', marginLeft: 5, flexWrap: 'wrap' }}>
                  <Picker 
                    selectedValue={statusFilter} 
                    style={[homeStyle.pickerStyle, { width: 120 }]} 
                    onValueChange={(val) => setStatusFilter(val)}
                  >
                    <Picker.Item label="All Status" value="all" color="#a8a8a8" />
                    <Picker.Item label="Completed" value="completed" />
                    <Picker.Item label="Cancelled" value="cancelled" />
                  </Picker>

                  <Picker 
                    selectedValue={serviceFilter} 
                    style={[homeStyle.pickerStyle, { marginLeft: 10, width: 150 }]} 
                    onValueChange={(val) => setServiceFilter(val)}
                  >
                    <Picker.Item label="All Services" value="all" color="#a8a8a8" />
                    <Picker.Item label="Vaccination" value="Vaccination" />
                    <Picker.Item label="Check-up" value="Check-up" />
                    <Picker.Item label="Surgery" value="Surgery" />
                    <Picker.Item label="Grooming" value="Grooming" />
                    <Picker.Item label="Dental Care" value="Dental Care" />
                    <Picker.Item label="Emergency" value="Emergency" />
                  </Picker>

                  {(statusFilter !== 'all' || serviceFilter !== 'all' || searchQuery) && (
                    <TouchableOpacity 
                      onPress={() => {
                        setStatusFilter('all');
                        setServiceFilter('all');
                        setSearchQuery('');
                      }}
                      style={{ marginLeft: 10, justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#3d67ee', fontSize: 12 }}>Clear Filters</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Refresh button */}
            <View style={[homeStyle.subTable2, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity 
                style={homeStyle.blackBtn}
                onPress={loadHistory}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Ionicons name="refresh" color="#ffffff" /> Refresh
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Table */}
          <ScrollView>
            <DataTable>
              <DataTable.Header style={homeStyle.tableHeader}>
                <DataTable.Title style={{ flex: 2 }}>Patient Name</DataTable.Title>
                <DataTable.Title style={{ flex: 2,  justifyContent: 'center'  }}>Pet Name</DataTable.Title>
                <DataTable.Title style={{ flex: 2 ,  justifyContent: 'center' }}>Service</DataTable.Title>
                <DataTable.Title style={{ flex: 2 ,  justifyContent: 'center' }}>Date and Time</DataTable.Title>
                <DataTable.Title style={{ flex: 2 ,  justifyContent: 'center' }}>Doctor</DataTable.Title>
                <DataTable.Title style={{ flex: 1 ,  justifyContent: 'center' }}>Status</DataTable.Title>
              </DataTable.Header>

              {loading ? (
                <DataTable.Row>
                  <DataTable.Cell style={{ flex: 6, justifyContent: 'center' }}>
                    <Text style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      Loading history...
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <DataTable.Row key={appointment.id}>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <Text style={{ fontSize: 12 }}>{appointment.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2,  justifyContent: 'center'  }}>
                      <Text style={{ fontSize: 12 }}>{appointment.pet_name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2,  justifyContent: 'center'  }}>
                      <Text style={{ fontSize: 12 }}>{appointment.service}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2,  justifyContent: 'center'  }}>
                      <Text style={{ fontSize: 12 }}>{appointment.date_time}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2,  justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: appointment.doctor === 'Not Assigned' ? '#f57c00' : '#333' }}>
                        {appointment.doctor}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={{
                        backgroundColor: appointment.status === 'completed' ? '#e8f5e9' : '#ffebee',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        marginTop: 12,
                        alignSelf: 'flex-start'
                      }}>
                        <Text style={{ 
                          fontSize: 11, 
                          fontWeight: '600',
                          color: getStatusColor(appointment.status),
                          textTransform: 'capitalize'
                        }}>
                          {appointment.status}
                        </Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <DataTable.Row>
                  <DataTable.Cell style={{ flex: 6, justifyContent: 'center' }}>
                    <Text style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      No history appointments found
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </DataTable>
          </ScrollView>
        </View>
      </View>

      {/* LOGOUT ALERT MODAL COMPONENT */}
      <Modal
        transparent={true}
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
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
                  onPress={() => setLogoutModalVisible(false)} 
                  style={{paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 100, alignItems: 'center'}}
                >
                  <Text style={{color: '#333', fontWeight: '600'}}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={() => {
                  setLogoutModalVisible(false);
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
  );
}