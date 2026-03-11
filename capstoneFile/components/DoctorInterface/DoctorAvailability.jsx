import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import homeStyle from '../../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import apStyle from '../../styles/AppointmentStyles';
import { availabilityService } from '../../AppointmentModule/availabilityService';

const TimeSelector = ({ label, value, onChange }) => {
  // Parse the initial value
  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: 8, minutes: 0, isAM: true };
    
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const ampm = match[3]?.toUpperCase();
      
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      
      return {
        hours: h > 12 ? h - 12 : h,
        minutes: m,
        isAM: h < 12
      };
    }
    return { hours: 8, minutes: 0, isAM: true };
  };

  const initialTime = parseTime(value);
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [isAM, setIsAM] = useState(initialTime.isAM);



  // Update internal state when external value changes
  useEffect(() => {
    const newTime = parseTime(value);
    setHours(newTime.hours);
    setMinutes(newTime.minutes);
    setIsAM(newTime.isAM);
  }, [value]);

  const updateTime = (newHours, newMinutes, newIsAM) => {
    const hour24 = newIsAM ? (newHours === 12 ? 0 : newHours) : (newHours === 12 ? 12 : newHours + 12);
    const displayTime = `${newHours}:${newMinutes.toString().padStart(2, '0')} ${newIsAM ? 'AM' : 'PM'}`;
    onChange(displayTime);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ marginBottom: 8, fontWeight: '500', fontSize: 14 }}>{label}</Text>
      
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 10
      }}>
        {/* Hours */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TouchableOpacity 
            onPress={() => {
              const newHours = hours === 12 ? 1 : hours + 1;
              setHours(newHours);
              updateTime(newHours, minutes, isAM);
            }}
            style={{ padding: 5 }}
          >
            <Ionicons name="chevron-up" size={20} color="#3d67ee" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 18, fontWeight: '600', marginVertical: 5 }}>
            {hours.toString().padStart(2, '0')}
          </Text>
          
          <TouchableOpacity 
            onPress={() => {
              const newHours = hours === 1 ? 12 : hours - 1;
              setHours(newHours);
              updateTime(newHours, minutes, isAM);
            }}
            style={{ padding: 5 }}
          >
            <Ionicons name="chevron-down" size={20} color="#3d67ee" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>HOURS</Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 5 }}>:</Text>

        {/* Minutes */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TouchableOpacity 
            onPress={() => {
              const newMinutes = (minutes + 1) % 60;
              setMinutes(newMinutes);
              updateTime(hours, newMinutes, isAM);
            }}
            style={{ padding: 5 }}
          >
            <Ionicons name="chevron-up" size={20} color="#3d67ee" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 18, fontWeight: '600', marginVertical: 5 }}>
            {minutes.toString().padStart(2, '0')}
          </Text>
          
          <TouchableOpacity 
            onPress={() => {
              const newMinutes = minutes === 0 ? 59 : minutes - 1;
              setMinutes(newMinutes);
              updateTime(hours, newMinutes, isAM);
            }}
            style={{ padding: 5 }}
          >
            <Ionicons name="chevron-down" size={20} color="#3d67ee" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>MINUTES</Text>
        </View>

        {/* AM/PM */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TouchableOpacity 
            onPress={() => {
              setIsAM(true);
              updateTime(hours, minutes, true);
            }}
            style={{ 
              padding: 8,
              backgroundColor: isAM ? '#3d67ee' : 'transparent',
              borderRadius: 5,
              marginBottom: 5
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              fontWeight: isAM ? 'bold' : 'normal',
              color: isAM ? 'white' : '#666'
            }}>
              AM
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              setIsAM(false);
              updateTime(hours, minutes, false);
            }}
            style={{ 
              padding: 8,
              backgroundColor: !isAM ? '#3d67ee' : 'transparent',
              borderRadius: 5
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              fontWeight: !isAM ? 'bold' : 'normal',
              color: !isAM ? 'white' : '#666'
            }}>
              PM
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={{ 
        marginTop: 5, 
        fontSize: 12, 
        color: '#666',
        textAlign: 'center'
      }}>
        Selected: {hours}:{minutes.toString().padStart(2, '0')} {isAM ? 'AM' : 'PM'}
      </Text>
    </View>
  );
};

