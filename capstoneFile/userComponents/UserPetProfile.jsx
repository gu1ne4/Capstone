import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import userStyle from '../styles/UserStyle'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export default function UserPetProfile() {
  const ns = useNavigation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); 
  
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const user = {
    name: 'John Michael Santos',
    email: 'john.santos@email.com',
    profileImage: null
  };

  // Mock data for pets
  const [pets, setPets] = useState([
    {
      id: '1',
      name: 'Max',
      type: 'Dog',
      breed: 'Golden Retriever',
      age: '3 years',
      weight: '30 kg',
      gender: 'Male',
      profileImage: null,
      medicalRecords: [
        { id: 'r1', date: '2024-02-15', type: 'Vaccination', description: 'Rabies Vaccine', vet: 'Dr. Smith', notes: 'Annual vaccination' },
        { id: 'r2', date: '2024-01-10', type: 'Check-up', description: 'General Health Check', vet: 'Dr. Johnson', notes: 'Healthy, no issues' },
        { id: 'r3', date: '2023-12-05', type: 'Treatment', description: 'Ear Infection', vet: 'Dr. Smith', notes: 'Prescribed antibiotics' },
      ],
      appointments: [
        { id: 'a1', date: '2024-03-20', time: '10:30 AM', type: 'Vaccination', vet: 'Dr. Smith', status: 'upcoming' },
        { id: 'a2', date: '2024-02-15', time: '2:00 PM', type: 'Check-up', vet: 'Dr. Johnson', status: 'completed' },
        { id: 'a3', date: '2024-01-10', time: '11:15 AM', type: 'Deworming', vet: 'Dr. Smith', status: 'completed' },
      ]
    },
    {
      id: '2',
      name: 'Luna',
      type: 'Cat',
      breed: 'Persian',
      age: '2 years',
      weight: '4 kg',
      gender: 'Female',
      profileImage: null,
      medicalRecords: [
        { id: 'r4', date: '2024-02-01', type: 'Vaccination', description: 'FVRCP Vaccine', vet: 'Dr. Wilson', notes: 'First dose' },
        { id: 'r5', date: '2023-12-20', type: 'Check-up', description: 'Annual Check-up', vet: 'Dr. Wilson', notes: 'Healthy weight' },
      ],
      appointments: [
        { id: 'a4', date: '2024-03-25', time: '9:00 AM', type: 'Vaccination', vet: 'Dr. Wilson', status: 'upcoming' },
        { id: 'a5', date: '2024-02-01', time: '10:00 AM', type: 'Vaccination', vet: 'Dr. Wilson', status: 'completed' },
      ]
    }
  ]);

  // New pet form state
  const [newPet, setNewPet] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'Male',
  });

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

  const addNewPet = () => {
    if (newPet.name && newPet.breed) {
      const pet = {
        id: Date.now().toString(),
        ...newPet,
        profileImage: null,
        medicalRecords: [],
        appointments: []
      };
      setPets([...pets, pet]);
      setModalVisible(false);
      setNewPet({ name: '', type: 'Dog', breed: '', age: '', weight: '', gender: 'Male' });
    }
  };

  const PetProfileCard = ({ pet, onPress }) => (
    <TouchableOpacity 
      style={{
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
      }}

      onPress={() => {
        setSelectedPet(pet);
        setActiveTab('profile');
      }}
    >
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3d67ee20',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#3d67ee',
        marginRight: 15,
      }}>
        <Ionicons name={pet.type === 'Dog' ? 'paw' : 'happy'} size={30} color="#3d67ee" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{pet.name}</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>{pet.breed} • {pet.age}</Text>
        <Text style={{ fontSize: 12, color: '#3d67ee', marginTop: 5 }}>
          {pet.medicalRecords.length} medical records • {pet.appointments.length} appointments
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#3d67ee" />
    </TouchableOpacity>
  );

  const MedicalRecordCard = ({ record }) => (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3d67ee' }}>{record.type}</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>{record.date}</Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>{record.description}</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 3 }}>Vet: {record.vet}</Text>
      {record.notes && <Text style={{ fontSize: 12, color: '#888' }}>Notes: {record.notes}</Text>}
    </View>
  );

  const AppointmentCard = ({ appointment }) => (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: appointment.status === 'upcoming' ? '#3d67ee' : '#e0e0e0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3d67ee' }}>{appointment.type}</Text>
        <View style={{
          backgroundColor: appointment.status === 'upcoming' ? '#3d67ee20' : '#e0e0e0',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 12,
        }}>
          <Text style={{ fontSize: 10, color: appointment.status === 'upcoming' ? '#3d67ee' : '#666' }}>
            {appointment.status}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>
        {appointment.date} at {appointment.time}
      </Text>
      <Text style={{ fontSize: 14, color: '#666' }}>Vet: {appointment.vet}</Text>
    </View>
  );

  return (
    <View style={{backgroundColor: '#fff', height: '100%', padding: 10}}>
      {/* Navigation Bar (same as before) */}
      <View style={{ zIndex: 1000 }}>
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
                    <Image source={user.profileImage} style={{width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#3d67ee'}} />
                  ) : (
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#3d67ee20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3d67ee' }}>
                      <Text style={{color: '#3d67ee', fontWeight: 'bold', fontSize: 14}}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                  )}
                  <View style={{flexDirection: 'column', marginRight: 5}}>
                    <Text style={[userStyle.smallText, {fontSize: 14}]}>{user.name}</Text>
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

            {dropdownVisible && isLoggedIn && (
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
            <View style={[userStyle.navSections, { flexDirection: 'row', alignItems: 'center', gap: 60, width: '70%'}]}>
              <TouchableOpacity onPress={()=>{ns.navigate('UserHome')}}><Text style={userStyle.navText}>Home</Text></TouchableOpacity>
              <TouchableOpacity><Text style={userStyle.navText}>About Us</Text></TouchableOpacity>
              <TouchableOpacity><Text style={userStyle.navText}>Our Services</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>{ns.navigate('UserAppointment')}}><Text style={userStyle.navText}>Book an Appointment</Text></TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={()=>{ns.navigate('UserPets')}}>
              <View style={userStyle.navSections}><Ionicons name="paw" size={21} color="#3d67ee" style={{ marginTop: 3 }} /></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{ns.navigate('UserAppointmentView')}}>
              <View style={userStyle.navSections}><Ionicons name="calendar-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} /></View>
            </TouchableOpacity>
            <TouchableOpacity>
              <View style={userStyle.navSections}><Ionicons name="notifications-outline" size={21} color="#3d67ee" style={{ marginTop: 3 }} /></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>My Pets</Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#3d67ee',
              paddingHorizontal: 15,
              paddingVertical: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600' }}>Add Pet</Text>
          </TouchableOpacity>
        </View>

        {selectedPet ? (
          // Pet Detail View
          <View>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
              onPress={() => setSelectedPet(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#3d67ee" />
              <Text style={{ color: '#3d67ee', fontSize: 16, marginLeft: 5 }}>Back to Pets</Text>
            </TouchableOpacity>

            {/* Pet Header */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: '#3d67ee20',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#3d67ee',
                marginBottom: 10,
              }}>
                <Ionicons name={selectedPet.type === 'Dog' ? 'paw' : 'happy'} size={50} color="#3d67ee" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{selectedPet.name}</Text>
              <Text style={{ fontSize: 16, color: '#666' }}>{selectedPet.breed}</Text>
            </View>

            {/* Tab Navigation */}
            <View style={{ flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: activeTab === 'profile' ? 2 : 0, borderBottomColor: '#3d67ee' }}
                onPress={() => setActiveTab('profile')}
              >
                <Text style={{ color: activeTab === 'profile' ? '#3d67ee' : '#666', fontWeight: activeTab === 'profile' ? '600' : '400' }}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: activeTab === 'records' ? 2 : 0, borderBottomColor: '#3d67ee' }}
                onPress={() => setActiveTab('records')}
              >
                <Text style={{ color: activeTab === 'records' ? '#3d67ee' : '#666', fontWeight: activeTab === 'records' ? '600' : '400' }}>Medical Records</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: activeTab === 'appointments' ? 2 : 0, borderBottomColor: '#3d67ee' }}
                onPress={() => setActiveTab('appointments')}
              >
                <Text style={{ color: activeTab === 'appointments' ? '#3d67ee' : '#666', fontWeight: activeTab === 'appointments' ? '600' : '400' }}>Appointments</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <View style={{ backgroundColor: '#f8f9fa', borderRadius: 10, padding: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>Type:</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{selectedPet.type}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>Breed:</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{selectedPet.breed}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>Age:</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{selectedPet.age}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>Weight:</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{selectedPet.weight}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>Gender:</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{selectedPet.gender}</Text>
                </View>
              </View>
            )}

            {activeTab === 'records' && (
              <View>
                {selectedPet.medicalRecords.map(record => (
                  <MedicalRecordCard key={record.id} record={record} />
                ))}
              </View>
            )}

            {activeTab === 'appointments' && (
              <View>
                {selectedPet.appointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </View>
            )}
          </View>
        ) : (
          // Pet List View
          <View>
            {pets.map(pet => (
              <PetProfileCard key={pet.id} pet={pet} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Pet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Add New Pet</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Pet Name *</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 10, marginBottom: 15 }}
                placeholder="Enter pet name"
                value={newPet.name}
                onChangeText={(text) => setNewPet({...newPet, name: text})}
              />

              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Pet Type</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    padding: 10, 
                    borderRadius: 10, 
                    borderWidth: 1, 
                    borderColor: newPet.type === 'Dog' ? '#3d67ee' : '#e0e0e0',
                    backgroundColor: newPet.type === 'Dog' ? '#3d67ee20' : '#fff',
                    alignItems: 'center'
                  }}
                  onPress={() => setNewPet({...newPet, type: 'Dog'})}
                >
                  <Ionicons name="paw" size={20} color={newPet.type === 'Dog' ? '#3d67ee' : '#666'} />
                  <Text style={{ color: newPet.type === 'Dog' ? '#3d67ee' : '#666' }}>Dog</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    padding: 10, 
                    borderRadius: 10, 
                    borderWidth: 1, 
                    borderColor: newPet.type === 'Cat' ? '#3d67ee' : '#e0e0e0',
                    backgroundColor: newPet.type === 'Cat' ? '#3d67ee20' : '#fff',
                    alignItems: 'center'
                  }}
                  onPress={() => setNewPet({...newPet, type: 'Cat'})}
                >
                  <Ionicons name="happy" size={20} color={newPet.type === 'Cat' ? '#3d67ee' : '#666'} />
                  <Text style={{ color: newPet.type === 'Cat' ? '#3d67ee' : '#666' }}>Cat</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Breed *</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 10, marginBottom: 15 }}
                placeholder="Enter breed"
                value={newPet.breed}
                onChangeText={(text) => setNewPet({...newPet, breed: text})}
              />

              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Age</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 10, marginBottom: 15 }}
                placeholder="e.g., 3 years"
                value={newPet.age}
                onChangeText={(text) => setNewPet({...newPet, age: text})}
              />

              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Weight</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 10, marginBottom: 15 }}
                placeholder="e.g., 30 kg"
                value={newPet.weight}
                onChangeText={(text) => setNewPet({...newPet, weight: text})}
              />

              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Gender</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    padding: 10, 
                    borderRadius: 10, 
                    borderWidth: 1, 
                    borderColor: newPet.gender === 'Male' ? '#3d67ee' : '#e0e0e0',
                    backgroundColor: newPet.gender === 'Male' ? '#3d67ee20' : '#fff',
                    alignItems: 'center'
                  }}
                  onPress={() => setNewPet({...newPet, gender: 'Male'})}
                >
                  <Ionicons name="male" size={20} color={newPet.gender === 'Male' ? '#3d67ee' : '#666'} />
                  <Text style={{ color: newPet.gender === 'Male' ? '#3d67ee' : '#666' }}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    padding: 10, 
                    borderRadius: 10, 
                    borderWidth: 1, 
                    borderColor: newPet.gender === 'Female' ? '#3d67ee' : '#e0e0e0',
                    backgroundColor: newPet.gender === 'Female' ? '#3d67ee20' : '#fff',
                    alignItems: 'center'
                  }}
                  onPress={() => setNewPet({...newPet, gender: 'Female'})}
                >
                  <Ionicons name="female" size={20} color={newPet.gender === 'Female' ? '#3d67ee' : '#666'} />
                  <Text style={{ color: newPet.gender === 'Female' ? '#3d67ee' : '#666' }}>Female</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={{ 
                  backgroundColor: '#3d67ee', 
                  padding: 15, 
                  borderRadius: 10, 
                  alignItems: 'center',
                  opacity: (newPet.name && newPet.breed) ? 1 : 0.5
                }}
                onPress={addNewPet}
                disabled={!newPet.name || !newPet.breed}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add Pet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}