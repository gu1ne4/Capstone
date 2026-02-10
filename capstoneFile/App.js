import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import styles from './styles/StyleSheet';
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
import UpdateAccPage from './components/UpdateAccPage';
import ForgetPassPage from './components/ForgetPassPage';

import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';



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
    <PaperProvider theme={theme}  >
      <NavigationContainer>
      <CScreen.Navigator initialRouteName='Home'>
        <CScreen.Screen name="Home" component={DashboardPage} options={{headerShown: false}} />
        <CScreen.Screen name="Login" component={LoginPage} options={{headerShown: false}} />
        <CScreen.Screen name="Accounts" component={HomePage}  options={{headerShown: false}} />
        <CScreen.Screen name="UserAccounts" component={UserAccPage}  options={{headerShown: false}} />
        <CScreen.Screen name="Settings" component={SettingsPage}  options={{headerShown: false}} />
        <CScreen.Screen name="Audit" component={AuditPage}  options={{headerShown: false}} />
        <CScreen.Screen name="UserHome" component={UserHome}  options={{headerShown: false}} />
        <CScreen.Screen name="Registration" component={RegistrationPage}  options={{headerShown: false}} />
        <CScreen.Screen name="ChangeCreds" component={ChangeCreds}  options={{headerShown: false}} />
        <CScreen.Screen name="ChangePassOTP" component={ChangePassOTP}  options={{headerShown: false}} />
        <CScreen.Screen name="ChangePass" component={ChangePass}  options={{headerShown: false}} />
        <CScreen.Screen name="AvailSettings" component={AvailSettings}  options={{headerShown: false}} />
        <CScreen.Screen name="Schedule" component={Schedule}  options={{headerShown: false}} />
        <CScreen.Screen name="History" component={History}  options={{headerShown: false}} />
        <CScreen.Screen name="UpdateAcc" component={UpdateAccPage} options={{headerShown: false}} />
        <CScreen.Screen name="ForgetPass" component={ForgetPassPage} options={{ headerShown: false }} />
        

      </CScreen.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
}

