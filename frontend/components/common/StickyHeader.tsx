import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import { useRef, ReactNode } from "react";
import { Feather } from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";
import { router } from "expo-router";

export function StickyHeader(props: {
  cpus: number;
  strikeCount: number;
  userAvatar: string | null;
  onAvatarPress: () => void;
}) {
  const { colors } = useTheme();
  const animation = useRef(null);
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.stickyHeaderBackground,
        },
      ]}
    >
      <TouchableOpacity onPress={() => router.replace("/")}>
        <LottieView
          autoPlay={true}
          loop={false}
          ref={animation}
          style={styles.logo}
          source={require("@/assets/lotties/AlgoLearnLogo.json")}
        />
      </TouchableOpacity>
      <View style={styles.headerItem}>
        <Feather name="cpu" size={24} color="#1CC0CB" />
        <Text style={{ color: colors.text }}>{props.cpus}</Text>
      </View>
      <View style={styles.headerItem}>
        <Feather name="zap" size={24} color="#1CC0CB" />
        <Text style={{ color: colors.text }}>{props.strikeCount}</Text>
      </View>

      <TouchableOpacity onPress={props.onAvatarPress} style={styles.headerItem}>
        {props.userAvatar ? (
          <Image source={{ uri: props.userAvatar }} style={styles.avatar} />
        ) : (
          <Feather name="user" size={24} color={colors.icon} />
        )}
      </TouchableOpacity>
    </View>
  );
}

export function StickyHeaderSimple({ children }: { children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.stickyHeaderBackground,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    zIndex: 100,
  },
  headerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
