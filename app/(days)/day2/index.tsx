import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Day2() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text>Day 2 - Details Screen</Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.5}
        onPress={() => router.push("/(days)/day2/onboarding")}
      >
        <Text style={styles.buttonText}>Onboarding Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  button: {
    backgroundColor: "#302E38",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    width: "70%",
    marginTop: 10,
  },
  buttonText: {
    color: "#FDFDFD",
    fontFamily: "Inter",
    fontSize: 16,
    paddingHorizontal: 25,
  },
});
