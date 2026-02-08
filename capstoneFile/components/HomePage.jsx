import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  //  BACKEND STATE & API CONFIGURATION
  // ==========================================
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // API URL Selection
  const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

  // ==========================================
  //  UI STATE (Popups, Dropdowns, etc)
  // ==========================================
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [editAccountVisible, setEditAccountVisible] = useState(false);
  const [viewAccountVisible, setViewAccountVisible] = useState(false);

  const [searchHovered, setSearchHovered] = useState(false);
  const [filterHovered, setFilterHovered] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const itemsPerPage = 8;

  // ==========================================
  //  FORM DATA STATE (For Create/Edit/View)
  // ==========================================
  const [editingId, setEditingId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState({});

  // Input Fields
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmpID, setNewEmpID] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('User');
  const [newDept, setNewDept] = useState('Marketing');
  const [newStatus, setNewStatus] = useState('Active'); // Stored as string 'Active'/'Disabled' to match your UI logic
  
  // Image Data
  const [userImage, setUserImage] = useState(null); // URI for display
  const [userImageBase64, setUserImageBase64] = useState(null); // Base64 for Backend

  // Filter State
  const [status, setStatus] = useState("defaultStatus");
  const [role, setRole] = useState("defaultRole");
  const [department, setDepartment] = useState("defaultDept");

  // ==========================================
  //  API FUNCTIONS
  // ==========================================

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      const msg = "Error fetching data";
      Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
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
    setNewEmpID(''); setNewEmail(''); setNewRole('User'); 
    setNewDept('Marketing'); setNewStatus('Active');
    setUserImage(null); setUserImageBase64(null); 
    setEditingId(null);
  };

  // ==========================================
  //  ACTION HANDLERS (Create, Edit, Image)
  // ==========================================

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Required for backend upload
    });

    if (!result.canceled) {
      setUserImage(result.assets[0].uri);
      setUserImageBase64(result.assets[0].base64);
    }
  };

  const handleSaveAccount = async () => {
    if (!newUsername || !newFullName) {
      const msg = "Please fill in Username and Full Name";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Error", msg);
      return;
    }

    const today = new Date();
    const dateCreated = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
        const successMsg = 'Registered Successfully!';
        Platform.OS === 'web' ? window.alert(successMsg) : Alert.alert('Success', successMsg);
        setAddAccountVisible(false);
        fetchAccounts();
        resetForm();
      } else {
        const errorMsg = data.error || 'Failed';
        Platform.OS === 'web' ? window.alert(errorMsg) : Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      Platform.OS === 'web' ? window.alert('Network Error') : Alert.alert('Error', 'Network Error');
    }
  };

  // Pre-fill data for Editing
  const openEditModal = (user) => {
    setEditingId(user.pk || user.id); // Adjust based on DB key
    setNewUsername(user.username || '');
    setNewFullName(user.fullName || user.fullname || '');
    setNewContact((user.contactNumber || user.contactnumber || '').toString());
    setNewEmpID((user.employeeID || user.employeeid || '').toString());
    setNewEmail(user.email || '');
    setNewRole(user.role || 'User');
    setNewDept(user.department || user.departmend || 'Marketing');
    setNewStatus(user.status || 'Active');

    const img = user.userImage || user.userimage;
    setUserImage(img);
    // Note: If image is a URL, base64 is null unless re-picked
    setUserImageBase64(null); 

    setEditAccountVisible(true);
  };

  const handleUpdateAccount = async () => {
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
          userImage: userImageBase64 // Will be null if image wasn't changed
        }),
      });

      if (res.ok) {
        Platform.OS === 'web' ? window.alert('Updated Successfully!') : Alert.alert('Success', 'Updated Successfully!');
        setEditAccountVisible(false);
        fetchAccounts();
        resetForm();
      } else {
        Platform.OS === 'web' ? window.alert('Update Failed') : Alert.alert('Error', 'Update Failed');
      }
    } catch (error) {
      Platform.OS === 'web' ? window.alert('Network Error') : Alert.alert('Error', 'Network Error');
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
    // Handle case variances in keys coming from DB
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

          {/* UPPER LAYER OF BODY (THE ONE W/ NOTIFICATIONS) */}

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

              {/* TOGGLE BTN FOR SEARCH */}
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
                />
              )}

              {/* TOGGLE BTN FOR FILTER */}
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
                    <Picker.Item label="User" value="User" />
                    <Picker.Item label="Moderator" value="Moderator" />
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

            {/* ADD ACCOUNT BTN */}
            <View style={[homeStyle.subTable2, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity style={homeStyle.blackBtn} onPress={() => { resetForm(); setAddAccountVisible(true); }}>
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Ionicons name="person-add" color="#ffffff" style={{ marginTop: 3 }} /> Add Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DATA TABLE */}

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

              {/* MAPS THE DATA FROM THE ARRAY */}
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
      <Modal visible={addAccountVisible} transparent={true} animationType="fade" onRequestClose={() => setAddAccountVisible(false)}>
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
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Username' placeholderTextColor={"#a8a8a8"} value={newUsername} onChangeText={setNewUsername} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Full Name</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Full Name' placeholderTextColor={"#a8a8a8"} value={newFullName} onChangeText={setNewFullName} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Contact Number</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Contact Number' placeholderTextColor={"#a8a8a8"} value={newContact} onChangeText={setNewContact} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Employee ID</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Employee ID' placeholderTextColor={"#a8a8a8"} value={newEmpID} onChangeText={setNewEmpID} />
                </View>

                {/* CANCEL BTN */}
                <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", marginTop: 25, padding: 20, backgroundColor: '#dad8d8'}]} onPress={() => setAddAccountVisible(false)}>
                    <Text style={{ color: '#0c0c0c', fontSize: 14, fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
              </View>

              {/* RIGHT COLUMN */}
              <View style={homeStyle.rightModalSection}>
                <View>
                  <Text style={homeStyle.labelStyle}>E-Mail</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter E-Mail' placeholderTextColor={"#a8a8a8"} value={newEmail} onChangeText={setNewEmail} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Role</Text>
                   <Picker selectedValue={newRole} onValueChange={setNewRole} style={homeStyle.createPickerStyle}>
                    <Picker.Item label="Admin" value="Admin" />
                    <Picker.Item label="User" value="User" />
                    <Picker.Item label="Moderator" value="Moderator" />
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
        onRequestClose={() => setEditAccountVisible(false)}
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
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Username' placeholderTextColor={"#a8a8a8"} value={newUsername} onChangeText={setNewUsername} />
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Full Name</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Full Name' placeholderTextColor={"#a8a8a8"} value={newFullName} onChangeText={setNewFullName}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Contact Number</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Contact Number' placeholderTextColor={"#a8a8a8"} value={newContact} onChangeText={setNewContact}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Employee ID</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Employee ID' placeholderTextColor={"#a8a8a8"} value={newEmpID} onChangeText={setNewEmpID}/>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity style={[homeStyle.blackBtn, {width: "50%", alignItems:"center", marginTop: 25, padding: 20, backgroundColor: '#dad8d8'}]} onPress={() => setEditAccountVisible(false)}>
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
                />

                <Text style={homeStyle.labelStyle}>Role</Text>
                <Picker style={homeStyle.createPickerStyle} selectedValue={newRole} onValueChange={setNewRole}>
                  <Picker.Item label="Admin" value="Admin" />
                  <Picker.Item label="User" value="User" />
                  <Picker.Item label="Moderator" value="Moderator" />
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
                    onValueChange={(val) => setNewStatus(val ? 'Active' : 'Disabled')}
                    thumbColor={newStatus === 'Active' ? '#3d67ee' : '#888'}
                    trackColor={{ false: '#ccc', true: '#a9ff8f' }}
                    style={{ marginLeft: 8, transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]}}
                    />
                  <Text style={{ fontWeight: 600, marginLeft: 18, color: newStatus === 'Active' ? '#2e9e0c' : '#888' }}> {newStatus} </Text>
                  </View>
                </View> 

                <TouchableOpacity onPress={handleUpdateAccount}>
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

    </View>
  );
}