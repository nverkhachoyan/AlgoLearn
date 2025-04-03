import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useCallback } from 'react';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StickyHeader } from '@/src/components/StickyHeader';
import { useUser } from '@/src/features/user/hooks/useUser';
import { ContentBackground, HeaderAndTabs, USER_PROFILE_GRADIENTS } from '@/constants/Colors';
import { useAuth } from '@/src/features/auth/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Surface, Divider } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';

export default function Leaderboard() {
  const { user } = useUser();
  const { isAuthed } = useAuth();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const dark = theme.dark;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values for each leaderboard item
  const itemAnimations = useRef(
    Array(5)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  useFocusEffect(
    useCallback(() => {
      // Reset animations when screen comes into focus
      itemAnimations.forEach(anim => {
        anim.setValue(0);
      });

      // Animate items in sequence
      itemAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }, [])
  );

  const getGradientForRank = (rank: number): [string, string, string] => {
    switch (rank) {
      case 0: // 1st place
        return dark
          ? [
              USER_PROFILE_GRADIENTS.amber.dark[0],
              USER_PROFILE_GRADIENTS.amber.dark[1],
              USER_PROFILE_GRADIENTS.amber.dark[2],
            ]
          : [
              USER_PROFILE_GRADIENTS.amber.light[0],
              USER_PROFILE_GRADIENTS.amber.light[1],
              USER_PROFILE_GRADIENTS.amber.light[2],
            ];
      case 1: // 2nd place
        return dark
          ? [
              USER_PROFILE_GRADIENTS.ocean.dark[0],
              USER_PROFILE_GRADIENTS.ocean.dark[1],
              USER_PROFILE_GRADIENTS.ocean.dark[2],
            ]
          : [
              USER_PROFILE_GRADIENTS.ocean.light[0],
              USER_PROFILE_GRADIENTS.ocean.light[1],
              USER_PROFILE_GRADIENTS.ocean.light[2],
            ];
      case 2: // 3rd place
        return dark
          ? [
              USER_PROFILE_GRADIENTS.sunset.dark[0],
              USER_PROFILE_GRADIENTS.sunset.dark[1],
              USER_PROFILE_GRADIENTS.sunset.dark[2],
            ]
          : [
              USER_PROFILE_GRADIENTS.sunset.light[0],
              USER_PROFILE_GRADIENTS.sunset.light[1],
              USER_PROFILE_GRADIENTS.sunset.light[2],
            ];
      default:
        return dark ? ['#333', '#333', '#333'] : ['#333', '#333', '#333'];
    }
  };

  const leaderboardItems = [
    {
      id: 1,
      name: 'Alice Johnson',
      score: 1200,
      rank: 'Quantum Circuit',
      icon: 'memory',
    },
    {
      id: 2,
      name: 'Bob Smith',
      score: 1150,
      rank: 'Memory Circuit',
      icon: 'data-usage',
    },
    {
      id: 3,
      name: 'Charlie Brown',
      score: 1100,
      rank: 'Compiler Circuit',
      icon: 'code',
    },
    {
      id: 4,
      name: 'David Williams',
      score: 1050,
      rank: 'Logic Circuit',
      icon: 'build',
    },
    {
      id: 5,
      name: 'Eva Green',
      score: 1000,
      rank: 'Data Circuit',
      icon: 'storage',
    },
  ];

  const headerGradients = dark ? HeaderAndTabs.dark : HeaderAndTabs.light;

  if (!isAuthed || !user) {
    return <Text style={styles.notLoggedInText}>Not logged in</Text>;
  }

  const renderPodium = () => {
    const top3 = leaderboardItems.slice(0, 3);

    return (
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        <View style={styles.podiumPlace}>
          <View style={styles.avatarContainer}>
            <Surface style={[{ borderColor: colors.secondary, elevation: 4 }]}>
              <LinearGradient colors={getGradientForRank(1)} style={styles.avatarGradient}>
                <MaterialIcons name={top3[1].icon as any} size={28} color="#fff" />
              </LinearGradient>
            </Surface>
          </View>

          <View
            style={[
              styles.podiumPillar,
              styles.secondPlace,
              { backgroundColor: colors.secondaryContainer },
            ]}
          >
            <Text style={styles.podiumPosition}>2</Text>
          </View>
          <Text style={[styles.podiumName, { color: colors.onSurface }]} numberOfLines={1}>
            {top3[1].name}
          </Text>
          <Text style={[styles.podiumScore, { color: colors.secondary }]}>
            {top3[1].score} CPUs
          </Text>
        </View>

        {/* First Place */}
        <View style={styles.podiumPlace}>
          <Surface
            style={[
              styles.avatarContainer,
              styles.firstPlaceAvatar,
              { borderColor: '#FFD700', elevation: 8 },
            ]}
          >
            <LinearGradient colors={getGradientForRank(0)} style={styles.avatarGradient}>
              <MaterialIcons name={top3[0].icon as any} size={36} color="#fff" />
            </LinearGradient>
          </Surface>
          <View
            style={[
              styles.podiumPillar,
              styles.firstPlace,
              { backgroundColor: colors.primaryContainer },
            ]}
          >
            <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
          </View>
          <Text
            style={[styles.podiumName, styles.firstPlaceName, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {top3[0].name}
          </Text>
          <Text style={[styles.podiumScore, { color: colors.primary }]}>{top3[0].score} CPUs</Text>
        </View>

        {/* Third Place */}
        <View style={styles.podiumPlace}>
          <Surface style={[styles.avatarContainer, { borderColor: colors.tertiary, elevation: 4 }]}>
            <LinearGradient colors={getGradientForRank(2)} style={styles.avatarGradient}>
              <MaterialIcons name={top3[2].icon as any} size={28} color="#fff" />
            </LinearGradient>
          </Surface>
          <View
            style={[
              styles.podiumPillar,
              styles.thirdPlace,
              { backgroundColor: colors.tertiaryContainer },
            ]}
          >
            <Text style={styles.podiumPosition}>3</Text>
          </View>
          <Text style={[styles.podiumName, { color: colors.onSurface }]} numberOfLines={1}>
            {top3[2].name}
          </Text>
          <Text style={[styles.podiumScore, { color: colors.tertiary }]}>{top3[2].score} CPUs</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StickyHeader
        cpus={user.cpus}
        streak={user.streak || 0}
        onAvatarPress={() => router.push('/(protected)/(profile)')}
      />
      <Animated.ScrollView
        style={{
          flex: 1,
          backgroundColor: ContentBackground[dark ? 'dark' : 'light'],
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        <View style={styles.innerContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Circuit Rankings</Text>
          <Divider style={{ marginVertical: 20 }} />

          {/* Podium Section */}
          {renderPodium()}

          <Text style={[styles.subtitle, { color: colors.secondary }]}>Other Competitors</Text>

          <View style={styles.leaderboardContainer}>
            {leaderboardItems.slice(3).map((item, index) => {
              const actualIndex = index + 3; // Start from 4th place

              return (
                <Animated.View
                  key={item.id}
                  style={[
                    {
                      opacity: itemAnimations[actualIndex],
                      transform: [
                        {
                          translateX: itemAnimations[actualIndex].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Pressable>
                    {({ pressed }) => (
                      <Surface
                        style={[
                          styles.leaderboardItem,
                          {
                            backgroundColor: pressed ? colors.surfaceVariant : colors.surface,
                            borderColor: colors.outline,
                            elevation: pressed ? 1 : 3,
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={getGradientForRank(actualIndex)}
                          style={styles.rankBadge}
                        >
                          <Text style={styles.leaderboardPosition}>{actualIndex + 1}</Text>
                        </LinearGradient>

                        <View style={styles.leaderboardItemContent}>
                          <Text style={[styles.leaderboardItemName, { color: colors.onSurface }]}>
                            {item.name}
                          </Text>
                          <Text style={[styles.leaderboardItemScore, { color: colors.secondary }]}>
                            {item.score} CPUs
                          </Text>
                          <Text style={[styles.leaderboardItemRank, { color: '#25A879' }]}>
                            {item.rank}
                          </Text>
                        </View>

                        <View style={styles.iconContainer}>
                          <MaterialIcons
                            name={item.icon as any}
                            size={28}
                            color={colors.tertiary}
                          />
                        </View>
                      </Surface>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSauceOne-Regular',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  notLoggedInText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },

  // Podium styles
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 25,
    marginBottom: 10,
    height: 200,
  },
  podiumPlace: {
    alignItems: 'center',
    marginHorizontal: 5,
    width: 100,
  },
  podiumPillar: {
    width: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstPlace: {
    height: 100,
    zIndex: 3,
  },
  secondPlace: {
    height: 80,
    zIndex: 2,
  },
  thirdPlace: {
    height: 60,
    zIndex: 1,
  },
  podiumPosition: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    width: 90,
  },
  firstPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  podiumScore: {
    fontSize: 12,
    marginTop: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  firstPlaceAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Leaderboard list styles
  leaderboardContainer: {
    width: '100%',
    marginTop: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  leaderboardPosition: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaderboardItemContent: {
    flex: 1,
  },
  leaderboardItemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaderboardItemScore: {
    fontSize: 15,
    marginTop: 2,
  },
  leaderboardItemRank: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
});
