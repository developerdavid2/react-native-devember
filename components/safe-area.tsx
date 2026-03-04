// components/safe-area.tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  style?: ViewStyle;
}

export default function SafeArea({
  children,
  top = true,
  bottom = true,
  left = false,
  right = false,
  style,
}: SafeAreaProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: top ? insets.top : 0,
          paddingBottom: bottom ? insets.bottom : 0,
          paddingLeft: left ? insets.left : 0,
          paddingRight: right ? insets.right : 0,
          backgroundColor: isDark ? "#000" : "#fff",
        },
        style,
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
