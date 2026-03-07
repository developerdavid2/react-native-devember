// constants/days/day2.ts
export const day2Content = `# Day 2 — Onboarding Screen, Animations & Gestures

Today we built a fully animated onboarding screen using **React Native Reanimated** and **Gesture Handler**.

---

## What We Built

A 3-step onboarding screen with:

- Swipe gestures to navigate forward and backward
- Carousel slide animation for the icon
- Staggered fade-in for title and description
- Animated step indicators

![Onboarding Preview](https://reactnative.dev/img/tiny_logo.png)

---

## Libraries Used

| Library | Purpose |
|---|---|
| \`react-native-reanimated\` | Animations |
| \`react-native-gesture-handler\` | Swipe gestures |
| \`expo-router\` | Navigation |

---

## Key Concepts

### 1. Atomic State Updates

Instead of two separate state updates that cause race conditions:

\`\`\`tsx
// ❌ Race condition
setDirection("forward");
setScreenIndex((prev) => prev + 1);

// ✅ Atomic — index and direction always in sync
setScreen((prev) => ({
  index: prev.index + 1,
  direction: "forward",
}));
\`\`\`

### 2. Gesture Detection

\`\`\`tsx
const swipeLeft = Gesture.Fling()
  .direction(Directions.LEFT)
  .runOnJS(true)
  .onEnd(() => onContinue());

const swipeRight = Gesture.Fling()
  .direction(Directions.RIGHT)
  .runOnJS(true)
  .onEnd(() => onBack());

const gesture = Gesture.Race(swipeLeft, swipeRight);
\`\`\`

### 3. Deriving Animations from State

\`\`\`tsx
const getAnimations = (index: number, direction: "forward" | "backward") => {
  if (direction === "forward") {
    return {
      entering: SlideInRight.duration(DURATION),
      exiting: SlideOutLeft.duration(DURATION),
    };
  }
  return {
    entering: SlideInLeft.duration(DURATION),
    exiting: SlideOutRight.duration(DURATION),
  };
};
\`\`\`

### 4. useSharedValue + useAnimatedStyle

\`\`\`tsx
const translateX = useSharedValue(0);
const opacity = useSharedValue(1);

const iconAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
  opacity: opacity.value,
}));
\`\`\`

---

## Step Indicator

The active indicator is **wider** and **yellow**, inactive ones are small grey dots:

\`\`\`tsx
<Animated.View
  layout={LinearTransition.duration(DURATION)}
  style={[
    styles.stepIndicator,
    index === screen.index
      ? styles.stepIndicatorActive
      : styles.stepIndicatorInactive,
  ]}
/>
\`\`\`

---

## Key Takeaways

- Always combine related state into **one object** to avoid race conditions
- Use \`Gesture.Race()\` when only one gesture should win at a time
- Use \`runOnJS(true)\` on gesture handlers that call JS functions
- \`useSharedValue\` runs on the **UI thread** — much smoother than JS-based animation
- Factory functions like \`getAnimations()\` keep animation logic clean and reusable

> "Combine state that changes together. Never split what belongs together." 
`;
