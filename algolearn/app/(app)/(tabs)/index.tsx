import { Platform, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { View } from '@/components/Themed';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text } from '@/components/Themed';
import { StatusBar } from 'expo-status-bar';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Index</Text>
      <View
        style={styles.separator}
        lightColor='#eee'
        darkColor='rgba(255,255,255,0.1)'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
