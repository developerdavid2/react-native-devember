import SafeArea from "@/components/safe-area";
import { JsStack } from "@/components/stack";
import { TransitionPresets } from "@react-navigation/stack";
import { StyleSheet, View } from "react-native";

export default function DaysLayout() {
  return (
    <SafeArea bottom={true}>
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
