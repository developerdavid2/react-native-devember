import SafeArea from "@/components/safe-area";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Slot, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function DaysLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeArea bottom={true}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: isDark ? "#fff" : "#000" }]}>
            ← Back
          </Text>
        </Pressable>
        <Slot />
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  backText: {
    fontSize: 16,
  },
});
