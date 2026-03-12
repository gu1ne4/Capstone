import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal, Linking } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react' // Added useCallback and useEffect
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native' // Added useFocusEffect
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
// Added AsyncStorage import
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function UserPetProfile() {
  const ns = useNavigation();
  
  // 1. DYNAMIC USER STATE
  const [currentUser, setCurrentUser] = useState(null);

  // 2. CUSTOM ALERT MODAL STATE (For protection and logout)
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info', 
    title: '',
    message: '', 
    onConfirm: null, 
    showCancel: false,
    confirmText: 'OK'
  });

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); 
  
  // Breed data based on type
  const dogBreeds = [
    'Unknown',
    'Golden Retriever',
    'French Bulldog',
    'German Shepherd',
    'Labrador Retriever',
    'Siberian Husky',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Dachshund',
    'Boxer',
    'Other'
  ];

  const catBreeds = [
    'Unknown',
    'Persian',
    'Siamese',
    'Maine Coon',
    'Ragdoll',
    'Bengal',
    'Sphynx',
    'British Shorthair',
    'Scottish Fold',
    'Abyssinian',
    'Other'
  ];

  // Mock data for pets with sample images and new fields
  const [pets, setPets] = useState([
    {
      id: '1',
      name: 'Max',
      type: 'Dog',
      breed: 'Golden Retriever',
      breedSize: 'Large',
      birthday: '2021-03-15',
      age: '3',
      ageUnknown: false,
      weight: '30',
      weightUnknown: false,
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      dateJoined: '2024-01-15',
      medicalRecords: [
        { id: 'r1', date: '2024-02-15', type: 'Vaccination', description: 'Rabies Vaccine', fileName: 'rabies_certificate.pdf', vet: 'Dr. Smith', notes: 'Annual vaccination', document: 'file://document.pdf', documentType: 'application/pdf' },
        { id: 'r2', date: '2024-01-10', type: 'Check-up', description: 'General Health Check', fileName: 'checkup_report.pdf', vet: 'Dr. Johnson', notes: 'Healthy, no issues', document: 'file://checkup.pdf', documentType: 'application/pdf' },
        { id: 'r3', date: '2023-12-05', type: 'Treatment', description: 'Ear Infection', fileName: 'treatment_record.pdf', vet: 'Dr. Smith', notes: 'Prescribed antibiotics', document: 'file://treatment.pdf', documentType: 'application/pdf' },
      ],
      appointments: [
        { id: 'a1', date: '2024-03-20', time: '10:30 AM', type: 'Vaccination', vet: 'Dr. Smith', status: 'upcoming' },
        { id: 'a2', date: '2024-02-15', time: '2:00 PM', type: 'Check-up', vet: 'Dr. Johnson', status: 'completed' },
        { id: 'a3', date: '2024-01-10', time: '11:15 AM', type: 'Deworming', vet: 'Dr. Smith', status: 'completed' },
      ],
      vaccinations: [
        { id: 'v1', name: 'Rabies', fileName: 'rabies_vaccine.jpg', date: '2024-02-15', proofImage: 'file://rabies.jpg', proofType: 'image/jpeg' },
        { id: 'v2', name: 'DHPP', fileName: 'dhpp_vaccine.pdf', date: '2024-02-20', proofImage: 'file://dhpp.pdf', proofType: 'application/pdf' },
      ]
    },
    {
      id: '2',
      name: 'Luna',
      type: 'Cat',
      breed: 'Persian',
      breedSize: 'Small',
      birthday: '2022-06-22',
      age: '2',
      ageUnknown: false,
      weight: '4',
      weightUnknown: false,
      gender: 'Female',
      image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400',
      dateJoined: '2024-01-20',
      medicalRecords: [
        { id: 'r4', date: '2024-02-01', type: 'Vaccination', description: 'FVRCP Vaccine', fileName: 'fvrcp_record.pdf', vet: 'Dr. Wilson', notes: 'First dose', document: 'file://fvrcp.pdf', documentType: 'application/pdf' },
        { id: 'r5', date: '2023-12-20', type: 'Check-up', description: 'Annual Check-up', fileName: 'annual_checkup.pdf', vet: 'Dr. Wilson', notes: 'Healthy weight', document: 'file://annual.pdf', documentType: 'application/pdf' },
      ],
      appointments: [
        { id: 'a4', date: '2024-03-25', time: '9:00 AM', type: 'Vaccination', vet: 'Dr. Wilson', status: 'upcoming' },
        { id: 'a5', date: '2024-02-01', time: '10:00 AM', type: 'Vaccination', vet: 'Dr. Wilson', status: 'completed' },
      ],
      vaccinations: [
        { id: 'v3', name: 'FVRCP', fileName: 'fvrcp_vaccine.jpg', date: '2024-02-01', proofImage: 'file://fvrcp_vac.jpg', proofType: 'image/jpeg' },
      ]
    },
    {
      id: '3',
      name: 'Charlie',
      type: 'Dog',
      breed: 'French Bulldog',
      breedSize: 'Small',
      birthday: '2023-08-10',
      age: '1',
      ageUnknown: false,
      weight: '12',
      weightUnknown: false,
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=400',
      dateJoined: '2024-02-01',
      medicalRecords: [
        { id: 'r6', date: '2024-02-20', type: 'Vaccination', description: 'DHPP Vaccine', fileName: 'dhpp_puppy.pdf', vet: 'Dr. Smith', notes: 'Puppy series', document: 'file://dhpp_puppy.pdf', documentType: 'application/pdf' },
      ],
      appointments: [
        { id: 'a6', date: '2024-03-28', time: '11:30 AM', type: 'Check-up', vet: 'Dr. Johnson', status: 'upcoming' },
      ],
      vaccinations: [
        { id: 'v4', name: 'DHPP', fileName: 'dhpp_vaccine.pdf', date: '2024-02-20', proofImage: 'file://dhpp_vac.pdf', proofType: 'application/pdf' },
      ]
    }
  ]);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [ageUnknown, setAgeUnknown] = useState(false);
  const [birthdayUnknown, setBirthdayUnknown] = useState(false);
  const [weightUnknown, setWeightUnknown] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // New pet form state - REMOVED medicalRecords
  const [newPet, setNewPet] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    breedSize: 'Medium',
    birthday: '',
    age: '',
    ageUnknown: false,
    weight: '',
    weightUnknown: false,
    gender: 'Male',
    image: null,
    dateJoined: new Date().toISOString().split('T')[0],
    vaccinations: []
  });

  // Edit pet form state
  const [editPet, setEditPet] = useState(null);

  // --- ADDED SESSION CHECK ---
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const session = await AsyncStorage.getItem('userSession');
          if (session) {
            setCurrentUser(JSON.parse(session));
          } else {
            setCurrentUser(null);
            // If they are not logged in, kick them back
            ns.navigate('UserHome');
          }
        } catch (error) {
          console.error("Failed to load user session", error);
        }
      };
      loadUser();
    }, [])
  );

  // --- ADDED HELPER FUNCTIONS ---
  const showAlert = (type, title, message, onConfirm = null, showCancel = false, confirmText = 'OK') => {
    setAlertConfig({ type, title, message, onConfirm, showCancel, confirmText });
    setCustomAlertVisible(true);
  };

  const handleProtectedAction = (action) => {
    if (currentUser) {
      action(); 
    } else {
      showAlert(
        'info', 
        'Authentication Required', 
        'You need to log in or sign up to access this feature.', 
        () => ns.navigate('Login'), 
        true, 
        'Go to Login' 
      );
    }
  };

  const handleLogout = () => {
    setDropdownVisible(false);
    showAlert('confirm', 'Log Out', 'Are you sure you want to log out?', async () => {
      await AsyncStorage.removeItem('userSession'); 
      setCurrentUser(null);
      ns.navigate('Login');
    }, true, 'Log Out');
  };

  const handleViewProfile = () => {
    setDropdownVisible(false);
    ns.navigate('UserProfile');
  };

  const handleMyPets = () => {
    setDropdownVisible(false);
  };

  // Date formatting function
  const formatDateInput = (text) => {
    // Remove all non-digits
    let cleaned = text.replace(/\D/g, '');
    
    // Format as YYYY-MM-DD
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
  };

  // Validate form
  const validateForm = (petData, isEdit = false) => {
    const errors = {};
    
    // Name validation (2-50 characters)
    if (!petData.name || petData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (petData.name.trim().length > 50) {
      errors.name = 'Name must not exceed 50 characters';
    }
    
    // Breed validation
    if (!petData.breed) {
      errors.breed = 'Please select a breed';
    }
    
    // Birthday or Age validation
    if (!petData.birthday && !petData.age && !petData.ageUnknown) {
      errors.birthdayAge = 'Please provide either birthday or age';
    }
    
    if (petData.birthday) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(petData.birthday)) {
        errors.birthday = 'Please use format YYYY-MM-DD';
      } else {
        const date = new Date(petData.birthday);
        if (isNaN(date.getTime())) {
          errors.birthday = 'Invalid date';
        }
      }
    }
    
    if (petData.age && !petData.ageUnknown) {
      const ageNum = parseInt(petData.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 30) {
        errors.age = 'Age must be between 0 and 30 years';
      }
    }
    
    // Weight validation (0.1-100 kg)
    if (petData.weight && !petData.weightUnknown) {
      const weightNum = parseFloat(petData.weight);
      if (isNaN(weightNum) || weightNum < 0.1 || weightNum > 100) {
        errors.weight = 'Weight must be between 0.1 and 100 kg';
      }
    }
    
    return errors;
  };

  const addNewPet = () => {
    const errors = validateForm(newPet);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const pet = {
      id: Date.now().toString(),
      ...newPet,
      dateJoined: new Date().toISOString().split('T')[0],
      medicalRecords: [], // Empty array for vet EMR
      appointments: [],
      vaccinations: newPet.vaccinations || []
    };
    setPets([...pets, pet]);
    setModalVisible(false);
    setValidationErrors({});
    setNewPet({ 
      name: '', 
      type: 'Dog', 
      breed: '', 
      breedSize: 'Medium',
      birthday: '',
      age: '', 
      ageUnknown: false,
      weight: '', 
      weightUnknown: false,
      gender: 'Male',
      image: null,
      dateJoined: new Date().toISOString().split('T')[0],
      vaccinations: []
    });
    setCharCount(0);
    setAgeUnknown(false);
    setBirthdayUnknown(false);
    setWeightUnknown(false);
  };

  const openEditModal = (pet) => {
    setEditPet({ ...pet });
    setAgeUnknown(pet.ageUnknown || false);
    setBirthdayUnknown(!pet.birthday);
    setWeightUnknown(pet.weightUnknown || false);
    setCharCount(pet.name.length);
    setEditModalVisible(true);
  };

  const savePetChanges = () => {
    const errors = validateForm(editPet, true);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const updatedPets = pets.map(pet => 
      pet.id === editPet.id ? editPet : pet
    );
    setPets(updatedPets);
    setSelectedPet(editPet);
    setEditModalVisible(false);
    setValidationErrors({});
    setEditPet(null);
  };

  // Image picker function
  const pickImage = async (setter, field, isEdit = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      if (isEdit) {
        setEditPet({...editPet, [field]: result.assets[0].uri});
      } else {
        setNewPet({...newPet, [field]: result.assets[0].uri});
      }
    }
  };

  // Function to view document
  const viewDocument = async (documentUri, documentType) => {
    try {
      await Linking.openURL(documentUri);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Could not open the file. Please make sure you have a compatible app installed.');
    }
  };

  // Function to remove vaccination
  const removeVaccination = (pet, vaccinationId, isFromProfile = true) => {
    if (isFromProfile) {
      // Removing from selected pet in profile
      const updatedVaccinations = pet.vaccinations.filter(v => v.id !== vaccinationId);
      const updatedPet = { ...pet, vaccinations: updatedVaccinations };
      setSelectedPet(updatedPet);
      
      // Update in pets array
      const updatedPets = pets.map(p => 
        p.id === pet.id ? updatedPet : p
      );
      setPets(updatedPets);
    } else {
      // Removing from new pet form
      const updatedVaccinations = newPet.vaccinations.filter(v => v.id !== vaccinationId);
      setNewPet({ ...newPet, vaccinations: updatedVaccinations });
    }
  };

  // Document picker function for adding new pet (vaccination only)
  const pickDocumentForNewPet = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        const newVaccination = {
          id: Date.now().toString(),
          name: asset.name || `Vaccination ${(newPet.vaccinations?.length || 0) + 1}`,
          fileName: asset.name,
          date: new Date().toISOString().split('T')[0],
          proofImage: asset.uri,
          proofType: asset.mimeType || 'application/octet-stream'
        };
        setNewPet({
          ...newPet,
          vaccinations: [...(newPet.vaccinations || []), newVaccination]
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  // Document picker function for vaccination (only)
  const pickVaccinationForPet = async (pet, setter, item) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newDoc = {
          ...item,
          fileName: asset.name,
          proofImage: asset.uri,
          proofType: asset.mimeType || 'application/octet-stream'
        };
        
        const updatedArray = pet.vaccinations.map(doc => 
          doc.id === item.id ? newDoc : doc
        );
        
        const updatedPet = { ...pet, vaccinations: updatedArray };
        setter(updatedPet);
        
        // Also update in pets array
        const updatedPets = pets.map(p => 
          p.id === pet.id ? updatedPet : p
        );
        setPets(updatedPets);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const PetListItem = ({ pet, isSelected, onPress }) => (
    <TouchableOpacity 
      style={{
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: isSelected ? 3 : 1,
        borderColor: isSelected ? '#3d67ee' : '#f0f0f0',
        width: '100%',
      }}
      onPress={onPress}
    >
      <Image 
        source={{ uri: pet.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400' }} 
        style={{
          width: 65,
          height: 65,
          borderRadius: 35,
          marginRight: 15,
          borderWidth: 2,
          borderColor: '#3d67ee',
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{pet.name}</Text>
        <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>@{pet.name.toLowerCase()}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="medical" size={12} color="#3d67ee" />
            <Text style={{ fontSize: 11, color: '#3d67ee' }}>{pet.medicalRecords.length} records</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="calendar" size={12} color="#3d67ee" />
            <Text style={{ fontSize: 11, color: '#3d67ee' }}>{pet.appointments.length} appts</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Medical Record Card - For VET EMR only (view only)
  const MedicalRecordCard = ({ record }) => (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#f0f0f0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="document-text" size={20} color="#3d67ee" />
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3d67ee' }}>{record.type}</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#666' }}>{record.date}</Text>
      </View>
      
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 }} numberOfLines={1}>
        {record.fileName || record.description}
      </Text>
      
      {record.vet && (
        <Text style={{ fontSize: 14, color: '#3d67ee', marginBottom: 3 }}>{record.vet}</Text>
      )}
      
      {record.notes && (
        <Text style={{ fontSize: 13, color: '#888', marginTop: 5 }}>📝 {record.notes}</Text>
      )}
      
      {record.document && (
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}
          onPress={() => viewDocument(record.document, record.documentType)}
        >
          <Ionicons name="eye-outline" size={18} color="#3d67ee" />
          <Text style={{ fontSize: 13, color: '#3d67ee' }}>View Document</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const AppointmentCard = ({ appointment }) => (
    <TouchableOpacity style={{
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      borderLeftWidth: 4,
      borderLeftColor: appointment.status === 'upcoming' ? '#3d67ee' : '#999',
      borderWidth: 1,
      borderColor: '#f0f0f0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="calendar" size={20} color="#3d67ee" />
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3d67ee' }}>{appointment.type}</Text>
        </View>
        <View style={{
          backgroundColor: appointment.status === 'upcoming' ? '#eef2ff' : '#f0f0f0',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 15,
        }}>
          <Text style={{ 
            fontSize: 11, 
            color: appointment.status === 'upcoming' ? '#3d67ee' : '#666',
            textTransform: 'capitalize',
            fontWeight: '500',
          }}>
            {appointment.status}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 }}>
        {appointment.date} • {appointment.time}
      </Text>
      <Text style={{ fontSize: 14, color: '#3d67ee' }}>{appointment.vet}</Text>
      
      <TouchableOpacity 
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}
      >
        <Ionicons name="eye-outline" size={18} color="#3d67ee" />
        <Text style={{ fontSize: 13, color: '#3d67ee' }}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const displayName = currentUser ? (currentUser.fullname || currentUser.fullName || currentUser.username || "User") : "";

  return (
    <View style={{backgroundColor: '#fff', height: '100%', padding: 10}}>

      {/* CUSTOM ALERT MODAL COMPONENT */}
      <Modal
        transparent={true}
        visible={customAlertVisible}
        animationType="fade"
        onRequestClose={() => setCustomAlertVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={{backgroundColor: 'white', padding: 25, borderRadius: 12, width: '80%', maxWidth: 350, alignItems: 'center', elevation: 5}}>
            <Ionicons 
              name={
                alertConfig.type === 'success' ? "checkmark-circle-outline" :
                alertConfig.type === 'error' ? "close-circle-outline" :
                "alert-circle-outline"
              } 
              size={55} 
              color={
                alertConfig.type === 'success' ? "#2e9e0c" :
                alertConfig.type === 'error' ? "#d93025" :
                "#3d67ee"
              } 
            />
            
            <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily: 'Segoe UI', color: 'black', textAlign: 'center'}}>
              {alertConfig.title}
            </Text>
            
            {typeof alertConfig.message === 'string' ? (
              <Text style={{textAlign: 'center', color: '#666', marginBottom: 25, fontSize: 14}}>
                {alertConfig.message}
              </Text>
            ) : (
              <View style={{marginBottom: 25}}>
                {alertConfig.message}
              </View>
            )}
            
            <View style={{flexDirection: 'row', gap: 15, width: '100%', justifyContent: 'center'}}>
              {alertConfig.showCancel && (
                <TouchableOpacity 
                  onPress={() => setCustomAlertVisible(false)} 
                  style={{paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 100, alignItems: 'center'}}
                >
                  <Text style={{color: '#333', fontWeight: '600'}}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={() => {
                  setCustomAlertVisible(false);
                  if (alertConfig.onConfirm) alertConfig.onConfirm();
                }} 
                style={{
                  paddingVertical: 10, 
                  paddingHorizontal: 20, 
                  backgroundColor: alertConfig.type === 'error' ? '#d93025' : '#3d67ee', 
                  borderRadius: 8, 
                  minWidth: 100, 
                  alignItems: 'center'
                }}
              >
                <Text style={{color: 'white', fontWeight: '600'}}>
                  {alertConfig.confirmText || 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sticky Navigation Bar */}
      <View style={{ zIndex: 1000 }}>
        <View style={userStyle.navbar}>
          {/* Profile Section with Dropdown */}
          <View style={{position: 'relative', zIndex: 2}}>
            {currentUser ? (
              <TouchableOpacity 
                onPress={() => setDropdownVisible(!dropdownVisible)}
                activeOpacity={0.7}
                style={{zIndex: 3}} 
              >
                <View style={[userStyle.navSections, {paddingHorizontal: 20, marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 12}]}>
                  {currentUser.userImage || currentUser.userimage ? (
                    <Image source={{uri: currentUser.userImage || currentUser.userimage}} style={{width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#3d67ee'}} />
                  ) : (
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#3d67ee20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3d67ee' }}>
                      <Text style={{color: '#3d67ee', fontWeight: 'bold', fontSize: 14}}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{flexDirection: 'column', marginRight: 5}}>
                    <Text style={[userStyle.smallText, {fontSize: 14}]}>{displayName}</Text>
                  </View>
                  <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={18} color="#3d67ee" />
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

            {dropdownVisible && currentUser && (
              <View style={{ position: 'absolute', top: 48, left: 13, backgroundColor: 'white', borderRadius: 10, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 5, width: 232, zIndex: 1 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginTop: 5, gap: 10 }} onPress={handleViewProfile}>
                  <Ionicons name="person-outline" size={16} color="#3d67ee" />
                  <Text style={{fontSize: 13, color: '#333'}}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 }} onPress={handleMyPets}>
                  <Ionicons name="paw-outline" size={16} color="#3d67ee" />
                  <Text style={{fontSize: 13, color: '#333'}}>My Pets</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={16} color="#ee3d5a" />
                  <Text style={{fontSize: 13, color: '#ee3d5a'}}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[userStyle.navSections, { flexDirection: 'row',  alignItems: 'center', gap: 60, width: '70%'}]}>
              <TouchableOpacity onPress={()=>{ns.navigate('UserHome')}}><Text style={userStyle.navText}>Home</Text></TouchableOpacity>
              <TouchableOpacity><Text style={userStyle.navText}>About Us</Text></TouchableOpacity>
              <TouchableOpacity><Text style={userStyle.navText}>Our Services</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleProtectedAction(() => ns.navigate('UserAppointment'))}><Text style={userStyle.navText}>Book an Appointment</Text></TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => handleProtectedAction(() => ns.navigate('UserPets'))}>
              <View style={userStyle.navSections}><Ionicons name="paw" size={21} color="#3d67ee" style={{ marginTop: 3 }} /></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleProtectedAction(() => ns.navigate('UserAppointmentView'))}>
              <View style={userStyle.navSections}><Ionicons name="calendar-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} /></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleProtectedAction(() => console.log('Notifications'))}>
              <View style={userStyle.navSections}><Ionicons name="notifications-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} /></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, flexDirection: 'row', marginTop: 10, paddingHorizontal: 10 }}>
        {/* Left Sidebar */}
        <View style={{ 
          width: '35%', 
          padding: 10,
        }}>
          <View style={{ backgroundColor: '#ffffff', marginRight: 10, height: '100%', borderRightWidth: 1, borderRightColor: '#b9b9b9', paddingRight: 30 }}>
            <View style={{ position: 'relative', marginBottom: 20 }}>
              <Image 
                source={require('../assets/ProfileHeader.png')} 
                style={{
                  width: '100%',
                  height: 110,
                  borderRadius: 15,
                  zIndex: 1,
                  marginTop: 55,
                }}
              />
              
              {/* Text overlay */}
              <View style={{
                position: 'absolute',
                top: 72,
                left: 20,
                right: 20,
                zIndex: 2,
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 24,
                  fontWeight: '500',
                  marginTop: 8,
                }}>
                  Pet Profiles 
                </Text>
                <Text style={{
                  color: 'white',
                  fontSize: 12,
                  opacity: 0.9,
                }}>
                  View your pet's profile, medical records, and appointments!
                </Text>
              </View>

              <Image 
                source={require('../assets/PetsPeeking.png')} 
                style={{
                  position: 'absolute',
                  top: -35, 
                  left: 0,
                  width: '100%',
                  height: 170,
                  zIndex: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.23,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                resizeMode="contain" 
              />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                <Text style={{ fontSize: 20, fontWeight: '500', color: '#333', marginBottom: 15 }}>Your Pets</Text>
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#3d67ee',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    alignItems: 'center',
                    marginBottom: 15,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Add New Pet</Text>
                </TouchableOpacity>
              </View>

              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                {pets.map(pet => (
                  <PetListItem 
                    key={pet.id} 
                    pet={pet} 
                    isSelected={selectedPet?.id === pet.id}
                    onPress={() => setSelectedPet(pet)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Right Content - Pet Details */}
        <View style={{ width: '65%', backgroundColor: '#fff', padding: 20 }}>
          {selectedPet ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ 
                position: 'relative',
                marginBottom: 60,
              }}>
                {/* Background Image */}
                <Image 
                  source={require('../assets/ProfileHeader.png')} 
                  style={{
                    width: '100%',
                    height: 110,
                    borderRadius: 15,
                  }}
                />
                
                <View style={{
                  position: 'absolute',
                  bottom: -40,
                  left: 20,
                  zIndex: 10,
                  alignItems: 'center',
                }}>
                  <View style={{
                    backgroundColor: 'white',
                    padding: 4,
                    borderRadius: 80,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 5,
                    marginLeft: 10,
                  }}>
                    <Image 
                      source={{ uri: selectedPet.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400' }} 
                      style={{
                        width: 125,
                        height: 125,
                        borderRadius: 80,
                        borderWidth: 1,
                        borderColor: 'white',
                      }}
                    />
                  </View>
                </View>
                
                {/* Pet Name and Details Overlay */}
                <View style={{
                  position: 'absolute',
                  left: 180,
                  zIndex: 5,
                  padding: 10,
                  marginTop: 12
                }}>
                  <Text style={{
                    fontSize: 22,
                    fontWeight: '500',
                    color: '#ffffff',
                  }}>
                    {selectedPet.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={{ fontSize: 14, color: '#ffffff' }}>@{selectedPet.name.toLowerCase()}</Text>
                    <Text style={{ fontSize: 14, color: '#ffffff', marginLeft: 8 }}>•</Text>
                    <Text style={{ fontSize: 14, color: '#ffffff', marginLeft: 8 }}>{selectedPet.breed}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#ffffff', marginTop: 5, opacity: 0.8 }}>
                    Joined {formatDate(selectedPet.dateJoined)}
                  </Text>
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: 20,
                    padding: 8,
                    zIndex: 20,
                    marginTop: 5,
                    marginRight: 5,
                  }}
                  onPress={() => openEditModal(selectedPet)}
                >
                  <Ionicons name="pencil" size={15} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Tab Navigation */}
              <View style={{ 
                flexDirection: 'row', 
                marginBottom: 20, 
                marginTop: 20,
                backgroundColor: '#f5f7fa',
                borderRadius: 10,
                padding: 5,
              }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 10, 
                    alignItems: 'center',
                    backgroundColor: activeTab === 'profile' ? '#3d67ee' : 'transparent',
                    borderRadius: 8,
                  }}
                  onPress={() => setActiveTab('profile')}
                >
                  <Text style={{ 
                    color: activeTab === 'profile' ? '#fff' : '#666',
                    fontWeight: activeTab === 'profile' ? '600' : '400',
                    fontSize: 13,
                  }}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 10, 
                    alignItems: 'center',
                    backgroundColor: activeTab === 'records' ? '#3d67ee' : 'transparent',
                    borderRadius: 8,
                  }}
                  onPress={() => setActiveTab('records')}
                >
                  <Text style={{ 
                    color: activeTab === 'records' ? '#fff' : '#666',
                    fontWeight: activeTab === 'records' ? '600' : '400',
                    fontSize: 13,
                  }}>Records (VET EMR)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 10, 
                    alignItems: 'center',
                    backgroundColor: activeTab === 'appointments' ? '#3d67ee' : 'transparent',
                    borderRadius: 8,
                  }}
                  onPress={() => setActiveTab('appointments')}
                >
                  <Text style={{ 
                    color: activeTab === 'appointments' ? '#fff' : '#666',
                    fontWeight: activeTab === 'appointments' ? '600' : '400',
                    fontSize: 13,
                  }}>Appointments</Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <View style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: 12, 
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 3,
                  marginLeft: 8,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: '#f0f0f0',
                }}>
                  <View style={{ flexDirection: 'row', marginBottom: 15, gap: 8, alignItems: 'center' }}>
                    <Ionicons name="information-circle-outline" size={25} color="#3d67ee" />
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#3d67ee' }}>Pet Information</Text>
                  </View>

                  <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Name:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.name}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Type:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.type}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Breed:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.breed}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Breed Size:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.breedSize}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Pet Birthday:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.birthday ? formatDate(selectedPet.birthday) : 'Unknown'}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Age:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.ageUnknown ? 'Unknown' : `${selectedPet.age} years`}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Weight:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.weightUnknown ? 'Unknown' : `${selectedPet.weight} kg`}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
                      <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>Gender:</Text>
                      <Text style={{ fontSize: 14, color: '#333' }}>{selectedPet.gender}</Text>
                    </View>
                  </View>

                  {/* Vaccination Records */}
                  <View style={{ marginTop: 25 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="medical-outline" size={22} color="#3d67ee" />
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#3d67ee' }}>Vaccination Records</Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#3d67ee',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 15,
                        }}
                        onPress={() => {
                          const newVac = {
                            id: Date.now().toString(),
                            name: 'New Vaccine',
                            fileName: null,
                            date: new Date().toISOString().split('T')[0],
                            proofImage: null,
                            proofType: null
                          };
                          const updatedPet = {
                            ...selectedPet,
                            vaccinations: [...selectedPet.vaccinations, newVac]
                          };
                          const updatedPets = pets.map(p => 
                            p.id === selectedPet.id ? updatedPet : p
                          );
                          setPets(updatedPets);
                          setSelectedPet(updatedPet);
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '500' }}>+ Add</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={{ gap: 12 }}>
                      {selectedPet.vaccinations?.map((vac) => (
                        <View key={vac.id} style={{
                          backgroundColor: '#fff',
                          borderRadius: 12,
                          padding: 15,
                          marginBottom: 12,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 2,
                          borderWidth: 1,
                          borderColor: '#f0f0f0',
                        }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Ionicons name="medical" size={20} color="#3d67ee" />
                              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3d67ee' }}>Vaccination</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <Text style={{ fontSize: 12, color: '#666' }}>{vac.date}</Text>
                              <TouchableOpacity
                                onPress={() => removeVaccination(selectedPet, vac.id, true)}
                              >
                                <Ionicons name="trash-outline" size={18} color="#ff4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 }} numberOfLines={1}>
                            {vac.fileName || vac.name}
                          </Text>
                          
                          {vac.proofImage ? (
                            <TouchableOpacity 
                              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}
                              onPress={() => viewDocument(vac.proofImage, vac.proofType)}
                            >
                              <Ionicons name="eye-outline" size={18} color="#3d67ee" />
                              <Text style={{ fontSize: 13, color: '#3d67ee' }}>View Document</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity 
                              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}
                              onPress={() => pickVaccinationForPet(selectedPet, setSelectedPet, vac)}
                            >
                              <Ionicons name="cloud-upload-outline" size={18} color="#3d67ee" />
                              <Text style={{ fontSize: 13, color: '#3d67ee' }}>Upload Document</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'records' && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="folder-outline" size={22} color="#3d67ee" />
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Electronic Medical Records</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: '#3d67ee' }}>{selectedPet.medicalRecords.length} records</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#888', marginBottom: 15, fontStyle: 'italic' }}>
                    These records are from PetShield veterinarians and are view-only
                  </Text>
                  {selectedPet.medicalRecords.map(record => (
                    <MedicalRecordCard key={record.id} record={record} />
                  ))}
                </View>
              )}

              {activeTab === 'appointments' && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Appointments</Text>
                    <Text style={{ fontSize: 14, color: '#3d67ee' }}>{selectedPet.appointments.length} total</Text>
                  </View>
                  {selectedPet.appointments.map(appointment => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="paw" size={80} color="#e0e0e0" />
              <Text style={{ fontSize: 18, color: '#999', marginTop: 20, textAlign: 'center' }}>
                Select a pet from the left{'\n'}to view their profile
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Add Pet Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 30, width: '50%', maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Add a New Pet! 🐕</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setValidationErrors({});
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Pet Picture Upload */}
              <Text style={{ fontSize: 14, color: '#000000', marginBottom: 5 }}>Pet Picture</Text>
              <TouchableOpacity 
                style={{
                  width: '100%',
                  height: 120,
                  borderWidth: 2,
                  borderColor: '#3d67ee',
                  borderStyle: 'dashed',
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f0f4ff',
                  marginBottom: 20,
                }}
                onPress={() => pickImage(setNewPet, 'image', false)}
              >
                {newPet.image ? (
                  <Image source={{ uri: newPet.image }} style={{ width: '100%', height: '100%', borderRadius: 13 }} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={40} color="#3d67ee" />
                    <Text style={{ color: '#3d67ee', marginTop: 5 }}>Upload Pet Photo</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Name Field with Character Counter */}
              <Text style={{ fontSize: 14, color: '#000000', marginBottom: 5 }}>Pet Name *</Text>
              <View style={{ position: 'relative', marginBottom: validationErrors.name ? 0 : 15 }}>
                <TextInput
                  style={{ 
                    borderWidth: 1, 
                    borderColor: validationErrors.name ? '#ff4444' : '#e0e0e0', 
                    borderRadius: 10, 
                    padding: 12,
                    paddingRight: 50,
                  }}
                  placeholder="Enter pet name (2-50 characters)"
                  value={newPet.name}
                  maxLength={50}
                  onChangeText={(text) => {
                    setNewPet({...newPet, name: text});
                    setCharCount(text.length);
                    if (validationErrors.name) {
                      setValidationErrors({...validationErrors, name: null});
                    }
                  }}
                />
                <Text style={{ position: 'absolute', right: 10, top: 12, color: '#999', fontSize: 12 }}>
                  {charCount}/50
                </Text>
              </View>
              {validationErrors.name && (
                <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.name}</Text>
              )}

              {/* Type Selection */}
              <Text style={{ fontSize: 14, color: '#000000', marginBottom: 5 }}>Pet Type *</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    padding: 12, 
                    borderRadius: 10, 
                    borderWidth: 1, 
                    borderColor: newPet.type === 'Dog' ? '#3d67ee' : '#e0e0e0',
                    backgroundColor: newPet.type === 'Dog' ? '#eef2ff' : '#fff',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                  onPress={() => {
                    setNewPet({...newPet, type: 'Dog', breed: ''});
                    if (validationErrors.breed) {
                      setValidationErrors({...validationErrors, breed: null});
                    }
                  }}
                >
                  <Ionicons name="paw" size={18} color={newPet.type === 'Dog' ? '#3d67ee' : '#666'} />
                  <Text style={{ color: newPet.type === 'Dog' ? '#3d67ee' : '#666' }}>Dog</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    padding: 12, 
                    borderRadius: 10, 
                    borderWidth: 1, 
                    borderColor: newPet.type === 'Cat' ? '#3d67ee' : '#e0e0e0',
                    backgroundColor: newPet.type === 'Cat' ? '#eef2ff' : '#fff',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                  onPress={() => {
                    setNewPet({...newPet, type: 'Cat', breed: ''});
                    if (validationErrors.breed) {
                      setValidationErrors({...validationErrors, breed: null});
                    }
                  }}
                >
                  <Ionicons name="happy" size={18} color={newPet.type === 'Cat' ? '#3d67ee' : '#666'} />
                  <Text style={{ color: newPet.type === 'Cat' ? '#3d67ee' : '#666' }}>Cat</Text>
                </TouchableOpacity>
              </View>

              {/* Breed Dropdown */}
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Breed *</Text>
              <View style={{ 
                borderWidth: 1, 
                borderColor: validationErrors.breed ? '#ff4444' : '#e0e0e0', 
                borderRadius: 10, 
                marginBottom: validationErrors.breed ? 0 : 15,
                overflow: 'hidden'
              }}>
                <Picker
                  selectedValue={newPet.breed}
                  onValueChange={(itemValue) => {
                    setNewPet({...newPet, breed: itemValue});
                    if (validationErrors.breed) {
                      setValidationErrors({...validationErrors, breed: null});
                    }
                  }}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select breed" value="" />
                  {(newPet.type === 'Dog' ? dogBreeds : catBreeds).map(breed => (
                    <Picker.Item key={breed} label={breed} value={breed} />
                  ))}
                </Picker>
              </View>
              {validationErrors.breed && (
                <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.breed}</Text>
              )}

              {/* Breed Size Selection */}
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Breed Size</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                {['Small', 'Medium', 'Large'].map(size => (
                  <TouchableOpacity 
                    key={size}
                    style={{ 
                      flex: 1, 
                      padding: 12, 
                      borderRadius: 10, 
                      borderWidth: 1, 
                      borderColor: newPet.breedSize === size ? '#3d67ee' : '#e0e0e0',
                      backgroundColor: newPet.breedSize === size ? '#eef2ff' : '#fff',
                      alignItems: 'center',
                    }}
                    onPress={() => setNewPet({...newPet, breedSize: size})}
                  >
                    <Text style={{ color: newPet.breedSize === size ? '#3d67ee' : '#666' }}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Birthday with auto-format */}
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Pet Birthday</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <TextInput
                  style={{ 
                    flex: 1,
                    borderWidth: 1, 
                    borderColor: validationErrors.birthday ? '#ff4444' : '#e0e0e0', 
                    borderRadius: 10, 
                    padding: 12,
                    opacity: birthdayUnknown ? 0.5 : 1,
                  }}
                  placeholder="YYYY-MM-DD"
                  value={birthdayUnknown ? '' : newPet.birthday}
                  editable={!birthdayUnknown}
                  keyboardType="numeric"
                  maxLength={10}
                  onChangeText={(text) => {
                    const formatted = formatDateInput(text);
                    setNewPet({...newPet, birthday: formatted});
                    if (validationErrors.birthday) {
                      setValidationErrors({...validationErrors, birthday: null});
                    }
                  }}
                />
                <TouchableOpacity 
                  style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    setBirthdayUnknown(!birthdayUnknown);
                    if (!birthdayUnknown) {
                      setNewPet({...newPet, birthday: ''});
                    }
                  }}
                >
                  <Ionicons 
                    name={birthdayUnknown ? "checkbox" : "square-outline"} 
                    size={24} 
                    color="#3d67ee" 
                  />
                  <Text style={{ marginLeft: 5, color: '#666' }}>Unknown</Text>
                </TouchableOpacity>
              </View>
              {validationErrors.birthday && (
                <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.birthday}</Text>
              )}

              {/* Age with unknown checkbox */}
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Age (years)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <TextInput
                  style={{ 
                    flex: 1,
                    borderWidth: 1, 
                    borderColor: validationErrors.age ? '#ff4444' : '#e0e0e0', 
                    borderRadius: 10, 
                    padding: 12,
                    opacity: ageUnknown ? 0.5 : 1,
                  }}
                  placeholder="Enter age"
                  value={ageUnknown ? '' : newPet.age}
                  editable={!ageUnknown}
                  keyboardType="numeric"
                  maxLength={2}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setNewPet({...newPet, age: numericValue});
                    if (validationErrors.age) {
                      setValidationErrors({...validationErrors, age: null});
                    }
                  }}
                />
                <TouchableOpacity 
                  style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    setAgeUnknown(!ageUnknown);
                    if (!ageUnknown) {
                      setNewPet({...newPet, age: '', ageUnknown: true});
                    } else {
                      setNewPet({...newPet, ageUnknown: false});
                    }
                  }}
                >
                  <Ionicons 
                    name={ageUnknown ? "checkbox" : "square-outline"} 
                    size={24} 
                    color="#3d67ee" 
                  />
                  <Text style={{ marginLeft: 5, color: '#666' }}>Unknown</Text>
                </TouchableOpacity>
              </View>
              {validationErrors.age && (
                <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.age}</Text>
              )}

              {/* Weight with kg indicator and unknown checkbox */}
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Weight (kg) *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: validationErrors.weight ? 0 : 15 }}>
                <TextInput
                  style={{ 
                    flex: 0.5,
                    borderWidth: 1, 
                    borderColor: validationErrors.weight ? '#ff4444' : '#e0e0e0', 
                    borderRadius: 10, 
                    padding: 12,
                    opacity: weightUnknown ? 0.5 : 1,
                  }}
                  placeholder="Enter weight (max 100 kg)"
                  value={weightUnknown ? '' : newPet.weight}
                  editable={!weightUnknown}
                  keyboardType="numeric"
                  maxLength={5}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    if (parseFloat(numericValue) <= 100) {
                      setNewPet({...newPet, weight: numericValue});
                    }
                    if (validationErrors.weight) {
                      setValidationErrors({...validationErrors, weight: null});
                    }
                  }}
                />
                <Text style={{ marginLeft: 10, fontSize: 16, color: '#666' }}>kg</Text>
                <TouchableOpacity 
                  style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    setWeightUnknown(!weightUnknown);
                    if (!weightUnknown) {
                      setNewPet({...newPet, weight: '', weightUnknown: true});
                    } else {
                      setNewPet({...newPet, weightUnknown: false});
                    }
                  }}
                >
                  <Ionicons 
                    name={weightUnknown ? "checkbox" : "square-outline"} 
                    size={24} 
                    color="#3d67ee" 
                  />
                  <Text style={{ marginLeft: 5, color: '#666' }}>Unknown</Text>
                </TouchableOpacity>
              </View>
              {validationErrors.weight && (
                <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.weight}</Text>
              )}

              {/* Gender Dropdown */}
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Gender *</Text>
              <View style={{ 
                borderWidth: 1, 
                borderColor: '#e0e0e0', 
                borderRadius: 10, 
                marginBottom: 20,
                overflow: 'hidden'
              }}>
                <Picker
                  selectedValue={newPet.gender}
                  onValueChange={(itemValue) => setNewPet({...newPet, gender: itemValue})}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                </Picker>
              </View>

              {/* Vaccination Upload Section */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 10 }}>Vaccination Records</Text>
                <TouchableOpacity 
                  style={{
                    borderWidth: 1,
                    borderColor: '#3d67ee',
                    borderStyle: 'dashed',
                    borderRadius: 10,
                    padding: 15,
                    alignItems: 'center',
                    backgroundColor: '#f0f4ff',
                  }}
                  onPress={pickDocumentForNewPet}
                >
                  <Ionicons name="cloud-upload-outline" size={30} color="#3d67ee" />
                  <Text style={{ color: '#3d67ee', marginTop: 5 }}>Upload Vaccination Proof</Text>
                </TouchableOpacity>
                
                {/* Display uploaded vaccinations with remove button */}
                {newPet.vaccinations?.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    {newPet.vaccinations.map((vac) => (
                      <View key={vac.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <Ionicons name="document-text" size={20} color="#3d67ee" />
                          <Text style={{ fontSize: 13, color: '#333' }} numberOfLines={1}>
                            {vac.fileName || vac.name}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                          <TouchableOpacity onPress={() => removeVaccination(newPet, vac.id, false)}>
                            <Ionicons name="trash-outline" size={18} color="#ff4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {validationErrors.birthdayAge && (
                <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15, textAlign: 'center' }}>
                  {validationErrors.birthdayAge}
                </Text>
              )}

              <TouchableOpacity 
                style={{ 
                  backgroundColor: '#3d67ee', 
                  padding: 15, 
                  borderRadius: 10, 
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                onPress={addNewPet}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add Pet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Pet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          setValidationErrors({});
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 30, width: '60%', maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Edit Pet Information 🐈</Text>
              <TouchableOpacity onPress={() => {
                setEditModalVisible(false);
                setValidationErrors({});
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {editPet && (
              <ScrollView>
                {/* Pet Picture Upload */}
                <Text style={{ fontSize: 14, color: '#000000', marginBottom: 5 }}>Pet Picture</Text>
                <TouchableOpacity 
                  style={{
                    width: '100%',
                    height: 120,
                    borderWidth: 2,
                    borderColor: '#3d67ee',
                    borderStyle: 'dashed',
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f0f4ff',
                    marginBottom: 20,
                  }}
                  onPress={() => pickImage(setEditPet, 'image', true)}
                >
                  {editPet.image ? (
                    <Image source={{ uri: editPet.image }} style={{ width: '100%', height: '100%', borderRadius: 13 }} />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={40} color="#3d67ee" />
                      <Text style={{ color: '#3d67ee', marginTop: 5 }}>Upload Pet Photo</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Pet Name *</Text>
                <View style={{ position: 'relative', marginBottom: validationErrors.name ? 0 : 15 }}>
                  <TextInput
                    style={{ 
                      borderWidth: 1, 
                      borderColor: validationErrors.name ? '#ff4444' : '#e0e0e0', 
                      borderRadius: 10, 
                      padding: 12,
                      paddingRight: 50,
                    }}
                    value={editPet.name}
                    maxLength={50}
                    onChangeText={(text) => {
                      setEditPet({...editPet, name: text});
                      setCharCount(text.length);
                      if (validationErrors.name) {
                        setValidationErrors({...validationErrors, name: null});
                      }
                    }}
                  />
                  <Text style={{ position: 'absolute', right: 10, top: 12, color: '#999', fontSize: 12 }}>
                    {editPet.name?.length || 0}/50
                  </Text>
                </View>
                {validationErrors.name && (
                  <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.name}</Text>
                )}

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Pet Type</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                  <TouchableOpacity 
                    style={{ 
                      flex: 1, 
                      padding: 12, 
                      borderRadius: 10, 
                      borderWidth: 1, 
                      borderColor: editPet.type === 'Dog' ? '#3d67ee' : '#e0e0e0',
                      backgroundColor: editPet.type === 'Dog' ? '#eef2ff' : '#fff',
                      alignItems: 'center',
                    }}
                    onPress={() => setEditPet({...editPet, type: 'Dog', breed: ''})}
                  >
                    <Text style={{ color: editPet.type === 'Dog' ? '#3d67ee' : '#666' }}>Dog</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ 
                      flex: 1, 
                      padding: 12, 
                      borderRadius: 10, 
                      borderWidth: 1, 
                      borderColor: editPet.type === 'Cat' ? '#3d67ee' : '#e0e0e0',
                      backgroundColor: editPet.type === 'Cat' ? '#eef2ff' : '#fff',
                      alignItems: 'center',
                    }}
                    onPress={() => setEditPet({...editPet, type: 'Cat', breed: ''})}
                  >
                    <Text style={{ color: editPet.type === 'Cat' ? '#3d67ee' : '#666' }}>Cat</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Breed *</Text>
                <View style={{ 
                  borderWidth: 1, 
                  borderColor: validationErrors.breed ? '#ff4444' : '#e0e0e0', 
                  borderRadius: 10, 
                  marginBottom: validationErrors.breed ? 0 : 15,
                  overflow: 'hidden'
                }}>
                  <Picker
                    selectedValue={editPet.breed}
                    onValueChange={(itemValue) => {
                      setEditPet({...editPet, breed: itemValue});
                      if (validationErrors.breed) {
                        setValidationErrors({...validationErrors, breed: null});
                      }
                    }}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Select breed" value="" />
                    {(editPet.type === 'Dog' ? dogBreeds : catBreeds).map(breed => (
                      <Picker.Item key={breed} label={breed} value={breed} />
                    ))}
                  </Picker>
                </View>
                {validationErrors.breed && (
                  <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.breed}</Text>
                )}

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Breed Size</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                  {['Small', 'Medium', 'Large'].map(size => (
                    <TouchableOpacity 
                      key={size}
                      style={{ 
                        flex: 1, 
                        padding: 12, 
                        borderRadius: 10, 
                        borderWidth: 1, 
                        borderColor: editPet.breedSize === size ? '#3d67ee' : '#e0e0e0',
                        backgroundColor: editPet.breedSize === size ? '#eef2ff' : '#fff',
                        alignItems: 'center',
                      }}
                      onPress={() => setEditPet({...editPet, breedSize: size})}
                    >
                      <Text style={{ color: editPet.breedSize === size ? '#3d67ee' : '#666' }}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Pet Birthday</Text>
                <TextInput
                  style={{ 
                    borderWidth: 1, 
                    borderColor: validationErrors.birthday ? '#ff4444' : '#e0e0e0', 
                    borderRadius: 10, 
                    padding: 12, 
                    marginBottom: validationErrors.birthday ? 0 : 15 
                  }}
                  value={editPet.birthday}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                  maxLength={10}
                  onChangeText={(text) => {
                    const formatted = formatDateInput(text);
                    setEditPet({...editPet, birthday: formatted});
                    if (validationErrors.birthday) {
                      setValidationErrors({...validationErrors, birthday: null});
                    }
                  }}
                />
                {validationErrors.birthday && (
                  <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.birthday}</Text>
                )}

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Age (years)</Text>
                <TextInput
                  style={{ 
                    borderWidth: 1, 
                    borderColor: validationErrors.age ? '#ff4444' : '#e0e0e0', 
                    borderRadius: 10, 
                    padding: 12, 
                    marginBottom: validationErrors.age ? 0 : 15 
                  }}
                  value={editPet.age}
                  keyboardType="numeric"
                  maxLength={2}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setEditPet({...editPet, age: numericValue});
                    if (validationErrors.age) {
                      setValidationErrors({...validationErrors, age: null});
                    }
                  }}
                />
                {validationErrors.age && (
                  <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.age}</Text>
                )}

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Weight (kg) *</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: validationErrors.weight ? 0 : 15 }}>
                  <TextInput
                    style={{ 
                      flex: 1,
                      borderWidth: 1, 
                      borderColor: validationErrors.weight ? '#ff4444' : '#e0e0e0', 
                      borderRadius: 10, 
                      padding: 12,
                    }}
                    value={editPet.weight}
                    keyboardType="numeric"
                    maxLength={5}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      if (parseFloat(numericValue) <= 100) {
                        setEditPet({...editPet, weight: numericValue});
                      }
                      if (validationErrors.weight) {
                        setValidationErrors({...validationErrors, weight: null});
                      }
                    }}
                  />
                  <Text style={{ marginLeft: 10, fontSize: 16, color: '#666' }}>kg</Text>
                </View>
                {validationErrors.weight && (
                  <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 15 }}>{validationErrors.weight}</Text>
                )}

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Gender</Text>
                <View style={{ 
                  borderWidth: 1, 
                  borderColor: '#e0e0e0', 
                  borderRadius: 10, 
                  marginBottom: 20,
                  overflow: 'hidden'
                }}>
                  <Picker
                    selectedValue={editPet.gender}
                    onValueChange={(itemValue) => setEditPet({...editPet, gender: itemValue})}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                  </Picker>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <TouchableOpacity 
                    style={{ 
                      flex: 1,
                      backgroundColor: '#f0f0f0', 
                      padding: 15, 
                      borderRadius: 10, 
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setEditModalVisible(false);
                      setValidationErrors({});
                    }}
                  >
                    <Text style={{ color: '#666', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={{ 
                      flex: 1,
                      backgroundColor: '#3d67ee', 
                      padding: 15, 
                      borderRadius: 10, 
                      alignItems: 'center',
                    }}
                    onPress={savePetChanges}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}