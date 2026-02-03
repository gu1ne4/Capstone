import { View, Text, TouchableOpacity, Image, TextInput} from 'react-native'
import styles from '../styles/StyleSheet'
import { useNavigation } from '@react-navigation/native'

export default function LoginPage() {

  const navigation = useNavigation();

  return (
    <View style={styles.loginContainer}>

      <View style={styles.gifContainer}>
        <Image source={require('../assets/AgsikapBG-Gif.gif')} style={{width: '100%', height: '100%'}} />
        
          <View style={styles.gifOverlay}>
            <Image source={require('../assets/AgsikapLogo-Temp.png')} style={{width: '18%', height: '18%', right: 15, marginTop: 40}} resizeMode="contain"/>
            
            <View style={{marginTop: 50}}>
              <Text style={styles.whiteFont}>Hello,</Text>
              <Text style={[styles.whiteFont, {fontStyle: "italic", fontWeight: '600'}]}>welcome!</Text>
              <Text style={[styles.whiteFont, {fontSize: 18, lineHeight: 25, marginTop: 60, paddingRight: 30}]}>Lorem ipsum dolor sit amesdasast, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </Text>
            </View>
        </View>

      </View>

      <View style={styles.loginSection}>

        <Text style={styles.agsikapTitle}>Agsikap</Text>
        <Text style={styles.loginHeader}>Log in to your Account</Text>
        <Text style={styles.loginSubtext}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        </Text>

        <View style={styles.inputGroup}>
          <TextInput style={[styles.inputField, {paddingHorizontal: 10}]} placeholder="Username" placeholderTextColor="#999" />
        </View>

        <View style={[styles.inputGroup, {marginBottom: 15}]}>
          <TextInput style={[styles.inputField, {paddingHorizontal: 10}]} placeholder="Password" placeholderTextColor="#999" secureTextEntry />
        </View>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity>
            <Text style={[styles.forgotPassword, {fontStyle: "italic"}]}>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={()=>{navigation.replace("Accounts")}}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}