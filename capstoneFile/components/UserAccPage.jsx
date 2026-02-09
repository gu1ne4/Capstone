import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, Platform, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';    
import * as ImagePicker from 'expo-image-picker';

export default function UserAccPage() {
  const ns = useNavigation();
  const route = useRoute();
  
  // Highlighting the correct Sidebar Item
  const isActive = route.name === 'UserAccounts'; 

  // ==========================================
  //  STATE MANAGEMENT
  // ==========================================
  const [currentUser, setCurrentUser] = useState({ fullName: 'Loading...', role: '', userImage: null });
  const [accounts, setAccounts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // ✅ API URL (Port 3001)
  const API_URL = Platform.OS === 'web' ? 'http://localhost:3001' : 'http://10.0.2.2:3001';

  // UI State
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [editAccountVisible, setEditAccountVisible] = useState(false);
  const [viewAccountVisible, setViewAccountVisible] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
  const [filterHovered, setFilterHovered] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'info', title: '', message: '', onConfirm: null, showCancel: false });

  // Pagination
  const [page, setPage] = useState(0);
  const itemsPerPage = 8;

  // Form Data
  const [editingId, setEditingId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState({});
  const [newUsername, setNewUsername] = useState(''); 
  const [newFullName, setNewFullName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState('Active'); 
  const [userImage, setUserImage] = useState(null); 
  const [userImageBase64, setUserImageBase64] = useState(null); 
  const [status, setStatus] = useState("defaultStatus");

  // ==========================================
  //  HELPERS
  // ==========================================

  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setModalConfig({ type, title, message, onConfirm, showCancel });
    setModalVisible(true);
  };

  const loadCurrentUser = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (session) setCurrentUser(JSON.parse(session));
    } catch (error) { console.log('Error loading session', error); }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/patients`);
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error', 'Failed to fetch patient data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    loadCurrentUser();
  }, []);

  const resetForm = () => {
    setNewUsername(''); 
    setNewFullName(''); 
    setNewContact(''); 
    setNewEmail(''); 
    setNewStatus('Active');
    setUserImage(null); 
    setUserImageBase64(null); 
    setEditingId(null);
  };

  const handleCancel = (mode) => {
    let hasChanges = false;
    if (mode === 'create') {
      hasChanges = newFullName || newContact || newEmail || userImage;
    } else if (mode === 'edit') {
      const original = accounts.find(a => a.pk === editingId);
      if (original) {
        if (newUsername !== original.username || 
            newFullName !== (original.fullName || original.fullname) ||
            newContact !== (original.contactNumber || original.contactnumber) ||
            newEmail !== original.email || 
            newStatus !== original.status) hasChanges = true;
      }
    }

    if (hasChanges) {
      showAlert('confirm', 'Unsaved Changes', 'You have unsaved changes. Are you sure you want to discard them?', () => {
        setAddAccountVisible(false); setEditAccountVisible(false); resetForm();
      }, true);
    } else {
      setAddAccountVisible(false); setEditAccountVisible(false); resetForm();
    }
  };

  const handleStatusToggle = (value) => {
    const nextStatus = value ? 'Active' : 'Disabled';
    const messageJSX = (
      <Text>
        Are you sure you want to <Text style={{fontWeight: 'bold', color: nextStatus === 'Active' ? 'green' : 'red'}}>{nextStatus === 'Active' ? 'ACTIVATE' : 'DEACTIVATE'}</Text> this account?
      </Text>
    );
    showAlert('confirm', 'Confirm Status Change', messageJSX, () => { setNewStatus(nextStatus); }, true);
  };

  const handleLogoutPress = () => {
    showAlert('confirm', 'Log Out', 'Are you sure you want to log out?', async () => {
      await AsyncStorage.removeItem('userSession');
      ns.navigate('Login');
    }, true);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { showAlert('error', 'Permission', 'Camera roll access needed!'); return; }
    let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (!res.canceled) { setUserImage(res.assets[0].uri); setUserImageBase64(res.assets[0].base64); }
  };

  // ==========================================
  //  SAVE / UPDATE ACTIONS
  // ==========================================
  const handleSaveAccount = async () => {
    // 1. EMPTY CHECK
    if (!newFullName || !newContact || !newEmail) {
      showAlert('error', 'Missing Information', 'Please fill in Full Name, Contact, and E-Mail.'); return;
    }
    
    // 2. MIN LENGTH CHECKS
    if (newFullName.length < 5) { showAlert('error', 'Invalid Input', 'Full Name must be at least 5 characters.'); return; }
    if (newContact.length < 7) { showAlert('error', 'Invalid Input', 'Contact Number must be at least 7 digits.'); return; }
    if (newEmail.length < 6) { showAlert('error', 'Invalid Input', 'Email must be at least 6 characters.'); return; }

    // 3. DUPLICATE CHECK (Check Email)
    const isDuplicate = accounts.some(acc => acc.email.toLowerCase() === newEmail.toLowerCase());
    if (isDuplicate) { showAlert('error', 'Duplicate Entry', 'This email is already registered.'); return; }

    const dateCreated = new Date().toLocaleDateString('en-US'); 

    try {
      const res = await fetch(`${API_URL}/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newFullName,
          contactNumber: newContact,
          email: newEmail,
          userImage: userImageBase64,
          status: newStatus,
          dateCreated: dateCreated
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAddAccountVisible(false);
        showAlert('success', 'Success', 'Patient Account Created Successfully!', () => { fetchAccounts(); resetForm(); });
      } else {
        showAlert('error', 'Failed', data.error || 'Registration failed');
      }
    } catch (e) { showAlert('error', 'Network Error', 'Could not connect to the server.'); }
  };

  const openEditModal = (user) => {
    setEditingId(user.pk);
    setNewUsername(user.username);
    setNewFullName(user.fullName || user.fullname);
    setNewContact((user.contactNumber || user.contactnumber || '').toString());
    setNewEmail(user.email);
    setNewStatus(user.status);
    
    const img = user.userImage || user.userimage;
    setUserImage(img);
    setUserImageBase64(null); 
    setEditAccountVisible(true);
  };

  const handleUpdateAccount = async () => {
    // 1. MIN LENGTH CHECKS
    if (newFullName.length < 5) { showAlert('error', 'Invalid Input', 'Full Name must be at least 5 characters.'); return; }
    if (newContact.length < 7) { showAlert('error', 'Invalid Input', 'Contact Number must be at least 7 digits.'); return; }
    if (newEmail.length < 6) { showAlert('error', 'Invalid Input', 'Email must be at least 6 characters.'); return; }

    // 2. DUPLICATE CHECK (Check Email, excluding self)
    const isDuplicate = accounts.some(acc => 
      acc.pk !== editingId && acc.email.toLowerCase() === newEmail.toLowerCase()
    );
    if (isDuplicate) { showAlert('error', 'Duplicate Entry', 'This email is already in use by another patient.'); return; }

    try {
      const res = await fetch(`${API_URL}/patients/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          fullName: newFullName,
          contactNumber: newContact,
          email: newEmail,
          status: newStatus,
          userImage: userImageBase64
        }),
      });

      if (res.ok) {
        setEditAccountVisible(false);
        showAlert('success', 'Success', 'Patient Updated Successfully!', () => { fetchAccounts(); resetForm(); });
      } else {
        showAlert('error', 'Update Failed', 'Failed to update patient information.');
      }
    } catch (e) { showAlert('error', 'Network Error', 'Could not connect to the server.'); }
  };

  const handleViewDetails = (user) => {
    setSelectedAccount(user);
    setViewAccountVisible(true);
  };

  const filteredUsers = accounts.filter(u => {
    const name = (u.fullName || u.fullname || u.username).toLowerCase();
    const mail = u.email.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || mail.includes(searchQuery.toLowerCase());
    const matchesStatus = status !== "defaultStatus" ? u.status === status : true;
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  //  RENDER
  // ==========================================
  return (
    <View style={homeStyle.biContainer}>
      
      {/* NAVBAR */}
      <View style={homeStyle.navbarContainer}>
        <LinearGradient colors={['#3d67ee', '#0738D9', '#041E76']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={homeStyle.navBody}>
          <View style={[homeStyle.navTitle, {gap: 10}]}>
            <Image source={require('../assets/AgsikapLogo-Temp.png')} style={{width: 25, height: 25, marginTop: 1}} resizeMode="contain"/>
            <Text style={[homeStyle.brandFont]}>Agsikap</Text>
          </View>
          <View style={[homeStyle.glassContainer, {paddingLeft: 8}]}>
            <View style={[homeStyle.navAccount, {gap: 8}]}>
              <Image source={currentUser.userImage ? { uri: currentUser.userImage } : require('../assets/userImg.jpg')} style={{ width: 35, height: 35, borderRadius: 25, marginTop: 2 }}/>
              <View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{currentUser.fullName || "User"}</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>{currentUser.role || "Role"}</Text>
              </View>
            </View>
          </View>
          <Text style={{ color: 'rgba(255, 255, 255, 0.83)', fontSize: 11, fontStyle: 'italic', marginLeft: 5, marginTop: 20 }}>Overview</Text>
          <View style={[homeStyle.glassContainer]}>
             <View style={{marginTop: 8}} >
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Home')}}>
                <Ionicons name="home-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Home</Text>
              </TouchableOpacity>
            </View> 
            <View style={[isActive ? homeStyle.selectedGlass : null]}>
              <TouchableOpacity style={homeStyle.navBtn} onPress={() => setShowAccountDropdown(!showAccountDropdown)}>
                <Ionicons name={"people-outline"} size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Account Overview</Text>
                <Ionicons name={showAccountDropdown ? "chevron-up-outline" : "chevron-down-outline"} size={14} color={"#fffefe"} style={{marginLeft: 5, marginTop: 2}} />
              </TouchableOpacity>
                {showAccountDropdown && (
                <View style={{ marginLeft: 25, marginTop: 5 }}>
                    <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Accounts')}}>
                        <Ionicons name="person-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Employees</Text>
                    </TouchableOpacity>
                    </View>
                    <View style={[isActive ? homeStyle.selectedGlass : null, {width: '100%'}]}>
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

      {/* BODY CONTENT */}
      <View style={homeStyle.bodyContainer}>
        <View style={homeStyle.topContainer}>
          <View style={[homeStyle.subTopContainer]}>
            <Ionicons name="medkit-outline" size={23} color="#3d67ee" style={{ marginTop: 4 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Account Overview / Patients</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'center', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity onPress={fetchAccounts}>
              <Ionicons name="notifications" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TABLE SECTION */}
        <View style={homeStyle.tableContainer}>
          <View style={homeStyle.tableLayer1}>
             <View style={[homeStyle.subTable1, { flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }]}>
                <View style={{ position: 'relative' }}>
                    <Pressable onHoverIn={() => setSearchHovered(true)} onHoverOut={() => setSearchHovered(false)} onPress={() => setSearchVisible(!searchVisible)}>
                    <Ionicons name="search-sharp" size={25} color={searchVisible ? "#afccf8" : "#3d67ee"} />
                    </Pressable>
                    {searchHovered && <View style={{ position: 'absolute', top: -30, left: -15, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}><Text style={{ color: '#fff', fontSize: 12 }}>Search</Text></View>}
                </View>
                {searchVisible && <TextInput placeholder="Search..." value={searchQuery} onChangeText={(text) => {setSearchQuery(text); setPage(0);}} style={homeStyle.searchVisible} maxLength={60} />}
                
                <View style={{ position: 'relative' }}>
                    <Pressable onHoverIn={() => setFilterHovered(true)} onHoverOut={() => setFilterHovered(false)} onPress={() => setFilterVisible(!filterVisible)}>
                    <Ionicons name="filter-sharp" size={25} color={filterVisible ? "#afccf8" : "#3d67ee"} />
                    </Pressable>
                    {filterHovered && <View style={{ position: 'absolute', top: -30, left: -10, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}><Text style={{ color: '#fff', fontSize: 12 }}>Filter</Text></View>}
                </View>

                {filterVisible && (
                   <View style={{ flexDirection: 'row', marginLeft: 5, flexWrap: 'wrap', zIndex: 2 }}>
                       <Picker selectedValue={status} style={homeStyle.pickerStyle} onValueChange={(val) => {setStatus(val); setPage(0);}}>
                          <Picker.Item label="Status" value="defaultStatus" color="#a8a8a8" />
                          <Picker.Item label="Active" value="Active" />
                          <Picker.Item label="Disabled" value="Disabled" />
                       </Picker>
                       <TouchableOpacity onPress={() => { setStatus("defaultStatus"); setSearchQuery(""); setPage(0); }} style={homeStyle.clearFilterBtn}>
                          <Ionicons name="close-circle-sharp" size={15} color="#ffffff" style={{ marginTop: 3 }} />
                          <Text style={{ color: '#ffffff', fontWeight: '500', fontSize: 13, fontFamily: 'Segoe UI' }}>Clear Filters</Text>
                       </TouchableOpacity>
                   </View>
                )}
             </View>

             <View style={[homeStyle.subTable2, { justifyContent: 'flex-end' }]}>
                <TouchableOpacity style={homeStyle.blackBtn} onPress={() => { resetForm(); setAddAccountVisible(true); }}>
                   <Text style={{color:'#ffffff', fontWeight:'600'}}><Ionicons name="person-add" color="#ffffff" style={{ marginTop: 3 }}/> Add Patient</Text>
                </TouchableOpacity>
             </View>
          </View>

          {loading ? <ActivityIndicator size="large" color="#3d67ee" style={{marginTop: 50}}/> : (
            <DataTable>
              <DataTable.Header style={homeStyle.tableHeader}>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{flex: 3}}>Name</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{flex: 2, justifyContent: 'center'}}>Contact Number</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{flex: 3, justifyContent: 'center'}}>E-Mail</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{flex: 1.5, justifyContent: 'center'}}>Status</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{flex: 1, justifyContent: 'center'}}>View</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{flex: 1, justifyContent: 'flex-end'}}>Edit</DataTable.Title>
              </DataTable.Header>
              {filteredUsers.length > 0 ? (
                  filteredUsers.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map(u => (
                        <DataTable.Row key={u.pk || u.id || Math.random()}>
                        <DataTable.Cell style={{flex: 3}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={u.userImage ? {uri: u.userImage} : require('../assets/userImg.jpg')} style={{width:30, height:30, borderRadius:12, marginRight:20}}/>
                            <Text style={homeStyle.tableFont}>{u.fullName || u.fullname || u.username}</Text>
                            </View>
                        </DataTable.Cell>
                        <DataTable.Cell textStyle={homeStyle.tableFont} style={{flex: 2, justifyContent: 'center'}}>{u.contactNumber || u.contactnumber}</DataTable.Cell>
                        <DataTable.Cell textStyle={homeStyle.tableFont} style={{flex: 3, justifyContent: 'center'}}>{u.email}</DataTable.Cell>
                        <DataTable.Cell style={{flex: 1.5, justifyContent: 'center'}}>
                            <View style={[homeStyle.statusBadge, u.status === 'Active' ? homeStyle.activeBadge : homeStyle.inactiveBadge, {marginTop: 10, alignItems: 'center'}]}>
                                <Text style={[homeStyle.statusText, u.status === 'Active' && homeStyle.activeText]}>{u.status}</Text>
                            </View>
                        </DataTable.Cell>
                        <DataTable.Cell style={{flex: 1, justifyContent: 'center'}}>
                            <TouchableOpacity onPress={() => handleViewDetails(u)}><Ionicons name="eye" size={15} color="#3d67ee"/></TouchableOpacity>
                        </DataTable.Cell>
                        <DataTable.Cell style={{flex: 1, justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={() => openEditModal(u)}><Ionicons name="pencil-sharp" size={15} color="#3d67ee"/></TouchableOpacity>
                        </DataTable.Cell>
                        </DataTable.Row>
                    ))
              ) : (
                <DataTable.Row><DataTable.Cell style={{flex: 1}}><Text style={{color: '#888', textAlign: 'center', width: '100%'}}>No patients found</Text></DataTable.Cell></DataTable.Row>
              )}
              <DataTable.Pagination page={page} numberOfPages={Math.ceil(filteredUsers.length/itemsPerPage)} onPageChange={setPage} label={`${page + 1} of ${Math.ceil(filteredUsers.length/itemsPerPage)}`} showFastPaginationControls optionsPerPage={[8]} itemsPerPage={itemsPerPage} />
            </DataTable>
          )}
        </View>
      </View>

      {/* CREATE PATIENT MODAL */}
      <Modal visible={addAccountVisible} transparent={true} animationType="fade" onRequestClose={() => handleCancel('create')}>
         <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <View style={homeStyle.modalContainer}>
               <View style={{marginBottom: 20, alignItems: 'center'}}><Text style={{fontSize: 24, fontWeight: 'bold', fontFamily: 'Segoe UI'}}>Create Patient Account</Text></View>
               <View style={{alignItems: 'center', marginBottom: 35}}>
                  <TouchableOpacity onPress={pickImage} style={[homeStyle.uploadBtn, {justifyContent:'center', alignItems:'center', position: 'relative'}]}>
                     {userImage ? <Image source={{uri: userImage}} style={{width:100, height:100, borderRadius:60, borderWidth:1, borderColor:'#3d67ee'}}/> : <View style={{alignItems: 'center'}}><Ionicons name="image-outline" size={18} color="#3d67ee"/><Text style={{color:'#3d67ee', fontSize:11}}>Upload Image</Text></View>}
                     <View style={{position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3d67ee', borderRadius: 25, borderWidth: 1, borderColor: '#3d67ee', padding: 4}}><Ionicons name="camera" size={16} color="#ffffff" /></View>
                  </TouchableOpacity>
               </View>
               <View style={homeStyle.modalSections}>
                  <View style={homeStyle.leftModalSection}>
                     <View>
                        <Text style={homeStyle.labelStyle}>Full Name</Text>
                        <TextInput 
                          style={homeStyle.textInputStyle} 
                          value={newFullName} 
                          onChangeText={(text) => setNewFullName(text.replace(/[^a-zA-Z ,.'-]/g, ''))} // Validation
                          placeholder="Enter Full Name" 
                          placeholderTextColor="#a8a8a8"
                          maxLength={60}
                        />
                     </View>
                     <View>
                        <Text style={homeStyle.labelStyle}>Contact Number</Text>
                        <TextInput 
                          style={homeStyle.textInputStyle} 
                          value={newContact} 
                          onChangeText={(text) => setNewContact(text.replace(/[^0-9-]/g, ''))} // Validation
                          placeholder="Enter Contact" 
                          keyboardType="numeric" 
                          maxLength={13} 
                          placeholderTextColor="#a8a8a8"
                        />
                     </View>
                  </View>
                  <View style={homeStyle.rightModalSection}>
                     <View>
                        <Text style={homeStyle.labelStyle}>E-Mail</Text>
                        <TextInput 
                          style={homeStyle.textInputStyle} 
                          value={newEmail} 
                          onChangeText={setNewEmail} 
                          placeholder="Enter E-mail" 
                          placeholderTextColor="#a8a8a8"
                          maxLength={60}
                        />
                     </View>
                     <View style={{height: 80}}></View>
                  </View>
               </View>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 15 }}>
                  <TouchableOpacity style={[homeStyle.blackBtn, { flex: 1, alignItems: "center", padding: 20, backgroundColor: '#dad8d8' }]} onPress={() => handleCancel('create')}><Text style={{ color: '#0c0c0c', fontSize: 14, fontWeight: '600' }}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveAccount} style={{ flex: 1 }}><LinearGradient colors={['#3d67ee', '#0738D9', '#041E76']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[homeStyle.blackBtn, { alignItems: "center", gap: 10, padding: 20 }]}><Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Create Account</Text></LinearGradient></TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* EDIT PATIENT MODAL */}
      <Modal visible={editAccountVisible} transparent={true} animationType="fade" onRequestClose={() => handleCancel('edit')}>
         <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <View style={homeStyle.modalContainer}>
               <View style={{marginBottom: 20, alignItems: 'center'}}><Text style={{fontSize: 24, fontWeight: 'bold', fontFamily: 'Segoe UI'}}>Edit Patient Account</Text></View>
               <View style={{alignItems: 'center', marginBottom: 35}}>
                  <TouchableOpacity onPress={pickImage} style={[homeStyle.uploadBtn, {justifyContent:'center', alignItems:'center', position: 'relative'}]}>
                     {userImage ? <Image source={{uri: userImage}} style={{width:100, height:100, borderRadius:60, borderWidth:1, borderColor:'#3d67ee'}}/> : <View style={{alignItems: 'center'}}><Ionicons name="image-outline" size={18} color="#3d67ee"/><Text style={{color:'#3d67ee', fontSize:11}}>Upload Image</Text></View>}
                     <View style={{position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3d67ee', borderRadius: 25, borderWidth: 1, borderColor: '#3d67ee', padding: 4}}><Ionicons name="camera" size={16} color="#ffffff" /></View>
                  </TouchableOpacity>
               </View>
               <View style={homeStyle.modalSections}>
                  <View style={homeStyle.leftModalSection}>
                     <View><Text style={homeStyle.labelStyle}>Username</Text><TextInput style={[homeStyle.textInputStyle, {color: '#888'}]} value={newUsername} editable={false} /></View>
                     <View>
                        <Text style={homeStyle.labelStyle}>Full Name</Text>
                        <TextInput 
                          style={homeStyle.textInputStyle} 
                          value={newFullName} 
                          onChangeText={(text) => setNewFullName(text.replace(/[^a-zA-Z ,.'-]/g, ''))} // Validation
                          placeholder="Enter Full Name" 
                          placeholderTextColor="#a8a8a8"
                          maxLength={60}
                        />
                     </View>
                     <View>
                        <Text style={homeStyle.labelStyle}>Contact Number</Text>
                        <TextInput 
                          style={homeStyle.textInputStyle} 
                          value={newContact} 
                          onChangeText={(text) => setNewContact(text.replace(/[^0-9-]/g, ''))} // Validation
                          placeholder="Enter Contact" 
                          keyboardType="numeric" 
                          maxLength={15} 
                          placeholderTextColor="#a8a8a8"
                        />
                     </View>
                  </View>
                  <View style={homeStyle.rightModalSection}>
                     <Text style={homeStyle.labelStyle}>E-Mail</Text>
                     <TextInput 
                        style={homeStyle.textInputStyle} 
                        value={newEmail} 
                        onChangeText={setNewEmail} 
                        placeholder="Enter E-mail" 
                        placeholderTextColor="#a8a8a8"
                        maxLength={60}
                     />
                     <View style={{marginBottom: 18, marginTop: 20}}>
                        <Text style={[homeStyle.labelStyle, {marginBottom: 22}]}>Account Status</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                           <Switch value={newStatus === 'Active'} onValueChange={handleStatusToggle} thumbColor={newStatus === 'Active' ? '#3d67ee' : '#888'} trackColor={{ false: '#ccc', true: '#a9ff8f' }} style={{ marginLeft: 8, transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]}}/>
                           <Text style={{ fontWeight: 600, marginLeft: 18, color: newStatus === 'Active' ? '#2e9e0c' : '#888' }}> {newStatus} </Text>
                        </View>
                     </View>
                  </View>
               </View>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 15 }}>
                  <TouchableOpacity style={[homeStyle.blackBtn, { flex: 1, alignItems: "center", padding: 20, backgroundColor: '#dad8d8' }]} onPress={() => handleCancel('edit')}><Text style={{ color: '#0c0c0c', fontSize: 14, fontWeight: '600' }}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateAccount} style={{ flex: 1 }}><LinearGradient colors={['#3d67ee', '#0738D9', '#041E76']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[homeStyle.blackBtn, { alignItems: "center", gap: 10, padding: 20 }]}><Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Save Changes</Text></LinearGradient></TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* VIEW DETAILS & POPUP MODALS */}
      <Modal visible={viewAccountVisible} transparent={true} animationType="fade" onRequestClose={() => setViewAccountVisible(false)}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={homeStyle.modalContainer}>
            <View style={{marginBottom: 20, alignItems: 'center'}}><Text style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'Segoe UI' }}>Patient Details</Text></View>
            <View style={{ alignItems: 'center', marginBottom: 25 }}>
              {(selectedAccount.userImage || selectedAccount.userimage) ? (
                <Image source={{ uri: selectedAccount.userImage || selectedAccount.userimage }} style={{ width: 100, height: 100, borderRadius: 60, borderWidth: 1, borderColor: '#3d67ee' }} />
              ) : <Ionicons name="person-circle-outline" size={100} color="#3d67ee" />}
            </View>
            <View style={homeStyle.modalSections}>
              <View style={homeStyle.leftModalSection}>
                <Text style={homeStyle.labelStyle}>Full Name</Text><Text style={homeStyle.textInputStyle}>{selectedAccount.fullName || selectedAccount.fullname}</Text>
                <Text style={homeStyle.labelStyle}>Contact Number</Text><Text style={homeStyle.textInputStyle}>{selectedAccount.contactNumber || selectedAccount.contactnumber}</Text>
                <Text style={homeStyle.labelStyle}>Account Creation Date</Text><Text style={homeStyle.textInputStyle}>{selectedAccount.dateCreated || selectedAccount.datecreated || 'N/A'}</Text>
              </View>
              <View style={homeStyle.rightModalSection}>
                <Text style={homeStyle.labelStyle}>E-Mail</Text><Text style={homeStyle.textInputStyle}>{selectedAccount.email}</Text>
                <Text style={homeStyle.labelStyle}>Status</Text>
                <View style={[homeStyle.statusBadge, { marginTop: 10, alignItems: 'center' }, (selectedAccount.status === 'Active') ? homeStyle.activeBadge : homeStyle.inactiveBadge]}>
                  <Text style={[homeStyle.statusText, (selectedAccount.status === 'Active') && homeStyle.activeText]}>{selectedAccount.status || 'Active'}</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: "center", marginTop: 25 }}>
              <TouchableOpacity style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", padding: 20, backgroundColor: '#dad8d8'}]} onPress={() => setViewAccountVisible(false)}><Text style={{ color: '#0c0c0c', fontSize: 14, fontWeight: '600' }}>Close</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent={true} visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={{backgroundColor: 'white', padding: 25, borderRadius: 12, width: '80%', maxWidth: 350, alignItems: 'center', elevation: 5}}>
             <Ionicons name={modalConfig.type === 'success' ? "checkmark-circle-outline" : modalConfig.type === 'error' ? "close-circle-outline" : "alert-circle-outline"} size={55} color={modalConfig.type === 'success' ? "#2e9e0c" : modalConfig.type === 'error' ? "#d93025" : "#3d67ee"} />
             <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily: 'Segoe UI', color: 'black'}}>{modalConfig.title}</Text>
             {typeof modalConfig.message === 'string' ? <Text style={{textAlign: 'center', color: '#666', marginBottom: 25, fontSize: 14}}>{modalConfig.message}</Text> : <View style={{marginBottom: 25}}>{modalConfig.message}</View>}
             <View style={{flexDirection: 'row', gap: 15, width: '100%', justifyContent: 'center'}}>
                {modalConfig.showCancel && <TouchableOpacity onPress={() => setModalVisible(false)} style={{paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 100, alignItems: 'center'}}><Text style={{color: '#333', fontWeight: '600'}}>Cancel</Text></TouchableOpacity>}
                <TouchableOpacity onPress={() => { setModalVisible(false); if (modalConfig.onConfirm) modalConfig.onConfirm(); }} style={{paddingVertical: 10, paddingHorizontal: 20, backgroundColor: modalConfig.type === 'error' ? '#d93025' : '#3d67ee', borderRadius: 8, minWidth: 100, alignItems: 'center'}}>
                   <Text style={{color: 'white', fontWeight: '600'}}>{modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}