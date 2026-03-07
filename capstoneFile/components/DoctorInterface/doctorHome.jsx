import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, ScrollView, ImageBackground } from 'react-native'; // Fixed import
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';   
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';

import * as ImagePicker from 'expo-image-picker';
import homeStyle from '../../styles/HomeStyle';
import docStyle from '../../styles/DoctorStyles';

export default function doctorHome() {

    const ns = useNavigation();
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(''); // Added missing state

    const route = useRoute();
    const isActive = route.name === 'DoctorHomePage';

    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);

  return (
      <View style={homeStyle.biContainer}>
        
      <View style={homeStyle.navbarContainer}>
        <LinearGradient
          colors={['#3db6ee', '#3d67ee', '#0738D9', '#0f3bca']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={homeStyle.navBody}
        >

          <View style={[homeStyle.navTitle, {gap: 10}]}>
            <Image 
              source={require('../../assets/AgsikapLogo-Temp.png')} 
              style={{width: 25, height: 25, marginTop: 1}} 
              resizeMode="contain"
            />
            <Text style={[homeStyle.brandFont]}>PawRang</Text>
          </View>

          <View style={[homeStyle.glassContainer, {paddingLeft: 8}]}>
            <View style={[homeStyle.navAccount, {gap: 8}]}>
              <Image 
                source={require('../../assets/userImg.jpg')} 
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
          <View style={[homeStyle.glassContainer]}>
            <View style={[isActive ? homeStyle.selectedGlass : null, {marginTop: 8}]}>
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('DoctorHomePage')}}>
                <Ionicons name="home-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Home</Text>
              </TouchableOpacity>
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
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('DoctorSchedule')}}>
                        <Ionicons name="calendar-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Schedule</Text>
                    </TouchableOpacity>
                    </View>

                    <View >
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('DoctorAvailability')}}>
                        <Ionicons name="today-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Availability</Text>
                    </TouchableOpacity>
                    </View>

                    <View >
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('DoctorHistory')}}>
                        <Ionicons name="time-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>History</Text>
                    </TouchableOpacity>
                    </View>
                </View>
                )}
            </View>

            <View> 
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate()}}>
                <Ionicons name="file-tray-full-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Patient Records</Text>
              </TouchableOpacity>
            </View>

            <View> 
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate()}}>
                <Ionicons name="layers-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Inventory</Text>
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

      <View style={[homeStyle.bodyContainer, {paddingTop: 0}]}>

        <View style={docStyle.tableContainer}>
          <View style={docStyle.leftContainer}>
            <ScrollView showsVerticalScrollIndicator={false} style={{padding: 10, paddingTop: 0}}>
            <View style={[docStyle.reportsSubContainer, {marginBottom: 30, overflow: 'visible', padding: 0}]}>
            <ImageBackground 
                source={require('../../assets/ProfileHeader.png')} 
                style={{width: '100%', height: '100%'}}
                imageStyle={{borderRadius: 20}}
            >
                <View style={{flex: 1, justifyContent: 'center', padding: 20, paddingVertical: 30}}>

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>

                        <View style={{alignItems: 'flex-start', marginLeft: 170}}>
                            <Text style={{fontSize: 20, fontWeight: '600', color: '#ffffff'}}>Dr. Margaret Hilario</Text>
                            <Text style={{fontSize: 12, color: '#dfdfdf', marginTop: 4}}>@margaret.hilario</Text>
                            <Text style={{fontSize: 14, fontWeight: '600', color: '#ffffff', marginTop: 20}}>Veterinarian</Text>
                        </View>
                        
                        <View style={{alignItems: 'flex-end', marginRight: 20}}>
                            <View style={docStyle.glassContainer}>
                              <Text style={{fontSize: 16, fontWeight: '500', color: '#ffffff'}}>
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}  -  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            </View>
                            <TouchableOpacity style={{marginTop: 30}}>
                                <Ionicons name="create-outline" size={20} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View />
                </View>
            </ImageBackground>
            
            <View style={{position: 'absolute', bottom: -28, alignSelf: 'flex-start', left: 40}}>
                <Image 
                    source={require('../../assets/userImg.jpg')}
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        borderWidth: 4,
                        borderColor: 'white',
                        backgroundColor: '#3566ee'
                    }}
                />
            </View>
        </View>
            <Text style={[homeStyle.blueText,{marginTop: 25}]}>Monthly Reports</Text>
            <Text style={[homeStyle.blueText,{marginTop: 4, color: '#3737388e', fontSize: 14, fontWeight: 400, marginBottom: 5}]}>Overview of this month’s clinic activity and performance.</Text>
            <View style={docStyle.reportsContainer}>
                <View style={[docStyle.reportsSubContainer, {flex: 1}]}>
                    <View style={{display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 10}}>
                        <Ionicons name="people-outline" size={21} color="#3d67ee" />
                        <Text style={{fontWeight: '400'}}>Total Patients</Text>
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 12}}>
                        <Text style={{fontSize: 30, fontWeight: '600'}}>75</Text>
                        <View style={{backgroundColor: '#d1f7c4', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', gap: 6}}>
                            <Ionicons name="arrow-up-outline" size={12} color="#2e7d32" style={{marginTop:2}}/>
                            <Text style={{color: '#2e7d32', fontWeight: '500', fontSize: 12}}>2%</Text>
                        </View>
                    </View>
                </View>
                <View style={[docStyle.reportsSubContainer, {flex: 1}]}>
                    <View style={{display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 10}}>
                        <Ionicons name="calendar-clear-outline" size={21} color="#3d67ee" />
                        <Text style={{fontWeight: '400'}}>Total Appointments</Text>
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 12}}>
                        <Text style={{fontSize: 30, fontWeight: '600'}}>50</Text>
                        <View style={{backgroundColor: '#f7c4c4', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', gap: 6}}>
                            <Ionicons name="arrow-down-outline" size={12} color="#7d2e2e" style={{marginTop:2}}/>
                            <Text style={{color: '#7d2e2e', fontWeight: '500', fontSize: 12}}>5%</Text>
                        </View>
                    </View>
                </View>
                <View style={[docStyle.reportsSubContainer, {flex: 1}]}>
                    <View style={{display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 10}}>
                        <Ionicons name="hourglass-outline" size={21} color="#3d67ee" />
                        <Text style={{fontWeight: '400'}}>Pending Appointments</Text>
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 12}}>
                        <Text style={{fontSize: 30, fontWeight: '600'}}>20</Text>
                    </View>
                </View>
            </View>

            <Text style={[homeStyle.blueText, {marginTop: 25}]}>Quick Actions</Text>
            <Text style={[homeStyle.blueText,{marginTop: 4, color: '#3737388e', fontSize: 14, fontWeight: 400, marginBottom: 5}]}>Shortcuts for frequently used tasks.</Text>
            <View style={[{flexDirection: 'row', marginTop: 20, justifyContent: 'space-between',gap: 20}]}>
                <View style={{flex: 1, marginHorizontal: 4}}>
                    <TouchableOpacity style={{ alignItems: 'center'}}>
                        <View style={{ padding: 12, borderRadius: 10, alignItems: 'center' , paddingHorizontal: 20, borderColor: '#3566ee', borderWidth: 1, backgroundColor: '#f5f9ff', width: '100%'}}> 
                            <Ionicons name="calendar-outline" size={30} color="#3566ee" />
                            <Text style={{color: '#3566ee', marginTop: 5, fontSize: 10, fontWeight: '500'}}>Appointments</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1, marginHorizontal: 4}}>
                    <TouchableOpacity style={{ alignItems: 'center'}}>
                        <View style={{ padding: 12, borderRadius: 10, alignItems: 'center' , paddingHorizontal: 20, borderColor: '#eb8716', borderWidth: 1, backgroundColor: '#fff9f2', width: '100%'}}> 
                            <Ionicons name="notifications-outline" size={30} color="#eb8716" />
                            <Text style={{color: '#eb8716', marginTop: 5, fontSize: 10, fontWeight: '500'}}>Notifications</Text>
                        </View>                        
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1, marginHorizontal: 4}}>
                    <TouchableOpacity style={{ alignItems: 'center'}}>
                        <View style={{ padding: 12, borderRadius: 10, alignItems: 'center' , paddingHorizontal: 20, borderColor: '#c201c2', borderWidth: 1, backgroundColor: '#fff2fe', width: '100%'}}> 
                            <Ionicons name="person-add-outline" size={30} color="#c201c2" />
                            <Text style={{color: '#c201c2', marginTop: 5, fontSize: 10, fontWeight: '500'}}>Add Patient</Text>
                        </View>                        
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1, marginHorizontal: 4}}>
                    <TouchableOpacity style={{ alignItems: 'center'}}>
                        <View style={{ padding: 12, borderRadius: 10, alignItems: 'center' , paddingHorizontal: 20, borderColor: '#f12ba5', borderWidth: 1, backgroundColor: '#fff2f9', width: '100%'}}> 
                            <Ionicons name="file-tray-full-outline" size={30} color="#f12ba5" />
                            <Text style={{color: '#f12ba5', marginTop: 5, fontSize: 10, fontWeight: '500'}}>Patient Records</Text>
                        </View>                        
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1, marginHorizontal: 4}}>
                    <TouchableOpacity style={{ alignItems: 'center'}}>
                        <View style={{ padding: 12, borderRadius: 10, alignItems: 'center' , paddingHorizontal: 20, borderColor: '#ff2222', borderWidth: 1, backgroundColor: '#fff5f5', width: '100%'}}> 
                            <Ionicons name="layers-outline" size={30} color="#ff2222" />
                            <Text style={{color: '#ff2222', marginTop: 5, fontSize: 10, fontWeight: '500'}}>Inventory</Text>
                        </View>                        
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[docStyle.reportsSubContainer, {marginTop: 35, marginRight: 30, padding: 20, width: '100%', flex: 1, alignItems: ''}]}>
                <View style={{marginBottom: 20}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: '600', color: '#3566ee', fontWeight: 600}}>My Appointments</Text>
                        <TouchableOpacity>
                            <Text style={{fontSize: 14, color: '#3566ee', fontWeight: '500'}}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{fontSize: 14, color: '#666', marginTop: 4}}>Total: 8</Text>
                </View>


                <ScrollView horizontal={false} style={{width: '100%'}} showsVerticalScrollIndicator={true}>
                    <View style={{width: '100%'}}>
                    
                        <View style={{flexDirection: 'row', backgroundColor: '#ebf4ff', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, marginBottom: 5, width: '100%'}}>
                            <Text style={{flex: 2.5, fontSize: 13, fontWeight: '600', color: '#1773e4'}}>Client Name</Text>
                            <Text style={{flex: 2, fontSize: 13, fontWeight: '600', color: '#1773e4'}}>Date & Time</Text>
                            <Text style={{flex: 1.2, fontSize: 13, fontWeight: '600', color: '#1773e4', textAlign: 'center'}}>Status</Text>
                        </View>

                        <View style={{width: '100%', paddingHorizontal: 5}}>
                            {/* Appointment 1 */}
                            <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                                <Text style={{flex: 2.5, fontSize: 14, color: '#333'}}>Sarah Johnson</Text>
                                <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Mar 15, 2024 • 09:30 AM</Text>
                                <View style={{flex: 1.2, alignItems: 'center'}}>
                                    <View style={{backgroundColor: '#e6f7e6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                        <Text style={{color: '#2e7d32', fontSize: 12, fontWeight: '500'}}>Confirmed</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Appointment 2 */}
                            <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                                <Text style={{flex: 2.5, fontSize: 14, color: '#333'}}>Michael Chen</Text>
                                <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Mar 15, 2024 • 11:00 AM</Text>
                                <View style={{flex: 1.2, alignItems: 'center'}}>
                                    <View style={{backgroundColor: '#fff3e0', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                        <Text style={{color: '#f57c00', fontSize: 12, fontWeight: '500'}}>Pending</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Appointment 3 */}
                            <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                                <Text style={{flex: 2.5, fontSize: 14, color: '#333'}}>Emily Rodriguez</Text>
                                <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Mar 16, 2024 • 02:15 PM</Text>
                                <View style={{flex: 1.2, alignItems: 'center'}}>
                                    <View style={{backgroundColor: '#e6f7e6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                        <Text style={{color: '#2e7d32', fontSize: 12, fontWeight: '500'}}>Confirmed</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Appointment 4 */}
                            <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                                <Text style={{flex: 2.5, fontSize: 14, color: '#333'}}>David Kim</Text>
                                <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Mar 16, 2024 • 04:30 PM</Text>
                                <View style={{flex: 1.2, alignItems: 'center'}}>
                                    <View style={{backgroundColor: '#ffebee', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                        <Text style={{color: '#c62828', fontSize: 12, fontWeight: '500'}}>Cancelled</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Appointment 5 */}
                            <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                                <Text style={{flex: 2.5, fontSize: 14, color: '#333'}}>Lisa Thompson</Text>
                                <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Mar 17, 2024 • 10:00 AM</Text>
                                <View style={{flex: 1.2, alignItems: 'center'}}>
                                    <View style={{backgroundColor: '#e6f7e6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                        <Text style={{color: '#2e7d32', fontSize: 12, fontWeight: '500'}}>Confirmed</Text>
                                    </View>
                                </View>
                            </View>                            
                        </View>
                    </View>
                </ScrollView>
            </View>  

            <View style={[docStyle.reportsSubContainer, {marginTop: 35, marginRight: 30, padding: 20, width: '100%'}]}>
            <View style={{marginBottom: 20, alignSelf: 'flex-start'}}>
                <Text style={{fontSize: 18, fontWeight: '600', color: '#3566ee'}}>Recent Patients</Text>
            </View>

            <View style={{width: '100%'}}>
                {/* Table Header */}
                <View style={{flexDirection: 'row', backgroundColor: '#ebf4ff', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, marginBottom: 5, width: '100%', justifyContent: 'space-between'}}>
                    <Text style={{flex: 2, fontSize: 13, fontWeight: '600', color: '#1773e4'}}>Patient Name</Text>
                    <Text style={{flex: 2, fontSize: 13, fontWeight: '600', color: '#1773e4'}}>Owner</Text>
                    <Text style={{flex: 1.5, fontSize: 13, fontWeight: '600', color: '#1773e4', textAlign: 'center'}}>Service</Text>
                    <Text style={{flex: 1.2, fontSize: 13, fontWeight: '600', color: '#1773e4', textAlign: 'center'}}>Date</Text>
                </View>

                {/* Table Rows */}
                <View style={{width: '100%', paddingHorizontal: 5}}>
                    {/* Patient 1 */}
                    <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                        <Text style={{flex: 2, fontSize: 14, color: '#333'}}>Max</Text>
                        <Text style={{flex: 2, fontSize: 14, color: '#666'}}>John Smith</Text>
                        <View style={{flex: 1.5, alignItems: 'center'}}>
                            <View style={{backgroundColor: '#e6f0ff', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                <Text style={{color: '#3566ee', fontSize: 12, fontWeight: '500'}}>Check-up</Text>
                            </View>
                        </View>
                        <Text style={{flex: 1.2, fontSize: 14, color: '#666', textAlign: 'center'}}>Mar 15</Text>
                    </View>

                    {/* Patient 2 */}
                    <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                        <Text style={{flex: 2, fontSize: 14, color: '#333'}}>Luna</Text>
                        <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Maria Garcia</Text>
                        <View style={{flex: 1.5, alignItems: 'center'}}>
                            <View style={{backgroundColor: '#fff0e6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                <Text style={{color: '#eb8716', fontSize: 12, fontWeight: '500'}}>Grooming</Text>
                            </View>
                        </View>
                        <Text style={{flex: 1.2, fontSize: 14, color: '#666', textAlign: 'center'}}>Mar 14</Text>
                    </View>

                    {/* Patient 3 */}
                    <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                        <Text style={{flex: 2, fontSize: 14, color: '#333'}}>Rocky</Text>
                        <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Robert Taylor</Text>
                        <View style={{flex: 1.5, alignItems: 'center'}}>
                            <View style={{backgroundColor: '#ffe6e6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                <Text style={{color: '#ff2222', fontSize: 12, fontWeight: '500'}}>Vaccination</Text>
                            </View>
                        </View>
                        <Text style={{flex: 1.2, fontSize: 14, color: '#666', textAlign: 'center'}}>Mar 11</Text>
                    </View>

                    {/* Patient 4 */}
                    <View style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', width: '100%'}}>
                        <Text style={{flex: 2, fontSize: 14, color: '#333'}}>Bella</Text>
                        <Text style={{flex: 2, fontSize: 14, color: '#666'}}>Sarah Johnson</Text>
                        <View style={{flex: 1.5, alignItems: 'center'}}>
                            <View style={{backgroundColor: '#e6f7e6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15}}>
                                <Text style={{color: '#2e7d32', fontSize: 12, fontWeight: '500'}}>Dental</Text>
                            </View>
                        </View>
                        <Text style={{flex: 1.2, fontSize: 14, color: '#666', textAlign: 'center'}}>Mar 10</Text>
                    </View>
                </View>
            </View>
        </View>
            </ScrollView>
          </View>



          <View style={[docStyle.rightContainer, {gap: 12}]}> 
            <View style={[docStyle.reportsSubContainer, { flex: 1.5, padding: 20 }]}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 70}}>
                  <View style={{justifyContent: 'flex-start', alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 5}}>
                    <Ionicons name="notifications-outline" size={18} color="#000000" style={{marginTop: 3, marginRight: 5}}/>
                  <Text style={{fontSize: 16, fontWeight: '600', color: '#1e293b'}}>Recent Notifications</Text>
                  </View>
                  <TouchableOpacity style={{justifyContent: 'flex-end', alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 5}}>
                      <Text style={{fontSize: 12, color: '#3566ee', fontWeight: '500', marginTop: 2}}>View All</Text>
                  </TouchableOpacity>
              </View>
                <ScrollView showsVerticalScrollIndicator={true}>
                  <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ backgroundColor: '#3d67ee20', padding: 8, borderRadius: 10 }}>
                        <Ionicons name="calendar-outline" size={16} color="#3d67ee" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>New appointment scheduled</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}>John Smith - Tomorrow at 9:00 AM</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: '#94a3b8' }}>5 min ago</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ backgroundColor: '#f59e0b20', padding: 8, borderRadius: 10 }}>
                        <Ionicons name="document-text-outline" size={16} color="#f59e0b" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>Lab results ready</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}>Maria Garcia - Blood work completed</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: '#94a3b8' }}>2 hours ago</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ backgroundColor: '#10b98120', padding: 8, borderRadius: 10 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>Appointment completed</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}>Robert Johnson - Check-up finished</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: '#94a3b8' }}>3 hours ago</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ backgroundColor: '#8b5cf620', padding: 8, borderRadius: 10 }}>
                        <Ionicons name="people-outline" size={16} color="#8b5cf6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>New patient registered</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}>Sarah Williams - Initial consultation</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: '#94a3b8' }}>1 day ago</Text>
                    </View>
                  </View>
                </ScrollView>    
            </View>   
              <View style={{ 
                borderRadius: 16, 
                marginTop: 20,
                flex: 2, 

                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 18,
                elevation: 8, 
              }}>
                <LinearGradient
                  colors={['#3db6ee', '#3d67ee', '#0738D9', '#0f3bca', '#3db6ee']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 20, borderRadius: 16, flex: 1 }}
                >
                  <Calendar 
                    monthFormat={'MMMM yyyy'}
                    current={new Date().toISOString().split('T')[0]}
                    onDayPress={(day) => {
                      console.log('selected day', day);
                      setSelectedCalendarDate(day.dateString);
                    }}
                    
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      
                      'stylesheet.calendar.header': {
                        header: {
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 2,
                          marginBottom: 5,
                          backgroundColor: 'transparent',
                        },
                        monthText: {
                          fontSize: 16,
                          fontWeight: '700',
                          color: '#ffffff',
                          margin: 5,
                          backgroundColor: 'transparent',
                        },
                        arrow: {
                          padding: 5,
                          marginHorizontal: 5,
                        },
                        week: {
                          marginTop: 3,
                          flexDirection: 'row',
                          justifyContent: 'space-around',
                          backgroundColor: 'transparent',
                        },
                        dayHeader: {
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#ffffff',
                          marginBottom: 2,
                          backgroundColor: 'transparent',
                        },
                      },
                      
                      'stylesheet.day.basic': {
                        base: {
                          width: 28,
                          height: 28,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'transparent',
                        },
                        today: {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: 14,
                        },
                        todayText: {
                          color: '#ffffff',
                          fontWeight: '700',
                        },
                        text: {
                          fontSize: 12,
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                        },
                      },
                      
                      'stylesheet.day.single': {
                        base: {
                          width: 28,
                          height: 28,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'transparent',
                        },
                        text: {
                          fontSize: 12,
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                        },
                      },
                      
                      selectedDayBackgroundColor: '#ffffff',
                      selectedDayTextColor: '#3d67ee',
                      
                      'stylesheet.day.selected': {
                        base: {
                          backgroundColor: '#ffffff',
                          borderRadius: 14,
                          width: 28,
                          height: 28,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        text: {
                          color: '#3d67ee',
                          fontWeight: '700',
                          fontSize: 12,
                          backgroundColor: 'transparent',
                        },
                      },
                      
                      arrowColor: '#ffffff',
                      monthTextColor: '#ffffff',
                      textMonthFontWeight: '700',
                      textMonthFontSize: 16,
                      textDayFontFamily: 'Segoe UI',
                      textDayFontSize: 12,
                      textDisabledColor: 'rgba(255, 255, 255, 0.4)',
                      dayTextColor: '#ffffff',
                      textSectionTitleColor: '#ffffff',
                      textSectionTitleDisabledColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                    style={{
                      borderRadius: 8,
                      backgroundColor: 'transparent',
                      width: '100%',
                    }}
                    markedDates={{
                      [new Date().toISOString().split('T')[0]]: {
                        selected: false,
                        marked: true,
                        dotColor: '#ffffff',
                      }
                    }}
                    hideExtraDays={false}
                    disableMonthChange={false}
                    firstDay={1}
                    hideDayNames={false}
                    showWeekNumbers={false}
                    hideArrows={false}
                  />
                </LinearGradient>
              </View>
          </View>
        </View>
      </View>
    </View>
  )
}