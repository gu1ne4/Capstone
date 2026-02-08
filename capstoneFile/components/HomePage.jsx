import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, Platform, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';    
import * as ImagePicker from 'expo-image-picker';

export default function HomePage() {
  const ns = useNavigation();
  const route = useRoute();
  const isActive = route.name === 'Accounts';

  // ==========================================
  //  LOGGED IN USER STATE
  // ==========================================
  const [currentUser, setCurrentUser] = useState({
    fullName: 'Loading...',
    role: '',
    userImage: null
  });

  // ==========================================
  //  BACKEND STATE & API CONFIGURATION
  // ==========================================
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

  // ==========================================
  //  UI STATE
  // ==========================================
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [editAccountVisible, setEditAccountVisible] = useState(false);
  const [viewAccountVisible, setViewAccountVisible] = useState(false);

  // --- UNIFIED MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'info', 
    title: '',
    message: '', 
    onConfirm: null, 
    showCancel: false 
  });

  const [searchHovered, setSearchHovered] = useState(false);
  const [filterHovered, setFilterHovered] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const [page, setPage] = useState(0);
  const itemsPerPage = 8;

  // ==========================================
  //  FORM DATA STATE
  // ==========================================
  const [editingId, setEditingId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState({});

  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmpID, setNewEmpID] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Admin'); 
  const [newDept, setNewDept] = useState('Marketing');
  const [newStatus, setNewStatus] = useState('Active'); 
  
  const [userImage, setUserImage] = useState(null); 
  const [userImageBase64, setUserImageBase64] = useState(null); 

  const [status, setStatus] = useState("defaultStatus");
  const [role, setRole] = useState("defaultRole");
  const [department, setDepartment] = useState("defaultDept");

  // ==========================================
  //  HELPER: CUSTOM ALERT FUNCTION
  // ==========================================
  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setModalConfig({ type, title, message, onConfirm, showCancel });
    setModalVisible(true);
  };

  // ==========================================
  //  API FUNCTIONS
  // ==========================================

  const loadCurrentUser = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (session) {
        const user = JSON.parse(session);
        setCurrentUser(user);
      }
    } catch (error) {
      console.log('Error loading user session', error);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error', 'Failed to fetch account data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    loadCurrentUser();
  }, []);

  const generateRandomPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };

  const resetForm = () => {
    setNewUsername(''); setNewFullName(''); setNewContact(''); 
    setNewEmpID(''); setNewEmail(''); 
    setNewRole('Admin'); 
    setNewDept('Marketing'); setNewStatus('Active');
    setUserImage(null); setUserImageBase64(null); 
    setEditingId(null);
  };

  // ==========================================
  //  ACTION HANDLERS
  // ==========================================

  // --- NEW: HANDLE CANCEL WITH UNSAVED CHANGES CHECK ---
  const handleCancel = (mode) => {
    let hasUnsavedChanges = false;

    if (mode === 'create') {
      // Check if any field is populated
      hasUnsavedChanges = newUsername || newFullName || newContact || newEmpID || newEmail || userImage;
    } else if (mode === 'edit') {
      // Find the original account to compare against
      const original = accounts.find(a => (a.pk === editingId || a.id === editingId));
      if (original) {
        // Check if current form values differ from original values
        const orgName = original.fullName || original.fullname || '';
        const orgContact = (original.contactNumber || original.contactnumber || '').toString();
        const orgEmpID = (original.employeeID || original.employeeid || '').toString();
        const orgRole = original.role || '';
        const orgDept = original.department || original.departmend || '';
        const orgStatus = original.status || 'Active';

        if (
          newUsername !== original.username ||
          newFullName !== orgName ||
          newContact !== orgContact ||
          newEmpID !== orgEmpID ||
          newEmail !== original.email ||
          newRole !== orgRole ||
          newDept !== orgDept ||
          newStatus !== orgStatus ||
          userImage !== (original.userImage || original.userimage)
        ) {
          hasUnsavedChanges = true;
        }
      }
    }

    if (hasUnsavedChanges) {
      showAlert('confirm', 'Unsaved Changes', 'You have unsaved changes. Are you sure you want to discard them?', () => {
        setAddAccountVisible(false);
        setEditAccountVisible(false);
        resetForm();
      }, true);
    } else {
      setAddAccountVisible(false);
      setEditAccountVisible(false);
      resetForm();
    }
  };

  const handleStatusToggle = (value) => {
    const nextStatus = value ? 'Active' : 'Disabled';
    const messageJSX = (
      <Text>
        Are you sure you want to <Text style={{fontWeight: 'bold', color: nextStatus === 'Active' ? 'green' : 'red'}}>{nextStatus === 'Active' ? 'ACTIVATE' : 'DEACTIVATE'}</Text> this account?
      </Text>
    );

    showAlert('confirm', 'Confirm Status Change', messageJSX, () => {
      setNewStatus(nextStatus);
    }, true);
  };

  const handleSavePress = () => {
    showAlert('confirm', 'Save Changes', 'Are you sure you want to save changes to this account?', () => {
      handleUpdateAccount();
    }, true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert('error', 'Permission Denied', 'Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, 
    });

    if (!result.canceled) {
      setUserImage(result.assets[0].uri);
      setUserImageBase64(result.assets[0].base64);
    }
  };

  const handleSaveAccount = async () => {
    // 1. Check for empty fields
    if (!newUsername || !newFullName || !newContact || !newEmpID || !newEmail || !newRole || !newDept) {
      showAlert('error', 'Missing Information', 'Please fill in all required fields.');
      return;
    }

    // 2. NEW: Check Minimum Lengths
    if (newUsername.length < 4) {
      showAlert('error', 'Invalid Input', 'Username must be at least 4 characters.');
      return;
    }
    if (newFullName.length < 5) {
      showAlert('error', 'Invalid Input', 'Full Name must be at least 5 characters.');
      return;
    }
    if (newContact.length < 7) {
      showAlert('error', 'Invalid Input', 'Contact Number must be at least 7 digits.');
      return;
    }
    if (newEmail.length < 6) {
      showAlert('error', 'Invalid Input', 'Email must be at least 6 characters.');
      return;
    }

    // 2. NEW: Check for Duplicate Username or Employee ID
    const isDuplicate = accounts.some(acc => 
      acc.username.toLowerCase() === newUsername.toLowerCase() || 
      (acc.employeeID || acc.employeeid).toString() === newEmpID.toString()
    );

    if (isDuplicate) {
      showAlert('error', 'Duplicate Entry', 'Username or Employee ID already exists. Please verify your information.');
      return;
    }

    const today = new Date();
    const dateCreated = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    const generatedPassword = generateRandomPassword();

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: generatedPassword,
          fullName: newFullName,
          contactNumber: newContact,
          email: newEmail,
          role: newRole,
          department: newDept,
          employeeID: newEmpID,
          userImage: userImageBase64,
          status: newStatus,
          dateCreated: dateCreated
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAddAccountVisible(false);
        showAlert('success', 'Success', 'Account Registered Successfully!', () => {
          fetchAccounts();
          resetForm();
        });
      } else {
        showAlert('error', 'Registration Failed', data.error || 'Failed to create account.');
      }
    } catch (error) {
      showAlert('error', 'Network Error', 'Could not connect to the server.');
    }
  };

  const openEditModal = (user) => {
    setEditingId(user.pk || user.id); 
    setNewUsername(user.username || '');
    setNewFullName(user.fullName || user.fullname || '');
    setNewContact((user.contactNumber || user.contactnumber || '').toString());
    setNewEmpID((user.employeeID || user.employeeid || '').toString());
    setNewEmail(user.email || '');

    const validRoles = ['Admin', 'User', 'Moderator', 'Veterinarian', 'Receptionist'];
    const dbRole = user.role || 'Admin';
    const matchedRole = validRoles.find(r => r.toLowerCase() === dbRole.toLowerCase()) || 'Admin';
    setNewRole(matchedRole);

    setNewDept(user.department || user.departmend || 'Marketing');
    setNewStatus(user.status || 'Active');

    const img = user.userImage || user.userimage;
    setUserImage(img);
    setUserImageBase64(null); 

    setEditAccountVisible(true);
  };

  const handleUpdateAccount = async () => {
    // 1. NEW: Check Minimum Lengths (Must be done first)lk
    if (newUsername.length < 4) {
      showAlert('error', 'Invalid Input', 'Username must be at least 4 characters.');
      return;
    }
    if (newFullName.length < 5) {
      showAlert('error', 'Invalid Input', 'Full Name must be at least 5 characters.');
      return;
    }
    if (newContact.length < 7) {
      showAlert('error', 'Invalid Input', 'Contact Number must be at least 7 digits.');
      return;
    }
    if (newEmail.length < 6) {
      showAlert('error', 'Invalid Input', 'Email must be at least 6 characters.');
      return;
    }

    // 2. NEW: Check for Duplicate Username or Employee ID (excluding current user)
    const isDuplicate = accounts.some(acc => 
      (acc.pk !== editingId && acc.id !== editingId) && // Skip the user currently being edited
      (acc.username.toLowerCase() === newUsername.toLowerCase() || 
       (acc.employeeID || acc.employeeid).toString() === newEmpID.toString())
    );

    if (isDuplicate) {
      showAlert('error', 'Duplicate Entry', 'Username or Employee ID already exists. Please check your data.');
      return;
    }

    // 3. Perform the Update
    try {
      const res = await fetch(`${API_URL}/accounts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          fullName: newFullName,
          contactNumber: newContact,
          email: newEmail,
          role: newRole,
          department: newDept,
          employeeID: newEmpID,
          status: newStatus,
          userImage: userImageBase64 
        }),
      });

      if (res.ok) {
        setEditAccountVisible(false);
        showAlert('success', 'Success', 'Account Updated Successfully!', () => {
          fetchAccounts();
          resetForm();
        });
      } else {
        showAlert('error', 'Update Failed', 'Failed to update account information.');
      }
    } catch (error) {
      showAlert('error', 'Network Error', 'Could not connect to the server.');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedAccount(user);
    setViewAccountVisible(true);
  };

  // ==========================================
  //  FILTERING LOGIC
  // ==========================================

  const noMatchFilters =
    status === "defaultStatus" &&
    role === "defaultRole" &&
    department === "defaultDept";

  const filteredUsers = accounts.filter(user => {
    const uName = (user.fullName || user.fullname || user.username || '').toLowerCase();
    const uEmail = (user.email || '').toLowerCase();
    const uDept = (user.department || user.departmend || '').toLowerCase();
    const uStatus = user.status || 'Active';
    const uRole = user.role || '';

    const matchesSearch =
      uName.includes(searchQuery.toLowerCase()) ||
      uEmail.includes(searchQuery.toLowerCase());

    const matchesStatus = status !== "defaultStatus" ? uStatus === status : true;
    const matchesRole = role !== "defaultRole" ? uRole === role : true;
    const matchesDept = department !== "defaultDept" ? uDept.includes(department.toLowerCase()) : true;

    return matchesSearch && matchesStatus && matchesRole && matchesDept;
  });


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
                source={currentUser.userImage ? { uri: currentUser.userImage } : require('../assets/userImg.jpg')} 
                style={{ width: 35, height: 35, borderRadius: 25, marginTop: 2 }}
              />
              <View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                  {currentUser.fullName || "User"}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>
                  {currentUser.role || "Role"}
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ color: 'rgba(255, 255, 255, 0.83)', fontSize: 11, fontStyle: 'italic', marginLeft: 5, marginTop: 20 }}>Overview</Text>

          {/* NAVIGATION MENU */}
          <View style={[homeStyle.glassContainer, {}]}>
            <View style={{marginTop: 8}} >
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Home')}}>
                <Ionicons name="home-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Home</Text>
              </TouchableOpacity>
            </View> 

            <View style={[isActive ? homeStyle.selectedGlass : null]}>
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
                    <View style={[isActive ? homeStyle.selectedGlass : null, {width: '100%'}]}>
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

            <View>
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


      {/* BODY */}

      <View style={homeStyle.bodyContainer}>

        <View style={homeStyle.topContainer}>
          <View style={[homeStyle.subTopContainer]}>
            <Ionicons name="people-outline" size={23} color="#3d67ee" style={{ marginTop: 4 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Account Overview / Employees</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'center', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity onPress={fetchAccounts}>
              <Ionicons name="notifications" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TABLE CONTAINER */}

        <View style={homeStyle.tableContainer}>
          <View style={homeStyle.tableLayer1}>
            <View style={[homeStyle.subTable1, { flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }]}>

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
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={(text) => {setSearchQuery(text); setPage(0);}}
                  style={homeStyle.searchVisible}
                  maxLength={60} 
                />
              )}

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
                  <Picker selectedValue={status} style={homeStyle.pickerStyle} onValueChange={(val) => {setStatus(val); setPage(0);}}>
                    <Picker.Item label="Status" value="defaultStatus" color="#a8a8a8" />
                    <Picker.Item label="Active" value="Active" />
                    <Picker.Item label="Disabled" value="Disabled" />
                  </Picker>

                  <Picker selectedValue={role} style={[homeStyle.pickerStyle, { marginLeft: 10, width: 120 }]} onValueChange={(val) => {setRole(val); setPage(0);}}>
                    <Picker.Item label="Role" value="defaultRole" color="#a8a8a8" />
                    <Picker.Item label="Admin" value="Admin" />
                    <Picker.Item label="Veterinarian" value="Veterinarian" />
                    <Picker.Item label="Receptionist" value="Receptionist" />
                  </Picker>

                  <Picker selectedValue={department} style={[homeStyle.pickerStyle, { marginLeft: 10, width: 150 }]} onValueChange={(val) => {setDepartment(val); setPage(0);}}>
                    <Picker.Item label="Department" value="defaultDept" color="#a8a8a8" />
                    <Picker.Item label="Human Resources" value="Human Resources" />
                    <Picker.Item label="Marketing" value="Marketing" />
                    <Picker.Item label="Sales" value="Sales" />
                    <Picker.Item label="IT" value="IT" />
                  </Picker>

                  <TouchableOpacity
                    onPress={() => {
                      setStatus("defaultStatus");
                      setRole("defaultRole");
                      setDepartment("defaultDept");
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
              <TouchableOpacity style={homeStyle.blackBtn} onPress={() => { resetForm(); setAddAccountVisible(true); }}>
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Ionicons name="person-add" color="#ffffff" style={{ marginTop: 3 }} /> Add Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
             <ActivityIndicator size="large" color="#3d67ee" style={{marginTop: 50}} />
          ) : (
            <DataTable>
              <DataTable.Header style={homeStyle.tableHeader}>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 3 }}>Name</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.1 }}>Role</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 2 }}>Department</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 2 }}>Contact Number</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 2.5 }}>E-Mail</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.5 }}>Status</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex:  1}}>View Details</DataTable.Title>
                <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'flex-end', flex:  1 }}>Edit</DataTable.Title>
              </DataTable.Header>

              {filteredUsers.length > 0 ? (
                filteredUsers.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map(user => {
                  const uStatus = user.status || 'Active';
                  const uImage = user.userImage || user.userimage;
                  const uName = user.fullName || user.fullname || user.username;
                  const uContact = user.contactNumber || user.contactnumber;
                  const uDept = user.department || user.departmend;

                  return (
                    <DataTable.Row key={user.pk || user.id || Math.random()}>
                      <DataTable.Cell style={{ flex: 3 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image 
                             source={uImage ? { uri: uImage } : require('../assets/userImg.jpg')} 
                             style={{ width: 30, height: 30, borderRadius: 12, marginRight: 20 }} 
                          />
                          <Text style={homeStyle.tableFont}>{uName}</Text>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center', flex: 1.1 }}>{user.role}</DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center',flex: 2 }}>{uDept}</DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center',flex: 2 }}>{uContact}</DataTable.Cell>
                      <DataTable.Cell textStyle={homeStyle.tableFont} style={{ justifyContent: 'center',flex: 2.5 }}>{user.email}</DataTable.Cell>
                      <DataTable.Cell style={{ justifyContent: 'center', flex: 1.5 }}>
                        <View
                          style={[
                            homeStyle.statusBadge,
                            uStatus === 'Active' && homeStyle.activeBadge,
                            uStatus === 'Disabled' && homeStyle.inactiveBadge,
                            { marginTop: 10, alignItems: 'center' }
                          ]}
                        >
                          <Text style={[homeStyle.statusText, uStatus === 'Active' && homeStyle.activeText]}>
                            {uStatus}
                          </Text>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ justifyContent: 'center', flex: 1 }}>
                        <TouchableOpacity onPress={() => handleViewDetails(user)}>
                          <Ionicons name="eye" size={15} color="#3d67ee" />
                        </TouchableOpacity>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ justifyContent: 'flex-end' }} >
                        <TouchableOpacity onPress={() => openEditModal(user)}>
                          <Ionicons name="pencil-sharp" size={15} color="#3d67ee" />
                        </TouchableOpacity>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })
              ) : (
                <DataTable.Row>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Text style={{ color: '#888', textAlign: 'center', width: '100%' }}>
                      {noMatchFilters ? "Showing all users (no filters applied)" : "No users found"}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}

              <DataTable.Pagination
                page={page}
                numberOfPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                onPageChange={(newPage) => setPage(newPage)}
                label={`${page + 1} of ${Math.ceil(filteredUsers.length / itemsPerPage)}`}
                showFastPaginationControls
                optionsPerPage={[8]}
                itemsPerPage={itemsPerPage}
              />
            </DataTable>
          )}
        </View>
      </View>

      {/* ADD ACCOUNT OVERLAY */}
      <Modal visible={addAccountVisible} transparent={true} animationType="fade" onRequestClose={() => handleCancel('create')}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={homeStyle.modalContainer}>
            <View style={{marginBottom: 20, alignItems: 'center'}}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'Segoe UI' }}>Create Account</Text>
            </View>

            {/* UPLOAD IMAGE BUTTON */}
            <View style={{ alignItems: 'center', marginBottom: 35 }}> 
              <TouchableOpacity 
                style={[ homeStyle.uploadBtn, { justifyContent: 'center', alignItems: 'center', position: 'relative' } ]} 
                onPress={pickImage} 
              >
                {userImage ? (
                  <Image 
                    source={{ uri: userImage }} 
                    style={{ width: 100, height: 100, borderRadius: 60, borderWidth: 1, borderColor: '#3d67ee' }} 
                  />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="image-outline" size={18} color="#3d67ee" style={{ marginTop: 2 }} />
                    <Text style={{ color: '#3d67ee', fontSize: 11 }}>Upload Image</Text>
                  </View>
                )}

                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3d67ee', borderRadius: 25, borderWidth: 1, borderColor: '#3d67ee', padding: 4 }}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* FORM INPUTS */}
            <View style={[homeStyle.modalSections]}>
              <View style={homeStyle.leftModalSection}>
                <View>
                  <Text style={homeStyle.labelStyle}>Username</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Username' maxLength={30}  placeholderTextColor={"#a8a8a8"} value={newUsername} onChangeText={setNewUsername} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Full Name</Text>
                  {/* RESTRICTED: Letters, Spaces, Commas, Periods, Quotes, Dashes Only */}
                  <TextInput 
                    style={homeStyle.textInputStyle} 
                    placeholder='Enter Full Name'
                    maxLength={60} 
                    placeholderTextColor={"#a8a8a8"} 
                    value={newFullName} 
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^a-zA-Z ,.'-]/g, '');
                      setNewFullName(cleaned);
                    }} 
                  />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Contact Number</Text>
                  {/* RESTRICTED: INTEGER AND DASH ONLY */}
                  <TextInput 
                    style={homeStyle.textInputStyle} 
                    placeholder='Enter Contact Number' 
                    maxLength={13} 
                    placeholderTextColor={"#a8a8a8"} 
                    value={newContact} 
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9-]/g, '');
                      setNewContact(cleaned);
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Employee ID</Text>
                  {/* RESTRICTED: INTEGER ONLY */}
                  <TextInput 
                    style={homeStyle.textInputStyle} 
                    placeholder='Enter Employee ID' 
                    maxLength={15} 
                    placeholderTextColor={"#a8a8a8"} 
                    value={newEmpID} 
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setNewEmpID(cleaned);
                    }}
                    keyboardType="numeric"
                  />
                </View>

                {/* CANCEL BTN */}
                <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", marginTop: 25, padding: 20, backgroundColor: '#dad8d8'}]} onPress={() => handleCancel('create')}>
                    <Text style={{ color: '#0c0c0c', fontSize: 14, fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
              </View>

              {/* RIGHT COLUMN */}
              <View style={homeStyle.rightModalSection}>
                <View>
                  <Text style={homeStyle.labelStyle}>E-Mail</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter E-Mail' maxLength={60} placeholderTextColor={"#a8a8a8"} value={newEmail} onChangeText={setNewEmail} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Role</Text>
                   <Picker 
                    selectedValue={newRole} 
                    onValueChange={setNewRole} 
                    style={homeStyle.createPickerStyle}
                   >
                    <Picker.Item label="Admin" value="Admin" />
                    <Picker.Item label="Veterinarian" value="Veterinarian" />
                    <Picker.Item label="Receptionist" value="Receptionist" />
                  </Picker>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Department</Text>
                   <Picker selectedValue={newDept} onValueChange={setNewDept} style={homeStyle.createPickerStyle}>
                    <Picker.Item label="Marketing" value="Marketing" />
                    <Picker.Item label="Sales" value="Sales" />
                    <Picker.Item label="IT" value="IT" />
                    <Picker.Item label="Human Resources" value="Human Resources" />
                  </Picker>
                </View>

                <View style={{ height: 80 }}></View> 

                {/* CREATE ACCOUNT BTN */}
                <View>
                  <TouchableOpacity onPress={handleSaveAccount}>
                    <LinearGradient
                    colors={['#3d67ee', '#0738D9', '#041E76']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", marginTop: 28, gap: 10, padding: 20}]}
                  >
                  <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Create Account</Text>  
                  </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>        
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT ACCOUNT OVERLAY */}
      <Modal
        visible={editAccountVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => handleCancel('edit')}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={homeStyle.modalContainer}>
            <View style={{marginBottom: 20, alignItems: 'center'}}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'Segoe UI' }}>Edit Account</Text>
            </View>

            {/* UPLOAD IMG BTN */}
            <View style={{ alignItems: 'center', marginBottom: 35 }}> 
              <TouchableOpacity 
                style={[ homeStyle.uploadBtn, { justifyContent: 'center', alignItems: 'center', position: 'relative' } ]} 
                onPress={pickImage} 
              >
                {userImage ? (
                  <Image 
                    source={{ uri: userImage }} 
                    style={{ width: 100, height: 100, borderRadius: 60, borderWidth: 1, borderColor: '#3d67ee' }} 
                  />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="image-outline" size={18} color="#3d67ee" style={{ marginTop: 2 }} />
                    <Text style={{ color: '#3d67ee', fontSize: 11 }}>Upload Image</Text>
                  </View>
                )}
                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3d67ee', borderRadius: 25, borderWidth: 1, borderColor: '#3d67ee', padding: 4 }}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* LEFT COLUMN */}
            <View style={homeStyle.modalSections}>
              <View style={homeStyle.leftModalSection}>
                <View>
                  <Text style={homeStyle.labelStyle}>Username</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Username' maxLength={30} placeholderTextColor={"#a8a8a8"} value={newUsername} onChangeText={setNewUsername} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Full Name</Text>
                  {/* RESTRICTED: Letters, Spaces, Commas, Periods, Quotes, Dashes Only */}
                  <TextInput 
                    style={homeStyle.textInputStyle} 
                    placeholder='Enter Full Name' 
                    maxLength={60} 
                    placeholderTextColor={"#a8a8a8"} 
                    value={newFullName} 
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^a-zA-Z ,.'-]/g, '');
                      setNewFullName(cleaned);
                    }}
                  />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Contact Number</Text>
                  {/* RESTRICTED: INTEGER AND DASH ONLY */}
                  <TextInput 
                    style={homeStyle.textInputStyle} 
                    placeholder='Enter Contact Number' 
                    maxLength={13} 
                    placeholderTextColor={"#a8a8a8"} 
                    value={newContact} 
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9-]/g, '');
                      setNewContact(cleaned);
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Employee ID</Text>
                  {/* RESTRICTED: INTEGER ONLY */}
                  <TextInput 
                    style={homeStyle.textInputStyle} 
                    placeholder='Enter Employee ID' 
                    maxLength={15} 
                    placeholderTextColor={"#a8a8a8"} 
                    value={newEmpID} 
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setNewEmpID(cleaned);
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", marginTop: 25, padding: 20, backgroundColor: '#dad8d8'}]} onPress={() => handleCancel('edit')}>
                    <Text style={{ color: '#0c0c0c', fontSize: 14, fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
              </View>

              {/* RIGHT COLUMN */}
              <View style={homeStyle.rightModalSection}>
                <Text style={homeStyle.labelStyle}>E-Mail</Text>
                <TextInput 
                  style={homeStyle.textInputStyle} 
                  placeholder="Enter E-Mail" 
                  placeholderTextColor="#a8a8a8" 
                  value={newEmail} onChangeText={setNewEmail}
                  maxLength={60}
                />

                <Text style={homeStyle.labelStyle}>Role</Text>
                <Picker 
                  style={homeStyle.createPickerStyle} 
                  selectedValue={newRole} 
                  onValueChange={setNewRole} 
                >
                  <Picker.Item label="Admin" value="Admin" />
                  <Picker.Item label="Veterinarian" value="Veterinarian" />
                  <Picker.Item label="Receptionist" value="Receptionist" />
                </Picker>

                <Text style={homeStyle.labelStyle}>Department</Text>
                <Picker style={homeStyle.createPickerStyle} selectedValue={newDept} onValueChange={setNewDept}>
                  <Picker.Item label="Marketing" value="Marketing" />
                  <Picker.Item label="Sales" value="Sales" />
                  <Picker.Item label="IT" value="IT" />
                  <Picker.Item label="Human Resources" value="Human Resources" />
                </Picker>

                <View style={{marginBottom: 18}}>
                  <Text style={[homeStyle.labelStyle, {marginBottom: 22}]}>Account Status</Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <Switch
                    value={newStatus === 'Active'}   
                    onValueChange={handleStatusToggle} 
                    thumbColor={newStatus === 'Active' ? '#3d67ee' : '#888'}
                    trackColor={{ false: '#ccc', true: '#a9ff8f' }}
                    style={{ marginLeft: 8, transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]}}
                    />
                  <Text style={{ fontWeight: 600, marginLeft: 18, color: newStatus === 'Active' ? '#2e9e0c' : '#888' }}> {newStatus} </Text>
                  </View>
                </View> 

                <TouchableOpacity onPress={handleSavePress}>
                  <LinearGradient
                    colors={['#3d67ee', '#0738D9', '#041E76']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", marginTop: 28, gap: 10, padding: 20}]}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Save Changes</Text>  
                  </LinearGradient>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>
      </Modal>

      {/* VIEW ACCOUNT OVERLAY */}
      <Modal
        visible={viewAccountVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewAccountVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={homeStyle.modalContainer}>
            <View style={{marginBottom: 20, alignItems: 'center'}}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'Segoe UI' }}>Account Details</Text>
            </View>

            {/* Profile image */}
            <View style={{ alignItems: 'center', marginBottom: 25 }}>
              {(selectedAccount.userImage || selectedAccount.userimage) ? (
                <Image 
                  source={{ uri: selectedAccount.userImage || selectedAccount.userimage }} 
                  style={{ width: 100, height: 100, borderRadius: 60, borderWidth: 1, borderColor: '#3d67ee' }} 
                />
              ) : (
                <Ionicons name="person-circle-outline" size={100} color="#3d67ee" />
              )}
            </View>

            {/* Details section */}

            <View style={homeStyle.modalSections}>
              <View style={homeStyle.leftModalSection}>
                <Text style={homeStyle.labelStyle}>Full Name</Text>
                <Text style={homeStyle.textInputStyle}>{selectedAccount.fullName || selectedAccount.fullname}</Text>

                <Text style={homeStyle.labelStyle}>Contact Number</Text>
                <Text style={homeStyle.textInputStyle}>{selectedAccount.contactNumber || selectedAccount.contactnumber}</Text>

                <Text style={homeStyle.labelStyle}>Employee ID</Text>
                <Text style={homeStyle.textInputStyle}>{selectedAccount.employeeID || selectedAccount.employeeid}</Text>

                <Text style={homeStyle.labelStyle}>Account Creation Date</Text>
                <Text style={homeStyle.textInputStyle}>{selectedAccount.dateCreated || selectedAccount.datecreated || 'N/A'}</Text>
                
              </View>

              <View style={homeStyle.rightModalSection}>
                <Text style={homeStyle.labelStyle}>E-Mail</Text>
                <Text style={homeStyle.textInputStyle}>{selectedAccount.email}</Text>

                <Text style={homeStyle.labelStyle}>Role</Text>
                <Text style={homeStyle.textInputStyle}>{selectedAccount.role}</Text>

                <Text style={homeStyle.labelStyle}>Department</Text>
                <Text style={homeStyle.textInputStyle}>{selectedAccount.department || selectedAccount.departmend}</Text>

                <Text style={homeStyle.labelStyle}>Status</Text>
                <View
                  style={[
                    homeStyle.statusBadge,
                    { marginTop: 10, alignItems: 'center' },
                    (selectedAccount.status === 'Active') ? homeStyle.activeBadge : homeStyle.inactiveBadge
                  ]}
                >
                  <Text style={[homeStyle.statusText, (selectedAccount.status === 'Active') && homeStyle.activeText]}>
                    {selectedAccount.status || 'Active'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Close button */}
            <View style={{ alignItems: "center", marginTop: 25 }}>
              <TouchableOpacity 
                style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", padding: 20, backgroundColor: '#dad8d8'}]} 
                onPress={() => setViewAccountVisible(false)}
              >
                <Text style={{ color: '#0c0c0c', fontSize: 14, fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* UNIFIED CUSTOM ALERT MODAL */}
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