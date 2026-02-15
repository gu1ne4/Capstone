import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, ScrollView, Alert } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
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
// [file name]: Schedule.jsx (UPDATED CREATE APPOINTMENT MODAL SECTION)
// Add this import at the top with other imports
import { availabilityService } from './availabilityService';

// Update the CreateAppointmentModal component inside Schedule.jsx
const CreateAppointmentModal = ({ visible, onClose, onSubmit }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [appointmentType, setAppointmentType] = useState('');
    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('');
    const [petGender, setPetGender] = useState('');
    const [reasonForVisit, setReasonForVisit] = useState(''); // NEW STATE
    
    // NEW STATE FOR AVAILABILITY
    const [dayAvailability, setDayAvailability] = useState(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
    const [specialDates, setSpecialDates] = useState([]);

    // Initialize when modal opens
    useEffect(() => {
        if (visible) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayString = `${year}-${month}-${day}`;
            setSelectedDate(todayString);
            
            // Load day availability
            loadDayAvailability();
            
            // Load initial time slots for today
            const dayName = availabilityService.getDayNameFromDate(todayString);
            loadTimeSlotsForDay(dayName);
        } else {
            // Reset form when closing
            setSelectedDate('');
            setSelectedTimeSlot('');
            setAppointmentType('');
            setPatientName('');
            setPatientEmail('');
            setPatientPhone('');
            setPetName('');
            setPetType('');
            setPetGender('');
            setReasonForVisit(''); // Reset reason
            setAvailableTimeSlots([]);
            setDayAvailability(null);
            setSpecialDates([]);
        }
    }, [visible]);

    const loadDayAvailability = async () => {
        try {
            // Get day availability using the service
            const dayData = await availabilityService.getDayAvailability();
            console.log('Loaded day availability:', dayData);
            setDayAvailability(dayData);
            
            // You can also load special dates here if you have them
            // const specials = await availabilityService.getSpecialDates();
            // setSpecialDates(specials);
        } catch (error) {
            console.error('Failed to load day availability:', error);
        }
    };

    const loadTimeSlotsForDay = async (dayName) => {
        if (!dayName || !selectedDate) return;
        
        setLoadingTimeSlots(true);
        try {
            // Load the time slots for this day
            const slots = await availabilityService.getTimeSlotsForDay(dayName);
            console.log('Loaded time slots for', dayName, ':', slots);
            
            // For each slot, check availability for the specific selectedDate
            const formattedSlotsWithAvailability = await Promise.all(
                slots.map(async (slot) => {
                    // Get availability for THIS SPECIFIC DATE
                    const slotAvailability = await availabilityService.getBookedSlotsCount(slot.id, selectedDate);
                    
                    // Format time for display
                    const formatTime = (timeStr) => {
                        if (!timeStr) return '';
                        const [hours, minutes] = timeStr.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                    };
                    
                    return {
                        id: slot.id,
                        displayText: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,
                        startTime: slot.start_time,
                        endTime: slot.end_time,
                        capacity: slot.capacity || 1,
                        bookedCount: slotAvailability.bookedCount || 0,
                        availableSlots: slotAvailability.availableSlots || 0
                    };
                })
            );
            
            // Filter out slots that have 0 available slots (fully booked)
            const availableSlots = formattedSlotsWithAvailability.filter(slot => slot.availableSlots > 0);
            
            setAvailableTimeSlots(availableSlots);
            setSelectedTimeSlot(''); // Reset selected time slot when day changes
        } catch (error) {
            console.error('Failed to load time slots:', error);
            setAvailableTimeSlots([]);
        } finally {
            setLoadingTimeSlots(false);
        }
    };

    // Refresh time slots when date changes
    const refreshTimeSlotAvailability = async () => {
        if (!selectedDate) return;
        
        const dayName = availabilityService.getDayNameFromDate(selectedDate);
        if (!dayName) return;
        
        setLoadingTimeSlots(true);
        try {
            const slots = await availabilityService.getTimeSlotsForDay(dayName);
            
            const formattedSlotsWithAvailability = await Promise.all(
                slots.map(async (slot) => {
                    const slotAvailability = await availabilityService.getBookedSlotsCount(slot.id, selectedDate);
                    
                    const formatTime = (timeStr) => {
                        if (!timeStr) return '';
                        const [hours, minutes] = timeStr.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                    };
                    
                    return {
                        id: slot.id,
                        displayText: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,
                        startTime: slot.start_time,
                        endTime: slot.end_time,
                        capacity: slot.capacity || 1,
                        bookedCount: slotAvailability.bookedCount || 0,
                        availableSlots: slotAvailability.availableSlots || 0
                    };
                })
            );
            
            const availableSlots = formattedSlotsWithAvailability.filter(slot => slot.availableSlots > 0);
            setAvailableTimeSlots(availableSlots);
            
            // If current selected slot is no longer available, clear it
            if (selectedTimeSlot) {
                const currentSlot = formattedSlotsWithAvailability.find(slot => slot.displayText === selectedTimeSlot);
                if (!currentSlot || currentSlot.availableSlots <= 0) {
                    setSelectedTimeSlot('');
                    Alert.alert('Slot Unavailable', 'The previously selected time slot is no longer available.');
                }
            }
        } catch (error) {
            console.error('Failed to refresh time slots:', error);
        } finally {
            setLoadingTimeSlots(false);
        }
    };

    // Call this whenever selectedDate changes
    useEffect(() => {
        if (selectedDate) {
            refreshTimeSlotAvailability();
        }
    }, [selectedDate]);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'Select Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if a date is disabled based on day availability
    const isDateDisabled = (dateString) => {
        if (!dayAvailability || !dateString) return true;
        
        // Get day name from date
        const dayName = availabilityService.getDayNameFromDate(dateString);
        
        // Check if this day is available in the database
        const isAvailable = dayAvailability[dayName];
        
        // Return true if day is NOT available
        return !isAvailable;
    };

    // Get marked dates for calendar
    const getMarkedDates = () => {
        const markedDates = {};
        const today = new Date();
        
        if (selectedDate) {
            markedDates[selectedDate] = {
                selected: true,
                selectedColor: '#3d67ee',
                selectedTextColor: 'white'
            };
        }
        
        // Mark disabled dates for the next 90 days based on day availability
        if (dayAvailability) {
            for (let i = 0; i < 90; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;
                const dayName = availabilityService.getDayNameFromDate(dateString);
                
                // Check if this day is available
                const isDayAvailable = dayAvailability[dayName];
                
                if (!isDayAvailable) {
                    markedDates[dateString] = {
                        disabled: true,
                        disableTouchEvent: true,
                        dotColor: 'transparent'
                    };
                }
            }
        }
        
        return markedDates;
    };

    // Handle date selection
    const handleDateSelect = (day) => {
        const dateString = day.dateString;
        
        // Check if date is disabled
        if (isDateDisabled(dateString)) {
            Alert.alert('Date Not Available', 'This date is not available for appointments.');
            return;
        }
        
        setSelectedDate(dateString);
        
        // Load time slots for the selected day
        const dayName = availabilityService.getDayNameFromDate(dateString);
        loadTimeSlotsForDay(dayName);
    };

    const isTimeSlotFullyBooked = (slotId) => {
        const slot = availableTimeSlots.find(s => s.id === slotId);
        if (!slot) return true;
        return slot.availableSlots <= 0;
    };

    // Handle time slot selection
    const handleTimeSlotSelect = (slotId) => {
        if (isTimeSlotFullyBooked(slotId)) {
            Alert.alert('Slot Full', 'This time slot is fully booked. Please select another time.');
            return;
        }
        
        const slot = availableTimeSlots.find(s => s.id === slotId);
        if (slot) {
            setSelectedTimeSlot(slot.displayText);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!patientName.trim()) {
            Alert.alert('Error', 'Please enter patient name');
            return;
        }
        if (!appointmentType) {
            Alert.alert('Error', 'Please select appointment type');
            return;
        }
        if (!selectedDate) {
            Alert.alert('Error', 'Please select a date');
            return;
        }
        if (!selectedTimeSlot) {
            Alert.alert('Error', 'Please select a time slot');
            return;
        }

        // Check if the selected time slot is still available
        const selectedSlot = availableTimeSlots.find(slot => 
            slot.displayText === selectedTimeSlot
        );
        
        if (!selectedSlot) {
            Alert.alert('Error', 'Selected time slot is no longer available');
            return;
        }
        
        if (selectedSlot.availableSlots <= 0) {
            Alert.alert('Slot Full', 'This time slot is now fully booked. Please select another time.');
            return;
        }

        try {
            // Create appointment data with reason for visit
            const appointmentData = {
                patientName,
                patientEmail,
                patientPhone,
                petName,
                petType,
                petGender,
                appointmentType,
                reasonForVisit, // Include reason in appointment data
                selectedDate,
                timeSlotId: selectedSlot.id,
                timeSlotDisplay: selectedSlot.displayText
            };

            // Call the API to create the appointment
            await availabilityService.createAppointment(appointmentData);
            
            // Reset form
            setPatientName('');
            setPatientEmail('');
            setPatientPhone('');
            setPetName('');
            setPetType('');
            setPetGender('');
            setReasonForVisit('');
            setAppointmentType('');
            setSelectedDate('');
            setSelectedTimeSlot('');
            
            // Close the modal
            onClose();

        } catch (error) {
            console.error('Error creating appointment:', error);
            Alert.alert('Error', error.message || 'Failed to create appointment. Please try again.');
        }
    };

    // Render time slot with availability indicator (REMOVED the "X left" badge)
    const renderTimeSlot = (slot) => {
        const isFullyBooked = slot.availableSlots <= 0;
        const isSelected = selectedTimeSlot === slot.displayText;
        
        return (
            <TouchableOpacity
                key={slot.id}
                style={[
                    apStyle.timeSlot,
                    isSelected && apStyle.selectedTimeSlot,
                    isFullyBooked && apStyle.disabledTimeSlot
                ]}
                onPress={() => !isFullyBooked && handleTimeSlotSelect(slot.id)}
                disabled={isFullyBooked}
            >
                <Text style={[
                    apStyle.timeSlotText,
                    isSelected && apStyle.selectedTimeSlotText,
                    isFullyBooked && apStyle.disabledTimeSlotText
                ]}>
                    {slot.displayText}
                </Text>
                {/* REMOVED the badge showing available slots */}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={apStyle.modalOverlay}>
                <View style={[apStyle.modalContent, { maxHeight: '90%', width: '95%' }]}>
                    <View style={apStyle.modalHeader}>
                        <Text style={apStyle.modalTitle}>Create New Appointment</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
                        {/* Patient Information */}
                        <View style={apStyle.formSection}>
                            <Text style={apStyle.sectionTitle}>Patient Information</Text>
                            
                            <View style={[apStyle.formRow, {gap: 20}]}>
                                <View style={apStyle.formGroup}>
                                    <Text style={apStyle.formLabel}>Full Name *</Text>
                                    <TextInput
                                        style={apStyle.formInput}
                                        value={patientName}
                                        onChangeText={setPatientName}
                                        placeholder="Enter patient name"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                
                                <View style={apStyle.formGroup}>
                                    <Text style={apStyle.formLabel}>Email</Text>
                                    <TextInput
                                        style={apStyle.formInput}
                                        value={patientEmail}
                                        onChangeText={setPatientEmail}
                                        placeholder="Enter email address"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>
                            
                            <View style={apStyle.formRow}>
                                <View style={apStyle.formGroup}>
                                    <Text style={apStyle.formLabel}>Phone Number</Text>
                                    <TextInput
                                        style={apStyle.formInput}
                                        value={patientPhone}
                                        onChangeText={setPatientPhone}
                                        placeholder="Enter phone number"
                                        placeholderTextColor="#999"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* REASON FOR VISIT - NEW FIELD */}
                            <View style={[apStyle.formGroup, {marginBottom: 40}]}>
                                <Text style={apStyle.formLabel}>Reason for Visit</Text>
                                <TextInput
                                    style={[apStyle.formInput, { height: 80, textAlignVertical: 'top' }]}
                                    value={reasonForVisit}
                                    onChangeText={setReasonForVisit}
                                    placeholder="Please describe the reason for your visit"
                                    placeholderTextColor="#999"
                                    multiline={true}
                                    numberOfLines={3}
                                />
                            </View>

                        {/* Pet Information */}
                        <View style={apStyle.formSection}>
                            <Text style={apStyle.sectionTitle}>Pet Information</Text>
                            
                            <View style={[apStyle.formRow, {gap: 20}]}>
                                <View style={apStyle.formGroup}>
                                    <Text style={apStyle.formLabel}>Pet Name</Text>
                                    <TextInput
                                        style={apStyle.formInput}
                                        value={petName}
                                        onChangeText={setPetName}
                                        placeholder="Enter pet name"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                
                                <View style={apStyle.formGroup}>
                                    <Text style={apStyle.formLabel}>Pet Type</Text>
                                    <TextInput
                                        style={apStyle.formInput}
                                        value={petType}
                                        onChangeText={setPetType}
                                        placeholder="e.g., Dog, Cat"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>
                            
                            <View style={apStyle.formRow}>
                                <View style={apStyle.formGroup}>
                                    <Text style={apStyle.formLabel}>Gender</Text>
                                    <Picker
                                        selectedValue={petGender}
                                        onValueChange={(itemValue) => setPetGender(itemValue)}
                                        style={{ height: 50, width: '100%' }}
                                    >
                                        <Picker.Item label="Select gender" value="" color="#a8a8a8" />
                                        <Picker.Item label="Male" value="Male" />
                                        <Picker.Item label="Female" value="Female" />
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        {/* Appointment Details */}
                        <View style={[apStyle.formSection, {marginBottom: 10}]}>
                            <Text style={apStyle.sectionTitle}>Appointment Details</Text>
                            
                            <View style={apStyle.formGroup}>
                                <Text style={apStyle.formLabel}>Appointment Type *</Text>
                                <View style={apStyle.pickerContainer}>
                                    <Picker
                                        selectedValue={appointmentType}
                                        onValueChange={(itemValue) => setAppointmentType(itemValue)}
                                        style={{ height: 50, width: '100%' }}
                                    >
                                        <Picker.Item label="Select appointment type" value="" color="#a8a8a8" />
                                        <Picker.Item label="Vaccination" value="Vaccination" />
                                        <Picker.Item label="Check-up" value="Check-up" />
                                        <Picker.Item label="Surgery" value="Surgery" />
                                        <Picker.Item label="Grooming" value="Grooming" />
                                        <Picker.Item label="Dental Care" value="Dental Care" />
                                        <Picker.Item label="Emergency" value="Emergency" />
                                    </Picker>
                                </View>
                            </View>

                            
                            
                            <View style={[apStyle.formGroup]}>
                                <Text style={apStyle.formLabel}>Select Date *</Text>
                                <TouchableOpacity 
                                    style={apStyle.dateSelector}
                                >
                                    <Ionicons name="calendar" size={20} color="#3d67ee" />
                                    <Text style={{ marginLeft: 10, color: selectedDate ? '#333' : '#999' }}>
                                        {formatDateForDisplay(selectedDate)}
                                    </Text>
                                </TouchableOpacity>
                                
                                {/* Calendar Component */}
                                <View style={apStyle.calendarContainer}>
                                    <Calendar
                                        current={selectedDate || getTodayDate()}
                                        onDayPress={handleDateSelect}
                                        markedDates={getMarkedDates()}
                                        minDate={getTodayDate()}
                                        monthFormat={'MMMM yyyy'}
                                        theme={{
                                            selectedDayBackgroundColor: '#3d67ee',
                                            todayTextColor: '#3d67ee',
                                            arrowColor: '#3d67ee',
                                            monthTextColor: '#000',
                                            textMonthFontWeight: '600',
                                            textDayFontSize: 14,
                                            textSectionTitleColor: '#666',
                                            textDayHeaderFontSize: 12,
                                            textDisabledColor: '#ccc',
                                        }}
                                        style={{
                                            borderRadius: 8,
                                            padding: 10,
                                            width: '100%',
                                        }}
                                    />
                                </View>
                            </View>
                            
                            <View style={[apStyle.formGroup, {marginTop: 250}]}>
                                <Text style={apStyle.formLabel}>
                                    Select Time Slot * 
                                    {loadingTimeSlots && (
                                        <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                                            {' '}Loading available slots...
                                        </Text>
                                    )}
                                </Text>
                                
                                {!selectedDate ? (
                                    <Text style={{ 
                                        textAlign: 'center', 
                                        color: '#666', 
                                        fontStyle: 'italic',
                                        marginVertical: 20
                                    }}>
                                        Please select a date first
                                    </Text>
                                ) : availableTimeSlots.length === 0 ? (
                                    <Text style={{ 
                                        textAlign: 'center', 
                                        color: '#666', 
                                        fontStyle: 'italic',
                                        marginVertical: 20
                                    }}>
                                        No time slots available for this day
                                    </Text>
                                ) : (
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={true} 
                                        style={apStyle.timeSlotContainer}
                                    >
                                        {availableTimeSlots.map(renderTimeSlot)}
                                    </ScrollView>
                                )}
                                
                                {selectedTimeSlot && (
                                    <View style={{
                                        backgroundColor: '#e8f5e9',
                                        padding: 10,
                                        borderRadius: 5,
                                        marginTop: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                        <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
                                        <Text style={{ 
                                            marginLeft: 10,
                                            color: '#2e7d32',
                                            fontWeight: '600'
                                        }}>
                                            Selected: {selectedTimeSlot}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={apStyle.modalActions}>
                        <TouchableOpacity 
                            onPress={onClose}
                            style={[apStyle.modalButton, { backgroundColor: '#f5f5f5' }]}
                        >
                            <Text style={{ color: '#666' }}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={handleSubmit}
                            disabled={!selectedDate || !selectedTimeSlot || !patientName || !appointmentType}
                            style={[
                                apStyle.modalButton, 
                                { 
                                    backgroundColor: !selectedDate || !selectedTimeSlot || !patientName || !appointmentType ? '#ccc' : '#3d67ee',
                                    opacity: !selectedDate || !selectedTimeSlot || !patientName || !appointmentType ? 0.6 : 1
                                }
                            ]}
                        >
                            <Text style={{ color: 'white', fontWeight: '600' }}>Create Appointment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Confirmation Modal for Cancel/Complete actions
const ConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Yes', 
  cancelText = 'No',
  confirmColor = '#3d67ee',
  type = 'info' // 'cancel', 'complete', or 'info'
}) => {
  
  const getIconName = () => {
    switch(type) {
      case 'cancel':
        return 'alert-circle';
      case 'complete':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'cancel':
        return '#d32f2f';
      case 'complete':
        return '#2e7d32';
      default:
        return '#3d67ee';
    }
  };

  const getConfirmButtonColor = () => {
    switch(type) {
      case 'cancel':
        return '#d32f2f';
      case 'complete':
        return '#2e7d32';
      default:
        return confirmColor;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[apStyle.modalOverlay]}>
        <View style={[apStyle.modalContent, { width: '40%', maxHeight: '50%', padding: 0 }]}>
          
          {/* Icon Header */}
          <View style={{ 
            alignItems: 'center', 
            paddingTop: 30, 
            paddingBottom: 20 
          }}>
            <View style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: type === 'cancel' ? '#ffebee' : (type === 'complete' ? '#e8f5e9' : '#e3f2fd'),
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons 
                name={getIconName()} 
                size={40} 
                color={getIconColor()} 
              />
            </View>
          </View>

          {/* Title and Message */}
          <View style={{ paddingHorizontal: 30, alignItems: 'center' }}>
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#333',
              marginBottom: 10,
              textAlign: 'center'
            }}>
              {title}
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#666',
              textAlign: 'center',
              lineHeight: 22,
            }}>
              {message}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={[apStyle.modalActions, { padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
            <TouchableOpacity 
              onPress={onClose}
              style={[apStyle.modalButton, { backgroundColor: '#f5f5f5', flex: 1, marginRight: 10 }]}
            >
              <Text style={{ color: '#666', fontSize: 16, fontWeight: '500' }}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                onConfirm();
                onClose();
              }}
              style={[apStyle.modalButton, { backgroundColor: getConfirmButtonColor(), flex: 1, marginLeft: 10 }]}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function Schedule() {
    const ns = useNavigation();
    const route = useRoute();
    const isActive = route.name === 'Schedule';

    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);
    const [service, setService] = useState('');
    const [doctorFilter, setDoctorFilter] = useState('');
    const [bookedDates, setBookedDates] = useState({});
    // Add this line with your other useState declarations
const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
    
    const [currentView, setCurrentView] = useState('table'); 
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    
    // Create Appointment Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [userData, setUserData] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    // Confirmation Modal State
const [showConfirmationModal, setShowConfirmationModal] = useState(false);
const [confirmationAction, setConfirmationAction] = useState(null);
const [selectedAppointmentForAction, setSelectedAppointmentForAction] = useState(null);
const [confirmationType, setConfirmationType] = useState('info');

    // Filter appointments based on service and doctor
    // Update the filteredAppointments calculation (around line 270)
const filteredAppointments = userData.filter(appointment => {
  // Only show scheduled appointments (not completed or cancelled)
  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return false;
  }
  
  const matchesService = service === '' || appointment.service === service;
  const matchesDoctor = doctorFilter === '' || appointment.doctor === doctorFilter;
  return matchesService && matchesDoctor;
});

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setSelectedAppointment(user); // Add this line
        setSelectedDoctor(user.assignedDoctor || '');
        setCurrentView('userDetails');
    };

    // Add this function to open the doctor modal:
    const openDoctorModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDoctorModal(true);
    };
    const handleBackToList = () => {
        setCurrentView('table');
        setSelectedUser(null);
        setSelectedDoctor('');
    };

    const handleAssignDoctor = async (appointmentId, doctorId) => {
    try {
        const result = await availabilityService.assignDoctor(appointmentId, doctorId);
        
        // Update local state
        const updatedUserData = userData.map(appointment => {
        if (appointment.id === appointmentId) {
            const doctor = doctors.find(d => d.pk === doctorId);
            return {
            ...appointment,
            doctor: doctor ? doctor.fullName : 'Unknown Doctor',
            assignedDoctor: doctorId
            };
        }
        return appointment;
        });
        
        setUserData(updatedUserData);
        
        // If we're viewing the details, update that too
        if (selectedUser && selectedUser.id === appointmentId) {
        const doctor = doctors.find(d => d.pk === doctorId);
        setSelectedUser(prev => ({
            ...prev,
            doctor: doctor ? doctor.fullName : 'Unknown Doctor',
            assignedDoctor: doctorId
        }));
        }
        
        Alert.alert('Success', result.message || 'Doctor assigned successfully!');
        return result;
    } catch (error) {
        console.error('Error assigning doctor:', error);
        Alert.alert('Error', error.message || 'Failed to assign doctor');
        throw error;
    }
    };

