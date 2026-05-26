(function () {
  if (typeof window === "undefined") return;

  var MARKERS = [
    "cleaning up async info",
    "Suspense boundary",
    "React instrumentation encountered an error",
  ];

  function isDevToolsSuspenseNoise(text) {
    if (!text) return false;
    for (var i = 0; i < MARKERS.length; i++) {
      if (text.indexOf(MARKERS[i]) !== -1) return true;
    }
    return false;
  }

  var noticeShown = false;

  function notifyOnce() {
    if (noticeShown) return;
    noticeShown = true;
    console.info(
      "[PARABLE dev] Suppressed a known React DevTools instrumentation warning (harmless in dev). Update or disable the React DevTools extension to avoid it entirely.",
    );
  }

  var originalError = console.error;
  console.error = function () {
    var text = Array.prototype.map
      .call(arguments, function (arg) {
        return typeof arg === "string" ? arg : String(arg);
      })
      .join(" ");
    if (isDevToolsSuspenseNoise(text)) {
      notifyOnce();
      return;
    }
    return originalError.apply(console, arguments);
  };

  window.addEventListener(
    "error",
    function (event) {
      var message = event && event.message ? String(event.message) : "";
      if (!isDevToolsSuspenseNoise(message)) return;
      notifyOnce();
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
})();
