import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   

export default function AuditPage() {
  const ns = useNavigation();
  const route = useRoute();
  const isActive = route.name === 'Audit';
  const API_URL = 'http://localhost:3000'; 

  // ==========================================
  //  STATE MANAGEMENT
  // ==========================================
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Navbar Dropdowns
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);

  // Table UI State
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHovered, setSearchHovered] = useState(false);
  const [filterHovered, setFilterHovered] = useState(false);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const itemsPerPage = 8;
  const [statusFilter, setStatusFilter] = useState("defaultStatus");
  const [roleFilter, setRoleFilter] = useState("defaultRole");

  // ==========================================
  //  1. MODAL STATE (Copied from HomePage)
  // ==========================================
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'info', 
    title: '',
    message: '', 
    onConfirm: null, 
    showCancel: false 
  });

  // ==========================================
  //  2. HELPER FUNCTION (Copied from HomePage)
  // ==========================================
  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setModalConfig({ type, title, message, onConfirm, showCancel });
    setModalVisible(true);
  };

  // ==========================================
  //  API FUNCTIONS
  // ==========================================
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

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/access_logs`); 
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setAuditLogs(data.sort((a, b) => new Date(b.login_time) - new Date(a.login_time)));
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // ==========================================
  //  3. LOGOUT HANDLER (Uses showAlert)
  // ==========================================
  const handleLogoutPress = () => {
    // This now calls your custom 'showAlert' instead of Alert.alert
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
      ns.navigate('Login'); 
    }, true); // true = showCancel button
  };

  // ==========================================
  //  FILTER LOGIC
  // ==========================================
  const filteredLogs = auditLogs.filter(log => {
    const uName = (log.username || 'Unknown').toLowerCase();
    const uAction = (log.action || '').toLowerCase();
    const uStatus = log.status || '';
    const uRole = log.role || '';

    const matchesSearch = 
      uName.includes(searchQuery.toLowerCase()) || 
      uAction.includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter !== "defaultStatus" ? uStatus === statusFilter : true;
    const matchesRole = roleFilter !== "defaultRole" ? uRole === roleFilter : true;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const noMatchFilters = statusFilter === "defaultStatus" && roleFilter === "defaultRole";

  // ==========================================
  //  RENDER
  // ==========================================
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
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                    {currentUser ? (currentUser.fullName || currentUser.username) : 'Loading...'}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>
                    {currentUser ? currentUser.role : '...'}
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

            <View style={[isActive ? homeStyle.selectedGlass : null]}>
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

      {/* BODY */}
      <View style={homeStyle.bodyContainer}>
        <View style={homeStyle.topContainer}>
          <View style={[homeStyle.subTopContainer]}>
            <Ionicons name="document-text-outline" size={20} color="#3d67ee" style={{ marginTop: 2 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>System Audit / Access Logs</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'center', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity onPress={fetchAuditLogs}>
              <Ionicons name="refresh" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TABLE CONTAINER */}
        <View style={homeStyle.tableContainer}>
          <View style={homeStyle.tableLayer1}>
            
            {/* SEARCH AND FILTER BAR */}
            <View style={[homeStyle.subTable1, { flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }]}>
              
              {/* Search Icon */}
              <View style={{ position: 'relative' }}>
                <Pressable onHoverIn={() => setSearchHovered(true)}
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
                  placeholder="Search user or action..."
                  value={searchQuery}
                  onChangeText={(text) => {setSearchQuery(text); setPage(0);}}
                  style={homeStyle.searchVisible}
                  maxLength={60} 
                />
              )}

              {/* Filter Icon */}
              <View style={{ position: 'relative' }}>
                <Pressable onHoverIn={() => setFilterHovered(true)}
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
                <View style={{ flexDirection: 'row', marginLeft: 5, flexWrap: 'wrap', zIndex: 2 }}>
                  {/* Status Picker (Success/Failed) */}
                  <Picker selectedValue={statusFilter} style={homeStyle.pickerStyle} onValueChange={(val) => {setStatusFilter(val); setPage(0);}}>
                    <Picker.Item label="Status" value="defaultStatus" color="#a8a8a8" />
                    <Picker.Item label="Success" value="SUCCESS" />
                    <Picker.Item label="Failed" value="FAILED" />
                  </Picker>

                  {/* Role Picker */}
                  <Picker selectedValue={roleFilter} style={[homeStyle.pickerStyle, { marginLeft: 10, width: 140 }]} onValueChange={(val) => {setRoleFilter(val); setPage(0);}}>
                    <Picker.Item label="Role" value="defaultRole" color="#a8a8a8" />
                    <Picker.Item label="Admin" value="Admin" />
                    <Picker.Item label="Veterinarian" value="Veterinarian" />
                    <Picker.Item label="Receptionist" value="Receptionist" />
                    <Picker.Item label="User" value="User" />
                  </Picker>

                  {/* Clear Filters Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setStatusFilter("defaultStatus");
                      setRoleFilter("defaultRole");
                      setSearchQuery("");
                      setPage(0);
                    }}
                    style={homeStyle.clearFilterBtn}
                  >
                    <Ionicons name="close-circle-sharp" size={15} color="#ffffff" style={{ marginTop: 3 }} />
                    <Text style={{ color: '#ffffff', fontWeight: '500', fontSize: 13, fontFamily: 'Segoe UI' }}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[homeStyle.subTable2, { justifyContent: 'flex-end' }]}>
               {/* Placeholder for future Export button */}
            </View>
          </View>

          {/* DATATABLE */}
          {loading ? (
            <ActivityIndicator size="large" color="#3d67ee" style={{marginTop: 50}} />
          ) : (
            <DataTable>
              <DataTable.Header style={homeStyle.tableHeader}>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 3 }}>User</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.5 }}>Role</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.5 }}>Action</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 2.5 }}>Date & Time</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 2 }}>IP Address</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.5 }}>Status</DataTable.Title>
              </DataTable.Header>

              {filteredLogs.length > 0 ? (
                filteredLogs.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((log, index) => {
                  const isSuccess = log.status === 'SUCCESS';
                  const dateObj = new Date(log.login_time);
                  const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <DataTable.Row key={log.log_id || index}>
                      <DataTable.Cell style={{ flex: 3 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons 
                            name="person-circle-outline" 
                            size={30} 
                            color="#3d67ee" 
                            style={{marginRight: 10}}
                          />
                          <Text style={homeStyle.tableFont}>{log.username || 'Unknown'}</Text>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.5 }}>{log.role}</DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.5 }}>{log.action}</DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 2.5 }}>{formattedDate}</DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 2 }}>{log.ip_address || 'N/A'}</DataTable.Cell>
                      <DataTable.Cell style={{ justifyContent: 'center', flex: 1.5 }}>
                        <View
                          style={[
                            homeStyle.statusBadge,
                            isSuccess ? homeStyle.activeBadge : homeStyle.inactiveBadge,
                            { marginTop: 10, alignItems: 'center', minWidth: 80 }
                          ]}
                        >
                          <Text style={[homeStyle.statusText, isSuccess && homeStyle.activeText]}>{log.status}</Text>
                        </View>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })
              ) : (
                <DataTable.Row>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Text style={{ color: '#888', textAlign: 'center', width: '100%' }}>
                      {noMatchFilters ? "Showing all logs (no filters applied)" : "No logs found"}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}

              <DataTable.Pagination
                page={page}
                numberOfPages={Math.ceil(filteredLogs.length / itemsPerPage)}
                onPageChange={(newPage) => setPage(newPage)}
                label={`${page + 1} of ${Math.ceil(filteredLogs.length / itemsPerPage) || 1}`}
                showFastPaginationControls
                optionsPerPage={[8]}
                itemsPerPage={itemsPerPage}
              />
            </DataTable>
          )}
        </View>
      </View>

      {/* 4. UNIFIED CUSTOM ALERT MODAL (Copied from HomePage) */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={{backgroundColor: 'white', padding: 25, borderRadius: 12, width: '80%', maxWidth: 350, alignItems: 'center', elevation: 5}}>
            {/* Dynamic Icon based on Type */}
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
            
            {/* Title */}
            <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily: 'Segoe UI', color: 'black'}}>
              {modalConfig.title}
            </Text>
            
            {/* Message (supports String or JSX) */}
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
              {/* Cancel Button - Only show if required */}
              {modalConfig.showCancel && (
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  style={{paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 100, alignItems: 'center'}}
                >
                  <Text style={{color: '#333', fontWeight: '600'}}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              {/* Confirm/OK Button */}
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
  );
}