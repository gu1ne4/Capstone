import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   
import { BlurView } from 'expo-blur';

import * as ImagePicker from 'expo-image-picker';
import apStyle from '../styles/AppointmentStyles';
import { Calendar } from 'react-native-calendars';
import { ScrollView } from 'react-native-web';

//meow
export default function AvailSettings() {

    const ns = useNavigation();

    const route = useRoute();
    const isActive = route.name === 'AvailSettings';

    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);

    const [slots, setSlots] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [capacity, setCapacity] = useState('');

    const [events, setEvents] = useState([
    { name: "Valentine's Day", date: "Feb 14, 2026" },
    { name: "National Heroes Day", date: "Aug 30, 2026" },
  ]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  const addEvent = () => {
    if (eventName && eventDate) {
      setEvents([...events, { name: eventName, date: eventDate }]);
      setEventName('');
      setEventDate('');
    }
  };

    const addSlot = () => {
      if (startTime && endTime && capacity) {
        setSlots([...slots, { startTime, endTime, capacity }]);
        setStartTime('');
        setEndTime('');
        setCapacity('');
      }
    }  

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

                    <View style={[isActive ? homeStyle.subSelectedGlass : null, {width: '100%'}]}>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('AvailSettings')}}>
                        <Ionicons name="today-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Availability</Text>
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
            <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>Appointments / Availability Settings</Text>
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
            <Text style={{fontFamily: 'Segoe UI', fontSize: 18, fontWeight: '700'}}>Special Dates</Text>
            <ScrollView style={{ marginTop: 10 }}>
              <DataTable>
                {events.map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <Text style={{ fontSize: 12 }}>{item.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={{ fontSize: 12 }}>{item.date}</Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>

            <TouchableOpacity style={{alignItems: 'center'}} onPress={() => setModalVisible2(true)}>
              <LinearGradient
                colors={['#3d67ee', '#0738D9', '#041E76']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[homeStyle.blackBtn, {width: "60%", alignItems:"center", marginTop: 15, padding: 10}]}
              >
                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 600}}>+ Add Special Date</Text>  
              </LinearGradient>
            </TouchableOpacity>
          </View>


          </View>

          <View style={apStyle.bodyContainer}>
            <View style={[apStyle.whiteContainer, {padding: 30, flex: 1}]}>
              <Text style={{fontSize: 25, fontWeight: 700}}>Availability Settings</Text>
              <Text style={{fontSize: 14, marginTop: 10, opacity: 0.5}}>Manage available days, working hours, and appointment slots for vet bookings.</Text>

              <View style={{flexDirection: 'row', marginTop: 50, alignItems: 'center'}}>
                <Switch style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }]}}/>
                <Text style={{fontSize: 18}}>Sunday</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginRight: 10, marginTop: 8}}>
                  <Text style={{fontSize: 15, color: '#3d67ee'}}>Time Slot</Text>
                  <Ionicons name="alarm-outline" size={18} color="#3d67ee" style={{ marginTop: 1, marginLeft: 10 }} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: 'rgba(0, 0, 0, 0.24)', marginVertical: 10, marginTop: 20, marginBottom: 10 }} />

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                <Switch style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }]}}/>
                <Text style={{fontSize: 18}}>Monday</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginRight: 10, marginTop: 8}}>
                  <Text style={{fontSize: 15, color: '#3d67ee'}}>Time Slot</Text>
                  <Ionicons name="alarm-outline" size={18} color="#3d67ee" style={{ marginTop: 1, marginLeft: 10 }} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 20, marginBottom: 10 }} />

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                <Switch style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }]}}/>
                <Text style={{fontSize: 18}}>Tuesday</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginRight: 10, marginTop: 8}}>
                  <Text style={{fontSize: 15, color: '#3d67ee'}}>Time Slot</Text>
                  <Ionicons name="alarm-outline" size={18} color="#3d67ee" style={{ marginTop: 1, marginLeft: 10 }} />
                </TouchableOpacity>
              </View>


              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 20, marginBottom: 10 }} />

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                <Switch style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }]}}/>
                <Text style={{fontSize: 18}}>Wednesday</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginRight: 10, marginTop: 8}}>
                  <Text style={{fontSize: 15, color: '#3d67ee'}}>Time Slot</Text>
                  <Ionicons name="alarm-outline" size={18} color="#3d67ee" style={{ marginTop: 1, marginLeft: 10 }} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 20, marginBottom: 10 }} />

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                <Switch style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }]}}/>
                <Text style={{fontSize: 18}}>Thursday</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginRight: 10, marginTop: 8}}>
                  <Text style={{fontSize: 15, color: '#3d67ee'}}>Time Slot</Text>
                  <Ionicons name="alarm-outline" size={18} color="#3d67ee" style={{ marginTop: 1, marginLeft: 10 }} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 20, marginBottom: 10 }} />

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                <Switch style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }]}}/>
                <Text style={{fontSize: 18}}>Saturday</Text>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginRight: 10, marginTop: 8}}>
                  <Text style={{fontSize: 15, color: '#3d67ee'}}>Time Slot</Text>
                  <Ionicons name="alarm-outline" size={18} color="#3d67ee" style={{ marginTop: 1, marginLeft: 10 }} />
                </TouchableOpacity>
              </View>
            </View>
          
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={apStyle.overlay}>
            <View style={apStyle.modalContainer}>
              <Text style={apStyle.title}>Time Slots</Text>

              {/* Split layout */}
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                
                {/* Left Section: Input Fields */}
                <View style={{ flex: 1, marginRight: 10 }}>
                  <TextInput
                    placeholder="Start Time (e.g. 8:00 AM)"
                    value={startTime}
                    onChangeText={setStartTime}
                    style={apStyle.input}
                  />
                  <TextInput
                    placeholder="End Time (e.g. 9:00 AM)"
                    value={endTime}
                    onChangeText={setEndTime}
                    style={apStyle.input}
                  />
                  <TextInput
                    placeholder="Client Capacity"
                    value={capacity}
                    onChangeText={setCapacity}
                    keyboardType="numeric"
                    style={apStyle.input}
                  />

                  <TouchableOpacity onPress={addSlot} style={apStyle.addBtn}>
                    <Text style={{ color: '#fff' }}>+ Add Slot</Text>
                  </TouchableOpacity>
                </View>

                {/* Right Section: Table */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Start</DataTable.Title>
                      <DataTable.Title>End</DataTable.Title>
                      <DataTable.Title numeric>Capacity</DataTable.Title>
                    </DataTable.Header>

                    {slots.map((item, index) => (
                      <DataTable.Row key={index}>
                        <DataTable.Cell>{item.startTime}</DataTable.Cell>
                        <DataTable.Cell>{item.endTime}</DataTable.Cell>
                        <DataTable.Cell numeric>{item.capacity}</DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </View>
              </View>

              {/* Footer Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: 'red', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#3d67ee', fontWeight: '600' }}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

          <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible2}
          onRequestClose={() => setModalVisible2(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: '30%', backgroundColor: '#fff', borderRadius: 10, padding: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: '700' }}>Add Special Event</Text>

              <TextInput
                placeholder="Event Name"
                value={eventName}
                onChangeText={setEventName}
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginTop: 10 }}
              />
              <TextInput
                placeholder="Event Date (e.g. Feb 14, 2026)"
                value={eventDate}
                onChangeText={setEventDate}
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginTop: 10 }}
              />

              <TouchableOpacity onPress={addEvent} style={{ backgroundColor: '#3d67ee', padding: 10, borderRadius: 5, marginTop: 15, alignItems: 'center' }}>
                <Text style={{ color: '#fff' }}>+ Add Event</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity onPress={() => setModalVisible2(false)}>
                  <Text style={{ color: 'red', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
            
          </View>
        </View>
      </View>
    </View>
  )
}