export async function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!navigator.serviceWorker) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('Service Worker registered:', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}
