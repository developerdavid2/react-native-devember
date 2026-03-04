import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import DayItem from "@/components/core/day-item";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FlatList, StyleSheet, View } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

const days = Array.from({ length: 24 });

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack> */}
      <View style={styles.container}>
        <FlatList
          data={days}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.column}
          numColumns={2}
          renderItem={({ item, index }) => <DayItem day={index} />}
        />
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    gap: 10,
    padding: 10,
  },
  column: {
    gap: 10,
  },
});
