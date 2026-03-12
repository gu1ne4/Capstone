import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground, FlatList, Modal, Animated, TextInput } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Calendar } from 'react-native-calendars'
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import homeStyle from '../styles/HomeStyle'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import docStyle from '../styles/DoctorStyles'
import * as ImagePicker from 'expo-image-picker'

// Default clinic hours (Monday to Friday)
const clinicHours = {
  'Monday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
  'Tuesday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
  'Wednesday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
  'Thursday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
  'Friday': ['8:00AM - 9:00AM', '9:00AM - 10:00AM', '10:00AM - 11:00AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '3:00PM - 4:00PM', '4:00PM - 5:00PM'],
  'Saturday': [], // Closed
  'Sunday': [] // Closed
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

// Haircut styles for grooming
const haircutStyles = [
  { id: 'h1', name: 'Puppy Cut', description: 'Even length all over, short and easy maintenance' },
  { id: 'h2', name: 'Lion Cut', description: 'Shaved body with full mane and tail tip' },
  { id: 'h3', name: 'Teddy Bear Cut', description: 'Round face with fluffy body' },
  { id: 'h4', name: 'Summer Cut', description: 'Very short all over for hot weather' },
  { id: 'h5', name: 'Show Cut', description: 'Breed-specific standard cut' },
  { id: 'h6', name: 'Custom Style', description: 'Specify your preferred style' },
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

// Medical questionnaire
const medicalQuestions = [
  {
    id: 'q1',
    question: 'WERE THERE ANY MEDICATIONS GIVEN TO YOUR PET IN THE PAST 72 HOURS?',
    key: 'medications72h',
    hasDetails: true
  },
  {
    id: 'q2',
    question: 'MY PET HAS RECEIVED UP-TO-DATE FLEA AND TICK PREVENTION AND IS NOT INFESTED WITH FLEAS OR TICKS',
    key: 'fleaPrevention',
    hasDetails: false 
  },
  {
    id: 'q3',
    question: 'MY CAT HAS UP-TO-DATE ANTI RABIES+4IN1',
    key: 'catVaccinations',
    hasDetails: false 
  },
  {
    id: 'q4',
    question: 'MY PET IS NOT PREGNANT',
    key: 'notPregnant',
    hasDetails: false 
  }
];

export default function UserAppointment() {
  const ns = useNavigation();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [expandedService, setExpandedService] = useState(null);
  const [selectedGroomingOptions, setSelectedGroomingOptions] = useState([]);
  const [selectedLabOptions, setSelectedLabOptions] = useState([]);

  const [dropdownVisible, setDropdownVisible] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(true); 
    const user = {
      name: 'John Michael Santos',
      email: 'john.santos@email.com',
      profileImage: null
    };
  
    const handleLogout = () => {
  
      setDropdownVisible(false);
  
      setIsLoggedIn(false);
    };
  
    const handleViewProfile = () => {
      setDropdownVisible(false);
  
      ns.navigate('UserProfile');
    };
  
    const handleMyPets = () => {
      setDropdownVisible(false);
  
      ns.navigate('UserPetProfile');
    };
  
   const [medicalAnswers, setMedicalAnswers] = useState({
    medications72h: null,
    fleaPrevention: null,
    catVaccinations: null,
    notPregnant: null
  });
  const [medicationDetails, setMedicationDetails] = useState(''); // New state for medication details
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  
  // Grooming specific state
  const [selectedHaircutStyle, setSelectedHaircutStyle] = useState(null);
  const [customHaircutDescription, setCustomHaircutDescription] = useState('');
  const [haircutImage, setHaircutImage] = useState(null);

  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panelWidth = 280;

  const scrollViewRef = useRef(null);

  const services = [
    {
      id: 1,
      name: 'Pet Grooming',
      icon: 'cut-outline',
      description: ['Brushing, Nail', 'Trimming, Haircut,', 'Bathing, etc.'],
      basePrice: '₱500',
      hasOptions: true,
      options: groomingOptions
    },
    {
      id: 2,
      name: 'Consultation & Check-Up',
      icon: 'medical',
      description: ['Preventative service', 'to assess your', "pet's overall health"],
      basePrice: '₱500',
      hasOptions: false
    },
    {
      id: 3,
      name: 'Dental Prophylaxis',
      icon: 'medical',
      description: ['Teeth cleaning,', 'plaque removal,', 'oral health check'],
      basePrice: '₱800',
      hasOptions: false
    },
    {
      id: 4,
      name: 'Pet Boarding',
      icon: 'home',
      description: ['Overnight stay,', 'feeding,', 'supervision'],
      basePrice: '₱1,200/night',
      hasOptions: false
    },
    {
      id: 5,
      name: 'Confinement',
      icon: 'bed',
      description: ['Medical care,', 'monitoring, IV', 'fluids, medication'],
      basePrice: '₱2,500/day',
      hasOptions: false
    },
    {
      id: 6,
      name: 'X-Ray',
      icon: 'scan',
      description: ['Radiography for', 'bone, chest,', 'abdominal imaging'],
      basePrice: '₱1,500',
      hasOptions: false
    },
    {
      id: 7,
      name: 'Ultrasound',
      icon: 'radio',
      description: ['Soft tissue,', 'abdominal, cardiac,', 'pregnancy check'],
      basePrice: '₱2,000',
      hasOptions: false
    },
    {
      id: 8,
      name: 'Laboratory Tests',
      icon: 'flask',
      description: ['Blood work,', 'urinalysis, fecal,', 'chemistry panel'],
      basePrice: '₱1,800',
      hasOptions: true,
      options: laboratoryOptions
    },
    {
      id: 9,
      name: 'Vaccinations',
      icon: 'flask',
      description: ['Core vaccines,', 'boosters,', 'rabies shot'],
      basePrice: '₱1,200',
      hasOptions: false
    }
  ];

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: expandedService ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [expandedService]);

  const handleServiceSelect = (service) => {
    const isCenterCard = getVisibleCards().find(card => card.position === 0)?.service.id === service.id;
    
    if (!isCenterCard) return;

    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
      if (service.id === 1) {
        setSelectedGroomingOptions([]);
        setSelectedHaircutStyle(null);
        setCustomHaircutDescription('');
        setHaircutImage(null);
      }
      if (service.id === 8) setSelectedLabOptions([]);
      setExpandedService(null);
    } else {
      setSelectedServices([...selectedServices, service]);
      
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
      setStep(2); // Now goes to Select Pet
    } else {
      alert('Please select at least one service first');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedPet(null);
    } else if (step === 3) {
      setStep(2);
      setSelectedBranch(null);
    } else if (step === 4) {
      setStep(3);
      setSelectedDate(null);
      setSelectedTime(null);
    } else if (step === 5) {
      setStep(4);
      // Don't reset medical answers to preserve data when going back
    } else if (step === 6) {
      setStep(5);
    }
  };

  const handleContinue = () => {
    if (step === 2) {
      if (selectedPet) {
        setStep(3); // Go to Branch Selection
      } else {
        alert('Please select a pet first');
      }
    } else if (step === 3) {
      if (selectedBranch) {
        setStep(4); // Go to Date & Time Selection
      } else {
        alert('Please select a branch');
      }
    } else if (step === 4) {
      if (selectedDate && selectedTime) {
        setStep(5); // Go to Medical Questionnaire
      } else {
        alert('Please select date and time');
      }
    } else if (step === 5) {
      // Validate medical questionnaire
      const allAnswered = medicalQuestions.every(q => medicalAnswers[q.key] !== null);
      if (allAnswered) {
        setStep(6); // Go to Confirmation
      } else {
        alert('Please answer all medical questions');
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
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setIsChecked(false);
    ns.navigate('UserHome');
  };

  const handleMedicalAnswer = (questionKey, answer) => {
    setMedicalAnswers({
      ...medicalAnswers,
      [questionKey]: answer
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setHaircutImage(result.assets[0].uri);
    }
  };

  // Get day name from date string
  const getDayName = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Get time slots based on day of week
  const getTimeSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dayName = getDayName(selectedDate);
    return clinicHours[dayName] || [];
  };

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
    
    // Mark all weekdays (Monday to Friday) as available
    const startDate = new Date(getTodayDate());
    const endDate = new Date(getMaxDate());
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayName = getDayName(dateString);
      
      if (clinicHours[dayName] && clinicHours[dayName].length > 0) {
        markedDates[dateString] = {
          selected: selectedDate === dateString,
          selectedColor: '#ffffff',
          marked: true,
          dotColor: '#3d67ee',
        };
      }
    }
    
    return markedDates;
  };

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
      setExpandedService(null);
    }
  };

  const goToNextCard = () => {
    if (currentCardIndex < services.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setExpandedService(null);
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

  const getTotalPrice = () => {
    let total = 0;
    
    selectedServices.forEach(service => {
      const basePrice = parseFloat(service.basePrice.replace(/[₱,]/g, '').split('/')[0]);
      total += basePrice;
    });
    
    selectedGroomingOptions.forEach(option => {
      const price = parseFloat(option.price.replace(/[₱,]/g, ''));
      total += price;
    });
    
    selectedLabOptions.forEach(option => {
      const price = parseFloat(option.price.replace(/[₱,]/g, ''));
      total += price;
    });
    
    return total;
  };

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
            position: 'relative', // Add this for absolute positioning of the X button
          }}>
            
            {/* X Button in upper right corner */}
            <TouchableOpacity 
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                zIndex: 10,
                padding: 5,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
            
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              marginTop: 10, // Add some top margin to account for the X button
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
          {/* Profile Section with Dropdown */}
          <View style={{position: 'relative', zIndex: 2}}>
            {isLoggedIn ? (
              <TouchableOpacity 
                onPress={() => setDropdownVisible(!dropdownVisible)}
                activeOpacity={0.7}
                style={{zIndex: 3}} 
              >
                <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
                  {user.profileImage ? (
                    <Image 
                      source={user.profileImage} 
                      style={{width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#3d67ee'}}
                    />
                  ) : (
                    <View style={{
                      width: 30, 
                      height: 30, 
                      borderRadius: 15, 
                      backgroundColor: '#3d67ee20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#3d67ee'
                    }}>
                      <Text style={{color: '#3d67ee', fontWeight: 'bold', fontSize: 14}}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                  )}
                  <View style={{flexDirection: 'column', marginRight: 5}}>
                    <Text style={[userStyle.smallText, {fontSize: 14, color: "#3d67ee", fontWeight: 600}]}>
                      {user.name}
                    </Text>
                  </View>
                  <Ionicons 
                    name={dropdownVisible ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#3d67ee" 
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={()=>{ns.navigate('Login')}}>
                <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
                  <Ionicons name="person-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
                  <View style={{flexDirection: 'column', marginRight: 5}}>
                    <Text style={[userStyle.smallText, {fontSize: 16, color: "#3d67ee", fontWeight: 600}]}>Login or Sign-up</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {dropdownVisible && isLoggedIn && (
              <View style={{
                position: 'absolute',
                top: 48,
                left: 13,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.10,
                shadowRadius: 8,
                elevation: 5,
                width: 240,
                zIndex: 1, 
              }}>
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                    marginTop: 5,
                    gap: 10,
                  }}
                  onPress={handleViewProfile}
                >
                  <Ionicons name="person-outline" size={18} color="#3d67ee" />
                  <Text style={{fontSize: 14, color: '#333'}}>View Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                    gap: 10,
                  }}
                  onPress={handleMyPets}
                >
                  <Ionicons name="paw-outline" size={18} color="#3d67ee" />
                  <Text style={{fontSize: 14, color: '#333'}}>My Pets</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    gap: 10,
                  }}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={18} color="#ee3d5a" />
                  <Text style={{fontSize: 14, color: '#ee3d5a'}}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[userStyle.navSections, { flexDirection: 'row',  alignItems: 'center', gap: 60, width: '70%'}]}>
              <TouchableOpacity onPress={()=>{ns.navigate('UserHome')}}>
                <Text style={[userStyle.navText]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={userStyle.navText}>Our Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[userStyle.glassContainer]}  onPress={()=>{ns.navigate('UserAppointment')}}>
                <Text style={[userStyle.navText, {color: '#3d67ee', fontWeight: '600'}]}>Book an Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right-side icons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Paw Icon Button */}
            <TouchableOpacity onPress={()=>{ns.navigate('UserPetProfile')}}>
              <View style={[userStyle.navSections, { }]}>
                <Ionicons name="paw" size={21} color="#3d67ee" style={{ marginTop: 3 }} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={()=>{ns.navigate('UserAppointmentView')}}>
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
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#3d67ee' : '#666'}}>Select Pet</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 3 ? '#3d67ee' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 3 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>3</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 3 ? 'bold' : 'normal', color: step === 3 ? '#3d67ee' : '#666'}}>Select Branch</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 4 ? '#3d67ee' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 4 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>4</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 4 ? 'bold' : 'normal', color: step === 4 ? '#3d67ee' : '#666'}}>Select Date & Time</Text>
              </View>
              <View style={{width: 60, height: 2, backgroundColor: step >= 5 ? '#3d67ee' : '#ccc', marginHorizontal: 10}} />
              <View style={{alignItems: 'center'}}>
                <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: step >= 5 ? '#3d67ee' : '#ccc', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>5</Text>
                </View>
                <Text style={{marginTop: 8, fontSize: 14, fontWeight: step === 5 ? 'bold' : 'normal', color: step === 5 ? '#3d67ee' : '#666'}}>Medical Info</Text>
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
             step === 2 ? 'Select Your Pet' : 
             step === 3 ? 'Select Branch' : 
             step === 4 ? 'Select Date & Time' :
             step === 5 ? 'Medical Information' :
             'Confirm Booking'}
          </Text>
          <Text style={{fontSize: 16, textAlign: 'center', marginTop: 10, color: '#555', marginBottom: 30}}>
            {step === 1 
              ? 'Choose a service and schedule your appointment with ease with PetShield.'
              : step === 2
              ? 'Select which pet will receive the service'
              : step === 3
              ? 'Select which branch you prefer for your appointment'
              : step === 4
              ? 'Select available date and time for your appointment'
              : step === 5
              ? 'Please answer the following medical questions about your pet'
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

              {selectedServices.length > 0 && (
                <View style={{
                  alignSelf: 'center',
                  backgroundColor: '#ffffff',
                  width: 600,
                  padding: 15,
                  borderRadius: 10,
                  marginHorizontal: 100,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#3d67ee',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  pointerEvents: 'auto',
                }}>
                  <Text style={{fontSize: 16, fontWeight: '500', color: '#3d67ee', marginBottom: 10}}>
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

              <View style={{alignItems: 'center', marginTop: 20, marginBottom: 30}}>
                <TouchableOpacity style={userStyle.btnStyle} onPress={handleProceed}>
                  <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 2 - Select Pet */}
          {step === 2 && (
            <>
              <View style={{paddingHorizontal: 100, marginBottom: 40}}>
                <View style={{flexDirection: 'row', justifyContent: 'center', gap: 30, flexWrap: 'wrap'}}>
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

          {/* Step 3 - Select Branch */}
          {step === 3 && (
            <>
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

          {/* Step 4 - Select Date & Time */}
          {step === 4 && (
            <>
              <View style={{alignItems: 'center', marginBottom: 20, marginTop: 10}}>
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
                <View style={{
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  elevation: 8, 
                  shadowColor: '#000', 
                  shadowOffset: { width: 0, height: 4 }, 
                  shadowOpacity: 0.2, 
                  shadowRadius: 8,
                  backgroundColor: 'red',
                  width: 400,
                  alignItems: 'center',
                }}>
                  <LinearGradient
                    colors={['#3db6ee', '#3d67ee', '#0738D9', '#0f3bca', '#3db6ee']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{padding: 15, borderRadius: 20, width: 400, height: '100%'}}
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

                <View style={{
                  width: 400,
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
                  <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 8, marginBottom: 20, textAlign: 'center'}}>
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
                              paddingVertical: 9,
                              paddingHorizontal: 10,
                              borderRadius: 8,
                              backgroundColor: isSelected ? '#3d67ee' : '#ffffff',
                              borderWidth: 1,
                              borderColor: isSelected ? '#3d67ee' : '#3d67ee',
                              marginRight: 6,
                              marginBottom: 6,
                              width: 140,
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

          {/* Step 5 - Medical Questionnaire */}
          {step === 5 && (
            <>
              <View style={{paddingHorizontal: 200, marginBottom: 30}}>
                <View style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  padding: 30,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: '#3d67ee',
                  width: '100%',
                }}>
                  
                  {/* Required Fields Indication */}
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10}}>
                    <Ionicons name="information-circle-outline" size={24} color="#ee3d5a" style={{marginRight: 10}} />
                    <Text style={{fontSize: 14, color: '#333', flex: 1}}>
                      <Text style={{fontWeight: 'bold', color: '#ee3d5a'}}>Required:</Text> All medical questions must be answered before proceeding.
                    </Text>
                  </View>
                  
                  {/* Medical Questions */}
                  <View style={{gap: 25, marginBottom: 30}}>
                    {medicalQuestions.map((q) => (
                      <View key={q.id} style={{marginBottom: 15}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                          <Text style={{fontSize: 16, fontWeight: '500', color: '#333'}}>
                            {q.question}
                          </Text>
                          <Text style={{color: '#ee3d5a', marginLeft: 5, fontSize: 16}}>*</Text>
                        </View>
                        
                        <View style={{flexDirection: 'row', gap: 30, marginBottom: q.hasDetails && medicalAnswers[q.key] === true ? 15 : 0}}>
                          <TouchableOpacity 
                            style={{flexDirection: 'row', alignItems: 'center'}}
                            onPress={() => {
                              handleMedicalAnswer(q.key, true);
                              // Reset medication details if switching from Yes to No
                              if (q.key === 'medications72h' && medicalAnswers[q.key] === true) {
                                setMedicationDetails('');
                              }
                            }}
                          >
                            <View style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              borderWidth: 2,
                              borderColor: '#3d67ee',
                              backgroundColor: medicalAnswers[q.key] === true ? '#3d67ee' : 'transparent',
                              marginRight: 8,
                            }} />
                            <Text style={{fontSize: 16, color: '#333'}}>Yes</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={{flexDirection: 'row', alignItems: 'center'}}
                            onPress={() => {
                              handleMedicalAnswer(q.key, false);
                              // Clear medication details if switching to No
                              if (q.key === 'medications72h') {
                                setMedicationDetails('');
                              }
                            }}
                          >
                            <View style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              borderWidth: 2,
                              borderColor: '#3d67ee',
                              backgroundColor: medicalAnswers[q.key] === false ? '#3d67ee' : 'transparent',
                              marginRight: 8,
                            }} />
                            <Text style={{fontSize: 16, color: '#333'}}>No</Text>
                          </TouchableOpacity>
                        </View>
                        
                        {/* Medication Details Field - Shows only if Yes is selected for medications question */}
                        {q.key === 'medications72h' && medicalAnswers[q.key] === true && (
                          <View style={{marginTop: 15, marginLeft: 30}}>
                            <Text style={{fontSize: 14, fontWeight: '500', color: '#3d67ee', marginBottom: 8}}>
                              Please specify the medication(s) given: <Text style={{color: '#ee3d5a'}}>*</Text>
                            </Text>
                            <TextInput
                              style={{
                                borderWidth: 1,
                                borderColor: '#3d67ee',
                                borderRadius: 10,
                                padding: 12,
                                fontSize: 15,
                                backgroundColor: '#f8f9fa',
                              }}
                              placeholder="e.g., Antibiotics, Pain medication, etc."
                              value={medicationDetails}
                              onChangeText={setMedicationDetails}
                            />
                            <Text style={{fontSize: 12, color: '#999', marginTop: 5}}>
                              Include medication names, dosage, and when it was given
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Additional Notes */}
                  <View style={{marginBottom: 20}}>
                    <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 10}}>
                      Additional Notes (Optional)
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#3d67ee',
                        borderRadius: 10,
                        padding: 15,
                        fontSize: 16,
                        minHeight: 100,
                        textAlignVertical: 'top',
                      }}
                      placeholder="Any specific concerns or information you'd like to share..."
                      value={additionalNotes}
                      onChangeText={setAdditionalNotes}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  {/* Grooming-specific section */}
                  {selectedServices.some(s => s.id === 1) && selectedGroomingOptions.length > 0 && (
                    <View style={{marginTop: 20, borderTopWidth: 1, borderTopColor: '#3d67ee20', paddingTop: 20}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold', color: '#3d67ee', marginBottom: 15}}>
                        Grooming Preferences
                      </Text>
                      
                      {/* Haircut Style Selection */}
                      <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 10}}>
                        Preferred Haircut Style
                      </Text>
                      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20}}>
                        {haircutStyles.map((style) => (
                          <TouchableOpacity
                            key={style.id}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 16,
                              borderRadius: 20,
                              backgroundColor: selectedHaircutStyle === style.id ? '#3d67ee' : '#f0f0f0',
                              borderWidth: 1,
                              borderColor: '#3d67ee',
                            }}
                            onPress={() => setSelectedHaircutStyle(style.id)}
                          >
                            <Text style={{
                              color: selectedHaircutStyle === style.id ? 'white' : '#3d67ee',
                              fontWeight: '500',
                            }}>
                              {style.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Custom Style Description */}
                      {selectedHaircutStyle === 'h6' && (
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#3d67ee',
                            borderRadius: 10,
                            padding: 12,
                            fontSize: 16,
                            marginBottom: 20,
                          }}
                          placeholder="Please describe the desired haircut style..."
                          value={customHaircutDescription}
                          onChangeText={setCustomHaircutDescription}
                        />
                      )}

                      {/* Reference Image Upload */}
                      <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 10}}>
                        Reference Image (Optional)
                      </Text>
                      <TouchableOpacity
                        style={{
                          borderWidth: 2,
                          borderColor: '#3d67ee',
                          borderStyle: 'dashed',
                          borderRadius: 10,
                          padding: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          marginBottom: 10,
                        }}
                        onPress={pickImage}
                      >
                        {haircutImage ? (
                          <View style={{alignItems: 'center'}}>
                            <Image 
                              source={{uri: haircutImage}} 
                              style={{width: 200, height: 200, borderRadius: 10, marginBottom: 10}}
                            />
                            <Text style={{color: '#3d67ee'}}>Tap to change image</Text>
                          </View>
                        ) : (
                          <>
                            <Ionicons name="cloud-upload-outline" size={50} color="#3d67ee" />
                            <Text style={{color: '#3d67ee', marginTop: 10, fontSize: 16}}>
                              Upload Reference Image
                            </Text>
                            <Text style={{color: '#999', marginTop: 5, fontSize: 14}}>
                              (Optional - show desired hairstyle)
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 30}}>
                <TouchableOpacity style={[userStyle.btnStyle, {backgroundColor: '#ccc'}]} onPress={handleBack}>
                  <Text style={{color: '#fffefe', fontSize: 16, fontWeight: '500'}}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    userStyle.btnStyle, 
                    {
                      opacity: (medicalAnswers.medications72h === null || 
                              medicalAnswers.fleaPrevention === null || 
                              medicalAnswers.catVaccinations === null || 
                              medicalAnswers.notPregnant === null ||
                              (medicalAnswers.medications72h === true && !medicationDetails.trim())) ? 0.5 : 1
                    }
                  ]} 
                  onPress={handleContinue}
                  disabled={medicalAnswers.medications72h === null || 
                          medicalAnswers.fleaPrevention === null || 
                          medicalAnswers.catVaccinations === null || 
                          medicalAnswers.notPregnant === null ||
                          (medicalAnswers.medications72h === true && !medicationDetails.trim())}
                >     
                  <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 6 - Confirmation */}
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
                    <Ionicons name="person-circle-outline" size={27} color="#3d67ee" style={{ marginRight: 10, marginTop: 3 }} />
                    <Text style={{fontSize: 20, fontWeight: '500', color: '#3d67ee'}}>Owner Details</Text>
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
                      <Ionicons name="paw" size={22} color="#3d67ee" style={{ marginRight: 12, marginTop: 3 }} />
                      <Text style={{fontSize: 20, fontWeight: '500', color: '#3d67ee'}}>Pet Details</Text>
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

                {/* Medical Information Card */}
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
                    <Ionicons name="medical" size={22} color="#3d67ee" style={{marginRight: 12}}/>
                    <Text style={{fontSize: 20, fontWeight: '500', color: '#3d67ee'}}>Medical Information</Text>
                  </View>
                  
                  <View style={{gap: 15, width: '100%'}}>
                    {/* Medications */}
                    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                      <Text style={{width: 220, fontSize: 14, color: '#333', fontWeight: '500'}}>
                        Medication in the past 72 Hours
                      </Text>
                      <View style={{flex: 1}}>
                        <Text style={{fontSize: 14, color: medicalAnswers.medications72h ? '#00aa00' : '#ee3d5a', fontWeight: '600'}}>
                          {medicalAnswers.medications72h ? 'Yes' : 'No'}
                        </Text>
                        {medicalAnswers.medications72h && medicationDetails && (
                          <Text style={{fontSize: 13, color: '#666', marginTop: 5, fontStyle: 'italic'}}>
                            Medications: {medicationDetails}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Flea & Tick Prevention */}
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 220, fontSize: 14, color: '#333', fontWeight: '500'}}>
                        Up-to-date Flea and Tick Prevention & Not Infested
                      </Text>
                      <Text style={{flex: 1, fontSize: 14, color: medicalAnswers.fleaPrevention ? '#00aa00' : '#ee3d5a', fontWeight: '600'}}>
                        {medicalAnswers.fleaPrevention ? 'Yes' : 'No'}
                      </Text>
                    </View>

                    {/* Rabies + 4in1 */}
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 220, fontSize: 14, color: '#333', fontWeight: '500'}}>
                        Up-to-Date Anti Rabies + 4in1
                      </Text>
                      <Text style={{flex: 1, fontSize: 14, color: medicalAnswers.catVaccinations ? '#00aa00' : '#ee3d5a', fontWeight: '600'}}>
                        {medicalAnswers.catVaccinations ? 'Yes' : 'No'}
                      </Text>
                    </View>

                    {/* Pregnant */}
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{width: 220, fontSize: 14, color: '#333', fontWeight: '500'}}>
                        Pregnant
                      </Text>
                      <Text style={{flex: 1, fontSize: 14, color: medicalAnswers.notPregnant ? '#00aa00' : '#ee3d5a', fontWeight: '600'}}>
                        {medicalAnswers.notPregnant ? 'No' : 'Yes'}
                      </Text>
                    </View>
                    
                    {additionalNotes ? (
                      <View style={{marginTop: 10, borderTopWidth: 1, borderTopColor: '#3d67ee20', paddingTop: 15}}>
                        <Text style={{fontSize: 16, fontWeight: '500', color: '#3d67ee', marginBottom: 8}}>Additional Notes:</Text>
                        <Text style={{fontSize: 14, color: '#333', lineHeight: 20}}>{additionalNotes}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Grooming Preferences Card (if applicable) */}
                {selectedServices.some(s => s.id === 1) && selectedGroomingOptions.length > 0 && selectedHaircutStyle && (
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
                      <Ionicons name="cut-outline" size={25} color="#3d67ee" style={{marginRight: 12}}/>
                      <Text style={{fontSize: 22, fontWeight: '500', color: '#3d67ee'}}>Grooming Preferences</Text>
                    </View>
                    
                    <View style={{gap: 12}}>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{width: 120, fontSize: 16, color: '#333', fontWeight: '500'}}>Haircut Style</Text>
                        <Text style={{flex: 1, fontSize: 16, color: '#333'}}>
                          {haircutStyles.find(s => s.id === selectedHaircutStyle)?.name}
                        </Text>
                      </View>
                      
                      {selectedHaircutStyle === 'h6' && customHaircutDescription ? (
                        <View style={{flexDirection: 'row'}}>
                          <Text style={{width: 120, fontSize: 16, color: '#333', fontWeight: '500'}}>Custom Style</Text>
                          <Text style={{flex: 1, fontSize: 16, color: '#333'}}>{customHaircutDescription}</Text>
                        </View>
                      ) : null}
                      
                      {haircutImage ? (
                        <View style={{marginTop: 15}}>
                          <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 10}}>Reference Image:</Text>
                          <Image 
                            source={{uri: haircutImage}} 
                            style={{width: 200, height: 200, borderRadius: 10, borderWidth: 1, borderColor: '#3d67ee'}}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}

                {/* Appointment Details Card */}
                {selectedServices.length > 0 && selectedDate && selectedTime && (
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
                      <Ionicons name="calendar-outline" size={22} color="#3d67ee" style={{marginRight: 12, marginTop: 2}}/>
                      <Text style={{fontSize: 20, fontWeight: '500', color: '#3d67ee'}}>Appointment Details</Text>
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