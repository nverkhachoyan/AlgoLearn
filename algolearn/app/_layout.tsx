import { Slot } from "expo-router";
import { AuthProvider } from "@/context/auth";
import { SafeAreaView } from "react-native";
import { useColorScheme } from "react-native";
import Colors from "@/constants/Colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: Colors[colorScheme ?? "light"].background,
          }}
        >
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </SafeAreaView>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
