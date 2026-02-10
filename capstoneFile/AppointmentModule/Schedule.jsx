import { View, Text, TouchableOpacity, Image, TextInput, Modal, Switch, Pressable, ScrollView, Alert } from 'react-native';
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
    const [doctorFilter, setDoctorFilter] = useState('');
    
    const [currentView, setCurrentView] = useState('table'); 
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [showDoctorPicker, setShowDoctorPicker] = useState(false);

    // Sample doctors data
    const doctors = [
        { id: '1', name: 'Dr. Maria Santos', specialty: 'General Practice', available: true },
        { id: '2', name: 'Dr. Juan Dela Cruz', specialty: 'Surgery', available: true },
        { id: '3', name: 'Dr. Angela Reyes', specialty: 'Dermatology', available: false },
        { id: '4', name: 'Dr. Robert Lim', specialty: 'Internal Medicine', available: true },
        { id: '5', name: 'Dr. Sarah Chen', specialty: 'Pediatrics', available: true },
    ];

    // Sample user data - no doctors assigned by default
    const [userData, setUserData] = useState([
        {
            id: 1,
            name: 'John Doe',
            service: 'Vaccination',
            dateTime: 'Feb 14, 2026 - 10:00 AM',
            doctor: 'Not Assigned',
            assignedDoctor: '',
            details: {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                address: '123 Main St, City, State 12345',
                petName: 'Max',
                petType: 'Dog',
                petBreed: 'Golden Retriever',
                gender: 'Female',
            }
        }
    ]);

    // Filter appointments based on service and doctor
    const filteredAppointments = userData.filter(appointment => {
        const matchesService = service === '' || appointment.service === service;
        const matchesDoctor = doctorFilter === '' || appointment.doctor === doctorFilter;
        return matchesService && matchesDoctor;
    });

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setSelectedDoctor(user.assignedDoctor || '');
        setCurrentView('userDetails');
    };

    const handleBackToList = () => {
        setCurrentView('table');
        setSelectedUser(null);
        setSelectedDoctor('');
    };

    const handleAssignDoctor = () => {
        if (!selectedDoctor) {
            Alert.alert('Error', 'Please select a doctor first');
            return;
        }

        // Update the user data with the new assigned doctor
        const updatedUserData = userData.map(user => {
            if (user.id === selectedUser.id) {
                const doctor = doctors.find(d => d.id === selectedDoctor);
                return {
                    ...user,
                    assignedDoctor: selectedDoctor,
                    doctor: doctor ? doctor.name : user.doctor
                };
            }
            return user;
        });

        setUserData(updatedUserData);
        setSelectedUser(prev => {
            const doctor = doctors.find(d => d.id === selectedDoctor);
            return {
                ...prev,
                assignedDoctor: selectedDoctor,
                doctor: doctor ? doctor.name : prev.doctor
            };
        });
        
        Alert.alert('Success', 'Doctor assigned successfully!');
        setShowDoctorPicker(false);
    };

    const handleCancelAppointment = () => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment? This action cannot be undone.',
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        // Update the user data to mark as cancelled
                        const updatedUserData = userData.map(user => {
                            if (user.id === selectedUser.id) {
                                return {
                                    ...user,
                                    status: 'Cancelled'
                                };
                            }
                            return user;
                        });

                        setUserData(updatedUserData);
                        setSelectedUser(prev => ({
                            ...prev,
                            status: 'Cancelled'
                        }));
                        
                        Alert.alert('Cancelled', 'Appointment has been cancelled.');
                    }
                }
            ]
        );
    };

    const handleCreateAppointment = () => {
        Alert.alert(
            'Create Appointment',
            'This feature is coming soon!',
            [{ text: 'OK' }]
        );
    };

    // User Details Component
    const UserDetailsView = ({ user, onBack }) => {
        if (!user) return null;
        
        const assignedDoctor = doctors.find(d => d.id === user.assignedDoctor);
        
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
                                <Text style={apStyle.detailValue}>{user.details.fullName}</Text>
                            </View>
                            
                            <View style={apStyle.detailItem}>
                                <Text style={apStyle.detailLabel}>Email</Text>
                                <Text style={apStyle.detailValue}>{user.details.email}</Text>
                            </View>
                            
                            <View style={apStyle.detailItem}>
                                <Text style={apStyle.detailLabel}>Phone</Text>
                                <Text style={apStyle.detailValue}>{user.details.phone}</Text>
                            </View>
                            
                            <View style={apStyle.detailItem}>
                                <Text style={apStyle.detailLabel}>Address</Text>
                                <Text style={apStyle.detailValue}>{user.details.address}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Pet Information Section */}
                    <View style={apStyle.sectionContainer}>
                        <Text style={apStyle.sectionTitle}>Pet Information</Text>
                        
                        <View style={apStyle.detailsGrid}>
                            <View style={apStyle.detailItem}>
                                <Text style={apStyle.detailLabel}>Pet Name</Text>
                                <Text style={apStyle.detailValue}>{user.details.petName}</Text>
                            </View>
                            
                            <View style={apStyle.detailItem}>
                                <Text style={apStyle.detailLabel}>Type</Text>
                                <Text style={apStyle.detailValue}>{user.details.petType}</Text>
                            </View>
                            
                            <View style={apStyle.detailItem}>
                                <Text style={apStyle.detailLabel}>Breed</Text>
                                <Text style={apStyle.detailValue}>{user.details.petBreed}</Text>
                            </View>
                            
                            <View style={apStyle.detailItem}>
                                <Text style={apStyle.detailLabel}>Gender</Text>
                                <Text style={apStyle.detailValue}>{user.details.gender}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Appointment Details */}
                    <View style={apStyle.sectionContainer}>
                        <Text style={apStyle.sectionTitle}>Appointment Details</Text>
                        
                        <View style={apStyle.appointmentCard}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, fontWeight: '600' }}>{user.service}</Text>
                                <Text style={{ color: '#3d67ee', fontWeight: '600' }}>{user.dateTime}</Text>
                            </View>
                            
                            <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ fontSize: 14, color: '#666' }}>
                                        Assigned Doctor: <Text style={{ 
                                            fontWeight: '600',
                                            color: user.doctor === 'Not Assigned' ? '#f57c00' : '#333'
                                        }}>{user.doctor}</Text>
                                    </Text>
                                    {assignedDoctor && (
                                        <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                            Specialty: {assignedDoctor.specialty}
                                        </Text>
                                    )}
                                </View>
                                
                                <TouchableOpacity 
                                    onPress={() => setShowDoctorPicker(true)}
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

                    {/* Action Buttons */}
                    <View style={[apStyle.sectionContainer, { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 30 }]}>
                        <TouchableOpacity style={[apStyle.actionButton, { backgroundColor: '#3d67ee' }]}>
                            <Ionicons name="calendar" size={18} color="#fff" />
                            <Text style={[apStyle.actionButtonText, { color: '#fff' }]}>Reschedule</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={handleCancelAppointment}
                            disabled={user.status === 'Cancelled'}
                            style={[
                                apStyle.actionButton, 
                                { 
                                    backgroundColor: user.status === 'Cancelled' ? '#e0e0e0' : '#ffebee', 
                                    borderWidth: 1, 
                                    borderColor: user.status === 'Cancelled' ? '#bdbdbd' : '#ffcdd2',
                                    opacity: user.status === 'Cancelled' ? 0.6 : 1
                                }
                            ]}
                        >
                            <Ionicons 
                                name={user.status === 'Cancelled' ? "close-circle" : "close-circle-outline"} 
                                size={18}
                                color={user.status === 'Cancelled' ? '#757575' : '#d32f2f'}
                            />
                            <Text style={[
                                apStyle.actionButtonText, 
                                { color: user.status === 'Cancelled' ? '#757575' : '#d32f2f' }
                            ]}>
                                {user.status === 'Cancelled' ? 'Cancelled' : 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[apStyle.actionButton, { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9' }]}>
                            <Ionicons name="checkmark-circle" size={18} color="#2e7d32" />
                            <Text style={[apStyle.actionButtonText, { color: '#2e7d32' }]}>Complete</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Doctor Picker Modal */}
                <Modal
                    visible={showDoctorPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowDoctorPicker(false)}
                >
                    <View style={apStyle.modalOverlay}>
                        <View style={apStyle.modalContent}>
                            <View style={apStyle.modalHeader}>
                                <Text style={apStyle.modalTitle}>Assign Doctor</Text>
                                <TouchableOpacity onPress={() => setShowDoctorPicker(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                            
                            <Text style={{ marginBottom: 15, color: '#666' }}>
                                Select a doctor for {user?.name}'s appointment
                            </Text>
                            
                            <Picker
                                selectedValue={selectedDoctor}
                                onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
                                style={[homeStyle.pickerStyle, { width: '100%', height: 200 }]}
                            >
                                <Picker.Item label="Select a doctor" value="" color="#a8a8a8" />
                                {doctors
                                    .filter(doctor => doctor.available)
                                    .map(doctor => (
                                        <Picker.Item 
                                            key={doctor.id} 
                                            label={`${doctor.name} - ${doctor.specialty}`} 
                                            value={doctor.id} 
                                        />
                                    ))
                                }
                            </Picker>
                            
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                <TouchableOpacity 
                                    onPress={() => setShowDoctorPicker(false)}
                                    style={[apStyle.modalButton, { backgroundColor: '#f5f5f5' }]}
                                >
                                    <Text style={{ color: '#666' }}>Cancel</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    onPress={handleAssignDoctor}
                                    style={[apStyle.modalButton, { backgroundColor: '#3d67ee' }]}
                                >
                                    <Text style={{ color: 'white', fontWeight: '600' }}>Assign Doctor</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    // Table View Component
    const TableView = ({ onViewUser }) => {
        return (
            <View style={[apStyle.whiteContainer, {padding: 30, flex: 1}]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <View>
                        <Text style={{fontSize: 25, fontWeight: 700}}>Booked Appointments</Text>
                        <Text style={{fontSize: 14, marginTop: 5, opacity: 0.5}}>Manage available days, working hours, and appointment slots for vet bookings.</Text>
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
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginTop: 20 }}>
                    {/* Service Filter */}
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
                    
                    {/* Doctor Filter */}
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
                                    key={doctor.id} 
                                    label={doctor.name} 
                                    value={doctor.name} 
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

                <DataTable style={{marginTop: 20}}>
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
                        <DataTable.Title style={{ flex: 1, justifyContent: 'flex-end' }}>
                            <Text style={{ fontSize: 12, fontWeight: '700' }}>View</Text>
                        </DataTable.Title>
                    </DataTable.Header>

                    {/* Filtered Rows */}
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
                                    <Text style={{ fontSize: 12 }}>{user.dateTime}</Text>
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
                                    No appointments found matching your filters
                                </Text>
                            </DataTable.Cell>
                        </DataTable.Row>
                    )}

                    <DataTable.Pagination
                        optionsPerPage={[8]}
                    />
                </DataTable>
            </View>
        );
    };

    return (
        <View style={homeStyle.biContainer}>

            {/* NAVBAR - RESTORED */}
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
                                current={'2026-02-01'} 
                                onDayPress={(day) => {
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
                                    {doctors.map((doctor) => (
                                        <DataTable.Row key={doctor.id}>
                                            <DataTable.Cell style={{ flex: 2 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: doctor.available ? '#4CAF50' : '#F44336',
                                                        marginRight: 10
                                                    }} />
                                                    <Image 
                                                        source={require('../assets/userAvatar.jpg')} 
                                                        style={{width: 30, height: 30, borderRadius: 20, marginRight: 10 }}
                                                    />
                                                    <View>
                                                        <Text style={{ fontSize: 14, fontWeight: '600' }}>{doctor.name}</Text>
                                                        <Text style={{ fontSize: 12, color: '#666' }}>{doctor.specialty}</Text>
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
                            <TableView onViewUser={handleViewUser} />
                        ) : (
                            <UserDetailsView 
                                user={selectedUser} 
                                onBack={handleBackToList}
                            />
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}