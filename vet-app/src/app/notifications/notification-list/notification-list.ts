import { Component } from '@angular/core';

@Component({
  selector: 'app-notification-list',
  standalone: false,
  templateUrl: './notification-list.html',
  styleUrls: ['./notification-list.scss']
})
export class NotificationList {
  notifications = [
    // Example notifications
    { id: 1, title: 'Welcome!', message: 'Thanks for joining.', type: 'info', read: false, createdAt: new Date() },
    { id: 2, title: 'Update', message: 'New features available.', type: 'update', read: true, createdAt: new Date() }
  ];

  loading = false;

  markAllAsRead() {
    this.notifications.forEach(notification => notification.read = true);
  }

  markAsRead(id: number) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  getNotificationIcon(type: string) {
    switch (type) {
      case 'info': return 'info';
      case 'update': return 'update';
      case 'alert': return 'warning';
      default: return 'notifications';
    }
  }
}
