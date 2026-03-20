import AnimatedSplashScreen from "@/components/day4/AnimatedSplashScreen";
import LottieView from "lottie-react-native";
import { useRef } from "react";

const AnimationScreen = () => {
  const animation = useRef<LottieView>(null);

  return <AnimatedSplashScreen />;
};

export default AnimationScreen;
