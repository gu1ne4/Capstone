import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import SettingsPage from './components/SettingsPage';
import AuditPage from './components/AuditPage';
import UserAccPage from './components/UserAccPage';
import UserHome from './userComponents/UserHome';
import RegistrationPage from './userComponents/RegistrationPage';
import ChangeCreds from './components/ChangeCreds';
import ChangePassOTP from './components/ChangePassOTP';
import ChangePass from './components/ChangePass';
import AvailSettings from './AppointmentModule/AvailSettings';
import Schedule from './AppointmentModule/Schedule';
import History from './AppointmentModule/History';

// --- ROLE-BASED INTERFACES ---
import EmpAccessHomepage from './components/EmployeeInterface/EmpAccessHomepage';
import UserHomePage from './components/UserInterface/UserHomePage';
import UpdateAccPage from './components/UpdateAccPage';
import ForgetPassPage from './components/ForgetPassPage';
import doctorHome from './components/DoctorInterface/doctorHome';
import DoctorSchedule from './components/DoctorInterface/DoctorSchedule';
import DoctorAvailability from './components/DoctorInterface/DoctorAvailability';
import DoctorHistory from './components/DoctorInterface/DoctorHistory';
import UserAppointment from './userComponents/UserAppointment';
import UserAppointmentView from './userComponents/UserAppointmentView';
import UserPetProfile from './userComponents/UserPetProfile';

export default function App() {
  const CScreen = createNativeStackNavigator();

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      text: '#000000',    
      primary: '#000000', 
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>

        <CScreen.Navigator initialRouteName='UserAppointmentView'>
          <CScreen.Screen name="Home" component={DashboardPage} options={{headerShown: false}} />
          <CScreen.Screen name="Login" component={LoginPage} options={{headerShown: false}} />
          <CScreen.Screen name="Accounts" component={HomePage} options={{headerShown: false}} />
          <CScreen.Screen name="UserAccounts" component={UserAccPage} options={{headerShown: false}} />
          <CScreen.Screen name="Settings" component={SettingsPage} options={{headerShown: false}} />
          <CScreen.Screen name="Audit" component={AuditPage} options={{headerShown: false}} />
          
          <CScreen.Screen name="Registration" component={RegistrationPage} options={{headerShown: false}} />
          <CScreen.Screen name="ChangeCreds" component={ChangeCreds} options={{headerShown: false}} />
          <CScreen.Screen name="ChangePassOTP" component={ChangePassOTP} options={{headerShown: false}} />
          <CScreen.Screen name="ChangePass" component={ChangePass} options={{headerShown: false}} />
          
          {/* Appointment Module Screens */}
          <CScreen.Screen name="AvailSettings" component={AvailSettings} options={{headerShown: false}} />
          <CScreen.Screen name="Schedule" component={Schedule} options={{headerShown: false}} />
          <CScreen.Screen name="History" component={History} options={{headerShown: false}} />
          
          <CScreen.Screen name="UpdateAcc" component={UpdateAccPage} options={{headerShown: false}} />
          <CScreen.Screen name="EmpAccessHomepage" component={EmpAccessHomepage} options={{headerShown: false}} />
          <CScreen.Screen name="UserHomePage" component={UserHomePage} options={{headerShown: false}} />
 
        <CScreen.Screen name="ForgetPass" component={ForgetPassPage} options={{ headerShown: false }} />

        {/* Doctor Screens */}
        <CScreen.Screen name="DoctorHomePage" component={doctorHome} options={{headerShown: false}} />
        <CScreen.Screen name="DoctorSchedule" component={DoctorSchedule} options={{headerShown: false}} />
        <CScreen.Screen name="DoctorHistory" component={DoctorHistory} options={{headerShown: false}} />
        <CScreen.Screen name="DoctorAvailability" component={DoctorAvailability} options={{headerShown: false}} />

        {/* User Screens */}
        <CScreen.Screen name="UserAppointment" component={UserAppointment} options={{headerShown: false}} />
        <CScreen.Screen name="UserHome" component={UserHome} options={{headerShown: false}} />
        <CScreen.Screen name="UserAppointmentView" component={UserAppointmentView} options={{headerShown: false}} />
        <CScreen.Screen name="UserPetProfile" component={UserPetProfile} options={{headerShown: false}} />
        

        </CScreen.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}