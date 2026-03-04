import { StyleSheet, Text, View } from "react-native";

export default function Day1() {
  return (
    <View style={styles.container}>
      <Text>Day 1 - Unique Layout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "red" },
});
