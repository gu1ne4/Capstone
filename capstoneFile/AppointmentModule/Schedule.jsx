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
import { Calendar } from 'react-native-calendars';
import apStyle from '../styles/AppointmentStyles';


export default function Schedule() {

    const ns = useNavigation();

    const route = useRoute();
    const isActive = route.name === 'Schedule';

    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);

    const [searchVisible, setSearchVisible] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);

    const [service, setService] = useState('');

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
                    <View style={[isActive ? homeStyle.subSelectedGlass : null, {width: '100%'}]}>
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

                    <View>
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
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Appointments / Schedule</Text>
          </View>
          <View style={[homeStyle.subTopContainer, { justifyContent: 'center', flex: 0.5, marginLeft: 12 }]}>
            <TouchableOpacity>
              <Ionicons name="notifications" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TABLE CONTAINER */}

        <View style={[apStyle.tableContainer, {flexDirection: 'row'}]}>
          <View style={apStyle.sideContainer}>
            <View style={[apStyle.whiteContainer, {padding: 10, overflow: 'hidden', flex: 2}]}>
                <Calendar current={'2026-02-01'} onDayPress={(day) => {
                    console.log('selected day', day);
                  }}
                  markedDates={{
                    '2026-02-14': { marked: true, dotColor: 'red' },
                  }}
                  theme={{
                    selectedDayBackgroundColor: '#3d67ee',
                    todayTextColor: '#3d67ee',
                    arrowColor: '#3d67ee',
                    monthTextColor: '#000',

                    textMonthFontWeight: 700,
                    textMonthFontFamily: 'Segoe UI',
                    textMonthFontSize: 18,

                    textDayFontFamily: 'Segoe UI',
                    textDayFontSize: 14,
                  }}
                  style={{
                    borderRadius: 8,
                    padding: 10,
                    width: '100%',  
                    height: 200, 
                    alignSelf: 'center'
                  }}
                />
            </View>
            <View style={[apStyle.whiteContainer, {flex: 1}]}>
              <Text style={{fontFamily: 'Segoe UI', fontSize: 18, fontWeight: '700'}}>Doctors Available</Text>
              <ScrollView style={{ marginTop: 10 }}>
                <DataTable>
                  {/* Example Row 1 */}
                  <DataTable.Row>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image 
                          source={require('../assets/userAvatar.jpg')} 
                          style={{width: 30, height: 30, borderRadius: 20, marginRight: 10 }}
                        />
                        <Text style={{ fontSize: 14 }}>Dr. Maria Santos</Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>

                  {/* Example Row 2 */}
                  <DataTable.Row>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image 
                          source={require('../assets/userAvatar.jpg')} 
                          style={{ width: 30, height: 30, borderRadius: 20, marginRight: 10 }}
                        />
                        <Text style={{ fontSize: 12 }}>Dr. Juan Dela Cruz</Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>

                  {/* Example Row 3 */}
                  <DataTable.Row>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image 
                          source={require('../assets/userAvatar.jpg')} 
                          style={{ width: 30, height: 30, borderRadius: 20, marginRight: 10 }}
                        />
                        <Text style={{ fontSize: 14 }}>Dr. Angela Reyes</Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                </DataTable>
              </ScrollView>
            </View>



          </View>

          <View style={apStyle.bodyContainer}>
            <View style={[apStyle.whiteContainer, {padding: 30, flex: 1}]}>
              <Text style={{fontSize: 25, fontWeight: 700}}>Booked Appointments</Text>
              <Text style={{fontSize: 14, marginTop: 10, opacity: 0.5}}>Manage available days, working hours, and appointment slots for vet bookings.</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginTop: 30 }}>
                  {/* Icon on the left */}
                  <Ionicons name="filter-sharp" size={25} color="#3d67ee" style={{ marginRight: 20 }} />

                  {/* Picker on the right */}
                  <Picker
                    selectedValue={service}
                    onValueChange={(itemValue) => setService(itemValue)}
                    style={[homeStyle.pickerStyle, { width: 150 }]}
                  >
                    <Picker.Item label="Select Service" value="" color="#a8a8a8" />
                    <Picker.Item label="Vaccination" value="Vaccination" />
                    <Picker.Item label="Check-up" value="Check-up" />
                    <Picker.Item label="Surgery" value="Surgery" />
                    <Picker.Item label="Grooming" value="Grooming" />
                  </Picker>
                </View>

              <DataTable style={{marginTop: 20}}>
                {/* Header */}
                <DataTable.Header>
                  <DataTable.Title style={{ flex: 2, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700' }}>Name</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 2, justifyContent: 'center'  }}>
                    <Text style={{ fontSize: 12, fontWeight: '700' }}>Service</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 2, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700' }}>Time & Date</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 2, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700' }}>Doctor</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700' }}>Status</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700' }}>View</Text>
                  </DataTable.Title>
                </DataTable.Header>

                {/* Sample Rows */}
                <DataTable.Row>
                  <DataTable.Cell style={{ flex: 2 }}>
                    <Text style={{ fontSize: 12 }}>John Doe</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12 }}>Vaccination</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12 }}>Feb 14, 2026 - 10:00 AM</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12 }}>Dr. Smith</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, color: 'green' }}>Active</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <TouchableOpacity>
                      <Ionicons name="eye-outline" size={15} color="#3d67ee" />
                    </TouchableOpacity>
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Pagination
                  optionsPerPage={[8]}
                 />
              </DataTable>

            </View>
          </View>
        </View>
      </View>
    </View>
  )
}