import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, ScrollView, Alert, Platform } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'; // Added useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import homeStyle from '../styles/HomeStyle';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import apStyle from '../styles/AppointmentStyles';
import { availabilityService } from './availabilityService';

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

export default function AvailSettings() {
  const ns = useNavigation();
  const route = useRoute();
  const isActive = route.name === 'AvailSettings';

  const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

  const [currentUser, setCurrentUser] = useState(null);

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);

  // LOGOUT POPUP STATE
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'info', title: '', message: '', onConfirm: null, showCancel: false });

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

  const [currentEditingDay, setCurrentEditingDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  // SHOW ALERT HELPER
  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setModalConfig({ type, title, message, onConfirm, showCancel });
    setLogoutModalVisible(true);
  };

  // LOGOUT FUNCTION WITH AUDIT
  const handleLogoutPress = () => {
    showAlert('confirm', 'Log Out', 'Are you sure you want to log out?', async () => {
      try {
        if (currentUser) {
          console.log("Sending logout audit for:", currentUser.username);
          await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id || currentUser.pk, 
              userType: 'EMPLOYEE', 
              username: currentUser.username || currentUser.fullName,
              role: currentUser.role
            })
          });
        }
      } catch (error) {
        console.error("Logout audit failed:", error);
      }

      await AsyncStorage.removeItem('userSession'); 
      setCurrentUser(null);
      ns.navigate('Login'); 
    }, true); 
  };

  // SESSION LOADING EFFECT
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const session = await AsyncStorage.getItem('userSession');
          if (session) {
            setCurrentUser(JSON.parse(session));
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Failed to load user session", error);
        }
      };
      loadUser();
    }, [])
  );

  useEffect(() => {
    loadInitialData();
    loadAppointmentsForCalendar(); 
  }, []);

  const loadInitialData = async () => {
    try {
      const dayData = await availabilityService.getDayAvailability();
      setDayAvailability(dayData);
      
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
    }
  };

  const loadAppointmentsForCalendar = async () => {
    try {
      const appointments = await availabilityService.getAppointmentsForTable();
      const booked = {};
      appointments.forEach(app => {
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

  const handleDayToggle = async (dayName) => {
    const dayKey = dayName.toLowerCase();
    const newValue = !dayAvailability[dayKey];
    
    setDayAvailability(prev => ({
      ...prev,
      [dayKey]: newValue
    }));
    
    try {
      await availabilityService.saveDayAvailability(dayKey, newValue);
    } catch (error) {
      setDayAvailability(prev => ({
        ...prev,
        [dayKey]: !newValue
      }));
      console.error('Failed to save day availability:', error);
    }
  };

  const openTimeSlotModalForDay = async (dayName) => {
    const dayKey = dayName.toLowerCase();
    setCurrentEditingDay(dayKey);
    setModalVisible(true);
    setStartTime('');
    setEndTime('');
    setLoadingTimeSlots(true);
    
    try {
      const existingSlots = await availabilityService.getTimeSlotsForDay(dayKey);
      const formattedSlots = existingSlots.map(slot => ({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        capacity: slot.capacity
      }));
      
      setTimeSlotsByDay(prev => ({
        ...prev,
        [dayKey]: formattedSlots
      }));
      
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const addSlot = () => {
    if (!currentEditingDay || !startTime.trim() || !endTime.trim()) {
      return;
    }
    
    const convertToMinutes = (timeStr) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
      }
      return 0;
    };

    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return;
    }
    
    const currentSlots = timeSlotsByDay[currentEditingDay] || [];
    const hasOverlap = currentSlots.some(slot => {
      const slotStart = convertToMinutes(slot.startTime);
      const slotEnd = convertToMinutes(slot.endTime);
      return (startMinutes < slotEnd && endMinutes > slotStart);
    });

    if (hasOverlap) {
      return;
    }
    
    const newSlot = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      startTime: startTime,
      endTime: endTime,
      capacity: 1
    };
    
    setTimeSlotsByDay(prev => {
      const currentSlots = prev[currentEditingDay] || [];
      const slotExists = currentSlots.some(slot => 
        slot.startTime === startTime && slot.endTime === endTime
      );
      
      if (slotExists) return prev;
      
      const updatedSlots = [...currentSlots, newSlot].sort((a, b) => {
        const aMinutes = convertToMinutes(a.startTime);
        const bMinutes = convertToMinutes(b.startTime);
        return aMinutes - bMinutes;
      });
      
      return {
        ...prev,
        [currentEditingDay]: updatedSlots
      };
    });
    
    setStartTime('');
    setEndTime('');
  };

  const addEvent = async () => {
    if (eventName && eventDate) {
      try {
        const newEvent = { name: eventName, date: eventDate };
        setSpecialDates([...specialDates, newEvent]);
        setEventName('');
        setEventDate('');
        setModalVisible2(false);
      } catch (error) {
        console.error('Failed to save special date:', error);
      }
    }
  };

  const deleteSlot = (slotId) => {
    if (!currentEditingDay) return;
    
    const slot = timeSlotsByDay[currentEditingDay].find(s => s.id === slotId);
    if (!slot) return;
    
    setSlotToDelete(slot);
    setDeleteConfirmationVisible(true);
  };

  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;
    const slotId = slotToDelete.id;
    
    try {
      if (slotId.toString().startsWith('temp-')) {
        setTimeSlotsByDay(prev => {
          const updatedSlots = prev[currentEditingDay].filter(s => s.id !== slotId);
          return {
            ...prev,
            [currentEditingDay]: updatedSlots
          };
        });
      } else {
        await availabilityService.deleteTimeSlot(slotId);
        setTimeSlotsByDay(prev => {
          const updatedSlots = prev[currentEditingDay].filter(s => s.id !== slotId);
          return {
            ...prev,
            [currentEditingDay]: updatedSlots
          };
        });
      }
      setDeleteConfirmationVisible(false);
      setSlotToDelete(null);
    } catch (error) {
      console.error('Failed to delete slot:', error);
    }
  };

  const saveTimeSlotsToDatabase = async () => {
    if (!currentEditingDay) {
      setModalVisible(false);
      return;
    }
    
    try {
      const currentSlots = timeSlotsByDay[currentEditingDay] || [];
      const slotsToSave = currentSlots.map(slot => {
        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: slot.capacity || 1
        };
      });
      
      await availabilityService.saveTimeSlots(currentEditingDay, slotsToSave);
      
      setModalVisible(false);
      setStartTime('');
      setEndTime('');
      
      const updatedSlots = await availabilityService.getTimeSlotsForDay(currentEditingDay);
      const formattedSlots = updatedSlots.map(slot => ({
        id: slot.id, 
        startTime: slot.start_time,
        endTime: slot.end_time,
        capacity: slot.capacity
      }));
      
      setTimeSlotsByDay(prev => ({
        ...prev,
        [currentEditingDay]: formattedSlots
      }));
    } catch (error) {
      console.error('Failed to save time slots:', error);
    }
  };

  const cancelTimeSlotEditing = () => {
    if (currentEditingDay) {
      availabilityService.getTimeSlotsForDay(currentEditingDay)
        .then(existingSlots => {
          const formattedSlots = existingSlots.map(slot => ({
            id: slot.id,
            startTime: slot.start_time,
            endTime: slot.end_time,
            capacity: slot.capacity
          }));
          
          setTimeSlotsByDay(prev => ({
            ...prev,
            [currentEditingDay]: formattedSlots
          }));
        })
        .catch(error => {
          setTimeSlotsByDay(prev => ({
            ...prev,
            [currentEditingDay]: []
          }));
        });
    }
    
    setModalVisible(false);
    setStartTime('');
    setEndTime('');
  };

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

          <View style={[homeStyle.glassContainer, {paddingLeft: 8}]}>
            <View style={[homeStyle.navAccount, {gap: 8}]}>
              <Image 
                source={(currentUser && currentUser.userImage) 
                  ? { uri: currentUser.userImage } 
                  : require('../assets/userImg.jpg')} 
                style={{ width: 35, height: 35, borderRadius: 25, marginTop: 2 }}
              />
              <View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                  {currentUser ? currentUser.username : "Loading..."}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>
                  {currentUser ? currentUser.role : "..."}
                </Text>
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
                  <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('Accounts')}}>
                      <Ionicons name="person-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Employees</Text>
                    </TouchableOpacity>
                  </View>

                  <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('UserAccounts')}}>
                      <Ionicons name="medkit-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>Users / Patients</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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

                  <View>
                    <TouchableOpacity style={homeStyle.navBtn} onPress={()=>{ns.navigate('History')}}>
                      <Ionicons name="time-outline" size={14} color={"#fffefe"} style={{marginTop: 2}}/>
                      <Text style={[homeStyle.navFont, {fontWeight: '400', fontSize: 12}]}>History</Text>
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
                      selectedColor: '#3d67ee',
                      selectedTextColor: 'white'
                    }
                  } : {})
                }}
                theme={{
                  'stylesheet.day.basic': {
                    base: {
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    today: {
                      backgroundColor: '#f0f7ff',
                      borderRadius: 16,
                    },
                    todayText: {
                      color: '#3d67ee',
                      fontWeight: '600',
                    },
                  },
                  dotStyle: {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginTop: 2,
                  },
                  selectedDayBackgroundColor: '#3d67ee',
                  selectedDayTextColor: 'white',
                  todayTextColor: '#3d67ee',
                  arrowColor: '#3d67ee',
                  monthTextColor: '#000',
                  textMonthFontWeight: '700',
                  textMonthFontFamily: 'Segoe UI',
                  textMonthFontSize: 20,
                  textDayFontFamily: 'Segoe UI',
                  textDayFontSize: 14,
                  textDisabledColor: '#ccc',
                  dayTextColor: '#2d4150',
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
                />
                <Text style={{fontSize: 16, color: dayAvailability.sunday ? '#000' : '#666'}}>Sunday</Text>

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
                />
                <Text style={{fontSize: 16, color: dayAvailability.monday ? '#000' : '#666'}}>Monday</Text>

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
                />
                <Text style={{fontSize: 16, color: dayAvailability.tuesday ? '#000' : '#666'}}>Tuesday</Text>

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
                />
                <Text style={{fontSize: 16, color: dayAvailability.wednesday ? '#000' : '#666'}}>Wednesday</Text>

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
                />
                <Text style={{fontSize: 16, color: dayAvailability.thursday ? '#000' : '#666'}}>Thursday</Text>

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
                />
                <Text style={{fontSize: 16, color: dayAvailability.friday ? '#000' : '#666'}}>Friday</Text>

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
                />
                <Text style={{fontSize: 16, color: dayAvailability.saturday ? '#000' : '#666'}}>Saturday</Text>

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

          
              {/* TIME SLOTS MODAL */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => cancelTimeSlotEditing()}
              >
                <View style={apStyle.overlay}>
                  <View style={apStyle.modalContainer}>
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
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                          {/* Left Section: Input Fields */}
                          <View style={{ flex: 1, marginRight: 10 }}>
                            <TimeSelector 
                              label="Start Time"
                              value={startTime}
                              onChange={setStartTime}
                            />
                            
                            <TimeSelector 
                              label="End Time"
                              value={endTime}
                              onChange={setEndTime}
                            />
                            
                            
                            <TouchableOpacity onPress={addSlot} style={apStyle.addBtn}>
                              <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add Slot</Text>
                            </TouchableOpacity>
                          </View>

                          {/* Right Section: Table */}
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            {currentEditingDay && timeSlotsByDay[currentEditingDay] && (
                              <DataTable>
                                <DataTable.Header>
                                  <DataTable.Title>Start</DataTable.Title>
                                  <DataTable.Title>End</DataTable.Title>
                                  <DataTable.Title numeric>Capacity</DataTable.Title>
                                  <DataTable.Title numeric>Action</DataTable.Title>
                                </DataTable.Header>

                                {timeSlotsByDay[currentEditingDay].length === 0 ? (
                                  <DataTable.Row>
                                    <DataTable.Cell colSpan={4}>
                                      <Text style={{ textAlign: 'center', fontStyle: 'italic', color: '#999' }}>
                                        No time slots configured
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
                                      <DataTable.Cell numeric>
                                        <TouchableOpacity 
                                          onPress={() => {
                                            console.log('🗑️ Delete icon pressed for slot:', item.id);
                                            console.log('Slot data:', item);
                                            deleteSlot(item.id);
                                          }}
                                          onPressIn={() => console.log('Touch started')}
                                          activeOpacity={0.5}
                                        >
                                          <Ionicons name="trash-outline" size={20} color="red" />
                                        </TouchableOpacity>
                                      </DataTable.Cell>
                                    </DataTable.Row>
                                  ))
                                )}
                              </DataTable>
                            )}
                            
                            {currentEditingDay && timeSlotsByDay[currentEditingDay] && (
                              <Text style={{ marginTop: 10, fontSize: 12, color: '#666', textAlign: 'center' }}>
                                {timeSlotsByDay[currentEditingDay].length} time slot(s) configured
                              </Text>
                            )}
                          </View>
                        </View>

                        {/* Footer Buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                          <TouchableOpacity onPress={cancelTimeSlotEditing}>
                            <Text style={{ color: 'red', fontWeight: '600' }}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={saveTimeSlotsToDatabase}>
                            <Text style={{ color: '#3d67ee', fontWeight: '600' }}>Save Changes</Text>
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

                            {/* Custom Delete Confirmation Modal */}
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

              {/* CUSTOM ALERT MODAL COMPONENT */}
              <Modal
                transparent={true}
                visible={logoutModalVisible}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
              >
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                  <View style={{backgroundColor: 'white', padding: 25, borderRadius: 12, width: '80%', maxWidth: 350, alignItems: 'center', elevation: 5}}>
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
                    
                    <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily: 'Segoe UI', color: 'black'}}>
                      {modalConfig.title}
                    </Text>
                    
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
                      {modalConfig.showCancel && (
                        <TouchableOpacity 
                          onPress={() => setLogoutModalVisible(false)} 
                          style={{paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 100, alignItems: 'center'}}
                        >
                          <Text style={{color: '#333', fontWeight: '600'}}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity 
                        onPress={() => {
                          setLogoutModalVisible(false);
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
          </View>  
        </View>  
      </View>  
    </View> 
  );
}