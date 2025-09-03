import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'appointment' | 'message' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/notifications');
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>('/api/notifications/unread-count');
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`/api/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put('/api/notifications/read-all', {});
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`/api/notifications/${id}`);
  }
}