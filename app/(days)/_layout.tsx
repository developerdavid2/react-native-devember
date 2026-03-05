import SafeArea from "@/components/safe-area";
import { JsStack } from "@/components/stack";
import { TransitionPresets } from "@react-navigation/stack";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function DaysLayout() {
  const router = useRouter();

  return (
    <SafeArea bottom={false}>
      <View style={styles.container}>
        <JsStack
          screenOptions={{
            headerShown: false,
            ...TransitionPresets.SlideFromRightIOS,
          }}
        />
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
    backgroundColor: "white",
  },
  backText: {
    fontSize: 16,
  },
});
