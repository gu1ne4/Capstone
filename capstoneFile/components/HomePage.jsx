import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   
import * as ImagePicker from 'expo-image-picker';



export default function HomePage() {

  {/* Pop-Up Overlays for Search, FIlter, Search and etc. */}

  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [editAccountVisible, setEditAccountVisible] = useState(false);
  const [viewAccountVisible, setViewAccountVisible] = useState(false);

  {/* FOR FILTERS */}

  const [status, setStatus] = useState("defaultStatus");
  const [role, setRole] = useState("defaultRole");
  const [department, setDepartment] = useState("defaultDept");

  const noMatchFilters =
    status === "defaultStatus" &&
    role === "defaultRole" &&
    department === "defaultDept";

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = status !== "defaultStatus" ? user.status === status : true;
    const matchesRole = role !== "defaultRole" ? user.role === role : true;
    const matchesDept = department !== "defaultDept" ? user.department.toLowerCase().includes(department.toLowerCase()) : true;

    return matchesSearch && matchesStatus && matchesRole && matchesDept;

  });

  {/* USER IMAGE */}

  const [userImage, setUserImage] = useState(null);

  {/* This is for Table Pages */}

  const [page, setPage] = useState(0);
  const itemsPerPage = 8;

  {/* Sample Data */}

  const [users, setUsers] = useState([
    { id: 1, name: 'Carl Johnson', role: 'Admin', department: 'Marketing', contact: '123-456-7890', email: 'carl@example.com', status: 'Active' },
    { id: 2, name: 'Alice Smith', role: 'User', department: 'Sales', contact: '987-654-3210', email: 'alice@example.com', status: 'Disabled' },
    { id: 3, name: 'Bob Brown', role: 'Moderator', department: 'Human Resources', contact: '555-555-5555', email: 'bob@example.com', status: 'Active' },
    { id: 4, name: 'Charlie Davis', role: 'Admin', department: 'IT', contact: '111-222-3333', email: 'charlie@example.com', status: 'Active' },
  ]);

  {/* FUNCTIONALITY FOR CREATE ACCOUNT */}

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState('Active');

  const handleSaveAccount = () => {
    const newUser = {
      id: users.length + 1,
      name: newName,
      role: newRole,
      department: newDept,
      contact: newContact,
      email: newEmail,
      status: newStatus,
    };

    setUsers([...users, newUser]);
    setAddAccountVisible(false);
    setNewName('');
    setNewRole('');
    setNewDept('');
    setNewContact('');
    setNewEmail('');
    setNewStatus('');
  };

  {/* ALLOWS USER TO UPLOAD IMAGES */}

  const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert("Permission to access camera roll is required!");
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 4],
    quality: 1,
  });

  if (!result.canceled) {
    setUserImage(result.assets[0].uri);
  }
};


  return (
    <View style={homeStyle.biContainer}>

      {/* NAVBAR */}
        
      <View style={homeStyle.navbarContainer}>
        <Image source={require('../assets/AgsikapBG-Gif.gif')} style={{width: '100%', height: '100%', borderRadius: 20}} />
        <View style={homeStyle.navBody}>
          <Image source={require('../assets/AgsikapLogo-Temp.png')} style={{width: '10%', height: '10%'}} resizeMode="contain"/>
          <Text style={homeStyle.brandFont}>Agsikap</Text>
        </View>
      </View>

      {/* BODY */}

      <View style={homeStyle.bodyContainer}>

        <View style={homeStyle.topContainer}>

          {/* UPPER LAYER OF BODY (THE ONE W/ NOTIFICATIONS) */}

          <View style={[homeStyle.subTopContainer]}>
            <Ionicons name="people-outline" size={23} color="#3d67ee" style={{ marginTop: 4 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>User List</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'center', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity>
              <Ionicons name="notifications" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TABLE CONTAINER */}

        <View style={homeStyle.tableContainer}>
          <View style={homeStyle.tableLayer1}>
            <View style={[homeStyle.subTable1, { flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }]}>

              {/* TOGGLE BTN FOR SEARCH AND HOW TO MAKE THE OVERLAY POP-UP */}

              <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
                <Ionicons name="search-sharp" size={25} color={searchVisible ? "#afccf8" : "#3d67ee"} style={{ marginTop: 3 }} />
              </TouchableOpacity>

              {searchVisible && (
                <TextInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={homeStyle.searchVisible}
                />
              )}

              {/* TOGGLE BTN FOR FILTER AND HOW TO MAKE THE OVERLAY POP-UP */}

              <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => setFilterVisible(!filterVisible)}>
                <Ionicons name="filter-sharp" size={25} color={filterVisible ? "#afccf8" : "#3d67ee"} style={{ marginTop: 3 }} />
              </TouchableOpacity>

              {filterVisible && (
                <View style={{ flexDirection: 'row', marginLeft: 5, flexWrap: 'wrap', zIndex: 2 }}>
                 
                  <Picker selectedValue={status} style={homeStyle.pickerStyle} onValueChange={setStatus}>
                    {status === "defaultStatus" && (
                      <Picker.Item label="Status" value="defaultStatus" color="#a8a8a8" />
                    )}
                    <Picker.Item label="Active" value="Active" />
                    <Picker.Item label="Disabled" value="Disabled" />
                  </Picker>

                  <Picker selectedValue={role} style={[homeStyle.pickerStyle, { marginLeft: 10, width: 120 }]} onValueChange={setRole}>
                    {role === "defaultRole" && (
                      <Picker.Item label="Role" value="defaultRole" color="#a8a8a8" />
                    )}
                    <Picker.Item label="Admin" value="Admin" />
                    <Picker.Item label="User" value="User" />
                    <Picker.Item label="Moderator" value="Moderator" />
                  </Picker>

                  <Picker selectedValue={department} style={[homeStyle.pickerStyle, { marginLeft: 10, width: 150 }]} onValueChange={setDepartment}>
                    {department === "defaultDept" && (
                      <Picker.Item label="Department" value="defaultDept" color="#a8a8a8" />
                    )}
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
              <TouchableOpacity style={homeStyle.blackBtn} onPress={() => setAddAccountVisible(true)}>
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Ionicons name="person-add" color="#ffffff" style={{ marginTop: 3 }} /> Add Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DATA TABLE */}

          <DataTable>
            <DataTable.Header style={homeStyle.tableHeader}>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 3 }}>Name</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 1.5 }}>Role</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 2 }}>Department</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 2 }}>Contact Number</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 2 }}>E-Mail</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 1.5 }}>Status</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex:  1}}>View Details</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'flex-end' }}>Edit</DataTable.Title>
            </DataTable.Header>

            {/* MAPS THE DATA FROM THE ARRAY */}

            {filteredUsers.length > 0 ? (
              filteredUsers.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map(user => (
                <DataTable.Row key={user.id}>
                  <DataTable.Cell style={{ flex: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image source={require('../assets/userImg.jpg')} style={{ width: 30, height: 30, borderRadius: 12, marginRight: 20 }} />
                      <Text style={homeStyle.tableFont}>{user.name}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell textStyle={homeStyle.tableFont} style={{ flex: 1.5 }}>{user.role}</DataTable.Cell>
                  <DataTable.Cell textStyle={homeStyle.tableFont} style={{ flex: 2 }}>{user.department}</DataTable.Cell>
                  <DataTable.Cell textStyle={homeStyle.tableFont} style={{ flex: 2 }}>{user.contact}</DataTable.Cell>
                  <DataTable.Cell textStyle={homeStyle.tableFont} style={{ flex: 2 }}>{user.email}</DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1.5 }}>
                    <View
                      style={[
                        homeStyle.statusBadge,
                        user.status === 'Active' && homeStyle.activeBadge,
                        user.status === 'Disabled' && homeStyle.inactiveBadge,
                        { marginTop: 10, alignItems: 'center' }
                      ]}
                    >
                      <Text style={[homeStyle.statusText, user.status === 'Active' && homeStyle.activeText]}>
                        {user.status}
                      </Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ justifyContent: 'center', flex: 1 }}>
                    <TouchableOpacity onPress={() => setViewAccountVisible(true)}>
                      <Ionicons name="eye" size={15} color="#3d67ee" />
                    </TouchableOpacity>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ justifyContent: 'flex-end' }} >
                    <TouchableOpacity onPress={() => setEditAccountVisible(true)}>
                      <Ionicons name="pencil-sharp" size={15} color="#3d67ee" />
                    </TouchableOpacity>
                  </DataTable.Cell>
                </DataTable.Row>
              ))
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

                <View 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#3d67ee',
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: '#3d67ee',
                    padding: 4,
                  }}
                >
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* LEFT COLUMN */}

            <View style={[homeStyle.modalSections]}>
              <View style={homeStyle.leftModalSection}>
                <View>
                  <Text style={homeStyle.labelStyle}>Username</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Username' placeholderTextColor={"#a8a8a8"}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Full Name</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Full Name' placeholderTextColor={"#a8a8a8"}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Contact Number</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Contact Number' placeholderTextColor={"#a8a8a8"}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Employee ID</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Employee ID' placeholderTextColor={"#a8a8a8"}/>
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
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter E-Mail' placeholderTextColor={"#a8a8a8"}/>
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
                  <TouchableOpacity onPress={()=> handleSaveAccount()}>
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

      {/* END OF ADD ACCOUNT OVERLAY */}

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

                <View 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#3d67ee',
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: '#3d67ee',
                    padding: 4,
                  }}
                >
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* LEFT COLUMN */}

            <View style={homeStyle.modalSections}>
              <View style={homeStyle.leftModalSection}>
                <View>
                  <Text style={homeStyle.labelStyle}>Username</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Username' placeholderTextColor={"#a8a8a8"}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Full Name</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Full Name' placeholderTextColor={"#a8a8a8"}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Contact Number</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Contact Number' placeholderTextColor={"#a8a8a8"}/>
                </View>

                <View>
                  <Text style={homeStyle.labelStyle}>Employee ID</Text>
                  <TextInput style={homeStyle.textInputStyle} placeholder='Enter Employee ID' placeholderTextColor={"#a8a8a8"}/>
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
                />

                <Text style={homeStyle.labelStyle}>Role</Text>
                <Picker style={homeStyle.createPickerStyle}>
                  <Picker.Item label="Admin" value="Admin" />
                  <Picker.Item label="User" value="User" />
                  <Picker.Item label="Moderator" value="Moderator" />
                </Picker>

                <Text style={homeStyle.labelStyle}>Department</Text>
                <Picker style={homeStyle.createPickerStyle}>
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

                <TouchableOpacity>
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

      {/* END OF EDIT ACCOUNT OVERLAY */}

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
              {userImage ? (
                <Image 
                  source={{ uri: userImage }} 
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
                <Text style={homeStyle.textInputStyle}>John Doe</Text>

                <Text style={homeStyle.labelStyle}>Contact Number</Text>
                <Text style={homeStyle.textInputStyle}>123-456-7890</Text>

                <Text style={homeStyle.labelStyle}>Employee ID</Text>
                <Text style={homeStyle.textInputStyle}>EMP-001</Text>

                <Text style={homeStyle.labelStyle}>Account Creation Date</Text>
                <Text style={homeStyle.textInputStyle}>7-7-7</Text>
                
              </View>

              <View style={homeStyle.rightModalSection}>
                <Text style={homeStyle.labelStyle}>E-Mail</Text>
                <Text style={homeStyle.textInputStyle}>john@example.com</Text>

                <Text style={homeStyle.labelStyle}>Role</Text>
                <Text style={homeStyle.textInputStyle}>Admin</Text>

                <Text style={homeStyle.labelStyle}>Department</Text>
                <Text style={homeStyle.textInputStyle}>Marketing</Text>

                <Text style={homeStyle.labelStyle}>Status</Text>
                <View
                  style={[
                    homeStyle.statusBadge,
                    { marginTop: 10, alignItems: 'center' },
                    true ? homeStyle.activeBadge : homeStyle.inactiveBadge
                  ]}
                >
                  <Text style={[homeStyle.statusText, true && homeStyle.activeText]}>Active</Text>
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
