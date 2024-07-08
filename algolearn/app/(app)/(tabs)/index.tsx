import { Platform, StyleSheet } from 'react-native';
import { View, ScrollView, Text } from '@/components/Themed';
import StickyHeader from '@/components/StickyHeader';

export default function TabOneScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      stickyHeaderIndices={[0]}
    >
      <StickyHeader cpus={0} strikeCount={0} userAvatar={null} />

      <Text style={styles.title}>Index</Text>
      <View
        style={styles.separator}
        lightColor='#eee'
        darkColor='rgba(255,255,255,0.1)'
      />
      {/* Add other content here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
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
