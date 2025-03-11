import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import LottieView from "lottie-react-native";
import { useRef, ReactNode } from "react";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { router, usePathname } from "expo-router";
import { Colors } from "@/constants/Colors";

const HEADER_HEIGHT = Platform.select({ web: 64, default: 50 });

export function StickyHeader(props: {
  cpus: number;
  streak: number;
  userAvatar: string | null;
  onAvatarPress: () => void;
}) {
  const { colors } = useTheme();
  const animation = useRef(null);
  const pathname = usePathname();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
        },
        Platform.OS === "web" && styles.webContainer,
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => {
            if (pathname !== "/") {
              router.back();
            }
          }}
          style={[styles.headerItem, styles.logoContainer]}
        >
          <LottieView
            autoPlay={true}
            loop={false}
            ref={animation}
            style={styles.logo}
            source={require("@/assets/lotties/AlgoLearnLogo.json")}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.headerItem}>
          <Feather name="cpu" size={24} color="#1CC0CB" />
          <Text style={{ color: colors.onSurface }}>{props.cpus}</Text>
        </View>
        <View style={styles.headerItem}>
          <Feather name="zap" size={24} color="#1CC0CB" />
          <Text style={{ color: colors.onBackground }}>
            {props.streak}
          </Text>
        </View>

        <TouchableOpacity
          onPress={props.onAvatarPress}
          style={styles.headerItem}
        >
          {props.userAvatar ? (
            <Image source={{ uri: props.userAvatar }} style={styles.avatar} />
          ) : (
            <Feather name="user" size={24} color={colors.onSurface} />
          )}
        </TouchableOpacity>
      </View>
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
          backgroundColor: colors.surface,
          borderBottomEndRadius: 0,
          borderBottomStartRadius: 0,
        },
        Platform.OS === "web" && styles.webContainer,
      ]}
    >
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export function HeaderGoBack({ title }: { title: string }) {
  const { colors }: { colors: Colors } = useTheme();
  const pathname = usePathname();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
        },
        Platform.OS === "web" && styles.webContainer,
      ]}
    >
      <View style={[styles.content, styles.goBackContent]}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Feather name="chevron-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: HEADER_HEIGHT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    zIndex: 100,
  },
  webContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 20 : 12,
    // maxWidth: Platform.OS === "web" ? 1200 : undefined,
    marginHorizontal: Platform.OS === "web" ? 10 : undefined,
    ...(Platform.OS === "web"
      ? { justifyContent: "space-between" }
      : { justifyContent: "space-between" }),
  },
  goBackContent: {
    justifyContent: "flex-start",
    gap: 10,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.OS === "web" ? 20 : 8,
  },
  headerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.OS === "web" ? 8 : 6,
  },
  logoContainer: {
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
  },
  avatar: {
    width: Platform.OS === "web" ? 33 : 30,
    height: Platform.OS === "web" ? 33 : 30,
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
