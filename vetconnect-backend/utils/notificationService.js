const { Notification, User } = require('../models');
const { sendNotificationEmail } = require('./emailService');

// Create and send notification
const createNotification = async (userId, title, message, type = null, relatedId = null) => {
  try {
    // Create in-app notification
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      related_id: relatedId
    });

    // Check if user wants email notifications
    const user = await User.findByPk(userId, {
      include: [{
        association: 'preferences',
        attributes: ['email_notifications']
      }]
    });

    if (user.preferences && user.preferences.email_notifications) {
      // Send email notification
      await sendNotificationEmail(user.email, title, message);
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Send bulk notifications
const sendBulkNotifications = async (userIds, title, message, type = null, relatedId = null) => {
  try {
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await createNotification(userId, title, message, type, relatedId);
      notifications.push(notification);
    }
    
    return notifications;
  } catch (error) {
    console.error('Send bulk notifications error:', error);
  }
};

module.exports = {
  createNotification,
  sendBulkNotifications
};