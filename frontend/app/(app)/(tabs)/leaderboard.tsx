import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View, ScrollView } from "@/src/components/Themed";
import { useAuthContext } from "@/src/context/AuthProvider";
import { Seperator } from "@/src/components/common/Seperator";
import React from "react";
import { router } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import useTheme from "@/src/hooks/useTheme";
import { StickyHeader } from "@/src/components/common/StickyHeader";

export default function Leaderboard() {
  const {
    isAuthed,
    user: { data: user },
  } = useAuthContext();
  const { colors } = useTheme();

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const leaderboardItems = [
    {
      id: 1,
      name: "Alice Johnson",
      score: 1200,
      rank: "Quantum Circuit", // New: Circuit Level
      icon: "memory", // New: Icon for Circuit Level
    },
    {
      id: 2,
      name: "Bob Smith",
      score: 1150,
      rank: "Memory Circuit",
      icon: "data-usage",
    },
    {
      id: 3,
      name: "Charlie Brown",
      score: 1100,
      rank: "Compiler Circuit",
      icon: "code",
    },
    {
      id: 4,
      name: "David Williams",
      score: 1050,
      rank: "Logic Circuit",
      icon: "build",
    },
    {
      id: 5,
      name: "Eva Green",
      score: 1000,
      rank: "Data Circuit",
      icon: "storage",
    },
  ];

  if (!isAuthed || !user) {
    return <Text style={styles.notLoggedInText}>Not logged in</Text>;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
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
            Circuit Rankings
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
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[styles.leaderboardPosition, { color: colors.text }]}
                >
                  {index + 1}
                </Text>
                <View style={styles.leaderboardItemContent}>
                  <Text
                    style={[styles.leaderboardItemName, { color: colors.text }]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.leaderboardItemScore,
                      { color: colors.text },
                    ]}
                  >
                    {item.score} CPUs
                  </Text>
                  <Text
                    style={[styles.leaderboardItemRank, { color: "#25A879" }]}
                  >
                    {item.rank}
                  </Text>
                </View>
                <MaterialIcons
                  name={item.icon as any}
                  size={28}
                  color={getRandomColor()}
                  style={styles.leaderboardItemIcon}
                />
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
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "OpenSauceOne-Bold",
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
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 15,
  },
  leaderboardPosition: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 15,
    width: 40,
    textAlign: "center",
  },
  leaderboardItemContent: {
    flex: 1,
  },
  leaderboardItemName: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "OpenSauceOne-SemiBold",
  },
  leaderboardItemScore: {
    fontSize: 16,
    fontFamily: "OpenSauceOne-Regular",
    marginTop: 2,
  },
  leaderboardItemRank: {
    fontSize: 14,
    fontFamily: "OpenSauceOne-Regular",
    marginTop: 2,
  },
  leaderboardItemIcon: {
    marginLeft: 10,
  },
});
