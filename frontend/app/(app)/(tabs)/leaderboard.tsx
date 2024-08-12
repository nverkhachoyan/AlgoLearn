import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View, ScrollView } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import { Seperator } from "@/components/common/Seperator";
import React from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";
import { StickyHeader } from "@/components/common/StickyHeader";

export default function Leaderboard() {
  const {
    isAuthed,
    user: { data: user },
  } = useAuthContext();
  const { colors } = useTheme();

  const leaderboardItems = [
    {
      id: 1,
      name: "Alice Johnson",
      score: 1200,
    },
    {
      id: 2,
      name: "Bob Smith",
      score: 1150,
    },
    {
      id: 3,
      name: "Charlie Brown",
      score: 1100,
    },
    {
      id: 4,
      name: "David Williams",
      score: 1050,
    },
    {
      id: 5,
      name: "Eva Green",
      score: 1000,
    },
  ];

  if (!isAuthed || !user) {
    return <Text style={styles.notLoggedInText}>Not logged in</Text>;
  }

  return (
    <View style={styles.container}>
      <StickyHeader
        cpus={user.cpus}
        strikeCount={user.streaks?.length ?? 0}
        userAvatar={null}
        onAvatarPress={() => {
          router.push("/profile");
        }}
      />

      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.innerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Leaderboard
          </Text>
          <Seperator />
          <View style={styles.separator} />
          <View style={styles.leaderboardContainer}>
            {leaderboardItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.leaderboardItem,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text style={styles.leaderboardPosition}>{index + 1}</Text>
                <View style={styles.leaderboardItemContent}>
                  <Text style={styles.leaderboardItemName}>{item.name}</Text>
                  <Text style={styles.leaderboardItemScore}>
                    {item.score} points
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  innerContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 18,
  },
  notLoggedInText: {
    fontSize: 18,
  },
  separator: {
    height: 1,
    width: "80%",
  },
  leaderboardContainer: {
    width: "100%",
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  leaderboardPosition: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
    width: 30,
    textAlign: "center",
  },
  leaderboardItemContent: {
    flex: 1,
  },
  leaderboardItemName: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "OpenSauceOne-SemiBold",
    marginBottom: 5,
  },
  leaderboardItemScore: {
    fontSize: 16,
    fontFamily: "OpenSauceOne-Regular",
    color: "#888",
  },
});
