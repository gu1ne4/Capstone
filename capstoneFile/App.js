import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import styles from './styles/StyleSheet';
import HomePage from './components/HomePage';
import LoginPage from './components/loginPage';

export default function App() {

  const CScreen = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <CScreen.Navigator>
        <CScreen.Screen name="Login" component={LoginPage} options={{headerShown: false}} />
        <CScreen.Screen name="Home" component={HomePage} options={{headerShown: false}} />
      </CScreen.Navigator>
    </NavigationContainer>
  );
}