// Update the handleCancelAppointment function to use custom modal
const handleCancelAppointment = (appointment) => {
  console.log('handleCancelAppointment called with:', appointment);
  
  if (!appointment || !appointment.id) {
    Alert.alert('Error', 'Invalid appointment data');
    return;
  }
  
  setSelectedAppointmentForAction(appointment);
  setConfirmationType('cancel');
  setConfirmationAction(() => async () => {
    try {
      setLoading(true);
      console.log('Calling updateAppointmentStatus with status: cancelled');
      const result = await availabilityService.updateAppointmentStatus(appointment.id, 'cancelled');
      console.log('Update result:', result);
      
      if (result) {
        // Remove from current appointments
        const updatedUserData = userData.filter(user => user.id !== appointment.id);
        setUserData(updatedUserData);
        
        // Go back to table view if we're viewing this appointment
        if (selectedUser && selectedUser.id === appointment.id) {
          setCurrentView('table');
          setSelectedUser(null);
        }
        
        Alert.alert('Success', 'Appointment has been cancelled and moved to history.');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert('Error', error.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setLoading(false);
      setSelectedAppointmentForAction(null);
    }
  });
  
  setShowConfirmationModal(true);
};

// Update handleCompleteAppointment function to use custom modal
const handleCompleteAppointment = (appointment) => {
  console.log('handleCompleteAppointment called with:', appointment);
  
  if (!appointment || !appointment.id) {
    Alert.alert('Error', 'Invalid appointment data');
    return;
  }
  
  setSelectedAppointmentForAction(appointment);
  setConfirmationType('complete');
  setConfirmationAction(() => async () => {
    try {
      setLoading(true);
      console.log('Calling updateAppointmentStatus with status: completed');
      const result = await availabilityService.updateAppointmentStatus(appointment.id, 'completed');
      console.log('Update result:', result);
      
      if (result) {
        // Remove from current appointments
        const updatedUserData = userData.filter(user => user.id !== appointment.id);
        setUserData(updatedUserData);
        
        // Go back to table view if we're viewing this appointment
        if (selectedUser && selectedUser.id === appointment.id) {
          setCurrentView('table');
          setSelectedUser(null);
        }
        
        Alert.alert('Success', 'Appointment marked as completed and moved to history.');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      Alert.alert('Error', error.message || 'Failed to complete appointment. Please try again.');
    } finally {
      setLoading(false);
      setSelectedAppointmentForAction(null);
    }
  });
  
  setShowConfirmationModal(true);
};
    const handleCreateAppointment = () => {
        setShowCreateModal(true);
    };

    const loadAppointments = async () => {
  setLoading(true);
  try {
    console.log('🔄 Loading appointments...');
    const appointments = await availabilityService.getAppointmentsForTable();
    console.log('📋 Appointments loaded:', appointments);
    console.log('First appointment:', appointments[0]);
    setUserData(appointments);
    
    // Process booked dates for calendar
    const booked = {};
    appointments.forEach(app => {
      // Extract date from date_time string (format: "Mon DD, YYYY - HH:MM AM/PM")
      const dateTimeParts = app.date_time.split(' - ');
      if (dateTimeParts.length > 0) {
        const dateStr = dateTimeParts[0]; // This gives "Mon DD, YYYY"
        
        // Convert to YYYY-MM-DD format for calendar
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        booked[formattedDate] = {
          marked: true,
          dotColor: '#3d67ee',
          activeOpacity: 0.8,
        };
      }
    });
    
    setBookedDates(booked);
    
  } catch (error) {
    console.error('Failed to load appointments:', error);
    Alert.alert('Error', 'Failed to load appointments');
  } finally {
    setLoading(false);
  }
};


    const loadDoctors = async () => {
    try {
        const doctorsList = await availabilityService.getDoctors();
        console.log('Raw doctors data:', doctorsList); // Add this to see what you're getting
        
        // Map the properties to what your components expect
        const formattedDoctors = doctorsList.map(doctor => ({
        id: doctor.pk || doctor.id,
        pk: doctor.pk,
        fullName: doctor.fullname || doctor.fullName || doctor.name || 'Unknown',
        name: doctor.fullname || doctor.fullName || doctor.name || 'Unknown',
        role: doctor.role || 'Veterinarian',
        department: doctor.department || 'General',
        userImage: doctor.userImage || doctor.userimage,
        // Keep any other properties you need
        }));
        
        console.log('Formatted doctors:', formattedDoctors);
        setDoctors(formattedDoctors);
    } catch (error) {
        console.error('Failed to load doctors:', error);
    }
    };


   const handleSubmitAppointment = async (appointmentData) => {
        try {
            // Just close the modal and reload appointments
            setShowCreateModal(false);
            
            // Reload appointments after a short delay
            setTimeout(() => {
                loadAppointments();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to handle appointment submission:', error);
            setShowCreateModal(false);
            loadAppointments(); // Try to reload anyway
        }
    };

    useEffect(() => {
        loadAppointments();
        loadDoctors();
    }, []);


    const handleCloseModal = () => {
    setShowCreateModal(false);
    
        setTimeout(() => {
            loadAppointments();
        }, 300);
    };

const UserDetailsView = ({ user, onBack, onCancel, onComplete, onAssignDoctor }) => {
    if (!user) return null;
    
    // Map the API properties to what your component expects
    const userDetails = {
        fullName: user.name,
        email: user.patient_email,
        phone: user.patient_phone,
        reasonForVisit: user.reasonForVisit || 'Not provided',  
        petName: user.pet_name,
        petType: user.pet_type,
        petBreed: 'Unknown', 
        gender: user.petGender || 'Unknown'
    };
    
    return (
        <View style={[apStyle.whiteContainer, { padding: 30, flex: 1 }]}>
            {/* Back Button */}
            <TouchableOpacity 
                onPress={onBack}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
            >
                <Ionicons name="arrow-back" size={20} color="#3d67ee" />
                <Text style={{ color: '#3d67ee', marginLeft: 8, fontSize: 16 }}>
                    Back to Appointments
                </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <Text style={{ fontSize: 25, fontWeight: '700' }}>Patient Details</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* User Info Section */}
                <View style={apStyle.sectionContainer}>
                    <Text style={apStyle.sectionTitle}>Patient Information</Text>
                    
                    <View style={apStyle.detailsGrid}>
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Full Name</Text>
                            <Text style={apStyle.detailValue}>{userDetails.fullName}</Text>
                        </View>
                        
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Email</Text>
                            <Text style={apStyle.detailValue}>{userDetails.email}</Text>
                        </View>
                        
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Phone</Text>
                            <Text style={apStyle.detailValue}>{userDetails.phone}</Text>
                        </View>
                        
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Reason for Visit</Text>
                            <Text style={apStyle.detailValue}>{userDetails.reasonForVisit}</Text>
                        </View>
                    </View>
                </View>

                {/* Pet Information Section */}
                <View style={apStyle.sectionContainer}>
                    <Text style={apStyle.sectionTitle}>Pet Information</Text>
                    
                    <View style={apStyle.detailsGrid}>
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Pet Name</Text>
                            <Text style={apStyle.detailValue}>{userDetails.petName}</Text>
                        </View>
                        
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Type</Text>
                            <Text style={apStyle.detailValue}>{userDetails.petType}</Text>
                        </View>
                        
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Breed</Text>
                            <Text style={apStyle.detailValue}>{userDetails.petBreed}</Text>
                        </View>
                        
                        <View style={apStyle.detailItem}>
                            <Text style={apStyle.detailLabel}>Gender</Text>
                            <Text style={apStyle.detailValue}>{userDetails.gender}</Text>
                        </View>
                    </View>
                </View>

                {/* Appointment Details */}
                <View style={apStyle.sectionContainer}>
                    <Text style={apStyle.sectionTitle}>Appointment Details</Text>
                    
                    <View style={apStyle.appointmentCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '600' }}>{user.service}</Text>
                            <Text style={{ color: '#3d67ee', fontWeight: '600' }}>{user.date_time}</Text>
                        </View>
                        
                        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ fontSize: 14, color: '#666' }}>
                                Assigned Doctor: <Text style={{ 
                                    fontWeight: '600',
                                    color: user.doctor === 'Not Assigned' ? '#f57c00' : '#333'
                                }}>{user.doctor}</Text>
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                onPress={() => onAssignDoctor(user)}
                                style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                backgroundColor: user.doctor === 'Not Assigned' ? '#fff3e0' : '#e8f5e9', 
                                paddingHorizontal: 12, 
                                paddingVertical: 6, 
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: user.doctor === 'Not Assigned' ? '#ffcc80' : '#c8e6c9'
                                }}
                            >
                                <Ionicons 
                                name="medical" 
                                size={16} 
                                color={user.doctor === 'Not Assigned' ? '#f57c00' : '#2e7d32'} 
                                />
                                <Text style={{ 
                                color: user.doctor === 'Not Assigned' ? '#f57c00' : '#2e7d32', 
                                marginLeft: 6, 
                                fontSize: 12, 
                                fontWeight: '600' 
                                }}>
                                {user.doctor === 'Not Assigned' ? 'Assign Doctor' : 'Change Doctor'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[apStyle.sectionContainer, { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 30 }]}>
                    <TouchableOpacity style={[apStyle.actionButton, { backgroundColor: '#3d67ee' }]}>
                        <Ionicons name="calendar" size={18} color="#fff" />
                        <Text style={[apStyle.actionButtonText, { color: '#fff' }]}>Reschedule</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => onCancel(user)}
                        disabled={user.status === 'cancelled'}
                        style={[
                            apStyle.actionButton, 
                            { 
                                backgroundColor: user.status === 'cancelled' ? '#e0e0e0' : '#ffebee', 
                                borderWidth: 1, 
                                borderColor: user.status === 'cancelled' ? '#bdbdbd' : '#ffcdd2',
                                opacity: user.status === 'cancelled' ? 0.6 : 1
                            }
                        ]}
                    >
                        <Ionicons 
                            name={user.status === 'cancelled' ? "close-circle" : "close-circle-outline"} 
                            size={18}
                            color={user.status === 'cancelled' ? '#757575' : '#d32f2f'}
                        />
                        <Text style={[
                            apStyle.actionButtonText, 
                            { color: user.status === 'cancelled' ? '#757575' : '#d32f2f' }
                        ]}>
                            {user.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => onComplete(user)}
                        disabled={user.status === 'completed'}
                        style={[
                            apStyle.actionButton, 
                            { 
                                backgroundColor: user.status === 'completed' ? '#e0e0e0' : '#e8f5e9', 
                                borderWidth: 1, 
                                borderColor: user.status === 'completed' ? '#bdbdbd' : '#c8e6c9',
                                opacity: user.status === 'completed' ? 0.6 : 1
                            }
                        ]}
                    >
                        <Ionicons 
                            name={user.status === 'completed' ? "checkmark-circle" : "checkmark-circle-outline"} 
                            size={18}
                            color={user.status === 'completed' ? '#757575' : '#2e7d32'}
                        />
                        <Text style={[
                            apStyle.actionButtonText, 
                            { color: user.status === 'completed' ? '#757575' : '#2e7d32' }
                        ]}>
                            {user.status === 'completed' ? 'Completed' : 'Complete'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const TableView = ({ 
    onViewUser, 
    loading, 
    filteredAppointments, 
    service, 
    setService, 
    doctorFilter, 
    setDoctorFilter, 
    doctors, 
    userData, 
    handleCreateAppointment 
}) => {
  return (
    <View style={[apStyle.whiteContainer, {padding: 30, flex: 1}]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <View>
          <Text style={{fontSize: 25, fontWeight: 700}}>Booked Appointments</Text>
          <Text style={{fontSize: 14, marginTop: 5, opacity: 0.5}}>
            {loading ? 'Loading appointments...' : `Total appointments: ${filteredAppointments.length}`}
          </Text>
        </View>
        
        {/* Create Appointment Button */}
        <TouchableOpacity 
          onPress={handleCreateAppointment}
          style={apStyle.createAppointmentButton}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={apStyle.createAppointmentButtonText}>Create Appointment</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading appointments...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginTop: 20 }}>
            <Ionicons name="filter-sharp" size={25} color="#3d67ee" style={{ marginRight: 10 }} />
            
            <View style={{ marginRight: 15 }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Service</Text>
              <Picker
                selectedValue={service}
                onValueChange={(itemValue) => setService(itemValue)}
                style={[homeStyle.pickerStyle, { width: 150 }]}
              >
                <Picker.Item label="All Services" value="" color="#a8a8a8" />
                <Picker.Item label="Vaccination" value="Vaccination" />
                <Picker.Item label="Check-up" value="Check-up" />
                <Picker.Item label="Surgery" value="Surgery" />
                <Picker.Item label="Grooming" value="Grooming" />
              </Picker>
            </View>
            
            {/* Doctors Picker */}
            <View>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Doctor</Text>
              <Picker
                selectedValue={doctorFilter}
                onValueChange={(itemValue) => setDoctorFilter(itemValue)}
                style={[homeStyle.pickerStyle, { width: 180 }]}
              >
                <Picker.Item label="All Doctors" value="" color="#a8a8a8" />
                <Picker.Item label="Not Assigned" value="Not Assigned" />
                {doctors.map(doctor => (
                <Picker.Item 
                    key={doctor.pk || doctor.id} 
                    label={`${doctor.fullName || doctor.name} (${doctor.role || 'Doctor'})`} 
                    value={doctor.fullName || doctor.name} 
                />
                ))}
              </Picker>
            </View>
            
            {/* Clear Filters Button */}
            {(service || doctorFilter) && (
              <TouchableOpacity 
                onPress={() => { setService(''); setDoctorFilter(''); }}
                style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="close-circle" size={18} color="#666" />
                <Text style={{ marginLeft: 5, fontSize: 12, color: '#666' }}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Wrap the table in a ScrollView */}
          <ScrollView 
            style={{ marginTop: 20, flex: 1 }}
            showsVerticalScrollIndicator={true}
          >
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={{ flex: 2, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>Name</Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 2, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>Service</Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 2, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>Time & Date</Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 2, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>Doctor</Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>View</Text>
                </DataTable.Title>
              </DataTable.Header>

              {/* Filtered Rows - ALL ITEMS (no pagination) */}
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((user) => (
                  <DataTable.Row key={user.id}>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <Text style={{ fontSize: 12 }}>{user.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12 }}>{user.service}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12 }}>{user.date_time}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2, justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ 
                          fontSize: 12, 
                          color: user.doctor === 'Not Assigned' ? '#f57c00' : '#333'
                        }}>
                          {user.doctor}
                        </Text>
                        {user.doctor === 'Not Assigned' && (
                          <Ionicons name="alert-circle" size={12} color="#f57c00" style={{ marginLeft: 5 }} />
                        )}
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1, justifyContent: 'flex-end' }}>
                      <TouchableOpacity onPress={() => onViewUser(user)}>
                        <Ionicons name="eye-outline" size={15} color="#3d67ee" />
                      </TouchableOpacity>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <DataTable.Row>
                  <DataTable.Cell style={{ flex: 6, justifyContent: 'center' }}>
                    <Text style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      {userData.length === 0 ? 'No appointments found' : 'No appointments matching your filters'}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </DataTable>
          </ScrollView>
        </View>
      )}
    </View>
  );
};
// Doctor Assignment Modal Component
const AssignDoctorModal = ({ 
  visible, 
  onClose, 
  appointment, 
  doctors, 
  onAssign 
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset selection when modal opens
  useEffect(() => {
    if (visible && appointment) {
      setSelectedDoctorId(appointment.assignedDoctor || '');
    } else {
      setSelectedDoctorId('');
    }
  }, [visible, appointment]);

  const handleAssign = async () => {
    if (!selectedDoctorId) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }

    setLoading(true);
    try {
      await onAssign(appointment.id, selectedDoctorId);
      onClose();
    } catch (error) {
      console.error('Error assigning doctor:', error);
      Alert.alert('Error', 'Failed to assign doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={apStyle.modalOverlay}>
        <View style={[apStyle.modalContent, { width: '60%', maxHeight: '60%' }]}>
          <View style={apStyle.modalHeader}>
            <Text style={apStyle.modalTitle}>Assign Doctor</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={{ 
              fontSize: 16, 
              marginBottom: 20,
              color: '#555'
            }}>
              Assign a doctor to <Text style={{ fontWeight: '600' }}>{appointment?.name}'s</Text> appointment
            </Text>

            {/* Appointment Details */}
            <View style={apStyle.appointmentCard}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 10 }}>
                Appointment Details
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Service:</Text>
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment?.service}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Date & Time:</Text>
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment?.date_time}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Pet:</Text>
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment?.pet_name} ({appointment?.pet_type})</Text>
              </View>
            </View>

            {/* Doctor Selection */}
            <View style={{ marginTop: 20 }}>
              <Text style={[apStyle.formLabel, { marginBottom: 10 }]}>Select Doctor *</Text>
              {doctors.length === 0 ? (
                <Text style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  fontStyle: 'italic',
                  marginVertical: 20
                }}>
                  No doctors available
                </Text>
              ) : (
                <View style={{ maxHeight: 300 }}>
                  {doctors.map(doctor => (
                    <TouchableOpacity
                      key={doctor.pk || doctor.id}
                      style={[
                        apStyle.doctorOption,
                        selectedDoctorId === (doctor.pk || doctor.id) && apStyle.selectedDoctorOption
                      ]}
                      onPress={() => setSelectedDoctorId(doctor.pk || doctor.id)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image 
                          source={doctor.userImage ? { uri: doctor.userImage } : require('../assets/userAvatar.jpg')}
                          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 15 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: selectedDoctorId === (doctor.pk || doctor.id) ? '600' : '500',
                            color: selectedDoctorId === (doctor.pk || doctor.id) ? '#3d67ee' : '#333'
                          }}>
                            {doctor.fullName || doctor.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                            {doctor.role || 'Veterinarian'} • {doctor.department || 'General'}
                          </Text>
                        </View>
                        {selectedDoctorId === (doctor.pk || doctor.id) && (
                          <Ionicons name="checkmark-circle" size={20} color="#3d67ee" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Selected Doctor Info */}
            {selectedDoctorId && (
              <View style={{
                backgroundColor: '#e8f5e9',
                padding: 15,
                borderRadius: 8,
                marginTop: 20,
                borderWidth: 1,
                borderColor: '#c8e6c9'
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#2e7d32', marginBottom: 5 }}>
                  Selected Doctor
                </Text>
                <Text style={{ fontSize: 13, color: '#333' }}>
                  {doctors.find(d => (d.pk || d.id) === selectedDoctorId)?.fullName || ''}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[apStyle.modalActions, { padding: 20 }]}>
            <TouchableOpacity 
              onPress={onClose}
              style={[apStyle.modalButton, { backgroundColor: '#f5f5f5' }]}
              disabled={loading}
            >
              <Text style={{ color: '#666' }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleAssign}
              disabled={!selectedDoctorId || loading}
              style={[
                apStyle.modalButton, 
                { 
                  backgroundColor: !selectedDoctorId ? '#ccc' : '#3d67ee',
                  opacity: !selectedDoctorId || loading ? 0.6 : 1
                }
              ]}
            >
              {loading ? (
                <Text style={{ color: 'white', fontWeight: '600' }}>Assigning...</Text>
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>Assign Doctor</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
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
                        <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>
                            {currentView === 'table' ? 'Appointments / Schedule' : 'Patient Details'}
                        </Text>
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
  // Custom styling for marked dates
  theme={{
    // Style for marked dates (days with appointments)
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
    // Make the dots bigger and more visible
    dotStyle: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 2,
    },
    // Style for the selected day
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
                            <Text style={{fontFamily: 'Segoe UI', fontSize: 18, fontWeight: '700'}}>Doctors Available</Text>
                            <ScrollView style={{ marginTop: 10 }}>
                                <DataTable>
                                    {doctors.map((doctor) => (
                                        <DataTable.Row key={doctor.id}>
                                            <DataTable.Cell style={{ flex: 2 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View/>
                                                    <Image 
                                                        source={require('../assets/userAvatar.jpg')} 
                                                        style={{width: 30, height: 30, borderRadius: 20, marginRight: 10 }}
                                                    />
                                                    <View>
                                                        <Text style={{ fontSize: 14, }}>{doctor.name}</Text>
                                                        <Text style={{ fontSize: 12, color: '#666' }}>{doctor.department}</Text>
                                                    </View>
                                                </View>
                                            </DataTable.Cell>
                                        </DataTable.Row>
                                    ))}
                                </DataTable>
                            </ScrollView>
                        </View>
                    </View>

                    <View style={apStyle.bodyContainer}>
    {currentView === 'table' ? (
        <TableView 
            onViewUser={handleViewUser}
            loading={loading}
            filteredAppointments={filteredAppointments}
            service={service}
            setService={setService}
            doctorFilter={doctorFilter}
            setDoctorFilter={setDoctorFilter}
            doctors={doctors}
            userData={userData}
            handleCreateAppointment={handleCreateAppointment}
        />
    ) : (
        <UserDetailsView 
            user={selectedUser} 
            onBack={handleBackToList}
            onCancel={handleCancelAppointment}
            onComplete={handleCompleteAppointment}
            onAssignDoctor={openDoctorModal} 
        />
    )}
</View>
                </View>
            </View>

            <AssignDoctorModal 
                visible={showDoctorModal}
                onClose={() => setShowDoctorModal(false)}
                appointment={selectedAppointment}
                doctors={doctors}
                onAssign={handleAssignDoctor}
                />

            {/* Create Appointment Modal - Now it's a separate component */}
            <CreateAppointmentModal 
                visible={showCreateModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmitAppointment}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal 
            visible={showConfirmationModal}
            onClose={() => {
                setShowConfirmationModal(false);
                setSelectedAppointmentForAction(null);
            }}
            onConfirm={confirmationAction}
            title={confirmationType === 'cancel' ? 'Cancel Appointment' : 'Complete Appointment'}
            message={confirmationType === 'cancel' 
                ? 'Are you sure you want to cancel this appointment? This will move it to history.'
                : 'Mark this appointment as completed? It will be moved to history.'
            }
            confirmText={confirmationType === 'cancel' ? 'Yes, Cancel' : 'Yes, Complete'}
            cancelText="No"
            type={confirmationType}
            />

            
        </View>
    );
}