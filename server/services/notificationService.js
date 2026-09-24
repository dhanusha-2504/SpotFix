const Notification = require('../models/Notification');

/**
 * Creates and saves an in-app notification
 */
const createNotification = async ({
  recipient,
  sender = null,
  issueId = null,
  title,
  message,
  type = 'SYSTEM_ALERT',
  link = '',
}) => {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      sender,
      issueId,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]:', error.message);
    return null;
  }
};

module.exports = { createNotification };
