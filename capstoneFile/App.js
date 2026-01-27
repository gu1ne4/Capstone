import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import homePage from './mainComponents/homePage';
import loginPage from './mainComponents/loginPage';
import createAccount from './userComponents/createAccount';
import editAccount from './userComponents/editAccount';
import userDashboard from './userComponents/userDashboard';

import styles from './styles/StyleSheet';


export default function App() {
  return (
    <View style={styles.container}>
      <Text>Capstone File</Text>
    </View>
  );
}


