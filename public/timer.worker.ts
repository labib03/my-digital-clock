// Web Worker untuk timer yang berjalan akurat di background tab
// Browser meng-throttle setInterval di tab yang tidak aktif — Worker menghindari ini.

let interval: ReturnType<typeof setInterval> | null = null;

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data;

  if (type === "START") {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      self.postMessage({ type: "TICK" });
    }, 1000);
  }

  if (type === "STOP") {
    if (interval) clearInterval(interval);
    interval = null;
  }
};
