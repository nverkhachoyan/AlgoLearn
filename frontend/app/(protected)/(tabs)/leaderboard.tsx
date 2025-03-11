import { StyleSheet, View, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Seperator } from "@/src/components/common/Seperator";
import React from "react";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import { useUser } from "@/src/features/user/hooks/useUser";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/src/features/auth/context/AuthContext";

export default function Leaderboard() {
  const { user } = useUser();
  const { isAuthenticated } = useAuth();
  const { colors }: { colors: Colors } = useTheme();

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
      rank: "Quantum Circuit",
      icon: "memory",
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

  if (!isAuthenticated || !user) {
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
        streak={user.streak || 0}
        userAvatar={null}
        onAvatarPress={() => router.push("/(protected)/(profile)")}
      />
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.innerContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
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
                    backgroundColor: colors.surface,
                    borderColor: colors.backdrop,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.leaderboardPosition,
                    { color: colors.onSurface },
                  ]}
                >
                  {index + 1}
                </Text>
                <View style={styles.leaderboardItemContent}>
                  <Text
                    style={[
                      styles.leaderboardItemName,
                      { color: colors.onSurface },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.leaderboardItemScore,
                      { color: colors.onSurface },
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
  },
  leaderboardItemScore: {
    fontSize: 16,
    marginTop: 2,
  },
  leaderboardItemRank: {
    fontSize: 14,
    marginTop: 2,
  },
  leaderboardItemIcon: {
    marginLeft: 10,
  },
});
