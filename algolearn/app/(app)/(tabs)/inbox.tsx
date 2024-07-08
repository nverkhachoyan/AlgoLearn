import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import Button from '@/components/common/Button';
import { useAuthContext } from '@/context/auth';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Seperator } from '@/components/common/Seperator';
import { AuthContextType } from '@/types/authTypes';

export default function inbox() {
  const { user, isAuthed, loading, handleSignOut } = useAuthContext();
  const colorScheme = useColorScheme();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!isAuthed || !user) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbox</Text>
      <Seperator />
      <Text>Email: {user.email}</Text>
      <Text>CPUS: {user.cpus}</Text>

      <Button
        title='Log Out'
        onPress={() => {
          handleSignOut();
        }}
        style={{
          backgroundColor: Colors[colorScheme ?? 'light'].buttonBackground,
          borderColor: Colors[colorScheme ?? 'light'].border,
          borderWidth: 1,
        }}
        textStyle={{ color: Colors[colorScheme ?? 'light'].buttonText }}
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