export default function DoctorAvailability() {
  const ns = useNavigation();
  const route = useRoute();
  const isActive = route.name === 'DoctorAvailability';

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);

    // Add this with your other useState declarations
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [bookedDates, setBookedDates] = useState({});
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);

  // Time slots storage
  const [timeSlotsByDay, setTimeSlotsByDay] = useState({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  });

  // Current modal state
  const [currentEditingDay, setCurrentEditingDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Day availability state
  const [dayAvailability, setDayAvailability] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false
  });

  const [specialDates, setSpecialDates] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load day availability using the service
      const dayData = await availabilityService.getDayAvailability();
      setDayAvailability(dayData);
      
      // Load time slots for all days
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const slotsByDay = { ...timeSlotsByDay };
      
      for (const day of days) {
        const slots = await availabilityService.getTimeSlotsForDay(day);
        slotsByDay[day] = slots.map(slot => ({
          id: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time,
          capacity: slot.capacity
        }));
      }
      
      setTimeSlotsByDay(slotsByDay);
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load availability data');
    }
  };

  // Add this function to load appointments for the calendar
const loadAppointmentsForCalendar = async () => {
  try {
    const appointments = await availabilityService.getAppointmentsForTable();
    
    // Process booked dates for calendar
    const booked = {};
    appointments.forEach(app => {
      // Extract date from date_time string (format: "Mon DD, YYYY - HH:MM AM/PM")
      const dateTimeParts = app.date_time.split(' - ');
      if (dateTimeParts.length > 0) {
        const dateStr = dateTimeParts[0];
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        booked[formattedDate] = {
          marked: true,
          dotColor: '#3d67ee',
        };
      }
    });
    
    setBookedDates(booked);
  } catch (error) {
    console.error('Failed to load appointments for calendar:', error);
  }
};

