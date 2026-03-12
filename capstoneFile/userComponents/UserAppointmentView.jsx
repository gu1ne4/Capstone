import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import homeStyle from '../styles/HomeStyle'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Calendar } from 'react-native-calendars'

export default function UserAppointmentView() {
  const ns = useNavigation();
  
  // State for modals
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelStep, setCancelStep] = useState(1); // 1: Reason, 2: Confirmation
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleStep, setRescheduleStep] = useState(1); // 1: Date & Time, 2: Reason, 3: Confirmation
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedForDetails, setSelectedForDetails] = useState(null); // For right panel details
  
  // Reschedule form state
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleUnderstoodChecked, setRescheduleUnderstoodChecked] = useState(false);
  const [rescheduleReasonError, setRescheduleReasonError] = useState('');
  
  // Cancel form state
  const [cancelReason, setCancelReason] = useState('');
  const [cancelUnderstoodChecked, setCancelUnderstoodChecked] = useState(false);
  const [cancelReasonError, setCancelReasonError] = useState('');
  
  // State for filter tabs
  const [activeFilter, setActiveFilter] = useState('Active'); // Default to 'Active'
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Mock data for appointments with prices
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      service: 'Consultation & Check-Up',
      petName: 'Max',
      date: '2026-03-15',
      time: '9:00AM - 10:00AM',
      doctor: 'Dr. Sarah Johnson',
      status: 'Confirmed',
      branch: 'Las Piñas',
      price: '₱500',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: false,
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: false,
        additionalNotes: 'Pet is doing well, just regular checkup'
      }
    },
    {
      id: 2,
      service: 'Pet Grooming',
      petName: 'Luna',
      date: '2026-03-16',
      time: '10:00AM - 11:00AM',
      doctor: 'Not yet Assigned',
      status: 'Pending',
      branch: 'Taguig',
      price: '₱800',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: false,
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: false,
        additionalNotes: 'First time grooming, please be gentle'
      }
    },
    {
      id: 3,
      service: 'Dental Prophylaxis',
      petName: 'Charlie',
      date: '2026-03-18',
      time: '2:00PM - 3:00PM',
      doctor: 'Dr. Michael Chen',
      status: 'Confirmed',
      branch: 'Las Piñas',
      price: '₱800',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: true,
        medicationDetails: 'Antibiotics for tooth infection',
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: false,
        additionalNotes: 'Has bad breath, might need extraction'
      }
    },
    {
      id: 4,
      service: 'Vaccinations',
      petName: 'Max',
      date: '2026-03-20',
      time: '11:00AM - 12:00PM',
      doctor: 'Dr. Emily Brown',
      status: 'Completed',
      branch: 'Las Piñas',
      price: '₱1,200',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: false,
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: false,
        additionalNotes: ''
      }
    },
    {
      id: 5,
      service: 'Laboratory Tests',
      petName: 'Luna',
      date: '2026-03-22',
      time: '1:00PM - 2:00PM',
      doctor: 'Not yet Assigned',
      status: 'Pending',
      branch: 'Taguig',
      price: '₱1,800',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: false,
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: false,
        additionalNotes: 'Fasting required before blood test'
      }
    },
    {
      id: 6,
      service: 'X-Ray',
      petName: 'Charlie',
      date: '2026-03-25',
      time: '3:00PM - 4:00PM',
      doctor: 'Dr. James Wilson',
      status: 'Confirmed',
      branch: 'Las Piñas',
      price: '₱1,500',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: false,
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: false,
        additionalNotes: 'Limping on right front leg'
      }
    },
    {
      id: 7,
      service: 'Pet Boarding',
      petName: 'Max',
      date: '2026-03-28',
      time: '8:00AM - 9:00AM',
      doctor: 'Not yet Assigned',
      status: 'Pending',
      branch: 'Taguig',
      price: '₱1,200/night',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: false,
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: false,
        additionalNotes: 'Will bring own food and bed'
      }
    },
    {
      id: 8,
      service: 'Ultrasound',
      petName: 'Luna',
      date: '2026-03-30',
      time: '4:00PM - 5:00PM',
      doctor: 'Dr. Amanda Lee',
      status: 'Cancelled',
      branch: 'Las Piñas',
      price: '₱2,000',
      petImage: require('../assets/samplePet.jpg'),
      medicalInfo: {
        medications72h: false,
        fleaPrevention: true,
        rabiesVaccination: true,
        pregnant: true,
        additionalNotes: 'Pregnancy checkup'
      }
    }
  ]);

  // Clinic hours (Monday to Friday)
  const clinicHours = {
    'Monday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
    'Tuesday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
    'Wednesday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
    'Thursday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
    'Friday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
    'Saturday': [], // Closed
    'Sunday': [] // Closed
  };

  // Minimum character requirement for reasons
  const MIN_REASON_CHARS = 10;

  // Get today's date for calendar min date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get max date (2 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get day name from date string
  const getDayName = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Get time slots based on day of week
  const getTimeSlotsForDate = (date) => {
    if (!date) return [];
    const dayName = getDayName(date);
    return clinicHours[dayName] || [];
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    let markedDates = {};
    
    // Mark all weekdays (Monday to Friday) as available
    const startDate = new Date(getTodayDate());
    const endDate = new Date(getMaxDate());
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayName = getDayName(dateString);
      
      if (clinicHours[dayName] && clinicHours[dayName].length > 0) {
        markedDates[dateString] = {
          selected: newDate === dateString,
          selectedColor: '#3d67ee',
          marked: true,
          dotColor: '#ffffff',
        };
      }
    }
    
    return markedDates;
  };

  // Custom calendar header
  const customHeader = (date) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date(date);
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    return (
      <View style={{ alignItems: 'center', paddingVertical: 10 }}>
        <Text style={{ color: '#3d67ee', fontSize: 18, fontWeight: 'bold' }}>
          {month} {year}
        </Text>
      </View>
    );
  };

  // Custom day renderer
  const dayComponent = ({ date, state, marking, onPress }) => {
    const isAvailable = marking && marking.marked;
    const isSelected = marking && marking.selected;
    const isDisabled = state === 'disabled' || state === 'inactive';
    
    const opacity = isAvailable ? 1 : 0.3;
    
    return (
      <TouchableOpacity
        style={{
          width: 32,
          height: 32,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isSelected ? '#3d67ee' : 'transparent',
          borderRadius: 16,
          opacity: opacity,
        }}
        onPress={() => isAvailable && onPress(date)}
        disabled={!isAvailable || isDisabled}
      >
        <Text style={{
          color: isSelected ? 'white' : '#333',
          fontWeight: isSelected ? 'bold' : 'normal',
        }}>
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  };

  // Filter appointments based on active filter and search query
  const getFilteredAppointments = () => {
    let filtered = appointments;
    
    // Apply status filter
    if (activeFilter === 'Active') {
      filtered = filtered.filter(app => app.status === 'Confirmed');
    } else if (activeFilter === 'Pending') {
      filtered = filtered.filter(app => app.status === 'Pending');
    }
    // 'All' shows all except maybe we want to show everything
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.service.toLowerCase().includes(query) ||
        app.petName.toLowerCase().includes(query) ||
        app.doctor.toLowerCase().includes(query) ||
        app.status.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const filtered = getFilteredAppointments();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filtered.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filtered = getFilteredAppointments();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // Handle page change
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle search
  const handleSearch = (text) => {
    setSearchQuery(text);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle cancel appointment
  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelStep(1);
    setCancelReason('');
    setCancelUnderstoodChecked(false);
    setCancelReasonError('');
    setCancelModalVisible(true);
  };

  // Handle reschedule
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleStep(1);
    setNewDate(null);
    setNewTime(null);
    setRescheduleReason('');
    setRescheduleUnderstoodChecked(false);
    setRescheduleReasonError('');
    setRescheduleModalVisible(true);
  };

  // Handle view details (for right panel)
  const handleViewDetails = (appointment) => {
    setSelectedForDetails(appointment);
  };

  // Check if appointment is actionable (Pending or Confirmed)
  const isActionable = (status) => {
    return status === 'Pending' || status === 'Confirmed';
  };

  // Validate cancel reason
  const validateCancelReason = () => {
    if (cancelReason.trim().length < MIN_REASON_CHARS) {
      setCancelReasonError(`Reason must be at least ${MIN_REASON_CHARS} characters`);
      return false;
    }
    setCancelReasonError('');
    return true;
  };

  // Handle cancel next step
  const handleCancelNext = () => {
    if (cancelStep === 1) {
      if (validateCancelReason()) {
        setCancelStep(2);
      }
    }
  };

  // Handle cancel back
  const handleCancelBack = () => {
    if (cancelStep > 1) {
      setCancelStep(cancelStep - 1);
    }
  };

  // Confirm cancel
  const confirmCancel = () => {
    // Update appointment status in the actual data
    const updatedAppointments = appointments.map(app => 
      app.id === selectedAppointment.id ? {...app, status: 'Cancelled'} : app
    );
    setAppointments(updatedAppointments);
    
    // If the cancelled appointment is currently selected for details, update it
    if (selectedForDetails && selectedForDetails.id === selectedAppointment.id) {
      setSelectedForDetails({...selectedAppointment, status: 'Cancelled'});
    }
    
    // Show confirmation message
    alert('Appointment cancelled successfully');
    
    setCancelModalVisible(false);
    setSelectedAppointment(null);
  };

  // Validate reschedule reason
  const validateRescheduleReason = () => {
    if (rescheduleReason.trim().length < MIN_REASON_CHARS) {
      setRescheduleReasonError(`Reason must be at least ${MIN_REASON_CHARS} characters`);
      return false;
    }
    setRescheduleReasonError('');
    return true;
  };

  // Handle reschedule next step
  const handleRescheduleNext = () => {
    if (rescheduleStep === 1) {
      if (newDate && newTime) {
        setRescheduleStep(2);
      } else {
        alert('Please select both date and time');
      }
    } else if (rescheduleStep === 2) {
      if (validateRescheduleReason()) {
        setRescheduleStep(3);
      }
    }
  };

  // Handle reschedule back
  const handleRescheduleBack = () => {
    if (rescheduleStep > 1) {
      setRescheduleStep(rescheduleStep - 1);
    }
  };

  // Confirm reschedule - Change status to Pending if it was Confirmed
  const confirmReschedule = () => {
    // Update appointment with new date, time, and change status to Pending if it was Confirmed
    const updatedAppointments = appointments.map(app => {
      if (app.id === selectedAppointment.id) {
        // If appointment was Confirmed, change to Pending for re-approval
        const newStatus = app.status === 'Confirmed' ? 'Pending' : app.status;
        
        return {
          ...app, 
          date: newDate,
          time: newTime,
          status: newStatus,
          doctor: newStatus === 'Pending' ? 'Not yet Assigned' : app.doctor
        };
      }
      return app;
    });
    
    setAppointments(updatedAppointments);
    
    // If the rescheduled appointment is currently selected for details, update it
    if (selectedForDetails && selectedForDetails.id === selectedAppointment.id) {
      const newStatus = selectedAppointment.status === 'Confirmed' ? 'Pending' : selectedAppointment.status;
      setSelectedForDetails({
        ...selectedAppointment, 
        date: newDate,
        time: newTime,
        status: newStatus,
        doctor: newStatus === 'Pending' ? 'Not yet Assigned' : selectedAppointment.doctor
      });
    }
    
    alert('Reschedule request submitted for review');
    setRescheduleModalVisible(false);
    setSelectedAppointment(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#00aa00';
      case 'Pending': return '#ffaa00';
      case 'Completed': return '#3d67ee';
      case 'Cancelled': return '#ee3d5a';
      default: return '#666';
    }
  };

  const currentItems = getCurrentPageItems();
  const totalPages = getTotalPages();
  const timeSlots = getTimeSlotsForDate(newDate);

  return (
    <View style={{backgroundColor: '#fff', flex: 1}}>
      {/* Sticky Navigation Bar */}
      <View style={{ zIndex: 1000 }}>
        <View style={userStyle.navbar}>
          {/* Profile */}
          <TouchableOpacity onPress={()=>{ns.navigate('Login')}}>
            <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
              <Ionicons name="person-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
              <View style={{flexDirection: 'column', marginRight: 5}}>
                <Text style={[userStyle.smallText, {fontSize: 16, color: "#3d67ee", fontWeight: 600}]}>Login or Sign-up</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[userStyle.navSections, { flexDirection: 'row',  alignItems: 'center', gap: 60, width: '70%'}]}>
              <TouchableOpacity onPress={()=>{ns.navigate('UserHome')}}>
                <Text style={userStyle.navText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>Our Services</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{ns.navigate('UserAppointment')}}>
                <Text style={userStyle.navText}>Book an Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right-side icons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity>
              <View style={userStyle.navSections}>
                <Ionicons name="calendar-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <View style={userStyle.navSections}>
                <Ionicons name="notifications-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      <View style={{flex: 2, flexDirection: 'row', padding: 20, gap: 20, paddingHorizontal: 30}}>

        <View style={{flex: 0.8, backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden'}}>
          <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
            <View style={{paddingHorizontal: 15, paddingBottom: 20}}>
              {/* Header */}
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15}}>
                <Text style={{fontSize: 24, fontWeight: '600', color: '#3d67ee'}}>Your Appointments</Text>
              </View>

              {/* Search Bar */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                paddingHorizontal: 15,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: '#3d67ee',
              }}>
                <Ionicons name="search-outline" size={20} color="#3d67ee" />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    fontSize: 14,
                  }}
                  placeholder="Search by service, pet, doctor, or status..."
                  placeholderTextColor={'#b9b6b6'}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearch('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Tabs */}
              <View style={{flexDirection: 'row', marginBottom: 20, gap: 10}}>
                {['All', 'Active', 'Pending'].map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 20,
                      borderRadius: 20,
                      backgroundColor: activeFilter === filter ? '#3d67ee' : '#ffffff',
                      borderWidth: 1,
                      borderColor: '#3d67ee',
                      marginTop: 5,
                    }}
                    onPress={() => handleFilterChange(filter)}
                  >
                    <Text style={{
                      color: activeFilter === filter ? 'white' : '#3d67ee',
                      fontSize: 12,
                    }}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Table */}
              <View style={{
                borderRadius: 15,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
                marginBottom: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
                alignContent: 'center',
                width: '100%',
              }}>
                {/* Table Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={[userStyle.tableHeader, {flex: 1.2}]}>Service</Text>
                  <Text style={[userStyle.tableHeader, {flex: 1}]}>Pet Name</Text>
                  <Text style={[userStyle.tableHeader, {flex: 1.5}]}>Date & Time</Text>
                  <Text style={[userStyle.tableHeader, {flex: 1.2}]}>Doctor</Text>
                  <Text style={[userStyle.tableHeader, {flex: 0.9}]}>Status</Text>
                </View>

                {/* Table Body */}
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        backgroundColor: selectedForDetails?.id === item.id ? '#e6f0ff' : (index % 2 === 0 ? '#ffffff' : '#ffffff'),
                        borderBottomWidth: index === currentItems.length - 1 ? 0 : 1,
                        borderBottomColor: '#e0e0e0',
                        alignItems: 'center',
                      }}
                      onPress={() => handleViewDetails(item)}
                      activeOpacity={0.7}
                    >

                      {/* Service */}
                      <Text style={[userStyle.tableCell, {flex: 1.2}]} numberOfLines={2}>{item.service}</Text>
                      
                      {/* Pet Name */}
                      <Text style={[userStyle.tableCell, {flex: 1}]}>{item.petName}</Text>
                      
                      {/* Date & Time */}
                      <View style={{flex: 1.5}}>
                        <Text style={userStyle.tableCell}>{formatDate(item.date)}</Text>
                        <Text style={[userStyle.tableCell, {fontSize: 12, color: '#666'}]}>{item.time}</Text>
                      </View>
                      
                      {/* Doctor */}
                      <Text style={[userStyle.tableCell, {flex: 1.2, fontStyle: item.doctor === 'Not yet Assigned' ? 'italic' : 'normal'}]} numberOfLines={2}>
                        {item.doctor}
                      </Text>
                      
                      {/* Status */}
                      <View style={{flex: 0.9}}>
                        <View style={{
                          backgroundColor: getStatusColor(item.status) + '20',
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 12,
                          alignSelf: 'flex-start',
                        }}>
                          <Text style={{
                            color: getStatusColor(item.status),
                            fontWeight: '600',
                            fontSize: 12,
                          }}>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                      
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{padding: 40, alignItems: 'center'}}>
                    <Ionicons name="calendar-outline" size={50} color="#ccc" />
                    <Text style={{marginTop: 10, fontSize: 16, color: '#999'}}>No appointments found</Text>
                  </View>
                )}
              </View>

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10}}>
                  <TouchableOpacity
                    style={{padding: 8}}
                    onPress={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#3d67ee'} />
                  </TouchableOpacity>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 17.5,
                        backgroundColor: currentPage === i + 1 ? '#3d67ee' : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#3d67ee',
                      }}
                      onPress={() => goToPage(i + 1)}
                    >
                      <Text style={{
                        color: currentPage === i + 1 ? 'white' : '#3d67ee',
                        fontWeight: '500',
                      }}>
                        {i + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity
                    style={{padding: 8}}
                    onPress={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#3d67ee'} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Right Panel - 30% - Details View */}
        <View style={{flex: 0.2, justifyContent: 'flex-end' ,backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.20, shadowRadius: 12, elevation: 5, padding: 30}}>
          <View
            style={{alignItems: 'center', marginBottom: 5}}
          >
            <Text style={{fontSize: 15, fontWeight: '500', color: '#3d67ee', marginBottom: 5}}>Appointment Details</Text>
          </View>
          
          <ScrollView style={{flex: 1, padding: 15}} showsVerticalScrollIndicator={false}>
            {selectedForDetails ? (
              <View>
                {/* Pet Header */}
                <View style={{alignItems: 'center', marginBottom: 20}}>
                  <Image 
                    source={selectedForDetails.petImage}
                    style={{width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#3d67ee', marginBottom: 10}}
                  />
                  <Text style={{fontSize: 17, fontWeight: '500', color: '#3d67ee'}}>{selectedForDetails.petName}</Text>
                  <Text style={{fontSize: 14, color: '#666'}}>{selectedForDetails.service}</Text>
                </View>

                {/* Service and Price - NEW */}
                <View style={[userStyle.rightPanelDetailRow, {marginTop: 10}]}>
                  <Ionicons name="cut-outline" size={18} color="#3d67ee" />
                  <Text style={userStyle.rightPanelDetailLabel}>Service:</Text>
                  <Text style={userStyle.rightPanelDetailValue}>{selectedForDetails.service}</Text>
                </View>

                <View style={userStyle.rightPanelDetailRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#3d67ee" />
                  <Text style={userStyle.rightPanelDetailLabel}>Price:</Text>
                  <Text style={[userStyle.rightPanelDetailValue, {color: '#ee3d5a', fontWeight: '600'}]}>{selectedForDetails.price}</Text>
                </View>

                {/* Details */}
                <View style={[userStyle.rightPanelDetailRow, {marginTop: 5}]}>
                  <Ionicons name="calendar-outline" size={18} color="#3d67ee" />
                  <Text style={userStyle.rightPanelDetailLabel}>Date:</Text>
                  <Text style={userStyle.rightPanelDetailValue}>{formatDate(selectedForDetails.date)}</Text>
                </View>

                <View style={userStyle.rightPanelDetailRow}>
                  <Ionicons name="time-outline" size={18} color="#3d67ee" />
                  <Text style={userStyle.rightPanelDetailLabel}>Time:</Text>
                  <Text style={userStyle.rightPanelDetailValue}>{selectedForDetails.time}</Text>
                </View>

                <View style={userStyle.rightPanelDetailRow}>
                  <Ionicons name="person-outline" size={18} color="#3d67ee" />
                  <Text style={userStyle.rightPanelDetailLabel}>Doctor:</Text>
                  <Text style={[userStyle.rightPanelDetailValue, {fontStyle: selectedForDetails.doctor === 'Not yet Assigned' ? 'italic' : 'normal'}]}>
                    {selectedForDetails.doctor}
                  </Text>
                </View>

                <View style={userStyle.rightPanelDetailRow}>
                  <Ionicons name="location-outline" size={18} color="#3d67ee" />
                  <Text style={userStyle.rightPanelDetailLabel}>Branch:</Text>
                  <Text style={userStyle.rightPanelDetailValue}>{selectedForDetails.branch}</Text>
                </View>

                <View style={userStyle.rightPanelDetailRow}>
                  <Ionicons name="ellipse" size={18} color={getStatusColor(selectedForDetails.status)} />
                  <Text style={userStyle.rightPanelDetailLabel}>Status:</Text>
                  <View style={{
                    backgroundColor: getStatusColor(selectedForDetails.status) + '20',
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      color: getStatusColor(selectedForDetails.status),
                      fontWeight: '600',
                      fontSize: 12,
                    }}>
                      {selectedForDetails.status}
                    </Text>
                  </View>
                </View>

                {/* Medical Information */}
                <View style={{marginTop: 20, borderTopWidth: 1, borderTopColor: '#3d67ee20', paddingTop: 15}}>
                  <Text style={{fontSize: 16, fontWeight: '500', color: '#3d67ee', marginBottom: 10}}>
                    Medical Information
                  </Text>
                  
                  <View style={userStyle.rightPanelDetailRow}>
                    <Ionicons name="medical-outline" size={16} color="#666" />
                    <Text style={userStyle.rightPanelDetailLabelSmall}>Medications (72h):</Text>
                    <Text style={[userStyle.rightPanelDetailValueSmall, {color: selectedForDetails.medicalInfo?.medications72h ? '#ee3d5a' : '#00aa00'}]}>
                      {selectedForDetails.medicalInfo?.medications72h ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  
                  {selectedForDetails.medicalInfo?.medications72h && selectedForDetails.medicalInfo?.medicationDetails && (
                    <View style={{marginLeft: 24, marginBottom: 8}}>
                      <Text style={{fontSize: 12, color: '#666', fontStyle: 'italic'}}>
                        {selectedForDetails.medicalInfo.medicationDetails}
                      </Text>
                    </View>
                  )}
                  
                  <View style={userStyle.rightPanelDetailRow}>
                    <Ionicons name="bug-outline" size={16} color="#666" />
                    <Text style={userStyle.rightPanelDetailLabelSmall}>Flea/Tick Prevention:</Text>
                    <Text style={[userStyle.rightPanelDetailValueSmall, {color: selectedForDetails.medicalInfo?.fleaPrevention ? '#00aa00' : '#ee3d5a'}]}>
                      {selectedForDetails.medicalInfo?.fleaPrevention ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  
                  <View style={userStyle.rightPanelDetailRow}>
                    <Ionicons name="fitness-outline" size={16} color="#666" />
                    <Text style={userStyle.rightPanelDetailLabelSmall}>Rabies+4in1:</Text>
                    <Text style={[userStyle.rightPanelDetailValueSmall, {color: selectedForDetails.medicalInfo?.rabiesVaccination ? '#00aa00' : '#ee3d5a'}]}>
                      {selectedForDetails.medicalInfo?.rabiesVaccination ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  
                  <View style={userStyle.rightPanelDetailRow}>
                    <Ionicons name="heart-outline" size={16} color="#666" />
                    <Text style={userStyle.rightPanelDetailLabelSmall}>Pregnant:</Text>
                    <Text style={[userStyle.rightPanelDetailValueSmall, {color: selectedForDetails.medicalInfo?.pregnant ? '#ee3d5a' : '#00aa00'}]}>
                      {selectedForDetails.medicalInfo?.pregnant ? 'Yes' : 'No'}
                    </Text>
                  </View>
                </View>

                {/* Additional Notes */}
                {selectedForDetails.medicalInfo?.additionalNotes && (
                  <View style={{marginTop: 15}}>
                    <Text style={{fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 5}}>Additional Notes:</Text>
                    <Text style={{fontSize: 13, color: '#333', fontStyle: 'italic', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8}}>
                      {selectedForDetails.medicalInfo.additionalNotes}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50}}>
                <Ionicons name="document-text-outline" size={60} color="#ccc" />
                <Text style={{marginTop: 10, fontSize: 16, color: '#999', textAlign: 'center'}}>
                  Select an appointment to view details
                </Text>
              </View>
            )}
          </ScrollView>
          
          {/* Action Buttons - Only show if appointment is actionable (Pending or Confirmed) */}
          {selectedForDetails && isActionable(selectedForDetails.status) && (
            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, gap: 10}}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  backgroundColor: '#ee3d5a',
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
                onPress={() => handleCancel(selectedForDetails)}
              >
                <Ionicons name="close-outline" size={18} color="white" />
                <Text style={{color: 'white', fontSize: 14, fontWeight: '500'}}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  backgroundColor: '#3d67ee',
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
                onPress={() => handleReschedule(selectedForDetails)}
              >
                <Ionicons name="calendar-outline" size={18} color="white" />
                <Text style={{color: 'white', fontSize: 14, fontWeight: '500'}}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Cancel Modal - 2 Steps */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={userStyle.modalOverlay}>
          <View style={[userStyle.modalContent, {width: '35%', maxHeight: '70%'}]}>
            <TouchableOpacity 
              style={userStyle.modalCloseButton}
              onPress={() => setCancelModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
            
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10}}>
              <Ionicons name="close-circle-outline" size={30} color="#ee3d5a" style={{marginTop: 3}}/>
              <Text style={userStyle.modalTitle}>Cancel Appointment</Text>
            </View>
            
            {/* Progress Bar - 2 Steps */}
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15, width: '100%', marginBottom: 30}}>
              <View style={{alignItems: 'center'}}>
                <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: cancelStep >= 1 ? '#ee3d5a' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 14}}>1</Text>
                </View>
                <Text style={{fontSize: 10, marginTop: 5, color: cancelStep >= 1 ? '#ee3d5a' : '#999'}}>Reason</Text>
              </View>
              
              <View style={{width: 40, height: 2, backgroundColor: cancelStep >= 2 ? '#ee3d5a' : '#ccc', marginHorizontal: 5}} />
              
              <View style={{alignItems: 'center'}}>
                <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: cancelStep >= 2 ? '#ee3d5a' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 14}}>2</Text>
                </View>
                <Text style={{fontSize: 10, marginTop: 5, color: cancelStep >= 2 ? '#ee3d5a' : '#999'}}>Confirmation</Text>
              </View>
            </View>
            
            <ScrollView style={{width: '100%', maxHeight: 350}} showsVerticalScrollIndicator={false}>
              {cancelStep === 1 && (
                <View>
                  <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 12, textAlign: 'center'}}>
                    Reason for Cancellation
                  </Text>
                  
                  <Text style={{fontSize: 14, color: '#000000', marginBottom: 16, textAlign: 'center'}}>
                    Please provide a reason for cancelling your appointment:
                  </Text>
                  
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ee3d5a',
                      borderRadius: 10,
                      padding: 15,
                      fontSize: 14,
                      minHeight: 120,
                      textAlignVertical: 'top',
                      backgroundColor: '#f8f9fa',
                    }}
                    placeholder="e.g., Emergency, Change of plans, etc."
                    placeholderTextColor={'#6b6b6b'}
                    value={cancelReason}
                    onChangeText={(text) => {
                      setCancelReason(text);
                      if (cancelReasonError) setCancelReasonError('');
                    }}
                    multiline
                    numberOfLines={5}
                  />
                  
                  {cancelReasonError ? (
                    <Text style={{color: '#ee3d5a', fontSize: 12, marginTop: 5, marginLeft: 5}}>
                      {cancelReasonError}
                    </Text>
                  ) : (
                    <Text style={{color: '#999', fontSize: 11, marginTop: 5, marginLeft: 5}}>
                      Minimum {MIN_REASON_CHARS} characters ({cancelReason.length}/{MIN_REASON_CHARS})
                    </Text>
                  )}
                </View>
              )}
              
              {cancelStep === 2 && selectedAppointment && (
                <View>
                  <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 15, textAlign: 'center'}}>
                    Confirm Cancellation
                  </Text>
                  
                  {/* Appointment Details */}
                  <View style={{backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 15}}>
                    <Text style={{fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10}}>Appointment Details:</Text>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Pet:</Text>
                      <Text style={{fontSize: 13, color: '#333', fontWeight: '500'}}>{selectedAppointment.petName}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Service:</Text>
                      <Text style={{fontSize: 13, color: '#333'}}>{selectedAppointment.service}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Price:</Text>
                      <Text style={{fontSize: 13, color: '#ee3d5a', fontWeight: '500'}}>{selectedAppointment.price}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Date:</Text>
                      <Text style={{fontSize: 13, color: '#333'}}>{formatDate(selectedAppointment.date)}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Time:</Text>
                      <Text style={{fontSize: 13, color: '#333'}}>{selectedAppointment.time}</Text>
                    </View>
                  </View>
                  
                  {/* Reason */}
                  {cancelReason && (
                    <View style={{marginBottom: 15}}>
                      <Text style={{fontSize: 13, fontWeight: '500', color: '#666', marginBottom: 5}}>Reason for Cancellation:</Text>
                      <Text style={{fontSize: 13, color: '#333', fontStyle: 'italic', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8}}>
                        "{cancelReason}"
                      </Text>
                    </View>
                  )}
                  
                  {/* Cancellation Policy Notice */}
                  <View style={{backgroundColor: '#ffebee', padding: 15, borderRadius: 10, marginBottom: 15}}>
                    <Text style={{fontSize: 14, fontWeight: '600', color: '#b71c1c', marginBottom: 8}}>
                      ⚠️ Non-Refundable
                    </Text>
                    <Text style={{fontSize: 13, color: '#b71c1c', marginBottom: 5}}>
                      Cancelling this appointment means:
                    </Text>
                    <Text style={{fontSize: 12, color: '#b71c1c', marginBottom: 3}}>
                      • Any payments made are non-refundable
                    </Text>
                    <Text style={{fontSize: 12, color: '#b71c1c', marginBottom: 3}}>
                      • The appointment slot will be released to other patients
                    </Text>
                    <Text style={{fontSize: 12, color: '#b71c1c'}}>
                      • This action cannot be undone
                    </Text>
                  </View>
                  
                  {/* Checkbox */}
                  <TouchableOpacity 
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => setCancelUnderstoodChecked(!cancelUnderstoodChecked)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: '#ee3d5a',
                      backgroundColor: cancelUnderstoodChecked ? '#ee3d5a' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                      {cancelUnderstoodChecked && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={{fontSize: 13, color: '#333', flex: 1}}>
                      I understand that this cancellation is non-refundable and cannot be undone
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            
            <View style={[userStyle.modalButtonContainer, {marginTop: 20}]}>
              {cancelStep > 1 ? (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: '#ccc'}]}
                  onPress={handleCancelBack}
                >
                  <Text style={{color: '#333'}}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: '#ccc'}]}
                  onPress={() => setCancelModalVisible(false)}
                >
                  <Text style={{color: '#333'}}>Close</Text>
                </TouchableOpacity>
              )}
              
              {cancelStep < 2 ? (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: '#ee3d5a'}]}
                  onPress={handleCancelNext}
                >
                  <Text style={{color: 'white'}}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: cancelUnderstoodChecked ? '#ee3d5a' : '#ccc'}]}
                  onPress={confirmCancel}
                  disabled={!cancelUnderstoodChecked}
                >
                  <Text style={{color: 'white'}}>Confirm Cancellation</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal - 3 Steps */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rescheduleModalVisible}
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={userStyle.modalOverlay}>
          <View style={[userStyle.modalContent, {width: '40%', maxHeight: '80%'}]}>
            <TouchableOpacity 
              style={userStyle.modalCloseButton}
              onPress={() => setRescheduleModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
            
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10}}>
                <Ionicons name="calendar-outline" size={30} color="#3d67ee" style={{marginTop: 3}}/>
                <Text style={userStyle.modalTitle}>Reschedule Appointment</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15, width: '100%', marginBottom: 30}}>
              <View style={{alignItems: 'center'}}>
                <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: rescheduleStep >= 1 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 14}}>1</Text>
                </View>
                <Text style={{fontSize: 10, marginTop: 5, color: rescheduleStep >= 1 ? '#3d67ee' : '#999'}}>Date & Time</Text>
              </View>
              
              <View style={{width: 40, height: 2, backgroundColor: rescheduleStep >= 2 ? '#3d67ee' : '#ccc', marginHorizontal: 5}} />
              
              <View style={{alignItems: 'center'}}>
                <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: rescheduleStep >= 2 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 14}}>2</Text>
                </View>
                <Text style={{fontSize: 10, marginTop: 5, color: rescheduleStep >= 2 ? '#3d67ee' : '#999'}}>Reason</Text>
              </View>
              
              <View style={{width: 40, height: 2, backgroundColor: rescheduleStep >= 3 ? '#3d67ee' : '#ccc', marginHorizontal: 5}} />
              
              <View style={{alignItems: 'center'}}>
                <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: rescheduleStep >= 3 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 14}}>3</Text>
                </View>
                <Text style={{fontSize: 10, marginTop: 5, color: rescheduleStep >= 3 ? '#3d67ee' : '#999'}}>Confirmation</Text>
              </View>
            </View>
            
            <ScrollView style={{width: '100%', maxHeight: 400}} showsVerticalScrollIndicator={false}>
              {rescheduleStep === 1 && (
                <View>
                  <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 20, textAlign: 'center'}}>
                    Select New Date & Time
                  </Text>
                  
                  {/* Calendar */}
                  <View style={{borderWidth: 1, borderColor: '#3d67ee', borderRadius: 10, overflow: 'hidden', marginBottom: 15, width: '80%', alignSelf: 'center'}}>
                    <Calendar
                      style={{width: '100%'}}
                      theme={{
                        selectedDayBackgroundColor: '#3d67ee',
                        todayTextColor: '#3d67ee',
                        arrowColor: '#3d67ee',
                        monthTextColor: '#3d67ee',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: 'bold',
                      }}
                      markedDates={getMarkedDates()}
                      onDayPress={(day) => setNewDate(day.dateString)}
                      enableSwipeMonths={true}
                      minDate={getTodayDate()}
                      maxDate={getMaxDate()}
                      hideArrows={false}
                      hideExtraDays={true}
                      renderHeader={(date) => customHeader(date)}
                      dayComponent={dayComponent}
                    />
                  </View>
                  
                  {/* Time Slots */}
                  {newDate && (
                    <View>
                      <Text style={{fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 20, marginTop: 20, textAlign: 'center'}}>
                        Available Time Slots for {formatDate(newDate)}:
                      </Text>
                      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 10, justifyContent: 'center', marginBottom: 10}}>
                        {timeSlots.map((time, index) => (
                          <TouchableOpacity
                            key={index}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: 5,
                              backgroundColor: newTime === time ? '#3d67ee' : '#f0f0f0',
                              borderWidth: 1,
                              borderColor: '#3d67ee',
                              minWidth: 100,
                            }}
                            onPress={() => setNewTime(time)}
                          >
                            <Text style={{
                              color: newTime === time ? 'white' : '#333',
                              fontSize: 12,
                              textAlign: 'center'
                            }}>
                              {time}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              {rescheduleStep === 2 && (
                <View>
                  <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 12, textAlign: 'center'}}>
                    Reason for Rescheduling
                  </Text>
                  
                  <Text style={{fontSize: 14, color: '#000000', marginBottom: 16, textAlign: 'center'}}>
                    Please provide a reason for rescheduling your appointment:
                  </Text>
                  
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#3d67ee',
                      borderRadius: 10,
                      padding: 15,
                      fontSize: 14,
                      minHeight: 120,
                      textAlignVertical: 'top',
                      backgroundColor: '#f8f9fa',
                    }}
                    placeholder="e.g., Conflict with work schedule, Pet not feeling well, etc."
                    placeholderTextColor={'#6b6b6b'}
                    value={rescheduleReason}
                    onChangeText={(text) => {
                      setRescheduleReason(text);
                      if (rescheduleReasonError) setRescheduleReasonError('');
                    }}
                    multiline
                    numberOfLines={5}
                  />
                  
                  {rescheduleReasonError ? (
                    <Text style={{color: '#ee3d5a', fontSize: 12, marginTop: 5, marginLeft: 5}}>
                      {rescheduleReasonError}
                    </Text>
                  ) : (
                    <Text style={{color: '#999', fontSize: 11, marginTop: 5, marginLeft: 5}}>
                      Minimum {MIN_REASON_CHARS} characters ({rescheduleReason.length}/{MIN_REASON_CHARS})
                    </Text>
                  )}
                </View>
              )}
              
              {rescheduleStep === 3 && selectedAppointment && (
                <View>
                  <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 15, textAlign: 'center'}}>
                    Confirm Reschedule Request
                  </Text>
                  
                  {/* Original Appointment Details */}
                  <View style={{backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 15}}>
                    <Text style={{fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10}}>Original Appointment:</Text>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Pet:</Text>
                      <Text style={{fontSize: 13, color: '#333', fontWeight: '500'}}>{selectedAppointment.petName}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Service:</Text>
                      <Text style={{fontSize: 13, color: '#333'}}>{selectedAppointment.service}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Price:</Text>
                      <Text style={{fontSize: 13, color: '#ee3d5a', fontWeight: '500'}}>{selectedAppointment.price}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Date:</Text>
                      <Text style={{fontSize: 13, color: '#333'}}>{formatDate(selectedAppointment.date)}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 80, fontSize: 13, color: '#666'}}>Time:</Text>
                      <Text style={{fontSize: 13, color: '#333'}}>{selectedAppointment.time}</Text>
                    </View>
                  </View>
                  
                  {/* New Appointment Details */}
                  {newDate && newTime && (
                    <View style={{backgroundColor: '#e6f0ff', padding: 15, borderRadius: 10, marginBottom: 15}}>
                      <Text style={{fontSize: 14, fontWeight: '600', color: '#3d67ee', marginBottom: 10}}>New Requested Schedule:</Text>
                      <View style={{flexDirection: 'row', marginBottom: 5}}>
                        <Text style={{width: 80, fontSize: 13, color: '#666'}}>Date:</Text>
                        <Text style={{fontSize: 13, color: '#3d67ee', fontWeight: '500'}}>{formatDate(newDate)}</Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{width: 80, fontSize: 13, color: '#666'}}>Time:</Text>
                        <Text style={{fontSize: 13, color: '#3d67ee', fontWeight: '500'}}>{newTime}</Text>
                      </View>
                      <View style={{marginTop: 8}}>
                        <Text style={{fontSize: 12, color: '#ffaa00', fontStyle: 'italic'}}>
                          {selectedAppointment.status === 'Confirmed' ? 'This appointment will be set to Pending for re-approval' : ''}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Reason */}
                  {rescheduleReason && (
                    <View style={{marginBottom: 15}}>
                      <Text style={{fontSize: 13, fontWeight: '500', color: '#666', marginBottom: 5}}>Reason:</Text>
                      <Text style={{fontSize: 13, color: '#333', fontStyle: 'italic', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8}}>
                        "{rescheduleReason}"
                      </Text>
                    </View>
                  )}
                  
                  {/* Reviewal Notice */}
                  <View style={{backgroundColor: '#fff3cd', padding: 15, borderRadius: 10, marginBottom: 15}}>
                    <Text style={{fontSize: 14, fontWeight: '600', color: '#856404', marginBottom: 8}}>
                      ⏳ Under Review
                    </Text>
                    <Text style={{fontSize: 13, color: '#856404', marginBottom: 5}}>
                      Your reschedule request will undergo reviewal and will take about 1-2 days to process.
                    </Text>
                    <Text style={{fontSize: 12, color: '#856404'}}>
                      You will receive an email notification once your request has been approved.
                    </Text>
                    {selectedAppointment.status === 'Confirmed' && (
                      <Text style={{fontSize: 12, color: '#856404', fontWeight: '500', marginTop: 5}}>
                        Note: Your appointment status will change to Pending until approved.
                      </Text>
                    )}
                  </View>
                  
                  {/* Checkbox */}
                  <TouchableOpacity 
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => setRescheduleUnderstoodChecked(!rescheduleUnderstoodChecked)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: '#3d67ee',
                      backgroundColor: rescheduleUnderstoodChecked ? '#3d67ee' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                      {rescheduleUnderstoodChecked && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={{fontSize: 13, color: '#333', flex: 1}}>
                      I understand that this reschedule request will be reviewed and may take 1-2 days for approval
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            
            <View style={[userStyle.modalButtonContainer, {marginTop: 20}]}>
              {rescheduleStep > 1 ? (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: '#ccc'}]}
                  onPress={handleRescheduleBack}
                >
                  <Text style={{color: '#333'}}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: '#ccc'}]}
                  onPress={() => setRescheduleModalVisible(false)}
                >
                  <Text style={{color: '#333'}}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              {rescheduleStep < 3 ? (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: '#3d67ee'}]}
                  onPress={handleRescheduleNext}
                >
                  <Text style={{color: 'white'}}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[userStyle.modalButton, {backgroundColor: rescheduleUnderstoodChecked ? '#3d67ee' : '#ccc'}]}
                  onPress={confirmReschedule}
                  disabled={!rescheduleUnderstoodChecked}
                >
                  <Text style={{color: 'white'}}>Submit Request</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}