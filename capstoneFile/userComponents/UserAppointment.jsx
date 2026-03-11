import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground, FlatList, Modal, Animated } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Calendar } from 'react-native-calendars'
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import homeStyle from '../styles/HomeStyle'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import docStyle from '../styles/DoctorStyles'

// Mock data for doctor schedules - UPDATED with March dates only
const doctorSchedules = {
  'Dr. Sarah Johnson': {
    availableDates: {
      '2026-03-06': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '2:00PM - 3:00PM'],
      '2026-03-07': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-08': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-09': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-10': ['9:00AM - 10:00AM', '12:00PM - 1:00PM', '4:00PM - 5:00PM'],
      '2026-03-11': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '2:00PM - 3:00PM'],
      '2026-03-12': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-13': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM']
    }
  },
  'Dr. Michael Chen': {
    availableDates: {
      '2026-03-06': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-07': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-08': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '4:00PM - 5:00PM'],
      '2026-03-09': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-10': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-11': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-12': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-13': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '4:00PM - 5:00PM']
    }
  },
  'Dr. Lisa Garcia': {
    availableDates: {
      '2026-03-06': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-07': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-08': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-09': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-10': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-11': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-12': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-13': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM']
    }
  },
  'Dr. James Wilson': {
    availableDates: {
      '2026-03-06': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '2:00PM - 3:00PM'],
      '2026-03-07': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-08': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-09': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-10': ['9:00AM - 10:00AM', '12:00PM - 1:00PM', '4:00PM - 5:00PM'],
      '2026-03-11': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '2:00PM - 3:00PM'],
      '2026-03-12': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-13': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM']
    }
  },
  'Dr. Emily Brown': {
    availableDates: {
      '2026-03-06': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-07': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-08': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '4:00PM - 5:00PM'],
      '2026-03-09': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-10': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-11': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-12': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-13': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '4:00PM - 5:00PM']
    }
  },
  'Dr. Robert Taylor': {
    availableDates: {
      '2026-03-06': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-07': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-08': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-09': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-10': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-11': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-12': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-13': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM']
    }
  },
  'Dr. Amanda Lee': {
    availableDates: {
      '2026-03-06': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '2:00PM - 3:00PM'],
      '2026-03-07': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-08': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-09': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-10': ['9:00AM - 10:00AM', '12:00PM - 1:00PM', '4:00PM - 5:00PM'],
      '2026-03-11': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '2:00PM - 3:00PM'],
      '2026-03-12': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-13': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM']
    }
  },
  'Dr. David Kim': {
    availableDates: {
      '2026-03-06': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-07': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-08': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '4:00PM - 5:00PM'],
      '2026-03-09': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-10': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-11': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '3:00PM - 4:00PM'],
      '2026-03-12': ['10:00AM - 11:00AM', '2:00PM - 3:00PM', '5:00PM - 6:00PM'],
      '2026-03-13': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '4:00PM - 5:00PM']
    }
  },
  'Dr. Patricia Martinez': {
    availableDates: {
      '2026-03-06': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-07': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-08': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM'],
      '2026-03-09': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-10': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-11': ['10:00AM - 11:00AM', '12:00PM - 1:00PM', '2:00PM - 3:00PM'],
      '2026-03-12': ['8:00AM - 9:00AM', '11:00AM - 12:00PM', '3:00PM - 4:00PM'],
      '2026-03-13': ['9:00AM - 10:00AM', '1:00PM - 2:00PM', '4:00PM - 5:00PM']
    }
  }
};

// Vet Branches
const vetBranches = [
  {
    id: 1,
    name: '📍 PetShield Veterinary Clinic and Grooming Center - Las Piñas',
    address: 'BF Resort village, 65 judge b tan, Talon Dos, Las Piñas, 1747 Metro Manila',
    image: require('../assets/branchLP.jpg')
  },
  {
    id: 2,
    name: '📍 PetShield Veterinary Clinic and Grooming Center - Taguig',
    address: '99 General Espino St, cor Bravo St, Central Signal, Taguig, 1630 Metro Manila',
    image: require('../assets/branchTaguig.jpg')
  }
];

// Mock data for user's pets 
const userPets = [
  {
    id: 1,
    name: 'Max',
    icon: 'paw',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male',
    image: require('../assets/samplePet.jpg')
  },
  {
    id: 2,
    name: 'Luna',
    icon: 'paw',
    species: 'Cat',
    breed: 'Siamese',
    age: 2,
    gender: 'Female',
    image: require('../assets/samplePet.jpg')
  },
  {
    id: 3,
    name: 'Charlie',
    icon: 'paw',
    species: 'Dog',
    breed: 'French Bulldog',
    age: 1,
    gender: 'Male',
    image: require('../assets/samplePet.jpg')
  }
];


