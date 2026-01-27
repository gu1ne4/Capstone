import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import styles from './styles/StyleSheet';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Capstone File</Text>
      <StatusBar style="auto" />
    </View>
  );
}


