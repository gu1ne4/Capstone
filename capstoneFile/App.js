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
      <CScreen.Navigator>
        <CScreen.Screen name="Login" component={LoginPage} options={{headerShown: false}} />
        <CScreen.Screen name="Home" component={DashboardPage} options={{headerShown: false}} />
        
        <CScreen.Screen name="Accounts" component={HomePage}  options={{headerShown: false}} />
        <CScreen.Screen name="UserAccounts" component={UserAccPage}  options={{headerShown: false}} />
        <CScreen.Screen name="Settings" component={SettingsPage}  options={{headerShown: false}} />
        <CScreen.Screen name="Audit" component={AuditPage}  options={{headerShown: false}} />
      </CScreen.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
}