const userAccount = {
  fullName: 'John Michael Santos',
  email: 'john.santos@email.com',
  phone: '+63 912 345 6789',
  address: '123 Main Street, Barangay San Antonio, Makati City, Metro Manila',
  profileImage: null
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, '0');
  const day = String(maxDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Grooming options
const groomingOptions = [
  { id: 'g1', name: 'Basic Grooming', price: '₱500', description: 'Bath, brush, nail trim' },
  { id: 'g2', name: 'Full Grooming', price: '₱800', description: 'Bath, haircut, nail trim, ear cleaning' },
  { id: 'g3', name: 'Deluxe Grooming', price: '₱1200', description: 'Full grooming + teeth brushing + perfume' },
  { id: 'g4', name: 'Nail Trim Only', price: '₱200', description: 'Nail clipping and filing' },
  { id: 'g5', name: 'Bath Only', price: '₱300', description: 'Shampoo, conditioner, blow dry' },
];

// Laboratory options
const laboratoryOptions = [
  { id: 'l1', name: 'Complete Blood Count', price: '₱800', description: 'CBC with differential' },
  { id: 'l2', name: 'Blood Chemistry', price: '₱1200', description: 'Liver, kidney, glucose levels' },
  { id: 'l3', name: 'Urinalysis', price: '₱400', description: 'Complete urine analysis' },
  { id: 'l4', name: 'Fecal Examination', price: '₱350', description: 'Parasite and bacteria check' },
  { id: 'l5', name: 'X-Ray', price: '₱1500', description: 'Single view radiograph' },
  { id: 'l6', name: 'Ultrasound', price: '₱2000', description: 'Abdominal ultrasound' },
];

// meow
export default function UserAppointment() {

  const ns = useNavigation();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(1); // Start at index 1 (Consultation)
  const [expandedService, setExpandedService] = useState(null);
  const [selectedGroomingOptions, setSelectedGroomingOptions] = useState([]);
  const [selectedLabOptions, setSelectedLabOptions] = useState([]);

  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
const cardRef = useRef(null);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panelWidth = 280; // Width of the extension panel

  const scrollViewRef = useRef(null);

  const services = [
    {
      id: 1,
      name: 'Pet Grooming',
      icon: 'cut-outline',
      description: ['Brushing, Nail', 'Trimming, Haircut,', 'Bathing, etc.'],
      basePrice: '₱500',
      doctors: ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Lisa Garcia'],
      hasOptions: true,
      options: groomingOptions
    },
    {
      id: 2,
      name: 'Consultation & Check-Up',
      icon: 'medical',
      description: ['Preventative service', 'to assess your', "pet's overall health"],
      basePrice: '₱500',
      doctors: ['Dr. James Wilson', 'Dr. Emily Brown', 'Dr. Robert Taylor'],
      hasOptions: false
    },
    {
      id: 3,
      name: 'Dental Prophylaxis',
      icon: 'medical',
      description: ['Teeth cleaning,', 'plaque removal,', 'oral health check'],
      basePrice: '₱800',
      doctors: ['Dr. Amanda Lee', 'Dr. David Kim', 'Dr. Patricia Martinez'],
      hasOptions: false
    },
    {
      id: 4,
      name: 'Pet Boarding',
      icon: 'home',
      description: ['Overnight stay,', 'feeding,', 'supervision'],
      basePrice: '₱1,200/night',
      doctors: ['Dr. Thomas Wright', 'Dr. Jennifer Lopez', 'Dr. William Davis'],
      hasOptions: false
    },
    {
      id: 5,
      name: 'Confinement',
      icon: 'bed',
      description: ['Medical care,', 'monitoring, IV', 'fluids, medication'],
      basePrice: '₱2,500/day',
      doctors: ['Dr. Richard Moore', 'Dr. Elizabeth White', 'Dr. Charles Harris'],
      hasOptions: false
    },
    {
      id: 6,
      name: 'X-Ray',
      icon: 'scan',
      description: ['Radiography for', 'bone, chest,', 'abdominal imaging'],
      basePrice: '₱1,500',
      doctors: ['Dr. Susan Miller', 'Dr. Joseph Clark', 'Dr. Margaret Lewis'],
      hasOptions: false
    },
    {
      id: 7,
      name: 'Ultrasound',
      icon: 'radio',
      description: ['Soft tissue,', 'abdominal, cardiac,', 'pregnancy check'],
      basePrice: '₱2,000',
      doctors: ['Dr. Daniel Walker', 'Dr. Nancy Hall', 'Dr. Kevin Allen'],
      hasOptions: false
    },
    {
      id: 8,
      name: 'Laboratory Tests',
      icon: 'flask',
      description: ['Blood work,', 'urinalysis, fecal,', 'chemistry panel'],
      basePrice: '₱1,800',
      doctors: ['Dr. Helen Young', 'Dr. George King', 'Dr. Carol Scott'],
      hasOptions: true,
      options: laboratoryOptions
    },
    {
      id: 9,
      name: 'Vaccinations',
      icon: 'flask',
      description: ['Core vaccines,', 'boosters,', 'rabies shot'],
      basePrice: '₱1,200',
      doctors: ['Dr. Steven Adams', 'Dr. Rachel Green', 'Dr. Brian Nelson'],
      hasOptions: false
    }
  ];

  useEffect(() => {
    // Animate slide when expanded service changes
    Animated.spring(slideAnim, {
      toValue: expandedService ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [expandedService]);

  const handleServiceSelect = (service) => {
    // Only allow clicking on the center card (100% opacity)
    const isCenterCard = getVisibleCards().find(card => card.position === 0)?.service.id === service.id;
    
    if (!isCenterCard) return;

    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      // Remove service
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
      if (service.id === 1) setSelectedGroomingOptions([]);
      if (service.id === 8) setSelectedLabOptions([]);
      setExpandedService(null);
    } else {
      // Add service
      setSelectedServices([...selectedServices, service]);
      
      // Toggle expanded state for services with options
      if (service.hasOptions) {
        setExpandedService(expandedService === service.id ? null : service.id);
      } else {
        setExpandedService(null);
      }
    }
  };

  const handleGroomingOptionSelect = (option) => {
    const isSelected = selectedGroomingOptions.some(o => o.id === option.id);
    if (isSelected) {
      setSelectedGroomingOptions(selectedGroomingOptions.filter(o => o.id !== option.id));
    } else {
      setSelectedGroomingOptions([...selectedGroomingOptions, option]);
    }
  };

  const handleLabOptionSelect = (option) => {
    const isSelected = selectedLabOptions.some(o => o.id === option.id);
    if (isSelected) {
      setSelectedLabOptions(selectedLabOptions.filter(o => o.id !== option.id));
    } else {
      setSelectedLabOptions([...selectedLabOptions, option]);
    }
  };

  const handleProceed = () => {
    if (selectedServices.length > 0) {
      setStep(2);
    } else {
      alert('Please select at least one service first');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedPet(null);
      setSelectedBranch(null);
    } else if (step === 3) {
      setStep(2);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedPet(null);
      setSelectedBranch(null);
    } else if (step === 4) {
      setStep(3);
      setSelectedPet(null);
      setSelectedBranch(null);
    } else if (step === 5) {
      setStep(4);
      setSelectedBranch(null);
    } else if (step === 6) {
      setStep(5);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedPet(null);
    setSelectedBranch(null);
  };

  const handleContinue = () => {
    if (step === 2) {
      if (selectedDoctor) {
        setStep(3);
      } else {
        alert('Please select a doctor first');
      }
    } else if (step === 3) {
      if (selectedDate && selectedTime) {
        setStep(4);
      } else {
        alert('Please select date and time');
      }
    } else if (step === 4) {
      if (selectedBranch) {
        setStep(5);
      } else {
        alert('Please select a branch');
      }
    } else if (step === 5) {
      if (selectedPet) {
        setStep(6);
      } else {
        alert('Please select a pet');
      }
    } else if (step === 6) {
      setModalVisible(true);
    }
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelectedTime(null); 
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

  const handleAddPet = () => {
    alert('Navigate to Add Pet screen');
    // Navigate to add pet screen
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setIsChecked(false);
    // Navigate back to home or appointment list
    ns.navigate('UserHome');
  };

  // Get available time slots for selected doctor and date
  const getTimeSlotsForSelectedDate = () => {
    if (selectedDoctor && selectedDate && doctorSchedules[selectedDoctor]) {
      const doctorSchedule = doctorSchedules[selectedDoctor];
      return doctorSchedule.availableDates[selectedDate] || [];
    }
    return [];
  };

  // Format date for display
  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getMarkedDates = () => {
    let markedDates = {};
    
    if (selectedDoctor && doctorSchedules[selectedDoctor]) {
      const doctorSchedule = doctorSchedules[selectedDoctor];
      
      // Mark available dates with full opacity and dot
      Object.keys(doctorSchedule.availableDates).forEach(date => {
        markedDates[date] = {
          selected: selectedDate === date,
          selectedColor: '#ffffff',
          marked: true,
          dotColor: '#3d67ee',
        };
      });
    }
    
    return markedDates;
  };

  // Custom header to show only month and year
  const customHeader = (date) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date(date);
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    return (
      <View style={{ alignItems: 'center', paddingVertical: 10 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          {month} {year}
        </Text>
      </View>
    );
  };

  // Custom day renderer to control opacity
  const dayComponent = ({ date, state, marking, onPress }) => {
    const isAvailable = marking && marking.marked;
    const isSelected = marking && marking.selected;
    const isDisabled = state === 'disabled' || state === 'inactive';
    
    // Determine opacity - available dates have full opacity, others have low opacity
    const opacity = isAvailable ? 1 : 0.3;
    
    return (
      <TouchableOpacity
        style={{
          width: 32,
          height: 32,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isSelected ? '#ffffff' : 'transparent',
          borderRadius: 16,
          opacity: opacity,
        }}
        onPress={() => isAvailable && onPress(date)}
        disabled={!isAvailable || isDisabled}
      >
        <Text style={{
          color: isSelected ? '#3d67ee' : 'white',
          fontWeight: isSelected ? 'bold' : 'normal',
        }}>
          {date.day}
        </Text>
        {isAvailable && !isSelected && (
          <View style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#3d67ee',
            position: 'absolute',
            bottom: 2,
          }} />
        )}
      </TouchableOpacity>
    );
  };

  const timeSlots = getTimeSlotsForSelectedDate();

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setExpandedService(null); // Close expanded panel when changing cards
    }
  };

  const goToNextCard = () => {
    if (currentCardIndex < services.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setExpandedService(null); // Close expanded panel when changing cards
    }
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = -1; i <= 1; i++) {
      const index = currentCardIndex + i;
      if (index >= 0 && index < services.length) {
        cards.push({
          service: services[index],
          position: i,
          index: index
        });
      }
    }
    return cards;
  };

  // Calculate total price from selected services and options
  const getTotalPrice = () => {
    let total = 0;
    
    // Add base prices of selected services
    selectedServices.forEach(service => {
      // Remove '₱' and '/night' or '/day' for calculation
      const basePrice = parseFloat(service.basePrice.replace(/[₱,]/g, '').split('/')[0]);
      total += basePrice;
    });
    
    // Add grooming options
    selectedGroomingOptions.forEach(option => {
      const price = parseFloat(option.price.replace(/[₱,]/g, ''));
      total += price;
    });
    
    // Add lab options
    selectedLabOptions.forEach(option => {
      const price = parseFloat(option.price.replace(/[₱,]/g, ''));
      total += price;
    });
    
    return total;
  };

  // Get the center card service
  const centerService = getVisibleCards().find(card => card.position === 0)?.service;

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            width: '30%',
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 30,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="hourglass-outline" size={70} color="#3d67ee" />
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center',
              marginBottom: 10,
            }}>
              Appointment Under Review
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#666666ce',
              textAlign: 'center',
              marginBottom: 30,
              lineHeight: 24,
              marginTop: 20,
            }}>
              Your appointment is currently under reviewal! {'\n'} You will receive an email confirmation once your appointment has been scheduled and approved.
            </Text>

            {/* Checkbox Section */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 25,
                paddingHorizontal: 10,
              }}
              onPress={() => setIsChecked(!isChecked)}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#3d67ee',
                backgroundColor: isChecked ? '#3d67ee' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                marginTop: 2,
              }}>
                {isChecked && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </View>
              <Text style={{
                fontSize: 15,
                color: '#333',
                flex: 1,
              }}>
                I understand
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: isChecked ? '#3d67ee' : '#ccc',
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 10,
                width: '100%',
                opacity: isChecked ? 1 : 0.5,
              }}
              onPress={handleModalClose}
              disabled={!isChecked}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '500',
                textAlign: 'center',
              }}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sticky Navigation Bar */}
      <View style={{
        zIndex: 1000,
      }}>
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
                <Text>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>Our Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[userStyle.glassContainer]}>
                <Text style={[userStyle.navText, {color: '#3d67ee', fontWeight: '600'}]}>Book an Appointment</Text>
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

      {/* Scrollable Content */}
      <ScrollView ref={scrollViewRef} style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={{padding: 10}}>
          {/* Progress Indicator with Labels */}
          <View style={{marginTop: 30, marginBottom: 20}}>
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 1 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>1</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? '#3d67ee' : '#666'}}>Select Service</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 2 ? '#3d67ee' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 2 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>2</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#3d67ee' : '#666'}}>Choose Doctor</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 3 ? '#3d67ee' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 3 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>3</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 3 ? 'bold' : 'normal', color: step === 3 ? '#3d67ee' : '#666'}}>Select Time & Date</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 4 ? '#3d67ee' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 4 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>4</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 4 ? 'bold' : 'normal', color: step === 4 ? '#3d67ee' : '#666'}}>Select Branch</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 5 ? '#3d67ee' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 5 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>5</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 5 ? 'bold' : 'normal', color: step === 5 ? '#3d67ee' : '#666'}}>Select Pet</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 6 ? '#65eb6c' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 6 ? '#65eb6c' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>6</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 6 ? 'bold' : 'normal', color: step === 6 ? '#1fcc27' : '#666'}}>Confirm</Text>
              </View>
            </View>
          </View>

          {/* Step Title */}
          <Text style={{fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginTop: 20}}>
            {step === 1 ? 'Book an Appointment' : 
             step === 2 ? 'Choose a Doctor' : 
             step === 3 ? 'Select Date & Time' : 
             step === 4 ? 'Select Branch' : 
             step === 5 ? 'Select Your Pet' :
             'Confirm Booking'}
          </Text>
          <Text style={{fontSize: 16, textAlign: 'center', marginTop: 10, color: '#555', marginBottom: 30}}>
            {step === 1 
              ? 'Choose a service and schedule your appointment with ease with PetShield.'
              : step === 2
              ? `Select your preferred doctor for your selected services`
              : step === 3
              ? `Select available date and time for ${selectedDoctor}`
              : step === 4
              ? 'Select which branch you prefer for your appointment'
              : step === 5
              ? 'Select which pet will receive the service'
              : 'Please review your booking details before confirming'}
          </Text>

          {step === 1 && (
            <>

              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30, gap: 20}}>
  
                <View style={{justifyContent: 'center', height: 300}}>
                  <TouchableOpacity 
                    onPress={goToPreviousCard}
                    disabled={currentCardIndex === 0}
                  >
                    <Ionicons 
                      name="chevron-back-circle" 
                      size={50} 
                      color={currentCardIndex === 0 ? '#ccc' : '#3d67ee'} 
                    />
                  </TouchableOpacity>
                </View>


                <View style={{flexDirection: 'row', alignItems: 'center', height: 350, marginHorizontal: 10, gap: 20}}>
                {getVisibleCards().map(({service, position, index}) => {
                  const isSelected = selectedServices.some(s => s.id === service.id);
                  const opacity = position === 0 ? 1 : 0.5;
                  const scale = position === 0 ? 1 : 0.85;
                  
                  let zIndex = 1;
                  
                  if (position === 0) {
                    zIndex = 30; 
                    if (expandedService === service.id) {
                      zIndex = 50; 
                    }
                  } else if (position === -1) {
                    zIndex = 20; 
                  } else if (position === 1) {
                    zIndex = 10; 
                  }
                  

                  let marginLeft = 0;
                  let marginRight = 0;
                  
                  if (position === -1) {
                    marginRight = expandedService ? -panelWidth/2 : -20;

                    if (expandedService) {
                      marginLeft = -20;
                    }
                  } else if (position === 1) {
                    marginLeft = expandedService ? panelWidth/2 : -20;

                    if (expandedService) {
                      marginRight = -20;
                    }
                  }
                  
                  return (
                    <View 
                      key={service.id} 
                      style={{
                        position: 'relative',
                        zIndex: zIndex,
                        elevation: zIndex, 
                      }}
                      ref={position === 0 ? cardRef : null}
                      onLayout={(event) => {
                        if (position === 0 && expandedService === service.id) {
  
                          cardRef.current?.measure((x, y, width, height, pageX, pageY) => {
                            setPanelPosition({
                              x: pageX + width, 
                              y: pageY,
                            });
                          });
                        }
                      }}
                    >
                      <TouchableOpacity 
                        style={{
                          width: 220,
                          height: 300,
                          marginLeft,
                          marginRight,
                          transform: [{ scale }],
                          opacity,
                          
                          shadowColor: '#000',
                          shadowOffset: { width: position === 0 ? 0 : 2, height: position === 0 ? 4 : 2 },
                          shadowOpacity: position === 0 ? 0.25 : 0.15,
                          shadowRadius: position === 0 ? 8 : 4,

                          borderRadius: 15,
                        }}
                        onPress={() => handleServiceSelect(service)}
                        activeOpacity={position === 0 ? 0.7 : 1}
                        disabled={position !== 0}
                      >
                        {isSelected ? (
                          <LinearGradient
                            colors={['#3dcbee','#3db6ee', '#3d67ee', '#2565db', '#3dcbee']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                              userStyle.serviceCard, 
                              {
                                padding: 20, 
                                height: '100%', 
                                justifyContent: 'space-between', 
                                borderRadius: 15,
                                borderWidth: 2,
                                borderColor: '#2565db',
                               
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.25,
                                shadowRadius: 8,
                                elevation: 5,
                              }
                            ]}
                          >
                            <Ionicons name={service.icon} size={40} color="#ffffffee" style={{alignSelf: 'center', marginTop: 8}}/>
                            <Text style={[userStyle.serviceName, {textAlign: 'center', fontSize: 18, color: 'white', fontWeight: 'bold'}]}>{service.name}</Text>
                            <View style={{alignItems: 'center'}}>
                              {service.description.map((line, index) => (
                                <Text key={index} style={[userStyle.serviceDescription, {textAlign: 'center', fontSize: 13, color: 'white'}]}>{line}</Text>
                              ))}
                            </View>
                            <Text style={[userStyle.servicePrice, {textAlign: 'center', fontSize: 18, color: 'white', fontWeight: 'bold'}]}>{service.basePrice}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={[userStyle.serviceCard, {
                            padding: 20, 
                            height: '100%', 
                            justifyContent: 'space-between', 
                            borderRadius: 15, 
                            backgroundColor: 'white', 
                            borderWidth: 1, 
                            borderColor: '#3d67ee',
                            shadowColor: '#000',
                            shadowOffset: { width: position === 0 ? 0 : 2, height: position === 0 ? 4 : 2 },
                            shadowOpacity: position === 0 ? 0.25 : 0.15,
                            shadowRadius: position === 0 ? 8 : 4,
                            elevation: position === 0 ? 5 : 3,
                          }]}>
                            <Ionicons name={service.icon} size={40} color="#3d67ee" style={{alignSelf: 'center', marginTop: 8}}/>
                            <Text style={[userStyle.serviceName, {textAlign: 'center', fontSize: 18, color: '#3d67ee', fontWeight: 'bold'}]}>{service.name}</Text>
                            <View style={{alignItems: 'center'}}>
                              {service.description.map((line, index) => (
                                <Text key={index} style={[userStyle.serviceDescription, {textAlign: 'center', fontSize: 13, color: '#444'}]}>{line}</Text>
                              ))}
                            </View>
                            <Text style={[userStyle.servicePrice, {textAlign: 'center', fontSize: 18, color: '#3d67ee', fontWeight: 'bold'}]}>{service.basePrice}</Text>
                          </View>
                        )}
                      </TouchableOpacity>

                        {/* Extension Panel for Options */}
                        {position === 0 && centerService?.hasOptions && expandedService === centerService.id && (
                          <Animated.View
                            style={{
                              position: 'absolute',
                              left: 210, 
                              top: 0,
                              width: panelWidth,
                              height: 300,
                              backgroundColor: '#ffffff',
                              borderRadius: 15,
                              padding: 15,
                              borderWidth: 2,
                              borderColor: '#3d67ee',
                              borderLeftWidth: 0,
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              zIndex: 99, 
                              elevation: 100, 
                              transform: [
                                {
                                  translateX: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-50, 0],
                                  }),
                                },
                              ],
                              
                              opacity: slideAnim,
                              shadowColor: '#000',
                              shadowOffset: { width: 4, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 8,
                              pointerEvents: 'auto',
                            }}
                          >
                            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#3d67ee', marginBottom: 20}}>
                              {centerService.id === 1 ? 'Grooming Options' : 'Laboratory Options'}
                            </Text>
                            <ScrollView 
                              showsVerticalScrollIndicator={false}
                              style={{flex: 1}}
                              scrollEnabled={true}
                              nestedScrollEnabled={true}
                            >
                              <View style={{gap: 10}}>
                                {(centerService.id === 1 ? groomingOptions : laboratoryOptions).map((option) => {
                                  const isSelected = centerService.id === 1 
                                    ? selectedGroomingOptions.some(o => o.id === option.id)
                                    : selectedLabOptions.some(o => o.id === option.id);
                                  
                                  return (
                                    <TouchableOpacity
                                      key={option.id}
                                      style={{
                                        padding: 12,
                                        backgroundColor: isSelected ? '#3d67ee' : '#ffffff',
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#3d67ee',
                                      }}
                                      onPress={() => centerService.id === 1 
                                        ? handleGroomingOptionSelect(option)
                                        : handleLabOptionSelect(option)
                                      }
                                      activeOpacity={0.7}
                                    >
                                      <Text style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        color: isSelected ? 'white' : '#3d67ee',
                                        marginBottom: 3
                                      }}>
                                        {option.name}
                                      </Text>
                                      <Text style={{
                                        fontSize: 12,
                                        color: isSelected ? 'white' : '#666',
                                        marginBottom: 3
                                      }}>
                                        {option.description}
                                      </Text>
                                      <Text style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        color: isSelected ? 'white' : '#3d67ee'
                                      }}>
                                        {option.price}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </ScrollView>
                          </Animated.View>
                        )}
                          </View>
                        );
                      })}
                </View>

                {/* Right Arrow - Centered vertically with cards */}
                <View style={{justifyContent: 'center', height: 300}}>
                  <TouchableOpacity 
                    onPress={goToNextCard}
                    disabled={currentCardIndex === services.length - 1}
                  >
                    <Ionicons 
                      name="chevron-forward-circle" 
                      size={50} 
                      color={currentCardIndex === services.length - 1 ? '#ccc' : '#3d67ee'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Selected Services Display - Moved to bottom of cards */}
              {selectedServices.length > 0 && (
                <View style={{
                  backgroundColor: '#f0f5ff',
                  padding: 15,
                  borderRadius: 10,
                  marginHorizontal: 100,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#3d67ee',
                }}>
                  <Text style={{fontSize: 16, fontWeight: 'bold', color: '#3d67ee', marginBottom: 10}}>
                    Selected Services:
                  </Text>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
                    {selectedServices.map(service => (
                      <View key={service.id} style={{
                        backgroundColor: '#3d67ee',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        <Text style={{color: 'white', marginRight: 5}}>{service.name}</Text>
                        <TouchableOpacity onPress={() => handleServiceSelect(service)}>
                          <Ionicons name="close-circle" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {selectedGroomingOptions.map(option => (
                      <View key={option.id} style={{
                        backgroundColor: '#3db6ee',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        <Text style={{color: 'white', marginRight: 5}}>Grooming: {option.name}</Text>
                        <TouchableOpacity onPress={() => handleGroomingOptionSelect(option)}>
                          <Ionicons name="close-circle" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {selectedLabOptions.map(option => (
                      <View key={option.id} style={{
                        backgroundColor: '#3db6ee',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        <Text style={{color: 'white', marginRight: 5}}>Lab: {option.name}</Text>
                        <TouchableOpacity onPress={() => handleLabOptionSelect(option)}>
                          <Ionicons name="close-circle" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <Text style={{fontSize: 16, fontWeight: 'bold', color: '#3d67ee', marginTop: 10}}>
                    Total: ₱{getTotalPrice().toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Proceed Button */}
              <View style={{alignItems: 'center', marginTop: 20, marginBottom: 30}}>
                <TouchableOpacity style={userStyle.btnStyle} onPress={handleProceed}>
                    <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Rest of the code remains the same for steps 2-6 */}
          {step === 2 && selectedServices.length > 0 && (
            <>
              {/* Doctors List - Larger Cards */}
              <View style={{paddingHorizontal: 20}}>
                <View style={{flexDirection: 'row', justifyContent: 'center', gap: 40, flexWrap: 'wrap'}}>
                  {/* Combine all doctors from selected services (remove duplicates) */}
                  {[...new Set(selectedServices.flatMap(s => s.doctors))].map((doctor, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={{
                        backgroundColor: '#ffffff',
                        padding: 25,
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 5,
                        alignItems: 'center',
                        width: 220,
                        opacity: selectedDoctor === doctor ? 1 : 0.7,
                        borderWidth: selectedDoctor === doctor ? 2 : 1,
                        borderColor: selectedDoctor === doctor ? '#3d67ee' : '#e0e0e0',
                        justifyContent: 'center',
                      }}
                      onPress={() => handleDoctorSelect(doctor)}
                    >
                      <Image 
                        source={require('../assets/sampleDoc.jpg')} 
                        style={{width: 100, height: 100, borderRadius: 50, marginBottom: 15}}
                      />
                      <View style={{alignItems: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5}}>{doctor}</Text>
                        <Text style={{color: '#666', fontSize: 14, textAlign: 'center'}}>Veterinarian</Text>
                        <Text style={{color: '#3d67ee', fontSize: 14, fontWeight: '500', marginTop: 8}}>Available</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Navigation Buttons */}
              <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 50, marginBottom: 30}}>
                <TouchableOpacity style={[userStyle.btnStyle, {backgroundColor: '#ccc'}]} onPress={handleBack}>
                    <Text style={{color: '#fffefe', fontSize: 16, fontWeight: '500'}}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={userStyle.btnStyle} onPress={handleContinue}>     
                    <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 3 && selectedDoctor && (
            <>
            <View style={{alignItems: 'center', marginBottom: 20, marginTop: 10}}>
              {/* Selected Date & Time Display */}
                  {selectedDate && (
                    <LinearGradient
                      colors={['#3db6ee', '#3d67ee', '#0738D9', '#0f3bca', '#3db6ee']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        width: '40%',
                        borderRadius: 30,
                        marginBottom: 20,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>
                        {formatSelectedDate()}
                        {selectedTime ? ` at ${selectedTime}` : ''}
                      </Text>
                    </LinearGradient>
                  )}
            </View>

              <View style={{flexDirection: 'row', gap: 30, paddingHorizontal: 100, marginBottom: 30, justifyContent: 'center', flexWrap: 'wrap'}}>
                
                <View style={{flex: 0.4, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8}}>
                  <LinearGradient
                    colors={['#3db6ee', '#3d67ee', '#0738D9', '#0f3bca', '#3db6ee']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{padding: 15, borderRadius: 20}}
                  >
                    <Calendar
                      style={{
                        borderRadius: 15,
                        overflow: 'hidden',
                        width: '100%',
                      }}
                      theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        textSectionTitleColor: 'white',
                        selectedDayBackgroundColor: '#ffffff',
                        selectedDayTextColor: '#3d67ee',
                        todayTextColor: '#ffffff',
                        dayTextColor: 'white',
                        textDisabledColor: 'rgba(255,255,255,0.2)',
                        dotColor: '#3d67ee',
                        selectedDotColor: '#ffffff',
                        arrowColor: 'white',
                        monthTextColor: 'white',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: 'bold',
                        textDayFontSize: 12,
                        textMonthFontSize: 14,
                        textDayHeaderFontSize: 11,
                        'stylesheet.calendar.main': {
                          week: {
                            marginTop: 3,
                            marginBottom: 3,
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                          },
                        },
                      }}
                      markedDates={getMarkedDates()}
                      onDayPress={handleDateSelect}
                      enableSwipeMonths={true}
                      minDate={getTodayDate()}
                      maxDate={getMaxDate()}
                      hideArrows={false}
                      hideExtraDays={true}
                      renderHeader={(date) => customHeader(date)}
                      dayComponent={dayComponent}
                    />
                  </LinearGradient>
                </View>

                {/* Right Column - White Container with Time Slots */}
                <View style={{
                  flex: 0.4,
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: '#f0f0f0',
                }}>

                  <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 8,marginBottom: 20, textAlign: 'center'}}>
                    Available Time Slots
                  </Text>
                  
                  {!selectedDate ? (
                    <View style={{padding: 20, alignItems: 'center'}}>
                      <Text style={{color: '#999', fontSize: 14}}>
                        Please select a date from the calendar
                      </Text>
                    </View>
                  ) : timeSlots.length > 0 ? (
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center'}}>
                      {timeSlots.map((time, index) => {
                        const isSelected = selectedTime === time;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 14,
                              borderRadius: 8,
                              backgroundColor: isSelected ? '#3d67ee' : '#ffffff',
                              borderWidth: 1,
                              borderColor: isSelected ? '#3d67ee' : '#3d67ee',
                              marginRight: 6,
                              marginBottom: 6,
                              minWidth: 110,
                            }}
                            onPress={() => handleTimeSelect(time)}
                          >
                            <Text style={{
                              color: isSelected ? '#ffffff' : '#333',
                              fontWeight: isSelected ? '500' : 'normal',
                              textAlign: 'center',
                              fontSize: 13,
                            }}>
                              {time}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={{padding: 20, alignItems: 'center'}}>
                      <Text style={{color: '#999', fontSize: 14}}>
                        No time slots available for this date
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 30}}>
                <TouchableOpacity style={[userStyle.btnStyle, {backgroundColor: '#ccc'}]} onPress={handleBack}>
                    <Text style={{color: '#fffefe', fontSize: 16, fontWeight: '500'}}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={userStyle.btnStyle} onPress={handleContinue}>     
                    <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 4 && (
            <>
              {/* Branch Selection */}
              <View style={{paddingHorizontal: 150, marginBottom: 40}}>
                <View style={{flexDirection: 'row', justifyContent: 'center', gap: 40, flexWrap: 'wrap'}}>
                  {vetBranches.map((branch) => (
                    <TouchableOpacity 
                      key={branch.id}
                      style={{
                        width: 300,
                        height: 320,
                        opacity: selectedBranch?.id === branch.id ? 1 : 0.8,
                        backgroundColor: selectedBranch?.id === branch.id ? '#ffffff' : '#ffffff',
                        borderRadius: 20,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 5,
                        borderWidth: selectedBranch?.id === branch.id ? 2 : 1,
                        borderColor: selectedBranch?.id === branch.id ? '#3d67ee' : '#e0e0e0',
                      }}
                      onPress={() => handleBranchSelect(branch)}
                    >
                      <Image 
                        source={branch.image}
                        style={{
                          width: '100%',
                          height: 150,
                          borderRadius: 15,
                          marginBottom: 15,
                        }}
                        resizeMode="cover"
                      />
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '650',
                        color: '#333',
                        marginBottom: 8,
                        textAlign: 'center',
                        marginTop: 10,
                      }}>
                        {branch.name}
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: '#666',
                        textAlign: 'center',
                        lineHeight: 20,
                        marginTop: 10,
                      }}>
                        {branch.address}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 30}}>
                <TouchableOpacity style={[userStyle.btnStyle, {backgroundColor: '#ccc'}]} onPress={handleBack}>
                    <Text style={{color: '#fffefe', fontSize: 16, fontWeight: '500'}}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={userStyle.btnStyle} onPress={handleContinue}>     
                    <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 5 && (
            <>
              <View style={{paddingHorizontal: 100, marginBottom: 40}}>
                <View style={{flexDirection: 'row', justifyContent: 'center', gap: 30, flexWrap: 'wrap'}}>
                  {/* Pet Cards - UPDATED with images and larger size */}
                  {userPets.map((pet) => (
                    <TouchableOpacity 
                      key={pet.id}
                      style={{
                        width: 200,
                        height: 250,
                        backgroundColor: '#ffffff',
                        borderRadius: 20,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                        opacity: selectedPet?.id === pet.id ? 1 : 0.5,
                        borderWidth: selectedPet?.id === pet.id ? 2 : 1,
                        borderColor: selectedPet?.id === pet.id ? '#3d67ee' : '#e0e0e0',
                      }}
                      onPress={() => handlePetSelect(pet)}
                    >
                      <View style={{alignItems: 'center'}}>
                        <Image 
                          source={pet.image}
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            marginBottom: 12,
                          }}
                        />
                        <Text style={{fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5}}>{pet.name}</Text>
                        <Text style={{fontSize: 14, color: '#666'}}>{pet.species} • {pet.breed}</Text>
                        <Text style={{fontSize: 14, color: '#666', marginTop: 2}}>{pet.gender} • {pet.age} years</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Add Pet Card */}
                  <TouchableOpacity 
                    style={{
                      width: 200,
                      height: 250,
                      backgroundColor: '#f8f9fa',
                      borderRadius: 20,
                      padding: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                      borderStyle: 'dashed',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={handleAddPet}
                  >
                    <View style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: '#3d67ee20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 15,
                    }}>
                      <Ionicons name="add" size={50} color="#3d67ee" />
                    </View>
                    <Text style={{fontSize: 18, color: '#3d67ee', fontWeight: '500'}}>Add Pet</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 30}}>
                <TouchableOpacity style={[userStyle.btnStyle, {backgroundColor: '#ccc'}]} onPress={handleBack}>
                    <Text style={{color: '#fffefe', fontSize: 16, fontWeight: '500'}}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={userStyle.btnStyle} onPress={handleContinue}>     
                    <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 6 && (
            <>
              {/* Booking Confirmation Details */}
              <View style={{paddingHorizontal: 100, marginBottom: 30}}>
                {/* Owner Details Card */}
                <View style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  padding: 25,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  borderWidth: 1.5,
                  borderColor: '#3d67ee',
                  marginBottom: 20,
                  width: '60%',
                  alignSelf: 'center',
                }}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
                    <Ionicons name="person-circle-outline" size={30} color="#3d67ee" style={{ marginRight: 10, marginTop: 3 }} />
                    <Text style={{fontSize: 22, fontWeight: '500', color: '#3d67ee'}}>Owner Details</Text>
                  </View>
                  
                  <View style={{gap: 12}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Full Name</Text>
                      <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{userAccount.fullName}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Email</Text>
                      <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{userAccount.email}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Phone</Text>
                      <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{userAccount.phone}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Address</Text>
                      <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{userAccount.address}</Text>
                    </View>
                  </View>
                </View>

                {/* Pet Details Card */}
                {selectedPet && (
                  <View style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 25,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: '#3d67ee',
                    marginBottom: 20,
                    width: '60%',
                    alignSelf: 'center',
                  }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
                      <Ionicons name="paw" size={28} color="#3d67ee" style={{ marginRight: 12, marginTop: 3 }} />
                      <Text style={{fontSize: 22, fontWeight: '500', color: '#3d67ee'}}>Pet Details</Text>
                    </View>
                    
                    <View style={{flexDirection: 'row', marginBottom: 15}}>
                      <Image 
                        source={selectedPet.image}
                        style={{width: 110, height: 110, borderRadius: 48, marginRight: 25, borderWidth: 1, borderColor: '#3d67ee'}}
                      />
                      <View style={{justifyContent: 'center', gap: 8}}>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Pet Name</Text>
                          <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedPet.name}</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Species</Text>
                          <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedPet.species}</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Gender</Text>
                          <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedPet.gender}</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Breed</Text>
                          <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedPet.breed}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}


                {/* Appointment Details Card */}
                {selectedServices.length > 0 && selectedDoctor && selectedDate && selectedTime && (
                  <View style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 25,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: '#3d67ee',
                    width: '60%',
                    alignSelf: 'center',
                  }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
                      <Ionicons name="calendar-outline" size={25} color="#3d67ee" style={{marginRight: 12, marginTop: 2}}/>
                      <Text style={{fontSize: 22, fontWeight: '500', color: '#3d67ee'}}>Appointment Details</Text>
                    </View>
                    
                    <View style={{gap: 15}}>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{width: 120, fontSize: 16, color: '#000000', fontWeight: '500'}}>Services</Text>
                        <View style={{flex: 1}}>
                          {selectedServices.map((service, index) => (
                            <Text key={index} style={{fontSize: 16, color: '#000000'}}>{service.name}</Text>
                          ))}
                          {selectedGroomingOptions.map((option, index) => (
                            <Text key={option.id} style={{fontSize: 16, color: '#000000'}}>  • {option.name}</Text>
                          ))}
                          {selectedLabOptions.map((option, index) => (
                            <Text key={option.id} style={{fontSize: 16, color: '#000000'}}>  • {option.name}</Text>
                          ))}
                        </View>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{width: 120, fontSize: 16, color: '#000000', fontWeight: '500'}}>Doctor</Text>
                        <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedDoctor}</Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{width: 120, fontSize: 16, color: '#000000', fontWeight: '500'}}>Date</Text>
                        <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{formatSelectedDate()}</Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{width: 120, fontSize: 16, color: '#000000', fontWeight: '500'}}>Time</Text>
                        <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedTime}</Text>
                      </View>
                      <View style={{gap: 17, borderTopWidth: 1, borderTopColor: '#3d66ee57', paddingTop: 15, marginTop: 10}}>
                      <View style={{flexDirection: 'row', marginTop: 10}}>
                        <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Branch</Text>
                        <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedBranch.name}</Text>
                      </View>
                      <View style={{flexDirection: 'row', marginBottom: 10}}>
                        <Text style={{width: 100, fontSize: 16, color: '#000000', fontWeight: '500'}}>Address</Text>
                        <Text style={{flex: 1, fontSize: 16, color: '#000000'}}>{selectedBranch.address}</Text>
                      </View>
                    </View>
                      <View style={{flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#3d66ee57', paddingTop: 15, marginTop: 5}}>
                        <Text style={{width: 120, fontSize: 16, color: '#000000', fontWeight: '500', marginTop: 10}}>Total</Text>
                        <Text style={{flex: 1, fontSize: 22, fontWeight: '500', color: '#ee3d5a', marginTop: 5}}>₱{getTotalPrice().toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Navigation Buttons for Step 6 */}
              <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 30}}>
                <TouchableOpacity style={[userStyle.btnStyle, {backgroundColor: '#ccc'}]} onPress={handleBack}>
                    <Text style={{color: '#fffefe', fontSize: 16, fontWeight: '500'}}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={userStyle.btnStyle} onPress={handleContinue}>     
                    <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Confirm Booking</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