// Add this to your existing useEffect
useEffect(() => {
  loadInitialData();
  loadAppointmentsForCalendar(); // Add this line
}, []);

  // Handle day switch toggle - DISABLED (can't switch on/off)
  const handleDayToggle = async (dayName) => {
    // Do nothing - switches are now read-only
    return;
  };

  // Open time slot modal for a day
  const openTimeSlotModalForDay = async (dayName) => {
    console.log('=== Opening modal for:', dayName);
    const dayKey = dayName.toLowerCase();
    
    // IMMEDIATELY open the modal with the day name
    setCurrentEditingDay(dayKey);
    setModalVisible(true);
    
    // Load data
    setLoadingTimeSlots(true);
    
    try {
      // Load time slots for this day using the service
      const existingSlots = await availabilityService.getTimeSlotsForDay(dayKey);
      console.log('Loaded slots:', existingSlots);
      
      const formattedSlots = existingSlots.map(slot => ({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        capacity: slot.capacity
      }));
      
      // Update state
      setTimeSlotsByDay(prev => ({
        ...prev,
        [dayKey]: formattedSlots
      }));
      
    } catch (error) {
      console.error('Error loading slots:', error);
      Alert.alert('Error', 'Failed to load time slots');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const addSlot = () => {
    // This function is no longer used but kept to avoid breaking references
    return;
  };

  const addEvent = async () => {
    if (eventName && eventDate) {
      try {
        // Save to database (you'll need to add this method to the service)
        // await availabilityService.saveSpecialDate(eventName, eventDate);
        
        // Then update local state
        const newEvent = { name: eventName, date: eventDate };
        setSpecialDates([...specialDates, newEvent]);
        setEventName('');
        setEventDate('');
        setModalVisible2(false);
        
        Alert.alert('Success', 'Special date added successfully');
      } catch (error) {
        console.error('Failed to save special date:', error);
        Alert.alert('Error', 'Failed to add special date. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const deleteEvent = async (eventDate) => {
    try {
      setSpecialDates(prev => prev.filter(event => event.date !== eventDate));
      Alert.alert('Success', 'Special date removed');
    } catch (error) {
      console.error('Failed to delete special date:', error);
      Alert.alert('Error', 'Failed to remove special date. Please try again.');
    }
  };

const deleteSlot = (slotId) => {
  // This function is no longer used but kept to avoid breaking references
  return;
};

// Add this new function to handle actual deletion
const confirmDeleteSlot = async () => {
  // This function is no longer used but kept to avoid breaking references
  return;
};

const saveTimeSlotsToDatabase = async () => {
  // This function is no longer used but kept to avoid breaking references
  return;
};

  const cancelTimeSlotEditing = () => {
    setModalVisible(false);
  };

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
            <View>
              <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('DoctorHomePage')}}>
                <Ionicons name="home-outline" size={15} color={"#fffefe"} style={{marginTop: 2}}/>
                <Text style={[homeStyle.navFont, {fontWeight: '400'}]}>Home</Text>
              </TouchableOpacity>
            </View>


            <View>
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

                {showAppointmentsDropdown && (
                <View style={{ marginLeft: 25, marginTop: 5 }}>
                    <View >
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('DoctorSchedule')}}>
                        <Ionicons name="calendar-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                        <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Schedule</Text>
                    </TouchableOpacity>
                    </View>

                    <View style={[isActive ? homeStyle.subSelectedGlass : null, {width: '100%'}]}>
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
                        <View style={[apStyle.whiteContainer, {padding: 0, flex: 2}]}>
                        <LinearGradient
                            colors={['#3db6ee', '#3d67ee', '#0738D9', '#0f3bca', '#3db6ee']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                borderRadius: 16,
                                padding: 20,
                                marginBottom: 0,
                                height: '100%',
                            }}
                        >
                            <Calendar 
                                monthFormat={'MMMM yyyy'}
                                current={new Date().toISOString().split('T')[0]}
                                onDayPress={(day) => {
                                    console.log('selected day', day);
                                    setSelectedCalendarDate(day.dateString);
                                }}
                                markedDates={{
                                    ...bookedDates,
                                    ...(selectedCalendarDate ? {
                                        [selectedCalendarDate]: {
                                            selected: true,
                                            selectedColor: '#ffffff',
                                            selectedTextColor: '#3d67ee'
                                        }
                                    } : {})
                                }}
                                
                                theme={{
                                    calendarBackground: 'transparent',
                                    textSectionTitleColor: 'rgba(255,255,255,0.7)',
                                    selectedDayBackgroundColor: '#ffffff',
                                    selectedDayTextColor: '#3d67ee',
                                    todayTextColor: '#ffffff',
                                    todayBackgroundColor: 'rgba(255,255,255,0.2)',
                                    dayTextColor: '#ffffff',
                                    textDisabledColor: 'rgba(255,255,255,0.3)',
                                    monthTextColor: '#ffffff',
                                    arrowColor: '#ffffff',
                                    textDayFontFamily: 'Segoe UI',
                                    textMonthFontFamily: 'Segoe UI',
                                    textDayHeaderFontFamily: 'Segoe UI',
                                    textDayFontWeight: '400',
                                    textMonthFontWeight: '700',
                                    textDayHeaderFontWeight: '500',
                                    textDayFontSize: 14,
                                    textMonthFontSize: 20,
                                    textDayHeaderFontSize: 13,
                                    dotStyle: {
                                        width: 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: '#ffffff',
                                    },
                                    'stylesheet.calendar.header': {
                                        week: {
                                            marginTop: 10,
                                            flexDirection: 'row',
                                            justifyContent: 'space-around',
                                        },
                                        monthText: {
                                            color: '#ffffff',
                                            fontSize: 20,
                                            fontWeight: '700',
                                        },
                                        arrow: {
                                            padding: 10,
                                        },
                                        header: {
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingHorizontal: 10,
                                        },
                                    },
                                    'stylesheet.day.basic': {
                                        base: {
                                            width: 32,
                                            height: 32,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 16,
                                        },
                                        today: {
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            borderRadius: 16,
                                        },
                                        todayText: {
                                            color: '#ffffff',
                                            fontWeight: '600',
                                        },
                                    },
                                }}
                                style={{
                                    borderRadius: 8,
                                    width: '100%',
                                    height: 250,
                                    alignSelf: 'center',
                                }}
                            />
                        </LinearGradient>
                    </View>
            
            <View style={[apStyle.whiteContainer, {flex: 1}]}>
              <Text style={{fontFamily: 'Segoe UI', fontSize: 18, fontWeight: '700'}}>Special Dates</Text>
              <ScrollView style={{ marginTop: 10 }}>
                <DataTable>
                  {specialDates.map((item, index) => (
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
              <Text style={{fontSize: 28, fontWeight: 700}}>Availability Settings</Text>
              <Text style={{fontSize: 14, marginTop: 10, opacity: 0.5}}>Manage available days, working hours, and appointment slots for vet bookings.</Text>

              {/* SUNDAY */}
              <View style={{flexDirection: 'row', marginTop: 30, alignItems: 'center', opacity: dayAvailability.sunday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.sunday}
                  onValueChange={() => handleDayToggle('sunday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                  disabled={true}  // DISABLED - cannot toggle
                />
                <Text style={{fontSize: 16, color: dayAvailability.sunday ? '#19c928' : '#666'}}>Sunday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.sunday && openTimeSlotModalForDay('sunday')} 
                  disabled={!dayAvailability.sunday}
                  style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-end', 
                    flex: 1, 
                    marginRight: 10, 
                    marginTop: 8,
                    opacity: dayAvailability.sunday ? 1 : 0.5
                  }}
                >
                  <Text style={{
                    fontSize: 15, 
                    color: dayAvailability.sunday ? '#3d67ee' : '#999'
                  }}>
                    Time Slot
                  </Text>
                  <Ionicons 
                    name="alarm-outline" 
                    size={18} 
                    color={dayAvailability.sunday ? '#3d67ee' : '#999'} 
                    style={{ marginTop: 1, marginLeft: 10 }} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: 'rgba(0, 0, 0, 0.24)', marginVertical: 10, marginTop: 20, marginBottom: 10 }} />

              {/* MONDAY */}
              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.monday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.monday}
                  onValueChange={() => handleDayToggle('monday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                  disabled={true}  // DISABLED - cannot toggle
                />
                <Text style={{fontSize: 16, color: dayAvailability.monday ? '#19c928' : '#666'}}>Monday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.monday && openTimeSlotModalForDay('monday')} 
                  disabled={!dayAvailability.monday}
                  style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-end', 
                    flex: 1, 
                    marginRight: 10, 
                    marginTop: 8,
                    opacity: dayAvailability.monday ? 1 : 0.5
                  }}
                >
                  <Text style={{
                    fontSize: 15, 
                    color: dayAvailability.monday ? '#3d67ee' : '#999'
                  }}>
                    Time Slot
                  </Text>
                  <Ionicons 
                    name="alarm-outline" 
                    size={18} 
                    color={dayAvailability.monday ? '#3d67ee' : '#999'} 
                    style={{ marginTop: 1, marginLeft: 10 }} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 15, marginBottom: 10 }} />

              {/* TUESDAY */}
              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.tuesday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.tuesday}
                  onValueChange={() => handleDayToggle('tuesday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                  disabled={true}  // DISABLED - cannot toggle
                />
                <Text style={{fontSize: 16, color: dayAvailability.tuesday ? '#19c928' : '#666'}}>Tuesday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.tuesday && openTimeSlotModalForDay('tuesday')} 
                  disabled={!dayAvailability.tuesday}
                  style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-end', 
                    flex: 1, 
                    marginRight: 10, 
                    marginTop: 8,
                    opacity: dayAvailability.tuesday ? 1 : 0.5
                  }}
                >
                  <Text style={{
                    fontSize: 15, 
                    color: dayAvailability.tuesday ? '#3d67ee' : '#999'
                  }}>
                    Time Slot
                  </Text>
                  <Ionicons 
                    name="alarm-outline" 
                    size={18} 
                    color={dayAvailability.tuesday ? '#3d67ee' : '#999'} 
                    style={{ marginTop: 1, marginLeft: 10 }} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 15, marginBottom: 10 }} />

              {/* WEDNESDAY */}
              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.wednesday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.wednesday}
                  onValueChange={() => handleDayToggle('wednesday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                  disabled={true}  // DISABLED - cannot toggle
                />
                <Text style={{fontSize: 16, color: dayAvailability.wednesday ? '#19c928' : '#666'}}>Wednesday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.wednesday && openTimeSlotModalForDay('wednesday')} 
                  disabled={!dayAvailability.wednesday}
                  style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-end', 
                    flex: 1, 
                    marginRight: 10, 
                    marginTop: 8,
                    opacity: dayAvailability.wednesday ? 1 : 0.5
                  }}
                >
                  <Text style={{
                    fontSize: 15, 
                    color: dayAvailability.wednesday ? '#3d67ee' : '#999'
                  }}>
                    Time Slot
                  </Text>
                  <Ionicons 
                    name="alarm-outline" 
                    size={18} 
                    color={dayAvailability.wednesday ? '#3d67ee' : '#999'} 
                    style={{ marginTop: 1, marginLeft: 10 }} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 15, marginBottom: 10 }} />

              {/* THURSDAY */}
              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.thursday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.thursday}
                  onValueChange={() => handleDayToggle('thursday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                  disabled={true}  // DISABLED - cannot toggle
                />
                <Text style={{fontSize: 16, color: dayAvailability.thursday ? '#19c928' : '#666'}}>Thursday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.thursday && openTimeSlotModalForDay('thursday')} 
                  disabled={!dayAvailability.thursday}
                  style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-end', 
                    flex: 1, 
                    marginRight: 10, 
                    marginTop: 8,
                    opacity: dayAvailability.thursday ? 1 : 0.5
                  }}
                >
                  <Text style={{
                    fontSize: 15, 
                    color: dayAvailability.thursday ? '#3d67ee' : '#999'
                  }}>
                    Time Slot
                  </Text>
                  <Ionicons 
                    name="alarm-outline" 
                    size={18} 
                    color={dayAvailability.thursday ? '#3d67ee' : '#999'} 
                    style={{ marginTop: 1, marginLeft: 10 }} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 15, marginBottom: 10 }} />

              {/* FRIDAY */}
              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.friday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.friday}
                  onValueChange={() => handleDayToggle('friday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                  disabled={true}  // DISABLED - cannot toggle
                />
                <Text style={{fontSize: 16, color: dayAvailability.friday ? '#19c928' : '#666'}}>Friday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.friday && openTimeSlotModalForDay('friday')} 
                  disabled={!dayAvailability.friday}
                  style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-end', 
                    flex: 1, 
                    marginRight: 10, 
                    marginTop: 8,
                    opacity: dayAvailability.friday ? 1 : 0.5
                  }}
                >
                  <Text style={{
                    fontSize: 15, 
                    color: dayAvailability.friday ? '#3d67ee' : '#999'
                  }}>
                    Time Slot
                  </Text>
                  <Ionicons 
                    name="alarm-outline" 
                    size={18} 
                    color={dayAvailability.friday ? '#3d67ee' : '#999'} 
                    style={{ marginTop: 1, marginLeft: 10 }} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ height: 0.5, backgroundColor: '#0000003d', marginVertical: 10, marginTop: 15, marginBottom: 10 }} />

              {/* SATURDAY */}
              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.saturday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.saturday}
                  onValueChange={() => handleDayToggle('saturday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                  disabled={true}  // DISABLED - cannot toggle
                />
                <Text style={{fontSize: 16, color: dayAvailability.saturday ? '#19c928' : '#666'}}>Saturday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.saturday && openTimeSlotModalForDay('saturday')} 
                  disabled={!dayAvailability.saturday}
                  style={{
                    flexDirection: 'row', 
                    justifyContent: 'flex-end', 
                    flex: 1, 
                    marginRight: 10, 
                    marginTop: 8,
                    opacity: dayAvailability.saturday ? 1 : 0.5
                  }}
                >
                  <Text style={{
                    fontSize: 15, 
                    color: dayAvailability.saturday ? '#3d67ee' : '#999'
                  }}>
                    Time Slot
                  </Text>
                  <Ionicons 
                    name="alarm-outline" 
                    size={18} 
                    color={dayAvailability.saturday ? '#3d67ee' : '#999'} 
                    style={{ marginTop: 1, marginLeft: 10 }} 
                  />
                </TouchableOpacity>
              </View>

          
              {/* TIME SLOTS MODAL - READ-ONLY VIEW */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => cancelTimeSlotEditing()}
              >
                <View style={apStyle.overlay}>
                  <View style={[apStyle.modalContainer, {width: '40%', padding: 30}]}>
                    <Text style={apStyle.title}>
                      {currentEditingDay 
                        ? `Time Slots for ${currentEditingDay.charAt(0).toUpperCase() + currentEditingDay.slice(1)}`
                        : 'Time Slots'}
                    </Text>
                    
                    {loadingTimeSlots ? (
                      <View style={{ alignItems: 'center', padding: 20 }}>
                        <Text>Loading time slots...</Text>
                      </View>
                    ) : (
                      <>
                        
                        <View style={{ marginTop: 20 }}>
                          {currentEditingDay && timeSlotsByDay[currentEditingDay] && (
                            <DataTable>
                              <DataTable.Header>
                                <DataTable.Title>Start Time</DataTable.Title>
                                <DataTable.Title>End Time</DataTable.Title>
                                <DataTable.Title numeric>Capacity</DataTable.Title>
                              </DataTable.Header>

                              {timeSlotsByDay[currentEditingDay].length === 0 ? (
                                <DataTable.Row>
                                  <DataTable.Cell colSpan={3}>
                                    <Text style={{ textAlign: 'center', fontStyle: 'italic', color: '#999' }}>
                                      No time slots for this day
                                    </Text>
                                  </DataTable.Cell>
                                </DataTable.Row>
                              ) : (
                                timeSlotsByDay[currentEditingDay].map((item, index) => (
                                  <DataTable.Row key={item.id || index}>
                                    <DataTable.Cell>
                                      <Text>{item.startTime || ''}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell>
                                      <Text>{item.endTime || ''}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric>
                                      <Text>{item.capacity || 1}</Text>
                                    </DataTable.Cell>
                                  </DataTable.Row>
                                ))
                              )}
                            </DataTable>
                          )}
                          
                          {currentEditingDay && timeSlotsByDay[currentEditingDay] && (
                            <Text style={{ marginTop: 20, fontSize: 12, color: '#666', textAlign: 'center' }}>
                              {timeSlotsByDay[currentEditingDay].length} time slot(s) available for {currentEditingDay.charAt(0).toUpperCase() + currentEditingDay.slice(1)}
                            </Text>
                          )}
                        </View>

                        {/* Footer - Only Cancel/Close button */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                          <TouchableOpacity onPress={cancelTimeSlotEditing}>
                            <Text style={{ color: '#3d67ee', fontWeight: '600', fontSize: 16 }}>Close</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </Modal>

              {/* ADD SPECIAL DATE MODAL */}
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
                      placeholder="Event Date (e.g. 2026-02-14)"
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

                            {/* Custom Delete Confirmation Modal - No longer used but kept for reference */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={deleteConfirmationVisible}
                onRequestClose={() => setDeleteConfirmationVisible(false)}
              >
                <View style={{ 
                  flex: 1, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor: 'rgba(0,0,0,0.5)' 
                }}>
                  <View style={{ 
                    width: '40%', 
                    backgroundColor: '#fff', 
                    borderRadius: 10, 
                    padding: 20,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
                      Delete Time Slot
                    </Text>
                    
                    <Text style={{ fontSize: 16, marginBottom: 20 }}>
                      Are you sure you want to delete {slotToDelete ? `${slotToDelete.startTime} - ${slotToDelete.endTime}` : 'this time slot'}?
                    </Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <TouchableOpacity 
                        onPress={() => {
                          setDeleteConfirmationVisible(false);
                          setSlotToDelete(null);
                        }}
                        style={{ 
                          paddingVertical: 8, 
                          paddingHorizontal: 16, 
                          marginRight: 10,
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0'
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>Cancel</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={confirmDeleteSlot}
                        style={{ 
                          paddingVertical: 8, 
                          paddingHorizontal: 16, 
                          borderRadius: 5,
                          backgroundColor: '#ff4444'
                        }}
                      >
                        <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View> 
          </View>  
        </View>  
      </View>  
    </View> 
  );
}