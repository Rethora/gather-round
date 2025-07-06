export const POLLING_CONFIG = {
  // Event pages - poll for new comments, RSVPs, and event updates
  events: {
    interval: 10000, // 10 seconds
    enabled: true,
    showNotifications: false, // Don't spam users with notifications
  },

  // Notifications page - poll for new notifications
  notifications: {
    interval: 15000, // 15 seconds
    enabled: true,
    showNotifications: true, // Show notifications for new notifications
  },

  // Comments page - poll for new comments
  comments: {
    interval: 12000, // 12 seconds
    enabled: true,
    showNotifications: false,
  },

  // RSVPs page - poll for new RSVPs
  rsvps: {
    interval: 8000, // 8 seconds - RSVPs are time-sensitive
    enabled: true,
    showNotifications: false,
  },

  // Mentions page - poll for new mentions
  mentions: {
    interval: 20000, // 20 seconds
    enabled: true,
    showNotifications: true,
  },

  // Dashboard - poll for general updates
  dashboard: {
    interval: 30000, // 30 seconds
    enabled: true,
    showNotifications: false,
  },
} as const;

export type PollingConfigKey = keyof typeof POLLING_CONFIG;
