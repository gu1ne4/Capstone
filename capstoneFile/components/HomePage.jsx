import { View, Text, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import homeStyle from '../styles/HomeStyle'

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  return (
    <View style={homeStyle.biContainer}>
      <View style={homeStyle.navbarContainer}>
          <LinearGradient colors={['#7C9AFF', '#3d67ee', '#0738D9', '#041E76']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}  style={homeStyle.navBody}>
          <Text style={homeStyle.brandFont}>Agsikap</Text>
        </LinearGradient>
      </View>

      <View style={homeStyle.bodyContainer}>
        <View style={homeStyle.topContainer}>
          <Ionicons name="people-outline" size={25} color="#3d67ee" style={{ marginTop: 3 }} />
          <Text style={[homeStyle.blueText, { marginLeft: 10 }]}>User List</Text>
        </View>

        <View style={homeStyle.tableContainer}>
          <View style={homeStyle.tableLayer1}>
            <View style={homeStyle.subTable1}>
              <TouchableOpacity><Ionicons name="search-sharp" size={25} color="#3d67ee" style={{ marginTop: 3 }} /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="filter-sharp" size={25} color="#3d67ee" style={{ marginTop: 3 }} /></TouchableOpacity>
            </View>

            <View style={[homeStyle.subTable2, {justifyContent: 'flex-end',}]}>
              <TouchableOpacity style={homeStyle.blackBtn}>
              <Text style={{color: '#ffffff', fontWeight: '600'}}><Ionicons name="person-add"color="#ffffff" style={{ marginTop: 3 }} /> Add Account</Text>
            </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </View>
  )
}
