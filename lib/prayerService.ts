// Prayer Times Service — api.aladhan.com
// Docs: https://aladhan.com/prayer-times-api

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
  weekday: { en: string; ar: string };
}

export interface PrayerTimesResult {
  timings: PrayerTimes;
  date: { readable: string };
  hijriDate: HijriDate;
}

/**
 * Fetches prayer times from Aladhan API using lat/lng coordinates.
 * Method 20 = Kemenag RI (default for Indonesia)
 * Other methods: 2=ISNA, 4=Umm Al-Qura (Makkah), 3=MWL
 */
export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  method: number = 20,
): Promise<PrayerTimesResult> {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`);

  const json = await res.json();
  if (json.code !== 200) throw new Error(`Aladhan API: ${json.status}`);

  const { timings, date } = json.data;

  return {
    timings: {
      Fajr: timings.Fajr,
      Sunrise: timings.Sunrise,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
    },
    date: { readable: date.readable },
    hijriDate: {
      day: date.hijri.day,
      month: {
        number: date.hijri.month.number,
        en: date.hijri.month.en,
        ar: date.hijri.month.ar,
      },
      year: date.hijri.year,
      weekday: {
        en: date.hijri.weekday.en,
        ar: date.hijri.weekday.ar,
      },
    },
  };
}

/**
 * Given current time and prayer timings, return the key of the next prayer.
 */
export function getNextPrayer(timings: PrayerTimes): keyof PrayerTimes {
  const now = new Date();
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const order: (keyof PrayerTimes)[] = [
    "Fajr",
    "Sunrise",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
  ];
  for (const prayer of order) {
    if (toMinutes(timings[prayer]) > nowMinutes) return prayer;
  }
  return "Fajr"; // wrap to next day Fajr
}
