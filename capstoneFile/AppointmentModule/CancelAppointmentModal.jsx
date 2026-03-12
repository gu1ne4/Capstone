import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import apStyle from '../styles/AppointmentStyles';

// Predefined cancellation reasons with auto-generated explanations
const CANCELLATION_REASONS = [
  { 
    id: 'doctor_unavailable', 
    label: 'Doctor Unavailable',
    template: 'The veterinarian scheduled for your appointment is currently unavailable due to an emergency. We sincerely apologize for any inconvenience this may cause.'
  },
  { 
    id: 'holiday', 
    label: 'Holiday / Clinic Closed',
    template: 'Our clinic will be closed on the scheduled date due to a holiday. Please contact us to reschedule your appointment at your earliest convenience.'
  },
  { 
    id: 'emergency', 
    label: 'Clinic Emergency',
    template: 'Our clinic is currently attending to an urgent emergency case. We need to reschedule all non-emergency appointments. We apologize for the inconvenience.'
  },
  { 
    id: 'client_request', 
    label: 'Client Request',
    template: 'As per your request, your appointment has been cancelled. Please feel free to book a new appointment at your convenience.'
  },
  { 
    id: 'staff_training', 
    label: 'Staff Training',
    template: 'We have a mandatory staff training session on your appointment date. Please contact us to reschedule. We apologize for any inconvenience.'
  },
  { 
    id: 'facility_maintenance', 
    label: 'Facility Maintenance',
    template: 'Our facility requires urgent maintenance on your scheduled date. Please contact us to reschedule your appointment.'
  },
  { 
    id: 'specific', 
    label: 'Specific Reason (Custom)',
    template: '' // Empty for custom reason
  }
];

const CancelAppointmentModal = ({ visible, onClose, appointment, onSubmit, currentUserId }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [generatedExplanation, setGeneratedExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSelectedReason('');
      setCustomReason('');
      setGeneratedExplanation('');
    }
  }, [visible]);

  // Update generated explanation when reason changes
  useEffect(() => {
    if (selectedReason) {
      const reason = CANCELLATION_REASONS.find(r => r.id === selectedReason);
      if (reason) {
        if (selectedReason === 'specific') {
          setGeneratedExplanation(customReason);
        } else {
          setGeneratedExplanation(reason.template);
        }
      }
    } else {
      setGeneratedExplanation('');
    }
  }, [selectedReason, customReason]);

  const handleReasonChange = (reasonId) => {
    setSelectedReason(reasonId);
    if (reasonId !== 'specific') {
      setCustomReason('');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a cancellation reason');
      return;
    }

    if (selectedReason === 'specific' && !customReason.trim()) {
      Alert.alert('Error', 'Please enter the specific reason for cancellation');
      return;
    }

    setLoading(true);
    
    try {
      const cancellationData = {
        cancellation_reason: selectedReason,
        cancellation_details: generatedExplanation,
        cancelled_by: currentUserId || null
      };

      const result = await onSubmit(cancellationData);
      
      // Show email status in success message
      if (result && result.emailSent) {
        Alert.alert(
          '✅ Success', 
          'Appointment cancelled successfully.\n\nAn email notification has been sent to the patient.'
        );
      } else {
        Alert.alert(
          '⚠️ Success with Note', 
          'Appointment cancelled successfully.\n\nNote: Email notification could not be sent. Please contact the patient manually.',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error in cancel submission:', error);
      Alert.alert('Error', error.message || 'Failed to cancel appointment');
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
        <View style={[apStyle.modalContent, { width: '60%', maxHeight: '80%' }]}>
          
          {/* Header */}
          <View style={apStyle.modalHeader}>
            <Text style={apStyle.modalTitle}>Cancel Appointment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
            
            {/* Appointment Summary */}
            {appointment && (
              <View style={[apStyle.appointmentCard, { marginBottom: 20, backgroundColor: '#f8f9fa' }]}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#3d67ee' }}>
                  📋 Appointment Details
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Patient:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Email:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment.patient_email}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Service:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment.service}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Date & Time:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment.date_time}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Pet:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600' }}>{appointment.pet_name} ({appointment.pet_type})</Text>
                </View>
              </View>
            )}

            {/* Cancellation Reason Dropdown */}
            <View style={apStyle.formGroup}>
              <Text style={[apStyle.formLabel, { marginBottom: 8 }]}>
                Cancellation Reason <Text style={{ color: '#d32f2f' }}>*</Text>
              </Text>
              <View style={apStyle.pickerContainer}>
                <Picker
                  selectedValue={selectedReason}
                  onValueChange={handleReasonChange}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="-- Select a reason --" value="" color="#a8a8a8" />
                  {CANCELLATION_REASONS.map(reason => (
                    <Picker.Item 
                      key={reason.id} 
                      label={reason.label} 
                      value={reason.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Custom Reason Input (only shown when "Specific Reason" is selected) */}
            {selectedReason === 'specific' && (
              <View style={[apStyle.formGroup, { marginTop: 15 }]}>
                <Text style={apStyle.formLabel}>Specific Reason <Text style={{ color: '#d32f2f' }}>*</Text></Text>
                <TextInput
                  style={[apStyle.formInput, { height: 80, textAlignVertical: 'top' }]}
                  value={customReason}
                  onChangeText={setCustomReason}
                  placeholder="Please explain the specific reason for cancellation..."
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={3}
                  maxLength={300}
                />
                <Text style={{ fontSize: 11, color: '#999', textAlign: 'right', marginTop: 5 }}>
                  {customReason.length}/300
                </Text>
              </View>
            )}

            {/* Generated Explanation Preview */}
            {generatedExplanation ? (
              <View style={[apStyle.formGroup, { marginTop: 20 }]}>
                <Text style={apStyle.formLabel}>📧 Email to be sent to patient:</Text>
                <View style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 15, 
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#3d67ee'
                }}>
                  <Text style={{ fontSize: 13, lineHeight: 20, color: '#333' }}>
                    {generatedExplanation}
                  </Text>
                </View>
                
                {/* Email Preview Note */}
                <View style={{ 
                  backgroundColor: '#e3f2fd', 
                  padding: 12, 
                  borderRadius: 5, 
                  marginTop: 15,
                  borderWidth: 1,
                  borderColor: '#90caf9'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail" size={18} color="#1976d2" />
                    <Text style={{ marginLeft: 8, fontSize: 12, color: '#1976d2', fontWeight: '600' }}>
                      Email will be sent to: {appointment?.patient_email || 'No email on record'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

          </ScrollView>

          {/* Action Buttons */}
          <View style={[apStyle.modalActions, { padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
            <TouchableOpacity 
              onPress={onClose}
              style={[apStyle.modalButton, { backgroundColor: '#f5f5f5', flex: 1, marginRight: 10 }]}
              disabled={loading}
            >
              <Text style={{ color: '#666', fontSize: 16, fontWeight: '500' }}>Go Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={!selectedReason || (selectedReason === 'specific' && !customReason) || loading}
              style={[
                apStyle.modalButton, 
                { 
                  flex: 1,
                  marginLeft: 10,
                  backgroundColor: !selectedReason || (selectedReason === 'specific' && !customReason) ? '#ccc' : '#d32f2f',
                  opacity: !selectedReason || (selectedReason === 'specific' && !customReason) || loading ? 0.6 : 1
                }
              ]}
            >
              {loading ? (
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Processing...</Text>
              ) : (
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Confirm Cancellation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CancelAppointmentModal;