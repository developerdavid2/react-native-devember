// app/(days)/day3/index.tsx
import DayContent from "@/components/core/day-content";
import { day3Content } from "@/constants/days/day3";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Day3() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <DayContent content={day3Content} />
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.5}
        onPress={() => router.push("/(days)/day3/editor")}
      >
        <Text style={styles.buttonText}>Editor Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // 👇 no padding here — DayContent's ScrollView has padding: 16 already
  },
  button: {
    backgroundColor: "#302E38",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    width: "70%",
    alignSelf: "center", // 👈 center it without needing parent padding
    marginVertical: 16,
  },
  buttonText: {
    color: "#FDFDFD",
    fontFamily: "Inter",
    fontSize: 16,
    paddingHorizontal: 25,
  },
});
