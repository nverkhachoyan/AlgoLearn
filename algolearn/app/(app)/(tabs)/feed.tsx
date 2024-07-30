import { StyleSheet } from 'react-native';
import { Text, View, ScrollView } from '@/components/Themed';
import Button from '@/components/common/Button';
import { useAuthContext } from '@/context/AuthProvider';
import { Seperator } from '@/components/common/Seperator';
import React, { useEffect } from 'react';
import moment from 'moment';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import useTheme from '@/hooks/useTheme';

export default function Feed() {
  const { user, isAuthed, loading } = useAuthContext();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading && !isAuthed && !user) {
      router.navigate('/welcome');
    }
  }, [loading, isAuthed, user]);

  const feedItems = [
    {
      id: 1,
      type: 'course',
      title: 'New Course: Advanced JavaScript',
      description: 'Dive deep into advanced JavaScript topics.',
      date: '2024-07-25',
    },
    {
      id: 2,
      type: 'poll',
      title: 'Poll: Your Favorite Programming Language',
      description: 'Vote for your favorite programming language.',
      date: '2024-07-24',
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Achievement: Completed JavaScript Basics',
      description:
        'Congratulations on completing the JavaScript Basics course!',
      date: '2024-07-23',
    },
  ];

  const renderFeedItemIcon = (type: any) => {
    switch (type) {
      case 'course':
        return <Feather name='book' size={24} color={colors.text} />;
      case 'poll':
        return <MaterialIcons name='poll' size={24} color={colors.text} />;
      case 'achievement':
        return <Feather name='award' size={24} color={colors.text} />;
      default:
        return null;
    }
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (!isAuthed || !user) {
    return <Text style={styles.notLoggedInText}>Not logged in</Text>;
  }

  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Feed</Text>
        <Seperator />
        <View style={styles.separator} />
        <View style={styles.feedContainer}>
          {feedItems.map((item) => (
            <View
              key={item.id}
              style={[
                styles.feedItem,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.feedItemIcon}>
                {renderFeedItemIcon(item.type)}
              </View>
              <View style={styles.feedItemContent}>
                <Text style={styles.feedItemTitle}>{item.title}</Text>
                <Text style={styles.feedItemDescription}>
                  {item.description}
                </Text>
                <Text style={styles.feedItemDate}>
                  {moment(item.date).format('MMMM Do YYYY')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          title='Go to Account'
          onPress={() => {
            router.push('/profile');
          }}
          style={{
            backgroundColor: colors.buttonBackground,
            borderColor: colors.border,
            borderWidth: 1,
            marginBottom: 10,
          }}
          textStyle={{ color: colors.buttonText }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: Colors.light.text,
  },
  loadingText: {
    fontSize: 18,
    // color: Colors.light.text,
  },
  notLoggedInText: {
    fontSize: 18,
    // color: Colors.light.dangerBgColor,
  },
  separator: {
    height: 1,
    width: '80%',
  },
  feedContainer: {
    width: '100%',
    marginBottom: 20,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  feedItemIcon: {
    marginRight: 10,
  },
  feedItemContent: {
    flex: 1,
  },
  feedItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'OpenSauceOne-SemiBold',
    marginBottom: 5,
  },
  feedItemDescription: {
    fontSize: 16,
    fontFamily: 'OpenSauceOne-Regular',

    marginBottom: 5,
  },
  feedItemDate: {
    fontSize: 14,
    fontFamily: 'OpenSauceOne-Regular',
    color: '#888',
  },
  button: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
});
