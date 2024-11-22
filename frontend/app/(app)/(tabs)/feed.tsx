import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View, ScrollView } from "@/src/components/Themed";
import Button from "@/src/components/common/Button";
import { Seperator } from "@/src/components/common/Seperator";
import React, { useEffect } from "react";
import moment from "moment";
import { router } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import useTheme from "@/src/hooks/useTheme";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import { useUser } from "@/src/hooks/useUser";

export default function Feed() {
  const { isAuthed, user } = useUser();
  const { colors } = useTheme();

  const feedItems = [
    {
      id: 1,
      type: "course",
      title: "New Course: Advanced JavaScript",
      description: "Dive deep into advanced JavaScript topics.",
      date: "2024-07-25",
    },
    {
      id: 2,
      type: "poll",
      title: "Poll: Your Favorite Programming Language",
      description: "Vote for your favorite programming language.",
      date: "2024-07-24",
    },
    {
      id: 3,
      type: "achievement",
      title: "Achievement: Completed JavaScript Basics",
      description:
        "Congratulations on completing the JavaScript Basics course!",
      date: "2024-07-23",
    },
  ];

  const renderFeedItemIcon = (type: any) => {
    switch (type) {
      case "course":
        return <Feather name="book" size={24} color={colors.text} />;
      case "poll":
        return <MaterialIcons name="poll" size={24} color={colors.text} />;
      case "achievement":
        return <Feather name="award" size={24} color={colors.text} />;
      default:
        return null;
    }
  };

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
        userAvatar={user.profile_picture_url}
        onAvatarPress={() => {
          router.push("/profile");
        }}
      />

      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.innerContainer}>
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
                    borderColor: colors.cardBorder,
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
                    {moment(item.date).format("MMMM Do YYYY")}
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
  feedContainer: {
    width: "100%",
    marginBottom: 20,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
    fontFamily: "OpenSauceOne-SemiBold",
    marginBottom: 5,
  },
  feedItemDescription: {
    fontSize: 16,
    fontFamily: "OpenSauceOne-Regular",

    marginBottom: 5,
  },
  feedItemDate: {
    fontSize: 14,
    fontFamily: "OpenSauceOne-Regular",
    color: "#888",
  },
  button: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
});
