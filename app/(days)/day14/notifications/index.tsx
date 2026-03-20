import { View, Text, Button } from "react-native";
import React from "react";
import * as Notifications from "expo-notifications";

const NotificationsHomeScreen = () => {
  return (
    <View>
      <Text>NotificationsHomeScreen</Text>
      <Button
        title="Schedule test notifications"
        onPress={schedulePushNotification}
      />
    </View>
  );
};

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Checkout the new Onboarding screen 📬",
      body: "Here is the notification body",
      data: { data: "goes here", url: "/day14/notifications" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

export default NotificationsHomeScreen;
