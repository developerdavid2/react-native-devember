import LottieView from "lottie-react-native";
import { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AnimationSplashScreen() {
  const animation = useRef<LottieView>(null);

  return (
    <View style={styles.container}>
      <LottieView
        // autoPlay
        ref={animation}
        style={{
          width: "80%",
          maxWidth: 400,
          height: 300,
          // backgroundColor: "#eee",
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require("@assets/lottie/netflix-logo.json")}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.5}
          onPress={() => animation.current?.play()}
        >
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.5}
          onPress={() => animation.current?.pause()}
        >
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#302E38",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 16,
    flex: 1,
  },
  buttonText: {
    color: "#FDFDFD",
    fontFamily: "Inter",
    fontSize: 16,
    paddingHorizontal: 25,
  },
});
