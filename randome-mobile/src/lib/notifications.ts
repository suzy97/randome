import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function prepareNotifications() {
  const settings = await Notifications.getPermissionsAsync();
  let status = settings.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('randome-reminders', {
      name: 'Randome Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return status;
}

export async function scheduleReminderNotifications(previews: string[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const delays = [5, 15, 30];
  const tasks = previews.slice(0, delays.length).map((preview, index) =>
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Randome',
        body: preview,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delays[index],
      },
    })
  );

  await Promise.all(tasks);
}
