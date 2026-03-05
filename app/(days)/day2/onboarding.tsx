import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const onboardingSteps = [
  {
    icon: "snowflake",
    title: "Welcome to #Devember",
    description: "Daily React Native tutorials during December",
  },
  {
    icon: "address-book",
    title: "Learn and grow together",
    description: "Learn by building 24 projects with React Native and Expo",
  },
  {
    icon: "money-bill-alt",
    title: "Education for Children",
    description:
      "Contribute to the fundraiser 'Education for Children' to help save the children in their effort for good education",
  },
];

const DURATION = 200;
const STAGGER = 80;

export default function OnboardingScreen() {
  const [screenIndex, setScreenIndex] = useState(0);
  const router = useRouter();
  const translateX = useSharedValue(0);

  const data = onboardingSteps[screenIndex];

  const animateToIndex = (
    nextIndex: number,
    direction: "forward" | "backward",
  ) => {
    const exitTo = direction === "forward" ? -SCREEN_WIDTH : SCREEN_WIDTH;
    const enterFrom = direction === "forward" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    // step 1 — slide current icon out
    translateX.value = withTiming(
      exitTo,
      { duration: DURATION },
      (finished) => {
        if (finished) {
          // step 2 — instantly reposition to enter side
          translateX.value = enterFrom;
          // step 3 — update screen index on JS thread
          runOnJS(setScreenIndex)(nextIndex);
          // step 4 — slide new icon in
          translateX.value = withTiming(0, { duration: DURATION });
        }
      },
    );
  };

  const onContinue = () => {
    const isLastScreen = screenIndex === onboardingSteps.length - 1;
    if (isLastScreen) {
      endOnboarding();
    } else {
      animateToIndex(screenIndex + 1, "forward");
    }
  };

  const onBack = () => {
    const isFirstScreen = screenIndex === 0;
    if (isFirstScreen) {
      router.back();
    } else {
      animateToIndex(screenIndex - 1, "backward");
    }
  };

  const endOnboarding = () => {
    router.push("/day2/sign-in");
  };

  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .runOnJS(true)
    .onEnd(() => onContinue());

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .runOnJS(true)
    .onEnd(() => onBack());

  const gesture = Gesture.Race(swipeLeft, swipeRight);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.page}>
        {/* Step indicators */}
        <View style={styles.stepIndicatorContainer}>
          {onboardingSteps.map((_, index) => (
            <Animated.View
              key={index}
              layout={LinearTransition.duration(DURATION)}
              style={[
                styles.stepIndicator,
                index === screenIndex
                  ? styles.stepIndicatorActive
                  : styles.stepIndicatorInactive,
              ]}
            />
          ))}
        </View>

        {/* Icon — driven by sharedValue, true carousel */}
        <Animated.View style={[styles.contentContainer, iconAnimatedStyle]}>
          <FontAwesome5
            style={styles.image}
            name={data.icon}
            size={70}
            color="#CEF202"
          />
        </Animated.View>

        <View style={styles.footer}>
          {/* Title stagger */}
          <Animated.Text
            key={`title-${screenIndex}`}
            entering={FadeInDown.duration(DURATION).delay(STAGGER)}
            exiting={FadeOutDown.duration(DURATION)}
            style={styles.title}
          >
            {data.title}
          </Animated.Text>

          {/* Description stagger */}
          <Animated.Text
            key={`desc-${screenIndex}`}
            entering={FadeInDown.duration(DURATION).delay(STAGGER * 2)}
            exiting={FadeOutDown.duration(DURATION)}
            style={styles.description}
          >
            {data.description}
          </Animated.Text>

          {/* Buttons — static */}
          <View style={styles.buttonRow}>
            <Text style={styles.buttonText} onPress={endOnboarding}>
              Skip
            </Text>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.5}
              onPress={onContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  page: {
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#15141A",
    padding: 20,
    overflow: "hidden",
  },
  contentContainer: {
    flex: 1,
  },
  image: {
    alignSelf: "center",
    margin: 20,
    marginTop: 50,
  },
  title: {
    color: "#FDFDFD",
    fontSize: 40,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  description: {
    color: "gray",
    fontSize: 18,
    lineHeight: 25,
    marginTop: 10,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 20,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  button: {
    backgroundColor: "#302E38",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "#FDFDFD",
    fontFamily: "Inter",
    fontSize: 16,
    paddingHorizontal: 25,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    justifyContent: "center",
  },
  stepIndicator: {
    height: 5,
    borderRadius: 10,
  },
  stepIndicatorActive: {
    width: 25,
    backgroundColor: "#CEF202",
  },
  stepIndicatorInactive: {
    width: 8,
    backgroundColor: "gray",
  },
});
