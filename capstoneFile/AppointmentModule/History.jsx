import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   
import { BlurView } from 'expo-blur';

import * as ImagePicker from 'expo-image-picker';

export default function History() {

    const ns = useNavigation();

    const route = useRoute();
    const isActive = route.name === 'History';

    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);

    const [searchVisible, setSearchVisible] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [searchHovered, setSearchHovered] = useState(false);
    const [filterHovered, setFilterHovered] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState('defaultStatus');
    const [role, setRole] = useState('defaultRole');
    const [department, setDepartment] = useState('defaultDept');

    //meow
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
          <View style={[homeStyle.glassContainer]} >
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

            <View>
              {/* Parent Button */}
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

              {/* Dropdown Subcategories */}
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
            <Ionicons name="document-text-outline" size={20} color="#3d67ee" style={{ marginTop: 2 }} />
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Appointments / Appointments History</Text>
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
                  placeholder="Search..."
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
                  <Picker selectedValue={status} style={homeStyle.pickerStyle} onValueChange={(val) => setStatus(val)}>
                    <Picker.Item label="Status" value="defaultStatus" color="#a8a8a8" />
                    <Picker.Item label="Active" value="Active" />
                    <Picker.Item label="Disabled" value="Disabled" />
                  </Picker>

                  <Picker selectedValue={role} style={[homeStyle.pickerStyle, { marginLeft: 10, width: 120 }]} onValueChange={(val) => setRole(val)}>
                    <Picker.Item label="Role" value="defaultRole" color="#a8a8a8" />
                    <Picker.Item label="Admin" value="Admin" />
                    <Picker.Item label="Veterinarian" value="Veterinarian" />
                    <Picker.Item label="Receptionist" value="Receptionist" />
                  </Picker>

                  <Picker selectedValue={department} style={[homeStyle.pickerStyle, { marginLeft: 10, width: 150 }]} onValueChange={(val) => setDepartment(val)}>
                    <Picker.Item label="Department" value="defaultDept" color="#a8a8a8" />
                    <Picker.Item label="Human Resources" value="Human Resources" />
                    <Picker.Item label="Marketing" value="Marketing" />
                    <Picker.Item label="Sales" value="Sales" />
                    <Picker.Item label="IT" value="IT" />
                  </Picker>
                </View>
              )}
            </View>

            {/* Add button placeholder */}
            <View style={[homeStyle.subTable2, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity style={homeStyle.blackBtn}>
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Ionicons name="person-add" color="#ffffff" /> Add Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Table */}
          <ScrollView>
            <DataTable>
              <DataTable.Header style={homeStyle.tableHeader}>
                <DataTable.Title style={{ flex: 2 }}>Pet Name</DataTable.Title>
                <DataTable.Title style={{ flex: 2 }}>Service</DataTable.Title>
                <DataTable.Title style={{ flex: 2 }}>Date and Time</DataTable.Title>
                <DataTable.Title style={{ flex: 2 }}>Doctor</DataTable.Title>
                <DataTable.Title style={{ flex: 1 }}>Status</DataTable.Title>
                <DataTable.Title style={{ flex: 1, justifyContent: 'flex-end' }}>View</DataTable.Title>
              </DataTable.Header>

              {/* Example static row */}
              <DataTable.Row>
                <DataTable.Cell style={{ flex: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>Sample User</Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>Deworming</DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>Feb. 14, 2026 at 7:00AM - 8:00AM</DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>123456789</DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>sample@email.com</DataTable.Cell>
                <DataTable.Cell style={{ flex: 1 }}>Active</DataTable.Cell>
                <DataTable.Cell style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Ionicons name="eye-outline" size={15} color="#3d67ee" />
                </DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}