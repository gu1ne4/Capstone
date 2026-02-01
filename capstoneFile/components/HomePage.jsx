import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   

export default function HomePage() {

  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [status, setStatus] = useState("defaultStatus");
  const [role, setRole] = useState("defaultRole");
  const [department, setDepartment] = useState("defaultDept");

  const [users] = useState([
    { id: 1, name: 'Carl Johnson', role: 'Admin', department: 'Marketing', contact: '123-456-7890', email: 'carl@example.com', status: 'Active' },
    { id: 2, name: 'Alice Smith', role: 'User', department: 'Sales', contact: '987-654-3210', email: 'alice@example.com', status: 'Disabled' },
    { id: 3, name: 'Bob Brown', role: 'Moderator', department: 'Human Resources', contact: '555-555-5555', email: 'bob@example.com', status: 'Active' },
    { id: 4, name: 'Charlie Davis', role: 'Admin', department: 'IT', contact: '111-222-3333', email: 'charlie@example.com', status: 'Active' },
  ]);

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


  return (
    <View style={homeStyle.biContainer}>
 
      <View style={homeStyle.navbarContainer}>
        <LinearGradient
          colors={['#7C9AFF', '#3d67ee', '#0738D9', '#041E76']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={homeStyle.navBody}
        >
          <Text style={homeStyle.brandFont}>Agsikap</Text>
        </LinearGradient>
      </View>

      <View style={homeStyle.bodyContainer}>

        <View style={homeStyle.topContainer}>
          <View style={[homeStyle.subTopContainer]}>
            <Ionicons name="people-outline" size={23} color="#3d67ee" style={{ marginTop: 4 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>User List</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'flex-end', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity>
              <Ionicons name="notifications" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={homeStyle.tableContainer}>
          <View style={homeStyle.tableLayer1}>
            <View style={[homeStyle.subTable1, { flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }]}>

              <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
                <Ionicons name="search-sharp" size={25} color={searchVisible ? "#afccf8" : "#3d67ee"} style={{ marginTop: 3 }} />
              </TouchableOpacity>

              {searchVisible && (
                <TextInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    fontSize: 13,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 28,
                    width: 180,           
                  }}
                />
              )}


              <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => setFilterVisible(!filterVisible)}>
                <Ionicons name="filter-sharp" size={25} color={filterVisible ? "#afccf8" : "#3d67ee"} style={{ marginTop: 3 }} />
              </TouchableOpacity>


              {filterVisible && (
                <View style={{ flexDirection: 'row', marginLeft: 5, flexWrap: 'wrap', zIndex: 2 }}>

                  <Picker
                    selectedValue={status}
                    style={homeStyle.pickerStyle}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                  >
                    {status === "defaultStatus" && (
                      <Picker.Item label="Status" value="defaultStatus" color="#a8a8a8" />
                    )}
                    <Picker.Item label="Active" value="Active" />
                    <Picker.Item label="Disabled" value="Disabled" />
                  </Picker>

                  <Picker
                    selectedValue={role}
                    style={[homeStyle.pickerStyle, { marginLeft: 10, width: 120 }]}
                    onValueChange={(itemValue) => setRole(itemValue)}
                  >
                    {role === "defaultRole" && (
                      <Picker.Item label="Role" value="defaultRole" color="#a8a8a8" />
                    )}
                    <Picker.Item label="Admin" value="Admin" />
                    <Picker.Item label="User" value="User" />
                    <Picker.Item label="Moderator" value="Moderator" />
                  </Picker>

                  <Picker
                    selectedValue={department}
                    style={[homeStyle.pickerStyle, { marginLeft: 10, width: 150 }]}
                    onValueChange={(itemValue) => setDepartment(itemValue)}
                  >
                    {department === "defaultDept" && (
                      <Picker.Item label="Department" value="defaultDept" color="#a8a8a8" />
                    )}
                    <Picker.Item label="Human Resources" value="Human Resources" />
                    <Picker.Item label="Marketing" value="Marketing" />
                    <Picker.Item label="Sales" value="Sales" />
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

            <View style={[homeStyle.subTable2, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity style={homeStyle.blackBtn}>
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Ionicons name="person-add" color="#ffffff" style={{ marginTop: 3 }} /> Add Account
                </Text>
              </TouchableOpacity>
            </View>

          </View>

          <DataTable>
            <DataTable.Header style={homeStyle.tableHeader}>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 3 }}>Name</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 1.5 }}>Role</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 2 }}>Department</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 2 }}>Contact Number</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 2 }}>E-Mail</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ flex: 1 }}>Status</DataTable.Title>
              <DataTable.Title textStyle={homeStyle.tableFont} style={{ justifyContent: 'flex-end' }}>Edit</DataTable.Title>
            </DataTable.Header>

            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
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
                  <DataTable.Cell style={{ flex: 1 }}>
                    <View
                      style={[
                        homeStyle.statusBadge,
                        user.status === 'Active' && homeStyle.activeBadge,
                        user.status === 'Disabled' && homeStyle.inactiveBadge,
                        {marginTop: 10, alignItems: 'center'}
                      ]}
                    >
                      <Text style={[homeStyle.statusText, user.status === 'Active' && homeStyle.activeText ]}>
                        {user.status}
                      </Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ justifyContent: 'flex-end' }}>
                    <TouchableOpacity>
                      <Ionicons name="pencil-sharp" size={15} color="#3d67ee" />
                    </TouchableOpacity>
                  </DataTable.Cell>
                </DataTable.Row>
              ))
            ) : (
              // 👇 Message row when no users match
              <DataTable.Row>
                <DataTable.Cell style={{ flex: 1 }}>
                  <Text style={{ color: '#888', textAlign: 'center', width: '100%' }}>
                    {noMatchFilters ? "Showing all users (no filters applied)" : "No users found"}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            )}

            <DataTable.Pagination
              page={0}
              numberOfPages={1}
              onPageChange={(page) => console.log(page)}
              label="1 of 1"
            />
          </DataTable>

        </View>
      </View>
    </View>
  );
}
