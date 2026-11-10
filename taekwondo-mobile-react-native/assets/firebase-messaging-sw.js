const urlParams = new URLSearchParams(location.search);
const projectId = urlParams.get("projectId");

const assetUrl = (path) => new URL(path, self.location.origin).href;

const DEFAULT_ICON = assetUrl("/logo/android/launchericon-192x192.png?v=2");

if (projectId) {
  const firebaseConfig = {
    apiKey: urlParams.get("apiKey"),
    authDomain: urlParams.get("authDomain"),
    projectId: projectId,
    storageBucket: urlParams.get("storageBucket"),
    messagingSenderId: urlParams.get("messagingSenderId"),
    appId: urlParams.get("appId"),
  };

  importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
  );

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Background FCM payload:", payload);

    const title = payload.data?.title || payload.notification?.title;
    if (!title) return;

    const body = payload.data?.body || payload.notification?.body || "";

    const icon =
      payload.data?.icon || payload.notification?.icon || DEFAULT_ICON;

    // const badge = payload.data?.badge || "/logo/android/launchericon-96x96.png";

    const clickUrl = payload.data?.clickUrl || payload.data?.url || "/";

    return self.registration.showNotification(title, {
      body,
      icon,
      // badge,
      data: {
        clickUrl,
        ...payload.data,
      },
      tag: payload.data?.tag || "attendance-notification",
      renotify: true,
      requireInteraction: true,
      silent: false,
    });
  });
} else {
  console.warn(
    "[SW] Firebase configuration parameters missing. Waiting for dynamic activation.",
  );
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickUrl = event.notification.data?.clickUrl || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(clickUrl);
            return client.focus();
          }
        }

        return self.clients.openWindow(clickUrl);
      }),
  );
});
