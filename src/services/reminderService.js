import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const SLOT_TIMES = {
  morning:   { hour: 8,  minute: 0  },
  afternoon: { hour: 13, minute: 0  },
  evening:   { hour: 18, minute: 0  },
  night:     { hour: 21, minute: 0  }
};

// Generate a stable numeric ID from medicine + slot
// Capacitor requires numeric notification IDs
function notifId(medicineId, slot) {
  const str = `${medicineId}_${slot}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2147483647;
}

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

export async function scheduleMedicineReminders(medicine, patientName) {
  if (!Capacitor.isNativePlatform()) return;

  const notifications = [];
  for (const slot of medicine.slots) {
    const time = SLOT_TIMES[slot];
    if (!time) continue;

    // Schedule for today first, then repeat daily
    const scheduleAt = new Date();
    scheduleAt.setHours(time.hour, time.minute, 0, 0);
    // If time already passed today, start tomorrow
    if (scheduleAt < new Date()) {
      scheduleAt.setDate(scheduleAt.getDate() + 1);
    }

    notifications.push({
      id: notifId(medicine.id, slot),
      title: `💊 Medicine reminder`,
      body: `Time to give ${medicine.name} (${medicine.dose}) to ${patientName}`,
      schedule: {
        at: scheduleAt,
        repeats: true,
        every: 'day'
      },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
      extra: { medicineId: medicine.id, slot, patientName }
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}

export async function cancelMedicineReminders(medicineId, slots) {
  if (!Capacitor.isNativePlatform()) return;
  const notifications = slots.map(slot => ({ id: notifId(medicineId, slot) }));
  await LocalNotifications.cancel({ notifications });
}

export async function cancelTodaySlotReminder(medicineId, slot) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({
    notifications: [{ id: notifId(medicineId, slot) }]
  });
}
