// Plain JS worker — browser loads this directly via new Worker('/timer.worker.js')
// No bundler needed.

let interval = null;

self.onmessage = function (e) {
  const type = e.data.type;
  if (type === "START") {
    if (interval) clearInterval(interval);
    interval = setInterval(function () {
      self.postMessage({ type: "TICK" });
    }, 1000);
  }
  if (type === "STOP") {
    if (interval) clearInterval(interval);
    interval = null;
  }
};
