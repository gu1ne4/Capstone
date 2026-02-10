import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, FlatList, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
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
import { availabilityService } from './availabilityService';

// ========== DATABASE API SERVICE ==========
const API_URL = 'http://localhost:3000'; // Change to your IP if testing on mobile

const VET_ID = 1;

const dbService = {
  async loadAvailabilityData() {
    try {
      const response = await fetch(`${API_URL}/api/availability/${VET_ID}`);
      if (!response.ok) throw new Error('Failed to load availability data');
      const data = await response.json();
      
      // Convert day_availability array to object for easy access
      const dayAvailability = {};
      data.day_availability.forEach(day => {
        dayAvailability[day.day_of_week] = day.is_available;
      });
      
      return {
        dayAvailability,
        timeSlots: data.time_slots,
        specialDates: data.special_dates
      };
    } catch (error) {
      console.error('Error loading availability data:', error);
      return {
        dayAvailability: {
          sunday: false,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false
        },
        timeSlots: [],
        specialDates: []
      };
    }
  },

  // Load time slots for a specific day
  // Load time slots for a specific day
async loadTimeSlotsForDay(dayName) {
  try {
    console.log(`[API] Loading time slots for day: ${dayName}`);
    console.log(`[API] VET_ID: ${VET_ID}`);
    const url = `${API_URL}/api/availability/time-slots/${VET_ID}/${dayName.toLowerCase()}`;
    console.log(`[API] URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`[API] Response status: ${response.status}`);
    console.log(`[API] Response ok: ${response.ok}`);
    
    const responseText = await response.text();
    console.log(`[API] Raw response: ${responseText}`);
    
    if (!response.ok) {
      console.log(`[API] Response not OK: ${response.statusText}`);
      throw new Error(`Failed to load time slots: ${response.statusText}`);
    }
    
    const data = JSON.parse(responseText);
    console.log('[API] Parsed data:', data);
    console.log('[API] Time slots array:', data.timeSlots);
    
    return data.timeSlots || [];
  } catch (error) {
    console.error(`[API] Error loading time slots for ${dayName}:`, error);
    console.error(`[API] Error message:`, error.message);
    return [];
  }
},

  // Save day availability to database
  async saveDayAvailability(dayName, isAvailable) {
    try {
      const response = await fetch(`${API_URL}/api/availability/day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vet_id: VET_ID,
          day_of_week: dayName.toLowerCase(),
          is_available: isAvailable
        })
      });
      
      if (!response.ok) throw new Error('Failed to save day availability');
      return await response.json();
    } catch (error) {
      console.error('Error saving day availability:', error);
      throw error;
    }
  },

  // Save time slots to database
  async saveTimeSlots(dayName, slots) {
    try {
      const response = await fetch(`${API_URL}/api/availability/time-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vet_id: VET_ID,
          day_of_week: dayName.toLowerCase(),
          slots: slots
        })
      });
      
      if (!response.ok) throw new Error('Failed to save time slots');
      return await response.json();
    } catch (error) {
      console.error('Error saving time slots:', error);
      throw error;
    }
  },

  // Delete a specific time slot
  async deleteTimeSlot(slotId) {
    try {
      const response = await fetch(`${API_URL}/api/availability/time-slots/${slotId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete time slot');
      return await response.json();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      throw error;
    }
  },

  // Save special date to database
  async saveSpecialDate(eventName, eventDate) {
    try {
      const response = await fetch(`${API_URL}/api/availability/special-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vet_id: VET_ID,
          event_name: eventName,
          event_date: eventDate,
          is_holiday: false
        })
      });
      
      if (!response.ok) throw new Error('Failed to save special date');
      return await response.json();
    } catch (error) {
      console.error('Error saving special date:', error);
      throw error;
    }
  },

  // Delete special date from database
  async deleteSpecialDate(eventDate) {
    try {
      const response = await fetch(`${API_URL}/api/availability/special-dates/${VET_ID}/${eventDate}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete special date');
      return await response.json();
    } catch (error) {
      console.error('Error deleting special date:', error);
      throw error;
    }
  }
};


const TimeSelector = ({ label, value, onChange }) => {
  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(0);
  const [isAM, setIsAM] = useState(true);

  // Parse existing value or use defaults
  useEffect(() => {
    if (value) {
      const match = value.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const ampm = match[3]?.toUpperCase();
        
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        
        setHours(h > 12 ? h - 12 : h);
        setMinutes(m);
        setIsAM(h < 12);
      }
    }
  }, [value]);

  const updateTime = (newHours, newMinutes, newIsAM) => {
    const hour24 = newIsAM ? (newHours === 12 ? 0 : newHours) : (newHours === 12 ? 12 : newHours + 12);
    const time24 = `${hour24.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
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

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);

  // PER-DAY time slots storage
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
  const [capacity, setCapacity] = useState('');

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

  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const data = await dbService.loadAvailabilityData();
      setDayAvailability(data.dayAvailability);
      setEvents(data.specialDates.map(event => ({
        name: event.event_name,
        date: event.event_date
      })));
      
      // Organize time slots by day
      const organizedSlots = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: []
      };
      
      data.timeSlots.forEach(slot => {
        const day = slot.day_of_week;
        if (organizedSlots[day]) {
          organizedSlots[day].push({
            id: slot.id || `db-${Date.now()}`,
            startTime: slot.start_time || '',
            endTime: slot.end_time || '',
            capacity: slot.capacity || slot.slot_capacity || 1
          });
        }
      });
      
      setTimeSlotsByDay(organizedSlots);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Handle day switch toggle - USING PK IDs
const handleDayToggle = async (dayName) => {
  const dayKey = dayName.toLowerCase();
  
  // Map day name to PK ID
  const dayPkMap = {
    'sunday': 7,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  
  const pkId = dayPkMap[dayKey];
  if (!pkId) return;
  
  const newValue = !dayAvailability[dayKey];
  
  // Update local state immediately for responsive UI
  setDayAvailability(prev => ({
    ...prev,
    [dayKey]: newValue
  }));
  
  try {
    // Send both day_of_week and pk_id for compatibility
    await dbService.saveDayAvailability(dayName, newValue, pkId);
  } catch (error) {
    // Revert local state on error
    setDayAvailability(prev => ({
      ...prev,
      [dayKey]: !newValue
    }));
    
    console.error('Failed to save day availability:', error);
    Alert.alert('Error', 'Failed to update availability. Please try again.');
  }
};

// Update your openTimeSlotModalForDay function:
const openTimeSlotModalForDay = async (dayName) => {
  console.log('=== Opening modal for:', dayName);
  const dayKey = dayName.toLowerCase();
  
  // IMMEDIATELY open the modal with the day name
  setCurrentEditingDay(dayKey);
  setModalVisible(true);
  
  // Reset inputs
  setStartTime('');
  setEndTime('');
  setCapacity('');
  
  // Then load data
  setLoadingTimeSlots(true);
  
  try {
    const existingSlots = await dbService.loadTimeSlotsForDay(dayKey);
    console.log('Loaded slots:', existingSlots);
    
    const formattedSlots = existingSlots.map(slot => ({
      id: slot.id || `db-${Date.now()}`,
      startTime: slot.start_time || slot.startTime || '',
      endTime: slot.end_time || slot.endTime || '',
      capacity: slot.capacity || slot.slot_capacity || 1
    }));
    
    // Update state
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
  console.log('Add slot called. currentEditingDay:', currentEditingDay);
  console.log('Inputs - start:', startTime, 'end:', endTime, 'capacity:', capacity);
  
  if (startTime && endTime && capacity && currentEditingDay) {
    const newSlot = {
      id: `temp-${Date.now()}-${Math.random()}`,
      startTime: startTime,
      endTime: endTime,
      capacity: parseInt(capacity) || 1
    };
    
    console.log('Adding new slot:', newSlot);
    
    // Add to current day's slots
    setTimeSlotsByDay(prev => {
      const currentSlots = prev[currentEditingDay] || [];
      const updated = {
        ...prev,
        [currentEditingDay]: [...currentSlots, newSlot]
      };
      console.log('Updated timeSlotsByDay:', updated);
      return updated;
    });
    
    // Clear input fields
    setStartTime('');
    setEndTime('');
    setCapacity('');
  } else {
    console.log('Cannot add slot - missing:', {
      startTime: !startTime,
      endTime: !endTime,
      capacity: !capacity,
      currentEditingDay: !currentEditingDay
    });
  }
};

  const addEvent = async () => {
  if (eventName && eventDate) {
    try {
      // Save to database first
      await dbService.saveSpecialDate(eventName, eventDate);
      
      // Then update local state
      const newEvent = { name: eventName, date: eventDate };
      setEvents([...events, newEvent]);
      setEventName('');
      setEventDate('');
      setModalVisible2(false);
      
      Alert.alert('Success', 'Special date added successfully');
    } catch (error) {
      console.error('Failed to save special date:', error);
      Alert.alert('Error', 'Failed to add special date. Please try again.');
    }
  }
};

const deleteEvent = async (eventDate) => {
  try {
    await dbService.deleteSpecialDate(eventDate);
    setEvents(prev => prev.filter(event => event.date !== eventDate));
    Alert.alert('Success', 'Special date removed');
  } catch (error) {
    console.error('Failed to delete special date:', error);
    Alert.alert('Error', 'Failed to remove special date. Please try again.');
  }
};

  

// Update the deleteSlot function:
const deleteSlot = (slotId) => {
  if (!currentEditingDay) return;
  
  // Mark slot for deletion instead of immediate deletion
  setTimeSlotsByDay(prev => {
    const updatedSlots = prev[currentEditingDay].map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          markedForDeletion: !slot.markedForDeletion // Toggle deletion mark
        };
      }
      return slot;
    });
    
    return {
      ...prev,
      [currentEditingDay]: updatedSlots
    };
  });
};

// Update the saveTimeSlotsToDatabase function to handle marked slots:
const saveTimeSlotsToDatabase = async () => {
  if (currentEditingDay) {
    try {
      const currentSlots = timeSlotsByDay[currentEditingDay] || [];
      
      // Filter out slots marked for deletion
      const slotsToSave = currentSlots.filter(slot => !slot.markedForDeletion);
      
      // Remove the markedForDeletion property before saving
      const cleanedSlots = slotsToSave.map(({ markedForDeletion, ...slot }) => slot);
      
      await dbService.saveTimeSlots(currentEditingDay, cleanedSlots);
      
      // Update local state to remove deleted slots
      setTimeSlotsByDay(prev => ({
        ...prev,
        [currentEditingDay]: cleanedSlots
      }));
      
      setModalVisible(false);
      setStartTime('');
      setEndTime('');
      setCapacity('');
      
      Alert.alert('Success', `Time slots saved for ${currentEditingDay.charAt(0).toUpperCase() + currentEditingDay.slice(1)}`);
    } catch (error) {
      console.error('Failed to save time slots:', error);
      Alert.alert('Error', 'Failed to save time slots. Please try again.');
    }
  } else {
    setModalVisible(false);
  }
};

      // Update cancelTimeSlotEditing function:
    const cancelTimeSlotEditing = () => {
      // Reload from database to discard ALL changes including deletion marks
      if (currentEditingDay) {
        dbService.loadTimeSlotsForDay(currentEditingDay)
          .then(existingSlots => {
            const formattedSlots = existingSlots.map(slot => ({
              id: slot.id || `db-${Date.now()}`,
              startTime: slot.start_time || '',
              endTime: slot.end_time || '',
              capacity: slot.capacity || slot.slot_capacity || 1
              // No markedForDeletion property when reloading from DB
            }));
            
            setTimeSlotsByDay(prev => ({
              ...prev,
              [currentEditingDay]: formattedSlots
            }));
          })
          .catch(error => {
            console.error('Failed to reload time slots:', error);
            // If reload fails, clear the day's slots
            setTimeSlotsByDay(prev => ({
              ...prev,
              [currentEditingDay]: []
            }));
          });
      }
      
      setModalVisible(false);
      setStartTime('');
      setEndTime('');
      setCapacity('');
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
                <Calendar current={'2026-02-01'}   monthFormat={'MMMM yyyy'}  onDayPress={(day) => {
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
                    textMonthFontSize: 20,

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
              <Text style={{fontSize: 28, fontWeight: 700}}>Availability Settings</Text>
              <Text style={{fontSize: 14, marginTop: 10, opacity: 0.5}}>Manage available days, working hours, and appointment slots for vet bookings.</Text>

 
              <View style={{flexDirection: 'row', marginTop: 30, alignItems: 'center', opacity: dayAvailability.sunday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.sunday}
                  onValueChange={() => handleDayToggle('Sunday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                />
                <Text style={{fontSize: 16, color: dayAvailability.sunday ? '#000' : '#666'}}>Sunday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.sunday && openTimeSlotModalForDay('Sunday')} 
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

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.monday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.monday}
                  onValueChange={() => handleDayToggle('Monday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                />
                <Text style={{fontSize: 16, color: dayAvailability.monday ? '#000' : '#666'}}>Monday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.monday && openTimeSlotModalForDay('Monday')} 
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

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.tuesday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.tuesday}
                  onValueChange={() => handleDayToggle('Tuesday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                />
                <Text style={{fontSize: 16, color: dayAvailability.tuesday ? '#000' : '#666'}}>Tuesday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.tuesday && openTimeSlotModalForDay('Tuesday')} 
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

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.wednesday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.wednesday}
                  onValueChange={() => handleDayToggle('Wednesday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                />
                <Text style={{fontSize: 16, color: dayAvailability.wednesday ? '#000' : '#666'}}>Wednesday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.wednesday && openTimeSlotModalForDay('Wednesday')} 
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

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.thursday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.thursday}
                  onValueChange={() => handleDayToggle('Thursday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                />
                <Text style={{fontSize: 16, color: dayAvailability.thursday ? '#000' : '#666'}}>Thursday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.thursday && openTimeSlotModalForDay('Thursday')} 
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

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.friday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.friday}
                  onValueChange={() => handleDayToggle('Friday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                />
                <Text style={{fontSize: 16, color: dayAvailability.friday ? '#000' : '#666'}}>Friday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.friday && openTimeSlotModalForDay('Friday')} 
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

              <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center', opacity: dayAvailability.saturday ? 1 : 0.6}}>
                <Switch 
                  value={dayAvailability.saturday}
                  onValueChange={() => handleDayToggle('Saturday')}
                  style={{marginLeft: 10, marginRight: 20, marginTop: 2, transform: [{ scaleX: 1 }, { scaleY: 1 }]}}
                />
                <Text style={{fontSize: 16, color: dayAvailability.saturday ? '#000' : '#666'}}>Saturday</Text>

                <TouchableOpacity 
                  onPress={() => dayAvailability.saturday && openTimeSlotModalForDay('Saturday')} 
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
            {/* Left Section: Time Selection */}
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
  
  <TextInput
    placeholder="Client Capacity"
    value={capacity}
    onChangeText={setCapacity}
    keyboardType="numeric"
    style={apStyle.input}
  />
  
  <TouchableOpacity onPress={addSlot} style={apStyle.addBtn}>
    <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add Slot</Text>
  </TouchableOpacity>
</View>

            {/* Right Section: Table */}
            <View style={{ flex: 1, marginLeft: 10 }}>
              {/* Show current day slots directly */}
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
                          <TouchableOpacity onPress={() => deleteSlot(item.id)}>
                            <Ionicons name="trash-outline" size={16} color="red" />
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
    </View> 
  )
}