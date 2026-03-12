import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import apStyle from '../styles/AppointmentStyles';
import { availabilityService } from './availabilityService';

const RescheduleModal = ({ visible, onClose, appointment, onSubmit, currentUserId }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonCount, setReasonCount] = useState(0);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayAvailability, setDayAvailability] = useState(null);

  const CHAR_LIMIT = 300;

  // Helper functions
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

  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Load day availability on mount
  useEffect(() => {
    if (visible) {
      loadDayAvailability();
      setSelectedDate('');
      setSelectedTimeSlot(null);
      setReason('');
      setReasonCount(0);
    }
  }, [visible]);

  const loadDayAvailability = async () => {
    try {
      const dayData = await availabilityService.getDayAvailability();
      setDayAvailability(dayData);
    } catch (error) {
      console.error('Failed to load day availability:', error);
    }
  };

  // Load time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlotsForDate(selectedDate);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate]);

  const loadTimeSlotsForDate = async (date) => {
    setLoadingSlots(true);
    try {
      const slots = await availabilityService.getAvailableTimeSlots(date);
      
      // Format slots for display
      const formattedSlots = slots.map(slot => ({
        id: slot.id,
        displayText: `${formatTimeForDisplay(slot.start_time)} - ${formatTimeForDisplay(slot.end_time)}`,
        startTime: slot.start_time,
        endTime: slot.end_time,
        availableSlots: slot.availableSlots || 1
      }));
      
      setAvailableTimeSlots(formattedSlots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Check if a date is disabled
  const isDateDisabled = (dateString) => {
    if (!dayAvailability || !dateString) return true;
    
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[date.getDay()];
    
    return !dayAvailability[dayName];
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
    
    // Mark disabled dates for the next 90 days
    if (dayAvailability) {
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[date.getDay()];
        
        if (!dayAvailability[dayName]) {
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

  const handleDateSelect = (day) => {
    const dateString = day.dateString;
    
    if (isDateDisabled(dateString)) {
      Alert.alert('Date Not Available', 'This date is not available for appointments.');
      return;
    }
    
    setSelectedDate(dateString);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleReasonChange = (text) => {
    if (text.length <= CHAR_LIMIT) {
      setReason(text);
      setReasonCount(text.length);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a new date');
      return;
    }
    
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a new time slot');
      return;
    }

    setLoading(true);
    
    try {
      const rescheduleData = {
        new_date: selectedDate,
        new_time_slot_id: selectedTimeSlot.id,
        new_time_slot_display: selectedTimeSlot.displayText,
        reason: reason.trim() || null,
        requested_by: currentUserId || null
      };

      const result = await onSubmit(rescheduleData);
      
      // Show success message with email status
      if (result && result.emailSent) {
        Alert.alert(
          '✅ Success', 
          'Reschedule request created successfully.\n\nAn email has been sent to the patient for approval.'
        );
      } else {
        Alert.alert(
          '✅ Success', 
          'Reschedule request created successfully.\n\nNote: Email could not be sent. Please contact the patient manually.'
        );
      }
      
    } catch (error) {
      console.error('Error in reschedule submission:', error);
      Alert.alert('Error', error.message || 'Failed to create reschedule request');
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
      <View style={[apStyle.modalContent, { width: '70%', maxHeight: '95%' }]}>
        
        {/* Header */}
        <View style={apStyle.modalHeader}>
          <Text style={apStyle.modalTitle}>Reschedule Appointment</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ padding: 20 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          
          {/* Original Appointment Summary */}
          {appointment && (
            <View style={[apStyle.appointmentCard, { 
              marginBottom: 20, 
              backgroundColor: '#f8f9fa',
              padding: 15,
              borderRadius: 8
            }]}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#3d67ee' }}>
                📋 Original Appointment
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                <Text style={{ fontSize: 12, color: '#666', width: 100 }}>Current Date & Time:</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', flex: 1 }}>{appointment.date_time}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 12, color: '#666', width: 100 }}>Pet:</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', flex: 1 }}>
                  {appointment.pet_name} ({appointment.pet_type})
                </Text>
              </View>
            </View>
          )}

          {/* Select New Date */}
          <View style={apStyle.formGroup}>
            <Text style={[apStyle.formLabel, { marginBottom: 8 }]}>
              Select New Date <Text style={{ color: '#d32f2f' }}>*</Text>
            </Text>
            
            <View style={{ 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: '#e0e0e0',
              overflow: 'hidden',
              marginBottom: 10
            }}>
              <Calendar
                current={getTodayDate()}
                onDayPress={handleDateSelect}
                markedDates={getMarkedDates()}
                minDate={getTodayDate()}
                monthFormat={'MMMM yyyy'}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#666',
                  selectedDayBackgroundColor: '#3d67ee',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#3d67ee',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#ccc',
                  dotColor: '#3d67ee',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#3d67ee',
                  monthTextColor: '#000',
                  textMonthFontWeight: '600',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12
                }}
                style={{
                  borderRadius: 8,
                  padding: 10,
                }}
              />
            </View>
            
            {selectedDate && (
              <View style={{ 
                backgroundColor: '#e8f5e9', 
                padding: 10, 
                borderRadius: 5, 
                marginTop: 5,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="calendar" size={18} color="#2e7d32" />
                <Text style={{ marginLeft: 8, color: '#2e7d32', fontWeight: '600' }}>
                  Selected: {formatDateForDisplay(selectedDate)}
                </Text>
              </View>
            )}
          </View>

          {/* ADD THIS SEPARATOR */}


          {/* Select New Time Slot */}
          <View style={[apStyle.formGroup, { marginTop: 200 }]}>
            <Text style={[apStyle.formLabel, { marginBottom: 8 }]}>
              Select New Time Slot <Text style={{ color: '#d32f2f' }}>*</Text>
              {loadingSlots && (
                <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                  {' '}Loading...
                </Text>
              )}
            </Text>
            
            {!selectedDate ? (
              <View style={{ 
                backgroundColor: '#f5f5f5', 
                padding: 20, 
                borderRadius: 5,
                alignItems: 'center'
              }}>
                <Ionicons name="time-outline" size={24} color="#999" />
                <Text style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  fontStyle: 'italic',
                  marginTop: 10
                }}>
                  Please select a date first
                </Text>
              </View>
            ) : availableTimeSlots.length === 0 ? (
              <View style={{ 
                backgroundColor: '#fff3e0', 
                padding: 20, 
                borderRadius: 5,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ffcc80'
              }}>
                <Ionicons name="alert-circle" size={24} color="#f57c00" />
                <Text style={{ 
                  textAlign: 'center', 
                  color: '#f57c00', 
                  marginTop: 10
                }}>
                  No time slots available for this date
                </Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true} 
                style={apStyle.timeSlotContainer}
                contentContainerStyle={{ paddingVertical: 5 }}
              >
                {availableTimeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      apStyle.timeSlot,
                      selectedTimeSlot?.id === slot.id && apStyle.selectedTimeSlot
                    ]}
                    onPress={() => handleTimeSlotSelect(slot)}
                  >
                    <Text style={[
                      apStyle.timeSlotText,
                      selectedTimeSlot?.id === slot.id && apStyle.selectedTimeSlotText
                    ]}>
                      {slot.displayText}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                  Selected: {selectedTimeSlot.displayText}
                </Text>
              </View>
            )}
          </View>

          {/* Reason for Rescheduling */}
          <View style={[apStyle.formGroup, { marginTop: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={apStyle.formLabel}>Reason for Rescheduling</Text>
              <Text style={{ fontSize: 11, color: reasonCount >= 300 ? '#d32f2f' : '#999' }}>
                {reasonCount}/300
              </Text>
            </View>
            <TextInput
              style={[apStyle.formInput, { height: 80, textAlignVertical: 'top' }]}
              value={reason}
              onChangeText={handleReasonChange}
              placeholder="Please explain why you need to reschedule (optional)"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={3}
              maxLength={300}
            />
          </View>

          {/* Email Preview Note */}
          <View style={{ 
            backgroundColor: '#e3f2fd', 
            padding: 12, 
            borderRadius: 5, 
            marginTop: 20,
            borderWidth: 1,
            borderColor: '#90caf9'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="mail" size={18} color="#1976d2" />
              <Text style={{ marginLeft: 8, fontSize: 12, color: '#1976d2', fontWeight: '600' }}>
                Email will be sent to {appointment?.patient_email || 'patient'}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#666', marginTop: 5 }}>
              The patient will need to confirm the new schedule.
            </Text>
          </View>

        </ScrollView>

        {/* Action Buttons */}
        <View style={[apStyle.modalActions, { 
          padding: 20, 
          borderTopWidth: 1, 
          borderTopColor: '#f0f0f0',
          backgroundColor: '#fff'
        }]}>
          <TouchableOpacity 
            onPress={onClose}
            style={[apStyle.modalButton, { backgroundColor: '#f5f5f5', flex: 1, marginRight: 10 }]}
            disabled={loading}
          >
            <Text style={{ color: '#666', fontSize: 16, fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!selectedDate || !selectedTimeSlot || loading}
            style={[
              apStyle.modalButton, 
              { 
                flex: 1,
                marginLeft: 10,
                backgroundColor: !selectedDate || !selectedTimeSlot ? '#ccc' : '#3d67ee',
                opacity: !selectedDate || !selectedTimeSlot || loading ? 0.6 : 1
              }
            ]}
          >
            {loading ? (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Creating...</Text>
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Create Reschedule Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
};

export default RescheduleModal;