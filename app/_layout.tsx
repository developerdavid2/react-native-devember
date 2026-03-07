import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { JsStack } from "@/components/stack";
import { Inter_900Black, useFonts } from "@expo-google-fonts/inter";
import { PortalProvider } from "@gorhom/portal";
import { TransitionPresets } from "@react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: Inter_900Black,
  });
  // const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PortalProvider>
          <ThemeProvider value={DefaultTheme}>
            <JsStack>
              <JsStack.Screen name="(tabs)" options={{ headerShown: false }} />
              <JsStack.Screen
                name="(days)"
                options={{
                  headerShown: false,
                  ...TransitionPresets.SlideFromRightIOS,
                }}
              />
            </JsStack>

            <StatusBar style="auto" />
          </ThemeProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
